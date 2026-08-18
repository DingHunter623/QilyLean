#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const file = rel => path.join(root, rel);
const read = rel => fs.readFileSync(file(rel), 'utf8');
const write = (rel, content) => {
  const next = content.endsWith('\n') ? content : content + '\n';
  const before = fs.existsSync(file(rel)) ? fs.readFileSync(file(rel), 'utf8') : '';
  if (before === next) return false;
  fs.writeFileSync(file(rel), next, 'utf8');
  return true;
};
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

const CORE = [
  '新工厂／新产线规划',
  '精益改善项目交付',
  '目视化项目设计与交付'
];

const HOME_BLOCK = `<!-- QILY-HOME-STATIC-COMMERCIAL:START -->
<section class="qily-ia-section" id="qily-core-services" data-qily-static-source="home-core-v4" data-qily-core-business="three-v3">
  <div class="qily-ia-inner">
    <div class="qily-ia-heading"><span class="qily-ia-kicker">CORE BUSINESS｜制造工程直接交付</span><h2>三大核心业务｜先解决制造现场真正影响交付的问题</h2><p>QilyLean以制造现场和工程数据为起点，核心项目交付聚焦三类：新工厂／新产线规划、精益改善项目交付、目视化项目设计与交付。三类业务均可独立定义范围、交付物、阶段节点与验收边界，并沿同一制造运营闭环协同。</p></div>
    <div class="qily-ia-grid">
      <article class="qily-ia-card" data-qily-business-line="core"><small>CORE DELIVERY｜01</small><h3>新工厂／新产线规划</h3><p>从产品、工艺、产能、设备、物流、公辅、品质和扩展边界出发，形成可评审、可实施的规划资产。</p><div class="qily-ia-result">产能模型、Layout、物流与库位、公辅接口、实施路线图</div></article>
      <article class="qily-ia-card" data-qily-business-line="core"><small>CORE DELIVERY｜02</small><h3>精益改善项目交付</h3><p>围绕PQCD与交付瓶颈，以VSM、标准工时、线平衡、SMED、OEE、质量防错及计划实绩闭环开展诊断、Pilot与标准化。</p><div class="qily-ia-result">基线诊断、Pilot方案、改善数据、标准文件、结案验收</div></article>
      <article class="qily-ia-card" data-qily-business-line="core"><small>CORE DELIVERY｜03</small><h3>目视化项目设计与交付</h3><p>把区域、状态、责任、标准和异常转化为现场共同语言，兼顾设计、材料、施工协同和验收。</p><div class="qily-ia-result">现场勘查、视觉标准、设计图、材料清单、打样、实施与验收</div></article>
    </div>
    <div class="qily-ia-actions"><a class="qily-ia-button primary" href="/cooperation/#services">查看三大核心业务与交付边界</a><a class="qily-ia-button" href="/projects/">查看代表项目与证据</a></div>
  </div>
</section>
<section class="qily-ia-section qily-ia-alt" id="qily-digital-enablers" data-qily-static-source="home-digital-v4" data-qily-digital-enablers="v3">
  <div class="qily-ia-inner">
    <div class="qily-ia-heading"><span class="qily-ia-kicker">DIGITAL ENABLERS｜数智化增强与数字产品能力</span><h2>让改善成果进入系统、工具与数字载体，而不是把它们与核心制造项目混为一类</h2><p>数字化工厂用于把流程、数据、计划、设备、质量与现场执行固化到系统；APP软件与官网建设属于数字产品和工程作品能力，可按项目需要独立承接，也可作为制造改善成果的数字化载体。</p></div>
    <div class="qily-ia-grid">
      <article class="qily-ia-card" data-qily-business-line="enabler"><small>ENGINEERING ENABLER｜04</small><h3>数字化工厂</h3><p>以业务流程和可信主数据为底座，规划ERP／MES／APS、设备数据、生产透明化、管理看板与实施路线。</p><div class="qily-ia-result">数字化蓝图、数据口径、功能／接口需求、看板原型、Pilot与验收机制</div></article>
      <article class="qily-ia-card" data-qily-business-line="digital-product"><small>DIGITAL PRODUCT｜05</small><h3>APP软件开发</h3><p>面向IE测时、现场采集、异常管理、移动看板、提醒及轻量化管理场景，完成需求、原型、开发、测试、发布与迭代。</p><div class="qily-ia-result">需求清单、交互原型、可运行版本、测试记录、安装／发布包与版本记录</div></article>
      <article class="qily-ia-card" data-qily-business-line="digital-product"><small>DIGITAL PRODUCT｜06</small><h3>官网建设</h3><p>围绕品牌定位、信息架构、可信证据、内容体系、SEO、咨询转化、响应式适配及持续运维建设专业官网。</p><div class="qily-ia-result">信息架构、页面模板、响应式官网、SEO基础、咨询入口、部署与运维规范</div></article>
    </div>
    <div class="qily-ia-actions"><a class="qily-ia-button primary" href="/capabilities/#digital">查看数智化能力</a><a class="qily-ia-button" href="/tools/">查看数字工具与作品</a></div>
  </div>
</section>
<section class="qily-ia-section qily-ia-alt" id="qily-home-proof" data-qily-static-source="home-proof-v4">
  <div class="qily-ia-inner">
    <div class="qily-ia-heading"><span class="qily-ia-kicker">WHY QILYLEAN｜证据与交易边界</span><h2>先看交付逻辑，再看专业深度</h2><p>不以资质徽章堆砌信任，而以真实项目、脱敏佐证、交付资产、阶段节点及验收规则建立可核验的合作基础。</p></div>
    <div class="qily-ia-delivery-summary">
      <article><strong>专业基础</strong><span>制造工程、工业工程、精益改善、数智化与软件／互联网工程实践；详细年限和岗位归入履历主线。</span></article>
      <article><strong>项目证据</strong><span>代表项目按已核定、已验证、阶段估算和经验陈述分级展示。</span></article>
      <article><strong>交易机制</strong><span>三大核心业务按项目范围、交付物与验收边界定义合作；数智化增强及数字产品按具体需求、功能与工作量独立核价。</span></article>
      <article><strong>责任边界</strong><span>网页用于沟通与能力说明，正式范围、费用、税费、周期和验收以书面方案与合同为准。</span></article>
    </div>
    <div class="qily-ia-actions"><a class="qily-ia-button primary" href="/projects/">代表项目</a><a class="qily-ia-button" href="/trust/">诚信与责任边界</a><a class="qily-ia-button" href="/projects/qilylean-commercial-deliveries/">商业交付档案</a></div>
  </div>
</section>
<!-- QILY-HOME-STATIC-COMMERCIAL:END -->`;

