#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8'); }
function write(rel, content){
  const file = path.join(root, rel);
  const next = content.endsWith('\n') ? content : content + '\n';
  const before = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if(before === next) return false;
  fs.writeFileSync(file, next, 'utf8');
  return true;
}
function esc(v){ return String(v).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
function marker(start,end){ return new RegExp(`<!-- ${esc(start)} -->[\\s\\S]*?<!-- ${esc(end)} -->`,'m'); }
function replaceMarker(html,start,end,block){
  const re = marker(start,end);
  if(!re.test(html)) throw new Error(`Missing marker ${start}`);
  return html.replace(re,block);
}
function upsertNamedMeta(html,name,value){
  const tag=`<meta name="${name}" content="${value}">`;
  const re=new RegExp(`<meta\\s+[^>]*name=["']${esc(name)}["'][^>]*>`,'i');
  return re.test(html)?html.replace(re,tag):html.replace(/<\/head>/i,`  ${tag}\n</head>`);
}
function upsertPropertyMeta(html,name,value){
  const tag=`<meta property="${name}" content="${value}">`;
  const re=new RegExp(`<meta\\s+[^>]*property=["']${esc(name)}["'][^>]*>`,'i');
  return re.test(html)?html.replace(re,tag):html.replace(/<\/head>/i,`  ${tag}\n</head>`);
}
function upsertTitle(html,value){
  const tag=`<title>${value}</title>`;
  return /<title>[\s\S]*?<\/title>/i.test(html)?html.replace(/<title>[\s\S]*?<\/title>/i,tag):html.replace(/<\/head>/i,`  ${tag}\n</head>`);
}

const HOME_BLOCK=`<!-- QILY-HOME-STATIC-COMMERCIAL:START -->
<section class="qily-ia-section" id="qily-core-services" data-qily-static-source="home-core-v2" data-qily-six-core-services="v1">
  <div class="qily-ia-inner">
    <div class="qily-ia-heading"><span class="qily-ia-kicker">COOPERATION CAPABILITIES｜核心项目交付 + 数智化技术能力</span><h2>六类项目合作能力｜三类核心项目交付 + 三项数智化产品与技术能力</h2><p>前三类核心项目交付直接解决工厂、产线与现场运营问题；后三项数智化产品与技术能力把制造业务逻辑进一步沉淀为数字化系统、软件工具与专业互联网载体。六类项目合作能力统一遵循问题定义、事实基线、方案／原型、Pilot／测试、实绩验证、标准固化与项目验收。</p></div>
    <div class="qily-ia-grid">
      <article class="qily-ia-card" data-qily-business-line="manufacturing"><small>核心项目交付｜01</small><h3>新工厂／新产线规划</h3><p>从产品、工艺、产能、设备、物流、公辅、品质和扩展边界出发，形成可评审、可实施的规划资产。</p><div class="qily-ia-result">产能模型、Layout、物流与库位、公辅接口、实施路线图</div></article>
      <article class="qily-ia-card" data-qily-business-line="manufacturing"><small>核心项目交付｜02</small><h3>精益改善项目交付</h3><p>围绕PQCD与交付瓶颈，以VSM、标准工时、线平衡、SMED、OEE、质量防错及计划实绩闭环开展诊断、Pilot与标准化。</p><div class="qily-ia-result">基线诊断、Pilot方案、改善数据、标准文件、结案验收</div></article>
      <article class="qily-ia-card" data-qily-business-line="manufacturing"><small>核心项目交付｜03</small><h3>目视化项目设计与交付</h3><p>把区域、状态、责任、标准和异常转化为现场共同语言，兼顾设计、材料、施工协同和验收。</p><div class="qily-ia-result">现场勘查、视觉标准、设计图、材料清单、打样、实施与验收</div></article>
      <article class="qily-ia-card" data-qily-business-line="digital"><small>数智化产品与技术能力｜04</small><h3>数字化工厂</h3><p>以业务流程和可信主数据为底座，规划ERP／MES／APS、设备数据、生产透明化、管理看板与实施路线。</p><div class="qily-ia-result">数字化蓝图、数据口径、功能／接口需求、看板原型、Pilot与验收机制</div></article>
      <article class="qily-ia-card" data-qily-business-line="digital"><small>数智化产品与技术能力｜05</small><h3>APP软件开发</h3><p>面向IE测时、现场采集、异常管理、移动看板、提醒及轻量化管理场景，完成需求、原型、开发、测试、发布与迭代。</p><div class="qily-ia-result">需求清单、交互原型、可运行版本、测试记录、安装／发布包与版本记录</div></article>
      <article class="qily-ia-card" data-qily-business-line="digital"><small>数智化产品与技术能力｜06</small><h3>官网建设</h3><p>围绕品牌定位、信息架构、可信证据、内容体系、SEO、咨询转化、响应式适配及持续运维建设专业官网。</p><div class="qily-ia-result">信息架构、页面模板、响应式官网、SEO基础、咨询入口、部署与运维规范</div></article>
    </div>
    <div class="qily-ia-actions"><a class="qily-ia-button primary" href="/cooperation/">进入项目合作</a><a class="qily-ia-button" href="/cooperation/#services">查看六类项目合作能力与交付边界</a></div>
  </div>
</section>
<section class="qily-ia-section qily-ia-alt" id="qily-home-proof" data-qily-static-source="home-proof-v2">
  <div class="qily-ia-inner">
    <div class="qily-ia-heading"><span class="qily-ia-kicker">WHY QILYLEAN｜证据与交易边界</span><h2>先看交付逻辑，再看专业深度</h2><p>不以资质徽章堆砌信任，而以真实项目、脱敏佐证、交付资产、阶段节点及验收规则建立可核验的合作基础。</p></div>
    <div class="qily-ia-delivery-summary">
      <article><strong>专业基础</strong><span>制造工程、工业工程、精益改善与数智化实践；详细年限和岗位归入履历主线。</span></article>
      <article><strong>项目证据</strong><span>代表项目按已核定、已验证、阶段估算和经验陈述分级展示。</span></article>
      <article><strong>交易机制</strong><span>六类项目合作能力均明确范围、交付物与验收边界；现有合同范本与专项报价按具体业务成熟度及项目范围配置。</span></article>
      <article><strong>责任边界</strong><span>网页用于沟通与能力说明，正式范围、费用、税费、周期和验收以书面方案与合同为准。</span></article>
    </div>
    <div class="qily-ia-actions"><a class="qily-ia-button primary" href="/projects/">代表项目</a><a class="qily-ia-button" href="/trust/">诚信与责任边界</a><a class="qily-ia-button" href="/projects/qilylean-commercial-deliveries/">商业交付档案</a></div>
  </div>
</section>
<!-- QILY-HOME-STATIC-COMMERCIAL:END -->`;

const COOP_SERVICES=`<section class="module-section" id="services"><div class="module-inner"><div class="module-heading"><h2>六类项目合作能力</h2><p>六类能力采用“3+3”结构：前三类为核心项目交付，后三项为数智化产品与技术能力；不销售泛化概念，以企业真实问题、项目范围、标准交付物和验收口径定义合作。</p></div><div class="module-grid three" data-qily-six-core-services="v1">
      <article class="module-card service-card"><a class="service-heading-link" href="/cooperation/factory-planning/" aria-label="进入新工厂／新产线规划独立业务页"><span class="service-number">01</span><small>Factory Planning</small><h3>新工厂／新产线规划</h3></a><p>从产品组合、需求预测和工艺路线出发，建立产能、设备、人力、面积、物流、公辅、安全与扩展边界，避免“先摆设备、后反复搬迁”。</p><div class="scope-list"><span>产能与资源模型</span><span>Factory Layout</span><span>人流物流与仓储</span><span>设备及公辅接口</span><span>分期建设与扩展</span><span>投产爬坡计划</span></div><div class="module-result">标准交付：设计输入、产能模型、Layout方案、物流方案、设备接口清单、评审纪要与实施路线图。</div><div class="service-contract"><div class="service-contract-meta"><strong>匹配合同范本</strong><span>核心项目交付</span></div><a class="service-contract-link" href="/cooperation/factory-planning/">查看独立业务页与合同范本</a></div></article>
      <article class="module-card service-card"><a class="service-heading-link" href="/cooperation/lean-improvement/" aria-label="进入精益改善项目交付独立业务页"><span class="service-number">02</span><small>Lean Improvement</small><h3>精益改善项目交付</h3></a><p>以质量为贯穿主线，围绕PQCD与交付瓶颈，运用IE、VSM、单件流、SMED、OEE、线平衡和Poka-Yoke开展诊断与试点；任何效率、成本和交付改善，均以合格产出、过程稳定和客户风险受控为验收前提。</p><div class="scope-list"><span>标准工时／UPPH</span><span>VSM／LT／WIP</span><span>SMED／OEE／TPM</span><span>线平衡／人机配置</span><span>质量与防错</span><span>ERP/MES基础数据</span></div><div class="module-result">标准交付：质量与效率基线、问题清单、未来态方案、Pilot验证、标准作业、质量防错、培训稽核与横向复制计划。</div><div class="service-contract"><div class="service-contract-meta"><strong>匹配合同范本</strong><span>核心项目交付</span></div><a class="service-contract-link" href="/cooperation/lean-improvement/">查看独立业务页与合同范本</a></div></article>
      <article class="module-card service-card"><a class="service-heading-link" href="/cooperation/visual-management/" aria-label="进入目视化项目设计与交付独立业务页"><span class="service-number">03</span><small>Visual Management Delivery</small><h3>目视化项目设计与交付</h3></a><p>把区域、状态、标准、责任、异常和节奏转化为现场共同语言，贯通6S、安全、质量、设备、物流、仓储、工位与DMS管理。</p><div class="scope-list"><span>现场勘查与诊断</span><span>目视化标准设计</span><span>清单预算与打样</span><span>制作施工协同</span><span>安装效果校核</span><span>验收维护机制</span></div><div class="module-result">标准交付：区域方案、VI与颜色语义、图纸尺寸、材料清单、预算、样板确认、施工协同与验收标准。</div><div class="service-contract"><div class="service-contract-meta"><strong>匹配合同范本</strong><span>核心项目交付</span></div><a class="service-contract-link" href="/cooperation/visual-management/">查看独立业务页与合同范本</a></div></article>
      <article class="module-card service-card" data-qily-service-key="digital-factory"><a class="service-heading-link" href="/projects/digital-factory/" aria-label="查看数字化工厂规划与数据治理项目证据"><span class="service-number">04</span><small>Digital Factory</small><h3>数字化工厂</h3></a><p>以业务流程和主数据为底座，打通订单、计划、工艺、工时、设备、质量、库存与现场执行，围绕ERP／MES／APS、设备数据、生产透明化和管理看板形成可实施的数字化蓝图。</p><div class="scope-list"><span>业务流程／数字化蓝图</span><span>ERP／MES／APS需求</span><span>BOM／工艺／工时主数据</span><span>设备数据／OEE</span><span>生产看板／DMS</span><span>Pilot／上线验收</span></div><div class="module-result">标准交付：现状诊断、数字化蓝图、数据字典与口径、功能需求、接口清单、看板原型、实施路线、Pilot验证与验收机制。</div><div class="service-contract"><div class="service-contract-meta"><strong>相关成果证据</strong><span>数智化产品与技术能力</span></div><a class="service-contract-link" href="/projects/digital-factory/">查看数字化工厂项目证据</a></div></article>
      <article class="module-card service-card" data-qily-service-key="app-development"><a class="service-heading-link" href="/tools/times26001/" aria-label="查看APP软件开发实证作品Times26001"><span class="service-number">05</span><small>APP Software Development</small><h3>APP软件开发</h3></a><p>围绕IE测时、现场采集、异常记录、移动看板、提醒与轻量化管理等制造场景，把重复的纸面或Excel操作转化为可运行的软件工具；从需求、原型、开发、测试到安装包、发布与版本迭代形成闭环。</p><div class="scope-list"><span>需求场景／产品原型</span><span>Android／iOS／Web</span><span>数据录入／统计分析</span><span>通知／权限／离线能力</span><span>测试／打包／发布</span><span>版本迭代／使用支持</span></div><div class="module-result">标准交付：需求清单、交互原型、可运行版本、测试记录、安装包／发布包、使用说明、版本清单与验收记录。</div><div class="service-contract"><div class="service-contract-meta"><strong>当前实证作品</strong><span>Times26001</span></div><a class="service-contract-link" href="/tools/times26001/">查看APP软件开发实证</a></div></article>
      <article class="module-card service-card" data-qily-service-key="website-development"><a class="service-heading-link" href="/" aria-label="查看QilyLean官网建设实证"><span class="service-number">06</span><small>Website Development</small><h3>官网建设</h3></a><p>不把官网当作单纯页面装修，而是围绕品牌定位、信息架构、可信证据、内容体系、SEO、咨询入口、移动适配、性能与持续运维，建设能够解释能力、承接咨询并沉淀专业资产的企业或个人专业官网。</p><div class="scope-list"><span>品牌定位／信息架构</span><span>UI／响应式页面</span><span>项目证据／内容体系</span><span>SEO／结构化数据</span><span>表单／邮箱／分享入口</span><span>域名／部署／持续运维</span></div><div class="module-result">标准交付：信息架构、页面模板、响应式官网、SEO基础、咨询入口、证据链、部署配置、运维规范与版本记录。</div><div class="service-contract"><div class="service-contract-meta"><strong>当前实证作品</strong><span>QilyLean官网</span></div><a class="service-contract-link" href="/">查看QilyLean官网建设实证</a></div></article>
    </div></div></section>`;

const BOUNDARY=`<style id="qilySixBoundaryGrid20260808">
.cooperation-page #boundary .boundary-service-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:22px!important}
@media(max-width:820px){.cooperation-page #boundary .boundary-service-grid{grid-template-columns:1fr!important}}
</style>
<section class="module-section" id="boundary"><div class="module-inner"><div class="module-heading"><h2>六类项目合作边界</h2><p>新工厂／新产线规划、精益改善、目视化、数字化工厂、APP软件开发与官网建设的输入条件、专业责任和验收口径不同，须按项目类型分别定义范围，不以一套边界概括全部业务。</p></div><div class="boundary boundary-service-grid" data-qily-boundary-version="v4" data-qily-six-service-boundary="v1">
<article class="boundary-service-card qily-static-card"><span class="boundary-type">01｜新工厂／新产线规划</span><h3>规划输入与专业边界</h3><div class="boundary-split"><div><strong>适合启动</strong><ul><li>产品组合、工艺路线、产能需求及分期目标已有初步依据。</li><li>可提供场地／厂房约束、设备、公辅、物流、仓储、品质、安全和扩展输入。</li><li>决策团队能够评审规划假设，并书面确认输入变化与阶段结论。</li></ul></div><div class="boundary-hold"><strong>暂缓启动</strong><ul><li>只要求漂亮Layout或渲染图，却不提供产品、工艺和产能输入。</li><li>场地、预算、建设阶段尚未明确，却要求直接给出最终面积与投资结论。</li><li>要求规划咨询替代建筑、消防、环保、安全、结构或机电等法定设计与审批。</li></ul></div></div><p class="boundary-note"><strong>专业边界：</strong>交付设计输入、产能模型、功能分区、Layout、物流与实施路线；不替代具备相应资质单位出具的施工图、专项设计及法定审查。</p></article>
<article class="boundary-service-card qily-static-card"><span class="boundary-type">02｜精益改善项目</span><h3>基线、试点与收益边界</h3><div class="boundary-split"><div><strong>适合启动</strong><ul><li>存在明确的效率、质量、交付、成本、换型、设备或数据治理问题。</li><li>允许基于真实现场和数据建立基线，并配置内部项目负责人。</li><li>具备Pilot试点资源，管理层可参与阶段评审与验收。</li></ul></div><div class="boundary-hold"><strong>暂缓启动</strong><ul><li>只希望免费取得完整方案、测算模型或可直接复制的项目文件。</li><li>无数据权限、无内部负责人，也不具备试点与复核条件。</li><li>尚未建立事实基线，却要求预先承诺绝对收益或固定改善比例。</li></ul></div></div><p class="boundary-note"><strong>专业边界：</strong>改善结果须通过基线、Pilot、过程记录和验收数据验证；历史案例不构成新项目的必然收益承诺。</p></article>
<article class="boundary-service-card qily-static-card"><span class="boundary-type">03｜目视化项目</span><h3>标准、内容与实施边界</h3><div class="boundary-split"><div><strong>适合启动</strong><ul><li>区域、状态、责任、标准、异常和管理节奏已有明确需求。</li><li>支持现场勘查、内容校对、样板确认、制作施工协同与效果验收。</li><li>企业内部能够指定内容责任人，并持续维护数据与执行标准。</li></ul></div><div class="boundary-hold"><strong>暂缓启动</strong><ul><li>仅追求装饰效果，却没有管理标准、责任机制和实际应用场景。</li><li>内容未经责任部门确认，就要求直接制作或大批量安装。</li><li>希望仅靠看板、标识和颜色替代现场管理、稽核与问题闭环。</li></ul></div></div><p class="boundary-note"><strong>专业边界：</strong>交付现场诊断、视觉标准、图纸尺寸、材料清单、样板和实施协同；目视化工具不替代企业日常管理责任。</p></article>
<article class="boundary-service-card qily-static-card"><span class="boundary-type">04｜数字化工厂</span><h3>系统、数据与实施边界</h3><div class="boundary-split"><div><strong>适合启动</strong><ul><li>核心业务流程和管理痛点已有初步梳理，并存在ERP、MES、APS、设备数据采集或生产透明化需求。</li><li>可提供产品、BOM、工艺、工时、产能、设备、质量、库存等基础数据及现有系统接口信息。</li><li>企业能够指定业务与IT项目负责人，并协调软件厂商参与Pilot、接口确认、上线验证和阶段验收。</li></ul></div><div class="boundary-hold"><strong>暂缓启动</strong><ul><li>希望仅购买一套软件就自动解决流程、数据、执行和管理问题。</li><li>主数据、业务规则和责任边界尚未梳理，却要求直接承诺全系统上线效果、固定周期或绝对ROI。</li><li>要求QilyLean替代ERP／MES／APS厂商承担底层产品开发、许可证销售、网络安全、云资源或长期系统运维。</li></ul></div></div><p class="boundary-note"><strong>专业边界：</strong>交付现状诊断、业务流程与数据口径、数字化蓝图、功能与接口需求、看板需求、实施路线、Pilot验证及验收机制；不替代软件厂商承担底层产品研发、代码交付、许可证销售、信息安全及长期运维责任。</p></article>
<article class="boundary-service-card qily-static-card"><span class="boundary-type">05｜APP软件开发</span><h3>需求、版本与发布边界</h3><div class="boundary-split"><div><strong>适合启动</strong><ul><li>已有明确使用场景、核心用户、关键流程和必须解决的问题。</li><li>能够确认目标平台、数据来源、权限、通知、离线及发布方式等关键约束。</li><li>接受通过原型、测试版和验收版分阶段评审，并提供真实使用反馈。</li></ul></div><div class="boundary-hold"><strong>暂缓启动</strong><ul><li>只有一句“做个APP”的概念，却没有用户、流程、数据和验收需求。</li><li>需求持续无边界扩张，同时要求固定周期、固定价格且不限修改。</li><li>涉及支付、金融、医疗、地图、短信等第三方能力，却不提供合法账号、资质、费用或接口条件。</li></ul></div></div><p class="boundary-note"><strong>专业边界：</strong>按确认需求交付原型、可运行版本、测试与发布资料；应用商店审核、第三方平台政策、账号资质及外部接口可用性受平台规则约束，不承诺由QilyLean单方决定的审核结果。</p></article>
<article class="boundary-service-card qily-static-card"><span class="boundary-type">06｜官网建设</span><h3>内容、可信度与运维边界</h3><div class="boundary-split"><div><strong>适合启动</strong><ul><li>品牌定位、目标客户、核心业务、案例证据和咨询转化目标已有基本方向。</li><li>能够提供合法使用的文字、图片、商标、资质、项目证据及联系方式。</li><li>愿意持续维护内容、域名、邮箱、表单、证书与第三方服务账号。</li></ul></div><div class="boundary-hold"><strong>暂缓启动</strong><ul><li>只追求“高端好看”，却没有可信内容、业务逻辑和持续更新机制。</li><li>要求虚构客户、资质、案例、评价或夸大未经验证的经营与项目成果。</li><li>要求网站建设方永久承担域名、服务器、第三方平台、备案或外部服务的全部政策风险。</li></ul></div></div><p class="boundary-note"><strong>专业边界：</strong>交付信息架构、页面与交互、响应式适配、SEO基础、咨询入口、部署与运维规范；客户提供内容及资质须真实合法，备案、搜索收录、第三方审核与外部服务可用性按对应平台规则执行。</p></article>
</div></div></section>`;

function homeSchema(){
  return `<!-- QILY-HOME-STATIC-SCHEMA:START -->\n<script type="application/ld+json">${JSON.stringify({
    '@context':'https://schema.org','@graph':[
      {'@type':'WebSite',name:'QilyLean｜启力精益',url:'https://qilylean.com/',description:'围绕制造工程交付与数智化产品交付，提供三类核心项目交付（新工厂／新产线规划、精益改善、目视化）与三项数智化产品与技术能力（数字化工厂、APP软件开发、官网建设），合计六类项目合作能力。'},
      {'@type':'Person',name:'丁启利',url:'https://qilylean.com/',jobTitle:'制造工程、精益改善与数智化项目实践者',knowsAbout:['新工厂规划','精益改善','工业工程','VSM','标准工时','OEE','SMED','目视化管理','ERP/MES/APS','APP软件开发','官网建设']},
      {'@type':'Service',name:'QilyLean六类项目合作能力',provider:{'@type':'Person',name:'丁启利'},areaServed:'中国',serviceType:['新工厂／新产线规划','精益改善项目交付','目视化项目设计与交付','数字化工厂','APP软件开发','官网建设']}
    ]
  })}</script>\n<!-- QILY-HOME-STATIC-SCHEMA:END -->`;
}

function patchHome(html){
  html=replaceMarker(html,'QILY-HOME-STATIC-COMMERCIAL:START','QILY-HOME-STATIC-COMMERCIAL:END',HOME_BLOCK);
  html=replaceMarker(html,'QILY-HOME-STATIC-SCHEMA:START','QILY-HOME-STATIC-SCHEMA:END',homeSchema());
  html=upsertTitle(html,'QilyLean｜启力精益｜精益生产、工程改善与数智工厂');
  html=upsertNamedMeta(html,'description','QilyLean｜启力精益围绕制造工程交付与数智化产品交付，提供新工厂／新产线规划、精益改善、目视化项目、数字化工厂、APP软件开发与官网建设六类项目合作能力。');
  html=upsertPropertyMeta(html,'og:title','QilyLean｜启力精益｜六类项目合作能力');
  html=upsertPropertyMeta(html,'og:description','三类核心项目交付 + 三项数智化产品与技术能力，合计六类项目合作能力。');
  html=upsertNamedMeta(html,'twitter:description','QilyLean形成三类核心项目交付（新工厂规划、精益改善、目视化）与三项数智化产品与技术能力（数字化工厂、APP软件开发、官网建设），合计六类项目合作能力。');
  html=html
    .replace(/制造改善项目交付｜新工厂规划｜精益改善｜目视化实施/g,'三类核心项目交付｜三项数智化产品与技术能力｜六类项目合作能力')
    .replace(/QilyLean｜启力精益由丁启利发起，依托20年制造工程与精益改善实践，为制造企业提供三类核心服务。项目以现场诊断、范围确认、方案设计、Pilot验证、标准固化和验收闭环推进；具体交付物、周期、费用、分阶段付款比例与验收条件以对应合同及正式约定为准。/g,'QilyLean｜启力精益由丁启利发起，形成三类核心项目交付与三项数智化产品与技术能力，合计六类项目合作能力。项目以问题定义、事实基线、方案／原型、Pilot／测试、实绩验证、标准固化和验收闭环推进；具体范围、周期、费用、交付物及验收条件以书面方案与正式合同为准。')
    .replace(/查看三大核心业务与交付/g,'查看六类项目合作能力与交付')
    .replace(/PLATFORM EXTENSION｜三大项目之外的平台扩展价值/g,'PLATFORM EXTENSION｜六类项目合作能力之外的平台扩展价值')
    .replace(/不与三大核心商业服务争夺首页主视觉/g,'不与六类项目合作能力争夺首页主视觉');
  return html;
}

function patchCooperation(html){
  html=upsertTitle(html,'项目合作｜QilyLean六类项目合作能力');
  html=upsertNamedMeta(html,'description','QilyLean提供六类项目合作能力项目合作：新工厂／新产线规划、精益改善、目视化设计交付、数字化工厂、APP软件开发与官网建设，通过诊断、方案、Pilot／测试、验证、固化和验收形成项目闭环。');
  html=upsertPropertyMeta(html,'og:title','QilyLean项目合作｜六类项目合作能力');
  html=upsertPropertyMeta(html,'og:description','三类核心项目交付 + 三项数智化产品与技术能力，合计六类项目合作能力；以范围、交付物、Pilot／测试、验证和验收定义合作。');

  const serviceRe=/<section class="module-section" id="services">[\s\S]*?<\/section>/m;
  if(!serviceRe.test(html)) throw new Error('Cooperation services section missing');
  html=html.replace(serviceRe,COOP_SERVICES);

  const boundaryRe=/(?:<style id="qily(?:Four|Six)BoundaryGrid[^>]*>[\s\S]*?<\/style>\s*)?<section class="module-section" id="boundary">[\s\S]*?<\/section>/m;
  if(!boundaryRe.test(html)) throw new Error('Cooperation boundary section missing');
  html=html.replace(boundaryRe,BOUNDARY);

  html=html
    .replace(/<div class="module-heading"><h2>合作启动路径<\/h2><p>先判断问题是否匹配，再通过现场诊断明确范围、事实基线、(?:概念方向、)?交付深度与验收边界。<\/p><\/div>/g,'<div class="module-heading"><h2>合作启动路径与公开报价边界</h2><p>六类项目合作能力均按项目边界定义合作；官网仅公开前期合作入口及价格边界，正式项目须在明确范围、投入、交付物和验收标准后独立报价。</p></div>')
    .replace(/<p class="fine-print"><strong>价格边界：<\/strong>[\s\S]*?<\/p>/g,'<p class="fine-print"><strong>公开报价说明：</strong>¥6,800仅对应约定范围内的小范围现场诊断与概念级方案构思，不代表六类项目合作能力任一完整专项合作总价。新工厂／新产线规划、精益改善、目视化、数字化工厂、APP软件开发及官网建设，均须根据实际需求明确项目范围、周期、现场投入、技术复杂度、交付物、修改轮次及验收标准，并通过书面项目方案和正式合同独立报价。</p>')
    .replace(/QILY-PRICING-POLICY｜仅公开诊断级入口价格；Factory Layout、精益改善、目视化等完整项目均按范围独立报价，不在公网展示统一总价。/g,'QILY-PRICING-POLICY｜仅公开诊断级入口价格；六类项目合作能力的完整合作均按范围、投入、交付物和验收标准独立报价，不在公网展示统一总价。')
    .replace(/面向制造企业提供新工厂规划、数字化工厂规划与数据治理、精益改善及目视化项目交付服务。/g,'围绕制造工程交付与数智化产品交付，提供新工厂／新产线规划、精益改善、目视化项目、数字化工厂、APP软件开发与官网建设六类项目合作能力。');
  return html;
}

function patchFallbackJs(src){
  src=src
    .replace(/QilyLean｜新工厂规划、精益改善与目视化项目交付/g,'QilyLean｜启力精益｜精益生产、工程改善与数智工厂')
    .replace(/QilyLean由丁启利发起，面向制造企业提供新工厂与新产线规划、精益改善项目及目视化实施协同；以现场诊断、交付资产、分阶段节点和验收闭环为主线。/g,'QilyLean围绕制造工程交付与数智化产品交付，提供三类核心项目交付（新工厂／新产线规划、精益改善、目视化）与三项数智化产品与技术能力（数字化工厂、APP软件开发、官网建设），合计六类项目合作能力。')
    .replace(/制造改善项目交付｜新工厂规划｜精益改善｜目视化实施/g,'三类核心项目交付｜三项数智化产品与技术能力｜六类项目合作能力')
    .replace(/为制造企业提供三类核心服务/g,'围绕两大业务主线形成六类项目合作能力')
    .replace(/查看三大核心业务与交付/g,'查看六类项目合作能力与交付')
    .replace(/title:'三类核心业务'/g,"title:'六类项目合作能力｜三类核心项目交付 + 三项数智化产品与技术能力'")
    .replace(/三类核心业务均设置交付物、项目阶段、合同范本、付款节点和验收边界。/g,'六类项目合作能力均明确范围、交付物与验收边界；合同范本及专项报价按具体业务成熟度与项目范围配置。')
    .replace(/不与三大核心商业服务争夺首页主视觉/g,'不与六类项目合作能力争夺首页主视觉');
  return src;
}

function patchMaterializer(src){
  const fn=`function buildHomeCommercialBlock() {\n  return \`${HOME_BLOCK.replace(/`/g,'\\`')}\`;\n}\n`;
  const re=/function buildHomeCommercialBlock\(\) \{[\s\S]*?\n\}\n\nfunction buildHomeTail/m;
  if(!re.test(src)) throw new Error('buildHomeCommercialBlock function missing');
  src=src.replace(re,fn+'\nfunction buildHomeTail');

  src=src
    .replace(/QilyLean｜新工厂规划、精益改善与目视化项目交付/g,'QilyLean｜启力精益｜精益生产、工程改善与数智工厂')
    .replace(/QilyLean由丁启利发起，面向制造企业提供新工厂与新产线规划、精益改善项目及目视化实施协同；以现场诊断、交付资产、分阶段节点和验收闭环为主线。/g,'QilyLean围绕制造工程交付与数智化产品交付，提供三类核心项目交付（新工厂／新产线规划、精益改善、目视化）与三项数智化产品与技术能力（数字化工厂、APP软件开发、官网建设），合计六类项目合作能力。')
    .replace(/把复杂制造问题转化为可测量、可验证、可交付的改善项目；聚焦新工厂规划、精益改善与目视化实施。/g,'三类核心项目交付 + 三项数智化产品与技术能力，合计六类项目合作能力。')
    .replace(/QilyLean聚焦新工厂规划、精益改善项目交付与目视化实施，以交付资产、阶段付款和验收闭环定义合作。/g,'QilyLean围绕制造工程交付与数智化产品交付，以范围、交付物、Pilot／测试、验证和验收定义六类项目合作能力合作。')
    .replace(/制造改善项目交付｜新工厂规划｜精益改善｜目视化实施/g,'三类核心项目交付｜三项数智化产品与技术能力｜六类项目合作能力')
    .replace(/为制造企业提供三类核心服务/g,'围绕两大业务主线形成六类项目合作能力')
    .replace(/查看三大核心业务与交付/g,'查看六类项目合作能力与交付')
    .replace(/不与三大核心商业服务争夺首页主视觉/g,'不与六类项目合作能力争夺首页主视觉');
  return src;
}

