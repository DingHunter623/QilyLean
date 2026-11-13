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

/* QilyLean interaction-stall recorder V1｜2026-11-14｜Issue #799 / #802
 * Purpose: capture evidence the next time the reported "nav / body button
 * click -> cursor spinning -> whole page unresponsive for tens of seconds"
 * freeze recurs, so the true cause can be located instead of presumed.
 * This recorder is PASSIVE: it only observes. It never modifies the page,
 * never blocks the main thread, and never sends anything over the network.
 * What it records (no personal data, no text content, no clipboard):
 *   - longtask entries (start, duration) from PerformanceObserver
 *   - event-loop heartbeat gaps (100 ms timer; a gap means the main thread
 *     was busy and could not run the timer)
 *   - the last click target, described only by tag + href path / data-action /
 *     aria-label (never text content)
 *   - the last navigation timing (TTFB / responseStart), which distinguishes
 *     "main thread blocked" from "server slow to answer a navigation"
 * Severe threshold follows the #799 runbook: an event-loop gap or a longtask
 * of >= 2500 ms. On a stall it stores a snapshot (max 5, newest first) in
 * localStorage under "qily-stall-log-v1" and logs one console error.
 * Read the log any time with: __qilyStallLog()
 * Clear it with: __qilyStallLogClear()
 */
(function (w, d) {
  'use strict';
  if (w.top !== w.self || w.__qilyStallRecorderV1) return;
  w.__qilyStallRecorderV1 = true;

  var STORE_KEY = 'qily-stall-log-v1';
  var MAX_ENTRIES = 5;
  var MAX_LONGTASKS = 30;
  var MAX_GAPS = 30;
  var SEVERE_MS = 2500;

  var longtasks = [];
  var gaps = [];
  var lastClick = null;
  var lastStallAt = 0;

  function now() { return Date.now(); }

  function describeTarget(target) {
    if (!target || !target.tagName) return null;
    var tag = String(target.tagName).toLowerCase();
    var desc = { tag: tag };
    try {
      if (target.getAttribute) {
        var href = target.getAttribute('href');
        if (href) {
          try { var u = new URL(href, location.href); desc.href = u.pathname + u.search; } catch (e) { desc.href = '(unparsable)'; }
        }
        var action = target.getAttribute('data-action');
        if (action) desc.action = action;
        var label = target.getAttribute('aria-label');
        if (label) desc.label = label.slice(0, 40);
        if (target.hasAttribute && target.hasAttribute('download')) desc.download = true;
      }
    } catch (e) { /* describe-only; never throw */ }
    return desc;
  }

  function navigationTiming() {
    try {
      var entries = w.performance && w.performance.getEntriesByType ? w.performance.getEntriesByType('navigation') : [];
      if (!entries || !entries.length) return null;
      var n = entries[entries.length - 1];
      return {
        type: n.type || null,
        ttfbMs: n.responseStart != null ? Math.round(n.responseStart) : null,
        domContentLoadedMs: n.domContentLoadedEventEnd != null ? Math.round(n.domContentLoadedEventEnd) : null,
        loadMs: n.loadEventEnd != null ? Math.round(n.loadEventEnd) : null
      };
    } catch (e) { return null; }
  }

  function readLog() {
    try {
      var raw = w.localStorage.getItem(STORE_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function storeSnapshot(snapshot) {
    try {
      var arr = readLog();
      arr.unshift(snapshot);
      arr = arr.slice(0, MAX_ENTRIES);
      w.localStorage.setItem(STORE_KEY, JSON.stringify(arr));
    } catch (e) { /* storage may be unavailable; the console log still fires */ }
  }

  function snapshot(kind, valueMs) {
    return {
      at: new Date().toISOString(),
      url: location.pathname + location.search,
      kind: kind,
      valueMs: valueMs,
      lastClick: lastClick,
      navigation: navigationTiming(),
      longtasks: longtasks.slice(-10),
      gaps: gaps.slice(-10)
    };
  }

  function onStall(kind, valueMs) {
    // Coalesce bursts: one snapshot per stall episode, not one per timer tick.
    if (now() - lastStallAt < 5000) return;
    lastStallAt = now();
    var snap = snapshot(kind, valueMs);
    storeSnapshot(snap);
    try {
      if (w.console && w.console.error) w.console.error('[QilyLean stall] ' + kind + ' ' + valueMs + 'ms; log: __qilyStallLog()', snap);
    } catch (e) { /* logging must never throw */ }
  }

  try {
    if (w.PerformanceObserver) {
      var po = new PerformanceObserver(function (list) {
        var entries = list.getEntries ? list.getEntries() : [];
        for (var i = 0; i < entries.length; i++) {
          var e = entries[i];
          var item = { start: Math.round(e.startTime), dur: Math.round(e.duration) };
          longtasks.push(item);
          if (longtasks.length > MAX_LONGTASKS) longtasks.shift();
          if (e.duration >= SEVERE_MS) onStall('longtask', Math.round(e.duration));
        }
      });
      po.observe({ entryTypes: ['longtask'] });
    }
  } catch (e) { /* longtask observation is best-effort */ }

  var hbLast = now();
  w.setInterval(function () {
    var t = now();
    var gap = t - hbLast;
    hbLast = t;
    // Ignore the first tick after the tab was hidden (timers are throttled
    // in background tabs; that is not a page freeze).
    if (!d.hidden && gap > 150) {
      gaps.push({ at: new Date().toISOString(), gap: gap });
      if (gaps.length > MAX_GAPS) gaps.shift();
      if (gap >= SEVERE_MS) onStall('heartbeat-gap', gap);
    }
  }, 100);

  d.addEventListener('click', function (event) {
    var target = event.target && event.target.closest ? (event.target.closest('a[href],button,[role="button"]') || event.target) : event.target;
    lastClick = { at: new Date().toISOString(), target: describeTarget(target) };
  }, { passive: true, capture: true });

  w.__qilyStallLog = function () {
    return { stored: readLog(), longtasks: longtasks.slice(), gaps: gaps.slice(), lastClick: lastClick, navigation: navigationTiming() };
  };
  w.__qilyStallLogClear = function () {
    try { w.localStorage.removeItem(STORE_KEY); } catch (e) {}
    longtasks.length = 0;
    gaps.length = 0;
    lastClick = null;
    return true;
  };
})(window, document);
