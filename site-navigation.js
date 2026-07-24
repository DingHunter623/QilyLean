(function () {
  'use strict';

  if (window.__qilyLeanSiteNavigationV8) return;
  window.__qilyLeanSiteNavigationV8 = true;

  var HOME_URL = 'https://qilylean.com/';
  var HOME_QR_SRC = '/qilylean/qilylean-home-qr.svg?v=20260722-navigation-v4';
  var SHARED_ASSET_VERSION = '20260724-share-lock-v2';
  var VISUAL_SCALE_VERSION = '20260724-share-lock-v2';
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
      current.href = '/site-shell.css?v=' + SHARED_ASSET_VERSION;
      return;
    }
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/site-shell.css?v=' + SHARED_ASSET_VERSION;
    document.head.appendChild(link);
  }

  function addVisualScaleStylesheet() {
    var current = document.getElementById('qilyVisualScaleStylesheet');
    if (current) {
      current.href = '/site-visual-scale-v1.css?v=' + VISUAL_SCALE_VERSION;
      return;
    }
    var link = document.createElement('link');
    link.id = 'qilyVisualScaleStylesheet';
    link.rel = 'stylesheet';
    link.href = '/site-visual-scale-v1.css?v=' + VISUAL_SCALE_VERSION;
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

  function enableNavigationPrefetch() {
    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection && (connection.saveData || /(?:^|-)2g$/.test(connection.effectiveType || ''))) return;

    document.querySelectorAll('.qily-global-nav a[href],.site-nav a[href]').forEach(function (link) {
      var done = false;
      function prefetch() {
        if (done) return;
        var target;
        try { target = new URL(link.href, location.href); } catch (error) { return; }
        if (target.origin !== location.origin || normalizedPath(target.pathname) === normalizedPath(location.pathname)) return;
        if (normalizedPath(target.pathname) === '/cooperation/') return;
        done = true;
        target.hash = '';
        var hint = document.createElement('link');
        hint.rel = 'prefetch';
        hint.href = target.href;
        hint.fetchPriority = 'low';
        document.head.appendChild(hint);
      }
      link.addEventListener('pointerenter', prefetch, { once: true, passive: true });
      link.addEventListener('touchstart', prefetch, { once: true, passive: true });
      link.addEventListener('focus', prefetch, { once: true, passive: true });
    });
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
    var shareText = title + '\n' + url;
    if (isMobileDevice() && navigator.share) {
      return navigator.share({ title: title, text: title, url: url }).then(function () {
        showToast('已调起系统分享');
      }).catch(function (error) {
        if (error && error.name === 'AbortError') return;
        return copyText(shareText).then(function () { showToast('网页标题及网址已复制'); });
      });
    }
    return copyText(shareText).then(function () { showToast('网页标题及网址已复制'); });
  }

  function protectCooperationPage() {
    var path = normalizedPath(location.pathname);
    if (path.indexOf('/cooperation/') !== 0) return;

    try {
      if (sessionStorage.getItem('cooperationUnlocked') === '1') return;
    } catch (error) {}

    var main = document.querySelector('main');
    if (!main || document.getElementById('cooperationAccessGate')) return;
    var footer = document.querySelector('footer.module-footer,footer');
    main.hidden = true;
    if (footer) footer.hidden = true;

    var robots = document.head.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.content = 'noindex,nofollow,noarchive';

    var style = document.createElement('style');
    style.id = 'cooperationLockStyle';
    style.textContent = '.cooperation-access-gate{min-height:calc(100vh - 72px)}.cooperation-lock-card{max-width:760px;margin:0 auto;padding:30px;border:1px solid var(--qily-line,#d5e4e3);background:#fff;box-shadow:0 14px 36px rgba(15,75,90,.1)}.cooperation-lock-card h2{margin:0 0 12px;color:var(--qily-deep,#0f4b5a)}.cooperation-lock-card p{margin:0 0 18px;color:var(--qily-muted,#5f7474);font-size:19px;line-height:1.76}.cooperation-lock-form{display:flex;gap:10px;flex-wrap:wrap}.cooperation-lock-input{flex:1;min-width:220px;padding:12px 14px;border:1px solid var(--qily-line,#d5e4e3);font:inherit}.cooperation-lock-btn{padding:12px 18px;border:0;background:var(--qily-deep,#0f4b5a);color:#fff;font:inherit;font-weight:900;cursor:pointer}.cooperation-lock-msg{min-height:28px;margin-top:10px;color:#9e4a34;font-weight:850}@media(max-width:620px){.cooperation-lock-card{padding:22px}.cooperation-lock-input,.cooperation-lock-btn{width:100%;min-width:0}}';
    document.head.appendChild(style);

    var gate = document.createElement('main');
    gate.id = 'cooperationAccessGate';
    gate.className = 'cooperation-access-gate';
    gate.innerHTML = '<section class="module-hero"><div class="module-inner"><span class="module-eyebrow">Controlled Access / Project Cooperation</span><h1>项目合作（加密）</h1><p class="module-lead">项目合作内容暂为受控访问，输入与履历主线相同的访问口令后查看。</p></div></section><section class="module-section alt"><div class="module-inner"><div class="cooperation-lock-card"><h2>访问项目合作</h2><p>本页包含企业问题初筛、合作范围、服务边界、项目交付方式及联系入口。请输入访问口令后查看完整内容。</p><div class="cooperation-lock-form"><input id="cooperationPassword" class="cooperation-lock-input" type="password" inputmode="numeric" autocomplete="current-password" aria-label="项目合作访问口令" placeholder="请输入访问密码"><button id="cooperationUnlock" class="cooperation-lock-btn" type="button">查看项目合作</button></div><div id="cooperationLockMessage" class="cooperation-lock-msg" aria-live="polite"></div></div></div></section>';
    main.parentNode.insertBefore(gate, main);

    var input = document.getElementById('cooperationPassword');
    var button = document.getElementById('cooperationUnlock');
    var message = document.getElementById('cooperationLockMessage');

    function unlock() {
      if ((input.value || '').trim() !== '259') {
        message.textContent = '密码不正确，请重新输入。';
        input.select();
        return;
      }
      try { sessionStorage.setItem('cooperationUnlocked', '1'); } catch (error) {}
      gate.remove();
      main.hidden = false;
      if (footer) footer.hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    button.addEventListener('click', unlock);
    input.addEventListener('keydown', function (event) { if (event.key === 'Enter') unlock(); });
  }

  function loadWeChatQr() {
    if (document.getElementById('qilyWechatQrOfficialScript') || document.getElementById('wechatQrOfficialScript')) return;
    var script = document.createElement('script');
    script.id = 'qilyWechatQrOfficialScript';
    script.src = '/qilylean/wechat-qr-official.js?v=20260722-navigation-v4';
    document.body.appendChild(script);
  }

  function loadSiteSearch(callback) {
    if (window.QilySiteSearch) {
      if (callback) callback();
      return;
    }
    var existing = document.getElementById('qilySiteSearchScript');
    if (existing) {
      if (callback) existing.addEventListener('load', callback, { once: true });
      return;
    }
    var script = document.createElement('script');
    script.id = 'qilySiteSearchScript';
    script.src = '/site-search.js?v=20260724-site-search-v2';
    if (callback) script.addEventListener('load', callback, { once: true });
    document.body.appendChild(script);
  }

  function buildDock() {
    ['floatDock', 'wxMask', 'shareMask', 'qilySearchMask', 'qilyDockToast'].forEach(function (id) {
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
      '<button class="qily-float-btn qily-float-search" data-action="search" type="button">本站<br>搜索</button>',
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
    loadSiteSearch();

    function closeMask(mask) { if (mask) mask.classList.remove('show'); }
    function runAction(action) {
      if (action === 'home') location.href = '/';
      else if (action === 'search') {
        loadSiteSearch(function () {
          if (window.QilySiteSearch) window.QilySiteSearch.open();
          else showToast('本站搜索加载失败，请稍后重试');
        });
      }
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
      closeMask(document.getElementById('qilySearchMask'));
    });
  }

  function boot() {
    addStylesheet();
    addVisualScaleStylesheet();
    buildNavigation();
    protectCooperationPage();
    enableNavigationPrefetch();
    buildDock();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
