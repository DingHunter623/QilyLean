#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const R2_NAV = '/site-navigation.js?v=20260812-r2-clean-v3';
const R2_LEGACY = '/site-navigation-legacy-20260802.js?v=20260812-r2-clean-v3';
const FORBIDDEN_RUNTIME = /(?:site-information-architecture-v1|site-brand-trust-v1|site-trust-conversion-v2|site-visual-closure-v1|site-visual-closure-v2|site-text-contrast-audit-v1)\.js/i;
const FORBIDDEN_FOOTER = /site-footer-standard-v28\.(?:css|js)|<footer\b/i;
const FORBIDDEN_NAV = /site-music-persistent-navigation-v1\.js|qilyPersistentNavigationFrame|<iframe\b[^>]*qily/i;
const curationLive = fs.existsSync(path.join(root, 'qilylean', 'daily', 'curation-report.json'));

function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function walk(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.cache'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, callback);
    else callback(full);
  }
}

function rgb(hex) {
  const value = hex.replace('#', '');
  return [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16) / 255);
}

function luminance(hex) {
  return rgb(hex).map((channel) => channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4))
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrast(foreground, background) {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function validateContrastAndTouch() {
  const interaction = read('site-interactive-hover-contrast-v1.css');
  const number = read('site-number-badge-contrast-v1.css');
  const shell = read('site-shell.css');
  [
    ['hover', '#17322d', '#ffe39b', 4.5],
    ['active', '#ffffff', '#052a33', 4.5],
    ['dark primary', '#332100', '#ffd36a', 4.5],
    ['disabled', '#465a57', '#e6eceb', 4.5]
  ].forEach(([name, foreground, background, minimum]) => {
    const ratio = contrast(foreground, background);
    assert(ratio >= minimum, `${name} contrast ${ratio.toFixed(2)} is below ${minimum}:1.`);
  });
  ['--qily-interactive-hover-bg:#ffe39b', '--qily-interactive-hover-text:#17322d', ':focus-visible', 'min-height:44px'].forEach((marker) => {
    assert(interaction.includes(marker) || shell.includes(marker), `Interaction/touch marker missing: ${marker}`);
  });
  ['--qily-number-badge-bg:#075767', '--qily-number-badge-text:#ffffff', 'opacity:1!important'].forEach((marker) => {
    assert(number.includes(marker), `Number-badge contrast marker missing: ${marker}`);
  });
  assert(!/content\s*:\s*["']NEW["']/i.test(interaction), 'Interaction CSS must not inject NEW badges.');
  ['.qily-float-dock', 'position: fixed', 'z-index: 9000', 'display: flex'].forEach((marker) => {
    assert(shell.includes(marker), `Floating-dock shell marker missing: ${marker}`);
  });
}

function validateRuntimeSource() {
  const navigation = read('site-navigation.js');
  const legacy = read('site-navigation-legacy-20260802.js');
  const cleanRuntime = read('scripts/publish-r2-clean-runtime-v3.js');
  const floatingService = read('qilylean/floating-service.js');
  assert(navigation.includes(R2_LEGACY), 'Navigation wrapper is not pinned to the R2 clean legacy runtime.');
  assert(navigation.includes('staticHtmlAuthority: true'), 'Navigation wrapper does not declare static HTML authority.');
  assert(navigation.includes('dynamicContentShapers: false'), 'Navigation wrapper still permits dynamic content shapers.');
  assert(navigation.includes('runtimeFooter: false'), 'Navigation wrapper still permits runtime footer injection.');
  assert(!navigation.includes('d.body.appendChild(trustFooter)'), 'Navigation wrapper still appends a runtime trust footer.');
  assert(!FORBIDDEN_NAV.test(navigation), 'Navigation wrapper still contains iframe/persistent-navigation logic.');
  assert(legacy.includes('/site-navigation-core.js?v=20260812-r2-clean-v3'), 'Legacy runtime does not point to the R2 clean navigation core.');
  assert(cleanRuntime.includes('removeFooterAssets'), 'R2 clean runtime is missing footer removal.');
  assert(cleanRuntime.includes('removeDynamicContentShapers'), 'R2 clean runtime is missing dynamic-content-shaper removal.');
  assert(cleanRuntime.includes('QILY-R2-FIRST-PAINT:START'), 'R2 clean runtime is missing first-paint stability guard.');
  assert(!floatingService.includes('20260729-no-old-flash-v1'), 'Floating-service runtime still requests a stale navigation loader.');
}

function isPublicHtml(html) {
  return /<html\b/i.test(html) && /<body\b/i.test(html) && /(?:site-navigation\.js|qily-global-nav|site-nav|site-parent-navigation-v3\.js)/i.test(html);
}

function validatePublicPages() {
  let publicPages = 0;
  let actionControls = 0;
  const staleNav = [];
  const forbiddenRuntime = [];
  const forbiddenFooter = [];
  const forbiddenNavigation = [];
  walk(root, (absolute) => {
    if (!absolute.endsWith('.html')) return;
    const html = fs.readFileSync(absolute, 'utf8');
    if (!isPublicHtml(html)) return;
    const relative = path.relative(root, absolute).split(path.sep).join('/');
    publicPages += 1;
    actionControls += (html.match(/<button\b|<input\b[^>]*type=["'](?:button|submit)["']|<a\b[^>]*(?:class=["'][^"']*(?:button|action|btn|cta)|data-action=)/gi) || []).length;
    if (/site-navigation\.js\?v=/i.test(html) && !html.includes(R2_NAV)) staleNav.push(relative);
    if (FORBIDDEN_RUNTIME.test(html)) forbiddenRuntime.push(relative);
    if (FORBIDDEN_FOOTER.test(html)) forbiddenFooter.push(relative);
    if (FORBIDDEN_NAV.test(html) || /qilyBackgroundMusicPreload/i.test(html)) forbiddenNavigation.push(relative);
  });
  assert(publicPages >= 100, `Public-page corpus unexpectedly fell to ${publicPages}.`);
  assert(actionControls >= 40, `Only ${actionControls} action controls were covered.`);
  assert(staleNav.length === 0, `Pages with stale navigation version: ${staleNav.slice(0, 12).join(', ')}`);
  assert(forbiddenRuntime.length === 0, `Pages with retired dynamic content shapers: ${forbiddenRuntime.slice(0, 12).join(', ')}`);
  assert(forbiddenFooter.length === 0, `Pages with retired footer runtime/static footer: ${forbiddenFooter.slice(0, 12).join(', ')}`);
  assert(forbiddenNavigation.length === 0, `Pages with retired navigation/audio preload: ${forbiddenNavigation.slice(0, 12).join(', ')}`);
  return { publicPages, actionControls };
}

function validateDirectory() {
  const directory = read('qilylean/daily-insights.html');
  const initialCards = (directory.match(/class=["'][^"']*brief-index-card/g) || []).length;
  const bytes = Buffer.byteLength(directory, 'utf8');
  assert(bytes <= 400000, `Brief directory HTML is ${bytes} bytes; expected at most 400000.`);
  assert(initialCards > 0 && initialCards <= 400, `Brief directory renders ${initialCards} cards; expected 1-400.`);
  if (curationLive) {
    assert(directory.includes('精选简报'), 'Live curated directory is missing its quality-first identity.');
    assert(directory.includes('不以日更数量证明专业度'), 'Live curated directory is missing its quality-first publication statement.');
    assert(!directory.includes('每一天对应一个独立网址'), 'Live curated directory still claims a daily archive cadence.');
  } else {
    const curator = read('scripts/curate-weekly-briefs.js');
    assert(curator.includes('<h1>精选简报</h1>'), 'Pre-rollout curator cannot materialize the curated directory identity.');
    assert(curator.includes('不以日更数量证明专业度'), 'Pre-rollout curator lacks the quality-first publication statement.');
  }
}

function validateCorePages() {
  const home = read('index.html');
  const cooperation = read('cooperation/index.html');
  const trust = read('trust/index.html');
  [home, cooperation, trust].forEach((html, index) => {
    const name = ['homepage', 'cooperation', 'trust'][index];
    assert(!FORBIDDEN_RUNTIME.test(html), `${name} still loads a retired dynamic content shaper.`);
    assert(!FORBIDDEN_FOOTER.test(html), `${name} still contains a retired footer.`);
    assert(!FORBIDDEN_NAV.test(html), `${name} still contains retired navigation runtime.`);
  });
  if (curationLive) {
    assert(home.includes('六类核心能力'), 'Homepage lost the six-core capability taxonomy.');
    assert(home.includes('制造运营资产'), 'Homepage lost manufacturing-operations asset positioning.');
    assert(!/三类核心项目交付\s*[+＋与]\s*三项数智化产品与技术能力/.test(home + cooperation), 'Legacy 3+3 taxonomy returned to a core page.');
  } else {
    const enforcer = read('scripts/enforce-six-core-static-source.js');
    assert(enforcer.includes('六类核心能力'), 'Pre-rollout six-core enforcer is missing the canonical taxonomy.');
    assert(enforcer.includes('制造运营资产'), 'Pre-rollout six-core enforcer is missing manufacturing-operations asset positioning.');
    assert(enforcer.includes('Legacy 3+3 taxonomy remains in public core pages'), 'Pre-rollout enforcer does not block legacy 3+3 taxonomy.');
  }
}

function validateLegacyRoutes() {
  [
    ['links.html', '/links/'],
    ['trust.html', '/trust/'],
    ['standards.html', '/trust/#evidence-levels'],
    ['delivery.html', '/projects/qilylean-commercial-deliveries/']
  ].forEach(([relative, target]) => {
    const html = read(relative);
    assert(html.includes(`location.replace('${target}')`), `${relative} does not redirect to its maintained public destination.`);
    assert(html.includes(`href="${target}"`), `${relative} lacks a visible no-JavaScript fallback link.`);
    assert(html.includes('min-height:44px'), `${relative} fallback action is below the 44px interaction minimum.`);
  });
}

function main() {
  validateContrastAndTouch();
  validateRuntimeSource();
  validateDirectory();
  validateCorePages();
  validateLegacyRoutes();
  const coverage = validatePublicPages();
  process.stdout.write(`R2 interaction clarity validated (${curationLive ? 'live-curated' : 'pre-rollout'}): ${coverage.publicPages} maintained public pages, ${coverage.actionControls} action controls.\n`);
}

main();
