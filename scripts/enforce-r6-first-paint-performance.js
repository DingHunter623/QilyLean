#!/usr/bin/env node
'use strict';

/* QilyLean R6 static-first performance materializer｜2026-08-19
 * 根因治理：最终视觉CSS不得等待 defer JS 再改 href/补挂；首屏静态HTML直接引用当前受保护版本。
 * 导航治理：继续使用浏览器原生整页导航，并静态加载同源低优先级预取增强。
 * Dock V2：全站悬浮功能区恢复 X/Y 自由拖动、位置记忆、视口防越界；PC/手机字号与按钮视觉统一。
 * Arrow V4：继续保护一体化箭头与场景简图02对称几何。
 */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

const GOVERNANCE = '<link id="qilyVisualGovernanceV1" rel="stylesheet" href="/site-visual-governance-v2.css?v=20260819-readable-floor-plus1-v6">';
const CONTENT_AXIS = '<link id="qilyContentAxisV1" rel="stylesheet" href="/site-content-axis-v1.css?v=20260819-unified-content-axis-v1">';
const HOME_HERO = '<link id="qilyHomeHeroTuneV1" rel="stylesheet" href="/site-home-hero-tune-v1.css?v=20260819-home-hero-align-v2">';
const PREFETCH = '<script defer id="qilyR6NativePrefetchV1" data-qily-native-prefetch="v1" src="/site-native-prefetch-v1.js?v=20260819-r6-native-prefetch-v1"></script>';
const DOCK = '<link id="qilyFloatingDockStandardV1" rel="stylesheet" href="/site-floating-dock-standard-v1.css?v=20260819-free-drag-uniform-font-v2">';
const GEOMETRY = '<script defer data-qily-visual-geometry="v4" src="/site-visual-geometry-v1.js?v=20260819-arrow-geometry-v4"></script>';
const NAVIGATION = '<script defer src="/site-navigation.js?v=20260819-dock-free-drag-v29"></script>';
const HOME_PARITY = '<style id="qilyR6HomeFirstPaintParity">@media(min-width:981px){html body.qily-home-v3 .hero .hero-grid{width:min(1540px,100%)!important;grid-template-columns:minmax(0,1fr) minmax(330px,360px)!important;column-gap:clamp(52px,4.5vw,76px)!important}html body.qily-home-v3 .hero h1.qily-home-hero-title{font-size:clamp(44px,4vw,56px)!important;line-height:1.08!important;letter-spacing:-.022em!important}html body.qily-home-v3 .hero .hero-grid>aside,html body.qily-home-v3 .hero .portrait-frame{max-width:360px!important}}@media(min-width:981px) and (max-width:1280px){html body.qily-home-v3 .hero h1.qily-home-hero-title{font-size:clamp(40px,4.2vw,52px)!important}}@media(max-width:980px){html body.qily-home-v3 .hero h1.qily-home-hero-title{font-size:clamp(34px,6.6vw,48px)!important;line-height:1.08!important}}@media(max-width:620px){html body.qily-home-v3 .hero h1.qily-home-hero-title{font-size:clamp(28px,8vw,36px)!important;line-height:1.1!important}}</style>';

const SCENE02_OLD_DOWN = '<path d="M600 245 V315" stroke="#caa15f" stroke-width="7" marker-end="url(#a2)"/>';
const SCENE02_NEW_DOWN = '<path d="M596.5 252 H603.5 V292 H610 L600 308 L590 292 H596.5 Z" fill="#caa15f" stroke="none" data-qily-unified-arrow="v4" data-qily-scene-arrow="reform-down"/>';
const SCENE02_OLD_UP = '<line x1="600" y1="515" x2="600" y2="462" stroke="#178b94" stroke-width="8" stroke-linecap="round"/><polygon points="600,438 584,466 616,466" fill="#178b94"/>';
const SCENE02_NEW_UP = '<path d="M596.5 503 H603.5 V463 H610 L600 447 L590 463 H596.5 Z" fill="#178b94" stroke="none" data-qily-unified-arrow="v4" data-qily-scene-arrow="improvement-up"/>';

