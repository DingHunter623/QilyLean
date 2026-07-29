#!/usr/bin/env node
'use strict';

const { guides, resolveIntegration } = require('./enhance-daily-archive');

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

const careerTimeline = [
  { year: '2026', field: '汽车座椅开关总成制造' },
  { year: '2025', field: '小家电制造' },
  { year: '2024', field: '汽车电子、整流器' },
  { year: '2023', field: '逆变器制造' },
  { year: '2022', field: '新能源负极材料制造' },
  { year: '2021', field: '电磁阀制造' },
  { year: '2020', field: '游戏机手柄制造' },
  { year: '2019', field: '电子烟制造' }
];

/*
 * The public archive keeps product names in the consolidated career timeline
 * only. Individual briefs use method- and problem-led language so the archive
 * reads as engineering practice rather than a daily product roll call.
 */
const experienceStages = {
  '2019': {
    condition: '短周期手工作业、焊接、密封、功能检测与包装相互衔接，人员熟练度和物料切换会直接放大节拍波动',
    risk: '只追逐当日产量，容易用加人、堆料和返工掩盖动作浪费、错漏装与检测不稳定',
    evidence: '工序CT、动作次数、一次通过率、换线时间、缺陷分层、在制数量与人员配置',
    scenes: [
      { name: '短周期装配线', signal: '工位忙闲明显却仍然欠产', loss: '局部忙碌' },
      { name: '焊接与功能检测', signal: '返工集中在少数工位反复出现', loss: '终检拦截' },
      { name: '密封与外观检验', signal: '同类缺陷在班次之间波动', loss: '平均合格率' },
      { name: '多品种换线现场', signal: '换线后首件确认反复调整', loss: '临时准备' }
    ]
  },
  '2020': {
    condition: '多部件装配、焊接、程序烧录、功能测试与包装节拍相互制约，订单组合和人员技能变化频繁',
    risk: '只看总装末端产出，容易忽略前置齐套、左右手动作、测试等待和返修回流',
    evidence: '客户节拍、山积图、左右手作业记录、测试周期、齐套率、返修路径与UPPH',
    scenes: [
      { name: '多部件总装线', signal: '人员都在动作但线体仍有堵点', loss: '表面开动率' },
      { name: '焊接与烧录工位', signal: '人工等待与设备等待交替发生', loss: '单机效率' },
      { name: '机构与功能测试', signal: '测试通过却在后段重复返修', loss: '一次判定' },
      { name: '包装与出货衔接', signal: '成品堆在末端仍赶不上交期', loss: '末端库存' }
    ]
  },
  '2021': {
    condition: '机电部件装配、线圈与电气检测、密封测试、参数设定和首件确认共同决定过程稳定性',
    risk: '把异常归因于人员注意力，容易漏掉治具定位、参数窗口、来料波动和量测一致性',
    evidence: '工艺参数、首件记录、泄漏或功能测试值、量具状态、FPY、返工工时与批次追溯',
    scenes: [
      { name: '机电部件装配', signal: '尺寸合格但总装功能仍不稳定', loss: '单项尺寸判断' },
      { name: '线圈与电气检测', signal: '检测值在临界区间频繁波动', loss: '只判合格与否' },
      { name: '密封与泄漏测试', signal: '重复测试后结果发生变化', loss: '重复检测' },
      { name: '参数与首件确认', signal: '每次换型都依赖老师傅调机', loss: '个人经验' }
    ]
  },
  '2022': {
    condition: '批次配方、连续设备、过程窗口、实验检测、环境与放行规则共同影响一致性和交付节奏',
    risk: '只看最终检验结果，容易忽略批间波动、设备微停、参数漂移、等待放行和能源损失',
    evidence: '批次号、配方与版本、关键参数趋势、设备停机代码、实验数据、放行时间与单位能耗',
    scenes: [
      { name: '批次制程现场', signal: '相同设定下批次结果仍有差异', loss: '最终平均值' },
      { name: '配方与工艺窗口', signal: '参数都在范围内却持续靠近边界', loss: '规格内即稳定' },
      { name: '连续设备运行', signal: '大故障不多但产能持续打折', loss: '只统计停机' },
      { name: '实验与批次放行', signal: '加工完成后仍长时间等待放行', loss: '加工周期' }
    ]
  },
  '2023': {
    condition: 'SMT、插件、总装、电气安全、老化测试和量产导入需要在版本、物料、工艺与产能上同步成熟',
    risk: '追求设备稼动和试产进度，容易把版本错用、测试瓶颈、返修回流和阶段问题带入量产',
    evidence: 'BOM与程序版本、设备停机、测试CT、FPY、老化通过率、问题关闭率与产能验证记录',
    scenes: [
      { name: '电子制程衔接', signal: '前段高稼动却不断向后段推积在制', loss: '设备局部最优' },
      { name: '总装与电气测试', signal: '装配节拍满足而测试工位持续排队', loss: '单工序达成' },
      { name: '老化与可靠性验证', signal: '等待测试的时间远高于加工时间', loss: '加工效率' },
      { name: '试产与量产爬坡', signal: '问题未关闭就进入下一阶段', loss: '节点完成' }
    ]
  },
  '2024': {
    condition: '高可靠电子制造强调多品种追溯、过程防错、变更控制、特殊特性和跨部门量产准备',
    risk: '只靠终检或临时遏制保交付，容易让过程风险、文件不一致、供应波动和重复异常继续累积',
    evidence: '订单与批次、PFMEA、控制计划、工艺版本、防错点检、FPY、DPPM与问题关闭证据',
    scenes: [
      { name: '高可靠电子装配', signal: '错漏装风险仍依赖人工记忆控制', loss: '重复提醒' },
      { name: '过程质量与追溯', signal: '结果可查但过程参数无法回溯', loss: '结果追溯' },
      { name: '变更与量产准备', signal: '文件已更新而现场仍执行旧版本', loss: '文件完成' },
      { name: '供应与制造协同', signal: '来料异常在生产末端才集中暴露', loss: '内部检验' }
    ]
  },
  '2025': {
    condition: '多品种总装、包装、季节性订单、物料齐套、人员熟练度和自动化接口共同影响交付能力',
    risk: '依赖临时增人和加班追单，容易掩盖标准工时失真、排产断点、缺料等待和包装瓶颈',
    evidence: '订单交期、标准工时、实际人力、工位负荷率、齐套率、欠产原因、包装CT与结单状态',
    scenes: [
      { name: '多品种总装现场', signal: '计划数量明确却无法解释当日欠产', loss: '加班追产' },
      { name: '季节性订单排产', signal: '计划频繁变更导致前后工序失去节奏', loss: '滚动插单' },
      { name: '物料齐套与线边配送', signal: '线边库存很多却仍然发生缺料', loss: '高库存保护' },
      { name: '包装与自动化接口', signal: '前段产出提升后末端开始堆积', loss: '理论省人' }
    ]
  }
};

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

