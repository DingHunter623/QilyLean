#!/usr/bin/env node
'use strict';

/**
 * QilyLean Google index-priority route materializer.
 * Scope is intentionally narrow: only sitemap.xml / sitemap-core.xml may be
 * written. No HTML, content, images, canonical, robots, translation or Dock is
 * modified by this script.
 */
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const POLICY_FILE = path.join(ROOT, 'data', 'google-index-coverage-policy.json');
const WRITE = process.argv.includes('--write');
const CHECK = process.argv.includes('--check');
const BASE = 'https://qilylean.com';

function fail(message) {
  console.error(`INDEX-PRIORITY NG: ${message}`);
  process.exitCode = 1;
}
function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}
function sourceDate(rel) {
  const result = cp.spawnSync('git', ['log', '-1', '--format=%cs', '--', rel], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  const value = result.status === 0 ? result.stdout.trim() : '';
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : new Date().toISOString().slice(0, 10);
}
function pageFacts(route) {
  const full = path.join(ROOT, route.source);
  if (!fs.existsSync(full)) return { exists: false };
  const html = fs.readFileSync(full, 'utf8');
  const canonicalA = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  const canonicalB = html.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  const canonical = (canonicalA || canonicalB || [])[1] || '';
  const noindex = /<meta\s+[^>]*name=["'](?:robots|googlebot)["'][^>]*content=["'][^"']*\bnoindex\b/i.test(html)
    || /<meta\s+[^>]*content=["'][^"']*\bnoindex\b[^"']*["'][^>]*name=["'](?:robots|googlebot)["']/i.test(html);
  const redirect = /<meta\s+[^>]*http-equiv=["']refresh["']/i.test(html)
    || /<meta\s+[^>]*content=["']0\s*;\s*url=/i.test(html);
  return { exists: true, canonical, noindex, redirect };
}
function hasUrl(xml, url) {
  return xml.includes(`<loc>${url}</loc>`);
}
function sitemapEntry(route) {
  const lastmod = sourceDate(route.source);
  const changefreq = route.changefreq || 'monthly';
  const priority = route.priority || '0.7';
  return `  <url><loc>${route.url}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

const policy = JSON.parse(fs.readFileSync(POLICY_FILE, 'utf8'));
if (!Array.isArray(policy.routes) || !policy.routes.length) {
  throw new Error('google-index-coverage-policy.json has no routes');
}

const supportedSitemaps = new Set(['sitemap.xml', 'sitemap-core.xml']);
const sitemapText = new Map();
for (const sitemap of supportedSitemaps) {
  const full = path.join(ROOT, sitemap);
  if (!fs.existsSync(full)) throw new Error(`${sitemap} is missing`);
  const xml = fs.readFileSync(full, 'utf8');
  if (!/<urlset\b/i.test(xml) || !/<\/urlset>\s*$/i.test(xml)) throw new Error(`${sitemap} is not a valid URL-set document`);
  sitemapText.set(sitemap, xml);
}

const additions = [];
const discoverOnlyPresent = [];
const decisions = [];

for (const route of policy.routes) {
  if (!route.url || !route.source || !route.policy) {
    fail(`invalid route policy entry: ${JSON.stringify(route)}`);
    continue;
  }
  let parsed;
  try { parsed = new URL(route.url); } catch { fail(`${route.url}: invalid URL`); continue; }
  if (parsed.origin !== BASE) {
    fail(`${route.url}: only ${BASE} URLs are allowed`);
    continue;
  }

  const facts = pageFacts(route);
  if (!facts.exists) {
    fail(`${route.url}: source missing (${route.source})`);
    continue;
  }
  const canonical = facts.canonical.replace(/\/$/, '/');
  const expected = route.url.replace(/\/$/, '/');

  if (route.policy === 'submit') {
    if (facts.noindex) fail(`${route.url}: submit route is noindex`);
    if (facts.redirect) fail(`${route.url}: submit route is an HTML redirect`);
    if (!facts.canonical || canonical !== expected) fail(`${route.url}: submit route is not self-canonical (found ${facts.canonical || 'none'})`);
    if (!Array.isArray(route.sitemaps) || route.sitemaps.length === 0) fail(`${route.url}: submit route has no sitemap target`);

    for (const sitemap of route.sitemaps || []) {
      if (!supportedSitemaps.has(sitemap)) {
        fail(`${route.url}: unsupported sitemap target ${sitemap}`);
        continue;
      }
      if (!hasUrl(sitemapText.get(sitemap), route.url)) additions.push({ sitemap, route });
    }
    decisions.push({ url: route.url, policy: route.policy, role: route.role, status: 'eligible' });
  } else if (route.policy === 'discover_only') {
    for (const sitemap of supportedSitemaps) {
      if (hasUrl(sitemapText.get(sitemap), route.url)) discoverOnlyPresent.push({ sitemap, url: route.url });
    }
    decisions.push({ url: route.url, policy: route.policy, role: route.role, status: 'preserve-page-no-submit' });
  } else {
    fail(`${route.url}: unsupported policy ${route.policy}`);
  }
}

console.log(`QilyLean Google index-priority policy ${policy.version}`);
for (const decision of decisions) console.log(`  ${decision.policy}\t${decision.role || 'n/a'}\t${decision.url}`);
for (const item of additions) console.log(`  ADD\t${item.sitemap}\t${item.route.url}`);
for (const item of discoverOnlyPresent) console.warn(`  REVIEW_ONLY\t${item.sitemap}\t${item.url}\tdiscover_only route already appears in sitemap; not auto-removing`);

if (WRITE && !process.exitCode) {
  const grouped = new Map();
  for (const item of additions) {
    if (!grouped.has(item.sitemap)) grouped.set(item.sitemap, []);
    grouped.get(item.sitemap).push(item.route);
  }
  for (const [sitemap, routes] of grouped) {
    let xml = sitemapText.get(sitemap);
    const lines = routes.map(sitemapEntry).join('\n');
    xml = xml.replace(/\s*<\/urlset>\s*$/i, `\n${lines}\n</urlset>\n`);
    fs.writeFileSync(path.join(ROOT, sitemap), xml, 'utf8');
    sitemapText.set(sitemap, xml);
    console.log(`  WROTE\t${sitemap}\t${routes.length} route(s)`);
  }
}

if (CHECK && !process.exitCode) {
  // Re-read after --write so the same invocation can prove materialization.
  for (const sitemap of supportedSitemaps) sitemapText.set(sitemap, read(sitemap));
  for (const route of policy.routes.filter((item) => item.policy === 'submit')) {
    for (const sitemap of route.sitemaps) {
      if (!hasUrl(sitemapText.get(sitemap), route.url)) fail(`${route.url}: missing from required ${sitemap}`);
    }
  }
}

if (!process.exitCode) {
  const mode = WRITE ? (CHECK ? 'write+check' : 'write') : (CHECK ? 'check' : 'plan');
  console.log(`INDEX-PRIORITY PASS: mode=${mode}; ${additions.length} pending sitemap insertion(s); ${discoverOnlyPresent.length} discover-only sitemap review(s).`);
}
