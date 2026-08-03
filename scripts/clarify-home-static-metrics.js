#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const file = path.join(root, 'index.html');
const materializerFile = path.join(root, 'scripts', 'materialize-static-core-pages.js');
const linkStandardFile = path.join(root, 'site-link-standard-v2.css');
const interactionAsset = '/site-static-core-interactions-v1.js?v=20260803-static-border-lock-v3';
const linkStandardAsset = '/site-link-standard-v2.css?v=20260803-static-card-lock-v6';
let html = fs.readFileSync(file, 'utf8');

/*
 * QILY-HOME-STATIC-METRIC-NO-HOVER
 * Publication trigger: 2026-08-03 border-state hard lock.
 * Static result cards must keep exactly the same geometry and colors in every
 * pointer, focus and active state. The left, right and bottom borders remain
 * transparent; only the existing top classification line remains visible.
 */

html = html
  .replace(/\n\s*<p class="metric-display-note"[^>]*>[\s\S]*?以下为静态成果概览卡片[\s\S]*?<\/p>/g, '')
  .replace(/\n\s*\.metric:hover\{[^}]*\}/g, '');

const staticStateMarker = '/* QILY-HOME-STATIC-METRIC-NO-HOVER */';
const staticStateStyles = `${staticStateMarker}\n    #results .metric.qily-static-card{--qily-static-top:var(--teal);cursor:default!important;transition:none!important;transform:none!important;box-shadow:none!important;filter:none!important;animation:none!important;will-change:auto!important;background:#fff!important;border-left-color:transparent!important;border-right-color:transparent!important;border-bottom-color:transparent!important;border-top-color:var(--qily-static-top)!important;outline:none!important}\n    #results .metric.qily-static-card:nth-child(2n){--qily-static-top:var(--copper)}\n    #results .metric.qily-static-card:nth-child(3n){--qily-static-top:var(--plum)}\n    #results .metric.qily-static-card:hover,#results .metric.qily-static-card:focus,#results .metric.qily-static-card:focus-visible,#results .metric.qily-static-card:active{cursor:default!important;transition:none!important;transform:none!important;box-shadow:none!important;filter:none!important;animation:none!important;will-change:auto!important;background:#fff!important;border-left-color:transparent!important;border-right-color:transparent!important;border-bottom-color:transparent!important;border-top-color:var(--qily-static-top)!important;outline:none!important}\n    #results .metric.qily-static-card::before,#results .metric.qily-static-card::after,#results .metric.qily-static-card:hover::before,#results .metric.qily-static-card:hover::after{content:none!important;display:none!important;border:0!important;box-shadow:none!important;transform:none!important;animation:none!important}`;

const staticStatePattern = /\/\* QILY-HOME-STATIC-METRIC-NO-HOVER \*\/[\s\S]*?(?=\n\s*\.metric strong\{)/;
if (staticStatePattern.test(html)) {
  html = html.replace(staticStatePattern, staticStateStyles);
} else {
  const target = '    .metric:nth-child(3n){border-top-color:var(--plum)}';
  if (!html.includes(target)) throw new Error('Cannot locate homepage metric-card color rules');
  html = html.replace(target, `${target}\n    ${staticStateStyles}`);
}

html = html
  .replace(/\/site-static-core-interactions-v1\.js\?v=[^"']+/, interactionAsset)
  .replace(/\/site-link-standard-v2\.css\?v=[^"']+/, linkStandardAsset);

fs.writeFileSync(file, html.endsWith('\n') ? html : `${html}\n`, 'utf8');

if (fs.existsSync(materializerFile)) {
  let materializer = fs.readFileSync(materializerFile, 'utf8');
  materializer = materializer.replace(
    /const STATIC_INTERACTIONS = '[^']+';/,
    `const STATIC_INTERACTIONS = '${interactionAsset}';`
  );
  fs.writeFileSync(materializerFile, materializer.endsWith('\n') ? materializer : `${materializer}\n`, 'utf8');
}

if (fs.existsSync(linkStandardFile)) {
  let css = fs.readFileSync(linkStandardFile, 'utf8');
  const lockStart = '/* QILY-STATIC-RESULT-CARD-HARD-LOCK:START */';
  const lockEnd = '/* QILY-STATIC-RESULT-CARD-HARD-LOCK:END */';
  const lockBlock = `${lockStart}\nhtml body #results .metric.qily-static-card{\n  --qily-static-top:var(--teal);\n  cursor:default!important;\n  transition:none!important;\n  transform:none!important;\n  box-shadow:none!important;\n  filter:none!important;\n  animation:none!important;\n  will-change:auto!important;\n  background-color:#fff!important;\n  border-left-color:transparent!important;\n  border-right-color:transparent!important;\n  border-bottom-color:transparent!important;\n  border-top-color:var(--qily-static-top)!important;\n  outline:0!important;\n}\nhtml body #results .metric.qily-static-card:nth-child(2n){--qily-static-top:var(--copper)}\nhtml body #results .metric.qily-static-card:nth-child(3n){--qily-static-top:var(--plum)}\nhtml body #results .metric.qily-static-card:hover,\nhtml body #results .metric.qily-static-card:focus,\nhtml body #results .metric.qily-static-card:focus-visible,\nhtml body #results .metric.qily-static-card:active{\n  cursor:default!important;\n  transition:none!important;\n  transform:none!important;\n  box-shadow:none!important;\n  filter:none!important;\n  animation:none!important;\n  will-change:auto!important;\n  background-color:#fff!important;\n  border-left-color:transparent!important;\n  border-right-color:transparent!important;\n  border-bottom-color:transparent!important;\n  border-top-color:var(--qily-static-top)!important;\n  outline:0!important;\n}\nhtml body #results .metric.qily-static-card::before,\nhtml body #results .metric.qily-static-card::after,\nhtml body #results .metric.qily-static-card:hover::before,\nhtml body #results .metric.qily-static-card:hover::after{\n  content:none!important;\n  display:none!important;\n  border:0!important;\n  box-shadow:none!important;\n  transform:none!important;\n  animation:none!important;\n}\n${lockEnd}`;
  const lockPattern = new RegExp(`${lockStart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${lockEnd.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'm');
  css = lockPattern.test(css) ? css.replace(lockPattern, lockBlock) : `${css.trimEnd()}\n\n${lockBlock}\n`;
  fs.writeFileSync(linkStandardFile, css.endsWith('\n') ? css : `${css}\n`, 'utf8');
}

console.log('Homepage static result cards now keep transparent side borders and an unchanged top line in every state.');
