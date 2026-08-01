(function () {
  'use strict';

  var VERSION = '20260801-project-delivery-v1';
  var TERMINOLOGY_PATH = /\/knowledge\/terminology(?:\.html)?\/?$/i;

  if (!TERMINOLOGY_PATH.test(location.pathname || '')) return;

  function clean(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function findRaciCard() {
    return Array.prototype.find.call(document.querySelectorAll('[data-term-card]'), function (card) {
      var code = card.querySelector('.term-code');
      return clean(code && code.textContent).toUpperCase() === 'RACI';
    });
  }

  function patchRaciCard() {
    var card = findRaciCard();
    if (!card || card.getAttribute('data-project-delivery-sync') === VERSION) return;

    card.setAttribute('data-project-delivery-sync', VERSION);
    card.setAttribute(
      'data-keywords',
      clean((card.getAttribute('data-keywords') || '') + ' 项目管理 工程项目 交付闭环 里程碑 阶段门 责任矩阵 Responsible Accountable Consulted Informed')
    );

    var formula = card.querySelector('.term-formula');
    if (!formula) {
      formula = document.createElement('p');
      formula.className = 'term-formula';
      var firstApplication = Array.prototype.find.call(card.querySelectorAll('p'), function (node) {
        return !node.classList.contains('term-formula');
      });
      card.insertBefore(formula, firstApplication || card.querySelector('.term-opl-actions'));
    }
    formula.innerHTML = '<strong>判定口径：</strong>每个交付项只能设置一名A（最终负责者）；可以有多名R（执行者），C必须在关键决策前被征询，I应在决策或状态变化后及时知会。';

    var application = Array.prototype.find.call(card.querySelectorAll('p'), function (node) {
      return !node.classList.contains('term-formula');
    });
    if (application) {
      application.innerHTML = '<strong>应用场景：</strong>用于工程项目、NPI、设备／自动化、数字化、布局及改善项目中，把交付包、里程碑、验收证据和收益责任落实到具体角色；同一交付项不得出现多名A，也不得用“共同负责”掩盖最终责任。';
    }
  }

  function setBlock(block, html) {
    if (!block) return;
    var heading = block.querySelector('h3');
    block.innerHTML = (heading ? heading.outerHTML : '') + html;
  }

  function findBlock(content, title) {
    return Array.prototype.find.call(content.querySelectorAll('.term-opl-block'), function (block) {
      var heading = block.querySelector('h3');
      return clean(heading && heading.textContent).indexOf(title) >= 0;
    });
  }

  function patchRaciLesson() {
    var modal = document.getElementById('termOplModal');
    var content = document.getElementById('termOplContent');
    var title = document.getElementById('termOplTitle');
    if (!modal || !content || !title) return;
    if (clean(title.textContent).indexOf('RACI｜') !== 0) return;
    if (content.querySelector('[data-raci-project-delivery-patch="' + VERSION + '"]')) return;

    var subtitle = document.getElementById('termOplSubtitle');
    if (subtitle) subtitle.textContent = 'Responsible / Accountable / Consulted / Informed · 工程项目交付责任矩阵';

    var theme = modal.querySelector('.term-opl-theme');
    if (theme) theme.textContent = '主题：工程项目交付闭环 · 里程碑责任 · 风险与收益验证';

    var objective = content.querySelector('.term-opl-objective');
    if (objective) {
      objective.innerHTML = '<strong>培训目标：</strong>能够围绕一个真实工程项目，按交付包和里程碑正确区分R、A、C、I，确保每项成果只有一名最终A责任人，并把责任落实到风险处理、验收证据、收益复核和标准移交。';
    }

    setBlock(findBlock(content, '核心定义'), '<p><strong>R（Responsible）执行：</strong>完成具体工作并提交证据；<strong>A（Accountable）最终负责：</strong>对交付结果、放行和升级负责；<strong>C（Consulted）协商：</strong>在关键决策前提供专业意见；<strong>I（Informed）知会：</strong>在状态或决策变化后及时获知。RACI必须绑定明确交付物，不能只绑定模糊活动。</p>');

    setBlock(findBlock(content, '解决什么现场问题'), '<p>解决跨部门项目中“都参加、没人负责”“开会很多、决策无人签字”“任务完成但验收、收益和移交无人承接”等问题，使需求、方案、试运行、量产／正式运行、验收及收益复核各阶段责任清晰。</p>');

    setBlock(findBlock(content, '适用场景与边界'), '<p>适用于工程项目、NPI、设备与自动化、数字化系统、厂房／产线布局、降本及精益改善。每个交付项只能有一名A；多名R可以并行执行，但必须明确各自输出。C应在决策前参与，I不承担审批责任。RACI不能替代项目计划、专业标准或管理授权。</p>');

    setBlock(findBlock(content, '公式、口径与数据来源'), '<p class="term-opl-formula"><strong>核心判定：</strong>交付项＝明确输出＋唯一A＋一个或多个R＋必要C／I＋期限＋验收证据。没有唯一A、没有验收证据或责任只写“相关部门”的项目，不得判定责任闭环。</p>');

    setBlock(findBlock(content, '标准实施步骤'), '<ol><li>按项目范围和里程碑拆分可验收交付包，不按“跟进、协调、配合”等模糊动作拆分。</li><li>列出项目负责人、PE、IE、NPI、ME、IT、质量、PMC、制造、采购、财务及使用部门等真实角色。</li><li>先为每个交付项指定唯一A，由其承担结果、决策和异常升级责任。</li><li>再指定完成工作并提交证据的R；多名R必须分别写清输出。</li><li>明确哪些角色需在方案、变更、验收和收益口径确定前作为C参与。</li><li>明确哪些角色需在状态、风险、决策和版本变化后作为I及时知会。</li><li>在每次里程碑评审中核对RACI与实际执行是否一致；组织、范围或基线变化时同步更新。</li></ol>');

    setBlock(findBlock(content, '制造现场案例'), '<p class="term-opl-case">某自动化装配项目在“试运行放行”里程碑中，由项目经理担任A；设备工程、PE、IE和供应商分别作为R，提交安全、节拍、质量、稳定性和文件证据；质量、制造及使用部门作为C参与放行评审；PMC、采购和财务作为I同步状态。若节拍达标但安全联锁、SOP或维护移交未完成，A不得批准进入正式运行。</p>');

    setBlock(findBlock(content, '常见误区与异常判断'), '<ul><li>同一交付项设置两名或多名A，最终出现相互等待。</li><li>把部门名称写成责任人，未落实到具体岗位或角色。</li><li>所有参与者都标R，实际交付物、接口和完成标准不清。</li><li>把I当成审批人，或在决策完成后才征询本应作为C的专业部门。</li><li>RACI只在立项时填写，范围、人员或里程碑变化后不更新。</li><li>任务被勾选完成，但验收证据、收益复核和使用部门移交没有A承接。</li></ul>');

    setBlock(findBlock(content, '责任与输出记录'), '<p><strong>责任：</strong>项目负责人维护RACI并组织复核；各交付项A对结果和放行负责；R按计划提交可核验输出；C／I按约定接口参与。</p><p style="margin-top:9px"><strong>输出：</strong>项目章程或任务书、交付包清单、里程碑计划、RACI矩阵、风险／问题／变更台账、评审纪要、验收证据、收益复核及标准移交记录。</p>');

    setBlock(findBlock(content, '培训确认题'), '<div class="term-opl-check"><div class="term-opl-question"><strong>Q1：</strong>为什么一个交付项只能设置一名A？</div><div class="term-opl-question"><strong>Q2：</strong>R与A分别对什么负责，能否由同一角色兼任？</div><div class="term-opl-question"><strong>Q3：</strong>C与I的参与时点有什么区别？</div><div class="term-opl-question"><strong>Q4：</strong>请为一个当前项目的下一里程碑列出交付物、A、R、C、I和验收证据。</div></div><details class="term-opl-answer"><summary>展开讲师确认要点</summary><p>回答必须说明：A对最终结果、放行和升级负责且原则上唯一；R完成具体工作并提交证据，A可在小型任务中兼任R；C在决策前征询，I在状态或决策变化后知会；RACI必须落到真实交付物、期限和验收证据。</p></details>');

    var source = document.createElement('div');
    source.setAttribute('data-raci-project-delivery-patch', VERSION);
    source.className = 'term-opl-objective';
    source.style.marginTop = '18px';
    source.innerHTML = '<strong>内容同步：</strong>本课件已依据2026年8月1日《工程项目不是“做完”：用里程碑、风险、资源与收益形成交付闭环》更新，重点强化“唯一A责任人、里程碑放行、验收证据与收益移交”。';
    var contact = content.querySelector('.term-opl-contact-card');
    content.insertBefore(source, contact || null);
  }

  function initialize() {
    patchRaciCard();
    patchRaciLesson();

    var modal = document.getElementById('termOplModal');
    if (modal && window.MutationObserver) {
      new MutationObserver(function () {
        patchRaciLesson();
      }).observe(modal, { childList: true, subtree: true, characterData: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
