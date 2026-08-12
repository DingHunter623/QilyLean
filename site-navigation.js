/* QilyLean R2 static-first navigation runtime v20｜2026-08-12
 * 原则：静态 HTML 是唯一正文权威源；运行时只负责导航/悬浮工具所必需的增强。
 * 禁止：运行时追加信息架构、品牌信任、转化 CTA、页尾联系栏、正文区块或共享布局 CSS。
 */
(function (d, w) {
  'use strict';
  if (w.__qilyStaticFirstNavigationV20) return;
  w.__qilyStaticFirstNavigationV20 = true;

  var LEGACY_SRC = '/site-navigation-legacy-20260802.js?v=20260813-r2-clean-v4';
  var PARENT_SRC = '/site-parent-navigation-v3.js?v=20260813-operating-axis-nav-v4';

  function appendLegacy() {
    if (w.__qilyLeanSiteNavigationPublicV8) return;
    var existing = d.querySelector('script[data-qily-navigation-legacy]');
    if (existing) return;
    var script = d.createElement('script');
    script.src = LEGACY_SRC;
    script.async = false;
    script.setAttribute('data-qily-navigation-legacy', 'r2-static-first-v20');
    (d.head || d.documentElement).appendChild(script);
  }

  function loadParentNavigation() {
    if (w.__qilyParentNavigationV3) {
      appendLegacy();
      return;
    }
    var existing = d.querySelector('script[data-qily-parent-navigation],script[src*="/site-parent-navigation-v3.js"]');
    if (existing) {
      existing.addEventListener('load', appendLegacy, { once: true });
      if (existing.dataset && existing.dataset.qilyLoaded === 'true') appendLegacy();
      return;
    }
    var script = d.createElement('script');
    script.src = PARENT_SRC;
    script.async = false;
    script.setAttribute('data-qily-parent-navigation', 'v3');
    script.addEventListener('load', function () {
      script.dataset.qilyLoaded = 'true';
      appendLegacy();
    }, { once: true });
    script.addEventListener('error', appendLegacy, { once: true });
    (d.head || d.documentElement).appendChild(script);
  }

  function release(button) {
    if (!button) return;
    if (button.__qilyPressedTimer) w.clearTimeout(button.__qilyPressedTimer);
    button.__qilyPressedTimer = w.setTimeout(function () {
      delete button.dataset.qilyPressed;
      button.__qilyPressedTimer = 0;
    }, 120);
  }

  function bindDockButton(button) {
    if (!button || button.dataset.qilyPointerFeedback === 'v2') return;
    button.dataset.qilyPointerFeedback = 'v2';
    button.addEventListener('pointerdown', function () {
      if (!button.matches(':disabled,[aria-disabled="true"]')) button.dataset.qilyPressed = 'true';
    }, { passive: true });
    button.addEventListener('pointerup', function () { release(button); }, { passive: true });
    button.addEventListener('pointercancel', function () { release(button); }, { passive: true });
    button.addEventListener('blur', function () { release(button); });
  }

  function bindDock() {
    d.querySelectorAll('#floatDock.qily-float-dock .qily-float-btn').forEach(bindDockButton);
  }

  loadParentNavigation();
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', bindDock, { once: true });
  else bindDock();
  [120, 500, 1200].forEach(function (delay) { w.setTimeout(bindDock, delay); });
})(document, window);

window.__qilyLayeredNavigationBuildContract = Object.freeze({
  mode: 'r2-static-first-v20',
  staticHtmlAuthority: true,
  dynamicContentShapers: false,
  runtimeFooter: false,
  runtimeSharedCssRewrite: false,
  nativePrefetch: true,
  dockActions: [
    'data-action="home"', 'data-action="top"', 'data-action="back"',
    'data-action="search"', 'data-action="current"', 'data-action="share"',
    'data-action="contact"'
  ]
});
