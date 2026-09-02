/* QilyLean R7 intent navigation prefetch V2｜2026-09-02
 * 保持浏览器原生整页导航，不进行 DOM/head/CSS 软交换，不复用上一页文档结构。
 * 只在用户出现真实导航意图（鼠标经过、键盘聚焦、触摸开始）时预取同源 HTML。
 * 禁止空闲期批量预热主导航，避免与首屏图片、Google 翻译及关键 CSS/JS 争抢带宽。
 * 尊重 Save-Data/慢网；文件下载、外链、新窗口、hash-only 不预取；最多缓存 12 个候选。
 */
(function (w, d) {
  'use strict';
  if (w.top !== w.self || w.__qilyR7IntentPrefetchV2) return;
  w.__qilyR7IntentPrefetchV2 = true;

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
    link.setAttribute('data-qily-r7-intent-prefetch', 'v2');
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

  w.__qilyR7IntentPrefetchContract = Object.freeze({
    mode: 'native-navigation-plus-intent-prefetch',
    domSwap: false,
    historyRewrite: false,
    sameOriginOnly: true,
    respectsSaveData: true,
    backgroundWarm: false,
    competesWithFirstPaint: false,
    maxCandidates: MAX
  });
})(window, document);
