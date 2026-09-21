#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const API = 'https://api.cloudflare.com/client/v4';
const LIST_NAME = 'qilylean_retired_daily_redirects_v1';
const RULE_REF = 'qilylean_retired_daily_redirects_v1';
const ACCOUNT_ID = String(process.env.CLOUDFLARE_ACCOUNT_ID || '').trim();
const TOKEN = String(process.env.CLOUDFLARE_API_TOKEN || '').trim();

if (!/^[0-9a-fA-F]{32}$/.test(ACCOUNT_ID)) {
  throw new Error('CLOUDFLARE_ACCOUNT_ID must be a 32-character hex ID');
}
if (!TOKEN) throw new Error('CLOUDFLARE_API_TOKEN is required');

const manifestPath = path.join(ROOT, 'data', 'retired-daily-briefs-v1.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const routes = manifest.routes || {};
const entries = Object.entries(routes);

if (entries.length !== 2219) {
  throw new Error('Unexpected retired-route count: ' + entries.length + ' (expected 2219)');
}
for (const [source, target] of entries) {
  if (!/^\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html$/.test(source)) {
    throw new Error('Invalid retired source: ' + source);
  }
  if (!/^\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html$/.test(target)) {
    throw new Error('Invalid retained target: ' + target);
  }
  const targetFile = path.join(ROOT, target.replace(/^\//, ''));
  if (!fs.existsSync(targetFile)) throw new Error('Missing retained target file: ' + target);
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function cf(method, endpoint, body) {
  const response = await fetch(API + endpoint, {
    method,
    headers: {
      Authorization: 'Bearer ' + TOKEN,
      'Content-Type': 'application/json'
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(60000)
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : {}; } catch (_) {}
  if (!response.ok || !data || data.success !== true) {
    const details = data && Array.isArray(data.errors)
      ? data.errors.map(e => (e.code ? e.code + ': ' : '') + (e.message || JSON.stringify(e))).join('; ')
      : text.slice(0, 1200);
    throw new Error(method + ' ' + endpoint + ' failed (' + response.status + '): ' + details);
  }
  return data;
}

async function waitBulk(operationId) {
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    const data = await cf('GET', '/accounts/' + ACCOUNT_ID + '/rules/lists/bulk_operations/' + operationId);
    const status = data.result && data.result.status;
    if (status === 'completed') return;
    if (status === 'failed') {
      throw new Error('Cloudflare list bulk operation failed: ' + JSON.stringify(data.result));
    }
    await sleep(2000);
  }
  throw new Error('Timed out waiting for Cloudflare list bulk operation ' + operationId);
}

async function getOrCreateList() {
  const data = await cf('GET', '/accounts/' + ACCOUNT_ID + '/rules/lists');
  let list = (data.result || []).find(x => x && x.name === LIST_NAME);
  if (list) {
    if (list.kind !== 'redirect') throw new Error('Cloudflare list name collision: ' + LIST_NAME);
    return list;
  }
  const created = await cf('POST', '/accounts/' + ACCOUNT_ID + '/rules/lists', {
    name: LIST_NAME,
    description: 'QilyLean retired daily engineering brief -> retained weekly curated brief permanent redirects.',
    kind: 'redirect'
  });
  return created.result;
}

function redirectItems() {
  return entries.map(([source, target]) => ({
    redirect: {
      source_url: 'qilylean.com' + source,
      target_url: 'https://qilylean.com' + target,
      status_code: 301,
      include_subdomains: false,
      subpath_matching: false,
      preserve_query_string: true,
      preserve_path_suffix: false
    },
    comment: 'QilyLean weekly-curation redirect'
  }));
}

async function syncList(listId) {
  const items = redirectItems();
  const result = await cf('PUT', '/accounts/' + ACCOUNT_ID + '/rules/lists/' + listId + '/items', items);
  const op = result.result && result.result.operation_id;
  if (!op) throw new Error('Cloudflare did not return a list operation ID');
  await waitBulk(op);
  console.log('Bulk redirect list synchronized:', items.length, 'items');
}

function desiredRule() {
  return {
    ref: RULE_REF,
    expression: 'http.request.full_uri in $' + LIST_NAME,
    description: 'QilyLean retired daily briefs -> retained weekly curated briefs',
    action: 'redirect',
    action_parameters: {
      from_list: {
        name: LIST_NAME,
        key: 'http.request.full_uri'
      }
    },
    enabled: true
  };
}

async function ensureRule() {
  const data = await cf('GET', '/accounts/' + ACCOUNT_ID + '/rulesets');
  let ruleset = (data.result || []).find(x => x && x.kind === 'root' && x.phase === 'http_request_redirect');

  if (!ruleset) {
    const created = await cf('POST', '/accounts/' + ACCOUNT_ID + '/rulesets', {
      name: 'QilyLean Bulk Redirects',
      description: 'QilyLean account-level permanent redirect rules.',
      kind: 'root',
      phase: 'http_request_redirect',
      rules: [desiredRule()]
    });
    console.log('Created account redirect ruleset:', created.result && created.result.id);
    return;
  }

  const full = await cf('GET', '/accounts/' + ACCOUNT_ID + '/rulesets/' + ruleset.id);
  const existing = (full.result.rules || []).find(rule =>
    rule && (
      rule.ref === RULE_REF ||
      (rule.action_parameters && rule.action_parameters.from_list && rule.action_parameters.from_list.name === LIST_NAME)
    )
  );

  if (existing) {
    await cf('PATCH', '/accounts/' + ACCOUNT_ID + '/rulesets/' + ruleset.id + '/rules/' + existing.id, desiredRule());
    console.log('Updated existing bulk redirect rule:', existing.id);
  } else {
    const created = await cf('POST', '/accounts/' + ACCOUNT_ID + '/rulesets/' + ruleset.id + '/rules', desiredRule());
    const newRule = (created.result.rules || []).find(rule => rule && rule.ref === RULE_REF);
    console.log('Added bulk redirect rule:', newRule && newRule.id ? newRule.id : 'created');
  }
}

async function assertLiveRedirect(sourcePath, expectedPath) {
  let last = null;
  for (let attempt = 1; attempt <= 12; attempt += 1) {
    const response = await fetch('https://qilylean.com' + sourcePath, {
      redirect: 'manual',
      headers: {
        'User-Agent': 'QilyLean-Redirect-Closure/1.0',
        'Cache-Control': 'no-cache'
      },
      signal: AbortSignal.timeout(15000)
    });
    last = { status: response.status, location: response.headers.get('location') || '' };
    if ([301, 308].includes(response.status)) {
      const location = new URL(last.location, 'https://qilylean.com').pathname;
      if (location !== expectedPath) {
        throw new Error('Redirect target mismatch for ' + sourcePath + ': ' + last.location + ' != ' + expectedPath);
      }
      return;
    }
    if (attempt < 12) await sleep(5000);
  }
  throw new Error('Live redirect did not propagate for ' + sourcePath + ': ' + JSON.stringify(last));
}

async function assertRetainedStill200(retainedPath) {
  const response = await fetch('https://qilylean.com' + retainedPath, {
    redirect: 'manual',
    headers: {'User-Agent': 'QilyLean-Redirect-Closure/1.0', 'Cache-Control': 'no-cache'},
    signal: AbortSignal.timeout(15000)
  });
  if (response.status !== 200) {
    throw new Error('Retained brief was affected by redirect rules: ' + retainedPath + ' status=' + response.status);
  }
}

(async () => {
  console.log('Synchronizing', entries.length, 'retired daily URLs to permanent redirects.');
  const list = await getOrCreateList();
  console.log('Using Cloudflare list:', list.id, list.name);
  await syncList(list.id);
  await ensureRule();

  const samples = [
    ['/qilylean/daily/2024-06-02.html', routes['/qilylean/daily/2024-06-02.html']],
    ['/qilylean/daily/2024-07-15.html', routes['/qilylean/daily/2024-07-15.html']],
    ['/qilylean/daily/2025-07-05.html', routes['/qilylean/daily/2025-07-05.html']],
    ['/qilylean/daily/2024-07-21.html', routes['/qilylean/daily/2024-07-21.html']],
    ['/qilylean/daily/2025-09-06.html', routes['/qilylean/daily/2025-09-06.html']],
    ['/qilylean/daily/2025-12-01.html', routes['/qilylean/daily/2025-12-01.html']],
    ['/qilylean/daily/2024-05-24.html', routes['/qilylean/daily/2024-05-24.html']],
    ['/qilylean/daily/2025-09-20.html', routes['/qilylean/daily/2025-09-20.html']],
    ['/qilylean/daily/2024-11-07.html', routes['/qilylean/daily/2024-11-07.html']],
    ['/qilylean/daily/2024-11-12.html', routes['/qilylean/daily/2024-11-12.html']]
  ];
  for (const [source, target] of samples) {
    await assertLiveRedirect(source, target);
    console.log('LIVE 301:', source, '->', target);
  }
  await assertRetainedStill200('/qilylean/daily/2026-09-20.html');
  await assertRetainedStill200('/qilylean/daily/2024-05-28.html');
  console.log('Retained briefs remain HTTP 200.');
  console.log('QilyLean retired-daily redirect closure PASS.');
})().catch(error => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
