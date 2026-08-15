#!/usr/bin/env node
'use strict';

/* QilyLean R2 clean regression guard v6｜2026-08-15 PERFORMANCE V15 */
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const R2_VERSION='20260813-r2-clean-v4';
const NAV_VERSION='20260815-performance-v15';
const PARENT_VERSION='20260815-performance-v4';
const CONSISTENCY_VERSION='20260815-performance-v2';
function read(rel){return fs.readFileSync(path.join(root,rel),'utf8');}
function assert(ok,msg){if(!ok)throw new Error(msg);}
function all(source,markers,label){for(const marker of markers)assert(source.includes(marker),`${label}: missing ${marker}`);}

const r2Css=read('site-r2-stability-fixes-v1.css');
all(r2Css,[
  '.qily-section-actions a.primary',
  '-webkit-text-fill-color:#fff!important',
  '.qily-trust-wrap > .qily-value-card',
  'margin-top:auto!important',
  '#qilyGlobalFooter',
  'body > footer'
],'R2 visual/footer guard');

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
assert(!/^\s*ensureGlobalContactFooter\(\);\s*$/m.test(core),'navigation core: repeated global contact footer call returned');
assert(!/^\s*ensureKnowledgeDocumentEnhancements\(\);\s*$/m.test(core),'navigation core: repeated document contact/email tail call returned');
all(core,[
  "var HOME_URL = 'https://qilylean.com';",
  'function normalizePublicUrl(value)',
  'var url = normalizePublicUrl(location.href);'
],'public URL output runtime');

const legacy=read('site-navigation-legacy-20260802.js');
const apply=(legacy.match(/function applyFixes\(\)\s*\{([\s\S]*?)\n\s*\}/)||[])[1]||'';
assert(!apply.includes('ensureFriendLinksNavigation();'),'legacy navigation: 友情链接 injection returned to primary nav');
const observe=(legacy.match(/function observeShell\(\)\s*\{([\s\S]*?)\n\s*\}/)||[])[1]||'';
assert(!observe.includes('MutationObserver'),'legacy navigation: mutation-loop DOM rewriting returned');
assert(legacy.includes(`/site-navigation-core.js?v=${NAV_VERSION}`),'legacy navigation: performance V15 core cache version missing');

const wrapper=read('site-navigation.js');
all(wrapper,[
  "mode: 'r2-static-first-v20'",
  'staticHtmlAuthority: true',
  'dynamicContentShapers: false',
  'runtimeFooter: false',
  'runtimeSharedCssRewrite: false',
  `/site-navigation-legacy-20260802.js?v=${NAV_VERSION}`,
  `/site-parent-navigation-v3.js?v=${PARENT_VERSION}`,
  `/site-ui-consistency-v1.js?v=${CONSISTENCY_VERSION}`,
  'loadConsistencyGuard()'
],'static-first navigation wrapper');
assert(!/(?:site-information-architecture-v1|site-brand-trust-v1|site-trust-conversion-v2|site-visual-closure-v1|site-visual-closure-v2|site-text-contrast-audit-v1)\.js/.test(wrapper),'navigation wrapper: dynamic content shaper returned');
assert(!/Technical & Project Contact|qilyGlobalFooter|qilyGlobalContactFooter/.test(wrapper),'navigation wrapper: footer logic returned');

const uiConsistency=read('site-ui-consistency-v1.js');
all(uiConsistency,[
  "share.innerHTML='分享<br>官方网址'",
  "if(path.indexOf('/tools/')===0)return '/'",
  "if(/^\\/legal\\/times26001\\/(?:privacy|terms)\\/$/.test(path))return '/tools/times26001/'",
  "if(path==='/app-support/')return '/tools/times26001/'",
  "w.__qilyParentNavigationV3=true",
  "classList.remove('qily-shell-pending','qily-r2-first-paint-pending')"
],'official URL terminology / safe parent-route runtime');
assert(!/MutationObserver|createTreeWalker|TreeWalker/.test(uiConsistency),'ui consistency: full-page mutation/tree scanning returned');
assert(!uiConsistency.includes("return clean.slice(0,slash+1)"),'parent-route guard: unsafe directory-derived fallback returned');

