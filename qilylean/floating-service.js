/* QilyLean floating-service behavior v2.1｜2026-08-20
 * 分享链接统一规范：域名及页面路径末尾不保留斜杠。
 */
(function (d, w) {
  'use strict';
  if (w.__qilyFloatingServiceBehaviorV2) return;
  w.__qilyFloatingServiceBehaviorV2 = true;

  function normalizeUrl(url) {
    return String(url || '').replace(/\/+$/, '');
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

  function shortShareUrl(hashOverride) {
    var map = {
      'home.html': '',
      'home-live.html': '',
      'daily-insights.html': 'daily-insights.html',
      'papers.html': 'papers.html',
      'lean-tools.html': 'tools.html',
      'lean-knowledge.html': 'knowledge.html',
      'execution-loop.html': 'execution.html',
      'gbt2828.html': 'gbt2828.html'
    };
    var name = (location.pathname.split('/').pop() || 'home.html').toLowerCase();
    var shortPath = Object.prototype.hasOwnProperty.call(map, name) ? map[name] : name;
    var hash = typeof hashOverride === 'string' ? hashOverride : (location.hash || '');
    return normalizeUrl('https://qilylean.com' + (shortPath ? '/' + shortPath.replace(/^\/+/, '') : '') + (location.search || '') + hash);
  }

  d.addEventListener('click', function (event) {
    var button = event.target.closest && event.target.closest('.share');
    if (!button) return;
    var article = button.closest('.post');
    if (!article || !article.id) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    var title = button.dataset.title || d.title || 'QilyLean';
    var url = normalizeUrl(shortShareUrl('#' + article.id));
    var status = article.querySelector('.status');
    var done = function () {
      if (status) status.textContent = '短链接已复制';
      w.setTimeout(function () { if (status) status.textContent = ''; }, 2200);
    };
    if (navigator.share) {
      navigator.share({ title: title, text: title, url: url }).catch(function () {
        copyText(title + '\n' + url).then(done);
      });
    } else {
      copyText(title + '\n' + url).then(done);
    }
  }, true);

  w.__qilyFloatingServiceContract = Object.freeze({
    staticHtmlAuthority: true,
    runtimeContentRewrite: false,
    behaviorOnly: true,
    urlNormalize: true
  });
})(document, window);
