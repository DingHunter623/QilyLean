#!/usr/bin/env node
'use strict';

const fs = require('fs');

function read(path) { return fs.readFileSync(path, 'utf8'); }
function assert(ok, message) { if (!ok) throw new Error(message); }

const nav = read('site-navigation.js');
const geometry = read('site-visual-geometry-v1.js');
const dock = read('site-floating-dock-standard-v1.css');
const core = read('site-navigation-core.js');
const legacy = read('site-navigation-legacy-20260802.js');

[
  '/site-floating-dock-standard-v1.css?v=20260819-dock-snapback-v3',
  '/site-visual-geometry-v1.js?v=20260819-arrow-geometry-v4',
  '/site-navigation-core.js?v=20260819-dock-snapback-v24',
  '/site-navigation-legacy-20260802.js?v=20260819-dock-snapback-v20',
  'dockUniformVisualContract: true',
  'dockFreeDragXY: true',
  'dockPositionPersistence: false',
  "dockAutoHome: 'bottom-right'",
  'dockViewportBoundaryClamp: true',
  'dockMobileDesktopParity: true',
  'dockUniformFontSize: true',
  'unifiedOnePieceArrows: true',
  'separateTriangleLineEliminated: true',
  'symmetricBidirectionalSceneArrows: true'
].forEach((token) => assert(nav.includes(token), 'site-navigation missing: ' + token));

[
  'floating dock standard v3',
  '--qily-dock-size:62px',
  '--qily-dock-size:58px',
  '--qily-dock-font-size:15px',
  '--qily-dock-font-size:14px',
  '--qily-dock-edge:12px',
  '--qily-dock-edge:8px',
  'top:auto!important',
  'bottom:max(var(--qily-dock-edge),env(safe-area-inset-bottom))!important',
  'touch-action:none!important',
  'cursor:grab!important',
  'qily-dock-dragging',
  'font-size:var(--qily-dock-font-size)!important',
  'background:var(--qily-dock-bg)!important'
].forEach((token) => assert(dock.includes(token), 'dock V3 standard missing: ' + token));
assert(!/qily-share-label-url\{[^}]*font-size:(?:10|11|12)px!important/.test(dock), '分享官网不得使用更小字号');

[
  'function setDockFreePosition(left, top)',
  'function clearLegacyDockPosition()',
  'function snapDockHome()',
  'startX = event.clientX;',
  'startY = event.clientY;',
  'Math.hypot(dx, dy) > 7',
  "dock.style.setProperty('left', clamp(left, limits.minLeft, limits.maxLeft) + 'px', 'important')",
  "dock.style.setProperty('top', clamp(top, limits.minTop, limits.maxTop) + 'px', 'important')",
  "localStorage.removeItem('qilyDockPositionV2')",
  "localStorage.removeItem('qilyDockTop')",
  "dock.dataset.qilyDockHome = 'bottom-right'",
  "window.addEventListener('resize', snapDockHome",
  "window.addEventListener('pageshow', snapDockHome",
  'qily-share-label-primary">分享</span>',
  'qily-share-label-url">官网</span>'
].forEach((token) => assert(core.includes(token), 'snapback dock core missing: ' + token));
assert(!core.includes("localStorage.setItem('qilyDockPositionV2'"), 'dock arbitrary-position persistence returned');
assert(!core.includes('saveDockPosition()'), 'dock save-position helper returned');
assert(!core.includes('var distance = event.clientY - startY;'), 'vertical-only drag logic returned');
assert(legacy.includes("var CORE_SRC = '/site-navigation-core.js?v=20260819-dock-snapback-v24';"), 'legacy pages are not loading the snapback core');

/* The dock markup is stored inside JS strings; normalize optional escaped quotes
 * before checking the semantic action order so the validator is source-style agnostic. */
const normalizedCore = core.replace(/\\"/g, '"');
const order = [
  'data-action="home"',
  'data-action="top"',
  'data-action="search"',
  'data-action="back"',
  'data-action="current"',
  'data-action="share"',
  'data-action="contact"'
];
let cursor = -1;
order.forEach((token) => {
  const next = normalizedCore.indexOf(token, cursor + 1);
  assert(next > cursor, 'dock action order drifted at ' + token);
  cursor = next;
});

[
  '__qilyVisualGeometryV4',
  'convertMarkerArrow',
  'convertSeparateArrows',
  'normalizeLeanBidirectionalScene',
  "data-qily-unified-arrow', 'v4'",
  "{ x: 600, y: 252 }",
  "{ x: 600, y: 308 }",
  "{ x: 600, y: 503 }",
  "{ x: 600, y: 447 }"
].forEach((token) => assert(geometry.includes(token), 'geometry v4 missing: ' + token));
assert(!geometry.includes('JOIN_OVERLAP'), 'legacy line/triangle overlap logic returned');

console.log('PASS: sitewide Dock V3 free drag + bottom-right auto-home + uniform typography and Arrow Geometry V4 are protected.');
