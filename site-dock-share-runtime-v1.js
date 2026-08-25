/* QilyLean floating Dock order closure v3.1｜2026-08-25
 * 保持六项顺序；仅在中文权威源模式下校正中文标签，其他语言不得被运行时拉回中文。
 */
(function (d, w) {
  'use strict';
  if (w.__qilyDockOrderClosureV31) return;
  w.__qilyDockOrderClosureV31 = true;
  w.__qilyDockOrderClosureV3 = true;
  function sourceMode() { return (d.documentElement.getAttribute('data-qily-language') || 'zh-CN') === 'zh-CN'; }
  function normalizeDock() {
    var dock = d.getElementById('floatDock');
    if (!dock) return false;
    var buttons = d.querySelectorAll('#floatDock [data-action="share"]');
    buttons.forEach(function (button) {
      var text = (button.textContent || '').replace(/\s+/g, '');
      var label = button.getAttribute('aria-label') || button.getAttribute('title') || '';
      if (text.indexOf('分享官网') >= 0 || label.indexOf('分享官网') >= 0 || text === '分享官网') button.remove();
    });
    var labels = {home:'首页',top:'回<br>顶部',back:'回<br>上一层',search:'本站<br>搜索',current:'分享<br>当前页',contact:'交流'};
    var order = ['home', 'top', 'back', 'search', 'current', 'contact'];
    var existingOrder = Array.from(dock.children).filter(function (node) {return node.matches && node.matches('[data-action]');}).map(function (node) { return node.getAttribute('data-action'); });
    var needsReorder = existingOrder.join(',') !== order.join(',');
    var fragment = d.createDocumentFragment();
    var enforceChinese = sourceMode();
    order.forEach(function (action) {
      var button = dock.querySelector('[data-action="' + action + '"]');
      if (!button) return;
      if (enforceChinese) {
        if (button.innerHTML !== labels[action]) button.innerHTML = labels[action];
        var aria = button.textContent.replace(/\s+/g, '');
        if (button.getAttribute('aria-label') !== aria) button.setAttribute('aria-label', aria);
      }
      if (needsReorder) fragment.appendChild(button);
    });
    if (fragment.childNodes.length) dock.appendChild(fragment);
    dock.dataset.qilyStableOrder = order.join(',');
    return order.every(function (action) { return Boolean(dock.querySelector('[data-action="' + action + '"]')); });
  }
  function installObserver() {
    if (!w.MutationObserver || w.__qilyDockOrderClosureObserverV31) return;
    w.__qilyDockOrderClosureObserverV31 = true;
    new MutationObserver(normalizeDock).observe(d.body, { childList: true, subtree: true });
  }
  function boot() { normalizeDock(); installObserver(); d.addEventListener('qily:language-change', normalizeDock); }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})(document, window);
