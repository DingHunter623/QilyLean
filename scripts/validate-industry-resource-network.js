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
  [sitemap, 'https://qilylean.com/links/network/', 'sitemap'],
  [sitemap, 'https://qilylean.com/links/onboarding/', 'sitemap']
].forEach(([content, token, label]) => requireToken(content, token, label));

[
  ['index.html', home],
  ['links/index.html', links],
  ['links/onboarding/index.html', onboarding],
  ['links/network/index.html', network]
].forEach(([file, content]) => requireToken(content, 'qilyResourceNetworkStylesheet', file));

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

process.stdout.write('Industry resource network validation passed: static pages, governance boundary, sitemap, stylesheet and search index are aligned.\n');
