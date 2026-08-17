#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const file = (rel) => path.join(root, rel);
const read = (rel) => fs.readFileSync(file(rel), 'utf8');
const write = (rel, content) => {
  const next = content.endsWith('\n') ? content : content + '\n';
  const target = file(rel);
  const before = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
  if (before === next) return false;
  fs.writeFileSync(target, next, 'utf8');
  return true;
};
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

const SIX = [
  '新工厂／新产线规划',
  '精益改善项目交付',
  '目视化项目设计与交付',
  '数字化工厂',
  'APP软件开发',
  '官网建设'
];

const HOME_BLOCK = `<!-- QILY-HOME-STATIC-COMMERCIAL:START -->
<section class="qily-ia-section" id="qily-core-services" data-qily-static-source="home-core-v3" data-qily-six-core-services="v2">
  <div class="qily-ia-inner">
    <div class="qily-ia-heading"><span class="qily-ia-kicker">CORE BUSINESS｜两大业务主线 · 六类核心业务</span><h2>六类核心业务｜六类核心能力，一个制造运营闭环</h2><p>QilyLean以“制造工程交付 + 数智化产品交付”两条主线承接六类业务。六项业务均可独立定义范围、交付物、阶段节点与验收边界，同时沿同一制造运营价值链协同：从工厂与产线规划、现场改善和目视化，到数字化系统、APP软件与专业官网建设。</p></div>
    <div class="qily-ia-grid">
      <article class="qily-ia-card" data-qily-business-line="manufacturing"><small>制造工程交付｜01</small><h3>新工厂／新产线规划</h3><p>从产品、工艺、产能、设备、物流、公辅、品质和扩展边界出发，形成可评审、可实施的规划资产。</p><div class="qily-ia-result">产能模型、Layout、物流与库位、公辅接口、实施路线图</div></article>
      <article class="qily-ia-card" data-qily-business-line="manufacturing"><small>制造工程交付｜02</small><h3>精益改善项目交付</h3><p>围绕PQCD与交付瓶颈，以VSM、标准工时、线平衡、SMED、OEE、质量防错及计划实绩闭环开展诊断、Pilot与标准化。</p><div class="qily-ia-result">基线诊断、Pilot方案、改善数据、标准文件、结案验收</div></article>
      <article class="qily-ia-card" data-qily-business-line="manufacturing"><small>制造工程交付｜03</small><h3>目视化项目设计与交付</h3><p>把区域、状态、责任、标准和异常转化为现场共同语言，兼顾设计、材料、施工协同和验收。</p><div class="qily-ia-result">现场勘查、视觉标准、设计图、材料清单、打样、实施与验收</div></article>
      <article class="qily-ia-card" data-qily-business-line="digital"><small>数智化产品交付｜04</small><h3>数字化工厂</h3><p>以业务流程和可信主数据为底座，规划ERP／MES／APS、设备数据、生产透明化、管理看板与实施路线。</p><div class="qily-ia-result">数字化蓝图、数据口径、功能／接口需求、看板原型、Pilot与验收机制</div></article>
      <article class="qily-ia-card" data-qily-business-line="digital"><small>数智化产品交付｜05</small><h3>APP软件开发</h3><p>面向IE测时、现场采集、异常管理、移动看板、提醒及轻量化管理场景，完成需求、原型、开发、测试、发布与迭代。</p><div class="qily-ia-result">需求清单、交互原型、可运行版本、测试记录、安装／发布包与版本记录</div></article>
      <article class="qily-ia-card" data-qily-business-line="digital"><small>数智化产品交付｜06</small><h3>官网建设</h3><p>围绕品牌定位、信息架构、可信证据、内容体系、SEO、咨询转化、响应式适配及持续运维建设专业官网。</p><div class="qily-ia-result">信息架构、页面模板、响应式官网、SEO基础、咨询入口、部署与运维规范</div></article>
    </div>
    <div class="qily-ia-actions"><a class="qily-ia-button primary" href="/cooperation/">进入六类业务项目合作</a><a class="qily-ia-button" href="/cooperation/#services">查看六类业务与交付边界</a></div>
  </div>
</section>
<section class="qily-ia-section qily-ia-alt" id="qily-home-proof" data-qily-static-source="home-proof-v3">
  <div class="qily-ia-inner">
    <div class="qily-ia-heading"><span class="qily-ia-kicker">WHY QILYLEAN｜证据与交易边界</span><h2>先看交付逻辑，再看专业深度</h2><p>不以资质徽章堆砌信任，而以真实项目、脱敏佐证、交付资产、阶段节点及验收规则建立可核验的合作基础。</p></div>
    <div class="qily-ia-delivery-summary">
      <article><strong>专业基础</strong><span>制造工程、工业工程、精益改善、数智化与软件／互联网工程实践；详细年限和岗位归入履历主线。</span></article>
      <article><strong>项目证据</strong><span>代表项目按已核定、已验证、阶段估算和经验陈述分级展示。</span></article>
      <article><strong>交易机制</strong><span>六类核心业务均明确范围、交付物与验收边界；报价按具体业务成熟度、项目范围与投入独立核价。</span></article>
      <article><strong>责任边界</strong><span>网页用于沟通与能力说明，正式范围、费用、税费、周期和验收以书面方案与合同为准。</span></article>
    </div>
    <div class="qily-ia-actions"><a class="qily-ia-button primary" href="/projects/">代表项目</a><a class="qily-ia-button" href="/trust/">诚信与责任边界</a><a class="qily-ia-button" href="/projects/qilylean-commercial-deliveries/">商业交付档案</a></div>
  </div>
</section>
<!-- QILY-HOME-STATIC-COMMERCIAL:END -->`;

