/* QilyLean Floating Dock Authoritative Runtime V5.4｜2026-08-29
 * One authority for public Dock structure, labels and actions.
 * Canonical actions: 首页 / 回顶部 / 回上一层 / 本站搜索 / 分享当前页 / 联系我们.
 * V5.4 keeps every mobile label inside its circular surface and preserves an unclipped shadow gutter.
 * Pure DDZ remains an immersive surface and explicitly excludes the site Dock.
 */
(function(d,w){
  'use strict';
  if(w.__qilyFloatingDockUnifiedV54)return;
  w.__qilyFloatingDockUnifiedV54=true;
  w.__qilyFloatingDockUnifiedV53=true;
  w.__qilyFloatingDockUnifiedV52=true;
  w.__qilyFloatingDockUnifiedV51=true;
  w.__qilyFloatingDockUnifiedV5=true;
  w.__qilyFloatingDockUnifiedV4=true;
  w.__qilyFloatingDockUnifiedV3=true;
  w.__qilyFloatingDockUnifiedV2=true;
  w.__qilyFloatingDockRetiredV1=false;

  var ORDER=['home','top','back','search','current','contact'];
  var LABELS={
    home:['首页'],
    top:['回','顶部'],
    back:['回','上一层'],
    search:['本站','搜索'],
    current:['分享','当前页'],
    contact:['联系','我们']
  };
  var EXCLUDED=/^\/tools\/pure-ddz(?:\/|\/index\.html)?$/;
  var handledClickAt=0;

  function normalizedPath(path){
    var value=(path||'/').replace(/\/index\.html$/,'/').replace(/\/{2,}/g,'/');
    if(value.length<=1)return '/';
    if(value.charAt(value.length-1)!=='/'&&!/\/[^/]+\.[^/]+$/.test(value))value+='/';
    return value.replace(/\/+$/,'/');
  }
  function isExcluded(){return EXCLUDED.test(normalizedPath(location.pathname));}

  function disableDockForPage(){
    d.documentElement.setAttribute('data-qily-dock','disabled');
    if(!d.getElementById('qilyDockDisabledV54Style')){
      var style=d.createElement('style');
      style.id='qilyDockDisabledV54Style';
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
    if(d.getElementById('qilyDockUnifiedV54Style'))return;
    ['qilyDockUnifiedV53Style','qilyDockUnifiedV52Style','qilyDockUnifiedV51Style','qilyDockUnifiedV5Style'].forEach(function(id){var old=d.getElementById(id);if(old)old.remove();});
    var style=d.createElement('style');
    style.id='qilyDockUnifiedV54Style';
    style.textContent=[
      ':root{--qily-dock-bg:#0f4b5a;--qily-dock-hover:#12606f;--qily-dock-line:#caa15f;--qily-dock-text:#ffe39b;--qily-dock-size:64px;--qily-dock-gap:7px}',
      'html body #floatDock.qily-float-dock,html body #floatDock.qily-floating-dock{position:fixed!important;right:max(12px,env(safe-area-inset-right))!important;bottom:max(12px,env(safe-area-inset-bottom))!important;left:auto!important;top:auto!important;z-index:2147482500!important;display:flex!important;flex-direction:column!important;align-items:center!important;width:var(--qily-dock-size)!important;min-width:var(--qily-dock-size)!important;max-width:var(--qily-dock-size)!important;gap:var(--qily-dock-gap)!important;padding:0!important;margin:0!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;box-sizing:border-box!important}',
      'html body #floatDock .qily-float-btn{box-sizing:border-box!important;display:grid!important;place-items:center!important;flex:0 0 var(--qily-dock-size)!important;inline-size:var(--qily-dock-size)!important;block-size:var(--qily-dock-size)!important;width:var(--qily-dock-size)!important;height:var(--qily-dock-size)!important;min-width:var(--qily-dock-size)!important;min-height:var(--qily-dock-size)!important;max-width:var(--qily-dock-size)!important;max-height:var(--qily-dock-size)!important;margin:0!important;padding:0!important;border:1.5px solid var(--qily-dock-line)!important;border-radius:50%!important;color:var(--qily-dock-text)!important;-webkit-text-fill-color:var(--qily-dock-text)!important;background:var(--qily-dock-bg)!important;background-image:none!important;box-shadow:0 8px 20px rgba(7,60,71,.22)!important;opacity:1!important;overflow:hidden!important;filter:none!important;transform:none!important;font:inherit!important;letter-spacing:0!important;text-align:center!important;text-decoration:none!important;cursor:pointer!important;appearance:none!important;-webkit-appearance:none!important;touch-action:manipulation!important;isolation:isolate!important}',
      'html body #floatDock .qily-float-btn::before,html body #floatDock .qily-float-btn::after{content:none!important;display:none!important;visibility:hidden!important}',
      'html body #floatDock .qily-float-btn>.qily-dock-label{box-sizing:border-box!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:2.5px!important;width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;padding:5px!important;margin:0!important;color:var(--qily-dock-text)!important;-webkit-text-fill-color:var(--qily-dock-text)!important;background:none!important;border:0!important;box-shadow:none!important;font:850 13px/1.08 "Microsoft YaHei","PingFang SC",Arial,sans-serif!important;letter-spacing:0!important;text-align:center!important;white-space:nowrap!important;word-break:keep-all!important;overflow:hidden!important;pointer-events:none!important}',
      'html body #floatDock .qily-float-btn>.qily-dock-label>span{display:block!important;max-width:100%!important;color:inherit!important;-webkit-text-fill-color:inherit!important;line-height:1.08!important;white-space:nowrap!important}',
      'html body #floatDock .qily-float-btn:hover,html body #floatDock .qily-float-btn:focus-visible{background:var(--qily-dock-hover)!important;border-color:var(--qily-dock-text)!important;box-shadow:0 10px 24px rgba(7,60,71,.30)!important;outline:3px solid rgba(202,161,95,.22)!important;outline-offset:2px!important;transform:translateY(-1px)!important}',
      'html body #floatDock .qily-float-btn:active,html body #floatDock .qily-float-btn[data-qily-pressed="true"]{transform:translateY(1px) scale(.97)!important;box-shadow:0 4px 10px rgba(7,60,71,.24)!important}',
      '@media(max-width:620px){:root{--qily-dock-size:52px;--qily-dock-gap:5px}html body #floatDock.qily-float-dock,html body #floatDock.qily-floating-dock{right:max(7px,env(safe-area-inset-right))!important;bottom:max(8px,env(safe-area-inset-bottom))!important;overflow:visible!important}html:root:root:root body #floatDock.qily-float-dock .qily-float-btn.qily-float-btn,html:root:root:root body #floatDock.qily-floating-dock .qily-float-btn.qily-float-btn{flex:0 0 52px!important;inline-size:52px!important;block-size:52px!important;width:52px!important;height:52px!important;min-width:52px!important;min-height:52px!important;max-width:52px!important;max-height:52px!important;padding:0!important}html body #floatDock .qily-float-btn>.qily-dock-label{gap:2.5px!important;padding:3px!important;font-size:11.5px!important;line-height:1.08!important}html body #floatDock .qily-float-btn>.qily-dock-label>span{line-height:1.08!important}}',
      '@media(max-width:390px){:root{--qily-dock-size:50px;--qily-dock-gap:4px}html:root:root:root body #floatDock.qily-float-dock .qily-float-btn.qily-float-btn,html:root:root:root body #floatDock.qily-floating-dock .qily-float-btn.qily-float-btn{flex:0 0 50px!important;inline-size:50px!important;block-size:50px!important;width:50px!important;height:50px!important;min-width:50px!important;min-height:50px!important;max-width:50px!important;max-height:50px!important}html body #floatDock .qily-float-btn>.qily-dock-label{padding:3px 2px!important;font-size:11px!important;letter-spacing:-.1px!important}}',
      '@media print{html body #floatDock{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}}'
    ].join('');
    (d.head||d.documentElement).appendChild(style);
  }

  function createStandaloneDock(){
    var dock=d.createElement('div');dock.id='floatDock';dock.className='qily-float-dock';dock.dataset.qilyStandaloneDock='v5.4';dock.setAttribute('aria-label','快捷服务');
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
    button.setAttribute('data-qily-label-owner','dock-v5.4');
  }

  function normalizeDock(){
    if(isExcluded()){disableDockForPage();return false;}
    d.documentElement.setAttribute('data-qily-dock','enabled');ensureStyles();
    var dock=d.getElementById('floatDock')||createStandaloneDock();
    dock.className='qily-float-dock';dock.hidden=false;dock.removeAttribute('aria-hidden');dock.setAttribute('aria-label','快捷服务');
    dock.querySelectorAll('[data-action="share"]').forEach(function(node){node.remove();});
    var contactPage=dock.querySelector('[data-action="contact-page"]');if(contactPage)contactPage.setAttribute('data-action','contact');
    var controls={};ORDER.forEach(function(action){controls[action]=dock.querySelector('[data-action="'+action+'"]');});
    if(!controls.home||!controls.top||!controls.back||!controls.search||!controls.current||!controls.contact){dock.remove();dock=createStandaloneDock();controls={};ORDER.forEach(function(action){controls[action]=dock.querySelector('[data-action="'+action+'"]');});}
    ORDER.forEach(function(action){var button=controls[action];button.className='qily-float-btn qily-float-'+action;setOwnedLabel(button,action);});
    controls.back.setAttribute('data-parent-route',parentRoute(location.pathname));
    var fragment=d.createDocumentFragment();ORDER.forEach(function(action){fragment.appendChild(controls[action]);});dock.appendChild(fragment);
    dock.dataset.qilyStableOrder=ORDER.join(',');dock.dataset.qilyUnifiedPublicModule='v5.4';return true;
  }

  function legacyCopy(text){var area=d.createElement('textarea');area.value=text;area.setAttribute('readonly','');area.style.position='fixed';area.style.left='-9999px';(d.body||d.documentElement).appendChild(area);area.select();try{d.execCommand('copy');}catch(error){}area.remove();return Promise.resolve();}
  function copyText(text){return navigator.clipboard&&w.isSecureContext?navigator.clipboard.writeText(text).catch(function(){return legacyCopy(text);}):legacyCopy(text);}
  function toast(message){var node=d.getElementById('qilyDockStandaloneToastV5');if(!node){node=d.createElement('div');node.id='qilyDockStandaloneToastV5';node.setAttribute('role','status');node.style.cssText='position:fixed;left:50%;bottom:22px;z-index:2147483000;transform:translateX(-50%);padding:9px 14px;border-radius:999px;background:#073c47;color:#fff;font:700 14px/1.2 sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.22);pointer-events:none;opacity:0;transition:opacity .16s';(d.body||d.documentElement).appendChild(node);}node.textContent=message;node.style.opacity='1';clearTimeout(toast.timer);toast.timer=setTimeout(function(){node.style.opacity='0';},2200);}
  function openSearch(){if(w.QilySiteSearch&&typeof w.QilySiteSearch.open==='function'){w.QilySiteSearch.open();return;}var existing=d.getElementById('qilySiteSearchStandaloneV5');if(existing)return;var script=d.createElement('script');script.id='qilySiteSearchStandaloneV5';script.src='/site-search.js?v=20260826-search-navigation-v2';script.addEventListener('load',function(){if(w.QilySiteSearch)w.QilySiteSearch.open();else toast('本站搜索加载失败');},{once:true});script.addEventListener('error',function(){toast('本站搜索加载失败');},{once:true});(d.body||d.documentElement).appendChild(script);}
  function shareCurrent(){var title=d.title||'QilyLean',url=location.href,text=title+'\n'+url;if(navigator.share){navigator.share({title:title,text:title,url:url}).catch(function(error){if(error&&error.name==='AbortError')return;copyText(text).then(function(){toast('网页标题及网址已复制');});});return;}copyText(text).then(function(){toast('网页标题及网址已复制');});}
  function openContactPage(){
    var url='/contact/';
    try{w.open(url,'_blank','noopener,noreferrer');}catch(error){location.href=url;}
  }
  function runAction(action){
    if(action==='home'){location.href='/';return;}
    if(action==='top'){d.documentElement.scrollTop=0;if(d.body)d.body.scrollTop=0;w.scrollTo({top:0,left:0,behavior:'smooth'});return;}
    if(action==='back'){location.href=parentRoute(location.pathname);return;}
    if(action==='search'){openSearch();return;}
    if(action==='current'){shareCurrent();return;}
    if(action==='contact'){openContactPage();return;}
  }

  function targetButton(event){var node=event.target&&event.target.closest?event.target.closest('#floatDock .qily-float-btn[data-action]'):null;return node||null;}
  function installAuthoritativeEvents(){
    if(w.__qilyDockV54CaptureBound)return;w.__qilyDockV54CaptureBound=true;
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
