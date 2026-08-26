#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

const SERIES = [
  {
    date:'2025-12-30', stage:'EVT', stageName:'Engineering Validation Test｜工程验证', part:'01/08',
    title:'NPI四阶段①｜EVT立项与工程可行性：先证明“做得出来”，再谈设计定型',
    summary:'EVT不是“先做几个样机看看”，而是把客户需求、CTQ、系统架构、关键器件、技术风险与初步DFM/DFA拉到同一工程基线，形成可追溯的工程验证证据。',
    focus:'需求基线与工程可行性',
    outputs:['VOC/客户要求转CTQ与可验证规格','系统/产品架构、关键器件与关键参数冻结到EVT基线','初版DFMEA、特殊特性候选清单与高风险验证计划','样件BOM、图纸、软件/固件、测试规范建立版本控制'],
    gate:['关键技术路径有实物或数据证据','高风险失效模式已有验证计划与责任人','EVT样件问题清单分级并形成关闭时限','未满足项不得以“后续再看”替代阶段门决策'],
    kpis:[['需求覆盖率','客户/法规/内部要求均有验证项'],['高风险关闭率','EVT红色风险必须进入受控清单'],['样件一次可测率','样件具备完整测试条件'],['版本一致率','BOM/图纸/软件/测试规范同一基线']]
  },
  {
    date:'2026-01-23', stage:'EVT', stageName:'Engineering Validation Test｜工程验证', part:'02/08',
    title:'NPI四阶段②｜EVT工程样机构建：用问题清单、DFMEA与DOE把技术风险前移',
    summary:'第二个EVT主题聚焦工程样机构建与风险收敛：不是重复“风险前移”，而是明确样机构建、DOE、边界条件、故障复现、失效机理和问题关闭的工程方法。',
    focus:'工程样机构建与风险收敛',
    outputs:['EVT Build Plan：样本量、版本、工装、物料、测试资源和日程','DOE/极限工况/边界条件验证与关键参数窗口','问题单统一编号，绑定现象、复现条件、根因、措施、验证证据','DFMEA随试验结果动态更新，形成DVT输入'],
    gate:['关键功能与接口在目标边界内可重复通过','高严重度问题完成根因确认或受控遏制','工程变更已回写BOM/图纸/软件与验证计划','DVT入口基线经过跨职能评审'],
    kpis:[['问题复现率','异常必须可重复复现或有统计证据'],['根因确认率','避免“换件好了”代替根因'],['工程变更闭环率','ECR/ECO与验证证据闭环'],['DVT输入完整率','设计与验证基线可审计']]
  },
  {
    date:'2026-02-16', stage:'DVT', stageName:'Design Validation Test｜设计验证', part:'03/08',
    title:'NPI四阶段③｜DVT设计定型：功能、性能、可靠性与法规必须形成验证矩阵',
    summary:'DVT的核心不是“再试产一次”，而是证明设计满足规格、可靠性和适用法规要求。用DVP&R/验证矩阵管理样本、条件、判定标准、结果与偏差关闭。',
    focus:'设计验证矩阵与可靠性',
    outputs:['DVP&R/验证矩阵：规格—试验—样本—条件—判定—结果可追溯','可靠性、寿命、环境、电气/机械应力与滥用工况验证','法规/认证项目按产品适用范围纳入计划','DFMEA高风险项与DVT试验建立一一对应关系'],
    gate:['设计输入与输出可追溯，测试无重大缺口','可靠性/法规项目达到预定退出准则','关键偏差已有批准、补验或设计变更','设计冻结进入受控状态'],
    kpis:[['验证覆盖率','规格/风险/法规均有对应试验'],['一次通过率','按测试项统计首次通过'],['高风险关闭率','DFMEA高RPN/AP项有证据关闭'],['偏差关闭周期','DVT偏差不得无期限跨阶段']]
  },
  {
    date:'2026-03-12', stage:'DVT', stageName:'Design Validation Test｜设计验证', part:'04/08',
    title:'NPI四阶段④｜DVT设计冻结与变更控制：没有基线冻结，就没有真正的PVT',
    summary:'DVT后半段聚焦设计冻结、ECR/ECO和配置管理。若BOM、图纸、软件、规格、测试标准仍频繁漂移，PVT得到的过程能力和产能数据都不可信。',
    focus:'设计冻结、配置与变更控制',
    outputs:['设计冻结清单：BOM、图纸、规格、软件/固件、关键参数','ECR/ECO变更影响评估覆盖采购、工艺、质量、测试、库存和客户','Golden Sample/限度样件与关键特性基准建立','PVT量产条件版本号与追溯规则明确'],
    gate:['PVT使用的产品定义唯一且受控','所有开放变更有实施批次、切换点和追溯规则','关键特性、检验标准、限度样件已确认','跨部门签署DVT Gate Review'],
    kpis:[['冻结后变更数','监控制程后仍发生的设计漂移'],['版本一致率','现场与系统版本一致'],['变更影响覆盖率','ECO影响对象无遗漏'],['DVT Gate达成率','所有退出项有证据']]
  },
  {
    date:'2026-04-05', stage:'PVT', stageName:'Production Validation Test｜生产验证', part:'05/08',
    title:'NPI四阶段⑤｜PVT量产条件验证：PFMEA、Control Plan、工装设备与MSA必须一起成熟',
    summary:'PVT必须在接近量产的人、机、料、法、环、测条件下验证制造系统，而不是用工程师“保姆式试产”制造一个漂亮结果。',
    focus:'量产过程设计与质量策划',
    outputs:['Process Flow、PFMEA、Control Plan三件套逻辑一致','量产设备/治具/检具/程序版本完成验收与点检基线','MSA确认测量系统可用，关键过程导入SPC/过程能力监控','SOP、WI、检验标准、培训认证与反应计划齐套'],
    gate:['过程文件与现场实际一致','关键测量系统达到既定MSA接受准则','特殊特性有控制方法和异常反应计划','PVT试产不依赖临时工程措施维持'],
    kpis:[['PFMEA-CP一致率','风险与控制点一一对应'],['MSA通过率','关键量检具满足企业/客户准则'],['FPY','一次直通率反映过程成熟度'],['临时措施数量','PVT结束前必须显著收敛']]
  },
  {
    date:'2026-04-29', stage:'PVT', stageName:'Production Validation Test｜生产验证', part:'06/08',
    title:'NPI四阶段⑥｜PVT产能与Run@Rate：CT、OEE、瓶颈、齐套率和过程能力要用实绩证明',
    summary:'PVT后半段把“能生产”升级为“按节拍稳定生产”。用CT、TT、OEE、瓶颈、良率、齐套率、Cpk/Ppk和Run@Rate验证量产能力，拒绝用单次峰值代替稳定能力。',
    focus:'产能、节拍与Run@Rate',
    outputs:['标准工时/CT、Takt Time、工位负荷、线平衡与瓶颈基线','Run@Rate/持续生产验证覆盖计划产量、良率、停机与换线损失','关键过程Cpk/Ppk或客户指定过程能力指标','供应齐套、包装、物流、追溯与异常升级机制实跑'],
    gate:['产能在目标班次/工时模型下可持续达成','关键过程能力满足客户/内部退出准则','瓶颈与停机主要损失有责任人和改善计划','适用汽车项目完成PPAP/客户批准要求后再进入MP'],
    kpis:[['CT/TT达成率','实际周期满足客户节拍'],['OEE','可用率×性能×质量'],['Cpk/Ppk','关键过程能力按客户规则判定'],['齐套率','物料/包装/文件按计划齐套']]
  },
  {
    date:'2026-05-23', stage:'MP', stageName:'Mass Production｜量产爬坡', part:'07/08',
    title:'NPI四阶段⑦｜MP受控爬坡：Safe Launch、分层审核与问题升级把首批风险锁住',
    summary:'MP不是PVT通过后“一键量产”，而是受控爬坡。首批量产通过Safe Launch、加严检验、分层审核、日清问题板和客户风险监控，逐步退出额外控制。',
    focus:'Safe Launch与量产爬坡',
    outputs:['Ramp-up Plan按周定义产量、班次、人力、良率和退出条件','Safe Launch/加严控制针对高风险特性设置频次和期限','SQCDP/日例会追踪停线、FPY、报废、返工、设备和交付','LPA/分层审核验证SOP、参数、点检、检验与反应计划执行'],
    gate:['连续多个生产周期达到质量与交付目标','新增问题趋势收敛，无重大客户风险','临时加严措施满足退出条件后才解除','制造/质量/供应链对日常运营具备独立承接能力'],
    kpis:[['Ramp达成率','实际产出/爬坡计划'],['FPY趋势','按周观察稳定上升并收敛'],['停线时间','Top损失必须闭环'],['客户0km/早期失效','首批风险重点监控']]
  },
  {
    date:'2026-06-16', stage:'MP', stageName:'Mass Production｜量产移交', part:'08/08',
    title:'NPI四阶段⑧｜MP量产移交与NPI关闭：用30/60/90天稳定性证明项目真正结束',
    summary:'NPI关闭不是“项目群里发一句量产成功”。必须完成制造运营移交、开放问题清零/受控、能力验证、经验复盘和30/60/90天稳定性确认，才能从项目制切换到日常经营。',
    focus:'量产移交、稳定性与项目关闭',
    outputs:['Operations Handover：工艺、设备、质量、供应链、维护、培训、备件与文档完整移交','Open Issue清单明确关闭责任、风险等级、临时措施与最终期限','30/60/90天质量、效率、交付、成本和客户反馈稳定性跟踪','Lessons Learned回写设计规范、DFMEA/PFMEA、标准库与后续项目模板'],
    gate:['量产KPI连续稳定达到项目目标或批准基线','重大开放问题清零，剩余项风险受控且有期限','运营团队独立运行，无工程师长期“托底”','项目复盘、财务/产能/质量收益与经验完成归档'],
    kpis:[['30/60/90天稳定率','量产指标连续受控'],['问题关闭率','重大问题100%关闭'],['运营移交完成率','文件/人员/系统/备件齐套'],['复发率','同类问题不得在新项目重复出现']]
  }
];

