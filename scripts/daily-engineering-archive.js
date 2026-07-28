#!/usr/bin/env node
'use strict';

const { guides } = require('./enhance-daily-archive');

const archiveStart = '2019-07-10';
const archiveEnd = '2025-12-18';

const lenses = [
  {
    title: '先把问题定义准确',
    question: '对象、边界、现象、基准和影响是否已经说清楚',
    metric: '先固定产品、工序、班次、设备和统计周期，再比较现状值与目标值',
    boundary: '问题没有被准确界定时，原因越多、行动越快，返工往往越大'
  },
  {
    title: '让现场事实先于经验',
    question: '结论能否被现场观察、样本记录和时间戳数据复现',
    metric: '至少保留原始记录、样本数量、异常样本和采集条件，避免只引用汇总结果',
    boundary: '经验可用于提出假设，但不能替代原因验证和效果验证'
  },
  {
    title: '从客户节拍反推资源',
    question: '产能、人力、设备与物流是否真正围绕客户需求节奏配置',
    metric: '同步比较客户节拍、瓶颈CT、标准人工工时、可用工时与实际合格产出',
    boundary: '局部设备利用率提高，不等于订单交付周期一定缩短'
  },
  {
    title: '把等待与库存显性化',
    question: '加工之外的等待、搬运、排队、库存和信息延迟是否已经量化',
    metric: '将总交付周期拆分为加工、等待、库存、搬运和异常停顿，分别确认责任界面',
    boundary: '只改善加工动作，可能把产出转化为更多在制品'
  },
  {
    title: '用标准守住改善成果',
    question: '有效做法是否已经转化为版本、参数、点检、培训和审核要求',
    metric: '改善后同时追踪标准覆盖率、培训合格率、执行符合率与重复问题率',
    boundary: '没有版本和维护责任的标准，会很快退化为个人习惯'
  },
  {
    title: '让异常进入关闭链',
    question: '异常是否具备遏制、原因、对策、责任、期限、复验和防再发证据',
    metric: '除关闭率外，重点观察逾期率、重复打开率、复发率和关闭证据完整率',
    boundary: '“已处理”只是动作状态，不等于风险已经消除'
  },
  {
    title: '把跨部门接口做成规则',
    question: '输入、输出、主责、协同、时点和升级条件是否清晰一致',
    metric: '对每个接口定义唯一主键、交付物、完成标准、冻结点与异常升级时限',
    boundary: '接口依赖临时沟通时，组织越忙，信息损失越大'
  },
  {
    title: '从波动中寻找真因',
    question: '平均值背后的产品、班组、设备、物料和时间波动是否被分层',
    metric: '保留分母和样本边界，结合趋势、分层、Pareto与异常点验证主要变化来源',
    boundary: '相关性只能缩小调查范围，不能直接当作根因'
  },
  {
    title: '让投入对应可验收收益',
    question: '改善投入、运行成本、风险、收益口径和回收周期是否可核验',
    metric: '区分一次性收益与持续性收益，并扣除维护、停机、折旧、培训和机会成本',
    boundary: '理论省人、理论节拍和理论金额，不能直接当作经营收益'
  },
  {
    title: '先试点验证再横向复制',
    question: '方案是否经过典型产品、正常状态、异常状态和边界状态验证',
    metric: '试点至少比较改善前后基准、目标达成、波动、异常清单和维持周期',
    boundary: '未经边界验证就全面推广，会把小问题放大为系统问题'
  },
  {
    title: '让系统放大稳定流程',
    question: '业务规则、主数据、状态字典和权限责任是否先于系统功能统一',
    metric: '同步评价数据完整率、准确率、及时率、一致率和可追溯率',
    boundary: '流程尚未稳定时过度定制，只会把混乱固化进系统'
  },
  {
    title: '把改善变成日常能力',
    question: '问题发现、优先级、试验、验证、标准化和复盘是否形成固定节奏',
    metric: '持续追踪维持达成率、重复问题率、标准更新及时率和横向复制完成率',
    boundary: '依赖少数骨干和专项活动的成果，很难成为组织能力'
  }
];

