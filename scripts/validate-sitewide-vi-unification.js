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
assert(readability.includes('--qily-r8-heading-ceiling:clamp(30px,2.65vw,44px)'), 'International heading ceiling must remain 44px.');
assert(readability.includes('font-size:clamp(30px,8.2vw,38px)!important'), 'International mobile H1 ceiling must remain 38px.');

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
  'QILY-GK-HEADER-ALIGN-V3',
  'QILY-GK-NAV-TYPE-PARITY-V4',
  '--qily-gk-primary-nav-font-size:20px',
  'grid-template-columns:max-content minmax(0,1fr) 206px!important',
  "content:'返回首页'!important",
  '--qily-gk-h1:clamp(30px,2.65vw,44px)',
  '--qily-gk-h1:clamp(29px,8vw,38px)',
  'a.card[href]:hover',
  'a.brief[href]:hover',
  'a.card[href]:focus-visible',
  'a.brief[href]:active'
].forEach(m=>assert(gkCss.includes(m),'Global Knowledge VI missing: '+m));

const gkReader=read('global-knowledge/view/index.html');
assert(gkReader.includes('qily-reader-link-cluster'), 'Global Knowledge reader imported-link cluster normalization is missing.');
assert(gkReader.includes('column-gap:3ch!important'), 'Global Knowledge reader link clusters must preserve a three-character gap.');
assert(gkReader.includes('data-qily-reader-source="weibo"'), 'Global Knowledge reader must visibly style approved Weibo source links.');
assert(gkReader.includes("a.setAttribute('data-qily-reader-source','weibo')"), 'Global Knowledge reader must preserve approved Weibo source links.');
assert(gkReader.includes('.content article[id^="lean-"]>small'), 'Global Knowledge Weibo module badge selector is missing.');
assert(gkReader.includes('font-size:18px!important'), 'Weibo module badges must use the visible 18px hierarchy.');
assert(gkReader.includes('.content #lean-tools-feature>ul:first-of-type>li'), 'Global Knowledge ten-tool grid visual rule is missing.');

const gkBriefs=read('global-knowledge/briefs/index.html');
assert(gkBriefs.includes('data-qily-imported-visual="normalized-v1"'), 'Global Knowledge brief reader normalized SVG visual contract is missing.');
assert(gkBriefs.includes('.vi-feedback-return{fill:none;stroke:var(--gold);stroke-width:6'), 'Global Knowledge brief reader feedback rail VI normalization is missing.');

const gkPages=[
  'global-knowledge/index.html',
  'global-knowledge/terminology/index.html',
  'global-knowledge/briefs/index.html',
  'global-knowledge/library/index.html',
  'global-knowledge/view/index.html'
];
for(const rel of gkPages){
  const html=read(rel);
  assert(html.includes('/global-knowledge/knowledge-dock-v1.js?v=20260921-site-search-parity-v2'), rel+' must load the Global Knowledge dock search-parity revision.');
  assert(html.includes('/global-knowledge/global-knowledge-vi-v2.css?v=20260920-gk-vi-v4'), rel+' must load shared Global Knowledge VI after its local skin.');
  assert(/<header class="top">[\s\S]*?<a(?: class="brand")? href="https:\/\/qilylean\.com\/" aria-label="返回QilyLean首页" title="返回首页">QilyLean Global Knowledge<\/a>/.test(html), rel+' Global Knowledge brand must return to the canonical qilylean.com home.');
  assert(html.includes('href="https://qilylean.cn/" rel="noopener">China Knowledge / 精益制造经验分享</a>'), rel+' must expose China Knowledge with the exact filed China-site name for the qilylean.cn route.');
  assert(!html.includes('>中国知识站</a>'), rel+' must not expose the retired China-site name.');
}

