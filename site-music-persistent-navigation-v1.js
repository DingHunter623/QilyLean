(function (window, document) {
  'use strict';

  if (window.top !== window.self) return;
  if (window.__qilyPersistentNavigationV1) return;
  window.__qilyPersistentNavigationV1 = true;

  var FRAME_ID = 'qilyPersistentNavigationFrame';
  var LOADER_ID = 'qilyPersistentNavigationLoader';
  var STATE_FLAG = 'qilyPersistentNavigation';
  var FRAME_Z = 2147482000;
  var LOADER_Z = 2147482500;
  var initialHref = window.location.href;
  var initialKey = documentKey(initialHref);
  var initialTitle = document.title;
  var initialBodyOverflow = '';
  var initialHtmlOverflow = '';
  var frame = null;
  var loader = null;
  var active = false;
  var requestedHref = '';
  var requestSerial = 0;

  function documentKey(value) {
    try {
      var url = new URL(value, window.location.href);
      return url.origin + url.pathname + url.search;
    } catch (error) {
      return String(value || '').split('#')[0];
    }
  }

  function normalizeHref(value) {
    try {
      return new URL(value, window.location.href).href;
    } catch (error) {
      return String(value || '');
    }
  }

  function isPrimaryPointer(event) {
    if (event.defaultPrevented) return false;
    if (event.button !== undefined && event.button !== 0) return false;
    return !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
  }

  function isPageLike(url) {
    var path = String(url.pathname || '').toLowerCase();
    if (/\.(?:pdf|zip|rar|7z|docx?|xlsx?|pptx?|csv|txt|xml|json|mp3|wav|m4a|mp4|mov|avi|webm|png|jpe?g|gif|webp|svg|ico|apk|exe|dmg|pkg)$/i.test(path)) return false;
    var last = path.split('/').pop() || '';
    return !last || last.indexOf('.') < 0 || /\.html?$/i.test(last);
  }

  function resolveLink(link) {
    if (!link || !link.getAttribute) return null;
    var raw = link.getAttribute('href');
    if (!raw || raw.charAt(0) === '#') return null;
    if (/^(?:mailto:|tel:|sms:|javascript:|data:|blob:)/i.test(raw)) return null;
    if (link.hasAttribute('download')) return null;
    if (link.hasAttribute('data-qily-full-navigation')) return null;
    if (link.closest && link.closest('[data-qily-no-persistent-navigation]')) return null;
    var target = String(link.getAttribute('target') || '').toLowerCase();
    if (target && target !== '_self') return null;
    var rel = String(link.getAttribute('rel') || '').toLowerCase();
    if (/(^|\s)external(\s|$)/.test(rel)) return null;
    try {
      var url = new URL(link.href || raw, window.location.href);
      if (url.origin !== window.location.origin) return null;
      if (!/^https?:$/.test(url.protocol)) return null;
      if (!isPageLike(url)) return null;
      return url;
    } catch (error) {
      return null;
    }
  }

  function ensureLoader() {
    if (loader) return loader;
    loader = document.createElement('div');
    loader.id = LOADER_ID;
    loader.setAttribute('role', 'status');
    loader.setAttribute('aria-live', 'polite');
    loader.setAttribute('aria-label', '页面加载中');
    loader.innerHTML = '<span aria-hidden="true"></span><b>页面加载中…</b>';
    loader.style.cssText = [
      'position:fixed',
      'left:50%',
      'top:50%',
      'transform:translate(-50%,-50%)',
      'display:none',
      'align-items:center',
      'gap:10px',
      'padding:12px 16px',
      'border:1px solid rgba(255,255,255,.45)',
      'border-radius:999px',
      'color:#fff',
      'background:rgba(7,60,71,.92)',
      'box-shadow:0 14px 38px rgba(7,60,71,.28)',
      'font:700 14px/1.2 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif',
      'z-index:' + LOADER_Z,
      'pointer-events:none'
    ].join(';');
    var spinner = loader.querySelector('span');
    spinner.style.cssText = 'width:16px;height:16px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:qilyPersistentSpin .8s linear infinite';
    var style = document.createElement('style');
    style.id = 'qilyPersistentNavigationStyle';
    style.textContent = '@keyframes qilyPersistentSpin{to{transform:rotate(360deg)}}';
    (document.head || document.documentElement).appendChild(style);
    (document.body || document.documentElement).appendChild(loader);
    return loader;
  }

  function showLoader() {
    ensureLoader().style.display = 'flex';
  }

  function hideLoader() {
    if (loader) loader.style.display = 'none';
  }

  function lockOuterDocument() {
    if (!document.body) return;
    if (!active) {
      initialBodyOverflow = document.body.style.overflow || '';
      initialHtmlOverflow = document.documentElement.style.overflow || '';
    }
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }

  function unlockOuterDocument() {
    if (document.body) document.body.style.overflow = initialBodyOverflow;
    document.documentElement.style.overflow = initialHtmlOverflow;
  }

  function ensureFrame() {
    if (frame) return frame;
    frame = document.createElement('iframe');
    frame.id = FRAME_ID;
    frame.name = 'qilyPersistentNavigationView';
    frame.title = 'QilyLean站内页面';
    frame.setAttribute('allow', 'autoplay; clipboard-read; clipboard-write; fullscreen');
    frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    frame.style.cssText = [
      'position:fixed',
      'inset:0',
      'width:100vw',
      'height:100vh',
      'display:none',
      'border:0',
      'margin:0',
      'padding:0',
      'background:#fff',
      'z-index:' + FRAME_Z
    ].join(';');
    frame.addEventListener('load', handleFrameLoad);
    (document.body || document.documentElement).appendChild(frame);
    return frame;
  }

  function currentFrameHref() {
    try {
      return frame && frame.contentWindow ? frame.contentWindow.location.href : '';
    } catch (error) {
      return '';
    }
  }

  function showFrame() {
    ensureFrame();
    lockOuterDocument();
    active = true;
    frame.style.display = 'block';
    frame.removeAttribute('aria-hidden');
    document.documentElement.classList.add('qily-persistent-navigation-active');
  }

  function hideFrame() {
    active = false;
    requestedHref = '';
    hideLoader();
    if (frame) {
      frame.style.display = 'none';
      frame.setAttribute('aria-hidden', 'true');
    }
    document.documentElement.classList.remove('qily-persistent-navigation-active');
    unlockOuterDocument();
    document.title = initialTitle;
  }

  function updateHistory(url, mode) {
    var state = {};
    state[STATE_FLAG] = true;
    state.url = url.href;
    if (mode === 'replace') window.history.replaceState(state, '', url.href);
    else if (mode === 'push') window.history.pushState(state, '', url.href);
  }

  function focusFrame() {
    try {
      if (frame && frame.contentWindow) frame.contentWindow.focus();
    } catch (error) {}
  }

  function replaceFrameLocation(url) {
    ensureFrame();
    try {
      frame.contentWindow.location.replace(url.href);
    } catch (error) {
      frame.src = url.href;
    }
  }

  function navigate(value, historyMode) {
    var url;
    try {
      url = new URL(value, window.location.href);
    } catch (error) {
      window.location.href = value;
      return;
    }

    if (url.origin !== window.location.origin || !isPageLike(url)) {
      window.location.href = url.href;
      return;
    }

    if (documentKey(url.href) === initialKey) {
      if (historyMode) updateHistory(url, historyMode);
      hideFrame();
      if (url.hash) {
        window.setTimeout(function () {
          var target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
          if (target && target.scrollIntoView) target.scrollIntoView();
          else window.location.hash = url.hash;
        }, 0);
      } else {
        window.scrollTo(0, 0);
      }
      return;
    }

    if (active && documentKey(currentFrameHref()) === documentKey(url.href) && url.hash) {
      if (historyMode) updateHistory(url, historyMode);
      try { frame.contentWindow.location.hash = url.hash; } catch (error) {}
      return;
    }

    if (historyMode) updateHistory(url, historyMode);
    requestSerial += 1;
    requestedHref = url.href;
    showFrame();
    showLoader();
    replaceFrameLocation(url);
  }

  function handleDockAction(event, rootDocument) {
    var target = event.target;
    var control = target && target.closest ? target.closest('[data-action]') : null;
    if (!control) return false;
    var action = control.getAttribute('data-action');
    if (action === 'home') {
      event.preventDefault();
      event.stopPropagation();
      navigate('/', 'push');
      return true;
    }
    if (action === 'back') {
      event.preventDefault();
      event.stopPropagation();
      window.history.back();
      return true;
    }
    if (action === 'top' && rootDocument && rootDocument.defaultView) {
      event.preventDefault();
      event.stopPropagation();
      rootDocument.defaultView.scrollTo({ top: 0, behavior: 'smooth' });
      return true;
    }
    return false;
  }

  function bindNavigation(rootDocument) {
    if (!rootDocument || rootDocument.__qilyPersistentNavigationBound) return;
    rootDocument.__qilyPersistentNavigationBound = true;
    rootDocument.addEventListener('click', function (event) {
      if (!isPrimaryPointer(event)) return;
      if (handleDockAction(event, rootDocument)) return;
      var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
      var url = resolveLink(link);
      if (!url) return;

      var sourceHref = '';
      try { sourceHref = rootDocument.defaultView.location.href; } catch (error) {}
      if (documentKey(sourceHref) === documentKey(url.href) && url.hash) {
        if (rootDocument === document) return;
        event.preventDefault();
        event.stopPropagation();
        updateHistory(url, 'push');
        try { rootDocument.defaultView.location.hash = url.hash; } catch (error) {}
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      navigate(url.href, 'push');
    }, true);
  }

  function handleFrameLoad() {
    hideLoader();
    if (!frame) return;
    var childDocument;
    var actualHref = '';
    try {
      childDocument = frame.contentDocument;
      actualHref = frame.contentWindow.location.href;
    } catch (error) {
      window.location.href = requestedHref || frame.src;
      return;
    }

    if (!childDocument || !actualHref || actualHref === 'about:blank') return;
    var requestedKey = documentKey(requestedHref);
    var actualKey = documentKey(actualHref);
    var parentKey = documentKey(window.location.href);

    if (requestedHref) {
      if (actualKey !== requestedKey || normalizeHref(actualHref) !== normalizeHref(window.location.href)) {
        updateHistory(new URL(actualHref), 'replace');
      }
    } else if (actualKey !== parentKey || normalizeHref(actualHref) !== normalizeHref(window.location.href)) {
      updateHistory(new URL(actualHref), 'push');
    }

    requestedHref = '';
    bindNavigation(childDocument);
    if (childDocument.title) document.title = childDocument.title;
    frame.title = childDocument.title || 'QilyLean站内页面';
    focusFrame();
    try {
      window.dispatchEvent(new CustomEvent('qily:persistent-navigation-load', { detail: { url: actualHref, serial: requestSerial } }));
    } catch (error) {}
  }

  function boot() {
    if (!document.body) {
      window.setTimeout(boot, 0);
      return;
    }
    bindNavigation(document);
    ensureLoader();
    if (!window.history.state || !window.history.state[STATE_FLAG]) {
      var state = window.history.state && typeof window.history.state === 'object' ? window.history.state : {};
      state[STATE_FLAG] = false;
      state.url = window.location.href;
      window.history.replaceState(state, '', window.location.href);
    }
  }

  window.addEventListener('popstate', function () {
    var href = window.location.href;
    if (documentKey(href) === initialKey) {
      hideFrame();
      return;
    }
    navigate(href, null);
  });

  window.addEventListener('pageshow', function (event) {
    if (event.persisted && active && frame) {
      frame.style.display = 'block';
      lockOuterDocument();
    }
  });

  window.__qilyPersistentNavigate = function (href) {
    navigate(href, 'push');
  };

  boot();
})(window, document);