const parent=read('site-parent-navigation-v3.js');
all(parent,[
  '悬浮栏父级导航轻量版',
  "classList.remove('qily-shell-pending','qily-r2-first-paint-pending')",
  "if(path.indexOf('/tools/')===0)return '/'",
  'function markCurrentNav()'
],'lightweight parent navigation');
assert(!/MutationObserver|rewriteHome\(|buildAxis\(|qily-system-axis__steps|\[80,260,700,1600,3200\]/.test(parent),'parent navigation: heavy runtime DOM rewrite returned');

const timesPage=read('tools/times26001/index.html');
all(timesPage,[
  'versionCode 16 / API 36',
  'QilyLean｜启力精益官方网址与官网邮箱',
  '用户可主动访问官方网址',
  '<strong>统一开发者支持：</strong>官方网址 '
],'Times26001 official URL terminology');
assert(!timesPage.includes('<strong>统一开发者支持：</strong>官网 '),'Times26001: generic 官网 label returned in developer support');
assert(!timesPage.includes('versionCode 10 / API 36'),'Times26001: stale versionCode 10 returned');

const footerCompat=read('site-footer-standard-v28.js');
all(footerCompat,['footer compatibility cleanup','严禁再创建任何页尾'],'footer compatibility cleanup');
assert(!/function\s+ensureFooter|function\s+footerMarkup|Technical & Project Contact/.test(footerCompat),'footer compatibility file: injector logic returned');

const keyPages=['index.html','ai.html','capabilities/index.html','projects/index.html','improvements/index.html','knowledge/index.html','experience/index.html','cooperation/index.html','trust/index.html'];
for(const rel of keyPages){
  if(!fs.existsSync(path.join(root,rel)))continue;
  const html=read(rel);
  all(html,[
    'QILY-R2-FIRST-PAINT:START',
    `/site-r2-stability-fixes-v1.css?v=${R2_VERSION}`,
    `/site-navigation.js?v=${NAV_VERSION}`,
    '/site-music-persistent-navigation-v1.js?v=20260812-fast-native-v5',
    'QILY-R2-PRIMARY-CONTRAST-NAV:START'
  ],rel);
  const first=(html.match(/<!-- QILY-R2-FIRST-PAINT:START -->[\s\S]*?<!-- QILY-R2-FIRST-PAINT:END -->/)||[])[0]||'';
  assert(first,`${rel}: first-paint compatibility block missing`);
  assert(!/opacity\s*:\s*0|visibility\s*:\s*hidden|pointer-events\s*:\s*none|window\.load|stableReveal|2400/.test(first),`${rel}: blocking/blank first-paint logic returned`);
  if(/site-parent-navigation-v3\.js\?v=/i.test(html))assert(html.includes(`/site-parent-navigation-v3.js?v=${PARENT_VERSION}`),`${rel}: lightweight parent cache version missing`);
  assert(!/site-footer-standard-v28\.(?:css|js)/i.test(html),`${rel}: footer standard asset returned`);
  assert(!/<footer\b/i.test(html),`${rel}: visible footer returned`);
  assert(!/(?:site-information-architecture-v1|site-brand-trust-v1|site-trust-conversion-v2|site-visual-closure-v1|site-visual-closure-v2|site-text-contrast-audit-v1)\.js/i.test(html),`${rel}: dynamic content shaper returned`);
  assert(!/<script\b[^>]*src=["'][^"']*\/homepage-music(?:-v5)?\.js/i.test(html),`${rel}: deprecated background music script returned`);
  const nav=html.match(/<nav\b[^>]*(?:qily-global-nav|site-nav)[^>]*>([\s\S]*?)<\/nav>/i);
  if(nav){
    all(nav[1],['首页','履历主线','能力体系','改善方法','代表项目','信任中心','项目合作','知识资产'],`${rel} primary nav`);
    ['QilyLean AI','能力画像','改善经验','知识分享','行走印记','友情链接'].forEach(old=>assert(!nav[1].includes(old),`${rel}: retired/secondary primary-nav item returned: ${old}`));
  }
}

const cleaner=read('scripts/publish-r2-clean-runtime-v3.js');
all(cleaner,['static first paint is non-blocking','site-footer-standard-v28','site-information-architecture-v1',R2_VERSION,NAV_VERSION,PARENT_VERSION,CONSISTENCY_VERSION],'R2 clean performance materializer');

const career=read('experience/index.html');
all(career,['QILY-STATIC-CAREER-BASELINE:v1','id="career-2019-2025"','id="career-2006-2009"'],'experience static baseline');

const selfHeal=read('.github/workflows/site-regression-poka-yoke.yml');
all(selfHeal,['node scripts/apply-site-poka-yoke-v2.js','node scripts/site-regression-guard.js','contents: write'],'self-heal workflow');

process.stdout.write('QilyLean R2 performance guard passed: static first paint is immediate, navigation runtimes are lightweight, no mutation loops, cache V15 is active, official-URL terminology and safe parent routes are protected.\n');
