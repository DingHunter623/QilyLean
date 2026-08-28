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
const materializer=read('scripts/materialize-global-language-v3.js');
const contentAxis=read('site-content-axis-v1.css');
const headerAxis=read('site-header-axis-v1.css');
const dockRetirement=read('site-dock-share-runtime-v1.js');
const contactRoute=read('site-contact-route-v1.js');
const safe=read('site-translation-safe-runtime-v1.js');
const contentContrastCss=read('site-content-contrast-guard-v1.css');
const home=read('index.html');

assert(navigation.includes(`mode: 'atomic-first-paint-${String(runtimeBaseline).toLowerCase()}'`),`Navigation wrapper is not ${runtimeBaseline}.`);
assert(navigation.includes('unifiedHeaderAxis: true'),'Unified header axis contract missing.');
assert(navigation.includes('headerAxisWidth: 1560'),'Header axis is not governed at 1560px.');
assert(contentAxis.includes('--qily-content-axis:1560px'),'Unified 1560px content axis is missing.');
assert(headerAxis.includes('--qily-header-axis:var(--qily-content-axis,1560px)'),'Header does not inherit the 1560px content axis.');

/* 2026-08-28 product decision: the lower-right floating module is retired sitewide. */
assert(dockRetirement.includes('__qilyFloatingDockRetiredV1'),'Floating Dock retirement runtime is missing.');
assert(dockRetirement.includes("querySelectorAll('#floatDock,.qily-float-dock,.qily-floating-dock')"),'Floating Dock DOM removal guard is missing.');
assert(contactRoute.includes('__qilySiteShellRecoveryV9'),'Site shell recovery V9 is missing.');
assert(contactRoute.includes("'#floatDock,.qily-float-dock,.qily-floating-dock{display:none!important"),'Zero-flicker Dock retirement CSS is missing.');
assert(contactRoute.includes('installRetirementObserver'),'Legacy shell Dock resurrection guard is missing.');
assert(!contactRoute.includes('function ensureDock'),'Retired Dock creator returned to contact-route recovery.');

/* DDZ screenshot closure: deep controls white, local hand centered, Dock absent. */
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

let navigationPages=0;
for(const relative of trackedHtml()){
  const html=read(relative);
  if(/\/site-navigation\.js(?:\?v=[^"']*)?/.test(html))navigationPages+=1;
}
assert(navigationPages>=460,`Navigation coverage unexpectedly fell to ${navigationPages} pages.`);
process.stdout.write(`PASS: sitewide remediation validates ${navigationPages} navigation pages; floating Dock retired; DDZ contrast/hand alignment locked (${runtimeBaseline}).\n`);
