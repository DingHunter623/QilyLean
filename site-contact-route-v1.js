/* QilyLean Dedicated Contact Route V2｜2026-08-26
 * Permanent contract: the floating contact control is a navigation entry, never a modal trigger.
 * Legacy core still recognizes data-action="contact" as a popup action, so V2 permanently migrates
 * the control to data-action="contact-page", removes legacy wxMask, and navigates to /contact/.
 */
(function(d,w){
  'use strict';
  if(w.__qilyDedicatedContactRouteV2)return;
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
    d.querySelectorAll('.qily-modal-mask .qily-contact-panel').forEach(function(panel){
      var parent=panel.closest('.qily-modal-mask');
      if(parent)parent.remove();
    });
  }
  function normalize(){
    removeLegacyModal();
    d.querySelectorAll(SELECTOR).forEach(function(control){
      control.setAttribute('data-action','contact-page');
      control.innerHTML='联系<br>我们';
      control.setAttribute('aria-label','联系我们');
      control.setAttribute('title','联系我们');
      control.setAttribute('data-qily-contact-route',CONTACT_URL);
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
  if(w.MutationObserver)new MutationObserver(function(records){
    for(var i=0;i<records.length;i+=1){
      var node=records[i].target;
      if((node&&node.id==='floatDock')||(node&&node.id==='wxMask')||(node&&node.querySelector&&node.querySelector(SELECTOR+',#wxMask'))){normalize();break;}
    }
  }).observe(d.documentElement,{subtree:true,childList:true});
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',normalize,{once:true});else normalize();
})(document,window);