/* 3) China site: same international-style rail + controlled type hierarchy */
const cnCss=read('cn-site/assets/qilylean-vi-v2.css');
const cnBaseCss=read('cn-site/assets/qilylean-vi-v1.css');
const cnRail=read('cn-site/assets/cn-nav-rail-v1.js');
const cnTranslate=read('cn-site/assets/cn-translate-baidu-v1.js');
const cnTranslateCss=read('cn-site/assets/cn-translate-baidu-v1.css');
const workerSocial=read('cloudflare-worker/worker-social.js');
assert(workerSocial.includes("BAIDU_TRANSLATE_URL = 'https://fanyi-api.baidu.com/api/trans/vip/translate'"), 'Baidu translation API endpoint is missing from the translation worker.');
assert(workerSocial.includes("TRANSLATION_CACHE_VERSION = 'v5-provider-aware'"), 'Provider-aware translation cache generation is missing.');
assert(workerSocial.includes('callBaiduTranslation'), 'Baidu translation worker implementation is missing.');
assert(workerSocial.includes('callYoudaoTranslation'), 'Youdao translation fallback implementation is missing.');
[
  'QILY-CN-NAV-RAIL-V7',
  'QILY-CN-STICKY-HEADER-V1',
  'position:sticky!important',
  'QILY-CN-ROUTE-FEEDBACK-V1',
  'QILY-CN-FILING-FEEDBACK-V2',
  '--qily-nav-scroll-track:#b9d9d4',
  '--qily-nav-scroll-thumb:#0f4b5a',
  '--qily-cn-h1:clamp(27px,7.2vw,33px)',
  '--qily-cn-h2:clamp(19px,5vw,21px)',
  '--qily-cn-h3:clamp(17px,4.5vw,19px)',
  'scrollbar-width:none!important',
  'background:#b9d9d4!important',
  'background:#0f4b5a!important',
  'min-width:104px!important',
  '.qily-primary-nav-scroll-thumb'
].forEach(m=>assert(cnCss.includes(m),'CN unified VI missing: '+m));
assert(!cnRail.includes("rail.type='range'"), 'CN nav rail must not depend on native range behavior.');
assert(cnRail.includes("role','scrollbar'"), 'CN nav rail must expose scrollbar semantics.');
assert(cnRail.includes('qily-primary-nav-scroll-thumb'), 'CN custom nav thumb runtime is missing.');
assert(cnRail.includes("qily-primary-nav-scroll-rail"), 'CN nav rail runtime class is missing.');
assert(cnRail.includes('qily-cn-nav-shell'), 'CN desktop/mobile nav shell is missing.');
assert(cnCss.includes('--qily-cn-primary-nav-font-size:20px'), 'CN primary nav type must match international 20px.');
assert(cnCss.includes('QILY-CN-TYPE-HIERARCHY-V5'), 'CN final typography authority V5 missing.');
assert(cnCss.includes('--qily-cn-h2:clamp(20px,1.25vw,22px)'), 'CN desktop H2 must be capped at 22px.');
assert(cnCss.includes('--qily-cn-h3:clamp(17px,1vw,19px)'), 'CN desktop H3 must be capped at 19px.');
assert(cnBaseCss.includes('clamp(20px,1.25vw,22px)!important'), 'CN base VI must use the restrained 22px section H2 fallback.');
assert(!cnBaseCss.includes('clamp(32px,3vw,48px)!important'), 'CN legacy 48px section H2 regression detected.');
assert(cnCss.includes('QILY-CN-CURRENT-MODULE-V1'), 'CN current-module VI contract is missing.');
assert(cnCss.includes('--qily-cn-primary-nav-active:#0f4b5a'), 'CN current-module fill must match international deep teal.');
assert(cnCss.includes('--qily-cn-primary-nav-active-border:#ffe39b'), 'CN current-module boundary must match international gold.');
assert(cnCss.includes('a[href][aria-current="page"]'), 'CN current-module aria-current selector is missing.');
assert(cnRail.includes('QILY-CN-CURRENT-MODULE-RUNTIME-V1'), 'CN current-module route runtime is missing.');
assert(cnRail.includes("best.setAttribute('aria-current','page')"), 'CN current-module route runtime must set aria-current.');
assert(cnCss.includes('grid-template-areas:"brand nav translate"'), 'CN desktop header three-zone layout is missing.');
assert(cnCss.includes('grid-template-areas:"brand translate" "nav nav"'), 'CN mobile header nav row is missing.');
assert(cnCss.includes('QILY-CN-HEADER-SHELL-PARITY-V2'), 'CN desktop header shell parity marker is missing.');
assert(cnCss.includes('min-height:66.4px!important'), 'CN desktop header shell must match the international measured geometry.');
assert(cnRail.includes('mousedown'), 'CN nav rail mouse drag is missing.');
assert(cnRail.includes('mousemove'), 'CN nav rail mouse move runtime is missing.');
assert(cnRail.includes('touchstart'), 'CN nav rail touch drag is missing.');
assert(cnRail.includes('installNavMouseDrag'), 'CN primary nav direct mouse drag is missing.');
assert(!cnRail.includes('pointerdown'), 'CN nav rail must not depend on PointerEvent drag.');
assert(!cnRail.includes('data-qily-translation-provider'), 'CN nav rail must remain translation-neutral.');
assert(cnTranslate.includes('QilyLean CN In-Page Translation V7'), 'CN in-page translator V3 runtime is missing.');
assert(cnTranslate.includes("data-qily-translation-provider','qilylean-api'"), 'CN translator must declare the QilyLean in-page provider.');
assert(cnTranslate.includes("data-qily-translation-engine','baidu'"), 'CN translator must declare Baidu as its preferred backend engine.');
assert(cnTranslate.includes('concurrency=1'), 'CN translator batch concurrency optimization is missing.');
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
/* CN-FILED-NAME-GOVERNANCE-V1 | public China-site name must equal the ICP filing service name. */
const cnFiledName='精益制造经验分享';
const cnFooterName='QilyLean | 启力精益 · '+cnFiledName;
for(const rel of cnPages){
  const html=read(rel);
  assert(html.includes('/assets/site.css?v=20260923-cn-personal-v3-reading'), rel+' must use fresh CN base typography CSS.');
  assert(html.includes('/assets/portal.css?v=20260923-portal-v2-reading'), rel+' must use fresh CN portal typography CSS.');
  assert(html.includes('/assets/qilylean-vi-v2.css?v=20260924-cn-vi-v25-header-shell-parity'), rel+' must use CN VI V23.');
  assert(html.includes('/assets/cn-nav-rail-v1.js?v=20260925-nav-rail-v9-resource-collab'), rel+' must load the international-style nav rail runtime.');
  assert(html.includes('/assets/cn-translate-baidu-v1.css?v=20260922-translate-v6-baidu'), rel+' must load exactly one CN translator stylesheet.');
  assert(html.includes('/assets/cn-translate-baidu-v1.js?v=20260922-translate-v6-baidu'), rel+' must load exactly one CN translator runtime.');
  assert(html.includes(cnFooterName), rel+' must display the filed China-site name in the footer.');
  assert(!html.includes('QilyLean | 启力精益 · 个人制造业知识与实践分享'), rel+' must not restore the retired footer name.');
  assert(!html.includes('个人制造业知识与实践分享'), rel+' must not expose the retired China-site name.');
  const title=(html.match(/<title>([^<]*)<\/title>/i)||[])[1]||'';
  assert(title.includes(cnFiledName), rel+' title must include the filed China-site name.');
  // Filing records remain official external links after shared-footer regeneration.
  const filingLinks=[...html.matchAll(/<a\b[^>]*href=["']https:\/\/beian\.(?:miit|mps)\.gov\.cn\/[^"']*["'][^>]*>/g)];
  assert(filingLinks.length>=2, rel+' must retain both official filing links.');
  for(const [link] of filingLinks){
    assert(/target="_blank"/.test(link), rel+' filing query must open in a new tab.');
    assert(/rel="noopener noreferrer"/.test(link), rel+' filing query must isolate the external tab.');
    assert(/title="[^"]*新标签页打开[^"]*"/.test(link), rel+' filing query must explain its new-tab behavior.');
  }
}

