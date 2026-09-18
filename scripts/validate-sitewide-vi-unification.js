#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const root = path.resolve(__dirname, '..');

function read(rel){return fs.readFileSync(path.join(root,rel),'utf8');}
function assert(ok,msg){if(!ok){console.error('ERROR: '+msg);process.exitCode=1;}}
function tracked(pattern){
  return execFileSync('git',['ls-files',pattern],{cwd:root,encoding:'utf8'})
    .split(/\r?\n/).filter(Boolean);
}

/* 1) International VI authority */
const readability=read('site-visual-readability-v5.css');
assert(readability.includes('--qily-r8-heading-ceiling:clamp(34px,3.25vw,52px)'), 'International heading ceiling must remain 52px.');
assert(readability.includes('font-size:clamp(34px,9.6vw,43px)!important'), 'International mobile H1 ceiling must remain 43px.');

const interaction=read('site-interaction-semantics-v1.css');
assert(interaction.includes('QILY-ROUTE-CARD-FEEDBACK-V2'), 'International route-card feedback contract is missing.');
assert(interaction.includes('transform:translateY(-3px)!important'), 'International route-card hover lift is missing.');
assert(interaction.includes('outline:3px solid var(--qily-action-focus'), 'International route-card focus feedback is missing.');
assert(interaction.includes('transform:translateY(1px) scale(.985)!important'), 'International route-card active feedback is missing.');

/* 2) Global Knowledge must inherit the same visual hierarchy and interaction semantics */
const gkCss=read('global-knowledge/global-knowledge-vi-v2.css');
[
  'QILY-GK-TYPE-HIERARCHY-V2',
  'QILY-GK-ROUTE-FEEDBACK-V2',
  '--qily-gk-h1:clamp(34px,3.25vw,52px)',
  '--qily-gk-h1:clamp(31px,9vw,43px)',
  'a.card[href]:hover',
  'a.brief[href]:hover',
  'a.card[href]:focus-visible',
  'a.brief[href]:active'
].forEach(m=>assert(gkCss.includes(m),'Global Knowledge VI missing: '+m));

const gkPages=[
  'global-knowledge/index.html',
  'global-knowledge/terminology/index.html',
  'global-knowledge/briefs/index.html',
  'global-knowledge/library/index.html',
  'global-knowledge/view/index.html'
];
for(const rel of gkPages){
  const html=read(rel);
  assert(html.includes('/global-knowledge/global-knowledge-vi-v2.css?v=20260918-vi-v2'), rel+' must load shared Global Knowledge VI after its local skin.');
}

/* 3) China site: same international-style rail + controlled type hierarchy */
const cnCss=read('cn-site/assets/qilylean-vi-v2.css');
const cnRail=read('cn-site/assets/cn-nav-rail-v1.js');
const cnTranslate=read('cn-site/assets/cn-translate-baidu-v1.js');
const cnTranslateCss=read('cn-site/assets/cn-translate-baidu-v1.css');
[
  'QILY-CN-NAV-RAIL-V1',
  'QILY-CN-ROUTE-FEEDBACK-V1',
  '--qily-nav-scroll-track:#b9d9d4',
  '--qily-nav-scroll-thumb:#0f4b5a',
  '--qily-cn-h1:clamp(30px,8.4vw,37px)',
  '--qily-cn-h2:clamp(24px,6.8vw,29px)',
  '--qily-cn-h3:clamp(19px,5.7vw,21px)',
  'scrollbar-width:none!important',
  '::-webkit-slider-runnable-track',
  '::-webkit-slider-thumb'
].forEach(m=>assert(cnCss.includes(m),'CN unified VI missing: '+m));
assert(cnRail.includes("rail.type='range'"), 'CN nav rail must use the international range control.');
assert(cnRail.includes("qily-primary-nav-scroll-rail"), 'CN nav rail runtime class is missing.');
assert(cnRail.includes('setFromPointer'), 'CN nav rail pointer drag is missing.');
assert(cnRail.includes('installNavDrag'), 'CN primary nav direct drag is missing.');
assert(!cnRail.includes('data-qily-translation-provider'), 'CN nav rail must remain translation-neutral.');
assert(cnTranslate.includes('QilyLean CN In-Page Translation V3'), 'CN in-page translator V3 runtime is missing.');
assert(cnTranslate.includes("data-qily-translation-provider','qilylean-api'"), 'CN translator must declare the QilyLean in-page provider.');
assert(cnTranslate.includes('API_BASES'), 'CN translator must use the in-page translation API.');
assert(cnTranslate.includes("option(select,'zh-CN','中文简体')"), 'CN translator Simplified Chinese option is missing.');
assert(cnTranslate.includes("option(select,'zh-TW','中文繁体')"), 'CN translator Traditional Chinese option is missing.');
assert(cnTranslate.includes("option(select,'en','English')"), 'CN translator English option is missing.');
assert(cnTranslate.includes("option(select,MORE,'其他')"), 'CN translator More option is missing.');
assert(cnTranslate.includes('target_language:target'), 'CN translator target-language request contract is missing.');
assert(cnTranslateCss.includes('QilyLean CN In-Page Translation UI V3'), 'CN translator V3 UI is missing.');

const cnPages=[...new Set([...tracked('cn-site/*.html'),...tracked('cn-site/**/*.html')])].filter(rel=>{
  if(/googleb7a|baidu_verify/.test(rel)) return false;
  const html=read(rel);
  return /<body/i.test(html)&&/<\/body>/i.test(html);
});
assert(cnPages.length>=17,'Expected at least 17 CN document pages.');
for(const rel of cnPages){
  const html=read(rel);
  assert(html.includes('/assets/qilylean-vi-v2.css?v=20260918-cn-vi-v11'), rel+' must use CN VI v9.');
  assert(html.includes('/assets/cn-nav-rail-v1.js?v=20260918-nav-rail-v2'), rel+' must load the international-style nav rail runtime.');
  assert(html.includes('/assets/cn-translate-baidu-v1.css?v=20260918-baidu-v2'), rel+' must load exactly one CN translator stylesheet.');
  assert(html.includes('/assets/cn-translate-baidu-v1.js?v=20260918-baidu-v2'), rel+' must load exactly one CN translator runtime.');
}

/* 4) Previous public-copy governance remains mandatory. */
assert(fs.existsSync(path.join(root,'scripts/validate-public-copy-governance.js')), 'Previous public-copy governance gate must remain present.');
assert(fs.existsSync(path.join(root,'.github/workflows/validate-public-copy-governance.yml')), 'Previous public-copy governance workflow must remain present.');

if(process.exitCode) process.exit(process.exitCode);
console.log('Sitewide VI governance passed: international interaction/type authority, Global Knowledge shared VI, and CN deep-teal rail and single-owner Baidu translation header are aligned.');
