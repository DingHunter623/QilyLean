#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};

const dock=read('site-dock-share-runtime-v1.js');
const route=read('site-contact-route-v1.js');
const redline=read('site-public-redline-closure-v1.css');
const ddz=read('tools/pure-ddz/index.html');
const ddzClosure=read('tools/pure-ddz/game/css/r8-closure-v128.css');
const game=read('tools/pure-ddz/game/js/game.js');
const capabilities=read('capabilities/index.html');
const interaction=read('site-interaction-continuity-v1.css');
const semanticsCss=read('site-interaction-semantics-v1.css');
const semanticsJs=read('site-interaction-semantics-v1.js');
const consistency=read('site-ui-consistency-v1.js');
const coreService=read('site-core-service-dock-closure-v1.js');
const navigation=read('site-navigation.js');
const header=read('site-header-axis-v1.css');
const career=read('site-early-career-history-v1.js');
const materializer=read('scripts/materialize-global-language-v3.js');
const contactMaterializer=read('scripts/materialize-contact-route-v6.js');

assert(dock.includes('Floating Dock Authoritative Runtime V5.2'),'Dock V5.2 marker missing.');
assert(dock.includes('__qilyFloatingDockUnifiedV52'),'Dock V5.2 guard missing.');
assert(!/new\s+MutationObserver\s*\(/.test(dock),'R9 violation: Dock runtime must not rebuild through MutationObserver.');
assert(dock.includes("ORDER=['home','top','back','search','current','contact']"),'Canonical Dock order drifted.');
assert(dock.includes('setOwnedLabel'),'Dock does not own one canonical label tree.');
assert(dock.includes('qily-dock-label'),'Canonical Dock label node missing.');
assert(dock.includes('.qily-float-btn::before'),'Dock pseudo-label reset missing.');
assert(dock.includes('--qily-dock-size:56px'),'Mobile Dock canonical 56px tier missing.');
assert(dock.includes('--qily-dock-size:54px'),'Narrow-mobile Dock canonical 54px tier missing.');
assert(dock.includes("EXCLUDED=/^\\/tools\\/pure-ddz"),'Pure DDZ Dock exclusion missing.');
for(const action of ['top','back','search','current','contact'])assert(dock.includes("action==='"+action+"'"),action+' action missing.');

assert(route.includes('Site Shell Recovery + Contact Route V13.1'),'Contact Route V13.1 compatibility marker missing.');
assert(route.includes('__qilyFloatingDockUnifiedV51'),'Contact route compatibility guard missing.');
assert(route.includes('site-public-redline-closure-v1.css?v=20260828-home-dock-v2'),'Redline V2 cache key missing.');
assert(route.includes('html:not([data-qily-dock="disabled"]) body #floatDock'),'Contact route disabled-Dock selector missing.');
assert(contactMaterializer.includes("const ROUTE='/site-contact-route-v1.js?v=20260828-dock-functional-public-v131'"),'Contact materializer route cache drifted.');
assert(contactMaterializer.includes("const DOCK='/site-dock-share-runtime-v1.js?v=20260829-authority-v52'"),'Contact materializer can still revert Dock to V5.1.');

assert(redline.includes('Public Redline Closure V2'),'Public redline V2 marker missing.');
assert(redline.includes('body.qily-home-v3 .hero .hero-grid'),'Homepage hero containment rule missing.');
assert(redline.includes('background:#eef7f5!important'),'Homepage outer hero neutral surface missing.');
assert(redline.includes('header.qily-global-header'),'Unified global navigation rule missing.');
assert(redline.includes('#pure-ddz-digital-tool'),'Capability DDZ direct-link protection missing.');

assert(consistency.includes('__qilyUiSingleResponsibilityV7'),'UI consistency single-responsibility guard missing.');
assert(!consistency.includes('normalizeDockButton'),'UI consistency must not mutate Dock buttons.');
assert(!consistency.includes('dockIconMarkup'),'UI consistency must not inject Dock icons.');
assert(coreService.includes('__qilyCoreServiceAlignmentV105'),'Cooperation alignment V10.5 marker missing.');
assert(!coreService.includes('normalizeDock'),'Cooperation runtime must not mutate Dock.');
assert(navigation.includes('navigation runtime v45'),'Navigation V45 marker missing.');
assert(!/new\s+MutationObserver\s*\(/.test(navigation),'Navigation runtime must not continuously mutate shared UI.');

assert(header.includes('Global Header Axis V1.1'),'Header Axis V1.1 missing.');
assert(header.includes('overflow-x:auto!important'),'Desktop navigation horizontal scrolling missing.');
assert(header.includes('overflow-x:scroll!important'),'Mobile explicit horizontal scrolling missing.');
assert(header.includes('scrollbar-width:thin!important'),'Visible navigation scrollbar missing.');

assert(ddz.includes('id="welcome-start"'),'Pure DDZ welcome Start button missing.');
assert(game.includes("$('welcome-start').addEventListener('click',startRound)"),'Pure DDZ welcome Start button is not wired to startRound.');
assert(capabilities.includes('<a href="/tools/pure-ddz/">立即在线玩</a>'),'Capability DDZ direct entry missing.');
assert(ddzClosure.includes('Pure DDZ R9 Closure V129'),'Pure DDZ R9 closure stylesheet missing.');
assert(ddzClosure.includes('html:not(.ddz-ready) body .game-shell'),'Pure DDZ legacy first-paint gate missing.');
assert(ddzClosure.includes('.topbar .brand *'),'Pure DDZ brand-flicker suppression missing.');
assert(ddzClosure.includes('left:50%!important'),'Pure DDZ local-player centering rule missing.');
assert(ddzClosure.includes('width:max-content!important'),'Pure DDZ local card-group centering rule missing.');
assert(ddzClosure.includes('margin-left:auto!important'),'Pure DDZ local card-group auto-margin missing.');
assert(ddzClosure.includes('#floatDock'),'Pure DDZ Dock exclusion style missing.');

assert(semanticsCss.includes('QilyLean Interaction Semantics V1.2'),'Interaction semantics CSS v1.2 missing.');
assert(semanticsCss.includes('[data-qily-interaction="route"]'),'Route feedback contract missing.');
assert(semanticsCss.includes('[data-qily-interaction="static"]'),'Static-term no-feedback contract missing.');
assert(semanticsCss.includes('.qily-float-btn::before'),'Dock pseudo-label retirement missing.');
assert(!semanticsCss.includes('content:"回\\A顶部"'),'Duplicate Dock top pseudo-label returned.');
assert(!semanticsCss.includes('content:"回\\A上一层"'),'Duplicate Dock back pseudo-label returned.');
assert(semanticsCss.includes('.overview-card>.tag'),'Eight-waste number readability guard missing.');
assert(semanticsJs.includes('__qilyInteractionSemanticsV12'),'Interaction semantics runtime v1.2 guard missing.');
assert(semanticsJs.includes('PROJECT_EVIDENCE'),'Project evidence mapping missing.');
assert(semanticsJs.includes('addTrustLinks'),'Trust-to-project linkage missing.');
assert(semanticsJs.includes('injectProjectDetailGrade'),'Project detail evidence attribution missing.');

assert(career.includes("var VERSION = 'v5'"),'Career navigation V5 missing.');
assert(career.includes('function stickyHeaderOffset()'),'Career anchor sticky-header measurement missing.');
assert(career.includes('getBoundingClientRect().height'),'Career anchor does not use rendered header height.');

assert(/interaction continuity v[23]/i.test(interaction),'Sitewide interaction continuity baseline missing.');
assert(interaction.includes('focus-visible'),'Keyboard focus feedback missing from interaction baseline.');
assert(interaction.includes(':active'),'Active/pressed feedback missing from interaction baseline.');

assert(materializer.includes("const BASELINE_VERSION='20260829-r9-visual-remediation-v21'"),'R9 materializer baseline v21 missing.');
assert(materializer.includes('site-header-axis-v1.css?v=20260829-primary-navigation-scroll-v5'),'R9 header-scroll stylesheet is not materialized sitewide.');
assert(materializer.includes('site-dock-share-runtime-v1.js?v=20260829-authority-v52'),'Dock V5.2 is not materialized sitewide.');
assert(materializer.includes('site-interaction-semantics-v1.css?v=20260829-r9-semantics-v12'),'Interaction semantics CSS v1.2 is not materialized sitewide.');
assert(materializer.includes('site-interaction-semantics-v1.js?v=20260829-r9-semantics-v12'),'Interaction semantics JS v1.2 is not materialized sitewide.');
assert(materializer.includes('r8-closure-v128.css?v=20260829-r9-v129'),'Pure DDZ R9 closure is not materialized.');

console.log('PASS: R9 authoritative runtime contract — uniform mobile Dock V5.2, visible horizontal navigation scrolling, precise career anchors, linked evidence grades, DDZ stable brand/centered card group, and readable static numbering are protected.');
