#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const capabilitiesFile = path.join(root, 'capabilities', 'index.html');
const timesAsset = path.join(root, 'assets', 'tools', 'times26001-overview.svg');

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!fs.existsSync(capabilitiesFile)) fail('Missing capabilities/index.html');
if (!fs.existsSync(timesAsset)) fail('Missing assets/tools/times26001-overview.svg');

let page = fs.readFileSync(capabilitiesFile, 'utf8');
const before = page;

// 1) Repair the broken Times26001 showcase path with an asset that actually exists.
page = page.replace(
  /src="\/times26001\/times26001-showcase\.svg(?:\?[^\"]*)?"/g,
  'src="/assets/tools/times26001-overview.svg?v=20260824-capability-visual-fix-v1"'
);

// 2) Force a fresh fetch of the DDZ capability visual stylesheet.
page = page.replace(
  /href="\/pure-ddz-capability-visual-v2\.css\?v=[^"]+"/g,
  'href="/pure-ddz-capability-visual-v2.css?v=20260824-title-contrast-v4"'
);

// 3) Make the requested title contrast unambiguous even if another global !important rule loads later.
page = page.replace(
  '<h3 class="capability-ddz-title">启力精益斗地主</h3>',
  '<h3 class="capability-ddz-title" style="color:#fff!important;text-shadow:0 2px 6px rgba(0,0,0,.55)!important">启力精益斗地主</h3>'
);
page = page.replace(
  '<p class="capability-ddz-sub">简单娱乐 · 益智生活 · 无广告</p>',
  '<p class="capability-ddz-sub" style="color:#ffe39b!important;text-shadow:0 2px 4px rgba(0,0,0,.45)!important">简单娱乐 · 益智生活 · 无广告</p>'
);

if (page.includes('/times26001/times26001-showcase.svg')) fail('Broken Times26001 path still present');
if (!page.includes('/assets/tools/times26001-overview.svg?v=20260824-capability-visual-fix-v1')) fail('Correct Times26001 asset path not materialized');
if (!page.includes('/pure-ddz-capability-visual-v2.css?v=20260824-title-contrast-v4')) fail('DDZ cache-busting stylesheet version not materialized');
if (!page.includes('capability-ddz-title" style="color:#fff!important')) fail('DDZ title inline contrast safeguard missing');
if (!page.includes('capability-ddz-sub" style="color:#ffe39b!important')) fail('DDZ subtitle inline contrast safeguard missing');

if (page !== before) {
  fs.writeFileSync(capabilitiesFile, page.endsWith('\n') ? page : page + '\n');
  console.log('Updated capabilities/index.html');
} else {
  console.log('Capabilities visual fixes already current.');
}
