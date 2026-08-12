/* QilyLean footer compatibility cleanup｜R2 2026-08-12
 * 历史文件名保留仅用于旧缓存兼容。
 * 严禁再创建任何页尾、官网/邮箱联系栏、可信度栏或底部导航。
 */
(function (d, w) {
  'use strict';
  if (w.__qilyFooterCleanupOnlyR2) return;
  w.__qilyFooterCleanupOnlyR2 = true;

  var selector = [
    '#qilyGlobalFooter',
    '#qilyGlobalContactFooter',
    '#qtc-global-trust-footer',
    '.qily-global-footer-v31',
    '.qily-global-footer-v32',
    '.qily-global-footer-v33',
    '.qily-global-footer-v34',
    '.qily-global-contact-footer',
    '.qily-global-contact-footer-shell',
    '.qtc-global-trust-footer',
    'body > footer',
    'body > .footer',
    'body > .site-footer',
    'body > .page-footer',
    '.module-footer'
  ].join(',');

  function clean() {
    if (!d.body) return;
    d.querySelectorAll(selector).forEach(function (node) { node.remove(); });
  }

  function boot() {
    clean();
    if (!w.MutationObserver) return;
    var observer = new MutationObserver(function (records) {
      var hit = records.some(function (record) {
        return Array.from(record.addedNodes || []).some(function (node) {
          return node && node.nodeType === 1 &&
            ((node.matches && node.matches(selector)) || (node.querySelector && node.querySelector(selector)));
        });
      });
      if (hit) w.requestAnimationFrame(clean);
    });
    observer.observe(d.body, { childList: true, subtree: true });
    w.setTimeout(function () { observer.disconnect(); }, 5000);
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(document, window);
