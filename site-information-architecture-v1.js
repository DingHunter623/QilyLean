/* QilyLean information architecture v1
 * Purpose: make the commercial value proposition immediately visible while
 * preserving detailed personal, project and knowledge assets in their proper modules.
 */
(function(d,w){
  'use strict';
  if(w.__qilyInformationArchitectureV1)return;
  w.__qilyInformationArchitectureV1=true;

  var path=(w.location.pathname||'/').replace(/\/+/g,'/');

  function ready(fn){
    if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',fn,{once:true});
    else fn();
  }

  function el(tag,className,html){
    var node=d.createElement(tag);
    if(className)node.className=className;
    if(typeof html==='string')node.innerHTML=html;
    return node;
  }

  function insertAfter(reference,node){
    if(!reference||!reference.parentNode)return;
    reference.parentNode.insertBefore(node,reference.nextSibling);
  }

  function hero(){return d.querySelector('.module-hero,.hero,.daily-hero')}

  function buildSection(options){
    var section=el('section','qily-ia-section'+(options.alt?' qily-ia-alt':'')+(options.dark?' qily-ia-dark':''));
    if(options.id)section.id=options.id;
    var inner=el('div','qily-ia-inner');
    var heading=el('div','qily-ia-heading');
    if(options.kicker)heading.appendChild(el('span','qily-ia-kicker',options.kicker));
    heading.appendChild(el('h2','',options.title));
    if(options.lead)heading.appendChild(el('p','',options.lead));
    inner.appendChild(heading);
    if(options.body){
      if(typeof options.body==='string')inner.insertAdjacentHTML('beforeend',options.body);
      else inner.appendChild(options.body);
    }
    section.appendChild(inner);
    return section;
  }

  function setMeta(name,value){
    var meta=d.querySelector('meta[name="'+name+'"]');
    if(meta)meta.setAttribute('content',value);
  }

  function addHomeCommercialFocus(){
    if(path!=='/'&&path!=='/index.html')return;
    var main=d.querySelector('main');
    var homeHero=d.querySelector('.hero');
    if(!main||!homeHero||d.getElementById('qily-core-services'))return;

    d.body.classList.add('qily-home-commercial-focus');
    d.title='QilyLean｜启力精益｜精益生产、工程改善与数智工厂';
    setMeta('description','QilyLean围绕三类核心项目交付与三项数智化产品与技术能力，提供三类核心项目交付（新工厂／新产线规划、精益改善、目视化）与三项数智化产品与技术能力（数字化工厂、APP软件开发、官网建设），合计六类项目合作能力。');

    var eyebrow=homeHero.querySelector('.eyebrow');
    var title=homeHero.querySelector('h1');
    var lead=homeHero.querySelector('.lead');
    if(eyebrow)eyebrow.textContent='三类核心项目交付｜三项数智化产品与技术能力｜六类项目合作能力';
    if(title)title.textContent='把复杂制造问题，转化为可验证的交付结果';
    if(lead){
      lead.innerHTML='QilyLean｜启力精益由丁启利发起，依托20年制造工程与精益改善实践，形成三类核心项目交付与三项数智化产品与技术能力，合计六类项目合作能力。项目以现场诊断、范围确认、方案设计、Pilot验证、标准固化和验收闭环推进；具体交付物、周期、费用、分阶段付款比例与验收条件以对应合同及正式约定为准。';
      var founder=el('p','qily-founder-line','丁启利｜制造工程、工业工程与精益改善项目实践者');
      lead.parentNode.insertBefore(founder,lead);
      var relocation=el('p','qily-home-relocation-note','专业标签已归入<a href="/capabilities/">能力画像</a>，任职年限与岗位历程已归入<a href="/experience/">履历主线</a>，量化成果与证据归入<a href="/projects/">代表项目</a>。');
      insertAfter(lead,relocation);
    }

    var actionBox=homeHero.querySelector('.actions');
    if(actionBox){
      actionBox.innerHTML='<a class="button primary" href="/cooperation/">查看六类项目合作能力与交付</a><a class="button" href="/cooperation/#diagnosis">预约60分钟问题初筛</a><a class="button" href="/projects/">代表项目与证据</a>';
    }

    var portraitBadge=homeHero.querySelector('.portrait-badge');
    if(portraitBadge){
      portraitBadge.innerHTML='<div><strong>20年</strong><span>制造工程与精益改善实践</span></div><div><strong>合同闭环</strong><span>范围、交付、付款与验收分阶段明确</span></div>';
    }

    var servicesBody=el('div','');
    servicesBody.innerHTML='<div class="qily-ia-grid">'+
      '<article class="qily-ia-card"><small>CORE PROJECT DELIVERY 01</small><h3>新工厂／新产线规划</h3><p>从产品、工艺、产能、设备、物流、公辅、品质和扩展边界出发，形成可评审、可实施的规划资产。</p><div class="qily-ia-result">产能模型、Layout、物流与库位、公辅接口、实施路线图</div></article>'+
      '<article class="qily-ia-card"><small>CORE PROJECT DELIVERY 02</small><h3>精益改善项目交付</h3><p>围绕VSM、标准工时、线平衡、SMED、OEE、质量异常和计划实绩闭环，先验证再固化。</p><div class="qily-ia-result">基线诊断、Pilot方案、改善数据、标准文件、结案验收</div></article>'+
      '<article class="qily-ia-card"><small>CORE PROJECT DELIVERY 03</small><h3>目视化项目设计与交付</h3><p>把区域、状态、责任、标准和异常转化为现场共同语言，兼顾设计、材料、施工协同和验收。</p><div class="qily-ia-result">现场勘查、设计图、材料预算、打样、实施清单与验收</div></article>'+
      '<article class="qily-ia-card"><small>DIGITAL PRODUCT & TECH 04</small><h3>数字化工厂</h3><p>以业务流程和可信主数据为底座，规划ERP／MES／APS、设备数据、生产透明化、管理看板与实施路线。</p><div class="qily-ia-result">数字化蓝图、数据口径、功能／接口需求、看板原型、Pilot与验收机制</div></article>'+
      '<article class="qily-ia-card"><small>DIGITAL PRODUCT & TECH 05</small><h3>APP软件开发</h3><p>面向IE测时、现场采集、异常管理、移动看板和轻量化管理场景，形成需求、原型、开发、测试、发布与迭代闭环。</p><div class="qily-ia-result">需求清单、交互原型、可运行版本、测试记录、安装／发布包与版本记录</div></article>'+
      '<article class="qily-ia-card"><small>DIGITAL PRODUCT & TECH 06</small><h3>官网建设</h3><p>围绕品牌定位、信息架构、可信证据、内容体系、SEO、咨询转化、响应式适配及持续运维建设专业官网。</p><div class="qily-ia-result">信息架构、页面模板、响应式官网、SEO基础、咨询入口、部署与运维规范</div></article>'+
      '</div><div class="qily-ia-actions"><a class="qily-ia-button primary" href="/cooperation/">进入项目合作</a><a class="qily-ia-button" href="/cooperation/#services">查看六类项目合作能力与交付边界</a></div>';
    var services=buildSection({id:'qily-core-services',kicker:'COOPERATION CAPABILITIES｜核心项目交付 + 数智化技术能力',title:'六类项目合作能力｜三类核心项目交付 + 三项数智化产品与技术能力',lead:'先说明解决什么问题、交付什么资产，再逐层展示个人履历、方法体系和知识沉淀。',body:servicesBody});
    insertAfter(homeHero,services);

    var proofBody=el('div','');
    proofBody.innerHTML='<div class="qily-ia-delivery-summary">'+
      '<article><strong>专业基础</strong><span>20年制造工程、工业工程与精益改善实践；详细年限和岗位归入履历主线。</span></article>'+
      '<article><strong>项目证据</strong><span>代表项目按已核定、已验证、阶段估算和经验陈述分级展示。</span></article>'+
      '<article><strong>交易机制</strong><span>六类项目合作能力均明确范围、交付物与验收边界；合同范本及专项报价按具体业务成熟度与项目范围配置。</span></article>'+
      '<article><strong>责任边界</strong><span>网页用于沟通与能力说明，正式范围、费用、税费、周期和验收以合同为准。</span></article>'+
      '</div><div class="qily-ia-actions"><a class="qily-ia-button primary" href="/projects/">代表项目</a><a class="qily-ia-button" href="/trust/">诚信与责任边界</a><a class="qily-ia-button" href="/projects/qilylean-commercial-deliveries/">商业交付档案</a></div>';
    var proof=buildSection({id:'qily-home-proof',alt:true,kicker:'WHY QILYLEAN｜证据与交易边界',title:'先看交付逻辑，再看专业深度',lead:'不以资质徽章堆砌信任，而以真实项目、脱敏佐证、合同交付资产、阶段节点及验收规则建立可核验的合作基础。',body:proofBody});
    insertAfter(services,proof);

    var trust=d.getElementById('trust-center');
    if(trust)insertAfter(proof,trust);

    var results=d.getElementById('results');
    if(results){
      results.classList.add('qily-ia-secondary-section');
      var resultsHeading=results.querySelector('.head h2');
      var resultsLead=results.querySelector('.head>p:not(.metric-display-note)');
      if(resultsHeading)resultsHeading.textContent='更多职业成果与方法积累';
      if(resultsLead)resultsLead.textContent='首页仅显示部分代表性结果；完整项目背景、角色边界、数据口径和佐证材料统一归入代表项目与能力画像。';
      var toggle=el('button','qily-ia-button qily-results-toggle','展开全部成果概览');
      toggle.type='button';
      toggle.addEventListener('click',function(){
        var expanded=results.classList.toggle('qily-results-expanded');
        toggle.textContent=expanded?'收起成果概览':'展开全部成果概览';
        toggle.setAttribute('aria-expanded',String(expanded));
      });
      var resultsInner=results.querySelector('.inner');
      if(resultsInner)resultsInner.appendChild(toggle);
      if(trust)insertAfter(trust,results);
    }

    var latest=d.getElementById('latest-content');
    if(latest){
      latest.classList.add('qily-ia-secondary-section');
      var latestTitle=latest.querySelector('.head h2');
      var latestText=latest.querySelector('.head p');
      if(latestTitle)latestTitle.textContent='知识资产与持续更新';
      if(latestText)latestText.textContent='简报、术语、程序文件和参考资料用于展示持续学习与方法沉淀，不与六类项目合作能力争夺首页主视觉。';
      if(results)insertAfter(results,latest);
    }

    var assistant=homeHero.querySelector('.assistant-panel');
    if(assistant){
      var aiWrap=el('div','');
      aiWrap.appendChild(assistant);
      var aiSection=buildSection({id:'qily-home-ai',dark:true,kicker:'SECONDARY TOOL｜专业交流辅助入口',title:'QilyLean AI对话',lead:'用于快速了解能力、项目和知识内容；AI回答不替代现场调查、正式方案、合同约定或专业审批。',body:aiWrap});
      aiSection.classList.add('qily-ai-secondary');
      if(latest)insertAfter(latest,aiSection);else main.appendChild(aiSection);
    }

    var linksBody=el('div','qily-ia-secondary-links');
    linksBody.innerHTML='<a class="qily-ia-secondary-link" href="/capabilities/">能力画像<span>专业标签、方法体系、数字工具与佐证</span></a>'+
      '<a class="qily-ia-secondary-link" href="/experience/">履历主线<span>任职年限、岗位职责与行业经历</span></a>'+
      '<a class="qily-ia-secondary-link" href="/knowledge/">知识分享<span>简报、术语、程序文件与参考资料</span></a>'+
      '<a class="qily-ia-secondary-link" href="/ai.html">QilyLean AI<span>制造改善知识交流与站内导航</span></a>'+
      '<a class="qily-ia-secondary-link" href="/moments.html">行走印记<span>工作现场、团队同行与生活记录</span></a>';
    var links=buildSection({id:'qily-more-context',alt:true,kicker:'FURTHER CONTEXT｜进一步了解',title:'个人信息与知识资产各归其位',lead:'保留全部有价值内容，但不再让个人标签、工具和知识数量遮挡客户最关心的服务、交付与验收。',body:linksBody});
    main.appendChild(links);
  }

  function addCapabilityProfile(){
    if(!/^\/capabilities(?:\/|$)/.test(path)||d.getElementById('qily-professional-labels'))return;
    var labels='<div class="qily-ia-grid four">'+
      '<article class="qily-ia-card"><small>工程角色</small><h3>TE／PE／IE／ME／NPI</h3><p>覆盖工艺导入、标准工时、产能、设备、质量协同和量产爬坡。</p></article>'+
      '<article class="qily-ia-card"><small>改善方法</small><h3>VSM／SMED／OEE／ECRS</h3><p>从价值流、换型、设备损失、动作与流程重构建立可验证改善路径。</p></article>'+
      '<article class="qily-ia-card"><small>系统协同</small><h3>ERP／MES／APS／IE数据</h3><p>统一BOM、工艺路线、工时、产能、计划、实绩和库存口径。</p></article>'+
      '<article class="qily-ia-card"><small>组织机制</small><h3>PMO／阶段门／横向复制</h3><p>以责任、风险、验证、培训、稽核和复盘机制推动成果固化。</p></article>'+
      '</div><div class="qily-ia-boundary"><strong>阅读边界：</strong>能力标签说明专业覆盖范围，不等同于每项服务均由一人独立完成，也不构成特定项目结果承诺；具体团队配置与职责以项目合同为准。</div>';
    var section=buildSection({id:'qily-professional-labels',alt:true,kicker:'PROFESSIONAL LABELS｜原首页标签统一归档',title:'专业标签与能力边界',lead:'首页不再平铺大量缩写和工具名称；本页按工程角色、改善方法、系统协同与项目机制集中呈现。',body:labels});
    insertAfter(hero(),section);
  }

  function addExperienceFacts(){
    if(!/^\/experience(?:\/|$)/.test(path)||d.getElementById('qily-career-facts'))return;
    var body='<div class="qily-ia-delivery-summary">'+
      '<article><strong>20年制造实践</strong><span>覆盖制造工程、工业工程、精益改善、运营协同和项目交付。</span></article>'+
      '<article><strong>9年欧美企业经历</strong><span>用于说明企业环境和管理体系经历，不代表任何现任或历史雇主为QilyLean背书。</span></article>'+
      '<article><strong>4年工程管理经历</strong><span>曾承担上市公司工程管理职责；具体岗位与时间以履历和可核验材料为准。</span></article>'+
      '<article><strong>6年多咨询交付经历</strong><span>包含咨询、顾问和项目式推进经历，不等同于QilyLean品牌成立后的独立商业订单。</span></article>'+
      '</div><div class="qily-ia-boundary"><strong>年限口径：</strong>以上来自职业履历的累计分类，部分职责可能在同一任职阶段交叉，不作简单相加；任职项目、团队成果与QilyLean商业交付严格区分。</div>';
    var section=buildSection({id:'qily-career-facts',alt:true,kicker:'CAREER FACTS｜经历归履历、能力归能力画像',title:'职业经历摘要与口径说明',lead:'将原首页中的任职年限、企业类型和岗位亮点归入履历主线，使客户能够按时间与职责核验。',body:body});
    insertAfter(hero(),section);
  }

  function addProjectEvidenceGuide(){
    if(!/^\/projects(?:\/|$)/.test(path)||d.getElementById('qily-project-evidence-guide'))return;
    var body='<div class="qily-ia-grid four">'+
      '<article class="qily-ia-card"><small>A级</small><h3>已核定</h3><p>具有财务、验收、管理层确认或等效正式记录。</p></article>'+
      '<article class="qily-ia-card"><small>B级</small><h3>已验证</h3><p>具备改善前后数据、现场记录、试点或过程验收。</p></article>'+
      '<article class="qily-ia-card"><small>C级</small><h3>阶段估算</h3><p>依据基线、模型与假设测算，必须说明待核验条件。</p></article>'+
      '<article class="qily-ia-card"><small>D级</small><h3>经验陈述</h3><p>用于说明任职、参与范围和方法实践，不当作已实现收益。</p></article>'+
      '</div><div class="qily-ia-boundary"><strong>职责口径：</strong>主导、组织推进、专业参与和跨部门团队成果分别表述；未经客户明确授权，不将脱敏材料表述为客户推荐、官方合作或商业背书。</div>';
    var section=buildSection({id:'qily-project-evidence-guide',alt:true,kicker:'EVIDENCE FIRST｜量化成果统一归代表项目',title:'项目结果如何阅读',lead:'量化结果必须与项目背景、本人角色、证据等级和适用边界一起阅读，避免只看数字、不看条件。',body:body});
    insertAfter(hero(),section);
  }

  function addCooperationSummary(){
    if(!/^\/cooperation(?:\/|$)/.test(path)||d.getElementById('qily-commercial-summary'))return;
    var body='<div class="qily-ia-delivery-summary">'+
      '<article><strong>交付资产</strong><span>诊断纪要、数据基线、图纸／模型、方案、清单、标准文件、培训或验收材料，按业务合同列明。</span></article>'+
      '<article><strong>项目阶段</strong><span>通常按范围确认、启动、阶段成果、评审优化、最终交付与验收关闭推进。</span></article>'+
      '<article><strong>分阶段付款</strong><span>付款比例、金额和触发条件已在对应合同范本中设置，正式项目以双方签署合同为准。</span></article>'+
      '<article><strong>验收边界</strong><span>以约定交付物、版本、数据口径、评审记录和关闭条件验收，不以口头印象替代。</span></article>'+
      '</div><div class="qily-ia-boundary"><strong>交易提示：</strong>不同项目复杂度、周期和协作边界不同，不在网页统一承诺固定收益、固定周期或统一付款比例；网页范本用于前期沟通，正式合同具有优先效力。</div>';
    var section=buildSection({id:'qily-commercial-summary',alt:true,kicker:'COMMERCIAL SUMMARY｜无需先读完整PDF也能理解',title:'交付、付款与验收一页看懂',lead:'合同范本已明确交付资产和分阶段付款机制；本摘要把客户最关心的交易逻辑前置，完整条款仍以对应合同为准。',body:body});
    insertAfter(hero(),section);
  }

  function addKnowledgePositioning(){
    if(!/^\/knowledge(?:\/|$)/.test(path)||d.getElementById('qily-knowledge-positioning'))return;
    var body='<div class="qily-ia-grid">'+
      '<article class="qily-ia-card"><small>知识档案</small><h3>今日简报与术语词典</h3><p>用于持续整理制造实践和方法解释；历史日期用于档案排序，不等同于网页首次公开发布日期。</p></article>'+
      '<article class="qily-ia-card"><small>标准资产</small><h3>程序文件与参考资料</h3><p>作为培训、沟通和项目准备素材，实际应用前仍需结合企业制度、产品和现场条件评审。</p></article>'+
      '<article class="qily-ia-card"><small>商业边界</small><h3>知识内容不替代项目交付</h3><p>公开知识证明方法沉淀，但不自动代表客户采用、验收、收益或QilyLean商业订单。</p></article>'+
      '</div>';
    var section=buildSection({id:'qily-knowledge-positioning',alt:true,kicker:'KNOWLEDGE ASSET｜知识归知识库',title:'知识资产的定位与边界',lead:'保留丰富内容用于专业验证、培训和搜索，但不让知识数量替代核心业务、项目范围和正式交付。',body:body});
    insertAfter(hero(),section);
  }

  function addMomentsPositioning(){
    if(!(/^\/moments(?:\/|$)/.test(path)||path==='/moments.html')||d.getElementById('qily-moments-positioning'))return;
    var body='<div class="qily-ia-boundary"><strong>展示边界：</strong>工作现场、团队同行和生活记录用于补充个人经历与实践语境；除非另有合同、验收和授权证据，不作为客户采购、项目验收或商业背书证明。</div>';
    var section=buildSection({id:'qily-moments-positioning',alt:true,kicker:'CONTEXT ONLY｜行走印记归生活与实践语境',title:'记录真实经历，不替代项目证据',lead:'保持个人主页的人情味，同时与代表项目、商业交付档案和客户授权评价严格区分。',body:body});
    insertAfter(hero(),section);
  }

  function boot(){
    if(!d.body)return;
    d.body.classList.add('qily-ia-ready');
    addHomeCommercialFocus();
    addCapabilityProfile();
    addExperienceFacts();
    addProjectEvidenceGuide();
    addCooperationSummary();
    addKnowledgePositioning();
    addMomentsPositioning();
  }

  ready(boot);
})(document,window);

