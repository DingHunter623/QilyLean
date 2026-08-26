/* QilyLean Dedicated Contact Route V1｜2026-08-26
 * Permanent contract: the floating contact control is a navigation entry, not a modal trigger.
 * It is normalized sitewide after shell creation and intercepted before legacy dock handlers.
 */
(function(d,w){
  'use strict';
  if(w.__qilyDedicatedContactRouteV1)return;
  w.__qilyDedicatedContactRouteV1=true;
  var CONTACT_URL='/contact/';

  function contactControl(target){
    return target&&target.closest?target.closest('#floatDock [data-action="contact"],.qily-floating-dock [data-action="contact"]'):null;
  }
  function normalize(){
    d.querySelectorAll('#floatDock [data-action="contact"],.qily-floating-dock [data-action="contact"]').forEach(function(control){
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
      if((node&&node.id==='floatDock')||(node&&node.querySelector&&node.querySelector('#floatDock [data-action="contact"],.qily-floating-dock [data-action="contact"]'))){normalize();break;}
    }
  }).observe(d.documentElement,{subtree:true,childList:true});
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',normalize,{once:true});else normalize();
})(document,window);
