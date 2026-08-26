/* QilyLean Site Shell Recovery + Contact Route V5｜2026-08-26
 * Recovery contract:
 * - keep the permanent six-action floating dock visible on desktop/mobile;
 * - preserve data-action="contact" compatibility with the core dock contract;
 * - open /contact/ in a new independent tab/window from the Dock, with same-tab fallback only if blocked;
 * - remove legacy contact modal after shell creation;
 * - no MutationObserver, polling, reload or full-page DOM scan;
 * - neutralize legacy body/main flex expansion that creates abnormal blank tails.
 */
(function(d,w){
  'use strict';
  if(w.__qilySiteShellRecoveryV5)return;
  w.__qilySiteShellRecoveryV5=true;
  w.__qilySiteShellRecoveryV4=true;
  w.__qilyDedicatedContactRouteV4=true;
  w.__qilyDedicatedContactRouteV3=true;
  w.__qilyDedicatedContactRouteV2=true;
  w.__qilyDedicatedContactRouteV1=true;

  var CONTACT_URL='/contact/';
  var ACTIONS=['home','top','back','search','current','contact'];
  var LABELS={home:'首页',top:'回<br>顶部',back:'回<br>上一层',search:'本站<br>搜索',current:'分享<br>当前页',contact:'联系<br>我们'};

  function injectRecoveryCss(){
    if(d.getElementById('qilySiteShellRecoveryV5Style'))return;
    var style=d.createElement('style');
    style.id='qilySiteShellRecoveryV5Style';
    style.textContent=[
      'html,html body{height:auto!important;min-height:0!important}',
      'html body{display:block!important}',
      'html body>main{height:auto!important;min-height:0!important;flex:none!important;margin-bottom:0!important;padding-bottom:0!important}',
      'html body>footer,html body>.footer,html body>.module-footer{flex:none!important;margin-top:0!important;margin-bottom:0!important}',
      '#floatDock.qily-float-dock{position:fixed!important;right:max(18px,env(safe-area-inset-right))!important;bottom:max(18px,env(safe-area-inset-bottom))!important;left:auto!important;top:auto!important;display:flex!important;flex-direction:column!important;gap:8px!important;visibility:visible!important;opacity:1!important;z-index:9000!important;overflow:visible!important}',
      '#floatDock.qily-float-dock .qily-float-btn{box-sizing:border-box!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;width:62px!important;height:62px!important;min-width:62px!important;min-height:62px!important;padding:0!important;border-radius:50%!important;visibility:visible!important;opacity:1!important;line-height:1.18!important;text-align:center!important}',
      '@media(max-width:620px){#floatDock.qily-float-dock{right:max(10px,env(safe-area-inset-right))!important;bottom:max(10px,env(safe-area-inset-bottom))!important;gap:6px!important}#floatDock.qily-float-dock .qily-float-btn{width:54px!important;height:54px!important;min-width:54px!important;min-height:54px!important;font-size:13px!important}}'
    ].join('');
    d.head.appendChild(style);
  }

  function removeLegacyContactModal(){var mask=d.getElementById('wxMask');if(mask)mask.remove();}
  function createButton(action){var b=d.createElement('button');b.type='button';b.className='qily-float-btn qily-float-'+action;b.setAttribute('data-action',action);b.innerHTML=LABELS[action];return b;}

  function ensureDock(){
    var dock=d.getElementById('floatDock');
    if(!dock){
      dock=d.createElement('div');dock.id='floatDock';dock.className='qily-float-dock';dock.setAttribute('aria-label','快捷服务');
      ACTIONS.forEach(function(action){dock.appendChild(createButton(action));});d.body.appendChild(dock);
    }
    dock.querySelectorAll('[data-action="contact-page"]').forEach(function(button){button.setAttribute('data-action','contact');});
    ACTIONS.forEach(function(action){
      var button=dock.querySelector('[data-action="'+action+'"]');
      if(!button){button=createButton(action);dock.appendChild(button);}
      button.innerHTML=LABELS[action];
      if(action==='contact'){
        button.setAttribute('aria-label','联系我们');
        button.setAttribute('title','联系我们（新窗口打开）');
        button.setAttribute('data-qily-contact-route','new-window-v5');
      }
      var duplicates=dock.querySelectorAll('[data-action="'+action+'"]');for(var i=1;i<duplicates.length;i+=1)duplicates[i].remove();
    });
    ACTIONS.forEach(function(action){var button=dock.querySelector('[data-action="'+action+'"]');if(button)dock.appendChild(button);});
    dock.dataset.qilyStableOrder=ACTIONS.join(',');
    return dock;
  }

  function openSearch(){
    if(w.QilySiteSearch&&typeof w.QilySiteSearch.open==='function'){w.QilySiteSearch.open();return;}
    var existing=d.getElementById('qilySiteSearchScript');
    if(existing){existing.addEventListener('load',function(){if(w.QilySiteSearch)w.QilySiteSearch.open();},{once:true});return;}
    var script=d.createElement('script');script.id='qilySiteSearchScript';script.src='/site-search.js?v=20260729-ranked-search-v1';script.addEventListener('load',function(){if(w.QilySiteSearch)w.QilySiteSearch.open();},{once:true});d.body.appendChild(script);
  }
  function shareCurrent(){
    var title=d.title||'QilyLean',url=w.location.href;
    if(navigator.share){navigator.share({title:title,text:title,url:url}).catch(function(){});return;}
    if(navigator.clipboard&&w.isSecureContext)navigator.clipboard.writeText(title+'\n'+url).catch(function(){});
  }
  function openContact(){
    var child=null;
    try{child=w.open(CONTACT_URL,'_blank');}catch(error){}
    if(child){try{child.opener=null;}catch(error){}return;}
    w.location.assign(CONTACT_URL);
  }
  function runAction(action,event){
    if(event){event.preventDefault();event.stopImmediatePropagation();}
    if(action==='home')w.location.assign('/');
    else if(action==='top'){d.documentElement.scrollTop=0;d.body.scrollTop=0;w.scrollTo(0,0);}
    else if(action==='back'){if(w.history.length>1)w.history.back();else w.location.assign('/');}
    else if(action==='search')openSearch();
    else if(action==='current')shareCurrent();
    else if(action==='contact')openContact();
  }
  function bindDock(dock){
    if(dock.dataset.qilyRecoveryBound==='v5')return;dock.dataset.qilyRecoveryBound='v5';
    dock.addEventListener('click',function(event){var button=event.target.closest&&event.target.closest('.qily-float-btn[data-action]');if(!button)return;runAction(button.getAttribute('data-action')||'',event);},true);
  }
  function recover(){
    injectRecoveryCss();
    d.documentElement.classList.remove('qily-stale-document','qily-shell-pending','qily-first-paint-pending','qily-r2-first-paint-pending');
    if(d.body)d.body.style.removeProperty('visibility');
    removeLegacyContactModal();bindDock(ensureDock());
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',recover,{once:true});else recover();
  d.addEventListener('qily:shell-ready',recover);
  w.addEventListener('pageshow',recover,{passive:true});
})(document,window);
