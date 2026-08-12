#!/usr/bin/env node
'use strict';

/* QilyLean R2 regression guard v2｜2026-08-12 */
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
function read(rel){return fs.readFileSync(path.join(root,rel),'utf8');}
function assert(ok,msg){if(!ok)throw new Error(msg);}
function all(source,markers,label){for(const marker of markers)assert(source.includes(marker),`${label}: missing ${marker}`);}

const r2Css=read('site-r2-stability-fixes-v1.css');
all(r2Css,[
  '.qily-section-actions a.primary',
  '-webkit-text-fill-color:#fff!important',
  '.qily-trust-wrap > .qily-value-card',
  'display:flex!important',
  'margin-top:auto!important'
],'R2 visual guard');

const nativeNav=read('site-music-persistent-navigation-v1.js');
all(nativeNav,[
  'window.__qilyFastNativeNavigationV5',
  'data-qily-fast-prefetch',
  "cache:'force-cache'",
  'location.assign(url.href)',
  "mode:'native-prefetch-v5'",
  'domSwap:false'
],'Fast Native Navigation V5');
assert(!/DOMParser\(|history\.pushState|qilySoftNavigation|qily:softnavigate|reconcileHeadAssets/.test(nativeNav),'Fast Native Navigation V5: cross-page DOM/CSS soft navigation returned');

const core=read('site-navigation-core.js');
[
  "['首页', '/']", "['能力体系', '/capabilities/']", "['代表项目', '/projects/']",
  "['改善方法', '/improvements/']", "['知识资产', '/knowledge/']", "['履历主线', '/experience/']",
  "['项目合作', '/cooperation/']", "['信任中心', '/trust/']"
].forEach(marker=>assert(core.includes(marker),`navigation core: missing ${marker}`));
assert(core.includes("if (!document.querySelector('header.qily-site-header .qily-global-nav,header.qily-global-header .qily-global-nav')) buildNavigation();"),'navigation core: static-first primary navigation guard missing');
assert(!/^\s{6}ensureGlobalContactFooter\(\);\s*$/m.test(core),'navigation core: repeated global contact footer call returned');
assert(!/^\s{6}ensureKnowledgeDocumentEnhancements\(\);\s*$/m.test(core),'navigation core: repeated document contact/email tail call returned');
assert(!/^\s{6}(?:addStylesheet|addVisualScaleStylesheet|addWideLayoutStylesheet|addGlobalHeaderStyles|addTypographyStylesheet|enableNavigationPrefetch)\(\);\s*$/m.test(core),'navigation core: runtime shared-style/prefetch rewrite returned');

const legacy=read('site-navigation-legacy-20260802.js');
assert(legacy.includes("var CORE_SRC = '/site-navigation-core.js?v=20260812-r2-stability-v1';"),'legacy navigation: R2 core cache version missing');
const apply=(legacy.match(/function applyFixes\(\)\s*\{([\s\S]*?)\n\s*\}/)||[])[1]||'';
assert(!apply.includes('ensureFriendLinksNavigation();'),'legacy navigation: 友情链接 injection returned to primary nav');
const observe=(legacy.match(/function observeShell\(\)\s*\{([\s\S]*?)\n\s*\}/)||[])[1]||'';
assert(!observe.includes('MutationObserver'),'legacy navigation: mutation-loop DOM rewriting returned');

const wrapper=read('site-navigation.js');
assert(wrapper.includes('/site-navigation-legacy-20260802.js?v=20260812-r2-stability-v1'),'site-navigation.js: R2 legacy runtime cache reference missing');

const keyPages=['index.html','ai.html','capabilities/index.html','projects/index.html','improvements/index.html','knowledge/index.html','experience/index.html','cooperation/index.html','trust/index.html'];
for(const rel of keyPages){
  if(!fs.existsSync(path.join(root,rel)))continue;
  const html=read(rel);
  all(html,[
    'QILY-R2-FIRST-PAINT:START',
    '/site-r2-stability-fixes-v1.css?v=20260812-r2-stability-v1',
    '/site-navigation.js?v=20260812-r2-stability-v1',
    '/site-music-persistent-navigation-v1.js?v=20260812-fast-native-v5',
    'QILY-R2-PRIMARY-CONTRAST-NAV:START'
  ],rel);
  assert(!/<script\b[^>]*src=["'][^"']*\/homepage-music(?:-v5)?\.js(?:\?v=[^"']*)?["']/i.test(html),`${rel}: deprecated background music script returned`);
  assert(!html.includes('QILY-PRIMARY-CONTRAST-MUSIC:START'),`${rel}: deprecated music managed block returned`);
  const nav=html.match(/<nav\b[^>]*(?:qily-global-nav|site-nav)[^>]*>([\s\S]*?)<\/nav>/i);
  if(nav){
    all(nav[1],['首页','能力体系','代表项目','改善方法','知识资产','履历主线','项目合作','信任中心'],`${rel} primary nav`);
    ['QilyLean AI','能力画像','改善经验','知识分享','行走印记','友情链接'].forEach(old=>assert(!nav[1].includes(old),`${rel}: retired/secondary primary-nav item returned: ${old}`));
  }
}

const career=read('experience/index.html');
all(career,['QILY-STATIC-CAREER-BASELINE:v1','id="career-2019-2025"','id="career-2006-2009"'],'experience static baseline');

const selfHeal=read('.github/workflows/site-regression-poka-yoke.yml');
all(selfHeal,['node scripts/apply-site-poka-yoke-v2.js','node scripts/site-regression-guard.js','contents: write'],'self-heal workflow');

process.stdout.write('QilyLean R2 regression guard v2 passed: static-first primary navigation, readable dark actions, bottom-aligned cards, native-prefetch V5, no music regression and no repeated contact/runtime rewrite are intact.\n');
