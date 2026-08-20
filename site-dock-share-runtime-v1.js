/* QilyLean floating Dock share runtime v1｜2026-08-20
 * 目标：
 * 1) “分享官网”与其它 Dock 按钮使用完全相同的文字结构与字号继承；
 * 2) 点击/轻触“分享官网”直接调用系统分享，失败时仅复制官网网址；
 * 3) 分享网址统一去除末尾斜杠，只保留可直接打开的简洁 URL；
 * 4) 历史运行时若重建 Dock，自动恢复当前受保护结构，不允许旧 span 字号回灌。
 */
(function (d, w) {
  'use strict';
  if (w.__qilyDockShareRuntimeV1) return;
  w.__qilyDockShareRuntimeV1 = true;

  var HOME_URL = 'https://qilylean.com';
  var pointer = null;
  var reconcileQueued = false;

  function normalizeUrl(value) {
    if (w.QilyLeanNormalizePublicUrl) return w.QilyLeanNormalizePublicUrl(value);
    var text = String(value == null ? '' : value).trim();
    if (!text) return text;
    try {
      var u = new URL(text, w.location.origin);
      if (u.hostname !== 'qilylean.com' && u.hostname !== 'www.qilylean.com') return text;
      var pathname = u.pathname || '';
      pathname = pathname === '/' ? '' : pathname.replace(/\/+$/, '');
      return u.protocol + '//' + u.host + pathname + u.search + u.hash;
    } catch (error) {
      return text.replace(/\/(?=(?:[?#]|$))/, '');
    }
  }

  function copyText(text) {
    if (navigator.clipboard && w.isSecureContext) return navigator.clipboard.writeText(text);
    var field = d.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.left = '-9999px';
    d.body.appendChild(field);
    field.select();
    d.execCommand('copy');
    field.remove();
    return Promise.resolve();
  }

  function showToast(message) {
    var toast = d.getElementById('qilyDockToast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    w.clearTimeout(showToast.timer);
    showToast.timer = w.setTimeout(function () { toast.classList.remove('show'); }, 2400);
  }

  function normalizeLabel() {
    var button = d.querySelector('#floatDock [data-action="share"]');
    if (!button) return false;
    var html = '分享<br>官网';
    if (button.innerHTML !== html) button.innerHTML = html;
    button.setAttribute('aria-label', '分享官网');
    button.setAttribute('title', '分享官网');
    return true;
  }

  function closeLegacyShareMask() {
    var mask = d.getElementById('shareMask');
    if (mask) mask.classList.remove('show');
  }

  function shareOfficialSite() {
    var url = normalizeUrl(HOME_URL);
    closeLegacyShareMask();
    if (navigator.share) {
      return navigator.share({ url: url }).then(function () {
        showToast('已调起系统分享');
      }).catch(function (error) {
        if (error && error.name === 'AbortError') return;
        return copyText(url).then(function () { showToast('官网网址已复制'); });
      });
    }
    return copyText(url).then(function () { showToast('官网网址已复制'); });
  }

  d.addEventListener('pointerdown', function (event) {
    var button = event.target && event.target.closest ? event.target.closest('#floatDock [data-action="share"]') : null;
    if (!button) {
      pointer = null;
      return;
    }
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
  }, false);

  d.addEventListener('pointermove', function (event) {
    if (!pointer || pointer.id !== event.pointerId) return;
    if (Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 7) pointer.moved = true;
  }, false);

  d.addEventListener('pointerup', function (event) {
    if (!pointer || pointer.id !== event.pointerId) return;
    var shouldShare = !pointer.moved;
    pointer = null;
    if (!shouldShare) return;
    normalizeLabel();
    shareOfficialSite();
  }, false);

  d.addEventListener('pointercancel', function (event) {
    if (pointer && pointer.id === event.pointerId) pointer = null;
  }, false);

  d.addEventListener('click', function (event) {
    if (event.detail !== 0) return;
    var button = event.target && event.target.closest ? event.target.closest('#floatDock [data-action="share"]') : null;
    if (!button) return;
    normalizeLabel();
    shareOfficialSite();
  }, false);

  function reconcile() {
    normalizeLabel();
    closeLegacyShareMask();
  }

  function queueReconcile() {
    if (reconcileQueued) return;
    reconcileQueued = true;
    w.requestAnimationFrame(function () {
      reconcileQueued = false;
      normalizeLabel();
    });
  }

  function installDockObserver() {
    if (!w.MutationObserver || !d.body || w.__qilyDockShareObserverV1) return;
    w.__qilyDockShareObserverV1 = true;
    var observer = new MutationObserver(function (records) {
      var relevant = records.some(function (record) {
        var target = record.target;
        if (target && target.closest && target.closest('#floatDock')) return true;
        return Array.from(record.addedNodes || []).some(function (node) {
          if (!node || node.nodeType !== 1) return false;
          if (node.id === 'floatDock') return true;
          return !!(node.querySelector && node.querySelector('#floatDock,[data-action="share"]'));
        });
      });
      if (relevant) queueReconcile();
    });
    observer.observe(d.body, { childList: true, subtree: true });
  }

  d.addEventListener('qily:shell-ready', reconcile);
  w.addEventListener('pageshow', reconcile);
  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', function () {
      reconcile();
      installDockObserver();
    }, { once: true });
  } else {
    reconcile();
    installDockObserver();
  }

  w.__qilyDockShareContract = Object.freeze({
    label: '分享官网',
    labelStructure: 'same-as-other-dock-buttons',
    action: 'native-share-or-copy-url',
    payload: 'url-only',
    homeUrl: HOME_URL,
    trailingSlash: false,
    oldLabelStructureBlocked: true,
    version: '20260820-dock-share-runtime-v1'
  });
})(document, window);
