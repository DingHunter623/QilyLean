/* QilyLean Floating Dock Retirement V1｜2026-08-28
 * The lower-right six-action floating module is retired sitewide by product decision.
 * This runtime removes any legacy/materialized Dock node and prevents old shell scripts
 * from resurrecting it during first paint, soft navigation, translation or pageshow.
 */
(function(d,w){
  'use strict';
  if(w.__qilyFloatingDockRetiredV1)return;
  w.__qilyFloatingDockRetiredV1=true;

  function isDock(node){
    return !!(node&&node.nodeType===1&&(
      node.id==='floatDock'||
      (node.classList&&(node.classList.contains('qily-float-dock')||node.classList.contains('qily-floating-dock')))
    ));
  }

  function removeDock(root){
    if(isDock(root))root.remove();
    if(root&&root.querySelectorAll){
      root.querySelectorAll('#floatDock,.qily-float-dock,.qily-floating-dock').forEach(function(node){node.remove();});
    }
  }

  function retireNow(){removeDock(d);}

  function boot(){
    retireNow();
    if(!w.__qilyFloatingDockRetirementObserverV1&&d.documentElement){
      w.__qilyFloatingDockRetirementObserverV1=new MutationObserver(function(records){
        records.forEach(function(record){record.addedNodes.forEach(removeDock);});
      });
      w.__qilyFloatingDockRetirementObserverV1.observe(d.documentElement,{childList:true,subtree:true});
    }
    d.addEventListener('qily:shell-ready',retireNow);
    d.addEventListener('qily:softnavigate',retireNow);
    d.addEventListener('qily:language-change',retireNow);
    w.addEventListener('pageshow',retireNow,{passive:true});
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})(document,window);
