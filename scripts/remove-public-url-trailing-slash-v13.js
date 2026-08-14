#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(process.cwd());
const VERSION = '2026-08-14-url-v14';
const SITE_NAV_VERSION = '20260814-url-v14';
const ROOT_URL = 'https://qilylean.com';
const changed = new Set();
const repairs = { normalizedAbsoluteUrls: 0, malformedJoinedHost: 0, cacheBusts: 0, runtimeRepairs: 0 };

const SKIP_DIR = new Set(['.git', '.github', 'node_modules', '.gradle', 'build', 'dist']);
const PRODUCT_EXT = new Set(['.html', '.htm', '.json', '.md', '.txt', '.java', '.kt', '.xml', '.svg']);

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIR.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.isFile()) out.push(p);
  }
  return out;
}
function rel(p) { return path.relative(root, p).replace(/\\/g, '/'); }
function writeIfChanged(p, before, after) {
  if (after !== before) {
    fs.writeFileSync(p, after, 'utf8');
    changed.add(rel(p));
  }
}

const malformedJoinedHostRx = /https:\/\/(?:www\.)?qilylean\.com(?=[A-Za-z0-9])/g;
const trailingSlashRx = /(https:\/\/(?:www\.)?qilylean\.com(?:\/[^\s"'`<>?#]*?)?)\/(?=[?#"'`<>\s),;:，。；：！？、\]}】）》”’]|$)/g;

function normalizeProductText(text) {
  let out = text.replace(malformedJoinedHostRx, (m) => {
    repairs.malformedJoinedHost += 1;
    return m + '/';
  });
  for (;;) {
    const next = out.replace(trailingSlashRx, (whole, prefix) => {
      repairs.normalizedAbsoluteUrls += 1;
      return prefix;
    });
    if (next === out) break;
    out = next;
  }
  return out;
}

// 1) Product-facing documents, static HTML, app source, sitemaps and manifests.
for (const p of walk(root)) {
  const r = rel(p);
  if (r === 'scripts/remove-public-url-trailing-slash-v13.js') continue;
  if (!PRODUCT_EXT.has(path.extname(p).toLowerCase())) continue;
  let s;
  try { s = fs.readFileSync(p, 'utf8'); } catch { continue; }
  const before = s;
  s = normalizeProductText(s);

  if (/\.html?$/i.test(p)) {
    s = s.replace(/src=(['"])\/site-navigation\.js(?:\?v=[^'"]*)?\1/g, (m, q) => {
      const next = `src=${q}/site-navigation.js?v=${SITE_NAV_VERSION}${q}`;
      if (next !== m) repairs.cacheBusts += 1;
      return next;
    });
    s = s.replace(/src=(['"])\/site-navigation-core\.js(?:\?v=[^'"]*)?\1/g, (m, q) => {
      const next = `src=${q}/site-navigation-core.js?v=${SITE_NAV_VERSION}${q}`;
      if (next !== m) repairs.cacheBusts += 1;
      return next;
    });
  }
  writeIfChanged(p, before, s);
}

// 2) Shared runtime: current-page sharing must always normalize at the final output boundary.
const corePath = path.join(root, 'site-navigation-core.js');
if (fs.existsSync(corePath)) {
  let s = fs.readFileSync(corePath, 'utf8');
  const before = s;
  s = s.replace(/var HOME_URL = ['"]https:\/\/qilylean\.com\/?['"];/, "var HOME_URL = 'https://qilylean.com';");
  s = s.replace('var url = location.href;', 'var url = normalizePublicUrl(location.href);');
  if (!s.includes('var url = normalizePublicUrl(location.href);') && s.includes('function shareCurrentPage()')) {
    throw new Error('shareCurrentPage no-trailing-slash normalization missing');
  }
  s = s.replace(/https:\/\/qilylean\.com\/(?=(?:["'<>\s),;\]}]|$))/g, ROOT_URL);
  writeIfChanged(corePath, before, s);
}

// 3) Loader cache chain: force browsers to fetch the corrected runtime instead of an old cached V13/V4 copy.
const navPath = path.join(root, 'site-navigation.js');
if (fs.existsSync(navPath)) {
  let s = fs.readFileSync(navPath, 'utf8');
  const before = s;
  s = s.replace(/var LEGACY_SRC = ['"]\/site-navigation-legacy-20260802\.js\?v=[^'"]+['"];/,
    `var LEGACY_SRC = '/site-navigation-legacy-20260802.js?v=${SITE_NAV_VERSION}';`);
  writeIfChanged(navPath, before, s);
}

const legacyPath = path.join(root, 'site-navigation-legacy-20260802.js');
if (fs.existsSync(legacyPath)) {
  let s = fs.readFileSync(legacyPath, 'utf8');
  const before = s;
  s = s.replace(/var CORE_SRC = ['"]\/site-navigation-core\.js\?v=[^'"]+['"];/,
    `var CORE_SRC = '/site-navigation-core.js?v=${SITE_NAV_VERSION}';`);
  writeIfChanged(legacyPath, before, s);
}

// 4) Compatibility share runtimes. Do not delete path separators from URL prefixes.
for (const file of [
  'qilylean/share-qr-fix.js',
  'qilylean/floating-ui-repair.js',
  'app-download-share-v1.js',
  'brand-identity.js',
  'qilylean/daily-insights-archive.js'
]) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) continue;
  let s = fs.readFileSync(p, 'utf8');
  const before = s;
  s = s.replace(/https:\/\/qilylean\.com\/(?=(?:["'`<>\s),;\]}]|$))/g, ROOT_URL);
  s = s.replace(/(\b(?:var|let|const)\s+[A-Za-z_$][\w$]*(?:url|Url|URL)[\w$]*\s*=\s*)location\.href(\s*;)/g,
    "$1(location.href.replace(/\\\/(?=([?#]|$))/, ''))$2");
  s = s.replace(/url\s*:\s*location\.href/g, "url: location.href.replace(/\\\/(?=([?#]|$))/, '')");
  writeIfChanged(p, before, s);
}

// floating-service has a base-domain + shortPath construction; preserve the separator explicitly.
const floatingPath = path.join(root, 'qilylean/floating-service.js');
if (fs.existsSync(floatingPath)) {
  let s = fs.readFileSync(floatingPath, 'utf8');
  const before = s;
  s = s.replace(
    "return 'https://qilylean.com' + shortPath + (location.search || '') + hash;",
    "return 'https://qilylean.com' + (shortPath ? '/' + shortPath.replace(/^\\/+/, '') : '') + (location.search || '') + hash;"
  );
  s = s.replace(/\/site-navigation\.js\?v=[^'"]+/g, `/site-navigation.js?v=${SITE_NAV_VERSION}`);
  if (s !== before) repairs.runtimeRepairs += 1;
  writeIfChanged(floatingPath, before, s);
}

// 5) Share landing page inline runtime.
const sharePage = path.join(root, 'share/index.html');
if (fs.existsSync(sharePage)) {
  let s = fs.readFileSync(sharePage, 'utf8');
  const before = s;
  s = normalizeProductText(s);
  s = s.replace(/location\.href(?=\s*[;,)]|\s*$)/g, "location.href.replace(/\\\/(?=([?#]|$))/, '')");
  writeIfChanged(sharePage, before, s);
}

// 6) Validation: no product-facing absolute QilyLean URL may end in '/'; no joined-host corruption may remain.
const bad = [];
for (const p of walk(root)) {
  const r = rel(p);
  if (!PRODUCT_EXT.has(path.extname(p).toLowerCase())) continue;
  let s;
  try { s = fs.readFileSync(p, 'utf8'); } catch { continue; }
  malformedJoinedHostRx.lastIndex = 0;
  if (malformedJoinedHostRx.test(s)) bad.push(`${r}: malformed host/path join`);
  trailingSlashRx.lastIndex = 0;
  const slashMatch = trailingSlashRx.exec(s);
  if (slashMatch) bad.push(`${r}: ${slashMatch[0]}`);
  if (bad.length >= 50) break;
}
if (bad.length) throw new Error('URL V14 validation failed:\n' + bad.join('\n'));

const capability = path.join(root, 'capabilities/index.html');
if (fs.existsSync(capability)) {
  const s = fs.readFileSync(capability, 'utf8');
  if (!s.includes('rel="canonical" href="https://qilylean.com/capabilities"')) {
    throw new Error('capabilities canonical URL is not normalized');
  }
  if (!s.includes(`/site-navigation.js?v=${SITE_NAV_VERSION}`)) {
    throw new Error('capabilities page did not receive the navigation cache-bust');
  }
}

const qhome = path.join(root, 'android/qilylean-home/app/src/main/java/com/qilylean/home/MainActivity.java');
if (fs.existsSync(qhome)) {
  const s = fs.readFileSync(qhome, 'utf8');
  trailingSlashRx.lastIndex = 0;
  const m = trailingSlashRx.exec(s);
  if (m) throw new Error('QilyLean Home still contains trailing-slash URL: ' + m[0]);
}

fs.mkdirSync(path.join(root, 'maintenance'), { recursive: true });
const reportPath = path.join(root, 'maintenance/public-url-output-v14.json');
fs.writeFileSync(reportPath, JSON.stringify({
  version: VERSION,
  policy: 'All user-visible, copied, QR, shared, canonical and APP-facing QilyLean absolute URLs omit trailing slash; internal relative routing remains path-safe.',
  root_url: ROOT_URL,
  site_navigation_cache_version: SITE_NAV_VERSION,
  changed_files: [...changed].sort(),
  changed_file_count: changed.size,
  repairs
}, null, 2) + '\n', 'utf8');
changed.add(rel(reportPath));

console.log(`PASS URL Output V14: ${changed.size} files changed.`);
console.log(JSON.stringify(repairs));
