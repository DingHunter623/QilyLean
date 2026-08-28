/* QilyLean Floating Dock Authoritative Runtime V5｜2026-08-28
 * R7 baseline: one Dock authority, no MutationObserver rebuild loop.
 * Canonical actions: 首页 / 回顶部 / 回上一层 / 本站搜索 / 分享当前页 / 联系我们.
 * Pure DDZ is an immersive game surface and explicitly excludes the site Dock.
 */
(function(d,w){
  'use strict';
  if(w.__qilyFloatingDockUnifiedV5)return;
  w.__qilyFloatingDockUnifiedV5=true;
  w.__qilyFloatingDockUnifiedV4=true;
  w.__qilyFloatingDockUnifiedV3=true;
  w.__qilyFloatingDockUnifiedV2=true;
  w.__qilyFloatingDockRetiredV1=false;

  var ORDER=['home','top','back','search','current','contact'];
  var LABELS={home:'首页',top:'回顶部',back:'回上一层',search:'本站搜索',current:'分享当前页',contact:'联系我们'};
  var EXCLUDED=/^\/tools\/pure-ddz(?:\/|\/index\.html)?$/;

  function normalizedPath(path){
    var value=(path||'/').replace(/\/index\.html$/,'/').replace(/\/{2,}/g,'/');
    if(value.length<=1)return '/';
    if(value.charAt(value.length-1)!=='/'&&!/\/[^/]+\.[^/]+$/.test(value))value+='/';
    return value.replace(/\/+$/,'/');
  }

  function isExcluded(){return EXCLUDED.test(normalizedPath(location.pathname));}

  function disableDockForPage(){
    d.documentElement.setAttribute('data-qily-dock','disabled');
    if(!d.getElementById('qilyDockDisabledV5Style')){
      var style=d.createElement('style');
      style.id='qilyDockDisabledV5Style';
      style.textContent='html[data-qily-dock="disabled"] body #floatDock{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}';
      (d.head||d.documentElement).appendChild(style);
    }
    var dock=d.getElementById('floatDock');if(dock)dock.remove();
  }

  function parentRoute(path){
    path=normalizedPath(path);
    var configured=(d.body&&d.body.getAttribute('data-parent-route'))||'';
    if(configured)return configured;
    var up=d.querySelector('link[rel="up"][href]');if(up)return up.getAttribute('href')||'/';
    if(path==='/')return '/';
    if(/^\/legal\/times26001\/(?:privacy|terms)\/$/.test(path)||path==='/app-support/')return '/tools/times26001/';
    if(/^\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html$/.test(path))return '/qilylean/daily-insights.html';
    if(path==='/qilylean/daily-insights.html')return '/knowledge/';
    if(/^\/qilylean\/(?:lean-knowledge|lean-tools|execution-loop|gbt2828|production-operations-organization|reference-[^/]+)\.html$/.test(path))return '/knowledge/';
    if(path.indexOf('/tools/')===0)return '/';
    var roots=['projects','improvements','capabilities','experience','knowledge','moments','cooperation','links','trust'];
    for(var i=0;i<roots.length;i++){
      var root='/'+roots[i]+'/';
      if(path.indexOf(root)===0&&path!==root)return root;
    }
    return '/';
  }

  function ensureStyles(){
    if(d.getElementById('qilyDockUnifiedV5Style'))return;
    var style=d.createElement('style');
    style.id='qilyDockUnifiedV5Style';
    style.textContent=[
      ':root{--qily-dock-v5-bg:#0f4b5a;--qily-dock-v5-hover:#12606f;--qily-dock-v5-line:#caa15f;--qily-dock-v5-text:#ffe39b}',
      'html body #floatDock.qily-float-dock,html body #floatDock.qily-floating-dock{position:fixed!important;right:max(12px,env(safe-area-inset-right))!important;bottom:max(12px,env(safe-area-inset-bottom))!important;left:auto!important;top:auto!important;z-index:2147482500!important;display:flex!important;flex-direction:column!important;align-items:center!important;gap:7px!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important}',
      'html body #floatDock .qily-float-btn{display:flex!important;flex:0 0 64px!important;width:64px!important;height:64px!important;min-width:64px!important;min-height:64px!important;max-width:64px!important;max-height:64px!important;align-items:center!important;justify-content:center!important;margin:0!important;padding:6px!important;border:1.5px solid var(--qily-dock-v5-line)!important;border-radius:999px!important;color:var(--qily-dock-v5-text)!important;-webkit-text-fill-color:var(--qily-dock-v5-text)!important;background:var(--qily-dock-v5-bg)!important;background-image:none!important;box-shadow:0 8px 20px rgba(7,60,71,.22)!important;opacity:1!important;filter:none!important;transform:none!important;font:850 13px/1.08 "Microsoft YaHei","PingFang SC",Arial,sans-serif!important;letter-spacing:0!important;text-align:center!important;white-space:normal!important;text-decoration:none!important;cursor:pointer!important;appearance:none!important;-webkit-appearance:none!important;touch-action:manipulation!important}',
      'html body #floatDock .qily-float-btn *,html body #floatDock .qily-float-btn:is(:link,:visited,:active){color:var(--qily-dock-v5-text)!important;-webkit-text-fill-color:var(--qily-dock-v5-text)!important}',
      'html body #floatDock .qily-float-btn:hover,html body #floatDock .qily-float-btn:focus-visible{background:var(--qily-dock-v5-hover)!important;border-color:var(--qily-dock-v5-text)!important;box-shadow:0 10px 24px rgba(7,60,71,.30)!important;outline:3px solid rgba(202,161,95,.22)!important;outline-offset:2px!important;transform:translateY(-1px)!important}',
      'html body #floatDock .qily-float-btn:active,html body #floatDock .qily-float-btn[data-qily-pressed="true"]{transform:translateY(1px) scale(.97)!important;box-shadow:0 4px 10px rgba(7,60,71,.24)!important}',
      '@media(max-width:620px){html body #floatDock.qily-float-dock,html body #floatDock.qily-floating-dock{right:max(8px,env(safe-area-inset-right))!important;bottom:max(8px,env(safe-area-inset-bottom))!important;gap:5px!important}html body #floatDock .qily-float-btn{flex-basis:56px!important;width:56px!important;height:56px!important;min-width:56px!important;min-height:56px!important;max-width:56px!important;max-height:56px!important;padding:4px!important;font-size:12px!important}}',
      '@media print{html body #floatDock{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}}'
    ].join('');
    (d.head||d.documentElement).appendChild(style);
  }

  function createStandaloneDock(){
    var dock=d.createElement('div');
    dock.id='floatDock';
    dock.className='qily-float-dock';
    dock.dataset.qilyStandaloneDock='v5';
    dock.setAttribute('aria-label','快捷服务');
    dock.innerHTML=[
      '<button class="qily-float-btn qily-float-home" data-action="home" type="button">首页</button>',
      '<button class="qily-float-btn qily-float-top" data-action="top" type="button">回顶部</button>',
      '<button class="qily-float-btn qily-float-back" data-action="back" type="button">回上一层</button>',
      '<button class="qily-float-btn qily-float-search" data-action="search" type="button">本站<br>搜索</button>',
      '<button class="qily-float-btn qily-float-current" data-action="current" type="button">分享<br>当前页</button>',
      '<button class="qily-float-btn qily-float-contact" data-action="contact" type="button">联系<br>我们</button>'
    ].join('');
    (d.body||d.documentElement).appendChild(dock);
    return dock;
  }

  function normalizeDock(){
    if(isExcluded()){disableDockForPage();return false;}
    d.documentElement.setAttribute('data-qily-dock','enabled');
    ensureStyles();
    var dock=d.getElementById('floatDock')||createStandaloneDock();
    dock.classList.add('qily-float-dock');
    dock.hidden=false;
    dock.removeAttribute('aria-hidden');
    dock.setAttribute('aria-label','快捷服务');
    dock.querySelectorAll('[data-action="share"]').forEach(function(node){node.remove();});
    var contactPage=dock.querySelector('[data-action="contact-page"]');if(contactPage)contactPage.setAttribute('data-action','contact');
    var controls={};
    ORDER.forEach(function(action){controls[action]=dock.querySelector('[data-action="'+action+'"]');});
    if(!controls.home||!controls.top||!controls.back||!controls.search||!controls.current||!controls.contact){
      dock.remove();dock=createStandaloneDock();controls={};ORDER.forEach(function(action){controls[action]=dock.querySelector('[data-action="'+action+'"]');});
    }
    controls.home.textContent=LABELS.home;
    controls.top.textContent=LABELS.top;
    controls.back.textContent=LABELS.back;
    controls.search.innerHTML='本站<br>搜索';
    controls.current.innerHTML='分享<br>当前页';
    controls.contact.innerHTML='联系<br>我们';
    controls.top.setAttribute('title','回到页面顶部');controls.top.setAttribute('aria-label','回顶部');
    controls.back.setAttribute('title','回到当前页面所属的上一级有效页面');controls.back.setAttribute('aria-label','回上一层');controls.back.setAttribute('data-parent-route',parentRoute(location.pathname));
    controls.home.setAttribute('aria-label','首页');controls.search.setAttribute('aria-label','本站搜索');controls.current.setAttribute('aria-label','分享当前页');controls.contact.setAttribute('aria-label','联系我们');
    var fragment=d.createDocumentFragment();ORDER.forEach(function(action){fragment.appendChild(controls[action]);});dock.appendChild(fragment);
    dock.dataset.qilyStableOrder=ORDER.join(',');dock.dataset.qilyUnifiedPublicModule='v5';
    installStandaloneFallback(dock);
    return true;
  }

  function legacyCopy(text){
    var area=d.createElement('textarea');area.value=text;area.setAttribute('readonly','');area.style.position='fixed';area.style.left='-9999px';(d.body||d.documentElement).appendChild(area);area.select();try{d.execCommand('copy');}catch(error){}area.remove();return Promise.resolve();
  }
  function copyText(text){return navigator.clipboard&&w.isSecureContext?navigator.clipboard.writeText(text).catch(function(){return legacyCopy(text);}):legacyCopy(text);}
  function toast(message){
    var node=d.getElementById('qilyDockStandaloneToastV5');
    if(!node){node=d.createElement('div');node.id='qilyDockStandaloneToastV5';node.setAttribute('role','status');node.style.cssText='position:fixed;left:50%;bottom:22px;z-index:2147483000;transform:translateX(-50%);padding:9px 14px;border-radius:999px;background:#073c47;color:#fff;font:700 14px/1.2 sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.22);pointer-events:none;opacity:0;transition:opacity .16s';(d.body||d.documentElement).appendChild(node);}
    node.textContent=message;node.style.opacity='1';clearTimeout(toast.timer);toast.timer=setTimeout(function(){node.style.opacity='0';},2200);
  }
  function openSearch(){
    if(w.QilySiteSearch&&typeof w.QilySiteSearch.open==='function'){w.QilySiteSearch.open();return;}
    var existing=d.getElementById('qilySiteSearchStandaloneV5');if(existing)return;
    var script=d.createElement('script');script.id='qilySiteSearchStandaloneV5';script.src='/site-search.js?v=20260729-ranked-search-v1';script.addEventListener('load',function(){if(w.QilySiteSearch)w.QilySiteSearch.open();else toast('本站搜索加载失败');},{once:true});script.addEventListener('error',function(){toast('本站搜索加载失败');},{once:true});(d.body||d.documentElement).appendChild(script);
  }
  function shareCurrent(){
    var title=d.title||'QilyLean';var url=location.href;var text=title+'\n'+url;
    if(navigator.share){navigator.share({title:title,text:title,url:url}).catch(function(error){if(error&&error.name==='AbortError')return;copyText(text).then(function(){toast('网页标题及网址已复制');});});return;}
    copyText(text).then(function(){toast('网页标题及网址已复制');});
  }
  function runFallback(action){
    if(action==='home'){location.href='/';return;}
    if(action==='top'){d.documentElement.scrollTop=0;if(d.body)d.body.scrollTop=0;w.scrollTo({top:0,left:0,behavior:'smooth'});return;}
    if(action==='back'){location.href=parentRoute(location.pathname);return;}
    if(action==='search'){openSearch();return;}
    if(action==='current'){shareCurrent();return;}
    if(action==='contact'){
      var mask=d.getElementById('wxMask');if(mask){mask.classList.add('show');return;}
      location.href='/contact/';
    }
  }
  function installStandaloneFallback(dock){
    if(dock.dataset.qilyFallbackBound==='v5')return;
    dock.dataset.qilyFallbackBound='v5';
    dock.addEventListener('pointerdown',function(event){var button=event.target.closest&&event.target.closest('.qily-float-btn');if(button)button.setAttribute('data-qily-pressed','true');},{passive:true});
    ['pointerup','pointercancel','pointerleave'].forEach(function(name){dock.addEventListener(name,function(){dock.querySelectorAll('[data-qily-pressed="true"]').forEach(function(button){button.removeAttribute('data-qily-pressed');});},{passive:true});});
    dock.addEventListener('click',function(event){
      if(w.__qilyLeanSiteNavigationPublicV8&&dock.dataset.qilyStandaloneDock!=='v5')return;
      var button=event.target&&event.target.closest?event.target.closest('.qily-float-btn[data-action]'):null;if(!button)return;
      event.preventDefault();runFallback(button.getAttribute('data-action')||'');
    });
  }

  function boot(){
    if(isExcluded()){disableDockForPage();return;}
    normalizeDock();
  }
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  d.addEventListener('qily:shell-ready',boot);
  d.addEventListener('qily:softnavigate',boot);
  d.addEventListener('qily:language-change',boot);
  w.addEventListener('pageshow',boot,{passive:true});
})(document,window);
