#!/usr/bin/env node
'use strict';

/* QilyLean site poka-yoke V2 / R2 navigation baseline｜2026-08-16 NAV CURRENT V17 */
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
  assert(wrapper.includes('/site-ui-consistency-v1.js?v=20260816-nav-current-v7'), 'navigation current-state consistency cache version v7 missing');
  assert(consistency.includes("BUILD_ID='20260816-nav-current-v7'"), 'navigation current-state build id v7 missing');
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
  assert(core.includes('syncPrimaryNavCurrentState();'), 'primary navigation current-state synchronization missing');
  assert(legacy.includes("var CORE_SRC = '/site-navigation-core.js?v=20260816-nav-current-v17';"), 'legacy core cache version is not navigation-current-v17');
}

function verifyDockMaterializer() {
  const publisher=read('scripts/publish-dock-label-polish-v1.js');
  [
    '20260816-nav-current-v7','20260815-prefetch-v6p1','qilyDockCriticalV6',
    'data-qily-dock-firstpaint-lock="v6"','removeCoreServiceRuntime','patchShareMarkup','patchFastNative'
  ].forEach((marker)=>assert(publisher.includes(marker),`dock materializer missing: ${marker}`));

  const servicePublisher=read('scripts/publish-core-service-dock-closure.js');
  assert(servicePublisher.includes('20260815-cooperation-dock-v6'),'cooperation dock cache version v6 missing');
  assert(servicePublisher.includes('cooperation/index.html'),'core-service runtime is not scoped to cooperation page');

  const serviceRuntime=read('site-core-service-dock-closure-v1.js');
  assert(serviceRuntime.includes('__qilyCoreServiceDockClosureV6'),'cooperation lightweight runtime v6 missing');
  assert(serviceRuntime.includes('分享</span><span class="qily-share-label-line qily-share-label-url">官方网址'),'cooperation dock final official-url markup missing');
  assert(!serviceRuntime.includes("share:{html:'分享<br>官网'"),'cooperation runtime old share-site label returned');
  assert(!/new\s+MutationObserver|\.observe\(d\.documentElement/.test(serviceRuntime),'cooperation runtime heavy document observer returned');
}

function main() {
  verifyFastNavigationBaseline();

  // 历史发布器先运行；R2性能收口；合作页专用轻量运行时物化；dock首帧最后统一视觉与缓存。
  runNode('scripts/publish-r2-runtime-stability.js');
  runNode('scripts/publish-early-career-history.js');
  runNode('scripts/publish-r2-runtime-stability.js');
  runNode('scripts/publish-r2-clean-runtime-v3.js');
  runNode('scripts/publish-core-service-dock-closure.js');
  runNode('scripts/publish-dock-label-polish-v1.js');

  verifyFastNavigationBaseline();
  verifyCleanRuntime();
  verifyRuntimeBoundary();
  verifyDockMaterializer();
  process.stdout.write('QilyLean site poka-yoke applied: cooperation dock is lightweight v6 with final official-url label, first-paint dock is stable, native navigation prefetch stays fast, and visual quality is preserved.\n');
}

main();
