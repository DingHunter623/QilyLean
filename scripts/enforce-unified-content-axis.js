#!/usr/bin/env node
'use strict';

/* QilyLean 全站内容窗口统一轴物化器｜2026-08-19
 * 目标：把 1560px 内容轴从运行时增强固化进所有公共静态 HTML，避免页面先窄后宽。
 * 不改业务文案、不改导航顺序、不改卡片数量，只统一内容窗口宽度来源与缓存版本。
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');
const BUILD = '20260819-unified-content-axis-v1';
const NAV_VERSION = '20260819-unified-content-axis-v1';
const CSS_HREF = '/site-content-axis-v1.css?v=20260819-unified-content-axis-v1';
const CSS_TAG = `<link id="qilyContentAxisV1" rel="stylesheet" href="${CSS_HREF}">`;

function assert(ok, message){ if(!ok) throw new Error(message); }
function abs(rel){ return path.join(ROOT, rel); }
function read(rel){ return fs.readFileSync(abs(rel), 'utf8'); }
function write(rel, content){
  if(!APPLY) return false;
  const out = content.endsWith('\n') ? content : `${content}\n`;
  const before = read(rel);
  if(before === out) return false;
  fs.writeFileSync(abs(rel), out, 'utf8');
  return true;
}
function trackedHtml(){
  return execFileSync('git', ['ls-files', '*.html'], {
    cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024
  }).split(/\r?\n/).filter(Boolean);
}
function isPublicHtml(html){
  return /<html\b/i.test(html) && /<body\b/i.test(html) &&
    /(?:site-navigation\.js|qily-global-nav|site-nav|site-parent-navigation-v3\.js)/i.test(html);
}
function patch(html){
  let out = html;
  out = out.replace(/\s*<link\b[^>]*(?:id=["']qilyContentAxisV1["']|href=["'][^"']*\/site-content-axis-v1\.css(?:\?v=[^"']*)?["'])[^>]*>\s*/gi, '\n');
  assert(/<\/head>/i.test(out), 'public HTML closing head missing');
  out = out.replace(/<\/head>/i, `  ${CSS_TAG}\n</head>`);
  out = out.replace(/\/site-navigation\.js\?v=[^"']+/g, `/site-navigation.js?v=${NAV_VERSION}`);
  out = out.replace(/(<script\b[^>]*data-qily-r2-first-paint[^>]*>[\s\S]*?\bvar BUILD=')[^']+('[\s\S]*?<\/script>)/gi, `$1${BUILD}$2`);
  return out;
}
function validateFile(rel, html){
  assert(html.includes(CSS_HREF), `${rel}: unified content-axis stylesheet missing`);
  assert((html.match(/qilyContentAxisV1/g) || []).length === 1, `${rel}: content-axis stylesheet duplicated`);
  assert(html.includes(`/site-navigation.js?v=${NAV_VERSION}`), `${rel}: navigation cache version stale`);
}
function main(){
  const css = read('site-content-axis-v1.css');
  assert(css.includes('--qily-content-axis:1560px'), '1560px content-axis token missing');
  assert(css.includes('.qily-asset-inner'), 'homepage asset-inner coverage missing');
  assert(css.includes('.qily-system-axis__inner'), 'operating-axis inner coverage missing');
  assert(css.includes('.qily-ia-inner'), 'information-architecture inner coverage missing');

  let checked = 0;
  let changed = 0;
  for(const rel of trackedHtml()){
    let html;
    try{ html = read(rel); }catch(_){ continue; }
    if(!isPublicHtml(html)) continue;
    checked += 1;
    const after = patch(html);
    validateFile(rel, after);
    if(after !== html && write(rel, after)) changed += 1;
  }
  assert(checked > 0, 'no public HTML discovered');
  process.stdout.write(`${APPLY ? 'Applied' : 'Validated'} unified 1560px content axis: changed=${changed}/${checked}.\n`);
}

main();