/* QilyLean unified evidence, phrase-integrity and OPL standard · 2026-08-03 */
(function(d,w){
  'use strict';
  var path=(w.location.pathname||'/').replace(/\/+/g,'/');
  function ready(fn){if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',fn,{once:true});else fn();}
  function evidenceBadge(target,grade,title,detail){
    if(!target||target.querySelector('.qily-evidence-grade-badge'))return;
    var badge=d.createElement('div');
    badge.className='qily-evidence-grade-badge grade-'+grade.toLowerCase();
    badge.innerHTML='<strong>'+grade+'级｜'+title+'</strong><span>'+detail+'</span>';
    target.insertBefore(badge,target.firstChild);
  }
  function makeEvidenceCardsLinked(){
    var guide=d.getElementById('qily-project-evidence-guide');
    if(!guide)return;
    var cards=guide.querySelectorAll('.qily-ia-grid.four > .qily-ia-card');
    var links=[
      '/projects/lean-improvement-evidence/#q3',
      '/projects/smed-300t/#evidence-grade',
      '/projects/lean-improvement-evidence/#q4',
      '/projects/digital-factory/#evidence-grade'
    ];
    var labels=['查看A级公开核定成果','查看B级公开验证成果','查看C级阶段估算成果','查看D级经验陈述成果'];
    Array.prototype.forEach.call(cards,function(card,index){
      if(index>=links.length||card.tagName.toLowerCase()==='a')return;
      var link=d.createElement('a');
      link.className=card.className+' qily-ia-card-link';
      link.href=links[index];
      link.setAttribute('aria-label',labels[index]);
      link.innerHTML=card.innerHTML+'<span class="qily-card-link-hint">'+labels[index]+' →</span>';
      card.replaceWith(link);
    });
  }
  function keepCapabilityPhraseTogether(){
    var section=d.getElementById('qily-professional-labels');
    if(!section)return;
    Array.prototype.forEach.call(section.querySelectorAll('.qily-ia-card'),function(card){
      var label=card.querySelector('small');
      var heading=card.querySelector('h3');
      if(label&&heading&&label.textContent.trim()==='组织机制')heading.innerHTML='PMO／<br><span class="qily-no-break">阶段门</span>／横向复制';
    });
  }
  function markTargetEvidenceLevels(){
    if(/^\/projects\/lean-improvement-evidence(?:\/|$)/.test(path)){
      evidenceBadge(d.getElementById('q3'),'A','已核定','具有财务核算、审批结构及奖励兑现等正式记录，公开页面保留脱敏后的核定口径。');
      evidenceBadge(d.getElementById('q4'),'C','阶段估算','依据结案评审、评分与风险评价说明阶段成果；350～400万元为阶段性估算，非财务核定值。');
      evidenceBadge(d.getElementById('award'),'B','已验证','具有年度／月度评比、稽核整改、流动红黑旗及奖励兑现的现场记录。');
    }
    if(/^\/projects\/smed-300t(?:\/|$)/.test(path)){
      var fact=d.querySelector('.project-fact-grid');
      if(fact&&!d.getElementById('evidence-grade')){
        var panel=d.createElement('div');panel.id='evidence-grade';panel.className='qily-evidence-level-panel grade-b';
        panel.innerHTML='<strong>B级｜已验证</strong><span>依据改善前后换模时间、现场过程记录及标准化交付进行验证；结果适用于所述设备、模具与当期约束条件。</span>';
        fact.parentNode.insertBefore(panel,fact);
      }
    }
    if(/^\/projects\/digital-factory(?:\/|$)/.test(path)){
      var digitalFact=d.querySelector('.project-fact-grid');
      if(digitalFact&&!d.getElementById('evidence-grade')){
        var digitalPanel=d.createElement('div');digitalPanel.id='evidence-grade';digitalPanel.className='qily-evidence-level-panel grade-d';
        digitalPanel.innerHTML='<strong>D级｜经验陈述</strong><span>用于说明本人参与的数据治理、系统协同与交付沉淀范围；页面不将该方法陈述表述为已核定财务收益。</span>';
        digitalFact.parentNode.insertBefore(digitalPanel,digitalFact);
      }
    }
  }
  function updateSponsorLesson(){
    if(path!=='/knowledge/terminology/sponsor.html'||d.getElementById('sponsor-evidence-governance'))return;
    var grid=d.querySelector('main .grid');
    if(!grid)return;
    var block=d.createElement('article');
    block.className='block wide';block.id='sponsor-evidence-governance';
    block.innerHTML='<h2>9. 证据等级与公开链接治理</h2><p class="case">Sponsor在阶段门评审中不仅确认“项目是否完成”，还应确认结果属于已核定、已验证、阶段估算或经验陈述中的哪一级；每项公开成果必须链接到对应脱敏证据页面，目标页面同步显示证据等级、数据口径、本人角色、适用条件和禁止外推边界。</p><ul><li>没有正式财务、验收或管理层记录，不得标注为A级已核定；</li><li>具备改善前后数据、现场记录或过程验收，可标注为B级已验证；</li><li>依据模型、基线与假设测算的结果必须标注为C级阶段估算并列明待核验条件；</li><li>仅用于说明任职、参与范围和方法实践的内容标注为D级经验陈述，不作为收益承诺；</li><li>静态说明卡不得设置误导性悬停反馈，只有真实可跳转入口才使用明显交互反馈。</li></ul>';
    grid.appendChild(block);
  }
  ready(function(){
    keepCapabilityPhraseTogether();
    makeEvidenceCardsLinked();
    markTargetEvidenceLevels();
    updateSponsorLesson();
  });
})(document,window);