const topicLabels = {
  'Factory Layout': '工厂布局规划',
  'ERP/MES': 'ERP／MES协同'
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

const titlePatterns = [
  ({ topic, lens }) => `${lens.title}，${topic}才有可靠起点`,
  ({ topic, phase, lens }) => `${topic}怎样以“${lens.title}”推进${phase.title}`,
  ({ topic, scene, phase }) => `现场出现“${scene.signal}”，先用${topic}做${phase.title}`,
  ({ topic, scene, phase }) => `别让${scene.loss}遮住瓶颈：${topic}的${phase.title}`,
  ({ topic, lens, phase }) => `从一组原始记录开始，把${topic}做到${phase.title}`,
  ({ topic, phase, lens }) => `${topic}不是口号：${phase.title}必须${lens.title}`,
  ({ topic, scene, lens }) => `${scene.name}为什么更要守住${topic}边界`,
  ({ topic, lens, phase }) => `看见波动以后，${topic}如何完成${phase.title}`,
  ({ topic, lens, scene }) => `${lens.title}——来自${scene.name}的一次${topic}复盘`,
  ({ topic, phase, lens }) => `把异常变成项目：${topic}怎样推进${phase.title}`,
  ({ topic, lens, phase }) => `交付不止“做完”：${topic}在${phase.title}如何验证结果`,
  ({ topic, scene, lens }) => `${topic}进入${scene.name}日常管理，需要哪四类证据`,
  ({ topic, scene, lens }) => `当“${scene.signal}”，怎样用${topic}破题`,
  ({ topic, lens, scene }) => `先问数据再问责任：${scene.name}的${topic}判断`,
  ({ topic, phase, scene }) => `从${phase.title}到复制，${topic}最容易漏掉什么`,
  ({ topic, phase, lens }) => `一项可验收的${topic}，怎样完成${phase.title}`,
  ({ topic, phase, lens }) => `${phase.title}为何决定${topic}能否真正维持`,
  ({ topic, lens, phase }) => `不靠经验硬撑：${topic}的${phase.title}要${lens.title}`,
  ({ topic, scene, lens }) => `${scene.loss}减少以后，${topic}还要检查什么`,
  ({ topic, lens, scene }) => `把“${lens.title}”落实到${scene.name}`,
  ({ topic, phase, scene }) => `${scene.name}的${phase.title}，先从${topic}证据链开始`,
  ({ topic, lens, phase }) => `${topic}的现场判断：${lens.title}之后怎样${phase.title}`,
  ({ topic, scene, phase }) => `为什么“${scene.signal}”不能只靠催产：${topic}${phase.title}`,
  ({ topic, lens, scene }) => `真正可复制的${topic}，要经得起${scene.name}验证`
];

const summaryPatterns = [
  ({ topic, lens, scene, phase }) => `本期围绕${topic}，从${scene.name}的现场信号切入，回答“${lens.question}”。推进重点落在${phase.title}、证据口径、跨职能责任和结果复验。`,
  ({ topic, lens, scene, phase }) => `当${scene.signal}时，先不要急着归因。本期用${topic}建立事实边界，并沿着${phase.title}把判断、行动、验收和标准更新连接起来。`,
  ({ topic, lens, scene, phase }) => `${topic}的价值不在工具名称，而在能否解决${scene.name}的真实问题。本期以${lens.title}为判断原则，完成一轮${phase.title}推演。`,
  ({ topic, lens, scene, phase }) => `从${scene.name}的一组原始记录出发，本期拆解${topic}如何形成可复现、可验收、可维持的${phase.title}交付，避免用${scene.loss}代替系统结果。`,
  ({ topic, lens, scene, phase }) => `本期不追求大而全，而是把${topic}压缩为一个可验证动作：围绕${lens.title}，在${scene.name}完成${phase.title}并留下关闭证据。`,
  ({ topic, lens, scene, phase }) => `${scene.name}出现波动时，${topic}需要同时守住数据、质量、安全、交付和责任边界。本期从${phase.title}展开，检验${lens.title}是否真正落地。`,
  ({ topic, lens, scene, phase }) => `一次可信的${topic}交付，应当说明问题从哪里来、数据如何采、方案如何试、结果由谁验。本期结合${scene.name}，重点复盘${phase.title}。`,
  ({ topic, lens, scene, phase }) => `面对${scene.signal}，本期先用“${lens.title}”校准判断，再用${topic}推进${phase.title}，最终把现场经验沉淀为版本、点检与复盘机制。`
];

const sectionHeadingSets = [
  ['今天先回答什么', '现场先看见什么', '数据怎样证明', '从动作走向闭环', '谁负责、谁协同、谁验收', '哪些做法容易失效', '关联 QilyLean 职能与项目', '今天可以落地的一步'],
  ['本期工程判断', '异常从哪里露头', '证据链与计算口径', '试点验证路径', '跨职能交付接口', '风险与使用边界', '继续延伸的方法入口', '带回现场的动作'],
  ['问题边界', '现场信号清单', '基准、分母与样本', '推进节奏', '责任和关闭标准', '别踩这些坑', '关联能力与项目实践', '下一步只做这一件事'],
  ['从现场问题开始', '识别真正损失', '把判断落到数据', '形成可验收交付', '让接口不再靠催', '复制前先看边界', 'QilyLean 方法关联', '今日最小闭环'],
  ['这期为什么值得做', '先收集这些事实', '指标不能缺少什么', '由小试验走向标准', '项目责任矩阵', '常见偏差与防再发', '关联知识与项目', '今天完成一个验证'],
  ['先把现象说准确', '去现场核对信号', '保留可追溯证据', '把方案跑完整', '明确交付责任', '验证不能忽略的边界', '连接 QilyLean 体系', '落地动作与复验']
];

function stageFor(date, index) {
  const year = date.slice(0, 4);
  const stage = experienceStages[year];
  if (!stage) throw new Error(`No experience stage configured for ${date}`);
  const scene = stage.scenes[(index + Number(date.slice(5, 7))) % stage.scenes.length];
  return { stage, scene };
}

function uniqueTitle(candidate, { scene, phase, lens, index }, usedTitles) {
  const options = [
    candidate,
    `${candidate}（${scene.name}现场）`,
    `${candidate}——${phase.focus}`,
    `${candidate}，再核对${lens.title}`,
    `${candidate}（${['数据口径', '责任接口', '试点验证', '风险边界', '标准固化', '交付复盘'][index % 6]}）`
  ];
  const title = options.find((option) => !usedTitles.has(option));
  if (!title) throw new Error(`Cannot create a distinct title for ${candidate}`);
  usedTitles.add(title);
  return title;
}

function buildArchiveArticle({ date, topic, guide, lens, stage, scene, phase, role, energy, visual, index, usedTitles }) {
  const publicTopic = topicLabels[topic] || topic;
  const titleContext = { topic: publicTopic, lens, scene, phase };
  const title = uniqueTitle(
    titlePatterns[(index + Math.floor(index / 7) + Number(date.slice(0, 4))) % titlePatterns.length](titleContext),
    { scene, phase, lens, index },
    usedTitles
  );
  const summary = summaryPatterns[(index + Number(date.slice(5, 7))) % summaryPatterns.length](titleContext);
  const headings = sectionHeadingSets[(index + Number(date.slice(8, 10))) % sectionHeadingSets.length];
  const signals = rotate(guide.signals, index % guide.signals.length).concat([
    `场景约束：${stage.condition}`,
    `优先警惕：${stage.risk}`
  ]);
  const steps = [
    phase.action,
    ...rotate(guide.steps, index % guide.steps.length),
    '用改善前后实绩复核收益、波动和副作用，确认关闭证据',
    '将有效方法写入标准、点检、系统规则与复盘节奏'
  ];
  const pitfalls = rotate(guide.pitfalls, index % guide.pitfalls.length).concat([
    stage.risk,
    lens.boundary
  ]);
  const links = moduleLinks(topic).map((item) => `<a href="${item.href}"><strong>${item.name}</strong><span>${item.text}</span></a>`).join('');
  const tags = [publicTopic, scene.name, phase.title];

  const article = `<article class="post detailed" id="${date}">
<div class="visual">${visual({ title, cat: publicTopic }, index)}</div>
<div class="content">
<div class="date">${date}｜${escapeHtml(publicTopic)}</div>
<h2>${escapeHtml(title)}</h2>
<p>${escapeHtml(summary)}</p>
<div class="quote">${escapeHtml(guide.takeaway)}</div>

<h3>1. ${escapeHtml(headings[0])}</h3>
<p>${escapeHtml(guide.definition)} 在${escapeHtml(scene.name)}中，${escapeHtml(stage.condition)}。因此，本期不从工具名称出发，而先回答：${escapeHtml(lens.question)}。</p>
<div class="engineering-checklist"><strong>本期切口：</strong>${escapeHtml(phase.focus)}。判断是否有效，必须能够回到真实对象、真实数据、真实责任和真实结果。</div>

<h3>2. ${escapeHtml(headings[1])}</h3>
${list(signals)}
<p>这些信号不是结论，而是进入现场调查的入口。应继续按产品、班组、设备、物料批次、时间段或异常类型分层，避免用平均值掩盖波动。</p>

<h3>3. ${escapeHtml(headings[2])}</h3>
<div class="brief-learning-grid">
  <div class="brief-learning-card"><strong>方法口径</strong><p>${escapeHtml(guide.formula)}</p></div>
  <div class="brief-learning-card"><strong>本期证据</strong><p>${escapeHtml(lens.metric)}；现场至少保留${escapeHtml(stage.evidence)}。</p></div>
</div>
<p>数据必须说明来源、分母、时间范围、版本和异常样本。无法追溯到订单、产品、工序、设备或责任对象的数据，不宜直接用于评价个人或判断项目收益。</p>

<h3>4. ${escapeHtml(headings[3])}</h3>
${list(steps, true)}

<h3>5. ${escapeHtml(headings[4])}</h3>
<div class="owner-grid">
  <div class="owner-card"><strong>主责：${escapeHtml(role.owner)}</strong>定义问题边界、方法、数据口径与阶段交付物，对专业判断负责。</div>
  <div class="owner-card"><strong>协同：${escapeHtml(role.partner)}</strong>提供真实现场条件与约束，参与试点并及时暴露异常。</div>
  <div class="owner-card"><strong>验收：${escapeHtml(role.reviewer)}</strong>按安全、质量、成本、交付和收益证据判断是否进入下一阶段。</div>
  <div class="owner-card"><strong>系统固化</strong>${escapeHtml(role.system)}必须同步更新版本、生效日期、维护责任与异常升级规则。</div>
</div>

<h3>6. ${escapeHtml(headings[5])}</h3>
${list(pitfalls)}
<p>任何方法都不能脱离产品特性、工艺风险、人员技能、设备能力和客户要求直接复制。先验证边界，再扩大范围，才能避免把局部经验变成新的系统风险。</p>

<h3>7. ${escapeHtml(headings[6])}</h3>
<div class="brief-related-grid">${links}</div>

<h3>8. ${escapeHtml(headings[7])}</h3>
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
    theme: publicTopic,
    archive: true
  };
}

function collectArchiveBriefs(visual) {
  const topics = Object.keys(guides);
  const usedTitles = new Set();
  return datesBetween(archiveStart, archiveEnd).map((date, index) => {
    const topic = topics[index % topics.length];
    const lens = lenses[Math.floor(index / topics.length) % lenses.length];
    const { stage, scene } = stageFor(date, index);
    const month = Number(date.slice(5, 7));
    const phase = phases[(month + index) % phases.length];
    const role = resolveIntegration(topic);
    const energy = energyNotes[(index + Number(date.slice(0, 4))) % energyNotes.length];
    return buildArchiveArticle({
      date,
      topic,
      guide: guides[topic],
      lens,
      stage,
      scene,
      phase,
      role,
      energy,
      visual,
      index,
      usedTitles
    });
  });
}

module.exports = {
  archiveStart,
  archiveEnd,
  careerTimeline,
  collectArchiveBriefs
};
