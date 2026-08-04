#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const HOME = 'index.html';
const COOPERATION = 'cooperation/index.html';
const DAILY = 'qilylean/daily-insights.html';
const IA_CSS = '/site-information-architecture-v1.css?v=20260802-static-source-v2';
const STATIC_INTERACTIONS = '/site-static-core-interactions-v1.js?v=20260803-static-text-lock-v4';
const ARCHIVE_DESCRIPTION = 'QilyLean今日简报历史知识档案，按2019年7月10日至今的制造实践时间轴持续整理；每个日期对应独立知识档案网址，页面日期用于档案排序与主题定位，不等同于网页首次公开发布日期。';

function filePath(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath) {
  return fs.readFileSync(filePath(relativePath), 'utf8');
}

function write(relativePath, content) {
  const target = filePath(relativePath);
  const normalized = content.endsWith('\n') ? content : `${content}\n`;
  if (fs.existsSync(target) && fs.readFileSync(target, 'utf8') === normalized) return false;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, normalized, 'utf8');
  return true;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function markerExpression(start, end) {
  return new RegExp(`<!-- ${escapeRegExp(start)} -->[\\s\\S]*?<!-- ${escapeRegExp(end)} -->`, 'm');
}

function extractMarker(content, start, end) {
  const match = content.match(markerExpression(start, end));
  return match ? match[0] : '';
}

function removeMarker(content, start, end) {
  return content.replace(markerExpression(start, end), '');
}

function replaceOrInsertMarker(content, start, end, block, anchor, placement = 'before') {
  const expression = markerExpression(start, end);
  if (expression.test(content)) return content.replace(expression, block);
  if (!content.includes(anchor)) throw new Error(`Missing anchor for ${start}: ${anchor}`);
  return placement === 'after'
    ? content.replace(anchor, `${anchor}\n${block}`)
    : content.replace(anchor, `${block}\n${anchor}`);
}

