/* QilyLean Brand Home Feedback Runtime V1 | 2026-08-31
 * Scope: header brand/home link only.
 * Removes the browser-native title tooltip so the in-place visual label is the single hover cue.
 */
(function(d,w){
  'use strict';
  if(w.__qilyBrandHomeFeedbackV1)return;
  w.__qilyBrandHomeFeedbackV1=true;

  function sync(){
    d.querySelectorAll('header.qily-site-header>a.qily-brand,header.qily-site-header>a.brand,header.qily-global-header>a.qily-brand,header.qily-global-header>a.brand,header.topbar>a.qily-brand,header.topbar>a.brand,header.top>a.qily-brand,header.top>a.brand').forEach(function(brand){
      brand.removeAttribute('title');
      brand.setAttribute('data-qily-brand-home-feedback','v1');
      if(!brand.getAttribute('aria-label'))brand.setAttribute('aria-label','返回QilyLean首页');
    });
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',sync,{once:true});
  else sync();
  d.addEventListener('qily:shell-ready',sync);
  w.addEventListener('pageshow',sync,{passive:true});
  w.setTimeout(sync,120);
  w.setTimeout(sync,700);
})(document,window);
