#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'data', 'site-system-v4.json'), 'utf8'));
const expectedSourceCommit = process.env.QILY_EXPECTED_SOURCE_COMMIT || '';
const attempts = Number(process.env.QILY_VERIFY_ATTEMPTS || 8);
const delayMs = Number(process.env.QILY_VERIFY_DELAY_MS || 15000);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function expectedUrl(route) {
  return route === '/' ? config.production.baseUrl : `${config.production.baseUrl}${route}`;
}

function canonicalFrom(html) {
  const matches = [...html.matchAll(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/gi)];
  return matches.length === 1 ? matches[0][1] : null;
}

async function fetchText(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': 'QilyLean-Site-System-V4-Public-Verify/1.0',
      'cache-control': 'no-cache',
      'pragma': 'no-cache'
    }
  });
  const text = await response.text();
  return { response, text };
}

async function inspectOnce() {
  const failures = [];
  const details = [];

  for (const entry of config.coreRoutes) {
    const url = expectedUrl(entry.route);
    try {
      const { response, text } = await fetchText(`${url}?v4verify=${Date.now()}`);
      if (!response.ok) failures.push(`${entry.route}: HTTP ${response.status}`);
      const canonical = canonicalFrom(text);
      if (canonical !== url) failures.push(`${entry.route}: canonical ${canonical || '(missing)'} != ${url}`);
      if (!/<title>[^<]+<\/title>/i.test(text)) failures.push(`${entry.route}: title missing`);
      if (entry.marker && !text.includes(entry.marker)) failures.push(`${entry.route}: marker missing (${entry.marker})`);
      details.push({ route: entry.route, status: response.status, canonical, marker: entry.marker || null });
    } catch (error) {
      failures.push(`${entry.route}: ${error.message}`);
    }
  }

  let build = null;
  try {
    const { response, text } = await fetchText(`${config.production.baseUrl}/meta/build.json?v4verify=${Date.now()}`);
    if (!response.ok) failures.push(`/meta/build.json: HTTP ${response.status}`);
    else {
      build = JSON.parse(text);
      if (build.site !== 'QilyLean' || build.standard !== config.standard) failures.push('/meta/build.json: identity/standard mismatch');
      if (expectedSourceCommit && build.sourceCommit !== expectedSourceCommit) failures.push(`/meta/build.json: sourceCommit ${build.sourceCommit} != expected ${expectedSourceCommit}`);
    }
  } catch (error) {
    failures.push(`/meta/build.json: ${error.message}`);
  }

  return { failures, details, build };
}

(async () => {
  let last = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    last = await inspectOnce();
    if (last.failures.length === 0) {
      console.log(`[V4] G4 public verification PASS on attempt ${attempt}/${attempts}`);
      console.log(JSON.stringify({ build: last.build, routes: last.details }, null, 2));
      return;
    }
    console.error(`[V4] public verification attempt ${attempt}/${attempts} failed:`);
    for (const failure of last.failures) console.error(` - ${failure}`);
    if (attempt < attempts) await sleep(delayMs);
  }
  throw new Error(`[V4] G4 public verification failed after ${attempts} attempts`);
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
