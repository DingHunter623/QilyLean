(function () {
  'use strict';

  var VERSION = '20260828-knowledge-asset-v2';
  var TERMINOLOGY_PATH = /\/knowledge\/terminology(?:\.html)?\/?$/i;
  if (!TERMINOLOGY_PATH.test(location.pathname || '')) return;

  var themeBySection = {
    lean: '主题：精益生产 · 工业工程 · PQCD改善落地',
    ie: '主题：工业工程IE · 标准工时 · 产能与效率改善',
    engineering: '主题：NPI · 工程开发 · 量产验证与项目交付',
    quality: '主题：质量策划 · 过程能力 · 问题解决与防再发',
    production: '主题：PMC · 产能排程 · 物料与交付闭环',
    digital: '主题：ERP / MES / APS · 主数据 · 数智化工厂',
    manufacturing: '主题：制造工艺 · 设备可靠性 · 安全与质量',
    management: '主题：项目管理 · 责任机制 · 持续改善闭环',
    brand: '主题：制造运营 · 工程改善 · 精益赋能与数智固化'
  };

  var related = {
    'TT': ['CT', 'ST', 'Line Balance Rate', 'UPPH'],
    'CT': ['TT', 'ST', 'Yamazumi', 'Bottleneck'],
    'ST': ['CT', 'TT', 'UPPH', 'CRP'],
    'UPPH': ['UPH', 'ST', 'Line Balance Rate', 'OEE'],
    'OEE': ['MTBF', 'MTTR', 'TPM', 'FPY'],
    'MTBF': ['MTTR', 'OEE', 'TPM'],
    'MTTR': ['MTBF', 'OEE', 'TPM'],
    'VSM': ['PCE', 'WIP', 'TT', 'FIFO'],
    'SMED': ['ECRS', 'OEE', 'Standard Work'],
    'ECRS': ['SMED', 'Yamazumi', 'Line Balancing'],
    'Line Balancing': ['TT', 'CT', 'Yamazumi', 'Bottleneck'],
    'Line Balance Rate': ['TT', 'CT', 'UPPH'],
    'Pilot': ['PDCA', 'RACI', 'APQP', 'PPAP'],
    'RACI': ['Pilot', 'PDCA', 'APQP'],
    'APQP': ['PPAP', 'FMEA', 'Control Plan', 'MSA'],
    'PPAP': ['APQP', 'PFMEA', 'Control Plan', 'MSA'],
    'FMEA': ['PFMEA', 'Control Plan', 'Poka-Yoke'],
    'PFMEA': ['FMEA', 'Control Plan', 'Poka-Yoke'],
    'FPY': ['DPPM', 'COPQ', 'SPC', 'Poka-Yoke'],
    '8D': ['RCA', '5Why', 'FMEA'],
    'ERP': ['MES', 'APS', 'WMS'],
    'MES': ['ERP', 'APS', 'Andon'],
    'APS': ['ERP', 'MES', 'RCCP', 'CRP'],
    'RCCP': ['CRP', 'MPS', 'APS'],
    'CRP': ['RCCP', 'MPS', 'ST'],
    'WIP': ['VSM', 'FIFO', 'Kanban', 'Pull System'],
    'FIFO': ['WIP', 'Kanban', 'Pull System'],
    'Kanban': ['Pull System', 'JIT', 'WIP'],
    'One-piece Flow': ['TT', 'Line Balancing', 'WIP', 'Standard Work'],
    'PDCA': ['5Why', 'RACI', 'Pilot'],
    'Poka-Yoke': ['PFMEA', 'FPY', 'Jidoka']
  };

  var fallbackBySection = {
    lean: ['PDCA', 'VSM', 'TT'],
    ie: ['TT', 'CT', 'ST'],
    engineering: ['APQP', 'PPAP', 'Pilot'],
    quality: ['PFMEA', 'FPY', '8D'],
    production: ['MPS', 'RCCP', 'CRP'],
    digital: ['ERP', 'MES', 'APS'],
    manufacturing: ['Standard Work', 'TPM', 'Poka-Yoke'],
    management: ['PDCA', 'RACI', 'Pilot'],
    brand: ['PDCA', 'VSM', 'OEE']
  };

  function clean(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function codeOf(card) {
    var node = card && card.querySelector('.term-code');
    return clean(node && node.textContent);
  }

  function sectionOf(card) {
    var section = card && card.closest('.module-section[id]');
    return section ? section.id : 'brand';
  }

  function currentCard() {
    var title = document.getElementById('termOplTitle');
    var code = clean(title && title.textContent).split('｜')[0];
    if (!code) return null;
    return Array.prototype.find.call(document.querySelectorAll('[data-term-card]'), function (card) {
      return codeOf(card).toLocaleLowerCase('zh-CN') === code.toLocaleLowerCase('zh-CN');
    }) || null;
  }

  function oplHref(code) {
    return '/knowledge/terminology.html?opl=' + encodeURIComponent(code);
  }

  function addChip(container, href, label, primary) {
    var link = document.createElement('a');
    link.className = 'term-opl-related-chip' + (primary ? ' primary' : '');
    link.href = href;
    link.textContent = label;
    container.appendChild(link);
  }

  function patchHeader(card) {
    var modal = document.getElementById('termOplModal');
    if (!modal || !card) return;
    var theme = modal.querySelector('.term-opl-theme');
    var section = sectionOf(card);
    if (theme) theme.textContent = themeBySection[section] || themeBySection.brand;
  }

  function patchCaseSignal(content) {
    var blocks = Array.prototype.slice.call(content.querySelectorAll('.term-opl-block'));
    var caseBlock = blocks.find(function (block) {
      var h = block.querySelector('h3');
      return clean(h && h.textContent).indexOf('制造现场案例') >= 0;
    });
    if (!caseBlock || caseBlock.querySelector('[data-opl-case-rule="' + VERSION + '"]')) return;
    var note = document.createElement('div');
    note.className = 'term-opl-case-rule';
    note.setAttribute('data-opl-case-rule', VERSION);
    note.innerHTML = '<strong>案例判定：</strong>应用场景必须落到具体对象、事实数据、适用边界与验证证据；仅列概念或口号，不视为完成一次OPL应用说明。';
    caseBlock.appendChild(note);
  }

  function patchRelated(card) {
    var content = document.getElementById('termOplContent');
    if (!content || !card) return;
    Array.prototype.slice.call(content.querySelectorAll('.term-opl-related-v2')).forEach(function (node) { node.remove(); });

    var code = codeOf(card);
    var section = sectionOf(card);
    var candidates = (related[code] || fallbackBySection[section] || fallbackBySection.brand)
      .filter(function (item, index, all) { return item && item !== code && all.indexOf(item) === index; })
      .slice(0, 4);

    var module = document.createElement('section');
    module.className = 'term-opl-related-v2';
    module.setAttribute('data-opl-related', VERSION);
    module.innerHTML = '<div class="term-opl-related-heading"><span>KNOWLEDGE LINKAGE</span><h3>关联知识与交付链</h3><p>从单点知识继续连接上游条件、下游应用、代表项目与业务承接，避免术语孤立学习。</p></div><div class="term-opl-related-chips"></div>';
    var chips = module.querySelector('.term-opl-related-chips');
    candidates.forEach(function (item, index) { addChip(chips, oplHref(item), (index === 0 ? '主关联 · ' : '') + item, index === 0); });
    addChip(chips, '/qilylean/daily-insights.html', '精选简报', false);
    addChip(chips, '/projects/', '代表项目', false);
    addChip(chips, '/cooperation/', '相关业务能力', false);

    var contact = content.querySelector('.term-opl-contact-card');
    content.insertBefore(module, contact || null);
  }

  function patch() {
    var modal = document.getElementById('termOplModal');
    var content = document.getElementById('termOplContent');
    if (!modal || modal.hidden || !content) return;
    var card = currentCard();
    if (!card) return;
    patchHeader(card);
    patchCaseSignal(content);
    patchRelated(card);
  }

  function initialize() {
    var modal = document.getElementById('termOplModal');
    if (!modal) return;
    patch();
    if (window.MutationObserver) {
      var busy = false;
      new MutationObserver(function () {
        if (busy) return;
        busy = true;
        requestAnimationFrame(function () { patch(); busy = false; });
      }).observe(modal, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['hidden'] });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
