(function () {
  'use strict';

  if (window.QilySiteSearch) return;

  var FALLBACK_URLS = [
    '/',
    '/ai.html',
    '/capabilities/',
    '/projects/',
    '/experience/',
    '/improvements/',
    '/improvements/vsm/',
    '/improvements/standard-time/',
    '/improvements/smed/',
    '/improvements/erp-mes/',
    '/improvements/ie-data/',
    '/improvements/visual/',
    '/knowledge/',
    '/moments/',
    '/moments/work/',
    '/moments/team/',
    '/moments/business/',
    '/moments/life/',
    '/qilylean/daily-insights.html',
    '/qilylean/papers.html',
    '/qilylean/lean-tools.html',
    '/qilylean/lean-knowledge.html',
    '/qilylean/execution-loop.html',
    '/qilylean/gbt2828.html'
  ];

  var state = {
    urls: null,
    entries: [],
    loading: null,
    loaded: 0,
    total: 0,
    activeQuery: ''
  };

  function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function lower(value) {
    return normalizeText(value).toLocaleLowerCase('zh-CN');
  }

  function uniqueUrls(urls) {
    var seen = Object.create(null);
    return urls.filter(function (value) {
      var url;
      try { url = new URL(value, location.origin); } catch (error) { return false; }
      if (url.origin !== location.origin) return false;
      url.hash = '';
      url.search = '';
      if (!/^https?:$/.test(url.protocol)) return false;
      if (/\.(?:jpg|jpeg|png|webp|gif|svg|pdf|docx?|xlsx?|pptx?|mp3|mp4|mov|zip)$/i.test(url.pathname)) return false;
      var key = url.pathname.replace(/\/index\.html$/, '/');
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    }).map(function (value) {
      var url = new URL(value, location.origin);
      url.hash = '';
      url.search = '';
      return url.pathname + (url.pathname.endsWith('/') ? '' : '');
    });
  }

  function prioritizeUrls(urls) {
    var fallback = uniqueUrls(FALLBACK_URLS);
    var all = uniqueUrls(fallback.concat(urls)).filter(function (url) { return url !== '/cooperation/'; });
    var fixed = [];
    var daily = [];
    all.forEach(function (url) {
      if (url.indexOf('/qilylean/daily/') === 0) daily.push(url);
      else fixed.push(url);
    });
    daily.sort().reverse();
    return fixed.concat(daily.slice(0, 90));
  }

  function loadUrlList() {
    if (state.urls) return Promise.resolve(state.urls);
    return fetch('/sitemap.xml?v=20260724-site-search-v2', {
      credentials: 'same-origin',
      cache: 'force-cache',
      headers: { Accept: 'application/xml,text/xml;q=0.9,*/*;q=0.8' }
    }).then(function (response) {
      if (!response.ok) throw new Error('sitemap unavailable');
      return response.text();
    }).then(function (xmlText) {
      var xml = new DOMParser().parseFromString(xmlText, 'application/xml');
      var urls = Array.prototype.map.call(xml.querySelectorAll('loc'), function (node) {
        return normalizeText(node.textContent);
      });
      state.urls = prioritizeUrls(urls);
      return state.urls;
    }).catch(function () {
      state.urls = prioritizeUrls([]);
      return state.urls;
    });
  }

  function cleanDocument(doc) {
    doc.querySelectorAll('script,style,noscript,template,svg,canvas,video,audio,iframe,form,nav,header,footer,.qily-float-dock,.qily-modal-mask').forEach(function (node) {
      node.remove();
    });
  }

  function extractEntry(url, html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    cleanDocument(doc);
    var titleNode = doc.querySelector('meta[property="og:title"]');
    var descriptionNode = doc.querySelector('meta[name="description"]');
    var title = normalizeText(titleNode && titleNode.content) || normalizeText(doc.title) || normalizeText((doc.querySelector('h1') || {}).textContent) || 'QilyLean';
    var description = normalizeText(descriptionNode && descriptionNode.content);
    var headings = normalizeText(Array.prototype.map.call(doc.querySelectorAll('h1,h2,h3'), function (node) {
      return node.textContent;
    }).join(' ｜ '));
    var root = doc.querySelector('main,article,[role="main"]') || doc.body;
    var text = normalizeText(root ? root.textContent : '').slice(0, 24000);
    return {
      url: url,
      title: title,
      description: description,
      headings: headings,
      text: text,
      searchable: lower([title, description, headings, text, url].join(' '))
    };
  }

  function fetchEntry(url) {
    return fetch(url, {
      credentials: 'same-origin',
      cache: 'force-cache',
      headers: { Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8' }
    }).then(function (response) {
      var contentType = response.headers.get('content-type') || '';
      if (!response.ok || contentType.indexOf('text/html') === -1) throw new Error('not html');
      return response.text();
    }).then(function (html) {
      return extractEntry(url, html);
    }).catch(function () {
      return null;
    });
  }

  function buildIndex(onProgress) {
    if (state.loading) return state.loading;
    state.loading = loadUrlList().then(function (urls) {
      state.total = urls.length;
      state.loaded = 0;
      state.entries = [];
      var cursor = 0;
      var workerCount = Math.min(5, urls.length);

      function worker() {
        var index = cursor++;
        if (index >= urls.length) return Promise.resolve();
        return fetchEntry(urls[index]).then(function (entry) {
          if (entry) state.entries.push(entry);
          state.loaded += 1;
          if (onProgress) onProgress(state.loaded, state.total);
          return worker();
        });
      }

      var workers = [];
      for (var i = 0; i < workerCount; i += 1) workers.push(worker());
      return Promise.all(workers).then(function () { return state.entries; });
    }).catch(function () {
      return state.entries;
    });
    return state.loading;
  }

  function scoreEntry(entry, query, terms) {
    var title = lower(entry.title);
    var description = lower(entry.description);
    var headings = lower(entry.headings);
    var text = lower(entry.text);
    var url = lower(entry.url);
    var score = 0;

    if (title === query) score += 180;
    if (title.indexOf(query) !== -1) score += 85;
    if (headings.indexOf(query) !== -1) score += 55;
    if (description.indexOf(query) !== -1) score += 38;
    if (url.indexOf(query) !== -1) score += 28;
    if (text.indexOf(query) !== -1) score += 16;

    terms.forEach(function (term) {
      if (title.indexOf(term) !== -1) score += 24;
      if (headings.indexOf(term) !== -1) score += 16;
      if (description.indexOf(term) !== -1) score += 11;
      if (url.indexOf(term) !== -1) score += 8;
      if (text.indexOf(term) !== -1) score += 4;
    });

    return score;
  }

  function createSnippet(entry, query, terms) {
    var source = entry.description || entry.text || entry.headings;
    var haystack = lower(source);
    var position = haystack.indexOf(query);
    if (position < 0) {
      for (var i = 0; i < terms.length; i += 1) {
        position = haystack.indexOf(terms[i]);
        if (position >= 0) break;
      }
    }
    if (position < 0) position = 0;
    var start = Math.max(0, position - 55);
    var end = Math.min(source.length, position + 125);
    return (start > 0 ? '…' : '') + source.slice(start, end) + (end < source.length ? '…' : '');
  }

  function searchEntries(rawQuery) {
    var query = lower(rawQuery);
    if (!query) return [];
    var terms = query.split(/[\s,，。；;、|/]+/).filter(function (term) { return term.length > 0; });
    return state.entries.map(function (entry) {
      return {
        entry: entry,
        score: scoreEntry(entry, query, terms),
        snippet: createSnippet(entry, query, terms)
      };
    }).filter(function (item) {
      return item.score > 0;
    }).sort(function (a, b) {
      return b.score - a.score || a.entry.title.localeCompare(b.entry.title, 'zh-CN');
    }).slice(0, 20);
  }

  function addStyles() {
    if (document.getElementById('qilySiteSearchStyles')) return;
    var style = document.createElement('style');
    style.id = 'qilySiteSearchStyles';
    style.textContent = [
      '.qily-float-search{background:rgba(56,112,124,.81)}',
      '.qily-search-panel{width:min(94vw,760px);text-align:left}',
      '.qily-search-panel h3{text-align:center;margin-bottom:6px}',
      '.qily-search-lead{margin:0 0 16px;color:var(--qily-muted,#5f7474);text-align:center;font-size:14px}',
      '.qily-search-form{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px}',
      '.qily-search-input{width:100%;min-height:48px;padding:10px 14px;border:1px solid var(--qily-line,#d5e4e3);border-radius:12px;color:var(--qily-ink,#182420);background:#fff;font:inherit;font-size:16px;outline:none}',
      '.qily-search-input:focus{border-color:var(--qily-teal,#178b94);box-shadow:0 0 0 3px rgba(23,139,148,.15)}',
      '.qily-search-submit{min-width:88px;min-height:48px;padding:10px 16px;border:0;border-radius:12px;color:#fff;background:var(--qily-forest,#0f4b5a);font:inherit;font-weight:900;cursor:pointer}',
      '.qily-search-submit:hover,.qily-search-submit:focus-visible{background:var(--qily-teal,#178b94);outline:none}',
      '.qily-search-suggestions{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 0}',
      '.qily-search-suggestions button{padding:7px 11px;border:1px solid var(--qily-line,#d5e4e3);border-radius:999px;color:var(--qily-forest,#0f4b5a);background:#f6fbfa;font:inherit;font-size:13px;font-weight:800;cursor:pointer}',
      '.qily-search-status{min-height:24px;margin:13px 0 8px;color:var(--qily-muted,#5f7474);font-size:13px}',
      '.qily-search-results{display:grid;gap:10px;max-height:min(52vh,520px);overflow:auto;padding-right:3px}',
      '.qily-search-result{display:block;padding:13px 14px;border:1px solid var(--qily-line,#d5e4e3);border-radius:13px;color:inherit;background:#f9fcfb;text-decoration:none;transition:border-color .16s ease,transform .16s ease,box-shadow .16s ease}',
      '.qily-search-result:hover,.qily-search-result:focus-visible{border-color:var(--qily-teal,#178b94);box-shadow:0 8px 20px rgba(15,75,90,.13);outline:none;transform:translateY(-1px)}',
      '.qily-search-result strong{display:block;color:var(--qily-forest,#0f4b5a);font-size:17px;line-height:1.4}',
      '.qily-search-path{display:block;margin:4px 0;color:var(--qily-teal,#178b94);font-size:12px;word-break:break-all}',
      '.qily-search-snippet{display:block;color:var(--qily-muted,#5f7474);font-size:14px;line-height:1.65}',
      '.qily-search-empty{padding:24px 14px;border:1px dashed var(--qily-line,#d5e4e3);border-radius:13px;color:var(--qily-muted,#5f7474);text-align:center;background:#f9fcfb}',
      '@media(max-width:620px){.qily-search-panel{padding:22px 15px}.qily-search-form{grid-template-columns:1fr}.qily-search-submit{width:100%}.qily-search-results{max-height:48vh}}'
    ].join('');
    document.head.appendChild(style);
  }

  function createUi() {
    var existing = document.getElementById('qilySearchMask');
    if (existing) return existing;
    addStyles();
    var mask = document.createElement('div');
    mask.id = 'qilySearchMask';
    mask.className = 'qily-modal-mask';
    mask.innerHTML = '<div class="qily-modal-panel qily-search-panel" role="dialog" aria-modal="true" aria-labelledby="qilySearchTitle"><button class="qily-modal-close" type="button" aria-label="关闭本站搜索">×</button><div class="qily-modal-brand">QilyLean</div><h3 id="qilySearchTitle">本站搜索</h3><p class="qily-search-lead">输入关键词，搜索本站公开页面、改善专题、项目案例与知识内容。</p><form class="qily-search-form" role="search"><input class="qily-search-input" type="search" inputmode="search" autocomplete="off" placeholder="例如：VSM、标准工时、数智化工厂、目视化" aria-label="搜索本站内容"><button class="qily-search-submit" type="submit">搜索</button></form><div class="qily-search-suggestions" aria-label="常用搜索"><button type="button">精益改善</button><button type="button">VSM</button><button type="button">标准工时</button><button type="button">新工厂规划</button><button type="button">目视化</button><button type="button">数智化工厂</button></div><div class="qily-search-status" role="status"></div><div class="qily-search-results"></div></div>';
    document.body.appendChild(mask);

    var panel = mask.querySelector('.qily-search-panel');
    var close = mask.querySelector('.qily-modal-close');
    var form = mask.querySelector('.qily-search-form');
    var input = mask.querySelector('.qily-search-input');
    var results = mask.querySelector('.qily-search-results');
    var status = mask.querySelector('.qily-search-status');
    var timer = null;

    function render(query) {
      state.activeQuery = normalizeText(query);
      results.innerHTML = '';
      if (!state.activeQuery) {
        status.textContent = state.loading ? '本站索引正在准备中，可直接输入关键词。' : '请输入关键词开始搜索。';
        return;
      }
      var matches = searchEntries(state.activeQuery);
      if (!matches.length) {
        status.textContent = state.loading && state.loaded < state.total ? '正在继续检索本站内容（' + state.loaded + '/' + state.total + '）…' : '未找到与“' + state.activeQuery + '”直接相关的内容。';
        var empty = document.createElement('div');
        empty.className = 'qily-search-empty';
        empty.textContent = state.loading && state.loaded < state.total ? '索引仍在加载，结果会自动更新。' : '可尝试缩短关键词，或使用“VSM、标准工时、项目、目视化”等词语。';
        results.appendChild(empty);
        return;
      }
      status.textContent = '找到 ' + matches.length + ' 条相关内容' + (state.loading && state.loaded < state.total ? '，索引进度 ' + state.loaded + '/' + state.total : '') + '。';
      matches.forEach(function (item) {
        var link = document.createElement('a');
        link.className = 'qily-search-result';
        link.href = item.entry.url;
        var title = document.createElement('strong');
        title.textContent = item.entry.title;
        var path = document.createElement('span');
        path.className = 'qily-search-path';
        path.textContent = item.entry.url;
        var snippet = document.createElement('span');
        snippet.className = 'qily-search-snippet';
        snippet.textContent = item.snippet || item.entry.description || '打开页面查看相关内容。';
        link.appendChild(title);
        link.appendChild(path);
        link.appendChild(snippet);
        results.appendChild(link);
      });
    }

    function scheduleRender() {
      clearTimeout(timer);
      timer = setTimeout(function () { render(input.value); }, 150);
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render(input.value);
    });
    input.addEventListener('input', scheduleRender);
    mask.querySelectorAll('.qily-search-suggestions button').forEach(function (button) {
      button.addEventListener('click', function () {
        input.value = button.textContent;
        render(input.value);
        input.focus();
      });
    });
    close.addEventListener('click', function () { mask.classList.remove('show'); });
    mask.addEventListener('click', function (event) { if (event.target === mask) mask.classList.remove('show'); });
    panel.addEventListener('click', function (event) { event.stopPropagation(); });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && mask.classList.contains('show')) mask.classList.remove('show');
    });

    mask._qilySearch = { input: input, render: render, status: status };
    return mask;
  }

  function openSearch() {
    var mask = createUi();
    mask.classList.add('show');
    requestAnimationFrame(function () {
      mask._qilySearch.input.focus({ preventScroll: true });
    });
    buildIndex(function () {
      if (state.activeQuery) mask._qilySearch.render(state.activeQuery);
      else mask._qilySearch.status.textContent = '本站索引正在准备中（' + state.loaded + '/' + state.total + '）…';
    }).then(function () {
      if (state.activeQuery) mask._qilySearch.render(state.activeQuery);
      else mask._qilySearch.status.textContent = '本站内容索引已就绪，可输入关键词搜索。';
    });
  }

  window.QilySiteSearch = {
    open: openSearch,
    rebuild: function () {
      state.urls = null;
      state.entries = [];
      state.loading = null;
      state.loaded = 0;
      state.total = 0;
      return buildIndex();
    }
  };
})();
