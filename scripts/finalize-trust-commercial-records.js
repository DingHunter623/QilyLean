#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const recordsDir = path.join(root, 'projects', 'qilylean-commercial-deliveries');
const recordsFile = path.join(recordsDir, 'records.json');

const cumulativeHeadline = '超千万元*';
const cumulativeSummary = '职业生涯多年度参与、主导及组织推进的累计改善贡献，包含跨部门团队共同成果。';
const cumulativeBoundary = '“超千万元”为多年度累计口径，非QilyLean品牌成立后的独立营收；已核定、已验证、阶段估算及职责边界分级披露，不构成新项目收益承诺。';
const cumulativeInline = '职业生涯累计改善贡献超千万元*（含本人参与、主导、组织推进及跨部门团队共同成果；非QilyLean品牌独立营收）';
const archiveDescription = 'QilyLean今日简报历史知识档案，按2019年7月10日至今的制造实践时间轴持续整理；每个日期对应独立知识档案网址，页面日期用于档案排序与主题定位，不等同于网页首次公开发布日期。';

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function write(relativePath, content) {
  const file = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const normalized = content.endsWith('\n') ? content : `${content}\n`;
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === normalized) return false;
  fs.writeFileSync(file, normalized, 'utf8');
  return true;
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/\n/g, ' ');
}