const COOP_SERVICES = `<section class="module-section" id="services"><div class="module-inner"><div class="module-heading"><span class="module-eyebrow">CORE BUSINESS｜制造工程交付 + 数智化产品交付</span><h2>六类核心业务</h2><p>六项业务同级纳入项目合作体系：以企业真实问题、项目范围、标准交付物、阶段节点和验收口径定义合作，不再把APP软件开发、官网建设降级为单纯“作品实证”。</p></div><div class="module-grid three" data-qily-six-core-services="v2">
  <article class="module-card service-card"><a class="service-heading-link" href="/cooperation/factory-planning/"><span class="service-number">01</span><small>Factory Planning</small><h3>新工厂／新产线规划</h3></a><p>建立产能、设备、人力、面积、物流、公辅、安全与扩展边界，形成可实施规划资产。</p><div class="scope-list"><span>产能与资源模型</span><span>Factory Layout</span><span>人流物流与仓储</span><span>设备及公辅接口</span><span>分期建设与扩展</span><span>投产爬坡计划</span></div><div class="module-result">标准交付：设计输入、产能模型、Layout方案、物流方案、设备接口清单、评审纪要与实施路线图。</div></article>
  <article class="module-card service-card"><a class="service-heading-link" href="/cooperation/lean-improvement/"><span class="service-number">02</span><small>Lean Improvement</small><h3>精益改善项目交付</h3></a><p>围绕PQCD与交付瓶颈，运用IE、VSM、单件流、SMED、OEE、线平衡和Poka-Yoke开展诊断、Pilot和标准化。</p><div class="scope-list"><span>标准工时／UPPH</span><span>VSM／LT／WIP</span><span>SMED／OEE／TPM</span><span>线平衡／人机配置</span><span>质量与防错</span><span>计划实绩闭环</span></div><div class="module-result">标准交付：质量与效率基线、问题清单、未来态方案、Pilot验证、标准作业、培训稽核与横向复制计划。</div></article>
  <article class="module-card service-card"><a class="service-heading-link" href="/cooperation/visual-management/"><span class="service-number">03</span><small>Visual Management Delivery</small><h3>目视化项目设计与交付</h3></a><p>把区域、状态、标准、责任、异常和节奏转化为现场共同语言，贯通6S、安全、质量、设备、物流、仓储、工位与DMS。</p><div class="scope-list"><span>现场勘查与诊断</span><span>目视化标准设计</span><span>清单预算与打样</span><span>制作施工协同</span><span>安装效果校核</span><span>验收维护机制</span></div><div class="module-result">标准交付：区域方案、VI与颜色语义、图纸尺寸、材料清单、预算、样板确认、施工协同与验收标准。</div></article>
  <article class="module-card service-card" data-qily-service-key="digital-factory"><a class="service-heading-link" href="/projects/digital-factory/"><span class="service-number">04</span><small>Digital Factory</small><h3>数字化工厂</h3></a><p>以业务流程和主数据为底座，打通订单、计划、工艺、工时、设备、质量、库存与现场执行，形成可实施的数智化蓝图。</p><div class="scope-list"><span>业务流程／数字化蓝图</span><span>ERP／MES／APS需求</span><span>BOM／工艺／工时主数据</span><span>设备数据／OEE</span><span>生产看板／DMS</span><span>Pilot／上线验收</span></div><div class="module-result">标准交付：现状诊断、数字化蓝图、数据字典、功能需求、接口清单、看板原型、实施路线与验收机制。</div></article>
  <article class="module-card service-card" data-qily-service-key="app-development"><a class="service-heading-link" href="/tools/times26001/"><span class="service-number">05</span><small>APP Software Development</small><h3>APP软件开发</h3></a><p>把IE测时、现场采集、异常管理、移动看板、提醒等重复的纸面或Excel操作转化为可运行软件工具。</p><div class="scope-list"><span>需求场景／产品原型</span><span>Android／iOS／Web</span><span>数据录入／统计分析</span><span>通知／权限／离线能力</span><span>测试／打包／发布</span><span>版本迭代／使用支持</span></div><div class="module-result">标准交付：需求清单、交互原型、可运行版本、测试记录、安装包／发布包、使用说明、版本清单与验收记录。</div></article>
  <article class="module-card service-card" data-qily-service-key="website-development"><a class="service-heading-link" href="/"><span class="service-number">06</span><small>Website Development</small><h3>官网建设</h3></a><p>围绕品牌定位、信息架构、可信证据、内容体系、SEO、咨询入口、移动适配、性能与持续运维建设专业官网。</p><div class="scope-list"><span>品牌定位／信息架构</span><span>UI／响应式页面</span><span>项目证据／内容体系</span><span>SEO／结构化数据</span><span>表单／邮箱／分享入口</span><span>域名／部署／持续运维</span></div><div class="module-result">标准交付：信息架构、页面模板、响应式官网、SEO基础、咨询入口、证据链、部署配置、运维规范与版本记录。</div></article>
</div></div></section>`;

