#!/usr/bin/env node
'use strict';

/*
 * QilyLean site poka-yoke V2
 * 2026-08-12：停止把“跨页 DOM 软导航”作为受保护基线。
 * 当前基线优先级：原生页面边界 > 预取加速 > 音乐状态恢复。
 * 这样可避免跨模块跳转时 CSS/脚本串页、版式闪乱和等待样式加载。
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
  if (result.status !== 0) {
    throw new Error(`${rel} failed with exit code ${result.status}`);
  }
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
  ].forEach((marker) => {
    assert(navigation.includes(marker), `fast-navigation baseline missing: ${marker}`);
  });

  assert(!/reconcileHeadAssets|history\.pushState|DOMParser\(\)|qilySoftNavigation|qily:softnavigate/.test(navigation),
    'legacy cross-page DOM/CSS swap returned');
}

function verifyProtectedVisualBaseline() {
  const darkCss = read('site-dark-surface-contrast-v1.css');
  assert(darkCss.includes('QILY-REGRESSION-DARK-SURFACE-GUARD:START'), 'dark-surface guard missing');
  assert(darkCss.includes('-webkit-text-fill-color:#fff!important'), 'dark-surface readable text guard missing');
}

function main() {
  verifyFastNavigationBaseline();
  verifyProtectedVisualBaseline();

  // 只重新物化不会破坏页面边界的静态基线。
  runNode('scripts/publish-early-career-history.js');
  runNode('scripts/publish-primary-contrast-music-continuity.js');

  verifyFastNavigationBaseline();
  process.stdout.write('QilyLean site poka-yoke V2 applied: native-prefetch navigation and stable document boundaries are protected.\n');
}

main();
