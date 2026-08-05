#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

function read(relativePath) {
  const file = path.join(root, relativePath);
  if (!fs.existsSync(file)) throw new Error(`Required file missing: ${relativePath}`);
  return fs.readFileSync(file, 'utf8');
}
function requireToken(content, token, label) {
  if (!content.includes(token)) throw new Error(`${label} missing token: ${token}`);
}

const home = read('index.html');
const links = read('links/index.html');
const onboarding = read('links/onboarding/index.html');
const network = read('links/network/index.html');
const stylesheet = read('site-resource-network-v1.css');
const sitemap = read('sitemap.xml');
const search = JSON.parse(read('qilylean/site-search-index.json'));

[
  [home, 'QILY-RESOURCE-NETWORK:HOME:START', 'homepage'],
  [home, 'QilyLean以制造改善项目交付为核心', 'homepage'],
  [home, '产业资源协同网络｜建设阶段', 'homepage'],
  [links, 'QILY-RESOURCE-NETWORK:LINKS:START', 'resource directory'],
  [links, '产业资源目录｜全球科技企业与跨行业资源', 'resource directory'],
  [onboarding, 'QILY-RESOURCE-NETWORK:ONBOARDING:START', 'onboarding'],
  [onboarding, '进入产业资源目录、建立独立资源主页', 'onboarding'],
  [network, '入驻不是背书，展示不等于成交', 'network definition'],
  [network, '当前状态：建设阶段', 'network definition'],
  [network, 'href="/site-resource-network-v1.css?v=20260805-resource-network-v3"', 'network definition'],
  [network, '<a class="primary" href="/links/onboarding/">申请资源入驻</a>', 'network hero primary action'],
  [sitemap, 'https://qilylean.com/links/network/', 'sitemap'],
  [sitemap, 'https://qilylean.com/links/onboarding/', 'sitemap']
].forEach(([content, token, label]) => requireToken(content, token, label));

[
  ['index.html', home],
  ['links/index.html', links],
  ['links/onboarding/index.html', onboarding],
  ['links/network/index.html', network]
].forEach(([file, content]) => requireToken(content, 'qilyResourceNetworkStylesheet', file));

[
  'QILY-RESOURCE-NETWORK-BUTTON-CONTRAST-V2',
  'a.qily-resource-network__button.primary:visited',
  'background-color:var(--qlrn-light-gold)!important',
  '-webkit-text-fill-color:#fff!important',
  'a.qily-resource-network__button.primary:active',
  'QILY-NETWORK-HERO-ACTION-CONTRAST-V3',
  'section.hero .hero-actions a.primary:visited',
  '-webkit-text-fill-color:#17322d!important',
  'background-color:#ffe39b!important',
  'section.hero .hero-actions a.primary:hover',
  'section.hero .hero-actions a.primary:active',
  'visibility:visible!important'
].forEach((token) => requireToken(stylesheet, token, 'resource-network button contrast stylesheet'));

if (!Array.isArray(search.entries)) throw new Error('Search-index entries are missing');
const requiredUrls = ['/', '/links/', '/links/onboarding/', '/links/network/'];
for (const url of requiredUrls) {
  if (!search.entries.some((entry) => entry.url === url)) throw new Error(`Search index missing: ${url}`);
}
const networkEntry = search.entries.find((entry) => entry.url === '/links/network/');
for (const token of ['可信展示', '需求匹配', '成果交付']) {
  requireToken(networkEntry.text || '', token, 'resource-network search entry');
}

const combined = [home, links, onboarding, network].join('\n');
for (const claim of ['平台已成熟', '保证固定访问量', '保证成交结果', '官方推荐资源']) {
  if (combined.includes(claim)) throw new Error(`Prohibited overstated claim detected: ${claim}`);
}

process.stdout.write('Industry resource network validation passed: static pages, governance boundary, sitemap, stylesheet, hero/button contrast and search index are aligned.\n');
