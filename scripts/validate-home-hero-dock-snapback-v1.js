#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
function read(relative){return fs.readFileSync(path.join(root,relative),'utf8')}
function assert(ok,message){if(!ok)throw new Error(message)}

const runtimeBaseline=JSON.parse(read('data/site-system-v4.json')).runtimeBaseline;
const atomicMode=`mode: 'atomic-first-paint-${String(runtimeBaseline).toLowerCase()}'`;
const navigation=read('site-navigation.js');
assert(navigation.includes("dockPositionPersistence: false"),'navigation feature contract still enables dock position persistence');
assert(navigation.includes("dockAutoHome: 'bottom-right'"),'navigation feature contract does not declare bottom-right auto-home');
assert(navigation.includes('/site-navigation-core.js?v=20260824-contact-channel-v30'),'navigation core cache version is not contact-channel v30');
assert(navigation.includes('/site-floating-dock-standard-v1.css?v=20260819-dock-snapback-v3'),'navigation dock stylesheet cache version is not snapback v3');
assert(navigation.includes(atomicMode),`protected ${runtimeBaseline} navigation baseline is missing`);
assert(navigation.includes('translationAwareSelfHeal: true'),'language-aware navigation self-heal contract is missing');
assert(navigation.includes('unifiedHeaderAxis: true'),'unified header axis contract is missing');
assert(navigation.includes('headerAxisWidth: 1560'),'1560px header axis contract is missing');

const home=read('index.html');
const materializer=read('scripts/materialize-global-language-v3.js');
const safeRuntime='/site-translation-safe-runtime-v1.js?v=20260828-long-page-resilience-v5';
const navRuntime='/site-navigation.js?v=20260827-translation-dock-resource-v46';
const headerAxis='/site-header-axis-v1.css?v=20260827-primary-navigation-unified-v4';
const progressScript='/site-translation-progress-v1.js?v=20260828-long-page-resilience-v5';
const publicUi='/site-translation-public-ui-v1.js?v=20260825-public-language-picker-v6';
const publicUiCss='/site-translation-public-ui-v1.css?v=20260827-primary-navigation-unified-v8';
const contentContrast='/site-content-contrast-guard-v1.js?v=20260826-sitewide-content-contrast-v6';
const sharedShell='/site-ui-consistency-v1.js?v=20260828-translation-resilience-v47';
const finalViGuard='/site-stability-recovery-v1.css?v=20260828-vi-surface-v3';
const publishReady=
  materializer.includes("const SAFE_VERSION = '20260828-long-page-resilience-v5'")&&
  materializer.includes('data-qily-translation-safety-bootstrap="inpage-v4"')&&
  materializer.includes('<script defer data-qily-translation-safe-direct="inpage-v4"')&&
  materializer.includes('data-qily-translation-progress-direct="bilingual-v4"')&&
  materializer.includes('data-qily-content-contrast-direct="v6"')&&
  !materializer.includes('LEGACY_LANGUAGE_SRC');
function ready(token){return home.includes(token)||materializer.includes(token)}

assert(home.includes('/site-home-hero-tune-v1.css?v=20260819-home-hero-align-v3'),'homepage does not reference Hero V3');
assert(home.includes('/site-floating-dock-standard-v1.css?v=20260819-dock-snapback-v3'),'homepage does not reference Dock Snapback V3');
assert(ready(navRuntime),'homepage Navigation V46 is neither materialized nor queued');
assert(ready(headerAxis),'primary-navigation unified 1560px Header Axis is neither materialized nor queued');
assert(ready(progressScript),'long-page-resilient translation progress notice is neither materialized nor queued');
assert(ready(publicUi),'full-language public UI JS is neither materialized nor queued');
assert(ready(publicUiCss),'unified primary-navigation public UI CSS is neither materialized nor queued');
assert(ready(contentContrast),'sitewide content readability V6 guard is neither materialized nor queued');
assert(ready(sharedShell),'translation/Dock shared-shell runtime V47 is neither materialized nor queued');
assert(home.includes(safeRuntime)||publishReady,'long-page-resilient safe in-page translation baseline is neither materialized nor queued');
assert(ready(finalViGuard),'sitewide final VI surface guard V3 is neither materialized nor queued');
assert(!materializer.includes('<script defer ${LEGACY_MARKER}'),'retired external-proxy translator is still queued for publication');
assert(home.includes('font-size:clamp(40px,3.6vw,52px)!important'),'homepage first-paint parity is not using the reduced hero headline tier');
process.stdout.write(`PASS: homepage Hero/Dock stay protected on ${runtimeBaseline} while 2026-08-28 long-page translation resilience V5, semantic Dock behavior, complete language labels, mobile touch navigation, 1560px Header Axis, content contrast V6 and final VI surface V3 are materialized or queued.\n`);