const contexts = [
  {
    name: '汽车电子多品种装配',
    condition: '订单批量变化快、人工与设备工序交错、质量追溯要求高',
    risk: '只看单工位效率，容易忽略换线、物料齐套、错漏装与尾单交付',
    evidence: '订单、产品编码、工序CT、实际人力、FPY、换线时间与欠产原因'
  },
  {
    name: 'SMT／DIP电子制造',
    condition: '设备连续运行、程序与物料版本多、前后工序节奏差异明显',
    risk: '设备稼动率高但WIP与等待继续增加，局部最优反而压迫整体交付',
    evidence: '程序版本、Feeder与物料、设备停机代码、直通率、WIP与Lead Time'
  },
  {
    name: '小家电总装与包装',
    condition: '季节性订单明显、人员熟练度波动、装配与包装节拍相互制约',
    risk: '依靠临时增人和加班掩盖瓶颈，标准工时与实际配置长期脱节',
    evidence: '客户节拍、山积图、标准人工工时、UPPH、缺陷分层与换线损失'
  },
  {
    name: '注塑／冲压与模具换型',
    condition: '设备、模具、参数、首件确认和物料准备共同决定有效产能',
    risk: '只压缩拆装动作，忽略外部准备、参数确认、首件调整和安全边界',
    evidence: '末件至首件合格时间、内部／外部作业、参数版本、首件次数与停机损失'
  },
  {
    name: '半导体与精密制造',
    condition: '过程窗口窄、设备与环境约束强、批次追溯和变更控制要求高',
    risk: '只追求产出速度，可能放大良率、污染、量测与批次隔离风险',
    evidence: '批次、设备、Recipe、环境、量测系统、良率、Hold时间与变更记录'
  },
  {
    name: '新产品导入与量产爬坡',
    condition: '设计、工艺、质量、物料、设备、治具与产能准备必须同步成熟',
    risk: '问题未关闭就跨越阶段门，最终在PVT或MP集中爆发',
    evidence: '阶段评审清单、问题关闭率、齐套率、FPY、节拍达成率与产能验证'
  },
  {
    name: '新工厂／新产线规划',
    condition: '产品族、产能、设备、物流、人流、公辅、安全与扩展相互约束',
    risk: '先摆设备再补流程，会造成搬运交叉、面积浪费和后期改造',
    evidence: '产能模型、From-To、面积清单、物流频次、安全间距、公辅负荷与扩展余量'
  },
  {
    name: 'ERP／MES／APS协同',
    condition: '订单、BOM、工艺、工时、库存、计划与实绩需要共用可信主数据',
    risk: '字段和状态规则不统一，系统接口只会加快错误传播',
    evidence: '唯一编码、有效版本、数据Owner、接口日志、库存准确率与订单关闭状态'
  },
  {
    name: '设备自动化与工程改造',
    condition: '节拍、质量、安全、换型、接口、维护和投资收益必须同时成立',
    risk: '把未稳定流程直接自动化，会把人工问题固化为设备问题',
    evidence: 'URS、FAT／SAT、极限状态测试、故障恢复、备件、OEE、ROI与回收期'
  },
  {
    name: '精益运营与项目交付',
    condition: '改善需要跨越诊断、方案、试点、验证、固化、验收和复制',
    risk: '完成文件、会议或设备安装就宣布结案，真实收益与维持机制仍然缺失',
    evidence: '基准、目标、里程碑、风险清单、实绩、验收记录、标准更新与收益确认'
  }
];

const phases = [
  {
    title: '诊断切入',
    focus: '先到现场确认事实，建立问题边界和损失基准',
    action: '选取一个典型对象，连续观察一个完整作业循环并保留原始记录'
  },
  {
    title: '基准建立',
    focus: '统一字段、样本、统计周期和判定口径，让改善前后可比较',
    action: '把现状值、目标值、数据来源、责任人与采集频次写入同一张基准表'
  },
  {
    title: '方案设计',
    focus: '用事实选择优先级，把质量、安全、交付和成本约束同时纳入',
    action: '至少形成两种方案，并用风险、投入、收益、周期和可维护性进行比较'
  },
  {
    title: '现场试点',
    focus: '在真实订单、真实人员和真实异常中验证方法，不回避边界问题',
    action: '限定试点范围和验证周期，逐项记录正常、异常与故障状态'
  },
  {
    title: '实绩验证',
    focus: '用改善前后数据验证结果，并确认没有把损失转移到其他环节',
    action: '同时复核效率、质量、成本、交付、安全与人员负荷'
  },
  {
    title: '标准固化',
    focus: '把有效做法写进SOP、参数、点检、系统字段、权限和培训',
    action: '明确版本、生效日期、维护责任、异常反应和换版条件'
  },
  {
    title: '横向复制',
    focus: '识别相似产品、设备和区域，先做适配评审再推广',
    action: '建立复制清单，逐项确认差异、风险、责任与验证证据'
  },
  {
    title: '持续运营',
    focus: '用分层审核、日清周结和周期复盘守住改善成果',
    action: '把维持指标纳入日常看板，对重复问题重新打开原因分析'
  }
];

