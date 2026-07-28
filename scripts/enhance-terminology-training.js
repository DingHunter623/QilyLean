#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const terminologyFile = path.join(root, 'knowledge', 'terminology.html');
const knowledgeFile = path.join(root, 'knowledge', 'index.html');

function text(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

const formulas = {
  'TT': '客户需求节拍＝可用生产时间 ÷ 客户需求量。时间单位与需求周期必须一致。',
  'PCE': '流程周期效率＝增值时间 ÷ 总交付周期 × 100%。总周期应包含加工、等待、库存和流动。',
  'OEE': '设备综合效率＝可动率 × 性能效率 × 质量率。三项口径必须使用同一计划生产时间边界。',
  'UPPH': '人均小时产出＝合格产出 ÷（直接人力 × 实际生产小时）。跨产品比较时应同步说明标准工时和工艺差异。',
  'FPY': '一次通过率＝一次合格数量 ÷ 投入数量 × 100%。返工后合格不能计入一次合格。',
  'ROI': '投资回报率＝期间净收益 ÷ 项目总投入 × 100%。净收益应扣除维护、能耗、耗材和持续运行成本。',
  'Inventory Turnover': '库存周转率＝期间销售成本 ÷ 平均库存；平均库存＝（期初库存＋期末库存）÷2。库存周转天数＝期间天数 ÷ 库存周转率。',
  'Line Balance Rate': '线平衡率＝工序总作业时间 ÷（工位数 × 瓶颈周期）×100%。',
  'Capacity Utilization': '产能利用率＝实际产出或实际工时 ÷ 可用产能或可用工时 ×100%，计算前必须统一理论产能与计划产能边界。',
  'Yield': '良率＝合格数量 ÷ 投入数量 ×100%。应明确是否包含返工、报废和重复检验。',
  'DPPM': 'DPPM＝缺陷品数量 ÷ 交付总数量 ×1,000,000。客户口径可能按缺陷数或不良品数统计，必须先确认。',
  'Cpk': 'Cpk＝min[(USL－平均值)÷3σ，(平均值－LSL)÷3σ]，用于评价过程中心与规格界限之间的能力。',
  'Cp': 'Cp＝(USL－LSL)÷6σ，只反映过程波动宽度，不反映中心偏移。'
};

function classify(code, english, chinese) {
  const source = `${code} ${english} ${chinese}`;
  if (/ISO|IATF|IPC|GB\/T|Standard|Specification|Requirement/i.test(source)) return '标准与规范';
  if (/Engineering|Manager|Management Office|Assurance|Control|Inspector|Planner|Operator/i.test(source)) return '岗位与职能';
  if (/Rate|Ratio|Yield|Time|Efficiency|Utilization|Units|DPPM|Cpk|Cp|OEE|UPPH|PCE|ROI/i.test(source) || /率|效率|工时|周期|产出|能力指数/.test(chinese)) return '指标与数据';
  if (/System|Platform|Software|Planning|Resource|Execution|Database|Intelligence/i.test(source)) return '系统与机制';
  if (/Process|Method|Analysis|Mapping|Maintenance|Flow|Kaizen|Lean|ECRS|SMED|TPM|PDCA/i.test(source)) return '方法与工具';
  return '制造专业术语';
}

function overview(code, english, chinese) {
  const kind = classify(code, english, chinese);
  const englishPart = english && english !== code ? `，英文全称为“${english}”` : '';
  return `${chinese}（${code}${englishPart}）属于${kind}。培训时应先理解它解决的管理问题，再统一对象、数据口径、责任边界和适用条件，避免只记缩写而不会在现场应用。`;
}

function addInventoryTurnover(page) {
  if (/class="term-code">Inventory Turnover</i.test(page)) return page;
  const card = `<article class="term-card" data-term-card>
  <div class="term-code">Inventory Turnover</div>
  <div class="term-en">Inventory Turnover Ratio</div>
  <h3>库存周转率</h3>
  <p><strong>应用场景：</strong>用于衡量一定期间内库存转化为销售成本或完成出货的速度，适合PMC、采购、仓储、财务与经营管理联合评估原材料、在制品和成品占用。周转率偏低通常提示积压、呆滞、批量过大或需求预测偏差；周转率过高也可能意味着安全库存不足、供应波动或缺料风险，应与库存周转天数、呆滞金额、缺料次数、交付达成率和现金占用共同判断。</p>
</article>`;
  const wipPattern = /(<article class="term-card" data-term-card>\s*<div class="term-code">WIP<\/div>[\s\S]*?<\/article>)/i;
  if (!wipPattern.test(page)) throw new Error('WIP terminology card was not found');
  return page.replace(wipPattern, `$1\n${card}`);
}

function enhanceCards(page) {
  return page.replace(/<article class="term-card" data-term-card>([\s\S]*?)<\/article>/g, (article, inner) => {
    if (/class="term-overview"/.test(article)) return article;
    const code = text((inner.match(/<div class="term-code">([\s\S]*?)<\/div>/) || [])[1]);
    const english = text((inner.match(/<div class="term-en">([\s\S]*?)<\/div>/) || [])[1]);
    const chinese = text((inner.match(/<h3>([\s\S]*?)<\/h3>/) || [])[1]);
    if (!code || !chinese) return article;
    const formula = formulas[code];
    const learning = `<p class="term-overview"><strong>简介概述：</strong>${escapeHtml(overview(code, english, chinese))}</p>${formula ? `\n  <p class="term-formula"><strong>计算公式／判定：</strong>${escapeHtml(formula)}</p>` : ''}`;
    return article.replace(/(<h3>[\s\S]*?<\/h3>)/, `$1\n  ${learning}`);
  });
}

function addTrainingStyles(page) {
  if (/terminology-training-v2/.test(page)) return page;
  const styles = `
/* terminology-training-v2 */
.term-card{display:flex;min-height:0;flex-direction:column;gap:0}
.term-code::before,.term-en::before,.term-card h3::before{display:block;margin-bottom:5px;color:var(--qily-teal,#178b94);font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
.term-code::before{content:"术语代码"}.term-en::before{content:"英文全称"}.term-card h3::before{content:"中文名称"}
.term-overview,.term-formula{margin-top:10px!important;padding:12px 14px;border-left:4px solid var(--qily-teal,#178b94);background:#f3f9f7;color:#344845!important}
.term-formula{border-left-color:#caa15f;background:#fff8e8}
.term-card>p:last-child{margin-top:10px;padding-top:12px;border-top:1px dashed var(--qily-line,#d5e4e3)}
.term-card>p strong{display:inline-block;margin-right:2px}
@media(max-width:760px){.term-card{padding:18px}.term-code{font-size:24px}.term-card h3{font-size:20px}.term-card p{font-size:15.5px;line-height:1.68}}
`;
  return page.replace('</style>', `${styles}</style>`);
}

function updateCounts(page) {
  const count = (page.match(/<article class="term-card" data-term-card>/g) || []).length;
  page = page
    .replace(/：\d+项英文、字母代码及标准编号/, `：${count}项英文、字母代码及标准编号`)
    .replace(/共收录\s*\d+\s*项术语/g, `共收录 ${count} 项术语`);
  return { page, count };
}

function improveLead(page) {
  return page.replace(
    /<p class="module-lead">[\s\S]*?<\/p>/,
    '<p class="module-lead">集中解释制造管理、精益改善、工程开发、质量体系、生产计划、数智化系统与电子制造专业术语。每项按“术语代码—英文全称—中文名称—简介概述—计算公式或判定—应用场景”组织，并补充使用边界，便于直接用于培训讲解、案例讨论与现场查阅。</p>'
  );
}

function updateKnowledgeIndex(count) {
  let page = fs.readFileSync(knowledgeFile, 'utf8');
  page = page.replace(/165项英文、字母代码及标准编号/g, `${count}项英文、字母代码及标准编号`);
  page = page.replace(/165项术语/g, `${count}项术语`);
  fs.writeFileSync(knowledgeFile, page);
}

function main() {
  let page = fs.readFileSync(terminologyFile, 'utf8');
  page = addInventoryTurnover(page);
  page = enhanceCards(page);
  page = addTrainingStyles(page);
  page = improveLead(page);
  const result = updateCounts(page);
  fs.writeFileSync(terminologyFile, result.page);
  updateKnowledgeIndex(result.count);
  process.stdout.write(`Terminology training page enhanced; ${result.count} terms are now structured for learning.\n`);
}

main();
