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
  var EDGE_GAP = 10;
  var prefetchedDocuments = Object.create(null);
  var restored = false;
  var restoring = false;
  var savedState = readState();

  ensureAudioPreload();

  /*
   * V5 is the single owner of the player. If an older page fragment created a
   * control before V5 ran, remove it. Older cores see the V5 audio element and
   * stop, so duplicate playback cannot occur.
   */
  document.querySelectorAll('#siteBackgroundMusic,#siteMusicMute,#siteMusicStyle').forEach(function (node) {
    if (node && node.parentNode) node.parentNode.removeChild(node);
  });

  var style = document.createElement('style');
  style.id = 'siteMusicStyle';
  style.textContent = [
    '.site-music-toggle{position:fixed;left:max(20px,env(safe-area-inset-left));top:max(17px,env(safe-area-inset-top));width:38px;height:38px;display:grid;place-items:center;padding:0;border:0;border-radius:50%;color:#0f4b5a;background:rgba(255,255,255,.96);box-shadow:0 5px 18px rgba(7,60,71,.22);cursor:grab;z-index:2147483000;touch-action:none;user-select:none;-webkit-user-select:none;transition:color .18s ease,background-color .18s ease,box-shadow .18s ease,scale .18s ease}',
    '.site-music-toggle:hover{color:#178b94;background:#fff;box-shadow:0 7px 22px rgba(7,60,71,.26);scale:1.05}',
    '.site-music-toggle:active{cursor:grabbing}',
    '.site-music-toggle:focus-visible{outline:3px solid rgba(23,139,148,.42);outline-offset:3px}',
    '.site-music-toggle svg{width:23px;height:23px;display:block;pointer-events:none}',
    '@media(max-width:760px){.site-music-toggle{left:max(10px,env(safe-area-inset-left));top:max(10px,env(safe-area-inset-top));width:36px;height:36px}}'
  ].join('');
  (document.head || document.documentElement).appendChild(style);

  var audio = document.createElement('audio');
  audio.id = 'siteBackgroundMusic';
  audio.src = AUDIO_SRC;
  audio.preload = 'auto';
  audio.autoplay = false;
  audio.loop = true;
  audio.volume = DEFAULT_VOLUME;
  audio.setAttribute('playsinline', '');
  audio.setAttribute('webkit-playsinline', '');
  audio.setAttribute('aria-hidden', 'true');
  try { audio.fetchPriority = 'high'; } catch (error) {}
  (document.body || document.documentElement).insertBefore(audio, (document.body || document.documentElement).firstChild);

  var button = document.createElement('button');
  button.id = 'siteMusicMute';
  button.className = 'site-music-toggle';
  button.type = 'button';
  (document.body || document.documentElement).appendChild(button);

  var speakerOn = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5Z"></path><path d="M15.5 8.5a5 5 0 0 1 0 7"></path><path d="M18 6a8.5 8.5 0 0 1 0 12"></path></svg>';
  var speakerOff = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5Z"></path><path d="m16 10 5 5"></path><path d="m21 10-5 5"></path></svg>';

  if (savedState) {
    audio.muted = Boolean(savedState.muted);
  }
  render();

  function ensureAudioPreload() {
    var preload = document.getElementById('qilyBackgroundMusicPreload');
    if (preload) {
      preload.href = AUDIO_SRC;
      return;
    }
    preload = document.createElement('link');
    preload.id = 'qilyBackgroundMusicPreload';
    preload.rel = 'preload';
    preload.as = 'audio';
    preload.type = 'audio/mpeg';
    preload.href = AUDIO_SRC;
    (document.head || document.documentElement).appendChild(preload);
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

  function statePayload() {
    return JSON.stringify({
      time: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
      muted: Boolean(audio.muted),
      playing: !audio.paused,
      savedAt: Date.now()
    });
  }

  function persistState(payload) {
    try { sessionStorage.setItem(STATE_KEY, payload); } catch (error) {}
    try { localStorage.setItem(STATE_KEY, payload); } catch (error) {}
  }

  function writeState() {
    /* Do not overwrite a valid prior position with the temporary 0s bootstrap. */
    if (!restored && savedState && Number(savedState.time || 0) > 1 && Number(audio.currentTime || 0) < 0.05) return;
    persistState(statePayload());
  }

  function targetTime() {
    if (!savedState || !Number.isFinite(Number(savedState.time))) return 0;
    var elapsed = savedState.playing && Number.isFinite(Number(savedState.savedAt))
      ? Math.max(0, (Date.now() - Number(savedState.savedAt)) / 1000)
      : 0;
    var target = Math.max(0, Number(savedState.time) + Math.min(elapsed, TRANSIT_COMPENSATION_CAP));
    if (Number.isFinite(audio.duration) && audio.duration > 0) target %= audio.duration;
    return target;
  }

  function playNow() {
    var result;
    try { result = audio.play(); } catch (error) { return Promise.reject(error); }
    return result && typeof result.then === 'function' ? result : Promise.resolve();
  }

  function fadeToVolume(target, duration) {
    if (audio.muted) {
      audio.volume = DEFAULT_VOLUME;
      return;
    }
    var started = performance.now();
    var from = Math.max(0, Number(audio.volume || 0));
    function frame(now) {
      var progress = Math.min(1, (now - started) / duration);
      audio.volume = from + (target - from) * progress;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function restorePlayback() {
    if (restored || restoring || audio.readyState < 1) return;
    restoring = true;
    var target = targetTime();
    try {
      if (target > 0.05) audio.currentTime = target;
    } catch (error) {}

    /*
     * V4 waited for seeked (up to 700 ms) before play(), which created an
     * avoidable silent break. V5 starts play immediately after assigning the
     * saved position; the preloaded same-origin audio supplies the requested
     * range while playback begins.
     */
    if (savedState && savedState.playing && !audio.muted) audio.volume = 0;
    playNow().then(function () {
      restored = true;
      restoring = false;
      fadeToVolume(DEFAULT_VOLUME, 160);
      writeState();
    }).catch(function () {
      restored = true;
      restoring = false;
      audio.volume = DEFAULT_VOLUME;
      writeState();
    });
  }

  if (audio.readyState >= 1) restorePlayback();
  else {
    audio.addEventListener('loadedmetadata', restorePlayback, { once: true });
    audio.addEventListener('durationchange', restorePlayback, { once: true });
    audio.addEventListener('canplay', restorePlayback, { once: true });
    try { audio.load(); } catch (error) {}
  }

  function render() {
    button.innerHTML = audio.muted ? speakerOff : speakerOn;
    button.setAttribute('aria-label', audio.muted ? '开启背景音乐' : '静音背景音乐');
    button.setAttribute('title', audio.muted ? '开启背景音乐' : '静音背景音乐');
    button.setAttribute('aria-pressed', audio.muted ? 'true' : 'false');
  }

  function resumeAfterGesture() {
    if (!restored) restorePlayback();
    if (audio.paused) {
      playNow().then(function () { fadeToVolume(DEFAULT_VOLUME, 120); writeState(); }).catch(function () {});
    }
  }

  button.addEventListener('click', function (event) {
    if (button.dataset.dragged === 'true') {
      button.dataset.dragged = 'false';
      event.preventDefault();
      return;
    }
    audio.muted = !audio.muted;
    if (audio.paused) resumeAfterGesture();
    render();
    writeState();
  });

  function prefetchDocument(href) {
    try {
      var url = new URL(href, location.href);
      url.hash = '';
      if (url.origin !== location.origin || url.href === location.href.split('#')[0] || prefetchedDocuments[url.href]) return;
      prefetchedDocuments[url.href] = true;
      var hint = document.createElement('link');
      hint.rel = 'prefetch';
      hint.as = 'document';
      hint.href = url.href;
      (document.head || document.documentElement).appendChild(hint);
    } catch (error) {}
  }

  function warmLinkedPage(event) {
    var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
    prefetchDocument(link.href);
  }

  ['/', '/ai.html', '/capabilities/', '/experience/', '/improvements/', '/knowledge/', '/moments/', '/links/', '/cooperation/'].forEach(prefetchDocument);
  document.addEventListener('pointerover', warmLinkedPage, { passive: true, capture: true });
  document.addEventListener('touchstart', warmLinkedPage, { passive: true, capture: true });
  document.addEventListener('focusin', warmLinkedPage, true);
  document.addEventListener('pointerdown', function (event) {
    var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!link) return;
    try { if (new URL(link.href, location.href).origin === location.origin) writeState(); } catch (error) {}
  }, true);
  document.addEventListener('click', function (event) {
    var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!link) return;
    try { if (new URL(link.href, location.href).origin === location.origin) writeState(); } catch (error) {}
  }, true);

  var drag = null;
  button.addEventListener('pointerdown', function (event) {
    if (event.button !== undefined && event.button !== 0) return;
    var rect = button.getBoundingClientRect();
    drag = { pointerId:event.pointerId, startX:event.clientX, startY:event.clientY, left:rect.left, top:rect.top, moved:false };
    if (button.setPointerCapture) button.setPointerCapture(event.pointerId);
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
    button.dataset.dragged = drag.moved ? 'true' : 'false';
    try { if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId); } catch (error) {}
    drag = null;
  }
  button.addEventListener('pointerup', finishDrag);
  button.addEventListener('pointercancel', finishDrag);

  function clamp(value, min, max) { return Math.min(Math.max(value, min), Math.max(min, max)); }
  function keepButtonInView() {
    var rect = button.getBoundingClientRect();
    button.style.left = clamp(rect.left, EDGE_GAP, window.innerWidth - rect.width - EDGE_GAP) + 'px';
    button.style.top = clamp(rect.top, EDGE_GAP, window.innerHeight - rect.height - EDGE_GAP) + 'px';
  }

  document.addEventListener('pointerdown', resumeAfterGesture, { once:true, capture:true });
  document.addEventListener('touchstart', resumeAfterGesture, { once:true, capture:true });
  document.addEventListener('keydown', resumeAfterGesture, { once:true, capture:true });
  window.addEventListener('resize', keepButtonInView, { passive:true });
  window.addEventListener('beforeunload', writeState);
  window.addEventListener('pagehide', writeState);
  window.addEventListener('pageshow', function () {
    if (!restored) restorePlayback();
    else if (audio.paused) resumeAfterGesture();
  });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') writeState();
  });
  window.setInterval(writeState, 400);
  window.__qilyLeanMusicWriteState = writeState;
})();
