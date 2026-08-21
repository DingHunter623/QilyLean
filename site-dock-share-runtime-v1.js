/* QilyLean floating Dock cleanup v1｜2026-08-21
 * 删除重复功能：分享官网
 * 保留全站已有：分享当前页
 */
(function (d, w) {
  'use strict';
  if (w.__qilyDockShareCleanupV1) return;
  w.__qilyDockShareCleanupV1 = true;

  function removeOfficialShareButton() {
    var buttons = d.querySelectorAll('#floatDock [data-action="share"]');
    buttons.forEach(function (button) {
      var text = (button.textContent || '').replace(/\s+/g, '');
      var label = button.getAttribute('aria-label') || button.getAttribute('title') || '';
      if (text.indexOf('分享官网') >= 0 || label.indexOf('分享官网') >= 0 || text === '分享官网') {
        button.remove();
      }
    });
  }

  function installObserver() {
    if (!w.MutationObserver || w.__qilyDockShareCleanupObserverV1) return;
    w.__qilyDockShareCleanupObserverV1 = true;
    new MutationObserver(removeOfficialShareButton).observe(d.body, { childList: true, subtree: true });
  }

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', function () {
      removeOfficialShareButton();
      installObserver();
    }, { once: true });
  } else {
    removeOfficialShareButton();
    installObserver();
  }
})(document, window);
