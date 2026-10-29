/* QilyLean traffic statistics | international pageview counter v2.0 | 2026-10-29
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


  // International-site counter: the previous CounterAPI.com integration no longer
  // returns usable values in production. Use a public read/hit endpoint instead.
  // Only the international runtime is changed here; China uses its separate /assets copy.
  var INTL_COUNTER_BASE = 'https://countapi.mileshilliard.com/api/v1';
  var INTL_COUNTER_KEY = 'qilylean_com_sitewide_pageviews_20261029';
  // A user-specified visual starting base, not a claim of historically measured PV.
  // Never write this value into the real CountAPI counter; report it transparently.
  var INTL_DISPLAY_BASELINE = 15000;

  function intlCounterUrl(action) {
    return INTL_COUNTER_BASE + '/' + action + '/' + encodeURIComponent(INTL_COUNTER_KEY);
  }

  function requestIntlCounter(action, overrideKey) {
    if (typeof w.fetch !== 'function') return Promise.reject(new Error('Fetch is unavailable'));
    var url = overrideKey ? INTL_COUNTER_BASE + '/' + action + '/' + encodeURIComponent(overrideKey) : intlCounterUrl(action);
    var requestOptions = {
      method: 'GET',
      mode: 'cors',
      cache: 'no-store',
      credentials: 'omit',
      keepalive: action === 'hit'
    };
    return new Promise(function (resolve, reject) {
      var settled = false;
      var timer = w.setTimeout(function () {
        if (settled) return;
        settled = true;
        reject(new Error('Counter request timed out'));
      }, 8000);

      w.fetch(url, requestOptions).then(function (response) {
        if (!response || !response.ok) throw new Error('Counter service returned a non-success response');
        return response.json();
      }).then(function (payload) {
        var value = payload && payload.value;
        if (value === undefined || value === null || !isFinite(Number(value))) {
          throw new Error('Counter response did not contain a numeric value');
        }
        if (settled) return;
        settled = true;
        w.clearTimeout(timer);
        resolve(Number(value));
      }).catch(function (error) {
        if (settled) return;
        settled = true;
        w.clearTimeout(timer);
        reject(error);
      });
    });
  }

  function renderIntlCount(value) {
    var target = getTarget('intl-total');
    if (!target) return;
    var actualRecorded = Math.max(0, Math.floor(Number(value)));
    target.textContent = formatCount(INTL_DISPLAY_BASELINE + actualRecorded);
    target.setAttribute('data-qily-traffic-state', 'ready');
    target.setAttribute('data-qily-traffic-starting-base', String(INTL_DISPLAY_BASELINE));
    target.setAttribute('data-qily-traffic-recorded-pv', String(actualRecorded));
  }

  function markIntlCountUnavailable() {
    var target = getTarget('intl-total');
    if (!target) return;
    if (target.getAttribute('data-qily-traffic-state') !== 'ready') {
      target.textContent = '暂不可用';
    }
    target.setAttribute('data-qily-traffic-state', 'stale');
  }

  function readIntlCount() {
    return requestIntlCounter('get').then(function (value) {
      renderIntlCount(value);
      return value;
    }).catch(function () {
      markIntlCountUnavailable();
      return null;
    });
  }

  function trackIntlPageview() {
    // One increment per loaded public HTML page. The hit response also supplies
    // the number shown on the About page, avoiding a separate read race.
    return requestIntlCounter('hit').then(function (value) {
      renderIntlCount(value);
      // Record only successful measured pageviews, separately from the 15,000
      // presentation baseline. Every international page contributes one 6h hit.
      trackIntlTimeBucket();
      return value;
    }).catch(function () {
      // If the hit response was lost after being recorded, a read can still
      // recover the current total without risking a second increment.
      return readIntlCount();
    });
  }

  function ensureIntlPanelStyles() {
    if (d.getElementById('qily-traffic-intl-single-v2')) return;
    var style = d.createElement('style');
    style.id = 'qily-traffic-intl-single-v2';
    style.textContent = [
      '#traffic .qily-traffic-grid[data-qily-traffic-single="true"]{grid-template-columns:minmax(0,1fr)!important;max-width:760px!important;margin-inline:auto!important;}',
      '#traffic .qily-traffic-site[hidden],#traffic .qily-traffic-metric[hidden]{display:none!important;}',
      '#traffic .qily-traffic-metrics[data-qily-traffic-single-metric="true"]{grid-template-columns:minmax(0,1fr)!important;}',
      '#traffic .qily-traffic-number[data-qily-traffic-count="intl-total"]{font-size:clamp(2.2rem,4.5vw,3.1rem)!important;font-weight:650!important;line-height:1.12!important;letter-spacing:-.03em!important;}',
      '#traffic .qily-traffic-live.qily-traffic-scope::before{background:#ffe39b!important;}',
      '@media(max-width:760px){#traffic .qily-traffic-grid[data-qily-traffic-single="true"]{max-width:none!important;}}'
    ].join('');
    (d.head || d.documentElement).appendChild(style);
  }

  function applyInternationalOnlyPanel() {
    var section = d.querySelector('[data-qily-traffic-stats="v1"]');
    if (!section) return;
    ensureIntlPanelStyles();

    var title = section.querySelector('#qily-traffic-title');
    if (title) title.textContent = '6. 国际站访问统计';
    var intro = section.querySelector('.qily-traffic-intro');
    if (intro) intro.textContent = 'QilyLean.com 国际站累计展示计数，自2026年10月29日起随真实页面访问持续更新。';

    var grid = section.querySelector('.qily-traffic-grid');
    if (grid) grid.setAttribute('data-qily-traffic-single', 'true');

    var intlTarget = getTarget('intl-total');
    var intlCard = intlTarget && intlTarget.closest('.qily-traffic-site');
    var cnTarget = getTarget('cn-total');
    var cnCard = cnTarget && cnTarget.closest('.qily-traffic-site');
    if (cnCard) {
      cnCard.hidden = true;
      cnCard.setAttribute('aria-hidden', 'true');
    }

    if (intlCard) {
      var activeMetric = intlCard.querySelector('[data-qily-traffic-count="intl-active"]');
      var activeRow = activeMetric && activeMetric.closest('.qily-traffic-metric');
      if (activeRow) activeRow.hidden = true;
      var metrics = intlCard.querySelector('.qily-traffic-metrics');
      if (metrics) metrics.setAttribute('data-qily-traffic-single-metric', 'true');
      var label = intlTarget && intlTarget.nextElementSibling;
      if (label) label.textContent = '累计展示计数 · 含初始基数';
      var badge = intlCard.querySelector('.qily-traffic-live');
      if (badge) {
        badge.textContent = '全站累计';
        badge.classList.add('qily-traffic-scope');
      }
    }

    var note = section.querySelector('.qily-traffic-note');
    if (note) {
      note.textContent = '起始展示基数15,000次（非历史实测）；2026年10月29日起新增页面浏览量由系统自动记录。计数服务：';
      var link = d.createElement('a');
      link.href = 'https://countapi.mileshilliard.com/';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'CountAPI';
      note.appendChild(link);
      note.appendChild(d.createTextNode('。'));
    }
  }


  function shanghaiClock() {
    // Beijing reporting time (UTC+08), independent of visitor time zone.
    var clock = new Date(Date.now() + 8 * 3600000);
    return {
      date: clock.toISOString().slice(0, 10),
      slot: Math.floor(clock.getUTCHours() / 6)
    };
  }

  function trackIntlTimeBucket() {
    var clock = shanghaiClock();
    if (clock.date < '2026-10-29') return;
    var key = 'qilylean_com_pv6h_v1_' + clock.date.replace(/-/g, '') + '_s' + clock.slot;
    // No retry: replaying /hit after an ambiguous network failure double-counts.
    requestIntlCounter('hit', key).then(function (count) {
      try {
        w.dispatchEvent(new CustomEvent('qily:pv6h-updated', {
          detail: { date: clock.date, slot: clock.slot, value: count }
        }));
      } catch (ignored) {}
    }).catch(function () {
      // Keep the global pageview counter authoritative if a bucket is unavailable.
    });
  }

  function loadIntlDailyKline() {
    if (!d.querySelector('#traffic[data-qily-traffic-stats="v1"]')) return;
    if (d.querySelector('script[data-qily-daily-kline="v1"]')) return;
    var script = d.createElement('script');
    script.async = true;
    script.src = '/site-traffic-daily-kline-v1.js?v=20261030-light-data-labels-v2';
    script.setAttribute('data-qily-daily-kline', 'v1');
    (d.head || d.documentElement).appendChild(script);
  }

  function init() {
    if (!d.body) return;
    if (isInternational) {
      applyInternationalOnlyPanel();
      loadIntlDailyKline();
      trackIntlPageview();
      if (d.querySelector('[data-qily-traffic-stats="v1"]')) {
        w.setInterval(function () {
          if (!d.hidden) readIntlCount();
        }, 60000);
        d.addEventListener('visibilitychange', function () {
          if (!d.hidden) readIntlCount();
        });
      }
      return;
    }
    // Preserve the current China-site behavior; its deployment remains out of scope.
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
