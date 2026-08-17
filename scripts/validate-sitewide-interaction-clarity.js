#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const R2_NAV = '/site-navigation.js?v=20260817-atomic-first-paint-v22';
const R2_LEGACY = '/site-navigation-legacy-20260802.js?v=20260817-atomic-first-paint-v18';
const FAST_NATIVE = '/site-music-persistent-navigation-v1.js?v=20260817-native-only-v7';
const CONSISTENCY = '/site-ui-consistency-v1.js?v=20260817-atomic-first-paint-v8';
const INTERACTION_CSS = '/site-interaction-continuity-v1.css?v=20260817-continuity-v1';
const HTML_BUILD = '20260817-atomic-first-paint-v2';
const FORBIDDEN_RUNTIME = /(?:brand-identity|site-early-career-history-v1|site-information-architecture-v1|site-brand-trust-v1|site-trust-conversion-v2|site-visual-closure-v1|site-visual-closure-v2|site-text-contrast-audit-v1)\.js/i;
const FORBIDDEN_FOOTER = /site-footer-standard-v28\.(?:css|js)|<footer\b/i;
const FORBIDDEN_NAV = /qilyPersistentNavigationFrame|<iframe\b[^>]*qily|qilyBackgroundMusicPreload/i;
const curationLive = fs.existsSync(path.join(root, 'qilylean', 'daily', 'curation-report.json'));

