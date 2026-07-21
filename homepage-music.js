(function () {
  'use strict';

  if (document.getElementById('homeBackgroundMusic')) return;

  var topbar = document.querySelector('.topbar');
  if (!topbar) return;

  var style = document.createElement('style');
  style.id = 'homeMusicStyle';
  style.textContent =
    '.home-music-toggle{' +
    'position:absolute;left:clamp(10px,1.15vw,20px);top:50%;transform:translateY(-50%);' +
    'width:34px;height:34px;display:grid;place-items:center;padding:0;border:0;border-radius:50%;' +
    'color:#0f4b5a;background:transparent;cursor:pointer;z-index:2;' +
    'transition:color .2s ease,background-color .2s ease,transform .2s ease}' +
    '.home-music-toggle:hover{color:#178b94;background:rgba(23,139,148,.1);transform:translateY(-50%) scale(1.05)}' +
    '.home-music-toggle:focus-visible{outline:2px solid #178b94;outline-offset:2px}' +
    '.home-music-toggle svg{width:22px;height:22px;display:block}' +
    '@media(max-width:760px){.topbar{position:relative}.home-music-toggle{left:10px;top:30px}.brand{padding-left:30px}}';
  document.head.appendChild(style);

  var audio = document.createElement('audio');
  audio.id = 'homeBackgroundMusic';
  audio.src = '/%E6%88%91%E7%9A%84%E6%A2%A6%EF%BC%88%E5%BC%A0%E9%9D%93%E9%A2%96%EF%BC%89.mp3';
  audio.preload = 'auto';
  audio.autoplay = true;
  audio.loop = true;
  audio.volume = 0.36;
  audio.setAttribute('playsinline', '');
  audio.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(audio, document.body.firstChild);

  var button = document.createElement('button');
  button.id = 'homeMusicMute';
  button.className = 'home-music-toggle';
  button.type = 'button';
  topbar.insertBefore(button, topbar.firstChild);

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

  function render() {
    var muted = audio.muted;
    button.innerHTML = muted ? speakerOff : speakerOn;
    button.setAttribute('aria-label', muted ? '开启背景音乐' : '静音背景音乐');
    button.setAttribute('title', muted ? '开启背景音乐' : '静音背景音乐');
    button.setAttribute('aria-pressed', muted ? 'true' : 'false');
  }

  function tryPlay() {
    var playResult = audio.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {});
    }
  }

  button.addEventListener('click', function () {
    audio.muted = !audio.muted;
    if (audio.paused) tryPlay();
    render();
  });

  function resumeAfterFirstGesture() {
    if (audio.paused) tryPlay();
  }

  document.addEventListener('pointerdown', resumeAfterFirstGesture, { once: true, capture: true });
  document.addEventListener('touchstart', resumeAfterFirstGesture, { once: true, capture: true });
  document.addEventListener('keydown', resumeAfterFirstGesture, { once: true, capture: true });
  window.addEventListener('pageshow', function () {
    if (!audio.muted && audio.paused) tryPlay();
  });
  window.addEventListener('pagehide', function () {
    audio.pause();
  });

  render();
  tryPlay();
})();
