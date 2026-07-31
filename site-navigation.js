(function () {
  'use strict';

  if (window.__qilyLeanSiteNavigationLoaderV1) return;
  window.__qilyLeanSiteNavigationLoaderV1 = true;

  var CORE_SRC = '/site-navigation-core.js?v=20260731-global-links-v1';
  var LINKS_PATH = '/links/';
  var ONBOARDING_PATH = '/links/onboarding/';

  function normalizedPath(path) {
    var value = (path || '/').replace(/\/index\.html$/, '/');
    return value.length > 1 ? value.replace(/\/+$/, '/') : '/';
  }

  function repairOnboardingLink() {
    document.querySelectorAll('#industryResourceService .resource-action, a[href="/cooperation/"][class~="resource-action"]').forEach(function (link) {
      link.href = ONBOARDING_PATH;
      link.textContent = '提交入驻与合作资料';
      link.setAttribute('aria-label', '进入行业资源入驻申请专属页面');
      link.setAttribute('title', '行业资源入驻申请');
    });
  }

  function ensureFriendLinksNavigation() {
    var nav = document.querySelector('.qily-global-nav, nav.site-nav, nav.nav');
    if (!nav) return;

    var link = nav.querySelector('a[href="/links/"], a[href="/links/index.html"]');
    if (!link) {
      link = document.createElement('a');
      link.href = LINKS_PATH;
      link.textContent = '友情链接';
      link.setAttribute('aria-label', '全球科技企业友情链接与行业资源');
    }

    var cooperation = nav.querySelector('a[href="/cooperation/"], a[href="/cooperation/index.html"]');
    if (cooperation && link.nextElementSibling !== cooperation) nav.insertBefore(link, cooperation);
    else if (!link.parentNode) nav.appendChild(link);

    var path = normalizedPath(location.pathname);
    if (path.indexOf(LINKS_PATH) === 0) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }

  function applyFixes() {
    ensureFriendLinksNavigation();
    repairOnboardingLink();
  }

  function observeShell() {
    var timer = 0;
    new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(applyFixes, 20);
    }).observe(document.body, { childList: true, subtree: true });
    setTimeout(applyFixes, 120);
    setTimeout(applyFixes, 500);
  }

  repairOnboardingLink();

  var existing = document.getElementById('qilySiteNavigationCoreScript');
  if (existing) {
    existing.addEventListener('load', function () { applyFixes(); observeShell(); }, { once: true });
    return;
  }

  var core = document.createElement('script');
  core.id = 'qilySiteNavigationCoreScript';
  core.src = CORE_SRC;
  core.async = false;
  core.addEventListener('load', function () {
    applyFixes();
    observeShell();
  }, { once: true });
  core.addEventListener('error', function () {
    applyFixes();
    observeShell();
    if (typeof window.__qilyLeanRevealCurrentShell === 'function') window.__qilyLeanRevealCurrentShell();
  }, { once: true });
  document.head.appendChild(core);
})();