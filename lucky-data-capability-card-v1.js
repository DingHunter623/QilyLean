/* Lucky Data capability module | TEMPORARILY HIDDEN | 2026-09-07
 * Preserve implementation for later re-enable after official data synchronization is closed-loop.
 */
(function(d,w){
  'use strict';
  w.__qilyLuckyDataCapabilityCardV1=true;
  w.__qilyLuckyDataCapabilityHidden=true;

  function installHideGuard(){
    if((w.location.pathname||'').replace(/\/index\.html$/,'/')!=='/capabilities/')return;
    var style=d.getElementById('qilyLuckyDataCapabilityHiddenStyle');
    if(!style){
      style=d.createElement('style');
      style.id='qilyLuckyDataCapabilityHiddenStyle';
      style.textContent='#lucky-data-digital-tool,[data-qily-lucky-data]{display:none!important}';
      (d.head||d.documentElement).appendChild(style);
    }
    var node=d.getElementById('lucky-data-digital-tool');
    if(node)node.remove();
    var legacyStyle=d.getElementById('qilyLuckyDataCapabilityCardStyle');
    if(legacyStyle)legacyStyle.remove();
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',installHideGuard,{once:true});
  else installHideGuard();
  d.addEventListener('qily:shell-ready',installHideGuard);
  w.addEventListener('pageshow',installHideGuard,{passive:true});
})(document,window);
