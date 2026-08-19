#!/usr/bin/env node
'use strict';

/* QilyLean 首页首屏专项物化器｜2026-08-19
 * 仅处理首页：主标题在 v2 基础上再缩小一号 + 左侧内容框统一右边界。
 * 不改导航、不改运营资产闭环、不改正文文案、不改人物图片。
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = path.join(ROOT, 'index.html');
const APPLY = process.argv.includes('--apply');
const BUILD = '20260819-home-hero-align-v3';
const CSS_HREF = '/site-home-hero-tune-v1.css?v=20260819-home-hero-align-v3';
const CSS_TAG = `<link id="qilyHomeHeroTuneV1" rel="stylesheet" href="${CSS_HREF}">`;

function assert(ok, message){
  if(!ok) throw new Error(message);
}

function patch(html){
  let out = html;

  assert(out.includes('class="qily-home-hero-title"'), 'homepage hero title class missing');
  assert(out.includes('<span>现场问题，可计算</span><span>改善成果，可固化</span><span>组织能力，可复用</span>'), 'homepage hero title text changed unexpectedly');
  assert(out.includes('class="qily-home-thesis"'), 'homepage thesis block missing');
  assert(out.includes('class="portrait-frame"'), 'homepage portrait block missing');

  out = out.replace(/\s*<link\b[^>]*(?:id=["']qilyHomeHeroTuneV1["']|href=["'][^"']*\/site-home-hero-tune-v1\.css(?:\?v=[^"']*)?["'])[^>]*>\s*/gi, '\n');
  out = out.replace(/(<script\b[^>]*data-qily-r2-first-paint[^>]*>[\s\S]*?\bvar BUILD=')[^']+('/i, `$1${BUILD}$2`);

  assert(/<\/head>/i.test(out), 'homepage closing head missing');
  out = out.replace(/<\/head>/i, `  ${CSS_TAG}\n</head>`);
  return out;
}

function validate(html){
  assert(html.includes(CSS_HREF), 'homepage hero tune stylesheet not installed');
  assert((html.match(/qilyHomeHeroTuneV1/g) || []).length === 1, 'homepage hero tune stylesheet duplicated');
  assert(html.includes(`var BUILD='${BUILD}'`), 'homepage first-paint build not bumped');
}

function main(){
  const before = fs.readFileSync(INDEX, 'utf8');
  const after = patch(before);
  validate(after);

  if(APPLY && after !== before) fs.writeFileSync(INDEX, after.endsWith('\n') ? after : `${after}\n`, 'utf8');
  process.stdout.write(`${APPLY ? 'Applied' : 'Validated'} homepage hero alignment v3: changed=${after !== before ? 1 : 0}.\n`);
}

main();
