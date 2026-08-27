(function () {
  'use strict';

  var VERSION = '20260828-knowledge-asset-v2';
  var path = location.pathname || '/';
  var isDaily = /^\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html$/i.test(path);
  var isTerminology = /\/knowledge\/terminology(?:\.html)?\/?$/i.test(path);
  if (!isDaily && !isTerminology) return;

  var TERM_ORDER = [
    'VSM','SMED','OEE','PDCA','ECRS','5WHY','FMEA','PFMEA','SPC','MSA','GR&R','POKA-YOKE',
    'CT','TT','LT','WIP','UPH','UPPH','PCE','FPY','Cpk','MTBF','MTTR','NPI','APQP','PPAP',
    'RACI','PILOT','MES','ERP','APS','ANDON','WMS','QMS','CMMS','TPM','SOP','DOE'
  ];

  var TERM_META = {
    'VSM': {label:'价值流图', chain:['LT','WIP','PCE','TT'], service:'/cooperation/#lean', project:'/projects/'},
    'SMED': {label:'快速换型', chain:['ECRS','CT','OEE'], service:'/cooperation/#lean', project:'/projects/'},
    'OEE': {label:'设备综合效率', chain:['MTBF','MTTR','TPM'], service:'/cooperation/#lean', project:'/projects/'},
    'PDCA': {label:'计划-执行-检查-处置', chain:['PILOT','RACI'], service:'/cooperation/#lean', project:'/projects/'},
    'ECRS': {label:'取消-合并-重排-简化', chain:['CT','UPPH','SMED'], service:'/cooperation/#lean', project:'/projects/'},
    '5WHY': {label:'五个为什么', chain:['PDCA','FMEA'], service:'/cooperation/#lean', project:'/projects/'},
    'FMEA': {label:'失效模式与影响分析', chain:['APQP','PPAP','SPC'], service:'/cooperation/#lean', project:'/projects/'},
    'PFMEA': {label:'过程失效模式与影响分析', chain:['APQP','PPAP','SPC'], service:'/cooperation/#lean', project:'/projects/'},
    'SPC': {label:'统计过程控制', chain:['Cpk','MSA','FPY'], service:'/cooperation/#lean', project:'/projects/'},
    'MSA': {label:'测量系统分析', chain:['GR&R','SPC','Cpk'], service:'/cooperation/#lean', project:'/projects/'},
    'GR&R': {label:'量具重复性与再现性', chain:['MSA','SPC'], service:'/cooperation/#lean', project:'/projects/'},
    'POKA-YOKE': {label:'防错', chain:['FPY','FMEA'], service:'/cooperation/#lean', project:'/projects/'},
    'CT': {label:'周期时间', chain:['TT','UPPH','WIP'], service:'/cooperation/#lean', project:'/projects/'},
    'TT': {label:'客户需求节拍', chain:['CT','UPPH','WIP'], service:'/cooperation/#lean', project:'/projects/'},
    'LT': {label:'交付周期', chain:['VSM','WIP','PCE'], service:'/cooperation/#lean', project:'/projects/'},
    'WIP': {label:'在制品', chain:['LT','VSM','PCE'], service:'/cooperation/#lean', project:'/projects/'},
    'UPH': {label:'每小时产出', chain:['CT','TT','UPPH'], service:'/cooperation/#lean', project:'/projects/'},
    'UPPH': {label:'单位人时产出', chain:['CT','TT','ECRS'], service:'/cooperation/#lean', project:'/projects/'},
    'PCE': {label:'流程效率', chain:['VSM','LT','WIP'], service:'/cooperation/#lean', project:'/projects/'},
    'FPY': {label:'一次通过率', chain:['SPC','Cpk','POKA-YOKE'], service:'/cooperation/#lean', project:'/projects/'},
    'Cpk': {label:'过程能力指数', chain:['SPC','MSA','FPY'], service:'/cooperation/#lean', project:'/projects/'},
    'MTBF': {label:'平均故障间隔时间', chain:['MTTR','OEE','TPM'], service:'/cooperation/#lean', project:'/projects/'},
    'MTTR': {label:'平均修复时间', chain:['MTBF','OEE','TPM'], service:'/cooperation/#lean', project:'/projects/'},
    'NPI': {label:'新产品导入', chain:['APQP','PPAP','PILOT'], service:'/cooperation/#lean', project:'/projects/'},
    'APQP': {label:'产品质量先期策划', chain:['PFMEA','PPAP','NPI'], service:'/cooperation/#lean', project:'/projects/'},
    'PPAP': {label:'生产件批准程序', chain:['APQP','PFMEA','SPC'], service:'/cooperation/#lean', project:'/projects/'},
    'RACI': {label:'责任矩阵', chain:['PILOT','PDCA'], service:'/cooperation/#lean', project:'/projects/'},
    'PILOT': {label:'试运行 / 试点项目', chain:['PDCA','RACI','NPI'], service:'/cooperation/#lean', project:'/projects/'},
    'MES': {label:'制造执行系统', chain:['ERP','APS','ANDON'], service:'/cooperation/#digital', project:'/projects/'},
    'ERP': {label:'企业资源计划', chain:['MES','APS'], service:'/cooperation/#digital', project:'/projects/'},
    'APS': {label:'高级计划与排程', chain:['ERP','MES','TT'], service:'/cooperation/#digital', project:'/projects/'},
    'ANDON': {label:'安灯 / 异常响应', chain:['MES','OEE','MTTR'], service:'/cooperation/#digital', project:'/projects/'},
    'WMS': {label:'仓储管理系统', chain:['ERP','MES'], service:'/cooperation/#digital', project:'/projects/'},
    'QMS': {label:'质量管理系统', chain:['SPC','MSA','MES'], service:'/cooperation/#digital', project:'/projects/'},
    'CMMS': {label:'设备维护管理系统', chain:['MTBF','MTTR','TPM'], service:'/cooperation/#digital', project:'/projects/'},
    'TPM': {label:'全面生产维护', chain:['OEE','MTBF','MTTR'], service:'/cooperation/#lean', project:'/projects/'},
    'SOP': {label:'标准作业程序', chain:['PDCA','NPI'], service:'/cooperation/#lean', project:'/projects/'},
    'DOE': {label:'试验设计', chain:['SPC','Cpk','NPI'], service:'/cooperation/#lean', project:'/projects/'}
  };

  var CASES = {
    'VSM':'教学案例：某装配产品日产需求明确，但从投料到成品跨越多个等待与批量周转点。团队先以CT、C/O、WIP、LT和信息流绘制现状图，再把瓶颈前库存、批量搬运和计划释放规则纳入未来态；改善验收不只看局部CT，而同步比较LT、WIP、准交率与PCE。',
    'SMED':'教学案例：某冲压换模长时间占用设备。先录像拆分停机内作业与可外置作业，再用ECRS把找工具、预热、备料、首件资料前置；随后用并行动作、快速定位和标准扭矩缩短停机窗口，并连续记录多次换型中位数，防止只拿一次最快成绩结案。',
    'OEE':'教学案例：某自动线OEE只有62%。分解A×P×Q后发现性能损失并非主因，最大损失来自故障等待和小停机。团队再按故障代码、MTBF、MTTR分层，先解决高频重复故障；改善后同时核对产出、良率和停机结构，避免只追求OEE单一数字。',
    'PDCA':'教学案例：某装配线连续欠产。P阶段先定义基线、目标和主要损失，D阶段在一条线做Pilot，C阶段比较CT、UPPH、欠产量与异常次数，A阶段把有效动作写入标准作业、点检和排产基础数据；若目标未达成，则带着新证据进入下一轮，而不是直接宣布结案。',
    'ECRS':'教学案例：某工位CT为42s而TT为36s。录像拆解后发现重复取放、跨步取料和两次扫码。团队依次检查Eliminate、Combine、Rearrange、Simplify，取消无价值转手、合并扫码、调整物料位置并简化夹具动作，使CT降到TT以内，再以连续班次实绩验证。',
    '5WHY':'教学案例：某产品反复漏装。第一问不能停在“员工粗心”，而继续追到作业步骤不可视、治具无到位检测、换线后首件确认未覆盖该特性。最终对策同时包含防错、标准更新和首件验证，验证指标采用漏装率与异常再发次数。',
    'FMEA':'教学案例：某新产品在试产阶段出现端子压接风险。团队把失效模式、后果、原因、现行控制与检测能力逐项展开，再将高风险项转成设备参数锁定、首件验证、抽检频次和防错要求；措施完成后重新评价风险，并把变更同步至Control Plan与SOP。',
    'PFMEA':'教学案例：某线束压接工序在NPI阶段存在高度偏差风险。PFMEA将失效模式与设备参数、端子批次、模具磨损、测量系统连接起来；高风险项目形成控制计划、点检频率和反应计划，并通过试产数据确认控制措施有效。',
    'SPC':'教学案例：某关键尺寸均值仍在规格内，但控制图连续出现趋势性漂移。团队没有等到超规才处理，而先核对MSA，再按设备、模腔、班次分层查找特殊原因；纠正后继续观察稳定性，并用Cpk判断稳定过程是否具备足够能力。',
    'MSA':'教学案例：某测量尺寸的生产数据波动很大。团队先做GR&R，发现不同检验员的操作方法贡献了显著变差；统一夹持位置、测量步骤与量具校验后再次分析，确认测量系统具备能力，再使用该数据评价过程Cpk。',
    'GR&R':'教学案例：三名检验员使用同一量具测量同一组零件，结果差异明显。通过重复性与再现性分析识别量具本体、操作员和交互影响，先改善测量方法和夹具，再决定该量具是否可用于过程判定。',
    'POKA-YOKE':'教学案例：某装配零件存在左右件混装。仅培训员工无法稳定消除错误，团队把左右件定位特征改成物理不可互换，并增加到位检测；验证时连续覆盖换线、换人和异常复位场景，确认错误无法流出。',
    'CT':'教学案例：某工位连续测得周期时间38s、41s、39s，而客户TT为36s。不能用平均值掩盖超节拍事实；先拆动作和损失，再用ECRS与工位重配降低稳定CT，并用多周期分布而非单次最快值确认结果。',
    'TT':'教学案例：班次可用时间25200s，客户需求700件，则TT为36s/件。现场每个关键工序都要与36s比较；若瓶颈CT为42s，即使员工一直忙碌也存在结构性欠产风险，必须先解决节拍差距或调整资源。',
    'WIP':'教学案例：某流程各工序单点效率都不差，但半成品堆积导致交付周期很长。团队按工序统计WIP与等待时间，并结合VSM定位批量释放和不平衡造成的库存；改善验证同时看WIP、LT和准交率，而不是只看某工序UPH。',
    'UPPH':'教学案例：某线8人每小时产出320件，UPPH=40件/人时。改善后虽然总产出仍为320件，但通过平衡与ECRS降至6人，则UPPH升至53.3件/人时；同时必须确认质量、节拍和人员负荷没有被透支。',
    'MTBF':'教学案例：某设备一周运行期间发生8次同类故障。团队按“实际运行时间÷故障次数”统一口径计算MTBF，并把重复故障按部件与故障代码Pareto；通过消除首要失效模式提高MTBF，而不是靠延长维修时间间隔掩盖问题。',
    'MTTR':'教学案例：某设备故障后平均40分钟恢复，其中真正维修仅12分钟，等待维修员、找备件和首件确认占28分钟。团队把MTTR拆成响应、诊断、资源等待、修复调试和质量验证，分别改善，避免把全部责任压给维修动作本身。',
    'NPI':'教学案例：某新产品试产时节拍达标但良率不稳定。NPI团队按BOM、工艺、PFMEA、治具、CT、人员培训和质量数据建立Gate清单，通过Pilot验证后再决定量产放行；未关闭的高风险项明确责任人与截止日期。',
    'APQP':'教学案例：某汽车电子新项目按阶段建立质量策划，从需求、设计、过程开发到产品/过程验证形成交付物；PFMEA、Control Plan、MSA、SPC与PPAP不是独立表格，而由同一风险逻辑贯穿并在变更时同步更新。',
    'PPAP':'教学案例：某零件准备量产前，团队按客户要求提交设计/过程记录、PFMEA、控制计划、MSA、尺寸结果、材料/性能试验及样件。资料齐全不等于批准，关键在于证据能证明产品和过程稳定满足要求。',
    'RACI':'教学案例：某自动化项目进入试运行放行，项目经理为唯一A；设备、PE、IE和供应商分别作为R提交安全、节拍、质量与文件证据；质量和制造作为C参与评审，PMC和采购作为I同步状态。未完成验收证据时A不得放行。',
    'PILOT':'教学案例：某线体准备全面推广单件流，不先全厂铺开，而选择一条代表线做Pilot。先锁定Baseline，再验证CT、WIP、UPPH、质量和异常响应；达到预设Gate后才复制，未达到则保留问题清单进入下一轮PDCA。',
    'MES':'教学案例：某工厂希望用MES解决报工失真。上线前先统一工序、BOM、工艺路线、标准工时、设备状态和异常编码，再通过试点线验证采集准确率、报工及时性和追溯完整性；否则只是把错误数据电子化。',
    'ERP':'教学案例：某企业ERP上线后排产仍失真，根因并非系统功能不足，而是BOM、标准工时、库存和订单状态口径不一致。团队先治理主数据和计划冻结规则，再核对计划—领料—报工—入库闭环。',
    'APS':'教学案例：某多品种工厂引入APS前，先确认订单优先级、设备/模具约束、换型时间、物料齐套、标准工时与日历能力。试排结果必须与现场可执行性对照，否则算法最优不等于制造可执行。',
    'ANDON':'教学案例：某线体设置Andon后报警很多但响应仍慢。团队定义异常类别、触发条件、责任层级、响应时限和关闭证据，并统计响应时间、重复异常和停线损失，使Andon从“亮灯”变成异常闭环机制。',
    'TPM':'教学案例：某关键设备故障频繁。团队把自主保全、专业保全、点检标准、备件与故障履历连接到OEE、MTBF、MTTR，通过重复故障Pareto确定优先级，并用稳定运行周期验证改善。',
    'DOE':'教学案例：某工艺质量受温度、压力、时间等多个参数影响。团队不逐个单因素试错，而设计有计划的试验组合识别主效应和交互作用，再用确认试验验证最佳参数窗口，并转入控制计划。'
  };

  function clean(v) { return String(v || '').replace(/\s+/g, ' ').trim(); }
  function esc(v) { return String(v || '').replace(/[&<>"']/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }

  function ensureStyle() {
    if (document.getElementById('qilyKnowledgeAssetV2Style')) return;
    var s = document.createElement('style');
    s.id = 'qilyKnowledgeAssetV2Style';
    s.textContent = [
      '.qily-ka2{margin:24px 0;border:1px solid #b9ced2;background:#f7fbfb;box-shadow:0 12px 32px rgba(15,75,90,.08)}',
      '.qily-ka2-head{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 20px;border-top:4px solid #caa15f;border-bottom:1px solid #cbdcdf;background:#fff}',
      '.qily-ka2-kicker{color:#0f4b5a;font-size:12px;font-weight:950;letter-spacing:.11em}.qily-ka2-title{margin:5px 0 0;color:#0f4b5a;font-size:24px;line-height:1.3}',
      '.qily-ka2-badge{flex:0 0 auto;padding:7px 10px;border:1px solid #caa15f;background:#fff8e8;color:#765416;font-size:12px;font-weight:900}',
      '.qily-ka2-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;padding:18px}',
      '.qily-ka2-card{padding:17px 18px;border:1px solid #d5e4e3;background:#fff;min-width:0}',
      '.qily-ka2-card h3{margin:0 0 9px;color:#0f4b5a;font-size:17px}.qily-ka2-card p{margin:0;color:#465b58;line-height:1.75}',
      '.qily-ka2-flow{grid-column:1/-1}.qily-ka2-flowline{display:flex;flex-wrap:wrap;align-items:center;gap:7px;margin-top:10px}',
      '.qily-ka2-node{padding:7px 10px;border:1px solid #9ebbc0;background:#eef7f7;color:#0f4b5a;font-weight:850}.qily-ka2-arrow{color:#c18d36;font-weight:950}',
      '.qily-ka2-links{display:flex;flex-wrap:wrap;gap:8px;margin-top:11px}.qily-ka2-links a{padding:7px 10px;border:1px solid #178b94;color:#0f4b5a;background:#fff;text-decoration:none;font-weight:850}',
      '.qily-ka2-links a:hover{background:#0f4b5a;color:#fff}.qily-ka2-note{padding:0 18px 18px;color:#627978;font-size:12px;line-height:1.6}',
      '.term-opl-ka2-case{border-left:4px solid #caa15f!important}.term-opl-ka2-related{border-top:4px solid #178b94!important}',
      '@media(max-width:760px){.qily-ka2-head{align-items:flex-start;flex-direction:column}.qily-ka2-grid{grid-template-columns:1fr;padding:12px}.qily-ka2-flow{grid-column:auto}.qily-ka2-title{font-size:21px}}',
      '@media print{.qily-ka2{break-inside:avoid;box-shadow:none}.qily-ka2-links a{color:#0f4b5a}}'
    ].join('');
    document.head.appendChild(s);
  }

  function detectTerms(text) {
    var upper = (' ' + clean(text).toUpperCase() + ' ');
    return TERM_ORDER.filter(function(code){
      var needle = code.toUpperCase();
      if (needle === 'Cpk'.toUpperCase()) return /\bCPK\b/.test(upper);
      return upper.indexOf(needle) >= 0;
    }).slice(0, 5);
  }

  function termHref(code) {
    return '/knowledge/terminology.html?opl=' + encodeURIComponent(code);
  }

  function dailyEnhance() {
    if (document.querySelector('[data-qily-ka2-daily="'+VERSION+'"]')) return;
    var article = document.querySelector('article.post') || document.querySelector('.post') || document.querySelector('main');
    if (!article) return;
    var titleNode = article.querySelector('h1,h2');
    var title = clean(titleNode && titleNode.textContent) || '本期精选';
    var paragraphs = Array.prototype.map.call(article.querySelectorAll('p'), function(p){return clean(p.textContent);}).filter(Boolean);
    var lead = paragraphs[0] || clean(article.textContent).slice(0, 180);
    var terms = detectTerms(article.textContent);
    var primary = terms[0] || '';
    var primaryMeta = TERM_META[primary] || null;
    var caseText = CASES[primary] || ('教学案例：围绕“' + title + '”选择一个真实或代表性制造场景，先锁定Baseline与数据口径，再应用对应方法完成Pilot验证；至少同步核对PQCD、异常与标准化结果，未形成验证证据不得判定改善关闭。');
    var chain = primaryMeta ? [primary].concat(primaryMeta.chain || []) : terms;
    if (!chain.length) chain = ['现场事实','工程数据','改善动作','验证证据'];
    var related = terms.length ? terms : (primary ? [primary] : []);

    var box = document.createElement('section');
    box.className = 'qily-ka2';
    box.setAttribute('data-qily-ka2-daily', VERSION);
    box.innerHTML = '<div class="qily-ka2-head"><div><div class="qily-ka2-kicker">QILYLEAN · ENGINEERING DEEP DIVE</div><h2 class="qily-ka2-title">工程深读｜从观点进入数据、方法与验证</h2></div><div class="qily-ka2-badge">Knowledge Asset 2.0</div></div>' +
      '<div class="qily-ka2-grid">' +
      '<div class="qily-ka2-card"><h3>01｜核心判断</h3><p>' + esc(lead) + '</p></div>' +
      '<div class="qily-ka2-card"><h3>02｜工程判定口径</h3><p>先定义对象、时间窗、数据来源与Baseline，再比较目标与实绩。涉及工具应用时，必须把“为什么选该工具、输入数据是什么、输出证据是什么、何时判定关闭”写清；不能用单次最佳值替代稳定结果。</p></div>' +
      '<div class="qily-ka2-card term-opl-ka2-case"><h3>03｜工具应用案例</h3><p>' + esc(caseText) + '</p></div>' +
      '<div class="qily-ka2-card"><h3>04｜现场动作与验收</h3><p>建议按“事实确认 → 数据分层 → 工具选择 → Pilot → PQCD验证 → 标准化/系统固化”推进。验收至少保留前后基线、过程数据、异常记录、责任人与标准更新证据；涉及ERP/MES/APS时同步校验主数据与现场实绩。</p></div>' +
      '<div class="qily-ka2-card qily-ka2-flow"><h3>05｜相关知识链</h3><div class="qily-ka2-flowline">' + chain.map(function(code,i){return (i?'<span class="qily-ka2-arrow">→</span>':'') + '<span class="qily-ka2-node">'+esc((TERM_META[code]&&TERM_META[code].label)?code+'｜'+TERM_META[code].label:code)+'</span>';}).join('') + '</div>' +
      '<div class="qily-ka2-links">' + related.map(function(code){return '<a href="'+termHref(code)+'">OPL｜'+esc(code+(TERM_META[code]?' · '+TERM_META[code].label:''))+'</a>';}).join('') + '<a href="/projects/">代表项目</a><a href="/cooperation/">相关项目能力</a></div></div>' +
      '</div><div class="qily-ka2-note">说明：案例标注为教学案例时，仅用于方法训练与应用说明，不作为客户项目事实或商业成果声明；职业实践与项目数据仍以本站证据分级和公开页面为准。</div>';

    var anchor = article.querySelector('[data-daily-terminology-audit]') || article.querySelector('.quote');
    if (anchor) anchor.insertAdjacentElement('afterend', box); else article.appendChild(box);
  }

  function modalCode() {
    var title = document.getElementById('termOplTitle');
    var text = clean(title && title.textContent);
    return text ? text.split('｜')[0].trim().toUpperCase() : '';
  }

  function addOplBlocks() {
    var content = document.getElementById('termOplContent');
    if (!content) return;
    var code = modalCode();
    if (!code || content.getAttribute('data-qily-ka2') === VERSION + ':' + code) return;
    content.setAttribute('data-qily-ka2', VERSION + ':' + code);
    ensureStyle();

    var meta = TERM_META[code] || null;
    var existingCase = Array.prototype.find.call(content.querySelectorAll('.term-opl-block'), function(block){
      return /案例/.test(clean(block.querySelector('h3') && block.querySelector('h3').textContent));
    });
    var caseText = CASES[code] || ('教学案例：选择一个与“' + code + '”相关的现场问题，先建立Baseline与统一数据口径，再按本课方法实施Pilot；最终用PQCD、异常记录和标准化证据确认是否有效，避免把“做了动作”当成“完成改善”。');

    if (existingCase) {
      existingCase.classList.add('term-opl-ka2-case');
      var p = existingCase.querySelector('p');
      var old = clean(p && p.textContent);
      if (p && old.length < 90) p.textContent = caseText;
    } else {
      var caseBlock = document.createElement('section');
      caseBlock.className = 'term-opl-block term-opl-wide term-opl-ka2-case';
      caseBlock.innerHTML = '<h3><span class="term-opl-num">案</span>工具应用案例</h3><p class="term-opl-case">'+esc(caseText)+'</p>';
      var contact = content.querySelector('.term-opl-contact-card');
      content.insertBefore(caseBlock, contact || null);
    }

    if (!content.querySelector('.term-opl-ka2-related')) {
      var rel = document.createElement('section');
      rel.className = 'term-opl-block term-opl-wide term-opl-ka2-related';
      var chain = meta ? [code].concat(meta.chain || []) : [code];
      rel.innerHTML = '<h3><span class="term-opl-num">链</span>相关知识与项目承接</h3><div class="qily-ka2-flowline">'+chain.map(function(c,i){return (i?'<span class="qily-ka2-arrow">→</span>':'')+'<a class="qily-ka2-node" href="'+termHref(c)+'">'+esc(c+(TERM_META[c]?'｜'+TERM_META[c].label:''))+'</a>';}).join('')+'</div><div class="qily-ka2-links"><a href="/qilylean/daily-insights.html">精选简报</a><a href="/projects/">代表项目</a><a href="/cooperation/">相关项目能力</a></div><p style="margin-top:12px;color:#627978;font-size:13px">关联原则：仅展示与当前术语存在直接方法、数据、项目或系统关系的内容；引用关系变化时须同步更新。</p>';
      var contact2 = content.querySelector('.term-opl-contact-card');
      content.insertBefore(rel, contact2 || null);
    }
  }

  function terminologyEnhance() {
    ensureStyle();
    addOplBlocks();
    var modal = document.getElementById('termOplModal');
    if (modal && window.MutationObserver) {
      new MutationObserver(function(){ addOplBlocks(); }).observe(modal,{childList:true,subtree:true,characterData:true});
    }
  }

  ensureStyle();
  if (isDaily) dailyEnhance();
  if (isTerminology) terminologyEnhance();
})();
