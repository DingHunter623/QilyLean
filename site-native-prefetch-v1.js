/* QilyLean R6 native navigation prefetch v1｜2026-08-19
 * 目的：保持浏览器原生整页导航，不进行DOM/head/CSS软交换；仅对高概率同源HTML做低优先级预取。
 * 约束：尊重 Save-Data/慢网；文件下载、外链、新窗口、hash-only 不预取；最多缓存12个候选。
 */
(function (w, d) {
  'use strict';
  if (w.top !== w.self || w.__qilyR6NativePrefetchV1) return;
  w.__qilyR6NativePrefetchV1 = true;

  var MAX = 12;
  var seen = new Set();
  var blocked = /\.(?:pdf|xlsx?|docx?|pptx?|zip|rar|7z|apk|aab|mp3|mp4|webm|mov|jpe?g|png|gif|webp|svg|xml|json)(?:$|\?)/i;

  function networkAllows() {
    var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!c) return true;
    if (c.saveData) return false;
    return !/(?:^|-)2g$/i.test(c.effectiveType || '');
  }

  function urlOf(href) {
    try { return new URL(href, location.href); } catch (error) { return null; }
  }

  function eligible(anchor) {
    if (!anchor || !networkAllows()) return null;
    if (anchor.hasAttribute('download')) return null;
    var target = (anchor.getAttribute('target') || '').toLowerCase();
    if (target && target !== '_self') return null;
    if (anchor.closest('[data-qily-native-prefetch="false"]')) return null;
    var url = urlOf(anchor.getAttribute('href') || anchor.href);
    if (!url || url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return null;
    if (blocked.test(url.pathname + url.search)) return null;
    if (url.pathname === location.pathname && url.search === location.search) return null;
    url.hash = '';
    return url;
  }

  function prefetch(url) {
    if (!url || seen.has(url.href) || seen.size >= MAX) return;
    seen.add(url.href);
    var link = d.createElement('link');
    link.rel = 'prefetch';
    link.href = url.href;
    link.setAttribute('fetchpriority', 'low');
    link.setAttribute('data-qily-r6-prefetch', 'v1');
    (d.head || d.documentElement).appendChild(link);
  }

  function fromEvent(event) {
    var anchor = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    var url = eligible(anchor);
    if (url) prefetch(url);
  }

  d.addEventListener('pointerover', fromEvent, { passive: true, capture: true });
  d.addEventListener('focusin', fromEvent, true);
  d.addEventListener('touchstart', fromEvent, { passive: true, capture: true });

  function warmPrimary() {
    if (!networkAllows()) return;
    var links = d.querySelectorAll('header.qily-site-header nav a[href],header.qily-global-header nav a[href]');
    for (var i = 0; i < links.length && seen.size < MAX; i += 1) {
      var url = eligible(links[i]);
      if (url) prefetch(url);
    }
  }

  if ('requestIdleCallback' in w) w.requestIdleCallback(warmPrimary, { timeout: 2200 });
  else w.setTimeout(warmPrimary, 1400);

  w.__qilyR6NativePrefetchContract = Object.freeze({
    mode: 'native-navigation-plus-low-priority-prefetch',
    domSwap: false,
    historyRewrite: false,
    sameOriginOnly: true,
    respectsSaveData: true,
    maxCandidates: MAX
  });
})(window, document);
