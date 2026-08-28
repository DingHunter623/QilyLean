#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
function read(relative){return fs.readFileSync(path.join(root,relative),'utf8')}
function assert(ok,message){if(!ok)throw new Error(message)}

const runtimeBaseline=JSON.parse(read('data/site-system-v4.json')).runtimeBaseline;
const navigation=read('site-navigation.js');
const dock=read('site-dock-share-runtime-v1.js');
const semanticsCss=read('site-interaction-semantics-v1.css');
const header=read('site-header-axis-v1.css');
const home=read('index.html');
const materializer=read('scripts/materialize-global-language-v3.js');

const baseline=String(runtimeBaseline).toLowerCase();
assert(new RegExp(`mode\\s*:\\s*['\"]atomic-first-paint-${baseline}['\"]`).test(navigation),`protected ${runtimeBaseline} navigation baseline is missing`);
assert(navigation.includes('navigation runtime v45'),'current navigation wrapper is not V45');
assert(navigation.includes('dockPositionPersistence:false'),'navigation feature contract still enables Dock position persistence');
assert(navigation.includes("dockAutoHome:'bottom-right'"),'navigation feature contract does not declare bottom-right Dock home');
assert(navigation.includes('r7DockSingleAuthority:true'),'navigation does not defer Dock ownership');
assert(navigation.includes('r7NoNavigationDockMutation:true'),'navigation may still mutate Dock');
assert(!/new\s+MutationObserver\s*\(/.test(navigation),'navigation must not continuously rebuild Dock/navigation');

/* Dock V5.2 is sole structure/text/action owner. No CSS pseudo-labels are allowed. */
assert(dock.includes('Floating Dock Authoritative Runtime V5.2'),'Dock V5.2 authority missing');
assert(dock.includes('__qilyFloatingDockUnifiedV52'),'Dock V5.2 guard missing');
assert(dock.includes('setOwnedLabel'),'Dock single-label owner missing');
assert(dock.includes('qily-dock-label'),'Dock canonical text wrapper missing');
assert(dock.includes('--qily-dock-size:56px'),'mobile Dock canonical size missing');
assert(!/new\s+MutationObserver\s*\(/.test(dock),'Dock authority must not continuously rebuild DOM');
assert(semanticsCss.includes('Interaction Semantics V1.2'),'Interaction semantics V1.2 missing');
assert(!semanticsCss.includes('content:"回\\A顶部"'),'duplicate 回顶部 pseudo-label returned');
assert(!semanticsCss.includes('content:"回\\A上一层"'),'duplicate 回上一层 pseudo-label returned');
assert(semanticsCss.includes('.qily-float-btn::before'),'Dock pseudo reset missing');

assert(header.includes('Global Header Axis V1.1'),'Header Axis V1.1 missing');
assert(header.includes('overflow-x:auto!important'),'desktop nav horizontal scrolling missing');
assert(header.includes('overflow-x:scroll!important'),'mobile nav horizontal scrolling missing');
assert(header.includes('scrollbar-width:thin!important'),'visible nav scrollbar missing');

const safeRuntime='/site-translation-safe-runtime-v1.js?v=20260828-long-page-resilience-v5';
const navRuntime='/site-navigation.js?v=20260828-r7-navigation-v45';
const dockRuntime='/site-dock-share-runtime-v1.js?v=20260829-authority-v52';
const semantics='/site-interaction-semantics-v1.js?v=20260829-r9-semantics-v12';
const semanticsStyle='/site-interaction-semantics-v1.css?v=20260829-r9-semantics-v12';
const contactRoute='/site-contact-route-v1.js?v=20260828-dock-functional-public-v131';
const headerAxis='/site-header-axis-v1.css?v=20260829-primary-navigation-scroll-v5';
const progressScript='/site-translation-progress-v1.js?v=20260828-long-page-resilience-v5';
const publicUi='/site-translation-public-ui-v1.js?v=20260825-public-language-picker-v6';
const publicUiCss='/site-translation-public-ui-v1.css?v=20260827-primary-navigation-unified-v8';
const contentContrast='/site-content-contrast-guard-v1.js?v=20260826-sitewide-content-contrast-v6';
const sharedShell='/site-ui-consistency-v1.js?v=20260828-r7-single-responsibility-v7';
const finalViGuard='/site-stability-recovery-v1.css?v=20260828-vi-surface-v3';
function ready(token){return home.includes(token)||materializer.includes(token)}

assert(home.includes('/site-home-hero-tune-v1.css?v=20260819-home-hero-align-v3'),'homepage does not reference Hero V3');
assert(home.includes('/site-floating-dock-standard-v1.css?v=20260819-dock-snapback-v3'),'homepage does not reference Dock Snapback V3');
assert(ready(navRuntime),'homepage Navigation V45 is neither materialized nor queued');
assert(ready(dockRuntime),'homepage Dock V5.2 is neither materialized nor queued');
assert(ready(semantics),'sitewide interaction semantics V1.2 JS is neither materialized nor queued');
assert(ready(semanticsStyle),'sitewide interaction semantics V1.2 CSS is neither materialized nor queued');
assert(ready(contactRoute),'Contact Route V13.1 is neither materialized nor queued');
assert(ready(headerAxis),'R9 Header Axis with visible scrolling is neither materialized nor queued');
assert(ready(progressScript),'long-page-resilient translation progress notice is neither materialized nor queued');
assert(ready(publicUi),'full-language public UI JS is neither materialized nor queued');
assert(ready(publicUiCss),'unified primary-navigation public UI CSS is neither materialized nor queued');
assert(ready(contentContrast),'sitewide content readability V6 guard is neither materialized nor queued');
assert(ready(sharedShell),'R9 shared-shell runtime is neither materialized nor queued');
assert(ready(safeRuntime),'long-page-resilient safe in-page translation baseline is neither materialized nor queued');
assert(ready(finalViGuard),'sitewide final VI surface guard V3 is neither materialized nor queued');
assert(!materializer.includes('LEGACY_LANGUAGE_SRC'),'retired external-proxy translator is still queued for publication');
assert(home.includes('font-size:clamp(40px,3.6vw,52px)!important'),'homepage first-paint parity is not using the reduced hero headline tier');
process.stdout.write(`PASS: R9 homepage/Dock guard protects ${runtimeBaseline} first paint, Navigation V45, uniform Dock V5.2, visible nav scrolling, translation resilience and interaction semantics V1.2.\n`);
