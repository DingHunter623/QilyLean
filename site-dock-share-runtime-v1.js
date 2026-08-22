/* QilyLean floating Dock order closure v2｜2026-08-22
 * 最终顺序：首页、回顶部、返回上一层、本站搜索、分享当前页、交流。
 * 删除重复功能“分享官网”，保留“分享当前页”。
 */
(function (d, w) {
  'use strict';
  if (w.__qilyDockOrderClosureV2) return;
  w.__qilyDockOrderClosureV2 = true;

  function normalizeDock() {
    var dock = d.getElementById('floatDock');
    if (!dock) return false;
    var buttons = d.querySelectorAll('#floatDock [data-action="share"]');
    buttons.forEach(function (button) {
      var text = (button.textContent || '').replace(/\s+/g, '');
      var label = button.getAttribute('aria-label') || button.getAttribute('title') || '';
      if (text.indexOf('分享官网') >= 0 || label.indexOf('分享官网') >= 0 || text === '分享官网') {
        button.remove();
      }
    });
    var labels = {
      home: '首页',
      top: '回<br>顶部',
      back: '返回<br>上一层',
      search: '本站<br>搜索',
      current: '分享<br>当前页',
      contact: '交流'
    };
    var order = ['home', 'top', 'back', 'search', 'current', 'contact'];
    var existingOrder = Array.from(dock.children).filter(function (node) {
      return node.matches && node.matches('[data-action]');
    }).map(function (node) { return node.getAttribute('data-action'); });
    var needsReorder = existingOrder.join(',') !== order.join(',');
    var fragment = d.createDocumentFragment();
    order.forEach(function (action) {
      var button = dock.querySelector('[data-action="' + action + '"]');
      if (!button) return;
      if (button.innerHTML !== labels[action]) button.innerHTML = labels[action];
      button.setAttribute('aria-label', button.textContent.replace(/\s+/g, ''));
      if (needsReorder) fragment.appendChild(button);
    });
    if (fragment.childNodes.length) dock.appendChild(fragment);
    dock.dataset.qilyStableOrder = order.join(',');
    return order.every(function (action) { return Boolean(dock.querySelector('[data-action="' + action + '"]')); });
  }

  function installObserver() {
    if (!w.MutationObserver || w.__qilyDockOrderClosureObserverV2) return;
    w.__qilyDockOrderClosureObserverV2 = true;
    new MutationObserver(normalizeDock).observe(d.body, { childList: true, subtree: true });
  }

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', function () {
      normalizeDock();
      installObserver();
    }, { once: true });
  } else {
    normalizeDock();
    installObserver();
  }
})(document, window);
