#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function write(rel, text) {
  fs.writeFileSync(path.join(root, rel), text, 'utf8');
}

function replaceRequired(text, from, to, label) {
  if (!text.includes(from)) throw new Error(`Missing replacement anchor: ${label}`);
  return text.replace(from, to);
}

function insertBeforeRequired(text, anchor, block, label) {
  if (text.includes(block.trim())) return text;
  if (!text.includes(anchor)) throw new Error(`Missing insertion anchor: ${label}`);
  return text.replace(anchor, `${block}\n${anchor}`);
}

function materializeSponsorTerminology() {
  const rel = 'knowledge/terminology.html';
  let html = read(rel);
  if (/<article\b[^>]*\bdata-term-card\b[^>]*>[\s\S]*?<div class="term-code">Sponsor<\/div>/i.test(html)) return;
  const section = `<section class="module-section" id="project-governance-terms" data-public-static-terminology="sponsor">
  <div class="module-inner">
    <div class="module-heading"><h2>项目治理与高层责任</h2><p>用于重大项目授权、资源保障、阶段门评审和风险升级</p></div>
    <div class="term-grid">
<article class="term-card" id="term-sponsor" data-term-card tabindex="0" data-keywords="Sponsor Project Sponsor 项目发起人 项目主责高层 项目赞助人 高层支持 资源授权 里程碑评审 风险升级 跨部门协调 收益确认 项目池">
  <div class="term-code">Sponsor</div>
  <div class="term-en">Project Sponsor</div>
  <h3>项目发起人／项目主责高层</h3>
  <p class="term-formula"><strong>核心口径：</strong>Sponsor代表组织层面对项目进行授权与背书，负责确认项目价值、保障关键资源、主持或参与重大里程碑评审，并在跨部门障碍或重大风险超出项目经理权限时推动升级解决。</p>
  <p><strong>应用场景：</strong>用于重大客户交付、质量／安全、量产爬坡、自动化、降本、工厂规划及数智化项目。Sponsor不替代项目经理做日常计划，也不等同于“出资赞助人”；在制造企业中更适合解释为“项目发起人”或“项目主责高层”。</p>
  <div class="term-opl-actions"><a class="term-opl-open" href="/knowledge/terminology/sponsor.html">查看单点培训课件</a></div>
</article>
    </div>
  </div>
</section>`;
  html = replaceRequired(html, '</main>', `${section}\n</main>`, 'static Sponsor terminology');
  write(rel, html);
}

function updateTerminologySource() {
  const rel = 'qilylean/site-data.json';
  const data = JSON.parse(read(rel));
  const terminology = read('knowledge/terminology.html');
  const total = (terminology.match(/<article class="term-card"[^>]*data-term-card/g) || []).length;
  data.terminology.total = total;
  data.terminology.lessonTotal = total;
  write(rel, `${JSON.stringify(data, null, 2)}\n`);
}

function updateMethodNaming() {
  const rel = 'improvements/index.html';
  let html = read(rel);
  html = html
    .replaceAll('制造改善实践论文合集', '制造改善实践方法专栏')
    .replaceAll('论文目录', '方法文章目录')
    .replaceAll('后续案例库、论文库、模板库和 AI 数字人知识库', '后续案例库、方法库、模板库和 AI 数字人知识库')
    .replaceAll('以网页文章方式沉淀制造改善方法', '以实践文章方式沉淀制造改善方法');
  write(rel, html);
}

function layerHomeCapabilities(rel) {
  let html = read(rel);
  const replacements = [
    ['六类核心能力｜不是六块业务孤岛，而是一条制造运营价值链', '六类能力分层呈现｜四类制造项目主线，两项数字工程支撑'],
    ['六类核心能力｜统一服务于制造运营资产化', '六类能力分层呈现｜四类制造项目主线，两项数字工程支撑'],
    ['六类能力不是分成两个阵营，而是沿同一制造运营价值链协同：从工厂与产线规划、现场改善和目视化，到数字化系统、轻量软件与专业互联网资产。六类项目合作能力统一遵循问题定义、事实基线、方案／原型、Pilot／测试、实绩验证、标准固化与项目验收。', '新工厂／新产线规划、精益改善、目视化与数字化工厂构成制造项目主线；APP与官网建设作为数字作品和工程实现支撑，用于验证把制造业务逻辑转化为可运行工具与专业互联网资产的能力。六类能力均遵循问题定义、事实基线、方案／原型、Pilot／测试、实绩验证、标准固化与项目验收。'],
    ['<small>核心能力｜01</small>', '<small>制造项目主线｜01</small>'],
    ['<small>核心能力｜02</small>', '<small>制造项目主线｜02</small>'],
    ['<small>核心能力｜03</small>', '<small>制造项目主线｜03</small>'],
    ['<small>核心能力｜04</small>', '<small>制造项目主线｜04</small>'],
    ['<small>核心能力｜05</small>', '<small>数字工程支撑｜05</small>'],
    ['<small>核心能力｜06</small>', '<small>数字工程支撑｜06</small>'],
    ['查看六类项目合作能力与交付边界', '查看分层能力与交付边界']
  ];
  for (const [from, to] of replacements) html = html.replaceAll(from, to);
  write(rel, html);
}

