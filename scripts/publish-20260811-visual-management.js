#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

const date = '2026-08-11';
const previousDate = '2026-08-10';
const theme = '目视化管理与现场闭环';
const title = '目视化不是把信息贴上墙：让状态可见、异常可判、责任可追、行动可闭环';
const summary = '制造现场的目视化不是多做几块看板、贴几张标签，而是把目标、现状、标准、异常、责任、时限与验证证据放到同一信息界面，让任何相关人员都能快速判断“现在是否正常、哪里异常、谁在处理、何时关闭”。';

const dailyDir = path.join(root, 'qilylean', 'daily');
const todayPath = path.join(dailyDir, `${date}.html`);
const previousPath = path.join(dailyDir, `${previousDate}.html`);
const directoryPath = path.join(root, 'qilylean', 'daily-insights.html');
const dailyJsonPath = path.join(dailyDir, 'index.json');
const latestBriefPath = path.join(root, 'qilylean', 'latest-brief.js');
const feedPath = path.join(dailyDir, 'feed.xml');
const assetPath = path.join(dailyDir, 'assets', '2026-08-11-01-visual-loop.svg');

function assert(ok, message){ if(!ok) throw new Error(message); }
function read(file){ return fs.readFileSync(file, 'utf8'); }
function write(file, content){
  fs.mkdirSync(path.dirname(file), {recursive:true});
  fs.writeFileSync(file, content.endsWith('\n') ? content : content + '\n', 'utf8');
}
function escapeAttr(value){ return String(value).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="520" viewBox="0 0 1200 520" role="img" aria-labelledby="t d">
<title id="t">目视化管理闭环</title><desc id="d">从目标标准到现状显示、异常判定、责任响应、验证关闭和标准更新的闭环。</desc>
<rect width="1200" height="520" rx="30" fill="#f7faf9"/>
<text x="600" y="64" text-anchor="middle" font-family="Arial,'Microsoft YaHei',sans-serif" font-size="30" font-weight="700" fill="#173f48">目视化管理不是展示，而是缩短“发现—判断—响应—关闭”的时间</text>
<g font-family="Arial,'Microsoft YaHei',sans-serif" text-anchor="middle">
<g><rect x="55" y="160" width="175" height="150" rx="20" fill="#ffffff" stroke="#b6d1cc" stroke-width="2"/><text x="142" y="210" font-size="22" font-weight="700" fill="#0f4b5a">① 目标/标准</text><text x="142" y="248" font-size="17" fill="#55706d">正常是什么</text><text x="142" y="278" font-size="17" fill="#55706d">阈值在哪里</text></g>
<g><rect x="285" y="160" width="175" height="150" rx="20" fill="#ffffff" stroke="#b6d1cc" stroke-width="2"/><text x="372" y="210" font-size="22" font-weight="700" fill="#0f4b5a">② 现状显示</text><text x="372" y="248" font-size="17" fill="#55706d">当前值/趋势</text><text x="372" y="278" font-size="17" fill="#55706d">更新时间</text></g>
<g><rect x="515" y="160" width="175" height="150" rx="20" fill="#fffaf1" stroke="#d6b675" stroke-width="2"/><text x="602" y="210" font-size="22" font-weight="700" fill="#76551d">③ 异常判定</text><text x="602" y="248" font-size="17" fill="#6d654f">差距/越界</text><text x="602" y="278" font-size="17" fill="#6d654f">影响等级</text></g>
<g><rect x="745" y="160" width="175" height="150" rx="20" fill="#ffffff" stroke="#b6d1cc" stroke-width="2"/><text x="832" y="210" font-size="22" font-weight="700" fill="#0f4b5a">④ 责任响应</text><text x="832" y="248" font-size="17" fill="#55706d">Owner/措施</text><text x="832" y="278" font-size="17" fill="#55706d">截止时间</text></g>
<g><rect x="975" y="160" width="175" height="150" rx="20" fill="#ffffff" stroke="#b6d1cc" stroke-width="2"/><text x="1062" y="210" font-size="22" font-weight="700" fill="#0f4b5a">⑤ 验证关闭</text><text x="1062" y="248" font-size="17" fill="#55706d">实绩/证据</text><text x="1062" y="278" font-size="17" fill="#55706d">标准更新</text></g>
<g fill="#8aa9a4" font-size="34"><text x="258" y="247">→</text><text x="488" y="247">→</text><text x="718" y="247">→</text><text x="948" y="247">→</text></g>
<path d="M1060 330 C1060 430 145 430 145 330" fill="none" stroke="#8aa9a4" stroke-width="3" stroke-dasharray="10 8"/>
<text x="600" y="405" font-size="19" font-weight="700" fill="#3f625f">关闭后的有效做法回写到标准，下一轮“正常/异常”判定才会更快、更准</text>
</g></svg>`;
write(assetPath, svg);

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
  <meta property="og:image" content="https://qilylean.com/qilylean/daily/assets/2026-08-11-01-visual-loop.svg">
  <meta property="og:site_name" content="QilyLean｜启力精益">
  <meta name="twitter:card" content="summary_large_image">
  <script data-qily-shell-bootstrap>(function(d){var e=d.documentElement;e.classList.add("qily-shell-pending");window.__qilyLeanRevealCurrentShell=function(){e.classList.remove("qily-shell-pending")};setTimeout(window.__qilyLeanRevealCurrentShell,180)})(document);</script>
  <link rel="stylesheet" href="/site-shell.css?v=20260729-no-old-flash-v1">
  <link id="qilyVisualScaleStylesheet" rel="stylesheet" href="/site-visual-scale-v1.css?v=20260729-hierarchy-v4">
  <link id="qilyWideLayoutStylesheet" rel="stylesheet" href="/site-wide-layout-v1.css?v=20260810-content-axis-v8">
  <link id="qilyTypographyStylesheet" rel="stylesheet" href="/site-typography-v1.css?v=20260729-hierarchy-v4">
  <link rel="stylesheet" href="/qilylean/daily-briefs.css?v=20260729-ranked-search-v12">
  <link id="qilyVisualClosureStylesheet" rel="stylesheet" href="/site-visual-closure-v1.css?v=20260804-sitewide-clarity-v2">
  <link id="qilyBoundaryLinksClosureStylesheet" rel="stylesheet" href="/site-visual-closure-v2.css?v=20260803-boundary-links-v2">
  <script defer data-qily-visual-closure-loader="v1" src="/site-visual-closure-v1.js?v=20260810-stable-layout-v5"></script>
  <script defer data-qily-boundary-links-loader="v2" src="/site-visual-closure-v2.js?v=20260803-boundary-links-v2"></script>
  <script defer src="/site-navigation.js?v=20260811-mobile-layout-v20"></script>
  <link id="qilyClosureBundleV24Stylesheet" rel="stylesheet" href="/site-closure-bundle-v24.css?v=20260810-footer-one-line-v25">
  <link id="qilyHeroPrimaryContrastStylesheet" rel="stylesheet" href="/site-hero-primary-contrast-v1.css?v=20260804-hero-primary-contrast-v1">
  <script defer id="qilyBackgroundMusicScript" data-qily-background-music="v27" src="/homepage-music-v5.js?v=20260810-gesture-music-v27"></script>
  <link id="qilyFooterStandardV28Stylesheet" rel="stylesheet" href="/site-footer-standard-v28.css?v=20260811-mobile-footer-linebreak-v34">
  <script defer id="qilyFooterStandardV28Script" data-qily-footer-standard="v34" src="/site-footer-standard-v28.js?v=20260811-mobile-footer-linebreak-v34"></script>
<style>
.visual-loop{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin:18px 0 26px}.visual-loop>div{padding:16px 12px;border:1px solid #d7e5e2;border-radius:15px;background:#f7faf9;text-align:center}.visual-loop b{display:block;color:#0f4b5a;margin-bottom:7px}.visual-loop span{display:block;color:#5c706e;line-height:1.55;font-size:14px}.brief-callout{margin:20px 0;padding:18px 20px;border-left:4px solid #caa15f;background:#f8fbfa;line-height:1.75}.visual-rule td:first-child{font-weight:800;color:#0f4b5a;white-space:nowrap}.signal-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:18px 0 26px}.signal-grid>div{padding:17px;border:1px solid #d7e5e2;border-radius:15px;background:#fff}.signal-grid strong{display:block;color:#0f4b5a;margin-bottom:8px}.signal-grid p{margin:0;color:#58706d;line-height:1.7}@media(max-width:820px){.visual-loop,.signal-grid{grid-template-columns:1fr 1fr}}@media(max-width:560px){.visual-loop,.signal-grid{grid-template-columns:1fr}}
</style>
</head>
<body class="module-page daily-single-page qily-pro-v24">
<header class="qily-site-header"><a class="qily-brand" href="/">QilyLean｜启力精益</a><nav class="site-nav" aria-label="网站导航"><a href="/">首页</a><a href="/knowledge/">知识分享</a></nav></header>
<main>
  <section class="daily-hero compact"><div class="daily-inner"><span>DAILY ENGINEERING BRIEF</span><h1>今日简报</h1><p>${date}｜${theme}</p></div></section>
  <section class="daily-single-section"><div class="daily-inner">
    <nav class="brief-adjacent top" aria-label="简报翻页"><a href="/qilylean/daily/${previousDate}.html">← 上一期</a><a class="directory" href="/qilylean/daily-insights.html">返回简报目录</a><span>已是最新一期</span></nav>
    <article class="post detailed" id="${date}">
      <div class="date">${date}｜${theme}</div>
      <h2>${title}</h2>
      <p>${summary}</p>
      <div class="quote">真正有效的目视化，不是“人人看得到”，而是“人人看得懂、知道是否异常、知道下一步由谁做什么”。</div>

      <section class="brief-one-point-training" data-one-point-training="v1">
        <div class="brief-one-point-heading"><span>SINGLE-POINT LESSON</span><h3>单点培训｜一块看板怎样才算真正可管理</h3><p>建议用于班前会、生产例会、工程改善例会或现场看板设计评审。先判断信息是否支持决策，再判断版式是否美观。</p></div>
        <div class="brief-one-point-grid">
          <div><strong>培训目标</strong><p>能用“目标—现状—差距—责任—时限—验证”六项检查任何现场看板。</p></div>
          <div><strong>核心口径</strong><p>目视化价值＝异常识别速度 × 信息可信度 × 响应闭环率，而不是图表数量。</p></div>
          <div><strong>现场动作</strong><p>随机指向一个异常，要求现场人员在30秒内说明状态、Owner、措施和截止时间。</p></div>
          <div><strong>使用边界</strong><p>颜色、图标和大屏只负责降低识别成本，不能替代真实数据、标准和责任机制。</p></div>
        </div>
        <div class="brief-one-point-interface"><strong>相关职能接口：</strong>生产维护现场状态，IE/工程定义标准和阈值，质量守住异常判定口径，PMC提供计划与交付信号，IT/MES保证数据同源与刷新时效，管理层负责升级规则。</div>
        <p class="brief-one-point-check"><strong>培训验收：</strong>任选一块现有看板，现场指出“什么是正常、哪里是异常、谁负责、何时关闭、用什么证据证明关闭”；缺一项就形成一个整改点。</p>
      </section>

      <!-- QILY-DAILY-TERMINOLOGY:START -->
      <div class="checklist brief-terminology-audit" data-daily-terminology-audit="${date}"><strong>本期关联术语：</strong><a href="/knowledge/terminology.html?opl=5W2H">5W2H｜问题与行动结构化</a> · <a href="/knowledge/terminology.html?opl=PDCA">PDCA｜计划-执行-检查-改进</a>。点击进入中文诠释与单点培训课件。</div>
      <!-- QILY-DAILY-TERMINOLOGY:END -->

      <h3>1. 目视化的第一目标：把“正常与异常”从经验判断变成共同语言</h3>
      <figure class="brief-scene-figure-v1"><img src="/qilylean/daily/assets/2026-08-11-01-visual-loop.svg" alt="目视化管理从目标标准到异常响应与验证关闭的闭环" width="1200" height="520" loading="eager" decoding="async"><figcaption><strong>场景简图 01｜目视化闭环：</strong>目标与标准决定“什么叫正常”；现状数据用于识别差距；异常一旦出现，必须同时出现Owner、措施、时限和关闭证据。</figcaption></figure>
      <div class="visual-loop" aria-label="目视化五步闭环">
        <div><b>① 标准</b><span>目标、阈值、节拍、版本</span></div><div><b>② 现状</b><span>实时值、趋势、更新时间</span></div><div><b>③ 异常</b><span>差距、越界、影响等级</span></div><div><b>④ 响应</b><span>Owner、措施、截止时间</span></div><div><b>⑤ 关闭</b><span>实绩、证据、标准更新</span></div>
      </div>
      <div class="brief-callout"><strong>判断原则：</strong>如果一块看板只能回答“发生了什么”，却不能回答“这是否异常、谁负责、下一步怎么办”，它仍然只是信息展示，不是管理工具。</div>

      <h3>2. 一块高质量现场看板，至少要有七类信息</h3>
      <table class="rule-table balanced-cols visual-rule">
        <thead><tr><th>信息层</th><th>必须回答</th><th>常见失效模式</th><th>推荐设计</th></tr></thead>
        <tbody>
          <tr><td>目标/标准</td><td>正常值、目标值、上下限是什么？</td><td>只有实绩，没有基准</td><td>目标与当前值同屏，不让读者自行回忆标准</td></tr>
          <tr><td>当前状态</td><td>现在处于什么状态？</td><td>数据过期却没有时间戳</td><td>显示数据日期、班次或刷新时间</td></tr>
          <tr><td>趋势</td><td>是在改善还是恶化？</td><td>只展示单点数字</td><td>保留必要趋势，避免过度图表化</td></tr>
          <tr><td>异常</td><td>偏差在哪里、影响多大？</td><td>所有数字一个视觉权重</td><td>异常优先突出，并写明判定阈值</td></tr>
          <tr><td>责任</td><td>谁是Owner、谁协同？</td><td>只写“相关部门”</td><td>落实到岗位/责任人，必要时用RACI</td></tr>
          <tr><td>行动</td><td>采取什么措施、何时完成？</td><td>只有问题，没有动作</td><td>用5W2H明确措施、时限和资源</td></tr>
          <tr><td>验证</td><td>怎样证明真正关闭？</td><td>勾选“完成”即结案</td><td>保留实绩、复验结果与标准更新证据</td></tr>
        </tbody>
      </table>

      <h3>3. 颜色不是装饰：视觉编码必须全现场同义</h3>
      <div class="signal-grid">
        <div><strong>先定义语义</strong><p>例如绿色＝正常、黄色＝预警、红色＝异常。不要同一颜色在不同看板表达不同含义。</p></div>
        <div><strong>不要只靠颜色</strong><p>同时配文字、图标或状态标签，避免色弱、打印或屏幕偏色导致信息丢失。</p></div>
        <div><strong>异常拥有最高权重</strong><p>正常信息应克制，异常信息才需要强提示；否则满屏高饱和颜色会让真正的异常被淹没。</p></div>
        <div><strong>减少视觉噪声</strong><p>边框、阴影、装饰图形不能抢占注意力。信息层级应服务“先看异常，再看原因和行动”。</p></div>
      </div>

      <h3>4. 数字化看板比纸质看板多一条底线：数据必须同源、可追溯</h3>
      <p>电子大屏、MES看板、BI驾驶舱解决的是刷新和汇总效率，但如果订单、工时、产能、质量、设备停机等数据来自不同版本，数字化只会把口径冲突放大。数智工厂的目视化应优先确认主数据、数据Owner、刷新频率、异常阈值和钻取路径。</p>
      <table class="rule-table balanced-cols compact-first-col">
        <thead><tr><th>检查项</th><th>合格标准</th><th>风险信号</th></tr></thead>
        <tbody>
          <tr><td>数据源</td><td>同一指标只有一个受控来源</td><td>Excel、ERP、MES三套数字互相解释</td></tr>
          <tr><td>刷新</td><td>刷新频率与管理节奏匹配，并显示时间戳</td><td>“实时看板”实际一天更新一次</td></tr>
          <tr><td>口径</td><td>公式、范围、版本有定义</td><td>完成率、OEE、UPPH不同部门算法不同</td></tr>
          <tr><td>钻取</td><td>异常可追到订单、工序、设备或责任单元</td><td>只能看到红灯，找不到异常明细</td></tr>
          <tr><td>闭环</td><td>异常进入责任、措施、时限和验证</td><td>大屏只显示问题，不承载处理状态</td></tr>
        </tbody>
      </table>

      <h3>5. 现场落地：用“30秒测试”评审每一块看板</h3>
      <ol class="numbered-list">
        <li><strong>10秒：</strong>能否立即看出当前是否正常？</li>
        <li><strong>再10秒：</strong>能否指出最重要的异常及其影响？</li>
        <li><strong>再10秒：</strong>能否说明Owner、措施、截止时间和验证方式？</li>
      </ol>
      <p>30秒仍无法完成，不要先怪现场人员“不会看板”，优先检查信息架构是否把目标、现状、异常和责任分散在不同区域，或者根本没有定义标准。</p>

      <div class="checklist"><strong>今日行动清单：</strong>选一块现场/办公室看板 → 删除纯装饰信息 → 补目标与阈值 → 标出数据更新时间 → 把异常与正常分层 → 异常绑定Owner与截止时间 → 增加验证证据 → 用30秒测试复核。</div>
      <div class="brief-callout"><strong>本期结论：</strong>目视化的专业度不取决于看板做得多漂亮，而取决于它能否缩短管理链路。最好的目视化，是让“看见问题”直接连接到“判断问题、响应问题、关闭问题和更新标准”。</div>
    </article>
    <nav class="brief-adjacent bottom" aria-label="简报翻页"><a href="/qilylean/daily/${previousDate}.html">← 上一期</a><a class="directory" href="/qilylean/daily-insights.html">返回简报目录</a><span>已是最新一期</span></nav>
  </div></section>
</main>
</body>
</html>`;
write(todayPath, page);

// Previous issue: expose the new next-issue link without touching any other content.
let previous = read(previousPath);
if (!previous.includes(`/qilylean/daily/${date}.html`)) {
  previous = previous.replace(/<span>已是最新一期<\/span>/g, `<a href="/qilylean/daily/${date}.html">下一期 →</a>`);
  write(previousPath, previous);
}

// JSON archive is the canonical compact dataset used by latest-card/search rebuilders.
let index = JSON.parse(read(dailyJsonPath));
index = index.filter(item => item.date !== date);
index.unshift({date, title, summary, dayNo:'', theme});
index.sort((a,b) => String(b.date).localeCompare(String(a.date)));
write(dailyJsonPath, JSON.stringify(index, null, 2));

// Latest-card fallback must be current even before network-loaded index.json returns.
let latestBrief = read(latestBriefPath);
const release = `var releaseCandidate={\n  date:'${date}',\n  theme:'${theme}',\n  title:'${title.replace(/'/g,"\\'")}',\n  summary:'${summary.replace(/'/g,"\\'")}',\n  href:'/qilylean/daily/${date}.html'\n};`;
assert(/var releaseCandidate=\{[\s\S]*?\n\};/.test(latestBrief), 'latest-brief releaseCandidate block not found');
latestBrief = latestBrief.replace(/var releaseCandidate=\{[\s\S]*?\n\};/, release);
write(latestBriefPath, latestBrief);

// Directory: prepend the new card to August 2026 and retire the prior `latest` marker.
let directory = read(directoryPath);
if (!directory.includes(`data-brief-date="${date}"`)) {
  directory = directory.replace('class="brief-index-card latest"', 'class="brief-index-card"');
  const card = `<article class="brief-index-card latest" data-brief-year="2026" data-brief-date="${date}" data-brief-theme="${escapeAttr(theme)}" data-brief-title="${escapeAttr(title)}" data-brief-summary="${escapeAttr(summary)}" data-brief-search="${escapeAttr(`${date} ${theme} ${title} ${summary}`)}">\n  <div class="brief-index-meta"><time datetime="${date}">${date}</time><span>${theme}</span></div>\n  <h2><a href="/qilylean/daily/${date}.html">${title}</a></h2>\n  <p>${summary}</p>\n  <a class="brief-open" href="/qilylean/daily/${date}.html">打开本期简报</a>\n</article>`;
  const monthRe = /(<details class="brief-month" data-brief-month="2026-08"[^>]*><summary><span>2026年8月<\/span><b>)(\d+)(期<\/b><\/summary><div class="brief-grid">)/;
  const match = directory.match(monthRe);
  assert(match, '2026-08 directory month block not found');
  directory = directory.replace(monthRe, (_, a, n, c) => `${a}${Number(n)+1}${c}${card}`);
}
// These visible fallbacks are also rebuilt by build-site-metadata.js; keep them correct immediately.
directory = directory.replace(/今日简报｜最新至\d{4}-\d{2}-\d{2}｜QilyLean/g, `今日简报｜最新至${date}｜QilyLean`);
directory = directory.replace(/<meta name="date" content="\d{4}-\d{2}-\d{2}">/, `<meta name="date" content="${date}">`);
directory = directory.replace(/<meta property="og:updated_time" content="[^"]+">/, `<meta property="og:updated_time" content="${date}T00:00:00+08:00">`);
directory = directory.replace(/2019-07-10—\d{4}-\d{2}-\d{2}｜共\d+期｜按月份收纳、最新优先/, `2019-07-10—${date}｜共2590期｜按月份收纳、最新优先`);
directory = directory.replace(/<a href="\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html">打开最新简报<\/a>/, `<a href="/qilylean/daily/${date}.html">打开最新简报</a>`);
directory = directory.replace(/data-initial-year="2026" data-initial-count="\d+" data-archive-count="\d+"/, 'data-initial-year="2026" data-initial-count="223" data-archive-count="2590"');
directory = directory.replace(/当前加载 2026 年 \d+ 期；搜索覆盖全部 \d+ 期/, '当前加载 2026 年 223 期；搜索覆盖全部 2590 期');
write(directoryPath, directory);

// RSS: publish newest item, maintain a 30-item window, and align archive total.
let feed = read(feedPath);
if (!feed.includes(`/qilylean/daily/${date}.html`)) {
  const items = feed.match(/\n    <item>[\s\S]*?\n    <\/item>/g) || [];
  if (items.length >= 30) feed = feed.replace(items[items.length-1], '');
  const item = `\n    <item>\n      <title>${title}</title>\n      <link>https://qilylean.com/qilylean/daily/${date}.html</link>\n      <guid isPermaLink="true">https://qilylean.com/qilylean/daily/${date}.html</guid>\n      <category>${theme}</category>\n      <description>${summary}</description>\n    </item>`;
  feed = feed.replace(/\n    <item>/, `${item}\n    <item>`);
}
feed = feed.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, '<lastBuildDate>Mon, 10 Aug 2026 16:00:00 GMT</lastBuildDate>');
feed = feed.replace(/<!-- 当前知识档案总量：\d+；RSS仅提供最新30条。 -->/, '<!-- 当前知识档案总量：2590；RSS仅提供最新30条。 -->');
write(feedPath, feed);

assert(read(todayPath).includes(title), 'today page title missing');
assert(read(todayPath).includes('5W2H｜问题与行动结构化'), '5W2H terminology link missing');
assert(read(todayPath).includes('PDCA｜计划-执行-检查-改进'), 'PDCA terminology link missing');
assert(read(directoryPath).includes(`data-brief-date="${date}"`), 'directory card missing');
assert(JSON.parse(read(dailyJsonPath))[0].date === date, 'daily index latest date mismatch');
assert(read(latestBriefPath).includes(`date:'${date}'`), 'latest brief fallback mismatch');
assert(read(previousPath).includes(`/qilylean/daily/${date}.html`), 'previous issue next-link missing');
assert(read(feedPath).includes(`/qilylean/daily/${date}.html`), 'RSS item missing');

console.log(`Published ${date}: ${title}`);
