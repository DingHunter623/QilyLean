#!/usr/bin/env node
'use strict';

/* QilyLean visual readability V5 publisher｜2026-08-18
 * Scope: visual only. Do not rewrite business taxonomy, navigation labels, page copy or navigation cache contracts.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const VERSION = '20260818-visual-readability-v5';
const HREF = `/site-visual-readability-v5.css?v=${VERSION}`;
const TAG = `<link id="qilyVisualReadabilityV5Stylesheet" rel="stylesheet" href="${HREF}">`;

function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function write(rel, content) {
  const abs = path.join(ROOT, rel);
  const out = content.endsWith('\n') ? content : `${content}\n`;
  const before = fs.readFileSync(abs, 'utf8');
  if (before === out) return false;
  fs.writeFileSync(abs, out, 'utf8');
  return true;
}
function assert(ok, msg) { if (!ok) throw new Error(msg); }

function trackedHtml() {
  return execFileSync('git', ['ls-files', '*.html'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024
  }).split(/\r?\n/).filter(Boolean);
}

function isPublicHtml(html) {
  return /<html\b/i.test(html) && /<body\b/i.test(html) &&
    /(?:site-navigation\.js|qily-global-nav|site-nav|site-parent-navigation-v3\.js)/i.test(html);
}

function install(html) {
  let out = html.replace(/\s*<link\b[^>]*(?:id=["']qilyVisualReadabilityV5Stylesheet["']|href=["'][^"']*\/site-visual-readability-v5\.css(?:\?v=[^"']*)?["'])[^>]*>\s*/gi, '\n');
  assert(/<\/head>/i.test(out), 'public HTML head closing tag missing');
  out = out.replace(/<\/head>/i, `  ${TAG}\n</head>`);
  return out;
}

function materialize() {
  let checked = 0;
  let changed = 0;
  for (const rel of trackedHtml()) {
    let html;
    try { html = read(rel); } catch (_) { continue; }
    if (!isPublicHtml(html)) continue;
    checked += 1;
    const next = install(html);
    if (next !== html && write(rel, next)) changed += 1;
  }
  return { checked, changed };
}

function verifyCss() {
  const css = read('site-visual-readability-v5.css');
  [
    '--qily-v5-small:17px',
    '--qily-v5-small-strong:18px',
    '.service-number',
    'font-size:18px!important',
    'background:var(--qily-v5-green-deep)!important',
    'color:var(--qily-v5-white)!important',
    '#engineering-enablers',
    '#qily-digital-enablers',
    '.module-card.service-card',
    '.qily-ia-card>small'
  ].forEach(token => assert(css.includes(token), `V5 CSS contract missing: ${token}`));
}

function verifyPages() {
  let publicCount = 0;
  for (const rel of trackedHtml()) {
    let html;
    try { html = read(rel); } catch (_) { continue; }
    if (!isPublicHtml(html)) continue;
    publicCount += 1;
    assert(html.includes(HREF), `${rel}: V5 stylesheet missing`);
  }
  assert(publicCount > 0, 'No public HTML pages discovered');
  return publicCount;
}

function verifyBusinessHierarchyUntouched() {
  const home = read('index.html');
  const cooperation = read('cooperation/index.html');
  assert(home.includes('三大核心业务'), 'Homepage business hierarchy drifted');
  assert(home.includes('DIGITAL ENABLERS｜数智化增强与数字产品能力'), 'Homepage digital enabler layer missing');
  assert(!home.includes('两大业务主线 · 六类核心业务'), 'Homepage regressed to six-core taxonomy');
  assert(cooperation.includes('<h2>三大核心业务</h2>'), 'Cooperation three-core heading missing');
  assert(cooperation.includes('三项增强能力，不与三大核心业务同级'), 'Cooperation enabler hierarchy missing');
  assert(!cooperation.includes('<h2>六类核心业务</h2>'), 'Cooperation regressed to six-core taxonomy');
}

function main() {
  verifyCss();
  const result = materialize();
  const publicCount = verifyPages();
  verifyBusinessHierarchyUntouched();
  process.stdout.write(`Visual readability V5 materialized: checked ${publicCount}, refreshed ${result.changed} public pages.\n`);
}

main();
