/* QilyLean Translation Progress Notice V1｜2026-08-25
 * Non-blocking bilingual notice for user-initiated translation only.
 * It observes the governed translation control state and never starts/cancels translation itself.
 */
(function (d, w) {
  'use strict';
  if (w.__qilyTranslationProgressNoticeV1) return;
  w.__qilyTranslationProgressNoticeV1 = true;

  var CONTROL_ID = 'qilyGlobalTranslationDualRouteV2';
  var NOTICE_ID = 'qilyTranslationProgressV1';
  var visibleStates = new Set(['working', 'fallback', 'opening']);
  var hideTimer = 0;

  function ensureNotice() {
    var notice = d.getElementById(NOTICE_ID);
    if (notice) return notice;
    notice = d.createElement('div');
    notice.id = NOTICE_ID;
    notice.className = 'qily-translation-progress';
    notice.setAttribute('role', 'status');
    notice.setAttribute('aria-live', 'polite');
    notice.setAttribute('aria-atomic', 'true');
    notice.setAttribute('data-qily-no-translate', 'true');
    notice.setAttribute('translate', 'no');
    notice.setAttribute('data-visible', 'false');
    notice.innerHTML = '<span class="qily-translation-progress__icon" aria-hidden="true">🌐</span><span class="qily-translation-progress__copy"><strong>正在翻译，请稍候</strong><small>Translating — a brief delay may occur.</small></span>';
    (d.body || d.documentElement).appendChild(notice);
    return notice;
  }

  function setVisible(visible) {
    var notice = ensureNotice();
    if (hideTimer) { w.clearTimeout(hideTimer); hideTimer = 0; }
    if (visible) {
      notice.setAttribute('data-visible', 'true');
      return;
    }
    hideTimer = w.setTimeout(function () {
      notice.setAttribute('data-visible', 'false');
      hideTimer = 0;
    }, 260);
  }

  function sync() {
    var control = d.getElementById(CONTROL_ID);
    if (!control) { setVisible(false); return; }
    var state = control.getAttribute('data-state') || 'idle';
    setVisible(visibleStates.has(state));
  }

  function bindControl(control) {
    if (!control || control.dataset.qilyProgressNoticeBound === 'true') return;
    control.dataset.qilyProgressNoticeBound = 'true';
    if (w.MutationObserver) {
      new MutationObserver(sync).observe(control, { attributes: true, attributeFilter: ['data-state'] });
    }
    sync();
  }

  function reconcile() {
    ensureNotice();
    bindControl(d.getElementById(CONTROL_ID));
    sync();
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', reconcile, { once: true });
  else reconcile();

  d.addEventListener('qily:language-change', function () { w.requestAnimationFrame(sync); });
  w.addEventListener('pageshow', reconcile, { passive: true });

  if (w.MutationObserver) {
    var queued = false;
    new MutationObserver(function () {
      if (queued) return;
      queued = true;
      w.requestAnimationFrame(function () { queued = false; reconcile(); });
    }).observe(d.documentElement, { childList: true, subtree: true });
  }
})(document, window);