const CORE_DRAG_V2 = `    var down = false;
    var moved = false;
    var pointerId = null;
    var startX = 0;
    var startY = 0;
    var startLeft = 0;
    var startTop = 0;
    var action = '';
    var DOCK_POSITION_KEY = 'qilyDockPositionV2';
    var userPositioned = false;

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function dockLimits() {
      return {
        minLeft: 8,
        minTop: 8,
        maxLeft: Math.max(8, window.innerWidth - dock.offsetWidth - 8),
        maxTop: Math.max(8, window.innerHeight - dock.offsetHeight - 8)
      };
    }

    function setDockPosition(left, top, free) {
      var limits = dockLimits();
      var safeTop = clamp(top, limits.minTop, limits.maxTop);
      dock.style.setProperty('top', safeTop + 'px', 'important');
      dock.style.setProperty('bottom', 'auto', 'important');
      if (free) {
        var safeLeft = clamp(left, limits.minLeft, limits.maxLeft);
        dock.style.setProperty('left', safeLeft + 'px', 'important');
        dock.style.setProperty('right', 'auto', 'important');
        userPositioned = true;
      } else {
        dock.style.setProperty('left', 'auto', 'important');
        dock.style.setProperty('right', 'max(10px, env(safe-area-inset-right))', 'important');
        userPositioned = false;
      }
    }

    function positionRatios(left, top) {
      var limits = dockLimits();
      var xRange = Math.max(1, limits.maxLeft - limits.minLeft);
      var yRange = Math.max(1, limits.maxTop - limits.minTop);
      return {
        x: clamp((left - limits.minLeft) / xRange, 0, 1),
        y: clamp((top - limits.minTop) / yRange, 0, 1)
      };
    }

    function saveDockPosition() {
      var rect = dock.getBoundingClientRect();
      var ratios = positionRatios(rect.left, rect.top);
      try {
        localStorage.setItem(DOCK_POSITION_KEY, JSON.stringify({ x: ratios.x, y: ratios.y }));
        localStorage.removeItem('qilyDockTop');
      } catch (error) {}
    }

    function restoreDockPosition() {
      var stored = null;
      try { stored = JSON.parse(localStorage.getItem(DOCK_POSITION_KEY) || 'null'); } catch (error) {}
      if (stored && Number.isFinite(stored.x) && Number.isFinite(stored.y)) {
        var limits = dockLimits();
        var left = limits.minLeft + clamp(stored.x, 0, 1) * Math.max(1, limits.maxLeft - limits.minLeft);
        var top = limits.minTop + clamp(stored.y, 0, 1) * Math.max(1, limits.maxTop - limits.minTop);
        setDockPosition(left, top, true);
        return;
      }
      var legacyTop = NaN;
      try { legacyTop = parseFloat(localStorage.getItem('qilyDockTop')); } catch (error) {}
      setDockPosition(0, Number.isFinite(legacyTop) ? legacyTop : Math.max(92, window.innerHeight * 0.2), false);
    }

    requestAnimationFrame(restoreDockPosition);

    dock.addEventListener('pointerdown', function (event) {
      var button = event.target.closest('.qily-float-btn');
      if (!button) return;
      down = true;
      moved = false;
      pointerId = event.pointerId;
      action = button.getAttribute('data-action') || '';
      startX = event.clientX;
      startY = event.clientY;
      var rect = dock.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      if (dock.setPointerCapture) dock.setPointerCapture(pointerId);
      event.preventDefault();
    }, { passive: false });

    dock.addEventListener('pointermove', function (event) {
      if (!down || event.pointerId !== pointerId) return;
      var dx = event.clientX - startX;
      var dy = event.clientY - startY;
      if (!moved && Math.hypot(dx, dy) > 7) {
        moved = true;
        dock.classList.add('qily-dock-dragging');
      }
      if (!moved) return;
      setDockPosition(startLeft + dx, startTop + dy, true);
      event.preventDefault();
    }, { passive: false });

    function finish(event, cancelled) {
      if (!down || event.pointerId !== pointerId) return;
      down = false;
      try { if (dock.releasePointerCapture) dock.releasePointerCapture(pointerId); } catch (error) {}
      dock.classList.remove('qily-dock-dragging');
      if (moved) saveDockPosition();
      if (!cancelled && !moved) runAction(action);
      pointerId = null;
    }

    dock.addEventListener('pointerup', function (event) { finish(event, false); });
    dock.addEventListener('pointercancel', function (event) { finish(event, true); });`;