function upsertNamedMeta(html, name, value) {
  const tag = `<meta name="${name}" content="${escapeAttr(value)}">`;
  const expression = new RegExp(`<meta\\s+[^>]*name=["']${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'i');
  if (expression.test(html)) return html.replace(expression, tag);
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function upsertPropertyMeta(html, property, value) {
  const tag = `<meta property="${property}" content="${escapeAttr(value)}">`;
  const expression = new RegExp(`<meta\\s+[^>]*property=["']${property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'i');
  if (expression.test(html)) return html.replace(expression, tag);
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function replaceMarkerBlock(content, start, end, block, anchor) {
  const expression = new RegExp(`<!-- ${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} -->[\\s\\S]*?<!-- ${end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} -->`, 'm');
  if (expression.test(content)) return content.replace(expression, block);
  if (!content.includes(anchor)) throw new Error(`Insertion anchor missing for ${start}`);
  return content.replace(anchor, `${anchor}\n${block}`);
}

function patchCumulativeClaims() {
  const files = [
    'index.html',
    'cooperation/index.html',
    'site-brand-trust-v1.js',
    'qilylean/ding-qili-knowledge-base.json',
    'qilylean/ding-qili-digital-human.md'
  ];

  files.forEach((file) => {
    if (!fs.existsSync(path.join(root, file))) return;
    let content = read(file);

    content = content
      .replace(/超千万元累计项目改善收益/g, cumulativeInline)
      .replace(/超千万元累计改善收益/g, cumulativeInline)
      .replace(/超千万元累计改善贡献/g, cumulativeInline);

    if (file === 'index.html') {
      const metric = `<div class="metric"><strong>${cumulativeHeadline}</strong><span>${cumulativeSummary}</span><em>${cumulativeBoundary}</em></div>`;
      content = content.replace(/<div class="metric"><strong>超千万元\*?<\/strong><span>[\s\S]*?<\/span><em>[\s\S]*?<\/em><\/div>/g, metric);
    }

    if (file === 'cooperation/index.html') {
      const metric = `<div><strong>${cumulativeHeadline}</strong><span>职业生涯累计改善贡献；非QilyLean品牌独立营收</span></div>`;
      content = content.replace(/<div><strong>超千万元\*?<\/strong><span>[\s\S]*?<\/span><\/div>/g, metric);
    }

    write(file, content);
  });
}

function patchDailyArchive() {
  const file = 'qilylean/daily-insights.html';
  let html = read(file);

  html = upsertNamedMeta(html, 'description', archiveDescription);
  html = upsertNamedMeta(html, 'twitter:description', archiveDescription);
  html = upsertPropertyMeta(html, 'og:description', archiveDescription);

  html = html
    .replace(/自2019年7月10日起[^<。]*每一天[^<。]*独立网址[^<。]*[。]?/g, '按2019年7月10日至今的制造实践时间轴持续整理，每个日期对应一个独立知识档案网址；页面日期不等同于网页首次公开发布日期。')
    .replace(/2019-07-10—[^<|]+\|\s*共/g, '2019-07-10—2026-08-02｜历史知识档案｜共');

  const disclosure = [
    '<!-- QILY-ARCHIVE-DISCLOSURE:START -->',
    '<div class="qily-archive-disclosure" role="note" style="margin:16px 0 22px;padding:16px 18px;border-left:5px solid #caa15f;color:#315f64;background:#eef8f6;line-height:1.8">',
    '<strong>归档口径说明：</strong>按2019年7月10日至今的制造实践时间轴持续整理，每个日期对应一个独立知识档案网址；页面日期用于知识档案排序与主题定位，<strong>不等同于网页首次公开发布日期</strong>。历史内容可能依据原始记录、事实核验和当前标准持续修订，以当前页面与全站同步版本为准。 <a href="/trust/#publication">查看完整说明</a>',
    '</div>',
    '<!-- QILY-ARCHIVE-DISCLOSURE:END -->'
  ].join('\n');
  html = replaceMarkerBlock(html, 'QILY-ARCHIVE-DISCLOSURE:START', 'QILY-ARCHIVE-DISCLOSURE:END', disclosure, '<h2>简报目录</h2>');

  const schema = [
    '<!-- QILY-ARCHIVE-STATIC-SCHEMA:START -->',
    '<script type="application/ld+json">',
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'QilyLean今日简报｜历史制造实践知识档案',
      url: 'https://qilylean.com/qilylean/daily-insights.html',
      description: archiveDescription,
      isPartOf: { '@type': 'WebSite', name: 'QilyLean｜启力精益', url: 'https://qilylean.com/' },
      about: ['精益生产', '工业工程', '工程改善', '数智工厂', '制造项目实践'],
      temporalCoverage: '2019-07-10/..',
      publishingPrinciples: 'https://qilylean.com/trust/#publication'
    }),
    '</script>',
    '<!-- QILY-ARCHIVE-STATIC-SCHEMA:END -->'
  ].join('\n');
  const schemaExpression = /<!-- QILY-ARCHIVE-STATIC-SCHEMA:START -->[\s\S]*?<!-- QILY-ARCHIVE-STATIC-SCHEMA:END -->/m;
  if (schemaExpression.test(html)) html = html.replace(schemaExpression, schema);
  else html = html.replace(/<\/head>/i, `  ${schema}\n</head>`);

  write(file, html);
}

function loadRecords() {
  if (!fs.existsSync(recordsFile)) {
    return {
      schemaVersion: 1,
      lastReviewed: '2026-08-02',
      publicationPolicy: 'Only completed QilyLean-branded commercial deliveries with verifiable acceptance evidence and explicit customer publication authorization may be listed.',
      records: []
    };
  }
  const data = JSON.parse(fs.readFileSync(recordsFile, 'utf8'));
  if (!Array.isArray(data.records)) throw new Error('Commercial delivery records must be an array');
  return data;
}

function commercialStyles() {
  return `<style>
:root{--deep:#0f4b5a;--teal:#11868c;--gold:#caa15f;--ink:#173d43;--muted:#617779;--line:#d5e4e3;--soft:#eef8f6;--paper:#fffdf8}
*{box-sizing:border-box}body{margin:0;color:var(--ink);background:#edf7f5;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;line-height:1.75}.main{width:min(1280px,calc(100% - 40px));margin:0 auto;padding:42px 0 80px}.hero,.section{margin:0 0 24px;padding:clamp(24px,4vw,52px);border:1px solid var(--line);background:#fff;box-shadow:0 10px 30px rgba(15,75,90,.06)}.hero{border-top:6px solid var(--gold)}.eyebrow{display:block;color:#93691d;font-weight:900;letter-spacing:.08em}.hero h1{margin:.25em 0;font-size:clamp(32px,4.8vw,58px);line-height:1.2;color:var(--deep)}.lead{font-size:clamp(17px,2vw,22px);color:var(--muted)}.status{padding:18px 20px;border-left:5px solid var(--teal);background:var(--soft)}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.card{padding:22px;border:1px solid var(--line);background:var(--paper)}.card h3{margin:0 0 8px;color:var(--deep)}.record{padding:22px;border:1px solid var(--line);background:#fff}.record dl{display:grid;grid-template-columns:130px 1fr;gap:8px 14px}.record dt{font-weight:900;color:var(--deep)}.record dd{margin:0}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:22px}.actions a{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 18px;border:1px solid var(--deep);border-radius:999px;color:var(--deep);font-weight:900;text-decoration:none}.actions a.primary{color:#fff;background:var(--deep)}.empty{padding:28px;border:2px dashed #a9c9c6;background:#f8fcfb;text-align:center}.fine{color:var(--muted);font-size:14px}.template-table{width:100%;border-collapse:collapse}.template-table th,.template-table td{padding:12px;border:1px solid var(--line);text-align:left;vertical-align:top}.template-table th{width:28%;color:var(--deep);background:var(--soft)}@media(max-width:860px){.grid{grid-template-columns:1fr}.main{width:min(100% - 20px,1280px);padding-top:20px}.hero,.section{padding:22px}.record dl{grid-template-columns:1fr}.template-table,.template-table tbody,.template-table tr,.template-table th,.template-table td{display:block;width:100%}}
</style>`;
}

function pageShell(title, description, canonical, body) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeAttr(description)}">
<meta property="og:title" content="${escapeAttr(title)}">
<meta property="og:description" content="${escapeAttr(description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${escapeAttr(canonical)}">
<link rel="canonical" href="${escapeAttr(canonical)}">
<link rel="stylesheet" href="/site-shell.css?v=20260729-no-old-flash-v1">
<link rel="stylesheet" href="/site-typography-v1.css?v=20260729-hierarchy-v4">
<link rel="stylesheet" href="/site-link-standard-v2.css?v=20260801-global-link-v5">
${commercialStyles()}
<script defer src="/site-navigation.js?v=20260812-native-navigation-stable-v20"></script>
</head>
<body>
<main class="main">${body}</main>
</body>
</html>`;
}

function renderRecord(record) {
  const fields = [
    ['项目编号', record.id],
    ['行业／地区', [record.industry, record.region].filter(Boolean).join('｜')],
    ['服务期间', record.period],
    ['合作范围', record.scope],
    ['核心交付物', Array.isArray(record.deliverables) ? record.deliverables.join('；') : record.deliverables],
    ['验收方式', record.acceptance],
    ['证据等级', record.evidenceLevel],
    ['客户评价', record.authorizedReview],
    ['公开授权', record.authorizationReference]
  ];
  return `<article class="record"><h3>${escapeHtml(record.title || record.id)}</h3><dl>${fields.map(([key, value]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value || '未公开')}</dd>`).join('')}</dl></article>`;
}

