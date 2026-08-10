(function () {
  'use strict';

  if (window.top !== window.self) return;
  if (window.__qilyLeanBackgroundMusicV5) return;
  window.__qilyLeanBackgroundMusicV5 = true;

  var AUDIO_SRC = '/%E6%88%91%E7%9A%84%E6%A2%A6%EF%BC%88%E5%BC%A0%E9%9D%93%E9%A2%96%EF%BC%89.mp3';
  var STATE_KEY = 'qilyleanBackgroundMusicStateV2';
  var DEFAULT_VOLUME = 0.36;
  var TRANSIT_COMPENSATION_CAP = 0.25;
  var DRAG_THRESHOLD = 5;
  var restoredPosition = false;
  var audioRequested = false;
  var gestureArmed = true;
  var savedState = readState();
  var manualPaused = savedState
    ? Boolean(savedState.manualPaused !== undefined ? savedState.manualPaused : savedState.muted)
    : false;

  removeAudioPreload();

  document.querySelectorAll('#siteBackgroundMusic,#siteMusicMute,#siteMusicStyle').forEach(function (node) {
    if (node && node.parentNode) node.parentNode.removeChild(node);
  });

  var audio = document.createElement('audio');
  audio.id = 'siteBackgroundMusic';
  audio.preload = 'none';
  audio.autoplay = false;
  audio.loop = true;
  audio.volume = DEFAULT_VOLUME;
  audio.muted = false;
  audio.setAttribute('playsinline', '');
  audio.setAttribute('webkit-playsinline', '');
  audio.setAttribute('aria-hidden', 'true');
  try { audio.fetchPriority = 'low'; } catch (error) {}
  (document.body || document.documentElement).insertBefore(audio, (document.body || document.documentElement).firstChild);

  var button = null;
  var drag = null;
  var speakerOn = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5Z"></path><path d="M15.5 8.5a5 5 0 0 1 0 7"></path><path d="M18 6a8.5 8.5 0 0 1 0 12"></path></svg>';
  var speakerOff = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5Z"></path><path d="m16 10 5 5"></path><path d="m21 10-5 5"></path></svg>';

  if (isHomePage()) createHomeControl();
  armBrowsingGestures();

  function isHomePage() {
    var path = (location.pathname || '/').replace(/\/{2,}/g, '/');
    return path === '/' || path === '/index.html';
  }

  function createHomeControl() {
    var style = document.createElement('style');
    style.id = 'siteMusicStyle';
    style.textContent = [
      '.site-music-toggle{position:fixed;left:max(20px,env(safe-area-inset-left));top:max(17px,env(safe-area-inset-top));width:38px;height:38px;display:grid;place-items:center;padding:0;border:0;border-radius:50%;color:#0f4b5a;background:rgba(255,255,255,.96);box-shadow:0 5px 18px rgba(7,60,71,.22);cursor:grab;z-index:2147483000;touch-action:none;user-select:none;-webkit-user-select:none;transition:left .24s cubic-bezier(.2,.8,.2,1),top .24s cubic-bezier(.2,.8,.2,1),color .18s ease,background-color .18s ease,box-shadow .18s ease,scale .18s ease}',
      '.site-music-toggle:hover{color:#178b94;background:#fff;box-shadow:0 7px 22px rgba(7,60,71,.26);scale:1.05}',
      '.site-music-toggle:active{cursor:grabbing}',
      '.site-music-toggle.is-dragging{transition:none!important;cursor:grabbing;scale:1.04}',
      '.site-music-toggle:focus-visible{outline:3px solid rgba(23,139,148,.42);outline-offset:3px}',
      '.site-music-toggle svg{width:23px;height:23px;display:block;pointer-events:none}',
      '@media(max-width:760px){.site-music-toggle{left:max(10px,env(safe-area-inset-left));top:max(10px,env(safe-area-inset-top));width:36px;height:36px}}'
    ].join('');
    (document.head || document.documentElement).appendChild(style);

    button = document.createElement('button');
    button.id = 'siteMusicMute';
    button.className = 'site-music-toggle';
    button.type = 'button';
    (document.body || document.documentElement).appendChild(button);
    render();

    button.addEventListener('click', function (event) {
      if (button.dataset.dragged === 'true') {
        button.dataset.dragged = 'false';
        event.preventDefault();
        return;
      }
      if (!audio.paused && !manualPaused) {
        manualPaused = true;
        audio.pause();
        render();
        writeState();
        return;
      }
      manualPaused = false;
      startPlayback(true);
    });

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
      if (button.setPointerCapture) button.setPointerCapture(event.pointerId);
    });

    button.addEventListener('pointermove', function (event) {
      if (!drag || event.pointerId !== drag.pointerId) return;
      var dx = event.clientX - drag.startX;
      var dy = event.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      drag.moved = true;
      button.classList.add('is-dragging');
      var rect = button.getBoundingClientRect();
      button.style.left = clamp(drag.left + dx, 8, window.innerWidth - rect.width - 8) + 'px';
      button.style.top = clamp(drag.top + dy, 8, window.innerHeight - rect.height - 8) + 'px';
    });

    function finishDrag(event) {
      if (!drag || event.pointerId !== drag.pointerId) return;
      button.dataset.dragged = drag.moved ? 'true' : 'false';
      try {
        if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId);
      } catch (error) {}
      drag = null;
      button.classList.remove('is-dragging');
      if (button.dataset.dragged === 'true') snapControlHome();
    }

    button.addEventListener('pointerup', finishDrag);
    button.addEventListener('pointercancel', finishDrag);
    window.addEventListener('resize', snapControlHome, { passive: true });
  }

  function snapControlHome() {
    if (!button) return;
    requestAnimationFrame(function () {
      button.style.left = '';
      button.style.top = '';
    });
  }

  function removeAudioPreload() {
    var preload = document.getElementById('qilyBackgroundMusicPreload');
    if (preload && preload.parentNode) preload.parentNode.removeChild(preload);
  }

  function ensureAudioSource() {
    if (audioRequested) return;
    audioRequested = true;
    audio.src = AUDIO_SRC;
    audio.preload = 'metadata';
    audio.addEventListener('loadedmetadata', applySavedPosition, { once: true });
  }

  function readStored(storage) {
    try {
      var value = JSON.parse(storage.getItem(STATE_KEY) || 'null');
      return value && typeof value === 'object' ? value : null;
    } catch (error) {
      return null;
    }
  }

  function readState() {
    var candidates = [];
    var sessionSaved = readStored(sessionStorage);
    var localSaved = readStored(localStorage);
    if (sessionSaved) candidates.push(sessionSaved);
    if (localSaved) candidates.push(localSaved);
    if (!candidates.length) return null;
    candidates.sort(function (a, b) { return Number(b.savedAt || 0) - Number(a.savedAt || 0); });
    return candidates[0];
  }

  function targetTime() {
    if (!savedState || !Number.isFinite(Number(savedState.time))) return 0;
    var elapsed = savedState.playing && !manualPaused && Number.isFinite(Number(savedState.savedAt))
      ? Math.max(0, (Date.now() - Number(savedState.savedAt)) / 1000)
      : 0;
    var target = Math.max(0, Number(savedState.time) + Math.min(elapsed, TRANSIT_COMPENSATION_CAP));
    if (Number.isFinite(audio.duration) && audio.duration > 0) target %= audio.duration;
    return target;
  }

  function applySavedPosition() {
    if (restoredPosition) return;
    restoredPosition = true;
    var target = targetTime();
    if (target <= 0.05) return;
    try { audio.currentTime = target; } catch (error) {}
  }

  function statePayload() {
    return JSON.stringify({
      time: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
      muted: false,
      manualPaused: Boolean(manualPaused),
      playing: !audio.paused && !manualPaused,
      savedAt: Date.now()
    });
  }

  function persistState(payload) {
    try { sessionStorage.setItem(STATE_KEY, payload); } catch (error) {}
    try { localStorage.setItem(STATE_KEY, payload); } catch (error) {}
  }

  function writeState() {
    if (!restoredPosition && savedState && Number(savedState.time || 0) > 1 && Number(audio.currentTime || 0) < 0.05) return;
    persistState(statePayload());
  }

  function playNow() {
    var result;
    ensureAudioSource();
    audio.muted = false;
    if (audio.readyState >= 1) applySavedPosition();
    try { result = audio.play(); } catch (error) { return Promise.reject(error); }
    return result && typeof result.then === 'function' ? result : Promise.resolve();
  }

  function startPlayback(fromControl) {
    if (!fromControl && manualPaused) return;
    if (fromControl) manualPaused = false;
    if (!audio.paused && !manualPaused) {
      disarmBrowsingGestures();
      render();
      return;
    }
    playNow().then(function () {
      gestureArmed = false;
      disarmBrowsingGestures();
      render();
      writeState();
    }).catch(function () {
      render();
    });
  }

  function render() {
    if (!button) return;
    var enabled = !audio.paused && !manualPaused;
    button.innerHTML = enabled ? speakerOn : speakerOff;
    button.setAttribute('aria-label', enabled ? '暂停背景音乐' : '播放背景音乐');
    button.setAttribute('title', enabled ? '暂停背景音乐' : '播放背景音乐');
    button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
  }

  function gestureStart(event) {
    if (!gestureArmed || manualPaused || (!audio.paused && audioRequested)) return;
    if (button && event && event.target && button.contains(event.target)) return;
    startPlayback(false);
  }

  function keyGesture(event) {
    if (!event) return;
    if (!/^(ArrowUp|ArrowDown|PageUp|PageDown|Home|End| |Spacebar)$/.test(event.key || '')) return;
    gestureStart(event);
  }

  function armBrowsingGestures() {
    document.addEventListener('pointerdown', gestureStart, true);
    document.addEventListener('mousedown', gestureStart, true);
    document.addEventListener('touchstart', gestureStart, { capture: true, passive: true });
    document.addEventListener('wheel', gestureStart, { capture: true, passive: true });
    document.addEventListener('scroll', gestureStart, { capture: true, passive: true });
    document.addEventListener('keydown', keyGesture, true);
  }

  function disarmBrowsingGestures() {
    document.removeEventListener('pointerdown', gestureStart, true);
    document.removeEventListener('mousedown', gestureStart, true);
    document.removeEventListener('touchstart', gestureStart, true);
    document.removeEventListener('wheel', gestureStart, true);
    document.removeEventListener('scroll', gestureStart, true);
    document.removeEventListener('keydown', keyGesture, true);
  }

  document.addEventListener('pointerdown', function (event) {
    var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!link) return;
    try {
      if (new URL(link.href, location.href).origin === location.origin) writeState();
    } catch (error) {}
  }, true);

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), Math.max(min, max));
  }

  audio.addEventListener('play', render);
  audio.addEventListener('pause', render);
  window.addEventListener('beforeunload', writeState);
  window.addEventListener('pagehide', writeState);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') writeState();
  });
  audio.addEventListener('timeupdate', writeState, { passive: true });
  window.setInterval(function () {
    if (audioRequested && !audio.paused) writeState();
  }, 5000);

  window.__qilyLeanMusicWriteState = writeState;
})();
