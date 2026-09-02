#!/usr/bin/env node
'use strict';

/* V27 visual-closure compatibility checks on the current V32 public baseline. */
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const must=(source,token,label)=>{if(!source.includes(token))throw new Error(`${label}: missing ${token}`)};
const forbid=(source,token,label)=>{if(source.includes(token))throw new Error(`${label}: forbidden ${token}`)};

const visual=read('site-visual-system-v2.css');
for(const token of ['V27 public visual closure','.qily-system-axis__step:not(:last-child)::after','right:-16px!important','z-index:8!important','.hero + .authority-strip','calc(100% - var(--qv2-gutter) - var(--qv2-gutter))','#boundary .boundary-split li{font-size:17.5px!important','section#contact .trust-contact>a[href]:is(:hover,:focus-visible,:active)','#evidence-levels .trust-level>span{min-height:calc(1.65em * 4)!important','.qily-web-translate__select','background-clip:padding-box!important'])must(visual,token,'V27 visual authority');
const capabilities=read('capabilities/index.html');for(const token of ['PDCA项目机制','P｜计划 Plan','D｜执行 Do','C｜检查 Check','A｜处置 Act','class="module-grid four"'])must(capabilities,token,'Capability PDCA');
const semantics=read('site-interaction-semantics-v1.css');for(const token of ['[data-qily-interaction="static"]','cursor:default!important','transform:none!important'])must(semantics,token,'Static interaction semantics');

const ddz=read('tools/pure-ddz/index.html');
for(const token of ['20260902-ddz-integrated-v150',"const chain=['js/card-theme.js','js/ai-expert.js','js/game.js','js/visual-v120.js'];",'/site-navigation.js?','/site-dock-share-runtime-v1.js?'])must(ddz,token,'DDZ V150');
for(const token of ['name="screen-orientation"','name="x5-orientation"',"loadStyle('css/ddz-playability-v141.css')",'qilyPureDdzR8ClosureV128','ddz-site-shell-v140.js','js/qilylean-theme.js','js/elder-assist-v140.js','<footer class="site-footer">'])forbid(ddz,token,'DDZ retired runtime');
const ddzMaterializer=read('scripts/materialize-ddz-public-ui-20260824.js');
must(ddzMaterializer,'20260902-ddz-integrated-v150','DDZ materializer');
must(ddzMaterializer,'Legacy DDZ V141 patch must stay unloaded','DDZ materializer');
must(ddzMaterializer,'forced-orientation metadata must stay removed','DDZ materializer');
const ddzGame=read('tools/pure-ddz/game/js/game.js');
for(const token of ["const VERSION = '1.5.0'",'function describePlay(play)','function speakAsync','afterNarration(narration,scheduleTurn,700)',"pass(0,{auto:true})"])must(ddzGame,token,'DDZ core flow');
const ddzLayout=read('tools/pure-ddz/game/css/ddz-site-page-v140.css');
must(ddzLayout,'--ddz-game-max:1180px','DDZ integrated scale');
forbid(ddzLayout,'#floatDock','DDZ CSS must not own site Dock');

const materializer=read('scripts/materialize-global-language-v3.js');
must(materializer,"BASELINE_VERSION='20260831-google-translate-single-runtime-v32'",'V32 sitewide baseline');
must(materializer,"DOCK_SHARE='/site-dock-share-runtime-v1.js?v=20260902-authority-v55'",'Dock V5.5 cache');
must(materializer,"VISUAL_SYSTEM_V2='/site-visual-system-v2.css?v=20260830-visual-system-v2-r7'",'V32 visual cache');
must(materializer,"FINAL_INTEGRITY_CSS='/site-header-project-integrity-v2.css?v=20260831-project-grade-readability-v3'",'Project grade integrity cache');
must(materializer,"VISUAL_COMPONENTS_CSS='/site-visual-components-v1.css?v=20260831-unified-components-v29-native-range'",'Unified visual components cache');
must(materializer,"TRANSLATION_SAFE_JS='/site-translation-safe-runtime-v1.js?v=20260901-google-translate-single-runtime-v16'",'Google Translate cache');
must(materializer,"TRANSLATION_PUBLIC_CSS='/site-translation-public-ui-v1.css?v=20260901-google-translate-mobile-ui-v16'",'Google translation UI cache');
must(materializer,"INTERACTION_SEMANTICS_JS='/site-interaction-semantics-v1.js?v=20260831-r11-semantics-v17-native-range'",'Interaction Semantics V1.7 cache');

const dockRuntime=read('site-dock-share-runtime-v1.js');
must(dockRuntime,'__qilyFloatingDockUnifiedV55','Dock V5.5 runtime');
must(dockRuntime,'function isExcluded(){return false;}','DDZ uses canonical Dock');
const interactionRuntime=read('site-interaction-semantics-v1.js');
must(interactionRuntime,'__qilyInteractionSemanticsV17','Interaction Semantics V1.7 runtime');
must(interactionRuntime,"rail.type='range'",'Native navigation range rail');
const translationRuntime=read('site-translation-safe-runtime-v1.js');
must(translationRuntime,'Google Translate Header Runtime V1.4','Google Translate V1.4 runtime');
must(translationRuntime,'translate.google.com/translate_a/element.js','Google Translate embed');
must(translationRuntime,'loadGoogleAfterPage','Post-load Google scheduling');
must(translationRuntime,"addOption(select,MORE_VALUE,'其他')",'More-language entry');
must(translationRuntime,'function populateMoreLanguages()','More-language population');
forbid(translationRuntime,'includedLanguages:','Expanded language picker must not restrict Google languages');
forbid(translationRuntime,'function handleAndroidLanguageChange(event)','Android reload fallback');
forbid(translationRuntime,'w.location.reload','Translation reload');
forbid(translationRuntime,'stabilizeMobileNav','Translation runtime must not own navigation');
forbid(translationRuntime,'createTreeWalker','Retired page-wide translation scan');
if(/new\s+MutationObserver\s*\(/.test(translationRuntime))throw new Error('Translation MutationObserver forbidden');
if(/setTimeout\s*\(/.test(translationRuntime))throw new Error('Translation timing guess forbidden');
const translationCss=read('site-translation-public-ui-v1.css');
must(translationCss,'.qily-web-translate__select','Primary translator select');
must(translationCss,'select.goog-te-combo','Native Google execution select');
must(translationCss,'.qily-language-more','More-language popover');
must(translationCss,'Google attribution is legally/brand-required','Visible Google attribution contract');
forbid(translationCss,'qily-global-nav','Translation CSS must not own navigation');
const components=read('site-visual-components-v1.css');
for(const token of ['qily-primary-nav-scroll-rail','::-webkit-slider-thumb','.qily-project-evidence-grade','.qily-project-list-grade'])must(components,token,'V32 visual components');

console.log('PASS: V27 compatibility checks remain satisfied on the V32 Google-Translate/native-range baseline, including Dock V5.5 and the site-integrated, narration-paced DDZ V150 runtime.');