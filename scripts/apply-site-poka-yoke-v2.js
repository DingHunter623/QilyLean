#!/usr/bin/env node
'use strict';

/*
 * QilyLean site poka-yoke V2 / R2 baseline
 * 2026-08-12：受保护基线改为“静态权威源 + 原生文档边界 + 同源预取 + R2视觉/首屏稳定”。
 * 已废止：跨页 DOM 软导航、背景音乐连续性刚性要求、普通页面重复联系栏、运行时反复重写一级导航。
 */

const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const root = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function runNode(rel) {
  const result = cp.spawnSync(process.execPath, [path.join(root, rel)], {
    cwd: root,
    stdio: 'inherit'
  });
  if (result.status !== 0) throw new Error(`${rel} failed with exit code ${result.status}`);
}

function verifyFastNavigationBaseline() {
  const navigation = read('site-music-persistent-navigation-v1.js');
  [
    'window.__qilyFastNativeNavigationV5',
    'data-qily-fast-prefetch',
    "cache:'force-cache'",
    'location.assign(url.href)',
    "mode:'native-prefetch-v5'",
    'domSwap:false'
  ].forEach((marker) => assert(navigation.includes(marker), `fast-navigation baseline missing: ${marker}`));
  assert(!/reconcileHeadAssets|history\.pushState|DOMParser\(\)|qilySoftNavigation|qily:softnavigate/.test(navigation),
    'legacy cross-page DOM/CSS swap returned');
}

function verifyProtectedVisualBaseline() {
  const darkCss = read('site-dark-surface-contrast-v1.css');
  const r2Css = read('site-r2-stability-fixes-v1.css');
  assert(darkCss.includes('QILY-REGRESSION-DARK-SURFACE-GUARD:START'), 'dark-surface guard missing');
  assert(darkCss.includes('-webkit-text-fill-color:#fff!important'), 'dark-surface readable text guard missing');
  assert(r2Css.includes('.qily-section-actions a.primary'), 'R2 section primary contrast guard missing');
  assert(r2Css.includes('-webkit-text-fill-color:#fff!important'), 'R2 WebKit primary text guard missing');
  assert(r2Css.includes('.qily-trust-wrap > .qily-value-card'), 'R2 equal-card flex guard missing');
  assert(r2Css.includes('margin-top:auto!important'), 'R2 card action bottom alignment missing');
}

function verifyRuntimeBoundary() {
  const core = read('site-navigation-core.js');
  const legacy = read('site-navigation-legacy-20260802.js');
  const wrapper = read('site-navigation.js');
  assert(core.includes("['能力体系', '/capabilities/']") && core.includes("['信任中心', '/trust/']"), 'navigation core is not using R2 primary routes');
  assert(!/\n\s*ensureGlobalContactFooter\(\);/.test(core), 'runtime global contact footer injection returned');
  assert(!/\n\s*ensureKnowledgeDocumentEnhancements\(\);/.test(core), 'runtime document contact tail injection returned');
  assert(core.includes("if (!document.querySelector('header.qily-site-header .qily-global-nav,header.qily-global-header .qily-global-nav')) buildNavigation();"), 'static-first navigation guard missing');
  assert(!/function applyFixes\(\)[\s\S]{0,220}ensureFriendLinksNavigation\(\)/.test(legacy), 'legacy runtime still adds 友情链接 to primary nav');
  assert(!/function observeShell\(\)[\s\S]{0,500}MutationObserver/.test(legacy), 'legacy mutation-loop navigation rewrite returned');
  assert(wrapper.includes('/site-navigation-legacy-20260802.js?v=20260812-r2-stability-v1'), 'navigation wrapper cache version is not R2');
}

function main() {
  verifyFastNavigationBaseline();
  verifyProtectedVisualBaseline();

  // 先修复源运行时，再物化静态页面；其他历史发布器只能在此基线内工作。
  runNode('scripts/publish-r2-runtime-stability.js');
  runNode('scripts/publish-early-career-history.js');
  runNode('scripts/publish-r2-runtime-stability.js');

  verifyFastNavigationBaseline();
  verifyProtectedVisualBaseline();
  verifyRuntimeBoundary();
  process.stdout.write('QilyLean site poka-yoke R2 applied: static-first shell, readable actions, equal-card alignment and native-prefetch V5 are protected.\n');
}

main();
