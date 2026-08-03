#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const styleHref = '/site-commercial-quality-closure-v1.css?v=20260804-quality-pricing-v1';
const styleTag = `<link id="qilyCommercialQualityClosureStylesheet" rel="stylesheet" href="${styleHref}">`;

function target(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath) {
  return fs.readFileSync(target(relativePath), 'utf8');
}

function write(relativePath, content) {
  const file = target(relativePath);
  const normalized = content.endsWith('\n') ? content : `${content}\n`;
  if (fs.readFileSync(file, 'utf8') === normalized) return false;
  fs.writeFileSync(file, normalized, 'utf8');
  return true;
}

function upsertStylesheet(html) {
  const expression = /<link\s+[^>]*id=["']qilyCommercialQualityClosureStylesheet["'][^>]*>/i;
  return expression.test(html)
    ? html.replace(expression, styleTag)
    : html.replace(/<\/head>/i, `  ${styleTag}\n</head>`);
}

function markerExpression(start, end) {
  return new RegExp(`<!-- ${start} -->[\\s\\S]*?<!-- ${end} -->`, 'm');
}

function replaceOrInsertBefore(html, start, end, block, anchor) {
  const expression = markerExpression(start, end);
  if (expression.test(html)) return html.replace(expression, block);
  if (!html.includes(anchor)) throw new Error(`Missing insertion anchor: ${anchor}`);
  return html.replace(anchor, `${block}\n\n${anchor}`);
}

function patchLinks() {
  let html = read('links/index.html');
  html = upsertStylesheet(html);
  if (!html.includes('id="companyGrid"')) throw new Error('友情链接企业卡片容器缺失');
  write('links/index.html', html);
}

function pricingAndQualityBlock() {
  return `<!-- QILY-CORE-PRICING-QUALITY:START -->
<section class="module-section qily-pricing-basis" id="pricing-basis" aria-labelledby="pricingBasisTitle">
  <div class="module-inner">
    <div class="module-heading">
      <h2 id="pricingBasisTitle">三大核心业务｜公开价格参考与报价依据</h2>
      <p>以下仅用于前期预算沟通，不等同于最终报价。正式金额取决于范围、复杂度、周期、现场投入、交付深度与验收责任，并以需求诊断、书面方案及签署合同为准。</p>
    </div>
    <div class="qily-pricing-basis-grid">
      <article class="qily-pricing-basis-card">
        <small>01｜FACTORY PLANNING｜按项目包</small>
        <h3>新工厂／新产线规划</h3>
        <div class="qily-pricing-reference">¥80,000–300,000+／项目<span>公开沟通参考；复杂多基地、总图深化或长期驻场另行评估</span></div>
        <p><strong>报价依据：</strong></p>
        <ul>
          <li>规划面积、楼层、车间与产线数量；</li>
          <li>产品族、工艺路线、产能模型及设备复杂度；</li>
          <li>Layout、物流、仓储、公辅、安全与扩展边界深度；</li>
          <li>方案数量、评审轮次、图纸精度及实施支持周期。</li>
        </ul>
      </article>
      <article class="qily-pricing-basis-card">
        <small>02｜LEAN IMPROVEMENT｜按人日核算</small>
        <h3>精益生产改善</h3>
        <div class="qily-pricing-reference">¥3,000–6,000／人日<span>专项总价＝确认人日＋交付物深度＋验证周期；小范围Pilot优先</span></div>
        <p><strong>报价依据：</strong></p>
        <ul>
          <li>价值流、产线、产品族、班次及问题范围；</li>
          <li>基线数据完整度与现场测量、建模工作量；</li>
          <li>IE、VSM、SMED、OEE、质量防错等工具组合；</li>
          <li>驻场辅导、培训、试点验证、标准固化和复验人日。</li>
        </ul>
      </article>
      <article class="qily-pricing-basis-card">
        <small>03｜VISUAL MANAGEMENT｜按项目或人日</small>
        <h3>目视化项目设计与交付</h3>
        <div class="qily-pricing-reference">¥30,000–150,000／项目<span>或设计诊断 ¥2,500–4,500／人日；制作施工按确认清单另计</span></div>
        <p><strong>报价依据：</strong></p>
        <ul>
          <li>区域面积、楼层、看板／标识／定置点位数量；</li>
          <li>标准体系、VI颜色语义、图纸和打样复杂度；</li>
          <li>材料清单、制作施工协同、安装校核与验收轮次；</li>
          <li>现场勘查、设计修改、供应商接口与维护机制。</li>
        </ul>
      </article>
    </div>
    <div class="qily-pricing-boundary-note"><strong>公开报价不包含：</strong>跨区域差旅与住宿、税费、第三方软件／设备／检测、物料与制作施工费用，以及需求确认后新增的范围。现场诊断、项目设计、制作施工和长期驻场分别核算；最终范围、金额、税费、付款节点与验收标准以正式合同为准。</div>
  </div>
</section>
<section class="module-section alt" id="quality-throughline" aria-labelledby="qualityThroughlineTitle">
  <div class="module-inner">
    <div class="qily-quality-throughline">
      <small>QUALITY THROUGHLINE｜PQCD的贯穿主线</small>
      <h3 id="qualityThroughlineTitle">质量不是PQCD中的一个并列数字，而是生产力、成本与交付成立的前提</h3>
      <p>所有效率、成本和交付改善，必须同时通过质量基线、一次合格率、过程能力、DPPM／COPQ、异常防再发与客户风险验证。QilyLean不接受以返工增加、判定放宽、检验后移或风险转嫁换取表面产量。相关方法持续关联至<a href="/qilylean/daily/2026-07-31.html">《品质不是检出来的：把客户要求转化为全过程质量闭环》</a>及<a href="/knowledge/terminology.html?opl=质量改善">质量改善术语与单点培训</a>。</p>
    </div>
  </div>
</section>
<!-- QILY-CORE-PRICING-QUALITY:END -->`;
}

function patchCooperation() {
  let html = read('cooperation/index.html');
  html = upsertStylesheet(html);

  html = html.replace(
    '围绕PQCD与交付瓶颈，运用IE、VSM、单件流、SMED、OEE、线平衡和Poka-Yoke开展诊断与试点，用实绩验证改善是否真正有效。',
    '以质量为贯穿主线，围绕PQCD与交付瓶颈，运用IE、VSM、单件流、SMED、OEE、线平衡和Poka-Yoke开展诊断与试点；任何效率、成本和交付改善，均以合格产出、过程稳定和客户风险受控为验收前提。'
  );
  html = html.replace(
    '标准交付：基线数据、问题清单、未来态方案、Pilot验证、标准作业、培训稽核与横向复制计划。',
    '标准交付：质量与效率基线、问题清单、未来态方案、Pilot验证、标准作业、质量防错、培训稽核与横向复制计划。'
  );

  html = replaceOrInsertBefore(
    html,
    'QILY-CORE-PRICING-QUALITY:START',
    'QILY-CORE-PRICING-QUALITY:END',
    pricingAndQualityBlock(),
    '<section class="module-section alt" id="entry">'
  );

  if (!html.includes('¥80,000–300,000+／项目')) throw new Error('新工厂规划公开价格参考未写入');
  if (!html.includes('¥3,000–6,000／人日')) throw new Error('精益改善人日参考未写入');
  if (!html.includes('¥30,000–150,000／项目')) throw new Error('目视化项目参考未写入');
  if (!html.includes('质量不是PQCD中的一个并列数字')) throw new Error('PQCD质量贯穿主线未写入');
  write('cooperation/index.html', html);
}

function dailyQualityBlock() {
  return `<!-- QILY-DAILY-QUALITY-THROUGHLINE:START -->
<div class="daily-quality-throughline" data-quality-throughline="2026-08-04">
  <small>QUALITY GATE｜科学改进生产力的质量门槛</small>
  <h3>质量不是生产力公式旁边的一个指标，而是有效产出能否成立的第一道门</h3>
  <p>在PQCD中，Q必须贯穿P、C、D：产量提高但一次合格率下降，不是生产力提升；成本下降却增加返工、客诉或质量风险，不是有效降本；交付提速依赖放宽判定或检验后移，也不属于科学改善。请结合<a href="/qilylean/daily/2026-07-31.html">7月31日质量专题简报</a>与<a href="/knowledge/terminology.html?opl=质量改善">质量改善单点培训</a>复核。</p>
  <div class="quality-gates"><span>FPY／一次合格率</span><span>DPPM／客户风险</span><span>COPQ／质量成本</span><span>防错／防止复发</span></div>
</div>
<!-- QILY-DAILY-QUALITY-THROUGHLINE:END -->`;
}

function patchDailyBrief() {
  let html = read('qilylean/daily/2026-08-04.html');
  html = upsertStylesheet(html);
  html = replaceOrInsertBefore(
    html,
    'QILY-DAILY-QUALITY-THROUGHLINE:START',
    'QILY-DAILY-QUALITY-THROUGHLINE:END',
    dailyQualityBlock(),
    '<!-- QILY-DAILY-TERMINOLOGY:START -->'
  );
  html = html.replace(
    '只有满足客户需求、质量标准、交付时间和成本边界的合格产出，才应进入生产力分子；',
    '只有满足客户需求、质量标准、交付时间和成本边界的合格产出，才应进入生产力分子；质量是生产力成立的首要门槛，'
  );
  if (!html.includes('data-quality-throughline="2026-08-04"')) throw new Error('8月4日质量贯穿模块缺失');
  write('qilylean/daily/2026-08-04.html', html);
}

function patchEnhanceTheme() {
  const relativePath = 'scripts/enhance-daily-archive.js';
  let source = read(relativePath);

  if (!source.includes("'科学改进生产力': {")) {
    const guide = `  '科学改进生产力': {\n    definition: '科学改进生产力以合格且满足需求的有效产出为对象，通过事实基线、损失结构、小范围试验和标准固化减少系统浪费；质量是效率、成本和交付改善成立的前提。',\n    signals: ['人员和设备持续忙碌但合格交付没有改善', '产出上升同时返工、客诉、库存或加班增加', '改善报告只有结果数字而缺少基线、条件和复验'],\n    formula: '有效生产力＝合格且满足需求的产出÷系统总投入；必须同步观察FPY、DPPM／COPQ、交付达成和安全边界。',\n    steps: ['定义客户需要的合格产出与质量门槛', '建立时间、人员、设备、质量和异常事实基线', '识别最大系统损失并设计小范围试点', '联合验证质量、效率、成本、交付与可持续性后固化标准'],\n    pitfalls: ['把催人提速、加班或简单减员当作生产力改善', '只看产量或UPPH而忽略质量损失和库存转移', '试点未验证质量风险就直接全面推广'],\n    takeaway: '科学改进生产力必须先守住质量，再用证据减少损失，让系统稳定地产出合格品。'\n  },\n`;
    source = source.replace("  'IE方法': {", `${guide}  'IE方法': {`);
  }

  if (!source.includes("'科学改进生产力': 'leanSystem'")) {
    source = source.replace(
      "  'IE方法': 'leanSystem',",
      "  '科学改进生产力': 'leanSystem',\n  'IE方法': 'leanSystem',"
    );
  }

  if (!source.includes('/科学改进生产力|生产力改善|有效生产力/i')) {
    source = source.replace(
      "    [/标准工时|IE七大手法|工业工程|IE标工/i, 'IE方法'],",
      "    [/科学改进生产力|生产力改善|有效生产力/i, '科学改进生产力'],\n    [/标准工时|IE七大手法|工业工程|IE标工/i, 'IE方法'],"
    );
  }

  if (!source.includes("'科学改进生产力': {")) throw new Error('科学改进生产力培训映射写入失败');
  write(relativePath, source);
}

function patchStaticCoreSource() {
  const relativePath = 'scripts/materialize-static-core-pages.js';
  let source = read(relativePath);
  source = source.replace(
    '围绕VSM、标准工时、线平衡、SMED、OEE、质量异常和计划实绩闭环，先验证再固化。',
    '以质量为贯穿主线，围绕VSM、标准工时、线平衡、SMED、OEE、质量防错和计划实绩闭环，先验证合格产出，再固化效率、成本与交付改善。'
  );
  write(relativePath, source);
}

const changed = [];
for (const [name, fn] of [
  ['links', patchLinks],
  ['cooperation', patchCooperation],
  ['daily-2026-08-04', patchDailyBrief],
  ['daily-theme', patchEnhanceTheme],
  ['static-core-source', patchStaticCoreSource]
]) {
  const before = process.hrtime.bigint();
  fn();
  changed.push(`${name}:${Number(process.hrtime.bigint() - before) / 1e6}ms`);
}

process.stdout.write(`Commercial, contrast and quality closure applied (${changed.join(', ')}).\n`);
