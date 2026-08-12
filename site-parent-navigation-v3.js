/* QilyLean 悬浮栏“返回上一层”父级路由规范 v3｜2026-08-03 */
(function(d,w){
  'use strict';
  if(w.__qilyParentNavigationV3)return;
  w.__qilyParentNavigationV3=true;

  function normalizedPath(path){
    var value=(path||'/').replace(/\/index\.html$/,'/');
    value=value.replace(/\/{2,}/g,'/');
    return value.length>1?value.replace(/\/+$/,'/'):'/';
  }

  function configuredParent(){
    var body=d.body;
    var value=(body&&body.getAttribute('data-parent-route'))||'';
    if(value)return value;
    var link=d.querySelector('link[rel="up"][href]');
    return link?link.getAttribute('href')||'':'';
  }

  function parentRoute(path){
    path=normalizedPath(path);
    var configured=configuredParent();
    if(configured)return configured;

    if(path==='/')return '/';

    /* 每日简报详情先返回简报目录，再由目录返回知识分享。 */
    if(/^\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html$/.test(path))return '/qilylean/daily-insights.html';
    if(path==='/qilylean/daily-insights.html')return '/knowledge/';

    /* 制造改善佐证在线预览页先返回佐证总页。 */
    if(path.indexOf('/projects/lean-improvement-evidence/')===0&&path!=='/projects/lean-improvement-evidence/'){
      return '/projects/lean-improvement-evidence/';
    }

    /* QilyLean旧路径知识资产统一归入知识分享。 */
    if(/^\/qilylean\/(?:lean-knowledge|lean-tools|execution-loop|gbt2828|production-operations-organization|reference-[^/]+)\.html$/.test(path)){
      return '/knowledge/';
    }

    /* 各一级栏目详情页返回所属栏目首页。 */
    if(path.indexOf('/projects/')===0&&path!=='/projects/')return '/projects/';
    if(path.indexOf('/improvements/')===0&&path!=='/improvements/')return '/improvements/';
    if(path.indexOf('/capabilities/')===0&&path!=='/capabilities/')return '/capabilities/';
    if(path.indexOf('/experience/')===0&&path!=='/experience/')return '/experience/';
    if(path.indexOf('/knowledge/')===0&&path!=='/knowledge/')return '/knowledge/';
    if(path.indexOf('/moments/')===0&&path!=='/moments/')return '/moments/';
    if(path.indexOf('/cooperation/')===0&&path!=='/cooperation/')return '/cooperation/';
    if(path.indexOf('/links/')===0&&path!=='/links/')return '/links/';
    if(path.indexOf('/trust/')===0&&path!=='/trust/')return '/trust/';

    /* 一级栏目本身的上一层为首页。 */
    if([
      '/ai.html','/capabilities/','/experience/','/projects/','/improvements/',
      '/knowledge/','/moments/','/cooperation/','/links/','/trust/'
    ].indexOf(path)!==-1)return '/';

    /* 未归类的多级路径按目录层级回退，避免直接跳首页。 */
    var clean=path.replace(/\/$/,'');
    var slash=clean.lastIndexOf('/');
    if(slash>0)return clean.slice(0,slash+1);
    return '/';
  }

  function isBackButton(target){
    return target&&target.closest?target.closest('[data-action="back"]'):null;
  }

  function navigateParent(){
    var target=parentRoute(location.pathname);
    if(normalizedPath(target)===normalizedPath(location.pathname))target='/';
    location.href=target;
  }

  var pointer=null;
  var handledAt=0;

  /*
   * 悬浮栏自身会捕获指针用于上下拖动，因此pointerup的event.target可能变成整个Dock。
   * 这里以pointerdown是否起始于“返回上一层”及移动距离判断点击，不再依赖松手目标。
   */
  d.addEventListener('pointerdown',function(event){
    var button=isBackButton(event.target);
    if(!button)return;
    pointer={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};
  },true);

  d.addEventListener('pointermove',function(event){
    if(!pointer||event.pointerId!==pointer.id)return;
    if(Math.abs(event.clientX-pointer.x)>8||Math.abs(event.clientY-pointer.y)>8)pointer.moved=true;
  },true);

  d.addEventListener('pointerup',function(event){
    if(!pointer||event.pointerId!==pointer.id)return;
    var shouldNavigate=!pointer.moved;
    pointer=null;
    if(!shouldNavigate)return;
    handledAt=Date.now();
    event.preventDefault();
    event.stopImmediatePropagation();
    navigateParent();
  },true);

  d.addEventListener('pointercancel',function(event){
    if(pointer&&event.pointerId===pointer.id)pointer=null;
  },true);

  /* 键盘Enter／Space及不支持Pointer Events的浏览器回退。 */
  d.addEventListener('click',function(event){
    var button=isBackButton(event.target);
    if(!button)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if(Date.now()-handledAt<600)return;
    navigateParent();
  },true);

  function labelButton(){
    var button=d.querySelector('[data-action="back"]');
    if(!button)return false;
    button.setAttribute('title','返回当前页面所属的上一级栏目');
    button.setAttribute('aria-label','返回上一级栏目');
    button.setAttribute('data-parent-route',parentRoute(location.pathname));
    return true;
  }

  if(!labelButton()){
    var observer=new MutationObserver(function(){
      if(labelButton())observer.disconnect();
    });
    observer.observe(d.documentElement,{childList:true,subtree:true});
    setTimeout(function(){observer.disconnect();},6000);
  }
})(document,window);

