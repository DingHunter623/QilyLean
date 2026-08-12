#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const buildDate = process.env.QILY_BUILD_DATE || new Date().toISOString().slice(0, 10);
const siteDataFile = path.join(root, 'qilylean', 'site-data.json');
const searchIndexFile = path.join(root, 'qilylean', 'site-search-index.json');
const trustFile = path.join(root, 'trust', 'index.html');
const cooperationFile = path.join(root, 'cooperation', 'index.html');
const homeFile = path.join(root, 'index.html');
const siteSearchFile = path.join(root, 'site-search.js');
const dailyIndexFile = path.join(root, 'qilylean', 'daily', 'index.json');
const sitemapFiles = ['sitemap.xml', 'sitemap-core.xml'].map((name) => path.join(root, name));
const interactionClosureBlock = `<!-- QILY-NUMBER-BADGE-CONTRAST:START -->
  <link id="qilyNumberBadgeContrastStylesheet" rel="stylesheet" href="/site-number-badge-contrast-v1.css?v=20260805-number-badge-contrast-v1">
  <link id="qilyInteractiveHoverContrastStylesheet" rel="stylesheet" href="/site-interactive-hover-contrast-v1.css?v=20260810-stable-layout-v15">
  <link id="qilyLayoutFooterClosureStylesheet" rel="stylesheet" href="/site-layout-footer-closure-v1.css?v=20260812-runtime-stability-v20">
<!-- QILY-NUMBER-BADGE-CONTRAST:END -->`;

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function writeIfChanged(file, content) {
  const normalized = content.endsWith('\n') ? content : `${content}\n`;
  const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (current === normalized) return false;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, normalized);
  return true;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function decodeHtml(value) {
  return String(value)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function capture(value, expression) {
  const match = String(value).match(expression);
  return match ? match[1] : '';
}

function upsertBlock(page, startMarker, endMarker, block, insertBefore) {
  const start = page.indexOf(startMarker);
  const end = page.indexOf(endMarker);
  if (start >= 0 && end > start) {
    return `${page.slice(0, start)}${block}${page.slice(end + endMarker.length)}`;
  }
  const position = page.indexOf(insertBefore);
  if (position < 0) throw new Error(`Cannot insert generated block before: ${insertBefore}`);
  return `${page.slice(0, position)}${block}\n\n${page.slice(position)}`;
}

function loadSiteData() {
  const data = JSON.parse(read(siteDataFile));
  data.compliance = {
    brandNature: '丁启利发起并运营的个人专业品牌与制造改善实践平台',
    separateLegalEntity: false,
    defaultContractingParty: '丁启利（自然人）',
    contractRule: '若具体项目由依法登记的企业、工作室或合作机构签约，以正式报价、合同首页、盖章／电子签署主体、收款账户及发票信息所载主体为准。',
    pricingRule: '网站服务说明与价格信息用于合作沟通和范围评估，不构成不可撤销要约；正式范围、费用、周期、税费、差旅及验收标准以合同为准。',
    paymentRule: '仅向正式合同或双方书面确认文件载明的账户付款；变更收款账户时须通过官网公开联系方式复核。',
    dataRule: '客户资料按必要、最小化和保密原则使用；涉及客户名称、工艺、成本、经营数据及人员信息的材料，仅在授权范围内处理。',
    evidenceRule: '已核定值、阶段性估算值、团队成果与个人职责分别标注，不将预测收益表述为已实现收益。',
    evidenceLevelRule: '公开成果采用A已核定、B已验证、C阶段估算、D经验陈述四级口径；该分级是QilyLean内部披露规则，不是第三方认证。',
    publicationRule: '历史简报依据历年制造实践、工作记录与项目经验持续整理；页面日期用于知识档案排序与主题定位，不单独证明网页在该日首次公开发布。',
    credentialRule: '除非页面明确列明颁发方、核验来源和适用范围，不将学习证明、平台记录或个人作品表述为政府资质、行业认证、官方授权或客户背书。',
    aiRule: 'AI用于检索、整理和方案辅助，不替代现场核实、专业评审、管理决策及法律、财税、安全等专项意见。',
    ndaVersion: 'V1.0',
    ndaDocumentName: 'QilyLean项目保密声明',
    ndaPreviewUrl: '/trust/nda-preview.html',
    ndaAccessRule: '官网仅开放受控在线预览，不提供Word或PDF下载入口。',
    ndaContentRule: '当前正式版本以用户确认的最新版PDF为准；官网仅通过受控页面在线预览，不公开Word或PDF直链。',
    contactPhone: '13450014003',
    contactEmail: 'admin@qilylean.com',
    trustCenterUrl: '/trust/'
  };
  return data;
}

function trustPage(data) {
  const search = data.search || {};
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>信任中心｜QilyLean商业主体、合规边界与数据透明</title>
<meta name="description" content="QilyLean信任中心：明确品牌性质、默认商业签约主体、合同与付款边界、客户数据保密、项目成果口径、AI使用边界及全站数据同步状态。">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="https://qilylean.com/trust/">
<meta property="og:type" content="website"><meta property="og:title" content="QilyLean信任中心"><meta property="og:description" content="商业主体、合同付款、数据保密、项目证据及AI使用边界的统一公开说明。"><meta property="og:url" content="https://qilylean.com/trust/">
<style>
.trust-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.trust-card{padding:24px;border:1px solid #d5e4e3;border-top:4px solid #178b94;background:#fff;box-shadow:0 12px 32px rgba(15,75,90,.07)}.trust-card:nth-child(2n){border-top-color:#caa15f}.trust-card h3{margin:7px 0 10px;color:#0f4b5a;font-size:24px}.trust-card p,.trust-card li{color:#526b69;line-height:1.78}.trust-card ul{margin:0;padding-left:1.25em}.trust-label{color:#8d6a32;font-size:13px;font-weight:950;letter-spacing:.06em}.trust-status{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.trust-status div{padding:19px;border:1px solid #d5e4e3;background:#fff;text-align:center}.trust-status strong{display:block;color:#0f4b5a;font-size:30px}.trust-status span{display:block;margin-top:5px;color:#5f7474;font-size:14px}.trust-callout{padding:20px;border-left:5px solid #caa15f;color:#315f64;background:#eef8f6;line-height:1.8}.trust-levels{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.trust-level{padding:18px;border:1px solid #d5e4e3;background:#fff}.trust-level b{display:inline-grid;place-items:center;width:34px;height:34px;margin-bottom:10px;border-radius:50%;color:#fff;background:#0f4b5a}.trust-level strong{display:block;color:#0f4b5a}.trust-level span{display:block;margin-top:6px;color:#5f7474;font-size:14px;line-height:1.65}.trust-contact{display:grid;grid-template-columns:1fr 1fr;gap:14px}.trust-contact a{display:block;padding:16px;border:1px solid #c8dad8;color:#0f4b5a;background:#fff;text-decoration:none;font-weight:900;text-align:center}@media(max-width:860px){.trust-grid,.trust-contact{grid-template-columns:1fr}.trust-status,.trust-levels{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:520px){.trust-status,.trust-levels{grid-template-columns:1fr}}
</style>
<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'QilyLean信任中心',
    url: 'https://qilylean.com/trust/',
    about: {
      '@type': 'Person',
      name: '丁启利',
      telephone: '+86-134-5001-4003',
      email: 'admin@qilylean.com'
    }
  })}</script>
