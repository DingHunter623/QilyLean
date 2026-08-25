/* QilyLean R6 search / terminology / hero visual guard v1｜2026-08-26
 * R6 system-level closure for:
 * 1) curated brief search = relevance first, date only wins for explicit date queries;
 * 2) terminology search = exact acronym/code first; arbitrary suffix matches such as PPH -> UPPH are rejected;
 * 3) PPH is restored as a distinct manufacturing term from UPPH, with an independent OPL URL;
 * 4) site search result lists are post-ranked so exact title/code hits remain above broad text matches;
 * 5) legacy oversized circular hero pseudo-elements are removed sitewide when they match the old decorative-orbit pattern.
 */
(function (d, w) {
  'use strict';
  if (w.__qilyR6SearchTerminologyVisualV1) return;
  w.__qilyR6SearchTerminologyVisualV1 = true;

  var VERSION = '20260826-r6-search-terminology-visual-v1';

  function norm(value) {
    return String(value || '').normalize('NFKC').trim().toLocaleLowerCase('zh-CN').replace(/\s+/g, ' ');
  }
  function compact(value) {
    return norm(value).replace(/[\s\-_/+()（）·,.，。:：]/g, '');
  }
  function splitTerms(value) {
    return norm(value).split(/[\s,，。；;、|/]+/).filter(Boolean);
  }
  function isDateQuery(value) {
    return /^\d{4}(?:-\d{1,2})?(?:-\d{1,2})?$/.test(norm(value));
  }
  function isAcronymQuery(value) {
    return /^[a-z0-9][a-z0-9.+#&-]{1,15}$/i.test(String(value || '').trim()) && !/\s/.test(String(value || '').trim());
  }
  function weighted(value, query, exact, prefix, contains) {
    if (!value) return 0;
    if (value === query) return exact;
    if (value.indexOf(query) === 0) return prefix;
    if (value.indexOf(query) >= 0) return contains;
    return 0;
  }

  function installStyle() {
    if (d.getElementById('qilyR6SearchTerminologyVisualStyle')) return;
    var style = d.createElement('style');
    style.id = 'qilyR6SearchTerminologyVisualStyle';
    style.textContent = [
      'html body .qily-r6-no-decorative-orbit::before{content:none!important;display:none!important;border:0!important;box-shadow:none!important;background:none!important}',
      '.brief-index-card[data-qily-search-rank]{order:var(--qily-search-rank,0)}',
      '.brief-index-card[data-qily-search-rank]::before{content:none!important}',
      '.term-card[data-qily-r6-term="PPH"]{border-top-color:#caa15f}',
      '.term-card[data-qily-r6-term="PPH"] .term-code{letter-spacing:.02em}',
      '.qily-search-result[data-qily-r6-exact="true"]{border-color:#178b94;box-shadow:0 10px 24px rgba(15,75,90,.12)}'
    ].join('');
    (d.head || d.documentElement).appendChild(style);
  }

  function normalizeLegacyHeroOrbits() {
    var candidates = d.querySelectorAll('.hero,.module-hero,.daily-hero,.page-hero,.section-hero');
    Array.prototype.forEach.call(candidates, function (hero) {
      if (!w.getComputedStyle) return;
      try {
        var pseudo = w.getComputedStyle(hero, '::before');
        var width = parseFloat(pseudo.width) || 0;
        var height = parseFloat(pseudo.height) || 0;
        var radius = String(pseudo.borderRadius || '');
        var content = String(pseudo.content || '');
        var circular = width >= 180 && height >= 180 && Math.abs(width - height) <= Math.max(8, width * 0.06) && (radius.indexOf('50%') >= 0 || parseFloat(radius) >= Math.min(width, height) * 0.4);
        var decorated = pseudo.position === 'absolute' && content !== 'none' && content !== 'normal' && (pseudo.boxShadow !== 'none' || pseudo.borderTopStyle !== 'none' || pseudo.borderLeftStyle !== 'none');
        if (circular && decorated) hero.classList.add('qily-r6-no-decorative-orbit');
      } catch (error) {}
    });
  }

  function briefFields(card) {
    var meta = card.querySelector('.brief-index-meta');
    var metaTheme = meta && meta.querySelector('span');
    return {
      date: norm(card.getAttribute('data-date') || card.getAttribute('data-brief-date') || ((meta && meta.querySelector('time')) || {}).textContent),
      theme: norm(card.getAttribute('data-brief-theme') || (metaTheme || {}).textContent),
      title: norm(card.getAttribute('data-brief-title') || ((card.querySelector('h2') || {}).textContent)),
      summary: norm(card.getAttribute('data-brief-summary') || ((card.querySelector('.brief-index-summary') || {}).textContent)),
      search: norm(card.getAttribute('data-search') || card.getAttribute('data-brief-search') || card.textContent)
    };
  }

  function briefScore(card, query) {
    var f = briefFields(card);
    var terms = splitTerms(query);
    var qc = compact(query);
    var dateMode = isDateQuery(query);
    var score = 0;
    if (dateMode) {
      score += weighted(f.date, query, 7600, 6900, 5800);
      score += weighted(f.title, query, 2500, 2100, 1700);
      score += weighted(f.theme, query, 2200, 1900, 1500);
      score += weighted(f.summary, query, 900, 700, 520);
    } else {
      score += weighted(f.title, query, 6800, 5900, 4900);
      score += weighted(f.theme, query, 6200, 5300, 4400);
      score += weighted(f.summary, query, 2300, 1850, 1450);
      score += weighted(f.search, query, 1450, 1120, 820);
      score += weighted(f.date, query, 180, 130, 80);
    }
    if (qc && compact(f.title) === qc) score += 2200;
    if (qc && compact(f.theme) === qc) score += 1900;
    if (f.title.indexOf(query) >= 0) score += Math.max(0, 900 - f.title.indexOf(query) * 12);
    terms.forEach(function (term) {
      score += weighted(f.title, term, 620, 520, 420);
      score += weighted(f.theme, term, 560, 470, 380);
      score += weighted(f.summary, term, 240, 180, 130);
      score += weighted(f.search, term, 120, 90, 65);
      if (dateMode) score += weighted(f.date, term, 420, 340, 260);
    });
    return score > 0 ? score : -1;
  }

  function installCuratedBriefRanking() {
    var input = d.getElementById('briefSearch');
    var grid = d.getElementById('briefCuratedGrid');
    if (!input || !grid || input.dataset.qilyR6RankedSearch === 'true') return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.brief-index-card'));
    if (!cards.length) return;
    var original = cards.slice();
    var status = d.getElementById('briefFilterStatus');
    var year = (new URLSearchParams(w.location.search).get('year') || '').trim();
    if (!/^\d{4}$/.test(year)) year = '';

    function update() {
      var query = norm(input.value);
      var matches = [];
      var misses = [];
      original.forEach(function (card, index) {
        var fields = briefFields(card);
        var hitYear = !year || fields.date.indexOf(year + '-') === 0;
        var score = query && hitYear ? briefScore(card, query) : (hitYear ? 0 : -1);
        var hit = hitYear && (!query || score >= 0);
        card.hidden = !hit;
        card.removeAttribute('data-qily-search-rank');
        card.style.removeProperty('--qily-search-rank');
        if (hit) matches.push({ card: card, score: score, date: fields.date, index: index });
        else misses.push({ card: card, index: index });
      });
      if (query) {
        matches.sort(function (a, b) { return b.score - a.score || b.date.localeCompare(a.date) || a.index - b.index; });
      } else {
        matches.sort(function (a, b) { return a.index - b.index; });
      }
      matches.forEach(function (item, index) {
        item.card.setAttribute('data-qily-search-rank', String(index + 1));
        item.card.style.setProperty('--qily-search-rank', String(index));
        grid.appendChild(item.card);
      });
      misses.sort(function (a, b) { return a.index - b.index; }).forEach(function (item) { grid.appendChild(item.card); });
      if (status) {
        if (year && query) status.innerHTML = year + '年｜找到 ' + matches.length + ' 篇相关精选（按相关度排序）　<a href="/qilylean/daily-insights.html#brief-directory">查看全部年份</a>';
        else if (year) status.innerHTML = year + '年｜当前 ' + matches.length + ' 篇精选　<a href="/qilylean/daily-insights.html#brief-directory">查看全部年份</a>';
        else status.textContent = query ? '找到 ' + matches.length + ' 篇相关精选（标题／主题精确关联优先）' : '当前 ' + matches.length + ' 篇精选';
      }
      grid.dataset.qilySearchOrder = query ? 'relevance-first' : 'archive-order';
    }

    input.dataset.qilyR6RankedSearch = 'true';
    input.addEventListener('input', function () { w.requestAnimationFrame(update); });
    input.addEventListener('search', function () { w.requestAnimationFrame(update); });
    w.requestAnimationFrame(update);
  }

  function createPphCard() {
    var card = d.createElement('article');
    card.className = 'term-card';
    card.id = 'term-pph';
    card.tabIndex = 0;
    card.setAttribute('data-term-card', '');
    card.setAttribute('data-qily-r6-term', 'PPH');
    card.setAttribute('data-keywords', 'PPH Parts Per Hour Pieces Per Hour 每小时件数 每小时产量 小时产出 件小时产量 单位时间产出');
    card.innerHTML = '<div class="term-code">PPH</div>' +
      '<div class="term-en">Parts Per Hour / Pieces Per Hour</div>' +
      '<h3>每小时件数／每小时产量（按件计）</h3>' +
      '<p class="term-formula"><strong>计算公式／判定：</strong>PPH＝合格件数 ÷ 实际生产小时。分母只包含时间，不包含投入人数；统计时须明确对象是设备、工序、产线还是班组，以及停线和换型时间口径。</p>' +
      '<p><strong>应用场景：</strong>用于衡量以“件”为计量单位的单位时间产出，常用于小时产能、设备／工序节拍和瓶颈监控。PPH与UPPH不得混用：PPH不除以人数；UPPH＝合格产出 ÷（直接人力 × 实际生产小时），用于评价人工投入后的单位人工小时产出。若产品计量单位不是“件”，优先使用UPH作为通用单位时间产出。</p>' +
      '<div class="term-opl-actions"><a class="term-opl-open" href="/knowledge/terminology/pph.html"><span class="term-opl-open-label-v9">打开独立培训课件</span></a></div>';
    return card;
  }

  function ensurePphTerm() {
    var existing = Array.prototype.find.call(d.querySelectorAll('[data-term-card]'), function (card) {
      return compact(((card.querySelector('.term-code') || {}).textContent)) === 'pph';
    });
    if (existing) return existing;
    var upph = Array.prototype.find.call(d.querySelectorAll('[data-term-card]'), function (card) {
      return compact(((card.querySelector('.term-code') || {}).textContent)) === 'upph';
    });
    if (!upph || !upph.parentNode) return null;
    var pph = createPphCard();
    if (upph.nextSibling) upph.parentNode.insertBefore(pph, upph.nextSibling);
    else upph.parentNode.appendChild(pph);
    return pph;
  }

  function termFields(card) {
    return {
      code: norm((card.querySelector('.term-code') || {}).textContent),
      en: norm((card.querySelector('.term-en') || {}).textContent),
      zh: norm((card.querySelector('h3') || {}).textContent),
      aliases: norm(card.getAttribute('data-keywords') || ''),
      text: norm(card.textContent)
    };
  }

  function termScore(card, query) {
    var f = termFields(card);
    var qc = compact(query);
    var cc = compact(f.code);
    var score = 0;
    var acronym = isAcronymQuery(query);
    if (f.code === query || cc === qc) return 12000;
    if (f.zh === query) return 10800;
    if (f.en === query) return 10400;
    if (f.code.indexOf(query) === 0 || (qc && cc.indexOf(qc) === 0)) score += 9200;
    if (f.zh.indexOf(query) === 0) score += 7600;
    if (f.en.indexOf(query) === 0) score += 7200;
    if (f.aliases && (f.aliases === query || f.aliases.split(/\s+/).indexOf(query) >= 0)) score += 6900;
    if (!acronym) {
      if (f.code.indexOf(query) >= 0 || (qc && cc.indexOf(qc) >= 0)) score += 5200;
      if (f.zh.indexOf(query) >= 0) score += 4700;
      if (f.en.indexOf(query) >= 0) score += 3900;
      if (f.aliases.indexOf(query) >= 0) score += 3500;
      if (f.text.indexOf(query) >= 0) score += 1700;
    } else {
      if (f.en.split(/[^a-z0-9]+/).indexOf(query) >= 0) score += 3500;
      if (f.aliases.split(/\s+/).indexOf(query) >= 0) score += 3200;
    }
    return score > 0 ? score : -1;
  }

  function installTerminologyRanking() {
    var input = d.getElementById('termSearch');
    if (!input || input.dataset.qilyR6RankedSearch === 'true') return;
    ensurePphTerm();
    var results = d.querySelector('.term-search-results');
    var grid = d.getElementById('termSearchGrid');
    var empty = d.getElementById('termEmpty');
    var count = d.getElementById('termCount');
    var staticCount = d.getElementById('qilyTerminologyStaticCount');
    if (!results || !grid) return;

    function allCards() { return Array.prototype.slice.call(d.querySelectorAll('[data-term-card]')); }
    function allSections() {
      var seen = [];
      allCards().forEach(function (card) {
        var section = card.closest && card.closest('.module-section[id]');
        if (section && seen.indexOf(section) < 0) seen.push(section);
      });
      return seen;
    }
    function setCounts(total) {
      if (count && !input.value) count.textContent = '共收录 ' + total + ' 项术语 · ' + total + ' 份单点培训课件';
      if (staticCount) staticCount.innerHTML = '<strong style="color:#0f4b5a">当前术语库：</strong>' + total + ' 项术语 · ' + total + ' 份单点培训课件。数量由统一站点数据源自动核算，页面不再维护硬编码数量。';
    }
    function locate(card) {
      var code = ((card.querySelector('.term-code') || {}).textContent || '').trim();
      input.value = '';
      render();
      try { w.history.replaceState(null, '', w.location.pathname + '?term=' + encodeURIComponent(code) + '#' + card.id); } catch (error) {}
      w.requestAnimationFrame(function () {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.remove('term-focus');
        void card.offsetWidth;
        card.classList.add('term-focus');
        w.setTimeout(function () { card.classList.remove('term-focus'); }, 1900);
      });
    }
    function cloneCard(original) {
      var hit = original.cloneNode(true);
      hit.removeAttribute('id');
      hit.classList.add('term-search-hit');
      hit.setAttribute('tabindex', '0');
      hit.setAttribute('role', 'group');
      var hint = d.createElement('div');
      hint.className = 'term-jump-hint';
      hint.textContent = '点击卡片定位原词条；课件按钮直接打开独立培训页';
      hit.appendChild(hint);
      hit.addEventListener('click', function (event) {
        if (event.target.closest && event.target.closest('a,button')) return;
        locate(original);
      });
      hit.addEventListener('keydown', function (event) {
        if ((event.key === 'Enter' || event.key === ' ') && !(event.target.closest && event.target.closest('a,button'))) {
          event.preventDefault(); locate(original);
        }
      });
      return hit;
    }
    function render() {
      var query = norm(input.value);
      var cards = allCards();
      var sections = allSections();
      grid.innerHTML = '';
      if (!query) {
        sections.forEach(function (section) { section.hidden = false; });
        results.classList.remove('show');
        if (empty) empty.style.display = 'none';
        setCounts(cards.length);
        return;
      }
      var matches = cards.map(function (card, index) { return { card: card, index: index, score: termScore(card, query) }; })
        .filter(function (item) { return item.score >= 0; })
        .sort(function (a, b) { return b.score - a.score || a.index - b.index; });
      sections.forEach(function (section) { section.hidden = true; });
      results.classList.toggle('show', matches.length > 0);
      if (empty) empty.style.display = matches.length ? 'none' : 'block';
      matches.forEach(function (item) { grid.appendChild(cloneCard(item.card)); });
      if (count) count.textContent = matches.length ? '找到 ' + matches.length + ' 项相关术语（精确代码优先）' : '未找到相关术语';
      results.dataset.qilySearchOrder = 'relevance-first';
    }

    input.dataset.qilyR6RankedSearch = 'true';
    input.addEventListener('input', function () { w.requestAnimationFrame(render); });
    input.addEventListener('search', function () { w.requestAnimationFrame(render); });
    var requested = (new URLSearchParams(w.location.search).get('term') || '').trim();
    setCounts(allCards().length);
    if (requested) {
      var target = allCards().find(function (card) { return compact((card.querySelector('.term-code') || {}).textContent) === compact(requested); });
      if (target) w.setTimeout(function () { locate(target); }, 0);
    }
  }

  function renderedSearchScore(link, query) {
    var title = norm((link.querySelector('strong') || {}).textContent);
    var meta = norm((link.querySelector('.qily-search-meta') || {}).textContent);
    var snippet = norm((link.querySelector('.qily-search-snippet') || {}).textContent);
    var path = norm((link.querySelector('.qily-search-path') || {}).textContent);
    var score = 0;
    score += weighted(title, query, 9000, 7600, 6200);
    score += weighted(meta, query, 2600, 2100, 1500);
    score += weighted(snippet, query, 1600, 1250, 900);
    score += weighted(path, query, 650, 500, 320);
    if (compact(title.split('｜')[0]) === compact(query)) score += 4200;
    return score;
  }

  function syntheticPphSearchResult() {
    var link = d.createElement('a');
    link.className = 'qily-search-result';
    link.href = '/knowledge/terminology.html?term=PPH';
    link.setAttribute('data-qily-r6-exact', 'true');
    link.innerHTML = '<span class="qily-search-meta"><span class="qily-search-rank">关联 01</span><span>全站术语</span></span>' +
      '<strong>PPH｜每小时件数／每小时产量（按件计）</strong>' +
      '<span class="qily-search-path">/knowledge/terminology.html?term=PPH</span>' +
      '<span class="qily-search-snippet">PPH＝合格件数 ÷ 实际生产小时，不除以人数；UPPH以直接人力 × 实际生产小时为分母，两者不得混用。</span>' +
      '<span class="qily-search-open">打开相关网页 →</span>';
    return link;
  }

  function postRankSiteSearch(mask) {
    if (!mask) return;
    var input = mask.querySelector('.qily-search-input');
    var results = mask.querySelector('.qily-search-results');
    var status = mask.querySelector('.qily-search-status');
    if (!input || !results) return;
    var query = norm(input.value);
    if (!query) return;
    var links = Array.prototype.slice.call(results.querySelectorAll('.qily-search-result'));
    if (compact(query) === 'pph') {
      links = links.filter(function (link) {
        var code = compact(((link.querySelector('strong') || {}).textContent || '').split('｜')[0]);
        if (code === 'upph') { link.remove(); return false; }
        return true;
      });
      var exact = links.some(function (link) { return compact(((link.querySelector('strong') || {}).textContent || '').split('｜')[0]) === 'pph'; });
      if (!exact) { var pph = syntheticPphSearchResult(); results.insertBefore(pph, results.firstChild); links.unshift(pph); }
    }
    links = Array.prototype.slice.call(results.querySelectorAll('.qily-search-result'));
    links.map(function (link, index) { return { link: link, index: index, score: renderedSearchScore(link, query) }; })
      .sort(function (a, b) { return b.score - a.score || a.index - b.index; })
      .forEach(function (item, index) {
        var rank = item.link.querySelector('.qily-search-rank');
        if (rank) rank.textContent = '关联 ' + String(index + 1).padStart(2, '0');
        if (compact(((item.link.querySelector('strong') || {}).textContent || '').split('｜')[0]) === compact(query)) item.link.setAttribute('data-qily-r6-exact', 'true');
        results.appendChild(item.link);
      });
    if (status && links.length) status.textContent = '显示最相关的 ' + links.length + ' 条内容（精确标题／术语代码优先）。';
    results.dataset.qilySearchOrder = 'relevance-first';
  }

  function bindSiteSearchPostRanking() {
    function bind(mask) {
      if (!mask || mask.dataset.qilyR6PostRank === 'true') return;
      var input = mask.querySelector('.qily-search-input');
      var form = mask.querySelector('.qily-search-form');
      var suggestions = mask.querySelector('.qily-search-suggestions');
      if (!input) return;
      mask.dataset.qilyR6PostRank = 'true';
      input.addEventListener('input', function () { w.setTimeout(function () { postRankSiteSearch(mask); }, 185); });
      if (form) form.addEventListener('submit', function () { w.setTimeout(function () { postRankSiteSearch(mask); }, 0); });
      if (suggestions) suggestions.addEventListener('click', function () { w.setTimeout(function () { postRankSiteSearch(mask); }, 0); });
      var observer = w.MutationObserver ? new MutationObserver(function () {
        if (input.value) w.setTimeout(function () { postRankSiteSearch(mask); }, 0);
      }) : null;
      if (observer) observer.observe(mask.querySelector('.qily-search-results') || mask, { childList: true, subtree: false });
    }
    var current = d.getElementById('qilySearchMask');
    if (current) bind(current);
    if (!w.MutationObserver) return;
    var rootObserver = new MutationObserver(function () { bind(d.getElementById('qilySearchMask')); });
    rootObserver.observe(d.body || d.documentElement, { childList: true, subtree: true });
  }

  function install() {
    installStyle();
    normalizeLegacyHeroOrbits();
    installCuratedBriefRanking();
    installTerminologyRanking();
    bindSiteSearchPostRanking();
    d.documentElement.setAttribute('data-qily-r6-search-visual', VERSION);
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
  w.addEventListener('pageshow', function () {
    w.requestAnimationFrame(function () { normalizeLegacyHeroOrbits(); installCuratedBriefRanking(); installTerminologyRanking(); });
  }, { passive: true });
})(document, window);
