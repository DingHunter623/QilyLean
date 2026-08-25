/* QilyLean Google Translate On-Demand V1｜2026-08-25
 * Chinese static HTML is both the authoritative source and the default visitor display.
 * No automatic translation, AI translation request, spinner, DOM rewrite or language persistence is allowed.
 * Translation is user-initiated only: selecting a target language opens the current page through Google Translate Website translation.
 */
(function (d, w) {
  'use strict';
  if (w.__qilyGoogleTranslateOnDemandV1) return;
  w.__qilyGoogleTranslateOnDemandV1 = true;

  /* Legacy flags prevent stale loaders from starting the retired automatic runtime again. */
  w.__qilyGlobalLanguageV31 = true;
  w.__qilyGlobalLanguageV3 = true;
  w.__qilyGlobalLanguageV2 = true;
  w.__qilyGlobalLanguageV1 = true;

  var CONTROL_ID = 'qilyGoogleTranslateOnDemandV1';
  var LEGACY_CONTROL_ID = 'qilyGlobalLanguageV1';
  var SOURCE_LANGUAGE = 'zh-CN';
  var LANGUAGES = [
    ['','选择语言'],
    ['en','English'],['zh-TW','中文（繁體）'],['ja','日本語'],['ko','한국어'],['vi','Tiếng Việt'],['th','ไทย'],
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
    ['ig','Igbo'],['rw','Kinyarwanda'],['mg','Malagasy'],['sn','Shona'],['st','Sesotho'],['eo','Esperanto'],['la','Latina']
  ];

  function clearRetiredAutomaticTranslationState() {
    try {
      w.localStorage.removeItem('qily_global_language_v1');
      w.localStorage.removeItem('qily_global_language_v3');
      for (var i = w.localStorage.length - 1; i >= 0; i -= 1) {
        var key = w.localStorage.key(i) || '';
        if (key.indexOf('qily_translation_cache_v2_') === 0 || key.indexOf('qily_translation_cache_v3_') === 0) w.localStorage.removeItem(key);
      }
    } catch (error) {}
  }

  function enforceChineseSourceDisplay() {
    var root = d.documentElement;
    root.setAttribute('lang', SOURCE_LANGUAGE);
    root.setAttribute('dir', 'ltr');
    root.setAttribute('data-qily-language', SOURCE_LANGUAGE);
    root.setAttribute('data-qily-language-mode', 'source-default');
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
    return 'https://translate.google.com/translate?sl=auto&tl=' + encodeURIComponent(targetLanguage) + '&u=' + encodeURIComponent(originalPageUrl());
  }

  function buildControl() {
    var wrapper = d.createElement('div');
    wrapper.id = CONTROL_ID;
    wrapper.className = 'qily-google-translate';
    wrapper.setAttribute('data-qily-no-translate', 'true');
    wrapper.setAttribute('translate', 'no');
    wrapper.setAttribute('role', 'group');
    wrapper.setAttribute('aria-label', 'Google 翻译｜按需翻译当前网页');
    wrapper.title = '本站默认保持中文原文；仅在您选择语言后使用 Google 翻译当前页面';

    var mark = d.createElement('span');
    mark.className = 'qily-google-translate__mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = '🌐';

    var brand = d.createElement('span');
    brand.className = 'qily-google-translate__brand';
    brand.textContent = 'Google 翻译';

    var badge = d.createElement('span');
    badge.className = 'qily-google-translate__badge';
    badge.textContent = '按需';
    badge.setAttribute('aria-hidden', 'true');

    var select = d.createElement('select');
    select.className = 'qily-google-translate__select';
    select.setAttribute('aria-label', '选择 Google 翻译目标语言');
    LANGUAGES.forEach(function (item) {
      var option = d.createElement('option');
      option.value = item[0];
      option.textContent = item[1];
      select.appendChild(option);
    });
    select.value = '';
    select.addEventListener('change', function () {
      var target = select.value;
      if (!target) return;
      select.value = '';
      wrapper.setAttribute('data-state', 'opening');
      w.location.assign(googleWebsiteTranslationUrl(target));
    });

    wrapper.appendChild(mark);
    wrapper.appendChild(brand);
    wrapper.appendChild(badge);
    wrapper.appendChild(select);
    return wrapper;
  }

  function ensureControl() {
    enforceChineseSourceDisplay();
    var legacy = d.getElementById(LEGACY_CONTROL_ID);
    if (legacy) legacy.remove();
    var nav = primaryNav();
    if (!nav) return false;
    var wrapper = d.getElementById(CONTROL_ID);
    if (!wrapper) wrapper = buildControl();
    if (wrapper.parentElement !== nav || nav.lastElementChild !== wrapper) nav.appendChild(wrapper);
    return true;
  }

  function announceChineseDefault() {
    try { d.dispatchEvent(new CustomEvent('qily:language-change', { detail: { language: SOURCE_LANGUAGE, source: 'chinese-default-google-on-demand-v1' } })); } catch (error) {}
  }

  clearRetiredAutomaticTranslationState();
  enforceChineseSourceDisplay();
  ensureControl();
  announceChineseDefault();

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', ensureControl, { once: true });
  d.addEventListener('qily:shell-ready', ensureControl);
  w.addEventListener('pageshow', ensureControl, { passive: true });

  if (w.MutationObserver) {
    var queued = false;
    new MutationObserver(function () {
      if (queued) return;
      queued = true;
      w.requestAnimationFrame(function () { queued = false; ensureControl(); });
    }).observe(d.documentElement, { childList: true, subtree: true });
  }

  w.QilyGoogleTranslate = Object.freeze({
    version: 'on-demand-v1',
    sourceLanguage: SOURCE_LANGUAGE,
    defaultDisplayLanguage: SOURCE_LANGUAGE,
    automaticTranslation: false,
    provider: 'Google Translate',
    translateCurrentPage: function (targetLanguage) {
      if (!targetLanguage) return false;
      w.location.assign(googleWebsiteTranslationUrl(targetLanguage));
      return true;
    }
  });
})(document, window);
