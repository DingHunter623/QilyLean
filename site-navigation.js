/* QilyLean global VI, navigation, trust and contrast loader v10 */
(function (d, w) {
  'use strict';
  if (w.__qilyGlobalAssetLoaderV10) return;
  w.__qilyGlobalAssetLoaderV10 = true;

  function removeMicrosoftOverrides() {
    ['qilyMicrosoftInternationalStylesheet','qilyMicrosoftEnterpriseComponentsStylesheet','qilyMicrosoftNavUnderlineStyle','qilyNavFourSideBorderStyle'].forEach(function (id) {
      var node = d.getElementById(id);
      if (node && node.parentNode) node.parentNode.removeChild(node);
    });
    d.querySelectorAll('script[data-qily-microsoft-international-loader]').forEach(function (node) { node.remove(); });
    d.documentElement.classList.remove('qily-ms-international');
    if (d.body) d.body.classList.remove('qily-ms-international');
  }

  function ensureStylesheet(id, href) {
    var current = d.getElementById(id);
    if (current) {
      if (current.getAttribute('href') !== href) current.setAttribute('href', href);
      return current;
    }
    var link = d.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    (d.head || d.documentElement).appendChild(link);
    return link;
  }

  function ensureScript(attribute, value, src) {
    var current = d.querySelector('script[' + attribute + '="' + value + '"]');
    if (current) {
      if (current.getAttribute('src') !== src) current.setAttribute('src', src);
      return current;
    }
    var script = d.createElement('script');
    script.src = src;
    script.defer = true;
    script.setAttribute(attribute, value);
    (d.head || d.documentElement).appendChild(script);
    return script;
  }

  function ensureGlobalAssets() {
    removeMicrosoftOverrides();
    [
      ['qilyVisualScaleStylesheet','/site-visual-scale-v1.css?v=20260803-home-badge-wrap-v5'],
      ['qilyHomePortraitBadgeFixStylesheet','/home-portrait-badge-fix-v1.css?v=20260803-badge-wrap-v2'],
      ['qilyGlobalLinkStandardStylesheet','/site-link-standard-v2.css?v=20260803-nav-four-border-v6'],
      ['qilyDarkSurfaceContrastStylesheet','/site-dark-surface-contrast-v1.css?v=20260801-dark-surface-v2'],
      ['qilyInformationArchitectureStylesheet','/site-information-architecture-v1.css?v=20260802-commercial-focus-v1'],
      ['qilyViStandardStylesheet','/site-vi-standard-v1.css?v=20260801-vi-standard-v1'],
      ['qilyViContrastRestorationStylesheet','/site-vi-contrast-restoration-v1.css?v=20260803-vi-contrast-hotfix-v1'],
      ['qilyVisualClosureStylesheet','/site-visual-closure-v1.css?v=20260804-sitewide-clarity-v2'],
      ['qilyBoundaryLinksClosureStylesheet','/site-visual-closure-v2.css?v=20260803-boundary-links-v2'],
      ['qilyBrandTrustStylesheet','/site-brand-trust-v1.css?v=20260802-project-rolebar-v3'],
      ['qilyInteractiveHoverContrastStylesheet','/site-interactive-hover-contrast-v1.css?v=20260805-interactive-hover-contrast-v2'],
      ['qilyTrustConversionV2Stylesheet','/site-trust-conversion-v2.css?v=20260805-action-label-v4']
    ].forEach(function (asset) { ensureStylesheet(asset[0], asset[1]); });

    ensureScript('data-qily-visual-closure-loader','v1','/site-visual-closure-v1.js?v=20260804-sitewide-clarity-v2');
    ensureScript('data-qily-boundary-links-loader','v2','/site-visual-closure-v2.js?v=20260803-boundary-links-v2');
    ensureScript('data-qily-information-architecture-loader','v1','/site-information-architecture-v1.js?v=20260802-commercial-focus-v1');
    ensureScript('data-qily-brand-trust-loader','v3','/site-brand-trust-v1.js?v=20260802-project-rolebar-v3');
    ensureScript('data-qily-trust-conversion-loader','v2','/site-trust-conversion-v2.js?v=20260805-action-label-v3');
    ensureScript('data-qily-text-contrast-audit','v1','/site-text-contrast-audit-v1.js?v=20260805-runtime-audit-v1');
  }

  function loadConditionalStyles() {
    var body = d.body;
    var isDaily = !!(body && body.classList && body.classList.contains('daily-single-page')) || !!d.querySelector('.brief-adjacent');
    if (isDaily) ensureStylesheet('qilyDailyNavigationContrastStylesheet','/qilylean/daily-navigation-contrast-v1.css?v=20260802-contrast-v1');
    if (d.querySelector('.daily-index-heading')) ensureStylesheet('qilyDailyDirectoryActionsStylesheet','/qilylean/daily-directory-actions-v1.css?v=20260802-single-line-v1');
  }

  function promoteVi() {
    removeMicrosoftOverrides();
    var parent = d.head || d.documentElement;
    ['qilyViStandardStylesheet','qilyViContrastRestorationStylesheet','qilyVisualClosureStylesheet','qilyBoundaryLinksClosureStylesheet','qilyInteractiveHoverContrastStylesheet','qilyTrustConversionV2Stylesheet'].forEach(function (id) {
      var current = d.getElementById(id);
      if (current && current.parentNode === parent) parent.appendChild(current);
    });
  }

  ensureGlobalAssets();
  loadConditionalStyles();
  promoteVi();
  [120,600,1500,3000].forEach(function (delay) { setTimeout(promoteVi, delay); });
})(document, window);

