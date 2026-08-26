/* QilyLean Site Shell Recovery + Contact Route V6｜2026-08-26
 * Contact contract:
 * - keep the permanent six-action floating dock visible on desktop/mobile;
 * - preserve data-action="contact" compatibility with the core dock contract;
 * - convert the contact control to a native <a target="_blank"> after every shell build;
 * - stop the core dock's drag/click delegation only on that contact anchor, without preventDefault,
 *   so the browser performs a real user-initiated independent-page navigation;
 * - remove the legacy contact modal because /contact/ is the only contact surface;
 * - no polling, no MutationObserver, no reload, no full-page DOM scan.
 */
(function(d,w){
  'use strict';
  if(w.__qilySiteShellRecoveryV6)return;
  w.__qilySiteShellRecoveryV6=true;
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
    if(d.getElementById('qilySiteShellRecoveryV6Style'))return;
    var style=d.createElement('style');
    style.id='qilySiteShellRecoveryV6Style';
    style.textContent=[
      'html,html body{height:auto!important;min-height:0!important}',
      'html body{display:block!important}',
      'html body>main{height:auto!important;min-height:0!important;flex:none!important;margin-bottom:0!important;padding-bottom:0!important}',
      'html body>footer,html body>.footer,html body>.module-footer{flex:none!important;margin-top:0!important;margin-bottom:0!important}',
      '#floatDock.qily-float-dock{position:fixed!important;right:max(18px,env(safe-area-inset-right))!important;bottom:max(18px,env(safe-area-inset-bottom))!important;left:auto!important;top:auto!important;display:flex!important;flex-direction:column!important;gap:8px!important;visibility:visible!important;opacity:1!important;z-index:9000!important;overflow:visible!important}',
      '#floatDock.qily-float-dock .qily-float-btn{box-sizing:border-box!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;width:62px!important;height:62px!important;min-width:62px!important;min-height:62px!important;padding:0!important;border-radius:50%!important;visibility:visible!important;opacity:1!important;line-height:1.18!important;text-align:center!important;text-decoration:none!important}',
      '@media(max-width:620px){#floatDock.qily-float-dock{right:max(10px,env(safe-area-inset-right))!important;bottom:max(10px,env(safe-area-inset-bottom))!important;gap:6px!important}#floatDock.qily-float-dock .qily-float-btn{width:54px!important;height:54px!important;min-width:54px!important;min-height:54px!important;font-size:13px!important}}'
    ].join('');
    (d.head||d.documentElement).appendChild(style);
  }

  function removeLegacyContactModal(){var mask=d.getElementById('wxMask');if(mask)mask.remove();}
  function createButton(action){var b=d.createElement('button');b.type='button';b.className='qily-float-btn qily-float-'+action;b.setAttribute('data-action',action);b.innerHTML=LABELS[action];return b;}

  function bindNativeContactAnchor(anchor){
    if(!anchor||anchor.dataset.qilyNativeContactBound==='v6')return anchor;
    anchor.dataset.qilyNativeContactBound='v6';
    function isolate(event){event.stopPropagation();}
    anchor.addEventListener('pointerdown',isolate,false);
    anchor.addEventListener('pointermove',isolate,false);
    anchor.addEventListener('pointerup',isolate,false);
    anchor.addEventListener('pointercancel',isolate,false);
    anchor.addEventListener('click',isolate,false);
    return anchor;
  }

  function makeContactAnchor(control){
    if(!control)return null;
    if(control.tagName==='A'){
      control.href=CONTACT_URL;
      control.target='_blank';
      control.rel='noopener noreferrer';
      control.setAttribute('aria-label','联系我们（新页面打开）');
      control.setAttribute('title','联系我们（新页面打开）');
      control.setAttribute('data-qily-contact-route','native-new-tab-v6');
      control.innerHTML=LABELS.contact;
      return bindNativeContactAnchor(control);
    }
    var anchor=d.createElement('a');
    anchor.className=control.className||'qily-float-btn qily-float-contact';
    anchor.setAttribute('data-action','contact');
    anchor.href=CONTACT_URL;
    anchor.target='_blank';
    anchor.rel='noopener noreferrer';
    anchor.setAttribute('aria-label','联系我们（新页面打开）');
    anchor.setAttribute('title','联系我们（新页面打开）');
    anchor.setAttribute('data-qily-contact-route','native-new-tab-v6');
    anchor.innerHTML=LABELS.contact;
    control.replaceWith(anchor);
    return bindNativeContactAnchor(anchor);
  }

  function ensureDock(){
    var dock=d.getElementById('floatDock');
    if(!dock){
      dock=d.createElement('div');dock.id='floatDock';dock.className='qily-float-dock';dock.setAttribute('aria-label','快捷服务');
      ACTIONS.forEach(function(action){dock.appendChild(createButton(action));});(d.body||d.documentElement).appendChild(dock);
    }
    dock.querySelectorAll('[data-action="contact-page"]').forEach(function(button){button.setAttribute('data-action','contact');});
    ACTIONS.forEach(function(action){
      var control=dock.querySelector('[data-action="'+action+'"]');
      if(!control){control=createButton(action);dock.appendChild(control);}
      if(action==='contact')control=makeContactAnchor(control);
      else control.innerHTML=LABELS[action];
      var duplicates=dock.querySelectorAll('[data-action="'+action+'"]');for(var i=1;i<duplicates.length;i+=1)duplicates[i].remove();
    });
    ACTIONS.forEach(function(action){var control=dock.querySelector('[data-action="'+action+'"]');if(control)dock.appendChild(control);});
    dock.dataset.qilyStableOrder=ACTIONS.join(',');
    dock.dataset.qilyContactNativeRoute='v6';
    return dock;
  }

  function recover(){
    injectRecoveryCss();
    d.documentElement.classList.remove('qily-stale-document','qily-shell-pending','qily-first-paint-pending','qily-r2-first-paint-pending');
    if(d.body)d.body.style.removeProperty('visibility');
    removeLegacyContactModal();
    ensureDock();
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',recover,{once:true});else recover();
  d.addEventListener('qily:shell-ready',recover);
  w.addEventListener('pageshow',recover,{passive:true});
})(document,window);
