/* QilyLean dual-site traffic statistics v1.0 | 2026-10-29
 * Public aggregate counters via CounterAPI.com. The site does not display visitor identities.
 * Counts begin at rollout; historical pageviews are not fabricated or backfilled.
 */
(function (d, w) {
  'use strict';
  if (w.__qilyTrafficStatsV1Loaded) return;
  w.__qilyTrafficStatsV1Loaded = true;

  var host = String((w.location && w.location.hostname) || '').toLowerCase();
  var isChina = host === 'qilylean.cn' || host === 'www.qilylean.cn';
  var isInternational = host === 'qilylean.com' || host === 'www.qilylean.com';
  if (!isChina && !isInternational) return;
  var currentSite = isChina ? 'qilylean.cn' : 'qilylean.com';
  var callbackSequence = 0;

  function ensureTracker() {
    if (!d.body || d.querySelector('[data-qily-traffic-tracker="v1"]')) return;
    var tracker = d.createElement('div');
    tracker.className = 'counterapi';
    tracker.setAttribute('ns', currentSite);
    tracker.setAttribute('action', 'view');
    tracker.setAttribute('key', 'sitewide-pageview');
    tracker.setAttribute('behavior', 'view');
    tracker.setAttribute('invisible', 'true');
    tracker.setAttribute('noLink', 'true');
    tracker.setAttribute('noIcon', 'true');
    tracker.setAttribute('noCss', 'true');
    tracker.setAttribute('data-qily-traffic-tracker', 'v1');
    tracker.setAttribute('aria-hidden', 'true');
    tracker.style.position = 'absolute';
    tracker.style.left = '-10000px';
    tracker.style.width = '1px';
    tracker.style.height = '1px';
    tracker.style.overflow = 'hidden';
    d.body.appendChild(tracker);
  }

  function loadCounterApi() {
    if (d.querySelector('script[data-qily-counterapi-script="v1"]')) return;
    var script = d.createElement('script');
    script.async = true;
    script.src = 'https://counterapi.com/c.js?ns=' + encodeURIComponent(currentSite);
    script.setAttribute('data-qily-counterapi-script', 'v1');
    (d.head || d.documentElement).appendChild(script);
  }

  function formatCount(value) {
    var count = Math.max(0, Math.floor(Number(value)));
    try {
      return count.toLocaleString('zh-CN');
    } catch (e) {
      return String(count).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  }

  function getTarget(name) {
    return d.querySelector('[data-qily-traffic-count="' + name + '"]');
  }

  function unavailable(target) {
    if (!target) return;
    if (target.getAttribute('data-qily-traffic-state') !== 'ready') target.textContent = '暂不可用';
    target.setAttribute('data-qily-traffic-state', 'stale');
  }

  function requestCount(site, metric, targetName) {
    var target = getTarget(targetName);
    if (!target) return;
    var action = metric === 'total' ? 'view' : 'any';
    var key = metric === 'total' ? 'sitewide-pageview' : 'any';
    var params = metric === 'total'
      ? { readOnly: 'true' }
      : { timeline: '30m', unique: 'true', readOnly: 'true' };
    var callbackName = '__qilyTrafficStatsCallback' + (++callbackSequence) + '_' + Date.now();
    params.callback = callbackName;
    var query = [];
    Object.keys(params).forEach(function (name) {
      query.push(encodeURIComponent(name) + '=' + encodeURIComponent(params[name]));
    });

    var script = d.createElement('script');
    var finished = false;
    var timer = null;

    function finish(value, good) {
      if (finished) return;
      finished = true;
      if (timer) w.clearTimeout(timer);
      if (script.parentNode) script.parentNode.removeChild(script);
      if (good && value !== null && isFinite(Number(value))) {
        target.textContent = formatCount(value);
        target.setAttribute('data-qily-traffic-state', 'ready');
      } else {
        unavailable(target);
      }
      try {
        delete w[callbackName];
      } catch (e) {
        w[callbackName] = undefined;
      }
    }

    w[callbackName] = function (payload) {
      var value = payload && payload.value;
      if (value === undefined || value === null || !isFinite(Number(value))) {
        finish(null, false);
        return;
      }
      finish(Number(value), true);
    };

    script.async = true;
    script.src = 'https://counterapi.com/api/' + encodeURIComponent(site) + '/' + action + '/' + key + '?' + query.join('&');
    script.onerror = function () {
      finish(null, false);
    };
    timer = w.setTimeout(function () {
      finish(null, false);
    }, 10000);
    (d.head || d.documentElement).appendChild(script);
  }

  function refreshTotals() {
    requestCount('qilylean.com', 'total', 'intl-total');
    requestCount('qilylean.cn', 'total', 'cn-total');
  }

  function refreshActive() {
    requestCount('qilylean.com', 'active', 'intl-active');
    requestCount('qilylean.cn', 'active', 'cn-active');
  }

  function refreshAll() {
    refreshTotals();
    refreshActive();
  }

  function init() {
    if (!d.body) return;
    ensureTracker();
    loadCounterApi();
    if (!d.querySelector('[data-qily-traffic-stats="v1"]')) return;
    w.setTimeout(refreshAll, 1500);
    w.setInterval(function () {
      if (!d.hidden) refreshActive();
    }, 60000);
    w.setInterval(function () {
      if (!d.hidden) refreshTotals();
    }, 300000);
    d.addEventListener('visibilitychange', function () {
      if (!d.hidden) refreshActive();
    });
  }

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})(document, window);