function patchPricingScript(src){
  return src
    .replace(/Factory Layout、精益改善、目视化等完整项目均按范围独立报价/g,'六类项目合作能力的完整合作均按范围、投入、交付物和验收标准独立报价')
    .replace(/<h2>合作启动路径<\/h2><p>先判断问题是否匹配，再通过现场诊断明确范围、事实基线、概念方向、交付深度与验收边界。<\/p>/g,'<h2>合作启动路径与公开报价边界</h2><p>六类项目合作能力均按项目边界定义合作；官网仅公开前期合作入口及价格边界，正式项目须在明确范围、投入、交付物和验收标准后独立报价。</p>')
    .replace(/¥6,800仅对应小范围现场诊断与概念级方案构思，不代表完整Factory Layout、精益改善或目视化项目总价。正式项目的范围、周期、图纸／模型深度、修改轮次、现场投入、交付物、付款节点与验收标准，均在诊断后通过书面方案和正式合同确认并独立报价。/g,'¥6,800仅对应约定范围内的小范围现场诊断与概念级方案构思，不代表六类项目合作能力任一完整专项合作总价。六类项目合作能力均须根据实际需求明确范围、周期、投入、技术复杂度、交付物、修改轮次及验收标准，并通过书面项目方案和正式合同独立报价。')
    .replace(/<h2>合作启动路径<\/h2>/g,'<h2>合作启动路径与公开报价边界</h2>');
}

