#!/usr/bin/env node
'use strict';

/* QilyLean R2 clean regression guard v3｜2026-08-12 */
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
  'margin-top:auto!important',
  '#qilyGlobalFooter',
  'body > footer',
  'opacity:0!important',
  'visibility:hidden!important'
],'R2 visual/atomic/footer guard');

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

const legacy=read('site-navigation-legacy-20260802.js');
const apply=(legacy.match(/function applyFixes\(\)\s*\{([\s\S]*?)\n\s*\}/)||[])[1]||'';
assert(!apply.includes('ensureFriendLinksNavigation();'),'legacy navigation: 友情链接 injection returned to primary nav');
const observe=(legacy.match(/function observeShell\(\)\s*\{([\s\S]*?)\n\s*\}/)||[])[1]||'';
assert(!observe.includes('MutationObserver'),'legacy navigation: mutation-loop DOM rewriting returned');

const wrapper=read('site-navigation.js');
all(wrapper,[
  "mode: 'r2-static-first-v20'",
  'staticHtmlAuthority: true',
  'dynamicContentShapers: false',
  'runtimeFooter: false',
  'runtimeSharedCssRewrite: false',
  '/site-navigation-legacy-20260802.js?v=20260813-r2-clean-v4'
],'static-first navigation wrapper');
assert(!/(?:site-information-architecture-v1|site-brand-trust-v1|site-trust-conversion-v2|site-visual-closure-v1|site-visual-closure-v2|site-text-contrast-audit-v1)\.js/.test(wrapper),'navigation wrapper: dynamic content shaper returned');
assert(!/Technical & Project Contact|qilyGlobalFooter|qilyGlobalContactFooter/.test(wrapper),'navigation wrapper: footer logic returned');

const footerCompat=read('site-footer-standard-v28.js');
all(footerCompat,['footer compatibility cleanup','严禁再创建任何页尾'],'footer compatibility cleanup');
assert(!/function\s+ensureFooter|function\s+footerMarkup|Technical & Project Contact/.test(footerCompat),'footer compatibility file: injector logic returned');

const keyPages=['index.html','ai.html','capabilities/index.html','projects/index.html','improvements/index.html','knowledge/index.html','experience/index.html','cooperation/index.html','trust/index.html'];
for(const rel of keyPages){
  if(!fs.existsSync(path.join(root,rel)))continue;
  const html=read(rel);
  all(html,[
    'QILY-R2-FIRST-PAINT:START',
    '/site-r2-stability-fixes-v1.css?v=20260813-r2-clean-v4',
    '/site-navigation.js?v=20260813-r2-clean-v4',
    '/site-music-persistent-navigation-v1.js?v=20260812-fast-native-v5',
    'QILY-R2-PRIMARY-CONTRAST-NAV:START'
  ],rel);
  assert(!/site-footer-standard-v28\.(?:css|js)/i.test(html),`${rel}: footer standard asset returned`);
  assert(!/<footer\b/i.test(html),`${rel}: visible footer returned`);
  assert(!/(?:site-information-architecture-v1|site-brand-trust-v1|site-trust-conversion-v2|site-visual-closure-v1|site-visual-closure-v2|site-text-contrast-audit-v1)\.js/i.test(html),`${rel}: dynamic content shaper returned`);
  assert(html.includes("w.addEventListener('load',stableReveal,{once:true})"),`${rel}: atomic load reveal missing`);
  assert(!/<script\b[^>]*src=["'][^"']*\/homepage-music(?:-v5)?\.js/i.test(html),`${rel}: deprecated background music script returned`);
  const nav=html.match(/<nav\b[^>]*(?:qily-global-nav|site-nav)[^>]*>([\s\S]*?)<\/nav>/i);
  if(nav){
    all(nav[1],['首页','履历主线','能力体系','改善方法','代表项目','信任中心','项目合作','知识资产'],`${rel} primary nav`);
    ['QilyLean AI','能力画像','改善经验','知识分享','行走印记','友情链接'].forEach(old=>assert(!nav[1].includes(old),`${rel}: retired/secondary primary-nav item returned: ${old}`));
  }
}

const cleaner=read('scripts/publish-r2-clean-runtime-v3.js');
all(cleaner,['footer and dynamic content shapers removed','site-footer-standard-v28','site-information-architecture-v1','20260813-r2-clean-v4'],'R2 clean materializer');

const career=read('experience/index.html');
all(career,['QILY-STATIC-CAREER-BASELINE:v1','id="career-2019-2025"','id="career-2006-2009"'],'experience static baseline');

const selfHeal=read('.github/workflows/site-regression-poka-yoke.yml');
all(selfHeal,['node scripts/apply-site-poka-yoke-v2.js','node scripts/site-regression-guard.js','contents: write'],'self-heal workflow');

process.stdout.write('QilyLean R2 clean regression guard passed: atomic first paint, static HTML authority, no dynamic CTA shapers, no visible footer, native-prefetch V5 and R2 navigation are intact.\n');
