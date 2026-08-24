#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATE = '2026-08-24';
const HOME_START = '<!-- QILY-NORTH-HOME-V1:START -->';
const HOME_END = '<!-- QILY-NORTH-HOME-V1:END -->';

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function write(rel, content) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const normalized = content.endsWith('\n') ? content : content + '\n';
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === normalized) return false;
  fs.writeFileSync(file, normalized, 'utf8');
  console.log(`materialized ${rel}`);
  return true;
}

function replaceMarked(source, start, end, block, anchor) {
  const startAt = source.indexOf(start);
  const endAt = source.indexOf(end);
  if (startAt >= 0 && endAt > startAt) {
    return source.slice(0, startAt) + block + source.slice(endAt + end.length);
  }
  if (!source.includes(anchor)) throw new Error(`anchor not found: ${anchor}`);
  return source.replace(anchor, `${anchor}\n\n${block}`);
}

function ensureNorthCss(html) {
  if (html.includes('id="qilyNorthV1Stylesheet"')) return html;
  const tag = '<link id="qilyNorthV1Stylesheet" rel="stylesheet" href="/styles/qily-north-v1.css?v=20260824-north-v1">';
  if (!html.includes('</head>')) throw new Error('head closing tag not found');
  return html.replace('</head>', `${tag}\n</head>`);
}

function homeSection() {
  return `${HOME_START}
<section class="qily-north-home" id="qily-north" aria-labelledby="qily-north-title">
  <div class="qily-north-inner">
    <div class="qily-north-heading">
      <span class="qily-north-kicker">QILYLEAN NORTH｜北方制造业赋能计划</span>
      <h2 id="qily-north-title">先让制造改善能力抵达北方，再让项目把人带到现场</h2>
      <p>QilyLean NORTH不是新增业务分类，而是把现有六类核心能力按区域场景落地。第一阶段重点建立<strong>内蒙古 + 陕西</strong>双区域根据地，宁夏、甘肃作为第二阶段延展；以新工厂／新产线规划、精益改善、目视化项目为直接交付，以数字化工厂、APP与官网能力增强成果固化。</p>
    </div>
    <div class="qily-north-region-grid" aria-label="北方区域入口">
      <a class="qily-north-region-card qily-north-region-card--primary" href="/north/inner-mongolia/"><small>FIRST BASE｜01</small><h3>内蒙古</h3><p>以2022年新能源负极材料制造加工现场的真实精益改善履历为区域信任锚点，向新能源材料、装备及制造运营改善场景延展。</p><strong>进入内蒙古制造业服务 →</strong></a>
      <a class="qily-north-region-card qily-north-region-card--primary" href="/north/shaanxi/"><small>FIRST BASE｜02</small><h3>陕西</h3><p>优先发挥汽车电子、半导体、电子电气、工程管理与IE/Lean项目经历，面向制造工程与数智化改善需求。</p><strong>进入陕西制造业服务 →</strong></a>
      <a class="qily-north-region-card" href="/north/ningxia/"><small>SECOND WAVE｜03</small><h3>宁夏</h3><p>作为第二阶段区域入口，聚焦新产线、装备制造、现场改善、标准工时与数字化基础治理。</p><strong>进入宁夏制造业服务 →</strong></a>
      <a class="qily-north-region-card" href="/north/gansu/"><small>SECOND WAVE｜04</small><h3>甘肃</h3><p>作为第二阶段区域入口，面向新能源装备、制造工程、精益改善与运营数据固化等场景。</p><strong>进入甘肃制造业服务 →</strong></a>
    </div>
    <div class="qily-north-evidence">
      <div><span>INNER MONGOLIA｜真实履历证据</span><h3>2022年度精益生产降本绩效来自内蒙古某新能源负极材料制造加工厂</h3><p>现有公开脱敏证据中，2022年第三季度8项改善课题可量化年度财务贡献约<strong>357.91万元</strong>，经本土企业财务核算确认并获总部财务复核认可。该成果属于历史任职期间的团队／组织项目证据，不包装为QilyLean品牌商业成交。</p></div>
      <div class="qily-north-actions"><a class="primary" href="/north/inner-mongolia/#evidence">查看内蒙古案例锚点</a><a href="/projects/lean-improvement-evidence/">查看公开脱敏证据</a><a href="/north/">查看QilyLean NORTH全景</a><a href="/cooperation/">进入项目合作</a></div>
    </div>
  </div>
</section>
${HOME_END}`;
}

