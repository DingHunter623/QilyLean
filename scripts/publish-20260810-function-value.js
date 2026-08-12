#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const date = '2026-08-10';
const theme = '岗位价值与项目交付';
const title = '真正的职能含金量：不是“负责过”，而是能把问题变成结果';
const summary = '一个岗位真正的含金量，不在职位名称、汇报对象或会多少术语，而在于能否完成从问题识别、数据基线、方案设计、责任协同、Pilot验证、结果验收到机制固化的完整闭环。';

const todayPath = path.join(root, 'qilylean', 'daily', `${date}.html`);
const previousPath = path.join(root, 'qilylean', 'daily', '2026-08-09.html');
const directoryPath = path.join(root, 'qilylean', 'daily-insights.html');
const dailyJsonPath = path.join(root, 'qilylean', 'daily', 'index.json');
const latestBriefPath = path.join(root, 'qilylean', 'latest-brief.js');
const sitemapPath = path.join(root, 'sitemap.xml');

function assert(ok, msg){ if(!ok) throw new Error(msg); }
function write(file, content){ fs.writeFileSync(file, content.endsWith('\n') ? content : content + '\n', 'utf8'); }

const page = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}｜今日简报</title>
  <meta name="description" content="${summary}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="https://qilylean.com/qilylean/daily/${date}.html">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${title}｜今日简报">
  <meta property="og:description" content="${summary}">
  <meta property="og:url" content="https://qilylean.com/qilylean/daily/${date}.html">
  <meta property="og:site_name" content="QilyLean｜启力精益">
  <meta name="twitter:card" content="summary">
  <link rel="stylesheet" href="/site-shell.css?v=20260729-no-old-flash-v1">
  <link id="qilyVisualScaleStylesheet" rel="stylesheet" href="/site-visual-scale-v1.css?v=20260729-hierarchy-v4">
  <link id="qilyWideLayoutStylesheet" rel="stylesheet" href="/site-wide-layout-v1.css?v=20260810-content-axis-v8">
  <link id="qilyTypographyStylesheet" rel="stylesheet" href="/site-typography-v1.css?v=20260729-hierarchy-v4">
  <link rel="stylesheet" href="/qilylean/daily-briefs.css?v=20260729-ranked-search-v12">
  <script defer src="/site-navigation.js?v=20260812-native-navigation-stable-v20"></script>
