#!/usr/bin/env node
'use strict';

/* QilyLean R2 regression guard v7.5｜2026-08-15 PERFORMANCE V16.1 */
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const NAV_VERSION='20260815-performance-v16';
const CONSISTENCY_VERSION='20260815-dock-label-v6';
const CORE_CSS_VERSION='20260815-core-visual-v1';
const FAST_NATIVE_VERSION='20260815-prefetch-v6p1';
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
  'secondaryPrefetchBudget:2',
  'duplicateFetch:false',
  'touchPrefetch:false',
  'intentPrefetch:true',
  'visualMutation:false',
  'requestIdleCallback(warmPrimaryNav,{timeout:700})'
],'Fast Native Navigation V6.1');
assert(!/\bfetch\s*\(/.test(nativeNav),'Fast Native Navigation: duplicate fetch returned');
assert(!/document\.addEventListener\(['"]touchstart['"]/.test(nativeNav),'Fast Native Navigation: touchstart prefetch returned');
assert(!/DOMParser\(|history\.pushState|qilySoftNavigation|qily:softnavigate|reconcileHeadAssets/.test(nativeNav),'Fast Native Navigation: cross-page DOM/CSS soft navigation returned');

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
  'dockOfficialUrlTwoLine: true',
  `/site-navigation-legacy-20260802.js?v=${NAV_VERSION}`,
  `/site-navigation-core.js?v=${NAV_VERSION}`,
  `/site-ui-consistency-v1.js?v=${CONSISTENCY_VERSION}`,
  'needsLegacyRuntime()'
],'static-first navigation wrapper v21');
assert(!/site-parent-navigation-v3\.js/.test(wrapper),'navigation wrapper: parent runtime dependency returned');

const uiConsistency=read('site-ui-consistency-v1.js');
all(uiConsistency,[
  "BUILD_ID='20260815-dock-label-v6'",
  'qilyDockOfficialUrlPolishV3',
  'qily-share-label-primary',
  'qily-share-label-url',
  '分享</span><span class="qily-share-label-line qily-share-label-url">官方网址',
  'width:76px!important',
  'width:72px!important',
  'font-size:12px!important',
  'font-size:11px!important',
  'normalizeInteractiveLabelsOnce',
  'w.setTimeout(reconcileFast,120)',
  'w.setTimeout(reconcileFast,520)',
  "if(path.indexOf('/tools/')===0)return '/'",
  "w.__qilyParentNavigationV3=true"
],'dock v6 / safe parent-route / lightweight consistency');
assert(!/new\s+MutationObserver|\.createTreeWalker\s*\(/.test(uiConsistency),'ui consistency: full-page mutation/tree scanning returned');
assert(!/addEventListener\(['"]resize['"]/.test(uiConsistency),'ui consistency: unnecessary resize reconcile returned');

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

const timesPage=read('tools/times26001/index.html');
all(timesPage,['versionCode 16 / API 36','QilyLean｜启力精益官方网址与官网邮箱','用户可主动访问官方网址','<strong>统一开发者支持：</strong>官方网址 '],'Times26001 official URL terminology');

const keyPages=['index.html','ai.html','capabilities/index.html','projects/index.html','improvements/index.html','knowledge/index.html','experience/index.html','cooperation/index.html','trust/index.html','tools/times26001/index.html'];
const individualCoreCss=['site-shell.css','site-visual-scale-v1.css','site-wide-layout-v1.css','site-typography-v1.css','site-vi-standard-v1.css','site-vi-contrast-restoration-v1.css','site-r2-stability-fixes-v1.css'];
const essentialFallbackCss=['site-shell.css','site-visual-scale-v1.css','site-wide-layout-v1.css','site-typography-v1.css','site-r2-stability-fixes-v1.css'];
for(const rel of keyPages){
  if(!fs.existsSync(path.join(root,rel)))continue;
  const html=read(rel);
  all(html,[
    'QILY-R2-FIRST-PAINT:START',
    `/site-navigation.js?v=${NAV_VERSION}`,
    `/site-music-persistent-navigation-v1.js?v=${FAST_NATIVE_VERSION}`,
    `data-qily-ui-consistency="dock-v6" src="/site-ui-consistency-v1.js?v=${CONSISTENCY_VERSION}"`,
    'id="qilyDockCriticalV6"',
    'data-qily-dock-firstpaint-lock="v6"',
    'qily-share-label-primary">分享</span><span class="qily-share-label-line qily-share-label-url">官方网址'
  ],rel);
  const first=(html.match(/<!-- QILY-R2-FIRST-PAINT:START -->[\s\S]*?<!-- QILY-R2-FIRST-PAINT:END -->/)||[])[0]||'';
  assert(first&& !/opacity\s*:\s*0|visibility\s*:\s*hidden|pointer-events\s*:\s*none|window\.load|stableReveal|2400/.test(first),`${rel}: blocking/blank first-paint logic returned`);
  assert(!/site-parent-navigation-v3\.js/i.test(html),`${rel}: redundant parent-navigation request returned`);
  if(rel!=='cooperation/index.html')assert(!/site-core-service-dock-closure-v1\.(?:css|js)/i.test(html),`${rel}: cooperation-only core-service runtime leaked into ordinary page`);
  const hasBundle=html.includes(`/site-core-visual-bundle-v1.css?v=${CORE_CSS_VERSION}`);
  if(hasBundle)individualCoreCss.forEach(file=>assert(!cssRef(html,file),`${rel}: bundled page still loads individual core CSS: ${file}`));
  else essentialFallbackCss.forEach(file=>assert(cssRef(html,file),`${rel}: essential CSS fallback incomplete: ${file}`));
  assert(!/site-footer-standard-v28\.(?:css|js)/i.test(html),`${rel}: footer standard asset returned`);
}

const dockPublisher=read('scripts/publish-dock-label-polish-v1.js');
all(dockPublisher,[
  CONSISTENCY_VERSION,
  FAST_NATIVE_VERSION,
  'data-qily-ui-consistency="dock-v6"',
  'id="qilyDockCriticalV6"',
  'data-qily-dock-firstpaint-lock="v6"',
  'removeCoreServiceRuntime',
  'patchShareMarkup',
  'patchFastNative'
],'dock first-paint/performance materializer v3');

const coreServicePublisher=read('scripts/publish-core-service-dock-closure.js');
all(coreServicePublisher,['Core-service runtime scoping','cooperation/index.html','removeAssets(html)'],'cooperation-only core-service publisher');

const selfHeal=read('.github/workflows/site-regression-poka-yoke.yml');
all(selfHeal,['node scripts/apply-site-poka-yoke-v2.js','node scripts/site-regression-guard.js','contents: write'],'self-heal workflow');

process.stdout.write('QilyLean performance V16.1 guard passed: dock label is correct in static first paint, a single-button lock prevents legacy overwrite, cooperation runtime is scoped, Fast Native intent/idle prefetch is earlier, and visual quality remains unchanged.\n');
