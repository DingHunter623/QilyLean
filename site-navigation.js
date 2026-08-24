/* QilyLean navigation runtime v38｜2026-08-24
 * Hotfix closure:
 * 1) top-level /links/ navigation label is always “资源协同”;
 * 2) floating dock remains freely draggable while pressed and always returns to bottom-right after release/cancel/resize/pageshow;
 * 3) legacy persisted dock positions are removed;
 * 4) current V5 content-axis / dock / Hero / geometry assets are loaded with fresh cache keys;
 * 5) public integrity hotfix keeps terminology counts current and certificate verification boundaries explicit;
 * 6) /capabilities/ self-heals QilyLean Home complete action set and Pure DDZ readable light/white-gold visual even if generated HTML lags behind source.
 */
(function (d, w) {
  'use strict';
  if (w.__qilyStaticFirstNavigationV38) return;
  w.__qilyStaticFirstNavigationV38 = true;

  var CORE_SRC = '/site-navigation-core.js?v=20260822-dock-back-label-v27';
  var LEGACY_SRC = '/site-navigation-legacy-20260802.js?v=20260822-dock-back-label-v23';
  var CONSISTENCY_SRC = '/site-ui-consistency-v1.js?v=20260822-dock-back-label-v13';
  var INTEGRITY_SRC = '/site-integrity-hotfix-v1.js?v=20260824-public-integrity-v1';
  var CONTINUITY_HREF = '/site-interaction-continuity-v1.css?v=20260818-visual-governance-v3';
  var GOVERNANCE_HREF = '/site-visual-governance-v2.css?v=20260819-readable-floor-plus1-v6';
  var CONTENT_AXIS_HREF = '/site-content-axis-v1.css?v=20260822-sitewide-visual-axis-v5';
  var HOME_HERO_HREF = '/site-home-hero-tune-v1.css?v=20260819-home-hero-align-v3';
  var DOCK_HREF = '/site-floating-dock-standard-v1.css?v=20260819-dock-snapback-v3';
  var GEOMETRY_SRC = '/site-visual-geometry-v1.js?v=20260819-arrow-geometry-v4';
  var CAPABILITY_DDZ_HREF = '/pure-ddz-capability-visual-v2.css?v=20260824-readable-light-v5';
  var APP_SHARE_SRC = '/app-download-share-v1.js?v=20260824-capability-home-actions-v2';

  function currentPath() {
    return (w.location.pathname || '/').replace(/\/index\.html$/, '/');
  }

  function ensureStylesheet(id, href, selector) {
    var link = d.getElementById(id) || (selector ? d.querySelector(selector) : null);
    if (!link) {
      link = d.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      (d.head || d.documentElement).appendChild(link);
    }
    if (link.getAttribute('href') !== href) link.setAttribute('href', href);
    return link;
  }

  function installAssets() {
    ensureStylesheet('qilyInteractionContinuityV3', CONTINUITY_HREF, 'link[href*="/site-interaction-continuity-v1.css"]');
    ensureStylesheet('qilyVisualGovernanceV1', GOVERNANCE_HREF, 'link[href*="/site-visual-governance-v1.css"],link[href*="/site-visual-governance-v2.css"]');
    ensureStylesheet('qilyContentAxisV1', CONTENT_AXIS_HREF, 'link[href*="/site-content-axis-v1.css"]');
    ensureStylesheet('qilyFloatingDockStandardV1', DOCK_HREF, 'link[href*="/site-floating-dock-standard-v1.css"]');

    var path = currentPath();
    if (path === '/') ensureStylesheet('qilyHomeHeroTuneV1', HOME_HERO_HREF, 'link[href*="/site-home-hero-tune-v1.css"]');
    if (path === '/capabilities/') {
      ensureStylesheet('qilyPureDdzCapabilityVisualV2', CAPABILITY_DDZ_HREF, 'link[href*="/pure-ddz-capability-visual-v2.css"]');
    }

    if (!w.__qilyVisualGeometryV4 && !d.querySelector('script[src*="/site-visual-geometry-v1.js?v=20260819-arrow-geometry-v4"]')) {
      var geometry = d.createElement('script');
      geometry.src = GEOMETRY_SRC;
      geometry.async = false;
      geometry.setAttribute('data-qily-visual-geometry', 'v4');
      (d.head || d.documentElement).appendChild(geometry);
    }
  }

  function clearLegacyDockPosition() {
    try {
      w.localStorage.removeItem('qilyDockPositionV2');
      w.localStorage.removeItem('qilyDockTop');
    } catch (error) {}
  }

  function snapDockHome() {
    clearLegacyDockPosition();
    var dock = d.getElementById('floatDock');
    if (!dock) return false;
    dock.style.setProperty('left', 'auto', 'important');
    dock.style.setProperty('right', 'max(var(--qily-dock-edge, 12px), env(safe-area-inset-right))', 'important');
    dock.style.setProperty('top', 'auto', 'important');
    dock.style.setProperty('bottom', 'max(var(--qily-dock-edge, 12px), env(safe-area-inset-bottom))', 'important');
    dock.dataset.qilyDockHome = 'bottom-right';
    return true;
  }

  function normalizeResourceCollaborationLabel() {
    var changed = false;
    d.querySelectorAll('header nav a[href="/links/"],header nav a[href="/links/index.html"],.qily-global-nav a[href="/links/"],.qily-global-nav a[href="/links/index.html"]').forEach(function (link) {
      if ((link.textContent || '').trim() !== '资源协同') {
        link.textContent = '资源协同';
        changed = true;
      }
      link.setAttribute('aria-label', '资源协同');
    });
    return changed;
  }

  function closeRuntimeGap() {
    normalizeResourceCollaborationLabel();
    snapDockHome();
    w.requestAnimationFrame(function () {
      normalizeResourceCollaborationLabel();
      snapDockHome();
    });
  }

  function bindPermanentClosure() {
    if (w.__qilyResourceCollabDockHomeBoundV33) return;
    w.__qilyResourceCollabDockHomeBoundV33 = true;

    d.addEventListener('pointerup', function () { w.requestAnimationFrame(snapDockHome); }, false);
    d.addEventListener('pointercancel', function () { w.requestAnimationFrame(snapDockHome); }, false);
    w.addEventListener('resize', function () { w.requestAnimationFrame(snapDockHome); }, { passive: true });
    w.addEventListener('pageshow', function () { w.requestAnimationFrame(closeRuntimeGap); }, { passive: true });
    d.addEventListener('qily:shell-ready', closeRuntimeGap);

    var root = d.documentElement || d.body;
    if (root && w.MutationObserver) {
      var queued = false;
      var observer = new MutationObserver(function () {
        if (queued) return;
        queued = true;
        w.requestAnimationFrame(function () {
          queued = false;
          normalizeResourceCollaborationLabel();
          var dock = d.getElementById('floatDock');
          if (dock && dock.dataset.qilyDockHome !== 'dragging') snapDockHome();
        });
      });
      observer.observe(root, { childList: true, subtree: true });
    }
  }

  function loadScript(id, src, onload) {
    var existing = d.getElementById(id);
    if (existing) {
      if (existing.getAttribute('src') !== src) existing.setAttribute('src', src);
      if (onload) {
        if (existing.dataset.qilyLoaded === 'true') onload();
        else existing.addEventListener('load', onload, { once: true });
      }
      return existing;
    }
    var script = d.createElement('script');
    script.id = id;
    script.src = src;
    script.async = false;
    script.addEventListener('load', function () {
      script.dataset.qilyLoaded = 'true';
      if (onload) onload();
    }, { once: true });
    (d.head || d.documentElement).appendChild(script);
    return script;
  }

  function needsLegacyRuntime() {
    var path = currentPath();
    return path.indexOf('/cooperation/') === 0 || path.indexOf('/links/') === 0;
  }

  function installCapabilitySelfHeal() {
    if (currentPath() !== '/capabilities/') return;
    ensureStylesheet('qilyPureDdzCapabilityVisualV2', CAPABILITY_DDZ_HREF, 'link[href*="/pure-ddz-capability-visual-v2.css"]');
    if (!d.querySelector('script[src*="/app-download-share-v1.js?v=20260824-capability-home-actions-v2"]')) {
      loadScript('qilyAppDownloadShareRuntime', APP_SHARE_SRC);
    }
  }

  function loadRuntime() {
    loadScript('qilyPublicIntegrityHotfixV1', INTEGRITY_SRC);
    installCapabilitySelfHeal();
    loadScript('qilySiteNavigationCoreScript', CORE_SRC, function () {
      closeRuntimeGap();
      installCapabilitySelfHeal();
      if (needsLegacyRuntime()) {
        loadScript('qilySiteNavigationLegacyScriptV32', LEGACY_SRC, closeRuntimeGap);
      }
      if (!w.__qilyUiConsistencyV3 && !d.querySelector('script[src*="/site-ui-consistency-v1.js"]')) {
        loadScript('qilyUiConsistencyRuntimeV32', CONSISTENCY_SRC, closeRuntimeGap);
      }
    });
  }

  installAssets();
  bindPermanentClosure();
  clearLegacyDockPosition();
  normalizeResourceCollaborationLabel();
  loadRuntime();

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', function () {
      installCapabilitySelfHeal();
      closeRuntimeGap();
    }, { once: true });
  } else {
    installCapabilitySelfHeal();
    closeRuntimeGap();
  }
})(document, window);

window.__qilyLayeredNavigationBuildContract = Object.freeze({
  mode: 'atomic-first-paint-v38',
  staticHtmlAuthority: true,
  runtimeDependencyWaterfall: false,
  routeScopedLegacy: true,
  ordinaryPagesDirectCore: true,
  homepageHeroTune: true,
  unifiedContentAxis: true,
  publicIntegrityHotfix: true,
  capabilitySelfHeal: true,
  capabilityQHomeCompleteActions: true,
  capabilityDdzReadableLightPalette: true,
  terminologyLiveSource: '/qilylean/site-data.json',
  certificateVerificationBoundary: true,
  dockUniformVisualContract: true,
  dockUniformSize: 62,
  dockFreeDragXY: true,
  dockPositionPersistence: false,
  dockAutoHome: 'bottom-right',
  dockViewportBoundaryClamp: true,
  dockMobileDesktopParity: true,
  dockOrder: ['home','top','back','search','current','contact'],
  dockUniformFontSize: true,
  resourceCollaborationPrimaryLabel: true,
  friendLinksPageIdentityPreserved: true,
  unifiedOnePieceArrows: true,
  version: '20260824-capability-self-heal-v38'
});
