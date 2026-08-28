#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
function read(relative){return fs.readFileSync(path.join(root,relative),'utf8')}
function assert(ok,message){if(!ok)throw new Error(message)}
function trackedHtml(){return execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean)}
function isOwnershipArtifact(relative){return /^(?:baidu_verify_codeva-[^/]+\.html|google[^/]+\.html|zohoverify\/verifyforzoho\.html)$/i.test(relative)}

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
const ddzClosure=read('tools/pure-ddz/game/css/r8-closure-v128.css');
const game=read('tools/pure-ddz/game/js/game.js');
const semanticsCss=read('site-interaction-semantics-v1.css');
const semanticsJs=read('site-interaction-semantics-v1.js');

const baselineLower=String(runtimeBaseline).toLowerCase();
assert(new RegExp(`mode\\s*:\\s*['\"]atomic-first-paint-${baselineLower}['\"]`).test(navigation),`Navigation wrapper no longer declares the ${runtimeBaseline} static first-paint baseline.`);
assert(navigation.includes('navigation runtime v45'),'Navigation wrapper is not the current V45 single-responsibility runtime.');
assert(navigation.includes('r7DockSingleAuthority:true'),'Navigation does not declare Dock single-authority ownership.');
assert(navigation.includes('r7NoNavigationDockMutation:true'),'Navigation still claims Dock mutation responsibility.');
assert(!/new\s+MutationObserver\s*\(/.test(navigation),'Navigation must not continuously rewrite navigation/Dock through MutationObserver.');
assert(navigation.includes('unifiedHeaderAxis:true'),'Unified header axis contract missing.');
assert(navigation.includes('headerAxisWidth:1560'),'Header axis is not governed at 1560px.');
assert(contentAxis.includes('--qily-content-axis:1560px'),'Unified 1560px content axis is missing.');
assert(headerAxis.includes('--qily-header-axis:var(--qily-content-axis,1560px)'),'Header does not inherit the 1560px content axis.');

assert(dockRuntime.includes('Floating Dock Authoritative Runtime V5.1'),'Authoritative Dock V5.1 missing.');
assert(dockRuntime.includes("ORDER=['home','top','back','search','current','contact']"),'Dock order contract missing.');
assert(dockRuntime.includes("LABELS={home:'首页',top:'回顶部',back:'回上一层',search:'本站搜索',current:'分享当前页',contact:'联系我们'}"),'Dock label contract drifted.');
assert(dockRuntime.includes("EXCLUDED=/^\\/tools\\/pure-ddz"),'Pure DDZ Dock exclusion missing.');
assert(dockRuntime.includes('data-qily-dock="disabled"'),'Pure DDZ disabled-Dock state missing.');
assert(dockRuntime.includes('createStandaloneDock'),'Standalone Dock fallback missing.');
assert(dockRuntime.includes('installAuthoritativeEvents'),'Authoritative Dock event handler missing.');
assert(dockRuntime.includes("if(action==='top')"),'回顶部 function missing.');
assert(dockRuntime.includes("if(action==='back')"),'回上一层 function missing.');
assert(dockRuntime.includes("if(action==='search')"),'本站搜索 function missing.');
assert(dockRuntime.includes("if(action==='current')"),'分享当前页 function missing.');
assert(dockRuntime.includes("if(action==='contact')"),'联系我们 function missing.');
assert(!/new\s+MutationObserver\s*\(/.test(dockRuntime),'R8 violation: Dock runtime must not continuously rebuild DOM.');

assert(contactRoute.includes('__qilySiteShellRecoveryV131'),'Site Shell Recovery V13.1 missing.');
assert(contactRoute.includes('__qilyFloatingDockUnifiedV51'),'Contact route does not defer to Dock V5.1.');
assert(contactRoute.includes('/site-dock-share-runtime-v1.js?v=20260828-authority-v51'),'Dock V5.1 cache owner missing.');
assert(contactRoute.includes('/site-public-redline-closure-v1.css?v=20260828-home-dock-v2'),'Redline V2 cache owner missing.');
assert(contactRoute.includes('canonical shared contact panel'),'Canonical contact-panel preservation marker missing.');
assert(!contactRoute.includes('removeLegacyContactModal'),'Canonical #wxMask must not be removed by shared recovery.');
assert(!contactRoute.includes('mask.remove()'),'Shared recovery must not delete #wxMask.');
assert(contactRoute.includes('html:not([data-qily-dock="disabled"]) body #floatDock'),'Shared recovery can still force disabled Dock visible.');
assert(contactMaterializer.includes('20260828-dock-functional-public-v131'),'Contact-route V13.1 cache owner missing.');
assert(contactMaterializer.includes('data-qily-contact-route-direct="v13.1"'),'Contact-route V13.1 static marker missing.');
assert(contactMaterializer.includes('20260828-authority-v51'),'Dock V5.1 static cache owner missing.');

assert(redline.includes('Public Redline Closure V2'),'Public redline V2 missing.');
assert(redline.includes('header.qily-global-header'),'Unified top navigation rule missing.');
assert(redline.includes('body.qily-home-v3 .hero .hero-grid'),'Homepage hero containment rule missing.');
assert(redline.includes('background:#eef7f5!important'),'Homepage outer hero neutral surface missing.');
assert(redline.includes('#pure-ddz-digital-tool'),'Capability DDZ direct-link protection missing.');
assert(capabilities.includes('<a href="/tools/pure-ddz/">立即在线玩</a>'),'Capability DDZ direct link missing.');
assert(ddz.includes('id="welcome-start"'),'Pure DDZ welcome Start button missing.');
assert(game.includes("$('welcome-start').addEventListener('click',startRound)"),'Pure DDZ welcome Start is not bound to startRound.');
assert(ddzClosure.includes('Pure DDZ R8 Closure V128'),'Pure DDZ R8 closure missing.');
assert(ddzClosure.includes('html:not(.ddz-ready) body .game-shell'),'Pure DDZ clean first-paint gate missing.');
assert(ddzClosure.includes('left:50%!important'),'Pure DDZ local player centering rule missing.');
assert(ddzClosure.includes('justify-content:center!important'),'Pure DDZ desktop hand centering rule missing.');

assert(semanticsCss.includes('Interaction Semantics V1.1'),'Interaction semantics CSS V1.1 missing.');
assert(semanticsCss.includes('[data-qily-interaction="route"]'),'Route feedback contract missing.');
assert(semanticsCss.includes('[data-qily-interaction="static"]'),'Static terminology feedback-suppression contract missing.');
assert(semanticsCss.includes('content:"回\\A顶部"'),'Dock 回顶部 visual label contract missing.');
assert(semanticsCss.includes('content:"回\\A上一层"'),'Dock 回上一层 visual label contract missing.');
assert(semanticsJs.includes('__qilyInteractionSemanticsV11'),'Interaction semantics V1.1 runtime missing.');
assert(semanticsJs.includes('freezeStaticVisual'),'Static term visual-state freeze missing.');

assert(/const\s+SAFE_VERSION\s*=\s*['"]20260828-long-page-resilience-v5['"]/.test(materializer),'Long-page translation version owner missing.');
assert(materializer.includes("const BASELINE_VERSION='20260828-r8-authoritative-v20'"),'R8 V20 global materializer missing.');
assert(materializer.includes('site-interaction-semantics-v1.css?v=20260828-r8-semantics-v11'),'Sitewide interaction semantics CSS is not materialized.');
assert(materializer.includes('r8-closure-v128.css?v=20260828-r8-v128'),'Pure DDZ R8 closure is not materialized.');
assert(safe.includes('function retryFailedAdaptive('),'Adaptive translation retry missing.');
assert(safe.includes('function scheduleHealing('),'Background translation healing missing.');
assert(contentContrastCss.includes('--ql-dark-title:#fff'),'Dark-surface text token missing.');
assert(home.includes('<!-- QILY-AIRCRAFT-BRAND-HERO-V1:START -->'),'Homepage aircraft brand hero start marker missing.');

let navigationPages=0,contactPages=0,staleContact=[],staleSemantics=[],ownershipArtifacts=0;
for(const relative of trackedHtml()){
  const html=read(relative);
  if(isOwnershipArtifact(relative)){ownershipArtifacts+=1;continue;}
  if(/\/site-navigation\.js(?:\?v=[^"']*)?/.test(html))navigationPages+=1;
  if(/\/site-contact-route-v1\.js(?:\?v=[^"']*)?/.test(html)){
    contactPages+=1;
    if(!html.includes('/site-contact-route-v1.js?v=20260828-dock-functional-public-v131')||!html.includes('data-qily-contact-route-direct="v13.1"')||!html.includes('/site-public-redline-closure-v1.css?v=20260828-home-dock-v2'))staleContact.push(relative);
  }
  if(!html.includes('/site-interaction-semantics-v1.css?v=20260828-r8-semantics-v11')||!html.includes('/site-interaction-semantics-v1.js?v=20260828-r8-semantics-v11'))staleSemantics.push(relative);
}
assert(navigationPages>=460,`Navigation coverage unexpectedly fell to ${navigationPages} pages.`);
assert(contactPages>=470,`Contact/shared recovery coverage unexpectedly fell to ${contactPages} pages.`);
assert(staleContact.length===0,`Stale R8 contact/public pages: ${staleContact.slice(0,12).join(', ')}`);
assert(staleSemantics.length===0,`Stale interaction-semantics pages: ${staleSemantics.slice(0,12).join(', ')}`);
process.stdout.write(`PASS: R8 sitewide remediation validates ${navigationPages} navigation pages and ${contactPages} shared recovery pages; ${ownershipArtifacts} search-engine ownership artifacts correctly remain shell-free; Dock V5.1 is authoritative, Pure DDZ is clean-first-paint/centered, and route-vs-static interaction semantics are protected (${runtimeBaseline}).\n`);
