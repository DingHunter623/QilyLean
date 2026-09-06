#!/usr/bin/env node
'use strict';

/* Homepage / Dock snapback compatibility gate | V33 | Dock V5.8 fixed-bottom compact | 2026-09-06 */
const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8'),must=(s,t,m)=>{if(!s.includes(t))throw new Error(`${m}: missing ${t}`)},forbid=(s,t,m)=>{if(s.includes(t))throw new Error(`${m}: forbidden ${t}`)};
const nav=read('site-navigation.js'),dock=read('site-dock-share-runtime-v1.js'),route=read('site-contact-route-v1.js'),header=read('site-header-axis-v1.css'),css=read('site-interaction-semantics-v1.css'),js=read('site-interaction-semantics-v1.js'),safe=read('site-translation-safe-runtime-v1.js'),components=read('site-visual-components-v1.css'),home=read('index.html'),mat=read('scripts/materialize-global-language-v3.js');

must(nav,'navigation runtime v45','Navigation V45');must(nav,'r7DockSingleAuthority:true','Navigation Dock split');
must(dock,'Floating Dock Authoritative Runtime V5.8','Dock V5.8');must(dock,'__qilyFloatingDockUnifiedV58','Dock V58 guard');must(dock,"ORDER=['home','top','back','previous','search','current','contact']",'Dock seven-action order');must(dock,'setOwnedLabel','Dock label owner');must(dock,'position:fixed!important','Dock fixed-bottom position');must(dock,'overflow-x:visible!important','Mobile Dock horizontal scrolling disabled');must(dock,'mobile-fixed-bottom-compact-navigation','Mobile Dock fixed-bottom marker');must(dock,"w.open(url,'_blank','noopener,noreferrer')",'Contact new tab');must(dock,'function isExcluded(){return false;}','Public Dock coverage');forbid(dock,"mask.classList.add('show')",'Dock modal');must(dock,'scroll-snap-type:none!important','Mobile Dock scroll snapping disabled');must(dock,'touch-action:pan-y pinch-zoom!important','Mobile Dock vertical gesture ownership');
must(route,'Contact Route V13.4','Contact V13.4');must(route,'__qilyFloatingDockUnifiedV54','Contact backward compatibility guard');
must(header,'Global Header Axis V1.2','Header Axis V1.2');must(header,'overflow-x:scroll!important','Mobile nav scroll');must(header,'white-space:nowrap!important','Complete nav labels');
must(css,'Interaction Semantics V1.4','Semantics CSS');must(css,'--qily-nav-rail-thumb:#0f4b5a','VI deep-teal rail');must(css,'.qily-primary-nav-scroll-rail','Persistent rail');must(css,'.brief-action-strip>span','Static vocabulary');forbid(css,'content:"回\\A顶部"','Duplicate top label');forbid(css,'content:"回\\A上一层"','Duplicate back label');
must(js,'Interaction Semantics Runtime V1.7','Semantics runtime');must(js,'__qilyInteractionSemanticsV17','Semantics V17 marker');must(js,"rail.type='range'",'Native range rail');forbid(js,'qily-primary-nav-scroll-thumb','Retired synthetic rail thumb');
must(safe,'Google Translate Header Runtime V1.4','Google Translate V1.4');must(safe,'__qilyGoogleTranslateElementInitialized','Single translation initialization');must(safe,"addOption(select,MORE_VALUE,'其他')",'Primary more-language entry');must(safe,'function populateMoreLanguages()','Google-supported more-language picker');must(safe,'data-qily-header-utility','Translation header utility');forbid(safe,'includedLanguages:','Expanded translator must not restrict Google languages');
must(components,'input.qily-primary-nav-scroll-rail[type="range"]','Native range visual');must(components,'::-webkit-slider-thumb','WebKit range thumb');must(components,'data-qily-header-utility="translation"','Translation utility layout');must(components,'-webkit-text-fill-color:#fff!important','Evidence grade white letter');

must(mat,"const BASELINE_VERSION='20260831-google-translate-single-runtime-v32'",'V32 baseline');must(mat,"const CONTACT_ROUTE_JS='/site-contact-route-v1.js?v=20260829-dock-functional-public-v134'",'Contact V134 owner');must(mat,"const DOCK_SHARE='/site-dock-share-runtime-v1.js?v=20260906-authority-v58-mobile-swipe-fixed-bottom&patch=20260906-mobile-compact-fixed-r2'",'Dock V58 owner');must(mat,"const TRANSLATION_SAFE_JS='/site-translation-safe-runtime-v1.js?v=20260901-google-translate-single-runtime-v16'",'Google Translate V1.4 owner');must(mat,"const TRANSLATION_PUBLIC_CSS='/site-translation-public-ui-v1.css?v=20260901-google-translate-mobile-ui-v16'",'Google Translate UI owner');must(mat,"const VISUAL_COMPONENTS_CSS='/site-visual-components-v1.css?v=20260831-unified-components-v29-native-range'",'Visual components owner');must(mat,"const INTERACTION_SEMANTICS_JS='/site-interaction-semantics-v1.js?v=20260831-r11-semantics-v17-native-range'",'Semantics V1.7 owner');must(mat,"const FINAL_INTEGRITY_CSS='/site-header-project-integrity-v2.css?v=20260831-project-grade-readability-v3'",'Project grade owner');
const ready=tokens=>tokens.some(token=>home.includes(token)||mat.includes(token));
const resources=[
  [['/site-navigation.js?v=20260828-r7-navigation-v45'],'Navigation'],
  [['/site-dock-share-runtime-v1.js?v=20260906-authority-v58-mobile-swipe-fixed-bottom'],'Dock'],
  [['/site-contact-route-v1.js?v=20260829-dock-functional-public-v134'],'Contact'],
  [['/site-header-axis-v1.css?v=20260901-primary-navigation-native-scroll-v8'],'Header'],
  [['/site-translation-safe-runtime-v1.js?v=20260901-google-translate-single-runtime-v16'],'Safe translation'],
  [['/site-translation-public-ui-v1.css?v=20260901-google-translate-mobile-ui-v16'],'Translation public UI'],
  [['/site-visual-components-v1.css?v=20260831-unified-components-v29-native-range'],'Visual components'],
  [['/site-interaction-semantics-v1.css?v=20260830-r11-semantics-v14-visual-v3-vi-teal'],'Semantics CSS'],
  [['/site-interaction-semantics-v1.js?v=20260831-r11-semantics-v17-native-range'],'Semantics JS'],
  [['/site-header-project-integrity-v2.css?v=20260831-project-grade-readability-v3'],'Project grades']
];
for(const [tokens,label] of resources)if(!ready(tokens))throw new Error(`${label} resource neither materialized nor queued`);
must(home,'<!-- QILY-AIRCRAFT-BRAND-HERO-V1:START -->','Aircraft hero');must(home,'font-size:clamp(40px,3.6vw,52px)!important','Homepage headline tier');
console.log('PASS: V33 homepage guard protects aircraft hero, VI deep-teal native-range navigation, Google Translate V1.4, readable project grades and authoritative fixed-bottom Dock V5.8 with compact seven-column mobile navigation.');