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
const home=read('index.html');
const materializer=read('scripts/materialize-global-language-v3.js');

/* Static V4 first-paint contract remains intact, while the active wrapper is Navigation V45. */
const baseline=String(runtimeBaseline).toLowerCase();
assert(new RegExp(`mode\\s*:\\s*['\"]atomic-first-paint-${baseline}['\"]`).test(navigation),`protected ${runtimeBaseline} navigation baseline is missing`);
assert(navigation.includes('navigation runtime v45'),'current navigation wrapper is not V45');
assert(navigation.includes('dockPositionPersistence:false'),'navigation feature contract still enables Dock position persistence');
assert(navigation.includes("dockAutoHome:'bottom-right'"),'navigation feature contract does not declare bottom-right Dock home');
assert(navigation.includes('/site-navigation-core.js?v=20260824-contact-channel-v30'),'navigation core cache version is not contact-channel v30');
assert(navigation.includes('/site-floating-dock-standard-v1.css?v=20260819-dock-snapback-v3'),'navigation Dock stylesheet cache version is not snapback v3');
assert(navigation.includes('translationAwareSelfHeal:true'),'language-aware navigation self-heal contract is missing');
assert(navigation.includes('unifiedHeaderAxis:true'),'unified header axis contract is missing');
assert(navigation.includes('headerAxisWidth:1560'),'1560px header axis contract is missing');
assert(navigation.includes('r7DockSingleAuthority:true'),'navigation does not defer Dock ownership');
assert(navigation.includes('r7NoNavigationDockMutation:true'),'navigation may still mutate Dock');
assert(!/new\s+MutationObserver\s*\(/.test(navigation),'navigation must not continuously rebuild Dock/navigation');

/* Dock V5.1 is the sole command/behavior owner; presentation wording is unified by semantics V1.1. */
assert(dock.includes('Floating Dock Authoritative Runtime V5.1'),'Dock V5.1 authority missing');
assert(dock.includes("LABELS={home:'首页',top:'回顶部',back:'回上一层',search:'本站搜索',current:'分享当前页',contact:'联系我们'}"),'Dock canonical wording drifted');
assert(!/new\s+MutationObserver\s*\(/.test(dock),'Dock authority must not continuously rebuild DOM');
assert(semanticsCss.includes('content:"回\\A顶部"'),'回顶部 sitewide visual treatment missing');
assert(semanticsCss.includes('content:"回\\A上一层"'),'回上一层 sitewide visual treatment missing');

const safeRuntime='/site-translation-safe-runtime-v1.js?v=20260828-long-page-resilience-v5';
const navRuntime='/site-navigation.js?v=20260828-r7-navigation-v45';
const dockRuntime='/site-dock-share-runtime-v1.js?v=20260828-authority-v51';
const semantics='/site-interaction-semantics-v1.js?v=20260828-r8-semantics-v11';
const semanticsStyle='/site-interaction-semantics-v1.css?v=20260828-r8-semantics-v11';
const contactRoute='/site-contact-route-v1.js?v=20260828-dock-functional-public-v131';
const headerAxis='/site-header-axis-v1.css?v=20260827-primary-navigation-unified-v4';
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
assert(ready(dockRuntime),'homepage Dock V5.1 is neither materialized nor queued');
assert(ready(semantics),'sitewide interaction semantics V1.1 JS is neither materialized nor queued');
assert(ready(semanticsStyle),'sitewide interaction semantics V1.1 CSS is neither materialized nor queued');
assert(ready(contactRoute),'Contact Route V13.1 is neither materialized nor queued');
assert(ready(headerAxis),'primary-navigation unified 1560px Header Axis is neither materialized nor queued');
assert(ready(progressScript),'long-page-resilient translation progress notice is neither materialized nor queued');
assert(ready(publicUi),'full-language public UI JS is neither materialized nor queued');
assert(ready(publicUiCss),'unified primary-navigation public UI CSS is neither materialized nor queued');
assert(ready(contentContrast),'sitewide content readability V6 guard is neither materialized nor queued');
assert(ready(sharedShell),'R8 shared-shell runtime is neither materialized nor queued');
assert(ready(safeRuntime),'long-page-resilient safe in-page translation baseline is neither materialized nor queued');
assert(ready(finalViGuard),'sitewide final VI surface guard V3 is neither materialized nor queued');
assert(!materializer.includes('LEGACY_LANGUAGE_SRC'),'retired external-proxy translator is still queued for publication');
assert(home.includes('font-size:clamp(40px,3.6vw,52px)!important'),'homepage first-paint parity is not using the reduced hero headline tier');
process.stdout.write(`PASS: R8 homepage/Dock guard protects ${runtimeBaseline} first paint, Navigation V45, Dock V5.1 text treatment, translation resilience, 1560px Header Axis and interaction semantics V1.1.\n`);
