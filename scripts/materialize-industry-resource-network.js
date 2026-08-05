#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const files = {
  home: 'index.html',
  links: 'links/index.html',
  onboarding: 'links/onboarding/index.html',
  network: 'links/network/index.html'
};
const stylesheet = '<link id="qilyResourceNetworkStylesheet" rel="stylesheet" href="/site-resource-network-v1.css?v=20260805-resource-network-v1">';
const today = '2026-08-05';

function target(relativePath) { return path.join(root, relativePath); }
function read(relativePath) { return fs.readFileSync(target(relativePath), 'utf8'); }
function write(relativePath, content) {
  const normalized = content.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
  const current = fs.existsSync(target(relativePath)) ? fs.readFileSync(target(relativePath), 'utf8') : '';
  if (current === normalized) return false;
  fs.mkdirSync(path.dirname(target(relativePath)), { recursive: true });
  fs.writeFileSync(target(relativePath), normalized, 'utf8');
  return true;
}
function escapeRegExp(value) { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function markerRegex(start, end) { return new RegExp(`<!-- ${escapeRegExp(start)} -->[\\s\\S]*?<!-- ${escapeRegExp(end)} -->`, 'm'); }
function upsertMarker(html, start, end, block, anchor, placement = 'before') {
  const expression = markerRegex(start, end);
  if (expression.test(html)) return html.replace(expression, block);
  if (!html.includes(anchor)) throw new Error(`Missing anchor for ${start}: ${anchor}`);
  return placement === 'after' ? html.replace(anchor, `${anchor}\n${block}`) : html.replace(anchor, `${block}\n${anchor}`);
}
function upsertStylesheet(html) {
  const expression = /<link\s+[^>]*id=["']qilyResourceNetworkStylesheet["'][^>]*>/i;
  return expression.test(html) ? html.replace(expression, stylesheet) : html.replace(/<\/head>/i, `  ${stylesheet}\n</head>`);
}
function upsertMeta(html, attribute, key, value) {
  const escaped = value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const expression = new RegExp(`<meta\\s+[^>]*${attribute}=["']${escapeRegExp(key)}["'][^>]*>`, 'i');
  const tag = `<meta ${attribute}="${key}" content="${escaped}">`;
  return expression.test(html) ? html.replace(expression, tag) : html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}
function upsertTitle(html, title) {
  return /<title>[\s\S]*?<\/title>/i.test(html) ? html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`) : html;
}

function homeBlock() {
  return `<!-- QILY-RESOURCE-NETWORK:HOME:START -->
<section class="qily-resource-network alt" id="qily-resource-network" data-qily-resource-network="construction-stage">
  <div class="qily-resource-network__inner">
    <span class="qily-resource-network__kicker">PLATFORM EXTENSION｜三大项目之外的平台扩展价值</span>
    <h2>产业资源协同网络｜建设阶段</h2>
    <p class="qily-resource-network__lead">QilyLean以制造改善项目交付为核心，以个人专业信用和知识资产为基础，逐步连接企业需求、专业机构与跨行业资源，形成可信展示、需求匹配、项目协同和成果交付的产业资源网络。</p>
    <div class="qily-resource-network__grid">
      <article class="qily-resource-network__card"><small>TRUSTED RESOURCE</small><h3>可信资源入驻</h3><p>核验企业主体、官网、专业能力、服务范围与公开边界，不以付费替代真实性核验。</p><strong>入驻不等于QilyLean背书或成交承诺。</strong></article>
      <article class="qily-resource-network__card"><small>DEMAND MATCHING</small><h3>真实需求匹配</h3><p>围绕企业具体问题，按行业、专业、地区、周期和交付能力匹配适合的资源。</p><strong>平台影响力以有效匹配而非单纯访问量衡量。</strong></article>
      <article class="qily-resource-network__card"><small>JOINT DELIVERY</small><h3>跨行业协同交付</h3><p>在项目转介、联合开发和专业分工前，另行明确合同、职责、保密、结算与验收。</p><strong>合作结果以真实交付和授权记录逐步沉淀。</strong></article>
    </div>
    <div class="qily-resource-network__actions"><a class="qily-resource-network__button primary" href="/links/network/">查看产业资源协同网络</a><a class="qily-resource-network__button" href="/links/onboarding/">申请资源入驻</a><a class="qily-resource-network__button" href="/links/">进入资源目录</a></div>
  </div>
</section>
<!-- QILY-RESOURCE-NETWORK:HOME:END -->`;
}

function linksBlock() {
  return `<!-- QILY-RESOURCE-NETWORK:LINKS:START -->
<section class="qily-resource-network alt" id="industry-resource-network" data-qily-resource-network="construction-stage">
  <div class="qily-resource-network__inner">
    <span class="qily-resource-network__kicker">RESOURCE NETWORK｜从官网目录走向产业协同</span>
    <h2>企业、专业机构与跨行业资源的可信连接入口</h2>
    <p class="qily-resource-network__lead">本页面在全球科技企业官网入口基础上，逐步建设QilyLean产业资源目录。资源价值不止是被收录，更在于真实需求出现时能够形成核验、匹配、转介、联合开发和协同交付。</p>
    <div class="qily-resource-network__definition"><blockquote>先让专业能力被看见，再让适合的企业和资源彼此看见，最终形成有范围、有责任、有交付、有验收的真实合作。</blockquote><p>当前为建设阶段；公开入驻数量、合作记录和交付结果以官网实际展示为准，不承诺搜索排名、固定访问量或成交结果。</p></div>
    <div class="qily-resource-network__actions"><a class="qily-resource-network__button primary" href="/links/network/">了解平台正式定义</a><a class="qily-resource-network__button" href="/links/onboarding/">提交入驻资料</a></div>
  </div>
</section>
<!-- QILY-RESOURCE-NETWORK:LINKS:END -->`;
}

function onboardingBlock() {
  return `<!-- QILY-RESOURCE-NETWORK:ONBOARDING:START -->
<section class="qily-resource-network alt" id="network-definition" data-qily-resource-network="construction-stage">
  <div class="qily-resource-network__inner">
    <span class="qily-resource-network__kicker">WHY ONBOARD｜入驻价值与合作边界</span>
    <h2>不是简单挂链接，而是进入可核验的产业资源池</h2>
    <p class="qily-resource-network__lead">资源通过核验后，可根据实际情况进入行业资源目录、建立独立资源主页或进入项目协同候选范围。真实项目发生前，双方仍需另行确认需求、角色、合同、报价、保密、结算和验收。</p>
    <div class="qily-resource-network__grid four">
      <article class="qily-resource-network__card"><small>01</small><h3>可信展示</h3><p>展示合法主体、官网入口、能力范围、服务区域和公开资料。</p></article>
      <article class="qily-resource-network__card"><small>02</small><h3>需求匹配</h3><p>在企业需求与资源能力具备适配条件时进行联系或转介。</p></article>
      <article class="qily-resource-network__card"><small>03</small><h3>联合协作</h3><p>可探索项目联合开发、专业分工、区域协同和交付支持。</p></article>
      <article class="qily-resource-network__card"><small>04</small><h3>结果沉淀</h3><p>仅在真实交付、完成验收并取得授权后公开合作记录或评价。</p></article>
    </div>
    <div class="qily-resource-network__notice"><strong>重要边界：</strong>提交申请、通过资料核验或进入资源目录，均不自动构成代理、合伙、推荐、担保、独家合作或成交承诺。</div>
    <div class="qily-resource-network__actions"><a class="qily-resource-network__button primary" href="/links/network/">查看产业资源协同规则</a><a class="qily-resource-network__button" href="#application">继续填写入驻资料</a></div>
  </div>
</section>
<!-- QILY-RESOURCE-NETWORK:ONBOARDING:END -->`;
}

function patchHome() {
  let html = upsertStylesheet(read(files.home));
  html = upsertMarker(html, 'QILY-RESOURCE-NETWORK:HOME:START', 'QILY-RESOURCE-NETWORK:HOME:END', homeBlock(), '<!-- QILY-HOME-STATIC-COMMERCIAL:END -->', 'after');
  write(files.home, html);
}

function patchLinks() {
  let html = upsertStylesheet(read(files.links));
  html = upsertTitle(html, '产业资源目录｜全球科技企业与跨行业协同资源｜QilyLean');
  html = upsertMeta(html, 'name', 'description', 'QilyLean产业资源目录：保留全球科技企业官网入口，并逐步连接制造业、专业机构与跨行业资源，为可信展示、需求匹配、项目转介和协同交付提供入口。');
  html = upsertMeta(html, 'property', 'og:title', '产业资源目录｜QilyLean');
  html = upsertMeta(html, 'property', 'og:description', '从全球科技企业官网目录延伸至经过核验的企业、专业机构和跨行业协同资源。');
  html = html.replace('GLOBAL TECHNOLOGY DIRECTORY', 'GLOBAL TECHNOLOGY & INDUSTRY RESOURCE DIRECTORY');
  html = html.replace('友情链接｜全球科技企业100强', '产业资源目录｜全球科技企业与跨行业资源');
  html = html.replace('汇集人工智能、云计算、半导体、工业自动化、智能硬件、商业航天、新能源及中国硬科技代表企业的官方网址，为技术研究、行业洞察、项目对标与供应链学习提供高效入口。', '保留全球科技企业官方网址，为技术研究、行业洞察与项目对标提供入口；同时逐步建设经过核验的企业、专业机构和跨行业资源目录，为真实需求匹配与协同交付建立连接。');
  html = upsertMarker(html, 'QILY-RESOURCE-NETWORK:LINKS:START', 'QILY-RESOURCE-NETWORK:LINKS:END', linksBlock(), '<section class="resource-service"', 'before');
  write(files.links, html);
}

function patchOnboarding() {
  let html = upsertStylesheet(read(files.onboarding));
  html = upsertTitle(html, '产业资源入驻申请｜企业、专业机构与跨行业协同｜QilyLean');
  html = upsertMeta(html, 'name', 'description', 'QilyLean产业资源入驻申请，面向制造业、硬科技、专业服务机构及跨行业协同资源；经核验后进入资源目录或项目协同候选范围。');
  html = upsertMeta(html, 'property', 'og:title', '产业资源入驻申请｜QilyLean');
  html = upsertMeta(html, 'property', 'og:description', '提交企业主体、官网、能力、服务区域和合作方向，进入QilyLean产业资源协同网络建设范围。');
  html = html.replace('本页面专用于企业官网、产品技术、工业服务及产业协同资源的资料提交与核验，不属于制造改善“项目合作”申请。资料通过核验后，可进入友情链接页面的行业资源模块或建立独立资源主页。', '本页面用于企业、专业机构及跨行业资源提交资料与接受核验，不属于制造改善“项目合作”申请。资料通过核验后，可进入产业资源目录、建立独立资源主页，或在真实需求出现时进入项目协同候选范围。');
  html = html.replace('围绕制造业、硬科技和产业服务建立可信入口。普通企业官网收录不与付费绑定；涉及品牌展示或独立主页制作时，再另行确认展示范围与服务方式。', '围绕制造业、硬科技、企业服务和跨行业协同建立可信资源池。普通官网收录不与付费绑定；涉及独立主页、联合推广或项目协同时，再另行确认展示、职责、费用与合作方式。');
  const hero = html.match(/<section class="hero">[\s\S]*?<\/section>/m);
  if (!hero) throw new Error('Onboarding hero section missing');
  html = upsertMarker(html, 'QILY-RESOURCE-NETWORK:ONBOARDING:START', 'QILY-RESOURCE-NETWORK:ONBOARDING:END', onboardingBlock(), hero[0], 'after');
  write(files.onboarding, html);
}

function upsertSitemap(relativePath, url, priority) {
  if (!fs.existsSync(target(relativePath))) return;
  let xml = read(relativePath);
  const expression = new RegExp(`<url><loc>${escapeRegExp(url)}<\\/loc>[\\s\\S]*?<\\/url>`);
  const block = `<url><loc>${url}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${priority}</priority></url>`;
  xml = expression.test(xml) ? xml.replace(expression, block) : xml.replace(/\s*<\/urlset>/, `\n  ${block}\n</urlset>`);
  write(relativePath, xml);
}

function validate() {
  const home = read(files.home);
  const links = read(files.links);
  const onboarding = read(files.onboarding);
  const network = read(files.network);
  const required = [
    [home, 'QILY-RESOURCE-NETWORK:HOME:START'],
    [home, 'QilyLean以制造改善项目交付为核心'],
    [links, 'QILY-RESOURCE-NETWORK:LINKS:START'],
    [links, '产业资源目录｜全球科技企业与跨行业资源'],
    [onboarding, 'QILY-RESOURCE-NETWORK:ONBOARDING:START'],
    [onboarding, '进入产业资源目录、建立独立资源主页'],
    [network, '产业资源协同网络'],
    [network, '入驻不是背书，展示不等于成交'],
    [network, '当前状态：建设阶段']
  ];
  required.forEach(([content, token]) => { if (!content.includes(token)) throw new Error(`Missing resource-network token: ${token}`); });
  ['index.html', 'links/index.html', 'links/onboarding/index.html', 'links/network/index.html'].forEach((file) => {
    if (!read(file).includes('qilyResourceNetworkStylesheet')) throw new Error(`Resource-network stylesheet missing: ${file}`);
  });
  if (/成熟行业平台|保证成交|固定流量|官方推荐/.test(home + links + onboarding + network)) throw new Error('Overstated platform claim detected');
}

function main() {
  patchHome();
  patchLinks();
  patchOnboarding();
  upsertSitemap('sitemap.xml', 'https://qilylean.com/links/', '0.8');
  upsertSitemap('sitemap.xml', 'https://qilylean.com/links/onboarding/', '0.8');
  upsertSitemap('sitemap.xml', 'https://qilylean.com/links/network/', '0.9');
  upsertSitemap('sitemap-core.xml', 'https://qilylean.com/links/', '0.8');
  upsertSitemap('sitemap-core.xml', 'https://qilylean.com/links/onboarding/', '0.8');
  upsertSitemap('sitemap-core.xml', 'https://qilylean.com/links/network/', '0.9');
  validate();
  process.stdout.write('Materialized QilyLean industry resource collaboration network across homepage, directory, onboarding and sitemap.\n');
}

main();
