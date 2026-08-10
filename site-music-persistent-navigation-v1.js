/* QilyLean native navigation safety fallback v2 | 2026-08-10
 * The former full-screen iframe navigation retained the previous document,
 * waited on a second page load and could leave visitors behind a spinner.
 * Keep the public API for cached callers, but always use native navigation.
 */
(function (window) {
  'use strict';

  if (window.top !== window.self) return;
  if (window.__qilyNativeNavigationFallbackV2) return;
  window.__qilyNativeNavigationFallbackV2 = true;

  window.__qilyPersistentNavigate = function (href) {
    var url;
    try {
      url = new URL(href, window.location.href);
    } catch (error) {
      window.location.assign(String(href || '/'));
      return;
    }

    if (url.origin === window.location.origin) {
      window.location.assign(url.href);
      return;
    }
    window.location.href = url.href;
  };
})(window);
