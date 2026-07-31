(function () {
  'use strict';

  var config = window.__QILY_EVIDENCE_PREVIEW__ || {};
  var root = document.getElementById('evidencePreviewPages');
  var status = document.getElementById('evidencePreviewStatus');

  function lockPage() {
    ['contextmenu', 'dragstart', 'selectstart', 'copy'].forEach(function (eventName) {
      document.addEventListener(eventName, function (event) {
        event.preventDefault();
      }, { passive: false });
    });

    document.addEventListener('keydown', function (event) {
      var key = String(event.key || '').toLowerCase();
      if (key === 'f12' || ((event.ctrlKey || event.metaKey) && ['s', 'p', 'u', 'c', 'a'].indexOf(key) >= 0)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);
  }

  function readChunk(path) {
    return fetch(path, { cache: 'force-cache' }).then(function (response) {
      if (!response.ok) throw new Error('资料分片加载失败：' + path);
      return response.text();
    });
  }

  function drawStrip(strip, index) {
    var card = document.createElement('section');
    card.className = 'evidence-preview-sheet';
    card.setAttribute('aria-label', '资料预览第' + (index + 1) + '组');

    var loading = document.createElement('div');
    loading.className = 'evidence-preview-loading';
    loading.textContent = '正在加载资料…';
    card.appendChild(loading);

    var canvas = document.createElement('canvas');
    canvas.className = 'evidence-preview-canvas';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', strip.alt || config.title || '项目佐证资料');
    card.appendChild(canvas);
    root.appendChild(card);

    return Promise.all(strip.chunks.map(readChunk)).then(function (parts) {
      return new Promise(function (resolve, reject) {
        var image = new Image();
        image.onload = function () {
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          var context = canvas.getContext('2d', { alpha: false });
          context.fillStyle = '#fff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0);
          card.classList.add('is-loaded');
          loading.remove();
          resolve();
        };
        image.onerror = function () {
          reject(new Error('资料图像解析失败'));
        };
        image.src = 'data:image/webp;base64,' + parts.join('').replace(/\s+/g, '');
      });
    });
  }

  function start() {
    lockPage();
    if (!root || !Array.isArray(config.strips) || !config.strips.length) {
      if (status) status.textContent = '暂无可预览资料。';
      return;
    }

    Promise.all(config.strips.map(drawStrip)).then(function () {
      if (status) status.textContent = '资料已加载，可直接在浏览器中向下连续查看。';
    }).catch(function (error) {
      if (status) status.textContent = '资料加载失败，请刷新页面后重试。';
      console.error(error);
    });
  }

  start();
}());
