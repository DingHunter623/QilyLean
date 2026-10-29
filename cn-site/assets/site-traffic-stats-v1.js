/* QilyLean 中国站网站统计。独立计数键；10,000展示初始基数不写入实际计数。 */
(function(d,w){
'use strict';
if(w.__qilyCnTrafficV2Loaded)return;
if(!/^(www\.)?qilylean\.cn$/i.test((w.location&&w.location.hostname)||''))return;
w.__qilyCnTrafficV2Loaded=true;
function formatCount(v){var n=Math.max(0,Math.floor(Number(v)));try{return n.toLocaleString('zh-CN')}catch(e){return String(n)}}
function getTarget(name){return d.querySelector('[data-qily-traffic-count="'+name+'"]');}

  // International-site counter: the previous CounterAPI.com integration no longer
  // returns usable values in production. Use a public read/hit endpoint instead.
  // Only the international runtime is changed here; China uses its separate /assets copy.
  var CN_COUNTER_BASE = 'https://countapi.mileshilliard.com/api/v1';
  var CN_COUNTER_KEY = 'qilylean_cn_sitewide_pageviews_20261029';
  // Disclosed starting base; the original CountAPI value remains genuine.
  var CN_DISPLAY_BASELINE = 10000;

  function cnCounterUrl(action) {
    return CN_COUNTER_BASE + '/' + action + '/' + encodeURIComponent(CN_COUNTER_KEY);
  }

  function requestCnCounter(action, overrideKey) {
    if (typeof w.fetch !== 'function') return Promise.reject(new Error('Fetch is unavailable'));
    var url = overrideKey ? CN_COUNTER_BASE + '/' + action + '/' + encodeURIComponent(overrideKey) : cnCounterUrl(action);
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

  function renderCnCount(value) {
    var target = getTarget('cn-total');
    if (!target) return;
    var actualRecorded = Math.max(0, Math.floor(Number(value)));
    target.textContent = formatCount(CN_DISPLAY_BASELINE + actualRecorded);
    target.setAttribute('data-qily-traffic-state', 'ready');
    target.setAttribute('data-qily-traffic-starting-base', String(CN_DISPLAY_BASELINE));
    target.setAttribute('data-qily-traffic-recorded-pv', String(actualRecorded));
  }

  function markCnCountUnavailable() {
    var target = getTarget('cn-total');
    if (!target) return;
    if (target.getAttribute('data-qily-traffic-state') !== 'ready') {
      target.textContent = '暂不可用';
    }
    target.setAttribute('data-qily-traffic-state', 'stale');
  }

  function readCnCount() {
    return requestCnCounter('get').then(function (value) {
      renderCnCount(value);
      return value;
    }).catch(function () {
      markCnCountUnavailable();
      return null;
    });
  }

  function trackCnPageview() {
    // One increment per loaded public HTML page. The hit response also supplies
    // the number shown on the About page, avoiding a separate read race.
    return requestCnCounter('hit').then(function (value) {
      renderCnCount(value);
      // Record only successful measured pageviews, separately from the 10,000
      // presentation baseline. Every international page contributes one 6h hit.
      trackCnTimeBucket();
      return value;
    }).catch(function () {
      // If the hit response was lost after being recorded, a read can still
      // recover the current total without risking a second increment.
      return readCnCount();
    });
  }

  function ensureCnPanelStyles() {
    if (d.getElementById('qily-traffic-cn-single-v2')) return;
    var style = d.createElement('style');
    style.id = 'qily-traffic-cn-single-v2';
    style.textContent = [
      '#traffic .qily-traffic-grid[data-qily-traffic-single="true"]{grid-template-columns:minmax(0,1fr)!important;max-width:760px!important;margin-inline:auto!important;}',
      '#traffic .qily-traffic-site[hidden],#traffic .qily-traffic-metric[hidden]{display:none!important;}',
      '#traffic .qily-traffic-metrics[data-qily-traffic-single-metric="true"]{grid-template-columns:minmax(0,1fr)!important;}',
      '#traffic .qily-traffic-number[data-qily-traffic-count="cn-total"]{font-size:clamp(2.2rem,4.5vw,3.1rem)!important;font-weight:650!important;line-height:1.12!important;letter-spacing:-.03em!important;}',
      '#traffic .qily-traffic-live.qily-traffic-scope::before{background:#ffe39b!important;}',
      '@media(max-width:760px){#traffic .qily-traffic-grid[data-qily-traffic-single="true"]{max-width:none!important;}}'
    ].join('');
    (d.head || d.documentElement).appendChild(style);
  }

  function applyChinaOnlyPanel() {
    var section = d.querySelector('[data-qily-traffic-stats="v1"]');
    if (!section) return;
    ensureCnPanelStyles();

    var title = section.querySelector('#qily-traffic-title');
    if (title) title.textContent = '6. 中国站访问统计';
    var intro = section.querySelector('.qily-traffic-intro');
    if (intro) intro.textContent = 'QilyLean.cn 中国站累计展示计数，自2026年10月29日起随真实页面访问持续更新。';

    var grid = section.querySelector('.qily-traffic-grid');
    if (grid) grid.setAttribute('data-qily-traffic-single', 'true');

    var intlTarget = getTarget('intl-total');
    var intlCard = intlTarget && intlTarget.closest('.qily-traffic-site');
    var cnTarget = getTarget('cn-total');
    var cnCard = cnTarget && cnTarget.closest('.qily-traffic-site');
    if (intlCard) {
      intlCard.hidden = true;
      intlCard.setAttribute('aria-hidden', 'true');
    }

    if (cnCard) {
      var activeMetric = cnCard.querySelector('[data-qily-traffic-count="cn-active"]');
      var activeRow = activeMetric && activeMetric.closest('.qily-traffic-metric');
      if (activeRow) activeRow.hidden = true;
      var metrics = cnCard.querySelector('.qily-traffic-metrics');
      if (metrics) metrics.setAttribute('data-qily-traffic-single-metric', 'true');
      var label = cnTarget && cnTarget.nextElementSibling;
      if (label) label.textContent = '累计展示计数 · 含初始基数';
      var badge = cnCard.querySelector('.qily-traffic-live');
      if (badge) {
        badge.textContent = '全站累计';
        badge.classList.add('qily-traffic-scope');
      }
    }

    var note = section.querySelector('.qily-traffic-note');
    if (note) {
      note.textContent = '起始展示基数10,000次（非历史实测）；2026年10月29日起新增中国站页面浏览量由系统自动记录。计数服务：';
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

  function trackCnTimeBucket() {
    var clock = shanghaiClock();
    if (clock.date < '2026-10-29') return;
    var key = 'qilylean_cn_pv6h_v1_' + clock.date.replace(/-/g, '') + '_s' + clock.slot;
    // No retry: replaying /hit after an ambiguous network failure double-counts.
    requestCnCounter('hit', key).then(function (count) {
      try {
        w.dispatchEvent(new CustomEvent('qily:pv6h-updated', {
          detail: { date: clock.date, slot: clock.slot, value: count }
        }));
      } catch (ignored) {}
    }).catch(function () {
      // Keep the global pageview counter authoritative if a bucket is unavailable.
    });
  }

  function loadCnDailyKline() {
    if (!d.querySelector('#traffic[data-qily-traffic-stats="v1"]')) return;
    if (d.querySelector('script[data-qily-daily-kline="v1"]')) return;
    var script = d.createElement('script');
    script.async = true;
    script.src = '/assets/site-traffic-daily-kline-v1.js?v=20261030-cn-light-data-labels-v2';
    script.setAttribute('data-qily-daily-kline', 'v1');
    (d.head || d.documentElement).appendChild(script);
  }


function init(){
if(!d.body)return;
applyChinaOnlyPanel();
loadCnDailyKline();
trackCnPageview();
if(d.querySelector('#traffic[data-qily-traffic-stats="v1"]')){
w.setInterval(function(){if(!d.hidden)readCnCount();},60000);
d.addEventListener('visibilitychange',function(){if(!d.hidden)readCnCount();});
}
}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})(document,window);
