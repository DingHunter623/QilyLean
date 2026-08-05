(function () {
  'use strict';

  var VERSION = 'v3';
  var TARGET_IDS = ['career-2019-2025', 'career-2015-2019', 'career-2009-2015', 'career-2006-2009'];

  var summaries = {
    'career-2015-2019': '聚焦LED背光源与PCBA制造，持续推进生产工艺优化、品质异常处理、量产稳定性改善及生产效率提升。进一步强化跨部门协同、现场工程改善与项目推进能力，为后续精益运营和制造项目管理奠定基础。',
    'career-2009-2015': '长期从事保险丝生产技术与PE工程，产品工艺涵盖SMD、DIP、砖块保险丝、陶瓷管／玻璃管保险丝及汽车插片保险丝，负责工艺优化、设备与品质异常处理及量产稳定性改善。随后逐步转向IE工程，围绕标准工时、产能分析、工序平衡、人员配置、效率提升与现场改善，形成由生产技术、PE工程向IE工程延伸的能力路径。',
    'career-2006-2009': '参与摩托罗拉、诺基亚、华为等品牌手机，以及戴尔、华硕、联想等品牌电脑与服务器产品的PCBA测试、异常分析、维修验证和量产支持。随后延伸至工业工程领域，围绕标准工时、生产效率、工序平衡、流程优化与现场改善，建立制造工程与IE改善基础。'
  };

  var companies = {
    jinggon: {
      english: 'Guangdong Jinggon Intelligence System Co., Ltd.',
      chinese: '广东精工智能系统有限公司',
      website: 'https://www.jinggon.com/',
      websiteLabel: '官方网站：JINGGON｜精工智能（www.jinggon.com）'
    },
    gaosheng: {
      english: 'GO-think（官方英文品牌）',
      chinese: '广东高胜互联科技有限公司',
      website: 'https://www.gdgaosheng.cn/',
      websiteLabel: '官方网站：GO-think｜高胜咨询（www.gdgaosheng.cn）'
    },
    mason: {
      english: 'Shenzhen Mason Technologies Co., Ltd.',
      chinese: '深圳万润科技股份有限公司',
      website: 'https://www.masonled.com/',
      websiteLabel: '上市公司官方网站：MASON｜万润科技（www.masonled.com）'
    },
    hengrun: {
      english: 'MASON LED（官方品牌）',
      chinese: '广东恒润光电有限公司',
      website: 'https://www.mason-led.com/',
      websiteLabel: '子公司官方网站：MASON LED｜恒润光电（www.mason-led.com）'
    },
    cooper: {
      english: 'Dongguan Cooper Electronics Co., Ltd.',
      chinese: '东莞库柏电子有限公司',
      website: 'https://www.eaton.com.cn/cn/zh-cn.html',
      websiteLabel: '现集团官方网站：Eaton｜伊顿'
    },
    flex: {
      english: 'Flextronics Manufacturing (Zhuhai) Co., Ltd.',
      chinese: '伟创力制造（珠海）有限公司',
      website: 'https://flex.com/zh/',
      websiteLabel: '官方网站：Flex｜伟创力'
    }
  };

  function companyLine(company) {
    return '<p class="career-company-line"><b>任职公司：</b><span class="career-company-name"><span lang="en">' + company.english + '</span><span aria-hidden="true">｜</span><span>' + company.chinese + '</span></span><a class="career-company-official" href="' + company.website + '" target="_blank" rel="noopener noreferrer external">' + company.websiteLabel + ' ↗</a></p>';
  }

  function companyGroup(companyKeys) {
    return '<div class="career-company-group" aria-label="任职公司与官方网站">' + companyKeys.map(function (key) {
      return companyLine(companies[key]);
    }).join('') + '</div>';
  }

  function ensureCompanyGroup(card, companyKeys) {
    if (!card || card.querySelector('.career-company-group')) return;
    var heading = card.querySelector('h3');
    if (!heading) return;
    heading.insertAdjacentHTML('afterend', companyGroup(companyKeys));
  }

  function insertSummary(card, id) {
    if (!card || card.querySelector('.career-stage-summary')) return;
    var heading = card.querySelector('h3');
    if (!heading) return;
    var summary = document.createElement('p');
    summary.className = 'career-stage-summary';
    summary.textContent = summaries[id];
    heading.insertAdjacentElement('afterend', summary);
  }

  function markExistingCard(card, id, exactPeriod) {
    if (!card) return null;
    card.id = id;
    card.dataset.qilyEarlyCareerCard = 'true';
    card.dataset.qilyEarlyCareerHistory = VERSION;
    var period = card.querySelector('small');
    if (period && exactPeriod) period.textContent = exactPeriod;
    return card;
  }

  function findCard(grid, expression) {
    return Array.prototype.slice.call(grid.querySelectorAll('.career-full-card')).find(function (card) {
      return expression.test(card.textContent || '');
    });
  }

  function buildCard(id, period, title, summary, companyKeys, industry, duties, results, resultText) {
    var article = document.createElement('article');
    article.className = 'career-full-card';
    article.id = id;
    article.dataset.qilyEarlyCareerCard = 'true';
    article.dataset.qilyEarlyCareerHistory = VERSION;
    article.innerHTML = [
      '<small>' + period + '</small>',
      '<h3>' + title + '</h3>',
      companyGroup(companyKeys),
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
    var combined = findCard(grid, /2006\.07[—–-]2015\.06/);
    if (!combined) return;

    var fuseCard = buildCard(
      'career-2009-2015',
      '2009.07—2015.06｜保险丝制造｜生产技术、先后PE工程、IE工程（美资企业：东莞库柏电子）',
      '保险丝生产技术／先后PE工程、IE工程',
      summaries['career-2009-2015'],
      ['cooper'],
      '覆盖SMD、DIP、砖块保险丝、陶瓷管／玻璃管保险丝及汽车插片保险丝等产品与工艺形态。',
      [
        '负责保险丝制程参数、设备与工装、品质异常、量产稳定性及工艺标准维护，推动现场问题由临时处理转为参数、方法和标准闭环。',
        '先后承担PE工程与IE工程职责，开展Time Study、标准工时、产能分析、工序平衡、人员配置、动作改善及效率提升。',
        '围绕玻璃管切割、烧口、夹脚、沾银、镀铜及DAP真空熔炉等关键环节开展制程分析、试验验证和标准固化。'
      ],
      [
        '保险丝玻璃管切口与夹脚断裂问题经刀具、参数和定位改善后，断裂率由约12%降至1%以内。',
        'DAP真空熔炉程序与沾银陶瓷管工艺优化后，关键制程直通率提升至96%以上。',
        '建立由生产技术与PE工程向标准工时、产能、人力和线平衡管理延伸的IE工作基础。'
      ],
      '能力沉淀：保险丝多工艺制程技术、PE异常闭环、Time Study、标准工时、产能与人力配置，以及生产技术、PE工程向IE工程的完整能力转化。'
    );

    var pcbaCard = buildCard(
      'career-2006-2009',
      '2006.07—2009.06｜PCBA TE工程／IE工程（欧美合资企业：珠海伟创力制造）',
      'PCBA TE工程／IE工程',
      summaries['career-2006-2009'],
      ['flex'],
      '涵盖摩托罗拉、诺基亚、华为等品牌手机，以及戴尔、华硕、联想等品牌电脑与服务器产品。',
      [
        '参与PCBA测试、故障定位、异常分析、维修验证、测试结果确认及量产支持，协同生产、品质和工程人员关闭现场问题。',
        '由TE工程逐步延伸至IE工程，开展作业观察、时间研究、标准工时、工序平衡、产能评估和现场流程优化。',
        '参与SOP／SWI整理、测试与作业方法标准化、制程效率改善及量产异常的5M2E分析。'
      ],
      [
        '形成从测试现象、故障定位、维修验证到量产恢复的基础工程闭环。',
        '建立Time Study、标准工时、线平衡、流程优化与现场改善的工业工程基础。',
        '积累手机、电脑及服务器PCBA多产品制造与测试场景经验。'
      ],
      '基础沉淀：PCBA TE测试与异常分析、维修验证、标准工时、工序平衡、产能评估及制造现场IE方法。'
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

    var consultingCard = document.getElementById('career-2019-2025') || findCard(grid, /2019\.07[—–-]2025\.08/);
    consultingCard = markExistingCard(
      consultingCard,
      'career-2019-2025',
      '2019.07—2025.08｜广东精工智能系统 / 广东高胜互联科技（集团内调动）'
    );
    ensureCompanyGroup(consultingCard, ['jinggon', 'gaosheng']);

    var existing2015 = document.getElementById('career-2015-2019') || findCard(grid, /2015\.07[—–-]2019\.06/);
    existing2015 = markExistingCard(
      existing2015,
      'career-2015-2019',
      '2015.07—2019.06｜深圳万润科技·广东恒润光电有限公司（上市公司：万润科技）'
    );
    insertSummary(existing2015, 'career-2015-2019');
    ensureCompanyGroup(existing2015, ['mason', 'hengrun']);

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
