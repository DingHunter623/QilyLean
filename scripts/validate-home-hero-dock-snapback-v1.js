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
assert(navigation.includes('/site-header-axis-v1.css?v=20260825-header-axis-nav-fit-v1'),'header-axis runtime asset is missing');

const home=read('index.html');
const materializer=read('scripts/materialize-global-language-v3.js');
const runtime='/site-global-language-v3.js?v=20260825-global-translation-dual-route-v2';
const navRuntime='/site-navigation.js?v=20260825-language-runtime-compat-v42';
const headerAxis='/site-header-axis-v1.css?v=20260825-header-axis-nav-fit-v1';
const progressScript='/site-translation-progress-v1.js?v=20260825-bilingual-progress-v1';
const homeReady=home.includes(runtime)&&home.includes('data-qily-web-translate-direct="dual-route-v2"');
const publishReady=
  materializer.includes("const VERSION = '20260825-global-translation-dual-route-v2'")&&
  materializer.includes('/site-global-language-v3.js?v=${VERSION}')&&
  materializer.includes('data-qily-web-translate-direct="dual-route-v2"');
const navReady=home.includes(navRuntime)||materializer.includes(navRuntime);
const headerReady=home.includes(headerAxis)||materializer.includes(headerAxis);
const progressReady=home.includes(progressScript)||materializer.includes(progressScript);
assert(home.includes('/site-home-hero-tune-v1.css?v=20260819-home-hero-align-v3'),'homepage does not reference Hero V3');
assert(home.includes('/site-floating-dock-standard-v1.css?v=20260819-dock-snapback-v3'),'homepage does not reference Dock Snapback V3');
assert(navReady,'homepage Navigation V42 is neither materialized nor queued');
assert(headerReady,'1560px Header Axis V1 is neither materialized nor queued');
assert(progressReady,'bilingual translation progress notice is neither materialized nor queued');
assert(homeReady||publishReady,'Global Translation Dual Route V2 contract is neither materialized nor queued');
assert(home.includes('font-size:clamp(40px,3.6vw,52px)!important'),'homepage first-paint parity is not using the reduced hero headline tier');
process.stdout.write('PASS: homepage Hero/Dock protected; Navigation V42, 1560px Header Axis and bilingual translation progress are materialized or queued sitewide.\n');
