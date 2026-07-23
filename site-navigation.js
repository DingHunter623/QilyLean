(function () {
  'use strict';

  if (window.__qilyLeanSiteNavigationV6) return;
  window.__qilyLeanSiteNavigationV6 = true;

  var HOME_URL = 'https://qilylean.com/';
  var HOME_QR_SRC = '/qilylean/qilylean-home-qr.svg?v=20260722-navigation-v4';
  var PHONE_NUMBERS = ['13450014003', '15168120722', '17681788259'];
  var routes = [
    ['首页', '/'],
    ['QilyLean AI', '/ai.html'],
    ['能力画像', '/capabilities/'],
    ['履历主线', '/experience/'],
    ['改善经验', '/improvements/'],
    ['知识分享', '/knowledge/'],
    ['行走印记', '/moments/'],
    ['项目合作', '/cooperation/']
  ];

  function normalizedPath(path) {
    var value = (path || '/').replace(/\/index\.html$/, '/');
    return value.length > 1 ? value.replace(/\/+$/, '/') : '/';
  }

  function currentModule(path) {
    if (path === '/') return '/';
    if (/\/ai\.html$/.test(path)) return '/ai.html';
    if (path.indexOf('/capabilities/') === 0) return '/capabilities/';
    if (path.indexOf('/experience/') === 0) return '/experience/';
    if (path.indexOf('/improvements/') === 0 || /\/qilylean\/papers\.html$/.test(path)) return '/improvements/';
    if (path.indexOf('/knowledge/') === 0 || path.indexOf('/qilylean/daily/') === 0 || /\/qilylean\/(?:lean-knowledge|daily-insights|lean-tools|execution-loop|reference-|gbt2828)/.test(path)) return '/knowledge/';
    if (path.indexOf('/moments/') === 0 || /\/moments\.html$/.test(path)) return '/moments/';
    if (path.indexOf('/cooperation/') === 0) return '/cooperation/';
    return '';
  }

  function parentRoute(path) {
    if (path === '/') return '/';
    if (path.indexOf('/qilylean/daily/') === 0) return '/qilylean/daily-insights.html';
    if (path.indexOf('/improvements/') === 0 && path !== '/improvements/') return '/improvements/';
    if (path.indexOf('/moments/') === 0 && path !== '/moments/') return '/moments/';
    if (path.indexOf('/knowledge/') === 0 && path !== '/knowledge/') return '/knowledge/';
    if (/\/qilylean\/(?:lean-knowledge|daily-insights|lean-tools|execution-loop|reference-|gbt2828)/.test(path)) return '/knowledge/';
    return '/';
  }

  function addStylesheet() {
    var current = document.querySelector('link[href^="/site-shell.css"]');
    if (current) {
      current.href = '/site-shell.css?v=20260722-modules-v4';
      return;
    }
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/site-shell.css?v=20260722-modules-v4';
    document.head.appendChild(link);
  }

  function buildNavigation() {
    var header = document.querySelector('header.qily-site-header,header.topbar,header.top');
    if (!header) {
      header = document.createElement('header');
      header.className = 'qily-site-header';
      header.innerHTML = '<a class="qily-brand" href="/">QilyLean</a>';
      document.body.insertBefore(header, document.body.firstChild);
    }

    var path = normalizedPath(location.pathname);
    var modulePath = currentModule(path);
    var oldNav = header.querySelector(':scope > nav.nav,:scope > nav.site-nav');
    var nav = document.createElement('nav');
    nav.className = 'site-nav qily-global-nav';
    nav.setAttribute('aria-label', '网站导航');

    routes.forEach(function (route) {
      var link = document.createElement('a');
      link.textContent = route[0];
      link.href = route[1];
      if (modulePath === route[1]) link.setAttribute('aria-current', 'page');
      nav.appendChild(link);
    });

    document.querySelectorAll('.qily-back-link').forEach(function (item) { item.remove(); });
    header.classList.remove('qily-has-back');
    header.classList.add('qily-global-header');
    if (oldNav && oldNav.isConnected) oldNav.replaceWith(nav);
    else header.appendChild(nav);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    var field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.left = '-9999px';
    document.body.appendChild(field);
    field.select();
    document.execCommand('copy');
    field.remove();
    return Promise.resolve();
  }

  function showToast(message) {
    var toast = document.getElementById('qilyDockToast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(function () { toast.classList.remove('show'); }, 2600);
  }

  function shareUrl(title, url, successMessage) {
    if (navigator.share) {
      return navigator.share({ title: title, text: title, url: url }).then(function () {
        showToast('已调起系统分享');
      }).catch(function (error) {
        if (error && error.name === 'AbortError') return;
        return copyText(title + '\n' + url).then(function () { showToast(successMessage); });
      });
    }
    return copyText(title + '\n' + url).then(function () { showToast(successMessage); });
  }

  function isMobileDevice() {
    if (navigator.userAgentData && typeof navigator.userAgentData.mobile === 'boolean') {
      return navigator.userAgentData.mobile;
    }
    if (/Android|webOS|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '')) return true;
    return !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches && window.innerWidth <= 820);
  }

  function shareCurrentPage() {
    var title = document.title || 'QilyLean';
    var url = location.href;
    if (isMobileDevice() && navigator.share) {
      return navigator.share({ title: title, text: title, url: url }).then(function () {
        showToast('已调起系统分享');
      }).catch(function (error) {
        if (error && error.name === 'AbortError') return;
        return copyText(url).then(function () { showToast('当前页网址已复制'); });
      });
    }
    return copyText(url).then(function () { showToast('当前页网址已复制'); });
  }

  function loadWeChatQr() {
    if (document.getElementById('qilyWechatQrOfficialScript') || document.getElementById('wechatQrOfficialScript')) return;
    var script = document.createElement('script');
    script.id = 'qilyWechatQrOfficialScript';
    script.src = '/qilylean/wechat-qr-official.js?v=20260722-navigation-v4';
    document.body.appendChild(script);
  }

  function buildDock() {
    ['floatDock', 'wxMask', 'shareMask', 'qilyDockToast'].forEach(function (id) {
      var old = document.getElementById(id);
      if (old) old.remove();
    });

    var path = normalizedPath(location.pathname);
    var backUrl = parentRoute(path);
    var dock = document.createElement('div');
    dock.id = 'floatDock';
    dock.className = 'qily-float-dock';
    dock.setAttribute('aria-label', '快捷服务');
    dock.innerHTML = [
      '<button class="qily-float-btn qily-float-home" data-action="home" type="button">首页</button>',
      '<button class="qily-float-btn qily-float-back" data-action="back" type="button">返回<br>上一层</button>',
      '<button class="qily-float-btn qily-float-current" data-action="current" type="button">分享<br>当前页</button>',
      '<button class="qily-float-btn qily-float-share" data-action="share" type="button">分享</button>',
      '<button class="qily-float-btn qily-float-contact" data-action="contact" type="button">交流</button>'
    ].join('');
    document.body.appendChild(dock);

    var shareMask = document.createElement('div');
    shareMask.id = 'shareMask';
    shareMask.className = 'qily-modal-mask';
    shareMask.innerHTML = '<div class="qily-modal-panel" role="dialog" aria-modal="true" aria-labelledby="qilyShareTitle"><button class="qily-modal-close" type="button" aria-label="关闭">×</button><div class="qily-modal-brand">QilyLean</div><h3 id="qilyShareTitle">分享官网</h3><img class="qily-share-qr" src="' + HOME_QR_SRC + '" alt="QilyLean官网二维码" loading="eager"><span class="qily-share-url">' + HOME_URL + '</span><div class="qily-modal-actions"><button type="button" data-share="system">系统分享</button><button type="button" data-share="copy">复制网址</button></div><p class="qily-modal-note">扫码或复制官网地址访问 QilyLean。</p></div>';
    document.body.appendChild(shareMask);

    var contactMask = document.createElement('div');
    contactMask.id = 'wxMask';
    contactMask.className = 'qily-modal-mask';
    contactMask.innerHTML = '<div class="qily-modal-panel" role="dialog" aria-modal="true" aria-labelledby="qilyContactTitle"><button class="qily-modal-close" type="button" aria-label="关闭">×</button><h3 id="qilyContactTitle">交流</h3><img class="wx-qr-image qily-contact-qr" alt="微信二维码"><p class="qily-wechat"><span>微信号</span><strong>Qily259</strong></p><button class="qily-copy-wechat" type="button">复制微信号</button><div class="qily-phone-list"><div>手机号码</div>' + PHONE_NUMBERS.map(function (phone) { return '<a href="tel:' + phone + '">' + phone + '</a>'; }).join('') + '</div></div>';
    document.body.appendChild(contactMask);

    var toast = document.createElement('div');
    toast.id = 'qilyDockToast';
    toast.className = 'qily-dock-toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
    loadWeChatQr();

    function closeMask(mask) { mask.classList.remove('show'); }
    function runAction(action) {
      if (action === 'home') location.href = '/';
      else if (action === 'back') location.href = backUrl;
      else if (action === 'current') shareCurrentPage();
      else if (action === 'share') shareMask.classList.add('show');
      else if (action === 'contact') contactMask.classList.add('show');
    }

    shareMask.querySelector('.qily-modal-close').addEventListener('click', function () { closeMask(shareMask); });
    contactMask.querySelector('.qily-modal-close').addEventListener('click', function () { closeMask(contactMask); });
    shareMask.addEventListener('click', function (event) { if (event.target === shareMask) closeMask(shareMask); });
    contactMask.addEventListener('click', function (event) { if (event.target === contactMask) closeMask(contactMask); });
    shareMask.querySelector('[data-share="copy"]').addEventListener('click', function () {
      copyText(HOME_URL).then(function () { showToast('官网网址已复制'); closeMask(shareMask); });
    });
    shareMask.querySelector('[data-share="system"]').addEventListener('click', function () {
      shareUrl('QilyLean｜制造改善与项目实践主页', HOME_URL, '官网网址已复制');
    });
    contactMask.querySelector('.qily-copy-wechat').addEventListener('click', function () {
      copyText('Qily259').then(function () { showToast('微信号已复制'); });
    });

    var down = false;
    var moved = false;
    var pointerId = null;
    var startY = 0;
    var startTop = 0;
    var action = '';

    function clampTop(value) {
      return Math.max(8, Math.min(window.innerHeight - dock.offsetHeight - 8, value));
    }

    function setDockTop(value) {
      dock.style.top = clampTop(value) + 'px';
      dock.style.right = 'max(10px, env(safe-area-inset-right))';
      dock.style.bottom = 'auto';
      dock.style.left = 'auto';
    }

    requestAnimationFrame(function () {
      var stored = NaN;
      try { stored = parseFloat(localStorage.getItem('qilyDockTop')); } catch (error) {}
      setDockTop(Number.isFinite(stored) ? stored : Math.max(92, window.innerHeight * 0.2));
    });

    dock.addEventListener('pointerdown', function (event) {
      var button = event.target.closest('.qily-float-btn');
      if (!button) return;
      down = true;
      moved = false;
      pointerId = event.pointerId;
      action = button.getAttribute('data-action') || '';
      startY = event.clientY;
      startTop = dock.getBoundingClientRect().top;
      if (dock.setPointerCapture) dock.setPointerCapture(pointerId);
      event.preventDefault();
    }, { passive: false });

    dock.addEventListener('pointermove', function (event) {
      if (!down || event.pointerId !== pointerId) return;
      var distance = event.clientY - startY;
      if (!moved && Math.abs(distance) > 8) moved = true;
      if (!moved) return;
      setDockTop(startTop + distance);
      event.preventDefault();
    }, { passive: false });

    function finish(event, cancelled) {
      if (!down || event.pointerId !== pointerId) return;
      down = false;
      try { if (dock.releasePointerCapture) dock.releasePointerCapture(pointerId); } catch (error) {}
      if (moved) {
        try { localStorage.setItem('qilyDockTop', String(dock.getBoundingClientRect().top)); } catch (error) {}
      }
      if (!cancelled && !moved) runAction(action);
      pointerId = null;
    }

    dock.addEventListener('pointerup', function (event) { finish(event, false); });
    dock.addEventListener('pointercancel', function (event) { finish(event, true); });
    dock.addEventListener('click', function (event) {
      if (event.detail !== 0) return;
      var button = event.target.closest('.qily-float-btn');
      if (button) runAction(button.getAttribute('data-action') || '');
    });
    window.addEventListener('resize', function () { setDockTop(dock.getBoundingClientRect().top); }, { passive: true });
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      closeMask(shareMask);
      closeMask(contactMask);
    });
  }

  function boot() {
    addStylesheet();
    buildNavigation();
    buildDock();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
