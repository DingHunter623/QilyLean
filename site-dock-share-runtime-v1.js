/* QilyLean Floating Dock Unified Runtime V4｜2026-08-28
 * One public component, one visual and behavior contract sitewide.
 * Canonical actions: 首页 / ↑顶部 / ↗上一层 / 本站搜索 / 分享当前页 / 联系我们.
 * V4 adds an integrity observer so late legacy/mobile rebuilds are normalized back to the same contract.
 */
(function(d,w){
  'use strict';
  if(w.__qilyFloatingDockUnifiedV4)return;
  w.__qilyFloatingDockUnifiedV4=true;
  w.__qilyFloatingDockUnifiedV3=true;
  w.__qilyFloatingDockUnifiedV2=true;
  w.__qilyFloatingDockRetiredV1=false;

  var ORDER=['home','top','back','search','current','contact'];
  var LABELS={home:'首页',top:'顶部',back:'上一层',search:'本站搜索',current:'分享当前页',contact:'联系我们'};
  var normalizing=false;
  var observerTimer=0;

  function sourceMode(){return (d.documentElement.getAttribute('data-qily-language')||'zh-CN')==='zh-CN';}

  function disconnectRetirement(){
    var observer=w.__qilyFloatingDockRetirementObserverV1;
    if(observer&&typeof observer.disconnect==='function')observer.disconnect();
    try{delete w.__qilyFloatingDockRetirementObserverV1;}catch(error){w.__qilyFloatingDockRetirementObserverV1=null;}
    w.__qilyFloatingDockRetiredV1=false;
  }

  function ensureStyles(){
    if(d.getElementById('qilyDockUnifiedV4Style'))return;
    var style=d.createElement('style');
    style.id='qilyDockUnifiedV4Style';
    style.textContent=[
      ':root{--qily-dock-v4-bg:#0f4b5a;--qily-dock-v4-hover:#12606f;--qily-dock-v4-line:#caa15f;--qily-dock-v4-text:#ffe39b}',
      'html body #floatDock.qily-float-dock,html body #floatDock.qily-floating-dock{position:fixed!important;right:max(12px,env(safe-area-inset-right))!important;bottom:max(12px,env(safe-area-inset-bottom))!important;left:auto!important;top:auto!important;z-index:2147482500!important;display:flex!important;flex-direction:column!important;align-items:center!important;gap:7px!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important}',
      'html body #floatDock .qily-float-btn{display:flex!important;flex:0 0 64px!important;width:64px!important;height:64px!important;min-width:64px!important;min-height:64px!important;max-width:64px!important;max-height:64px!important;align-items:center!important;justify-content:center!important;gap:1px!important;margin:0!important;padding:5px!important;border:1.5px solid var(--qily-dock-v4-line)!important;border-radius:999px!important;color:var(--qily-dock-v4-text)!important;-webkit-text-fill-color:var(--qily-dock-v4-text)!important;background:var(--qily-dock-v4-bg)!important;background-color:var(--qily-dock-v4-bg)!important;background-image:none!important;box-shadow:0 8px 20px rgba(7,60,71,.22)!important;opacity:1!important;filter:none!important;mix-blend-mode:normal!important;font:850 14px/1.05 "Microsoft YaHei","PingFang SC",Arial,sans-serif!important;letter-spacing:0!important;text-align:center!important;text-decoration:none!important;cursor:pointer!important;appearance:none!important;-webkit-appearance:none!important}',
      'html body #floatDock .qily-float-btn *,html body #floatDock .qily-float-btn:is(:link,:visited,:active){color:var(--qily-dock-v4-text)!important;-webkit-text-fill-color:var(--qily-dock-v4-text)!important}',
      'html body #floatDock .qily-float-btn:is(:hover,:focus-visible){background:var(--qily-dock-v4-hover)!important;background-color:var(--qily-dock-v4-hover)!important;background-image:none!important;border-color:var(--qily-dock-v4-text)!important;outline:3px solid rgba(202,161,95,.22)!important;outline-offset:2px!important}',
      'html body #floatDock [data-action="top"],html body #floatDock [data-action="back"]{flex-direction:column!important;gap:0!important;transform:none!important;rotate:0deg!important}',
      'html body #floatDock .qily-dock-semantic-icon{display:grid!important;place-items:center!important;width:18px!important;height:18px!important;flex:0 0 18px!important;margin:0!important;color:currentColor!important;-webkit-text-fill-color:currentColor!important;font:950 19px/1 Arial,sans-serif!important;font-style:normal!important;transform:none!important;rotate:0deg!important;writing-mode:horizontal-tb!important}',
      'html body #floatDock .qily-dock-semantic-label{display:block!important;max-width:100%!important;margin:0!important;color:currentColor!important;-webkit-text-fill-color:currentColor!important;font:850 13px/1.02 "Microsoft YaHei","PingFang SC",Arial,sans-serif!important;text-align:center!important;white-space:nowrap!important}',
      '@media(max-width:620px){html body #floatDock.qily-float-dock,html body #floatDock.qily-floating-dock{right:max(8px,env(safe-area-inset-right))!important;bottom:max(8px,env(safe-area-inset-bottom))!important;gap:5px!important}html body #floatDock .qily-float-btn{flex-basis:56px!important;width:56px!important;height:56px!important;min-width:56px!important;min-height:56px!important;max-width:56px!important;max-height:56px!important;padding:4px!important;font-size:12.5px!important}html body #floatDock .qily-dock-semantic-label{font-size:12px!important}html body #floatDock .qily-dock-semantic-icon{width:17px!important;height:17px!important;flex-basis:17px!important;font-size:18px!important;transform:none!important;rotate:0deg!important}}',
      '@media print{html body #floatDock{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}}'
    ].join('');
    (d.head||d.documentElement).appendChild(style);
  }

  function normalizedPath(path){
    var value=(path||'/').replace(/\/index\.html$/,'/').replace(/\/{2,}/g,'/');
    if(value.length<=1)return '/';
    if(value.charAt(value.length-1)!=='/'&&!/\/[^/]+\.[^/]+$/.test(value))value+='/';
    return value.replace(/\/+$/,'/');
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
    for(var i=0;i<roots.length;i++){var root='/'+roots[i]+'/';if(path.indexOf(root)===0&&path!==root)return root;}
    return '/';
  }

  function semanticMarkup(action,label){
    var glyph=action==='top'?'↑':'↗';
    return '<span class="qily-dock-semantic-icon" aria-hidden="true" translate="no">'+glyph+'</span><span class="qily-dock-semantic-label">'+label+'</span>';
  }

  function createStandaloneDock(){
    var dock=d.createElement('div');
    dock.id='floatDock';dock.className='qily-float-dock';dock.dataset.qilyStandaloneDock='v4';dock.setAttribute('aria-label','快捷服务');
    dock.innerHTML=[
      '<button class="qily-float-btn qily-float-home" data-action="home" type="button">首页</button>',
      '<button class="qily-float-btn qily-float-top" data-action="top" type="button">'+semanticMarkup('top','顶部')+'</button>',
      '<button class="qily-float-btn qily-float-back" data-action="back" type="button">'+semanticMarkup('back','上一层')+'</button>',
      '<button class="qily-float-btn qily-float-search" data-action="search" type="button">本站<br>搜索</button>',
      '<button class="qily-float-btn qily-float-current" data-action="current" type="button">分享<br>当前页</button>',
      '<button class="qily-float-btn qily-float-contact" data-action="contact" type="button">联系<br>我们</button>'
    ].join('');
    (d.body||d.documentElement).appendChild(dock);
    return dock;
  }

  function normalizeSemanticButton(button,action,label){
    if(!button)return;
    var icon=button.querySelector('.qily-dock-semantic-icon');
    var copy=button.querySelector('.qily-dock-semantic-label');
    if(!icon||!copy){button.innerHTML=semanticMarkup(action,label);icon=button.querySelector('.qily-dock-semantic-icon');copy=button.querySelector('.qily-dock-semantic-label');}
    icon.textContent=action==='top'?'↑':'↗';
    icon.setAttribute('aria-hidden','true');icon.setAttribute('translate','no');
    icon.style.removeProperty('transform');icon.style.removeProperty('rotate');
    if(sourceMode())copy.textContent=label;
  }

  function normalizeDock(){
    if(normalizing)return false;
    normalizing=true;
    try{
      disconnectRetirement();ensureStyles();
      var dock=d.getElementById('floatDock')||createStandaloneDock();
      dock.classList.add('qily-float-dock');dock.hidden=false;dock.removeAttribute('aria-hidden');dock.setAttribute('aria-label','快捷服务');
      dock.querySelectorAll('[data-action="share"]').forEach(function(node){node.remove();});
      var contactPage=dock.querySelector('[data-action="contact-page"]');if(contactPage)contactPage.setAttribute('data-action','contact');

      var controls={};ORDER.forEach(function(action){controls[action]=dock.querySelector('[data-action="'+action+'"]');});
      if(!controls.home||!controls.top||!controls.back||!controls.search||!controls.current||!controls.contact){
        dock.remove();dock=createStandaloneDock();controls={};ORDER.forEach(function(action){controls[action]=dock.querySelector('[data-action="'+action+'"]');});
      }
      ORDER.forEach(function(action){controls[action].classList.add('qily-float-btn');});
      if(sourceMode()){
        controls.home.textContent=LABELS.home;
        controls.search.innerHTML='本站<br>搜索';controls.current.innerHTML='分享<br>当前页';controls.contact.innerHTML='联系<br>我们';
      }
      normalizeSemanticButton(controls.top,'top',LABELS.top);normalizeSemanticButton(controls.back,'back',LABELS.back);
      controls.top.setAttribute('title','回到页面顶部');controls.top.setAttribute('aria-label','回顶部');
      controls.back.setAttribute('title','回到当前页面所属的上一级有效页面');controls.back.setAttribute('aria-label','回上一层');controls.back.setAttribute('data-parent-route',parentRoute(location.pathname));
      controls.home.setAttribute('aria-label','首页');controls.search.setAttribute('aria-label','本站搜索');controls.current.setAttribute('aria-label','分享当前页');controls.contact.setAttribute('aria-label','联系我们');
      var fragment=d.createDocumentFragment();ORDER.forEach(function(action){fragment.appendChild(controls[action]);});dock.appendChild(fragment);
      dock.dataset.qilyStableOrder=ORDER.join(',');dock.dataset.qilyUnifiedPublicModule='v4';
      installStandaloneFallback(dock);
      return true;
    }finally{normalizing=false;}
  }

  function copyText(text){
    if(navigator.clipboard&&w.isSecureContext)return navigator.clipboard.writeText(text).catch(function(){return legacyCopy(text);});
    return legacyCopy(text);
  }
  function legacyCopy(text){var area=d.createElement('textarea');area.value=text;area.setAttribute('readonly','');area.style.position='fixed';area.style.left='-9999px';(d.body||d.documentElement).appendChild(area);area.select();try{d.execCommand('copy');}catch(error){}area.remove();return Promise.resolve();}
  function toast(message){
    var node=d.getElementById('qilyDockStandaloneToastV4');if(!node){node=d.createElement('div');node.id='qilyDockStandaloneToastV4';node.setAttribute('role','status');node.style.cssText='position:fixed;left:50%;bottom:22px;z-index:2147483000;transform:translateX(-50%);padding:9px 14px;border-radius:999px;background:#073c47;color:#fff;font:700 14px/1.2 sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.22);pointer-events:none;opacity:0;transition:opacity .16s';(d.body||d.documentElement).appendChild(node);}node.textContent=message;node.style.opacity='1';clearTimeout(toast.timer);toast.timer=setTimeout(function(){node.style.opacity='0';},2200);
  }
  function openSearch(){
    if(w.QilySiteSearch&&typeof w.QilySiteSearch.open==='function'){w.QilySiteSearch.open();return;}
    var existing=d.getElementById('qilySiteSearchStandaloneV4');if(existing){existing.addEventListener('load',function(){if(w.QilySiteSearch)w.QilySiteSearch.open();},{once:true});return;}
    var script=d.createElement('script');script.id='qilySiteSearchStandaloneV4';script.src='/site-search.js?v=20260729-ranked-search-v1';script.addEventListener('load',function(){if(w.QilySiteSearch)w.QilySiteSearch.open();else toast('本站搜索加载失败');},{once:true});script.addEventListener('error',function(){toast('本站搜索加载失败');},{once:true});(d.body||d.documentElement).appendChild(script);
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
      var mask=d.getElementById('wxMask');
      if(mask){mask.classList.add('show');return;}
      location.href='/contact/';
    }
  }
  function installStandaloneFallback(dock){
    if(dock.dataset.qilyFallbackBound==='v4')return;
    dock.dataset.qilyFallbackBound='v4';
    dock.addEventListener('click',function(event){
      if(w.__qilyLeanSiteNavigationPublicV8&&dock.dataset.qilyStandaloneDock!=='v4')return;
      var button=event.target&&event.target.closest?event.target.closest('.qily-float-btn[data-action]'):null;if(!button)return;
      event.preventDefault();runFallback(button.getAttribute('data-action')||'');
    });
  }

  function installIntegrityObserver(){
    if(w.__qilyFloatingDockIntegrityObserverV4)return;
    var target=d.body||d.documentElement;if(!target)return;
    var observer=new MutationObserver(function(mutations){
      var touched=false;
      for(var i=0;i<mutations.length&&!touched;i++){
        var mutation=mutations[i];
        if(mutation.type==='childList'){
          if((mutation.target&&mutation.target.closest&&mutation.target.closest('#floatDock'))||Array.prototype.some.call(mutation.addedNodes||[],function(node){return node&&node.nodeType===1&&(node.id==='floatDock'||(node.querySelector&&node.querySelector('#floatDock')));}))touched=true;
        }
      }
      if(!touched)return;
      clearTimeout(observerTimer);observerTimer=setTimeout(normalizeDock,0);
    });
    observer.observe(target,{childList:true,subtree:true});
    w.__qilyFloatingDockIntegrityObserverV4=observer;
  }

  function boot(){normalizeDock();installIntegrityObserver();d.addEventListener('qily:shell-ready',normalizeDock);d.addEventListener('qily:softnavigate',normalizeDock);d.addEventListener('qily:language-change',normalizeDock);w.addEventListener('pageshow',normalizeDock,{passive:true});}
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(document,window);
