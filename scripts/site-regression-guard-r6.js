#!/usr/bin/env node
'use strict';

/* QilyLean R6 regression guard｜2026-08-19
 * 保护现行“静态首屏即当前版 + 原生整页导航 + 同源低优先级预取”。
 * 历史 R2 v22 Guard 仅保留追溯，不再作为现行生产门禁。
 */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

const GOVERNANCE = '/site-visual-governance-v2.css?v=20260819-readable-floor-plus1-v6';
const CONTENT_AXIS = '/site-content-axis-v1.css?v=20260819-unified-content-axis-v1';
const HOME_HERO = '/site-home-hero-tune-v1.css?v=20260819-home-hero-align-v2';
const PREFETCH = '/site-native-prefetch-v1.js?v=20260819-r6-native-prefetch-v1';

function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function assert(ok, msg) { if (!ok) throw new Error(msg); }
function count(source, needle) { return source.split(needle).length - 1; }

const wrapper = read('site-navigation.js');
[
  "mode: 'atomic-first-paint-v27'",
  'staticHtmlAuthority: true',
  'atomicFirstPaint: true',
  'runtimeDependencyWaterfall: false',
  'dynamicContentShapers: false',
  'runtimeFooter: false',
  'runtimeSharedCssRewrite: false',
  'routeScopedLegacy: true',
  'ordinaryPagesDirectCore: true',
  'unifiedContentAxis: true',
  'unifiedContentAxisWidth: 1560'
].forEach((m) => assert(wrapper.includes(m), 'R6 navigation wrapper missing: ' + m));

const nativeNav = read('site-music-persistent-navigation-v1.js');
[
  "mode: 'native-only-v7'",
  'location.assign(url.href)',
  'domSwap: false',
  'nativeHistory: true',
  'runtimeContentRewrite: false',
  'visualMutation: false'
].forEach((m) => assert(nativeNav.includes(m), 'native navigation boundary missing: ' + m));
assert(!/DOMParser\(|history\.pushState|reconcileHeadAssets|qilySoftNavigation|qily:softnavigate/.test(nativeNav), 'legacy cross-page soft navigation returned');

const prefetch = read('site-native-prefetch-v1.js');
[
  "mode: 'native-navigation-plus-low-priority-prefetch'",
  'domSwap: false',
  'historyRewrite: false',
  'sameOriginOnly: true',
  'respectsSaveData: true',
  "link.rel = 'prefetch'",
  'requestIdleCallback',
  "d.addEventListener('pointerover'",
  "d.addEventListener('focusin'",
  "d.addEventListener('touchstart'"
].forEach((m) => assert(prefetch.includes(m), 'R6 prefetch missing: ' + m));
assert(!/DOMParser\(|history\.pushState|innerHTML\s*=|replaceChildren\(|\bfetch\s*\(/.test(prefetch), 'R6 prefetch may not swap/rewrite/fetch documents itself');

let scanned = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.cache'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(full); continue; }
    if (!/\.html?$/i.test(entry.name)) continue;
    const html = fs.readFileSync(full, 'utf8');
    if (!/<html\b/i.test(html) || !/<body\b/i.test(html) || !/<\/head>/i.test(html)) continue;
    if (/data-qily-admin-only=["']true["']/i.test(html)) continue;
    const rel = path.relative(root, full).replace(/\\/g, '/');
    scanned += 1;
    assert(count(html, GOVERNANCE) === 1, `${rel}: governance V6 must be exactly once`);
    assert(count(html, CONTENT_AXIS) === 1, `${rel}: 1560px content-axis must be exactly once`);
    assert(count(html, PREFETCH) === 1, `${rel}: native prefetch must be exactly once`);
  }
}
walk(root);
assert(scanned > 0, 'no public HTML scanned');

const home = read('index.html');
[
  GOVERNANCE,
  CONTENT_AXIS,
  HOME_HERO,
  PREFETCH,
  'id="qilyR6HomeFirstPaintParity"',
  'font-size:clamp(44px,4vw,56px)!important',
  'width:min(1540px,100%)!important'
].forEach((m) => assert(home.includes(m), 'homepage first-paint parity missing: ' + m));
assert(count(home, HOME_HERO) === 1, 'homepage hero tune must be exactly once');
assert(count(home, 'id="qilyR6HomeFirstPaintParity"') === 1, 'homepage first-paint parity style must be exactly once');

process.stdout.write(`R6 regression guard PASS: ${scanned} HTML pages use static visual V6 + 1560px axis + native prefetch; homepage hero first paint matches current design.\n`);