const COOP_CORE = `<section class="module-section" id="services"><div class="module-inner"><div class="module-heading"><span class="module-eyebrow">CORE BUSINESS｜制造工程直接交付</span><h2>三大核心业务</h2><p>核心项目合作只定义为三类制造工程交付：新工厂／新产线规划、精益改善项目交付、目视化项目设计与交付。每项都以企业真实问题、项目范围、标准交付物、阶段节点和验收口径定义合作。</p></div><div class="module-grid three" data-qily-core-business="three-v3">
  <article class="module-card service-card"><a class="service-heading-link" href="/cooperation/factory-planning/"><span class="service-number">01</span><small>Factory Planning</small><h3>新工厂／新产线规划</h3></a><p>建立产能、设备、人力、面积、物流、公辅、安全与扩展边界，形成可实施规划资产。</p><div class="scope-list"><span>产能与资源模型</span><span>Factory Layout</span><span>人流物流与仓储</span><span>设备及公辅接口</span><span>分期建设与扩展</span><span>投产爬坡计划</span></div><div class="module-result">标准交付：设计输入、产能模型、Layout方案、物流方案、设备接口清单、评审纪要与实施路线图。</div></article>
  <article class="module-card service-card"><a class="service-heading-link" href="/cooperation/lean-improvement/"><span class="service-number">02</span><small>Lean Improvement</small><h3>精益改善项目交付</h3></a><p>围绕PQCD与交付瓶颈，运用IE、VSM、单件流、SMED、OEE、线平衡和Poka-Yoke开展诊断、Pilot和标准化。</p><div class="scope-list"><span>标准工时／UPPH</span><span>VSM／LT／WIP</span><span>SMED／OEE／TPM</span><span>线平衡／人机配置</span><span>质量与防错</span><span>计划实绩闭环</span></div><div class="module-result">标准交付：质量与效率基线、问题清单、未来态方案、Pilot验证、标准作业、培训稽核与横向复制计划。</div></article>
  <article class="module-card service-card"><a class="service-heading-link" href="/cooperation/visual-management/"><span class="service-number">03</span><small>Visual Management Delivery</small><h3>目视化项目设计与交付</h3></a><p>把区域、状态、标准、责任、异常和节奏转化为现场共同语言，贯通6S、安全、质量、设备、物流、仓储、工位与DMS。</p><div class="scope-list"><span>现场勘查与诊断</span><span>目视化标准设计</span><span>清单预算与打样</span><span>制作施工协同</span><span>安装效果校核</span><span>验收维护机制</span></div><div class="module-result">标准交付：区域方案、VI与颜色语义、图纸尺寸、材料清单、预算、样板确认、施工协同与验收标准。</div></article>
</div></div></section>`;

