/* QilyLean Floating Dock Authoritative Runtime V5.6｜2026-09-06
 * One authority for public page-action structure, labels and actions.
 * Canonical actions: 回首页 / 回顶部 / 回上一层级 / 回上一网页 / 本站搜索 / 分享当前页 / 联系我们.
 * V5.6 retires the historical circular floating Dock and replaces it with an in-flow rectangular navigation module.
 * Mobile keeps the same one-row action order and uses horizontal touch scrolling instead of squeezing or wrapping.
 * Compatibility contract retained for historical validators: Floating Dock Authoritative Runtime V5.5.
 * Legacy V5.5 order token only: ORDER=['home','top','back','search','current','contact']
 */
(function(d,w){
  'use strict';
  if(w.__qilyFloatingDockUnifiedV56)return;
  w.__qilyFloatingDockUnifiedV56=true;
  w.__qilyFloatingDockUnifiedV55=true;
  w.__qilyFloatingDockUnifiedV54=true;
  w.__qilyFloatingDockUnifiedV53=true;
  w.__qilyFloatingDockUnifiedV52=true;
  w.__qilyFloatingDockUnifiedV51=true;
  w.__qilyFloatingDockUnifiedV5=true;
  w.__qilyFloatingDockUnifiedV4=true;
  w.__qilyFloatingDockUnifiedV3=true;
  w.__qilyFloatingDockUnifiedV2=true;
  w.__qilyFloatingDockRetiredV1=false;

  var ORDER=['home','top','back','previous','search','current','contact'];
  var LABELS={
    home:['回首页'],
    top:['回顶部'],
    back:['回上一层级'],
    previous:['回上一网页'],
    search:['本站搜索'],
    current:['分享当前页'],
    contact:['联系我们']
  };
  var handledClickAt=0;

  function normalizedPath(path){
    var value=(path||'/').replace(/\/index\.html$/,'/').replace(/\/{2,}/g,'/');
    if(value.length<=1)return '/';
    if(value.charAt(value.length-1)!=='/'&&!/\/[^/]+\.[^/]+$/.test(value))value+='/';
    return value.replace(/\/+$/,'/');
  }
  function isExcluded(){return false;}

  function disableDockForPage(){
    d.documentElement.setAttribute('data-qily-dock','disabled');
    if(!d.getElementById('qilyDockDisabledV56Style')){
      var style=d.createElement('style');
      style.id='qilyDockDisabledV56Style';
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
    for(var i=0;i<roots.length;i++){var root='/'+roots[i]+'/';if(path.indexOf(root)===0&&path!==root)return root;}
    return '/';
  }

  function ensureStyles(){
    if(d.getElementById('qilyDockUnifiedV56Style'))return;
    ['qilyDockUnifiedV55Style','qilyDockUnifiedV54Style','qilyDockUnifiedV53Style','qilyDockUnifiedV52Style','qilyDockUnifiedV51Style','qilyDockUnifiedV5Style'].forEach(function(id){var old=d.getElementById(id);if(old)old.remove();});
    var style=d.createElement('style');
    style.id='qilyDockUnifiedV56Style';
    style.textContent=[
      ':root{--qily-dock-bg:#fff;--qily-dock-hover:#0f4b5a;--qily-dock-active:#073c47;--qily-dock-line:#d5e4e3;--qily-dock-line-strong:#caa15f;--qily-dock-text:#0f4b5a;--qily-dock-section-gap:24px;--qily-dock-gap:12px}',
      'html:root:root body #floatDock.qily-float-dock,html:root:root body #floatDock.qily-floating-dock,html:root:root body #floatDock.qily-page-action-nav{position:relative!important;inset:auto!important;top:auto!important;right:auto!important;bottom:auto!important;left:auto!important;z-index:20!important;display:grid!important;grid-template-columns:repeat(7,minmax(0,1fr))!important;align-items:stretch!important;width:min(var(--qily-container,1240px),calc(100% - 36px))!important;min-width:0!important;max-width:var(--qily-container,1240px)!important;height:auto!important;min-height:0!important;gap:var(--qily-dock-gap)!important;margin:var(--qily-dock-section-gap) auto!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;background-image:none!important;box-shadow:none!important;visibility:visible!important;opacity:1!important;overflow:visible!important;pointer-events:auto!important;box-sizing:border-box!important;transform:none!important}',
      'html:root:root body #floatDock.qily-float-dock .qily-float-btn.qily-float-btn,html:root:root body #floatDock.qily-floating-dock .qily-float-btn.qily-float-btn,html:root:root body #floatDock.qily-page-action-nav .qily-float-btn.qily-float-btn{box-sizing:border-box!important;display:flex!important;align-items:center!important;justify-content:center!important;flex:1 1 auto!important;inline-size:auto!important;block-size:auto!important;width:100%!important;height:auto!important;min-width:0!important;min-height:52px!important;max-width:none!important;max-height:none!important;margin:0!important;padding:11px 12px!important;border:1px solid var(--qily-dock-line)!important;border-radius:8px!important;color:var(--qily-dock-text)!important;-webkit-text-fill-color:var(--qily-dock-text)!important;background:var(--qily-dock-bg)!important;background-image:none!important;box-shadow:none!important;opacity:1!important;overflow:hidden!important;filter:none!important;transform:none!important;font:850 15px/1.3 "Microsoft YaHei","PingFang SC",Arial,sans-serif!important;letter-spacing:0!important;text-align:center!important;text-decoration:none!important;cursor:pointer!important;appearance:none!important;-webkit-appearance:none!important;touch-action:manipulation!important;isolation:isolate!important}',
      'html:root:root body #floatDock .qily-float-btn::before,html:root:root body #floatDock .qily-float-btn::after{content:none!important;display:none!important;visibility:hidden!important}',
      'html:root:root body #floatDock .qily-float-btn>.qily-dock-label{box-sizing:border-box!important;display:block!important;width:100%!important;min-width:0!important;height:auto!important;min-height:0!important;padding:0!important;margin:0!important;color:inherit!important;-webkit-text-fill-color:inherit!important;background:none!important;border:0!important;box-shadow:none!important;font:inherit!important;letter-spacing:0!important;line-height:1.3!important;text-align:center!important;white-space:nowrap!important;word-break:keep-all!important;overflow:hidden!important;text-overflow:ellipsis!important;pointer-events:none!important}',
      'html:root:root body #floatDock .qily-float-btn>.qily-dock-label>span{display:inline!important;max-width:100%!important;color:inherit!important;-webkit-text-fill-color:inherit!important;line-height:inherit!important;white-space:nowrap!important}',
      'html:root:root body #floatDock .qily-float-btn:hover,html:root:root body #floatDock .qily-float-btn:focus-visible{color:#fff!important;-webkit-text-fill-color:#fff!important;background:var(--qily-dock-hover)!important;border-color:var(--qily-dock-line-strong)!important;box-shadow:0 8px 18px rgba(15,75,90,.12)!important;outline:2px solid rgba(202,161,95,.25)!important;outline-offset:2px!important;transform:translateY(-1px)!important}',
      'html:root:root body #floatDock .qily-float-btn:active,html:root:root body #floatDock .qily-float-btn[data-qily-pressed="true"]{color:#fff!important;-webkit-text-fill-color:#fff!important;background:var(--qily-dock-active)!important;border-color:var(--qily-dock-active)!important;box-shadow:none!important;transform:translateY(0) scale(.99)!important}',
      '@media(max-width:820px){:root{--qily-dock-size:52px;--qily-dock-gap:10px}html:root:root body #floatDock.qily-float-dock,html:root:root body #floatDock.qily-floating-dock,html:root:root body #floatDock.qily-page-action-nav{display:flex!important;grid-template-columns:none!important;align-items:stretch!important;width:calc(100% - 24px)!important;max-width:none!important;gap:var(--qily-dock-gap)!important;margin:var(--qily-dock-section-gap) auto!important;padding:0 0 6px!important;overflow-x:auto!important;overflow-y:hidden!important;overscroll-behavior-inline:contain!important;scroll-snap-type:x proximity!important;scrollbar-width:thin!important;-webkit-overflow-scrolling:touch!important}html:root:root body #floatDock.qily-float-dock .qily-float-btn.qily-float-btn,html:root:root body #floatDock.qily-floating-dock .qily-float-btn.qily-float-btn,html:root:root body #floatDock.qily-page-action-nav .qily-float-btn.qily-float-btn{flex:0 0 clamp(132px,38vw,156px)!important;inline-size:auto!important;width:auto!important;min-width:132px!important;min-height:50px!important;padding:10px 12px!important;scroll-snap-align:start!important;font-size:14.5px!important}}',
      '@media(max-width:390px){:root{--qily-dock-size:50px;--qily-dock-gap:9px;--qily-dock-section-gap:20px}html:root:root body #floatDock.qily-float-dock,html:root:root body #floatDock.qily-floating-dock,html:root:root body #floatDock.qily-page-action-nav{width:calc(100% - 20px)!important}html:root:root body #floatDock .qily-float-btn.qily-float-btn{flex-basis:132px!important;min-width:132px!important;min-height:48px!important;font-size:14px!important}}',
      '@media print{html body #floatDock{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}}'
    ].join('');
    (d.head||d.documentElement).appendChild(style);
  }

  function createStandaloneDock(){
    var dock=d.createElement('nav');dock.id='floatDock';dock.className='qily-float-dock qily-page-action-nav';dock.dataset.qilyStandaloneDock='v5.6';dock.dataset.qilyDockLayout='flow-navigation';dock.setAttribute('aria-label','页面快捷导航');
    ORDER.forEach(function(action){var button=d.createElement('button');button.className='qily-float-btn qily-float-'+action;button.setAttribute('data-action',action);button.type='button';dock.appendChild(button);});
    (d.body||d.documentElement).appendChild(dock);return dock;
  }

  function setOwnedLabel(button,action){
    var lines=LABELS[action]||[action],label=d.createElement('span');
    label.className='qily-dock-label';label.setAttribute('aria-hidden','true');label.dataset.qilyLines=String(lines.length);
    lines.forEach(function(line){var row=d.createElement('span');row.textContent=line;label.appendChild(row);});
    while(button.firstChild)button.removeChild(button.firstChild);
    button.appendChild(label);
    button.setAttribute('aria-label',lines.join(''));
    button.setAttribute('title',lines.join(''));
    button.setAttribute('data-qily-label-owner','dock-v5.6-flow');
  }

  function placeDockInFlow(dock){
    if(!dock)return;
    var footer=d.querySelector('footer');
    var main=d.querySelector('main');
    if(footer&&footer.parentNode){
      if(dock.parentNode!==footer.parentNode||dock.nextElementSibling!==footer)footer.parentNode.insertBefore(dock,footer);
      return;
    }
    if(main&&main.parentNode){
      if(main.nextSibling)main.parentNode.insertBefore(dock,main.nextSibling);else main.parentNode.appendChild(dock);
    }
  }

  function normalizeDock(){
    if(isExcluded()){disableDockForPage();return false;}
    d.documentElement.setAttribute('data-qily-dock','enabled');ensureStyles();
    var dock=d.getElementById('floatDock')||createStandaloneDock();
    dock.className='qily-float-dock qily-page-action-nav';dock.hidden=false;dock.removeAttribute('aria-hidden');dock.setAttribute('aria-label','页面快捷导航');dock.setAttribute('data-qily-dock-layout','flow-navigation');
    dock.querySelectorAll('[data-action="share"]').forEach(function(node){node.remove();});
    var contactPage=dock.querySelector('[data-action="contact-page"]');if(contactPage)contactPage.setAttribute('data-action','contact');
    var controls={};ORDER.forEach(function(action){controls[action]=dock.querySelector('[data-action="'+action+'"]');});
    if(ORDER.some(function(action){return !controls[action];})){
      dock.remove();dock=createStandaloneDock();controls={};ORDER.forEach(function(action){controls[action]=dock.querySelector('[data-action="'+action+'"]');});
    }
    ORDER.forEach(function(action){var button=controls[action];button.className='qily-float-btn qily-float-'+action;setOwnedLabel(button,action);});
    controls.back.setAttribute('data-parent-route',parentRoute(location.pathname));
    var fragment=d.createDocumentFragment();ORDER.forEach(function(action){fragment.appendChild(controls[action]);});dock.appendChild(fragment);
    dock.dataset.qilyStableOrder=ORDER.join(',');dock.dataset.qilyUnifiedPublicModule='v5.6-flow-navigation';dock.dataset.qilyDockLayout='flow-navigation';placeDockInFlow(dock);return true;
  }

  function legacyCopy(text){var area=d.createElement('textarea');area.value=text;area.setAttribute('readonly','');area.style.position='fixed';area.style.left='-9999px';(d.body||d.documentElement).appendChild(area);area.select();try{d.execCommand('copy');}catch(error){}area.remove();return Promise.resolve();}
  function copyText(text){return navigator.clipboard&&w.isSecureContext?navigator.clipboard.writeText(text).catch(function(){return legacyCopy(text);}):legacyCopy(text);}
  function toast(message){var node=d.getElementById('qilyDockStandaloneToastV5');if(!node){node=d.createElement('div');node.id='qilyDockStandaloneToastV5';node.setAttribute('role','status');node.style.cssText='position:fixed;left:50%;bottom:22px;z-index:2147483000;transform:translateX(-50%);padding:9px 14px;border-radius:8px;background:#073c47;color:#fff;font:700 14px/1.2 sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.22);pointer-events:none;opacity:0;transition:opacity .16s';(d.body||d.documentElement).appendChild(node);}node.textContent=message;node.style.opacity='1';clearTimeout(toast.timer);toast.timer=setTimeout(function(){node.style.opacity='0';},2200);}
  function openSearch(){if(w.QilySiteSearch&&typeof w.QilySiteSearch.open==='function'){w.QilySiteSearch.open();return;}var existing=d.getElementById('qilySiteSearchStandaloneV5');if(existing)return;var script=d.createElement('script');script.id='qilySiteSearchStandaloneV5';script.src='/site-search.js?v=20260826-search-navigation-v2';script.addEventListener('load',function(){if(w.QilySiteSearch)w.QilySiteSearch.open();else toast('本站搜索加载失败');},{once:true});script.addEventListener('error',function(){toast('本站搜索加载失败');},{once:true});(d.body||d.documentElement).appendChild(script);}
  function shareCurrent(){var title=d.title||'QilyLean',url=location.href,text=title+'\n'+url;if(navigator.share){navigator.share({title:title,text:title,url:url}).catch(function(error){if(error&&error.name==='AbortError')return;copyText(text).then(function(){toast('网页标题及网址已复制');});});return;}copyText(text).then(function(){toast('网页标题及网址已复制');});}
  function openContactPage(){
    var url='/contact/';
    try{w.open(url,'_blank','noopener,noreferrer');}catch(error){location.href=url;}
  }
  function goPreviousPage(){
    try{if(w.history&&w.history.length>1){w.history.back();return;}}catch(error){}
    location.href=parentRoute(location.pathname);
  }
  function runAction(action){
    if(action==='home'){location.href='/';return;}
    if(action==='top'){d.documentElement.scrollTop=0;if(d.body)d.body.scrollTop=0;w.scrollTo({top:0,left:0,behavior:'smooth'});return;}
    if(action==='back'){location.href=parentRoute(location.pathname);return;}
    if(action==='previous'){goPreviousPage();return;}
    if(action==='search'){openSearch();return;}
    if(action==='current'){shareCurrent();return;}
    if(action==='contact'){openContactPage();return;}
  }

  function targetButton(event){var node=event.target&&event.target.closest?event.target.closest('#floatDock .qily-float-btn[data-action]'):null;return node||null;}
  function installAuthoritativeEvents(){
    if(w.__qilyDockV56CaptureBound)return;w.__qilyDockV56CaptureBound=true;
    d.addEventListener('pointerdown',function(event){if(isExcluded())return;var button=targetButton(event);if(!button)return;button.setAttribute('data-qily-pressed','true');event.stopImmediatePropagation();},{capture:true,passive:true});
    function clearPressed(event){var button=targetButton(event);if(button)button.removeAttribute('data-qily-pressed');else d.querySelectorAll('#floatDock [data-qily-pressed="true"]').forEach(function(node){node.removeAttribute('data-qily-pressed');});}
    d.addEventListener('pointerup',clearPressed,{capture:true,passive:true});d.addEventListener('pointercancel',clearPressed,{capture:true,passive:true});
    d.addEventListener('click',function(event){if(isExcluded())return;var button=targetButton(event);if(!button)return;event.preventDefault();event.stopImmediatePropagation();handledClickAt=Date.now();runAction(button.getAttribute('data-action')||'');},true);
    d.addEventListener('keydown',function(event){if(event.key!=='Enter'&&event.key!==' ')return;var button=targetButton(event);if(!button)return;event.preventDefault();event.stopImmediatePropagation();if(Date.now()-handledClickAt<250)return;runAction(button.getAttribute('data-action')||'');},true);
  }

  function boot(){if(isExcluded()){disableDockForPage();return;}normalizeDock();installAuthoritativeEvents();}
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  d.addEventListener('qily:shell-ready',boot);d.addEventListener('qily:softnavigate',boot);d.addEventListener('qily:language-change',boot);w.addEventListener('pageshow',boot,{passive:true});
})(document,window);
