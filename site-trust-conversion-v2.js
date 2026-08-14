/* QilyLean sitewide trust + customer-decision closure v2 | 2026-08-05 */
(function (d, w) {
  'use strict';
  if (w.__qilyTrustConversionV2) return;
  w.__qilyTrustConversionV2 = true;

  var REVIEW_DATE = '2026-08-07';
  var path = (location.pathname || '/').replace(/\/+$/, '') || '/';

  function ensureCss() {
    var id = 'qilyTrustConversionV2Stylesheet';
    var href = '/site-trust-conversion-v2.css?v=20260805-trust-conversion-v2';
    var node = d.getElementById(id);
    if (node) {
      if (node.getAttribute('href') !== href) node.setAttribute('href', href);
      return;
    }
    node = d.createElement('link');
    node.id = id;
    node.rel = 'stylesheet';
    node.href = href;
    (d.head || d.documentElement).appendChild(node);
  }

  function create(tag, className, html) {
    var node = d.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function buildSection(options) {
    var section = create('section', 'qtc-section' + (options.alt ? ' qtc-alt' : ''));
    if (options.id) section.id = options.id;
    section.setAttribute('data-qtc-source', options.source || 'site-trust-conversion-v2');
    section.innerHTML = '<div class="qtc-inner">' +
      '<div class="qtc-heading">' +
      (options.kicker ? '<span class="qtc-kicker">' + options.kicker + '</span>' : '') +
      '<h2>' + options.title + '</h2>' +
      (options.description ? '<p>' + options.description + '</p>' : '') +
      '</div>' + (options.body || '') + '</div>';
    return section;
  }

  function insertAfterHero(node) {
    var hero = d.querySelector('main > .hero, main > .module-hero, .hero, .module-hero');
    if (hero && hero.parentNode) {
      hero.parentNode.insertBefore(node, hero.nextSibling);
      return true;
    }
    var main = d.querySelector('main');
    if (main) {
      main.insertBefore(node, main.firstChild);
      return true;
    }
    return false;
  }

  function insertBeforeTarget(node, selector) {
    var target = d.querySelector(selector);
    if (target && target.parentNode) {
      target.parentNode.insertBefore(node, target);
      return true;
    }
    return insertAfterHero(node);
  }

  function addStructuredData() {
    if (d.getElementById('qtcStructuredDataV2')) return;
    var script = d.createElement('script');
    script.id = 'qtcStructuredDataV2';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': 'https://qilylean.com/#website',
          url: 'https://qilylean.com/',
          name: 'QilyLean｜启力精益',
          description: '精益生产、工程改善与数智工厂专业实践平台',
          inLanguage: 'zh-CN',
          publisher: { '@id': 'https://qilylean.com/#person' }
        },
        {
          '@type': 'Person',
          '@id': 'https://qilylean.com/#person',
          name: '丁启利',
          url: 'https://qilylean.com/',
          jobTitle: '制造改善、工业工程与精益项目实践者',
          brand: { '@type': 'Brand', name: 'QilyLean｜启力精益' },
          knowsAbout: ['精益生产', '工业工程', '新工厂规划', '目视化项目', '数智化工厂', 'ERP/MES/APS制造协同']
        }
      ]
    });
    (d.head || d.documentElement).appendChild(script);
  }

  function reviseArchiveMetrics() {
    var leaves = d.querySelectorAll('strong,span,p,h1,h2,h3,em');
    leaves.forEach(function (node) {
      if (node.children.length) return;
      var text = (node.textContent || '').trim();
      if (text === '今日简报总数') node.textContent = '制造实践档案（期）';
      if (text.indexOf('2584期独立简报') !== -1) {
        node.textContent = text.replace('2584期独立简报', '覆盖2019—2026年的制造实践档案');
      }
      if (text.indexOf('2584期今日简报') !== -1) {
        node.textContent = text.replace('2584期今日简报', '2019—2026制造实践档案');
      }
    });
  }

  function addHomeDecisionSection() {
    if (path !== '/' && path !== '/index.html') return;
    if (d.getElementById('qtc-home-decision')) return;
    var section = buildSection({
      id: 'qtc-home-decision',
      alt: true,
      kicker: 'CUSTOMER DECISION SUMMARY｜客户决策摘要',
      title: '先判断是否适合合作，再深入查看能力与案例',
      description: '首页优先回答客户最关心的六个问题：解决什么、适合谁、凭什么、如何合作、谁负责、怎样验收。知识数量与个人标签退居辅助位置。',
      body: '<div class="qtc-grid">' +
        '<article class="qtc-card"><small>01｜解决问题</small><strong>PQCD与制造交付闭环</strong><p>聚焦效率、质量、成本、交付、换型、产能、物流、布局及ERP／MES／APS制造数据协同。</p></article>' +
        '<article class="qtc-card"><small>02｜适用场景</small><strong>离散制造与电子制造</strong><p>重点适用于汽车电子、小家电、半导体、PCBA／SMT、电气及多品种小批量制造场景。</p></article>' +
        '<article class="qtc-card"><small>03｜合作路径</small><strong>初筛 → 诊断 → Pilot → 验收</strong><p>从问题边界与基线数据开始，以阶段交付物、试点验证、书面变更和验收闭环控制项目风险。</p></article>' +
        '<article class="qtc-card"><small>04｜可信边界</small><strong>证据分级、角色分离、结果不夸大</strong><p>任职期间项目、个人专业作品与QilyLean品牌商业交付分开披露；历史结果不构成新项目收益承诺。</p></article>' +
      '</div>' +
      '<div class="qtc-actions"><a class="qtc-action" href="/cooperation/">进入项目合作</a><a class="qtc-action secondary" href="/projects/lean-improvement-evidence/">核验公开证据</a><a class="qtc-action secondary" href="/trust/">查看主体与合规边界</a></div>' +
      '<div class="qtc-disclosure"><strong>当前商业状态：</strong>截至' + REVIEW_DATE + '，QilyLean独立品牌可公开商业交付记录为0项；历史任职项目和专业作品继续作为能力与方法证据，但不包装为QilyLean品牌订单。首个品牌商业案例须形成合同／订单、项目编号、基线、过程记录、交付清单、验收与客户授权评价后再公开。</div>'
    });
    insertAfterHero(section);
  }

  function addTrustProcurementMatrix() {
    if (path !== '/trust' && path !== '/trust/index.html') return;
    if (d.getElementById('qtc-procurement-matrix')) return;
    var section = buildSection({
      id: 'qtc-procurement-matrix',
      kicker: 'PROCUREMENT VERIFICATION｜采购核验矩阵',
      title: '把“专业可信”与“商业资质”分别说清楚',
      description: '以下状态用于帮助客户、采购、财务与法务快速判断。未完成事项不以模糊表述替代，也不提前宣称已经具备。',
      body: '<table class="qtc-status-table"><tbody>' +
        '<tr><th>品牌与责任主体</th><td class="qtc-state-ok">已公开</td><td>QilyLean为丁启利发起的个人专业品牌；未另行书面指定依法登记主体时，默认由丁启利本人承担洽谈与交付责任。</td></tr>' +
        '<tr><th>经营主体／对公账户</th><td class="qtc-state-open">按项目书面确认</td><td>官网不推定已注册公司、工作室或具备对公账户。实际签约主体、签章与收款账户必须在合同中一致。</td></tr>' +
        '<tr><th>发票能力</th><td class="qtc-state-open">签约前确认</td><td>发票类型、税率与开票主体以实际签约主体资质为准，不在网页作超出资质的承诺。</td></tr>' +
        '<tr><th>官网邮箱</th><td class="qtc-state-ok">已启用</td><td>官网、APP支持、隐私与应用市场资料统一使用admin@qilylean.com；用于商务联系、技术支持与合规反馈。</td></tr>' +
        '<tr><th>品牌商业案例</th><td class="qtc-state-zero">公开记录0项</td><td>任职期间项目、个人作品与QilyLean品牌订单分开管理，不用历史雇佣关系项目替代品牌商业交付记录。</td></tr>' +
        '<tr><th>保密与证据</th><td class="qtc-state-ok">已建立</td><td>已有保密声明、脱敏原则、证据A／B／C／D分级、团队角色边界与收益非承诺说明。</td></tr>' +
      '</tbody></table>' +
      '<div class="qtc-disclosure"><strong>最近核验：</strong>' + REVIEW_DATE + '。主体、付款、开票、邮箱和商业案例均属于动态状态；发生变化时，应先完成可核验事实，再更新官网表述。</div>'
    });
    insertBeforeTarget(section, '#identity');
  }

  function addCooperationGate() {
    if (path !== '/cooperation' && path !== '/cooperation/index.html') return;
    if (d.getElementById('qtc-cooperation-gate')) return;
    var section = buildSection({
      id: 'qtc-cooperation-gate',
      alt: true,
      kicker: 'GO / NO-GO GATE｜项目启动门',
      title: '先完成合作前核验，再承诺周期与成果',
      description: '项目合作页面不仅说明“能做什么”，也明确何时不应启动，避免范围不清、数据失真、责任错位和验收争议。',
      body: '<div class="qtc-grid">' +
        '<article class="qtc-card"><small>输入条件</small><strong>基线与边界可确认</strong><ul><li>产品族、产量、交付与质量目标</li><li>现状流程、数据口径和现场权限</li><li>项目范围、接口人与决策机制</li></ul></article>' +
        '<article class="qtc-card"><small>商业条件</small><strong>主体与费用可核验</strong><ul><li>合同、签章、收款账户一致</li><li>差旅、税费、发票提前书面确认</li><li>新增工作通过变更单管理</li></ul></article>' +
        '<article class="qtc-card"><small>交付条件</small><strong>阶段门与验收可执行</strong><ul><li>诊断、设计、Pilot、复制分阶段</li><li>每阶段有交付物与验收标准</li><li>问题关闭与遗留风险均留痕</li></ul></article>' +
        '<article class="qtc-card"><small>暂缓条件</small><strong>不以表面改善换取签约</strong><ul><li>无真实数据或拒绝现场核验</li><li>要求承诺必然收益或虚假成果</li><li>用放宽质量／安全换取效率</li></ul></article>' +
      '</div><div class="qtc-actions"><a class="qtc-action" href="#diagnosis">提交问题初筛</a><a class="qtc-action secondary" href="/trust/">核验商业边界</a><a class="qtc-action secondary" href="/projects/">查看项目证据结构</a></div>'
    });
    insertAfterHero(section);
  }

  function addProjectsEvidenceArchitecture() {
    if (path !== '/projects' && path !== '/projects/index.html') return;
    if (d.getElementById('qtc-project-architecture')) return;
    var section = buildSection({
      id: 'qtc-project-architecture',
      alt: true,
      kicker: 'EVIDENCE ARCHITECTURE｜项目证据架构',
      title: '所有项目按来源、角色、证据与商业属性分轨展示',
      description: '项目数量不是唯一可信指标。每个案例更应回答：项目发生在哪里、本人承担什么职责、结果由什么证据支持、是否属于QilyLean品牌商业订单。',
      body: '<div class="qtc-grid">' +
        '<article class="qtc-card"><small>TRACK A</small><strong>任职期间项目</strong><p>用于证明制造现场经验与组织推进能力；必须区分本人职责、跨部门协作和企业共同成果。</p></article>' +
        '<article class="qtc-card"><small>TRACK B</small><strong>个人专业作品</strong><p>用于证明方案设计、数据建模、程序文件、工具开发和知识沉淀能力；不等同于客户付费验收。</p></article>' +
        '<article class="qtc-card"><small>TRACK C</small><strong>QilyLean商业交付</strong><p>仅收录以QilyLean合作窗口形成的真实订单，并具备主体、范围、交付、验收及授权证据。</p></article>' +
        '<article class="qtc-card"><small>EVIDENCE</small><strong>A／B／C／D分级</strong><p>已核定、已验证、阶段估算、经验陈述分开；内部披露等级不是政府或第三方认证。</p></article>' +
      '</div><div class="qtc-actions"><a class="qtc-action" href="/projects/lean-improvement-evidence/">查看脱敏证据</a><a class="qtc-action secondary" href="/projects/qilylean-commercial-deliveries/">查看品牌商业记录</a><a class="qtc-action secondary" href="/trust/#evidence-levels">查看证据分级</a></div>'
    });
    insertAfterHero(section);
  }

  function addCommercialRecordGate() {
    if (path.indexOf('/projects/qilylean-commercial-deliveries') !== 0) return;
    if (d.getElementById('qtc-commercial-record-gate')) return;
    var section = buildSection({
      id: 'qtc-commercial-record-gate',
      kicker: 'COMMERCIAL RECORD CONTROL｜商业记录控制',
      title: '首个案例宁可晚公开，也不提前包装',
      description: '商业案例只有在责任主体、合同范围、交付过程和验收证据完整后，才进入公开记录。',
      body: '<div class="qtc-record-gate">' +
        '<article class="qtc-record-main"><strong>0项</strong><h3>当前可公开的QilyLean独立品牌商业交付</h3><p>截至' + REVIEW_DATE + '仍为0项。该状态不否定历史任职项目与个人作品的专业价值，但两者不能替代品牌订单、客户验收和复购记录。</p></article>' +
        '<article class="qtc-record-checklist"><h3>首个案例公开准入清单</h3><ol><li>真实合同、订单或等效书面委托</li><li>唯一项目编号与明确责任主体</li><li>改善前基线及数据定义</li><li>阶段计划、过程记录与变更留痕</li><li>交付物清单及验收结论</li><li>成果口径、角色边界与客户授权</li></ol></article>' +
      '</div>'
    });
    insertAfterHero(section);
  }

  function addDailyArchiveQualityLayer() {
    var isDailyHub = path.indexOf('daily-insights') !== -1 || path === '/daily' || path === '/daily.html' || !!d.querySelector('.daily-index-heading');
    if (!isDailyHub || d.body.classList.contains('daily-single-page')) return;
    if (d.getElementById('qtc-daily-quality-layer')) return;
    var section = buildSection({
      id: 'qtc-daily-quality-layer',
      alt: true,
      kicker: 'QUALITY BEFORE QUANTITY｜质量优先于数量',
      title: '2019—2026制造实践档案按内容价值分层',
      description: '保留历史档案完整性，但不再把期数本身作为主要可信度证明。用户应先看到高价值原创、项目复盘和方法专题，再按日期检索完整档案。',
      body: '<div class="qtc-archive-grid">' +
        '<article class="qtc-archive-item"><b>核心原创</b><span>具有独立观点、完整论证和可复用工程价值的重点文章。</span></article>' +
        '<article class="qtc-archive-item"><b>项目复盘</b><span>按背景、基线、措施、验证、固化与边界呈现的实践内容。</span></article>' +
        '<article class="qtc-archive-item"><b>工具方法</b><span>VSM、SMED、OEE、标准工时、Layout等方法的应用说明。</span></article>' +
        '<article class="qtc-archive-item"><b>历史实践档案</b><span>依据历年工作记录与项目经验持续整理，用于检索和主题定位。</span></article>' +
        '<article class="qtc-archive-item"><b>AI辅助整理</b><span>允许AI参与结构化、校对与检索，但事实、数据和专业结论必须复核。</span></article>' +
      '</div><div class="qtc-disclosure"><strong>日期说明：</strong>页面日期主要用于知识档案排序与主题定位；除页面另有可核验证据外，不单独作为对应日期首次公开发布的证明。</div>'
    });
    insertAfterHero(section);
  }

  function clarifyCapabilityCertificate() {
    if (path !== '/capabilities' && path !== '/capabilities/index.html') return;
    var headings = d.querySelectorAll('h2,h3,h4');
    headings.forEach(function (heading) {
      var text = (heading.textContent || '').trim();
      if (text.indexOf('ChatGPT') !== -1 && text.indexOf('证书') !== -1) {
        heading.textContent = 'AI应用学习与实践记录（非官方认证）';
        var holder = heading.parentElement || heading;
        if (!holder.querySelector('.qtc-cert-note')) {
          holder.appendChild(create('p', 'qtc-cert-note', '<strong>性质说明：</strong>该内容用于记录个人学习与AI应用实践，不构成OpenAI、政府部门、行业机构或客户颁发的官方认证。真正的能力证明以数字工具、知识库、代码版本及制造项目交付成果为准。'));
        }
      }
    });
  }

  function addGlobalTrustFooter() {
    if (d.getElementById('qtc-global-trust-footer')) return;
    var footer = create('aside', 'qtc-global-trust-footer');
    footer.id = 'qtc-global-trust-footer';
    footer.setAttribute('aria-label', 'QilyLean全站可信度与商业状态说明');
    footer.innerHTML = '<div class="qtc-inner"><div><strong>可信度口径：</strong>个人专业品牌｜默认责任主体丁启利｜品牌商业交付公开记录0项｜历史项目、个人作品与品牌订单分轨披露｜核验日期 ' + REVIEW_DATE + '</div><nav class="qtc-global-trust-links"><a href="/trust/">信任中心</a><a href="/projects/qilylean-commercial-deliveries/">商业记录</a><a href="/cooperation/">项目合作</a></nav></div>';
    d.body.appendChild(footer);
  }

  function boot() {
    ensureCss();
    addStructuredData();
    reviseArchiveMetrics();
    addHomeDecisionSection();
    addTrustProcurementMatrix();
    addCooperationGate();
    addProjectsEvidenceArchitecture();
    addCommercialRecordGate();
    addDailyArchiveQualityLayer();
    clarifyCapabilityCertificate();
    addGlobalTrustFooter();
  }

  ensureCss();
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(document, window);
