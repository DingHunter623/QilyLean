(function(){
  'use strict';
  if(window.__qilyBrandTrustV1)return;
  window.__qilyBrandTrustV1=true;

  var VERSION='20260802-personal-brand-v1';
  var path=(location.pathname||'/').replace(/\/index\.html$/,'/').replace(/\/{2,}/g,'/');
  if(path.length>1&&!/\/$/.test(path))path+='/';

  function addStyles(){
    if(document.getElementById('qilyBrandTrustStylesheet'))return;
    var link=document.createElement('link');
    link.id='qilyBrandTrustStylesheet';
    link.rel='stylesheet';
    link.href='/site-brand-trust-v1.css?v='+VERSION;
    (document.head||document.documentElement).appendChild(link);
  }

  function node(html,className){
    var box=document.createElement('div');
    if(className)box.className=className;
    box.innerHTML=html;
    return box;
  }

  function insertAfter(reference,element){
    if(!reference||!reference.parentNode)return false;
    reference.parentNode.insertBefore(element,reference.nextSibling);
    return true;
  }

  function mainElement(){return document.querySelector('main')||document.body;}
  function firstContentSection(){return document.querySelector('main .hero,main .module-hero,main .page-hero,main>section,main>.section');}

  function addGlobalTrustStrip(){
    if(document.querySelector('.ql-trust-strip'))return;
    var header=document.querySelector('header,.topbar,.site-header,.qily-global-header');
    var strip=node([
      '<div class="ql-trust-strip-inner">',
        '<div class="ql-trust-strip-copy">',
          '<strong>QilyLean｜个人专业品牌</strong>',
          '<span>专家本人诊断与交付</span>',
          '<span>支持小范围先行验证</span>',
          '<span>合同、交付资产与脱敏证据可核验</span>',
        '</div>',
        '<div class="ql-trust-strip-actions">',
          '<a href="/cooperation/">从具体问题开始</a>',
          '<a href="/trust/">查看信任与边界</a>',
        '</div>',
      '</div>'
    ].join(''),'ql-trust-strip');
    strip.setAttribute('data-qily-version',VERSION);
    if(header)insertAfter(header,strip);else document.body.insertBefore(strip,document.body.firstChild);
  }

  function normalizeAchievementWording(){
    var elements=document.querySelectorAll('strong,em,b,p,span,h1,h2,h3,h4,li');
    Array.prototype.forEach.call(elements,function(el){
      if(el.children.length)return;
      var text=(el.textContent||'').trim();
      if(!text||text.length>180||text.indexOf('超千万元')<0)return;
      if(text==='超千万元'){
        el.textContent='职业生涯累计改善贡献超千万元';
        return;
      }
      el.textContent=text
        .replace(/累计改善收益超千万元/g,'20年职业实践累计改善贡献超千万元（含个人主导与跨部门团队成果）')
        .replace(/超千万元累计改善收益/g,'20年职业实践累计改善贡献超千万元（含个人主导与跨部门团队成果）')
        .replace(/改善收益超千万元/g,'职业生涯累计改善贡献超千万元');
    });
  }

  function homepageModule(){
    if(path!=='/'||document.getElementById('qlCoreBusinessGateway'))return;
    var section=node([
      '<span class="ql-trust-kicker">CORE BUSINESS｜先看能解决什么，再看知识资产规模</span>',
      '<h2>三项核心业务｜从一个具体制造问题开始</h2>',
      '<p class="ql-trust-lead">QilyLean现阶段采用丁启利本人直接诊断、直接设计并参与交付的个人专家模式。建议先从一条产线、一个车间、一个产品族或一个明确课题开始，以基线、交付物和验收标准验证合作效果，再决定是否扩大范围。</p>',
      '<div class="ql-business-grid">',
        '<article class="ql-business-card"><small>01｜FACTORY PLANNING</small><h3>新工厂／新产线规划</h3><p>从产能、工艺、设备、人流物流、仓储、公辅接口到扩展边界，形成可评审、可实施的制造系统方案。</p><ul><li>Layout与面积测算</li><li>物流及方案比选</li><li>实施与投产路线图</li></ul><a href="/cooperation/factory-planning/">查看合同与交付资产</a></article>',
        '<article class="ql-business-card"><small>02｜LEAN IMPROVEMENT</small><h3>精益改善项目交付</h3><p>围绕PQCD、VSM、标准工时、线平衡、SMED、OEE及质量防错，建立基线并以实绩闭环。</p><ul><li>单点课题可启动</li><li>Pilot验证后复制</li><li>结案、培训与固化</li></ul><a href="/cooperation/lean-improvement/">查看合同与交付资产</a></article>',
        '<article class="ql-business-card"><small>03｜VISUAL MANAGEMENT</small><h3>目视化项目设计与交付</h3><p>覆盖现场诊断、区域规划、视觉标准、图纸清单、打样、施工协同、验收及维护机制。</p><ul><li>单车间可先行</li><li>图纸与材料清单</li><li>效果及现场验收</li></ul><a href="/cooperation/visual-management/">查看合同与交付资产</a></article>',
      '</div>',
      '<div class="ql-trust-actions"><a href="/cooperation/">进入项目合作</a><a href="/projects/">查看代表项目与证据</a><a href="/trust/">了解个人品牌责任边界</a></div>'
    ].join(''),'ql-trust-module');
    section.id='qlCoreBusinessGateway';
    var hero=document.querySelector('main .hero');
    if(!insertAfter(hero,section))mainElement().insertBefore(section,mainElement().firstChild);
  }

  function cooperationModule(){
    if(path!=='/cooperation/'||document.getElementById('qlSmallScopePath'))return;
    var section=node([
      '<span class="ql-trust-kicker">START SMALL｜个人创业初期的低风险合作方式</span>',
      '<h2>先做小范围验证，不以“大项目包装”替代实际交付</h2>',
      '<p class="ql-trust-lead">现阶段更适合从问题明确、周期可控、验收清楚的小项目开始。专家本人直接参与，合同、交付清单、里程碑和验收口径在启动前确认。</p>',
      '<div class="ql-path-grid">',
        '<article class="ql-path-card"><small>STEP 01</small><h3>免费问题初筛</h3><p>判断问题与QilyLean能力是否匹配，明确需要准备的数据、现场对象和下一步建议。</p></article>',
        '<article class="ql-path-card"><small>STEP 02</small><h3>现场诊断与路线图</h3><p>从¥6,800起的小范围诊断进入，交付正式诊断纪要、优先级清单及改善路线图。</p></article>',
        '<article class="ql-path-card"><small>STEP 03</small><h3>单点专项交付</h3><p>可选择一条线、一个车间、一个产品族、一个SMED／VSM／Layout／目视化课题进行验证。</p></article>',
      '</div>',
      '<div class="ql-start-small"><div class="ql-start-small-copy"><h3>为什么从小范围开始？</h3><p>小范围不是能力边界，而是合作风险控制。先通过明确基线、交付物和验收标准验证专业能力与协同效率；验证通过后，再根据企业实际需要扩展至体系改善、全厂规划或持续顾问。</p></div><ol class="ql-start-small-list"><li>问题与范围可定义</li><li>项目周期可控制</li><li>成果证据可核验</li><li>客户投入风险更低</li></ol></div>',
      '<div class="ql-trust-actions"><a href="#entry">提交具体问题</a><a href="/trust/">查看签约与责任边界</a></div>'
    ].join(''),'ql-trust-module');
    section.id='qlSmallScopePath';
    var anchor=firstContentSection();
    if(!insertAfter(anchor,section))mainElement().appendChild(section);
  }

  var serviceAssets={
    '/cooperation/factory-planning/':{
      code:'FACTORY PLANNING｜交付资产样张说明',
      title:'新工厂／新产线规划｜交付资产不是一句概述',
      lead:'合同范本负责定义双方权责，交付资产负责证明方案深度。公开页面采用脱敏缩略图与受控在线预览，完整原始资料按项目保密约定核验。',
      cards:[
        ['输入与测算','设计输入确认表、产能模型、设备与人力测算、面积分配表'],
        ['方案与图纸','2D Factory Layout、人流物流分析、功能分区、公辅接口及方案比选'],
        ['实施与验收','评审纪要、风险清单、实施甘特图、搬迁方案及投产爬坡路线图']
      ]
    },
    '/cooperation/lean-improvement/':{
      code:'LEAN IMPROVEMENT｜交付资产样张说明',
      title:'精益改善｜从基线、试点到实绩验证',
      lead:'核心业务页已经配置合同和标准交付清单；新增此说明用于帮助客户快速理解每类文件在项目闭环中的作用。',
      cards:[
        ['基线与诊断','项目章程、PQCD基线、VSM现状图、标准工时与瓶颈诊断'],
        ['改善与验证','未来态VSM、线平衡、SMED／OEE分析、防错方案及Pilot记录'],
        ['固化与复制','实绩对比、结案报告、SOP、培训记录、稽核表及横向复制计划']
      ]
    },
    '/cooperation/visual-management/':{
      code:'VISUAL MANAGEMENT｜交付资产样张说明',
      title:'目视化项目｜设计、打样、施工与验收闭环',
      lead:'不只提供效果概念，而是形成可报价、可制作、可施工、可验收和可持续维护的成套项目资产。',
      cards:[
        ['诊断与标准','现场问题清单、区域规划、VI颜色语义、版式尺寸及应用标准'],
        ['图纸与清单','设计图、安装定位图、材料规格、数量清单、预算及样板确认单'],
        ['施工与验收','供应商协同、现场校核、整改清单、效果对比、验收记录及维护标准']
      ]
    }
  };

  function serviceAssetModule(){
    var data=serviceAssets[path];
    if(!data||document.getElementById('qlServiceAssets'))return;
    var cards=data.cards.map(function(card,index){
      return '<article class="ql-asset-card"><small>ASSET 0'+(index+1)+'</small><h3>'+card[0]+'</h3><p>'+card[1]+'</p></article>';
    }).join('');
    var section=node([
      '<span class="ql-trust-kicker">',data.code,'</span>',
      '<h2>',data.title,'</h2>',
      '<p class="ql-trust-lead">',data.lead,'</p>',
      '<div class="ql-asset-grid">',cards,'</div>',
      '<div class="ql-start-small"><div class="ql-start-small-copy"><h3>建议先从一个清晰范围启动</h3><p>可从单车间、单产线、单产品族或单一课题进入。启动前确认输入资料、项目边界、交付清单、里程碑与验收口径；验证有效后再扩展，不要求客户一次性承担大范围项目风险。</p></div><ol class="ql-start-small-list"><li>专家本人参与</li><li>合同边界清楚</li><li>交付物逐项验收</li><li>脱敏样张与原件分级核验</li></ol></div>',
      '<div class="ql-proof-note"><strong>公开展示边界：</strong>涉及客户名称、成本、设备参数、工艺诀窍及经营数据的原始文件不在公开网页完整披露；合作洽谈阶段可在保密约定下进行分级核验。</div>'
    ].join(''),'ql-trust-module');
    section.id='qlServiceAssets';
    var anchor=firstContentSection();
    if(!insertAfter(anchor,section))mainElement().appendChild(section);
  }

  function projectRoleLabels(){
    if(path.indexOf('/projects/')!==0||path==='/projects/'||document.querySelector('.ql-project-rolebar'))return;
    var tags=['职业实践案例','个人主导／组织推进','跨部门团队协同','公开资料已脱敏'];
    if(path.indexOf('/factory-layout/')>=0)tags=['个人专业作品与项目实践','规划图纸受控预览','客户信息脱敏','交付能力展示'];
    if(path.indexOf('/automotive-lean/')>=0||path.indexOf('/digital-factory/')>=0)tags=['顾问／管理实践案例','个人组织推进','企业团队共同完成','成果口径分级说明'];
    var bar=node('<strong>成果角色与证据边界</strong>'+tags.map(function(tag){return '<span>'+tag+'</span>';}).join(''),'ql-project-rolebar');
    var target=document.querySelector('main .module-heading,main .project-hero-copy,main .hero-copy,main .module-inner,main>section>div');
    if(target)target.appendChild(bar);else mainElement().insertBefore(bar,mainElement().firstChild);
  }

  function trustCenterModule(){
    if(path!=='/trust/'||document.getElementById('qlPersonalBrandBoundary'))return;
    var section=node([
      '<span class="ql-trust-kicker">POSITIONING｜个人创业初期的真实定位</span>',
      '<h2>不以机构规模包装能力，以专家本人和实际交付承担责任</h2>',
      '<p class="ql-trust-lead">QilyLean现阶段是丁启利发起并负责的个人专业品牌与项目合作窗口，不以大型咨询公司、团队规模或备案状态作为专业能力包装。合作是否成立，以实际问题匹配、合同约定、交付资产、项目过程和验收结果为准。</p>',
      '<div class="ql-business-grid">',
        '<article class="ql-business-card"><small>IDENTITY</small><h3>主体表达清楚</h3><p>品牌、项目负责人和责任承担者保持一致；未另行约定时，由丁启利本人按合同或书面约定提供诊断、设计与交付。</p></article>',
        '<article class="ql-business-card"><small>DELIVERY</small><h3>合同与资产并行</h3><p>合同用于定义范围、节点、付款和责任；交付资产用于呈现诊断、设计、验证、固化及验收的实际工作成果。</p></article>',
        '<article class="ql-business-card"><small>RISK CONTROL</small><h3>小范围先验证</h3><p>优先从一个明确问题或小范围项目开始。客户先验证交付质量与协同效果，再决定是否扩大合作。</p></article>',
      '</div>',
      '<div class="ql-proof-note"><strong>成果口径：</strong>网站展示的职业成果包含个人主导、组织推进及跨部门团队共同完成的项目；经济效益继续区分企业核定、阶段估算与方法测算，不将团队成果全部包装为个人独立成果。</div>'
    ].join(''),'ql-trust-module');
    section.id='qlPersonalBrandBoundary';
    var anchor=firstContentSection();
    if(!insertAfter(anchor,section))mainElement().appendChild(section);
  }

  function certificateDisclaimer(){
    if(path.indexOf('/certificates/chatgpt')!==0||document.querySelector('.ql-certificate-disclaimer'))return;
    var note=node('<strong>证书属性说明：</strong>本页记录丁启利在ChatGPT与制造业AI应用方面的阶段性学习、实践和作品成果，属于QilyLean个人专业成长纪念与应用记录，非OpenAI官方认证、授权资质或职业资格证书。','ql-certificate-disclaimer');
    var anchor=firstContentSection();
    if(!insertAfter(anchor,note))mainElement().insertBefore(note,mainElement().firstChild);
  }

  function archiveNote(){
    if(path.indexOf('/qilylean/daily-insights')!==0||document.querySelector('.ql-archive-note'))return;
    var note=node('<strong>档案口径说明：</strong>简报页面用于持续整理制造工程与精益实践知识；历史页面日期对应知识档案序列。涉及后期补充、修订或系统化归档的内容，以页面更新记录为准，不将页面日期单独作为原始网络发布时间证明。','ql-archive-note');
    var anchor=firstContentSection();
    if(!insertAfter(anchor,note))mainElement().insertBefore(note,mainElement().firstChild);
  }

  function markSmallScopeEntry(){
    if(path.indexOf('/cooperation/')!==0)return;
    var candidates=document.querySelectorAll('a,button');
    Array.prototype.forEach.call(candidates,function(item){
      var text=(item.textContent||'').trim();
      if(/提交|咨询|开始|预约/.test(text)&&!item.querySelector('.ql-small-scope-badge')){
        item.setAttribute('title',(item.getAttribute('title')||'')+' 可先从单车间、单产线或单一课题开始');
      }
    });
  }

  function run(){
    addStyles();
    addGlobalTrustStrip();
    normalizeAchievementWording();
    homepageModule();
    cooperationModule();
    serviceAssetModule();
    projectRoleLabels();
    trustCenterModule();
    certificateDisclaimer();
    archiveNote();
    markSmallScopeEntry();
    document.documentElement.setAttribute('data-qily-brand-trust','v1');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
