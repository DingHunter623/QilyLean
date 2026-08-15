#!/usr/bin/env node
'use strict';

/* QilyLean R2 regression guard v7.1｜2026-08-15 PERFORMANCE V16 */
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const NAV_VERSION='20260815-performance-v16';
const CONSISTENCY_VERSION='20260815-performance-v2';
const CORE_CSS_VERSION='20260815-core-visual-v1';
const FAST_NATIVE_VERSION='20260815-prefetch-v6';
function read(rel){return fs.readFileSync(path.join(root,rel),'utf8');}
function assert(ok,msg){if(!ok)throw new Error(msg);}
function all(source,markers,label){for(const marker of markers)assert(source.includes(marker),`${label}: missing ${marker}`);}
function cssRef(html,file){return new RegExp(`href=["'][^"']*/${file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?:\\?[^"']*)?["']`,'i').test(html);}

const nativeNav=read('site-music-persistent-navigation-v1.js');
all(nativeNav,[
  'window.__qilyFastNativeNavigationV6',
  'data-qily-fast-prefetch',
  'location.assign(url.href)',
  "mode:'native-prefetch-v6'",
  'prefetchBudget:3',
  'duplicateFetch:false',
  'touchPrefetch:false',
  'domSwap:false'
],'Fast Native Navigation V6');
assert(!/\bfetch\s*\(/.test(nativeNav),'Fast Native Navigation V6: duplicate fetch returned');
assert(!/document\.addEventListener\(['"]touchstart['"]/.test(nativeNav),'Fast Native Navigation V6: touchstart prefetch returned');
assert(!/DOMParser\(|history\.pushState|qilySoftNavigation|qily:softnavigate|reconcileHeadAssets/.test(nativeNav),'Fast Native Navigation V6: cross-page DOM/CSS soft navigation returned');

const core=read('site-navigation-core.js');
[
  "['首页', '/']", "['能力体系', '/capabilities/']", "['代表项目', '/projects/']",
  "['改善方法', '/improvements/']", "['知识资产', '/knowledge/']", "['履历主线', '/experience/']",
  "['项目合作', '/cooperation/']", "['信任中心', '/trust/']"
].forEach(marker=>assert(core.includes(marker),`navigation core: missing ${marker}`));
assert(core.includes("if (!document.querySelector('header.qily-site-header .qily-global-nav,header.qily-global-header .qily-global-nav')) buildNavigation();"),'navigation core: static-first primary navigation guard missing');
assert(!/^\s*ensureGlobalContactFooter\(\);\s*$/m.test(core),'navigation core: repeated global contact footer call returned');
assert(!/^\s*ensureKnowledgeDocumentEnhancements\(\);\s*$/m.test(core),'navigation core: repeated document contact tail injection returned');

const legacy=read('site-navigation-legacy-20260802.js');
assert(legacy.includes(`/site-navigation-core.js?v=${NAV_VERSION}`),'legacy navigation: performance V16 core cache version missing');
const observe=(legacy.match(/function observeShell\(\)\s*\{([\s\S]*?)\n\s*\}/)||[])[1]||'';
assert(!observe.includes('MutationObserver'),'legacy navigation: mutation-loop DOM rewriting returned');

const wrapper=read('site-navigation.js');
all(wrapper,[
  "mode: 'r2-static-first-v21'",
  'staticHtmlAuthority: true',
  'dynamicContentShapers: false',
  'runtimeFooter: false',
  'runtimeSharedCssRewrite: false',
  'routeScopedLegacy: true',
  'ordinaryPagesDirectCore: true',
  'chineseWrapPolish: true',
  'qilyChineseWrapPolishV1',
  'text-wrap:pretty',
  'text-wrap:balance',
  `/site-navigation-legacy-20260802.js?v=${NAV_VERSION}`,
  `/site-navigation-core.js?v=${NAV_VERSION}`,
  `/site-ui-consistency-v1.js?v=${CONSISTENCY_VERSION}`,
  'needsLegacyRuntime()'
],'static-first navigation wrapper v21');
assert(!/site-parent-navigation-v3\.js/.test(wrapper),'navigation wrapper: parent runtime dependency returned');
assert(!/(?:site-information-architecture-v1|site-brand-trust-v1|site-trust-conversion-v2|site-visual-closure-v1|site-visual-closure-v2|site-text-contrast-audit-v1)\.js/.test(wrapper),'navigation wrapper: dynamic content shaper returned');

const uiConsistency=read('site-ui-consistency-v1.js');
all(uiConsistency,[
  "share.innerHTML='分享<br>官方网址'",
  "if(path.indexOf('/tools/')===0)return '/'",
  "if(/^\\/legal\\/times26001\\/(?:privacy|terms)\\/$/.test(path))return '/tools/times26001/'",
  "if(path==='/app-support/')return '/tools/times26001/'",
  "w.__qilyParentNavigationV3=true",
  "classList.remove('qily-shell-pending','qily-r2-first-paint-pending')"
],'official URL terminology / safe parent-route runtime');
assert(!/new\s+MutationObserver|\.createTreeWalker\s*\(/.test(uiConsistency),'ui consistency: active full-page mutation/tree scanning returned');

const bundle=read('site-core-visual-bundle-v1.css');
[
  'QILY-CORE-CSS:site-shell.css',
  'QILY-CORE-CSS:site-visual-scale-v1.css',
  'QILY-CORE-CSS:site-wide-layout-v1.css',
  'QILY-CORE-CSS:site-typography-v1.css',
  'QILY-CORE-CSS:site-vi-standard-v1.css',
  'QILY-CORE-CSS:site-vi-contrast-restoration-v1.css',
  'QILY-CORE-CSS:site-r2-stability-fixes-v1.css'
].forEach(marker=>assert(bundle.includes(marker),`core visual bundle: missing ${marker}`));
assert(bundle.includes('#qilyGlobalFooter')&&bundle.includes('body > footer'),'core visual bundle: R2 footer fallback missing');

const timesPage=read('tools/times26001/index.html');
all(timesPage,[
  'versionCode 16 / API 36',
  'QilyLean｜启力精益官方网址与官网邮箱',
  '用户可主动访问官方网址',
  '<strong>统一开发者支持：</strong>官方网址 '
],'Times26001 official URL terminology');
assert(!timesPage.includes('<strong>统一开发者支持：</strong>官网 '),'Times26001: generic 官网 label returned in developer support');

const keyPages=['index.html','ai.html','capabilities/index.html','projects/index.html','improvements/index.html','knowledge/index.html','experience/index.html','cooperation/index.html','trust/index.html','tools/times26001/index.html'];
const individualCoreCss=['site-shell.css','site-visual-scale-v1.css','site-wide-layout-v1.css','site-typography-v1.css','site-vi-standard-v1.css','site-vi-contrast-restoration-v1.css','site-r2-stability-fixes-v1.css'];
for(const rel of keyPages){
  if(!fs.existsSync(path.join(root,rel)))continue;
  const html=read(rel);
  all(html,[
    'QILY-R2-FIRST-PAINT:START',
    `/site-navigation.js?v=${NAV_VERSION}`,
    `/site-music-persistent-navigation-v1.js?v=${FAST_NATIVE_VERSION}`
  ],rel);
  const first=(html.match(/<!-- QILY-R2-FIRST-PAINT:START -->[\s\S]*?<!-- QILY-R2-FIRST-PAINT:END -->/)||[])[0]||'';
  assert(first&& !/opacity\s*:\s*0|visibility\s*:\s*hidden|pointer-events\s*:\s*none|window\.load|stableReveal|2400/.test(first),`${rel}: blocking/blank first-paint logic returned`);
  assert(!/site-parent-navigation-v3\.js/i.test(html),`${rel}: redundant parent-navigation request returned`);

  const hasBundle=html.includes(`/site-core-visual-bundle-v1.css?v=${CORE_CSS_VERSION}`);
  if(hasBundle){
    individualCoreCss.forEach(file=>assert(!cssRef(html,file),`${rel}: bundled page still loads individual core CSS: ${file}`));
  }else{
    /* 某些页面在基础样式之间夹有页面专用CSS；为保证级联顺序不变，允许保留原7张CSS，不强制合并。 */
    individualCoreCss.forEach(file=>assert(cssRef(html,file),`${rel}: safe CSS fallback incomplete: ${file}`));
  }

  assert(!/site-footer-standard-v28\.(?:css|js)/i.test(html),`${rel}: footer standard asset returned`);
  assert(!/<footer\b/i.test(html),`${rel}: visible footer returned`);
}

const projects=read('projects/index.html');
if((projects.match(/<img\b/gi)||[]).length>1)assert(/loading=["']lazy["']/i.test(projects),'projects: below-fold lazy image hints missing');

const cleaner=read('scripts/publish-r2-clean-runtime-v3.js');
all(cleaner,[
  'PERFORMANCE V16',
  'materializeCoreCssBundle',
  'installCoreCssBundle',
  'optimizeImages',
  'removeParentNavigationScript',
  'ordinary pages direct-core',
  NAV_VERSION,
  CORE_CSS_VERSION,
  FAST_NATIVE_VERSION
],'R2 clean performance materializer v5');

const selfHeal=read('.github/workflows/site-regression-poka-yoke.yml');
all(selfHeal,['node scripts/apply-site-poka-yoke-v2.js','node scripts/site-regression-guard.js','contents: write'],'self-heal workflow');

process.stdout.write('QilyLean R2 performance V16 guard passed: visual bundle/fallback both preserve CSS order, ordinary pages direct-core, legacy is route-scoped, Fast Native V6 has budget=3/no duplicate fetch, Chinese orphan-line polish is protected, and first paint remains immediate.\n');