function normalizeHome() {
  let home = read('index.html');
  const re = /<!-- QILY-HOME-STATIC-COMMERCIAL:START -->[\s\S]*?<!-- QILY-HOME-STATIC-COMMERCIAL:END -->/m;
  assert(re.test(home), 'Homepage commercial marker missing');
  home = home.replace(re, HOME_BLOCK);
  home = home.replace(/<meta property="og:title" content="[^"]*">/i, '<meta property="og:title" content="QilyLean｜启力精益｜六类核心业务与制造运营资产化">');
  home = home.replace(/<meta property="og:description" content="[^"]*">/i, '<meta property="og:description" content="QilyLean六类核心业务：新工厂／新产线规划、精益改善项目交付、目视化项目设计与交付、数字化工厂、APP软件开发、官网建设。">');
  home = home.replace('"name":"QilyLean三大核心业务"', '"name":"QilyLean六类核心业务"');
  home = home.replace('"serviceType":["新工厂／新产线规划","精益改善项目交付","目视化项目设计与交付"]', '"serviceType":["新工厂／新产线规划","精益改善项目交付","目视化项目设计与交付","数字化工厂","APP软件开发","官网建设"]');
  home = home.replace('<a href="/links/network/"><strong>产业资源协同网络</strong><span>建设阶段的可信资源、需求匹配与协同交付入口。</span></a>', '<a href="/links/"><strong>友情链接</strong><span>全球科技企业官网入口、可信资源导航与产业协同网络。</span></a>');
  home = home.replace('<a href="/cooperation/">项目合作</a>\n      <a href="/trust/">信任中心</a>', '<a href="/links/">友情链接</a>\n      <a href="/cooperation/">项目合作</a>\n      <a href="/trust/">信任中心</a>');
  write('index.html', home);
}

