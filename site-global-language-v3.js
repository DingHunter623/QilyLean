/* QilyLean Global Translation Dual Route V2｜2026-08-25
 * Chinese static HTML remains the authoritative source and default display.
 * Translation is strictly user initiated: no page-load translation request, no blocking spinner.
 * Likely mainland visitors use the QilyLean domestic translation route first; other visitors use Google Translate.
 * The control always remains operable so switching back to Chinese immediately aborts/restores the source page.
 */
(function (d, w) {
  'use strict';
  if (w.__qilyGlobalTranslationDualRouteV2) return;
  w.__qilyGlobalTranslationDualRouteV2 = true;

  /* Retire every previous automatic/on-demand runtime without letting stale loaders restart it. */
  w.__qilyGoogleTranslateOnDemandV1 = true;
  w.__qilyGlobalLanguageV31 = true;
  w.__qilyGlobalLanguageV3 = true;
  w.__qilyGlobalLanguageV2 = true;
  w.__qilyGlobalLanguageV1 = true;

  var CONTROL_ID = 'qilyGlobalTranslationDualRouteV2';
  var SOURCE_LANGUAGE = 'zh-CN';
  var CACHE_PREFIX = 'qily_translation_dual_v2_';
  var DOMESTIC_ENDPOINTS = [
    'https://api.qilylean.com',
    'https://ai-api.qilylean.com',
    'https://qilylean-ai.dinghunter623.workers.dev'
  ];
  var LANGUAGES = [
    ['zh-CN','中文原文'],['en','English'],['zh-TW','中文（繁體）'],['ja','日本語'],['ko','한국어'],['vi','Tiếng Việt'],['th','ไทย'],
    ['id','Bahasa Indonesia'],['ms','Bahasa Melayu'],['fil','Filipino'],['my','မြန်မာ'],['km','ខ្មែរ'],['lo','ລາວ'],
    ['fr','Français'],['de','Deutsch'],['es','Español'],['pt','Português'],['it','Italiano'],['nl','Nederlands'],
    ['ru','Русский'],['uk','Українська'],['pl','Polski'],['cs','Čeština'],['sk','Slovenčina'],['hu','Magyar'],
    ['ro','Română'],['bg','Български'],['el','Ελληνικά'],['sr','Српски'],['hr','Hrvatski'],['bs','Bosanski'],
    ['sl','Slovenščina'],['mk','Македонски'],['sq','Shqip'],['sv','Svenska'],['no','Norsk'],['da','Dansk'],
    ['fi','Suomi'],['is','Íslenska'],['et','Eesti'],['lv','Latviešu'],['lt','Lietuvių'],['ga','Gaeilge'],
    ['cy','Cymraeg'],['ca','Català'],['eu','Euskara'],['gl','Galego'],['mt','Malti'],['tr','Türkçe'],
    ['ar','العربية'],['he','עברית'],['fa','فارسی'],['ur','اردو'],['ps','پښتو'],['hi','हिन्दी'],
    ['bn','বাংলা'],['pa','ਪੰਜਾਬੀ'],['gu','ગુજરાતી'],['mr','मराठी'],['ta','தமிழ்'],['te','తెలుగు'],
    ['kn','ಕನ್ನಡ'],['ml','മലയാളം'],['ne','नेपाली'],['si','සිංහල'],['mn','Монгол'],['kk','Қазақша'],
    ['uz','Oʻzbekcha'],['az','Azərbaycanca'],['ka','ქართული'],['hy','Հայերեն'],['sw','Kiswahili'],['af','Afrikaans'],
    ['zu','isiZulu'],['xh','isiXhosa'],['am','አማርኛ'],['so','Soomaali'],['ha','Hausa'],['yo','Yorùbá'],
    ['ig','Igbo'],['rw','Kinyarwanda'],['mg','Malagasy'],['sn','Shona'],['st','Sesotho']
  ];
  var SKIP_TAGS = new Set(['SCRIPT','STYLE','NOSCRIPT','CODE','PRE','SVG','CANVAS','TEXTAREA','IFRAME']);
  var ATTRS = ['title','aria-label','aria-description','placeholder','alt'];
  var originalText = new WeakMap();
  var originalAttrs = new WeakMap();
  var trackedText = new Set();
  var trackedAttr = new Set();
  var activeLanguage = SOURCE_LANGUAGE;
  var activeAbort = null;
  var translationSequence = 0;
  var chosenDomesticEndpoint = '';
  var delayedSweeps = [];

  function cleanLegacyState() {
    try {
      w.localStorage.removeItem('qily_global_language_v1');
      w.localStorage.removeItem('qily_global_language_v3');
      for (var i = w.localStorage.length - 1; i >= 0; i -= 1) {
        var key = w.localStorage.key(i) || '';
        if (key.indexOf('qily_translation_cache_v2_') === 0 || key.indexOf('qily_translation_cache_v3_') === 0) w.localStorage.removeItem(key);
      }
    } catch (error) {}
  }

  function setDocumentLanguage(language, mode) {
    var root = d.documentElement;
    root.setAttribute('lang', language || SOURCE_LANGUAGE);
    root.setAttribute('dir', /^(ar|he|fa|ur|ps)(-|$)/i.test(language || '') ? 'rtl' : 'ltr');
    root.setAttribute('data-qily-language', language || SOURCE_LANGUAGE);
    root.setAttribute('data-qily-language-mode', mode || 'source-default');
  }

  function primaryNav() {
    return d.querySelector('header .qily-global-nav,header nav.site-nav,header nav.nav,header nav[aria-label="QilyLean核心导视"],header nav[aria-label="网站导航"],header nav');
  }

  function originalPageUrl() {
    var canonical = d.querySelector('link[rel="canonical"][href]');
    if (canonical) {
      try {
        var c = new URL(canonical.href, w.location.href);
        if (/(^|\.)qilylean\.com$/i.test(c.hostname)) return c.href;
      } catch (error) {}
    }
    try {
      var current = new URL(w.location.href);
      current.searchParams.delete('qily-refresh');
      current.searchParams.delete('qily-ts');
      return current.href;
    } catch (error) { return w.location.href; }
  }

  function googleWebsiteTranslationUrl(targetLanguage) {
    return 'https://translate.google.com/translate?sl=zh-CN&tl=' + encodeURIComponent(targetLanguage) + '&u=' + encodeURIComponent(originalPageUrl());
  }

  function likelyMainland() {
    var zone = '';
    try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (error) {}
    var languages = [];
    try { languages = Array.prototype.slice.call(w.navigator.languages || [w.navigator.language || '']); } catch (error) {}
    var mainlandZone = /^(Asia\/(Shanghai|Chongqing|Harbin|Urumqi))$/i.test(zone);
    var mainlandLanguage = languages.some(function (language) { return /^zh-(CN|Hans)/i.test(language || ''); });
    return mainlandZone || mainlandLanguage;
  }

  function languageName(code) {
    for (var i = 0; i < LANGUAGES.length; i += 1) if (LANGUAGES[i][0] === code) return LANGUAGES[i][1];
    return code;
  }

  function shouldSkipElement(element) {
    if (!element || element.nodeType !== 1) return false;
    if (SKIP_TAGS.has(element.tagName)) return true;
    if (element.closest && element.closest('[data-qily-no-translate],#' + CONTROL_ID)) return true;
    if (element.getAttribute && element.getAttribute('translate') === 'no') return true;
    return false;
  }

  function meaningfulSource(value) {
    var text = String(value || '').replace(/\s+/g, ' ').trim();
    if (!text || text.length < 2) return false;
    if (/^(https?:\/\/|mailto:|tel:|www\.)/i.test(text)) return false;
    if (/^[\d\s.,:;!?%+\-–—_/#|·•→←↑↓()（）\[\]{}<>]+$/.test(text)) return false;
    return /[\u3400-\u9fff]/.test(text);
  }

  function rememberText(node) {
    if (!originalText.has(node)) originalText.set(node, node.nodeValue || '');
    trackedText.add(node);
    return originalText.get(node) || '';
  }

  function rememberAttr(element, attr) {
    var map = originalAttrs.get(element);
    if (!map) { map = {}; originalAttrs.set(element, map); }
    if (!Object.prototype.hasOwnProperty.call(map, attr)) map[attr] = element.getAttribute(attr) || '';
    trackedAttr.add(element);
    return map[attr] || '';
  }

  function collectRecords(root) {
    root = root || d.body;
    if (!root) return [];
    var records = [];
    var walker = d.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var parent = node.parentElement;
        if (!parent || shouldSkipElement(parent)) return NodeFilter.FILTER_REJECT;
        var source = rememberText(node);
        return meaningfulSource(source) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var textNode;
    while ((textNode = walker.nextNode())) records.push({ type:'text', node:textNode, source:rememberText(textNode) });
    var elements = root.querySelectorAll ? root.querySelectorAll('*') : [];
    for (var i = 0; i < elements.length; i += 1) {
      var element = elements[i];
      if (shouldSkipElement(element)) continue;
      for (var j = 0; j < ATTRS.length; j += 1) {
        var attr = ATTRS[j];
        if (!element.hasAttribute(attr)) continue;
        var sourceAttr = rememberAttr(element, attr);
        if (meaningfulSource(sourceAttr)) records.push({ type:'attr', element:element, attr:attr, source:sourceAttr });
      }
    }
    return records;
  }

  function restoreChinese() {
    translationSequence += 1;
    activeLanguage = SOURCE_LANGUAGE;
    if (activeAbort) { try { activeAbort.abort(); } catch (error) {} activeAbort = null; }
    delayedSweeps.forEach(function (timer) { w.clearTimeout(timer); });
    delayedSweeps = [];
    trackedText.forEach(function (node) { if (node && node.isConnected && originalText.has(node)) node.nodeValue = originalText.get(node); });
    trackedAttr.forEach(function (element) {
      if (!element || !element.isConnected) return;
      var map = originalAttrs.get(element) || {};
      Object.keys(map).forEach(function (attr) { element.setAttribute(attr, map[attr]); });
    });
    setDocumentLanguage(SOURCE_LANGUAGE, 'source-default');
    updateControlState('idle', '中文原文');
    announce(SOURCE_LANGUAGE, 'source');
  }

  function cacheKey(language) { return CACHE_PREFIX + language; }
  function readCache(language) {
    try { return JSON.parse(w.localStorage.getItem(cacheKey(language)) || '{}') || {}; } catch (error) { return {}; }
  }
  function writeCache(language, cache) {
    try {
      var keys = Object.keys(cache);
      if (keys.length > 1200) {
        var compact = {};
        keys.slice(keys.length - 900).forEach(function (key) { compact[key] = cache[key]; });
        cache = compact;
      }
      w.localStorage.setItem(cacheKey(language), JSON.stringify(cache));
    } catch (error) {}
  }

  function applyTranslation(record, translated) {
    if (!translated || translated === record.source) return;
    if (record.type === 'text' && record.node && record.node.isConnected) record.node.nodeValue = translated;
    if (record.type === 'attr' && record.element && record.element.isConnected) record.element.setAttribute(record.attr, translated);
  }

  function uniqueSources(records) {
    var seen = new Set();
    var out = [];
    records.forEach(function (record) {
      var source = record.source;
      if (!seen.has(source)) { seen.add(source); out.push(source); }
    });
    return out;
  }

  function batches(sources) {
    var out = [], current = [], chars = 0;
    sources.forEach(function (source) {
      if (current.length && (current.length >= 20 || chars + source.length > 5000)) { out.push(current); current = []; chars = 0; }
      current.push(source); chars += source.length;
    });
    if (current.length) out.push(current);
    return out;
  }

  function fetchWithTimeout(url, options, timeoutMs, parentSignal) {
    var controller = new AbortController();
    var timer = w.setTimeout(function () { controller.abort(); }, timeoutMs);
    function abortFromParent() { controller.abort(); }
    if (parentSignal) {
      if (parentSignal.aborted) controller.abort();
      else parentSignal.addEventListener('abort', abortFromParent, { once:true });
    }
    options = options || {};
    options.signal = controller.signal;
    return fetch(url, options).finally(function () {
      w.clearTimeout(timer);
      if (parentSignal) parentSignal.removeEventListener('abort', abortFromParent);
    });
  }

  async function healthyEndpoint(base, signal) {
    var response = await fetchWithTimeout(base + '/health', { method:'GET', headers:{ 'Accept':'application/json' }, cache:'no-store' }, 6500, signal);
    if (!response.ok) throw new Error('health ' + response.status);
    return base;
  }

  async function resolveDomesticEndpoint(signal) {
    if (chosenDomesticEndpoint) return chosenDomesticEndpoint;
    var probes = DOMESTIC_ENDPOINTS.map(function (base) { return healthyEndpoint(base, signal); });
    if (typeof Promise.any === 'function') chosenDomesticEndpoint = await Promise.any(probes);
    else {
      var settled = await Promise.all(probes.map(function (probe) { return probe.then(function (value) { return value; }, function () { return ''; }); }));
      chosenDomesticEndpoint = settled.find(Boolean) || '';
      if (!chosenDomesticEndpoint) throw new Error('No domestic translation endpoint');
    }
    return chosenDomesticEndpoint;
  }

  async function requestDomesticBatch(base, targetLanguage, texts, signal) {
    var response = await fetchWithTimeout(base + '/translate', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Accept':'application/json' },
      body:JSON.stringify({ source_language:SOURCE_LANGUAGE, target_language:targetLanguage, texts:texts, route:'domestic' })
    }, 58000, signal);
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok || !data.ok || !Array.isArray(data.translations) || data.translations.length !== texts.length) throw new Error('translate ' + response.status);
    return { translations:data.translations, provider:data.provider || 'QilyLean AI' };
  }

  function applyCached(records, cache) {
    records.forEach(function (record) { if (cache[record.source]) applyTranslation(record, cache[record.source]); });
  }

  async function translateDomestic(targetLanguage, records, sequence, signal) {
    var cache = readCache(targetLanguage);
    applyCached(records, cache);
    var missing = uniqueSources(records).filter(function (source) { return !cache[source]; });
    if (!missing.length) return { complete:true, provider:'cache', translated:uniqueSources(records).length, total:uniqueSources(records).length };
    var groups = batches(missing);
    var base = await resolveDomesticEndpoint(signal);
    var completed = 0, failures = 0, provider = 'QilyLean AI';
    var cursor = 0;
    async function worker() {
      while (cursor < groups.length) {
        var index = cursor++;
        var group = groups[index];
        if (sequence !== translationSequence || signal.aborted) return;
        try {
          var result = await requestDomesticBatch(base, targetLanguage, group, signal);
          provider = result.provider || provider;
          for (var i = 0; i < group.length; i += 1) cache[group[i]] = result.translations[i];
          records.forEach(function (record) { if (group.indexOf(record.source) !== -1) applyTranslation(record, cache[record.source]); });
          completed += group.length;
          writeCache(targetLanguage, cache);
          updateControlState('working', '国内线路 ' + Math.min(completed, missing.length) + '/' + missing.length);
        } catch (error) {
          if (signal.aborted) return;
          failures += group.length;
        }
      }
    }
    var count = Math.min(4, groups.length);
    var workers = [];
    for (var n = 0; n < count; n += 1) workers.push(worker());
    await Promise.all(workers);
    return { complete:failures === 0, provider:provider, translated:completed, total:missing.length, failures:failures };
  }

  function translateNewContent(targetLanguage, sequence) {
    if (activeLanguage !== targetLanguage || sequence !== translationSequence || !activeAbort || activeAbort.signal.aborted) return;
    var records = collectRecords(d.body);
    translateDomestic(targetLanguage, records, sequence, activeAbort.signal).catch(function () {});
  }

  async function startDomesticTranslation(targetLanguage) {
    translationSequence += 1;
    var sequence = translationSequence;
    if (activeAbort) { try { activeAbort.abort(); } catch (error) {} }
    activeAbort = new AbortController();
    activeLanguage = targetLanguage;
    setDocumentLanguage(targetLanguage, 'domestic-on-demand');
    updateControlState('working', '连接国内线路…');
    var records = collectRecords(d.body);
    try {
      var result = await translateDomestic(targetLanguage, records, sequence, activeAbort.signal);
      if (sequence !== translationSequence || activeAbort.signal.aborted) return;
      if (!result.translated && result.failures) throw new Error('Domestic translation unavailable');
      updateControlState(result.complete ? 'translated' : 'partial', result.complete ? (languageName(targetLanguage) + ' · 国内线路') : ('部分完成 · 国内线路'));
      announce(targetLanguage, 'domestic');
      delayedSweeps.push(w.setTimeout(function () { translateNewContent(targetLanguage, sequence); }, 1000));
      delayedSweeps.push(w.setTimeout(function () { translateNewContent(targetLanguage, sequence); }, 3200));
    } catch (error) {
      if (sequence !== translationSequence || activeAbort.signal.aborted) return;
      updateControlState('fallback', '国内线路不可达，转 Google');
      w.setTimeout(function () {
        if (sequence === translationSequence && activeLanguage === targetLanguage) w.location.assign(googleWebsiteTranslationUrl(targetLanguage));
      }, 420);
    }
  }

  function chooseRoute(targetLanguage) {
    if (!targetLanguage || targetLanguage === SOURCE_LANGUAGE) { restoreChinese(); return; }
    if (likelyMainland()) startDomesticTranslation(targetLanguage);
    else {
      activeLanguage = targetLanguage;
      setDocumentLanguage(SOURCE_LANGUAGE, 'google-on-demand');
      updateControlState('opening', 'Google · ' + languageName(targetLanguage));
      w.location.assign(googleWebsiteTranslationUrl(targetLanguage));
    }
  }

  function buildControl() {
    var wrapper = d.createElement('div');
    wrapper.id = CONTROL_ID;
    wrapper.className = 'qily-web-translate';
    wrapper.setAttribute('data-qily-no-translate','true');
    wrapper.setAttribute('translate','no');
    wrapper.setAttribute('role','group');
    wrapper.setAttribute('aria-label','网页翻译｜国内外智能线路');
    wrapper.title = '本站默认保持中文原文；中国大陆优先国内翻译线路，海外优先 Google Translate。仅选择语言后启动翻译。';

    var mark = d.createElement('span');
    mark.className = 'qily-web-translate__mark';
    mark.setAttribute('aria-hidden','true');
    mark.textContent = '🌐';

    var brand = d.createElement('span');
    brand.className = 'qily-web-translate__brand';
    brand.textContent = '网页翻译';

    var badge = d.createElement('span');
    badge.className = 'qily-web-translate__badge';
    badge.textContent = '智能路由';

    var select = d.createElement('select');
    select.className = 'qily-web-translate__select';
    select.setAttribute('aria-label','选择网页翻译目标语言');
    LANGUAGES.forEach(function (item) {
      var option = d.createElement('option');
      option.value = item[0];
      option.textContent = item[1];
      select.appendChild(option);
    });
    select.value = SOURCE_LANGUAGE;
    select.addEventListener('change', function () { chooseRoute(select.value); });

    var status = d.createElement('span');
    status.className = 'qily-web-translate__status';
    status.setAttribute('aria-live','polite');
    status.textContent = '中文原文';

    wrapper.appendChild(mark);
    wrapper.appendChild(brand);
    wrapper.appendChild(badge);
    wrapper.appendChild(select);
    wrapper.appendChild(status);
    return wrapper;
  }

  function updateControlState(state, text) {
    var wrapper = d.getElementById(CONTROL_ID);
    if (!wrapper) return;
    wrapper.setAttribute('data-state', state || 'idle');
    var status = wrapper.querySelector('.qily-web-translate__status');
    if (status) status.textContent = text || '';
    var select = wrapper.querySelector('.qily-web-translate__select');
    if (select && activeLanguage && Array.prototype.some.call(select.options, function (option) { return option.value === activeLanguage; })) select.value = activeLanguage;
  }

  function ensureControl() {
    setDocumentLanguage(activeLanguage === SOURCE_LANGUAGE ? SOURCE_LANGUAGE : activeLanguage, activeLanguage === SOURCE_LANGUAGE ? 'source-default' : 'translated-on-demand');
    var retired = d.getElementById('qilyGoogleTranslateOnDemandV1') || d.getElementById('qilyGlobalLanguageV1');
    if (retired) retired.remove();
    var nav = primaryNav();
    if (!nav) return false;
    var wrapper = d.getElementById(CONTROL_ID);
    if (!wrapper) wrapper = buildControl();
    if (wrapper.parentElement !== nav || nav.lastElementChild !== wrapper) nav.appendChild(wrapper);
    return true;
  }

  function announce(language, route) {
    try { d.dispatchEvent(new CustomEvent('qily:language-change', { detail:{ language:language, source:'dual-route-v2', route:route } })); } catch (error) {}
  }

  cleanLegacyState();
  setDocumentLanguage(SOURCE_LANGUAGE, 'source-default');
  ensureControl();
  announce(SOURCE_LANGUAGE, 'source');
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', ensureControl, { once:true });
  d.addEventListener('qily:shell-ready', ensureControl);
  w.addEventListener('pageshow', ensureControl, { passive:true });

  if (w.MutationObserver) {
    var queued = false;
    new MutationObserver(function () {
      if (queued) return;
      queued = true;
      w.requestAnimationFrame(function () { queued = false; ensureControl(); });
    }).observe(d.documentElement, { childList:true, subtree:true });
  }

  w.QilyGlobalTranslation = Object.freeze({
    version:'dual-route-v2',
    sourceLanguage:SOURCE_LANGUAGE,
    defaultDisplayLanguage:SOURCE_LANGUAGE,
    automaticTranslation:false,
    routing:'mainland-domestic / global-google',
    likelyMainland:likelyMainland,
    restoreChinese:restoreChinese,
    translateCurrentPage:function (targetLanguage, route) {
      if (!targetLanguage || targetLanguage === SOURCE_LANGUAGE) { restoreChinese(); return true; }
      if (route === 'domestic') startDomesticTranslation(targetLanguage);
      else if (route === 'google') w.location.assign(googleWebsiteTranslationUrl(targetLanguage));
      else chooseRoute(targetLanguage);
      return true;
    }
  });
})(document, window);