/* QilyLean 全站竞争力升级｜统一导视与制造运营资产逻辑 V3｜2026-08-12
 * 一级导视只承担核心认知路径；AI、行走印记、资源网络等保留为内容资产，但不与主专业链路同权竞争。
 */
(function(d,w){
  'use strict';
  if(w.__qilySiteOperatingSystemV3)return;
  w.__qilySiteOperatingSystemV3=true;

  var PRIMARY_ROUTES=[
    ['首页','/'],
    ['能力体系','/capabilities/'],
    ['代表项目','/projects/'],
    ['改善方法','/improvements/'],
    ['知识资产','/knowledge/'],
    ['履历主线','/experience/'],
    ['项目合作','/cooperation/'],
    ['信任中心','/trust/']
  ];

  var AXIS=[
    ['现场事实','Gemba／问题／约束'],
    ['工程数据','CT／TT／WIP／产能'],
    ['精益改善','流动／节拍／损失'],
    ['质量保证','标准／防错／闭环'],
    ['数智固化','ERP／MES／APS／看板'],
    ['知识资产','SOP／模板／证据／复制']
  ];

  function normalized(path){
    var value=(path||'/').replace(/\/index\.html$/,'/').replace(/\/{2,}/g,'/');
    return value.length>1?value.replace(/\/+$/,'/'):'/';
  }

  function currentRoute(path){
    path=normalized(path);
    if(path==='/')return '/';
    for(var i=1;i<PRIMARY_ROUTES.length;i++){
      if(path.indexOf(PRIMARY_ROUTES[i][1])===0)return PRIMARY_ROUTES[i][1];
    }
    if(path.indexOf('/qilylean/daily/')===0||path==='/qilylean/daily-insights.html'||path.indexOf('/qilylean/lean-')===0)return '/knowledge/';
    return '';
  }

  function axisIndex(path){
    path=normalized(path);
    if(path.indexOf('/experience/')===0)return 0;
    if(path.indexOf('/capabilities/')===0)return 1;
    if(path.indexOf('/projects/')===0||path.indexOf('/improvements/')===0)return 2;
    if(path.indexOf('/trust/')===0)return 3;
    if(path.indexOf('/cooperation/')===0)return 4;
    if(path.indexOf('/knowledge/')===0||path.indexOf('/qilylean/daily')===0)return 5;
    return -1;
  }

  function normalizeNavigation(){
    var nav=d.querySelector('.qily-global-nav,nav.site-nav,nav.nav');
    if(!nav)return false;
    var signature=PRIMARY_ROUTES.map(function(route){return route[0]+'|'+route[1];}).join('>');
    var current=currentRoute(location.pathname);
    var existing=Array.from(nav.querySelectorAll(':scope>a[href]'));
    var isNormalized=nav.dataset.qilyPrimaryNavigation==='v3'&&existing.length===PRIMARY_ROUTES.length&&existing.every(function(link,index){
      return normalized(link.getAttribute('href'))===PRIMARY_ROUTES[index][1]&&link.textContent.trim()===PRIMARY_ROUTES[index][0];
    });
    if(isNormalized){
      existing.forEach(function(link){
        if(normalized(link.getAttribute('href'))===current)link.setAttribute('aria-current','page');
        else link.removeAttribute('aria-current');
      });
      return true;
    }

    var fragment=d.createDocumentFragment();
    PRIMARY_ROUTES.forEach(function(route){
      var link=d.createElement('a');
      link.href=route[1];
      link.textContent=route[0];
      link.setAttribute('data-qily-primary-route',route[1]);
      if(route[1]===current)link.setAttribute('aria-current','page');
      fragment.appendChild(link);
    });
    nav.replaceChildren(fragment);
    nav.dataset.qilyPrimaryNavigation='v3';
    nav.dataset.qilyNavigationSignature=signature;
    nav.setAttribute('aria-label','QilyLean核心导视');
    return true;
  }

  function buildAxis(){
    var path=normalized(location.pathname);
    var landing=['/','/capabilities/','/projects/','/improvements/','/knowledge/','/experience/','/cooperation/','/trust/'];
    if(landing.indexOf(path)===-1||d.querySelector('.qily-system-axis'))return;
    var hero=d.querySelector('.hero,.module-hero,.daily-hero,.project-hero,.projects-hero,.cooperation-hero,.capability-hero,.capabilities-hero,.experience-hero,.improvement-hero,.improvements-hero,.knowledge-hero,.trust-hero');
    if(!hero||!hero.parentNode)return;
    var section=d.createElement('section');
    section.className='qily-system-axis';
    section.setAttribute('aria-label','QilyLean制造运营资产闭环');
    var current=axisIndex(path);
    section.innerHTML='<div class="qily-system-axis__inner"><p class="qily-system-axis__title">QILYLEAN OPERATING LOGIC｜制造运营资产闭环</p><div class="qily-system-axis__steps">'+AXIS.map(function(item,index){
      return '<div class="qily-system-axis__step'+(index===current?' is-current':'')+'"><strong>'+(index+1).toString().padStart(2,'0')+'｜'+item[0]+'</strong><span>'+item[1]+'</span></div>';
    }).join('')+'</div></div>';
    hero.parentNode.insertBefore(section,hero.nextSibling);
  }

  function rewriteHome(){
    var path=normalized(location.pathname);
    if(path!=='/')return;
    if(!d.body)return;
    d.body.classList.add('qily-home-v3','qily-system-v3');
    var hero=d.querySelector('.hero');
    if(!hero)return;
    var eyebrow=hero.querySelector('.eyebrow');
    var title=hero.querySelector('h1');
    var lead=hero.querySelector('.lead');
    var note=hero.querySelector('.qily-home-relocation-note');
    if(eyebrow)eyebrow.textContent='QILYLEAN MANUFACTURING OPERATING SYSTEM｜从制造现场到组织资产';
    if(title)title.textContent='把制造现场，变成可计算、可改善、可固化、可复用的组织资产';
    if(lead)lead.textContent='从现场事实出发，以工业工程建立可计算的工程底座，以精益消除流动与损失，以质量方法锁定过程，再用数智系统固化机制，最终沉淀为可复用的知识、标准与组织能力。';
    if(note)note.innerHTML='QilyLean不是“工具集合”，而是一条从<strong>问题定义 → 数据基线 → 改善验证 → 标准固化 → 系统运行 → 组织复制</strong>的完整闭环。';

    var actions=hero.querySelector('.actions');
    if(actions){
      actions.classList.add('qily-home-actions');
      actions.innerHTML='<a class="primary" href="/capabilities/">查看能力体系</a><a href="/projects/">查看代表项目与证据</a><a href="/cooperation/">进入项目合作</a><a href="/trust/">了解责任与证据边界</a>';
    }

    var core=d.getElementById('qily-core-services');
    if(core){
      var kicker=core.querySelector('.qily-ia-kicker');
      var h2=core.querySelector('.qily-ia-heading h2');
      var p=core.querySelector('.qily-ia-heading p');
      if(kicker)kicker.textContent='SIX DELIVERY CAPABILITIES｜六类能力服务同一条运营闭环';
      if(h2)h2.textContent='六类交付能力｜从工厂现场延伸到数智化载体';
      if(p)p.textContent='新工厂／新产线规划、精益改善、目视化解决“现场如何更好运行”；数字化工厂、APP软件、官网建设解决“机制如何被固化、复用与传播”。六类能力不是并列菜单，而是制造业务逻辑向工程、系统与知识资产的延伸。';
    }

    var proof=d.getElementById('qily-home-proof');
    if(proof){
      var proofKicker=proof.querySelector('.qily-ia-kicker');
      var proofTitle=proof.querySelector('.qily-ia-heading h2');
      var proofLead=proof.querySelector('.qily-ia-heading p');
      if(proofKicker)proofKicker.textContent='COMPETITIVE VALUE｜竞争力来自闭环，不来自工具数量';
      if(proofTitle)proofTitle.textContent='懂现场、能计算、会改善、可固化、能证明、可复制';
      if(proofLead)proofLead.textContent='真正的制造改善竞争力，是能把现场问题翻译成工程数据，把数据转化为改善动作，再把有效动作沉淀为标准、系统、证据和组织能力。';
    }
  }

  function markSystem(){
    if(!d.body)return;
    d.body.classList.add('qily-system-v3');
    d.documentElement.dataset.qilySiteSystem='v3';
  }

  function boot(){
    markSystem();
    normalizeNavigation();
    rewriteHome();
    buildAxis();
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  var observer=null;
  if(w.MutationObserver){
    observer=new MutationObserver(function(){
      normalizeNavigation();
      buildAxis();
    });
    observer.observe(d.documentElement,{childList:true,subtree:true});
    w.setTimeout(function(){if(observer)observer.disconnect();observer=null;},5000);
  }
  [80,260,700,1600,3200].forEach(function(delay){w.setTimeout(boot,delay);});
})(document,window);