const CORE_RESIZE_V2 = `    window.addEventListener('resize', function () {
      var rect = dock.getBoundingClientRect();
      if (userPositioned) {
        setDockPosition(rect.left, rect.top, true);
        saveDockPosition();
      } else {
        setDockPosition(0, rect.top, false);
      }
    }, { passive: true });`;

function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function writeIfChanged(rel, source, next) {
  if (source === next) return false;
  fs.writeFileSync(path.join(root, rel), next.endsWith('\n') ? next : next + '\n', 'utf8');
  return true;
}
function assertReplace(source, search, replacement, label) {
  if (source.includes(replacement)) return source;
  if (!source.includes(search)) throw new Error('R6 runtime materializer cannot find ' + label);
  return source.replace(search, replacement);
}

function materializeRuntimeSources() {
  let core = read('site-navigation-core.js');
  core = assertReplace(
    core,
    '<button class="qily-float-btn qily-float-share" data-action="share" type="button">分享</button>',
    '<button class="qily-float-btn qily-float-share" data-action="share" type="button"><span class="qily-share-label-line qily-share-label-primary">分享</span><span class="qily-share-label-line qily-share-label-url">官网</span></button>',
    'two-line 分享官网 dock label'
  );
  if (!core.includes("var DOCK_POSITION_KEY = 'qilyDockPositionV2';")) {
    const dragPattern = /    var down = false;[\s\S]*?    dock\.addEventListener\('pointercancel', function \(event\) \{ finish\(event, true\); \}\);/;
    if (!dragPattern.test(core)) throw new Error('R6 runtime materializer cannot find legacy vertical-only dock drag block');
    core = core.replace(dragPattern, CORE_DRAG_V2);
  }
  core = assertReplace(
    core,
    "    window.addEventListener('resize', function () { setDockTop(dock.getBoundingClientRect().top); }, { passive: true });",
    CORE_RESIZE_V2,
    'legacy dock resize handler'
  );
  writeIfChanged('site-navigation-core.js', read('site-navigation-core.js'), core);

  let legacy = read('site-navigation-legacy-20260802.js');
  legacy = legacy.replace("var CORE_SRC = '/site-navigation-core.js?v=20260817-atomic-first-paint-v18';", "var CORE_SRC = '/site-navigation-core.js?v=20260819-free-drag-dock-v23';");
  writeIfChanged('site-navigation-legacy-20260802.js', read('site-navigation-legacy-20260802.js'), legacy);

  let nav = read('site-navigation.js');
  nav = nav.replace('navigation runtime v28', 'navigation runtime v29');
  nav = nav.replace('if (w.__qilyStaticFirstNavigationV28) return;', 'if (w.__qilyStaticFirstNavigationV29) return;');
  nav = nav.replace('w.__qilyStaticFirstNavigationV28 = true;', 'w.__qilyStaticFirstNavigationV29 = true;');
  nav = nav.replace("var CORE_SRC = '/site-navigation-core.js?v=20260819-operating-axis-nav-v22';", "var CORE_SRC = '/site-navigation-core.js?v=20260819-free-drag-dock-v23';");
  nav = nav.replace("var LEGACY_SRC = '/site-navigation-legacy-20260802.js?v=20260817-atomic-first-paint-v18';", "var LEGACY_SRC = '/site-navigation-legacy-20260802.js?v=20260819-free-drag-dock-v19';");
  nav = nav.replace("var DOCK_HREF = '/site-floating-dock-standard-v1.css?v=20260819-sitewide-dock-v1';", "var DOCK_HREF = '/site-floating-dock-standard-v1.css?v=20260819-free-drag-uniform-font-v2';");
  nav = nav.replace(/atomic-first-paint-v28/g, 'atomic-first-paint-v29');
  if (!nav.includes('dockFreeDragXY: true')) {
    nav = nav.replace('  dockUniformSize: 62,\n  dockOfficialUrlTwoLine: true,', '  dockUniformSize: 62,\n  dockFreeDragXY: true,\n  dockPositionPersistence: true,\n  dockViewportBoundaryClamp: true,\n  dockMobileDesktopParity: true,\n  dockUniformFontSize: true,\n  dockOfficialUrlTwoLine: true,');
  }
  writeIfChanged('site-navigation.js', read('site-navigation.js'), nav);
}