function updateCooperationHierarchy() {
  const rel = 'cooperation/index.html';
  let html = read(rel);
  html = html.replace(
    /<meta name="description" content="[^"]*">/,
    '<meta name="description" content="QilyLean以新工厂／新产线规划、精益改善、目视化和数字化工厂为制造项目主线，以APP与官网建设作为数字工程支撑；所有合作按范围、交付物、验证与验收定义。">'
  );
  html = html.replace(
    '<div class="module-heading"><h2>六类项目合作能力</h2><p>六类能力采用统一编号与统一项目闭环，不再使用“3+3”作为业务分类；不销售泛化概念，以企业真实问题、项目范围、标准交付物和验收口径定义合作。</p></div>',
    '<div class="module-heading"><h2>六类项目合作能力</h2><p>能力分层不等于能力割裂：01—04直接服务制造系统规划、现场改善与数智运营，构成制造项目主线；05—06作为数字作品与工程实现支撑，证明业务逻辑能够进一步转化为软件工具和专业互联网资产。所有合作均以企业真实问题、项目范围、标准交付物和验收口径定义。</p></div>'
  );
  html = html
    .replaceAll('<strong>匹配合同范本</strong><span>核心项目交付</span>', '<strong>匹配合同范本</strong><span>制造项目主线</span>')
    .replace('<strong>相关成果证据</strong><span>数智化产品与技术能力</span>', '<strong>相关成果证据</strong><span>制造项目主线</span>')
    .replace('<strong>当前实证作品</strong><span>Times26001</span>', '<strong>数字工程支撑</strong><span>Times26001实证作品</span>')
    .replace('<strong>当前实证作品</strong><span>QilyLean官网</span>', '<strong>数字工程支撑</strong><span>QilyLean官网实证</span>');
  write(rel, html);
}

const projectEvidence = {
  'projects/automotive-lean/index.html': {
    anchor: '<section class="module-section alt"><div class="module-inner"><div class="module-heading"><h2>相关项目</h2>',
    title: '公开核验说明',
    items: [
      ['公开基线', '产品族、VSM现状、LT／WIP、标准工时与现场机制作为诊断对象。'],
      ['验证方法', '现场测时、数据交叉核对、Pilot试运行、制度运行与复盘记录。'],
      ['公开结果', '公开展示体系框架、方法路径和标准交付物，不以制度发布代替经营结果。'],
      ['受控证据', '产品明细、完整工时库、客户资料、现场实绩和验收底稿仅在保密条件下核验。']
    ]
  },
  'projects/smed-300t/index.html': {
    anchor: '<section class="module-section alt"><div class="module-inner"><div class="module-heading"><h2>相关项目</h2>',
    title: '结果口径与复验要求',
    items: [
      ['起止口径', '从上一型号末件完成至下一型号首件确认合格，避免只统计拆装动作。'],
      ['验证方法', '全过程分段测时，区分作业、移动、等待、返工及内外部作业。'],
      ['公开结果', '换模时间由约14小时缩短至约7小时，公开值用于说明历史项目结果。'],
      ['正式复验', '新项目须重新确认设备、模具、班次、样本次数、质量与安全边界，不直接套用50%降幅。']
    ]
  },
  'projects/mold-warehouse/index.html': {
    anchor: '<section class="module-section alt"><div class="module-inner"><div class="module-heading"><h2>相关项目</h2>',
    title: '效益口径与核验边界',
    items: [
      ['工程基线', '约180㎡、1200+副模具、重量分级、存取设备和安全通道共同构成约束。'],
      ['验收对象', '容量、承载、存取效率、编码追溯、施工联调与现场运行同时验证。'],
      ['公开结果', '取放1—5分钟及综合年创效约300万元属于历史项目公开口径。'],
      ['受控复算', '投资额、收益构成、人工与时间节约、维护成本和回收期须结合原始核算资料复核。']
    ]
  },
  'projects/fuse-improvement/index.html': {
    anchor: '<section class="module-section alt"><div class="module-inner"><div class="module-heading"><h2>相关项目</h2>',
    title: '质量结果与验证边界',
    items: [
      ['缺陷口径', '端口不齐、管口裂、斜口、尺寸不良及夹脚断管统一定义后再统计。'],
      ['验证方法', '按刀具、寿命、材料、设备参数、班次与人员分层，并进行首件和巡检确认。'],
      ['公开结果', '综合不良率降至1%以内，公开值用于说明历史改善结果。'],
      ['正式复验', '新场景必须重新建立改善前基线、样本量、工艺窗口及连续批次稳定性证据。']
    ]
  },
  'projects/factory-layout/index.html': {
    anchor: '<section class="module-section alt"><div class="module-inner"><div class="module-heading"><h2>相关项目</h2>',
    title: '规划模型与评审口径',
    items: [
      ['设计输入', '产品组合、需求预测、工艺路线、设备清单、班次与扩产边界必须版本受控。'],
      ['量化校核', '按产能、人力、设备、面积、通道、WIP、仓储、公辅负荷与安全约束逐项校核。'],
      ['方案评审', '对流程连续性、搬运距离、峰值缓存、接口风险、扩展弹性和投资节奏进行比选。'],
      ['验收边界', '公开图纸证明规划过程；最终投产能力仍须以施工、设备到位、试运行和爬坡实绩验收。']
    ]
  },
  'projects/digital-factory/index.html': {
    anchor: '<section class="module-section alt"><div class="module-inner"><div class="module-heading"><h2>相关项目</h2>',
    title: '系统工程与验收框架',
    items: [
      ['数据模型', '产品编码关联MBOM、工艺路线、工序、工作中心、标准工时、产能与版本。'],
      ['业务规则', '定义计划冻结、净需求、齐套、能力约束、实绩、超欠产、尾单、结单与异常状态。'],
      ['接口责任', '每个字段明确来源系统、数据Owner、更新频次、校验规则、版本责任和异常处理。'],
      ['验收指标', '用主数据完整率／准确率、计划达成、实绩及时性、库存一致性和异常关闭率验证上线。']
    ]
  }
};