const regionData = {
  'inner-mongolia': {
    name: '内蒙古',
    title: '内蒙古精益生产｜新工厂规划｜数智工厂改善｜QilyLean启力精益',
    h1: '内蒙古制造业精益改善与数智工厂支持',
    desc: 'QilyLean NORTH内蒙古区域入口：面向新能源材料、装备制造、电子电气等制造场景，提供新工厂／新产线规划、精益改善、目视化项目及数智化工厂支持。',
    intro: '这里不是从零开始的陌生市场。2022年在内蒙古某新能源负极材料制造加工厂形成的精益生产改善履历，为QilyLean向北方制造现场延展提供了真实项目基础。',
    focus: ['新能源材料制造现场的PQCD与降本改善', '连续设备、工艺窗口、停机损失与OEE治理', '标准工时、产能、WIP、计划实绩与异常闭环', '目视化、6S、稽核整改、项目评审与标准固化'],
    evidence: true
  },
  shaanxi: {
    name: '陕西',
    title: '陕西精益生产｜汽车电子IE｜新产线规划｜QilyLean启力精益',
    h1: '陕西制造业工程改善与精益项目支持',
    desc: 'QilyLean NORTH陕西区域入口：结合汽车电子、半导体、电子电气、IE工程与精益改善经历，提供新产线规划、标准工时、线平衡、OEE及数智工厂支持。',
    intro: '陕西作为第一阶段专业根据地，优先承接与既有职业能力高度匹配的制造工程场景：汽车电子、半导体、电子电气、装备制造，以及围绕IE基础数据和数智化落地的改善项目。',
    focus: ['汽车电子／电子装配的标准工时、线平衡与UPPH', '新产品导入、工艺路线、PFMEA／控制计划与量产准备', '新工厂／新产线Layout、物流、设备、人力与产能模型', 'ERP／APS／MES前置主数据、计划实绩与运营看板'],
    evidence: false
  },
  ningxia: {
    name: '宁夏',
    title: '宁夏精益生产｜装备制造改善｜数智工厂规划｜QilyLean启力精益',
    h1: '宁夏制造业精益改善与工程数据支持',
    desc: 'QilyLean NORTH宁夏区域入口：面向装备、新能源及制造运营场景，提供新产线规划、精益改善、标准工时、目视化与数字化基础治理。',
    intro: '宁夏作为QilyLean NORTH第二阶段区域，先以可远程诊断、可量化、可小范围Pilot验证的工程问题切入，再根据项目成熟度进入现场交付。',
    focus: ['新产线产能模型、Layout与物流路径', '标准工时、瓶颈识别、线平衡与人力配置', 'SMED／OEE／TPM与设备损失结构', '现场目视化、异常闭环与数字化主数据'],
    evidence: false
  },
  gansu: {
    name: '甘肃',
    title: '甘肃精益生产｜新能源装备改善｜工厂规划｜QilyLean启力精益',
    h1: '甘肃制造工程改善与精益运营支持',
    desc: 'QilyLean NORTH甘肃区域入口：面向新能源装备、电子电气及制造工程场景，提供工厂规划、精益改善、目视化、标准工时与数智化基础治理。',
    intro: '甘肃作为QilyLean NORTH第二阶段区域，采用“问题定义 → 数据基线 → Pilot验证 → 标准固化 → 系统运行”的项目路径，优先解决影响交期、效率、质量与成本的关键约束。',
    focus: ['新工厂／新产线规划及扩展边界', 'IE基础数据、产能、节拍、WIP与资源模型', 'VSM、ECRS、SMED、OEE及质量防错', '目视化、SOP、看板、ERP／MES数据口径固化'],
    evidence: false
  }
};

function nav() {
  return `<header class="qily-site-header qily-global-header"><a class="qily-brand" href="/">QilyLean｜启力精益</a><nav class="site-nav qily-global-nav" aria-label="QilyLean核心导视"><a href="/">首页</a><a href="/experience/">履历主线</a><a href="/capabilities/">能力体系</a><a href="/improvements/">改善方法</a><a href="/projects/">代表项目</a><a href="/trust/">信任中心</a><a href="/cooperation/">项目合作</a><a href="/knowledge/">知识资产</a><a href="/links/">友情链接</a></nav></header>`;
}