const roles = [
  { owner: 'IE／精益', partner: '制造与PMC', reviewer: '运营负责人', system: '标准工时、产能与改善台账' },
  { owner: 'PE／工艺', partner: '质量与制造', reviewer: '工程负责人', system: '工艺参数、SOP与变更记录' },
  { owner: 'PMC', partner: 'IE、仓储与制造', reviewer: '生产运营', system: '订单、排产、齐套与结单状态' },
  { owner: '质量工程', partner: '工艺、制造与供应商', reviewer: '质量负责人', system: 'PFMEA、控制计划与问题闭环' },
  { owner: '设备／ME', partner: '生产、工艺与安全', reviewer: '工程负责人', system: '点检、保全、故障与改造履历' },
  { owner: 'NPI／项目', partner: '研发、供应链与制造', reviewer: '阶段评审组', system: '阶段门、问题清单与量产移交' },
  { owner: 'IT／数字化', partner: '业务Owner与数据Owner', reviewer: '流程负责人', system: '主数据、权限、接口与审计日志' },
  { owner: '项目经理', partner: '跨职能交付团队', reviewer: '项目Sponsor', system: '范围、里程碑、风险、验收与收益' }
];

const energyNotes = [
  '工程能力不是一次灵感，而是把每一次观察都沉淀成可复用的方法。',
  '真正的坚持，不是每天重复同一句话，而是每天把一个问题看得更深一点。',
  '现场不会被口号改变，但会被一次次真实测量、验证与标准化改变。',
  '没有哪一种改善能一劳永逸，职业价值来自持续守住事实与标准。',
  '把复杂问题拆成今天能够验证的一步，长期积累就会形成体系力量。',
  '工程者的底气来自数据，信誉来自结果，影响力来自可复制的交付。',
  '越是长期工程，越要尊重基本功；越是复杂系统，越要守住真实数据。',
  '改善不是证明自己正确，而是让现场更安全、更稳定、更高效。',
  '日复一日留下方法、证据和标准，个人经验才会变成组织能力。',
  '真正有力量的职业成长，是把看见的问题变成可以被关闭的项目。',
  '系统能力来自无数次小闭环：发现、判断、试验、验证、固化、复盘。',
  '坚持的意义，是让今天的工程判断比昨天更准确，让明天的现场比今天更稳定。'
];

