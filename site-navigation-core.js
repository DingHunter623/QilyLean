(function () {
  'use strict';

  if (window.__qilyLeanSiteNavigationPublicV8) return;
  window.__qilyLeanSiteNavigationPublicV8 = true;

  var HOME_URL = 'https://qilylean.com';
  var HOME_QR_SRC = '/qilylean/qilylean-home-qr.svg?v=20260722-navigation-v4';
  var SHARED_ASSET_VERSION = '20260814-contact-v13';
  var VISUAL_SCALE_VERSION = '20260729-hierarchy-v4';
    var CONTROLLED_ROUTE_PATHS = [];
  var PHONE_NUMBERS = [{ city: '东莞', number: '13450014003' }, { city: '宁波', number: '15168120722' }, { city: '乐清', number: '17681788259' }];
  var CONTACT_EMAIL = 'admin@qilylean.com';
  var routes = [
    ['首页', '/'],
    ['履历主线', '/experience/'],
    ['能力体系', '/capabilities/'],
    ['改善方法', '/improvements/'],
    ['代表项目', '/projects/'],
    ['信任中心', '/trust/'],
    ['项目合作', '/cooperation/'],
    ['知识资产', '/knowledge/'],
    ['友情链接', '/links/']
  ];

  function normalizedPath(path) {
    var value = (path || '/').replace(/\/index\.html$/, '/');
    if (value.length <= 1) return '/';
    if (value.charAt(value.length - 1) !== '/' && !/\/[^/]+\.[^/]+$/.test(value)) value += '/';
    return value.replace(/\/+$/, '/');
  }

  function currentModule(path) {
    path = normalizedPath(path);
    if (path === '/') return '/';
    if (/\/ai\.html$/.test(path)) return '/ai.html';
    if (path.indexOf('/capabilities/') === 0) return '/capabilities/';
    if (path.indexOf('/projects/') === 0) return '/projects/';
    if (path.indexOf('/experience/') === 0) return '/experience/';
    if (path.indexOf('/improvements/') === 0 || /\/(?:execution|papers)\.html$/.test(path) || /\/qilylean\/papers\.html$/.test(path)) return '/improvements/';
    if (path.indexOf('/knowledge/') === 0 || path.indexOf('/qilylean/daily/') === 0 || /^\/(?:knowledge|daily|daily-insights|gbt2828)\.html$/.test(path) || /\/qilylean\/(?:lean-knowledge|daily-insights|lean-tools|execution-loop|reference-|gbt2828)/.test(path)) return '/knowledge/';
    if (path.indexOf('/moments/') === 0 || /\/moments\.html$/.test(path)) return '/moments/';
    if (path.indexOf('/links/') === 0) return '/links/';
    if (path.indexOf('/cooperation/') === 0) return '/cooperation/';
    if (path.indexOf('/trust/') === 0 || path.indexOf('/certificates/') === 0 || path.indexOf('/legal/') === 0) return '/trust/';
    return '';
  }

  function primaryRouteForLink(link) {
    var target;
    try { target = new URL(link.getAttribute('href') || '', location.origin); } catch (error) { return ''; }
    if (target.origin !== location.origin) return '';
    var path = normalizedPath(target.pathname);
    for (var i = 0; i < routes.length; i += 1) {
      if (path === routes[i][1]) return routes[i][1];
    }
    return '';
  }

  function syncPrimaryNavCurrentState() {
    var modulePath = currentModule(location.pathname);
    if (!modulePath) return '';
    document.querySelectorAll('.qily-global-nav,header nav.site-nav,header nav.nav,header nav[aria-label="网站导航"],header nav[aria-label="QilyLean核心导视"]').forEach(function (nav) {
      Array.from(nav.children).forEach(function (link) {
        if (!link.matches || !link.matches('a[href]')) return;
        var routePath = primaryRouteForLink(link);
        if (!routePath) return;
        var active = routePath === modulePath;
        if (active) {
          link.setAttribute('aria-current', 'page');
          link.setAttribute('data-qily-primary-current', 'true');
        } else {
          link.removeAttribute('aria-current');
          link.removeAttribute('aria-selected');
          link.removeAttribute('data-current');
          link.removeAttribute('data-active');
          link.removeAttribute('data-qily-primary-current');
          link.classList.remove('active', 'current', 'is-active', 'selected');
        }
      });
    });
    return modulePath;
  }

  window.__qilySyncPrimaryNavCurrentState = syncPrimaryNavCurrentState;

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

  function addWideLayoutStylesheet() {
    var current = document.getElementById('qilyWideLayoutStylesheet');
    if (current) {
      current.href = '/site-wide-layout-v1.css?v=20260810-content-axis-v8';
      return;
    }
    var link = document.createElement('link');
    link.id = 'qilyWideLayoutStylesheet';
    link.rel = 'stylesheet';
    link.href = '/site-wide-layout-v1.css?v=20260810-content-axis-v8';
    document.head.appendChild(link);
  }

  function addTypographyStylesheet() {
    var current = document.getElementById('qilyTypographyStylesheet');
    if (current) {
      current.href = '/site-typography-v1.css?v=20260729-hierarchy-v4';
      return;
    }
    var link = document.createElement('link');
    link.id = 'qilyTypographyStylesheet';
    link.rel = 'stylesheet';
    link.href = '/site-typography-v1.css?v=20260729-hierarchy-v4';
    document.head.appendChild(link);
  }

  function addGlobalHeaderStyles() {
    if (document.getElementById('qilyGlobalHeaderStandard')) return;
    var style = document.createElement('style');
    style.id = 'qilyGlobalHeaderStandard';
    style.textContent = [
      '.qily-site-header.qily-global-header{position:sticky!important;top:0!important;z-index:8000!important;display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:space-between!important;gap:20px!important;min-height:70px!important;padding:10px clamp(18px,3.8vw,54px) 10px max(70px,env(safe-area-inset-left))!important;color:#182420!important;background:rgba(255,255,255,.98)!important;border-bottom:1px solid #d5e4e3!important;box-shadow:0 6px 20px rgba(15,75,90,.06)!important;backdrop-filter:blur(14px)!important;-webkit-backdrop-filter:blur(14px)!important}',
      '.qily-global-header>.qily-brand{display:block!important;flex:0 0 auto!important;width:clamp(168px,14vw,226px)!important;height:34px!important;margin:0!important;padding:0!important;overflow:hidden!important;color:transparent!important;background:url("/assets/brand/qilylean-logo.svg?v=20260724-logo-red-dot-v5") left center/contain no-repeat!important;text-indent:-9999px!important;white-space:nowrap!important;text-decoration:none!important}',
      '.qily-global-header>.qily-global-nav{display:flex!important;flex:0 1 auto!important;align-items:center!important;justify-content:flex-end!important;gap:6px!important;max-width:calc(100vw - 330px)!important;margin-left:auto!important;padding:0!important;overflow-x:auto!important;overflow-y:hidden!important;color:#182420!important;white-space:nowrap!important;scrollbar-width:thin!important;-webkit-overflow-scrolling:touch!important}',
      '.qily-global-header>.qily-global-nav a{display:inline-flex!important;flex:0 0 auto!important;align-items:center!important;justify-content:center!important;min-height:42px!important;padding:7px 10px!important;border:1px solid transparent!important;border-radius:10px!important;color:#182420!important;background:transparent!important;box-shadow:none!important;font-size:18px!important;font-weight:850!important;line-height:1.2!important;text-decoration:none!important;transition:color .18s ease,background-color .18s ease,border-color .18s ease,box-shadow .18s ease,transform .18s ease!important}',
      '.qily-global-header>.qily-global-nav a:hover,.qily-global-header>.qily-global-nav a:focus-visible{color:#fff!important;background:#0f4b5a!important;border-color:#0f4b5a!important;box-shadow:0 8px 18px rgba(15,75,90,.22)!important;outline:none!important;transform:translateY(-2px)!important}',
      '.qily-global-header>.qily-global-nav a[aria-current="page"]{color:#fff!important;-webkit-text-fill-color:#fff!important;background:#0f4b5a!important;border-color:#ffe39b!important;text-decoration-color:#ffe39b!important;box-shadow:0 7px 18px rgba(15,75,90,.24)!important}',
      '@media(max-width:900px){.qily-site-header.qily-global-header{flex-direction:column!important;align-items:stretch!important;justify-content:flex-start!important;gap:5px!important;min-height:auto!important;padding:7px 9px 8px!important}.qily-global-header>.qily-brand{width:142px!important;height:27px!important;margin-left:42px!important}.qily-global-header>.qily-global-nav{width:100%!important;max-width:100%!important;margin:0!important;justify-content:flex-start!important;gap:5px!important;overflow-x:auto!important}.qily-global-header>.qily-global-nav a{min-height:34px!important;padding:5px 9px!important;font-size:17.5px!important;border-radius:9px!important}}',
      '@media(max-width:620px){.qily-global-header>.qily-brand{width:126px!important;height:23px!important}.qily-global-header>.qily-global-nav a{font-size:17.5px!important;padding:5px 7px!important}}'
    ].join('');
    document.head.appendChild(style);
  }

  function buildNavigation() {
    var header = document.querySelector('header.qily-site-header,header.topbar,header.top');
    if (!header) {
      header = document.createElement('header');
      document.body.insertBefore(header, document.body.firstChild);
    }

    var path = normalizedPath(location.pathname);
    var modulePath = currentModule(path);
    var brand = document.createElement('a');
    brand.className = 'qily-brand';
    brand.href = '/';
    brand.textContent = 'QilyLean｜启力精益';
    brand.setAttribute('aria-label', '返回QilyLean首页');
    brand.setAttribute('title', '返回首页');

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
    header.className = 'qily-site-header qily-global-header';
    header.replaceChildren(brand, nav);
  }

  function enableNavigationPrefetch() {
    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection && (connection.saveData || /(?:^|-)2g$/.test(connection.effectiveType || ''))) return;

    document.querySelectorAll('a[href]').forEach(function (link) {
      var done = false;
      function prefetch() {
        if (done) return;
        var target;
        try { target = new URL(link.href, location.href); } catch (error) { return; }
        if (target.origin !== location.origin || normalizedPath(target.pathname) === normalizedPath(location.pathname)) return;
        if (CONTROLLED_ROUTE_PATHS.indexOf(currentModule(normalizedPath(target.pathname))) !== -1) return;
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

  /* QILY-PUBLIC-URL-NO-TRAILING-SLASH-V13 */
  function normalizePublicUrl(value) {
    var text = String(value == null ? '' : value).trim();
    if (!text) return text;
    try {
      var u = new URL(text, location.origin);
      if (u.hostname !== 'qilylean.com' && u.hostname !== 'www.qilylean.com') return text;
      var pathname = u.pathname || '';
      pathname = pathname === '/' ? '' : pathname.replace(/\/+$/, '');
      return u.protocol + '//' + u.host + pathname + u.search + u.hash;
    } catch (error) {
      return text.replace(/\/(?=(?:[?#]|$))/, '');
    }
  }
  function normalizePublicUrlText(value) {
    var text = String(value == null ? '' : value);
    return text.replace(/https:\/\/(?:www\.)?qilylean\.com(?:\/[^\s<>"']*)?/g, function (candidate) {
      return normalizePublicUrl(candidate);
    });
  }
  window.QilyLeanNormalizePublicUrl = normalizePublicUrl;
  window.QilyLeanNormalizePublicUrlText = normalizePublicUrlText;

  function copyText(text) {
    text = normalizePublicUrlText(text);    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
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


  /* QILY-WECHAT-COPY-PROMPT-V12 */
  function ensureWechatCopyPrompt(){
    var p=document.getElementById('qilyWechatCopyPrompt');if(p)return p;
    p=document.createElement('div');p.id='qilyWechatCopyPrompt';p.className='qily-wechat-copy-prompt';p.setAttribute('role','status');p.setAttribute('aria-live','polite');
    p.innerHTML='<span>微信号Qily259已复制，是否开启微信主程序</span><button type="button" data-qily-open-wechat>开启微信</button>';document.body.appendChild(p);
    p.querySelector('[data-qily-open-wechat]').addEventListener('click',function(){p.classList.remove('show');try{window.location.href='weixin://';}catch(e){}setTimeout(function(){if(document.visibilityState==='visible')showToast('如未自动打开微信，请手动打开微信并粘贴Qily259');},1400);});
    return p;
  }
  function positionWechatCopyPrompt(a,p){var r=a&&a.getBoundingClientRect?a.getBoundingClientRect():{right:innerWidth/2,left:innerWidth/2,top:innerHeight/2};p.style.left='12px';p.style.top='12px';requestAnimationFrame(function(){var b=p.getBoundingClientRect(),x=r.right+10;if(x+b.width>innerWidth-12)x=Math.max(12,r.left-b.width-10);var y=Math.max(12,Math.min(r.top,innerHeight-b.height-12));p.style.left=Math.round(x)+'px';p.style.top=Math.round(y)+'px';});}
  function copyWechatAndPrompt(a){return copyText('Qily259').then(function(){var p=ensureWechatCopyPrompt();p.querySelector('span').textContent='微信号Qily259已复制，是否开启微信主程序';positionWechatCopyPrompt(a,p);p.classList.add('show');clearTimeout(copyWechatAndPrompt.timer);copyWechatAndPrompt.timer=setTimeout(function(){p.classList.remove('show');},9000);});}
  window.__qilyCopyWechatAndPrompt=copyWechatAndPrompt;
  document.addEventListener('click',function(e){var x=e.target.closest&&e.target.closest('[data-qily-wechat-copy]');if(!x)return;e.preventDefault();copyWechatAndPrompt(x);});

  /* QILY-PHONE-COPY-PROMPT-V13 */
  function ensurePhoneCopyPrompt(){
    var p=document.getElementById('qilyPhoneCopyPrompt');if(p)return p;
    p=document.createElement('div');p.id='qilyPhoneCopyPrompt';p.className='qily-phone-copy-prompt';p.setAttribute('role','status');p.setAttribute('aria-live','polite');
    p.innerHTML='<span></span><button type="button" data-qily-call-now>立即拨打</button><button type="button" data-qily-call-cancel>取消</button>';document.body.appendChild(p);
    p.querySelector('[data-qily-call-cancel]').addEventListener('click',function(){p.classList.remove('show');});
    return p;
  }
  function copyPhoneAndPrompt(a,phone){return copyText(phone).then(function(){var p=ensurePhoneCopyPrompt();p.dataset.phone=phone;p.querySelector('span').textContent='号码 '+phone+' 已复制，是否立即拨打？';positionWechatCopyPrompt(a,p);p.classList.add('show');var call=p.querySelector('[data-qily-call-now]');call.onclick=function(){p.classList.remove('show');window.location.href='tel:'+phone;};clearTimeout(copyPhoneAndPrompt.timer);copyPhoneAndPrompt.timer=setTimeout(function(){p.classList.remove('show');},9000);});}
  window.__qilyCopyPhoneAndPrompt=copyPhoneAndPrompt;
  document.addEventListener('click',function(e){var x=e.target.closest&&e.target.closest('[data-qily-phone-copy]');if(!x)return;e.preventDefault();copyPhoneAndPrompt(x,x.getAttribute('data-qily-phone-copy'));});


  function shareUrl(title, url, successMessage) {
    url = normalizePublicUrl(url);    if (navigator.share) {
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
    var url = normalizePublicUrl(location.href);
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

  function controlledPageConfig() { return null; }

  function protectControlledPage() {
    var path = normalizedPath(location.pathname);
    var config = controlledPageConfig(path);
    if (!config) return;

    try {
      if (sessionStorage.getItem(config.key) === '1') return;
    } catch (error) {}

    var protectedNodes = Array.from(document.querySelectorAll(config.selectors));
    if (!protectedNodes.length || document.getElementById('qilyControlledAccessGate')) return;
    protectedNodes.forEach(function (node) { node.hidden = true; });

    var robots = document.head.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.content = 'noindex,nofollow,noarchive';

    var style = document.createElement('style');
    style.id = 'qilyControlledAccessStyle';
    style.textContent = '.qily-controlled-access-gate{min-height:calc(100vh - 72px)}.qily-lock-card{max-width:760px;margin:0 auto;padding:30px;border:1px solid var(--qily-line,#d5e4e3);background:#fff;box-shadow:0 14px 36px rgba(15,75,90,.1)}.qily-lock-card h2{margin:0 0 12px;color:var(--qily-deep,#0f4b5a)}.qily-lock-card p{margin:0 0 18px;color:var(--qily-muted,#5f7474);font-size:19px;line-height:1.76}.qily-lock-form{display:flex;gap:10px;flex-wrap:wrap}.qily-lock-input{flex:1;min-width:220px;padding:12px 14px;border:1px solid var(--qily-line,#d5e4e3);font:inherit}.qily-lock-btn{padding:12px 18px;border:0;background:var(--qily-deep,#0f4b5a);color:#fff;font:inherit;font-weight:900;cursor:pointer}.qily-lock-msg{min-height:28px;margin-top:10px;color:#9e4a34;font-weight:850}@media(max-width:620px){.qily-lock-card{padding:22px}.qily-lock-input,.qily-lock-btn{width:100%;min-width:0}}';
    document.head.appendChild(style);

    var gate = document.createElement('main');
    gate.id = 'qilyControlledAccessGate';
    gate.className = 'qily-controlled-access-gate';
    gate.innerHTML = '<section class="module-hero"><div class="module-inner"><span class="module-eyebrow">'+config.eyebrow+'</span><h1>'+config.title+'</h1><p class="module-lead">'+config.lead+'</p></div></section><section class="module-section alt"><div class="module-inner"><div class="qily-lock-card"><h2>'+config.heading+'</h2><p>'+config.description+'</p><div class="qily-lock-form"><input id="qilyControlledPassword" class="qily-lock-input" type="password" inputmode="numeric" autocomplete="current-password" aria-label="'+config.heading+'口令" placeholder="请输入访问密码"><button id="qilyControlledUnlock" class="qily-lock-btn" type="button">'+config.button+'</button></div><div id="qilyControlledMessage" class="qily-lock-msg" aria-live="polite"></div></div></div></section>';
    protectedNodes[0].parentNode.insertBefore(gate, protectedNodes[0]);

    var input = document.getElementById('qilyControlledPassword');
    var button = document.getElementById('qilyControlledUnlock');
    var message = document.getElementById('qilyControlledMessage');

    function unlock() {
      if ((input.value || '').trim() !== ACCESS_PASSWORD) {
        message.textContent = '密码不正确，请重新输入。';
        input.select();
        return;
      }
      try { sessionStorage.setItem(config.key, '1'); } catch (error) {}
      gate.remove();
      protectedNodes.forEach(function (node) { node.hidden = false; });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    button.addEventListener('click', unlock);
    input.addEventListener('keydown', function (event) { if (event.key === 'Enter') unlock(); });
    setTimeout(function () { input.focus(); }, 0);
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
    script.src = '/site-search.js?v=20260729-ranked-search-v1';
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
      '<button class="qily-float-btn qily-float-top" data-action="top" type="button">回<br>顶部</button>',
      '<button class="qily-float-btn qily-float-search" data-action="search" type="button">本站<br>搜索</button>',
      '<button class="qily-float-btn qily-float-back" data-action="back" type="button">返回<br>上一层</button>',
      '<button class="qily-float-btn qily-float-current" data-action="current" type="button">分享<br>当前页</button>',
      '<button class="qily-float-btn qily-float-share" data-action="share" type="button"><span class="qily-share-label-line qily-share-label-primary">分享</span><span class="qily-share-label-line qily-share-label-url">官网</span></button>',
      '<button class="qily-float-btn qily-float-contact" data-action="contact" type="button">交流</button>'
    ].join('');
    document.body.appendChild(dock);

    var shareMask = document.createElement('div');
    shareMask.id = 'shareMask';
    shareMask.className = 'qily-modal-mask';
    shareMask.innerHTML = '<div class="qily-modal-panel" role="dialog" aria-modal="true" aria-labelledby="qilyShareTitle"><button class="qily-modal-close" type="button" aria-label="关闭">×</button><div class="qily-modal-brand">QilyLean</div><h3 id="qilyShareTitle">分享“启力精益”官网</h3><img class="qily-share-qr" src="' + HOME_QR_SRC + '" alt="QilyLean官网二维码" loading="eager"><span class="qily-share-url">' + HOME_URL + '</span><div class="qily-modal-actions"><button type="button" data-share="system">系统分享</button><button type="button" data-share="copy">复制网址</button></div><p class="qily-modal-note">扫码或复制官网地址访问 “QilyLean 启力精益”</p></div>';
    document.body.appendChild(shareMask);

    var contactMask = document.createElement('div');
    contactMask.id = 'wxMask';
    contactMask.className = 'qily-modal-mask';
    contactMask.innerHTML = '<div class="qily-modal-panel qily-contact-panel" role="dialog" aria-modal="true" aria-labelledby="qilyContactTitle"><button class="qily-modal-close" type="button" aria-label="关闭">×</button><h3 id="qilyContactTitle">交流</h3><img class="wx-qr-image qily-contact-qr" alt="微信二维码"><div class="qily-wechat-row"><button class="qily-wechat-action" type="button" data-qily-wechat-copy="Qily259" aria-label="复制微信 Qily259"><span>微信</span><strong>Qily259</strong></button></div><div class="qily-phone-list"><div>手机号码</div>' + PHONE_NUMBERS.map(function (item) { return '<a href="tel:' + item.number + '" data-qily-phone-copy="' + item.number + '" aria-label="复制并拨打 ' + item.city + ' ' + item.number + '"><span class="qily-phone-city">' + item.city + '：</span><strong class="qily-phone-number">' + item.number + '</strong></a>'; }).join('') + '</div><div class="qily-email-list"><div>官方网址</div><a class="qily-contact-email" href="https://qilylean.com">https://qilylean.com</a></div><div class="qily-email-list"><div>官网邮箱</div><a class="qily-contact-email" href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + '</a><div class="qily-email-actions"><button class="qily-copy-email" type="button">复制邮箱</button><a class="qily-send-email" href="mailto:' + CONTACT_EMAIL + '">发送邮件</a></div></div></div>';
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
      else if (action === 'top') { document.documentElement.scrollTop=0; document.body.scrollTop=0; window.scrollTo(0,0); requestAnimationFrame(function(){ window.scrollTo(0,0); }); }
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
      copyText(HOME_URL).then(function () { showToast('官方网址已复制'); closeMask(shareMask); });
    });
    shareMask.querySelector('[data-share="system"]').addEventListener('click', function () {
      shareUrl('QilyLean｜制造改善与项目实践主页', HOME_URL, '官方网址已复制');
    });
    contactMask.querySelector('.qily-copy-email').addEventListener('click', function () {
      copyText(CONTACT_EMAIL).then(function () { showToast('官网邮箱已复制'); });
    });

    var down = false;
    var moved = false;
    var pointerId = null;
    var startX = 0;
    var startY = 0;
    var startLeft = 0;
    var startTop = 0;
    var action = '';
    var DOCK_POSITION_KEY = 'qilyDockPositionV2';
    var userPositioned = false;

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function dockLimits() {
      return {
        minLeft: 8,
        minTop: 8,
        maxLeft: Math.max(8, window.innerWidth - dock.offsetWidth - 8),
        maxTop: Math.max(8, window.innerHeight - dock.offsetHeight - 8)
      };
    }

    function setDockPosition(left, top, free) {
      var limits = dockLimits();
      var safeTop = clamp(top, limits.minTop, limits.maxTop);
      dock.style.setProperty('top', safeTop + 'px', 'important');
      dock.style.setProperty('bottom', 'auto', 'important');
      if (free) {
        var safeLeft = clamp(left, limits.minLeft, limits.maxLeft);
        dock.style.setProperty('left', safeLeft + 'px', 'important');
        dock.style.setProperty('right', 'auto', 'important');
        userPositioned = true;
      } else {
        dock.style.setProperty('left', 'auto', 'important');
        dock.style.setProperty('right', 'max(10px, env(safe-area-inset-right))', 'important');
        userPositioned = false;
      }
    }

    function positionRatios(left, top) {
      var limits = dockLimits();
      var xRange = Math.max(1, limits.maxLeft - limits.minLeft);
      var yRange = Math.max(1, limits.maxTop - limits.minTop);
      return {
        x: clamp((left - limits.minLeft) / xRange, 0, 1),
        y: clamp((top - limits.minTop) / yRange, 0, 1)
      };
    }

    function saveDockPosition() {
      var rect = dock.getBoundingClientRect();
      var ratios = positionRatios(rect.left, rect.top);
      try {
        localStorage.setItem(DOCK_POSITION_KEY, JSON.stringify({ x: ratios.x, y: ratios.y }));
        localStorage.removeItem('qilyDockTop');
      } catch (error) {}
    }

    function restoreDockPosition() {
      var stored = null;
      try { stored = JSON.parse(localStorage.getItem(DOCK_POSITION_KEY) || 'null'); } catch (error) {}
      if (stored && Number.isFinite(stored.x) && Number.isFinite(stored.y)) {
        var limits = dockLimits();
        var left = limits.minLeft + clamp(stored.x, 0, 1) * Math.max(1, limits.maxLeft - limits.minLeft);
        var top = limits.minTop + clamp(stored.y, 0, 1) * Math.max(1, limits.maxTop - limits.minTop);
        setDockPosition(left, top, true);
        return;
      }
      var legacyTop = NaN;
      try { legacyTop = parseFloat(localStorage.getItem('qilyDockTop')); } catch (error) {}
      setDockPosition(0, Number.isFinite(legacyTop) ? legacyTop : Math.max(92, window.innerHeight * 0.2), false);
    }

    requestAnimationFrame(restoreDockPosition);

    dock.addEventListener('pointerdown', function (event) {
      var button = event.target.closest('.qily-float-btn');
      if (!button) return;
      down = true;
      moved = false;
      pointerId = event.pointerId;
      action = button.getAttribute('data-action') || '';
      startX = event.clientX;
      startY = event.clientY;
      var rect = dock.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      if (dock.setPointerCapture) dock.setPointerCapture(pointerId);
      event.preventDefault();
    }, { passive: false });

    dock.addEventListener('pointermove', function (event) {
      if (!down || event.pointerId !== pointerId) return;
      var dx = event.clientX - startX;
      var dy = event.clientY - startY;
      if (!moved && Math.hypot(dx, dy) > 7) {
        moved = true;
        dock.classList.add('qily-dock-dragging');
      }
      if (!moved) return;
      setDockPosition(startLeft + dx, startTop + dy, true);
      event.preventDefault();
    }, { passive: false });

    function finish(event, cancelled) {
      if (!down || event.pointerId !== pointerId) return;
      down = false;
      try { if (dock.releasePointerCapture) dock.releasePointerCapture(pointerId); } catch (error) {}
      dock.classList.remove('qily-dock-dragging');
      if (moved) saveDockPosition();
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

  function ensureGlobalContactFooter() {
    if (document.getElementById('qilyGlobalContactFooter')) return;
    var block = document.createElement('div');
    block.id = 'qilyGlobalContactFooter';
    block.className = 'qily-global-contact-footer';
    block.innerHTML = '<span>QilyLean｜技术与项目联系 / Technical &amp; Project Contact</span><span>官方网址：</span><a href="https://qilylean.com">https://qilylean.com</a><span>官网邮箱：</span><a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + '</a>';
    var footer = document.querySelector('footer');
    if (footer) footer.appendChild(block);
    else {
      var shell = document.createElement('div');
      shell.className = 'qily-global-contact-footer-shell';
      shell.appendChild(block);
      document.body.appendChild(shell);
    }
  }

  function ensureKnowledgeDocumentEnhancements() {
    var title = document.title || '';
    var isTerm = /^\/knowledge\/terminology\/[^/]+\.html$/i.test(location.pathname);
    var isDoc = /\/(?:qilylean\/reference|reference|trust\/nda-preview|gbt2828)/i.test(location.pathname) || /参考资料|程序文件|PDF|标准作业|抽样检验/i.test(title);
    if (!document.getElementById('qilyDocumentUtilityStyle')) {
      var style=document.createElement('style');
      style.id='qilyDocumentUtilityStyle';
      style.textContent='.qily-document-email-tail{padding:9px 12px;border-top:1px solid #cbdcda;color:#0f4b5a;background:#f7fbfa;font-size:13px;font-weight:850;text-align:center}.qily-document-email-tail a{color:#0f4b5a;text-underline-offset:.18em}@media print{html.qily-shell-pending body,html.qily-first-paint-pending body{visibility:visible!important}.qily-site-header,.qily-global-header,.qily-float-dock,.qily-modal-mask,.qily-global-contact-footer{display:none!important}body{display:block!important;background:#fff!important}}';
      document.head.appendChild(style);
    }
    if (isDoc) {
      function addTail(){
        var pages=document.querySelectorAll('.viewer .page,.pdf-page,.document-page,.paper-page');
        var last=pages.length?pages[pages.length-1]:null;
        if(last && !last.querySelector('.qily-document-email-tail')){
          var tail=document.createElement('div'); tail.className='qily-document-email-tail';
          tail.innerHTML='官方网址：https://qilylean.com　｜　官网邮箱：<a href="mailto:'+CONTACT_EMAIL+'">'+CONTACT_EMAIL+'</a>';
          last.appendChild(tail);
        }
      }
      addTail(); setTimeout(addTail,120); setTimeout(addTail,600);
    }
    if(isTerm){ document.documentElement.classList.remove('qily-first-paint-pending','qily-shell-pending'); }
  }

  function revealCurrentShell() {
    document.documentElement.classList.remove('qily-shell-pending');
    if (typeof window.__qilyLeanRevealCurrentShell === 'function') {
      window.__qilyLeanRevealCurrentShell();
    }
  }

  function boot() {
    try {
      // R2 static-first: shell CSS already materialized.
      // R2 static-first: visual scale already materialized.
      // R2 static-first: wide layout already materialized.
      // R2 static-first: header styles already materialized.
      // R2 static-first: typography already materialized.
      if (!document.querySelector('header.qily-site-header .qily-global-nav,header.qily-global-header .qily-global-nav')) buildNavigation();
      syncPrimaryNavCurrentState();
      // R2: no repeated global contact footer on ordinary pages.
      // R2: no repeated document contact/email tail.
      protectControlledPage();
      buildDock();
      document.dispatchEvent(new CustomEvent('qily:shell-ready'));
    } finally {
      revealCurrentShell();
    }
  }

  /*
   * Deferred head scripts execute after HTML parsing and before DOMContentLoaded.
   * Boot immediately once <body> exists so the browser never paints the legacy
   * per-page shell before the shared QilyLean shell takes over.
   */
  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot, { once: true });
})();


/* QILY-PHONE-CONTACT-V12.4:START */
(function(){
  'use strict';
  if(window.__qilyPhoneContactV124)return;
  window.__qilyPhoneContactV124=true;
  function copyTextV124(text){
    if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(text);
    var f=document.createElement('textarea');f.value=text;f.setAttribute('readonly','');f.style.position='fixed';f.style.left='-9999px';document.body.appendChild(f);f.select();document.execCommand('copy');f.remove();return Promise.resolve();
  }
  function promptBox(){
    var p=document.getElementById('qilyPhoneCallPrompt');if(p)return p;
    p=document.createElement('div');p.id='qilyPhoneCallPrompt';p.className='qily-phone-call-prompt-v124';p.setAttribute('role','status');p.setAttribute('aria-live','polite');
    p.innerHTML='<span></span><button type="button">立即拨打</button>';document.body.appendChild(p);
    p.querySelector('button').addEventListener('click',function(){var n=p.getAttribute('data-phone')||'';p.classList.remove('show');if(n)window.location.href='tel:'+n;});
    return p;
  }
  function place(anchor,p){
    var r=anchor.getBoundingClientRect();p.style.left='12px';p.style.top='12px';requestAnimationFrame(function(){var b=p.getBoundingClientRect(),x=r.right+10;if(x+b.width>innerWidth-12)x=Math.max(12,r.left-b.width-10);var y=Math.max(12,Math.min(r.top,innerHeight-b.height-12));p.style.left=Math.round(x)+'px';p.style.top=Math.round(y)+'px';});
  }
  function copyPhone(anchor,phone){
    phone=(phone||'').replace(/[^0-9+]/g,'');if(!phone)return;
    copyTextV124(phone).then(function(){var p=promptBox();p.setAttribute('data-phone',phone);p.querySelector('span').textContent='电话号码 '+phone+' 已复制，是否立即拨打？';place(anchor,p);p.classList.add('show');clearTimeout(copyPhone.timer);copyPhone.timer=setTimeout(function(){p.classList.remove('show');},9000);});
  }
  function normalizeCooperation(){
    var card=document.querySelector('.contact-card');if(!card)return;
    var phone=card.querySelector('a[href^="tel:"]');
    if(phone){phone.classList.add('contact-line');if(!phone.querySelector('strong')){var pv=(phone.textContent||'').replace(/^\s*电话\s*[：:]\s*/,'').trim();phone.replaceChildren();var pl=document.createElement('span');pl.textContent='电话：';var ps=document.createElement('strong');ps.textContent=pv;phone.append(pl,ps);}}
    var email=card.querySelector('a[href^="mailto:"]');
    if(email){email.classList.add('contact-line');if(!email.querySelector('strong')){var ev=(email.textContent||'').replace(/^\s*邮箱\s*[：:]\s*/,'').trim();email.replaceChildren();var el=document.createElement('span');el.textContent='邮箱：';var es=document.createElement('strong');es.textContent=ev;email.append(el,es);}}
    var wx=card.querySelector('#copyWechat,[data-qily-wechat-copy="Qily259"]');
    if(wx){wx.classList.add('wechat-contact-action');if(!wx.querySelector('strong')){wx.replaceChildren();var wl=document.createElement('span');wl.textContent='微信：';var ws=document.createElement('strong');ws.textContent='Qily259';wx.append(wl,ws);}}
  }
  document.addEventListener('click',function(e){var x=e.target.closest&&e.target.closest('.qily-phone-list a[href^="tel:"],.contact-card a[href^="tel:"],.term-opl-contact-lines a[href^="tel:"]');if(!x)return;e.preventDefault();e.stopPropagation();copyPhone(x,(x.getAttribute('href')||'').replace(/^tel:/,''));},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',normalizeCooperation,{once:true});else normalizeCooperation();
})();
/* QILY-PHONE-CONTACT-V12.4:END */
