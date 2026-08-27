#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dailyDir = path.join(root, 'qilylean', 'daily');
const indexPath = path.join(dailyDir, 'index.json');

function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);
}

function plain(value) {
  return String(value || '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

const profiles = [
  {
    key: 'SMED', match: /SMED|快速换型|快速换模/i, opl: ['SMED', 'ECRS'],
    scenario: '多品种、小批量生产中，换型停机已成为交付或设备有效产能的主要约束，需要把“找工具、备料、调参数、首件确认”等动作拆开管理。',
    caseText: '教学推演（非客户成果）：某设备换型基线90分钟。录像拆解后，将备料与工装点检转为外部作业，夹紧动作并行化，并预置参数；试点后单次换型52分钟。连续5次复测均在55分钟内，且首件合格率与安全点检无退化，才允许固化新标准。',
    metric: 'C/O时间、外部作业率、首件通过率、换型后异常数、安全点检完成率'
  },
  {
    key: 'OEE', match: /\bOEE\b|设备综合效率|设备效率/i, opl: ['OEE', 'MTBF', 'MTTR'],
    scenario: '设备开机时间看起来很长，但有效产出不足，需要把时间损失拆成停机、降速与不良，而不是只看“设备利用率”。',
    caseText: '教学推演（非客户成果）：某自动化线可动率90%、性能效率92%、质量率98%，OEE约81.1%。团队继续追溯原始停机与微停记录，而不是把81.1%当作结论；按损失分钟Pareto锁定前两项，再用同一计划生产时间口径复测。',
    metric: 'OEE、可动率、性能效率、质量率、故障分钟、微停次数、FPY'
  },
  {
    key: 'VSM', match: /\bVSM\b|价值流/i, opl: ['VSM', 'PCE', 'WIP', 'TT'],
    scenario: '订单交付周期远大于实际加工时间，单工序效率改善已经无法解释等待、库存和信息传递损失。',
    caseText: '教学推演（非客户成果）：某产品族总Lead Time为3.8天，实际增值加工仅26分钟，工序间WIP约1260件。团队从出货端逆向走查，先控制两处批量与等待，并用FIFO和补充信号做小范围试点；验收必须同时比较LT、WIP、缺料和交付达成，不能只看某一工位CT。',
    metric: 'Lead Time、VAT、PCE、WIP、CT/TT、交付达成率'
  },
  {
    key: 'IE', match: /标准工时|工业工程|\bIE\b|线平衡|山积图|UPPH|节拍|\bCT\b|\bTT\b/i, opl: ['TT', 'CT', 'ST', 'UPPH', 'Line Balance Rate'],
    scenario: '排产、人力配置或产线改善需要把客户需求转成节拍，并用统一测时口径识别瓶颈与负荷差异。',
    caseText: '教学推演（非客户成果）：某装配线客户需求TT为36秒/件，瓶颈工位CT为42秒。IE拆解动作并应用ECRS后，试点CT降至33秒；随后连续3个班次核对合格产出、UPPH、质量与异常停线，确认不是靠临时加速或转移工作量取得结果。',
    metric: 'TT、CT、标准工时、线平衡率、UPPH、合格产出、异常停线'
  },
  {
    key: 'QUALITY', match: /质量|品质|FPY|DPPM|COPQ|FMEA|PFMEA|SPC|MSA|防错|8D|5Why/i, opl: ['FPY', 'PFMEA', 'Poka-Yoke', '8D'],
    scenario: '质量问题反复出现或只能靠终检拦截时，需要把缺陷定义、样本、发生位置、根因证据和控制计划连接起来。',
    caseText: '教学推演（非客户成果）：某工序三批FPY均值94.5%，Pareto显示同一缺陷贡献约58%。团队先验证测量与缺陷定义，再通过复现确认根因，实施防错试点；只有连续批次FPY改善且未引入节拍、安全或新缺陷风险，才更新PFMEA、控制计划与作业标准。',
    metric: 'FPY、DPPM、缺陷Pareto、重复发生率、过程能力、控制计划关闭状态'
  },
  {
    key: 'PLAN', match: /PMC|排产|计划|APS|齐套|交付|产能负荷|库存|WIP/i, opl: ['Plan Attainment', 'RCCP', 'CRP', 'WIP'],
    scenario: '计划表显示可完成，但现场持续欠产、缺料或超产，需要把订单需求、齐套、工艺路线、能力与实绩放到同一条数据链。',
    caseText: '教学推演（非客户成果）：某日计划1000件，而按瓶颈CT、换型和有效工时核算的可执行能力仅860件。PMC没有继续下达“1000件必须完成”的口号，而是冻结近期窗口、拆分缺口原因并回写实绩；后续排程按未完成量、齐套状态和瓶颈能力滚动修正。',
    metric: '计划达成率、齐套率、能力负荷率、欠产数量、尾单、换型损失、交付达成率'
  },
  {
    key: 'DIGITAL', match: /ERP|MES|APS|WMS|数字化|数智化|主数据|系统/i, opl: ['ERP', 'MES', 'APS'],
    scenario: '系统已经上线，但编码、BOM、工艺、状态或实绩口径不一致，导致“系统有数据、现场不能决策”。',
    caseText: '教学推演（非客户成果）：某工厂先选一条产品线做订单—BOM—工艺—排产—报工—质量—库存闭环试点。验收不以“页面能打开”为准，而逐项核对主键、时间戳、异常补录、防重复、权限和账实一致性；通过后再扩展到其他产品族。',
    metric: '主数据正确率、接口成功率、账实一致率、异常补录关闭率、追溯完整率、计划实绩一致性'
  },
  {
    key: 'NPI', match: /NPI|EVT|DVT|PVT|APQP|PPAP|量产|试产|Pilot|项目管理|里程碑|阶段门/i, opl: ['Pilot', 'RACI', 'APQP', 'PPAP'],
    scenario: '项目“任务做完”但版本、风险、验证或量产移交不完整时，需要用阶段门和可验收交付物管理放行。',
    caseText: '教学推演（非客户成果）：某PVT评审仍有3项关键问题未关闭，其中一项涉及参数窗口、一项涉及防错、一项涉及维护移交。项目团队不以“样品已经能做出来”作为量产放行依据，而要求责任人、截止时间、验证证据和退出准则齐套后再决策。',
    metric: '里程碑达成率、问题关闭率、版本一致性、验证通过率、量产移交完整率'
  },
  {
    key: 'LAYOUT', match: /Layout|布局|SLP|新工厂|新产线|物流动线/i, opl: ['SLP', 'Spaghetti Diagram', 'TT'],
    scenario: '新工厂或产线规划需要同时平衡产能、工艺顺序、物流、人流、安全、公辅、维修与未来扩展，而不是只追求设备摆得下。',
    caseText: '教学推演（非客户成果）：某装配区域初版方案中物料补给与人员通道交叉，且关键设备维修空间不足。团队用产品族流向、物流频次和维护包络重新验证Layout；试点区先测搬运距离、补料频次和安全冲突，再决定是否复制。',
    metric: '单位产品搬运距离、物流交叉点、面积利用率、补料频次、安全距离、扩展预留'
  },
  {
    key: 'SAFETY', match: /安全|EHS|消防|联锁|LOTO/i, opl: ['LOTO', 'Poka-Yoke'],
    scenario: '设备、工装或现场改善改变了人员动作与风险暴露时，效率收益必须在安全边界内成立。',
    caseText: '教学推演（非客户成果）：某设备改善希望缩短取放动作，但试点发现手部可能进入危险区域。团队先完成风险评估与工程防护，再验证联锁、异常复位和维修状态；若防护未验证，即使CT下降也不得判定改善成功。',
    metric: '风险等级、联锁有效率、点检完成率、异常复位时间、CT、未遂事件'
  },
  {
    key: 'COST', match: /成本|ROI|收益|降本|COPQ/i, opl: ['ROI', 'COPQ', 'ST'],
    scenario: '改善项目声称节省成本时，需要区分理论机会、经营收益与一次性转移，避免把“少了几秒”直接换算成财务收益。',
    caseText: '教学推演（非客户成果）：某项目减少单件人工动作12秒。IE先按实际产量核算理论工时释放，再确认人员是否真实减少、产能是否被有效利用，并由财务核对加班、外包或新增产出的经营影响；未经复核的理论节省只记录为机会值。',
    metric: '标准工时、实际产量、人工投入、COPQ、一次性投入、年度化收益、财务核验状态'
  },
  {
    key: 'LEAN', match: /精益|Kaizen|PDCA|浪费|单件流|JIT|看板|拉动/i, opl: ['Lean', 'PDCA', 'Muda', 'One-piece Flow'],
    scenario: '现场存在等待、库存、搬运、返工或过量生产时，应先量化损失并找到系统约束，避免把精益等同于口号、清扫或简单减员。',
    caseText: '教学推演（非客户成果）：某装配区域每批等待18分钟、线边WIP约320件。团队先记录等待触发条件与补料频次，再选择一条产品族做受控小批流试点；验收同时看WIP、Lead Time、FPY和交付，防止只是把库存转移到别处。',
    metric: 'WIP、Lead Time、PCE、FPY、交付达成率、异常响应时间'
  }
];

const fallback = {
  key: 'GENERAL', opl: ['PDCA', '5Why'],
  scenario: '当制造问题存在反复、责任不清或改善结果不能复现时，应先建立事实基线，再用小范围试点验证措施。',
  caseText: '教学推演（非客户成果）：某装配工序连续一周出现等待与欠产。团队先统一统计时段和异常代码，记录3个班次事实后锁定主要损失，再实施单一变量试点；只有改善前后采用同一口径且质量、安全、交付无退化，才进入标准固化。',
  metric: '基线值、目标值、实际值、异常频次、验证周期、关闭证据'
};

function profileFor(html, title, theme) {
  const text = `${title} ${theme} ${plain(html)}`;
  return profiles.find((profile) => profile.match.test(text)) || fallback;
}

function hasConcreteCase(article) {
  return /class="[^"]*(?:example-box|term-opl-case|case-card|case-study)[^"]*"|data-(?:case|teaching-case)=|教学推演（非客户成果）|制造现场案例/.test(article);
}

function relatedLinks(profile) {
  const opl = (profile.opl || []).slice(0, 4).map((code, index) =>
    `<a class="qa-related-chip${index === 0 ? ' primary' : ''}" href="/knowledge/terminology.html?opl=${encodeURIComponent(code)}">${index === 0 ? '主OPL · ' : ''}${esc(code)}</a>`
  ).join('');
  return `${opl}<a class="qa-related-chip" href="/projects/">代表项目</a><a class="qa-related-chip" href="/cooperation/">相关业务能力</a>`;
}

function section(profile) {
  return `<section class="qa-nutrition-v2" data-knowledge-nutrition-v2="v2" data-case-evidence="teaching-simulation">
  <div class="qa-nutrition-heading"><span>APPLICATION / CASE</span><h3>应用场景 × 工程案例</h3><p>应用必须落到对象、数据、边界和验证；以下案例明确标识为教学推演，不作为客户成果或商业业绩证明。</p></div>
  <div class="qa-nutrition-grid">
    <div class="qa-nutrition-card"><strong>应用场景</strong><p>${esc(profile.scenario)}</p></div>
    <div class="qa-nutrition-card case"><strong>案例推演</strong><p>${esc(profile.caseText)}</p></div>
    <div class="qa-nutrition-card metric"><strong>必须同时观察</strong><p>${esc(profile.metric)}</p></div>
  </div>
  <div class="qa-related-network"><strong>关联学习与交付：</strong><div class="qa-related-chips">${relatedLinks(profile)}</div></div>
</section>`;
}

function insertSection(article, block) {
  if (/<div class="tags">/i.test(article)) return article.replace(/(<div class="tags">)/i, `${block}\n$1`);
  if (/<section class="brief-one-point-training"/i.test(article)) return article.replace(/(<section class="brief-one-point-training")/i, `${block}\n$1`);
  return article.replace(/<\/article>\s*$/i, `${block}\n</article>`);
}

function upgradePage(file, item) {
  let html = fs.readFileSync(file, 'utf8');
  const match = html.match(/<article\b[^>]*class="[^"]*\bpost\b[^"]*"[^>]*>[\s\S]*?<\/article>/i);
  if (!match) return { changed: false, reason: 'no-article' };
  let article = match[0].replace(/\s*<section class="qa-nutrition-v2"[\s\S]*?<\/section>/i, '');
  if (hasConcreteCase(article)) {
    if (article !== match[0]) html = html.replace(match[0], article);
    if (html !== fs.readFileSync(file, 'utf8')) fs.writeFileSync(file, html);
    return { changed: article !== match[0], reason: 'existing-case' };
  }
  const title = plain((article.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i) || [,''])[1]) || item.title || item.date;
  const dateLine = plain((article.match(/<div class="date"[^>]*>([\s\S]*?)<\/div>/i) || [,''])[1]);
  const theme = dateLine.replace(item.date || '', '').replace(/^[｜|·\s]+/, '') || item.theme || '';
  const profile = profileFor(article, title, theme);
  article = insertSection(article, section(profile));
  html = html.replace(match[0], article);
  fs.writeFileSync(file, html);
  return { changed: true, reason: profile.key };
}

function main() {
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  if (!Array.isArray(index) || !index.length) throw new Error('Curated daily index is empty.');
  let upgraded = 0;
  let existing = 0;
  const counts = {};
  for (const item of index) {
    const file = path.join(dailyDir, `${item.date}.html`);
    if (!fs.existsSync(file)) throw new Error(`Missing curated brief: ${item.date}`);
    const result = upgradePage(file, item);
    if (result.reason === 'existing-case') existing += 1;
    else if (result.changed) {
      upgraded += 1;
      counts[result.reason] = (counts[result.reason] || 0) + 1;
    }
  }
  process.stdout.write(`Knowledge Asset 2.0 curated brief upgrade: ${upgraded} page(s) received a concrete teaching case; ${existing} page(s) already carried explicit case evidence.\n`);
  process.stdout.write(`Profile distribution: ${JSON.stringify(counts)}\n`);
}

if (require.main === module) main();

module.exports = { profiles, fallback, profileFor, hasConcreteCase };
