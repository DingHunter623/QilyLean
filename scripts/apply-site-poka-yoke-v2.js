#!/usr/bin/env node
'use strict';

/* QilyLean site poka-yoke V2 / R2 performance baseline｜2026-08-15 PERFORMANCE V16.1 */
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
  [
    'window.__qilyFastNativeNavigationV6','data-qily-fast-prefetch','location.assign(url.href)',
    "mode:'native-prefetch-v6'",'prefetchBudget:3','secondaryPrefetchBudget:2',
    'duplicateFetch:false','touchPrefetch:false','intentPrefetch:true','visualMutation:false',
    'requestIdleCallback(warmPrimaryNav,{timeout:700})'
  ].forEach((marker) => assert(navigation.includes(marker), `fast-navigation baseline missing: ${marker}`));
  assert(!/\bfetch\s*\(/.test(navigation), 'duplicate fetch prefetch returned');
  assert(!/document\.addEventListener\(['"]touchstart['"]/.test(navigation), 'touchstart prefetch returned');
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
  assert(wrapper.includes('/site-ui-consistency-v1.js?v=20260815-dock-label-v6'), 'dock-label consistency cache version v6 missing');
  assert(consistency.includes("BUILD_ID='20260815-dock-label-v6'"), 'dock build id v6 missing');
  assert(consistency.includes('qilyDockOfficialUrlPolishV3'), 'dock official-url visual fallback v3 missing');
  assert(consistency.includes('normalizeInteractiveLabelsOnce'), 'one-shot label normalization missing');
  assert(consistency.includes('w.setTimeout(reconcileFast,120)') && consistency.includes('w.setTimeout(reconcileFast,520)'), 'bounded reconcile schedule missing');
  assert(!/addEventListener\(['"]resize['"]/.test(consistency), 'resize-wide reconcile returned');
  assert(!/site-parent-navigation-v3\.js/.test(wrapper), 'redundant parent navigation dependency returned');
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

function verifyDockMaterializer() {
  const publisher=read('scripts/publish-dock-label-polish-v1.js');
  [
    '20260815-dock-label-v6','20260815-prefetch-v6p1','qilyDockCriticalV6',
    'data-qily-dock-firstpaint-lock="v6"','removeCoreServiceRuntime','patchShareMarkup','patchFastNative'
  ].forEach((marker)=>assert(publisher.includes(marker),`dock materializer missing: ${marker}`));
  const servicePublisher=read('scripts/publish-core-service-dock-closure.js');
  assert(servicePublisher.includes('Core-service runtime scoping')&&servicePublisher.includes('cooperation/index.html'),'core-service runtime is not scoped to cooperation page');
}

function main() {
  verifyFastNavigationBaseline();

  // 历史发布器先运行；R2 performance materializer收口；dock first-paint最后执行并负责去除普通页面冗余合作脚本。
  runNode('scripts/publish-r2-runtime-stability.js');
  runNode('scripts/publish-early-career-history.js');
  runNode('scripts/publish-r2-runtime-stability.js');
  runNode('scripts/publish-r2-clean-runtime-v3.js');
  runNode('scripts/publish-dock-label-polish-v1.js');

  verifyFastNavigationBaseline();
  verifyCleanRuntime();
  verifyRuntimeBoundary();
  verifyDockMaterializer();
  process.stdout.write('QilyLean site poka-yoke applied: first-paint dock label is final, ordinary pages shed cooperation-only runtime, native navigation prefetch starts earlier on real intent/idle, and visual CSS quality is preserved.\n');
}

main();
