#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const file = path.join(root, 'index.html');
let html = fs.readFileSync(file, 'utf8');

/*
 * QILY-HOME-STATIC-METRIC-NO-HOVER
 * Enforcement revision: 2026-08-03 v2.
 * Static result cards must remain visually unchanged under mouse, touch,
 * keyboard focus and active states. Only genuine links/buttons may animate.
 */

html = html
  .replace(/\n\s*<p class="metric-display-note"[\s\S]*?<\/p>/g, '')
  .replace(/\n\s*\.metric-display-note\{[^}]*\}/g, '')
  .replace(/\n\s*\.metric-display-note strong\{[^}]*\}/g, '')
  .replace(/\n\s*\.metric:hover\{[^}]*\}/g, '');

const metricBasePattern = /    \.metric\{[^}]*\}/;
const metricBase = '    .metric{min-height:168px;padding:20px;border:1px solid var(--line);border-top:4px solid var(--teal);background:#fff;cursor:default!important;transition:none!important;transform:none!important;box-shadow:none!important;filter:none!important;animation:none!important;will-change:auto!important}';
if (!metricBasePattern.test(html)) throw new Error('Cannot locate homepage metric-card base style');
html = html.replace(metricBasePattern, metricBase);

const staticStateMarker = '/* QILY-HOME-STATIC-METRIC-NO-HOVER */';
const staticStateStyles = `${staticStateMarker}\n    .metric:hover,.metric:focus,.metric:focus-visible,.metric:active{cursor:default!important;transition:none!important;transform:none!important;box-shadow:none!important;filter:none!important;animation:none!important;background:#fff!important;border-left-color:var(--line)!important;border-right-color:var(--line)!important;border-bottom-color:var(--line)!important;outline:none!important}\n    .metric:nth-child(1n):hover,.metric:nth-child(1n):focus,.metric:nth-child(1n):focus-visible,.metric:nth-child(1n):active{border-top-color:var(--teal)!important}\n    .metric:nth-child(2n):hover,.metric:nth-child(2n):focus,.metric:nth-child(2n):focus-visible,.metric:nth-child(2n):active{border-top-color:var(--copper)!important}\n    .metric:nth-child(3n):hover,.metric:nth-child(3n):focus,.metric:nth-child(3n):focus-visible,.metric:nth-child(3n):active{border-top-color:var(--plum)!important}`;

if (!html.includes(staticStateMarker)) {
  const target = '    .metric:nth-child(3n){border-top-color:var(--plum)}';
  if (!html.includes(target)) throw new Error('Cannot locate homepage metric-card color rules');
  html = html.replace(target, `${target}\n    ${staticStateStyles}`);
}

html = html.replace(
  /\/site-static-core-interactions-v1\.js\?v=[^"']+/,
  '/site-static-core-interactions-v1.js?v=20260803-static-no-hover-v2'
);

fs.writeFileSync(file, html.endsWith('\n') ? html : `${html}\n`, 'utf8');
console.log('Homepage result cards now have zero hover, focus or active visual feedback.');