function read(relative) { return fs.readFileSync(path.join(root, relative), 'utf8'); }
function assert(condition, message) { if (!condition) throw new Error(message); }
function walk(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.cache'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, callback); else callback(full);
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
  const a = luminance(foreground), b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function validateContrastAndTouch() {
  const interaction = read('site-interactive-hover-contrast-v1.css');
  const continuity = read('site-interaction-continuity-v1.css');
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
  ['.qily-system-axis__step:is(:hover,:focus-visible)', 'a.qily-value-card', ':active', 'prefers-reduced-motion'].forEach((marker) => {
    assert(continuity.includes(marker), `Interaction-continuity marker missing: ${marker}`);
  });
  ['.qily-float-dock', 'position: fixed', 'z-index: 9000', 'display: flex'].forEach((marker) => {
    assert(shell.includes(marker), `Floating-dock shell marker missing: ${marker}`);
  });
}

function validateRuntimeSource() {
  const navigation = read('site-navigation.js');
  const legacy = read('site-navigation-legacy-20260802.js');
  const fastNative = read('site-music-persistent-navigation-v1.js');
  const cleanRuntime = read('scripts/publish-r2-clean-runtime-v3.js');
  const materializedFirstPaint = (read('index.html').match(/<!-- QILY-R2-FIRST-PAINT:START -->[\s\S]*?<!-- QILY-R2-FIRST-PAINT:END -->/) || [])[0] || '';
  const floatingService = read('qilylean/floating-service.js');
  const directNavigation = read('direct-navigation.js');
  const retiredBrandIdentity = read('brand-identity.js');
  assert(navigation.includes(R2_LEGACY), 'Navigation wrapper is not pinned to the R2 clean legacy runtime.');
  assert(navigation.includes('staticHtmlAuthority: true'), 'Navigation wrapper does not declare static HTML authority.');
  assert(navigation.includes('dynamicContentShapers: false'), 'Navigation wrapper still permits dynamic content shapers.');
  assert(navigation.includes('runtimeFooter: false'), 'Navigation wrapper still permits runtime footer injection.');
  assert(!navigation.includes('d.body.appendChild(trustFooter)'), 'Navigation wrapper still appends a runtime trust footer.');
  assert(legacy.includes('/site-navigation-core.js?v=20260817-atomic-first-paint-v18'), 'Legacy runtime does not point to the atomic first-paint navigation core.');
  assert(fastNative.includes("mode: 'native-only-v7'"), 'Native Navigation V7 contract is missing.');
  assert(fastNative.includes('domSwap: false'), 'Native Navigation V7 must forbid DOM swapping.');
  assert(fastNative.includes('nativeHistory: true') && fastNative.includes('documentPrefetch: false'), 'Native Navigation V7 must retain native navigation and disable document prefetch.');
  assert(!/DOMParser|history\.pushState|document\.body\.innerHTML/i.test(fastNative), 'Fast Native V6 contains a soft-page swap implementation.');
  assert(!/requestIdleCallback|rel\s*=\s*['"]prefetch|warmPrimaryNav/.test(fastNative), 'HTML prefetch returned to the native-navigation runtime.');
  assert(cleanRuntime.includes('removeFooterAssets'), 'R2 clean runtime is missing footer removal.');
  assert(cleanRuntime.includes('removeDynamicContentShapers'), 'R2 clean runtime is missing dynamic-content-shaper removal.');
  assert(cleanRuntime.includes('QILY-R2-FIRST-PAINT:START'), 'R2 clean runtime is missing first-paint stability guard.');
  assert(cleanRuntime.includes(HTML_BUILD) && cleanRuntime.includes('html.qily-stale-document body{visibility:hidden!important}'), 'Atomic stale-document guard is missing from the materializer.');
  assert(cleanRuntime.includes("ATTEMPT='qily_site_refresh_attempt_v1'") && cleanRuntime.includes('if(requested||tried()){fresh();return}'), 'Bounded stale-document retry contract is missing from the materializer.');
  assert(!/active>BUILD|latest>BUILD|location\.reload\(\)/.test(materializedFirstPaint), 'Stale-document recovery can still loop or follow an untrusted build.');
  assert(floatingService.includes('runtimeContentRewrite: false') && !/ensurePlatformPositioning|addMoldWarehouseProjectImage|brand-identity/.test(floatingService), 'Floating-service still rewrites static page content.');
  assert(directNavigation.includes('runtimeBrandRewrite: false') && !/createElement\(['"]script['"]\)|brand-identity/.test(directNavigation), 'Direct navigation still loads a delayed brand/content rewriter.');
  assert(retiredBrandIdentity.includes('retired: true') && retiredBrandIdentity.includes('runtimeHeroRewrite: false') && !/MutationObserver|setTimeout|innerHTML\s*=/.test(retiredBrandIdentity), 'Cached brand identity fallback can still rewrite visible content.');
}

function validatePreRolloutCapability() {
  const curator = read('scripts/curate-weekly-briefs.js');
  const enforcer = read('scripts/enforce-six-core-static-source.js');
  const publisher = read('.github/workflows/build-daily-archive.yml');
  assert(curator.includes('<h1>精选简报</h1>') && curator.includes('不以日更数量证明专业度'), 'Curator cannot materialize the quality-first directory.');
  assert(enforcer.includes('三大核心业务') && enforcer.includes('ENGINEERING ENABLERS'), 'Three-core business architecture enforcer is incomplete.');
  assert(enforcer.includes('Legacy 3+3 taxonomy remains in public core pages'), 'Six-core enforcer does not block legacy 3+3 taxonomy.');
  assert(publisher.includes('Curate weekly high-value public archive'), 'Publication workflow does not execute weekly curation.');
  assert(publisher.includes('publish-r2-clean-runtime-v3.js'), 'Publication workflow does not finish with R2 clean runtime.');
}

function isPublicHtml(html) {
  return /<html\b/i.test(html) && /<body\b/i.test(html) && /(?:site-navigation\.js|qily-global-nav|site-nav|site-parent-navigation-v3\.js)/i.test(html);
}
function validateLivePages() {
  let publicPages = 0, actionControls = 0;
  const staleNav = [], staleConsistency = [], staleFirstPaint = [], missingInteraction = [], forbiddenRuntime = [], forbiddenFooter = [], forbiddenNavigation = [];
  walk(root, (absolute) => {
    if (!absolute.endsWith('.html')) return;
    const html = fs.readFileSync(absolute, 'utf8');
    if (!isPublicHtml(html)) return;
    const relative = path.relative(root, absolute).split(path.sep).join('/');
    publicPages += 1;
    actionControls += (html.match(/<button\b|<input\b[^>]*type=["'](?:button|submit)["']|<a\b[^>]*(?:class=["'][^"']*(?:button|action|btn|cta)|data-action=)/gi) || []).length;
    if (/site-navigation\.js\?v=/i.test(html) && !html.includes(R2_NAV)) staleNav.push(relative);
    if (!html.includes(CONSISTENCY)) staleConsistency.push(relative);
    if (!html.includes(INTERACTION_CSS)) missingInteraction.push(relative);
    const firstPaint=(html.match(/<!-- QILY-R2-FIRST-PAINT:START -->[\s\S]*?<!-- QILY-R2-FIRST-PAINT:END -->/)||[])[0]||'';
    if(!firstPaint.includes(`BUILD='${HTML_BUILD}'`)||!firstPaint.includes('html.qily-stale-document body{visibility:hidden!important}')||!firstPaint.includes("ATTEMPT='qily_site_refresh_attempt_v1'")||!/if\(requested\|\|tried\(\)\)\{fresh\(\);return\}/.test(firstPaint)||/active>BUILD|latest>BUILD|location\.reload\(\)/.test(firstPaint))staleFirstPaint.push(relative);
    if (FORBIDDEN_RUNTIME.test(html)) forbiddenRuntime.push(relative);
    if (FORBIDDEN_FOOTER.test(html)) forbiddenFooter.push(relative);
    if (FORBIDDEN_NAV.test(html)) forbiddenNavigation.push(relative);
  });
  assert(publicPages >= 100, `Public-page corpus unexpectedly fell to ${publicPages}.`);
  assert(actionControls >= 40, `Only ${actionControls} action controls were covered.`);
  assert(staleNav.length === 0, `Pages with stale navigation version: ${staleNav.slice(0, 12).join(', ')}`);
  assert(staleConsistency.length === 0, `Pages with stale consistency version: ${staleConsistency.slice(0, 12).join(', ')}`);
  assert(staleFirstPaint.length === 0, `Pages without atomic stale-document guard: ${staleFirstPaint.slice(0, 12).join(', ')}`);
  assert(missingInteraction.length === 0, `Pages without sitewide interaction feedback: ${missingInteraction.slice(0, 12).join(', ')}`);
  assert(forbiddenRuntime.length === 0, `Pages with retired dynamic content shapers: ${forbiddenRuntime.slice(0, 12).join(', ')}`);
  assert(forbiddenFooter.length === 0, `Pages with retired footer runtime/static footer: ${forbiddenFooter.slice(0, 12).join(', ')}`);
  assert(forbiddenNavigation.length === 0, `Pages with retired iframe/audio preload: ${forbiddenNavigation.slice(0, 12).join(', ')}`);
  return { publicPages, actionControls };
}
function validatePrimaryContinuity(){
  const routes=['index.html','capabilities/index.html','projects/index.html','improvements/index.html','knowledge/index.html','experience/index.html','cooperation/index.html','trust/index.html'];
  const nav=[['/','首页'],['/capabilities/','能力体系'],['/projects/','代表项目'],['/improvements/','改善方法'],['/knowledge/','知识资产'],['/experience/','履历主线'],['/cooperation/','项目合作'],['/trust/','信任中心']];
  for(const relative of routes){
    const html=read(relative);
    assert((html.match(/QILY-SYSTEM-AXIS:START/g)||[]).length===1,`${relative}: shared operating axis is missing or duplicated.`);
    assert((html.match(/<a class="qily-system-axis__step"/g)||[]).length===6,`${relative}: operating axis is not a six-route interaction map.`);
    const header=(html.match(/<header\b[\s\S]*?<\/header>/i)||[])[0]||'';
    let cursor=-1;
    for(const [href,label] of nav){
      const pattern=new RegExp(`<a\\b[^>]*href=["']${href.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}["'][^>]*>\\s*${label}\\s*<\\/a>`,'i');
      const match=pattern.exec(header);
      assert(match&&match.index>cursor,`${relative}: primary navigation drifted at ${label}.`);
      cursor=match.index;
    }
    assert(!/>\s*友情链接\s*</.test(header),`${relative}: friend link leaked into primary navigation.`);
  }
  const home=read('index.html');
  assert((home.match(/<a class="qily-value-card qily-value-card-link"/g)||[]).length===3,'Homepage trust cards are not whole-card links.');
}
function validateLiveDirectoryAndCore() {
  const directory = read('qilylean/daily-insights.html');
  const home = read('index.html');
  const cooperation = read('cooperation/index.html');
  const cards = (directory.match(/class=["'][^"']*brief-index-card/g) || []).length;
  const bytes = Buffer.byteLength(directory, 'utf8');
  assert(bytes <= 400000, `Curated directory HTML is ${bytes} bytes; expected at most 400000.`);
  assert(cards > 0 && cards <= 400, `Curated directory renders ${cards} cards; expected 1-400.`);
  assert(directory.includes('精选简报') && directory.includes('不以日更数量证明专业度'), 'Curated directory lost quality-first positioning.');
  assert(!directory.includes('每一天对应一个独立网址'), 'Curated directory restored daily-cadence wording.');
  assert(home.includes('三大核心业务') && home.includes('制造运营资产'), 'Homepage lost the three-core strategic positioning.');
  assert(!/三类核心项目交付\s*[+＋与]\s*三项数智化产品与技术能力/.test(home + cooperation), 'Legacy 3+3 taxonomy returned to a core page.');
  assert(home.includes(FAST_NATIVE) || home.includes('site-music-persistent-navigation-v1.js?v=20260812-fast-native-v5'), 'Homepage lost Fast Native Navigation V5.');
}

function validateLegacyRoutes() {
  [
    ['links.html', '/links/'], ['trust.html', '/trust/'], ['standards.html', '/trust/#evidence-levels'], ['delivery.html', '/projects/qilylean-commercial-deliveries/']
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
  validateLegacyRoutes();
  validatePrimaryContinuity();
  if (!curationLive) {
    validatePreRolloutCapability();
    process.stdout.write('R2 interaction clarity validated (pre-rollout capability).\n');
    return;
  }
  validateLiveDirectoryAndCore();
  const coverage = validateLivePages();
  process.stdout.write(`R2 interaction clarity validated (live-curated): ${coverage.publicPages} maintained public pages, ${coverage.actionControls} action controls.\n`);
}

main();