<script data-qily-shell-bootstrap>(function(d){var e=d.documentElement;e.classList.add("qily-shell-pending");window.__qilyLeanRevealCurrentShell=function(){e.classList.remove("qily-shell-pending")};setTimeout(window.__qilyLeanRevealCurrentShell,1800)})(document);</script>
<link rel="stylesheet" href="/site-shell.css?v=20260729-no-old-flash-v1"><link id="qilyVisualScaleStylesheet" rel="stylesheet" href="/site-visual-scale-v1.css?v=20260729-hierarchy-v4"><link id="qilyWideLayoutStylesheet" rel="stylesheet" href="/site-wide-layout-v1.css?v=20260810-content-axis-v8"><link id="qilyTypographyStylesheet" rel="stylesheet" href="/site-typography-v1.css?v=20260729-hierarchy-v4"><script defer src="/site-navigation.js?v=20260812-native-navigation-stable-v20"></script>
<link id="qilyGlobalLinkStandardStylesheet" rel="stylesheet" href="/site-link-standard-v2.css?v=20260801-global-link-v5">
<link id="qilyDarkSurfaceContrastStylesheet" rel="stylesheet" href="/site-dark-surface-contrast-v1.css?v=20260801-dark-surface-v2">
${interactionClosureBlock}
</head>
<body class="module-page">
<header class="qily-site-header"><a class="qily-brand" href="/">QilyLean｜启力精益</a><nav class="site-nav" aria-label="网站导航"><a href="/">首页</a><a href="/capabilities/">能力画像</a><a href="/projects/">代表项目</a><a href="/knowledge/">知识分享</a><a href="/cooperation/">项目合作</a></nav></header>
<main>
<section class="module-hero"><div class="module-inner"><span class="module-eyebrow">TRUST / CONTRACT / PRIVACY / EVIDENCE</span><h1>信任中心</h1><p class="module-lead">统一公开QilyLean的品牌性质、商业签约主体、合同与付款边界、数据保密、项目成果口径、AI使用边界及站点数据同步状态。</p><nav class="module-subnav"><a href="#identity">主体说明</a><a href="#contract">合同付款</a><a href="#data">数据保密</a><a href="#evidence">成果证据</a><a href="#evidence-levels">证据分级</a><a href="#publication">内容日期</a><a href="#ai">AI边界</a><a href="#contact">核验联系</a></nav></div></section>
<section class="module-section alt"><div class="module-inner"><div class="module-heading"><h2>公开透明状态</h2><p>以下数据由统一站点数据源自动生成，并随内容发布流程同步更新。</p></div><div class="trust-status">
<div><strong>${data.terminology.total}</strong><span>术语及单点课件</span></div><div><strong>${data.briefs.total}</strong><span>今日简报总数</span></div><div><strong>${escapeHtml(data.briefs.latestDate)}</strong><span>最新简报日期</span></div><div><strong>${search.indexedEntries || '自动'}</strong><span>站内搜索索引条目</span></div>
</div><div class="trust-callout" style="margin-top:18px"><strong>同步版本：</strong>${escapeHtml(data.generatedAt || buildDate)}。术语数量、简报数量、最新日期、知识模块统计、首页最新内容、Sitemap lastmod与站内搜索索引由自动化流程统一核算；搜索引擎外部摘要的刷新时间仍由各搜索平台决定。</div></div></section>
<section class="module-section" id="identity"><div class="module-inner"><div class="module-heading"><h2>品牌性质与商业签约主体</h2></div><div class="trust-grid">
<article class="trust-card"><span class="trust-label">BRAND NATURE</span><h3>QilyLean不是独立法人名称</h3><p><strong>QilyLean｜启力精益</strong>现阶段是由丁启利发起并运营的个人专业品牌、制造改善实践平台和项目合作窗口，不是与丁启利相分离的独立法人主体。</p></article>
<article class="trust-card"><span class="trust-label">DEFAULT CONTRACTING PARTY</span><h3>默认签约主体：丁启利（自然人）</h3><p>在未另行书面指定依法登记主体时，商业洽谈、方案确认和项目交付的默认责任主体为丁启利本人。若项目由企业、工作室或合作机构签约，以正式报价、合同首页、签章主体、收款账户和发票信息所载主体为准。</p></article>
</div></div></section>
<section class="module-section alt" id="contract"><div class="module-inner"><div class="module-heading"><h2>合同、价格、付款与发票边界</h2></div><div class="trust-grid">
<article class="trust-card"><h3>网页信息不替代正式合同</h3><ul><li>网站服务范围、价格区间和案例用于合作沟通，不构成不可撤销要约或收益承诺。</li><li>项目范围、交付物、周期、人员投入、差旅、税费、验收、变更、知识产权及违约责任以正式合同为准。</li><li>未纳入合同或双方书面变更单的工作，不自动视为已包含交付范围。</li></ul></article>
<article class="trust-card"><h3>付款与发票必须匹配签约主体</h3><ul><li>仅向正式合同或双方书面确认文件载明的账户付款。</li><li>收款账户发生变化时，应通过官网公开电话或邮箱进行二次核验。</li><li>能否开具发票、发票类型、税率及开票主体，在签约前按实际合同主体书面确认，网页不作超出主体资质的承诺。</li></ul></article>
</div></div></section>
<section class="module-section" id="data"><div class="module-inner"><div class="module-heading"><h2>客户数据、隐私与保密</h2></div><div class="trust-grid">
<article class="trust-card"><h3>最小必要使用</h3><p>咨询表单、项目资料和现场数据仅用于需求判断、方案设计、项目执行、验收与必要沟通；不以与项目无关的目的扩大收集或使用范围。</p></article>
<article class="trust-card"><h3>公开资料必须脱敏</h3><p>客户名称、个人身份、签名、联系方式、成本、工艺参数、经营数据和未公开图纸原则上不公开。确需作为案例展示时，应取得授权或进行去标识化、遮挡与信息重构。</p></article>
<article class="trust-card" id="nda-template"><h3>保密声明优先</h3><p>正式项目可在现场调研或资料交换前，由QilyLean项目责任人签署保密声明；如双方另行签署合同、保密协议或专项数据条款，以双方书面约定为准。</p><p><strong>配套范本：</strong>《QilyLean项目保密声明》V1.0，为一页精简版，覆盖调研数据与产品信息、现场问题及图片、原始资料归还或销毁、商业信息、人员信息、参观管理和项目成果对外披露等事项。官网仅开放受控在线预览，不提供文件下载入口。</p><div class="module-actions"><a href="/trust/nda-preview.html" target="_blank" rel="noopener">在线预览保密声明</a></div></article>
<article class="trust-card"><h3>不在公开端展示受控原档</h3><p>涉及客户敏感信息的完整原始材料仅在授权、保密或现场核验条件下展示，不因网页存在案例摘要而推定客户同意公开全部底稿。</p></article>
</div></div></section>
<section class="module-section alt" id="evidence"><div class="module-inner"><div class="module-heading"><h2>项目成果与证据口径</h2></div><div class="trust-grid">
<article class="trust-card"><h3>区分核定值与估算值</h3><p>已由企业财务、管理层或验收文件确认的结果，可按已核定口径呈现；尚未取得完整核算单或验收记录的数据，必须标注“预估、阶段性估算或待核验”。</p></article>
<article class="trust-card"><h3>区分团队成果与个人职责</h3><p>跨部门项目按组织推进、本人职责和团队贡献分别表达，不把共同完成的改善成果描述为个人独立创造。</p></article>
<article class="trust-card"><h3>案例不构成必然结果承诺</h3><p>历史项目结果受产品、流程、资源、管理基础和实施条件影响；类似企业采用相同方法，不代表必然获得相同收益。</p></article>
<article class="trust-card"><h3>正式核验采用分级展示</h3><p>公开网页提供脱敏证据；确认合作意向后，可在保密约定下核验更完整的基线、过程、结案、财务和验收材料。</p><p><a href="/projects/lean-improvement-evidence/">查看公开脱敏项目佐证 →</a></p></article>
</div></div></section>
<section class="module-section" id="evidence-levels"><div class="module-inner"><div class="module-heading"><h2>公开成果证据分级</h2><p>为避免把经验陈述、过程验证、财务核定和预测模型混为一谈，公开成果统一使用以下内部披露等级；该等级不是第三方认证。</p></div><div class="trust-levels">
<article class="trust-level"><b>A</b><strong>已核定</strong><span>存在企业财务、管理层、验收文件或等效正式记录；公开时仍须脱敏。</span></article>
<article class="trust-level"><b>B</b><strong>已验证</strong><span>有改善前后数据、过程记录或现场验收，但未取得完整财务核定。</span></article>
<article class="trust-level"><b>C</b><strong>阶段估算</strong><span>依据基线、模型与假设测算，必须明确“预估／阶段性估算／待核验”。</span></article>
<article class="trust-level"><b>D</b><strong>经验陈述</strong><span>用于说明任职经历、参与范围和方法实践；正式合作前可按保密条件进一步核验。</span></article>
</div><div class="trust-callout" style="margin-top:18px"><strong>累计成果说明：</strong>职业生涯累计改善贡献包含本人主导、组织推进及跨部门团队共同完成的多年度项目，不等同于QilyLean品牌成立后的独立营收，也不代表任何新项目必然取得相同结果。</div></div></section>
<section class="module-section alt" id="publication"><div class="module-inner"><div class="module-heading"><h2>内容日期、版本与非背书声明</h2></div><div class="trust-grid">
<article class="trust-card"><h3>历史简报日期用于档案定位</h3><p>历史简报依据历年制造实践、工作记录和项目经验持续整理。页面日期用于知识档案排序与主题定位；除非页面另有可核验说明，不单独作为该网页在对应日期首次公开发布的证明。</p></article>
<article class="trust-card"><h3>不虚构资质、授权或客户背书</h3><p>除非页面明确列明颁发方、核验来源和适用范围，学习证明、平台记录、个人作品及项目经历不表述为政府资质、行业认证、官方授权、合作伙伴身份或客户推荐。</p></article>
<article class="trust-card"><h3>页面允许持续修订</h3><p>知识内容、统计数字、链接和展示结构可随事实核验与站点维护更新；涉及合同、付款、成果和责任边界时，以最新页面与双方正式书面文件为准。</p></article>
<article class="trust-card"><h3>欢迎纠错与证据核验</h3><p>发现数字、日期、术语、链接或项目表述存在疑问时，可通过官网公开联系方式提出；经核验属实的错误将修订，并同步更新搜索索引和相关页面。</p></article>
</div></div></section>
<section class="module-section" id="ai"><div class="module-inner"><div class="module-heading"><h2>AI、专业判断与责任边界</h2></div><div class="trust-callout">QilyLean AI及相关自动化工具用于知识检索、资料整理、方案辅助、代码生成和经验复用。涉及现场安全、法律合同、税务财务、质量放行、设备参数、人员任用及重大经营决策时，必须由具备相应授权和专业能力的人员复核。AI输出不替代现场事实确认、法定检验、专业签字和管理审批。</div></div></section>
<section class="module-section alt" id="contact"><div class="module-inner"><div class="module-heading"><h2>主体与付款信息核验</h2><p>签约、付款或资料交换前，可通过以下官网公开渠道进行核验。</p></div><div class="trust-contact"><a href="tel:13450014003">电话：134 5001 4003</a><a href="mailto:admin@qilylean.com">邮箱：admin@qilylean.com</a></div><div class="module-actions" style="margin-top:18px"><a href="/cooperation/">进入项目合作</a><a class="secondary" href="/projects/">查看代表项目</a><a class="secondary" href="/knowledge/">查看知识分享</a></div></div></section>
</main>
<footer class="module-footer"><div class="module-inner"><span>QilyLean｜信任中心</span><span>主体 · 合同 · 数据 · 证据 · AI边界</span></div></footer><script src="/homepage-music.js?v=20260810-demand-music-wrapper-v6"></script>
</body></html>`;
}

function cooperationDisclosure(data) {
  return `<!-- QILY-TRUST:COOPERATION:START -->