function upsertTitle(html, value) {
  const tag = `<title>${escapeHtml(value)}</title>`;
  return /<title>[\s\S]*?<\/title>/i.test(html)
    ? html.replace(/<title>[\s\S]*?<\/title>/i, tag)
    : html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function upsertNamedMeta(html, name, value) {
  const tag = `<meta name="${escapeHtml(name)}" content="${escapeHtml(value)}">`;
  const expression = new RegExp(`<meta\\s+[^>]*name=["']${escapeRegExp(name)}["'][^>]*>`, 'i');
  return expression.test(html) ? html.replace(expression, tag) : html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function upsertPropertyMeta(html, property, value) {
  const tag = `<meta property="${escapeHtml(property)}" content="${escapeHtml(value)}">`;
  const expression = new RegExp(`<meta\\s+[^>]*property=["']${escapeRegExp(property)}["'][^>]*>`, 'i');
  return expression.test(html) ? html.replace(expression, tag) : html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function upsertStylesheet(html, id, href) {
  const tag = `<link id="${id}" rel="stylesheet" href="${href}">`;
  const expression = new RegExp(`<link\\s+[^>]*id=["']${escapeRegExp(id)}["'][^>]*>`, 'i');
  if (expression.test(html)) return html.replace(expression, tag);
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function upsertScript(html, id, src) {
  const tag = `<script id="${id}" defer src="${src}"></script>`;
  const expression = new RegExp(`<script\\s+[^>]*id=["']${escapeRegExp(id)}["'][^>]*>[\\s\\S]*?<\/script>`, 'i');
  if (expression.test(html)) return html.replace(expression, tag);
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function addBodyClasses(html, classes) {
  return html.replace(/<body([^>]*)>/i, (tag, attrs) => {
    const classMatch = attrs.match(/class=["']([^"']*)["']/i);
    const current = classMatch ? classMatch[1].split(/\s+/).filter(Boolean) : [];
    const merged = Array.from(new Set([...current, ...classes]));
    if (classMatch) return `<body${attrs.replace(classMatch[0], `class="${merged.join(' ')}"`)}>`;
    return `<body${attrs} class="${merged.join(' ')}">`;
  });
}

function buildHomeCommercialBlock() {
  return `<!-- QILY-HOME-STATIC-COMMERCIAL:START -->
<section class="qily-ia-section" id="qily-core-services" data-qily-static-source="home-core-v1">
  <div class="qily-ia-inner">
    <div class="qily-ia-heading"><span class="qily-ia-kicker">CORE BUSINESS｜首页只保留客户首先需要理解的内容</span><h2>三类核心业务</h2><p>先说明解决什么问题、交付什么资产，再逐层展示个人履历、方法体系和知识沉淀。</p></div>
    <div class="qily-ia-grid">
      <article class="qily-ia-card"><small>CORE SERVICE 01</small><h3>新工厂／新产线规划</h3><p>从产品、工艺、产能、设备、物流、公辅、品质和扩展边界出发，形成可评审、可实施的规划资产。</p><div class="qily-ia-result">产能模型、Layout、物流与库位、公辅接口、实施路线图</div></article>
      <article class="qily-ia-card"><small>CORE SERVICE 02</small><h3>精益改善项目交付</h3><p>以质量为贯穿主线，围绕VSM、标准工时、线平衡、SMED、OEE、质量防错和计划实绩闭环，先验证合格产出，再固化效率、成本与交付改善。</p><div class="qily-ia-result">基线诊断、Pilot方案、改善数据、标准文件、结案验收</div></article>
      <article class="qily-ia-card"><small>CORE SERVICE 03</small><h3>目视化项目设计与实施</h3><p>把区域、状态、责任、标准和异常转化为现场共同语言，兼顾设计、材料、施工协同和验收。</p><div class="qily-ia-result">现场勘查、设计图、材料预算、打样、实施清单与验收</div></article>
    </div>
    <div class="qily-ia-actions"><a class="qily-ia-button primary" href="/cooperation/">进入项目合作</a><a class="qily-ia-button" href="/cooperation/#services">查看交付资产与合同范本</a></div>
  </div>
</section>
<section class="qily-ia-section qily-ia-alt" id="qily-home-proof" data-qily-static-source="home-proof-v1">
  <div class="qily-ia-inner">
    <div class="qily-ia-heading"><span class="qily-ia-kicker">WHY QILYLEAN｜证据与交易边界</span><h2>先看交付逻辑，再看专业深度</h2><p>不以资质徽章堆砌信任，而以真实项目、脱敏佐证、合同交付资产、阶段节点及验收规则建立可核验的合作基础。</p></div>
    <div class="qily-ia-delivery-summary">
      <article><strong>专业基础</strong><span>20年制造工程、工业工程与精益改善实践；详细年限和岗位归入履历主线。</span></article>
      <article><strong>项目证据</strong><span>代表项目按已核定、已验证、阶段估算和经验陈述分级展示。</span></article>
      <article><strong>交易机制</strong><span>三类核心业务均设置交付物、项目阶段、合同范本、付款节点和验收边界。</span></article>
      <article><strong>责任边界</strong><span>网页用于沟通与能力说明，正式范围、费用、税费、周期和验收以合同为准。</span></article>
    </div>
    <div class="qily-ia-actions"><a class="qily-ia-button primary" href="/projects/">代表项目</a><a class="qily-ia-button" href="/trust/">诚信与责任边界</a><a class="qily-ia-button" href="/projects/qilylean-commercial-deliveries/">商业交付档案</a></div>
  </div>
</section>
<!-- QILY-HOME-STATIC-COMMERCIAL:END -->`;
}

function buildHomeTail(latestBlock, assistantPanel) {
  const latest = latestBlock || '';
  const assistant = assistantPanel || '';
  return `<!-- QILY-HOME-STATIC-TAIL:START -->
${latest}
<section class="qily-ia-section qily-ia-dark qily-ai-secondary" id="qily-home-ai" data-qily-static-source="home-ai-v1">
  <div class="qily-ia-inner">
    <div class="qily-ia-heading"><span class="qily-ia-kicker">SECONDARY TOOL｜专业交流辅助入口</span><h2>QilyLean AI对话</h2><p>用于快速了解能力、项目和知识内容；AI回答不替代现场调查、正式方案、合同约定或专业审批。</p></div>
    ${assistant}
  </div>
</section>
<section class="qily-ia-section qily-ia-alt" id="qily-more-context" data-qily-static-source="home-context-v1">
  <div class="qily-ia-inner">
    <div class="qily-ia-heading"><span class="qily-ia-kicker">FURTHER CONTEXT｜进一步了解</span><h2>个人信息与知识资产各归其位</h2><p>保留全部有价值内容，但不再让个人标签、工具和知识数量遮挡客户最关心的服务、交付与验收。</p></div>
    <div class="qily-ia-secondary-links">
      <a class="qily-ia-secondary-link" href="/capabilities/">能力画像<span>专业标签、方法体系、数字工具与佐证</span></a>
      <a class="qily-ia-secondary-link" href="/experience/">履历主线<span>任职年限、岗位职责与行业经历</span></a>
      <a class="qily-ia-secondary-link" href="/knowledge/">知识分享<span>简报、术语、程序文件与参考资料</span></a>
      <a class="qily-ia-secondary-link" href="/ai.html">QilyLean AI<span>制造改善知识交流与站内导航</span></a>
      <a class="qily-ia-secondary-link" href="/moments.html">行走印记<span>工作现场、团队同行与生活记录</span></a>
    </div>
  </div>
</section>
<!-- QILY-HOME-STATIC-TAIL:END -->`;
}

function buildHomeSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'QilyLean｜启力精益',
        url: 'https://qilylean.com/',
        description: '面向制造企业的新工厂与新产线规划、精益改善项目交付及目视化项目设计实施专业窗口。'
      },
      {
        '@type': 'Person',
        name: '丁启利',
        url: 'https://qilylean.com/',
        jobTitle: '制造改善与精益工程实践者',
        knowsAbout: ['新工厂规划', '精益改善', '工业工程', 'VSM', '标准工时', 'OEE', 'SMED', '目视化管理', 'ERP/MES/APS']
      },
      {
        '@type': 'Service',
        name: 'QilyLean制造改善项目交付',
        provider: { '@type': 'Person', name: '丁启利' },
        areaServed: '中国',
        serviceType: ['新工厂／新产线规划', '精益改善项目交付', '目视化项目设计与实施']
      }
    ]
  };
  return `<!-- QILY-HOME-STATIC-SCHEMA:START -->
<script type="application/ld+json">${JSON.stringify(data)}</script>
<!-- QILY-HOME-STATIC-SCHEMA:END -->`;
}

function normalizeLatestBlock(block) {
  if (!block) return '';
  return block
    .replace(/<section class="section(?: qily-ia-secondary-section)?" id="latest-content"/, '<section class="section qily-ia-secondary-section" id="latest-content" data-qily-static-source="home-latest-v1"')
    .replace(/<h2>[^<]*<\/h2>/, '<h2>知识资产与持续更新</h2>')
    .replace(/<div class="head"><h2>知识资产与持续更新<\/h2><p>[\s\S]*?<\/p><\/div>/, '<div class="head"><h2>知识资产与持续更新</h2><p>简报、术语、程序文件和参考资料用于展示持续学习与方法沉淀，不与三大核心商业服务争夺首页主视觉。</p></div>');
}

function normalizeResults(html) {
  const expression = /<section class="section(?: qily-ia-secondary-section)?" id="results">[\s\S]*?<\/section>/m;
  const match = html.match(expression);
  if (!match) throw new Error('Homepage results section missing');
  let block = match[0]
    .replace(/<section class="section(?: qily-ia-secondary-section)?" id="results">/, '<section class="section qily-ia-secondary-section" id="results" data-qily-static-source="home-results-v1">')
    .replace(/<h2>关键成果速览<\/h2>/, '<h2>更多职业成果与方法积累</h2>')
    .replace(/<p>以制造场景、改善方法、项目结果和机制沉淀为主线，快速呈现职业价值。<\/p>/, '<p>首页仅显示部分代表性结果；完整项目背景、角色边界、数据口径和佐证材料统一归入代表项目与能力画像。</p>')
    .replace(/<button[^>]*data-qily-results-toggle[^>]*>[\s\S]*?<\/button>/g, '');
  block = block.replace(/<\/div>\s*<\/section>\s*$/, '<button class="qily-ia-button qily-results-toggle" type="button" data-qily-results-toggle aria-expanded="false">展开全部成果概览</button></div></section>');
  return html.replace(expression, block);
}

function materializeHome() {
  let html = read(HOME);
  const oldTail = extractMarker(html, 'QILY-HOME-STATIC-TAIL:START', 'QILY-HOME-STATIC-TAIL:END');
  const assistantExpression = /<section class="assistant-panel" id="assistant">[\s\S]*?<\/section>/m;
  const assistantMatch = (oldTail || html).match(assistantExpression);
  if (!assistantMatch) throw new Error('Homepage assistant panel missing');
  const assistantPanel = assistantMatch[0];

  const oldLatest = extractMarker(oldTail || html, 'SITE-METADATA:HOME-LATEST:START', 'SITE-METADATA:HOME-LATEST:END');
  if (!oldLatest) throw new Error('Homepage latest-content marker missing');
  const latestBlock = normalizeLatestBlock(oldLatest);

  html = removeMarker(html, 'QILY-HOME-STATIC-COMMERCIAL:START', 'QILY-HOME-STATIC-COMMERCIAL:END');
  html = removeMarker(html, 'QILY-HOME-STATIC-TAIL:START', 'QILY-HOME-STATIC-TAIL:END');
  html = removeMarker(html, 'SITE-METADATA:HOME-LATEST:START', 'SITE-METADATA:HOME-LATEST:END');
  html = html.replace(assistantExpression, '');

  html = upsertTitle(html, 'QilyLean｜新工厂规划、精益改善与目视化项目交付');
  html = upsertNamedMeta(html, 'description', 'QilyLean由丁启利发起，面向制造企业提供新工厂与新产线规划、精益改善项目及目视化实施协同；以现场诊断、交付资产、分阶段节点和验收闭环为主线。');
  html = upsertPropertyMeta(html, 'og:title', 'QilyLean｜制造改善项目交付');
  html = upsertPropertyMeta(html, 'og:description', '把复杂制造问题转化为可测量、可验证、可交付的改善项目；聚焦新工厂规划、精益改善与目视化实施。');
  html = upsertNamedMeta(html, 'twitter:description', 'QilyLean聚焦新工厂规划、精益改善项目交付与目视化实施，以交付资产、阶段付款和验收闭环定义合作。');
  html = upsertStylesheet(html, 'qilyInformationArchitectureStylesheet', IA_CSS);
  html = upsertScript(html, 'qilyStaticCoreInteractions', STATIC_INTERACTIONS);
  html = addBodyClasses(html, ['qily-ia-ready', 'qily-home-commercial-focus']);

  html = html.replace(/<span class="eyebrow">[\s\S]*?<\/span>/, '<span class="eyebrow">制造改善项目交付｜新工厂规划｜精益改善｜目视化实施</span>');
  html = html.replace(/<h1>[\s\S]*?<\/h1>\s*<p class="lead">[\s\S]*?<\/p>/, `<h1>把复杂制造问题，转化为可验证的交付结果</h1>
          <p class="qily-founder-line">丁启利｜制造工程、工业工程与精益改善项目实践者</p>
          <p class="lead">QilyLean｜启力精益由丁启利发起，依托20年制造工程与精益改善实践，为制造企业提供三类核心服务。项目以现场诊断、范围确认、方案设计、Pilot验证、标准固化和验收闭环推进；具体交付物、周期、费用、分阶段付款比例与验收条件以对应合同及正式约定为准。</p>
          <p class="qily-home-relocation-note">专业标签已归入<a href="/capabilities/">能力画像</a>，任职年限与岗位历程已归入<a href="/experience/">履历主线</a>，量化成果与证据归入<a href="/projects/">代表项目</a>。</p>`);
  html = html.replace(/\s*<div class="group-label">职能标签<\/div>\s*<ul class="tags">[\s\S]*?<\/ul>/m, '');
  html = html.replace(/<div class="actions">[\s\S]*?<\/div>/m, '<div class="actions"><a class="button primary" href="/cooperation/">查看三大核心业务与交付</a><a class="button" href="/cooperation/#diagnosis">预约60分钟问题初筛</a><a class="button" href="/projects/">核验代表项目与证据</a></div>');
  html = html.replace(/<figcaption class="portrait-badge">[\s\S]*?<\/figcaption>/m, '<figcaption class="portrait-badge"><div><strong>20年</strong><span>制造工程与精益改善实践</span></div><div><strong>合同闭环</strong><span>范围、交付、付款与验收分阶段明确</span></div></figcaption>');

  const heroExpression = /<section class="hero">[\s\S]*?<\/section>/m;
  const heroMatch = html.match(heroExpression);
  if (!heroMatch) throw new Error('Homepage hero section missing after assistant extraction');
  html = html.replace(heroMatch[0], `${heroMatch[0]}\n${buildHomeCommercialBlock()}`);

  html = normalizeResults(html);
  const tail = buildHomeTail(latestBlock, assistantPanel);
  const cumulativeAnchor = '<!-- QILY-CUMULATIVE-CONTRIBUTION-DISCLOSURE:START -->';
  html = html.includes(cumulativeAnchor)
    ? html.replace(cumulativeAnchor, `${tail}\n${cumulativeAnchor}`)
    : html.replace(/<\/main>/i, `${tail}\n</main>`);

  const schema = buildHomeSchema();
  html = replaceOrInsertMarker(html, 'QILY-HOME-STATIC-SCHEMA:START', 'QILY-HOME-STATIC-SCHEMA:END', schema, '</head>', 'before');
  write(HOME, html);
}

function buildCooperationSummary() {
  return `<!-- QILY-COOPERATION-STATIC-SUMMARY:START -->
<section class="qily-ia-section qily-ia-alt" id="qily-commercial-summary" data-qily-static-source="cooperation-summary-v1">
  <div class="qily-ia-inner">
    <div class="qily-ia-heading"><span class="qily-ia-kicker">COMMERCIAL SUMMARY｜无需先读完整PDF也能理解</span><h2>交付、付款与验收一页看懂</h2><p>合同范本已明确交付资产和分阶段付款机制；本摘要把客户最关心的交易逻辑前置，完整条款仍以对应合同为准。</p></div>
    <div class="qily-ia-delivery-summary">
      <article><strong>交付资产</strong><span>诊断纪要、数据基线、图纸／模型、方案、清单、标准文件、培训或验收材料，按业务合同列明。</span></article>
      <article><strong>项目阶段</strong><span>通常按范围确认、启动、阶段成果、评审优化、最终交付与验收关闭推进。</span></article>
      <article><strong>分阶段付款</strong><span>付款比例、金额和触发条件已在对应合同范本中设置，正式项目以双方签署合同为准。</span></article>
      <article><strong>验收边界</strong><span>以约定交付物、版本、数据口径、评审记录和关闭条件验收，不以口头印象替代。</span></article>
    </div>
    <div class="qily-ia-boundary"><strong>交易提示：</strong>不同项目复杂度、周期和协作边界不同，不在网页统一承诺固定收益、固定周期或统一付款比例；网页范本用于前期沟通，正式合同具有优先效力。</div>
  </div>
</section>
<!-- QILY-COOPERATION-STATIC-SUMMARY:END -->`;
}

function materializeCooperation() {
  let html = read(COOPERATION);
  html = removeMarker(html, 'QILY-COOPERATION-STATIC-SUMMARY:START', 'QILY-COOPERATION-STATIC-SUMMARY:END');
  html = upsertStylesheet(html, 'qilyInformationArchitectureStylesheet', IA_CSS);
  html = addBodyClasses(html, ['qily-ia-ready']);
  html = html
    .replace(/超千万元累计项目改善收益/g, '职业生涯累计改善贡献超千万元*（含本人参与、主导、组织推进及跨部门团队共同成果；非QilyLean品牌独立营收）')
    .replace(/超千万元累计改善收益/g, '职业生涯累计改善贡献超千万元*（含本人参与、主导、组织推进及跨部门团队共同成果；非QilyLean品牌独立营收）');
  const heroExpression = /<section class="module-hero">[\s\S]*?<\/section>/m;
  const heroMatch = html.match(heroExpression);
  if (!heroMatch) throw new Error('Cooperation hero section missing');
  html = html.replace(heroMatch[0], `${heroMatch[0]}\n${buildCooperationSummary()}`);
  write(COOPERATION, html);
}

function buildArchiveSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'QilyLean今日简报｜历史制造实践知识档案',
    url: 'https://qilylean.com/qilylean/daily-insights.html',
    description: ARCHIVE_DESCRIPTION,
    isPartOf: { '@type': 'WebSite', name: 'QilyLean｜启力精益', url: 'https://qilylean.com/' },
    temporalCoverage: '2019-07-10/..',
    publishingPrinciples: 'https://qilylean.com/trust/#publication'
  };
  return `<!-- QILY-ARCHIVE-STATIC-SCHEMA:START -->
<script type="application/ld+json">${JSON.stringify(schema)}</script>
<!-- QILY-ARCHIVE-STATIC-SCHEMA:END -->`;
}