function validate(home,coop){
  const forbiddenHome=['三类核心业务','三大核心业务','三类核心服务','查看三大核心业务与交付','三大项目之外的平台扩展价值'];
  const forbiddenCoop=['<h2>三大核心业务</h2>','<h2>四类项目合作边界</h2>'];
  forbiddenHome.forEach(v=>{ if(home.includes(v)) throw new Error(`Homepage legacy core-business wording remains: ${v}`); });
  forbiddenCoop.forEach(v=>{ if(coop.includes(v)) throw new Error(`Cooperation legacy wording remains: ${v}`); });
  ['六类项目合作能力｜三类核心项目交付 + 三项数智化产品与技术能力','数字化工厂','APP软件开发','官网建设'].forEach(v=>{ if(!home.includes(v)) throw new Error(`Homepage six-core static source missing: ${v}`); });
  ['<h2>六类项目合作能力</h2>','01｜新工厂／新产线规划','02｜精益改善项目','03｜目视化项目','04｜数字化工厂','05｜APP软件开发','06｜官网建设','data-qily-six-core-services="v1"','data-qily-six-service-boundary="v1"'].forEach(v=>{ if(!coop.includes(v)) throw new Error(`Cooperation six-core static source missing: ${v}`); });
}

let changed=[];
let home=patchHome(read('index.html')); if(write('index.html',home)) changed.push('index.html');
let coop=patchCooperation(read('cooperation/index.html')); if(write('cooperation/index.html',coop)) changed.push('cooperation/index.html');
let ia=patchFallbackJs(read('site-information-architecture-v1.js')); if(write('site-information-architecture-v1.js',ia)) changed.push('site-information-architecture-v1.js');
let materializer=patchMaterializer(read('scripts/materialize-static-core-pages.js')); if(write('scripts/materialize-static-core-pages.js',materializer)) changed.push('scripts/materialize-static-core-pages.js');
let pricing=patchPricingScript(read('scripts/hide-public-pricing.js')); if(write('scripts/hide-public-pricing.js',pricing)) changed.push('scripts/hide-public-pricing.js');
validate(read('index.html'),read('cooperation/index.html'));
process.stdout.write(`Six-core static source enforced. Changed: ${changed.length?changed.join(', '):'none'}\n`);