<section class="module-section alt" id="contracting-compliance"><div class="module-inner"><div class="module-heading"><h2>签约主体与合规边界</h2><p>在进入报价、合同和付款前，先明确实际责任主体、收款路径、发票条件、资料保密和项目验收边界。</p></div><div class="boundary">
<article><h3>当前品牌与默认签约主体</h3><ul><li>QilyLean｜启力精益为丁启利发起并运营的个人专业品牌与项目合作窗口，本身不是独立法人主体。</li><li>未另行书面指定依法登记主体时，默认商业签约及交付责任主体为<strong>丁启利（自然人）</strong>。</li><li>若项目由企业、工作室或合作机构签约，以合同首页、签章、收款账户及发票信息所载实际主体为准。</li></ul></article>
<article><h3>合作、付款与证据边界</h3><ul><li>网页价格与服务说明仅供范围评估，不替代正式报价和合同。</li><li>仅向合同或双方书面确认文件载明的账户付款；账户变更须通过官网公开渠道复核。</li><li>发票类型、税率和开票主体在签约前按实际主体书面确认。</li><li>项目结果按已核定、已验证、阶段估算或经验陈述分级披露；历史案例不构成新项目收益承诺。</li><li>未经明确授权，不把客户名称、合作经历或内部材料表述为客户推荐、官方合作或商业背书。</li></ul></article>
</div><div class="module-actions"><a href="${data.compliance.trustCenterUrl}">进入QilyLean信任中心</a><a class="secondary" href="${data.compliance.trustCenterUrl}#contract">查看合同与付款边界</a><a class="secondary" href="${data.compliance.trustCenterUrl}#data">查看数据保密说明</a></div></div></section>
<!-- QILY-TRUST:COOPERATION:END -->`;
}

function homeTrustBlock(data) {
  return `<!-- QILY-TRUST:HOME:START -->
