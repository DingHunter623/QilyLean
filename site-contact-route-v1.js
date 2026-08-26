/* QilyLean Dedicated Contact Route V3｜2026-08-26
 * Minimal stable contract: normalize the floating contact entry only at known shell lifecycle points.
 * No MutationObserver, no DOM rewrite loop, no popup interception layer.
 */
(function(d,w){
  'use strict';
  if(w.__qilyDedicatedContactRouteV3)return;
  w.__qilyDedicatedContactRouteV3=true;
  w.__qilyDedicatedContactRouteV2=true;
  w.__qilyDedicatedContactRouteV1=true;
  var CONTACT_URL='/contact/';
  var SELECTOR='#floatDock [data-action="contact"],#floatDock [data-action="contact-page"],.qily-floating-dock [data-action="contact"],.qily-floating-dock [data-action="contact-page"]';

  function contactControl(target){
    return target&&target.closest?target.closest(SELECTOR):null;
  }
  function removeLegacyModal(){
    var mask=d.getElementById('wxMask');
    if(mask)mask.remove();
  }
  function normalize(){
    removeLegacyModal();
    d.querySelectorAll(SELECTOR).forEach(function(control){
      if(control.getAttribute('data-action')!=='contact-page')control.setAttribute('data-action','contact-page');
      if(control.innerHTML!=='联系<br>我们')control.innerHTML='联系<br>我们';
      if(control.getAttribute('aria-label')!=='联系我们')control.setAttribute('aria-label','联系我们');
      if(control.getAttribute('title')!=='联系我们')control.setAttribute('title','联系我们');
      if(control.getAttribute('data-qily-contact-route')!==CONTACT_URL)control.setAttribute('data-qily-contact-route',CONTACT_URL);
    });
  }
  function go(event){
    var control=contactControl(event.target);if(!control)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    w.location.assign(CONTACT_URL);
  }

  d.addEventListener('pointerup',go,true);
  d.addEventListener('click',go,true);
  d.addEventListener('qily:shell-ready',normalize);
  d.addEventListener('qily:language-change',normalize);
  w.addEventListener('pageshow',normalize,{passive:true});
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',normalize,{once:true});else normalize();
})(document,window);
