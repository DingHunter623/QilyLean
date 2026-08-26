/* QilyLean floating Dock order closure v3.2｜2026-08-26
 * Stable six-action order without MutationObserver loops.
 * Contact entry is the dedicated contact-page action and must never be rewritten to legacy contact popup semantics.
 */
(function (d, w) {
  'use strict';
  if (w.__qilyDockOrderClosureV32) return;
  w.__qilyDockOrderClosureV32 = true;
  w.__qilyDockOrderClosureV31 = true;
  w.__qilyDockOrderClosureV3 = true;

  function sourceMode() {
    return (d.documentElement.getAttribute('data-qily-language') || 'zh-CN') === 'zh-CN';
  }

  function normalizeDock() {
    var dock = d.getElementById('floatDock');
    if (!dock) return false;

    dock.querySelectorAll('[data-action="share"]').forEach(function (button) {
      var text = (button.textContent || '').replace(/\s+/g, '');
      var label = button.getAttribute('aria-label') || button.getAttribute('title') || '';
      if (text.indexOf('分享官网') >= 0 || label.indexOf('分享官网') >= 0 || text === '分享官网') button.remove();
    });

    var contact = dock.querySelector('[data-action="contact-page"],[data-action="contact"]');
    if (contact && contact.getAttribute('data-action') !== 'contact-page') contact.setAttribute('data-action', 'contact-page');

    var labels = {
      home: '首页',
      top: '回<br>顶部',
      back: '回<br>上一层',
      search: '本站<br>搜索',
      current: '分享<br>当前页',
      'contact-page': '联系<br>我们'
    };
    var order = ['home', 'top', 'back', 'search', 'current', 'contact-page'];
    var enforceChinese = sourceMode();
    var buttons = order.map(function (action) {
      var button = action === 'contact-page' ? contact : dock.querySelector('[data-action="' + action + '"]');
      if (!button) return null;
      if (enforceChinese) {
        if (button.innerHTML !== labels[action]) button.innerHTML = labels[action];
        var aria = action === 'contact-page' ? '联系我们' : button.textContent.replace(/\s+/g, '');
        if (button.getAttribute('aria-label') !== aria) button.setAttribute('aria-label', aria);
        if (button.getAttribute('title') !== aria) button.setAttribute('title', aria);
      }
      return button;
    }).filter(Boolean);

    var current = Array.from(dock.children).filter(function (node) {
      return node.matches && node.matches('[data-action]');
    });
    var needsReorder = current.length !== buttons.length || buttons.some(function (button, index) { return current[index] !== button; });
    if (needsReorder && buttons.length === order.length) {
      var fragment = d.createDocumentFragment();
      buttons.forEach(function (button) { fragment.appendChild(button); });
      dock.appendChild(fragment);
    }
    dock.dataset.qilyStableOrder = order.join(',');
    return buttons.length === order.length;
  }

  function boot() {
    normalizeDock();
    d.addEventListener('qily:shell-ready', normalizeDock);
    d.addEventListener('qily:softnavigate', normalizeDock);
    d.addEventListener('qily:language-change', normalizeDock);
    w.addEventListener('pageshow', normalizeDock, { passive: true });
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(document, window);
