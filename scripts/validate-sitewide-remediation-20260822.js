#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const versions = {
  governance: '/site-visual-governance-v2.css?v=20260824-readable-floor-plus2-v7',
  contentAxis: '/site-content-axis-v1.css?v=20260822-sitewide-visual-axis-v5'
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
const cooperationDockClosure = read('site-core-service-dock-closure-v1.js');
const consistency = read('site-ui-consistency-v1.js');
const languageMaterializer = read('scripts/materialize-global-language-v3.js');
const contentAxis = read('site-content-axis-v1.css');
const home = read('index.html');
const experience = read('experience/index.html');

assert(navigation.includes("mode: 'atomic-first-paint-v38'"), 'Navigation wrapper is not V38.');
assert(navigation.includes("dockOrder: ['home','top','back','search','current','contact']"), 'Navigation contract has the wrong Dock order.');
assert(navigation.includes('/site-navigation-core.js?v=20260824-contact-channel-v30'), 'Navigation core cache key is stale.');
assert(navigation.includes('/site-navigation-legacy-20260802.js?v=20260822-dock-back-label-v23'), 'Navigation legacy cache key is stale.');
assert(read('site-navigation-legacy-20260802.js').includes('/site-navigation-core.js?v=20260824-contact-channel-v30'), 'Legacy navigation core cache key is stale.');
assert(navigation.includes('/site-content-axis-v1.css?v=20260822-sitewide-visual-axis-v5'), 'Content-axis cache key is stale.');
assert(dockClosure.includes("var order = ['home', 'top', 'back', 'search', 'current', 'contact'];"), 'Dock closure order is stale.');
assert(!core.includes('data-action="share"'), 'Duplicate official-site share button returned to the core Dock.');
assert(core.includes('data-action="back" type="button">回<br>上一层</button>'), 'Core Dock back label is not 回上一层.');
assert(!core.includes('返回<br>上一层'), 'Core Dock returned to the retired 返回上一层 label.');
assert(dockClosure.includes("back: '回<br>上一层'"), 'Dock closure back label is not 回上一层.');
assert(!dockClosure.includes('返回<br>上一层'), 'Dock closure returned to the retired 返回上一层 label.');
assert(cooperationDockClosure.includes("back:{html:'回<br>上一层',aria:'回上一层'}"), 'Cooperation Dock back label is not 回上一层.');
assert(!cooperationDockClosure.includes('返回<br>上一层'), 'Cooperation Dock returned to the retired 返回上一层 label.');
assert(consistency.includes("setAttribute('aria-label','回上一层')"), 'Dock accessibility label is not 回上一层.');
assert(!consistency.includes('返回上一级有效页面'), 'Dock accessibility label returned to the retired wording.');

/* Translation-sensitive cache ownership belongs to the Chinese-default Dual Route V2 materializer. */
assert(languageMaterializer.includes("const VERSION = '20260825-global-translation-dual-route-v2'"), 'Dual-route version owner missing.');
assert(languageMaterializer.includes('/site-navigation.js?v=20260825-language-runtime-compat-v41'), 'Navigation cache owner missing.');
assert(languageMaterializer.includes('/site-ui-consistency-v1.js?v=${VERSION}'), 'Dual-route consistency cache owner missing.');
assert(languageMaterializer.includes('/site-dock-share-runtime-v1.js?v=20260825-language-runtime-compat-v31'), 'Dock cache owner missing.');
assert(languageMaterializer.includes('/site-global-language-v3.js?v=${VERSION}'), 'Dual-route direct runtime missing.');
assert(languageMaterializer.includes('data-qily-web-translate-direct="dual-route-v2"'), 'Dual-route direct marker missing.');

let last = -1;
for (const action of requiredDockOrder) {
  const position = core.indexOf(`data-action="${action}"`);
  assert(position > last, `Core Dock action is missing or out of order: ${action}`);
  last = position;
}

assert(contentAxis.includes('--qily-content-axis:1560px'), 'Unified 1560px content axis is missing.');
assert(contentAxis.includes('overflow-wrap:anywhere!important'), 'Long-content wrapping guard is missing.');
assert(contentAxis.includes('white-space:normal!important'), 'Natural content wrapping guard is missing.');
assert(contentAxis.includes('.article-hub-inner'), 'Article-hub content axis guard is missing.');
assert(contentAxis.includes('.daily-hero,.daily-index-section,.daily-single-section'), 'Daily hero/content alignment guard is missing.');
assert(contentAxis.includes('html:root body main :is('), 'Final number-badge contrast guard is missing.');
assert(contentAxis.includes('-webkit-text-fill-color:#fff!important'), 'Number-badge white text guard is missing.');
assert(contentAxis.includes('background-color:#0f6570!important'), 'Number-badge brand-teal background guard is missing.');
assert(contentAxis.includes('body.cooperation-page main :is(#services,#engineering-enablers) .service-card .service-number'), 'Cooperation 01–06 badge unification guard is missing.');
assert(home.includes('<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:START -->'), 'Homepage C919 V4 start marker missing.');
assert(home.indexOf('QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:START') < home.indexOf('<section class="hero">'), 'C919 is not the first homepage content visual.');
assert(home.includes('/qilylean/c919-strategy-hero-v14.png'), 'Homepage latest V14 aircraft visual asset missing.');

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
  if (/\/site-navigation\.js(?:\?v=[^"']*)?/.test(html)) navigationPages += 1;
  if (/\/site-visual-governance-v2\.css(?:\?v=[^"']*)?/.test(html) && !html.includes(versions.governance)) stale.push(`${relative}: readability governance cache`);
  if (/\/site-content-axis-v1\.css(?:\?v=[^"']*)?/.test(html) && !html.includes(versions.contentAxis)) stale.push(`${relative}: content-axis cache`);
}

assert(navigationPages >= 460, `Navigation coverage unexpectedly fell to ${navigationPages} pages.`);
assert(stale.length === 0, `Stale public shell entries: ${stale.slice(0, 20).join(', ')}`);
process.stdout.write(`PASS: site-wide remediation validated across ${navigationPages} navigation pages; translation is Chinese-default with mainland domestic / global Google routing.\n`);