function head(title, desc, canonical) {
  return `<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><meta name="description" content="${desc}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${canonical}">
<meta property="og:type" content="website"><meta property="og:site_name" content="QilyLean｜启力精益"><meta property="og:title" content="${title}"><meta property="og:description" content="${desc}"><meta property="og:url" content="${canonical}"><meta name="theme-color" content="#0f4b5a">
<link rel="stylesheet" href="/site-core-visual-bundle-v1.css?v=20260815-core-visual-v1"><link rel="stylesheet" href="/site-closure-bundle-v24.css?v=20260810-footer-one-line-v25"><link rel="stylesheet" href="/site-visual-readability-v5.css?v=20260818-visual-readability-v5"><link rel="stylesheet" href="/site-visual-governance-v2.css?v=20260824-readable-floor-plus2-v7"><link rel="stylesheet" href="/site-content-axis-v1.css?v=20260822-sitewide-visual-axis-v5"><link rel="stylesheet" href="/site-interaction-continuity-v1.css?v=20260818-visual-governance-v3"><link rel="stylesheet" href="/site-floating-dock-standard-v1.css?v=20260819-dock-snapback-v3"><link id="qilyNorthV1Stylesheet" rel="stylesheet" href="/styles/qily-north-v1.css?v=20260824-north-v1">
<script defer src="/site-ui-consistency-v1.js?v=20260822-dock-back-label-v13"></script><script defer src="/site-native-prefetch-v1.js?v=20260819-r6-native-prefetch-v1"></script><script defer src="/site-navigation.js?v=20260824-contact-readable-v40"></script>
</head>`;
}

function regionPage(slug, data) {
  const focus = data.focus.map((x, i) => `<article class="qily-north-card"><small>FOCUS｜0${i + 1}</small><h2>${x}</h2><p>先明确对象、边界、基准与目标，再以现场事实和工程数据验证改善效果，并把有效做法固化到标准、看板或系统规则。</p></article>`).join('');
  const evidence = data.evidence ? `<section class="qily-north-section alt" id="evidence"><div class="qily-north-inner"><div class="qily-north-heading"><span class="qily-north-kicker">2022 INNER MONGOLIA｜公开脱敏证据</span><h2>内蒙古某新能源负极材料制造加工厂｜精益生产降本绩效锚点</h2><p>公开脱敏资料证明该经历并非概念包装：2022年第三季度8项改善课题可量化年度财务贡献约<strong>357.91万元</strong>，经本土企业财务核算确认并获总部财务复核认可；第四季度资料对应结案评审，约350～400万元为阶段性估算，不计入已核定贡献口径。</p></div><div class="qily-north-evidence qily-north-evidence--standalone"><div><span>EVIDENCE BOUNDARY</span><h3>真实履历可以作为区域信任基础，但不能混淆主体边界</h3><p>上述成果属于2022年历史任职期间本人参与并组织推进的团队／组织成果。QilyLean公开展示用于能力核验，不将其表述为QilyLean品牌商业成交；企业名称、内部编号和第三方个人信息继续脱敏。</p></div><div class="qily-north-actions"><a class="primary" href="/projects/lean-improvement-evidence/">查看2022公开证据链</a><a href="/experience/">查看履历主线</a></div></div></div></section>` : '';
  const schema = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Service', name: `QilyLean NORTH｜${data.name}制造业精益改善与工程支持`, provider: { '@type': 'Person', name: '丁启利', url: 'https://qilylean.com/' }, areaServed: data.name, serviceType: ['新工厂／新产线规划', '精益改善项目交付', '目视化项目设计与交付', '数字化工厂支持'] });
  return `<!doctype html><html lang="zh-CN">${head(data.title, data.desc, `https://qilylean.com/north/${slug}/`)}<body class="qily-north-page qily-pro-v24">${nav()}<main><section class="qily-north-hero"><div class="qily-north-inner"><a class="qily-north-back" href="/north/">← QilyLean NORTH</a><span class="qily-north-kicker">QILYLEAN NORTH｜${data.name}</span><h1>${data.h1}</h1><p>${data.intro}</p><div class="qily-north-actions"><a class="primary" href="/cooperation/">申请项目沟通</a><a href="/projects/">查看代表项目</a><a href="/capabilities/">查看六类核心能力</a></div></div></section><section class="qily-north-section"><div class="qily-north-inner"><div class="qily-north-heading"><span class="qily-north-kicker">REGIONAL DELIVERY｜区域化交付</span><h2>不是把“精益咨询”四个字搬到${data.name}，而是把问题、数据、Pilot与验收带到现场</h2><p>区域页面只改变市场入口，不改变QilyLean的业务分类和证据纪律。项目仍沿“问题定义 → 数据基线 → 改善验证 → 标准固化 → 系统运行 → 组织复制”闭环推进。</p></div><div class="qily-north-focus-grid">${focus}</div></div></section>${evidence}<section class="qily-north-section"><div class="qily-north-inner"><div class="qily-north-heading"><span class="qily-north-kicker">SIX CAPABILITIES｜六类能力同一口径</span><h2>三类直接交付 + 三类数智能力增强</h2></div><div class="qily-north-six"><div><b>01</b><strong>新工厂／新产线规划</strong><span>Layout、物流、设备、IE、VSM、数字化接口</span></div><div><b>02</b><strong>精益改善项目</strong><span>IE、VSM、SMED、单件流、OEE、质量与计划闭环</span></div><div><b>03</b><strong>目视化设计与交付</strong><span>标识、看板、标准、区域、状态与导视</span></div><div><b>04</b><strong>数字化工厂</strong><span>ERP → APS → MES → 设备 → 看板 → AI</span></div><div><b>05</b><strong>APP软件开发</strong><span>围绕制造／IE／效率场景的轻量工具</span></div><div><b>06</b><strong>官网建设</strong><span>知识资产、项目证据、搜索与内容发布</span></div></div><div class="qily-north-actions"><a class="primary" href="/cooperation/">进入项目合作</a><a href="/north/">返回北方制造业赋能计划</a></div></div></section></main><script type="application/ld+json">${schema}</script></body></html>`;
}

