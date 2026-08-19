#!/usr/bin/env node
'use strict';

/* QilyLean R6 regression guard｜2026-08-19
 * 保护现行“静态首屏即当前版 + 原生整页导航 + 同源低优先级预取 + 全站统一悬浮栏 + 一体化箭头”。
 * Dock/Arrow V4 必须静态进入每个公开 HTML，禁止依赖旧 navigation query cache 或 share-only critical 覆盖。
 */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

const GOVERNANCE = '/site-visual-governance-v2.css?v=20260819-readable-floor-plus1-v6';
const CONTENT_AXIS = '/site-content-axis-v1.css?v=20260819-unified-content-axis-v1';
const HOME_HERO = '/site-home-hero-tune-v1.css?v=20260819-home-hero-align-v2';
const PREFETCH = '/site-native-prefetch-v1.js?v=20260819-r6-native-prefetch-v1';
const DOCK = '/site-floating-dock-standard-v1.css?v=20260819-sitewide-dock-v1';
const GEOMETRY = '/site-visual-geometry-v1.js?v=20260819-arrow-geometry-v4';
const NAVIGATION = '/site-navigation.js?v=20260819-sitewide-dock-arrow-v28';

function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function assert(ok, msg) { if (!ok) throw new Error(msg); }
function count(source, needle) { return source.split(needle).length - 1; }

const wrapper = read('site-navigation.js');
[
  "mode: 'atomic-first-paint-v28'",
  'staticHtmlAuthority: true',
  'atomicFirstPaint: true',
  'runtimeDependencyWaterfall: false',
  'dynamicContentShapers: false',
  'runtimeFooter: false',
  'runtimeSharedCssRewrite: false',
  'routeScopedLegacy: true',
  'ordinaryPagesDirectCore: true',
  'unifiedContentAxis: true',
  'unifiedContentAxisWidth: 1560',
  'dockUniformVisualContract: true',
  'dockUniformSize: 62',
  'unifiedOnePieceArrows: true',
  'markerUnitsOverhangEliminated: true',
  'separateTriangleLineEliminated: true',
  'symmetricBidirectionalSceneArrows: true',
  DOCK,
  GEOMETRY
].forEach((m) => assert(wrapper.includes(m), 'R6 navigation wrapper missing: ' + m));

const dockCss = read('site-floating-dock-standard-v1.css');
[
  '--qily-dock-size:62px',
  '--qily-dock-size:58px',
  '#floatDock.qily-float-dock .qily-float-btn',
  '.qily-float-btn[data-action="share"]',
  'border:1.5px solid var(--qily-dock-border)!important',
  'background:var(--qily-dock-bg)!important'
].forEach((m) => assert(dockCss.includes(m), 'sitewide dock standard missing: ' + m));

const geometry = read('site-visual-geometry-v1.js');
[
  '__qilyVisualGeometryV4',
  "data-qily-unified-arrow', 'v4'",
  'convertMarkerArrow',
  'convertSeparateArrows',
  'normalizeLeanBidirectionalScene',
  "{ x: 600, y: 252 }",
  "{ x: 600, y: 308 }",
  "{ x: 600, y: 503 }",
  "{ x: 600, y: 447 }"
].forEach((m) => assert(geometry.includes(m), 'arrow geometry v4 missing: ' + m));
assert(!geometry.includes('JOIN_OVERLAP'), 'legacy line/triangle overlap join returned');

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
    assert(count(html, DOCK) === 1, `${rel}: dock visual standard must be exactly once`);
    assert(count(html, GEOMETRY) === 1, `${rel}: arrow geometry v4 must be exactly once`);
    assert(count(html, NAVIGATION) === 1, `${rel}: navigation v28 cache-bust must be exactly once`);
    assert(!/id=["']qilyDockCriticalV6["']/i.test(html), `${rel}: legacy share-only dock critical returned`);
    assert(!/site-navigation\.js\?v=20260819-readable-floor-plus1-v27/i.test(html), `${rel}: stale navigation v27 reference returned`);
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
  DOCK,
  GEOMETRY,
  NAVIGATION,
  'id="qilyR6HomeFirstPaintParity"',
  'font-size:clamp(44px,4vw,56px)!important',
  'width:min(1540px,100%)!important'
].forEach((m) => assert(home.includes(m), 'homepage first-paint parity missing: ' + m));
assert(count(home, HOME_HERO) === 1, 'homepage hero tune must be exactly once');
assert(count(home, 'id="qilyR6HomeFirstPaintParity"') === 1, 'homepage first-paint parity style must be exactly once');

const brief = read('qilylean/daily/2026-08-14.html');
[
  'data-qily-scene-arrow="reform-down"',
  'data-qily-scene-arrow="improvement-up"',
  'M596.5 252 H603.5 V292 H610 L600 308 L590 292 H596.5 Z',
  'M596.5 503 H603.5 V463 H610 L600 447 L590 463 H596.5 Z'
].forEach((m) => assert(brief.includes(m), '2026-08-14 static scene02 arrow missing: ' + m));
assert(!brief.includes('<path d="M600 245 V315" stroke="#caa15f"'), '2026-08-14 oversized marker arrow returned');
assert(!brief.includes('<line x1="600" y1="515" x2="600" y2="462"'), '2026-08-14 split line arrow returned');
assert(!brief.includes('<polygon points="600,438 584,466 616,466"'), '2026-08-14 split triangle arrow returned');

process.stdout.write(`R6 regression guard PASS: ${scanned} public HTML pages statically use visual V6 + 1560px axis + uniform dock + arrow geometry v4 + navigation v28; scene02 arrows are source-level symmetric one-piece paths.\n`);
