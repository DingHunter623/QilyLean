/* QilyLean Global Language v2｜2026-08-25
 * Default Chinese source, progressive one-click full-page translation, persisted across pages.
 * Chinese static HTML remains authoritative; translation is runtime enhancement only.
 * v2 hotfix: progressive batch apply, local translation cache, /chat emergency fallback,
 * per-batch retry and partial-failure tolerance so one failed batch cannot blank the feature.
 */
(function (d, w) {
  'use strict';
  if (w.__qilyGlobalLanguageV2) return;
  w.__qilyGlobalLanguageV2 = true;
  w.__qilyGlobalLanguageV1 = true;

  var TRANSLATE_API = 'https://qilylean-ai.dinghunter623.workers.dev/translate';
  var CHAT_API = 'https://qilylean-ai.dinghunter623.workers.dev/chat';
  var STORAGE_KEY = 'qily_global_language_v1';
  var CACHE_PREFIX = 'qily_translation_cache_v2_';
  var SOURCE_LANGUAGE = 'zh-CN';
  var SWITCHER_ID = 'qilyGlobalLanguageV1';
  var STATUS_ID = 'qilyGlobalLanguageStatusV1';
  var TEXT_ORIGINAL = new WeakMap();
  var ATTR_ORIGINAL = new WeakMap();
  var TRACKED_TEXT = new Set();
  var TRACKED_ATTR = [];
  var translationGeneration = 0;
  var activeLanguage = SOURCE_LANGUAGE;
  var observer = null;
  var dynamicTimer = 0;

  var LANGUAGES = [
    ['zh-CN', '中文（简体）'], ['zh-TW', '中文（繁體）'], ['en', 'English'], ['ja', '日本語'], ['ko', '한국어'],
    ['fr', 'Français'], ['de', 'Deutsch'], ['es', 'Español'], ['pt', 'Português'], ['it', 'Italiano'], ['nl', 'Nederlands'],
    ['ru', 'Русский'], ['uk', 'Українська'], ['pl', 'Polski'], ['cs', 'Čeština'], ['sk', 'Slovenčina'], ['hu', 'Magyar'],
    ['ro', 'Română'], ['bg', 'Български'], ['el', 'Ελληνικά'], ['sr', 'Српски'], ['hr', 'Hrvatski'], ['bs', 'Bosanski'],
    ['sl', 'Slovenščina'], ['mk', 'Македонски'], ['sq', 'Shqip'], ['sv', 'Svenska'], ['no', 'Norsk'], ['da', 'Dansk'],
    ['fi', 'Suomi'], ['is', 'Íslenska'], ['et', 'Eesti'], ['lv', 'Latviešu'], ['lt', 'Lietuvių'], ['ga', 'Gaeilge'],
    ['cy', 'Cymraeg'], ['ca', 'Català'], ['eu', 'Euskara'], ['gl', 'Galego'], ['mt', 'Malti'], ['tr', 'Türkçe'],
    ['ar', 'العربية'], ['he', 'עברית'], ['fa', 'فارسی'], ['ur', 'اردو'], ['ps', 'پښتو'], ['hi', 'हिन्दी'],
    ['bn', 'বাংলা'], ['pa', 'ਪੰਜਾਬੀ'], ['gu', 'ગુજરાતી'], ['mr', 'मराठी'], ['ta', 'தமிழ்'], ['te', 'తెలుగు'],
    ['kn', 'ಕನ್ನಡ'], ['ml', 'മലയാളം'], ['ne', 'नेपाली'], ['si', 'සිංහල'], ['th', 'ไทย'], ['vi', 'Tiếng Việt'],
    ['id', 'Bahasa Indonesia'], ['ms', 'Bahasa Melayu'], ['fil', 'Filipino'], ['my', 'မြန်မာ'], ['km', 'ខ្មែរ'], ['lo', 'ລາວ'],
    ['mn', 'Монгол'], ['kk', 'Қазақша'], ['uz', 'Oʻzbekcha'], ['az', 'Azərbaycanca'], ['ka', 'ქართული'], ['hy', 'Հայերեն'],
    ['sw', 'Kiswahili'], ['af', 'Afrikaans'], ['zu', 'isiZulu'], ['xh', 'isiXhosa'], ['am', 'አማርኛ'], ['so', 'Soomaali'],
    ['ha', 'Hausa'], ['yo', 'Yorùbá'], ['ig', 'Igbo'], ['rw', 'Kinyarwanda'], ['mg', 'Malagasy'], ['sn', 'Shona'],
    ['st', 'Sesotho'], ['eo', 'Esperanto'], ['la', 'Latina']
  ];

  var RTL = new Set(['ar', 'he', 'fa', 'ur', 'ps']);
  var EXCLUDED = 'script,style,noscript,code,pre,kbd,samp,textarea,[contenteditable="true"],[data-qily-no-translate],[translate="no"],.qily-language-switcher';

  function getStoredLanguage() {
    try {
      var value = w.localStorage.getItem(STORAGE_KEY) || SOURCE_LANGUAGE;
      return LANGUAGES.some(function (item) { return item[0] === value; }) ? value : SOURCE_LANGUAGE;
    } catch (error) { return SOURCE_LANGUAGE; }
  }

  function storeLanguage(value) {
    try { w.localStorage.setItem(STORAGE_KEY, value); } catch (error) {}
  }

  function languageLabel(code) {
    for (var i = 0; i < LANGUAGES.length; i += 1) if (LANGUAGES[i][0] === code) return LANGUAGES[i][1];
    return code;
  }

  function primaryNav() {
    return d.querySelector('header .qily-global-nav,header nav.site-nav,header nav.nav,header nav[aria-label="QilyLean核心导视"],header nav[aria-label="网站导航"],header nav');
  }

  function ensureSwitcher() {
    var nav = primaryNav();
    if (!nav) return false;
    var wrapper = d.getElementById(SWITCHER_ID);
    if (!wrapper) {
      wrapper = d.createElement('div');
      wrapper.id = SWITCHER_ID;
      wrapper.className = 'qily-language-switcher';
      wrapper.setAttribute('data-qily-no-translate', 'true');
      wrapper.setAttribute('role', 'group');
      wrapper.setAttribute('aria-label', '网站语言');

      var globe = d.createElement('span');
      globe.className = 'qily-language-switcher__globe';
      globe.setAttribute('aria-hidden', 'true');
      globe.textContent = '🌐';

      var select = d.createElement('select');
      select.className = 'qily-language-switcher__select';
      select.setAttribute('aria-label', '选择网站语言');
      LANGUAGES.forEach(function (item) {
        var option = d.createElement('option');
        option.value = item[0];
        option.textContent = item[1];
        select.appendChild(option);
      });
      select.value = activeLanguage;
      select.addEventListener('change', function () { setLanguage(select.value, true); });

      var status = d.createElement('span');
      status.id = STATUS_ID;
      status.className = 'qily-language-switcher__status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');

      wrapper.appendChild(globe);
      wrapper.appendChild(select);
      wrapper.appendChild(status);
    }
    if (nav.lastElementChild !== wrapper) nav.appendChild(wrapper);
    return true;
  }

  function setUiState(state, message) {
    var wrapper = d.getElementById(SWITCHER_ID);
    if (!wrapper) return;
    wrapper.setAttribute('data-state', state || 'idle');
    var select = wrapper.querySelector('select');
    if (select) {
      select.value = activeLanguage;
      select.disabled = state === 'loading';
      select.setAttribute('aria-busy', state === 'loading' ? 'true' : 'false');
    }
    var status = d.getElementById(STATUS_ID);
    if (status) status.textContent = message || '';
  }

  function isExcluded(element) {
    return !element || (element.closest && element.closest(EXCLUDED));
  }

  function shouldTranslate(text) {
    var value = String(text || '').trim();
    if (!value) return false;
    if (/^(?:https?:\/\/|www\.|mailto:|tel:)/i.test(value)) return false;
    if (/^[\d\s.,:;!?+\-–—/%‰℃°×→←↔|()（）【】\[\]{}<>_=*&^$#@~`'"·…]+$/.test(value)) return false;
    if (/^(?:QilyLean|Times26001)$/i.test(value)) return false;
    if (/^[A-Z0-9][A-Z0-9_.:/+\-]{1,48}$/.test(value)) return false;
    return /[A-Za-z\u00c0-\u024f\u0370-\u03ff\u0400-\u04ff\u0600-\u06ff\u0900-\u0d7f\u0e00-\u0eff\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(value);
  }

  function textRecord(node) {
    if (!TEXT_ORIGINAL.has(node)) {
      TEXT_ORIGINAL.set(node, node.nodeValue || '');
      TRACKED_TEXT.add(node);
    }
    var full = TEXT_ORIGINAL.get(node) || '';
    var source = full.trim();
    if (!shouldTranslate(source)) return null;
    var start = full.indexOf(source);
    var leading = start > 0 ? full.slice(0, start) : '';
    var trailing = start >= 0 ? full.slice(start + source.length) : '';
    return { source: source, apply: function (translated) { if (node.isConnected) node.nodeValue = leading + translated + trailing; } };
  }

  function attributeRecord(element, attribute) {
    if (isExcluded(element) || !element.hasAttribute(attribute)) return null;
    var map = ATTR_ORIGINAL.get(element);
    if (!map) { map = new Map(); ATTR_ORIGINAL.set(element, map); }
    if (!map.has(attribute)) {
      map.set(attribute, element.getAttribute(attribute) || '');
      TRACKED_ATTR.push([element, attribute]);
    }
    var source = map.get(attribute) || '';
    if (!shouldTranslate(source)) return null;
    return { source: source, apply: function (translated) { if (element.isConnected) element.setAttribute(attribute, translated); } };
  }

  function collectRecords(root) {
    var records = [];
    if (!root) return records;
    var walker = d.createTreeWalker(root, w.NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var parent = node.parentElement;
        if (!parent || isExcluded(parent)) return w.NodeFilter.FILTER_REJECT;
        return shouldTranslate((node.nodeValue || '').trim()) ? w.NodeFilter.FILTER_ACCEPT : w.NodeFilter.FILTER_REJECT;
      }
    });
    var node;
    while ((node = walker.nextNode())) {
      var record = textRecord(node);
      if (record) records.push(record);
    }
    var elements = [];
    if (root.nodeType === 1) elements.push(root);
    if (root.querySelectorAll) elements = elements.concat(Array.prototype.slice.call(root.querySelectorAll('[title],[aria-label],[placeholder],[alt]')));
    elements.forEach(function (element) {
      ['title', 'aria-label', 'placeholder', 'alt'].forEach(function (attribute) {
        var record = attributeRecord(element, attribute);
        if (record) records.push(record);
      });
    });
    return records;
  }

  function groupRecords(records) {
    var grouped = new Map();
    records.forEach(function (record) {
      if (!grouped.has(record.source)) grouped.set(record.source, []);
      grouped.get(record.source).push(record);
    });
    return grouped;
  }

  function makeBatches(sources) {
    var batches = [], batch = [], chars = 0;
    sources.forEach(function (source) {
      var next = source.length + 8;
      if (batch.length && (batch.length >= 16 || chars + next > 2100)) {
        batches.push(batch); batch = []; chars = 0;
      }
      batch.push(source); chars += next;
    });
    if (batch.length) batches.push(batch);
    return batches;
  }

  function cacheKey(code) { return CACHE_PREFIX + code; }

  function readCache(code) {
    try {
      var parsed = JSON.parse(w.localStorage.getItem(cacheKey(code)) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) { return {}; }
  }

  function writeCache(code, cache) {
    try {
      var keys = Object.keys(cache);
      if (keys.length > 900) {
        var compact = {};
        keys.slice(keys.length - 700).forEach(function (key) { compact[key] = cache[key]; });
        cache = compact;
      }
      w.localStorage.setItem(cacheKey(code), JSON.stringify(cache));
    } catch (error) {}
  }

  function fetchWithTimeout(url, options, timeoutMs) {
    var controller = new AbortController();
    var timer = w.setTimeout(function () { controller.abort(); }, timeoutMs || 22000);
    options = options || {};
    options.signal = controller.signal;
    return fetch(url, options).finally(function () { w.clearTimeout(timer); });
  }

  function parseTranslationArray(raw, expectedLength) {
    var text = String(raw || '').trim();
    if (text.indexOf('```') === 0) text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    var parsed;
    try { parsed = JSON.parse(text); }
    catch (error) {
      var start = text.indexOf('['), end = text.lastIndexOf(']');
      if (start >= 0 && end > start) {
        try { parsed = JSON.parse(text.slice(start, end + 1)); } catch (ignore) {}
      }
    }
    if (!Array.isArray(parsed) || parsed.length !== expectedLength || parsed.some(function (item) { return typeof item !== 'string'; })) {
      throw new Error('translation_format_invalid');
    }
    return parsed;
  }

  async function requestDedicatedBatch(targetLanguage, texts) {
    var response = await fetchWithTimeout(TRANSLATE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ source_language: SOURCE_LANGUAGE, target_language: targetLanguage, texts: texts, page: w.location.pathname }),
      credentials: 'omit', mode: 'cors'
    }, 24000);
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok || !data.ok || !Array.isArray(data.translations) || data.translations.length !== texts.length) {
      throw new Error(data.error || ('translate_http_' + response.status));
    }
    return data.translations;
  }

  async function requestChatFallback(targetLanguage, texts) {
    var prompt = 'Translate this JSON array from Chinese to ' + targetLanguage + '. Return ONLY a JSON array with the same number/order of strings. Preserve QilyLean, 启力精益, Times26001, C919, IE, PE, ME, NPI, VSM, SMED, ECRS, OEE, UPPH, ERP, APS, MES, SOP, KPI, PQCD, IATF 16949, URLs, emails, phone numbers, units and numeric values exactly. Input: ' + JSON.stringify(texts);
    var response = await fetchWithTimeout(CHAT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ message: prompt }),
      credentials: 'omit', mode: 'cors'
    }, 48000);
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok || !data.answer) throw new Error(data.error || ('chat_http_' + response.status));
    return parseTranslationArray(data.answer, texts.length);
  }

  async function requestBatch(targetLanguage, texts) {
    var lastError;
    for (var attempt = 0; attempt < 2; attempt += 1) {
      try { return await requestDedicatedBatch(targetLanguage, texts); }
      catch (error) { lastError = error; if (attempt === 0) await new Promise(function (resolve) { w.setTimeout(resolve, 450); }); }
    }
    try { return await requestChatFallback(targetLanguage, texts); }
    catch (fallbackError) { throw fallbackError || lastError || new Error('translation_failed'); }
  }

  function applyTranslation(grouped, source, value) {
    (grouped.get(source) || []).forEach(function (record) { record.apply(value); });
  }

  async function translateRecords(records, targetLanguage, generation, statusPrefix) {
    var grouped = groupRecords(records);
    var sources = Array.from(grouped.keys());
    if (!sources.length) return { total: 0, failed: 0 };

    var cache = readCache(targetLanguage);
    var pending = [];
    var completed = 0;
    sources.forEach(function (source) {
      if (typeof cache[source] === 'string' && cache[source]) {
        applyTranslation(grouped, source, cache[source]);
        completed += 1;
      } else pending.push(source);
    });

    if (generation !== translationGeneration) return { total: sources.length, failed: 0 };
    if (completed) setUiState('loading', (statusPrefix || '正在翻译') + ' ' + completed + '/' + sources.length);

    var batches = makeBatches(pending);
    var failed = 0;
    for (var i = 0; i < batches.length; i += 2) {
      if (generation !== translationGeneration) return { total: sources.length, failed: failed };
      var pair = batches.slice(i, i + 2);
      var settled = await Promise.all(pair.map(function (batch) {
        return requestBatch(targetLanguage, batch).then(function (values) { return { ok: true, batch: batch, values: values }; })
          .catch(function (error) { return { ok: false, batch: batch, error: error }; });
      }));
      if (generation !== translationGeneration) return { total: sources.length, failed: failed };

      settled.forEach(function (result) {
        if (!result.ok) { failed += result.batch.length; completed += result.batch.length; return; }
        result.batch.forEach(function (source, index) {
          var value = result.values[index];
          cache[source] = value;
          applyTranslation(grouped, source, value);
        });
        completed += result.batch.length;
      });
      writeCache(targetLanguage, cache);
      setUiState('loading', (statusPrefix || '正在翻译') + ' ' + Math.min(completed, sources.length) + '/' + sources.length);
    }
    return { total: sources.length, failed: failed };
  }

  function restoreChinese() {
    TRACKED_TEXT.forEach(function (node) { if (node.isConnected && TEXT_ORIGINAL.has(node)) node.nodeValue = TEXT_ORIGINAL.get(node); });
    TRACKED_ATTR.forEach(function (pair) {
      var element = pair[0], attribute = pair[1], map = ATTR_ORIGINAL.get(element);
      if (element.isConnected && map && map.has(attribute)) element.setAttribute(attribute, map.get(attribute));
    });
  }

  function applyLanguageSemantics(code) {
    d.documentElement.setAttribute('lang', code);
    d.documentElement.setAttribute('data-qily-language', code);
    if (RTL.has(code)) d.documentElement.setAttribute('dir', 'rtl');
    else d.documentElement.removeAttribute('dir');
  }

  async function setLanguage(code, persist) {
    if (!LANGUAGES.some(function (item) { return item[0] === code; })) code = SOURCE_LANGUAGE;
    translationGeneration += 1;
    var generation = translationGeneration;
    activeLanguage = code;
    ensureSwitcher();

    if (code === SOURCE_LANGUAGE) {
      restoreChinese();
      applyLanguageSemantics(code);
      if (persist) storeLanguage(code);
      setUiState('ready', '已显示中文');
      return;
    }

    restoreChinese();
    applyLanguageSemantics(code);
    setUiState('loading', '正在翻译为 ' + languageLabel(code) + '…');
    var records = collectRecords(d.body);
    try {
      var result = await translateRecords(records, code, generation, '正在翻译');
      if (generation !== translationGeneration) return;
      activeLanguage = code;
      applyLanguageSemantics(code);
      if (persist) storeLanguage(code);
      if (result.total && result.failed >= result.total) {
        restoreChinese();
        activeLanguage = SOURCE_LANGUAGE;
        applyLanguageSemantics(SOURCE_LANGUAGE);
        var failedSelect = d.querySelector('#' + SWITCHER_ID + ' select');
        if (failedSelect) failedSelect.value = SOURCE_LANGUAGE;
        setUiState('error', '翻译服务连接失败，已保留中文');
      } else if (result.failed) {
        setUiState('ready', '已切换为 ' + languageLabel(code) + '；少量内容保留中文');
      } else {
        setUiState('ready', '已切换为 ' + languageLabel(code));
      }
    } catch (error) {
      if (generation !== translationGeneration) return;
      restoreChinese();
      activeLanguage = SOURCE_LANGUAGE;
      applyLanguageSemantics(SOURCE_LANGUAGE);
      var select = d.querySelector('#' + SWITCHER_ID + ' select');
      if (select) select.value = SOURCE_LANGUAGE;
      setUiState('error', '翻译暂时不可用，已保留中文');
      console.warn('QilyLean global translation failed:', error && error.message ? error.message : error);
    }
  }

  function scheduleDynamicTranslation(nodes) {
    if (activeLanguage === SOURCE_LANGUAGE || !nodes || !nodes.length) return;
    w.clearTimeout(dynamicTimer);
    dynamicTimer = w.setTimeout(function () {
      var generation = translationGeneration;
      var records = [];
      nodes.forEach(function (node) {
        if (!node || !node.isConnected) return;
        if (node.nodeType === 1 && isExcluded(node)) return;
        records = records.concat(collectRecords(node));
      });
      if (!records.length) return;
      translateRecords(records, activeLanguage, generation, '').catch(function () {});
    }, 420);
  }

  function bindObserver() {
    if (observer || !w.MutationObserver || !d.body) return;
    observer = new MutationObserver(function (mutations) {
      var added = [];
      mutations.forEach(function (mutation) {
        Array.prototype.forEach.call(mutation.addedNodes || [], function (node) {
          if (node.nodeType === 1 && node.id === SWITCHER_ID) return;
          added.push(node);
        });
      });
      ensureSwitcher();
      scheduleDynamicTranslation(added);
    });
    observer.observe(d.body, { childList: true, subtree: true });
  }

  function boot() {
    activeLanguage = getStoredLanguage();
    ensureSwitcher();
    bindObserver();
    setLanguage(activeLanguage, false);
  }

  d.addEventListener('qily:shell-ready', function () { ensureSwitcher(); });
  w.addEventListener('pageshow', function () { ensureSwitcher(); });
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(document, window);