<section class="section" id="trust-center"><div class="inner"><div class="head"><h2>信任中心与合作边界</h2><p>公开说明商业签约主体、付款核验、客户资料保密、项目成果口径及AI使用边界。</p></div><div class="metrics">
<div class="metric"><strong>丁启利</strong><span>未另行书面指定依法登记主体时，默认商业签约与项目责任主体为丁启利本人。</span><em><a href="/trust/#identity">查看主体说明</a></em></div>
<div class="metric"><strong>合同为准</strong><span>网页范围、价格和案例用于沟通；正式交付物、费用、周期、税费及验收以合同为准。</span><em><a href="/trust/#contract">查看合同边界</a></em></div>
<div class="metric"><strong>资料保密</strong><span>客户名称、成本、工艺及经营数据按最小必要和授权范围使用，公开案例须脱敏。</span><em><a href="/trust/#data">查看保密说明</a></em></div>
<div class="metric"><strong>证据分级</strong><span>项目结果按已核定、已验证、阶段估算和经验陈述分类展示，避免把预测值当成已实现结果。</span><em><a href="/trust/#evidence-levels">查看证据分级</a></em></div>
</div></div></section>
<!-- QILY-TRUST:HOME:END -->`;
}

function updateCooperation(data) {
  let page = read(cooperationFile);
  page = upsertBlock(page, '<!-- QILY-TRUST:COOPERATION:START -->', '<!-- QILY-TRUST:COOPERATION:END -->', cooperationDisclosure(data), '</main>');
  const schema = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'QilyLean制造改善与项目交付',
    url: 'https://qilylean.com/cooperation/',
    description: '面向制造企业提供新工厂规划、精益改善、目视化项目交付与数智化制造数据治理服务。',
    provider: { '@type': 'Person', name: '丁启利', telephone: '+86-134-5001-4003', email: 'admin@qilylean.com' },
    areaServed: '中国'
  })}</script>`;
  page = page.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, schema);
  writeIfChanged(cooperationFile, page);
}

