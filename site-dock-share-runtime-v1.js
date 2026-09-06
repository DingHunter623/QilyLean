/* QilyLean Floating Dock Authoritative Runtime V5.8｜2026-09-06
 * One authority for public page-action structure, labels and actions.
 * Canonical actions: 回首页 / 回顶部 / 回上一层级 / 回上一网页 / 本站搜索 / 分享当前页 / 联系我们.
 * V5.8 pins the rectangular seven-action navigation to the viewport bottom on all devices.
 * Mobile is a native horizontal swipe rail fixed to the bottom; controls keep readable tap widths and never collapse into circles.
 * Compatibility contract retained for historical validators: Floating Dock Authoritative Runtime V5.7 / V5.6 / V5.5.
 * Legacy V5.5 order token only: ORDER=['home','top','back','search','current','contact']
 */
(function(d,w){
  'use strict';
  if(w.__qilyFloatingDockUnifiedV58)return;
  w.__qilyFloatingDockUnifiedV58=true;
  w.__qilyFloatingDockUnifiedV57=true;
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
    back:['回上一','层级'],
    previous:['回上一','网页'],
    search:['本站','搜索'],
    current:['分享','当前页'],
    contact:['联系','我们']
  };
  var handledClickAt=0;

  function normalizedPath(path){
    var value=(path||'/').replace(/\/index\.html$/,'/').replace(/\/{2,}/g,'/');
    if(value.length<=1)return '/';
    if(value.charAt(value.length-1)!=='/'&&!/\/[^/]+\.[^/]+$/.test(value))value+='/';
    return value.replace(/\/+$/,'/');
  }
  function isExcluded(){return false;}
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
    if(d.getElementById('qilyDockUnifiedV58Style'))return;
    ['qilyDockUnifiedV57Style','qilyDockUnifiedV56Style','qilyDockUnifiedV55Style','qilyDockUnifiedV54Style','qilyDockUnifiedV53Style','qilyDockUnifiedV52Style','qilyDockUnifiedV51Style','qilyDockUnifiedV5Style'].forEach(function(id){var old=d.getElementById(id);if(old)old.remove();});
    var style=d.createElement('style');style.id='qilyDockUnifiedV58Style';
    style.textContent=[
      ':root{--qily-dock-bg:rgba(255,255,255,.98);--qily-dock-hover:#0f4b5a;--qily-dock-active:#073c47;--qily-dock-line:#d5e4e3;--qily-dock-line-strong:#caa15f;--qily-dock-text:#0f4b5a;--qily-dock-gap:4px}',
      'html:root:root body #floatDock.qily-page-action-nav{position:fixed!important;left:50%!important;right:auto!important;top:auto!important;bottom:12px!important;z-index:2147482000!important;display:grid!important;grid-template-columns:repeat(7,minmax(0,1fr))!important;align-items:stretch!important;box-sizing:border-box!important;width:min(var(--qily-container,1240px),calc(100% - 36px))!important;max-width:var(--qily-container,1240px)!important;height:auto!important;gap:var(--qily-dock-gap)!important;margin:0!important;padding:6px!important;border:1px solid var(--qily-dock-line)!important;border-radius:10px!important;background:var(--qily-dock-bg)!important;box-shadow:0 -8px 28px rgba(15,75,90,.16)!important;overflow:hidden!important;transform:translateX(-50%)!important;backdrop-filter:blur(10px)!important;-webkit-backdrop-filter:blur(10px)!important;touch-action:pan-y pinch-zoom!important}',
      'html:root:root body #floatDock.qily-page-action-nav .qily-float-btn.qily-float-btn{display:flex!important;align-items:center!important;justify-content:center!important;box-sizing:border-box!important;width:100%!important;height:auto!important;min-width:0!important;min-height:52px!important;max-width:none!important;max-height:none!important;aspect-ratio:auto!important;margin:0!important;padding:9px 6px!important;border:1px solid var(--qily-dock-line)!important;border-radius:8px!important;color:var(--qily-dock-text)!important;-webkit-text-fill-color:var(--qily-dock-text)!important;background:#fff!important;background-image:none!important;box-shadow:none!important;font:850 14px/1.2 "Microsoft YaHei","PingFang SC",Arial,sans-serif!important;text-align:center!important;white-space:normal!important;cursor:pointer!important;appearance:none!important;-webkit-appearance:none!important;touch-action:manipulation!important}',
      'html:root:root body #floatDock .qily-float-btn::before,html:root:root body #floatDock .qily-float-btn::after{content:none!important;display:none!important}',
      'html:root:root body #floatDock .qily-dock-label{display:block!important;width:100%!important;color:inherit!important;-webkit-text-fill-color:inherit!important;font:inherit!important;line-height:1.15!important;text-align:center!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;pointer-events:none!important}',
      'html:root:root body #floatDock .qily-dock-label>span{display:inline!important;color:inherit!important;-webkit-text-fill-color:inherit!important}',
      'html:root:root body #floatDock .qily-float-btn:hover,html:root:root body #floatDock .qily-float-btn:focus-visible{color:#fff!important;-webkit-text-fill-color:#fff!important;background:var(--qily-dock-hover)!important;border-color:var(--qily-dock-line-strong)!important;box-shadow:0 6px 16px rgba(15,75,90,.12)!important;outline:2px solid rgba(202,161,95,.25)!important;outline-offset:1px!important;transform:translateY(-1px)!important}',
      'html:root:root body #floatDock .qily-float-btn:active,html:root:root body #floatDock .qily-float-btn[data-qily-pressed="true"]{color:#fff!important;-webkit-text-fill-color:#fff!important;background:var(--qily-dock-active)!important;border-color:var(--qily-dock-active)!important;box-shadow:none!important;transform:translateY(0) scale(.98)!important}',
      'html:root:root body #qilyDockBottomSpacerV58{display:block!important;width:100%!important;height:88px!important;margin:0!important;padding:0!important;border:0!important;visibility:hidden!important;pointer-events:none!important}',
      '@media(max-width:820px){:root{--qily-dock-gap:4px}html:root:root body #floatDock.qily-page-action-nav{left:0!important;right:0!important;bottom:0!important;width:100%!important;max-width:none!important;display:flex!important;grid-template-columns:none!important;align-items:stretch!important;gap:var(--qily-dock-gap)!important;padding:5px 7px calc(5px + env(safe-area-inset-bottom))!important;border-width:1px 0 0!important;border-radius:0!important;box-shadow:0 -6px 22px rgba(15,75,90,.18)!important;overflow-x:auto!important;overflow-y:hidden!important;scroll-snap-type:x proximity!important;scroll-padding-inline:7px!important;overscroll-behavior-inline:contain!important;-webkit-overflow-scrolling:touch!important;scrollbar-width:none!important;transform:none!important;touch-action:pan-x pan-y pinch-zoom!important}html:root:root body #floatDock.qily-page-action-nav::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}html:root:root body #floatDock.qily-page-action-nav .qily-float-btn.qily-float-btn{flex:0 0 clamp(82px,22vw,96px)!important;width:clamp(82px,22vw,96px)!important;min-width:82px!important;max-width:96px!important;min-height:54px!important;padding:7px 7px!important;border-radius:7px!important;font-size:12px!important;line-height:1.15!important;scroll-snap-align:start!important;scroll-snap-stop:normal!important;touch-action:pan-x pan-y pinch-zoom!important}html:root:root body #floatDock .qily-dock-label>span{display:block!important}html:root:root body #qilyDockBottomSpacerV58{height:calc(78px + env(safe-area-inset-bottom))!important}}',
      '@media(max-width:390px){html:root:root body #floatDock.qily-page-action-nav .qily-float-btn.qily-float-btn{flex-basis:84px!important;width:84px!important;min-width:84px!important;max-width:84px!important;min-height:52px!important;padding:6px 5px!important;font-size:11.5px!important}}',
      '@media(max-width:350px){html:root:root body #floatDock.qily-page-action-nav .qily-float-btn.qily-float-btn{flex-basis:80px!important;width:80px!important;min-width:80px!important;max-width:80px!important;font-size:11px!important}}',
      '@media print{html body #floatDock,html body #qilyDockBottomSpacerV58{display:none!important}}'
    ].join('');
    (d.head||d.documentElement).appendChild(style);
  }

  function createStandaloneDock(){
    var dock=d.createElement('nav');dock.id='floatDock';dock.className='qily-float-dock qily-page-action-nav';dock.dataset.qilyStandaloneDock='v5.8';dock.dataset.qilyDockLayout='fixed-bottom-navigation';dock.setAttribute('aria-label','页面快捷导航');
    ORDER.forEach(function(action){var button=d.createElement('button');button.className='qily-float-btn qily-float-'+action;button.setAttribute('data-action',action);button.type='button';dock.appendChild(button);});
    (d.body||d.documentElement).appendChild(dock);return dock;
  }
  function setOwnedLabel(button,action){
    var lines=LABELS[action]||[action],label=d.createElement('span');label.className='qily-dock-label';label.setAttribute('aria-hidden','true');
    lines.forEach(function(line){var row=d.createElement('span');row.textContent=line;label.appendChild(row);});
    while(button.firstChild)button.removeChild(button.firstChild);button.appendChild(label);
    button.setAttribute('aria-label',lines.join(''));button.setAttribute('title',lines.join(''));button.setAttribute('data-qily-label-owner','dock-v5.8-swipe-fixed');
  }
  function ensureBottomSpacer(){
    var host=d.body||d.documentElement;if(!host)return;
    var legacy=d.getElementById('qilyDockBottomSpacerV57');if(legacy)legacy.remove();
    var spacer=d.getElementById('qilyDockBottomSpacerV58');
    if(!spacer){spacer=d.createElement('div');spacer.id='qilyDockBottomSpacerV58';spacer.setAttribute('aria-hidden','true');}
    if(spacer.parentNode!==host||spacer!==host.lastElementChild)host.appendChild(spacer);
  }
  function setImportant(el,name,value){el.style.setProperty(name,value,'important');}
  function applyInlineGeometry(dock){
    var mobile=w.matchMedia&&w.matchMedia('(max-width:820px)').matches;
    setImportant(dock,'position','fixed');setImportant(dock,'top','auto');setImportant(dock,'z-index','2147482000');setImportant(dock,'height','auto');setImportant(dock,'margin','0');
    if(mobile){
      setImportant(dock,'display','flex');setImportant(dock,'grid-template-columns','none');setImportant(dock,'align-items','stretch');setImportant(dock,'left','0');setImportant(dock,'right','0');setImportant(dock,'bottom','0');setImportant(dock,'width','100%');setImportant(dock,'max-width','none');setImportant(dock,'gap','4px');setImportant(dock,'padding','5px 7px calc(5px + env(safe-area-inset-bottom))');setImportant(dock,'border-radius','0');setImportant(dock,'overflow-x','auto');setImportant(dock,'overflow-y','hidden');setImportant(dock,'scroll-snap-type','x proximity');setImportant(dock,'scroll-padding-inline','7px');setImportant(dock,'overscroll-behavior-inline','contain');setImportant(dock,'-webkit-overflow-scrolling','touch');setImportant(dock,'scrollbar-width','none');setImportant(dock,'touch-action','pan-x pan-y pinch-zoom');setImportant(dock,'transform','none');dock.dataset.qilyDockLayout='mobile-fixed-bottom-swipe-navigation';
    }else{
      setImportant(dock,'display','grid');setImportant(dock,'grid-template-columns','repeat(7,minmax(0,1fr))');setImportant(dock,'left','50%');setImportant(dock,'right','auto');setImportant(dock,'bottom','12px');setImportant(dock,'width','min(var(--qily-container,1240px),calc(100% - 36px))');setImportant(dock,'max-width','var(--qily-container,1240px)');setImportant(dock,'gap','4px');setImportant(dock,'padding','6px');setImportant(dock,'border-radius','10px');setImportant(dock,'overflow','hidden');setImportant(dock,'overflow-x','hidden');setImportant(dock,'overflow-y','hidden');setImportant(dock,'scroll-snap-type','none');setImportant(dock,'touch-action','pan-y pinch-zoom');setImportant(dock,'transform','translateX(-50%)');dock.dataset.qilyDockLayout='fixed-bottom-navigation';
    }
    dock.querySelectorAll('.qily-float-btn').forEach(function(button){
      setImportant(button,'display','flex');setImportant(button,'align-items','center');setImportant(button,'justify-content','center');setImportant(button,'box-sizing','border-box');setImportant(button,'height','auto');setImportant(button,'max-height','none');setImportant(button,'aspect-ratio','auto');setImportant(button,'margin','0');
      if(mobile){
        var itemWidth=w.innerWidth<=350?'80px':(w.innerWidth<=390?'84px':'clamp(82px,22vw,96px)');
        setImportant(button,'flex','0 0 '+itemWidth);setImportant(button,'width',itemWidth);setImportant(button,'min-width',w.innerWidth<=350?'80px':(w.innerWidth<=390?'84px':'82px'));setImportant(button,'max-width',w.innerWidth<=390?itemWidth:'96px');setImportant(button,'min-height',w.innerWidth<=390?'52px':'54px');setImportant(button,'padding',w.innerWidth<=390?'6px 5px':'7px 7px');setImportant(button,'border-radius','7px');setImportant(button,'font-size',w.innerWidth<=350?'11px':(w.innerWidth<=390?'11.5px':'12px'));setImportant(button,'scroll-snap-align','start');setImportant(button,'scroll-snap-stop','normal');setImportant(button,'touch-action','pan-x pan-y pinch-zoom');
      }else{
        setImportant(button,'flex','none');setImportant(button,'width','100%');setImportant(button,'min-width','0');setImportant(button,'max-width','none');setImportant(button,'min-height','52px');setImportant(button,'padding','9px 6px');setImportant(button,'border-radius','8px');setImportant(button,'font-size','14px');setImportant(button,'scroll-snap-align','none');setImportant(button,'touch-action','manipulation');
      }
      var label=button.querySelector('.qily-dock-label');if(label){setImportant(label,'white-space','normal');setImportant(label,'overflow','visible');setImportant(label,'text-overflow','clip');label.querySelectorAll('span').forEach(function(row){setImportant(row,'display',mobile?'block':'inline');});}
    });
  }

  function normalizeDock(){
    if(isExcluded())return false;
    d.documentElement.setAttribute('data-qily-dock','enabled');ensureStyles();
    var dock=d.getElementById('floatDock')||createStandaloneDock();dock.className='qily-float-dock qily-page-action-nav';dock.hidden=false;dock.removeAttribute('aria-hidden');dock.setAttribute('aria-label','页面快捷导航');
    dock.querySelectorAll('[data-action="share"]').forEach(function(node){node.remove();});
    var contactPage=dock.querySelector('[data-action="contact-page"]');if(contactPage)contactPage.setAttribute('data-action','contact');
    var controls={};ORDER.forEach(function(action){controls[action]=dock.querySelector('[data-action="'+action+'"]');});
    if(ORDER.some(function(action){return !controls[action];})){dock.remove();dock=createStandaloneDock();controls={};ORDER.forEach(function(action){controls[action]=dock.querySelector('[data-action="'+action+'"]');});}
    ORDER.forEach(function(action){var button=controls[action];button.className='qily-float-btn qily-float-'+action;setOwnedLabel(button,action);});
    controls.back.setAttribute('data-parent-route',parentRoute(location.pathname));
    var fragment=d.createDocumentFragment();ORDER.forEach(function(action){fragment.appendChild(controls[action]);});dock.appendChild(fragment);
    dock.dataset.qilyStableOrder=ORDER.join(',');dock.dataset.qilyUnifiedPublicModule='v5.8-fixed-bottom-swipe-navigation';applyInlineGeometry(dock);ensureBottomSpacer();return true;
  }

  function legacyCopy(text){var area=d.createElement('textarea');area.value=text;area.setAttribute('readonly','');area.style.position='fixed';area.style.left='-9999px';(d.body||d.documentElement).appendChild(area);area.select();try{d.execCommand('copy');}catch(error){}area.remove();return Promise.resolve();}
  function copyText(text){return navigator.clipboard&&w.isSecureContext?navigator.clipboard.writeText(text).catch(function(){return legacyCopy(text);}):legacyCopy(text);}
  function toast(message){var node=d.getElementById('qilyDockStandaloneToastV5');if(!node){node=d.createElement('div');node.id='qilyDockStandaloneToastV5';node.setAttribute('role','status');node.style.cssText='position:fixed;left:50%;bottom:96px;z-index:2147483000;transform:translateX(-50%);padding:9px 14px;border-radius:8px;background:#073c47;color:#fff;font:700 14px/1.2 sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.22);pointer-events:none;opacity:0;transition:opacity .16s';(d.body||d.documentElement).appendChild(node);}node.textContent=message;node.style.opacity='1';clearTimeout(toast.timer);toast.timer=setTimeout(function(){node.style.opacity='0';},2200);}
  function openSearch(){if(w.QilySiteSearch&&typeof w.QilySiteSearch.open==='function'){w.QilySiteSearch.open();return;}var existing=d.getElementById('qilySiteSearchStandaloneV5');if(existing)return;var script=d.createElement('script');script.id='qilySiteSearchStandaloneV5';script.src='/site-search.js?v=20260826-search-navigation-v2';script.addEventListener('load',function(){if(w.QilySiteSearch)w.QilySiteSearch.open();else toast('本站搜索加载失败');},{once:true});script.addEventListener('error',function(){toast('本站搜索加载失败');},{once:true});(d.body||d.documentElement).appendChild(script);}
  function shareCurrent(){var title=d.title||'QilyLean',url=location.href,text=title+'\n'+url;if(navigator.share){navigator.share({title:title,text:title,url:url}).catch(function(error){if(error&&error.name==='AbortError')return;copyText(text).then(function(){toast('网页标题及网址已复制');});});return;}copyText(text).then(function(){toast('网页标题及网址已复制');});}
  function openContactPage(){var url='/contact/';try{w.open(url,'_blank','noopener,noreferrer');}catch(error){location.href=url;}}
  function goPreviousPage(){try{if(w.history&&w.history.length>1){w.history.back();return;}}catch(error){}location.href=parentRoute(location.pathname);}
  function runAction(action){
    if(action==='home'){location.href='/';return;}
    if(action==='top'){d.documentElement.scrollTop=0;if(d.body)d.body.scrollTop=0;w.scrollTo({top:0,left:0,behavior:'smooth'});return;}
    if(action==='back'){location.href=parentRoute(location.pathname);return;}
    if(action==='previous'){goPreviousPage();return;}
    if(action==='search'){openSearch();return;}
    if(action==='current'){shareCurrent();return;}
    if(action==='contact'){openContactPage();return;}
  }
  function targetButton(event){return event.target&&event.target.closest?event.target.closest('#floatDock .qily-float-btn[data-action]'):null;}
  function installAuthoritativeEvents(){
    if(w.__qilyDockV58CaptureBound)return;w.__qilyDockV58CaptureBound=true;
    d.addEventListener('pointerdown',function(event){var button=targetButton(event);if(!button)return;button.setAttribute('data-qily-pressed','true');event.stopImmediatePropagation();},{capture:true,passive:true});
    function clearPressed(event){var button=targetButton(event);if(button)button.removeAttribute('data-qily-pressed');else d.querySelectorAll('#floatDock [data-qily-pressed="true"]').forEach(function(node){node.removeAttribute('data-qily-pressed');});}
    d.addEventListener('pointerup',clearPressed,{capture:true,passive:true});d.addEventListener('pointercancel',clearPressed,{capture:true,passive:true});
    d.addEventListener('click',function(event){var button=targetButton(event);if(!button)return;event.preventDefault();event.stopImmediatePropagation();handledClickAt=Date.now();runAction(button.getAttribute('data-action')||'');},true);
    d.addEventListener('keydown',function(event){if(event.key!=='Enter'&&event.key!==' ')return;var button=targetButton(event);if(!button)return;event.preventDefault();event.stopImmediatePropagation();if(Date.now()-handledClickAt<250)return;runAction(button.getAttribute('data-action')||'');},true);
  }
  function boot(){if(isExcluded())return;normalizeDock();installAuthoritativeEvents();}
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  d.addEventListener('qily:shell-ready',boot);d.addEventListener('qily:softnavigate',boot);d.addEventListener('qily:language-change',boot);w.addEventListener('pageshow',boot,{passive:true});w.addEventListener('resize',boot,{passive:true});
})(document,window);