function northIndex() {
  const title = 'QilyLean NORTH｜启力精益北方制造业赋能计划';
  const desc = 'QilyLean NORTH面向内蒙古、陕西、宁夏、甘肃及北方制造企业，提供新工厂／新产线规划、精益改善、目视化项目及数智工厂支持；第一阶段聚焦内蒙古+陕西。';
  return `<!doctype html><html lang="zh-CN">${head(title, desc, 'https://qilylean.com/north/')}
<body class="qily-north-page qily-pro-v24">${nav()}<main><section class="qily-north-hero qily-north-hero--index"><div class="qily-north-inner"><span class="qily-north-kicker">QILYLEAN NORTH｜北方制造业赋能计划</span><h1>让制造改善能力跨越地域，让工程经验服务更多中国制造现场</h1><p>官网先行，不等于先做地域口号。QilyLean NORTH先把区域入口、真实证据、专业内容和项目转化链建立起来，再以项目需求决定现场投入。第一阶段聚焦<strong>内蒙古 + 陕西</strong>，宁夏、甘肃作为第二阶段延展。</p><div class="qily-north-actions"><a class="primary" href="/north/inner-mongolia/">从内蒙古开始</a><a href="/north/shaanxi/">进入陕西</a><a href="/cooperation/">项目合作</a></div></div></section>
<section class="qily-north-section"><div class="qily-north-inner"><div class="qily-north-heading"><span class="qily-north-kicker">REGIONAL MATRIX｜区域矩阵</span><h2>双根据地先验证，第二梯队再复制</h2><p>每个区域页面都围绕“地域词 × 行业场景 × 制造问题 × QilyLean方法与证据”组织，不建立第二套业务体系。</p></div><div class="qily-north-region-grid"><a class="qily-north-region-card qily-north-region-card--primary" href="/north/inner-mongolia/"><small>FIRST BASE｜01</small><h3>内蒙古</h3><p>真实履历锚点：2022年内蒙古新能源负极材料制造加工厂精益生产改善。</p><strong>查看区域方案 →</strong></a><a class="qily-north-region-card qily-north-region-card--primary" href="/north/shaanxi/"><small>FIRST BASE｜02</small><h3>陕西</h3><p>专业能力锚点：汽车电子、半导体、电子电气、IE工程、精益与数智化。</p><strong>查看区域方案 →</strong></a><a class="qily-north-region-card" href="/north/ningxia/"><small>SECOND WAVE｜03</small><h3>宁夏</h3><p>以工程数据、产线规划、装备制造改善和数字化基础治理切入。</p><strong>查看区域方案 →</strong></a><a class="qily-north-region-card" href="/north/gansu/"><small>SECOND WAVE｜04</small><h3>甘肃</h3><p>以新能源装备、制造工程、精益改善和运营数据固化场景切入。</p><strong>查看区域方案 →</strong></a></div></div></section>
<section class="qily-north-section alt"><div class="qily-north-inner"><div class="qily-north-heading"><span class="qily-north-kicker">VALUE STREAM｜官网获客价值流</span><h2>搜索曝光 → 专题页 → 证据核验 → 工厂诊断 → Pilot → 项目交付</h2><p>官网继续作为唯一信息源。外部平台负责把高价值内容和案例切片送到目标企业面前，完整证据、方法、工具和合作入口统一回到QilyLean.com。</p></div><div class="qily-north-roadmap"><div><b>01</b><strong>被搜索到</strong><span>区域专题与问题型内容</span></div><div><b>02</b><strong>建立信任</strong><span>履历、项目与证据边界</span></div><div><b>03</b><strong>诊断问题</strong><span>PQCD、IE、OEE、计划与系统</span></div><div><b>04</b><strong>Pilot验证</strong><span>以数据判断改善有效性</span></div><div><b>05</b><strong>固化复制</strong><span>标准、看板、系统与知识资产</span></div></div><div class="qily-north-actions"><a class="primary" href="/projects/lean-improvement-evidence/">查看2022制造改善证据</a><a href="/cooperation/">进入项目合作</a></div></div></section></main></body></html>`;
}