function isPublicHtml(html) {
  return /<html\b/i.test(html) && /<body\b/i.test(html) && !/data-qily-admin-only=["']true["']/i.test(html);
}
function strip(html, regex) { return html.replace(regex, ''); }
function beforeHeadEnd(html, fragment) {
  if (!/<\/head>/i.test(html)) return html;
  return html.replace(/<\/head>/i, fragment + '\n</head>');
}
function normalizeScene02(html, rel) {
  if (rel !== 'qilylean/daily/2026-08-14.html') return html;
  let out = html;
  if (out.includes(SCENE02_OLD_DOWN)) out = out.replace(SCENE02_OLD_DOWN, SCENE02_NEW_DOWN);
  if (out.includes(SCENE02_OLD_UP)) out = out.replace(SCENE02_OLD_UP, SCENE02_NEW_UP);
  return out;
}
function normalize(html, rel) {
  let out = html;

  out = strip(out, /\s*<link\b[^>]*(?:id=["']qilyVisualGovernanceV1["']|href=["'][^"']*\/site-visual-governance-v[12]\.css(?:\?[^"']*)?["'])[^>]*>\s*/gi);
  out = strip(out, /\s*<link\b[^>]*(?:id=["']qilyContentAxisV1["']|href=["'][^"']*\/site-content-axis-v1\.css(?:\?[^"']*)?["'])[^>]*>\s*/gi);
  out = strip(out, /\s*<script\b[^>]*(?:id=["']qilyR6NativePrefetchV1["']|src=["'][^"']*\/site-native-prefetch-v1\.js(?:\?[^"']*)?["'])[^>]*>\s*<\/script>\s*/gi);
  out = strip(out, /\s*<link\b[^>]*(?:id=["']qilyFloatingDockStandardV1["']|href=["'][^"']*\/site-floating-dock-standard-v1\.css(?:\?[^"']*)?["'])[^>]*>\s*/gi);
  out = strip(out, /\s*<script\b[^>]*(?:data-qily-visual-geometry=["'][^"']+["']|src=["'][^"']*\/site-visual-geometry-v1\.js(?:\?[^"']*)?["'])[^>]*>\s*<\/script>\s*/gi);
  out = strip(out, /\s*<script\b[^>]*src=["'][^"']*\/site-navigation\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>\s*/gi);
  out = strip(out, /\s*<style\b[^>]*id=["']qilyDockCriticalV6["'][^>]*>[\s\S]*?<\/style>\s*/gi);
  out = strip(out, /\s*<style\b[^>]*id=["']qilyDockUniformCriticalV1["'][^>]*>[\s\S]*?<\/style>\s*/gi);
  out = strip(out, /\s*<style\b[^>]*id=["']qilyR6HomeFirstPaintParity["'][^>]*>[\s\S]*?<\/style>\s*/gi);

  out = beforeHeadEnd(out, GOVERNANCE + '\n' + CONTENT_AXIS + '\n' + DOCK + '\n' + PREFETCH + '\n' + GEOMETRY + '\n' + NAVIGATION);

  const home = rel === 'index.html' || /<body\b[^>]*\bqily-home-v3\b/i.test(out);
  if (home) {
    out = strip(out, /\s*<link\b[^>]*(?:id=["']qilyHomeHeroTuneV1["']|href=["'][^"']*\/site-home-hero-tune-v1\.css(?:\?[^"']*)?["'])[^>]*>\s*/gi);
    out = beforeHeadEnd(out, HOME_PARITY + '\n' + HOME_HERO);
  }

  out = normalizeScene02(out, rel);
  return out;
}

materializeRuntimeSources();

let scanned = 0;
let changed = 0;
const changedFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.cache'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(full); continue; }
    if (!/\.html?$/i.test(entry.name)) continue;
    const rel = path.relative(root, full).replace(/\\/g, '/');
    const html = fs.readFileSync(full, 'utf8');
    if (!isPublicHtml(html)) continue;
    scanned += 1;
    const next = normalize(html, rel);
    if (next === html) continue;
    fs.writeFileSync(full, next.endsWith('\n') ? next : next + '\n', 'utf8');
    changed += 1;
    changedFiles.push(rel);
  }
}

walk(root);

const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
[
  '/site-visual-governance-v2.css?v=20260819-readable-floor-plus1-v6',
  '/site-content-axis-v1.css?v=20260819-unified-content-axis-v1',
  '/site-home-hero-tune-v1.css?v=20260819-home-hero-align-v2',
  '/site-floating-dock-standard-v1.css?v=20260819-free-drag-uniform-font-v2',
  '/site-visual-geometry-v1.js?v=20260819-arrow-geometry-v4',
  '/site-navigation.js?v=20260819-dock-free-drag-v29',
  'qilyR6HomeFirstPaintParity',
  '/site-native-prefetch-v1.js?v=20260819-r6-native-prefetch-v1'
].forEach((marker) => {
  if (!home.includes(marker)) throw new Error('R6 first-paint baseline missing from homepage: ' + marker);
});

const core = fs.readFileSync(path.join(root, 'site-navigation-core.js'), 'utf8');
[
  "var DOCK_POSITION_KEY = 'qilyDockPositionV2';",
  'Math.hypot(dx, dy) > 7',
  "localStorage.setItem(DOCK_POSITION_KEY",
  "dock.style.setProperty('left', safeLeft + 'px', 'important')",
  "if (userPositioned) {",
  "saveDockPosition();",
  'qily-share-label-url">官网</span>'
].forEach((marker) => {
  if (!core.includes(marker)) throw new Error('dock free-drag runtime missing: ' + marker);
});
if (core.includes('setDockTop(')) throw new Error('legacy dock resize/top-only helper reference returned');

const brief = fs.readFileSync(path.join(root, 'qilylean/daily/2026-08-14.html'), 'utf8');
[
  'data-qily-scene-arrow="reform-down"',
  'data-qily-scene-arrow="improvement-up"'
].forEach((marker) => {
  if (!brief.includes(marker)) throw new Error('2026-08-14 scene02 static arrow missing: ' + marker);
});
if (brief.includes(SCENE02_OLD_DOWN) || brief.includes(SCENE02_OLD_UP)) throw new Error('2026-08-14 scene02 legacy split/marker arrow returned');

process.stdout.write(`R6 first-paint/performance materialized: scanned ${scanned} public HTML, changed ${changed}; dock uses free X/Y drag + persistent bounded position + uniform typography.\n`);
if (changedFiles.length) process.stdout.write(changedFiles.join('\n') + '\n');
