/* QilyLean native navigation v7｜2026-08-17
 * 原生整页导航；不预取 HTML，不跨页搬运 DOM/CSS，避免部署切换期复用旧文档缓存。
 */
(function (w, d) {
  'use strict';
  if (w.top !== w.self || w.__qilyFastNativeNavigationV7) return;
  w.__qilyFastNativeNavigationV7 = true;

  function urlOf(href) {
    try { return new URL(href, location.href); } catch (error) { return null; }
  }

  function writeMusicState() {
    try {
      if (w.__qilyLeanMusicWriteState) w.__qilyLeanMusicWriteState();
    } catch (error) {}
  }

  d.addEventListener('pointerdown', function (event) {
    var anchor = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!anchor) return;
    var url = urlOf(anchor.href);
    if (url && url.origin === location.origin) writeMusicState();
  }, true);

  w.__qilyPersistentNavigate = function (href) {
    var url = urlOf(href || '/');
    if (!url) return;
    writeMusicState();
    location.assign(url.href);
  };

  w.__qilyNavigationRuntimeContract = Object.freeze({
    mode: 'native-only-v7',
    domSwap: false,
    nativeHistory: true,
    musicStatePersistence: true,
    prefetch: false,
    documentPrefetch: false,
    staleDocumentCacheRisk: false,
    runtimeContentRewrite: false,
    visualMutation: false
  });
})(window, document);
