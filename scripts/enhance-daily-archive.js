#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const qily = path.join(root, 'qilylean');
const dailyDir = path.join(qily, 'daily');
const assetDir = path.join(qily, 'assets');
const archiveStart = '2019-07-10';
const archiveVisualEnd = '2025-12-18';

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function escapeXml(value) {
  return escapeHtml(value);
}

function textFromHtml(value) {
  return String(value || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function capture(value, expression, fallback = '') {
  const match = String(value).match(expression);
  return match ? match[1] : fallback;
}

const defaultGuide = {
  definition: '该主题属于制造运营与持续改善的基础知识。培训时应先统一对象、责任、数据来源和判定口径，再结合真实订单、设备、工序或异常案例理解其管理边界。',
  signals: ['现场现象是否能够被量化', '数据是否能追溯到责任对象与时间点', '改善后是否形成稳定标准并持续复核'],
  formula: '没有统一适用的单一公式时，至少建立“现状基准—目标值—实际值—差异原因—关闭状态”五项数据链。',
  steps: ['选取典型产品族、设备或区域建立现状基准', '明确问题定义、数据口径、责任人和验证周期', '小范围试运行并记录异常边界', '用改善前后数据复盘，固化为标准、点检或系统规则'],
  pitfalls: ['只讲概念，不落到现场对象与数据', '只追求单项指标，不检查质量、安全和交付影响', '改善完成后没有版本、责任和维持机制'],
  takeaway: '学员应能够说明该方法解决什么问题、需要哪些数据、由谁负责、如何验证，以及何时不能直接套用。'
};

const guides = {
  '精益生产': {
    definition: '精益生产以客户价值为起点，通过识别并消除过量生产、等待、搬运、库存、动作、返工和过度加工等浪费，缩短交付周期并提升质量、成本和交付的综合表现。',
    signals: ['在制品和等待时间明显高于实际加工时间', '局部设备很忙但订单仍频繁延期', '返工、搬运和重复确认占用大量资源'],
    formula: '改善优先级可用“影响金额或时间 × 发生频次 × 可控程度”排序，并同步观察 Lead Time、WIP、FPY 与交付达成率。',
    steps: ['从客户需求与交付链路界定价值', '到现场识别八大浪费并量化损失', '优先处理瓶颈与跨工序等待', '验证后更新标准作业并横向复制'],
    pitfalls: ['把精益等同于裁员或压库存', '只做活动周而不建立日常管理', '局部效率改善反而放大在制品'],
    takeaway: '精益不是一组口号，而是用事实识别损失、用标准稳定过程、用持续改善提升交付能力。'
  },
  'IE方法': {
    definition: '工业工程通过作业研究、时间研究、产能分析、线平衡、人机配置和布局物流优化，使人、机、料、法、环等资源形成可计算、可验证的生产系统。',
    signals: ['标准工时来源不明或长期不换版', '排产、人力与实际瓶颈节拍不匹配', '同产品不同班组效率差异无法解释'],
    formula: '标准人工工时＝标准秒数÷3600；计划负荷＝计划数量×标准人工工时；UPPH＝合格产出÷（直接人力×实际工时）。',
    steps: ['分解作业并确认测时边界', '采集正常作业周期与异常样本', '评比、宽放并形成批准版本', '用生产实绩持续校准产能与人力'],
    pitfalls: ['用最快一次时间直接当标准', '只测动作时间而忽略等待与设备约束', '工艺或人机配置变化后仍沿用旧版本'],
    takeaway: 'IE数据的价值在于支撑排产、成本、人力和改善，而不是形成一张孤立台账。'
  },
  'PE工程': {
    definition: 'PE工程把产品设计要求转化为稳定、可执行、可追溯的制造过程，负责工艺流程、参数窗口、作业标准、工装治具、过程防错和工程变更落地。',
    signals: ['图纸、BOM、工艺文件与现场版本不一致', '同一产品依赖不同人员采用不同参数或方法', '异常长期靠返工和终检拦截而未回到过程设计'],
    formula: '过程成熟度应联合观察工艺文件覆盖率、首件通过率、FPY、参数超限次数、工程变更关闭率和重复异常率。',
    steps: ['识别产品关键特性与制造风险', '设计工艺路线、参数窗口、工装和检验控制', '在试产中验证正常、异常与边界条件', '批准工艺版本并通过分层审核持续校准'],
    pitfalls: ['只编写SOP而不验证过程能力', '工程变更只更新文件不确认现场切换', '把人员培训当作唯一的过程防错'],
    takeaway: 'PE的核心不是把文件写完整，而是让制造过程能够稳定地产出符合要求的产品。'
  },
  'ME工程': {
    definition: 'ME工程围绕设备、工装、治具和自动化单元的选型、导入、验收、保全与持续改造，保障安全、质量、节拍、换型和可维护性同时成立。',
    signals: ['设备理论节拍达成但有效产出不足', '故障、微停、换型和调试损失没有统一代码', '自动化异常只能依赖原厂或个别人员恢复'],
    formula: '设备交付至少联合评价OEE、MTBF、MTTR、节拍达成率、故障恢复时间、误报警率、备件保障率和生命周期成本。',
    steps: ['把产品、工艺、安全和产能要求转化为URS', '通过FAT、SAT验证正常、异常和极限状态', '建立点检、保全、备件、权限与故障代码', '用运行实绩持续优化节拍、换型和可靠性'],
    pitfalls: ['只验收正常运行和理论节拍', '只计算省人而忽略维护与停机成本', '设备交付后没有技术资料和能力移交'],
    takeaway: 'ME要交付的不是一台能动的设备，而是一套安全、稳定、可维护的制造能力。'
  },
  'VSM': {
    definition: '价值流图析同时呈现客户需求、信息流、物料流、库存、加工与等待，用于识别从订单到交付的整体周期损失，并设计未来态流程。',
    signals: ['增值时间占总交付周期比例很低', '工序之间存在大量库存与等待', '计划信息多次转抄且响应延迟'],
    formula: 'PCE＝增值时间÷总交付周期×100%；总 Lead Time 应包含加工、等待、库存和流动。',
    steps: ['选择产品族并确认客户节拍', '从出货端逆向走查物料与信息流', '记录 CT、C/O、WIP、可用率和等待', '设计拉动、FIFO、节拍与改善项目的未来态'],
    pitfalls: ['只画工艺流程而没有信息流', '用理想数据代替现场真实库存', '未来态没有责任、里程碑和验证指标'],
    takeaway: 'VSM的核心不是画图，而是让交付链路中的等待、库存和信息断点可见。'
  },
  'SMED': {
    definition: '快速换型通过区分内部与外部作业、并行准备、快换连接、参数标准化和首件确认优化，缩短上一型号合格品到下一型号合格品之间的停机时间。',
    signals: ['停机后才寻找工具、物料或参数', '多人等待单一确认动作', '首件反复调整导致换型尾部时间过长'],
    formula: '换型时间＝下一型号首件合格时刻－上一型号末件合格时刻；改善率＝（改善前－改善后）÷改善前×100%。',
    steps: ['录像并逐项拆解换型动作', '把可提前完成的作业转为外部作业', '并行化、快换化并减少调整次数', '标准化准备清单、参数和首件判定'],
    pitfalls: ['只要求人员加快动作', '忽略准备、等待和首件验证', '缩短时间却增加安全与质量风险'],
    takeaway: 'SMED先消除停机期间不该发生的工作，再优化必须停机完成的动作。'
  },
  'OEE': {
    definition: '设备综合效率把时间开动、运行速度和合格产出三类损失合并衡量，用于识别故障、换型、微停、降速和不良对有效产能的影响。',
    signals: ['设备开机时间长但有效产出低', '故障、微停和降速未分类记录', 'OEE数字提升但订单产出没有同步改善'],
    formula: 'OEE＝可动率×性能效率×质量率；必须统一计划生产时间、理想周期和合格数量口径。',
    steps: ['建立停机与速度损失代码', '按班次自动或及时记录事件', '用 Pareto 识别主要损失', '验证对策后更新点检、保全和参数标准'],
    pitfalls: ['只公布一个百分比而不拆损失', '不同设备使用不同时间口径', '通过降低计划时间人为抬高OEE'],
    takeaway: 'OEE不是考核设备的单一分数，而是把产能损失转化为改善项目的入口。'
  },
  'JIT': {
    definition: 'JIT以客户需求为拉动信号，在需要的时间、按需要的数量生产和配送需要的物料，通过均衡、节拍、拉动、快速换型与稳定供应减少过量生产和等待。',
    signals: ['前工序按预测大量生产而后工序持续堆积', '线边库存很高却仍频繁缺料', '计划频繁插单导致换型、急料和加班同步增加'],
    formula: 'JIT应联合观察客户节拍、补充周期、看板数量、库存周转、缺料率、计划达成率和订单Lead Time，而不是只看库存下降。',
    steps: ['按产品族确认需求节奏与波动', '稳定工艺、质量、换型和物料补充条件', '建立冻结窗口、拉动信号与FIFO边界', '从小范围试点验证缺料、异常和恢复机制'],
    pitfalls: ['把JIT等同于零库存', '供应与过程尚不稳定就强行压缩缓冲', '只要求供应商提速而不治理内部波动'],
    takeaway: 'JIT不是取消所有库存，而是让生产和物流按真实需求节奏稳定流动。'
  },
  'PDCA': {
    definition: 'PDCA通过计划、执行、检查和处置四个步骤循环推进问题解决，使目标、假设、试验、结果和标准更新形成可追溯的学习闭环。',
    signals: ['对策先于问题定义和原因验证', '行动完成后没有改善前后数据', '有效经验没有进入标准或下一轮计划'],
    formula: 'PDCA质量可用目标达成率、假设验证率、对策有效率、标准更新及时率、复发率和下一轮问题关闭率衡量。',
    steps: ['Plan：定义问题、基准、目标、原因假设与验证计划', 'Do：限定范围试行并保留原始记录', 'Check：比较目标、实绩、波动和副作用', 'Act：固化有效做法或修正假设进入下一循环'],
    pitfalls: ['把PDCA写成四个栏目而没有验证逻辑', 'Do阶段直接全面推广', 'Check只确认任务完成，不确认结果有效'],
    takeaway: 'PDCA的价值不在四个字母，而在每一轮都用证据减少不确定性并更新标准。'
  },
  'PQCD': {
    definition: 'PQCD把生产效率、质量、成本和交付放在同一管理视角，防止局部效率提升以牺牲质量、库存、加班或交期为代价。',
    signals: ['产量提高但返工、库存或客诉同步上升', '成本下降来自延后维护或透支人员负荷', '局部工序达成而订单整体仍延期'],
    formula: 'PQCD至少同步观察合格产出或UPPH、FPY/DPPM、单位制造成本、计划与订单交付达成率，并保留安全约束。',
    steps: ['从客户与经营目标分解PQCD基准', '建立同一周期、同一对象的数据看板', '对异常进行交叉影响分析', '关闭项目时联合验收收益与副作用'],
    pitfalls: ['只用产量评价现场', '各部门采用不同分母和统计周期', '改善收益只报正向结果而不披露转移损失'],
    takeaway: 'PQCD要求工程改善取得综合最优，而不是制造一个漂亮的单项指标。'
  },
  'Kaizen': {
    definition: 'Kaizen以现场人员持续发现和解决问题为基础，通过小步试验、快速验证、标准更新和横向复制，把每天的改善积累为长期竞争力。',
    signals: ['改善活动只在检查或专项周出现', '建议数量很多但有效关闭与维持很少', '同类问题在不同区域重复发生'],
    formula: 'Kaizen应联合评价有效关闭率、维持达成率、重复问题率、标准更新率、横向复制率和经确认的持续收益。',
    steps: ['建立现场问题与改善机会入口', '按安全、质量、交付和损失排序', '用最小可行试验快速验证', '标准化、复验并把经验复制到相似场景'],
    pitfalls: ['把Kaizen等同于低成本小创意', '只统计提案件数而不验证效果', '改善依赖个人维持且未进入标准'],
    takeaway: 'Kaizen的力量来自持续的小闭环，让现场每天比昨天更稳定、更安全、更高效。'
  },
  '6S': {
    definition: '6S以整理、整顿、清扫、清洁、素养和安全建立稳定现场秩序，使物品、状态、标准、风险和责任能够被快速识别。',
    signals: ['寻找、搬运和等待频繁发生', '区域标准随人员变化而变化', '点检记录与现场状态不一致'],
    formula: '稽查结果应同时统计符合率、重复问题率、逾期关闭率和红线问题数量，避免只看平均分。',
    steps: ['清理不必要物品并划定责任区域', '按频次和动作顺序定置', '建立清扫点检与异常标签', '通过分层稽查、复盘和标准维护形成习惯'],
    pitfalls: ['把6S等同于卫生检查', '突击整改后没有维持责任', '只扣分，不分析重复问题根因'],
    takeaway: '有效的6S会减少寻找和误用，让异常更早暴露，而不是让现场看起来更整齐。'
  },
  '目视化管理': {
    definition: '目视化管理把位置、数量、状态、标准、风险和责任转化为现场人员能够快速理解并采取行动的信息，降低沟通和判断成本。',
    signals: ['看板数据长期不更新', '标识很多但无法支持判断', '异常出现后仍需逐层询问才能确认状态'],
    formula: '有效性可按“识别时间、更新及时率、异常响应时间、误判次数”评价，而不是按标识数量评价。',
    steps: ['明确使用者和要回答的问题', '统一颜色、符号、字段和更新责任', '在真实作业场景验证可读性', '定期淘汰失效、重复和装饰性信息'],
    pitfalls: ['把目视化做成宣传装饰', '颜色含义不统一', '没有数据源和更新责任人'],
    takeaway: '好的目视化能让正常与异常一眼可辨，并直接提示下一步动作。'
  },
  'PMC': {
    definition: '生产与物料控制以订单交期为目标，协调需求、库存、物料齐套、产能、人力、在制和生产实绩，形成可执行并可追踪的排产闭环。',
    signals: ['计划频繁变化且没有冻结窗口', '排产不引用有效标准工时', '欠产、超产和尾单状态无法自动闭环'],
    formula: '净需求＝订单需求－可用库存－可用在制；负荷率＝计划标准工时÷可用直接工时×100%。',
    steps: ['统一订单、物料与产品编码', '匹配有效标工和齐套状态', '建立近期冻结计划与变更规则', '按订单回写实绩、差异和预计结单日期'],
    pitfalls: ['只排数量，不核产能与物料', '用产品名称代替唯一编码匹配', '超产后不冲减后续尾单计划'],
    takeaway: 'PMC计划必须建立在真实能力和物料约束上，并通过生产实绩持续校准。'
  },
  'ERP/MES': {
    definition: 'ERP负责经营资源与业务主线，MES侧重制造执行与现场实绩。两者的价值取决于编码、BOM、工艺路线、库存、工时和状态规则是否一致。',
    signals: ['同一产品在不同系统中编码或名称不一致', '系统库存与现场实物长期偏差', '报工只记总数，无法回到订单与工序'],
    formula: '数据质量可用完整率、准确率、及时率、一致率和可追溯率衡量；接口成功不等于业务闭环。',
    steps: ['先清理主数据与业务口径', '选择典型产品完成端到端试运行', '验证异常、退料、返工和尾单边界', '稳定后再扩大接口、权限与自动化范围'],
    pitfalls: ['把系统上线当作管理完成', '流程未稳定就大量定制功能', '用线下表格绕开系统导致双重口径'],
    takeaway: '数字化不是把混乱搬进系统，而是先统一规则，再让系统放大稳定管理能力。'
  },
  'Factory Layout': {
    definition: '工厂与产线布局规划通过产品族、产能、设备、物流、人流、公辅、安全和扩展约束设计制造空间，使流动距离更短、交叉更少、扩产更可控。',
    signals: ['物料往返搬运和交叉路线多', '设备位置限制后续产能扩展', '消防、维修或人员通道被生产占用'],
    formula: '布局评价至少比较搬运距离×频次、面积利用率、物流交叉点、在制面积和扩展余量。',
    steps: ['确认产品族、产能与工艺路线', '建立设备、人员、物流和公辅约束清单', '绘制多方案并量化比较', '通过现场模拟和未来扩产情景验证'],
    pitfalls: ['先摆设备再补物流', '只看面积利用率不看流动', '忽略维修、安全和扩展空间'],
    takeaway: 'Layout不是绘图工作，而是对未来制造系统的空间化设计。'
  },
  '线平衡': {
    definition: '线平衡依据客户节拍、工序周期和作业先后关系重新配置工作内容与人员，使瓶颈、等待和人力闲置得到系统改善。',
    signals: ['相邻工位忙闲差异明显', '瓶颈工位持续堆积在制品', '增人后产出没有按比例提升'],
    formula: '线平衡率＝工序总作业时间÷（工位数×瓶颈CT）×100%；节拍满足还需验证质量与波动。',
    steps: ['测量各工序正常周期和波动', '绘制作业山积图并识别瓶颈', '用ECRS重分配、合并或并行动作', '试运行后复核产出、人力和异常'],
    pitfalls: ['简单平均分配秒数', '忽略设备自动周期和技能限制', '只看平均CT不看波动与停顿'],
    takeaway: '线平衡的目标不是让每个人同样忙，而是让整条线稳定满足客户节拍。'
  },
  '标准作业': {
    definition: '标准作业是在既定安全、质量和工艺条件下，经验证的当前最佳作业方法，通常包含作业顺序、标准在制、节拍、关键参数和异常处理。',
    signals: ['同一岗位不同人员方法差异大', '培训依赖口头传授', '异常发生后无法判断偏离了哪项标准'],
    formula: '标准遵守率不能单独作为结果，应与FPY、CT波动、异常次数和培训合格率联合评价。',
    steps: ['观察并分解当前作业', '确认安全、质量与关键动作要求', '试运行并由作业者参与优化', '批准、培训、审核并随改善及时换版'],
    pitfalls: ['把标准写成原则性口号', '文件与现场方法不一致', '标准长期不换版导致员工绕开执行'],
    takeaway: '标准作业既是培训和审核基准，也是下一轮改善能够被识别和验证的起点。'
  },
  '质量改善': {
    definition: '质量改善从客户要求和过程风险出发，通过数据分层、根因分析、过程控制和防错，降低不良、返工和流出风险，而不是只依赖终检拦截。',
    signals: ['同类缺陷重复发生', '检验加严但过程能力没有提升', '问题分析停留在人员不注意'],
    formula: 'FPY＝一次合格数量÷投入数量×100%；重大问题还应追踪DPPM、返工工时和客户流出。',
    steps: ['明确缺陷定义和影响范围', '按人机料法环测分层并验证根因', '优先实施过程控制与防错', '验证效果并更新PFMEA、控制计划和作业标准'],
    pitfalls: ['把相关性当作根因', '只做临时遏制不做永久对策', '对策完成后不验证再发风险'],
    takeaway: '质量必须由稳定过程制造出来，检验只能发现部分已经发生的问题。'
  },
  '防错': {
    definition: '防错通过结构、定位、感应、互锁、顺序控制和自动判定，阻止错误发生或在源头即时发现，降低对记忆、提醒和个人警惕性的依赖。',
    signals: ['高频重复作业依赖人工确认', '错误发生后到后工序才被发现', '相同装配方向或物料容易混淆'],
    formula: '防错评价应比较错误发生率、逃逸率、误报警率、节拍影响和维护成本。',
    steps: ['识别错误模式与发生条件', '优先选择源头阻止型方案', '验证正常、错误和故障三类状态', '纳入点检、维护和变更管理'],
    pitfalls: ['只增加警示标签或培训', '防错装置可被轻易旁路', '只验证正常状态，不验证故障失效'],
    takeaway: '最有效的防错不是提醒人别犯错，而是让错误难以发生且无法流出。'
  },
  'TPM': {
    definition: '全员生产维护通过自主保全、计划保全、专业改善和早期设备管理，维持设备基本条件并系统减少故障、微停、降速和质量损失。',
    signals: ['设备依赖故障后抢修', '清扫、润滑和紧固没有标准', '小异常长期存在并逐步演变为停机'],
    formula: '除MTBF、MTTR外，应把故障时间、微停次数、速度损失和重复故障率纳入分析。',
    steps: ['恢复清扫、润滑、紧固等基本条件', '建立异常点和点检标准', '按风险制定计划保全周期', '对重复损失开展根因改善并反馈设备设计'],
    pitfalls: ['把TPM全部交给设备部门', '点检表只签字不确认状态', '只统计大故障，忽略微停与降速'],
    takeaway: 'TPM的基础是让设备异常被尽早发现并被标准化处理，而不是提高抢修速度。'
  },
  '精益物流': {
    definition: '精益物流围绕生产节拍设计配送频次、容器数量、线边库存、补料信号和搬运路线，使正确物料按正确数量、时间和状态到达使用点。',
    signals: ['线边库存过多但仍频繁缺料', '容器、标签和数量不统一', '紧急补料和叉车往返占比高'],
    formula: '看板数量可结合需求速率×补充周期×安全系数÷容器数量估算，并用缺料率和库存天数验证。',
    steps: ['分析产品族、用量和补充周期', '标准化容器、数量与地址', '设计Milk Run或定时定量配送', '建立缺料、退料和异常补料闭环'],
    pitfalls: ['只优化搬运工具，不优化补充机制', '用高线边库存掩盖供应波动', '配送频次与生产节拍脱节'],
    takeaway: '精益物流追求的是稳定流动和快速响应，不是单纯减少仓库人员。'
  },
  '自动化': {
    definition: '制造自动化应建立在需求稳定、工艺成熟、接口清晰和投资收益可验证的基础上，优先处理重复、高风险、高一致性要求或人工难以稳定完成的任务。',
    signals: ['人工动作重复且波动大', '安全或质量风险无法仅靠培训控制', '工艺频繁变更导致设备长期调试'],
    formula: 'ROI＝年度净收益÷项目总投入×100%；回收期＝项目总投入÷年度净收益，并计入维护、停机和换型成本。',
    steps: ['先用ECRS简化并标准化流程', '明确节拍、质量、接口和异常边界', '完成FAT/SAT与极限状态验证', '建立备件、点检、权限和持续优化机制'],
    pitfalls: ['把不稳定流程直接自动化', '只计算省人，不计算维护与停机', '设备验收只跑正常产品'],
    takeaway: '先简化、再标准化、后自动化，才能避免把人工问题固化成设备问题。'
  },
  '项目管理': {
    definition: '改善项目管理通过范围、目标、里程碑、责任、资源、风险和验收标准，把跨部门问题从讨论转化为可交付结果。',
    signals: ['目标描述笼统且无法验收', '任务有负责人但没有完成标准', '风险到最后阶段才被暴露'],
    formula: '项目状态至少按范围、进度、成本、质量、风险和收益六个维度评估，不以完成动作代替达成结果。',
    steps: ['定义问题、范围和基准数据', '拆解里程碑、责任与依赖关系', '建立风险清单和升级机制', '按验收标准关闭并完成收益复盘'],
    pitfalls: ['用会议纪要代替项目计划', '只追进度不控制变更', '完成设备或文件即视为收益实现'],
    takeaway: '项目推进靠清晰机制和及时升级，成果关闭靠数据与验收，不靠感觉。'
  },
  '数据分析': {
    definition: '制造数据分析通过统一定义、可靠采集、分层比较和异常追溯，把数据转化为判断、优先级和行动，而不是增加报表数量。',
    signals: ['同一指标在不同部门结果不同', '数据只能看到结果，不能定位原因', '报表更新后没有触发责任动作'],
    formula: '数据质量至少评价完整率、准确率、及时率和一致率；异常分析应保留分母、时间范围和样本边界。',
    steps: ['先定义业务问题与指标口径', '确认数据源、责任和采集频次', '按产品、班组、设备或缺陷类型分层', '把异常绑定责任、期限和验证结果'],
    pitfalls: ['只看平均值掩盖波动', '图表漂亮但没有行动阈值', '频繁调整口径导致趋势不可比'],
    takeaway: '不能改变判断和行动的数据，只是信息展示；能追溯并推动闭环的数据才是管理资产。'
  },
  '成本改善': {
    definition: '制造成本改善通过减少工时、材料、质量、库存、能源、设备和周期损失实现可持续降本，同时保护安全、质量、交付和客户价值。',
    signals: ['降本只依赖压价或削减预算', '返工、库存和等待成本没有量化', '改善收益计算未扣除持续投入'],
    formula: '年度净收益＝节省金额－新增运行成本；ROI＝年度净收益÷总投入×100%，并区分一次性与持续性收益。',
    steps: ['建立成本结构与损失清单', '优先选择可控且高频的损失', '验证改善对质量与交付的影响', '由财务和业务共同确认收益并持续追踪'],
    pitfalls: ['把成本转移给供应商或其他部门', '只计算理论省人未实现实际收益', '忽略维护、折旧和机会成本'],
    takeaway: '真正的降本来自流程和损失结构改善，而不是牺牲质量、交付或长期能力。'
  },
  '安全改善': {
    definition: '安全改善通过危险源识别、风险评价和工程控制，把人员暴露、误操作和设备失效风险降到可接受水平，并建立持续点检和变更管理。',
    signals: ['高风险动作依赖人员持续警惕', '防护装置容易拆除或旁路', '设备改造后没有重新评估风险'],
    formula: '风险可按严重度×发生可能性评估；对高严重度风险应优先采用消除、替代、隔离、互锁等工程控制。',
    steps: ['识别正常、异常、维修和清洁状态下的危险', '按控制层级选择工程对策', '验证失效、误触和旁路场景', '纳入点检、培训、权限和变更评审'],
    pitfalls: ['只增加警示语和个人防护', '防护影响操作后被现场拆除', '只验收正常运行，不验证故障状态'],
    takeaway: '安全第一必须成为设计输入，并通过工程控制降低对个人行为的单点依赖。'
  },
  'NPI四阶段': {
    definition: '新产品导入把设计要求转化为可制造、可检验、可供应和可量产的产品与过程，并通过EVT、DVT、PVT、MP四个阶段门逐步关闭技术、设计、过程和量产风险。',
    signals: ['试产时图纸、BOM和工艺版本不一致', '治具、检具、设备或物料在阶段评审前未齐套', '前一阶段问题未关闭就被带入下一阶段或量产'],
    formula: '阶段成熟度应联合评价问题关闭率、一次试产通过率、FPY、节拍达成率、齐套率、过程能力、产能达成率和量产移交完成率。',
    steps: ['EVT验证工程原理、关键技术与初步可制造性', 'DVT验证设计定型、可靠性、法规和设计风险关闭', 'PVT用量产条件验证工艺、质量、设备、物料、节拍和产能', 'MP受控爬坡并按退出条件完成运营移交与持续监控'],
    pitfalls: ['把NPI理解为工程试产安排', '用日历日期代替阶段退出准则', '只验证产品功能，不验证过程能力、节拍与供应保障'],
    takeaway: 'EVT回答能否做成，DVT回答设计是否成熟，PVT回答能否稳定量产，MP回答能否持续交付。'
  },
  '持续改善': {
    definition: '持续改善通过小步试验、数据验证、标准固化和复盘复制，使现场问题持续被发现并转化为组织能力，而不是依赖一次性专项活动。',
    signals: ['同类问题反复出现', '改善依赖个别骨干维持', '项目结束后标准和数据没有更新'],
    formula: '除收益外，应追踪改善关闭率、维持达成率、重复问题率和横向复制完成率。',
    steps: ['建立日常问题收集与优先级机制', '用PDCA开展小范围验证', '更新标准、培训和点检', '定期复盘维持效果并横向复制'],
    pitfalls: ['把提案数量当作改善质量', '未验证就直接全面推广', '只奖励结果，不沉淀方法和标准'],
    takeaway: '改善只有被标准化、被维持并可复制，才从个人经验转化为组织能力。'
  },
  '管理执行': {
    definition: '管理执行把目标转化为计划、责任、期限、标准、检查和复盘，使会议要求能够落到现场动作并形成可验证的结果闭环。',
    signals: ['会议事项反复延期', '责任人理解的完成标准不同', '异常没有升级路径和关闭证据'],
    formula: '执行看板至少显示责任人、计划日期、完成标准、当前状态、风险和关闭证据；逾期率与重复打开率比完成数量更重要。',
    steps: ['把目标拆成可验收任务', '明确责任、期限、依赖和资源', '按节奏检查差异并及时升级', '关闭时验证结果、标准和后续维持'],
    pitfalls: ['任务描述只有“跟进、加强、注意”', '只看是否完成动作，不看结果', '问题关闭后没有复盘和防再发'],
    takeaway: '执行力不是催得更紧，而是让任务定义、检查节奏和异常升级足够清晰。'
  }
};

const integrationProfiles = {
  leanSystem: {
    owner: 'IE／精益',
    partner: 'PE、PMC、制造与质量',
    reviewer: '生产运营负责人',
    system: '标准工时、产能、改善台账与标准作业',
    interface: 'IE／精益负责方法与数据口径；PE确认工艺边界，PMC提供需求与计划约束，制造和质量共同验证合格产出、波动及维持效果。'
  },
  processEngineering: {
    owner: 'PE／工艺',
    partner: '质量、IE、ME、制造与NPI',
    reviewer: '工程负责人',
    system: '工艺路线、参数窗口、PFMEA、控制计划与工程变更',
    interface: 'PE负责过程设计与版本；质量确认控制要求，IE验证节拍和产能，ME保障设备治具条件，NPI与制造完成试产、放行和运营移交。'
  },
  equipmentEngineering: {
    owner: 'ME／设备',
    partner: 'PE、IE、制造、质量与安全',
    reviewer: '工程负责人',
    system: 'URS、FAT/SAT、点检保全、故障代码与设备履历',
    interface: 'ME负责设备能力和可维护性；PE明确工艺窗口，IE核算节拍与负荷，制造和质量验证有效产出，安全职能确认正常、异常及维修状态风险。'
  },
  qualityEngineering: {
    owner: '质量工程',
    partner: 'PE、制造、供应商质量、IE与NPI',
    reviewer: '质量负责人',
    system: 'PFMEA、控制计划、检验标准、问题闭环与追溯记录',
    interface: '质量工程定义风险与验证证据；PE回到过程原因，制造执行遏制和标准，供应商质量处理来料链路，IE与NPI评估对产能和阶段放行的影响。'
  },
  planningFlow: {
    owner: 'PMC／计划物流',
    partner: 'IE、采购、仓储、PE与制造',
    reviewer: '生产运营负责人',
    system: '订单、齐套、负荷、拉动补充、在制与结单状态',
    interface: 'PMC把订单与齐套转化为可执行节奏；IE校核产能和人力，采购仓储保障补充，PE提供工艺和换型约束，制造按实绩回写欠产、超产与结单。'
  },
  npiDelivery: {
    owner: 'NPI／项目',
    partner: '研发、PE、IE、ME、质量、供应链与制造',
    reviewer: '跨职能阶段评审组',
    system: 'EVT/DVT/PVT/MP阶段门、成熟度矩阵、问题清单与量产移交',
    interface: 'NPI统一版本、阶段和问题主线；各专业职能对本领域交付物负责，阶段评审只依据可复现证据放行，制造在MP稳定后承接日常运营。'
  },
  digitalSystem: {
    owner: '业务Owner／数字化',
    partner: 'IT、IE、PMC、PE、质量与财务',
    reviewer: '流程与数据负责人',
    system: '主数据、状态字典、权限、接口、审计日志与指标口径',
    interface: '业务Owner先定义流程和状态，IT实现系统能力；IE、PMC、PE、质量和财务共同核对主键、分母与业务边界，禁止用系统上线代替业务验收。'
  },
  layoutPlanning: {
    owner: 'IE／布局规划',
    partner: 'PE、ME、物流、制造、安全与设施',
    reviewer: '项目Sponsor',
    system: '产能假设、SLP关系、设备清单、物流路线、安全约束与扩展预留',
    interface: 'IE统筹流动和面积；PE、ME给出工艺设备条件，物流与制造验证动线，安全和设施审查消防、公辅、维修及扩展约束。'
  },
  managementImprovement: {
    owner: '职能负责人／持续改善',
    partner: '相关专业Owner、制造与数据Owner',
    reviewer: '运营负责人',
    system: '目标、责任、期限、证据、标准更新与分层复盘',
    interface: '职能负责人建立节奏和升级规则；专业Owner对原因与措施负责，制造提供现场事实，数据Owner守住统计口径，运营负责人按综合结果验收。'
  },
  costBusiness: {
    owner: 'IE／成本工程',
    partner: '财务、PE、采购、ME、质量与制造',
    reviewer: '经营负责人',
    system: '标准成本、工时、损耗、质量成本、投资与收益台账',
    interface: 'IE建立资源与损失基准，财务确认收益口径；PE、采购、ME、质量和制造分别验证工艺、材料、设备、风险及实际消耗，避免把理论节省当成经营收益。'
  },
  safetyEngineering: {
    owner: '安全／EHS',
    partner: 'ME、PE、制造、质量与设施',
    reviewer: '安全与工程负责人',
    system: '风险辨识、工程控制、联锁点检、变更评审与事件闭环',
    interface: '安全职能定义风险等级和法规边界；ME、PE优先采用工程控制，制造验证作业状态，质量和设施共同确认变更不会引入新的产品或环境风险。'
  }
};

const topicIntegrationProfiles = {
  '精益生产': 'leanSystem',
  'IE方法': 'leanSystem',
  'PE工程': 'processEngineering',
  'ME工程': 'equipmentEngineering',
  'VSM': 'leanSystem',
  'SMED': 'leanSystem',
  'OEE': 'equipmentEngineering',
  'JIT': 'planningFlow',
  'PDCA': 'managementImprovement',
  'PQCD': 'managementImprovement',
  'Kaizen': 'leanSystem',
  '6S': 'managementImprovement',
  '目视化管理': 'managementImprovement',
  'PMC': 'planningFlow',
  'ERP/MES': 'digitalSystem',
  'Factory Layout': 'layoutPlanning',
  '线平衡': 'leanSystem',
  '标准作业': 'processEngineering',
  '质量改善': 'qualityEngineering',
  '防错': 'processEngineering',
  'TPM': 'equipmentEngineering',
  '精益物流': 'planningFlow',
  '自动化': 'equipmentEngineering',
  '项目管理': 'npiDelivery',
  '数据分析': 'digitalSystem',
  '成本改善': 'costBusiness',
  '安全改善': 'safetyEngineering',
  'NPI四阶段': 'npiDelivery',
  '持续改善': 'managementImprovement',
  '管理执行': 'managementImprovement'
};

function resolveTopicKey(category) {
  const value = String(category || '').trim();
  if (guides[value]) return value;
  const direct = Object.keys(guides).find((name) => value.includes(name) || name.includes(value));
  if (direct) return direct;
  const aliases = [
    [/NPI|EVT|DVT|PVT|量产导入/i, 'NPI四阶段'],
    [/ERP|MES|数智化工厂/i, 'ERP/MES'],
    [/Factory Layout|工厂布局|布局规划/i, 'Factory Layout'],
    [/PMC|APS|排产|计划闭环/i, 'PMC'],
    [/标准工时|IE七大手法|工业工程|IE标工/i, 'IE方法'],
    [/OEE|设备效率/i, 'OEE'],
    [/TPM|设备保全/i, 'TPM'],
    [/质量防错|Poka-Yoke|防错/i, '防错'],
    [/质量|FPY|DPPM|过程审核/i, '质量改善'],
    [/精益物流|配送|Milk Run/i, '精益物流'],
    [/VSM|价值流/i, 'VSM'],
    [/SMED|快速换型|快速换模/i, 'SMED'],
    [/线平衡|山积图/i, '线平衡'],
    [/标准作业|标准化|知识沉淀/i, '标准作业'],
    [/自动化/i, '自动化'],
    [/数据分析|数据闭环/i, '数据分析'],
    [/成本|收益/i, '成本改善'],
    [/安全/i, '安全改善'],
    [/目视化/i, '目视化管理'],
    [/\b6S\b/i, '6S'],
    [/项目|横向展开/i, '项目管理'],
    [/PDCA|5W2H|闭环|异常反应/i, 'PDCA'],
    [/持续改善|防止复发/i, '持续改善'],
    [/精益|制造改善/i, '精益生产'],
    [/管理|执行/i, '管理执行']
  ];
  const alias = aliases.find(([expression]) => expression.test(value));
  return alias ? alias[1] : '';
}

function resolveGuide(category) {
  const key = resolveTopicKey(category);
  return key ? guides[key] : defaultGuide;
}

function resolveIntegration(category) {
  const key = resolveTopicKey(category);
  return integrationProfiles[key ? topicIntegrationProfiles[key] : 'managementImprovement'];
}

function listHtml(items, ordered = false) {
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag}>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</${tag}>`;
}

function trainingSection(category) {
  const guide = resolveGuide(category);
  return `<section class="brief-training-depth" data-training-depth="v2">
<h3>1. 简介概述与管理边界</h3>
<p>${escapeHtml(guide.definition)}</p>
<div class="brief-learning-grid"><div class="brief-learning-card"><strong>现场识别信号</strong>${listHtml(guide.signals)}</div><div class="brief-learning-card"><strong>核心指标／计算口径</strong><p>${escapeHtml(guide.formula)}</p></div></div>
<h3>2. 应用场景与推进步骤</h3>
${listHtml(guide.steps, true)}
<h3>3. 常见误区与使用边界</h3>
${listHtml(guide.pitfalls)}
<div class="engineering-checklist"><strong>培训复盘：</strong>${escapeHtml(guide.takeaway)}</div>
</section>`;
}

function onePointTrainingSection(category) {
  const guide = resolveGuide(category);
  const integration = resolveIntegration(category);
  return `<section class="brief-one-point-training" data-one-point-training="v1">
<div class="brief-one-point-heading"><span>SINGLE-POINT LESSON</span><h3>单点培训｜${escapeHtml(category)}</h3><p>建议用10—15分钟完成一次班前会、工程例会或个人学习；先理解本期一个核心判断，再带回现场验证。</p></div>
<div class="brief-one-point-grid">
  <div><strong>培训目标</strong><p>${escapeHtml(guide.takeaway)}</p></div>
  <div><strong>核心口径</strong><p>${escapeHtml(guide.formula)}</p></div>
  <div><strong>现场动作</strong><p>${escapeHtml(guide.steps[0])}</p></div>
  <div><strong>使用边界</strong><p>${escapeHtml(guide.pitfalls[0])}</p></div>
</div>
<div class="brief-one-point-interface"><strong>相关职能接口：</strong>${escapeHtml(integration.interface)}</div>
<p class="brief-one-point-check"><strong>培训验收：</strong>学员应能选取一个真实对象，说明问题、数据、主责、协同、验证方式和不能直接套用的边界。</p>
</section>`;
}

function splitTitle(title) {
  const clean = String(title).replace(/｜.*$/, '').trim();
  const characters = Array.from(clean);
  const lines = [];
  while (characters.length && lines.length < 3) {
    let take = Math.min(14, characters.length);
    if (characters.length > 14) {
      const window = characters.slice(0, 15).join('');
      const punctuation = Math.max(window.lastIndexOf('，'), window.lastIndexOf('：'), window.lastIndexOf('、'));
      if (punctuation >= 7) take = punctuation + 1;
      const asciiWord = (character) => /[A-Za-z0-9/+-]/.test(character || '');
      if (asciiWord(characters[take - 1]) && asciiWord(characters[take])) {
        let wordStart = take;
        while (wordStart > 0 && asciiWord(characters[wordStart - 1])) wordStart -= 1;
        if (wordStart >= 6) take = wordStart;
        else {
          while (take < characters.length && asciiWord(characters[take])) take += 1;
        }
      }
    }
    lines.push(characters.splice(0, take).join(''));
  }
  if (characters.length) lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[，：、]$/, '')}…`;
  return lines;
}

function buildVisual({ date, category, title, tags, index }) {
  const palettes = [
    ['#092f39', '#0f6770', '#f3c969', '#e7f4f1'],
    ['#102d55', '#1d6ea5', '#f0c56b', '#eaf4fb'],
    ['#243d31', '#4a7a5f', '#e3bd6b', '#eef7f1'],
    ['#4a2f43', '#8a5276', '#e5bf73', '#f8edf4']
  ];
  const [dark, mid, gold, pale] = palettes[index % palettes.length];
  const lines = splitTitle(title);
  const tagList = (tags.length ? tags : ['现场改善', '数据闭环', '标准固化']).slice(0, 3);
  const titleSvg = lines.map((line, lineIndex) => `<text x="76" y="${286 + lineIndex * 94}" fill="#fff" font-size="${lines.length === 3 ? 58 : 66}" font-weight="850">${escapeXml(line)}</text>`).join('');
  const tagSvg = tagList.map((tag, tagIndex) => {
    const x = 76 + tagIndex * 300;
    return `<rect x="${x}" y="700" width="260" height="66" rx="33" fill="${pale}" opacity=".96"/><text x="${x + 130}" y="743" fill="${dark}" font-size="27" font-weight="800" text-anchor="middle">${escapeXml(tag.slice(0, 10))}</text>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" role="img" aria-labelledby="title desc"><title id="title">${escapeXml(title)}</title><desc id="desc">QilyLean今日简报单点培训配图，${escapeXml(date)}，${escapeXml(category)}</desc><defs><linearGradient id="bg${index}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${dark}"/><stop offset="1" stop-color="${mid}"/></linearGradient><filter id="shadow${index}"><feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000" flood-opacity=".22"/></filter></defs><rect width="1080" height="1080" fill="url(#bg${index})"/><circle cx="900" cy="165" r="210" fill="#fff" opacity=".07"/><circle cx="960" cy="430" r="300" fill="#fff" opacity=".045"/><rect x="64" y="62" width="360" height="62" rx="31" fill="${gold}"/><text x="244" y="103" fill="${dark}" font-size="28" font-weight="850" text-anchor="middle">${escapeXml(category.slice(0, 18))}</text><text x="1000" y="102" fill="#fff" opacity=".9" font-size="27" text-anchor="end">${escapeXml(date)}</text>${titleSvg}<g filter="url(#shadow${index})"><rect x="64" y="615" width="952" height="190" rx="28" fill="#fff" opacity=".11"/><path d="M110 658h190l52 52h168l52-52h190l52 52h156" fill="none" stroke="${gold}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><g fill="#fff" font-size="25" font-weight="750" text-anchor="middle"><text x="205" y="680">定义问题</text><text x="435" y="742">统一口径</text><text x="665" y="680">现场验证</text><text x="895" y="742">标准闭环</text></g></g>${tagSvg}<line x1="64" y1="905" x2="1016" y2="905" stroke="#fff" opacity=".35"/><text x="64" y="977" fill="#fff" font-size="34" font-weight="850">QilyLean｜启力精益</text><text x="1016" y="977" fill="${gold}" font-size="28" font-weight="750" text-anchor="end">单点培训 · 工程实践 · 现场应用</text></svg>`;
}

function replaceOrInsertOgImage(page, imageUrl) {
  const tag = `<meta property="og:image" content="${imageUrl}">`;
  if (/<meta property="og:image"[^>]*>/i.test(page)) return page.replace(/<meta property="og:image"[^>]*>/i, tag);
  return page.replace(/(<meta property="og:url"[^>]*>)/i, `$1\n  ${tag}`);
}

function optimizeCompactTableColumns(article) {
  return article.replace(/<table class="([^"]*\brule-table\b[^"]*)">[\s\S]*?<\/table>/gi, (table, className) => {
    if (/\bcompact-first-col\b/.test(className)) return table;
    const firstCells = Array.from(table.matchAll(/<tr[^>]*>\s*<(?:th|td)[^>]*>([\s\S]*?)<\/(?:th|td)>/gi))
      .map((match) => textFromHtml(match[1]));
    const longest = firstCells.reduce((maximum, value) => Math.max(maximum, Array.from(value).length), 0);
    if (!firstCells.length || longest > 10) return table;
    return table.replace(`class="${className}"`, `class="${className} compact-first-col"`);
  });
}

function enhancePage(file, date, index) {
  let page = fs.readFileSync(file, 'utf8');
  page = page
    .replace(/\s*<span class="dayno">\s*DAY\d+\s*<\/span>/gi, '')
    .replace(/DAILY ENGINEERING BRIEF\s*·\s*DAY\d+/gi, 'DAILY ENGINEERING BRIEF')
    .replace(/\s+DAY\d+/gi, '');

  const articleMatch = page.match(/<article class="post(?: [^"]*)?"[\s\S]*?<\/article>/i);
  if (!articleMatch) {
    fs.writeFileSync(file, page);
    return;
  }

  let article = articleMatch[0]
    .replace(/<section class="brief-training-depth"[\s\S]*?<\/section>/i, '')
    .replace(/<section class="brief-one-point-training"[\s\S]*?<\/section>/i, '');
  const title = textFromHtml(capture(article, /<h2>([\s\S]*?)<\/h2>/i, date));
  const dateLine = textFromHtml(capture(article, /<div class="date">([\s\S]*?)<\/div>/i, date));
  const category = dateLine.replace(date, '').replace(/[｜|]/g, '').trim() || '制造改善';
  const tags = Array.from(article.matchAll(/<span class="tag">([\s\S]*?)<\/span>/gi)).map((match) => textFromHtml(match[1]));
  const h3Count = (article.match(/<h3[ >]/gi) || []).length;

  const assetName = `daily-${date}.svg`;
  const assetPath = path.join(assetDir, assetName);
  fs.writeFileSync(assetPath, `${buildVisual({ date, category, title, tags, index })}\n`);
  page = replaceOrInsertOgImage(page, `https://qilylean.com/qilylean/assets/${assetName}`);
  if (date <= archiveVisualEnd) {
    const visual = `<div class="visual"><img src="/qilylean/assets/${assetName}" alt="${escapeHtml(title)}" width="1080" height="1080" decoding="async"></div>`;
    article = article.replace(/<div class="visual">[\s\S]*?<\/div>(?=\s*<div class="content">)/i, visual);
  }

  const onePointTraining = onePointTrainingSection(category);
  if (/<div class="quote">[\s\S]*?<\/div>/i.test(article)) {
    article = article.replace(/(<div class="quote">[\s\S]*?<\/div>)/i, `$1\n${onePointTraining}`);
  } else {
    article = article.replace(/(<h2>[\s\S]*?<\/h2>\s*<p>[\s\S]*?<\/p>)/i, `$1\n${onePointTraining}`);
  }

  if (h3Count < 2 && !/data-training-depth=/i.test(article)) {
    article = article.replace(/(<div class="tags">)/i, `${trainingSection(category)}$1`);
  }
  article = optimizeCompactTableColumns(article);

  page = page.replace(articleMatch[0], article);
  fs.writeFileSync(file, page);
}

function cleanIndexFiles() {
  const indexHtml = path.join(qily, 'daily-insights.html');
  let html = fs.readFileSync(indexHtml, 'utf8');
  html = html
    .replace(/<b>\s*DAY\d+\s*<\/b>/gi, '')
    .replace(/\s+DAY\d+/gi, '');
  fs.writeFileSync(indexHtml, html);

  const indexJson = path.join(dailyDir, 'index.json');
  const data = JSON.parse(fs.readFileSync(indexJson, 'utf8'));
  data.forEach((item) => { item.dayNo = ''; });
  fs.writeFileSync(indexJson, `${JSON.stringify(data, null, 2)}\n`);
}

function normalizeExistingVisualLabels() {
  fs.readdirSync(assetDir)
    .filter((name) => /^daily-\d{4}-\d{2}-\d{2}\.svg$/.test(name))
    .forEach((name) => {
      const file = path.join(assetDir, name);
      const original = fs.readFileSync(file, 'utf8');
      const updated = original
        .replace(/Factory Layout/g, '工厂布局规划')
        .replace(/Factory La(?=<\/text>)/g, '工厂布局规划')
        .replace(/ERP\/ME(?=<\/text>)/g, 'ERP/MES');
      if (updated !== original) fs.writeFileSync(file, updated);
    });
}

function main() {
  fs.mkdirSync(assetDir, { recursive: true });
  const files = fs.readdirSync(dailyDir)
    .filter((name) => /^\d{4}-\d{2}-\d{2}\.html$/.test(name) && name.slice(0, 10) >= archiveStart)
    .sort();
  files.forEach((name, index) => enhancePage(path.join(dailyDir, name), name.slice(0, 10), index));
  cleanIndexFiles();
  normalizeExistingVisualLabels();
  process.stdout.write(`Enhanced ${files.length} daily brief pages; DAY labels removed and training depth applied.\n`);
}

if (require.main === module) main();

module.exports = {
  guides,
  resolveGuide,
  resolveTopicKey,
  resolveIntegration,
  integrationProfiles,
  topicIntegrationProfiles,
  buildVisual
};