const COOP_SUPPORT = `<section class="module-section alt" id="engineering-enablers"><div class="module-inner"><div class="module-heading"><span class="module-eyebrow">DIGITAL ENABLERS｜数智化增强与数字产品能力</span><h2>三项增强能力，不与三大核心业务同级</h2><p>数字化工厂用于把制造流程、数据和改善成果固化到系统；APP软件开发与官网建设属于数字产品／作品能力。三项均可按真实需求独立合作，但在官网信息架构上不再称为“核心业务”。</p></div><div class="module-grid three qily-support-grid">
  <article class="module-card service-card" data-qily-service-key="digital-factory"><a class="service-heading-link" href="/projects/digital-factory/"><span class="service-number">04</span><small>Engineering Enabler</small><h3>数字化工厂</h3></a><p>以业务流程和主数据为底座，打通订单、计划、工艺、工时、设备、质量、库存与现场执行。</p><div class="module-result">增强交付：数字化蓝图、数据字典、功能需求、接口清单、看板原型、实施路线与验收机制。</div></article>
  <article class="module-card service-card" data-qily-service-key="app-development"><a class="service-heading-link" href="/tools/times26001/"><span class="service-number">05</span><small>Digital Product</small><h3>APP软件开发</h3></a><p>把IE测时、现场采集、异常管理、移动看板、提醒等重复操作转化为可运行的软件工具。</p><div class="module-result">产品交付：需求清单、交互原型、可运行版本、测试记录、安装／发布包、使用说明与版本记录。</div></article>
  <article class="module-card service-card" data-qily-service-key="website-development"><a class="service-heading-link" href="/"><span class="service-number">06</span><small>Digital Product</small><h3>官网建设</h3></a><p>围绕品牌定位、信息架构、可信证据、内容体系、SEO、咨询入口、移动适配与持续运维建设专业官网。</p><div class="module-result">产品交付：信息架构、页面模板、响应式官网、SEO基础、咨询入口、部署配置与运维规范。</div></article>
</div></div></section>`;

function normalizeHome() {
  let html = read('index.html');
  const blockRe = /<!-- QILY-HOME-STATIC-COMMERCIAL:START -->[\s\S]*?<!-- QILY-HOME-STATIC-COMMERCIAL:END -->/m;
  assert(blockRe.test(html), 'Homepage commercial block missing');
  html = html.replace(blockRe, HOME_BLOCK);
  html = html.replace(/<meta name="description" content="[^"]*">/i, '<meta name="description" content="QilyLean｜启力精益：聚焦新工厂／新产线规划、精益改善项目交付、目视化项目设计与交付三大核心业务；以数字化工厂、APP软件与官网作为数智化增强与数字产品能力。">');
  html = html.replace(/<meta property="og:title" content="[^"]*">/i, '<meta property="og:title" content="QilyLean｜启力精益｜三大核心业务与数智化增强">');
  html = html.replace(/<meta property="og:description" content="[^"]*">/i, '<meta property="og:description" content="以制造工程三大核心业务为主线，以数字化工厂、APP软件和官网能力增强交付与成果固化。">');
  html = html.replace(/<meta name="twitter:description" content="[^"]*">/i, '<meta name="twitter:description" content="三大核心业务聚焦制造工程直接交付，数智化能力用于固化改善成果与放大价值。">');
  html = html.replace(/六类核心业务/g, '三大核心业务');
  html = html.replace(/两大业务主线 · 三大核心业务/g, '制造工程直接交付');
  html = html.replace(/data-qily-six-core-services="v2"/g, 'data-qily-core-business="three-v3"');
  html = html.replace(/"name":"QilyLean三大核心业务"/g, '"name":"QilyLean三大核心业务"');
  html = html.replace(/"name":"QilyLean六类核心业务"/g, '"name":"QilyLean三大核心业务"');
  html = html.replace(/"serviceType":\["新工厂／新产线规划","精益改善项目交付","目视化项目设计与交付","数字化工厂","APP软件开发","官网建设"\]/g, '"serviceType":["新工厂／新产线规划","精益改善项目交付","目视化项目设计与交付"]');
  write('index.html', html);
}

