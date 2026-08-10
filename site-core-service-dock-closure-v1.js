/* QilyLean 六类项目合作能力对齐、合作边界与悬浮入口稳定闭环｜2026-08-10 */
(function(d,w){
  'use strict';
  if(w.__qilyCoreServiceDockClosureV5)return;
  w.__qilyCoreServiceDockClosureV5=true;

  function groupByVisualRow(nodes){
    var rows=[];
    nodes.forEach(function(node){
      var top=Math.round(node.getBoundingClientRect().top);
      var row=rows.find(function(item){return Math.abs(item.top-top)<=6;});
      if(!row){row={top:top,nodes:[]};rows.push(row);}
      row.nodes.push(node);
    });
    return rows;
  }

  function directChild(card,selector){
    try{return card.querySelector(':scope > '+selector);}catch(error){return card.querySelector(selector);}
  }

  function setText(node,text){
    if(node&&node.textContent.trim()!==text)node.textContent=text;
  }

  function enhanceCoreServices(){
    var services=d.querySelector('.cooperation-page #services');
    if(!services)return;
    var heading=services.querySelector('.module-heading');
    if(heading){
      setText(heading.querySelector('h2'),'六类项目合作能力');
      setText(heading.querySelector('p'),'六类项目合作能力采用“三类核心项目交付 + 三项数智化产品与技术能力”的3+3结构：01–03聚焦制造现场与工程改善，04–06聚焦数字化、软件与官网载体；共同遵循问题定义、方案／原型、Pilot／测试、交付验收与持续迭代的闭环逻辑。');
    }

    var grid=services.querySelector('.module-grid');
    if(!grid||grid.dataset.qilySixCoreServices==='v1')return;
    grid.dataset.qilySixCoreServices='v1';
    grid.insertAdjacentHTML('beforeend',
      '<article class="module-card service-card" data-qily-service-key="digital-factory">'+
        '<a class="service-heading-link" href="/projects/digital-factory/" aria-label="查看数字化工厂规划与数据治理项目证据"><span class="service-number">04</span><small>Digital Factory</small><h3>数字化工厂</h3></a>'+
        '<p>以业务流程和主数据为底座，打通订单、计划、工艺、工时、设备、质量、库存与现场执行，围绕ERP／MES／APS、设备数据、生产透明化和管理看板形成可实施的数字化蓝图，避免“系统上线等于管理落地”。</p>'+
        '<div class="scope-list"><span>业务流程／数字化蓝图</span><span>ERP／MES／APS需求</span><span>BOM／工艺／工时主数据</span><span>设备数据／OEE</span><span>生产看板／DMS</span><span>Pilot／上线验收</span></div>'+
        '<div class="module-result">标准交付：现状诊断、数字化蓝图、数据字典与口径、功能需求、接口清单、看板原型、实施路线、Pilot验证与验收机制。</div>'+
        '<div class="service-contract"><div class="service-contract-meta"><strong>相关成果证据</strong><span>数字化工厂项目</span></div><a class="service-contract-link" href="/projects/digital-factory/">查看数字化工厂项目证据</a></div>'+
      '</article>'+
      '<article class="module-card service-card" data-qily-service-key="app-development">'+
        '<a class="service-heading-link" href="/tools/times26001/" aria-label="查看APP软件开发实证作品Times26001"><span class="service-number">05</span><small>APP Software Development</small><h3>APP软件开发</h3></a>'+
        '<p>围绕IE测时、现场采集、异常记录、移动看板、提醒与轻量化管理等制造场景，把重复的纸面或Excel操作转化为可运行的软件工具；从需求、原型、开发、测试到安装包、发布与版本迭代形成闭环。</p>'+
        '<div class="scope-list"><span>需求场景／产品原型</span><span>Android／iOS／Web</span><span>数据录入／统计分析</span><span>通知／权限／离线能力</span><span>测试／打包／发布</span><span>版本迭代／使用支持</span></div>'+
        '<div class="module-result">标准交付：需求清单、交互原型、可运行版本、测试记录、安装包／发布包、使用说明、版本清单与验收记录。</div>'+
        '<div class="service-contract"><div class="service-contract-meta"><strong>当前实证作品</strong><span>Times26001</span></div><a class="service-contract-link" href="/tools/times26001/">查看APP软件开发实证</a></div>'+
      '</article>'+
      '<article class="module-card service-card" data-qily-service-key="website-development">'+
        '<a class="service-heading-link" href="/" aria-label="查看QilyLean官网建设实证"><span class="service-number">06</span><small>Website Development</small><h3>官网建设</h3></a>'+
        '<p>不把官网当作单纯页面装修，而是围绕品牌定位、信息架构、可信证据、内容体系、SEO、咨询入口、移动适配、性能与持续运维，建设能够解释能力、承接咨询并沉淀专业资产的企业或个人专业官网。</p>'+
        '<div class="scope-list"><span>品牌定位／信息架构</span><span>UI／响应式页面</span><span>项目证据／内容体系</span><span>SEO／结构化数据</span><span>表单／邮箱／分享入口</span><span>域名／部署／持续运维</span></div>'+
        '<div class="module-result">标准交付：信息架构、页面模板、响应式官网、SEO基础、咨询入口、证据链、部署配置、运维规范与版本记录。</div>'+
        '<div class="service-contract"><div class="service-contract-meta"><strong>当前实证作品</strong><span>QilyLean官网</span></div><a class="service-contract-link" href="/">查看QilyLean官网建设实证</a></div>'+
      '</article>'
    );
  }

  function enhanceServiceBoundaries(){
    var section=d.querySelector('.cooperation-page #boundary');
    if(!section)return;
    var heading=section.querySelector('.module-heading');
    if(heading){
      setText(heading.querySelector('h2'),'六类项目合作边界');
      setText(heading.querySelector('p'),'新工厂／新产线规划、精益改善、目视化、数字化工厂、APP软件开发与官网建设的输入条件、专业责任和验收口径不同，须按项目类型分别定义范围，不以一套边界概括全部合作能力。');
    }
    var grid=section.querySelector('.boundary-service-grid');
    if(!grid||grid.dataset.qilySixServiceBoundary==='v1')return;

    var existing=Array.from(grid.querySelectorAll('.boundary-service-card'));
    function findByText(text){return existing.find(function(card){return card.textContent.indexOf(text)!==-1;});}
    var planning=findByText('新工厂／新产线规划');
    var digital=findByText('数字化工厂项目');
    var lean=findByText('精益改善项目');
    var visual=findByText('目视化项目');

    if(planning)setText(planning.querySelector('.boundary-type'),'01｜新工厂／新产线规划');
    if(lean)setText(lean.querySelector('.boundary-type'),'02｜精益改善项目');
    if(visual)setText(visual.querySelector('.boundary-type'),'03｜目视化项目');
    if(digital)setText(digital.querySelector('.boundary-type'),'04｜数字化工厂');

    [planning,lean,visual,digital].filter(Boolean).forEach(function(card){grid.appendChild(card);});

    grid.insertAdjacentHTML('beforeend',
      '<article class="boundary-service-card qily-static-card" data-qily-boundary-key="app-development"><span class="boundary-type">05｜APP软件开发</span><h3>需求、版本与发布边界</h3><div class="boundary-split"><div><strong>适合启动</strong><ul><li>已有明确使用场景、核心用户、关键流程和必须解决的问题。</li><li>能够确认目标平台、数据来源、权限、通知、离线及发布方式等关键约束。</li><li>接受通过原型、测试版和验收版分阶段评审，并提供真实使用反馈。</li></ul></div><div class="boundary-hold"><strong>暂缓启动</strong><ul><li>只有一句“做个APP”的概念，却没有用户、流程、数据和验收需求。</li><li>需求持续无边界扩张，同时要求固定周期、固定价格且不限修改。</li><li>涉及支付、金融、医疗、地图、短信等第三方能力，却不提供合法账号、资质、费用或接口条件。</li></ul></div></div><p class="boundary-note"><strong>专业边界：</strong>按确认需求交付原型、可运行版本、测试与发布资料；应用商店审核、第三方平台政策、账号资质及外部接口可用性受平台规则约束，不承诺由QilyLean单方决定的审核结果。</p></article>'+
      '<article class="boundary-service-card qily-static-card" data-qily-boundary-key="website-development"><span class="boundary-type">06｜官网建设</span><h3>内容、可信度与运维边界</h3><div class="boundary-split"><div><strong>适合启动</strong><ul><li>品牌定位、目标客户、核心业务、案例证据和咨询转化目标已有基本方向。</li><li>能够提供合法使用的文字、图片、商标、资质、项目证据及联系方式。</li><li>愿意持续维护内容、域名、邮箱、表单、证书与第三方服务账号。</li></ul></div><div class="boundary-hold"><strong>暂缓启动</strong><ul><li>只追求“高端好看”，却没有可信内容、业务逻辑和持续更新机制。</li><li>要求虚构客户、资质、案例、评价或夸大未经验证的经营与项目成果。</li><li>要求网站建设方永久承担域名、服务器、第三方平台、备案或外部服务的全部政策风险。</li></ul></div></div><p class="boundary-note"><strong>专业边界：</strong>交付信息架构、页面与交互、响应式适配、SEO基础、咨询入口、部署与运维规范；客户提供内容及资质须真实合法，备案、搜索收录、第三方审核与外部服务可用性按对应平台规则执行。</p></article>'
    );
    grid.dataset.qilySixServiceBoundary='v1';
  }

  function alignCoreServices(){
    var cards=Array.from(d.querySelectorAll('.cooperation-page #services .service-card'));
    if(!cards.length)return;
    var selectors=['.service-heading-link','p','.scope-list','.module-result','.service-contract'];
    cards.forEach(function(card){
      selectors.forEach(function(selector){
        var node=directChild(card,selector);
        if(node)node.style.minHeight='';
      });
    });
    if(w.innerWidth<=820)return;
    groupByVisualRow(cards).forEach(function(row){
      if(row.nodes.length<2)return;
      selectors.forEach(function(selector){
        var nodes=row.nodes.map(function(card){return directChild(card,selector);}).filter(Boolean);
        if(nodes.length<2)return;
        var max=Math.max.apply(null,nodes.map(function(node){return Math.ceil(node.getBoundingClientRect().height);}));
        nodes.forEach(function(node){node.style.minHeight=max+'px';});
      });
    });
  }

  function ensureBackToTop(dock){
    var top=dock.querySelector('[data-action="top"]');
    if(!top){
      top=d.createElement('button');
      top.type='button';
      top.className='qily-float-btn qily-float-top';
      top.setAttribute('data-action','top');
    }
    top.setAttribute('aria-label','回顶部');
    top.setAttribute('title','回顶部');
    top.innerHTML='回<br>顶部';
    return top;
  }

  function bindBackToTop(top){
    if(top.dataset.qilyBound==='2')return;
    top.dataset.qilyBound='2';
    var startY=0,moved=false;
    function goTop(event){if(event){event.preventDefault();event.stopPropagation();}d.documentElement.scrollTop=0;d.body.scrollTop=0;w.scrollTo(0,0);w.requestAnimationFrame(function(){w.scrollTo(0,0);});}
    top.addEventListener('pointerdown',function(event){startY=event.clientY;moved=false;},{capture:true,passive:true});
    top.addEventListener('pointermove',function(event){if(Math.abs(event.clientY-startY)>8)moved=true;},{capture:true,passive:true});
    top.addEventListener('pointerup',function(event){if(!moved)goTop(event);},{capture:true,passive:false});
    top.addEventListener('click',goTop,true);
  }

  function normalizeDock(){
    var dock=d.getElementById('floatDock');
    if(!dock)return false;

    var top=ensureBackToTop(dock);
    var labels={
      home:{html:'首页',aria:'首页'},
      top:{html:'回<br>顶部',aria:'回顶部'},
      back:{html:'回<br>上一层',aria:'回上一层'},
      search:{html:'本站<br>搜索',aria:'本站搜索'},
      current:{html:'分享<br>当前页',aria:'分享当前页'},
      share:{html:'分享<br>官网',aria:'分享官网'},
      contact:{html:'交流',aria:'交流'}
    };
    var order=['home','top','back','search','current','share','contact'];

    var buttons=order.map(function(action){
      var button=action==='top'?top:dock.querySelector('[data-action="'+action+'"]');
      if(!button)return null;
      if(button.innerHTML!==labels[action].html)button.innerHTML=labels[action].html;
      if(button.getAttribute('aria-label')!==labels[action].aria)button.setAttribute('aria-label',labels[action].aria);
      if(button.getAttribute('title')!==labels[action].aria)button.setAttribute('title',labels[action].aria);
      return button;
    }).filter(Boolean);

    var current=Array.from(dock.children).filter(function(node){return node.matches&&node.matches('.qily-float-btn[data-action]');});
    var orderChanged=current.length!==buttons.length||buttons.some(function(button,index){return current[index]!==button;});
    if(orderChanged){
      var fragment=d.createDocumentFragment();
      buttons.forEach(function(button){fragment.appendChild(button);});
      dock.appendChild(fragment);
    }
    dock.dataset.qilyStableOrder=buttons.map(function(button){return button.getAttribute('data-action');}).join(',');

    bindBackToTop(top);
    return buttons.length===order.length;
  }

  function apply(){
    d.documentElement.classList.remove('qily-shell-pending','qily-first-paint-pending');
    enhanceCoreServices();
    enhanceServiceBoundaries();
    alignCoreServices();
    if(normalizeDock())stopDockObserver();
  }

  var queued=false;
  function queue(){
    if(queued)return;
    queued=true;
    w.requestAnimationFrame(function(){queued=false;apply();});
  }

  var dockObserver=null;
  function stopDockObserver(){
    if(!dockObserver)return;
    dockObserver.disconnect();
    dockObserver=null;
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',queue,{once:true});
  else queue();
  w.addEventListener('load',queue,{once:true});
  w.addEventListener('resize',queue,{passive:true});
  if('MutationObserver'in w){
    dockObserver=new MutationObserver(queue);
    dockObserver.observe(d.documentElement,{childList:true,subtree:true});
    w.setTimeout(stopDockObserver,2600);
  }
  [60,220,700,1600].forEach(function(delay){w.setTimeout(queue,delay);});
})(document,window);