function normalizeCooperation() {
  let html = read('cooperation/index.html');
  const serviceRe = /<section class="module-section" id="services">[\s\S]*?<\/section>/m;
  assert(serviceRe.test(html), 'Cooperation services section missing');
  html = html.replace(serviceRe, COOP_SERVICES);
  html = html.replace(/\n<section class="module-section alt" id="engineering-enablers">[\s\S]*?<\/section>\s*/m, '\n');
  html = html.replace(/<title>[^<]*<\/title>/i, '<title>项目合作｜QilyLean六类核心业务与项目交付</title>');
  html = html.replace(/<meta name="description" content="[^"]*">/i, '<meta name="description" content="QilyLean六类核心业务项目合作：新工厂／新产线规划、精益改善项目交付、目视化项目设计与交付、数字化工厂、APP软件开发、官网建设。">');
  html = html.replace(/<meta property="og:title" content="[^"]*">/i, '<meta property="og:title" content="QilyLean项目合作｜六类核心业务与项目交付">');
  html = html.replace('<a href="/cooperation/" aria-current="page">项目合作</a>\n      <a href="/trust/">信任中心</a>', '<a href="/links/">友情链接</a>\n      <a href="/cooperation/" aria-current="page">项目合作</a>\n      <a href="/trust/">信任中心</a>');
  write('cooperation/index.html', html);
}

function normalizeNav() {
  let nav = read('site-navigation-core.js');
  if (!nav.includes("['友情链接', '/links/']")) {
    nav = nav.replace("    ['项目合作', '/cooperation/'],", "    ['友情链接', '/links/'],\n    ['项目合作', '/cooperation/'],");
  }
  if (!nav.includes("if (path.indexOf('/links/') === 0) return '/links/';")) {
    nav = nav.replace("    if (path.indexOf('/cooperation/') === 0) return '/cooperation/';", "    if (path.indexOf('/links/') === 0) return '/links/';\n    if (path.indexOf('/cooperation/') === 0) return '/cooperation/';");
  }
  write('site-navigation-core.js', nav);
}

function normalizeTaxonomy() {
  const doc = `# QilyLean全站业务口径规范｜2026-08-17\n\n- **六类核心业务**：①新工厂／新产线规划；②精益改善项目交付；③目视化项目设计与交付；④数字化工厂；⑤APP软件开发；⑥官网建设。\n- **两大业务主线**：01–03为制造工程交付，04–06为数智化产品交付；六项业务同级进入官网业务总览、项目合作、报价与证据体系。\n- **名称锁定**：业务名称统一使用以上六项原名。不得以“QilyLean AI／APP”替代“APP软件开发”，不得以“QilyLean官网”替代“官网建设”。QilyLean AI、Times26001、QilyLean Home及本官网可以作为作品／案例证明，但不能弱化或改名对应业务。\n- **友情链接**：/links/ 为正式资源模块，保留全球科技企业官网入口及产业资源协同内容，并在全站主导航与首页资源入口保持可见。\n\n## 项目合作与报价\n\n六类业务均可按真实项目范围定义输入、交付物、阶段节点与验收边界。报价模块须覆盖六类业务；已有成熟参考价继续保留，数字化工厂、APP软件开发、官网建设按范围、功能、工作量、第三方费用与验收条件独立核价，不得因为缺少统一套餐价而降级为“非业务”或“仅作品实证”。\n\n## 防回退规则\n\n静态HTML、导航、SEO/Schema、项目合作、报价运行时、生成脚本与CI必须使用同一六类业务口径。任何自动化不得把六类业务回写为“三大核心业务 + 增强能力／自主作品”的业务分类。\n\n**规范版本：2026-08-17 / Six-Core Business Architecture v2**\n`;
  write('docs/QilyLean全站业务口径规范_20260809.md', doc);
}

normalizeHome();
normalizeCooperation();
normalizeNav();
normalizeTaxonomy();

const home = read('index.html');
const coop = read('cooperation/index.html');
const nav = read('site-navigation-core.js');
for (const name of SIX) {
  assert(home.includes(`<h3>${name}</h3>`), `Homepage business missing: ${name}`);
  assert(coop.includes(`<h3>${name}</h3>`), `Cooperation business missing: ${name}`);
}
assert(home.includes('data-qily-six-core-services="v2"'), 'Homepage six-core marker missing');
assert(coop.includes('data-qily-six-core-services="v2"'), 'Cooperation six-core marker missing');
assert(!home.includes('<h2>三大核心业务</h2>'), 'Three-core homepage classification returned');
assert(!coop.includes('<h2>三大核心业务</h2>'), 'Three-core cooperation classification returned');
assert(nav.includes("['友情链接', '/links/']"), 'Friend Links primary navigation missing');
assert(home.includes('<strong>友情链接</strong>'), 'Homepage Friend Links resource entry missing');
process.stdout.write('Six-core business architecture, APP/website business standing, and Friend Links visibility restored.\n');
