/* QilyLean Global Language v1｜2026-08-25
 * Default Chinese source, one-click full-page AI translation, persisted across pages.
 * The Chinese static HTML remains the authoritative source; translation is runtime enhancement only.
 */
(function (d, w) {
  'use strict';
  if (w.__qilyGlobalLanguageV1) return;
  w.__qilyGlobalLanguageV1 = true;

  var API_URL = 'https://qilylean-ai.dinghunter623.workers.dev/translate';
  var STORAGE_KEY = 'qily_global_language_v1';
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
    } catch (error) {
      return SOURCE_LANGUAGE;
    }
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
      select.addEventListener('change', function () {
        setLanguage(select.value, true);
      });

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
    return {
      source: source,
      apply: function (translated) {
        if (node.isConnected) node.nodeValue = leading + translated + trailing;
      }
    };
  }

  function attributeRecord(element, attribute) {
    if (isExcluded(element) || !element.hasAttribute(attribute)) return null;
    var map = ATTR_ORIGINAL.get(element);
    if (!map) {
      map = new Map();
      ATTR_ORIGINAL.set(element, map);
    }
    if (!map.has(attribute)) {
      map.set(attribute, element.getAttribute(attribute) || '');
      TRACKED_ATTR.push([element, attribute]);
    }
    var source = map.get(attribute) || '';
    if (!shouldTranslate(source)) return null;
    return {
      source: source,
      apply: function (translated) {
        if (element.isConnected) element.setAttribute(attribute, translated);
      }
    };
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
      var next = source.length + 12;
      if (batch.length && (batch.length >= 18 || chars + next > 2600)) {
        batches.push(batch);
        batch = [];
        chars = 0;
      }
      batch.push(source);
      chars += next;
    });
    if (batch.length) batches.push(batch);
    return batches;
  }

  async function requestBatch(targetLanguage, texts) {
    var response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_language: SOURCE_LANGUAGE,
        target_language: targetLanguage,
        texts: texts,
        page: w.location.pathname
      }),
      credentials: 'omit',
      mode: 'cors'
    });
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok || !data.ok || !Array.isArray(data.translations) || data.translations.length !== texts.length) {
      throw new Error(data.error || 'translation_failed');
    }
    return data.translations;
  }

  async function translateRecords(records, targetLanguage, generation) {
    var grouped = groupRecords(records);
    var sources = Array.from(grouped.keys());
    if (!sources.length) return;
    var batches = makeBatches(sources);
    var translated = new Map();
    for (var i = 0; i < batches.length; i += 2) {
      var pair = batches.slice(i, i + 2);
      var results = await Promise.all(pair.map(function (batch) { return requestBatch(targetLanguage, batch); }));
      if (generation !== translationGeneration) return;
      pair.forEach(function (batch, pairIndex) {
        batch.forEach(function (source, index) { translated.set(source, results[pairIndex][index]); });
      });
    }
    if (generation !== translationGeneration) return;
    translated.forEach(function (value, source) {
      (grouped.get(source) || []).forEach(function (record) { record.apply(value); });
    });
  }

  function restoreChinese() {
    TRACKED_TEXT.forEach(function (node) {
      if (node.isConnected && TEXT_ORIGINAL.has(node)) node.nodeValue = TEXT_ORIGINAL.get(node);
    });
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
    applyLanguageSemantics(code);

    if (code === SOURCE_LANGUAGE) {
      restoreChinese();
      if (persist) storeLanguage(code);
      setUiState('ready', '已显示中文');
      return;
    }

    setUiState('loading', '正在翻译为 ' + languageLabel(code) + '…');
    try {
      var records = collectRecords(d.body);
      await translateRecords(records, code, generation);
      if (generation !== translationGeneration) return;
      if (persist) storeLanguage(code);
      activeLanguage = code;
      applyLanguageSemantics(code);
      setUiState('ready', '已切换为 ' + languageLabel(code));
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
      translateRecords(records, activeLanguage, generation).catch(function () {});
    }, 450);
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