window.__qilyLayeredNavigationBuildContract = Object.freeze({
  shellAssets:[
    'site-wide-layout-v1.css?v=20260729-fluid-copy-v5',
    'site-typography-v1.css?v=20260729-hierarchy-v4',
    'site-vi-standard-v1.css?v=20260801-vi-standard-v1',
    'site-vi-contrast-restoration-v1.css?v=20260803-vi-contrast-hotfix-v1',
    'site-visual-closure-v1.css?v=20260804-sitewide-clarity-v2',
    'site-visual-closure-v1.js?v=20260804-sitewide-clarity-v2',
    'site-visual-closure-v2.css?v=20260803-boundary-links-v2',
    'site-visual-closure-v2.js?v=20260803-boundary-links-v2',
    'site-interactive-hover-contrast-v1.css?v=20260805-interactive-hover-contrast-v2',
    'site-trust-conversion-v2.css?v=20260805-action-label-v4',
    'site-trust-conversion-v2.js?v=20260805-action-label-v3',
    'site-text-contrast-audit-v1.js?v=20260805-runtime-audit-v1'
  ],
  disabledAssets:['site-microsoft-international-v1.css','site-microsoft-enterprise-components-v2.css','site-microsoft-international-v1.js'],
  bootstrapMarkers:['addWideLayoutStylesheet();','addTypographyStylesheet();','if (document.body) boot()'],
  dockActions:['data-action="home"','data-action="search"','data-action="back"','data-action="current"','data-action="share"','data-action="contact"']
});