<style>
.function-ladder{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:20px 0 28px}.function-ladder>div{padding:18px;border:1px solid rgba(202,161,95,.34);border-radius:16px;background:#fff}.function-ladder strong{display:block;color:#0f4b5a;font-size:18px;margin-bottom:8px}.function-ladder span{display:block;color:#526967;line-height:1.7}.value-chain{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;margin:18px 0 28px}.value-chain div{padding:14px 10px;border-radius:14px;background:#f4f8f7;border:1px solid #d9e7e4;text-align:center}.value-chain b{display:block;color:#0f4b5a;font-size:15px}.value-chain small{display:block;margin-top:5px;color:#617775;line-height:1.5}.brief-callout{margin:20px 0;padding:18px 20px;border-left:4px solid #caa15f;background:#f8fbfa;line-height:1.75}.role-matrix td:first-child{font-weight:850;color:#0f4b5a;white-space:nowrap}@media(max-width:900px){.value-chain{grid-template-columns:repeat(2,minmax(0,1fr))}.function-ladder{grid-template-columns:1fr 1fr}}@media(max-width:620px){.function-ladder,.value-chain{grid-template-columns:1fr}}
</style>
</head>
<body class="module-page daily-single-page">
<header class="qily-site-header"><a class="qily-brand" href="/">QilyLean｜启力精益</a><nav class="site-nav" aria-label="网站导航"><a href="/">首页</a><a href="/knowledge/">知识分享</a></nav></header>
<main>
<section class="daily-hero compact"><div class="daily-inner"><span>DAILY ENGINEERING BRIEF</span><h1>今日简报</h1><p>${date}｜${theme}</p></div></section>
<section class="daily-single-section"><div class="daily-inner">
<nav class="brief-adjacent top" aria-label="简报翻页"><a href="/qilylean/daily/2026-08-09.html">← 上一期</a><a class="directory" href="/qilylean/daily-insights.html">返回简报目录</a><span>已是最新一期</span></nav>
<article class="post detailed" id="${date}">
  <div class="date">${date}｜${theme}</div>
  <h2>${title}</h2>
  <p>${summary}</p>
  <div class="quote">职位给你权限，职能决定你要解决什么问题，结果才决定这个岗位有没有含金量。</div>

  <section class="brief-one-point-training" data-one-point-training="v1">
    <div class="brief-one-point-heading"><span>SINGLE-POINT LESSON</span><h3>单点培训｜如何判断一个岗位有没有“真含金量”</h3><p>用于岗位说明书评审、招聘面试、晋升答辩、干部述职和项目复盘。评价重点从“做过什么”转向“解决了什么问题、形成了什么结果、留下了什么机制”。</p></div>
    <div class="brief-one-point-grid">
      <div><strong>培训目标</strong><p>能区分任务执行、专业分析、项目交付与组织能力沉淀四个价值层级。</p></div>
      <div><strong>核心口径</strong><p>职能含金量＝问题复杂度 × 决策质量 × 交付结果 × 可复制性，而不是职位名称本身。</p></div>
      <div><strong>现场动作</strong><p>任何岗位述职至少回答：问题、基线、动作、结果、证据、标准化六项。</p></div>
      <div><strong>使用边界</strong><p>不以“会议多、报表多、加班多、协调多”替代真实业务贡献。</p></div>
    </div>
    <div class="brief-one-point-interface"><strong>相关职能接口：</strong>管理层负责方向与资源；专业职能建立事实、方案和标准；业务部门承担现场执行；跨部门接口用RACI明确责任，用PDCA验证闭环。</div>
    <p class="brief-one-point-check"><strong>培训验收：</strong>任选一个真实岗位，用“问题—基线—方案—责任—验证—验收—固化”七步说明其价值；若只能描述日常事务，说明岗位价值尚未被结构化。</p>
  </section>

  <!-- QILY-DAILY-TERMINOLOGY:START -->
  <div class="checklist brief-terminology-audit" data-daily-terminology-audit="${date}"><strong>本期关联术语：</strong><a href="/knowledge/terminology.html?opl=RACI">RACI｜责任分工矩阵</a> · <a href="/knowledge/terminology.html?opl=PDCA">PDCA｜计划-执行-检查-改进</a>。点击进入中文诠释与单点培训课件。</div>
  <!-- QILY-DAILY-TERMINOLOGY:END -->

  <h3>1. 先把“职位、职责、职能、价值”四件事拆开</h3>
  <table class="rule-table balanced-cols compact-first-col">
    <thead><tr><th>层级</th><th>回答的问题</th><th>常见误区</th><th>高质量表达</th></tr></thead>
    <tbody>
      <tr><td>职位</td><td>你叫什么岗位？</td><td>把头衔当能力</td><td>只说明组织位置，不直接代表贡献</td></tr>
      <tr><td>职责</td><td>组织要求你做什么？</td><td>把任务清单当成果</td><td>明确责任对象、边界和交付物</td></tr>
      <tr><td>职能</td><td>这个岗位为什么存在？</td><td>只描述会议、报表、协调</td><td>解决哪类业务问题、建立哪类能力</td></tr>
      <tr><td>价值</td><td>最终改变了什么？</td><td>只说“已完成”</td><td>用PQCD、现金流、风险、周期、能力沉淀验证</td></tr>
    </tbody>
  </table>

  <div class="function-ladder" aria-label="职能含金量四级阶梯">
    <div><strong>L1｜事务执行</strong><span>接收任务、整理资料、转发问题、跟催节点。必要，但替代性高。</span></div>
    <div><strong>L2｜专业判断</strong><span>能识别异常、建立数据基线、分析原因并提出可行方案。</span></div>
    <div><strong>L3｜项目交付</strong><span>能跨部门推动Pilot、控制风险、拿到可验证结果并完成验收。</span></div>
    <div><strong>L4｜机制建设</strong><span>把一次性成功固化成标准、流程、数据规则和组织能力，并可复制。</span></div>
  </div>

  <h3>2. 真正高含金量的岗位，都跑得通这条“七步价值链”</h3>
  <div class="value-chain">
    <div><b>① 问题识别</b><small>差距、损失、约束</small></div>
    <div><b>② 数据基线</b><small>事实、口径、版本</small></div>
    <div><b>③ 方案设计</b><small>路径、边界、交付物</small></div>
    <div><b>④ 责任协同</b><small>RACI、资源、接口</small></div>
    <div><b>⑤ Pilot验证</b><small>小范围试点、风险受控</small></div>
    <div><b>⑥ 结果验收</b><small>PQCD、财务、证据</small></div>
    <div><b>⑦ 机制固化</b><small>SOP、OPL、稽核、复制</small></div>
  </div>
  <p>一个岗位如果长期只停留在①接收问题、④跟人协调，而②基线、③方案、⑤验证、⑥结果、⑦固化都没有能力独立承担，那么它的“忙碌度”可能很高，但职能含金量并不高。</p>
  <div class="brief-callout"><strong>关键判断：</strong>真正的专业岗位，不是“别人把问题定义好后，我负责执行”；而是能把模糊问题转化为可测量问题，把可测量问题转化为可执行方案，再把方案转化为可验收结果。</div>

  <h3>3. 制造企业七类岗位，含金量分别体现在哪里</h3>
  <table class="rule-table balanced-cols role-matrix">
    <thead><tr><th>职能</th><th>低含金量表现</th><th>高含金量表现</th><th>典型交付证据</th></tr></thead>
    <tbody>
      <tr><td>管理层</td><td>发指令、追进度、临时拍板</td><td>定义目标体系、阶段门、资源优先级和责任边界</td><td>经营目标、决策记录、项目组合、复盘机制</td></tr>
      <tr><td>IE／精益</td><td>做工时、画图、做活动</td><td>建立产能模型、损失结构、未来态并验证改善收益</td><td>标准工时、UPPH、VSM、线平衡、SMED、收益验证</td></tr>
      <tr><td>工程／PE/TE</td><td>救火、改参数、修治具</td><td>把技术问题转成稳定工艺能力与量产控制</td><td>工艺标准、DOE、治具方案、CT、良率、CPK</td></tr>
      <tr><td>质量</td><td>检验、开异常单、追8D</td><td>把风险前移到FMEA、控制计划、防错和过程能力</td><td>FMEA、CP、MSA、SPC、8D、防错验证</td></tr>
      <tr><td>PMC</td><td>排计划、催物料、追欠产</td><td>打通需求、产能、物料、交期、WIP和异常闭环</td><td>滚动计划、负荷率、齐套率、OTD、库存结构</td></tr>
      <tr><td>IT／数智化</td><td>上系统、做报表、维护账号</td><td>把流程、主数据、业务规则和现场执行打通</td><td>BOM、工艺、工时、接口、MES/ERP/APS闭环</td></tr>
      <tr><td>制造／运营</td><td>靠人盯、靠加班、靠经验</td><td>通过标准作业、节拍、异常响应与DMS稳定输出</td><td>SOP、OEE、FPY、小时产出、异常关闭率</td></tr>
    </tbody>
  </table>

  <h3>4. 一个制造现场案例：同样叫“提升产能”，职能含金量完全不同</h3>
  <p>假设某装配线当前UPPH为80，订单需求要求提升到95。低含金量做法是直接要求生产“加快动作、减少休息、每天追产量”；高含金量职能会先确认节拍、标准工时、瓶颈工位、线平衡率、换型损失、缺料等待、质量返工和人员配置，再决定改善路径。</p>
  <table class="rule-table balanced-cols compact-first-col">
    <thead><tr><th>步骤</th><th>高含金量动作</th><th>应形成的证据</th></tr></thead>
    <tbody>
      <tr><td>基线</td><td>确认UPPH=80的统计口径、波动范围和主要损失</td><td>CT、工时版本、OEE/停线、FPY、WIP</td></tr>
      <tr><td>诊断</td><td>识别瓶颈、失衡、动作浪费、物流等待和质量损失</td><td>线平衡图、VSM、损失Pareto、现场观察</td></tr>
      <tr><td>方案</td><td>ECRS、工位重组、工装改善、配送节奏、SMED或防错</td><td>未来态方案、责任清单、资源需求</td></tr>
      <tr><td>Pilot</td><td>小范围验证，不以牺牲质量、安全和设备寿命换表面产量</td><td>试点记录、风险清单、前后对比</td></tr>
      <tr><td>验收</td><td>UPPH、FPY、人员、WIP、LT同时达标</td><td>稳定周期数据、验收记录</td></tr>
      <tr><td>固化</td><td>更新标准工时、SOP、排线逻辑和培训机制</td><td>版本受控文件、OPL、稽核表、复制计划</td></tr>
    </tbody>
  </table>
  <p>如果最后UPPH真的从80稳定提升到95，但同时不良率上升、WIP增加、人员增加或者设备长期超负荷，那么这不是高含金量改善，只是把问题转移了位置。</p>

  <h3>5. 判断“职能含金量”，不要问他忙不忙，要问这六个问题</h3>
  <div class="checklist">
    <strong>① 他能不能独立定义问题？</strong> 不是只等别人派任务。<br>
    <strong>② 他能不能建立可信数据基线？</strong> 不是凭感觉判断。<br>
    <strong>③ 他能不能设计方案并说明边界？</strong> 不是只会提出口号。<br>
    <strong>④ 他能不能跨部门推动资源和责任？</strong> 不是把协调等同于转发信息。<br>
    <strong>⑤ 他能不能用结果和证据验收？</strong> 不是“做完了”就算结束。<br>
    <strong>⑥ 他能不能把成果固化并复制？</strong> 不是人一走，成果就消失。
  </div>

  <h3>6. 招聘、晋升和述职，建议统一改成“证据型表达”</h3>
  <p>“负责精益改善”“负责ERP/MES”“负责生产计划”“负责质量管理”这些句子信息量极低。更有含金量的表达必须同时说明：<strong>对象、问题、方法、职责、结果、证据</strong>。</p>
  <table class="rule-table balanced-cols">
    <thead><tr><th>低信息量表达</th><th>高信息量表达</th></tr></thead>
    <tbody>
      <tr><td>负责SMED改善</td><td>主导300T冲压设备大型模具换型改善，重构内外部作业、工具定置与准备节拍，换型时间由约14h降至约7h，并形成标准换型流程。</td></tr>
      <tr><td>负责标准工时</td><td>建立产品标准工时、标准产能、人机配置和版本管理规则，并关联PMC排程与ERP/MES基础数据。</td></tr>
      <tr><td>负责数字化</td><td>梳理订单—计划—工艺—工时—实绩—库存数据链，统一主数据口径并建立异常闭环和管理看板。</td></tr>
    </tbody>
  </table>

  <h3>7. 职能的最高级，不是“不可替代”，而是“让组织不再依赖个人”</h3>
  <p>很多人把岗位价值理解成“只有我会、离不开我”。这其实是组织风险。真正高级的职能，会把个人经验沉淀为规则、标准、数据、模型、流程和培训，使组织能力从“依赖一个能人”升级为“多数人按机制也能稳定做对”。</p>
  <div class="quote">低层次价值：事情离不开我。<br>高层次价值：我把事情做成系统以后，不必天天靠我。</div>
  <p><strong>最终结论：</strong>职能含金量不是岗位名称的光环，而是这个岗位能够独立处理多大复杂度的问题、形成多高质量的决策、交付多可验证的结果，以及留下多少可复制的组织能力。</p>
</article>
<section class="brief-feedback brief-message-only" data-brief-feedback data-brief-date="${date}" data-brief-title="${title}" data-brief-url="https://qilylean.com/qilylean/daily/${date}.html" aria-labelledby="briefMessageTitle"><div class="brief-feedback-heading"><span>MESSAGE / DISCUSSION</span><h2 id="briefMessageTitle">留言交流</h2><p>可就本期简报留下观点、疑问或建议；如需回复，可留下称谓与联系方式。</p></div><form class="brief-inline-message" data-brief-message-form><div class="brief-inline-message-heading"><strong>本期留言</strong><span>来源简报：${date}｜${title}</span></div><label>称谓（选填）<input name="name" autocomplete="name" maxlength="120" placeholder="怎么称呼你"></label><label>联系方式（选填）<input name="contact" autocomplete="email" maxlength="180" placeholder="需要回复时填写手机、微信或邮箱"></label><label class="full">留言内容<textarea name="message" minlength="4" maxlength="1800" required placeholder="写下你的观点、疑问、建议，或希望深入探讨的话题"></textarea></label><label class="brief-website-field" aria-hidden="true">网站<input name="website" tabindex="-1" autocomplete="off"></label><div class="brief-inline-message-actions"><button type="submit">提交留言</button><a href="/cooperation/">需要结合现场深入交流？进入合作咨询</a></div></form><div class="brief-feedback-status" data-brief-feedback-status role="status" aria-live="polite"></div><p class="brief-feedback-privacy">留言正文不会在公开页面展示，仅用于回复与后续交流。</p></section>
<nav class="brief-adjacent" aria-label="简报翻页"><a href="/qilylean/daily/2026-08-09.html">← 上一期</a><a class="directory" href="/qilylean/daily-insights.html">返回简报目录</a><span>已是最新一期</span></nav>
</div></section>
</main>
<script src="/qilylean/daily-feedback.js?v=20260729-message-only-v4"></script>
<script src="/homepage-music.js?v=20260810-demand-music-wrapper-v6"></script>
</body>
</html>`;
write(todayPath, page);

// Daily source metadata.
let briefs = JSON.parse(fs.readFileSync(dailyJsonPath, 'utf8'));
briefs = briefs.filter(x => x.date !== date);
briefs.unshift({ date, title, summary, dayNo: '', theme });
write(dailyJsonPath, JSON.stringify(briefs, null, 2));

// Directory promotion and counters.
let directory = fs.readFileSync(directoryPath, 'utf8');
directory = directory.replace(/2019-07-10—2026-08-09｜共2588期/g, '2019-07-10—2026-08-10｜共2589期');
directory = directory.replace(/当前显示全部 2588 期/g, '当前显示全部 2589 期');
directory = directory.replace(/<a href="\/qilylean\/daily\/2026-08-09\.html">打开最新简报<\/a>/g, '<a href="/qilylean/daily/2026-08-10.html">打开最新简报</a>');
directory = directory.replace(/brief-index-card latest/g, 'brief-index-card');
if (!directory.includes('data-brief-date="2026-08-10"')) {
  const anchor = '<div class="brief-months"><details class="brief-month" data-brief-month="2026-08" open><summary><span>2026年8月</span><b>9期</b></summary><div class="brief-grid">';
  assert(directory.includes(anchor), 'Cannot locate 2026-08 directory anchor');
  const card = `<article class="brief-index-card latest" data-brief-year="2026" data-brief-date="2026-08-10" data-brief-theme="${theme}" data-brief-title="${title}" data-brief-summary="${summary}" data-brief-search="2026-08-10 职能 含金量 岗位价值 项目交付 RACI PDCA IE 精益 工程 质量 PMC 数智化 Pilot 验收 机制固化"><div class="brief-index-meta"><time datetime="2026-08-10">2026-08-10</time><span>${theme}</span></div><h2><a href="/qilylean/daily/2026-08-10.html">${title}</a></h2><div class="brief-index-actions"><a class="brief-open" href="/qilylean/daily/2026-08-10.html">打开本期简报</a><button type="button" data-brief-url="https://qilylean.com/qilylean/daily/2026-08-10.html" data-brief-title="${title}">分享本期网址</button><span class="brief-share-status" aria-live="polite"></span></div></article>`;
  directory = directory.replace(anchor, anchor.replace('<b>9期</b>', '<b>10期</b>') + card);
} else {
  directory = directory.replace('<span>2026年8月</span><b>9期</b>', '<span>2026年8月</span><b>10期</b>');
}
write(directoryPath, directory);

// Previous brief navigation.
let prev = fs.readFileSync(previousPath, 'utf8');
prev = prev.replace(/<span>已是最新一期<\/span>/g, '<a href="/qilylean/daily/2026-08-10.html">下一期 →</a>');
write(previousPath, prev);

// Latest brief runtime fallback.
let latest = fs.readFileSync(latestBriefPath, 'utf8');
const replacement = `var releaseCandidate={\n  date:'2026-08-10',\n  theme:'${theme}',\n  title:'${title}',\n  summary:'${summary}',\n  href:'/qilylean/daily/2026-08-10.html'\n};`;
assert(/var releaseCandidate=\{[\s\S]*?\n\};/.test(latest), 'latest-brief releaseCandidate not found');
latest = latest.replace(/var releaseCandidate=\{[\s\S]*?\n\};/, replacement);
write(latestBriefPath, latest);

// Sitemap.
if (fs.existsSync(sitemapPath)) {
  let sitemap = fs.readFileSync(sitemapPath, 'utf8');
  if (!sitemap.includes('https://qilylean.com/qilylean/daily/2026-08-10.html')) {
    const anchor = '  <url><loc>https://qilylean.com/qilylean/daily/2026-08-09.html</loc>';
    assert(sitemap.includes(anchor), 'Cannot locate 2026-08-09 sitemap anchor');
    const entry = '  <url><loc>https://qilylean.com/qilylean/daily/2026-08-10.html</loc><lastmod>2026-08-10</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n';
    sitemap = sitemap.replace(anchor, entry + anchor);
    write(sitemapPath, sitemap);
  }
}

console.log('Published 2026-08-10 function-value brief and linked directory/navigation metadata.');
