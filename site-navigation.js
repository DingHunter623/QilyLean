/* QilyLean global navigation wrapper｜保留原功能并加载个人品牌可信度增强模块 */
(function(d){
  'use strict';
  if(window.__qilyNavigationWrapper20260802)return;
  window.__qilyNavigationWrapper20260802=true;

  function loadEnhancer(){
    if(d.querySelector('script[data-qily-brand-trust-loader]'))return;
    var enhancer=d.createElement('script');
    enhancer.src='/site-brand-trust-v1.js?v=20260802-personal-brand-v1';
    enhancer.defer=true;
    enhancer.setAttribute('data-qily-brand-trust-loader','v1');
    (d.head||d.documentElement).appendChild(enhancer);
  }

  var legacy=d.createElement('script');
  legacy.src='/site-navigation-legacy-20260802.js?v=20260802-preserved-v1';
  legacy.async=false;
  legacy.setAttribute('data-qily-navigation-legacy','preserved');
  legacy.onload=loadEnhancer;
  legacy.onerror=loadEnhancer;
  (d.head||d.documentElement).appendChild(legacy);
})(document);