function buildCommercialPages() {
  const data = loadRecords();
  write('projects/qilylean-commercial-deliveries/records.json', `${JSON.stringify(data, null, 2)}\n`);

  const recordMarkup = data.records.length
    ? `<div class="grid">${data.records.map(renderRecord).join('')}</div>`
    : '<div class="empty"><h3>当前暂无经客户书面授权公开的QilyLean品牌商业交付案例</h3><p>这不是缺项隐藏，而是诚信状态披露。职业生涯任职期间项目、团队成果和个人专业作品不会被冒充为QilyLean商业订单。首个真实项目完成验收并取得客户明确授权后，才会按本页规则登记。</p></div>';

  const archiveBody = `
<section class="hero"><span class="eyebrow">COMMERCIAL DELIVERY REGISTER｜真实交付登记</span><h1>QilyLean商业交付档案</h1><p class="lead">只公开真实签约或书面确认、完成交付、具备可核验验收证据，并取得客户明确公开授权的QilyLean品牌项目。客户评价不得代写、拼接或默认授权。</p><div class="status"><strong>当前公开记录：${data.records.length}项。</strong> ${data.records.length ? '以下记录均按授权范围脱敏发布。' : '尚无符合全部公开条件的首批案例，现已建立编号、验收、证据分级与评价授权机制。'}</div></section>
<section class="section"><h2>商业交付与职业经历严格区分</h2><div class="grid"><article class="card"><h3>QilyLean商业交付</h3><p>以QilyLean品牌对外承接，存在合同、订单、报价确认或等效书面范围，完成约定交付并形成验收记录。</p></article><article class="card"><h3>任职期间项目</h3><p>属于受雇企业内部职责或跨部门团队成果，可用于证明个人能力，但不得表述为QilyLean商业订单或客户采购。</p></article><article class="card"><h3>个人专业作品</h3><p>方法、模板、图纸、程序文件或知识内容可证明专业产出，但不自动代表客户采用、验收或推荐。</p></article></div></section>
<section class="section"><h2>项目编号与公开条件</h2><div class="grid"><article class="card"><h3>QL-FP-YYYY-NNN</h3><p>新工厂／新产线／车间布局规划。</p></article><article class="card"><h3>QL-LI-YYYY-NNN</h3><p>精益改善、IE、VSM、SMED、OEE及运营闭环。</p></article><article class="card"><h3>QL-VM-YYYY-NNN</h3><p>目视化、6S、现场标准与实施协同。</p></article></div><p class="fine">公开前必须同时具备：真实合作范围、交付物清单、验收或关闭记录、证据等级、脱敏确认及客户公开授权。缺少任一条件，仅保留内部记录，不对外展示。</p></section>
<section class="section"><h2>已授权公开记录</h2>${recordMarkup}</section>
<section class="section"><h2>登记与授权工具</h2><p>以下模板用于今后真实项目闭环。模板本身不代表已有客户、合同或评价。</p><div class="actions"><a class="primary" href="/projects/qilylean-commercial-deliveries/delivery-record-template.html">商业交付登记模板</a><a href="/projects/qilylean-commercial-deliveries/review-authorization-template.html">客户评价公开授权模板</a><a href="/trust/#evidence-levels">查看证据分级</a><a href="/cooperation/">进入项目合作</a></div></section>`;
  write('projects/qilylean-commercial-deliveries/index.html', pageShell('QilyLean商业交付档案｜真实项目、验收与客户授权评价', 'QilyLean品牌真实商业交付登记、项目编号、验收证据和客户评价公开授权机制；不把任职项目或个人作品冒充商业订单。', 'https://qilylean.com/projects/qilylean-commercial-deliveries/', archiveBody));

  const deliveryTemplate = `
<section class="hero"><span class="eyebrow">TEMPLATE｜内部登记后按授权脱敏公开</span><h1>QilyLean商业交付登记模板</h1><p class="lead">用于真实项目完成后的内部归档、验收核对和公开资格审核。未满足全部条件时不得进入公开案例库。</p></section>
<section class="section"><table class="template-table"><tbody>
<tr><th>项目编号</th><td>QL-FP／QL-LI／QL-VM-YYYY-NNN</td></tr><tr><th>签约／书面确认主体</th><td>填写合同、订单、报价确认或等效书面文件中的真实主体。</td></tr><tr><th>客户公开名称</th><td>实名／匿名／行业＋地区；必须与客户授权一致。</td></tr><tr><th>合作范围</th><td>问题边界、产品族、产线、车间、区域、周期及不包含事项。</td></tr><tr><th>交付物</th><td>诊断纪要、数据基线、Layout、VSM、标工、方案、培训、验收清单等。</td></tr><tr><th>验收记录</th><td>验收日期、参与方、通过条件、遗留事项和关闭状态。</td></tr><tr><th>成果证据等级</th><td>A已核定／B已验证／C阶段估算／D经验陈述；不得混用。</td></tr><tr><th>公开素材</th><td>经客户确认的脱敏图片、图表、摘录及可公开范围。</td></tr><tr><th>客户评价</th><td>只能使用客户自行确认的原文，不得代写后默认授权。</td></tr><tr><th>公开授权证明</th><td>签字盖章文件、合同条款、官网邮箱确认或其他可核验书面记录。</td></tr><tr><th>复核人／日期</th><td>发布前再次确认事实、隐私、知识产权和授权范围。</td></tr>
</tbody></table><div class="actions"><a class="primary" href="/projects/qilylean-commercial-deliveries/">返回商业交付档案</a><a href="/trust/">查看诚信与责任边界</a></div></section>`;
  write('projects/qilylean-commercial-deliveries/delivery-record-template.html', pageShell('QilyLean商业交付登记模板', 'QilyLean真实商业项目的编号、范围、交付、验收、证据分级、脱敏与公开授权登记模板。', 'https://qilylean.com/projects/qilylean-commercial-deliveries/delivery-record-template.html', deliveryTemplate));

  const reviewTemplate = `
<section class="hero"><span class="eyebrow">CUSTOMER AUTHORIZATION｜客户自主决定是否公开</span><h1>客户评价公开授权模板</h1><p class="lead">本模板只用于客户已经形成真实评价后确认公开范围。QilyLean不得代替客户编造评价，也不得把沉默、口头客套或项目付款视为公开授权。</p></section>
<section class="section"><table class="template-table"><tbody>
<tr><th>关联项目编号</th><td>填写真实QilyLean商业交付编号。</td></tr><tr><th>评价提供方</th><td>客户单位／部门／职务；可选择实名、匿名或仅公开行业与地区。</td></tr><tr><th>授权公开原文</th><td>逐字确认允许发布的评价内容；未经确认的编辑、缩写或拼接不得发布。</td></tr><tr><th>允许公开渠道</th><td>QilyLean官网／项目建议书／社交媒体／其他；可单独勾选。</td></tr><tr><th>允许关联素材</th><td>项目编号、行业、地区、交付物、效果数据、图片或文件摘录；逐项确认。</td></tr><tr><th>禁止公开内容</th><td>客户名称、人员、产品、价格、图纸、数据、供应链、现场照片等限制项。</td></tr><tr><th>授权期限与撤回</th><td>长期／截至指定日期；客户可提出更正、下架或缩小公开范围。</td></tr><tr><th>确认方式</th><td>签字盖章、合同条款、官网邮箱回复或其他可核验书面确认。</td></tr><tr><th>真实性声明</th><td>评价基于实际合作体验，不构成对其他项目结果的保证或普遍承诺。</td></tr>
</tbody></table><div class="status" style="margin-top:20px"><strong>发布规则：</strong>没有明确书面授权，不公开客户评价；授权范围不清晰时按不公开处理。</div><div class="actions"><a class="primary" href="/projects/qilylean-commercial-deliveries/">返回商业交付档案</a><a href="/cooperation/">项目合作入口</a></div></section>`;
  write('projects/qilylean-commercial-deliveries/review-authorization-template.html', pageShell('QilyLean客户评价公开授权模板', '客户对QilyLean真实商业项目评价的实名或匿名公开范围、原文、素材、期限和撤回机制确认模板。', 'https://qilylean.com/projects/qilylean-commercial-deliveries/review-authorization-template.html', reviewTemplate));
}

