/* QilyLean Floating Dock Unified Runtime V2｜2026-08-28
 * Product decision: retain the six-action lower-right public service module sitewide.
 * One shared contract only: 首页 / ↑顶部 / ↗上一层 / 本站搜索 / 分享当前页 / 联系我们.
 * No page-local alternative labels, colors or behavior. Retired-Dock observers are explicitly disconnected.
 */
(function(d,w){
  'use strict';
  if(w.__qilyFloatingDockUnifiedV2)return;
  w.__qilyFloatingDockUnifiedV2=true;
  w.__qilyFloatingDockRetiredV1=false;

  var ORDER=['home','top','back','search','current','contact'];
  var LABELS={home:'首页',top:'顶部',back:'上一层',search:'本站搜索',current:'分享当前页',contact:'联系我们'};

  function sourceMode(){return (d.documentElement.getAttribute('data-qily-language')||'zh-CN')==='zh-CN';}

  function disconnectRetirement(){
    var observer=w.__qilyFloatingDockRetirementObserverV1;
    if(observer&&typeof observer.disconnect==='function')observer.disconnect();
    try{delete w.__qilyFloatingDockRetirementObserverV1;}catch(error){w.__qilyFloatingDockRetirementObserverV1=null;}
  }

  function ensureStyles(){
    if(d.getElementById('qilyDockSemanticUnifiedV2'))return;
    var style=d.createElement('style');
    style.id='qilyDockSemanticUnifiedV2';
    style.textContent=[
      'html body #floatDock.qily-float-dock,html body #floatDock.qily-floating-dock{display:flex!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important}',
      'html body #floatDock [data-action="top"],html body #floatDock [data-action="back"]{flex-direction:column!important;gap:1px!important}',
      'html body #floatDock .qily-dock-semantic-icon{display:grid!important;place-items:center!important;width:17px!important;height:17px!important;flex:0 0 17px!important;line-height:1!important;color:currentColor!important;-webkit-text-fill-color:currentColor!important}',
      'html body #floatDock .qily-dock-semantic-icon svg{display:block!important;width:16px!important;height:16px!important;fill:none!important;stroke:currentColor!important;stroke-width:2.2!important;stroke-linecap:round!important;stroke-linejoin:round!important}',
      'html body #floatDock .qily-dock-semantic-label{display:block!important;max-width:100%!important;line-height:1.02!important;text-align:center!important}',
      '@media print{html body #floatDock{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}}'
    ].join('');
    (d.head||d.documentElement).appendChild(style);
  }

  function iconMarkup(action){
    if(action==='top')return '<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path d="M12 19V5"></path><path d="M6.5 10.5 12 5l5.5 5.5"></path></svg>';
    return '<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path d="M8 7H5v12h12v-3"></path><path d="M9 11 18 2"></path><path d="M12 2h6v6"></path></svg>';
  }

  function normalizeSemanticButton(button,action,label){
    if(!button)return;
    var icon=button.querySelector('.qily-dock-semantic-icon');
    var copy=button.querySelector('.qily-dock-semantic-label');
    if(!icon||!copy){
      button.replaceChildren();
      icon=d.createElement('span');
      icon.className='qily-dock-semantic-icon';
      icon.setAttribute('aria-hidden','true');
      icon.setAttribute('translate','no');
      icon.innerHTML=iconMarkup(action);
      copy=d.createElement('span');
      copy.className='qily-dock-semantic-label';
      button.appendChild(icon);button.appendChild(copy);
    }
    if(sourceMode())copy.textContent=label;
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
    if(/^\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html$/.test(path))return '/qilylean/daily-insights.html';
    if(path==='/qilylean/daily-insights.html')return '/knowledge/';
    if(path.indexOf('/tools/')===0)return '/';
    var roots=['projects','improvements','capabilities','experience','knowledge','moments','cooperation','links','trust'];
    for(var i=0;i<roots.length;i++){var root='/'+roots[i]+'/';if(path.indexOf(root)===0&&path!==root)return root;}
    return '/';
  }

  function normalizeDock(){
    disconnectRetirement();
    ensureStyles();
    var dock=d.getElementById('floatDock');
    if(!dock)return false;
    dock.classList.add('qily-float-dock');
    dock.hidden=false;
    dock.removeAttribute('aria-hidden');
    dock.setAttribute('aria-label','快捷服务');

    dock.querySelectorAll('[data-action="share"]').forEach(function(node){node.remove();});
    var contactPage=dock.querySelector('[data-action="contact-page"]');
    if(contactPage)contactPage.setAttribute('data-action','contact');

    var controls={};
    ORDER.forEach(function(action){controls[action]=dock.querySelector('[data-action="'+action+'"]');});
    if(!controls.home||!controls.top||!controls.back||!controls.search||!controls.current||!controls.contact)return false;

    if(sourceMode()){
      controls.home.textContent=LABELS.home;
      controls.search.innerHTML='本站<br>搜索';
      controls.current.innerHTML='分享<br>当前页';
      controls.contact.innerHTML='联系<br>我们';
    }
    normalizeSemanticButton(controls.top,'top',LABELS.top);
    normalizeSemanticButton(controls.back,'back',LABELS.back);

    controls.top.setAttribute('title','回到页面顶部');controls.top.setAttribute('aria-label','回顶部');
    controls.back.setAttribute('title','回到当前页面所属的上一级有效页面');controls.back.setAttribute('aria-label','回上一层');
    controls.back.setAttribute('data-parent-route',parentRoute(location.pathname));
    controls.home.setAttribute('aria-label','首页');
    controls.search.setAttribute('aria-label','本站搜索');
    controls.current.setAttribute('aria-label','分享当前页');
    controls.contact.setAttribute('aria-label','联系我们');

    var fragment=d.createDocumentFragment();
    ORDER.forEach(function(action){fragment.appendChild(controls[action]);});
    dock.appendChild(fragment);
    dock.dataset.qilyStableOrder=ORDER.join(',');
    dock.dataset.qilyUnifiedPublicModule='v2';
    return true;
  }

  function fallbackTop(event){
    var button=event.target&&event.target.closest?event.target.closest('#floatDock [data-action="top"]'):null;
    if(!button)return;
    event.preventDefault();
    w.scrollTo({top:0,left:0,behavior:'smooth'});
  }

  function boot(){
    normalizeDock();
    d.addEventListener('click',fallbackTop,false);
    d.addEventListener('qily:shell-ready',normalizeDock);
    d.addEventListener('qily:softnavigate',normalizeDock);
    d.addEventListener('qily:language-change',normalizeDock);
    w.addEventListener('pageshow',normalizeDock,{passive:true});
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})(document,window);
