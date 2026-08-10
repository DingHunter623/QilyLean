#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const CSS_FILE = 'site-layout-typography-closure-v20.css';
const MATERIALIZER = 'scripts/materialize-professionalization-v24.js';
const VERSION = '20260810-footer-one-line-v25';
const START = '/* QILY-FOOTER-SINGLE-LINE-V25:START */';
const END = '/* QILY-FOOTER-SINGLE-LINE-V25:END */';

const block = `${START}
/* Desktop footer information-density closure.
 * Merge the former slogan / contact-title / official-contact rows into one visual line.
 * Keep mobile V23 responsive layout unchanged because a forced single line is not usable there.
 */
@media (min-width:1051px){
  html:root:root:root body.qily-tail-compact :is(.module-footer,.footer,footer):has(> #qilyGlobalContactFooter){
    display:flex!important;
    align-items:center!important;
    justify-content:center!important;
    flex-wrap:nowrap!important;
    gap:0!important;
    padding:9px clamp(22px,3vw,54px)!important;
  }

  html:root:root:root body.qily-tail-compact :is(.module-footer,.footer,footer):has(> #qilyGlobalContactFooter)
  > :is(.module-inner,.footer-inner):has(> :nth-child(2)){
    display:contents!important;
    width:auto!important;
    max-width:none!important;
    margin:0!important;
    padding:0!important;
  }

  html:root:root:root body.qily-tail-compact :is(.module-footer,.footer,footer):has(> #qilyGlobalContactFooter)
  > :is(.module-inner,.footer-inner):has(> :nth-child(2)) > :first-child{
    display:none!important;
  }

  html:root:root:root body.qily-tail-compact :is(.module-footer,.footer,footer):has(> #qilyGlobalContactFooter)
  > :is(.module-inner,.footer-inner):has(> :nth-child(2)) > :last-child{
    display:inline-flex!important;
    align-items:center!important;
    flex:0 0 auto!important;
    width:auto!important;
    margin:0!important;
    color:#e6efec!important;
    font-size:clamp(11px,.78vw,13.5px)!important;
    font-weight:800!important;
    line-height:1.25!important;
    letter-spacing:0!important;
    white-space:nowrap!important;
    text-align:left!important;
  }

  html:root:root:root body.qily-tail-compact :is(.module-footer,.footer,footer):has(> #qilyGlobalContactFooter)
  > :is(.module-inner,.footer-inner):has(> :nth-child(2)) > :last-child::after{
    content:' ｜ '!important;
    display:inline!important;
    margin:0 5px!important;
    color:rgba(255,227,155,.82)!important;
    font-weight:700!important;
  }

  html:root:root:root body.qily-tail-compact #qilyGlobalContactFooter.qily-global-contact-footer{
    display:flex!important;
    align-items:center!important;
    justify-content:center!important;
    flex:0 1 auto!important;
    flex-wrap:nowrap!important;
    gap:6px!important;
    width:auto!important;
    max-width:none!important;
    min-width:0!important;
    margin:0!important;
    padding:0!important;
    border-top:0!important;
    color:#dbe8e4!important;
    font-size:clamp(11px,.78vw,13.5px)!important;
    line-height:1.25!important;
    white-space:nowrap!important;
    text-align:left!important;
  }

  html:root:root:root body.qily-tail-compact #qilyGlobalContactFooter > :first-child{
    display:inline-flex!important;
    align-items:center!important;
    grid-column:auto!important;
    flex:0 0 auto!important;
    width:auto!important;
    color:#fff!important;
    font-size:inherit!important;
    font-weight:900!important;
    line-height:inherit!important;
    letter-spacing:0!important;
    white-space:nowrap!important;
  }

  html:root:root:root body.qily-tail-compact #qilyGlobalContactFooter > :first-child::after{
    content:' ｜ '!important;
    display:inline!important;
    margin-left:5px!important;
    color:rgba(255,227,155,.82)!important;
    font-weight:700!important;
  }

  html:root:root:root body.qily-tail-compact #qilyGlobalContactFooter > span:not(:first-child){
    display:inline-flex!important;
    align-items:center!important;
    flex:0 0 auto!important;
    color:#dbe8e4!important;
    font-size:inherit!important;
    font-weight:800!important;
    line-height:inherit!important;
    white-space:nowrap!important;
  }

  html:root:root:root body.qily-tail-compact #qilyGlobalContactFooter > a{
    display:inline-flex!important;
    align-items:center!important;
    justify-content:center!important;
    flex:0 0 auto!important;
    min-width:0!important;
    min-height:28px!important;
    padding:3px 8px!important;
    border-radius:7px!important;
    color:#ffe39b!important;
    -webkit-text-fill-color:#ffe39b!important;
    font-size:inherit!important;
    font-weight:900!important;
    line-height:1.2!important;
    white-space:nowrap!important;
  }
}
${END}`;

function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

function write(relative, value) {
  const file = path.join(root, relative);
  const normalized = value.endsWith('\n') ? value : value + '\n';
  const before = fs.readFileSync(file, 'utf8');
  if (before === normalized) return false;
  if (checkOnly) throw new Error(`${relative}: V25 footer closure is not current`);
  fs.writeFileSync(file, normalized, 'utf8');
  return true;
}

function upsertBlock(source) {
  const expression = /\/\* QILY-FOOTER-SINGLE-LINE-V25:START \*\/[\s\S]*?\/\* QILY-FOOTER-SINGLE-LINE-V25:END \*\//m;
  if (expression.test(source)) return source.replace(expression, block);
  return source.trimEnd() + '\n\n' + block + '\n';
}

function patchMaterializer(source) {
  if (!/const VERSION = '[^']+';/.test(source)) throw new Error('V24 materializer VERSION constant missing');
  return source.replace(/const VERSION = '[^']+';/, `const VERSION = '${VERSION}';`);
}

const cssBefore = read(CSS_FILE);
const materializerBefore = read(MATERIALIZER);
const cssAfter = upsertBlock(cssBefore);
const materializerAfter = patchMaterializer(materializerBefore);

const changed = [];
if (write(CSS_FILE, cssAfter)) changed.push(CSS_FILE);
if (write(MATERIALIZER, materializerAfter)) changed.push(MATERIALIZER);

const cssCurrent = read(CSS_FILE);
const materializerCurrent = read(MATERIALIZER);
[
  START,
  "content:' ｜ '",
  ':has(> #qilyGlobalContactFooter)',
  'font-size:clamp(11px,.78vw,13.5px)',
  'min-height:28px!important'
].forEach((marker) => {
  if (!cssCurrent.includes(marker)) throw new Error(`V25 footer CSS marker missing: ${marker}`);
});
if (!materializerCurrent.includes(`const VERSION = '${VERSION}';`)) {
  throw new Error('V25 bundle cache version missing from materializer');
}

if (checkOnly) process.stdout.write('V25 single-line footer closure contract passed.\n');
else process.stdout.write(`V25 single-line footer closure updated ${changed.length} file(s): ${changed.join(', ') || 'none'}.\n`);