const moduleMap = {
  'VSM': '/projects/automotive-lean/',
  'SMED': '/projects/smed-300t/',
  'Factory Layout': '/projects/factory-layout/',
  'ERP/MES': '/projects/digital-factory/',
  '自动化': '/projects/digital-factory/',
  '精益生产': '/projects/automotive-lean/'
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function iso(date) {
  return date.toISOString().slice(0, 10);
}

function datesBetween(start, end) {
  const dates = [];
  const cursor = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (cursor <= last) {
    dates.push(iso(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

function rotate(values, index) {
  return values.slice(index).concat(values.slice(0, index));
}

function moduleLinks(topic) {
  const projectUrl = moduleMap[topic] || '/projects/';
  return [
    { href: '/capabilities/', name: '能力画像', text: '查看工程、精益、质量、数智化与项目交付的能力主线' },
    { href: '/knowledge/', name: '知识分享', text: '继续查阅精益、IE、质量与数智化方法资料' },
    { href: projectUrl, name: '关联项目', text: '查看同类方法在现场规划与改善项目中的落地' },
    { href: '/ai.html', name: 'QilyLean AI', text: '带着企业现场问题继续拆解数据、方案与边界' },
    { href: '/cooperation/', name: '项目合作', text: '从问题初筛进入诊断、Pilot、验证与交付闭环' }
  ];
}

function list(items, ordered = false) {
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag}>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</${tag}>`;
}

function buildArchiveArticle({ date, topic, guide, lens, context, phase, role, energy, visual, index }) {
  const title = `${topic}｜${lens.title}：${context.name}${phase.title}`;
  const summary = `在${context.name}场景下，以“${lens.question}”重新审视${topic}。本期从${phase.title}切入，把现场信号、数据口径、跨职能责任、验证边界与标准固化连成一条可执行的工程闭环。`;
  const signals = rotate(guide.signals, index % guide.signals.length).concat([
    `场景约束：${context.condition}`,
    `优先警惕：${context.risk}`
  ]);
  const steps = [
    phase.action,
    ...rotate(guide.steps, index % guide.steps.length),
    '用改善前后实绩复核收益、波动和副作用，确认关闭证据',
    '将有效方法写入标准、点检、系统规则与复盘节奏'
  ];
  const pitfalls = rotate(guide.pitfalls, index % guide.pitfalls.length).concat([
    context.risk,
    lens.boundary
  ]);
  const links = moduleLinks(topic).map((item) => `<a href="${item.href}"><strong>${item.name}</strong><span>${item.text}</span></a>`).join('');
  const tags = [topic, context.name.replace(/／.*$/, ''), phase.title];

  const article = `<article class="post detailed" id="${date}">
<div class="visual">${visual({ title, cat: topic }, index)}</div>
<div class="content">
<div class="date">${date}｜${escapeHtml(topic)}</div>
<h2>${escapeHtml(title)}</h2>
<p>${escapeHtml(summary)}</p>
<div class="quote">${escapeHtml(guide.takeaway)}</div>

<h3>1. 今日工程命题</h3>
<p>${escapeHtml(guide.definition)} 在${escapeHtml(context.name)}中，${escapeHtml(context.condition)}。因此，本期不从工具名称出发，而先回答：${escapeHtml(lens.question)}。</p>
<div class="engineering-checklist"><strong>本期切口：</strong>${escapeHtml(phase.focus)}。判断是否有效，必须能够回到真实对象、真实数据、真实责任和真实结果。</div>

<h3>2. 现场识别信号</h3>
${list(signals)}
<p>这些信号不是结论，而是进入现场调查的入口。应继续按产品、班组、设备、物料批次、时间段或异常类型分层，避免用平均值掩盖波动。</p>

<h3>3. 核心指标与证据口径</h3>
<div class="brief-learning-grid">
  <div class="brief-learning-card"><strong>方法口径</strong><p>${escapeHtml(guide.formula)}</p></div>
  <div class="brief-learning-card"><strong>本期证据</strong><p>${escapeHtml(lens.metric)}；现场至少保留${escapeHtml(context.evidence)}。</p></div>
</div>
<p>数据必须说明来源、分母、时间范围、版本和异常样本。无法追溯到订单、产品、工序、设备或责任对象的数据，不宜直接用于评价个人或判断项目收益。</p>

<h3>4. 从动作到闭环的推进路径</h3>
${list(steps, true)}

<h3>5. 跨职能责任与交付接口</h3>
<div class="owner-grid">
  <div class="owner-card"><strong>主责：${escapeHtml(role.owner)}</strong>定义问题边界、方法、数据口径与阶段交付物，对专业判断负责。</div>
  <div class="owner-card"><strong>协同：${escapeHtml(role.partner)}</strong>提供真实现场条件与约束，参与试点并及时暴露异常。</div>
  <div class="owner-card"><strong>验收：${escapeHtml(role.reviewer)}</strong>按安全、质量、成本、交付和收益证据判断是否进入下一阶段。</div>
  <div class="owner-card"><strong>系统固化</strong>${escapeHtml(role.system)}必须同步更新版本、生效日期、维护责任与异常升级规则。</div>
</div>

<h3>6. 常见失效与使用边界</h3>
${list(pitfalls)}
<p>任何方法都不能脱离产品特性、工艺风险、人员技能、设备能力和客户要求直接复制。先验证边界，再扩大范围，才能避免把局部经验变成新的系统风险。</p>

<h3>7. 关联 QilyLean 职能与项目</h3>
<div class="brief-related-grid">${links}</div>

<h3>8. 今天可以落地的一步</h3>
<div class="brief-action-strip">
  <span>选一个典型对象</span><span>记录一组真实基准</span><span>验证一个主要假设</span><span>固化一条有效标准</span>
</div>
<p><strong>今日动作：</strong>${escapeHtml(phase.action)}。完成后不要急于宣布结案，先确认数据是否可复现、现场是否能维持、责任是否已经移交。</p>

<h3>工程者手记</h3>
<div class="engineering-checklist"><strong>坚持的力量：</strong>${escapeHtml(energy)} ${escapeHtml(guide.takeaway)}</div>
<div class="tags">${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
<button class="share" type="button">分享本期网址</button><span class="status"></span>
</div>
</article>`;

  return {
    date,
    article,
    title,
    summary,
    dayNo: '',
    theme: topic,
    archive: true
  };
}

function collectArchiveBriefs(visual) {
  const topics = Object.keys(guides);
  return datesBetween(archiveStart, archiveEnd).map((date, index) => {
    const topic = topics[index % topics.length];
    const lens = lenses[Math.floor(index / topics.length) % lenses.length];
    const context = contexts[Math.floor(index / (topics.length * lenses.length)) % contexts.length];
    const month = Number(date.slice(5, 7));
    const phase = phases[(month + index) % phases.length];
    const role = roles[(index * 5 + month) % roles.length];
    const energy = energyNotes[(index + Number(date.slice(0, 4))) % energyNotes.length];
    return buildArchiveArticle({
      date,
      topic,
      guide: guides[topic],
      lens,
      context,
      phase,
      role,
      energy,
      visual,
      index
    });
  });
}

module.exports = {
  archiveStart,
  archiveEnd,
  collectArchiveBriefs
};
