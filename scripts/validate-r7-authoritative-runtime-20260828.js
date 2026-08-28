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
const game=read('tools/pure-ddz/game/js/game.js');
const capabilities=read('capabilities/index.html');
const interaction=read('site-interaction-continuity-v1.css');
const consistency=read('site-ui-consistency-v1.js');
const coreService=read('site-core-service-dock-closure-v1.js');

assert(dock.includes('Floating Dock Authoritative Runtime V5'),'Dock V5 marker missing.');
assert(dock.includes('__qilyFloatingDockUnifiedV5'),'Dock V5 guard missing.');
assert(!/new\s+MutationObserver\s*\(/.test(dock),'R7 violation: Dock runtime must not rebuild through MutationObserver.');
assert(dock.includes("LABELS={home:'首页',top:'回顶部',back:'回上一层',search:'本站搜索',current:'分享当前页',contact:'联系我们'}"),'Canonical Dock labels drifted.');
assert(dock.includes("EXCLUDED=/^\\/tools\\/pure-ddz"),'Pure DDZ Dock exclusion missing.');
assert(dock.includes('justify-content:safe center'),'Pure DDZ hand-centering closure missing.');
assert(dock.includes("action==='top'"),'回顶部 action missing.');
assert(dock.includes("action==='back'"),'回上一层 action missing.');
assert(dock.includes("action==='search'"),'本站搜索 action missing.');
assert(dock.includes("action==='current'"),'分享当前页 action missing.');
assert(dock.includes("action==='contact'"),'联系我们 action missing.');

assert(route.includes('Site Shell Recovery + Contact Route V13'),'Contact Route V13 marker missing.');
assert(route.includes('__qilyFloatingDockUnifiedV5'),'Contact route does not defer to Dock V5.');
assert(route.includes('site-dock-share-runtime-v1.js?v=20260828-authority-v5'),'Contact route Dock V5 cache key missing.');
assert(route.includes('site-public-redline-closure-v1.css?v=20260828-home-dock-v2'),'Redline V2 cache key missing.');
assert(route.includes('html:not([data-qily-dock="disabled"]) body #floatDock'),'Contact route can still force a disabled Dock visible.');

assert(redline.includes('Public Redline Closure V2'),'Public redline V2 marker missing.');
assert(redline.includes('body.qily-home-v3 .hero .hero-grid'),'Homepage hero containment rule missing.');
assert(redline.includes('background:#eef7f5!important'),'Homepage outer hero neutral surface missing.');
assert(redline.includes('header.qily-global-header'),'Unified global navigation rule missing.');
assert(redline.includes('#pure-ddz-digital-tool'),'Capability DDZ direct-link protection missing.');

assert(consistency.includes('__qilyUiConsistencyV7'),'UI consistency V7 marker missing.');
assert(consistency.includes('__qilyUiSingleResponsibilityV7'),'UI consistency single-responsibility guard missing.');
assert(!consistency.includes('normalizeDockButton'),'UI consistency must not mutate Dock buttons.');
assert(!consistency.includes('dockIconMarkup'),'UI consistency must not inject Dock icons.');
assert(!consistency.includes('[data-action="back"]'),'UI consistency must not intercept Dock back events.');
assert(coreService.includes('__qilyCoreServiceAlignmentV105'),'Cooperation alignment V10.5 marker missing.');
assert(!coreService.includes('normalizeDock'),'Cooperation runtime must not mutate Dock.');
assert(!coreService.includes('legacyMask.remove'),'Cooperation runtime must not remove #wxMask.');

assert(ddz.includes('id="welcome-start"'),'Pure DDZ welcome Start button missing.');
assert(game.includes("$('welcome-start').addEventListener('click',startRound)"),'Pure DDZ welcome Start button is not wired to startRound.');
assert(capabilities.includes('<a href="/tools/pure-ddz/">立即在线玩</a>'),'Capability DDZ direct entry missing.');
assert(capabilities.includes('大王为本人图像'),'Capability DDZ Big Joker contract missing.');
assert(capabilities.includes('小王为官网首图“六大业务为主翼”飞机模型'),'Capability DDZ Small Joker contract missing.');

assert(/interaction continuity v[23]/i.test(interaction),'Sitewide interaction continuity baseline missing.');
assert(interaction.includes('focus-visible'),'Keyboard focus feedback missing from interaction baseline.');
assert(interaction.includes(':active'),'Active/pressed feedback missing from interaction baseline.');

console.log('PASS: R7 authoritative runtime contract — Dock V5, Pure DDZ exclusion/centering, homepage/nav redline V2, DDZ start flow and interaction feedback are protected.');
