#!/usr/bin/env node
'use strict';

/* QilyLean atomic first-paint regression guard v8｜2026-08-17 */
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const HTML_BUILD_VERSION='20260817-atomic-first-paint-v1';
const NAV_VERSION='20260817-atomic-first-paint-v22';
const NAV_RUNTIME_VERSION='20260817-atomic-first-paint-v18';
const CONSISTENCY_VERSION='20260817-atomic-first-paint-v8';
const CORE_CSS_VERSION='20260815-core-visual-v1';
const FAST_NATIVE_VERSION='20260817-native-only-v7';
const INTERACTION_CSS_VERSION='20260817-continuity-v1';
function read(rel){return fs.readFileSync(path.join(root,rel),'utf8');}
function assert(ok,msg){if(!ok)throw new Error(msg);}
function all(source,markers,label){for(const marker of markers)assert(source.includes(marker),`${label}: missing ${marker}`);}
function cssRef(html,file){return new RegExp(`href=["'][^"']*/${file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?:\\?[^"']*)?["']`,'i').test(html);}

const nativeNav=read('site-music-persistent-navigation-v1.js');
all(nativeNav,[
  'w.__qilyFastNativeNavigationV7',
  'location.assign(url.href)',
  "mode: 'native-only-v7'",
  'domSwap: false',
  'nativeHistory: true',
  'documentPrefetch: false',
  'staleDocumentCacheRisk: false',
  'runtimeContentRewrite: false',
  'visualMutation: false'
],'Native Navigation V7');
assert(!/\bfetch\s*\(/.test(nativeNav),'Fast Native Navigation: duplicate fetch returned');
assert(!/requestIdleCallback|rel\s*=\s*['"]prefetch|warmPrimaryNav/.test(nativeNav),'Native Navigation: HTML prefetch returned');
assert(!/document\.addEventListener\(['"]touchstart['"]/.test(nativeNav),'Fast Native Navigation: touchstart prefetch returned');
assert(!/DOMParser\(|history\.pushState|qilySoftNavigation|qily:softnavigate|reconcileHeadAssets/.test(nativeNav),'Fast Native Navigation: cross-page DOM/CSS soft navigation returned');

const core=read('site-navigation-core.js');
[
  "['首页', '/']", "['能力体系', '/capabilities/']", "['代表项目', '/projects/']",
  "['改善方法', '/improvements/']", "['知识资产', '/knowledge/']", "['履历主线', '/experience/']",
  "['项目合作', '/cooperation/']", "['信任中心', '/trust/']"
].forEach(marker=>assert(core.includes(marker),`navigation core: missing ${marker}`));
assert(core.includes("if (!document.querySelector('header.qily-site-header .qily-global-nav,header.qily-global-header .qily-global-nav')) buildNavigation();"),'navigation core: static-first primary navigation guard missing');
all(core,[
  "if (value.charAt(value.length - 1) !== '/' && !/\\/[^/]+\\.[^/]+$/.test(value)) value += '/'",
  "if (path.indexOf('/projects/') === 0) return '/projects/'",
  "if (path.indexOf('/trust/') === 0 || path.indexOf('/certificates/') === 0 || path.indexOf('/legal/') === 0) return '/trust/'",
  'syncPrimaryNavCurrentState();',
  "link.setAttribute('data-qily-primary-current', 'true')"
],'navigation core: eight-module current-state synchronization');
assert(!/^\s*ensureGlobalContactFooter\(\);\s*$/m.test(core),'navigation core: repeated global contact footer call returned');
assert(!/^\s*ensureKnowledgeDocumentEnhancements\(\);\s*$/m.test(core),'navigation core: repeated document contact tail injection returned');

const legacy=read('site-navigation-legacy-20260802.js');
assert(legacy.includes(`/site-navigation-core.js?v=${NAV_RUNTIME_VERSION}`),'legacy navigation: current-state V17 core cache version missing');
const observe=(legacy.match(/function observeShell\(\)\s*\{([\s\S]*?)\n\s*\}/)||[])[1]||'';
assert(!observe.includes('MutationObserver'),'legacy navigation: mutation-loop DOM rewriting returned');

const wrapper=read('site-navigation.js');
all(wrapper,[
  "mode: 'atomic-first-paint-v22'",
  'staticHtmlAuthority: true',
  'atomicFirstPaint: true',
  'runtimeDependencyWaterfall: false',
  'dynamicContentShapers: false',
  'runtimeFooter: false',
  'runtimeSharedCssRewrite: false',
  'routeScopedLegacy: true',
  'ordinaryPagesDirectCore: true',
  'chineseWrapPolish: true',
  'dockOfficialUrlTwoLine: true',
  `/site-navigation-legacy-20260802.js?v=${NAV_RUNTIME_VERSION}`,
  `/site-navigation-core.js?v=${NAV_RUNTIME_VERSION}`,
  `/site-ui-consistency-v1.js?v=${CONSISTENCY_VERSION}`,
  'needsLegacyRuntime()'
],'atomic first-paint navigation wrapper v22');
assert(!/addEventListener\(['"]load['"],\s*appendRuntime|\[120,\s*500\]/.test(wrapper),'navigation wrapper: delayed runtime dependency returned');
assert(!/site-parent-navigation-v3\.js/.test(wrapper),'navigation wrapper: parent runtime dependency returned');

const uiConsistency=read('site-ui-consistency-v1.js');
all(uiConsistency,[
  "BUILD_ID='20260817-atomic-first-paint-v8'",
  'qilyDockOfficialUrlPolishV3',
  'qily-share-label-primary',
  'qily-share-label-url',
  '分享</span><span class="qily-share-label-line qily-share-label-url">官方网址',
  'width:76px!important',
  'width:72px!important',
  'font-size:12px!important',
  'font-size:11px!important',
  'ensurePrimaryNavCurrentStyles',
  'primaryModule(path)',
  "link.setAttribute('data-qily-primary-current','true')",
  "d.addEventListener('qily:shell-ready',reconcileFast)",
  "if(path.indexOf('/tools/')===0)return '/'",
  "w.__qilyParentNavigationV3=true"
],'dock v6 / safe parent-route / lightweight consistency');
assert(!/normalizeInteractiveLabelsOnce|w\.setTimeout\(reconcileFast|location\.reload\(\)/.test(uiConsistency),'ui consistency: delayed visible correction or reload returned');
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

const interactionContinuity=read('site-interaction-continuity-v1.css');
all(interactionContinuity,[
  '.qily-system-axis__step:is(:hover,:focus-visible)',
  'a.qily-value-card',
  '.qily-secondary-links>a',
  ':active',
  '@media(prefers-reduced-motion:reduce)'
],'sitewide interaction continuity');

const timesPage=read('tools/times26001/index.html');
all(timesPage,['versionCode 16 / API 36','QilyLean｜启力精益官方网址与官网邮箱','用户可主动访问官方网址','<strong>统一开发者支持：</strong>官方网址 '],'Times26001 official URL terminology');

const keyPages=['index.html','ai.html','capabilities/index.html','projects/index.html','improvements/index.html','knowledge/index.html','experience/index.html','cooperation/index.html','trust/index.html','tools/times26001/index.html'];
const individualCoreCss=['site-shell.css','site-visual-scale-v1.css','site-wide-layout-v1.css','site-typography-v1.css','site-vi-standard-v1.css','site-vi-contrast-restoration-v1.css','site-r2-stability-fixes-v1.css'];
const essentialFallbackCss=['site-shell.css','site-visual-scale-v1.css','site-wide-layout-v1.css','site-typography-v1.css','site-r2-stability-fixes-v1.css'];
const pageLocalCurrent={
  'index.html':'<a href="/" aria-current="page" data-qily-page-current="true" data-qily-primary-current="true">首页</a>',
  'projects/index.html':'<a href="/projects/" aria-current="page" data-qily-page-current="true" data-qily-primary-current="true">代表项目</a>'
};
for(const rel of keyPages){
  if(!fs.existsSync(path.join(root,rel)))continue;
  const html=read(rel);
  all(html,[
    'QILY-R2-FIRST-PAINT:START',
    `BUILD='${HTML_BUILD_VERSION}'`,
    `/site-navigation.js?v=${NAV_VERSION}`,
    `/site-music-persistent-navigation-v1.js?v=${FAST_NATIVE_VERSION}`,
    `/site-interaction-continuity-v1.css?v=${INTERACTION_CSS_VERSION}`,
    'id="qilyDockCriticalV6"',
    'data-qily-dock-firstpaint-lock="v7"',
    'qily-share-label-primary">分享</span><span class="qily-share-label-line qily-share-label-url">官方网址'
  ],rel);
  if(['/','index.html','capabilities/index.html','projects/index.html','improvements/index.html','knowledge/index.html','experience/index.html','cooperation/index.html','trust/index.html'].includes(rel)){
    assert(html.includes(`data-qily-ui-consistency="atomic-first-paint-v8" src="/site-ui-consistency-v1.js?v=${CONSISTENCY_VERSION}"`),`${rel}: atomic first-paint consistency runtime missing`);
  }else{
    assert(html.includes(`data-qily-ui-consistency="atomic-first-paint-v8" src="/site-ui-consistency-v1.js?v=${CONSISTENCY_VERSION}"`),`${rel}: atomic first-paint consistency fallback missing`);
  }
  if(pageLocalCurrent[rel])all(html,['id="qilyPrimaryNavPageCurrentV8"','data-qily-page-current-failsafe="v9"',pageLocalCurrent[rel]],`${rel}: page-local current-state fallback`);
  const first=(html.match(/<!-- QILY-R2-FIRST-PAINT:START -->[\s\S]*?<!-- QILY-R2-FIRST-PAINT:END -->/)||[])[0]||'';
  assert(first.includes('html.qily-stale-document body{visibility:hidden!important}')&&!/qily-r2-first-paint-pending body\{visibility:hidden|window\.load|stableReveal|2400/.test(first),`${rel}: atomic stale-document first-paint guard missing`);
  assert(!/site-parent-navigation-v3\.js/i.test(html),`${rel}: redundant parent-navigation request returned`);
  if(rel!=='cooperation/index.html')assert(!/site-core-service-dock-closure-v1\.(?:css|js)/i.test(html),`${rel}: cooperation-only core-service runtime leaked into ordinary page`);
  const hasBundle=html.includes(`/site-core-visual-bundle-v1.css?v=${CORE_CSS_VERSION}`);
  if(hasBundle)individualCoreCss.forEach(file=>assert(!cssRef(html,file),`${rel}: bundled page still loads individual core CSS: ${file}`));
  else essentialFallbackCss.forEach(file=>assert(cssRef(html,file),`${rel}: essential CSS fallback incomplete: ${file}`));
  assert(!/site-footer-standard-v28\.(?:css|js)/i.test(html),`${rel}: footer standard asset returned`);
}

const primaryPages=['index.html','capabilities/index.html','projects/index.html','improvements/index.html','knowledge/index.html','experience/index.html','cooperation/index.html','trust/index.html'];
const primaryNav=[['/','首页'],['/capabilities/','能力体系'],['/projects/','代表项目'],['/improvements/','改善方法'],['/knowledge/','知识资产'],['/experience/','履历主线'],['/cooperation/','项目合作'],['/trust/','信任中心']];
for(const rel of primaryPages){
  const html=read(rel);
  assert((html.match(/QILY-SYSTEM-AXIS:START/g)||[]).length===1,`${rel}: shared operating axis missing or duplicated`);
  assert((html.match(/<a class="qily-system-axis__step"/g)||[]).length===6,`${rel}: operating axis must expose six linked steps`);
  const header=(html.match(/<header\b[\s\S]*?<\/header>/i)||[])[0]||'';
  let cursor=-1;
  for(const [href,label] of primaryNav){
    const marker=`href="${href}"`;
    const at=header.indexOf(marker,cursor+1);
    assert(at>cursor&&new RegExp(`href="${href.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}"[^>]*>\\s*${label}\\s*<\\/a>`).test(header.slice(at)),`${rel}: primary navigation drifted at ${label}`);
    cursor=at;
  }
  assert(!/>\s*友情链接\s*</.test(header),`${rel}: friend link returned to primary navigation`);
}
assert((read('index.html').match(/<a class="qily-value-card qily-value-card-link"/g)||[]).length===3,'index.html: trust cards are not whole-card links');

const retiredBrand=read('brand-identity.js');
all(retiredBrand,['retired: true','runtimeHeroRewrite: false','runtimeNavigationRewrite: false','friendLinkInjection: false'],'retired brand-identity cache fallback');
assert(!/MutationObserver|setTimeout|innerHTML\s*=/.test(retiredBrand),'retired brand-identity fallback can still rewrite visible content');

const dockPublisher=read('scripts/publish-dock-label-polish-v1.js');
all(dockPublisher,[
  CONSISTENCY_VERSION,
  FAST_NATIVE_VERSION,
  'data-qily-ui-consistency="atomic-first-paint-v8"',
  'id="qilyDockCriticalV6"',
  'data-qily-dock-firstpaint-lock="v7"',
  'removeCoreServiceRuntime',
  'patchShareMarkup',
  'patchFastNative'
],'dock first-paint/performance materializer v3');

const coreServicePublisher=read('scripts/publish-core-service-dock-closure.js');
all(coreServicePublisher,['Core-service runtime scoping','cooperation/index.html','removeAssets(html)'],'cooperation-only core-service publisher');

const selfHeal=read('.github/workflows/site-regression-poka-yoke.yml');
all(selfHeal,['node scripts/apply-site-poka-yoke-v2.js','node scripts/site-regression-guard.js','contents: write'],'self-heal workflow');

process.stdout.write('QilyLean atomic first-paint guard passed: 461-page static HTML stays authoritative, stale documents are intercepted before body paint, and navigation no longer performs delayed content correction or HTML prefetch.\n');
