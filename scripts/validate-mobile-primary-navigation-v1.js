#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const must=(s,t,m)=>{if(!s.includes(t))throw new Error(`${m}: missing ${t}`)};
const forbid=(s,t,m)=>{if(s.includes(t))throw new Error(`${m}: forbidden ${t}`)};

const header=read('site-header-axis-v1.css');
const mat=read('scripts/materialize-global-language-v3.js');
const nav=read('site-navigation.js');
const semCss=read('site-interaction-semantics-v1.css');
const semJs=read('site-interaction-semantics-v1.js');
const components=read('site-visual-components-v1.css');
const visual=read('site-visual-system-v2.css');
const containment=read('site-responsive-containment-v1.css');
const shell=read('site-ui-consistency-v1.js');
const safe=read('site-translation-safe-runtime-v1.js');

must(header,'Global Header Axis V1.2','Header axis');
must(header,'--qily-primary-nav-font-size:20px','Nav 20px');
must(header,'overflow-x:auto!important','Desktop scroll');
must(header,'overflow-x:scroll!important','Mobile scroll');
must(header,'white-space:nowrap!important','Full nav labels');
must(header,'touch-action:pan-x pan-y!important','Touch panning');
must(header,'-webkit-overflow-scrolling:touch!important','iOS scrolling');
must(header,'-webkit-mask-image:none!important','No mobile mask');

must(semCss,'Interaction Semantics V1.4','Semantics CSS');
must(semJs,'Interaction Semantics Runtime V1.7','Semantics V1.7');
must(semJs,'__qilyInteractionSemanticsV17','Semantics V17 marker');
must(semJs,'installPrimaryNavRail','Rail installer');
must(semJs,'installPrimaryNavDragGuard','Mouse drag click guard');
must(semJs,"rail.type='range'",'Native range input');
must(semJs,"rail.addEventListener('pointerdown'",'Range pointer down');
must(semJs,"rail.addEventListener('pointermove'",'Range pointer move');
must(semJs,'function setFromPointer(event)','Direct pointer mapping');
must(semJs,"event.pointerType&&event.pointerType!=='mouse'",'Touch/pen nav gestures stay native');
must(semJs,'一级导航左右滑动条','Rail accessibility label');
forbid(semJs,'qily-primary-nav-scroll-thumb','Legacy synthetic thumb');

must(components,'input.qily-primary-nav-scroll-rail[type="range"]','Range visual component');
must(components,'--qily-nav-range-thumb-width','Adaptive range thumb width');
must(components,'::-webkit-slider-thumb','iOS/WebKit range thumb');
must(components,'::-moz-range-thumb','Firefox range thumb');
must(components,'background:var(--qily-nav-rail-thumb,#0f4b5a)!important','VI deep-teal thumb');

must(nav,'navigation runtime v45','Navigation V45');
must(nav,'mobilePrimaryNavigationMayShrinkTypography:false','No mobile shrink');

must(safe,'Google Translate Header Runtime V1.3','Google translation V1.3');
must(safe,'non-blocking Android closure','Non-blocking translation closure');
must(safe,'only public translation lifecycle owner','Translator outside scrolling nav');
must(safe,'data-qily-header-utility','Translation header utility marker');
must(safe,'translate.google.com/translate_a/element.js','Google Translate embed');
must(safe,'loadGoogleAfterPage','Post-load translation scheduling');
forbid(safe,'createTreeWalker','Retired page-wide translation scan');
forbid(safe,'stabilizeMobileNav','Translator must not own mobile navigation');
forbid(safe,'matchMedia','Translator must not branch on navigation viewport');
if(/new\s+MutationObserver\s*\(/.test(safe))throw new Error('Translation MutationObserver forbidden');

must(mat,"const BASELINE_VERSION='20260831-google-translate-single-runtime-v32'",'V32 baseline');
must(mat,"const INTERACTION_SEMANTICS_JS='/site-interaction-semantics-v1.js?v=20260831-r11-semantics-v17-native-range'",'V17 cache');
must(mat,"const TRANSLATION_SAFE_JS='/site-translation-safe-runtime-v1.js?v=20260831-google-translate-single-runtime-v14'",'Google translation cache');
must(mat,"const TRANSLATION_PUBLIC_CSS='/site-translation-public-ui-v1.css?v=20260831-google-translate-native-ui-v15'",'Google native UI cache');
must(mat,"const VISUAL_COMPONENTS_CSS='/site-visual-components-v1.css?v=20260831-unified-components-v29-native-range'",'Native range visual cache');
must(mat,"const CONSISTENCY='/site-ui-consistency-v1.js?v=20260831-r7-single-responsibility-v11-safe-translation'",'Shell V11 cache');

must(shell,'__qilyUiSingleResponsibilityV11','Shell V11');
forbid(shell,'function uninstallTranslationArtifacts()','Shell translator removal');

must(visual,'@media (min-width:768px) and (max-width:1179px)','Tablet nav composition');
must(visual,'@media (max-width:767px)','Mobile nav composition');
must(containment,'@media (max-width:767px)','Mobile containment composition');
must(containment,'overscroll-behavior-inline:contain','Local mobile overflow containment');

console.log('PASS: first-level navigation uses the V1.7 native range rail for Android/iPhone while post-load Google Translate V1.3 stays a separate header utility.');