const STAGES = [
  ['EVT','工程验证','证明技术方案与样件可行'],
  ['DVT','设计验证','证明设计满足规格/可靠性/法规'],
  ['PVT','生产验证','证明量产过程、质量与产能可行'],
  ['MP','量产爬坡','证明持续交付并完成运营移交']
];

function esc(s){return String(s).replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;'}[c]));}
function read(p){return fs.readFileSync(path.join(root,p),'utf8');}
function write(p,s){fs.writeFileSync(path.join(root,p),s);}

function stageRoadmap(current){
  return `<div class="npi-stage-roadmap">${STAGES.map(([code,name,desc])=>`<div class="npi-stage${code===current?' is-current':''}"><b>${code}</b><small>${name}</small><p>${desc}</p></div>`).join('')}</div>`;
}
function gantt(current){
  const rows=[
    ['需求/CTQ/项目基线',1,2,'EVT'],['工程样机/DFMEA/DOE',2,4,'EVT'],['DVP&R/可靠性/法规',5,8,'DVT'],['设计冻结/ECR-ECO',7,9,'DVT'],['Process Flow/PFMEA/CP',8,11,'PVT'],['工装设备/MSA/SPC',9,12,'PVT'],['PVT Build/Run@Rate/PPAP*',11,14,'PVT'],['MP Safe Launch/Ramp-up',15,18,'MP'],['30/60/90天稳定与移交',17,20,'MP']
  ];
  const header=`<div class="npi-gantt-label">工作包 / 周</div>${Array.from({length:20},(_,i)=>`<div class="npi-gantt-week">W${i+1}</div>`).join('')}`;
  const body=rows.map(([label,start,end,stage])=>`<div class="npi-gantt-label">${label}</div>${Array.from({length:20},(_,i)=>{const w=i+1;const active=w>=start&&w<=end;return `<div class="npi-gantt-bar${active?' active':''}${active&&stage===current?' current':''}">${active&&w===start?stage:''}</div>`}).join('')}`).join('');
  return `<div class="npi-gantt"><h3>NPI Master Gantt｜20周参考模板</h3><p>实际周期应由产品复杂度、模具/认证周期、供应链长周期料和客户节点校准；颜色突出本期阶段。*PPAP仅在汽车/客户要求适用时执行。</p><div class="npi-gantt-table">${header}${body}</div></div>`;
}
function seriesNav(date){return `<div class="npi-series-nav">${SERIES.map((x,i)=>`<a href="/qilylean/daily/${x.date}.html"${x.date===date?' aria-current="page"':''}>${i+1}.${x.stage}</a>`).join('')}</div>`;}
function cards(title,items){return `<div class="npi-gate-card"><h3>${title}</h3><ul>${items.map(x=>`<li>${x}</li>`).join('')}</ul></div>`;}
function content(item){
  return `<div class="content"><div class="date">${item.date}｜NPI四阶段 ${item.part}</div><h2>${item.title}</h2><p>${item.summary}</p><div class="quote">${item.stage}阶段主题：${item.focus}。没有阶段门证据，不进入下一阶段。</div>
<section class="npi-series" data-npi-four-stage="v1" data-stage="${item.stage}">
<div class="npi-callout"><strong>先把顺序说清楚：</strong>QilyLean按国际硬件/NPI常见Phase-Gate逻辑采用 <strong>EVT → DVT → PVT → MP</strong>。EVT/DVT/PVT/MP并不是某一份ISO标准强制规定的唯一命名；本系列把阶段门证据对齐ISO 9001设计开发控制，并在汽车项目中映射IATF 16949、AIAG APQP/Control Plan/PPAP；客户另有VDA MLA或专项规范时，以合同/客户要求为准。</div>
${stageRoadmap(item.stage)}
<div class="npi-gate-grid">${cards(`${item.stage}关键交付物`,item.outputs)}${cards(`${item.stage}退出准则 / Gate Review`,item.gate)}</div>
<div class="npi-kpi">${item.kpis.map(([a,b])=>`<div><strong>${a}</strong><span>${b}</span></div>`).join('')}</div>
${gantt(item.stage)}
<div class="npi-standard-map"><strong>国际体系映射：</strong>ISO 9001:2015 §8.3（设计和开发）；汽车项目按适用范围结合IATF 16949 §8.3、AIAG APQP/Control Plan及PPAP。注意：阶段名称只是项目治理框架，真正的放行依据必须是需求、风险、验证、过程能力、客户批准与量产稳定性的客观证据。</div>
${seriesNav(item.date)}
</section>
<div class="tags"><span class="tag">NPI</span><span class="tag">${item.stage}</span><span class="tag">APQP</span><span class="tag">Phase Gate</span><span class="tag">Gantt</span></div><button class="share" type="button">分享本期网址</button><span class="status"></span></div>`;
}

function replaceMeta(html,item){
  const desc=`${item.summary}｜${item.date} QilyLean精选简报`;
  html=html.replace(/<title>[\s\S]*?<\/title>/,`<title>${esc(item.title)}｜今日简报</title>`);
  html=html.replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${esc(desc)}">`);
  html=html.replace(/<meta property="og:title" content="[^"]*">/,`<meta property="og:title" content="${esc(item.title)}｜今日简报">`);
  html=html.replace(/<meta property="og:description" content="[^"]*">/,`<meta property="og:description" content="${esc(item.summary)}">`);
  html=html.replace(/<meta name="twitter:title" content="[^"]*">/,`<meta name="twitter:title" content="${esc(item.title)}｜今日简报">`);
  html=html.replace(/<meta name="twitter:description" content="[^"]*">/,`<meta name="twitter:description" content="${esc(desc)}">`);
  if(!html.includes('/qilylean/npi-four-stage-series-v1.css')) html=html.replace('</head>','<link rel="stylesheet" href="/qilylean/npi-four-stage-series-v1.css?v=20260826-npi-phase-gate-v1">\n</head>');
  return html;
}

for(const item of SERIES){
  const rel=`qilylean/daily/${item.date}.html`;
  let html=read(rel);
  html=replaceMeta(html,item);
  const articleRe=new RegExp(`(<article class="post" id="${item.date}"><div class="visual">[\\s\\S]*?<\\/div>)<div class="content">[\\s\\S]*?<\\/div><\\/article>(<section class="brief-feedback")`);
  if(!articleRe.test(html)) throw new Error(`Article structure not found: ${rel}`);
  html=html.replace(articleRe,`$1${content(item)}</article>$2`);
  html=html.replace(new RegExp(`data-brief-title="[^"]*"`),`data-brief-title="${esc(item.title)}"`);
  html=html.replace(new RegExp(`来源简报：${item.date}｜[^<]*`),`来源简报：${item.date}｜${item.title}`);
  write(rel,html);
}

const indexPath='qilylean/daily/index.json';
const index=JSON.parse(read(indexPath));
for(const item of SERIES){
  const row=index.find(x=>x.date===item.date);
  if(!row) throw new Error(`Index row missing: ${item.date}`);
  row.title=item.title; row.summary=item.summary; row.theme=`NPI四阶段｜${item.stage}`;
}
write(indexPath,JSON.stringify(index,null,2)+'\n');

process.stdout.write(`PASS: rebuilt ${SERIES.length} NPI briefs as one EVT→DVT→PVT→MP engineering series with a governed Gantt timeline.\n`);
