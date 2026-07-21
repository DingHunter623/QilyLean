(function () {
  'use strict';

  if (window.top !== window.self) return;
  if (document.getElementById('siteBackgroundMusic')) return;

  var DEFAULT_VOLUME = 0.36;
  var STATE_KEY = 'qilyleanBackgroundMusicStateV2';
  var DRAG_THRESHOLD = 5;
  var EDGE_GAP = 10;

  var style = document.createElement('style');
  style.id = 'siteMusicStyle';
  style.textContent =
    '.site-music-toggle{' +
    'position:fixed;left:max(20px,env(safe-area-inset-left));top:max(17px,env(safe-area-inset-top));' +
    'width:38px;height:38px;display:grid;place-items:center;padding:0;border:0;border-radius:50%;' +
    'color:#0f4b5a;background:rgba(255,255,255,.92);box-shadow:0 5px 18px rgba(7,60,71,.16);' +
    'cursor:grab;z-index:2147483000;touch-action:none;user-select:none;-webkit-user-select:none;' +
    'transition:color .2s ease,background-color .2s ease,box-shadow .2s ease,scale .2s ease}' +
    '.site-music-toggle:hover{color:#178b94;background:#fff;box-shadow:0 7px 22px rgba(7,60,71,.24);scale:1.05}' +
    '.site-music-toggle:active{cursor:grabbing}' +
    '.site-music-toggle:focus-visible{outline:2px solid #178b94;outline-offset:2px}' +
    '.site-music-toggle svg{width:23px;height:23px;display:block;pointer-events:none}' +
    '.qilylean-module-frame{position:fixed;inset:0;width:100%;height:100%;border:0;background:#f3faf9;' +
    'z-index:2147482000;display:block}' +
    '@media(max-width:760px){.site-music-toggle{left:max(10px,env(safe-area-inset-left));top:max(10px,env(safe-area-inset-top));width:36px;height:36px}}';
  document.head.appendChild(style);

  var audio = document.createElement('audio');
  audio.id = 'siteBackgroundMusic';
  audio.src = '/%E6%88%91%E7%9A%84%E6%A2%A6%EF%BC%88%E5%BC%A0%E9%9D%93%E9%A2%96%EF%BC%89.mp3';
  audio.preload = 'auto';
  audio.autoplay = true;
  audio.loop = true;
  audio.volume = DEFAULT_VOLUME;
  audio.setAttribute('playsinline', '');
  audio.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(audio, document.body.firstChild);

  var button = document.createElement('button');
  button.id = 'siteMusicMute';
  button.className = 'site-music-toggle';
  button.type = 'button';
  document.body.appendChild(button);

  var speakerOn =
    '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M11 5 6 9H3v6h3l5 4V5Z"></path>' +
    '<path d="M15.5 8.5a5 5 0 0 1 0 7"></path>' +
    '<path d="M18 6a8.5 8.5 0 0 1 0 12"></path>' +
    '</svg>';
  var speakerOff =
    '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M11 5 6 9H3v6h3l5 4V5Z"></path>' +
    '<path d="m16 10 5 5"></path><path d="m21 10-5 5"></path>' +
    '</svg>';

  function readState() {
    try {
      var saved = JSON.parse(sessionStorage.getItem(STATE_KEY) || 'null');
      return saved && typeof saved === 'object' ? saved : null;
    } catch (error) {
      return null;
    }
  }

  function writeState() {
    try {
      sessionStorage.setItem(STATE_KEY, JSON.stringify({
        time: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
        muted: audio.muted,
        playing: !audio.paused,
        savedAt: Date.now()
      }));
    } catch (error) {}
  }

  function render() {
    button.innerHTML = audio.muted ? speakerOff : speakerOn;
    button.setAttribute('aria-label', audio.muted ? '开启背景音乐' : '静音背景音乐');
    button.setAttribute('title', audio.muted ? '开启背景音乐' : '静音背景音乐');
    button.setAttribute('aria-pressed', audio.muted ? 'true' : 'false');
  }

  function tryPlay() {
    var playResult = audio.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {});
    }
  }

  var savedState = readState();
  if (savedState) audio.muted = Boolean(savedState.muted);

  function restorePlaybackPosition() {
    if (!savedState || !Number.isFinite(savedState.time)) return;
    var elapsed = savedState.playing && Number.isFinite(savedState.savedAt)
      ? Math.max(0, (Date.now() - savedState.savedAt) / 1000)
      : 0;
    var nextTime = Math.max(0, savedState.time + elapsed);
    if (Number.isFinite(audio.duration) && audio.duration > 0) nextTime %= audio.duration;
    try { audio.currentTime = nextTime; } catch (error) {}
  }

  audio.addEventListener('loadedmetadata', function () {
    restorePlaybackPosition();
    tryPlay();
  }, { once: true });

  var drag = null;
  var suppressClick = false;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), Math.max(min, max));
  }

  function keepButtonInView() {
    var rect = button.getBoundingClientRect();
    button.style.left = clamp(rect.left, EDGE_GAP, window.innerWidth - rect.width - EDGE_GAP) + 'px';
    button.style.top = clamp(rect.top, EDGE_GAP, window.innerHeight - rect.height - EDGE_GAP) + 'px';
  }

  button.addEventListener('pointerdown', function (event) {
    if (event.button !== undefined && event.button !== 0) return;
    var rect = button.getBoundingClientRect();
    drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      left: rect.left,
      top: rect.top,
      moved: false
    };
    button.setPointerCapture(event.pointerId);
  });

  button.addEventListener('pointermove', function (event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    var dx = event.clientX - drag.startX;
    var dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    drag.moved = true;
    var rect = button.getBoundingClientRect();
    button.style.left = clamp(drag.left + dx, EDGE_GAP, window.innerWidth - rect.width - EDGE_GAP) + 'px';
    button.style.top = clamp(drag.top + dy, EDGE_GAP, window.innerHeight - rect.height - EDGE_GAP) + 'px';
  });

  function finishDrag(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    suppressClick = drag.moved;
    if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId);
    drag = null;
  }

  button.addEventListener('pointerup', finishDrag);
  button.addEventListener('pointercancel', finishDrag);
  button.addEventListener('click', function (event) {
    if (suppressClick) {
      suppressClick = false;
      event.preventDefault();
      return;
    }
    audio.muted = !audio.muted;
    if (audio.paused) tryPlay();
    render();
    writeState();
  });

  function resumeAfterFirstGesture() {
    if (audio.paused) tryPlay();
  }

  function installPersistentNavigation() {
    var shellUrl = new URL(window.location.href);
    var shellTitle = document.title;
    var moduleFrame = null;
    var htmlOverflow = document.documentElement.style.overflow;
    var bodyOverflow = document.body.style.overflow;
    var prefetchedDocuments = Object.create(null);

    function urlPath(url) {
      return url.pathname + url.search + url.hash;
    }

    function prefetchDocument(url) {
      if (url.origin !== shellUrl.origin || url.hash || prefetchedDocuments[url.href]) return;
      prefetchedDocuments[url.href] = true;
      var link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'document';
      link.href = url.href;
      document.head.appendChild(link);
    }

    function handleNavigationIntent(event, doc) {
      var target = event.target;
      var link = target && target.closest ? target.closest('a[href]') : null;
      if (!link) return;
      try { prefetchDocument(new URL(link.href, doc.defaultView.location.href)); } catch (error) {}
    }

    function sameDocument(a, b) {
      return a.origin === b.origin && a.pathname === b.pathname && a.search === b.search;
    }

    function isHomeUrl(url) {
      if (url.origin !== shellUrl.origin) return false;
      var path = url.pathname.replace(/\/+$/, '') || '/';
      return path === '/' || path === '/index.html' ||
        path === '/qilylean/home.html' || path === '/qilylean/home-live.html';
    }

    function isProjectsUrl(url) {
      if (url.origin !== shellUrl.origin) return false;
      var path = url.pathname.replace(/\/+$/, '') || '/';
      return path === '/projects' || path === '/projects/index.html';
    }

    function restoresShellHome(url) {
      return isHomeUrl(shellUrl) && isHomeUrl(url);
    }

    function restoresShellProjects(url) {
      return isHomeUrl(shellUrl) && isProjectsUrl(url);
    }

    function shellScrollTarget(url) {
      if (!restoresShellProjects(url)) return url;
      var target = new URL(shellUrl.href);
      target.hash = 'projects';
      return target;
    }

    function scrollDocument(doc, url) {
      var view = doc.defaultView;
      view.requestAnimationFrame(function () {
        if (url.hash) {
          var id = url.hash.slice(1);
          try { id = decodeURIComponent(id); } catch (error) {}
          var target = doc.getElementById(id);
          if (target) target.scrollIntoView({ block: 'start' });
        } else {
          view.scrollTo(0, 0);
        }
      });
    }

    function shellState() {
      return { qilyLeanShell: true, qilyLeanShellUrl: shellUrl.href };
    }

    function moduleState(url) {
      return {
        qilyLeanShell: true,
        qilyLeanShellUrl: shellUrl.href,
        qilyLeanModuleUrl: url.href
      };
    }

    try {
      var initialState = Object.assign({}, history.state || {}, shellState());
      history.replaceState(initialState, '', urlPath(shellUrl));
    } catch (error) {}

    function bindIframe(iframe) {
      if (!iframe || iframe.__qilyLeanPersistentBound) return;
      iframe.__qilyLeanPersistentBound = true;

      function bindContents() {
        try { bindDocument(iframe.contentDocument); } catch (error) {}
      }

      iframe.addEventListener('load', bindContents);
      bindContents();
    }

    function closeModule(url, pushHistory) {
      if (moduleFrame) {
        moduleFrame.remove();
        moduleFrame = null;
      }
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
      document.title = shellTitle;
      if (pushHistory) {
        try { history.pushState(shellState(), '', urlPath(url)); } catch (error) {}
      }
      scrollDocument(document, shellScrollTarget(url));
    }

    function ensureModuleFrame() {
      if (moduleFrame) return moduleFrame;
      moduleFrame = document.createElement('iframe');
      moduleFrame.id = 'qilyLeanModuleFrame';
      moduleFrame.className = 'qilylean-module-frame';
      moduleFrame.title = 'QilyLean 模块内容';
      moduleFrame.setAttribute('aria-label', 'QilyLean 模块内容');
      moduleFrame.addEventListener('load', function () {
        try {
          bindDocument(moduleFrame.contentDocument);
          if (moduleFrame.contentDocument.title) document.title = moduleFrame.contentDocument.title;
        } catch (error) {}
      });
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.appendChild(moduleFrame);
      return moduleFrame;
    }

    function openModule(url, pushHistory) {
      if (sameDocument(url, shellUrl) || restoresShellHome(url) || restoresShellProjects(url)) {
        closeModule(url, pushHistory);
        return;
      }

      var frame = ensureModuleFrame();
      if (pushHistory) {
        try { history.pushState(moduleState(url), '', urlPath(url)); } catch (error) {}
      }
      frame.src = url.href;
    }

    function handleSameDocument(doc, url, pushHistory) {
      var view = doc.defaultView;
      if (doc === document) {
        if (pushHistory) {
          try { history.pushState(shellState(), '', urlPath(url)); } catch (error) {}
        }
        scrollDocument(doc, url);
        return;
      }

      try {
        if (url.hash) view.history.pushState(null, '', urlPath(url));
        scrollDocument(doc, url);
        if (pushHistory) history.pushState(moduleState(url), '', urlPath(url));
      } catch (error) {}
    }

    function handleLink(event, doc) {
      if (event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      var target = event.target;
      var link = target && target.closest ? target.closest('a[href]') : null;
      if (!link || link.hasAttribute('download')) return;
      if ((link.getAttribute('target') || '').toLowerCase() === '_blank') return;

      var view = doc.defaultView;
      var url;
      var current;
      try {
        url = new URL(link.href, view.location.href);
        current = doc === document && !moduleFrame ? shellUrl : new URL(view.location.href);
      } catch (error) {
        return;
      }
      if (url.origin !== shellUrl.origin || !/^https?:$/.test(url.protocol)) return;

      var same = sameDocument(url, current);
      var targetsTop = (link.getAttribute('target') || '').toLowerCase() === '_top';
      if (same && doc !== document && !targetsTop) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      if (same) {
        handleSameDocument(doc, url, true);
      } else {
        openModule(url, true);
      }
    }

    function handleFloatingHome(event) {
      var target = event.target;
      var button = target && target.closest ? target.closest('.float-home,[data-a="home"]') : null;
      if (!button) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      openModule(new URL('/', shellUrl.origin), true);
    }

    function bindDocument(doc) {
      if (!doc || !doc.documentElement || doc.__qilyLeanPersistentBound) return;
      doc.__qilyLeanPersistentBound = true;
      doc.addEventListener('click', function (event) { handleLink(event, doc); }, true);
      doc.addEventListener('pointerup', handleFloatingHome, true);
      doc.addEventListener('pointerover', function (event) { handleNavigationIntent(event, doc); }, { capture: true, passive: true });
      doc.addEventListener('touchstart', function (event) { handleNavigationIntent(event, doc); }, { capture: true, passive: true });
      Array.prototype.forEach.call(doc.querySelectorAll('iframe'), bindIframe);

      try {
        var Observer = doc.defaultView.MutationObserver;
        var observer = new Observer(function (records) {
          records.forEach(function (record) {
            Array.prototype.forEach.call(record.addedNodes, function (node) {
              if (!node || node.nodeType !== 1) return;
              if (node.tagName === 'IFRAME') bindIframe(node);
              Array.prototype.forEach.call(node.querySelectorAll ? node.querySelectorAll('iframe') : [], bindIframe);
            });
          });
        });
        observer.observe(doc.documentElement, { childList: true, subtree: true });
      } catch (error) {}
    }

    window.addEventListener('popstate', function (event) {
      var state = event.state || {};
      if (state.qilyLeanModuleUrl) {
        try { openModule(new URL(state.qilyLeanModuleUrl), false); } catch (error) {}
      } else {
        closeModule(new URL(window.location.href), false);
      }
    });

    window.QilyLeanNavigate = function (href) {
      try { openModule(new URL(href, shellUrl.origin), true); } catch (error) {}
    };

    bindDocument(document);

    var warmModules = function () {
      ['/ai.html', '/knowledge.html', '/projects/'].forEach(function (href) {
        prefetchDocument(new URL(href, shellUrl.origin));
      });
    };
    if ('requestIdleCallback' in window) window.requestIdleCallback(warmModules, { timeout: 1800 });
    else window.setTimeout(warmModules, 900);
  }

  document.addEventListener('pointerdown', resumeAfterFirstGesture, { once: true, capture: true });
  document.addEventListener('touchstart', resumeAfterFirstGesture, { once: true, capture: true });
  document.addEventListener('keydown', resumeAfterFirstGesture, { once: true, capture: true });
  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    try {
      var url = new URL(link.href, location.href);
      if (url.origin === location.origin) writeState();
    } catch (error) {}
  }, true);
  window.addEventListener('resize', keepButtonInView);
  window.addEventListener('pageshow', function () {
    if (!audio.muted && audio.paused) tryPlay();
  });
  window.addEventListener('pagehide', writeState);
  window.setInterval(writeState, 1000);

  installPersistentNavigation();
  render();
  restorePlaybackPosition();
  tryPlay();
})();
