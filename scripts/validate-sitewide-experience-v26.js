#!/usr/bin/env node
'use strict';

/* V26 experience-compatibility gate on the V32 public baseline.
 * 2026-09-06: Dock presentation contract migrated from circular V5.5 to
 * rectangular in-flow V5.6 while retaining the surrounding V32 baseline.
 */
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const must=(source,token,label)=>{if(!source.includes(token))throw new Error(`${label}: missing ${token}`)};
const forbid=(source,token,label)=>{if(source.includes(token))throw new Error(`${label}: forbidden ${token}`)};

const header=read('site-header-axis-v1.css');
must(header,'Global Header Axis V1.2','Header');must(header,'justify-content:flex-start!important','Header reachable origin');must(header,'content:none!important','Header spacer removal');must(header,'padding:0 0 18px!important','Header text-to-rail safety gap');

const semantics=read('site-interaction-semantics-v1.js');
must(semantics,'Interaction Semantics Runtime V1.7','Navigation runtime');must(semantics,'__qilyInteractionSemanticsV17','Navigation runtime marker');must(semantics,"rail.type='range'",'Native navigation range');must(semantics,'installPrimaryNavDragGuard','Desktop navigation drag guard');must(semantics,'suppressUntil=w.performance.now()+320','Navigation click suppression');must(semantics,'nav.scrollLeft=startScroll-dx','Desktop direct drag');forbid(semantics,'qily-primary-nav-scroll-thumb','Retired synthetic rail thumb');

const dock=read('site-dock-share-runtime-v1.js');
must(dock,'Floating Dock Authoritative Runtime V5.8','Dock runtime');must(dock,'__qilyFloatingDockUnifiedV58','Dock runtime marker');must(dock,"ORDER=['home','top','back','previous','search','current','contact']",'Dock seven-action order');for(const label of ['首页','顶部','上一层级','上一网页','本站搜索','分享当前','联系我们'])must(dock,label,`Dock action ${label}`);must(dock,'grid-template-columns:repeat(7,minmax(0,1fr))!important','Dock desktop module grid');must(dock,'border-radius:8px!important','Dock rectangular geometry');must(dock,'overflow-x:visible!important','Mobile Dock horizontal scrolling disabled');must(dock,'scroll-snap-type:none!important','Mobile Dock scroll snapping disabled');must(dock,'touch-action:pan-y pinch-zoom!important','Mobile Dock vertical gesture ownership');must(dock,'mobile-fixed-bottom-compact-navigation','Dock mobile fixed-bottom layout');must(dock,'position:fixed!important','Dock fixed-bottom placement');must(dock,'function isExcluded(){return false;}','Canonical Dock public-page coverage');forbid(dock,'border-radius:50%!important','Retired circular Dock geometry');

/* Pure DDZ V155 intentionally owns a lightweight bundled fast shell. The old V153
 * landscape stylesheet/runtime is no longer the public route authority and must not
 * be used as a sitewide regression token. */
const ddzHtml=read('tools/pure-ddz/index.html');
forbid(ddzHtml,'name="screen-orientation"','DDZ forced orientation');forbid(ddzHtml,'name="x5-orientation"','DDZ forced X5 orientation');forbid(ddzHtml,'qilyPureDdzR8ClosureV128','DDZ retired closure');must(ddzHtml,'Promise.all(chain.map','DDZ parallel resource download');must(ddzHtml,'},1800);','DDZ early interface reveal');must(ddzHtml,'20260903-ddz-fast-knowledge-v155','DDZ V155 cache');must(ddzHtml,'data-qily-ddz-fast-shell="v155"','DDZ V155 fast shell');must(ddzHtml,'data-qily-ddz-core="v158"','DDZ static bundled stylesheet');must(ddzHtml,'window.__PURE_DDZ_STYLE_READY__=Promise.resolve();','DDZ static style readiness');forbid(ddzHtml,"loadStyle('css/ddz-core-v155.css')",'DDZ retired dynamic stylesheet paint');must(ddzHtml,"const chain=['js/ddz-core-v155.js'];",'DDZ bundled core');must(ddzHtml,'/site-dock-share-runtime-v1.js?','DDZ canonical Dock runtime');
const ddzCoreCss=read('tools/pure-ddz/game/css/ddz-core-v155.css');must(ddzCoreCss,'QilyLean','DDZ bundled CSS identity');forbid(ddzCoreCss,'#floatDock','DDZ bundled layout Dock ownership');
const ddzCoreJs=read('tools/pure-ddz/game/js/ddz-core-v155.js');must(ddzCoreJs,'QilyLean','DDZ bundled JS identity');

const translation=read('site-translation-safe-runtime-v1.js');
must(translation,'Google Translate Header Runtime V1.4','Translation runtime');must(translation,'__qilyGoogleTranslateElementInitialized','Single translation initialization');must(translation,'function recoverRetainedControlOnce()','Bounded translation recovery');must(translation,"addOption(select,MORE_VALUE,'其他')",'Primary more-language entry');must(translation,'function populateMoreLanguages()','Google-supported more-language picker');must(translation,'data-qily-header-utility','Translation header utility');must(translation,'translate.google.com/translate_a/element.js','Official Google element');forbid(translation,'includedLanguages:','Expanded translator must not restrict Google languages');forbid(translation,'createTreeWalker','Page translation scan');if(/new\s+MutationObserver\s*\(/.test(translation))throw new Error('Translation MutationObserver forbidden');

const visual=read('site-visual-system-v2.css');for(const token of ['--qv2-forest:#0f4b5a','--qv2-gold:#caa15f','--qv2-axis:1560px','width:52px!important','width:50px!important'])must(visual,token,'VI authority');
const integrity=read('site-header-project-integrity-v2.css');must(integrity,'Header + Project Integrity V3','Project integrity');must(integrity,'font-size:26px!important','List grade floor');must(integrity,'font-size:29px!important','Detail grade floor');
const components=read('site-visual-components-v1.css');must(components,'Unified Visual Components V1 | V29','Unified components');must(components,'::-webkit-slider-thumb','WebKit native rail thumb');must(components,'grid-template-areas:"qily-brand qily-translation" "qily-navigation qily-navigation"!important','Mobile translation/nav separation');must(components,'color:#fff!important','Evidence letter contrast');

const materializer=read('scripts/materialize-global-language-v3.js');for(const token of ['20260831-google-translate-single-runtime-v32','20260901-primary-navigation-native-scroll-v8','20260906-authority-v58-mobile-swipe-fixed-bottom','20260831-r11-semantics-v17-native-range','20260830-r11-semantics-v14-visual-v3-vi-teal','20260901-google-translate-single-runtime-v16','20260901-google-translate-mobile-ui-v16','20260831-r7-single-responsibility-v11-safe-translation','20260831-unified-components-v29-native-range','20260831-project-grade-readability-v3','20260830-visual-system-v2-r7','20260903-ddz-fast-knowledge-v155'])must(materializer,token,'Materializer');forbid(materializer,'DDZ_CLOSURE_CSS','Retired DDZ closure materialization');forbid(materializer,'const PUBLIC_UI_JS=','Retired translation picker active injection');

console.log('PASS: V26 compatibility remains intact on V32: official sticky Header, native-range navigation, Google Translate V1.4, rectangular fixed-bottom compact Dock V5.8, DDZ V155 isolated fast shell and unified VI authority.');