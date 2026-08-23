/* QilyLean 轻量父级导航与外壳一致性 v3.4｜2026-08-23
 * 性能原则：静态HTML首帧即正确；运行时只校正导航、悬浮栏及首页关键数字产品入口。
 * 本轮将 Pure DDZ 首页入口切换到通过 Android 35 真启动门禁的 v1.1.0。
 */
(function(d,w){
  'use strict';
  if(w.__qilyUiConsistencyV3)return;
  w.__qilyUiConsistencyV3=true;
  w.__qilyUiConsistencyV2=true;

  var BUILD_ID='20260823-pure-ddz-overview-v16';
  var BUILD_KEY='qily_site_ui_build_v1';

  d.documentElement.classList.remove('qily-shell-pending','qily-r2-first-paint-pending');

  function normalizedPath(path){
    var value=(path||'/').replace(/\/index\.html$/,'/').replace(/\/{2,}/g,'/');
    if(value.length<=1)return '/';
    if(value.charAt(value.length-1)!=='/'&&!/\/[^/]+\.[^/]+$/.test(value))value+='/';
    return value.replace(/\/+$/,'/');
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
    if(/^\/legal\/times26001\/(?:privacy|terms)\/$/.test(path))return '/tools/times26001/';
    if(path==='/app-support/')return '/tools/times26001/';
    if(path.indexOf('/tools/')===0)return '/';
    if(/^\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html$/.test(path))return '/qilylean/daily-insights.html';
    if(path==='/qilylean/daily-insights.html')return '/knowledge/';
    if(path.indexOf('/projects/lean-improvement-evidence/')===0&&path!=='/projects/lean-improvement-evidence/')return '/projects/lean-improvement-evidence/';
    if(/^\/qilylean\/(?:lean-knowledge|lean-tools|execution-loop|gbt2828|production-operations-organization|reference-[^/]+)\.html$/.test(path))return '/knowledge/';
    var roots=['projects','improvements','capabilities','experience','knowledge','moments','cooperation','links','trust'];
    for(var i=0;i<roots.length;i++){
      var root='/'+roots[i]+'/';
      if(path.indexOf(root)===0&&path!==root)return root;
    }
    if(path==='/ai.html')return '/';
    for(var j=0;j<roots.length;j++)if(path==='/'+roots[j]+'/')return '/';
    return '/';
  }

  function navigateParent(){
    var target=parentRoute(location.pathname);
    if(normalizedPath(target)===normalizedPath(location.pathname))target='/';
    location.assign(target);
  }

  function rememberBuild(){
    try{w.localStorage.setItem(BUILD_KEY,BUILD_ID);}catch(error){}
    d.documentElement.setAttribute('data-qily-ui-build',BUILD_ID);
  }

  var pointer=null;
  var handledAt=0;
  d.addEventListener('pointerdown',function(event){
    var button=event.target&&event.target.closest?event.target.closest('[data-action="back"]'):null;
    if(!button)return;
    pointer={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};
  },true);
  d.addEventListener('pointermove',function(event){
    if(!pointer||event.pointerId!==pointer.id)return;
    if(Math.abs(event.clientX-pointer.x)>8||Math.abs(event.clientY-pointer.y)>8)pointer.moved=true;
  },true);
  d.addEventListener('pointerup',function(event){
    if(!pointer||event.pointerId!==pointer.id)return;
    var go=!pointer.moved;pointer=null;if(!go)return;
    handledAt=Date.now();event.preventDefault();event.stopImmediatePropagation();navigateParent();
  },true);
  d.addEventListener('pointercancel',function(event){if(pointer&&event.pointerId===pointer.id)pointer=null;},true);
  d.addEventListener('click',function(event){
    var button=event.target&&event.target.closest?event.target.closest('[data-action="back"]'):null;
    if(!button)return;
    event.preventDefault();event.stopImmediatePropagation();
    if(Date.now()-handledAt<600)return;navigateParent();
  },true);

  function primaryModule(path){
    path=normalizedPath(path);
    if(path==='/')return '/';
    if(path.indexOf('/capabilities/')===0)return '/capabilities/';
    if(path.indexOf('/projects/')===0)return '/projects/';
    if(path.indexOf('/improvements/')===0||/\/(?:execution|papers)\.html$/.test(path)||/\/qilylean\/papers\.html$/.test(path))return '/improvements/';
    if(path.indexOf('/knowledge/')===0||path.indexOf('/qilylean/daily/')===0||/^\/(?:knowledge|daily|daily-insights|gbt2828)\.html$/.test(path)||/\/qilylean\/(?:lean-knowledge|daily-insights|lean-tools|execution-loop|reference-|gbt2828)/.test(path))return '/knowledge/';
    if(path.indexOf('/experience/')===0)return '/experience/';
    if(path.indexOf('/links/')===0)return '/links/';
    if(path.indexOf('/cooperation/')===0)return '/cooperation/';
    if(path.indexOf('/trust/')===0||path.indexOf('/certificates/')===0||path.indexOf('/legal/')===0)return '/trust/';
    return '';
  }

  function ensurePrimaryNavCurrentStyles(){
    if(d.getElementById('qilyPrimaryNavCurrentStateV7'))return;
    var style=d.createElement('style');
    style.id='qilyPrimaryNavCurrentStateV7';
    style.textContent=[
      'html body header :is(.qily-global-nav,nav.site-nav,nav.nav,nav[aria-label="网站导航"],nav[aria-label="QilyLean核心导视"])>a[href][aria-current="page"][data-qily-primary-current="true"]{color:#fff!important;-webkit-text-fill-color:#fff!important;background:#0f4b5a!important;border:2px solid #ffe39b!important;text-decoration-color:#ffe39b!important;text-decoration-thickness:2.2px!important;box-shadow:0 7px 18px rgba(15,75,90,.24)!important}',
      'html body header :is(.qily-global-nav,nav.site-nav,nav.nav,nav[aria-label="网站导航"],nav[aria-label="QilyLean核心导视"])>a[href][aria-current="page"][data-qily-primary-current="true"]:is(:hover,:focus-visible){color:#fff!important;-webkit-text-fill-color:#fff!important;background:#12606f!important;border-color:#ffe39b!important;box-shadow:0 9px 22px rgba(15,75,90,.30)!important}'
    ].join('');
    (d.head||d.documentElement).appendChild(style);
  }

  function primaryRouteForLink(link){
    var target;
    try{target=new URL(link.getAttribute('href')||'',location.origin);}catch(error){return '';}
    if(target.origin!==location.origin)return '';
    var path=normalizedPath(target.pathname);
    return ['/','/capabilities/','/projects/','/improvements/','/knowledge/','/experience/','/links/','/cooperation/','/trust/'].indexOf(path)!==-1?path:'';
  }

  function normalizePrimaryNav(){
    var path=normalizedPath(location.pathname);
    var modulePath=primaryModule(path);
    ensurePrimaryNavCurrentStyles();
    d.querySelectorAll('.qily-global-nav,nav.site-nav,nav.nav').forEach(function(nav){
      if(!modulePath)return;
      Array.from(nav.children).forEach(function(link){
        if(!link.matches||!link.matches('a[href]'))return;
        var routePath=primaryRouteForLink(link);if(!routePath)return;
        var active=routePath===modulePath;
        if(active){
          link.setAttribute('aria-current','page');
          link.setAttribute('data-qily-primary-current','true');
        }else{
          link.removeAttribute('aria-current');link.removeAttribute('aria-selected');link.removeAttribute('data-current');link.removeAttribute('data-active');link.removeAttribute('data-qily-primary-current');
          link.classList.remove('active','current','is-active','selected');
        }
      });
    });
  }

  function normalizeDock(){
    var dock=d.getElementById('floatDock');
    if(!dock)return false;
    var back=dock.querySelector('[data-action="back"]');
    if(back){back.setAttribute('data-parent-route',parentRoute(location.pathname));back.setAttribute('title','回到当前页面所属的上一级有效页面');back.setAttribute('aria-label','回上一层');}
    dock.querySelectorAll('[data-action="share"]').forEach(function(button){button.remove();});
    return true;
  }

  function ensurePureDdzHomeEntry(){
    if(normalizedPath(location.pathname)!=='/'||d.getElementById('qilyPureDdzStableEntry'))return;

    var heroActions=d.querySelector('.qily-home-actions,.hero .actions,.hero-actions');
    if(heroActions&&!heroActions.querySelector('[href="/tools/pure-ddz/"]')){
      var heroLink=d.createElement('a');
      heroLink.href='/tools/pure-ddz/';
      heroLink.textContent='纯净斗地主｜在线玩';
      heroLink.setAttribute('data-qily-pure-ddz-entry','hero');
      heroActions.appendChild(heroLink);
    }

    var anchor=d.getElementById('qily-digital-enablers')||d.getElementById('qily-core-services');
    if(!anchor||!anchor.parentNode)return;

    var section=d.createElement('section');
    section.id='qilyPureDdzStableEntry';
    section.className='qily-ia-section';
    section.setAttribute('data-qily-static-source','pure-ddz-stable-entry-v4');
    section.innerHTML='<div class="qily-ia-inner"><div class="qily-ia-heading"><span class="qily-ia-kicker">DIGITAL PRODUCT｜休闲数字作品</span><h2>Pure DDZ Classic｜纯净斗地主</h2><p>QilyLean 无广告斗地主｜简单娱乐，益智生活。源于父母辈真实使用需求：减少实名注册、账号登录和验证码等操作门槛，打开即可轻松娱乐；也适合成年人于高强度工作之外放松思考。</p></div><div class="qily-ia-grid"><article class="qily-ia-card"><small>WEB GAME｜ONLINE</small><h3>无广告 · 打开即玩</h3><p>默认 Expert 专家级 AI，公开信息记牌、牌型保护、残局压制、农民协同，并保留智能提示、积分战绩与中文语音。</p><div class="qily-ia-result">点击即进入牌桌，无需账号</div></article><article class="qily-ia-card"><small>ANDROID｜v1.1.0</small><h3>离线安装版</h3><p>v1.1.0 已通过 Android 35 模拟器真实安装、MainActivity 启动、5 秒进程存活及崩溃检查。</p><div class="qily-ia-result">Android 8及以上｜离线可用</div></article><article class="qily-ia-card"><small>QILYLEAN THEME｜06</small><h3>技能主题牌面</h3><p>54张牌以现场事实、工程数据、精益改善、质量保证、数智固化、知识资产及IE/ECRS/SMED/VSM/TPM/OEE等技能为主题；大王为个人头像，小王为C919六大业务飞机模型。</p><div class="qily-ia-result">传统牌面识别规则保持清晰</div></article></div><div class="qily-ia-actions"><a class="qily-ia-button primary" href="/tools/pure-ddz/">立即在线玩斗地主</a><a class="qily-ia-button" href="https://github.com/DingHunter623/Pure-DDZ-Classic/releases/download/v1.1.0/Pure-DDZ-Classic-v1.1.0.apk">下载 Android v1.1.0</a></div></div>';
    anchor.parentNode.insertBefore(section,anchor.nextSibling);
  }

  function reconcileFast(){normalizePrimaryNav();normalizeDock();ensurePureDdzHomeEntry();}
  function boot(){rememberBuild();reconcileFast();}

  d.addEventListener('qily:shell-ready',reconcileFast);
  w.addEventListener('pageshow',reconcileFast);

  w.__qilyParentNavigationV3=true;
  w.__qilyDockOrderContract=Object.freeze({order:['home','top','back','search','current','contact'],version:'20260823-pure-ddz-overview-v16'});
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(document,window);