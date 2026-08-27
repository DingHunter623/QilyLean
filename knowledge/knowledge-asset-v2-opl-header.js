(function () {
  'use strict';

  var VERSION = '20260828-opl-header-v2';
  var TERMINOLOGY_PATH = /\/knowledge\/terminology(?:\.html)?\/?$/i;
  if (!TERMINOLOGY_PATH.test(location.pathname || '')) return;

  var THEMES = {
    lean: '主题：精益生产 · 工业工程IE · PQCD改善落地',
    ie: '主题：工业工程IE · 标准工时 · 产能与效率改善',
    engineering: '主题：NPI · 工程开发 · 量产验证与项目交付',
    quality: '主题：质量策划 · 过程能力 · 问题解决与防再发',
    production: '主题：PMC · 产能排程 · 物料与交付闭环',
    digital: '主题：ERP / MES / APS · 主数据 · 数智化工厂',
    manufacturing: '主题：制造工艺 · 设备可靠性 · 安全与质量',
    management: '主题：项目管理 · 责任机制 · 持续改善闭环',
    brand: '主题：制造运营 · 工程改善 · 精益赋能与数智固化'
  };

  var PURPOSE = {
    lean: '从现场事实、节拍与损失出发，形成可量化、可验证、可标准化的改善。',
    ie: '把时间、产能、人力与流程转换为可计算的工程决策基础。',
    engineering: '以版本、风险、验证证据和阶段门保证设计向稳定量产转换。',
    quality: '用统一判定口径、过程证据与防再发机制守住客户质量边界。',
    production: '把订单、物料、能力、排程和实绩连接成可执行的交付闭环。',
    digital: '先统一业务流程与主数据，再用系统固化现场真实业务闭环。',
    manufacturing: '让工艺、设备、文件、安全与质量要求在现场稳定执行并可追溯。',
    management: '把目标、责任、里程碑、风险和验收证据连接成项目闭环。',
    brand: '围绕制造问题建立事实基线，以工程方法验证改善并形成组织资产。'
  };

  function clean(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function codeFromTitle() {
    var title = document.getElementById('termOplTitle');
    return clean(title && title.textContent).split('｜')[0];
  }

  function currentCard(code) {
    if (!code) return null;
    var target = code.toLocaleLowerCase('zh-CN');
    return Array.prototype.find.call(document.querySelectorAll('[data-term-card]'), function (card) {
      var node = card.querySelector('.term-code');
      return clean(node && node.textContent).toLocaleLowerCase('zh-CN') === target;
    }) || null;
  }

  function domainOf(card) {
    var section = card && card.closest('.module-section[id]');
    var id = clean(section && section.id).toLowerCase();
    return THEMES[id] ? id : 'brand';
  }

  function apply() {
    var modal = document.getElementById('termOplModal');
    if (!modal || modal.hidden) return;
    var code = codeFromTitle();
    var card = currentCard(code);
    if (!card) return;
    var domain = domainOf(card);
    var theme = modal.querySelector('.term-opl-theme');
    if (theme) {
      theme.textContent = THEMES[domain];
      theme.setAttribute('data-opl-header-domain', domain);
      theme.setAttribute('data-opl-header-version', VERSION);
    }

    var content = document.getElementById('termOplContent');
    if (!content) return;
    var objective = content.querySelector('.term-opl-objective');
    if (!objective || content.querySelector('[data-opl-purpose="' + VERSION + '"]')) return;
    var note = document.createElement('div');
    note.className = 'term-opl-objective term-opl-purpose-v2';
    note.setAttribute('data-opl-purpose', VERSION);
    note.innerHTML = '<strong>本课管理定位：</strong>' + PURPOSE[domain];
    objective.insertAdjacentElement('afterend', note);
  }

  function initialize() {
    var modal = document.getElementById('termOplModal');
    if (!modal) return;
    apply();
    if (window.MutationObserver) {
      var scheduled = false;
      new MutationObserver(function () {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(function () { scheduled = false; apply(); });
      }).observe(modal, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['hidden'] });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