/* QilyLean global navigation wrapper｜保留原导航功能并加载可信度、信息架构与对比度闭环 */
(function (d, w) {
  'use strict';
  if (w.__qilyNavigationWrapper20260805V16) return;
  w.__qilyNavigationWrapper20260805V16 = true;

  function ensureStylesheet(id, href) {
    var current = d.getElementById(id);
    if (current) {
      if (current.getAttribute('href') !== href) current.setAttribute('href', href);
      return;
    }
    var link = d.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    (d.head || d.documentElement).appendChild(link);
  }

  function ensureScript(attribute, value, src) {
    var current = d.querySelector('script[' + attribute + '="' + value + '"]');
    if (current) {
      if (current.getAttribute('src') !== src) current.setAttribute('src', src);
      return current;
    }
    var script = d.createElement('script');
    script.src = src;
    script.defer = true;
    script.setAttribute(attribute, value);
    (d.head || d.documentElement).appendChild(script);
    return script;
  }

  function loadEnhancers() {
    ensureStylesheet('qilyBrandTrustStylesheet','/site-brand-trust-v1.css?v=20260802-project-rolebar-v3');
    ensureStylesheet('qilyInformationArchitectureStylesheet','/site-information-architecture-v1.css?v=20260802-commercial-focus-v1');
    ensureStylesheet('qilyVisualClosureStylesheet','/site-visual-closure-v1.css?v=20260804-sitewide-clarity-v2');
    ensureStylesheet('qilyBoundaryLinksClosureStylesheet','/site-visual-closure-v2.css?v=20260803-boundary-links-v2');
    ensureStylesheet('qilyInteractiveHoverContrastStylesheet','/site-interactive-hover-contrast-v1.css?v=20260805-interactive-hover-contrast-v2');
    ensureStylesheet('qilyTrustConversionV2Stylesheet','/site-trust-conversion-v2.css?v=20260805-action-label-v4');

    ensureScript('data-qily-brand-trust-loader','v3','/site-brand-trust-v1.js?v=20260802-project-rolebar-v3');
    ensureScript('data-qily-information-architecture-loader','v1','/site-information-architecture-v1.js?v=20260802-commercial-focus-v1');
    ensureScript('data-qily-visual-closure-loader','v1','/site-visual-closure-v1.js?v=20260804-sitewide-clarity-v2');
    ensureScript('data-qily-boundary-links-loader','v2','/site-visual-closure-v2.js?v=20260803-boundary-links-v2');
    ensureScript('data-qily-trust-conversion-loader','v2','/site-trust-conversion-v2.js?v=20260805-action-label-v3');
    ensureScript('data-qily-text-contrast-audit','v1','/site-text-contrast-audit-v1.js?v=20260805-runtime-audit-v1');

    var body = d.body;
    var isDaily = !!(body && body.classList && body.classList.contains('daily-single-page')) || !!d.querySelector('.brief-adjacent');
    if (isDaily) ensureStylesheet('qilyDailyNavigationContrastStylesheet','/qilylean/daily-navigation-contrast-v1.css?v=20260802-contrast-v1');
    if (d.querySelector('.daily-index-heading')) ensureStylesheet('qilyDailyDirectoryActionsStylesheet','/qilylean/daily-directory-actions-v1.css?v=20260802-single-line-v1');
  }

  function appendLegacy() {
    if (d.querySelector('script[data-qily-navigation-legacy]')) { loadEnhancers(); return; }
    var legacy = d.createElement('script');
    legacy.src = '/site-navigation-legacy-20260802.js?v=20260805-first-paint-v1';
    legacy.async = false;
    legacy.setAttribute('data-qily-navigation-legacy','parent-route-v3');
    legacy.onload = loadEnhancers;
    legacy.onerror = loadEnhancers;
    (d.head || d.documentElement).appendChild(legacy);
  }

  function loadParentNavigation() {
    if (w.__qilyParentNavigationV3) { appendLegacy(); return; }
    var existing = d.querySelector('script[data-qily-parent-navigation]');
    if (existing) { existing.addEventListener('load', appendLegacy, { once:true }); return; }
    var script = d.createElement('script');
    script.src = '/site-parent-navigation-v3.js?v=20260803-parent-route-v3';
    script.async = false;
    script.setAttribute('data-qily-parent-navigation','v3');
    script.onload = appendLegacy;
    script.onerror = appendLegacy;
    (d.head || d.documentElement).appendChild(script);
  }

  loadEnhancers();
  loadParentNavigation();
})(document, window);