function evidenceBlock(title, items) {
  return `<section class="module-section project-verification-section"><div class="module-inner"><div class="module-heading"><span class="module-eyebrow">PUBLIC VERIFICATION｜公开口径与核验边界</span><h2>${title}</h2><p>以下内容说明公开页面能够证明什么、正式项目仍需重新验证什么，避免把历史结果、方法说明与新项目承诺混为一谈。</p></div><div class="project-verification-grid">${items.map(([name, text]) => `<article><strong>${name}</strong><span>${text}</span></article>`).join('')}</div><p class="project-verification-note">公开摘要不替代原始数据、财务审计、客户授权或正式验收；完整底稿仅在具备合作意向及保密条件时按授权范围核验。</p></div></section>`;
}

function updateProjects() {
  for (const [rel, config] of Object.entries(projectEvidence)) {
    let html = read(rel);
    html = insertBeforeRequired(html, config.anchor, evidenceBlock(config.title, config.items), `${rel} verification`);
    write(rel, html);
  }

  const rel = 'projects/index.html';
  let html = read(rel);
  const anchor = '<section class="module-section"><div class="module-inner"><div class="module-heading"><h2>项目清单</h2>';
  const block = `<section class="module-section" id="public-verification-structure"><div class="module-inner"><div class="module-heading"><span class="module-eyebrow">VERIFICATION STRUCTURE｜让项目结果可以低成本核验</span><h2>代表项目统一采用四段式公开口径</h2><p>每个项目同步说明事实基线、验证方法、公开结果和受控证据；缺少公开原始数据的内容不包装成审计结论，新项目也必须重新建立现场基线。</p></div><div class="module-grid four"><article class="module-card"><small>01｜BASELINE</small><h3>事实基线</h3><p>明确对象、起止点、样本、时间窗口、产品版本和异常排除边界。</p></article><article class="module-card"><small>02｜METHOD</small><h3>验证方法</h3><p>说明测时、分层、交叉核对、Pilot、质量确认和复验方法。</p></article><article class="module-card"><small>03｜RESULT</small><h3>公开结果</h3><p>区分已核定、已验证、阶段估算与经验陈述，不混用数据口径。</p></article><article class="module-card"><small>04｜EVIDENCE</small><h3>受控证据</h3><p>原始数据、财务核算、客户资料和验收底稿按授权及保密条件核验。</p></article></div></div></section>`;
  html = insertBeforeRequired(html, anchor, block, 'projects verification structure');
  write(rel, html);
}

function updateProjectStyles() {
  const rel = 'projects/project-pages.css';
  let css = read(rel);
  const block = `
/* 2026-08-16 采购级公开核验结构：统一呈现基线、方法、结果与证据边界。 */
.project-verification-section{background:#f7fbfa}
.project-verification-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.project-verification-grid article{padding:18px;border-top:4px solid #caa15f;background:#fff;box-shadow:0 8px 22px rgba(15,75,90,.07)}
.project-verification-grid strong{display:block;margin-bottom:7px;color:#0f4b5a;font-size:18px}
.project-verification-grid span{display:block;color:#526968;font-size:15px;line-height:1.68}
.project-verification-note{margin:18px 0 0;padding:14px 16px;border-left:4px solid #9e4a34;color:#526968;background:#fff8f1;font-size:14px;line-height:1.7}
@media(max-width:900px){.project-verification-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:620px){.project-verification-grid{grid-template-columns:1fr}}
`;
  if (!css.includes('采购级公开核验结构')) css += block;
  write(rel, css);
}

function updateMaterializationSource() {
  layerHomeCapabilities('scripts/materialize-static-core-pages.js');
}

function main() {
  materializeSponsorTerminology();
  updateTerminologySource();
  updateMethodNaming();
  layerHomeCapabilities('index.html');
  updateCooperationHierarchy();
  updateProjects();
  updateProjectStyles();
  updateMaterializationSource();
  process.stdout.write('Public audit optimization applied.\n');
}

main();
