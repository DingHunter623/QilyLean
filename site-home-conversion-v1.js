/* QilyLean Homepage Conversion Runtime V1 | 2026-09-01
 * Home-only, one-shot structural owner for the approved conversion homepage.
 * No MutationObserver, polling, reload, or navigation/translation takeover.
 */
(function(d,w){
  'use strict';
  if(w.__qilyHomeConversionV1)return;
  w.__qilyHomeConversionV1=true;

  function isHome(){
    var path=String(w.location.pathname||'/').replace(/\/index\.html$/i,'/').replace(/\/{2,}/g,'/');
    return path==='/'||path==='';
  }
  if(!isHome())return;

  function node(html){
    var t=d.createElement('template');
    t.innerHTML=String(html||'').trim();
    return t.content.firstElementChild;
  }

  function ensureStyles(){
    if(d.getElementById('qilyHomeConversionV1Stylesheet'))return;
    var link=d.createElement('link');
    link.id='qilyHomeConversionV1Stylesheet';
    link.rel='stylesheet';
    link.href='/styles/qily-home-conversion-v1.css?v=20260901-home-conversion-v1';
    d.head.appendChild(link);
  }

  function setCoreCopy(core){
    if(!core)return;
    core.setAttribute('data-qily-home-conversion-core','v1');
    var kicker=core.querySelector('.qily-ia-kicker');
    var title=core.querySelector('.qily-ia-heading h2');
    var lead=core.querySelector('.qily-ia-heading p');
    if(kicker)kicker.textContent='CORE DELIVERY｜三大核心交付';
    if(title)title.textContent='三类项目，直接面向工厂效率、质量、交付与布局';
    if(lead)lead.textContent='从制造现场与工程数据出发，先把范围、基线、方法、交付物和验收边界说清楚，再进入设计、Pilot与实施。';
    var actions=core.querySelector('.qily-ia-actions');
    if(actions)actions.innerHTML='<a class="qily-ia-button primary" href="/cooperation/#diagnosis">60分钟匹配沟通</a><a class="qily-ia-button" href="/projects/">查看代表案例</a>';
  }

  function transformHero(hero){
    if(!hero)return;
    hero.className='hero qily-home-conversion-hero';
    hero.setAttribute('data-qily-home-conversion-hero','v1');
    hero.innerHTML=''
      +'<div class="qily-home-conversion-hero__inner">'
      +'<div class="qily-home-conversion-hero__copy">'
      +'<span class="qily-home-conversion-hero__kicker">QILYLEAN｜制造工程 · 精益改善 · 工厂规划</span>'
      +'<h1>用工程数据解决工厂效率、质量、交付与布局问题</h1>'
      +'<p class="qily-home-conversion-hero__lead">并把有效改善固化为组织能力。QilyLean以现场事实、工程数据、Pilot验证和标准交付为主线，让方案能落地、结果可验证、经验可复制。</p>'
      +'<div class="qily-home-conversion-hero__chips"><span>新工厂／新产线规划</span><span>精益改善项目交付</span><span>目视化设计与交付</span></div>'
      +'<div class="qily-home-conversion-actions"><a class="primary" href="/cooperation/#diagnosis">60分钟匹配沟通</a><a href="/projects/">查看代表案例</a></div>'
      +'<p class="qily-home-conversion-hero__route">标准启动路径：60分钟匹配沟通 → 1天现场诊断 → 2周诊断／冲刺 → Pilot项目（按项目范围调整）</p>'
      +'</div>'
      +'<figure class="qily-home-project-visual" aria-label="QilyLean工厂项目与改善方案视觉">'
      +'<a href="/projects/factory-layout/" aria-label="查看新工厂与Factory Layout代表项目"><img src="/园区.png?v=20260901-home-conversion-v1" alt="新工厂与工业园区总体规划项目效果图" loading="eager" decoding="async" fetchpriority="high"><figcaption>新工厂／新产线｜Factory Layout与园区规划</figcaption></a>'
      +'<a href="/projects/" aria-label="查看汽车电子精益改善项目"><img src="/media/projects/vsm-smed.webp?v=20260901-home-conversion-v1" alt="汽车电子精益改善、VSM与SMED项目现场资料" loading="eager" decoding="async"><figcaption>汽车电子｜VSM、单件流与SMED</figcaption></a>'
      +'<a href="/projects/mold-warehouse/" aria-label="查看智能模具库代表项目"><img src="/media/projects/mold-before.webp?v=20260901-home-conversion-v1" alt="智能模具库Layout规划与库位设计项目资料" loading="eager" decoding="async"><figcaption>智能模具库｜Layout、库位与追溯</figcaption></a>'
      +'</figure>'
      +'</div>';
  }

  function buildIndustry(){
    return node(''
      +'<section class="qily-home-conversion-section alt" id="qily-home-industry-scenes" aria-labelledby="qily-home-industry-title">'
      +'<div class="qily-home-conversion-inner">'
      +'<div class="qily-home-conversion-heading"><span class="qily-home-conversion-kicker">INDUSTRY SCENES｜三类重点制造场景</span><h2 id="qily-home-industry-title">先聚焦证据最强、方法最能复用的制造场景</h2><p>首页只保留三个高相关行业入口，其他行业能力进入项目页与能力体系展开。</p></div>'
      +'<div class="qily-home-card-grid">'
      +'<article class="qily-home-card"><div class="qily-home-card__body"><small>SCENE｜01</small><h3>汽车电子</h3><p>围绕装配、冲压、注塑、制线、自动化与质量闭环，重点处理标准工时、线平衡、VSM、SMED、防错、产能与计划实绩。</p><div class="qily-home-card__result">适合：精益体系、交付瓶颈、换型、质量与IE基础数据治理</div></div></article>'
      +'<article class="qily-home-card"><div class="qily-home-card__body"><small>SCENE｜02</small><h3>新能源材料</h3><p>面向连续／批次制造中的产能、损失、库存、物流、设备协同与运营数据问题，用工程基线识别真正的改善杠杆。</p><div class="qily-home-card__result">适合：降本增效、产能提升、现场治理与数智化基础建设</div></div></article>'
      +'<article class="qily-home-card"><div class="qily-home-card__body"><small>SCENE｜03</small><h3>装备／离散制造</h3><p>从产品族、工艺路线、设备、人力、面积、物流和扩展边界出发，建立工厂规划与生产系统设计的统一工程口径。</p><div class="qily-home-card__result">适合：新工厂、新产线、Layout、物流、库位与精益运营设计</div></div></article>'
      +'</div></div></section>');
  }

  function buildCases(){
    return node(''
      +'<section class="qily-home-conversion-section" id="qily-home-representative-cases" aria-labelledby="qily-home-cases-title">'
      +'<div class="qily-home-conversion-inner">'
      +'<div class="qily-home-conversion-heading"><span class="qily-home-conversion-kicker">REPRESENTATIVE CASES｜三个代表案例</span><h2 id="qily-home-cases-title">每个案例只讲问题、方法、量化结果与证据等级</h2><p>首页不堆项目数量，只放最能说明工程方法与交付能力的代表性证据。</p></div>'
      +'<div class="qily-home-card-grid">'
      +'<article class="qily-home-card"><a class="qily-home-card-link" href="/projects/factory-layout/"><figure class="qily-home-card__media"><img src="/园区.png?v=20260901-home-conversion-v1" alt="Factory Layout与园区规划代表项目" loading="lazy" decoding="async"></figure><div class="qily-home-card__body"><small>CASE｜FACTORY LAYOUT</small><h3>新工厂／新产线规划</h3><p><strong>问题：</strong>产品族、产能、设备、物流、公辅与扩展边界缺少统一工程模型。<br><strong>方法：</strong>产能模型 + Factory Layout + 物流／库位 + 公辅接口。</p><div class="qily-home-card__result">结果：形成可评审、可实施、可迭代的规划资产</div><span class="qily-home-card__evidence">代表项目｜责任边界见项目页</span></div></a></article>'
      +'<article class="qily-home-card"><a class="qily-home-card-link" href="/projects/smed-300t/"><figure class="qily-home-card__media"><img src="/media/projects/300t.webp?v=20260901-home-conversion-v1" alt="300T冲压机大型模具SMED改善代表项目" loading="lazy" decoding="async"></figure><div class="qily-home-card__body"><small>CASE｜SMED</small><h3>300T大型模具快速换型</h3><p><strong>问题：</strong>大型模具换型时间长，准备、工具与内外部作业混杂。<br><strong>方法：</strong>SMED、作业拆分、工具定置与准备节拍重构。</p><div class="qily-home-card__result">量化结果：约14h → 7h</div><span class="qily-home-card__evidence">历史项目公开案例｜代表项目中展开</span></div></a></article>'
      +'<article class="qily-home-card"><a class="qily-home-card-link" href="/projects/mold-warehouse/"><figure class="qily-home-card__media"><img src="/media/projects/mold-before.webp?v=20260901-home-conversion-v1" alt="1200副模具智能模具库规划与追溯代表项目" loading="lazy" decoding="async"></figure><div class="qily-home-card__body"><small>CASE｜MOLD WAREHOUSE</small><h3>智能模具库与可追溯管理</h3><p><strong>问题：</strong>受限空间内的容量、承载、存取、动线、库位与追溯需要系统设计。<br><strong>方法：</strong>Layout、分级承载、库位编码、二维码追溯与扩展设计。</p><div class="qily-home-card__result">量化规模：约180㎡｜1200+副模具</div><span class="qily-home-card__evidence">历史项目公开案例｜项目页可核验</span></div></a></article>'
      +'</div></div></section>');
  }

  function transformMethod(section){
    if(!section)return null;
    section.className='qily-home-conversion-section alt';
    section.id='qily-home-six-step-method';
    section.setAttribute('aria-labelledby','qily-home-method-title');
    section.innerHTML=''
      +'<div class="qily-home-conversion-inner">'
      +'<div class="qily-home-conversion-heading"><span class="qily-home-conversion-kicker">QILYLEAN METHOD｜六步方法</span><h2 id="qily-home-method-title">从问题到组织能力，用六个阶段完成闭环</h2><p>每一步只保留输入、判断和输出，不再用大段文字重复解释同一套方法。</p></div>'
      +'<div class="qily-home-method-grid" aria-label="QilyLean六步方法流程">'
      +'<article class="qily-home-method-step"><b>01</b><strong>问题初筛</strong><span>目标／痛点／范围／决策条件</span></article>'
      +'<article class="qily-home-method-step"><b>02</b><strong>现场诊断</strong><span>Gemba／约束／流程／异常事实</span></article>'
      +'<article class="qily-home-method-step"><b>03</b><strong>数据基线</strong><span>CT／TT／WIP／产能／质量／损失</span></article>'
      +'<article class="qily-home-method-step"><b>04</b><strong>方案与Pilot</strong><span>优先级／试点／验证／风险控制</span></article>'
      +'<article class="qily-home-method-step"><b>05</b><strong>标准固化</strong><span>SOP／Layout／规则／看板／系统</span></article>'
      +'<article class="qily-home-method-step"><b>06</b><strong>验收与复制</strong><span>结果核验／移交／复制／持续改善</span></article>'
      +'</div></div>';
    return section;
  }

  function buildDeliverables(){
    return node(''
      +'<section class="qily-home-conversion-section" id="qily-home-standard-deliverables" aria-labelledby="qily-home-deliverables-title">'
      +'<div class="qily-home-conversion-inner">'
      +'<div class="qily-home-conversion-heading"><span class="qily-home-conversion-kicker">STANDARD DELIVERABLES｜标准交付物</span><h2 id="qily-home-deliverables-title">项目结束时，必须留下能审查、能交接、能继续运行的资产</h2><p>具体清单随项目范围调整，但交付物必须与阶段节点和验收标准一一对应。</p></div>'
      +'<div class="qily-home-deliverable-grid">'
      +'<article class="qily-home-deliverable"><strong>诊断报告</strong><span>问题、约束、根因、优先级与改善机会</span></article>'
      +'<article class="qily-home-deliverable"><strong>数据基线</strong><span>工时、产能、质量、WIP、损失与统一口径</span></article>'
      +'<article class="qily-home-deliverable"><strong>Layout</strong><span>工厂／产线／物流／库位与扩展边界方案</span></article>'
      +'<article class="qily-home-deliverable"><strong>Pilot记录</strong><span>试点条件、过程数据、问题与验证结果</span></article>'
      +'<article class="qily-home-deliverable"><strong>SOP／标准文件</strong><span>有效做法进入工艺、作业、规则与管理节奏</span></article>'
      +'<article class="qily-home-deliverable"><strong>验收材料</strong><span>交付清单、结果证据、责任边界与移交记录</span></article>'
      +'</div></div></section>');
  }

  function buildCollaboration(){
    return node(''
      +'<section class="qily-home-conversion-section alt" id="qily-home-collaboration" aria-labelledby="qily-home-collaboration-title">'
      +'<div class="qily-home-conversion-inner">'
      +'<div class="qily-home-conversion-heading"><span class="qily-home-conversion-kicker">OWNER & COLLABORATION｜主理人与合作能力</span><h2 id="qily-home-collaboration-title">核心工程判断由QilyLean主理，专业资源按项目边界协同</h2><p>把“谁负责判断、谁负责实施、谁负责验收”写清楚，比堆叠团队头衔更重要。</p></div>'
      +'<div class="qily-home-collaboration">'
      +'<figure class="qily-home-collaboration__portrait"><img src="/qilylean/ding-qili-ai-avatar-560.webp?v=20260901-home-conversion-v1" alt="QilyLean主理人制造工程与精益改善职业形象" loading="lazy" decoding="async"></figure>'
      +'<div class="qily-home-collaboration__roles">'
      +'<article class="qily-home-role"><h3>QilyLean主理</h3><p>负责问题定义、现场诊断、工程数据、方案设计、Pilot逻辑、标准固化、交付文件与技术验收，确保项目主线和工程口径一致。</p></article>'
      +'<article class="qily-home-role"><h3>专家／供应商协同</h3><p>涉及设备、自动化、软件、施工、材料或专项技术时，按范围引入适配资源；接口、责任、费用、交付与验收通过书面边界管理。</p></article>'
      +'</div></div></div></section>');
  }

  function buildLaunch(){
    return node(''
      +'<section class="qily-home-launch-section" id="qily-home-launch" aria-labelledby="qily-home-launch-title">'
      +'<div class="qily-home-launch">'
      +'<div><div class="qily-home-conversion-heading"><span class="qily-home-conversion-kicker">START｜启动方式</span><h2 id="qily-home-launch-title">先用60分钟把问题、范围和下一步说清楚</h2><p>不急着卖完整项目。先判断问题是否值得现场进入、需要哪些数据、由谁决策，以及什么结果才算有效。</p></div>'
      +'<div class="qily-home-launch__route">'
      +'<article class="qily-home-launch__step"><strong>60分钟匹配沟通</strong><span>目标／痛点／范围／资料</span></article>'
      +'<article class="qily-home-launch__step"><strong>1天现场诊断</strong><span>事实／约束／数据采样</span></article>'
      +'<article class="qily-home-launch__step"><strong>2周诊断／冲刺</strong><span>基线／方案／优先级</span></article>'
      +'<article class="qily-home-launch__step"><strong>Pilot项目</strong><span>试点／验证／固化／验收</span></article>'
      +'</div></div>'
      +'<a class="qily-home-launch__cta" href="/cooperation/#diagnosis">进入60分钟匹配沟通</a>'
      +'</div></section>');
  }

  function buildExtended(main){
    var wrap=node('<section class="qily-home-extended" id="qily-home-extended"><details><summary>延伸专业内容｜数智化、证据、知识资产与区域服务</summary><div class="qily-home-extended__content"></div></details></section>');
    var content=wrap.querySelector('.qily-home-extended__content');
    [
      main.querySelector('.qily-system-axis'),
      d.getElementById('qily-north'),
      d.getElementById('qily-digital-enablers'),
      d.getElementById('qily-home-proof'),
      d.getElementById('qily-evidence-value'),
      d.getElementById('qily-knowledge-assets'),
      d.getElementById('qily-trust-center'),
      d.getElementById('qily-secondary-assets')
    ].forEach(function(section){if(section)content.appendChild(section);});
    return wrap;
  }

  function buildBrandExtension(aircraft){
    if(!aircraft)return null;
    aircraft.setAttribute('data-qily-home-aircraft-relocated','true');
    aircraft.setAttribute('aria-label','QilyLean品牌延伸视觉资产');
    var img=aircraft.querySelector('img');
    if(img){img.loading='lazy';img.fetchPriority='low';}
    var wrap=node(''
      +'<section class="qily-home-brand-extension" id="qily-home-brand-extension" aria-labelledby="qily-home-brand-extension-title">'
      +'<div class="qily-home-brand-extension__inner">'
      +'<div class="qily-home-brand-extension__head"><span class="qily-home-conversion-kicker">QILYLEAN BRAND｜启力精益品牌视觉</span><h2 id="qily-home-brand-extension-title">以制造工程为翼，让专业能力抵达更多工厂</h2><p>新工厂／新产线规划、精益改善、目视化交付、数字化工厂、APP软件开发与官网建设，共同构成QilyLean面向制造现场的六项专业能力。</p></div>'
      +'</div></section>');
    wrap.querySelector('.qily-home-brand-extension__inner').appendChild(aircraft);
    return wrap;
  }

  function boot(){
    if(!d.body||d.body.getAttribute('data-qily-home-conversion')==='v1')return;
    var main=d.querySelector('main');
    if(!main)return;
    ensureStyles();

    var aircraft=main.querySelector('.qily-aircraft-brand-hero');
    var hero=main.querySelector(':scope > section.hero, :scope > .hero');
    var core=d.getElementById('qily-core-services');
    var method=d.getElementById('qily-competitive-value');
    if(!hero||!core||!method)return;

    d.body.setAttribute('data-qily-home-conversion','v1');
    transformHero(hero);
    setCoreCopy(core);
    method=transformMethod(method);

    if(main.firstElementChild!==hero)main.insertBefore(hero,main.firstElementChild);
    hero.after(core);

    var industry=buildIndustry();
    var cases=buildCases();
    var deliverables=buildDeliverables();
    var collaboration=buildCollaboration();
    var launch=buildLaunch();

    core.after(industry);
    industry.after(cases);
    cases.after(method);
    method.after(deliverables);
    deliverables.after(collaboration);
    collaboration.after(launch);

    var extended=buildExtended(main);
    launch.after(extended);
    var brandExtension=buildBrandExtension(aircraft);
    if(brandExtension)extended.after(brandExtension);

    d.documentElement.setAttribute('data-qily-home-conversion','v1');
    try{d.dispatchEvent(new CustomEvent('qily:home-conversion-ready',{detail:{version:'v1'}}));}catch(error){}
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})(document,window);
