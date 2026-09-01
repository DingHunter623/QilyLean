/* QilyLean Brand Home Feedback Runtime V1 | 2026-09-01
 * Primary scope: header brand/home link feedback.
 * Root-route bootstrap: loads the separate, single-owner Homepage Conversion V1 module.
 * No navigation, translation, Dock, reload, MutationObserver, or polling ownership here.
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

  function isHome(){
    var path=String(w.location.pathname||'/').replace(/\/index\.html$/i,'/').replace(/\/{2,}/g,'/');
    return path==='/'||path==='';
  }

  function bootHomeConversion(){
    if(!isHome())return;
    if(!d.getElementById('qilyHomeConversionV1Stylesheet')){
      var link=d.createElement('link');
      link.id='qilyHomeConversionV1Stylesheet';
      link.rel='stylesheet';
      link.href='/styles/qily-home-conversion-v1.css?v=20260901-home-conversion-v1';
      d.head.appendChild(link);
    }
    if(!d.getElementById('qilyHomeConversionV1Runtime')){
      var script=d.createElement('script');
      script.id='qilyHomeConversionV1Runtime';
      script.src='/site-home-conversion-v1.js?v=20260901-home-conversion-v1';
      script.async=false;
      d.body.appendChild(script);
    }
  }

  function boot(){
    sync();
    bootHomeConversion();
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
  d.addEventListener('qily:shell-ready',sync);
  w.addEventListener('pageshow',sync,{passive:true});
})(document,window);
