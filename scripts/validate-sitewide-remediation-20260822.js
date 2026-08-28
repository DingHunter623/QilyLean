#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
function read(relative){return fs.readFileSync(path.join(root,relative),'utf8')}
function assert(ok,message){if(!ok)throw new Error(message)}
function trackedHtml(){return execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean)}

const runtimeBaseline=JSON.parse(read('data/site-system-v4.json')).runtimeBaseline;
const navigation=read('site-navigation.js');
const dockRuntime=read('site-dock-share-runtime-v1.js');
const contactRoute=read('site-contact-route-v1.js');
const materializer=read('scripts/materialize-global-language-v3.js');
const contactMaterializer=read('scripts/materialize-contact-route-v6.js');
const contentAxis=read('site-content-axis-v1.css');
const headerAxis=read('site-header-axis-v1.css');
const safe=read('site-translation-safe-runtime-v1.js');
const contentContrastCss=read('site-content-contrast-guard-v1.css');
const home=read('index.html');
const redline=read('site-public-redline-closure-v1.css');
const capabilities=read('capabilities/index.html');
const ddz=read('tools/pure-ddz/index.html');
const game=read('tools/pure-ddz/game/js/game.js');

assert(navigation.includes(`mode: 'atomic-first-paint-${String(runtimeBaseline).toLowerCase()}'`),`Navigation wrapper is not ${runtimeBaseline}.`);
assert(navigation.includes('unifiedHeaderAxis: true'),'Unified header axis contract missing.');
assert(navigation.includes('headerAxisWidth: 1560'),'Header axis is not governed at 1560px.');
assert(contentAxis.includes('--qily-content-axis:1560px'),'Unified 1560px content axis is missing.');
assert(headerAxis.includes('--qily-header-axis:var(--qily-content-axis,1560px)'),'Header does not inherit the 1560px content axis.');

/* 2026-08-28 R7 decision: one authoritative six-action public Dock, except Pure DDZ immersive surface. */
assert(dockRuntime.includes('Floating Dock Authoritative Runtime V5'),'Authoritative Dock V5 missing.');
assert(dockRuntime.includes("ORDER=['home','top','back','search','current','contact']"),'Dock order contract missing.');
assert(dockRuntime.includes("LABELS={home:'首页',top:'回顶部',back:'回上一层',search:'本站搜索',current:'分享当前页',contact:'联系我们'}"),'Dock label contract drifted.');
assert(dockRuntime.includes("EXCLUDED=/^\\/tools\\/pure-ddz"),'Pure DDZ Dock exclusion missing.');
assert(dockRuntime.includes('data-qily-dock="disabled"'),'Pure DDZ disabled-Dock state missing.');
assert(dockRuntime.includes('justify-content:safe center!important'),'Pure DDZ local hand center rule missing.');
assert(dockRuntime.includes('createStandaloneDock'),'Standalone Dock fallback missing.');
assert(dockRuntime.includes('installStandaloneFallback'),'Standalone Dock functional fallback missing.');
assert(dockRuntime.includes("if(action==='top')"),'回顶部 function missing.');
assert(dockRuntime.includes("if(action==='back')"),'回上一层 function missing.');
assert(dockRuntime.includes("if(action==='search')"),'本站搜索 function missing.');
assert(dockRuntime.includes("if(action==='current')"),'分享当前页 function missing.');
assert(dockRuntime.includes("if(action==='contact')"),'联系我们 function missing.');
assert(!dockRuntime.includes('MutationObserver'),'R7 violation: Dock runtime must not continuously rebuild DOM.');

assert(contactRoute.includes('__qilySiteShellRecoveryV13'),'Site Shell Recovery V13 missing.');
assert(contactRoute.includes('__qilyFloatingDockUnifiedV5'),'Contact route does not defer to Dock V5.');
assert(contactRoute.includes('/site-dock-share-runtime-v1.js?v=20260828-authority-v5'),'Dock V5 cache owner missing.');
assert(contactRoute.includes('/site-public-redline-closure-v1.css?v=20260828-home-dock-v2'),'Redline V2 cache owner missing.');
assert(contactRoute.includes('canonical shared contact panel'),'Canonical contact-panel preservation marker missing.');
assert(!contactRoute.includes('removeLegacyContactModal'),'Canonical #wxMask must not be removed by shared recovery.');
assert(!contactRoute.includes('mask.remove()'),'Shared recovery must not delete #wxMask.');
assert(contactRoute.includes('html:not([data-qily-dock="disabled"]) body #floatDock'),'Shared recovery can still force disabled Dock visible.');
assert(contactMaterializer.includes('20260828-dock-functional-public-v13'),'Contact-route V13 cache owner missing.');
assert(contactMaterializer.includes('data-qily-contact-route-direct="v13"'),'Contact-route V13 static marker missing.');
assert(contactMaterializer.includes('20260828-authority-v5'),'Dock V5 static cache owner missing.');

/* Homepage/navigation/CTA closure. */
assert(redline.includes('Public Redline Closure V2'),'Public redline V2 missing.');
assert(redline.includes('header.qily-global-header'),'Unified top navigation rule missing.');
assert(redline.includes('body.qily-home-v3 .hero .hero-grid'),'Homepage hero containment rule missing.');
assert(redline.includes('background:#eef7f5!important'),'Homepage outer hero neutral surface missing.');
assert(redline.includes('#pure-ddz-digital-tool'),'Capability DDZ direct-link protection missing.');
assert(capabilities.includes('<a href="/tools/pure-ddz/">立即在线玩</a>'),'Capability DDZ direct link missing.');
assert(ddz.includes('id="welcome-start"'),'Pure DDZ welcome Start button missing.');
assert(game.includes("$('welcome-start').addEventListener('click',startRound)"),'Pure DDZ welcome Start is not bound to startRound.');

/* Keep resilient translation/readability baseline intact. */
assert(materializer.includes("const SAFE_VERSION = '20260828-long-page-resilience-v5'"),'Long-page translation version owner missing.');
assert(safe.includes('function retryFailedAdaptive('),'Adaptive translation retry missing.');
assert(safe.includes('function scheduleHealing('),'Background translation healing missing.');
assert(contentContrastCss.includes('--ql-dark-title:#fff'),'Dark-surface text token missing.');
assert(home.includes('<!-- QILY-AIRCRAFT-BRAND-HERO-V1:START -->'),'Homepage aircraft brand hero start marker missing.');

let navigationPages=0,contactPages=0,staleContact=[];
for(const relative of trackedHtml()){
  const html=read(relative);
  if(/\/site-navigation\.js(?:\?v=[^"']*)?/.test(html))navigationPages+=1;
  if(/\/site-contact-route-v1\.js(?:\?v=[^"']*)?/.test(html)){
    contactPages+=1;
    if(!html.includes('/site-contact-route-v1.js?v=20260828-dock-functional-public-v13')||!html.includes('data-qily-contact-route-direct="v13"')||!html.includes('/site-public-redline-closure-v1.css?v=20260828-home-dock-v2'))staleContact.push(relative);
  }
}
assert(navigationPages>=460,`Navigation coverage unexpectedly fell to ${navigationPages} pages.`);
assert(contactPages>=470,`Contact/shared recovery coverage unexpectedly fell to ${contactPages} pages.`);
assert(staleContact.length===0,`Stale R7 public pages: ${staleContact.slice(0,12).join(', ')}`);
process.stdout.write(`PASS: sitewide remediation validates ${navigationPages} navigation pages and ${contactPages} shared recovery pages; Dock V5 is authoritative, Pure DDZ is Dock-free/centered, and R7 visual closure V2 is protected (${runtimeBaseline}).\n`);
