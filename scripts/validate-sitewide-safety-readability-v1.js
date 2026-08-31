#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const must=(s,t,m)=>{if(!s.includes(t))throw new Error(`${m}: missing ${t}`)};
const forbid=(s,t,m)=>{if(s.includes(t))throw new Error(`${m}: forbidden ${t}`)};

const shell=read('site-ui-consistency-v1.js');
must(shell,'__qilyUiSingleResponsibilityV11','UI single responsibility V11');
must(shell,'single-responsibility-v11-safe-translation','Safe-translation shell build');
forbid(shell,'function uninstallTranslationArtifacts()','Shell must not own translation removal');
forbid(shell,'normalizeDockButton','Shell Dock mutation');
forbid(shell,'dockIconMarkup','Shell Dock icons');

const safe=read('site-translation-safe-runtime-v1.js');
must(safe,'Safe In-Page Translation V7','Translation V7');
must(safe,"runtime:'safe-inpage-v7'",'Translation runtime identity');
must(safe,"data-qily-header-utility','translation'",'Translation header utility');
must(safe,'translation is a header utility sibling','Translation/nav separation contract');
must(safe,'automaticTranslation:false','Translation opt-in contract');
must(safe,'noExternalProxy:true','No external page proxy');
forbid(safe,'translate.google.com','External translation redirect');

const components=read('site-visual-components-v1.css');
must(components,'Unified Visual Components V1','Unified visual components');
must(components,'qily-project-evidence-grade','Project evidence component');
must(components,'-webkit-text-fill-color:#fff!important','Grade letter forced contrast');
must(components,"qilylean-logo.svg?v=20260724-logo-red-dot-v5",'Logo positive-feedback protection');
must(components,'data-qily-header-utility="translation"','Translation utility layout');
must(components,'input.qily-primary-nav-scroll-rail[type="range"]','Native range rail styling');
must(components,'::-webkit-slider-thumb','WebKit range thumb');
must(components,'::-moz-range-thumb','Gecko range thumb');

const dock=read('site-dock-share-runtime-v1.js');
must(dock,'Floating Dock Authoritative Runtime V5.4','Dock V5.4');
must(dock,'__qilyFloatingDockUnifiedV54','Dock V54 guard');
must(dock,"ORDER=['home','top','back','search','current','contact']",'Dock order');
must(dock,'setOwnedLabel','Dock label owner');
must(dock,'function openContactPage()','Full contact action');
must(dock,"w.open(url,'_blank','noopener,noreferrer')",'Contact new tab');
forbid(dock,"mask.classList.add('show')",'Dock modal');
if(/new\s+MutationObserver\s*\(/.test(dock))throw new Error('Dock MutationObserver forbidden');

const route=read('site-contact-route-v1.js');
must(route,'Site Shell Recovery + Contact Route V13.4','Contact V13.4');
must(route,'__qilyFloatingDockUnifiedV54','Contact Dock V54 guard');

const header=read('site-header-axis-v1.css');
must(header,'Global Header Axis V1.2','Header Axis');
must(header,'overflow-x:auto!important','Desktop nav scroll');
must(header,'overflow-x:scroll!important','Mobile nav scroll');
must(header,'white-space:nowrap!important','Complete nav text');

const semCss=read('site-interaction-semantics-v1.css'),semJs=read('site-interaction-semantics-v1.js');
must(semCss,'Interaction Semantics V1.4','Semantics CSS');
must(semCss,'--qily-nav-rail-thumb:#0f4b5a','VI deep-teal rail token');
must(semCss,'.brief-action-strip>span','Static brief tokens');
must(semJs,'Interaction Semantics Runtime V1.7','Semantics runtime V1.7');
must(semJs,'__qilyInteractionSemanticsV17','Semantics V17 marker');
must(semJs,"rail.type='range'",'Native range rail');
must(semJs,'function setFromPointer(event)','Direct pointer-to-scroll mapping');
must(semJs,"event.pointerType&&event.pointerType!=='mouse'",'Touch/pen native-nav guard');
must(semJs,'PROJECT_EVIDENCE','Evidence map');

const career=read('site-early-career-history-v1.js'),careerCss=read('site-early-career-history-v1.css');
must(career,"var VERSION = 'v5'",'Career V5');
must(careerCss,'--qily-career-anchor-offset','Anchor CSS var');

const ddz=read('tools/pure-ddz/game/css/r8-closure-v128.css');
must(ddz,'Pure DDZ R12 Closure V132','DDZ R12');
must(ddz,'justify-content:safe center!important','Safe centered hand');

const mat=read('scripts/materialize-global-language-v3.js');
must(mat,"const BASELINE_VERSION='20260831-safe-translation-nav-range-v30'",'V30 baseline identity');
must(mat,"VISUAL_COMPONENTS_CSS='/site-visual-components-v1.css?v=20260831-unified-components-v29-native-range'",'Visual components owner');
must(mat,"TRANSLATION_SAFE_JS='/site-translation-safe-runtime-v1.js?v=20260831-safe-inpage-v7-header-utility'",'Safe translation owner');
must(mat,'20260831-r11-semantics-v17-native-range','Semantics V17 owner');
must(mat,'20260831-r7-single-responsibility-v11-safe-translation','Shell V11 owner');
must(mat,'data-qily-translation-safe-direct="v7"','Translation V7 materialization marker');
must(mat,'data-qily-interaction-semantics-direct="v1.7"','Semantics V1.7 materialization marker');

const integrity=read('site-header-project-integrity-v2.css');
must(integrity,'Header + Project Integrity V3','Project integrity V3');
const visual=read('site-visual-system-v2.css');
must(visual,'QilyLean Visual System V2','Visual System V2 CSS');
must(visual,'@media (max-width:767px)','Mobile visual composition');
const containment=read('site-responsive-containment-v1.css');
must(containment,'QilyLean Responsive Containment V1','Responsive containment CSS');
must(containment,'overscroll-behavior-inline:contain','Local horizontal-scroll containment');
forbid(containment,'width:100vw','Page-level viewport widening');

console.log('PASS: safety/readability owners retain Dock/layout stability while Safe Translation V7 and native-range navigation are the protected public baseline.');
