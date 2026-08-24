#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const capabilitiesFile = path.join(root, 'capabilities', 'index.html');
const timesAsset = path.join(root, 'assets', 'tools', 'times26001-overview.svg');

const DDZ_STYLE_VERSION = '20260824-card-rank-suit-v7';
const APP_SHARE_VERSION = '20260824-capability-home-actions-v2';
const QHOME_ACTIONS = '<div class="module-actions" data-qily-home-actions="20260824-v2">'
  + '<a data-qilylean-home-direct-download="1" href="/QilyLean_Home_v2.3.3_API36_INSTALL.apk?build=20260824-qhome-v233" download>下载 Android APK</a>'
  + '<a href="/app-support/">下载说明</a>'
  + '<a href="#qilylean-home-qr" data-app-share-qr="qilyleanHome" aria-label="扫码下载 QilyLean Home">扫码下载</a>'
  + '<a href="https://qilylean.com/capabilities/#qilylean-home" data-app-share-link="qilyleanHome" aria-label="分享 QilyLean Home 下载页">分享下载页</a>'
  + '<a href="/legal/qilylean-home/privacy/">隐私政策</a>'
  + '<a href="/legal/qilylean-home/terms/">用户协议</a>'
  + '<a href="mailto:admin@qilylean.com?subject=QilyLean%20Home%20%E6%8A%80%E6%9C%AF%E6%94%AF%E6%8C%81">技术支持</a>'
  + '</div>';

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!fs.existsSync(capabilitiesFile)) fail('Missing capabilities/index.html');
if (!fs.existsSync(timesAsset)) fail('Missing assets/tools/times26001-overview.svg');

let page = fs.readFileSync(capabilitiesFile, 'utf8');
const before = page;

page = page.replace(
  /src="\/times26001\/times26001-showcase\.svg(?:\?[^\"]*)?"/g,
  'src="/assets/tools/times26001-overview.svg?v=20260824-capability-visual-fix-v1"'
);

page = page.replace(
  /href="\/pure-ddz-capability-visual-v2\.css\?v=[^"]+"/g,
  `href="/pure-ddz-capability-visual-v2.css?v=${DDZ_STYLE_VERSION}"`
);

page = page.replace(
  /<h3 class="capability-ddz-title"(?: style="[^"]*")?>启力精益斗地主<\/h3>/g,
  '<h3 class="capability-ddz-title" style="color:#fff!important;-webkit-text-fill-color:#fff!important;opacity:1!important;filter:none!important;mix-blend-mode:normal!important;text-shadow:0 2px 6px rgba(0,0,0,.38)!important">启力精益斗地主</h3>'
);
page = page.replace(
  /<p class="capability-ddz-sub"(?: style="[^"]*")?>简单娱乐 · 益智生活 · 无广告<\/p>/g,
  '<p class="capability-ddz-sub" style="color:#ffe39b!important;-webkit-text-fill-color:#ffe39b!important;opacity:1!important;filter:none!important;mix-blend-mode:normal!important;text-shadow:0 2px 4px rgba(0,0,0,.34)!important">简单娱乐 · 益智生活 · 无广告</p>'
);

// Representative card follows the same poker convention as the game: rank + suit on one line; use red-heart Ace.
page = page.replace(/<div class="capability-ddz-card(?: red)?"><strong>A[♠♥♣♦]<\/strong>/, '<div class="capability-ddz-card red"><strong>A♥</strong>');

const homePattern = /(<article class="module-card capability-digital-tool" id="qilylean-home"[\s\S]*?)(?=\s*<article class="module-card capability-digital-tool" id="pure-ddz-digital-tool")/;
const homeMatch = page.match(homePattern);
if (!homeMatch) fail('QilyLean Home capability card not found');
let homeBlock = homeMatch[1];
if (!/<div class="module-actions"[^>]*>[\s\S]*?<\/div>/.test(homeBlock)) fail('QilyLean Home action area not found');
homeBlock = homeBlock.replace(/<div class="module-actions"[^>]*>[\s\S]*?<\/div>/, QHOME_ACTIONS);
page = page.replace(homePattern, homeBlock);

const shareScript = `<script defer id="qilyAppDownloadShareRuntime" src="/app-download-share-v1.js?v=${APP_SHARE_VERSION}"></script>`;
if (/src="\/app-download-share-v1\.js\?v=[^"]+"/.test(page)) {
  page = page.replace(/<script[^>]*src="\/app-download-share-v1\.js\?v=[^"]+"[^>]*><\/script>/, shareScript);
} else if (!page.includes('/app-download-share-v1.js')) {
  page = page.replace('</head>', `${shareScript}\n</head>`);
}

if (page.includes('/times26001/times26001-showcase.svg')) fail('Broken Times26001 path still present');
if (!page.includes('/assets/tools/times26001-overview.svg?v=20260824-capability-visual-fix-v1')) fail('Correct Times26001 asset path not materialized');
if (!page.includes(`/pure-ddz-capability-visual-v2.css?v=${DDZ_STYLE_VERSION}`)) fail('DDZ fresh readability stylesheet version not materialized');
if (!page.includes('capability-ddz-title" style="color:#fff!important;-webkit-text-fill-color:#fff!important')) fail('DDZ title white contrast safeguard missing');
if (!page.includes('capability-ddz-sub" style="color:#ffe39b!important;-webkit-text-fill-color:#ffe39b!important')) fail('DDZ subtitle gold contrast safeguard missing');
if (!page.includes('<div class="capability-ddz-card red"><strong>A♥</strong>')) fail('Representative card must use red-heart Ace with rank+suit on one line');
if (!page.includes('data-qily-home-actions="20260824-v2"')) fail('QilyLean Home complete action set missing');
for (const label of ['下载 Android APK','下载说明','扫码下载','分享下载页','隐私政策','用户协议','技术支持']) {
  if (!homeBlock.includes(label)) fail(`QilyLean Home action missing: ${label}`);
}
if (!page.includes(`/app-download-share-v1.js?v=${APP_SHARE_VERSION}`)) fail('APP download/share runtime missing from capability page');

if (page !== before) {
  fs.writeFileSync(capabilitiesFile, page.endsWith('\n') ? page : page + '\n');
  console.log('Updated capabilities/index.html with QilyLean Home actions, DDZ readability and red-heart Ace convention');
} else {
  console.log('Capability visual/action fixes already current.');
}