function buildArchiveDisclosure() {
  return `<!-- QILY-ARCHIVE-DISCLOSURE:START -->
<div class="qily-archive-disclosure" role="note" data-qily-static-source="daily-archive-v1" style="margin:16px 0 22px;padding:16px 18px;border-left:5px solid #caa15f;color:#315f64;background:#eef8f6;line-height:1.8">
<strong>归档口径说明：</strong>按2019年7月10日至今的制造实践时间轴持续整理，每个日期对应一个独立知识档案网址；页面日期用于知识档案排序与主题定位，<strong>不等同于网页首次公开发布日期</strong>。历史内容可能依据原始记录、事实核验和当前标准持续修订，以当前页面与全站同步版本为准。 <a href="/trust/#publication">查看完整说明</a>
</div>
<!-- QILY-ARCHIVE-DISCLOSURE:END -->`;
}

function materializeDaily() {
  let html = read(DAILY);
  if (!html.trim()) throw new Error('Daily archive HTML is empty');
  html = upsertNamedMeta(html, 'description', ARCHIVE_DESCRIPTION);
  html = upsertNamedMeta(html, 'twitter:description', ARCHIVE_DESCRIPTION);
  html = upsertPropertyMeta(html, 'og:description', ARCHIVE_DESCRIPTION);
  html = html.replace(/自2019年7月10日起[^<。]*每一天[^<。]*独立网址[^<。]*[。]?/g, '按2019年7月10日至今的制造实践时间轴持续整理，每个日期对应一个独立知识档案网址；页面日期不等同于网页首次公开发布日期。');
  const disclosure = buildArchiveDisclosure();
  html = replaceOrInsertMarker(html, 'QILY-ARCHIVE-DISCLOSURE:START', 'QILY-ARCHIVE-DISCLOSURE:END', disclosure, '<h2>简报目录</h2>', 'after');
  const schema = buildArchiveSchema();
  html = replaceOrInsertMarker(html, 'QILY-ARCHIVE-STATIC-SCHEMA:START', 'QILY-ARCHIVE-STATIC-SCHEMA:END', schema, '</head>', 'before');
  write(DAILY, html);
}

