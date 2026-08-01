(function () {
  'use strict';

  var VERSION = '20260801-sponsor-v1';
  var TERMINOLOGY_PATH = /\/knowledge\/terminology(?:\.html)?\/?$/i;
  if (!TERMINOLOGY_PATH.test(location.pathname || '')) return;

  function clean(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function updateCount() {
    var total = document.querySelectorAll('[data-term-card]').length;
    var count = document.getElementById('termCount');
    if (count && total > 0) count.textContent = '共收录 ' + total + ' 项术语 · ' + total + ' 份单点培训课件';
    var meta = document.querySelector('meta[name="description"]');
    if (meta && total > 0) meta.setAttribute('content', String(meta.getAttribute('content') || '').replace(/\d+项中文诠释/, total + '项中文诠释'));
  }

  function ensureSponsorCard() {
    var exists = Array.prototype.some.call(document.querySelectorAll('[data-term-card]'), function (card) {
      var code = card.querySelector('.term-code');
      return clean(code && code.textContent).toLowerCase() === 'sponsor';
    });
    if (exists) { updateCount(); return; }

    var grid = document.querySelector('.term-grid');
    if (!grid) return;

    var card = document.createElement('article');
    card.className = 'term-card';
    card.id = 'term-sponsor';
    card.setAttribute('data-term-card', '');
    card.setAttribute('tabindex', '0');
    card.setAttribute('data-keywords', 'Sponsor Project Sponsor 项目发起人 项目主责高层 项目赞助人 高层支持 资源授权 里程碑评审 风险升级 跨部门协调 收益确认 项目池');
    card.innerHTML = [
      '<div class="term-code">Sponsor</div>',
      '<div class="term-en">Project Sponsor</div>',
      '<h3>项目发起人／项目主责高层</h3>',
      '<p class="term-formula"><strong>核心口径：</strong>Sponsor代表组织层面对项目进行授权与背书，负责确认项目价值、保障关键资源、主持或参与重大里程碑评审，并在跨部门障碍或重大风险超出项目经理权限时推动升级解决。</p>',
      '<p><strong>应用场景：</strong>用于A类客户交付、重大质量／安全、量产爬坡、自动化、降本、工厂规划及数智化项目。Sponsor不替代项目经理做日常计划，也不等同于“出资赞助人”；在制造企业中更适合解释为“项目发起人”或“项目主责高层”。</p>',
      '<div class="term-opl-actions"><a class="term-opl-open" href="/knowledge/terminology/sponsor.html">查看单点培训课件</a><span class="term-opl-note">独立网址 · 在线阅览</span></div>'
    ].join('');
    grid.appendChild(card);
    updateCount();

    var params = new URLSearchParams(location.search || '');
    if (clean(params.get('term')).toLowerCase() === 'sponsor' || location.hash === '#term-sponsor') {
      setTimeout(function () {
        card.classList.add('term-focus');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 120);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureSponsorCard, { once: true });
  else ensureSponsorCard();
})();
