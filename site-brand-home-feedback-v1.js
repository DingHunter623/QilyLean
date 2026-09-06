/* QilyLean Brand Home Feedback Runtime V1.1 | 2026-09-06
 * Primary scope: header brand/home link feedback.
 * Formal VI v4 bootstrap: loads the separate final public-shell CSS/runtime; this module does not own VI behavior.
 * Root-route bootstrap: loads the separate, single-owner Homepage Conversion V1 module.
 * No navigation, translation, Dock, reload, MutationObserver, or polling ownership here.
 */
(function(d,w){
  'use strict';
  if(w.__qilyBrandHomeFeedbackV11)return;
  w.__qilyBrandHomeFeedbackV11=true;
  w.__qilyBrandHomeFeedbackV1=true;

  var VI_CSS='/site-vi-standard-v4.css?v=20260906-vi-v4-formal-closure';
  var VI_JS='/site-vi-runtime-v4.js?v=20260906-vi-v4-formal-closure';

  function ensureFormalVi(){
    if(d.head&&!d.getElementById('qilyViV4Formal')){
      var link=d.createElement('link');
      link.id='qilyViV4Formal';
      link.rel='stylesheet';
      link.href=VI_CSS;
      link.setAttribute('data-qily-vi','v4-formal');
      d.head.appendChild(link);
    }
    if(!d.getElementById('qilyViRuntimeV4')){
      var script=d.createElement('script');
      script.id='qilyViRuntimeV4';
      script.src=VI_JS;
      script.defer=true;
      script.setAttribute('data-qily-vi-runtime','v4-formal');
      (d.body||d.head||d.documentElement).appendChild(script);
    }
    var formal=d.getElementById('qilyViV4Formal');
    if(formal&&formal.parentNode===d.head&&d.head.lastElementChild!==formal)d.head.appendChild(formal);
    d.documentElement.setAttribute('data-qily-vi-loader','v4-formal');
  }

  function sync(){
    d.querySelectorAll('header.qily-site-header>a.qily-brand,header.qily-site-header>a.brand,header.qily-global-header>a.qily-brand,header.qily-global-header>a.brand,header.topbar>a.qily-brand,header.topbar>a.brand,header.top>a.qily-brand,header.top>a.brand').forEach(function(brand){
      brand.removeAttribute('title');
      brand.setAttribute('data-qily-brand-home-feedback','v1');
      if(!brand.getAttribute('aria-label'))brand.setAttribute('aria-label','返回QilyLean首页');
    });
    ensureFormalVi();
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
      script.src='/site-home-conversion-v1.js?v=20260901-home-public-brand-copy-v2';
      script.async=false;
      d.body.appendChild(script);
    }
  }

  function boot(){
    ensureFormalVi();
    sync();
    bootHomeConversion();
    w.setTimeout(ensureFormalVi,120);
    w.setTimeout(ensureFormalVi,700);
    w.setTimeout(ensureFormalVi,1400);
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
  d.addEventListener('qily:shell-ready',sync);
  w.addEventListener('pageshow',sync,{passive:true});
})(document,window);
