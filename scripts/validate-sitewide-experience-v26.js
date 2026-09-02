#!/usr/bin/env node
'use strict';

/* V26 experience-compatibility gate on the V32 public baseline. */
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
must(dock,'Floating Dock Authoritative Runtime V5.5','Dock runtime');must(dock,'__qilyFloatingDockUnifiedV55','Dock runtime marker');must(dock,'--qily-dock-size:52px','Dock mobile geometry');must(dock,'--qily-dock-size:50px','Dock narrow geometry');must(dock,'overflow:visible!important','Dock shadow gutter');must(dock,'gap:2.5px!important','Dock two-line spacing');must(dock,'label.dataset.qilyLines=String(lines.length)','Dock line-count marker');must(dock,'function isExcluded(){return false;}','Canonical Dock public-page coverage');

const ddzHtml=read('tools/pure-ddz/index.html');
forbid(ddzHtml,'name="screen-orientation"','DDZ forced orientation');forbid(ddzHtml,'name="x5-orientation"','DDZ forced X5 orientation');forbid(ddzHtml,'qilyPureDdzR8ClosureV128','DDZ retired closure');must(ddzHtml,'Promise.all(chain.map','DDZ parallel resource download');must(ddzHtml,'},1800);','DDZ early interface reveal');must(ddzHtml,'20260902-ddz-integrated-v152','DDZ V152 cache');must(ddzHtml,'/site-dock-share-runtime-v1.js?','DDZ canonical Dock runtime');
const ddzLayout=read('tools/pure-ddz/game/css/ddz-site-page-v140.css');
must(ddzLayout,'--ddz-game-max:var(--qily-content-axis,1560px)','DDZ site content axis');must(ddzLayout,'overflow-x:clip!important','DDZ sticky-header-safe containment');must(ddzLayout,'justify-content:safe center!important','DDZ centered hand');must(ddzLayout,'scoreboard :is(small,strong,span)','DDZ status contrast');must(ddzLayout,'justify-self:stretch!important','DDZ right-pinned top actions');forbid(ddzLayout,'#floatDock','DDZ layout Dock ownership');
const ddzComfort=read('tools/pure-ddz/game/css/card-comfort-v122.css');forbid(ddzComfort,'#floatDock','DDZ comfort Dock ownership');
const ddzGame=read('tools/pure-ddz/game/js/game.js');must(ddzGame,"const VERSION = '1.5.2'",'DDZ game V152');must(ddzGame,"auto?'不要':'您不要'",'DDZ Hint auto-pass narration');
const ddzVisual=read('tools/pure-ddz/game/js/visual-v120.js');must(ddzVisual,"version:'1.2.3-portrait-mobile-ready'",'DDZ mobile runtime');forbid(ddzVisual,"document.addEventListener('click',requestLandscape",'DDZ forced landscape click');

const translation=read('site-translation-safe-runtime-v1.js');
must(translation,'Google Translate Header Runtime V1.4','Translation runtime');must(translation,'__qilyGoogleTranslateElementInitialized','Single translation initialization');must(translation,'function recoverRetainedControlOnce()','Bounded translation recovery');must(translation,"addOption(select,MORE_VALUE,'其他')",'Primary more-language entry');must(translation,'function populateMoreLanguages()','Google-supported more-language picker');must(translation,'data-qily-header-utility','Translation header utility');must(translation,'translate.google.com/translate_a/element.js','Official Google element');forbid(translation,'includedLanguages:','Expanded translator must not restrict Google languages');forbid(translation,'createTreeWalker','Page translation scan');if(/new\s+MutationObserver\s*\(/.test(translation))throw new Error('Translation MutationObserver forbidden');

const visual=read('site-visual-system-v2.css');for(const token of ['--qv2-forest:#0f4b5a','--qv2-gold:#caa15f','--qv2-axis:1560px','width:52px!important','width:50px!important'])must(visual,token,'VI authority');
const integrity=read('site-header-project-integrity-v2.css');must(integrity,'Header + Project Integrity V3','Project integrity');must(integrity,'font-size:26px!important','List grade floor');must(integrity,'font-size:29px!important','Detail grade floor');
const components=read('site-visual-components-v1.css');must(components,'Unified Visual Components V1 | V29','Unified components');must(components,'::-webkit-slider-thumb','WebKit native rail thumb');must(components,'grid-template-areas:"qily-brand qily-translation" "qily-navigation qily-navigation"!important','Mobile translation/nav separation');must(components,'color:#fff!important','Evidence letter contrast');

const materializer=read('scripts/materialize-global-language-v3.js');for(const token of ['20260831-google-translate-single-runtime-v32','20260901-primary-navigation-native-scroll-v8','20260902-authority-v55','20260831-r11-semantics-v17-native-range','20260830-r11-semantics-v14-visual-v3-vi-teal','20260901-google-translate-single-runtime-v16','20260901-google-translate-mobile-ui-v16','20260831-r7-single-responsibility-v11-safe-translation','20260831-unified-components-v29-native-range','20260831-project-grade-readability-v3','20260830-visual-system-v2-r7'])must(materializer,token,'Materializer');forbid(materializer,'DDZ_CLOSURE_CSS','Retired DDZ closure materialization');forbid(materializer,'const PUBLIC_UI_JS=','Retired translation picker active injection');

console.log('PASS: V26 compatibility remains intact on V32: official sticky Header, native-range navigation, Google Translate V1.4, canonical Dock V5.5, DDZ V152 and unified VI authority.');
