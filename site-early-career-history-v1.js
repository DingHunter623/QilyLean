(function () {
  'use strict';

  var VERSION = 'v1';
  var TARGET_IDS = ['career-2015-2019', 'career-2009-2015', 'career-2006-2009'];

  var summaries = {
    'career-2015-2019': '聚焦LED背光源与PCBA制造，持续推进生产工艺优化、品质异常处理、量产稳定性改善及生产效率提升。进一步强化跨部门协同、现场工程改善与项目推进能力，为后续精益运营和制造项目管理奠定基础。',
    'career-2009-2015': '长期从事保险丝生产技术与PE工程，产品工艺涵盖SMD、DIP、砖块保险丝、陶瓷管／玻璃管保险丝及汽车插片保险丝，负责工艺优化、设备与品质异常处理及量产稳定性改善。随后逐步转向IE工程，围绕标准工时、产能分析、工序平衡、人员配置、效率提升与现场改善，形成由生产技术、PE工程向IE工程延伸的能力路径。',
    'career-2006-2009': '参与摩托罗拉、诺基亚、华为等品牌手机，以及戴尔、华硕、联想等品牌电脑与服务器产品的PCBA测试、异常分析、维修验证和量产支持。随后延伸至工业工程领域，围绕标准工时、生产效率、工序平衡、流程优化与现场改善，建立制造工程与IE改善基础。'
  };

  function insertSummary(card, id) {
    if (!card || card.querySelector('.career-stage-summary')) return;
    var heading = card.querySelector('h3');
    if (!heading) return;
    var summary = document.createElement('p');
    summary.className = 'career-stage-summary';
    summary.textContent = summaries[id];
    heading.insertAdjacentElement('afterend', summary);
  }

  function buildCard(id, period, title, summary, industry, duties, results, resultText) {
    var article = document.createElement('article');
    article.className = 'career-full-card';
    article.id = id;
    article.dataset.qilyEarlyCareerCard = 'true';
    article.dataset.qilyEarlyCareerHistory = VERSION;
    article.innerHTML = [
      '<small>' + period + '</small>',
      '<h3>' + title + '</h3>',
      '<p class="career-stage-summary">' + summary + '</p>',
      '<p class="career-industry"><b>制造与工程场景：</b>' + industry + '</p>',
      '<h4>职责范围</h4><ul>' + duties.map(function (item) { return '<li>' + item + '</li>'; }).join('') + '</ul>',
      '<h4>关键成果与能力沉淀</h4><ul>' + results.map(function (item) { return '<li>' + item + '</li>'; }).join('') + '</ul>',
      '<div class="career-result">' + resultText + '</div>'
    ].join('');
    return article;
  }

  function splitEarlyCareerCard(grid) {
    if (!grid || document.getElementById('career-2009-2015') || document.getElementById('career-2006-2009')) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.career-full-card'));
    var combined = cards.find(function (card) {
      return /2006\.07[—–-]2015\.06/.test(card.textContent || '');
    });
    if (!combined) return;

    var fuseCard = buildCard(
      'career-2009-2015',
      '2009.07—2015.06｜保险丝制造｜生产技术、PE转IE工程',
      '保险丝生产技术／PE转IE工程',
      summaries['career-2009-2015'],
      '覆盖SMD、DIP、砖块保险丝、陶瓷管／玻璃管保险丝及汽车插片保险丝等产品与工艺形态。',
      [
        '负责保险丝制程参数、设备与工装、品质异常、量产稳定性及工艺标准维护，推动现场问题由临时处理转为参数、方法和标准闭环。',
        '由PE工程逐步延伸至IE工程，开展Time Study、标准工时、产能分析、工序平衡、人员配置、动作改善及效率提升。',
        '围绕玻璃管切割、烧口、夹脚、沾银、镀铜及DAP真空熔炉等关键环节开展制程分析、试验验证和标准固化。'
      ],
      [
        '保险丝玻璃管切口与夹脚断裂问题经刀具、参数和定位改善后，断裂率由约12%降至1%以内。',
        'DAP真空熔炉程序与沾银陶瓷管工艺优化后，关键制程直通率提升至96%以上。',
        '建立由生产技术与PE工程向标准工时、产能、人力和线平衡管理延伸的IE工作基础。'
      ],
      '能力沉淀：保险丝多工艺制程技术、PE异常闭环、Time Study、标准工时、产能与人力配置，以及PE向IE工程的完整能力转化。'
    );

    var pcbaCard = buildCard(
      'career-2006-2009',
      '2006.07—2009.06｜PCBA测试工程／工业工程',
      'PCBA测试工程／工业工程',
      summaries['career-2006-2009'],
      '涵盖摩托罗拉、诺基亚、华为等品牌手机，以及戴尔、华硕、联想等品牌电脑与服务器产品。',
      [
        '参与PCBA测试、故障定位、异常分析、维修验证、测试结果确认及量产支持，协同生产、品质和工程人员关闭现场问题。',
        '由测试工程逐步延伸至工业工程，开展作业观察、时间研究、标准工时、工序平衡、产能评估和现场流程优化。',
        '参与SOP／SWI整理、测试与作业方法标准化、制程效率改善及量产异常的5M2E分析。'
      ],
      [
        '形成从测试现象、故障定位、维修验证到量产恢复的基础工程闭环。',
        '建立Time Study、标准工时、线平衡、流程优化与现场改善的工业工程基础。',
        '积累手机、电脑及服务器PCBA多产品制造与测试场景经验。'
      ],
      '基础沉淀：PCBA测试与异常分析、维修验证、标准工时、工序平衡、产能评估及制造现场工业工程方法。'
    );

    combined.replaceWith(fuseCard, pcbaCard);
  }

  function scrollToHash() {
    var id = (location.hash || '').replace(/^#/, '');
    if (TARGET_IDS.indexOf(id) === -1) return;
    var target = document.getElementById(id);
    if (!target) return;
    window.setTimeout(function () {
      target.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }, 80);
  }

  function apply() {
    var grid = document.querySelector('.career-full-grid');
    if (!grid) return false;

    var existing2015 = document.getElementById('career-2015-2019');
    if (!existing2015) {
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.career-full-card'));
      existing2015 = cards.find(function (card) {
        return /2015\.07[—–-]2019\.06/.test(card.textContent || '');
      });
      if (existing2015) {
        existing2015.id = 'career-2015-2019';
        existing2015.dataset.qilyEarlyCareerCard = 'true';
        existing2015.dataset.qilyEarlyCareerHistory = VERSION;
      }
    }
    insertSummary(existing2015, 'career-2015-2019');
    splitEarlyCareerCard(grid);

    var complete = TARGET_IDS.every(function (id) { return Boolean(document.getElementById(id)); });
    if (complete) {
      document.documentElement.dataset.qilyEarlyCareerHistory = VERSION;
      scrollToHash();
    }
    return complete;
  }

  function start() {
    if (apply()) return;
    var observer = new MutationObserver(function () {
      if (apply()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(function () { observer.disconnect(); apply(); }, 10000);
  }

  window.addEventListener('hashchange', function () { apply(); scrollToHash(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
