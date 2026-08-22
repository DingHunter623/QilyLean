#!/usr/bin/env node
'use strict';

/* QilyLean R6 validator｜Homepage Hero V3 + Dock Snapback V3｜2026-08-19 */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function assert(ok, message) { if (!ok) throw new Error(message); }

const heroCss = read('site-home-hero-tune-v1.css');
assert(heroCss.includes('首页首屏专项校准 v3'), 'homepage hero stylesheet is not v3');
assert(heroCss.includes('font-size:clamp(40px,3.6vw,52px)!important'), 'desktop homepage hero headline is not reduced to the 52px tier');
assert(heroCss.includes('font-size:clamp(38px,4vw,48px)!important'), 'mid-width homepage hero headline is not reduced to the 48px tier');

const dockCss = read('site-floating-dock-standard-v1.css');
assert(dockCss.includes('floating dock standard v3'), 'floating dock stylesheet is not v3');
assert(dockCss.includes('top:auto!important'), 'dock default top must be auto');
assert(dockCss.includes('bottom:max(var(--qily-dock-edge),env(safe-area-inset-bottom))!important'), 'dock default bottom-right anchor missing');
assert(dockCss.includes('touch-action:none!important'), 'dock free-drag touch contract missing');

const core = read('site-navigation-core.js');
[
  'function snapDockHome()',
  'function setDockFreePosition(left, top)',
  'Math.hypot(dx, dy) > 7',
  "localStorage.removeItem('qilyDockPositionV2')",
  "dock.dataset.qilyDockHome = 'bottom-right'",
  "window.addEventListener('resize', snapDockHome",
  "window.addEventListener('pageshow', snapDockHome"
].forEach((marker) => assert(core.includes(marker), `dock snapback runtime missing: ${marker}`));
assert(!core.includes("localStorage.setItem('qilyDockPositionV2'"), 'dock arbitrary position persistence must be disabled');
assert(!core.includes('saveDockPosition()'), 'dock save-position helper must be removed');

const navigation = read('site-navigation.js');
assert(navigation.includes("dockPositionPersistence: false"), 'navigation feature contract still enables dock position persistence');
assert(navigation.includes("dockAutoHome: 'bottom-right'"), 'navigation feature contract does not declare bottom-right auto-home');
assert(navigation.includes('/site-navigation-core.js?v=20260822-remediation-v26'), 'navigation core cache version is not remediation v26');
assert(navigation.includes('/site-floating-dock-standard-v1.css?v=20260819-dock-snapback-v3'), 'navigation dock stylesheet cache version is not snapback v3');

const home = read('index.html');
assert(home.includes('/site-home-hero-tune-v1.css?v=20260819-home-hero-align-v3'), 'homepage does not reference Hero V3');
assert(home.includes('/site-floating-dock-standard-v1.css?v=20260819-dock-snapback-v3'), 'homepage does not reference Dock Snapback V3');
assert(home.includes('/site-navigation.js?v=20260822-sitewide-remediation-v33'), 'homepage does not reference Navigation V33');
assert(home.includes('font-size:clamp(40px,3.6vw,52px)!important'), 'homepage first-paint parity is not using the reduced hero headline tier');

process.stdout.write('PASS: homepage Hero V3 is one tier smaller; floating Dock V3 is freely draggable during pointer hold and automatically returns to bottom-right without arbitrary-position persistence.\n');
