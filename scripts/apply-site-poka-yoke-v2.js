#!/usr/bin/env node
'use strict';

/* QilyLean site poka-yoke V2 / R2 performance baseline｜2026-08-15 */
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const root = path.resolve(__dirname, '..');

function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function assert(condition, message) { if (!condition) throw new Error(message); }
function runNode(rel) {
  const result = cp.spawnSync(process.execPath, [path.join(root, rel)], { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${rel} failed with exit code ${result.status}`);
}

function verifyFastNavigationBaseline() {
  const navigation = read('site-music-persistent-navigation-v1.js');
  ['window.__qilyFastNativeNavigationV6','data-qily-fast-prefetch','location.assign(url.href)',"mode:'native-prefetch-v6'",'prefetchBudget:3','duplicateFetch:false','touchPrefetch:false','domSwap:false']
    .forEach((marker) => assert(navigation.includes(marker), `fast-navigation baseline missing: ${marker}`));
  assert(!/\bfetch\s*\(/.test(navigation), 'duplicate fetch prefetch returned');
  assert(!/reconcileHeadAssets|history\.pushState|DOMParser\(\)|qilySoftNavigation|qily:softnavigate/.test(navigation), 'legacy cross-page DOM/CSS swap returned');
}

function verifyCleanRuntime() {
  const wrapper = read('site-navigation.js');
  const footer = read('site-footer-standard-v28.js');
  const css = read('site-r2-stability-fixes-v1.css');
  const consistency = read('site-ui-consistency-v1.js');
  assert(wrapper.includes("mode: 'r2-static-first-v21'"), 'static-first navigation runtime v21 missing');
  assert(wrapper.includes('routeScopedLegacy: true'), 'route-scoped legacy boundary missing');
  assert(wrapper.includes('ordinaryPagesDirectCore: true'), 'ordinary-page direct-core route missing');
  assert(wrapper.includes('dynamicContentShapers: false'), 'dynamic content shapers are not disabled');
  assert(wrapper.includes('runtimeFooter: false'), 'runtime footer is not disabled');
  assert(wrapper.includes('/site-ui-consistency-v1.js?v=20260815-dock-label-v4'), 'dock-label consistency cache version v4 missing');
  assert(consistency.includes('qilyDockOfficialUrlPolishV2'), 'dock official-url visual polish v2 missing');
  assert(consistency.includes('qily-share-label-main') && consistency.includes('qily-share-label-url'), 'dock separated line typography missing');
  assert(consistency.includes('width:76px!important') && consistency.includes('width:72px!important'), 'dock desktop/mobile diameter protection missing');
  assert(consistency.includes('font-size:12px!important') && consistency.includes('font-size:11px!important'), 'dock official-url compact typography missing');
  assert(!/site-parent-navigation-v3\.js/.test(wrapper), 'redundant parent navigation dependency returned');
  assert(!/(?:site-information-architecture-v1|site-brand-trust-v1|site-trust-conversion-v2|site-visual-closure-v1|site-visual-closure-v2|site-text-contrast-audit-v1)\.js/.test(wrapper), 'old DOM content shaper returned in navigation runtime');
  assert(!/ensureFooter|footerMarkup|Technical & Project Contact/.test(footer), 'footer injector returned');
  assert(css.includes('#qilyGlobalFooter') && css.includes('body > footer'), 'footer hide fallback missing');
}

function verifyRuntimeBoundary() {
  const core = read('site-navigation-core.js');
  const legacy = read('site-navigation-legacy-20260802.js');
  assert(core.includes("['能力体系', '/capabilities/']") && core.includes("['信任中心', '/trust/']"), 'navigation core is not using R2 primary routes');
  assert(!/^\s*ensureGlobalContactFooter\(\);\s*$/m.test(core), 'runtime global contact footer injection returned');
  assert(!/^\s*ensureKnowledgeDocumentEnhancements\(\);\s*$/m.test(core), 'runtime document contact tail injection returned');
  assert(core.includes("if (!document.querySelector('header.qily-site-header .qily-global-nav,header.qily-global-header .qily-global-nav')) buildNavigation();"), 'static-first navigation guard missing');
  assert(legacy.includes("var CORE_SRC = '/site-navigation-core.js?v=20260815-performance-v16';"), 'legacy core cache version is not performance-v16');
}

function main() {
  verifyFastNavigationBaseline();

  // 历史发布器先运行；R2 performance materializer 收口性能；dock polish 最后收口悬浮栏可视化与缓存。
  runNode('scripts/publish-r2-runtime-stability.js');
  runNode('scripts/publish-early-career-history.js');
  runNode('scripts/publish-r2-runtime-stability.js');
  runNode('scripts/publish-r2-clean-runtime-v3.js');
  runNode('scripts/publish-dock-label-polish-v1.js');

  verifyFastNavigationBaseline();
  verifyCleanRuntime();
  verifyRuntimeBoundary();
  process.stdout.write('QilyLean site poka-yoke applied: immediate first paint, visual CSS bundle, route-scoped legacy, direct-core ordinary pages, bounded prefetch, lazy below-fold images and dock official-url v4 desktop/mobile fit are protected.\n');
}

main();
