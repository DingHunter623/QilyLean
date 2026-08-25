#!/usr/bin/env node
'use strict';

/* QilyLean visual readability publisher｜2026-08-25 V8
 * Scope: visual only. Do not rewrite business taxonomy, navigation labels, page copy or navigation cache contracts.
 * V8 closes a real production gap: dated Daily Brief pages did not carry the body.daily-single-page hook,
 * so V7 Daily Brief contrast and heading rules never matched the rendered page.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const VERSION = '20260825-visual-readability-v7';
const HREF = `/site-visual-readability-v5.css?v=${VERSION}`;
const TAG = `<link id="qilyVisualReadabilityV5Stylesheet" rel="stylesheet" href="${HREF}">`;
const DAILY_STYLE_ID = 'qilyDailyReadabilityClosureV8';
const DAILY_STYLE = `<style id="${DAILY_STYLE_ID}">
/* QILY-DAILY-READABILITY-CLOSURE-V8-20260825
 * Final rendered-page ownership: major headings use Chinese hierarchy; deep badges use white;
 * dark Hero kicker uses gold; light cards use dark copy. Loaded after every shared stylesheet.
 */
html body.daily-single-page main article.post .section-head>.section-no{
  display:block!important;flex:0 0 auto!important;width:auto!important;height:auto!important;min-width:0!important;min-height:0!important;
  margin:0!important;padding:2px 0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;
  color:#0f4b5a!important;-webkit-text-fill-color:#0f4b5a!important;font-size:22px!important;font-weight:950!important;line-height:1.2!important;text-shadow:none!important;
}
html body.daily-single-page main article.post .section-head>.section-no::before{content:none!important}
html body.daily-single-page main article.post .hero .kicker{
  color:#ffe39b!important;-webkit-text-fill-color:#ffe39b!important;background:rgba(7,60,71,.38)!important;border-color:rgba(255,227,155,.72)!important;opacity:1!important;text-shadow:none!important;
}
html body.daily-single-page main article.post :is(.tag,.num,.step>b:first-child,.service-number,.step-number,.step-index,.sequence-number,.process-number,.number-badge,.workflow-number,.timeline-number,.term-opl-num){
  color:#fff!important;-webkit-text-fill-color:#fff!important;text-shadow:none!important;opacity:1!important;filter:none!important;mix-blend-mode:normal!important;
}
html body.daily-single-page main article.post :is(.tag,.num,.step>b:first-child,.service-number,.step-number,.step-index,.sequence-number,.process-number,.number-badge,.workflow-number,.timeline-number,.term-opl-num) *{
  color:#fff!important;-webkit-text-fill-color:#fff!important;
}
html body.daily-single-page main article.post :is(.overview-card,.scene,.node,.case,.insight,.audit>div,.brief-one-point-training,.brief-one-point-grid>div,.brief-one-point-interface,.brief-one-point-check,.brief-learning-card,.engineering-checklist,.formula-card,.owner-card,.status-card,.brief-related-grid>a,.brief-action-strip>span,.mind-card,.tool-card,.flow-step,.value-card){
  color:#274744!important;-webkit-text-fill-color:#274744!important;opacity:1!important;filter:none!important;
}
html body.daily-single-page main article.post :is(.overview-card,.scene,.node,.case,.insight,.audit>div,.brief-one-point-training,.brief-one-point-grid>div,.brief-one-point-interface,.brief-one-point-check,.brief-learning-card,.engineering-checklist,.formula-card,.owner-card,.status-card,.brief-related-grid>a,.brief-action-strip>span,.mind-card,.tool-card,.flow-step,.value-card) :is(h3,h4,strong){
  color:#0f4b5a!important;-webkit-text-fill-color:#0f4b5a!important;
}
html body.daily-single-page main article.post :is(.overview-card,.scene,.node,.case,.insight,.audit>div,.brief-one-point-training,.brief-one-point-grid>div,.brief-one-point-interface,.brief-one-point-check,.brief-learning-card,.engineering-checklist,.formula-card,.owner-card,.status-card,.brief-related-grid>a,.brief-action-strip>span,.mind-card,.tool-card,.flow-step,.value-card) :is(p,li,small,span){
  color:#3a5756!important;-webkit-text-fill-color:#3a5756!important;opacity:1!important;
}
html body.daily-single-page main article.post .overview-card>.tag,
html body.daily-single-page main article.post .waste-title>.num,
html body.daily-single-page main article.post .step>b:first-child{
  color:#fff!important;-webkit-text-fill-color:#fff!important;
}
html body.daily-single-page main article.post .hero-rule b{color:#ffe2a2!important;-webkit-text-fill-color:#ffe2a2!important}
html body.daily-single-page main article.post .hero-rule strong{color:#fff!important;-webkit-text-fill-color:#fff!important}
html body.daily-single-page main article.post .closing :is(h2,h3,h4,p,span){color:#fff!important;-webkit-text-fill-color:#fff!important}
html body.daily-single-page main article.post .closing strong{color:#ffe0a4!important;-webkit-text-fill-color:#ffe0a4!important}
</style>`;

const CHINESE_MAJOR = new Map([
  ['1','一、'],['2','二、'],['3','三、'],['4','四、'],['5','五、'],['6','六、'],['7','七、'],['8','八、'],['9','九、'],['10','十、'],
  ['11','十一、'],['12','十二、'],['13','十三、'],['14','十四、'],['15','十五、'],['16','十六、'],['17','十七、'],['18','十八、'],['19','十九、'],['20','二十、']
]);

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

function isDatedBrief(rel) {
  return /^qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html$/i.test(rel);
}

function addBodyClass(html, className) {
  return html.replace(/<body\b([^>]*)>/i, (all, attrs) => {
    const classMatch = attrs.match(/\bclass=(['"])(.*?)\1/i);
    if (classMatch) {
      const classes = classMatch[2].split(/\s+/).filter(Boolean);
      if (!classes.includes(className)) classes.push(className);
      const nextClass = `class=${classMatch[1]}${classes.join(' ')}${classMatch[1]}`;
      return `<body${attrs.replace(classMatch[0], nextClass)}>`;
    }
    return `<body class="${className}"${attrs}>`;
  });
}

function normalizeMajorHeadingNumbers(html) {
  return html.replace(/(<span\b[^>]*class=(['"])[^'"]*\bsection-no\b[^'"]*\2[^>]*>)\s*0?(\d{1,2})\s*(<\/span>)/gi,
    (all, open, quote, raw, close) => `${open}${CHINESE_MAJOR.get(String(Number(raw))) || raw}${close}`);
}

function installDailyContract(html, rel) {
  if (!isDatedBrief(rel)) return html;
  let out = addBodyClass(html, 'daily-single-page');
  out = normalizeMajorHeadingNumbers(out);
  out = out.replace(new RegExp(`\\s*<style\\b[^>]*id=["']${DAILY_STYLE_ID}["'][^>]*>[\\s\\S]*?<\\/style>\\s*`, 'gi'), '\n');
  assert(/<\/head>/i.test(out), `${rel}: head closing tag missing for Daily Brief closure`);
  out = out.replace(/<\/head>/i, `${DAILY_STYLE}\n</head>`);
  return out;
}

function install(html, rel) {
  let out = html.replace(/\s*<link\b[^>]*(?:id=["']qilyVisualReadabilityV5Stylesheet["']|href=["'][^"']*\/site-visual-readability-v5\.css(?:\?v=[^"']*)?["'])[^>]*>\s*/gi, '\n');
  assert(/<\/head>/i.test(out), 'public HTML head closing tag missing');
  out = out.replace(/<\/head>/i, `  ${TAG}\n</head>`);
  return installDailyContract(out, rel);
}

function materialize() {
  let checked = 0;
  let changed = 0;
  let daily = 0;
  for (const rel of trackedHtml()) {
    let html;
    try { html = read(rel); } catch (_) { continue; }
    if (!isPublicHtml(html)) continue;
    checked += 1;
    if (isDatedBrief(rel)) daily += 1;
    const next = install(html, rel);
    if (next !== html && write(rel, next)) changed += 1;
  }
  return { checked, changed, daily };
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
    '.qily-ia-card>small',
    'QILY-DAILY-SURFACE-CONTRAST-V7-20260825',
    '.term-opl-num'
  ].forEach(token => assert(css.includes(token), `V7 CSS contract missing: ${token}`));
}

function verifyPages() {
  let publicCount = 0;
  let dailyCount = 0;
  for (const rel of trackedHtml()) {
    let html;
    try { html = read(rel); } catch (_) { continue; }
    if (!isPublicHtml(html)) continue;
    publicCount += 1;
    assert(html.includes(HREF), `${rel}: V7 stylesheet missing`);
    if (isDatedBrief(rel)) {
      dailyCount += 1;
      assert(/<body\b[^>]*class=["'][^"']*\bdaily-single-page\b/i.test(html), `${rel}: Daily Brief body hook missing`);
      assert(html.includes(`id="${DAILY_STYLE_ID}"`), `${rel}: Daily Brief final readability closure missing`);
      assert(!/<span\b[^>]*class=["'][^"']*\bsection-no\b[^"']*["'][^>]*>\s*0\d\s*<\/span>/i.test(html), `${rel}: major heading still uses 01/02 numeric hierarchy`);
    }
  }
  assert(publicCount > 0, 'No public HTML pages discovered');
  assert(dailyCount > 0, 'No dated Daily Brief pages discovered');
  return { publicCount, dailyCount };
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
  const verified = verifyPages();
  verifyBusinessHierarchyUntouched();
  process.stdout.write(`Visual readability V8 materialized: checked ${verified.publicCount}, dated briefs ${verified.dailyCount}, refreshed ${result.changed} public pages.\n`);
}

main();