function patchHome() {
  let html = read('index.html');
  html = ensureNorthCss(html);
  html = replaceMarked(html, HOME_START, HOME_END, homeSection(), '<!-- QILY-SYSTEM-AXIS:END -->');
  write('index.html', html);
}

function patchEvidence() {
  const rel = 'projects/lean-improvement-evidence/index.html';
  let html = read(rel);
  html = html.replaceAll('某制造企业', '内蒙古某新能源负极材料制造加工厂');
  html = html.replace('data-evidence-revision="20260803-context-v3"', 'data-evidence-revision="20260824-inner-mongolia-v4"');
  write(rel, html);
}

function patchSitemap() {
  let xml = read('sitemap.xml');
  const urls = [
    ['https://qilylean.com/north/', '0.9'],
    ['https://qilylean.com/north/inner-mongolia/', '0.9'],
    ['https://qilylean.com/north/shaanxi/', '0.8'],
    ['https://qilylean.com/north/ningxia/', '0.7'],
    ['https://qilylean.com/north/gansu/', '0.7']
  ];
  const additions = urls.filter(([url]) => !xml.includes(`<loc>${url}</loc>`)).map(([url, priority]) => `  <url><loc>${url}</loc><lastmod>${DATE}</lastmod><changefreq>monthly</changefreq><priority>${priority}</priority></url>`).join('\n');
  if (additions) xml = xml.replace('</urlset>', `${additions}\n</urlset>`);
  write('sitemap.xml', xml);
}

function materialize() {
  patchHome();
  patchEvidence();
  write('north/index.html', northIndex());
  Object.entries(regionData).forEach(([slug, data]) => write(`north/${slug}/index.html`, regionPage(slug, data)));
  patchSitemap();
}

function verify() {
  const home = read('index.html');
  const evidence = read('projects/lean-improvement-evidence/index.html');
  const sitemap = read('sitemap.xml');
  const requiredHome = [HOME_START, HOME_END, '/north/inner-mongolia/', '/north/shaanxi/', '357.91万元'];
  requiredHome.forEach(x => { if (!home.includes(x)) throw new Error(`home missing ${x}`); });
  if (!evidence.includes('内蒙古某新能源负极材料制造加工厂')) throw new Error('evidence page not localized to Inner Mongolia anonymized manufacturer');
  ['north/', 'north/inner-mongolia/', 'north/shaanxi/', 'north/ningxia/', 'north/gansu/'].forEach(x => {
    if (!fs.existsSync(path.join(ROOT, x, 'index.html'))) throw new Error(`missing ${x}index.html`);
  });
  ['https://qilylean.com/north/', 'https://qilylean.com/north/inner-mongolia/', 'https://qilylean.com/north/shaanxi/', 'https://qilylean.com/north/ningxia/', 'https://qilylean.com/north/gansu/'].forEach(x => { if (!sitemap.includes(x)) throw new Error(`sitemap missing ${x}`); });
  const countStart = (home.match(/QILY-NORTH-HOME-V1:START/g) || []).length;
  const countEnd = (home.match(/QILY-NORTH-HOME-V1:END/g) || []).length;
  if (countStart !== 1 || countEnd !== 1) throw new Error(`north home markers duplicated: ${countStart}/${countEnd}`);
  if (evidence.includes('QilyLean品牌商业成交') && !home.includes('不包装为QilyLean品牌商业成交')) throw new Error('evidence boundary copy missing');
  console.log('QilyLean NORTH verification PASS');
}

materialize();
verify();
