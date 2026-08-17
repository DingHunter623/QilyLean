#!/usr/bin/env node
'use strict';

/* QilyLean site poka-yoke V2 / atomic first-paint baseline｜2026-08-17 */
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
    'w.__qilyFastNativeNavigationV7','location.assign(url.href)',
    "mode: 'native-only-v7'",'domSwap: false','nativeHistory: true',
    'documentPrefetch: false','staleDocumentCacheRisk: false','runtimeContentRewrite: false','visualMutation: false'
  ].forEach((marker) => assert(navigation.includes(marker), `fast-navigation baseline missing: ${marker}`));
  assert(!/\bfetch\s*\(/.test(navigation), 'duplicate fetch prefetch returned');
  assert(!/document\.addEventListener\(['"]touchstart['"]/.test(navigation), 'touchstart prefetch returned');
  assert(!/reconcileHeadAssets|history\.pushState|DOMParser\(\)|qilySoftNavigation|qily:softnavigate/.test(navigation), 'legacy cross-page DOM/CSS swap returned');
  assert(!/requestIdleCallback|rel\s*=\s*['"]prefetch|warmPrimaryNav/.test(navigation), 'HTML document prefetch returned');
}

function verifyCleanRuntime() {
  const wrapper = read('site-navigation.js');
  const footer = read('site-footer-standard-v28.js');
  const css = read('site-r2-stability-fixes-v1.css');
  const consistency = read('site-ui-consistency-v1.js');
  assert(wrapper.includes("mode: 'atomic-first-paint-v22'"), 'atomic first-paint navigation runtime v22 missing');
  assert(wrapper.includes('runtimeDependencyWaterfall: false'), 'runtime dependency waterfall boundary missing');
  assert(wrapper.includes('routeScopedLegacy: true'), 'route-scoped legacy boundary missing');
  assert(wrapper.includes('ordinaryPagesDirectCore: true'), 'ordinary-page direct-core route missing');
  assert(wrapper.includes('dynamicContentShapers: false'), 'dynamic content shapers are not disabled');
  assert(wrapper.includes('runtimeFooter: false'), 'runtime footer is not disabled');
  assert(wrapper.includes('/site-ui-consistency-v1.js?v=20260817-atomic-first-paint-v8'), 'atomic first-paint consistency cache version v8 missing');
  assert(consistency.includes("BUILD_ID='20260817-atomic-first-paint-v8'"), 'atomic first-paint consistency build id v8 missing');
  assert(consistency.includes('qilyDockOfficialUrlPolishV3'), 'dock official-url visual fallback v3 missing');
  assert(consistency.includes("d.addEventListener('qily:shell-ready',reconcileFast)"), 'event-driven shell reconcile missing');
  assert(!/normalizeInteractiveLabelsOnce|w\.setTimeout\(reconcileFast|location\.reload\(\)/.test(consistency), 'delayed visible correction or pageshow reload returned');
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
  assert(legacy.includes("var CORE_SRC = '/site-navigation-core.js?v=20260817-atomic-first-paint-v18';"), 'legacy core cache version is not atomic-first-paint-v18');
}

function verifyDockMaterializer() {
  const publisher=read('scripts/publish-dock-label-polish-v1.js');
  [
    '20260817-atomic-first-paint-v8','20260817-native-only-v7','qilyDockCriticalV6',
    'data-qily-dock-firstpaint-lock="v7"','removeCoreServiceRuntime','patchShareMarkup','patchFastNative'
  ].forEach((marker)=>assert(publisher.includes(marker),`dock materializer missing: ${marker}`));

  const servicePublisher=read('scripts/publish-core-service-dock-closure.js');
  assert(servicePublisher.includes('20260817-cooperation-dock-v7'),'cooperation dock cache version v7 missing');
  assert(servicePublisher.includes('cooperation/index.html'),'core-service runtime is not scoped to cooperation page');

  const serviceRuntime=read('site-core-service-dock-closure-v1.js');
  assert(serviceRuntime.includes('__qilyCoreServiceDockClosureV7'),'cooperation lightweight runtime v7 missing');
  assert(serviceRuntime.includes('分享</span><span class="qily-share-label-line qily-share-label-url">官方网址'),'cooperation dock final official-url markup missing');
  assert(!serviceRuntime.includes("share:{html:'分享<br>官网'"),'cooperation runtime old share-site label returned');
  assert(!/new\s+MutationObserver|\.observe\(d\.documentElement/.test(serviceRuntime),'cooperation runtime heavy document observer returned');
  assert(!/\[80,260,760\]|addEventListener\(['"]load['"],apply/.test(serviceRuntime),'cooperation runtime delayed first-paint correction returned');
}

function verifyPermanentInteractionBaseline() {
  const css = read('site-interaction-continuity-v1.css');
  const guard = read('scripts/site-regression-guard-v2.js');
  const homepage = read('index.html');
  [
    'interaction continuity v2', '.qily-home-actions', '.qily-section-actions', '.qily-ia-actions',
    '.module-actions', '.article-actions', '.hero-actions', '.form-actions',
    ':hover', ':active', ':focus-visible', '[data-qily-pressed="true"]'
  ].forEach((marker)=>assert(css.includes(marker),`permanent interaction baseline missing: ${marker}`));
  assert(guard.includes("const INTERACTION_CSS_VERSION='20260817-continuity-v2';"),'regression guard interaction contract is not v2');
  assert(homepage.includes('/site-interaction-continuity-v1.css?v=20260817-continuity-v2'),'homepage interaction cache is not v2');
}

function main() {
  verifyFastNavigationBaseline();

  // 历史发布器先运行；R2性能收口；合作页专用轻量运行时物化；dock首帧统一；
  // 最后必须执行全站交互永久规则，防止任何历史发布器把 hover/active/focus 版本写回旧基线。
  runNode('scripts/publish-r2-runtime-stability.js');
  runNode('scripts/publish-early-career-history.js');
  runNode('scripts/publish-r2-runtime-stability.js');
  runNode('scripts/publish-r2-clean-runtime-v3.js');
  runNode('scripts/publish-core-service-dock-closure.js');
  runNode('scripts/publish-dock-label-polish-v1.js');
  runNode('scripts/enforce-sitewide-interaction-feedback.js');

  verifyFastNavigationBaseline();
  verifyCleanRuntime();
  verifyRuntimeBoundary();
  verifyDockMaterializer();
  verifyPermanentInteractionBaseline();
  process.stdout.write('QilyLean site poka-yoke applied: static HTML is authoritative; interaction feedback v2 is now part of the protected baseline and cannot be rolled back by legacy materializers.\n');
}

main();