function validate() {
  const home = read(HOME);
  const cooperation = read(COOPERATION);
  const daily = read(DAILY);
  const oldClaims = /超千万元累计(?:项目)?改善收益/;

  const requiredHome = [
    'QILY-HOME-STATIC-COMMERCIAL:START',
    'data-qily-static-source="home-core-v1"',
    '把复杂制造问题，转化为可验证的交付结果',
    '新工厂／新产线规划',
    '精益改善项目交付',
    '目视化项目设计与实施',
    'qilyInformationArchitectureStylesheet',
    'qilyStaticCoreInteractions'
  ];
  requiredHome.forEach((value) => { if (!home.includes(value)) throw new Error(`Homepage static source missing: ${value}`); });
  if (/class="group-label">职能标签/.test(home) || /<ul class="tags">/.test(home)) throw new Error('Legacy homepage tag wall remains in static HTML');
  if (/<section class="assistant-panel" id="assistant">/.test(home.split('QILY-HOME-STATIC-COMMERCIAL:START')[0])) throw new Error('AI assistant still occupies the static hero');
  if (oldClaims.test(home + cooperation)) throw new Error('Legacy unqualified cumulative-benefit wording remains');
  if (!cooperation.includes('QILY-COOPERATION-STATIC-SUMMARY:START') || !cooperation.includes('分阶段付款') || !cooperation.includes('验收边界')) throw new Error('Cooperation static transaction summary missing');
  if (!daily.includes('QILY-ARCHIVE-DISCLOSURE:START') || !daily.includes('QILY-ARCHIVE-STATIC-SCHEMA:START') || !daily.includes('不等同于网页首次公开发布日期')) throw new Error('Daily archive static disclosure incomplete');
}

function main() {
  materializeHome();
  materializeCooperation();
  materializeDaily();
  validate();
  process.stdout.write('Materialized QilyLean core commercial, trust, payment, acceptance and archive content into final static HTML.\n');
}

main();