const cnHome=read('cn-site/index.html');
for(const marker of [
  '<title>精益制造经验分享｜QilyLean | 启力精益｜制造工程、精益生产与数智工厂知识站</title>',
  '"name":"精益制造经验分享"',
  '<p class="eyebrow">精益制造经验分享</p>',
  '<h2>精益制造经验分享</h2>'
]) assert(cnHome.includes(marker),'CN home filed-name marker missing: '+marker);
assert(!cnHome.includes('QILYLEAN CHINA｜'),'CN home must not prefix the filed site name with a retired alias.');
assert(!cnHome.includes('个人制造业知识与实践分享'),'CN home retired site name returned.');

const cnAbout=read('cn-site/about/index.html');
assert(cnAbout.includes('<h1>关于“精益制造经验分享”</h1>'),'CN About must use the filed site name.');

const linksPage=read('links/index.html');
assert(linksPage.includes('<strong>精益制造经验分享（QilyLean | 启力精益中国站）：</strong>'),'International links page must expose the filed China-site name.');
assert(linksPage.includes('进入精益制造经验分享 ↗'),'International links page CTA must use the filed China-site name.');
assert(linksPage.includes('qilylean.cn 网站名称为“精益制造经验分享”'),'International links page description must state the filed China-site name.');

/* 4) Previous public-copy governance remains mandatory. */
assert(fs.existsSync(path.join(root,'scripts/validate-public-copy-governance.js')), 'Previous public-copy governance gate must remain present.');
assert(fs.existsSync(path.join(root,'.github/workflows/validate-public-copy-governance.yml')), 'Previous public-copy governance workflow must remain present.');

if(process.exitCode) process.exit(process.exitCode);
console.log('Sitewide VI governance passed: international interaction/type authority, Global Knowledge shared VI, and CN deep-teal rail and single-owner in-page translation header are aligned.');
