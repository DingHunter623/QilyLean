(function () {
  'use strict';

  /*
   * Background music only.
   * Navigation is intentionally left to native browser links so every page
   * keeps one clear document lifecycle and cannot create nested frames.
   */
  if (window.top !== window.self) return;
  if (document.getElementById('siteBackgroundMusic')) return;

  var DEFAULT_VOLUME = 0.36;
  var STATE_KEY = 'qilyleanBackgroundMusicStateV2';
  var DRAG_THRESHOLD = 5;
  var EDGE_GAP = 10;
  var AUDIO_SRC = '/%E6%88%91%E7%9A%84%E6%A2%A6%EF%BC%88%E5%BC%A0%E9%9D%93%E9%A2%96%EF%BC%89.mp3';
  var MODULE_ROUTES = ['/', '/ai.html', '/capabilities/', '/experience/', '/improvements/', '/knowledge/', '/moments.html'];
  var prefetchedDocuments = Object.create(null);

  function enableProjectPresentation() {
    if (!/^\/projects(?:\/|$)/.test(location.pathname || '')) return;
    var version = '20260728-project-media-cards-v5';
    var stylesheet = document.querySelector('link[href*="/projects/project-pages.css"]');
    if (stylesheet) stylesheet.href = '/projects/project-pages.css?v=' + version;
    else {
      stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = '/projects/project-pages.css?v=' + version;
      document.head.appendChild(stylesheet);
    }
    if (!document.querySelector('script[src*="/projects/project-image-viewer.js"]')) {
      var viewer = document.createElement('script');
      viewer.id = 'qilyProjectImageViewerScript';
      viewer.src = '/projects/project-image-viewer.js?v=' + version;
      document.body.appendChild(viewer);
    }
  }

  enableProjectPresentation();

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
    '@media(max-width:760px){.site-music-toggle{left:max(10px,env(safe-area-inset-left));top:max(10px,env(safe-area-inset-top));width:36px;height:36px}}';
  document.head.appendChild(style);

  var audio = document.createElement('audio');
  audio.id = 'siteBackgroundMusic';
  audio.src = AUDIO_SRC;
  audio.preload = 'auto';
  audio.autoplay = false;
  try { audio.fetchPriority = 'high'; } catch (error) {}
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

  function tryPlay() {
    var result = audio.play();
    if (result && typeof result.catch === 'function') result.catch(function () {});
  }

  function render() {
    button.innerHTML = audio.muted ? speakerOff : speakerOn;
    button.setAttribute('aria-label', audio.muted ? '开启背景音乐' : '静音背景音乐');
    button.setAttribute('title', audio.muted ? '开启背景音乐' : '静音背景音乐');
    button.setAttribute('aria-pressed', audio.muted ? 'true' : 'false');
  }

  function prefetchDocument(href) {
    try {
      var url = new URL(href, location.href);
      url.hash = '';
      if (url.origin !== location.origin || url.href === location.href.split('#')[0]) return;
      if (prefetchedDocuments[url.href]) return;
      prefetchedDocuments[url.href] = true;
      var hint = document.createElement('link');
      hint.rel = 'prefetch';
      hint.as = 'document';
      hint.href = url.href;
      document.head.appendChild(hint);
    } catch (error) {}
  }

  function warmLinkedPage(event) {
    var target = event.target;
    var link = target && target.closest ? target.closest('a[href]') : null;
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
    prefetchDocument(link.href);
  }

  function warmModuleRoutes() {
    MODULE_ROUTES.forEach(prefetchDocument);
  }

  document.addEventListener('pointerover', warmLinkedPage, { passive: true, capture: true });
  document.addEventListener('touchstart', warmLinkedPage, { passive: true, capture: true });
  document.addEventListener('focusin', warmLinkedPage, true);
  document.addEventListener('click', function (event) {
    var target = event.target;
    var link = target && target.closest ? target.closest('a[href]') : null;
    if (!link) return;
    try {
      if (new URL(link.href, location.href).origin === location.origin) writeState();
    } catch (error) {}
  }, true);

  if ('requestIdleCallback' in window) requestIdleCallback(warmModuleRoutes, { timeout: 1200 });
  else setTimeout(warmModuleRoutes, 650);

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

  function startPlayback() {
    restorePlaybackPosition();
    tryPlay();
  }

  if (audio.readyState >= 1) startPlayback();
  else audio.addEventListener('loadedmetadata', startPlayback, { once: true });

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), Math.max(min, max));
  }

  function keepButtonInView() {
    var rect = button.getBoundingClientRect();
    button.style.left = clamp(rect.left, EDGE_GAP, window.innerWidth - rect.width - EDGE_GAP) + 'px';
    button.style.top = clamp(rect.top, EDGE_GAP, window.innerHeight - rect.height - EDGE_GAP) + 'px';
  }

  var drag = null;
  var suppressClick = false;

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

  function resumeAfterGesture() {
    if (audio.paused) tryPlay();
  }

  document.addEventListener('pointerdown', resumeAfterGesture, { once: true, capture: true });
  document.addEventListener('touchstart', resumeAfterGesture, { once: true, capture: true });
  document.addEventListener('keydown', resumeAfterGesture, { once: true, capture: true });
  window.addEventListener('resize', keepButtonInView);
  window.addEventListener('beforeunload', writeState);
  window.addEventListener('pagehide', writeState);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') writeState();
  });
  window.addEventListener('pageshow', function () {
    if (!audio.muted && audio.paused) tryPlay();
  });
  window.setInterval(writeState, 400);
  window.__qilyLeanMusicWriteState = writeState;

  render();
})();
