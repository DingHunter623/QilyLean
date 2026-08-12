#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function includesAll(content, markers, label) {
  markers.forEach((marker) => assert(content.includes(marker), `${label}: missing ${marker}`));
}

const experience = read('experience/index.html');
const earlyCareer = read('site-early-career-history-v1.js');
const darkCss = read('site-dark-surface-contrast-v1.css');
const r2Css = read('site-r2-stability-fixes-v1.css');
const navigation = read('site-music-persistent-navigation-v1.js');
const core = read('site-navigation-core.js');
const legacy = read('site-navigation-legacy-20260802.js');
const wrapper = read('site-navigation.js');
const r2Publisher = read('scripts/publish-r2-runtime-stability.js');
const careerPublisher = read('scripts/publish-early-career-history.js');

// 1) 履历继续以静态源数据为权威，不允许回到客户端补卡片。
includesAll(experience, [
  'id="career-2019-2025"',
  'id="career-2015-2019"',
  'id="career-2009-2015"',
  'id="career-2006-2009"',
  'QILY-STATIC-CAREER-BASELINE:v1'
], 'experience');
includesAll(earlyCareer, ['career-2019-2025', 'career-2015-2019', 'career-2009-2015', 'career-2006-2009'], 'early-career enhancer');
includesAll(careerPublisher, ['QILY-STATIC-CAREER-BASELINE:v1', 'materializeExperienceCareerBaseline'], 'career publisher');

// 2) 深色区域与动作按钮必须保持可读；可信度同排卡片动作必须沉底。
includesAll(darkCss, [
  'QILY-REGRESSION-DARK-SURFACE-GUARD:START',
  '[data-qily-dark-surface="true"]',
  '-webkit-text-fill-color:#fff!important'
], 'dark-surface contrast');
includesAll(r2Css, [
  '.qily-section-actions a.primary',
  '-webkit-text-fill-color:#fff!important',
  '.qily-trust-wrap > .qily-value-card',
  'display:flex!important',
  'margin-top:auto!important'
], 'R2 visual stability');

// 3) 全站跳转必须保持原生文档边界：预取可以加速，禁止跨页搬运 DOM/CSS/脚本。
includesAll(navigation, [
  'window.__qilyFastNativeNavigationV5',
  'data-qily-fast-prefetch',
  "cache:'force-cache'",
  'location.assign(url.href)',
  "mode:'native-prefetch-v5'",
  'domSwap:false'
], 'fast native navigation');
assert(!/reconcileHeadAssets|history\.pushState|DOMParser\(\)|qilySoftNavigation|qily:softnavigate/.test(navigation), 'navigation: legacy cross-page DOM/CSS swap returned');
assert(!/createElement\(['"]iframe['"]\)|qilyPersistentNavigationFrame|页面加载中/.test(navigation), 'navigation: iframe/spinner fallback returned');

// 4) R2 运行时不得把静态 V3 页面再次改回旧导航、旧 CSS 或重复联系栏。
includesAll(core, [
  "['首页', '/']",
  "['能力体系', '/capabilities/']",
  "['代表项目', '/projects/']",
  "['改善方法', '/improvements/']",
  "['知识资产', '/knowledge/']",
  "['履历主线', '/experience/']",
  "['项目合作', '/cooperation/']",
  "['信任中心', '/trust/']",
  "if (!document.querySelector('header.qily-site-header .qily-global-nav,header.qily-global-header .qily-global-nav')) buildNavigation();"
], 'R2 navigation core');
assert(!/\n\s*ensureGlobalContactFooter\(\);/.test(core), 'navigation core: obsolete repeated global contact footer returned');
assert(!/\n\s*ensureKnowledgeDocumentEnhancements\(\);/.test(core), 'navigation core: obsolete document site/email tail returned');
assert(!/function applyFixes\(\)[\s\S]{0,220}ensureFriendLinksNavigation\(\)/.test(legacy), 'legacy navigation: 友情链接 returned to primary navigation');
assert(!/function observeShell\(\)[\s\S]{0,500}MutationObserver/.test(legacy), 'legacy navigation: mutation-loop DOM rewrite returned');
assert(wrapper.includes('/site-navigation-legacy-20260802.js?v=20260812-r2-stability-v1'), 'navigation wrapper: stale legacy cache reference returned');

// 5) 关键静态页面必须已经物化 R2 首屏、缓存、导视和无音乐运行时。
const keyPages = [
  'index.html', 'ai.html', 'capabilities/index.html', 'projects/index.html',
  'improvements/index.html', 'knowledge/index.html', 'experience/index.html',
  'cooperation/index.html', 'trust/index.html'
];
for (const relative of keyPages) {
  const html = read(relative);
  includesAll(html, [
    'QILY-R2-FIRST-PAINT:START',
    '/site-r2-stability-fixes-v1.css?v=20260812-r2-stability-v1',
    '/site-navigation.js?v=20260812-r2-stability-v1',
    '/site-music-persistent-navigation-v1.js?v=20260812-fast-native-v5',
    'QILY-R2-PRIMARY-CONTRAST-NAV:START'
  ], relative);
  assert(!/homepage-music(?:-v5)?\.js(?:\?v=)?/i.test(html), `${relative}: deprecated background music runtime returned`);
  assert(!html.includes('QILY-PRIMARY-CONTRAST-MUSIC:START'), `${relative}: legacy music block returned`);
  assert(!/setTimeout\([^;]*180\)/.test(html), `${relative}: legacy 180ms reveal returned`);
  const primary = html.match(/<nav\b[^>]*(?:qily-global-nav|site-nav)[^>]*>([\s\S]*?)<\/nav>/i);
  if (primary) {
    assert(primary[1].includes('能力体系') && primary[1].includes('信任中心'), `${relative}: R2 primary navigation incomplete`);
    assert(!primary[1].includes('QilyLean AI') && !primary[1].includes('能力画像') && !primary[1].includes('知识分享') && !primary[1].includes('友情链接'), `${relative}: retired/secondary primary-nav item returned`);
  }
}

// 6) 发布器与自愈工作流必须把 R2 当成最终防回退层。
includesAll(r2Publisher, [
  '20260812-r2-stability-v1',
  'QILY-R2-FIRST-PAINT:START',
  'site-r2-stability-fixes-v1.css',
  'site-music-persistent-navigation-v1.js?v=20260812-fast-native-v5',
  'ordinary pages must not inject a repeated global contact footer'
], 'R2 publisher');
const workflow = read('.github/workflows/site-regression-poka-yoke.yml');
includesAll(workflow, [
  'node scripts/apply-site-poka-yoke-v2.js',
  'node scripts/site-regression-guard.js',
  'cron:',
  'contents: write'
], 'poka-yoke workflow');

process.stdout.write('QilyLean R2 regression guard passed: readable controls, equal-card alignment, static primary navigation, no repeated contact tails, no music regression and native-prefetch V5 are intact.\n');
