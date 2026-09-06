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
for(const token of ['20260903-ddz-fast-knowledge-v155-v158-v159-v160-v161-v162-v163-v164','data-qily-ddz-core="v158"','window.__PURE_DDZ_STYLE_READY__=Promise.resolve();','data-qily-ddz-fast-shell="v155"','data-qily-ddz-virtual-landscape="v154"','id="v120-landscape-toggle"','id="welcome-landscape"',"const chain=['js/ddz-core-v155.js'];",'/site-dock-share-runtime-v1.js?','<p id="hint-message" class="hint-message" aria-hidden="true"></p>','无牌可压时自动喊“不要”并轮到下家'])must(ddz,token,'DDZ V155/V164');
for(const token of ['name="screen-orientation"','name="x5-orientation"',"loadStyle('css/ddz-core-v155.css')","loadStyle('css/mobile-landscape-v153.css')",'/site-navigation.js?','qilyPureDdzR8ClosureV128','ddz-site-shell-v140.js','js/qilylean-theme.js','js/elder-assist-v140.js','<footer class="site-footer">','class="ddz-page-note"'])forbid(ddz,token,'DDZ retired runtime');
const ddzMaterializer=read('scripts/materialize-ddz-public-ui-20260824.js');
must(ddzMaterializer,'20260903-ddz-fast-knowledge-v155-v158-v159-v160-v161-v162-v163-v164','DDZ materializer');
must(ddzMaterializer,'data-qily-ddz-core="v158"','DDZ static stylesheet materializer');
must(ddzMaterializer,"const chain=['js/ddz-core-v155.js'];",'DDZ single-bundle materializer');
must(ddzMaterializer,'forced-orientation metadata must stay removed','DDZ materializer');
const ddzGame=read('tools/pure-ddz/game/js/ddz-core-v155.js');
for(const token of ["const VERSION = '1.5.2'",'function describePlay(play)','function speakAsync',"afterNarration(narration,()=>{state.current=nextPlayer(player);render();scheduleTurn();},1100)","pass(0,{auto:true})","utterance.rate=.82","auto?'不要':'您不要'","flash('不要，自动轮到下家')"])must(ddzGame,token,'DDZ core flow');
const ddzVisual=ddzGame;
for(const token of ["version:'1.2.4-mobile-landscape-adaptive'",'function syncViewportProfile()','screen.orientation?.lock',"document.documentElement.requestFullscreen",'window.visualViewport?.addEventListener?.(\'resize\'',"window.PureDDZTest.hint()"] )must(ddzVisual,token,'DDZ landscape runtime');
const ddzLayout=read('tools/pure-ddz/game/css/ddz-core-v155.css');
for(const token of ['--ddz-game-max:var(--qily-content-axis,1560px)','overflow-x:clip!important','height:clamp(560px,calc(100vh - 260px),620px)','scoreboard :is(small,strong,span)','justify-self:stretch!important','font-size:18px!important;font-weight:950!important','#hint-message.hint-message{display:none!important}'])must(ddzLayout,token,'DDZ integrated scale');
forbid(ddzLayout,'#floatDock','DDZ layout CSS must not own site Dock');
const ddzLandscape=ddzLayout;
for(const token of ['--ddz-landscape-scale:1','html.ddz-mobile-landscape body.ddz-site-page','.ddz-page-heading,','var(--ddz-mobile-vh,390px)','env(safe-area-inset-right)','max-width:720px'])must(ddzLandscape,token,'DDZ mobile landscape CSS');
forbid(ddzLandscape,'#floatDock','DDZ landscape CSS must not own site Dock');

const materializer=read('scripts/materialize-global-language-v3.js');
must(materializer,"BASELINE_VERSION='20260831-google-translate-single-runtime-v32'",'V32 sitewide baseline');
must(materializer,"DOCK_SHARE='/site-dock-share-runtime-v1.js?v=20260906-authority-v56-flow-navigation'",'Dock V5.6 cache');
must(materializer,"VISUAL_SYSTEM_V2='/site-visual-system-v2.css?v=20260830-visual-system-v2-r7'",'V32 visual cache');
must(materializer,"FINAL_INTEGRITY_CSS='/site-header-project-integrity-v2.css?v=20260831-project-grade-readability-v3'",'Project grade integrity cache');
must(materializer,"VISUAL_COMPONENTS_CSS='/site-visual-components-v1.css?v=20260831-unified-components-v29-native-range'",'Unified visual components cache');
must(materializer,"TRANSLATION_SAFE_JS='/site-translation-safe-runtime-v1.js?v=20260901-google-translate-single-runtime-v16'",'Google Translate cache');
must(materializer,"TRANSLATION_PUBLIC_CSS='/site-translation-public-ui-v1.css?v=20260901-google-translate-mobile-ui-v16'",'Google translation UI cache');
must(materializer,"INTERACTION_SEMANTICS_JS='/site-interaction-semantics-v1.js?v=20260831-r11-semantics-v17-native-range'",'Interaction Semantics V1.7 cache');

const dockRuntime=read('site-dock-share-runtime-v1.js');
must(dockRuntime,'__qilyFloatingDockUnifiedV56','Dock V5.6 runtime');
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

console.log('PASS: V27 compatibility remains intact on V32, including the canonical Header/Dock and the isolated DDZ V155/V164 bundled mobile-landscape mode.');
