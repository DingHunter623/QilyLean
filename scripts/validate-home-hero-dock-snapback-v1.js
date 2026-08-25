#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

function read(relative) { return fs.readFileSync(path.join(root, relative), 'utf8'); }
function assert(ok, message) { if (!ok) throw new Error(message); }

const navigation = read('site-navigation.js');
assert(navigation.includes("dockPositionPersistence: false"), 'navigation feature contract still enables dock position persistence');
assert(navigation.includes("dockAutoHome: 'bottom-right'"), 'navigation feature contract does not declare bottom-right auto-home');
assert(navigation.includes('/site-navigation-core.js?v=20260824-contact-channel-v30'), 'navigation core cache version is not contact-channel v30');
assert(navigation.includes('/site-floating-dock-standard-v1.css?v=20260819-dock-snapback-v3'), 'navigation dock stylesheet cache version is not snapback v3');
assert(navigation.includes("mode: 'atomic-first-paint-v38'"), 'protected V38 navigation baseline is missing');
assert(navigation.includes('translationAwareSelfHeal: true'), 'language-aware navigation self-heal contract is missing');

const home = read('index.html');
assert(home.includes('/site-home-hero-tune-v1.css?v=20260819-home-hero-align-v3'), 'homepage does not reference Hero V3');
assert(home.includes('/site-floating-dock-standard-v1.css?v=20260819-dock-snapback-v3'), 'homepage does not reference Dock Snapback V3');
assert(home.includes('/site-navigation.js?v=20260825-language-runtime-compat-v41'), 'homepage does not reference language-aware Navigation V41');
assert(home.includes('/site-global-language-v3.js?v=20260825-global-language-v31'), 'homepage does not directly reference Global Language V3.1');
assert(home.includes('font-size:clamp(40px,3.6vw,52px)!important'), 'homepage first-paint parity is not using the reduced hero headline tier');

process.stdout.write('PASS: homepage Hero V3 and Dock Snapback V3 remain protected; language-aware Navigation V41 and Global Language V3.1 are materialized without arbitrary Dock-position persistence.\n');
