(function () {
  'use strict';

  if (window.__qilyLeanBrandIdentityV1) return;
  window.__qilyLeanBrandIdentityV1 = true;

  var BRAND = 'QilyLean｜启力精益';
  var BRAND_PLAIN = 'QilyLean 启力精益';
  var TITLE = 'QilyLean｜启力精益｜精益生产、工程改善与数智工厂';
  var DESCRIPTION = 'QilyLean启力精益是丁启利发起的制造改善与精益赋能窗口，聚焦精益生产、工程改善、工业工程、数智化工厂、新工厂规划与目视化项目交付。';
  var SLOGAN = '让改善形成体系，让精益产生力量';
  var POSITIONING = '精益生产 · 工程改善 · 数智工厂';
  var HOME_URL = 'https://qilylean.com/';

  function normalizedPath() {
    var path = (location.pathname || '/').replace(/\/index\.html$/, '/');
    return path.length > 1 ? path.replace(/\/+$/, '/') : '/';
  }

  function setMeta(attribute, key, value) {
    var selector = 'meta[' + attribute + '="' + key + '"]';
    var element = document.head.querySelector(selector);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, key);
      document.head.appendChild(element);
    }
    if (element.getAttribute('content') !== value) element.setAttribute('content', value);
  }

  function setText(element, value) {
    if (element && element.textContent !== value) element.textContent = value;
  }

  function applyHead() {
    setMeta('property', 'og:site_name', BRAND_PLAIN);
    setMeta('name', 'application-name', BRAND_PLAIN);
    setMeta('name', 'apple-mobile-web-app-title', '启力精益');

    if (normalizedPath() !== '/') return;

    if (document.title !== TITLE) document.title = TITLE;
    setMeta('name', 'description', DESCRIPTION);
    setMeta('property', 'og:title', TITLE);
    setMeta('property', 'og:description', '“启精益之智，聚企业之力。”' + SLOGAN + '。');
    setMeta('name', 'twitter:title', TITLE);
    setMeta('name', 'twitter:description', DESCRIPTION);
  }

  function applyBrandHeader() {
    var header = document.querySelector('header.qily-site-header, header.topbar, header.top');
    if (!header) return;

    var brand = header.querySelector('.qily-brand, .brand, .site-brand');
    if (!brand) {
      brand = document.createElement('a');
      brand.className = header.classList.contains('topbar') ? 'brand' : 'qily-brand';
      header.insertBefore(brand, header.firstChild);
    }
    brand.href = '/';
    brand.setAttribute('aria-label', BRAND_PLAIN + '首页');
    setText(brand, BRAND);
  }

  function applyHomepage() {
    if (normalizedPath() !== '/') return;

    setText(document.querySelector('.hero .eyebrow'), POSITIONING);
    setText(document.querySelector('.hero h1'), BRAND);
    setText(
      document.querySelector('.hero .lead'),
      '“启精益之智，聚企业之力。”' + BRAND_PLAIN + '是由丁启利发起的制造改善与精益赋能窗口，依托20年制造业工程技术、精益改善与咨询交付经验，聚焦PQCD改善、数智化工厂规划、目视化项目交付与精益体系建设。' + SLOGAN + '。'
    );
    setText(document.querySelector('.assistant-panel .panel-head'), '启力精益 AI 能力问答');

    var footerItems = document.querySelectorAll('.footer .footer-inner span');
    if (footerItems[0]) setText(footerItems[0], BRAND + ' · 丁启利');
    if (footerItems[1]) setText(footerItems[1], SLOGAN + '。');
  }

  function applySharePanel() {
    var panel = document.querySelector('#shareMask .qily-modal-panel, #shareMask .share-panel');
    if (!panel) return;

    setText(panel.querySelector('.qily-modal-brand, .share-brand'), BRAND);
    setText(panel.querySelector('#qilyShareTitle, h3'), '分享“启力精益”官网');
    setText(panel.querySelector('.qily-modal-note'), '扫码或复制官网地址访问 “' + BRAND_PLAIN + '”');

    var image = panel.querySelector('.qily-share-qr');
    if (image) image.alt = BRAND_PLAIN + '官网二维码';
  }

  function applyAll() {
    applyHead();
    applyBrandHeader();
    applyHomepage();
    applySharePanel();
  }

  document.addEventListener('click', function (event) {
    var action = event.target.closest && event.target.closest('#shareMask [data-share="system"]');
    if (!action || !navigator.share) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    navigator.share({ title: TITLE, text: '“启精益之智，聚企业之力。”' + SLOGAN + '。', url: HOME_URL }).catch(function () {});
  }, true);

  function boot() {
    applyAll();
    var timer = 0;
    new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(applyAll, 20);
    }).observe(document.body, { childList: true, subtree: true });
    setTimeout(applyAll, 200);
    setTimeout(applyAll, 800);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
