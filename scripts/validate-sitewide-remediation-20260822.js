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
const core=read('site-navigation-core.js');
const consistency=read('site-ui-consistency-v1.js');
const dockRuntime=read('site-dock-share-runtime-v1.js');
const contactRoute=read('site-contact-route-v1.js');
const materializer=read('scripts/materialize-global-language-v3.js');
const contactMaterializer=read('scripts/materialize-contact-route-v6.js');
const contentAxis=read('site-content-axis-v1.css');
const headerAxis=read('site-header-axis-v1.css');
const safe=read('site-translation-safe-runtime-v1.js');
const contentContrastCss=read('site-content-contrast-guard-v1.css');
const home=read('index.html');

assert(navigation.includes(`mode: 'atomic-first-paint-${String(runtimeBaseline).toLowerCase()}'`),`Navigation wrapper is not ${runtimeBaseline}.`);
assert(navigation.includes('unifiedHeaderAxis: true'),'Unified header axis contract missing.');
assert(navigation.includes('headerAxisWidth: 1560'),'Header axis is not governed at 1560px.');
assert(contentAxis.includes('--qily-content-axis:1560px'),'Unified 1560px content axis is missing.');
assert(headerAxis.includes('--qily-header-axis:var(--qily-content-axis,1560px)'),'Header does not inherit the 1560px content axis.');

/* 2026-08-28 final product decision: retain one functional six-action public Dock sitewide. */
assert(navigation.includes("dockOrder: ['home','top','back','search','current','contact']"),'Navigation six-action Dock order missing.');
assert(core.includes('data-action="home"')&&core.includes('data-action="top"')&&core.includes('data-action="back"')&&core.includes('data-action="search"')&&core.includes('data-action="current"')&&core.includes('data-action="contact"'),'Core Dock actions incomplete.');
assert(dockRuntime.includes('__qilyFloatingDockUnifiedV3'),'Unified Dock runtime V3 missing.');
assert(dockRuntime.includes("ORDER=['home','top','back','search','current','contact']"),'Unified Dock order contract missing.');
assert(dockRuntime.includes('createStandaloneDock'),'Standalone Dock creation fallback missing.');
assert(dockRuntime.includes('installStandaloneFallback'),'Standalone Dock functional fallback missing.');
assert(dockRuntime.includes("action==='top'?'↑':'↗'"),'Adopted top/back semantic symbols missing.');
assert(dockRuntime.includes("normalizeSemanticButton(controls.top,'top',LABELS.top)"),'Top semantic symbol normalization missing.');
assert(dockRuntime.includes("normalizeSemanticButton(controls.back,'back',LABELS.back)"),'Back semantic symbol normalization missing.');
assert(dockRuntime.includes("if(action==='contact'){location.href='/contact/';}"),'Standalone contact action missing.');
assert(dockRuntime.includes("if(action==='search'){openSearch();return;}"),'Standalone search action missing.');
assert(dockRuntime.includes("if(action==='current'){shareCurrent();return;}"),'Standalone share action missing.');
assert(dockRuntime.includes('--qily-dock-v3-bg:#0f4b5a'),'Unified Dock visual token missing.');
assert(!dockRuntime.includes('function removeDock'),'Retired Dock removal logic returned.');
assert(!dockRuntime.includes('retireNow'),'Retired Dock runtime returned.');
assert(consistency.includes('qily-dock-semantic-icon'),'Shared UI consistency semantic Dock icon missing.');
assert(consistency.includes("normalizeDockButton(top,'top','顶部')"),'Shared top symbol normalization missing.');
assert(consistency.includes("normalizeDockButton(back,'back','上一层')"),'Shared back symbol normalization missing.');

assert(contactRoute.includes('__qilySiteShellRecoveryV11'),'Site Shell Recovery V11 missing.');
assert(contactRoute.includes('disconnectRetiredDockObserver'),'Old Dock-retirement observer cleanup missing.');
assert(contactRoute.includes('ensureDockRuntime'),'Dock V3 bootstrap missing from shared recovery.');
assert(contactRoute.includes('qilyDockUnifiedRuntimeV3Script'),'Dock V3 bootstrap script marker missing.');
assert(contactRoute.includes('/site-dock-share-runtime-v1.js?v=20260828-functional-public-v3'),'Dock V3 cache owner missing.');
assert(contactRoute.includes('canonical shared contact panel'),'Canonical contact-panel preservation marker missing.');
assert(!contactRoute.includes('removeLegacyContactModal'),'Canonical #wxMask must not be removed by shared recovery.');
assert(!contactRoute.includes('mask.remove()'),'Shared recovery must not delete #wxMask.');
assert(contactRoute.includes('#floatDock.qily-float-dock,#floatDock.qily-floating-dock{display:flex!important'),'Floating Dock visible recovery missing.');
assert(!contactRoute.includes('installRetirementObserver'),'Dock retirement observer must not return.');
assert(!contactRoute.includes('retireDock();'),'Dock retirement call must not return.');
assert(contactMaterializer.includes('20260828-dock-functional-public-v11'),'Contact-route V11 cache owner missing.');
assert(contactMaterializer.includes('data-qily-contact-route-direct="v11"'),'Contact-route V11 static marker missing.');

/* DDZ screenshot closure remains intact. */
assert(contactRoute.includes('.topbar .top-actions :is(#audio-toggle,#help-open,#settings-open)'),'DDZ top-action high-contrast rule missing.');
assert(contactRoute.includes('-webkit-text-fill-color:#fff!important'),'DDZ top-action white text lock missing.');
assert(contactRoute.includes('.table-wrap .me-player{left:50%!important'),'DDZ local player center axis missing.');
assert(contactRoute.includes('width:min(1180px,calc(100% - 64px))!important'),'DDZ local player centered width contract missing.');
assert(contactRoute.includes('justify-content:safe center!important'),'DDZ hand safe-center contract missing.');

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
    if(!html.includes('/site-contact-route-v1.js?v=20260828-dock-functional-public-v11')||!html.includes('data-qily-contact-route-direct="v11"'))staleContact.push(relative);
  }
}
assert(navigationPages>=460,`Navigation coverage unexpectedly fell to ${navigationPages} pages.`);
assert(contactPages>=470,`Contact/shared recovery coverage unexpectedly fell to ${contactPages} pages.`);
assert(staleContact.length===0,`Stale contact/Dock recovery pages: ${staleContact.slice(0,12).join(', ')}`);
process.stdout.write(`PASS: sitewide remediation validates ${navigationPages} navigation pages and ${contactPages} shared recovery pages; Dock V3 is functional both with and without the full site shell (${runtimeBaseline}).\n`);