function updateHome(data) {
  let page = read(homeFile);
  page = upsertBlock(page, '<!-- QILY-TRUST:HOME:START -->', '<!-- QILY-TRUST:HOME:END -->', homeTrustBlock(data), '<section class="section" id="results">');
  writeIfChanged(homeFile, page);
}

function upsertSitemapUrl(file, location, lastmod, priority) {
  if (!fs.existsSync(file)) return;
  let xml = read(file);
  const escaped = location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const expression = new RegExp(`<url><loc>${escaped}<\\/loc>[\\s\\S]*?<\\/url>`);
  const block = `<url><loc>${location}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>${priority}</priority></url>`;
  if (expression.test(xml)) xml = xml.replace(expression, block);
  else xml = xml.replace(/\s*<\/urlset>/, `\n  ${block}\n</urlset>`);
  writeIfChanged(file, xml);
}

function urlToFile(url) {
  let pathname;
  try { pathname = decodeURIComponent(new URL(url).pathname); } catch (error) { return ''; }
  if (pathname === '/') return 'index.html';
  const clean = pathname.replace(/^\//, '');
  if (pathname.endsWith('/')) return `${clean}index.html`;
  if (/\.html$/i.test(clean)) return clean;
  return '';
}

function stripDocument(html) {
  return String(html)
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<header\b[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer\b[\s\S]*?<\/footer>/gi, ' ');
}

function entry(data) {
  return {
    url: data.url || '/',
    title: decodeHtml(data.title) || 'QilyLean',
    code: decodeHtml(data.code || ''),
    description: decodeHtml(data.description || ''),
    headings: decodeHtml(data.headings || ''),
    text: decodeHtml(data.text || '').slice(0, 12000),
    kind: decodeHtml(data.kind || '网页'),
    date: decodeHtml(data.date || '')
  };
}

function pageEntries(url, html) {
  const clean = stripDocument(html);
  const title = capture(html, /<meta\b[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i) || capture(html, /<title>([\s\S]*?)<\/title>/i) || capture(clean, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const description = capture(html, /<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  const headings = Array.from(clean.matchAll(/<h[123]\b[^>]*>([\s\S]*?)<\/h[123]>/gi), (match) => decodeHtml(match[1])).join(' ｜ ');
  const entries = [entry({ url, title, description, headings, text: clean, kind: '网页' })];

  if (url === '/knowledge/terminology.html') {
    Array.from(html.matchAll(/<article\b[^>]*data-term-card[^>]*>([\s\S]*?)<\/article>/gi)).forEach((match) => {
      const card = match[1];
      const code = capture(card, /<div\b[^>]*class=["'][^"']*term-code[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
      const english = capture(card, /<div\b[^>]*class=["'][^"']*term-en[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
      const chinese = capture(card, /<h3\b[^>]*>([\s\S]*?)<\/h3>/i);
      entries.push(entry({
        url: `${url}?term=${encodeURIComponent(decodeHtml(code))}`,
        title: `${decodeHtml(code)}｜${decodeHtml(chinese)}`,
        code,
        description: english,
        headings: '全站术语词典',
        text: card,
        kind: '全站术语'
      }));
    });
  }

  Array.from(clean.matchAll(/<article\b[^>]*class=["'][^"']*module-card[^"']*["'][^>]*>([\s\S]*?)<\/article>/gi)).forEach((match) => {
    const card = match[1];
    const cardTitle = capture(card, /<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>/i);
    if (!decodeHtml(cardTitle)) return;
    const paragraph = capture(card, /<p\b[^>]*>([\s\S]*?)<\/p>/i);
    entries.push(entry({ url, title: cardTitle, description: paragraph, headings: title, text: card, kind: decodeHtml(title) }));
  });
  return entries;
}

function sitemapUrls() {
  const file = sitemapFiles.find((candidate) => fs.existsSync(candidate));
  if (!file) return ['/'];
  return Array.from(read(file).matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]);
}

function buildSearchIndex(data) {
  const entries = [];
  const indexedPages = new Set();
  sitemapUrls().forEach((absoluteUrl) => {
    let url;
    try {
      const parsed = new URL(absoluteUrl);
      if (parsed.origin !== 'https://qilylean.com') return;
      url = parsed.pathname;
    } catch (error) { return; }
    if (/^\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html$/.test(url)) return;
    const relative = urlToFile(absoluteUrl);
    if (!relative) return;
    const file = path.join(root, relative);
    if (!fs.existsSync(file)) return;
    indexedPages.add(url);
    entries.push(...pageEntries(url, read(file)));
  });

  const briefs = JSON.parse(read(dailyIndexFile));
  briefs.forEach((item) => entries.push(entry({
    url: `/qilylean/daily/${item.date}.html`,
    title: item.title,
    description: item.summary,
    headings: item.theme,
    text: `${item.theme || ''} ${item.title || ''} ${item.summary || ''}`,
    kind: '今日简报',
    date: item.date
  })));

  const seen = new Set();
  const deduped = entries.filter((item) => {
    const key = `${item.url}|${item.title}`.toLocaleLowerCase('zh-CN');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const payload = {
    generatedAt: buildDate,
    schemaVersion: 1,
    meta: {
      indexedEntries: deduped.length,
      indexedPages: indexedPages.size,
      terminologyTotal: data.terminology.total,
      briefTotal: data.briefs.total,
      latestBriefDate: data.briefs.latestDate,
      sitemapLastmod: buildDate
    },
    entries: deduped
  };
  writeIfChanged(searchIndexFile, JSON.stringify(payload, null, 2));
  return payload.meta;
}

function patchSiteSearch() {
  let script = read(siteSearchFile);
  if (!script.includes("'/trust/'")) {
    script = script.replace("    '/knowledge/',", "    '/knowledge/',\n    '/trust/',\n    '/cooperation/',");
  }
  script = script.replace("    var all = uniqueUrls(fallback.concat(urls)).filter(function (url) { return url !== '/cooperation/'; });", "    var all = uniqueUrls(fallback.concat(urls));");
  if (!script.includes('qily-generated-search-index-v1')) {
    script = script.replace(
      '  function buildIndex(onProgress) {',
      `  /* qily-generated-search-index-v1 */\n  function loadGeneratedIndex(onProgress) {\n    return fetch('/qilylean/site-search-index.json?index=' + Date.now(), { credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' } }).then(function (response) {\n      if (!response.ok) throw new Error('generated search index unavailable');\n      return response.json();\n    }).then(function (payload) {\n      if (!payload || !Array.isArray(payload.entries)) throw new Error('generated search index invalid');\n      state.indexMeta = payload.meta || {};\n      state.entries = dedupeEntries(payload.entries.map(makeEntry));\n      state.total = state.entries.length;\n      state.loaded = state.total;\n      if (onProgress) onProgress(state.loaded, state.total);\n      return state.entries;\n    });\n  }\n\n  function buildIndex(onProgress) {\n    if (state.loading) return state.loading;\n    state.loading = loadGeneratedIndex(onProgress).catch(function () {\n      state.loading = null;\n      return buildDynamicIndex(onProgress);\n    });\n    return state.loading;\n  }\n\n  function buildDynamicIndex(onProgress) {`
    );
    script = script.replace(
      "    activeQuery: ''\n  };",
      "    activeQuery: '',\n    indexMeta: null\n  };"
    );
    script = script.replace(
      "      else mask._qilySearch.status.textContent = '本站内容索引已就绪，可输入关键词搜索。';",
      "      else { var meta=state.indexMeta||{}; mask._qilySearch.status.textContent = meta.indexedEntries ? '本站索引已同步：'+meta.indexedEntries+'条内容｜'+meta.terminologyTotal+'项术语｜'+meta.briefTotal+'期简报｜最新'+meta.latestBriefDate+'。' : '本站内容索引已就绪，可输入关键词搜索。'; }"
    );
    script = script.replace(
      '      state.total = 0;\n      return buildIndex();',
      '      state.total = 0;\n      state.indexMeta = null;\n      return buildIndex();'
    );
  }
  writeIfChanged(siteSearchFile, script);
}

function validate(data) {
  const trust = read(trustFile);
  const cooperation = read(cooperationFile);
  const home = read(homeFile);
  const index = JSON.parse(read(searchIndexFile));
  if (!trust.includes('默认签约主体：丁启利（自然人）')) throw new Error('Trust-center contracting party is missing');
  if (!trust.includes('id="nda-template"') || !trust.includes('在线预览保密声明')) throw new Error('Trust-center confidentiality statement entry is missing');
  if (!data.compliance || data.compliance.ndaDocumentName !== 'QilyLean项目保密声明' || data.compliance.ndaPreviewUrl !== '/trust/nda-preview.html') throw new Error('Confidentiality statement metadata is missing');
  if (/download=|href=["'][^"']*qilylean-mutual-nda-v1\.pdf/.test(trust)) throw new Error('A direct confidentiality document download leaked into the trust center');
  if (!cooperation.includes('QILY-TRUST:COOPERATION:START')) throw new Error('Cooperation compliance block is missing');
  if (!home.includes('QILY-TRUST:HOME:START')) throw new Error('Homepage trust block is missing');
  if (!index.meta || index.meta.briefTotal !== data.briefs.total) throw new Error('Search index brief count mismatch');
  if (index.meta.terminologyTotal !== data.terminology.total) throw new Error('Search index terminology count mismatch');
  if (!read(siteSearchFile).includes('qily-generated-search-index-v1')) throw new Error('Generated search-index loader is missing');
}

function main() {
  let data = loadSiteData();
  writeIfChanged(trustFile, trustPage(data));
  updateCooperation(data);
  updateHome(data);
  sitemapFiles.forEach((file) => {
    upsertSitemapUrl(file, 'https://qilylean.com/trust/', buildDate, '0.8');
    upsertSitemapUrl(file, 'https://qilylean.com/cooperation/', buildDate, '0.9');
    upsertSitemapUrl(file, 'https://qilylean.com/', buildDate, '1.0');
  });

  const searchMeta = buildSearchIndex(data);
  data.search = searchMeta;
  data.generatedAt = buildDate;
  writeIfChanged(siteDataFile, JSON.stringify(data, null, 2));

  writeIfChanged(trustFile, trustPage(data));
  updateCooperation(data);
  updateHome(data);
  buildSearchIndex(data);
  patchSiteSearch();
  validate(data);
  process.stdout.write(`Trust center and search index synchronized: ${data.search.indexedEntries} entries, ${data.briefs.total} briefs, ${data.terminology.total} terms.\n`);
}

main();
