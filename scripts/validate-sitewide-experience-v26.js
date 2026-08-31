#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const must=(source,token,label)=>{if(!source.includes(token))throw new Error(`${label}: missing ${token}`)};
const forbid=(source,token,label)=>{if(source.includes(token))throw new Error(`${label}: forbidden ${token}`)};

const header=read('site-header-axis-v1.css');
must(header,'Global Header Axis V1.2','Header');must(header,'justify-content:flex-start!important','Header reachable origin');must(header,'content:none!important','Header spacer removal');must(header,'padding:0 0 18px!important','Header text-to-rail safety gap');

const semantics=read('site-interaction-semantics-v1.js');
must(semantics,'Interaction Semantics Runtime V1.5','Navigation runtime');must(semantics,'__qilyInteractionSemanticsV15','Navigation runtime marker');must(semantics,'installPrimaryNavDragGuard','Navigation drag guard');must(semantics,'suppressUntil=w.performance.now()+320','Navigation click suppression');must(semantics,"w.addEventListener('pointermove',move,{passive:false})",'Navigation iOS rail drag');must(semantics,'nav.scrollLeft=startScroll-dx','Navigation direct touch drag');

const dock=read('site-dock-share-runtime-v1.js');
must(dock,'Floating Dock Authoritative Runtime V5.4','Dock runtime');must(dock,'--qily-dock-size:52px','Dock mobile geometry');must(dock,'--qily-dock-size:50px','Dock narrow geometry');must(dock,'overflow:visible!important','Dock shadow gutter');must(dock,'gap:2.5px!important','Dock two-line spacing');must(dock,'label.dataset.qilyLines=String(lines.length)','Dock line-count marker');

const ddzHtml=read('tools/pure-ddz/index.html');
forbid(ddzHtml,'name="screen-orientation"','DDZ forced orientation');forbid(ddzHtml,'name="x5-orientation"','DDZ forced X5 orientation');must(ddzHtml,'Promise.all(chain.map','DDZ parallel resource download');must(ddzHtml,'},1800);','DDZ early interface reveal');
const ddzCss=read('tools/pure-ddz/game/css/r8-closure-v128.css');
must(ddzCss,'Pure DDZ R12 Closure V132','DDZ closure');must(ddzCss,'left:20px!important','DDZ centered desktop panel');must(ddzCss,'right:20px!important','DDZ centered desktop panel');must(ddzCss,'transform:none!important','DDZ legacy transform reset');must(ddzCss,'#v120-orientation-notice.show{display:none!important','DDZ portrait entry');
const ddzVisual=read('tools/pure-ddz/game/js/visual-v120.js');must(ddzVisual,"version:'1.2.3-portrait-mobile-ready'",'DDZ mobile runtime');forbid(ddzVisual,"document.addEventListener('click',requestLandscape",'DDZ forced landscape click');

const translation=read('site-translation-safe-runtime-v1.js');
must(translation,"runtime:'safe-inpage-v5'",'Translation runtime');must(translation,'function translationPriority(','Translation priority');must(translation,"emit(target,'first-readable',reason||'critical-lane')",'Translation first-readable event');must(translation,'8,1200,2','Translation critical lane');must(translation,'2,420,2','Translation critical retry lane');must(translation,'10,1800,3','Translation visible lane');must(translation,'14,3200,3','Translation background lane');must(translation,'Promise.all([criticalRetryPromise,visiblePromise])','Translation parallel foreground lanes');must(translation,'Math.min(18000,9000+chars*5)','Translation adaptive timeout');
const publicTranslation=read('site-translation-public-ui-v1.js');
must(publicTranslation,'Translation Public UI V1.3','Stable public picker');must(publicTranslation,"var PUBLIC_LANGUAGE_LABELS={'zh-CN':'中文简体','zh-TW':'中文繁体','en':'English'}",'Public language contract');must(publicTranslation,"var PUBLIC_LANGUAGE_ORDER=['zh-CN','zh-TW','en']",'Public language order');must(publicTranslation,'data-qily-native-picker-open','Native picker guard');forbid(publicTranslation,'function fitSelect(','Runtime picker geometry mutation');if(/new\s+MutationObserver\s*\(/.test(publicTranslation))throw new Error('Public picker document-wide MutationObserver forbidden');

const visual=read('site-visual-system-v2.css');for(const token of ['--qv2-forest:#0f4b5a','--qv2-gold:#caa15f','--qv2-axis:1560px','width:52px!important','width:50px!important'])must(visual,token,'VI authority');
const integrity=read('site-header-project-integrity-v2.css');must(integrity,'Header + Project Integrity V3','Project integrity');must(integrity,'font-size:26px!important','List grade floor');must(integrity,'font-size:29px!important','Detail grade floor');
const materializer=read('scripts/materialize-global-language-v3.js');for(const token of ['20260831-native-picker-grade-readability-v29','20260829-first-readable-v7','20260829-primary-navigation-safe-scroll-v7','20260829-authority-v54','20260830-r11-semantics-v15-ios-drag','20260830-r11-semantics-v14-visual-v3-vi-teal','20260831-native-picker-stability-v9','20260831-r7-single-responsibility-v9-native-picker','20260831-project-grade-readability-v3','20260829-r12-v132','20260830-visual-system-v2-r7'])must(materializer,token,'Materializer');

console.log('PASS: V26 compatibility remains intact on V29 sitewide baseline: iOS-safe reachable navigation, native-stable three-language picker, readable project grades, protected Dock typography, portrait-ready DDZ, progressive translation and unified VI authority.');