function patchPublicLinks() {
  const commercialBlock = `<!-- QILY-COMMERCIAL-DELIVERY-LINK:START -->
<section class="module-section alt" id="qily-commercial-deliveries"><div class="module-inner"><div class="module-heading"><span class="module-eyebrow">COMMERCIAL RECORDS｜真实商业交付</span><h2>QilyLean商业交付档案与客户授权评价</h2><p>职业生涯项目、个人作品与QilyLean品牌商业订单严格区分。当前只公开具备真实合作范围、交付验收证据和客户明确授权的记录；暂无授权案例时如实显示为0项。</p></div><div class="article-actions"><a class="resource-action" href="/projects/qilylean-commercial-deliveries/">查看商业交付档案</a><a class="resource-action" href="/projects/qilylean-commercial-deliveries/review-authorization-template.html">查看客户评价授权规则</a></div></div></section>
<!-- QILY-COMMERCIAL-DELIVERY-LINK:END -->`;

  ['projects/index.html', 'cooperation/index.html', 'trust/index.html'].forEach((file) => {
    if (!fs.existsSync(path.join(root, file))) return;
    let content = read(file);
    const expression = /<!-- QILY-COMMERCIAL-DELIVERY-LINK:START -->[\s\S]*?<!-- QILY-COMMERCIAL-DELIVERY-LINK:END -->/m;
    if (expression.test(content)) content = content.replace(expression, commercialBlock);
    else if (/<\/main>/i.test(content)) content = content.replace(/<\/main>/i, `${commercialBlock}\n</main>`);
    else if (/<\/body>/i.test(content)) content = content.replace(/<\/body>/i, `${commercialBlock}\n</body>`);
    write(file, content);
  });
}