function normalizeCooperation() {
  let html = read('cooperation/index.html');
  const serviceRe = /<section class="module-section" id="services">[\s\S]*?<\/section>/m;
  assert(serviceRe.test(html), 'Cooperation services section missing');
  html = html.replace(serviceRe, COOP_CORE + '\n' + COOP_SUPPORT);
  html = html.replace(/\n<section class="module-section alt" id="engineering-enablers">[\s\S]*?<\/section>\s*/m, '\n');
  /* Reinsert one canonical support section immediately after core services. */
  html = html.replace(COOP_CORE, COOP_CORE + '\n' + COOP_SUPPORT);
  html = html.replace(/<title>[^<]*<\/title>/i, '<title>项目合作｜QilyLean三大核心业务与数智化增强</title>');
  html = html.replace(/<meta name="description" content="[^"]*">/i, '<meta name="description" content="QilyLean项目合作聚焦新工厂／新产线规划、精益改善项目交付、目视化项目设计与交付三大核心业务；数字化工厂、APP软件开发与官网建设作为数智化增强与数字产品能力按需合作。">');
  html = html.replace(/<meta property="og:title" content="[^"]*">/i, '<meta property="og:title" content="QilyLean项目合作｜三大核心业务与数智化增强">');
  html = html.replace(/<meta property="og:description" content="[^"]*">/i, '<meta property="og:description" content="三大核心业务以范围、交付物、Pilot、验证和验收定义合作；数智化能力按项目需要增强。">');
  html = html.replace(/六类核心业务/g, '三大核心业务');
  html = html.replace(/六类项目合作能力/g, '项目合作能力');
  html = html.replace(/进入六类业务项目合作/g, '进入项目合作');
  html = html.replace(/查看六类业务与交付边界/g, '查看三大核心业务与交付边界');
  html = html.replace(/data-qily-six-core-services="v2"/g, 'data-qily-core-business="three-v3"');
  write('cooperation/index.html', html);
}

function normalizeStandard() {
  const rel = 'docs/QilyLean全站业务口径规范_20260809.md';
  if (!fs.existsSync(file(rel))) return;
  const doc = `# QilyLean全站业务口径规范｜2026-08-18\n\n- **三大核心业务**：①新工厂／新产线规划；②精益改善项目交付；③目视化项目设计与交付。\n- **数智化增强**：数字化工厂。其职责是把流程、数据、计划、设备、质量、看板与改善成果固化到系统，不与三大核心业务同级。\n- **数字产品／作品能力**：APP软件开发、官网建设。两项能力可以独立合作，也可以作为制造改善与品牌交付的数字载体，但不再定义为“核心业务”。\n- **名称锁定**：以上六项能力名称保持原名；信息架构必须明确“3项核心业务 + 1项工程增强 + 2项数字产品”的层级。\n- **友情链接**：/links/ 为正式资源模块，可保留在主导航与资源入口。\n\n## 项目合作与报价\n\n三大核心业务按真实项目范围定义输入、交付物、阶段节点与验收边界。数字化工厂、APP软件开发、官网建设可按需求、功能、工作量、第三方费用与验收条件独立核价，但公开页面不得再把六项平铺为“六类核心业务”或“六个核心项目”。\n\n## 防回退规则\n\n静态HTML、SEO/Schema、项目合作、运行时、生成脚本与CI必须保持同一层级：**三大核心业务为第一层；数字化工厂为数智化增强；APP软件开发与官网建设为数字产品／作品能力。** 任何自动化检测到“六类核心业务”“六个核心项目”“两大业务主线 · 六类核心业务”时，应视为回退异常，不得自动恢复。\n\n**规范版本：2026-08-18 / Business Hierarchy v3**\n`;
  write(rel, doc);
}

normalizeHome();
normalizeCooperation();
normalizeStandard();

for (const name of CORE) {
  const home = read('index.html');
  const coop = read('cooperation/index.html');
  assert(home.includes(name), `Homepage missing core business: ${name}`);
  assert(coop.includes(name), `Cooperation missing core business: ${name}`);
}
assert(read('index.html').includes('三大核心业务'), 'Homepage hierarchy missing');
assert(read('index.html').includes('数智化增强'), 'Homepage digital enabler hierarchy missing');
assert(!read('index.html').includes('两大业务主线 · 六类核心业务'), 'Homepage six-core regression detected');
assert(!read('cooperation/index.html').includes('<h2>六类核心业务</h2>'), 'Cooperation six-core regression detected');
process.stdout.write('Business Hierarchy v3 normalized: 3 core + digital enablers/products.\n');
