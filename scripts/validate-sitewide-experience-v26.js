#!/usr/bin/env node
'use strict';

/* V26 experience-compatibility gate on the V30 public baseline. */
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
must(dock,'Floating Dock Authoritative Runtime V5.4','Dock runtime');must(dock,'--qily-dock-size:52px','Dock mobile geometry');must(dock,'--qily-dock-size:50px','Dock narrow geometry');must(dock,'overflow:visible!important','Dock shadow gutter');must(dock,'gap:2.5px!important','Dock two-line spacing');must(dock,'label.dataset.qilyLines=String(lines.length)','Dock line-count marker');

const ddzHtml=read('tools/pure-ddz/index.html');
forbid(ddzHtml,'name="screen-orientation"','DDZ forced orientation');forbid(ddzHtml,'name="x5-orientation"','DDZ forced X5 orientation');must(ddzHtml,'Promise.all(chain.map','DDZ parallel resource download');must(ddzHtml,'},1800);','DDZ early interface reveal');
const ddzCss=read('tools/pure-ddz/game/css/r8-closure-v128.css');
must(ddzCss,'Pure DDZ R12 Closure V132','DDZ closure');must(ddzCss,'left:20px!important','DDZ centered desktop panel');must(ddzCss,'right:20px!important','DDZ centered desktop panel');must(ddzCss,'transform:none!important','DDZ legacy transform reset');must(ddzCss,'#v120-orientation-notice.show{display:none!important','DDZ portrait entry');
const ddzVisual=read('tools/pure-ddz/game/js/visual-v120.js');must(ddzVisual,"version:'1.2.3-portrait-mobile-ready'",'DDZ mobile runtime');forbid(ddzVisual,"document.addEventListener('click',requestLandscape",'DDZ forced landscape click');

const translation=read('site-translation-safe-runtime-v1.js');
must(translation,'Safe In-Page Translation V7','Translation runtime');must(translation,"runtime:'safe-inpage-v7'",'Translation runtime identity');must(translation,'function translationPriority(','Translation priority');must(translation,"emit(target,'first-readable',reason||'critical-lane')",'Translation first-readable event');must(translation,'data-qily-header-utility','Translation header utility');must(translation,"QilyGlobalTranslation=Object.freeze({version:'safe-inpage-v7-header-utility'",'Translation public API');forbid(translation,'translate.google.com','External translation redirect');

const visual=read('site-visual-system-v2.css');for(const token of ['--qv2-forest:#0f4b5a','--qv2-gold:#caa15f','--qv2-axis:1560px','width:52px!important','width:50px!important'])must(visual,token,'VI authority');
const integrity=read('site-header-project-integrity-v2.css');must(integrity,'Header + Project Integrity V3','Project integrity');must(integrity,'font-size:26px!important','List grade floor');must(integrity,'font-size:29px!important','Detail grade floor');
const components=read('site-visual-components-v1.css');must(components,'Unified Visual Components V1 | V29','Unified components');must(components,'::-webkit-slider-thumb','WebKit native rail thumb');must(components,'grid-template-areas:"qily-brand qily-translation" "qily-navigation qily-navigation"!important','Mobile translation/nav separation');must(components,'color:#fff!important','Evidence letter contrast');

const materializer=read('scripts/materialize-global-language-v3.js');for(const token of ['20260831-safe-translation-nav-range-v30','20260829-primary-navigation-safe-scroll-v7','20260829-authority-v54','20260831-r11-semantics-v17-native-range','20260830-r11-semantics-v14-visual-v3-vi-teal','20260831-safe-inpage-v7-header-utility','20260831-r7-single-responsibility-v11-safe-translation','20260831-unified-components-v29-native-range','20260831-project-grade-readability-v3','20260829-r12-v132','20260830-visual-system-v2-r7'])must(materializer,token,'Materializer');forbid(materializer,'site-translation-public-ui-v1.js','Retired translation picker materialization');

console.log('PASS: V26 compatibility remains intact on V30: native-range reachable navigation, Safe Translation V7 header utility, readable project grades, protected Dock typography, portrait-ready DDZ and unified VI authority.');
