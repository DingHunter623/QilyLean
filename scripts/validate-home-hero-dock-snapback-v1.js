#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
function read(relative){return fs.readFileSync(path.join(root,relative),'utf8')}
function assert(ok,message){if(!ok)throw new Error(message)}

const navigation=read('site-navigation.js');
assert(navigation.includes("dockPositionPersistence: false"),'navigation feature contract still enables dock position persistence');
assert(navigation.includes("dockAutoHome: 'bottom-right'"),'navigation feature contract does not declare bottom-right auto-home');
assert(navigation.includes('/site-navigation-core.js?v=20260824-contact-channel-v30'),'navigation core cache version is not contact-channel v30');
assert(navigation.includes('/site-floating-dock-standard-v1.css?v=20260819-dock-snapback-v3'),'navigation dock stylesheet cache version is not snapback v3');
assert(navigation.includes("mode: 'atomic-first-paint-v38'"),'protected V38 navigation baseline is missing');
assert(navigation.includes('translationAwareSelfHeal: true'),'language-aware navigation self-heal contract is missing');
assert(navigation.includes('unifiedHeaderAxis: true'),'unified header axis contract is missing');
assert(navigation.includes('headerAxisWidth: 1560'),'1560px header axis contract is missing');

const home=read('index.html');
const materializer=read('scripts/materialize-global-language-v3.js');
const safeRuntime='/site-translation-safe-runtime-v1.js?v=20260825-translation-safe-inpage-v2';
const navRuntime='/site-navigation.js?v=20260825-language-runtime-compat-v42';
const headerAxis='/site-header-axis-v1.css?v=20260825-header-axis-nav-fit-v2';
const progressScript='/site-translation-progress-v1.js?v=20260825-bilingual-progress-v3';
const publicUi='/site-translation-public-ui-v1.js?v=20260825-public-language-picker-v6';
const contentContrast='/site-content-contrast-guard-v1.js?v=20260825-sitewide-content-contrast-v2';
const publishReady=
  materializer.includes("const BASELINE_VERSION = '20260825-sitewide-baseline-reconcile-v1'")&&
  materializer.includes('data-qily-translation-safety-bootstrap="inpage-v2"')&&
  materializer.includes('data-qily-translation-safe-direct="inpage-v2"')&&
  !materializer.includes('LEGACY_LANGUAGE_SRC');
function ready(token){return home.includes(token)||materializer.includes(token)}

assert(home.includes('/site-home-hero-tune-v1.css?v=20260819-home-hero-align-v3'),'homepage does not reference Hero V3');
assert(home.includes('/site-floating-dock-standard-v1.css?v=20260819-dock-snapback-v3'),'homepage does not reference Dock Snapback V3');
assert(ready(navRuntime),'homepage Navigation V42 is neither materialized nor queued');
assert(ready(headerAxis),'1560px Header Axis is neither materialized nor queued');
assert(ready(progressScript),'bilingual translation progress notice is neither materialized nor queued');
assert(ready(publicUi),'full-language public UI is neither materialized nor queued');
assert(ready(contentContrast),'sitewide content readability guard is neither materialized nor queued');
assert(home.includes(safeRuntime)||publishReady,'safe in-page translation baseline is neither materialized nor queued');
assert(!materializer.includes('<script defer ${LEGACY_MARKER}'),'retired external-proxy translator is still queued for publication');
assert(home.includes('font-size:clamp(40px,3.6vw,52px)!important'),'homepage first-paint parity is not using the reduced hero headline tier');
process.stdout.write('PASS: homepage Hero/Dock stay protected while safe translation, complete language labels, 1560px Header Axis and content readability are materialized or queued.\n');
