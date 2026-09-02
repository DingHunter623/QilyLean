#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const must=(s,t,m)=>{if(!s.includes(t))throw new Error(`${m}: missing ${t}`)};
const forbid=(s,t,m)=>{if(s.includes(t))throw new Error(`${m}: forbidden ${t}`)};

const shell=read('site-ui-consistency-v1.js');
must(shell,'__qilyUiSingleResponsibilityV11','UI single responsibility V11');
must(shell,'single-responsibility-v11-safe-translation','Translation-neutral shell build');
forbid(shell,'function uninstallTranslationArtifacts()','Shell must not own translation removal');
forbid(shell,'normalizeDockButton','Shell Dock mutation');
forbid(shell,'dockIconMarkup','Shell Dock icons');

const safe=read('site-translation-safe-runtime-v1.js');
must(safe,'Google Translate Header Runtime V1.4','Google Translate runtime');
must(safe,'translate.google.com/translate_a/element.js','Google Translate embed');
must(safe,"data-qily-translation-provider','google",'Google provider marker');
must(safe,"data-qily-header-utility','translation'",'Translation header utility');
must(safe,'only public translation lifecycle owner','Single translation lifecycle owner');
must(safe,"addOption(select,'zh-CN','中文简体')",'Simplified Chinese primary language');
must(safe,"addOption(select,'zh-TW','中文繁体')",'Traditional Chinese primary language');
must(safe,"addOption(select,'en','English')",'English primary language');
must(safe,"addOption(select,MORE_VALUE,'其他')",'More languages entry');
must(safe,'function populateMoreLanguages()','Google-supported more languages');
forbid(safe,'includedLanguages:','Expanded language picker must not restrict Google supported languages');
must(safe,'__qilyGoogleTranslateElementInitialized','Page-lifetime initialization guard');
must(safe,'recoverRetainedControlOnce','Bounded retained-node recovery');
must(safe,'loadGoogleAfterPage','Post-load Google scheduling');
forbid(safe,'function handleAndroidLanguageChange(event)','Android reload fallback');
forbid(safe,"d.cookie='googtrans='",'Translation cookie override');
forbid(safe,'qilylean-ai.dinghunter623.workers.dev','Retired custom translator');
forbid(safe,'api.qilylean.com','Retired custom translation API');
forbid(safe,'ai-api.qilylean.com','Retired custom translation API');
forbid(safe,'createTreeWalker','Page-wide translation scan');
forbid(safe,'stabilizeMobileNav','Translation runtime must not own navigation');
if(/new\s+MutationObserver\s*\(/.test(safe))throw new Error('Translation MutationObserver forbidden');
if(/setInterval\s*\(/.test(safe))throw new Error('Translation polling forbidden');
if(/setTimeout\s*\(/.test(safe))throw new Error('Translation timing guess forbidden');
if(/location\.(?:replace|assign)\s*\(/.test(safe))throw new Error('Translation redirect forbidden');
if(/w\.location\.reload\s*\(/.test(safe))throw new Error('Translation page reload is forbidden');

const redline=read('site-public-redline-closure-v2.js');
must(redline,'Public Redline Closure V2.3','Translation-neutral public redline');
for(const token of ['qilyGlobalTranslationDualRouteV2','google_translate_element','goog-te-','prunePublicLanguages','cleanControl','qily:language-change'])forbid(redline,token,'Public redline must not manage translation');
if(/\.observe\s*\(\s*(?:d\.)?(?:documentElement|body)\b/.test(redline))throw new Error('Page-wide public-redline observer forbidden');

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
must(dock,'Floating Dock Authoritative Runtime V5.5','Dock V5.5');
must(dock,'__qilyFloatingDockUnifiedV55','Dock V55 guard');
must(dock,"ORDER=['home','top','back','search','current','contact']",'Dock order');
must(dock,'setOwnedLabel','Dock label owner');
must(dock,'function openContactPage()','Full contact action');
must(dock,"w.open(url,'_blank','noopener,noreferrer')",'Contact new tab');
must(dock,'function isExcluded(){return false;}','Normal public pages share the same Dock');
forbid(dock,"mask.classList.add('show')",'Dock modal');
if(/new\s+MutationObserver\s*\(/.test(dock))throw new Error('Dock MutationObserver forbidden');

const route=read('site-contact-route-v1.js');
must(route,'Site Shell Recovery + Contact Route V13.4','Contact V13.4');
must(route,'__qilyFloatingDockUnifiedV54','Contact Dock backward-compatibility guard');

const header=read('site-header-axis-v1.css');
must(header,'Global Header Axis V1.2','Header Axis');
must(header,'overflow-x:auto!important','Desktop nav scroll');
must(header,'overflow-x:scroll!important','Mobile nav scroll');
must(header,'white-space:nowrap!important','Complete nav text');
must(header,'Mobile primary-navigation closure','Native mobile nav closure');
must(header,'inline-size:100%!important','Contained mobile nav viewport');
must(header,'pointer-events:none!important','Phone rail touch isolation');

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

const ddz=read('tools/pure-ddz/game/css/ddz-site-page-v140.css');
must(ddz,'--ddz-game-max:var(--qily-content-axis,1560px)','DDZ site content axis');
must(ddz,'overflow-x:clip!important','DDZ sticky-header-safe page containment');
must(ddz,'justify-content:safe center!important','Safe centered hand');
must(ddz,'overflow-x:auto!important','DDZ hand overflow safety');
must(ddz,'scoreboard :is(small,strong,span)','DDZ status white contrast');
must(ddz,'justify-self:stretch!important','DDZ top actions far-right alignment');
must(ddz,'#hint-message.hint-message{display:none!important}','DDZ fixed maintenance copy hidden');
forbid(ddz,'#floatDock','DDZ local Dock ownership');
const ddzComfort=read('tools/pure-ddz/game/css/card-comfort-v122.css');
forbid(ddzComfort,'#floatDock','DDZ comfort layer local Dock ownership');
const ddzLandscape=read('tools/pure-ddz/game/css/mobile-landscape-v153.css');
must(ddzLandscape,'html.ddz-mobile-landscape body.ddz-site-page','DDZ landscape scoped owner');
must(ddzLandscape,'var(--ddz-mobile-vh,390px)','DDZ visual-viewport height sizing');
must(ddzLandscape,'env(safe-area-inset-right)','DDZ landscape safe area');
forbid(ddzLandscape,'#floatDock','DDZ landscape layer local Dock ownership');
const ddzGame=read('tools/pure-ddz/game/js/game.js');
must(ddzGame,"const VERSION = '1.5.2'",'DDZ V152 game core');
must(ddzGame,"auto?'不要':'您不要'",'DDZ auto-pass narration');
must(ddzGame,"flash('不要，自动轮到下家')",'DDZ auto-pass visual feedback');
const ddzVisual=read('tools/pure-ddz/game/js/visual-v120.js');
must(ddzVisual,"version:'1.2.4-mobile-landscape-adaptive'",'DDZ V153 landscape runtime');
must(ddzVisual,'function syncViewportProfile()','DDZ viewport profile');
must(ddzVisual,'screen.orientation?.lock','DDZ supported-browser landscape lock');
must(ddzVisual,'document.documentElement.requestFullscreen','DDZ user-gesture fullscreen request');
must(ddzVisual,'window.PureDDZTest.hint()','DDZ single Hint behavior owner');

const ddzIndex=read('tools/pure-ddz/index.html');
must(ddzIndex,'20260903-ddz-mobile-landscape-v153','DDZ V153 cache');
must(ddzIndex,"loadStyle('css/mobile-landscape-v153.css')",'DDZ landscape stylesheet load');
must(ddzIndex,'id="v120-landscape-toggle"','DDZ toolbar landscape entry');
must(ddzIndex,'id="welcome-landscape"','DDZ welcome landscape entry');
forbid(ddzIndex,'name="screen-orientation"','DDZ must not rely on forced orientation metadata');
forbid(ddzIndex,'name="x5-orientation"','DDZ must not rely on X5 forced orientation metadata');

const mat=read('scripts/materialize-global-language-v3.js');
must(mat,"const BASELINE_VERSION='20260831-google-translate-single-runtime-v32'",'V32 baseline identity');
must(mat,"HEADER_AXIS='/site-header-axis-v1.css?v=20260901-primary-navigation-native-scroll-v8'",'Native mobile navigation owner');
must(mat,"DOCK_SHARE='/site-dock-share-runtime-v1.js?v=20260902-authority-v55'",'Dock V55 materialization owner');
must(mat,"VISUAL_COMPONENTS_CSS='/site-visual-components-v1.css?v=20260831-unified-components-v29-native-range'",'Visual components owner');
must(mat,"TRANSLATION_SAFE_JS='/site-translation-safe-runtime-v1.js?v=20260901-google-translate-single-runtime-v16'",'Google translation owner');
must(mat,"TRANSLATION_PUBLIC_CSS='/site-translation-public-ui-v1.css?v=20260901-google-translate-mobile-ui-v16'",'Google native translation UI owner');
must(mat,"PUBLIC_REDLINE_V2_JS='/site-public-redline-closure-v2.js?v=20260831-redline-no-translation-v23'",'Translation-neutral public redline');
must(mat,'20260831-r11-semantics-v17-native-range','Semantics V17 owner');
must(mat,'20260831-r7-single-responsibility-v11-safe-translation','Shell V11 owner');
must(mat,'data-qily-translation-safe-direct="google-v1"','Google translation materialization marker');
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

console.log('PASS: safety/readability owners retain official sticky Header and Dock V5.5 while DDZ V153 adds user-gesture landscape rotation and actual-viewport adaptive sizing.');