function upsertSitemapUrl(file, url) {
  if (!fs.existsSync(path.join(root, file))) return;
  let xml = read(file);
  if (xml.includes(`<loc>${url}</loc>`)) return;
  const lastmod = new Date().toISOString().slice(0, 10);
  const entry = `  <url><loc>${url}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.72</priority></url>\n`;
  if (!/<\/urlset>/i.test(xml)) throw new Error(`Invalid sitemap: ${file}`);
  xml = xml.replace(/<\/urlset>/i, `${entry}</urlset>`);
  write(file, xml);
}

function patchSitemaps() {
  const urls = [
    'https://qilylean.com/projects/qilylean-commercial-deliveries/',
    'https://qilylean.com/projects/qilylean-commercial-deliveries/delivery-record-template.html',
    'https://qilylean.com/projects/qilylean-commercial-deliveries/review-authorization-template.html'
  ];
  urls.forEach((url) => upsertSitemapUrl('sitemap.xml', url));
  upsertSitemapUrl('sitemap-core.xml', urls[0]);
}

function validate() {
  const home = read('index.html');
  const cooperation = read('cooperation/index.html');
  const directory = read('qilylean/daily-insights.html');
  const records = JSON.parse(read('projects/qilylean-commercial-deliveries/records.json'));
  const archive = read('projects/qilylean-commercial-deliveries/index.html');

  if (!home.includes('累计改善贡献') || !home.includes('非QilyLean品牌独立营收')) throw new Error('Homepage cumulative contribution is not fully qualified');
  if (!cooperation.includes('非QilyLean品牌独立营收')) throw new Error('Cooperation cumulative contribution is not fully qualified');
  if (/超千万元累计(?:项目)?改善收益/.test(home + cooperation)) throw new Error('Legacy cumulative-benefit wording remains');
  if (!directory.includes(archiveDescription) || !directory.includes('QILY-ARCHIVE-STATIC-SCHEMA:START') || !directory.includes('不等同于网页首次公开发布日期')) throw new Error('Static archive disclosure is incomplete');
  if (!Array.isArray(records.records)) throw new Error('Commercial records data invalid');
  if (!archive.includes(`当前公开记录：${records.records.length}项`)) throw new Error('Commercial archive count mismatch');
  if (!archive.includes('不会被冒充为QilyLean商业订单')) throw new Error('Commercial-history distinction missing');
  if (!read('projects/qilylean-commercial-deliveries/review-authorization-template.html').includes('没有明确书面授权，不公开客户评价')) throw new Error('Review authorization rule missing');
  if (!read('sitemap.xml').includes('qilylean-commercial-deliveries')) throw new Error('Commercial archive sitemap entry missing');
}

function main() {
  patchCumulativeClaims();
  patchDailyArchive();
  buildCommercialPages();
  patchPublicLinks();
  patchSitemaps();
  if (process.env.QILY_SKIP_INTERNAL_VALIDATE !== '1') validate();
  process.stdout.write('Finalized cumulative-result wording, static brief archive disclosure, and truthful QilyLean commercial delivery register.\n');
}

main();
