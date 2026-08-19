#!/usr/bin/env node
'use strict';

const fs = require('fs');

function read(path) { return fs.readFileSync(path, 'utf8'); }
function assert(ok, message) { if (!ok) throw new Error(message); }

const nav = read('site-navigation.js');
const geometry = read('site-visual-geometry-v1.js');
const dock = read('site-floating-dock-standard-v1.css');
const core = read('site-navigation-core.js');

[
  '/site-floating-dock-standard-v1.css?v=20260819-sitewide-dock-v1',
  '/site-visual-geometry-v1.js?v=20260819-arrow-geometry-v4',
  'dockUniformVisualContract: true',
  'unifiedOnePieceArrows: true',
  'separateTriangleLineEliminated: true',
  'symmetricBidirectionalSceneArrows: true'
].forEach((token) => assert(nav.includes(token), 'site-navigation missing: ' + token));

[
  '--qily-dock-size:62px',
  '--qily-dock-size:58px',
  '.qily-float-btn[data-action="share"]',
  'background:var(--qily-dock-bg)!important'
].forEach((token) => assert(dock.includes(token), 'dock standard missing: ' + token));

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

console.log('PASS: sitewide dock contract and one-piece arrow geometry v4 are protected.');
