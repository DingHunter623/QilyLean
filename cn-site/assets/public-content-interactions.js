(function () {
  'use strict';

  var roots = Array.prototype.slice.call(document.querySelectorAll('.mirror-article-fidelity, article.mirror-article'));
  if (!roots.length || window.__qilyCnPublicContentInteractions) return;
  window.__qilyCnPublicContentInteractions = true;

  function insideContent(node) {
    return node && roots.some(function (root) { return root.contains(node); });
  }
  function contentNodes(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector)).filter(insideContent);
  }
  function text(node) { return String(node && node.textContent || '').replace(/\s+/g, ' ').trim(); }
  function localUrl(value) {
    if (!value) return '';
    try {
      var url = new URL(value, location.href);
      return /^https?:$/.test(url.protocol) && url.origin === location.origin ? url.href : '';
    } catch (error) { return ''; }
  }
  function copy(value) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(value);
    return new Promise(function (resolve, reject) {
      var previous = document.activeElement;
      var input = document.createElement('textarea');
      input.value = value;
      input.setAttribute('readonly', '');
      input.className = 'qily-public-copy-buffer';
      document.body.appendChild(input);
      input.select();
      try { document.execCommand('copy') ? resolve() : reject(new Error('copy')); }
      catch (error) { reject(error); }
      input.remove();
      if (previous && typeof previous.focus === 'function') previous.focus();
    });
  }
  function status(trigger, message) {
    var region = trigger.closest('.share-row, .tool-actions, .app-share-inline') || trigger.parentElement;
    var output = region && region.querySelector('.share-status, #copyStatus, [data-public-status]');
    if (!output && region) {
      output = document.createElement('span');
      output.className = 'qily-public-content-status';
      output.setAttribute('data-public-status', '');
      output.setAttribute('role', 'status');
      region.appendChild(output);
    }
    if (output) {
      output.setAttribute('aria-live', 'polite');
      output.textContent = message;
    }
  }
  function pageLink(trigger) {
    var url = new URL(location.href);
    var target = trigger.getAttribute('data-target');
    if (target) url.hash = target.replace(/^#/, '');
    return url.href;
  }
  async function share(trigger) {
    var title = trigger.getAttribute('data-title') || document.title;
    var url = pageLink(trigger);
    if (navigator.share) {
      try { await navigator.share({ title: title, url: url }); status(trigger, '已分享'); return; }
      catch (error) { if (error && error.name === 'AbortError') return; }
    }
    try { await copy(title + '\n' + url); status(trigger, '标题及网址已复制'); }
    catch (error) { status(trigger, '复制失败，请从地址栏复制本页网址。'); }
  }

  var previews = contentNodes('button[data-plan-preview], button.preview-open');
  var viewer = null;
  var active = -1;
  var zoom = 1;
  var previousFocus = null;
  function createViewer() {
    if (viewer) return;
    viewer = document.createElement('div');
    viewer.className = 'qily-public-preview';
    viewer.hidden = true;
    viewer.innerHTML = '<section class="qily-public-preview-panel" role="dialog" aria-modal="true" aria-labelledby="qilyPublicPreviewTitle">' +
      '<div class="qily-public-preview-toolbar"><h2 id="qilyPublicPreviewTitle"></h2>' +
      '<div class="qily-public-preview-controls"><button type="button" data-preview-action="previous" aria-label="上一张预览">上一张</button>' +
      '<button type="button" data-preview-action="next" aria-label="下一张预览">下一张</button>' +
      '<button type="button" data-preview-action="out" aria-label="缩小预览">−</button>' +
      '<button type="button" data-preview-action="fit">适屏</button>' +
      '<button type="button" data-preview-action="in" aria-label="放大预览">＋</button>' +
      '<button type="button" data-preview-action="close" aria-label="关闭预览">关闭 ×</button></div></div>' +
      '<div class="qily-public-preview-stage"><img alt="" decoding="async"></div>' +
      '<p class="qily-public-preview-status" role="status" aria-live="polite"></p></section>';
    document.body.appendChild(viewer);
    viewer.addEventListener('click', function (event) {
      if (event.target === viewer) { closeViewer(); return; }
      var control = event.target.closest('[data-preview-action]');
      if (!control) return;
      var action = control.getAttribute('data-preview-action');
      if (action === 'close') closeViewer();
      else if (action === 'previous') showPreview(active - 1);
      else if (action === 'next') showPreview(active + 1);
      else if (action === 'fit') setZoom(1);
      else setZoom(zoom + (action === 'in' ? .25 : -.25));
    });
    viewer.querySelector('img').addEventListener('dblclick', function () { setZoom(zoom === 1 ? 2 : 1); });
  }
  function fitImage() {
    if (!viewer || viewer.hidden) return;
    var image = viewer.querySelector('img');
    var stage = viewer.querySelector('.qily-public-preview-stage');
    if (!image.naturalWidth || !image.naturalHeight) return;
    var fit = Math.min(Math.max(1, stage.clientWidth - 32) / image.naturalWidth,
      Math.max(1, stage.clientHeight - 32) / image.naturalHeight, 1);
    image.style.width = Math.max(1, Math.round(image.naturalWidth * fit * zoom)) + 'px';
    image.style.height = 'auto';
    if (zoom === 1) { stage.scrollTop = 0; stage.scrollLeft = 0; }
  }
  function setZoom(value) { zoom = Math.min(5, Math.max(.5, value)); fitImage(); }
  function showPreview(index) {
    active = (index + previews.length) % previews.length;
    var trigger = previews[active];
    var thumbnail = trigger.querySelector('img');
    var image = viewer.querySelector('img');
    var heading = viewer.querySelector('h2');
    var note = viewer.querySelector('.qily-public-preview-status');
    var source = localUrl(trigger.getAttribute('data-plan-source')) || localUrl(thumbnail && (thumbnail.currentSrc || thumbnail.getAttribute('src')));
    var fallback = localUrl(thumbnail && (thumbnail.currentSrc || thumbnail.getAttribute('src')));
    var title = trigger.getAttribute('data-plan-title') || (thumbnail && thumbnail.alt) || '资料预览';
    zoom = 1;
    image.removeAttribute('style');
    heading.textContent = title;
    image.alt = title;
    note.textContent = '正在加载预览…';
    viewer.querySelector('[data-preview-action="previous"]').disabled = previews.length < 2;
    viewer.querySelector('[data-preview-action="next"]').disabled = previews.length < 2;
    image.onload = function () {
      note.textContent = '第 ' + (active + 1) + ' / ' + previews.length + ' 张；可放大查看，按 Esc 关闭。';
      fitImage();
    };
    image.onerror = function () {
      if (fallback && image.getAttribute('src') !== fallback) { image.src = fallback; return; }
      note.textContent = '预览加载失败，请稍后重试。';
    };
    if (source) image.src = source;
    else { image.removeAttribute('src'); note.textContent = '暂无可用预览。'; }
  }
  function openViewer(trigger) {
    createViewer();
    previousFocus = trigger;
    viewer.hidden = false;
    document.body.classList.add('qily-public-preview-open');
    showPreview(previews.indexOf(trigger));
    viewer.querySelector('[data-preview-action="close"]').focus();
  }
  function closeViewer() {
    if (!viewer || viewer.hidden) return;
    viewer.hidden = true;
    document.body.classList.remove('qily-public-preview-open');
    var image = viewer.querySelector('img');
    image.onload = null;
    image.onerror = null;
    image.removeAttribute('src');
    if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
  }
  document.addEventListener('keydown', function (event) {
    if (!viewer || viewer.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); closeViewer(); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); showPreview(active - 1); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); showPreview(active + 1); }
    else if (event.key === 'Tab') {
      var controls = Array.prototype.slice.call(viewer.querySelectorAll('button:not([disabled])'));
      var first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || !viewer.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !viewer.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    }
  });
  window.addEventListener('resize', fitImage, { passive: true });

  roots.forEach(function (root) {
    root.addEventListener('click', function (event) {
      var trigger = event.target.closest('button');
      if (!trigger || !insideContent(trigger)) return;
      if (trigger.matches('[data-plan-preview], .preview-open')) {
        event.preventDefault(); openViewer(trigger);
      } else if (trigger.matches('[data-public-print]')) {
        event.preventDefault(); window.print();
      } else if (trigger.matches('[data-public-share], .share-button, .app-link-share-trigger')) {
        event.preventDefault(); share(trigger);
      } else if (trigger.id === 'copyIntro' || trigger.id === 'copyUrl') {
        event.preventDefault();
        var description = document.querySelector('meta[name="description"]');
        var value = trigger.id === 'copyIntro' && description ? description.content : document.title;
        var copiedMessage = trigger.id === 'copyIntro' ? '简介及网址已复制' : '标题及网址已复制';
        copy(value + '\n' + location.href).then(function () { status(trigger, copiedMessage); })
          .catch(function () { status(trigger, '复制失败，请从地址栏复制本页网址。'); });
      }
    });
  });

  async function drawPage(canvas) {
    if (canvas.getAttribute('data-loaded') === '1' || canvas.getAttribute('data-loading') === '1') return;
    var source = localUrl(canvas.getAttribute('data-src'));
    if (!source) return;
    var figure = canvas.closest('figure') || canvas.parentElement;
    var loading = figure.querySelector('.page-loading');
    if (!loading) {
      loading = document.createElement('p');
      loading.className = 'page-loading';
      figure.insertBefore(loading, canvas);
    }
    loading.setAttribute('role', 'status');
    loading.textContent = '正在加载资料预览…';
    canvas.setAttribute('data-loading', '1');
    canvas.setAttribute('aria-busy', 'true');
    var objectUrl = '';
    try {
      var response = await fetch(source, { cache: 'force-cache', credentials: 'same-origin' });
      if (!response.ok) throw new Error('preview response');
      var bytes = new Uint8Array(await response.arrayBuffer());
      var key = canvas.getAttribute('data-preview-key') ||
        (/one-piece-flow|seat-switch-one-piece-flow/i.test(source) ? 'QilyLeanFlowPreview2026' : 'QilyLeanPreview2026');
      for (var i = 0; i < bytes.length; i++) bytes[i] ^= key.charCodeAt(i % key.length);
      var blob = new Blob([bytes], { type: 'image/jpeg' });
      var bitmap;
      if (typeof createImageBitmap === 'function') bitmap = await createImageBitmap(blob);
      else {
        objectUrl = URL.createObjectURL(blob);
        bitmap = await new Promise(function (resolve, reject) {
          var image = new Image();
          image.onload = function () { resolve(image); };
          image.onerror = function () { reject(new Error('preview image')); };
          image.src = objectUrl;
        });
      }
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      var context = canvas.getContext('2d', { alpha: false });
      if (!context) throw new Error('preview canvas');
      context.drawImage(bitmap, 0, 0);
      if (typeof bitmap.close === 'function') bitmap.close();
      canvas.setAttribute('data-loaded', '1');
      loading.remove();
    } catch (error) {
      loading.textContent = '本页加载失败。';
      var retry = document.createElement('button');
      retry.type = 'button';
      retry.className = 'qily-public-preview-retry';
      retry.textContent = '重新加载';
      retry.addEventListener('click', function () { drawPage(canvas); });
      loading.appendChild(retry);
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      canvas.setAttribute('data-loading', '0');
      canvas.setAttribute('aria-busy', 'false');
    }
  }
  var pages = contentNodes('canvas[data-src]');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { observer.unobserve(entry.target); drawPage(entry.target); }
      });
    }, { rootMargin: '1000px 0px' });
    pages.forEach(function (canvas) { observer.observe(canvas); });
  } else pages.forEach(drawPage);

  contentNodes('[data-public-brief-index]').forEach(function (index) {
    var search = index.querySelector('#cnPublicBriefSearch');
    var count = index.querySelector('#cnPublicBriefCount');
    var list = index.querySelector('[data-public-brief-list]');
    if (!search || !list) return;
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-brief-search]'));
    var parameters = new URLSearchParams(location.search);
    var requestedDate = parameters.get('date') || '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
      var requestedCard = cards.find(function (card) { return card.getAttribute('data-brief-date') === requestedDate; });
      var requestedUrl = requestedCard && localUrl(requestedCard.getAttribute('href'));
      if (requestedUrl) { location.replace(requestedUrl); return; }
    }
    search.value = parameters.get('q') || '';
    function normalized(value) { return String(value || '').normalize('NFKC').trim().toLocaleLowerCase('zh-CN'); }
    function filter() {
      var query = normalized(search.value);
      var visible = 0;
      cards.forEach(function (card) {
        var matches = !query || normalized(card.getAttribute('data-brief-search') || text(card)).indexOf(query) !== -1;
        card.hidden = !matches;
        if (matches) visible++;
      });
      if (count) count.textContent = query ? '找到 ' + visible + ' 篇相关简报' : '共 ' + cards.length + ' 篇精选简报';
    }
    if (count) { count.setAttribute('role', 'status'); count.setAttribute('aria-live', 'polite'); }
    search.addEventListener('input', filter, { passive: true });
    search.addEventListener('search', filter, { passive: true });
    filter();
  });
})();
