#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const versions = {
  navigation: '/site-navigation.js?v=20260822-sitewide-remediation-v32',
  contentAxis: '/site-content-axis-v1.css?v=20260822-unified-content-axis-v2',
  consistency: '/site-ui-consistency-v1.js?v=20260822-remediation-v12',
  dockOrder: '/site-dock-share-runtime-v1.js?v=20260822-dock-order-v2'
};
const requiredDockOrder = ['home', 'top', 'back', 'search', 'current', 'contact'];

function read(relative) { return fs.readFileSync(path.join(root, relative), 'utf8'); }
function assert(ok, message) { if (!ok) throw new Error(message); }
function trackedHtml() {
  return execFileSync('git', ['ls-files', '*.html'], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    .split(/\r?\n/).filter(Boolean);
}

const navigation = read('site-navigation.js');
const core = read('site-navigation-core.js');
const dockClosure = read('site-dock-share-runtime-v1.js');
const contentAxis = read('site-content-axis-v1.css');
const home = read('index.html');
const experience = read('experience/index.html');

assert(navigation.includes("mode: 'atomic-first-paint-v32'"), 'Navigation wrapper is not V32.');
assert(navigation.includes("dockOrder: ['home','top','back','search','current','contact']"), 'Navigation contract has the wrong Dock order.');
assert(navigation.includes('/site-navigation-core.js?v=20260822-remediation-v26'), 'Navigation core cache key is stale.');
assert(navigation.includes('/site-content-axis-v1.css?v=20260822-unified-content-axis-v2'), 'Content-axis cache key is stale.');
assert(dockClosure.includes("var order = ['home', 'top', 'back', 'search', 'current', 'contact'];"), 'Dock closure order is stale.');
assert(!core.includes('data-action="share"'), 'Duplicate official-site share button returned to the core Dock.');

let last = -1;
for (const action of requiredDockOrder) {
  const position = core.indexOf(`data-action="${action}"`);
  assert(position > last, `Core Dock action is missing or out of order: ${action}`);
  last = position;
}

assert(contentAxis.includes('--qily-content-axis:1560px'), 'Unified 1560px content axis is missing.');
assert(contentAxis.includes('overflow-wrap:anywhere!important'), 'Long-content wrapping guard is missing.');
assert(home.includes('<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:START -->'), 'Homepage C919 V4 start marker missing.');
assert(home.indexOf('QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:START') < home.indexOf('<section class="hero">'), 'C919 is not the first homepage content visual.');
assert(home.includes('/qilylean/c919-strategy-hero-v12.webp'), 'Homepage C919 visual asset missing.');

const officialUrls = [
  'https://www.jinggon.com/',
  'https://www.gdgaosheng.cn/',
  'https://www.masonled.com/',
  'https://www.mason-led.com/',
  'https://www.eaton.com.cn/cn/zh-cn/products/electronic-components/circuit-protection/fuses.html',
  'https://flex.com/zh/'
];
for (const url of officialUrls) assert(experience.includes(`href="${url}"`), `Experience official link missing: ${url}`);

let navigationPages = 0;
const stale = [];
for (const relative of trackedHtml()) {
  const html = read(relative);
  if (html.includes('data-qily-dock-firstpaint-lock')) stale.push(`${relative}: retired Dock first-paint lock`);
  if (/分享<br>官网|data-action=["']share["']/.test(html)) stale.push(`${relative}: duplicate official-site share`);
  if (/\/site-navigation\.js(?:\?v=[^"']*)?/.test(html)) {
    navigationPages += 1;
    if (!html.includes(versions.navigation)) stale.push(`${relative}: navigation cache`);
  }
  if (/\/site-dock-share-runtime-v1\.js(?:\?v=[^"']*)?/.test(html) && !html.includes(versions.dockOrder)) stale.push(`${relative}: Dock closure cache`);
  if (/\/site-content-axis-v1\.css(?:\?v=[^"']*)?/.test(html) && !html.includes(versions.contentAxis)) stale.push(`${relative}: content-axis cache`);
  if (/\/site-ui-consistency-v1\.js(?:\?v=[^"']*)?/.test(html) && !html.includes(versions.consistency)) stale.push(`${relative}: consistency cache`);
}

assert(navigationPages >= 460, `Navigation coverage unexpectedly fell to ${navigationPages} pages.`);
assert(stale.length === 0, `Stale public shell entries: ${stale.slice(0, 20).join(', ')}`);
process.stdout.write(`PASS: site-wide remediation validated across ${navigationPages} navigation pages.\n`);
