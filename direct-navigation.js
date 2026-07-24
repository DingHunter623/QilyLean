(function(){
  'use strict';
  /*
   * 导航只由浏览器原生链接处理。
   * 不在捕获阶段拦截 click、touch 或 pointer 事件，避免与页面内锚点、
   * target="_top" 及其他页面脚本互相触发而产生循环或空白页。
   */
  if (window.__qilyLeanNativeNavigationReady) return;
  window.__qilyLeanNativeNavigationReady = true;

  function loadVisualScale(){
    if(document.getElementById('qilyVisualScaleStylesheet'))return;
    var link=document.createElement('link');
    link.id='qilyVisualScaleStylesheet';
    link.rel='stylesheet';
    link.href='/site-visual-scale-v1.css?v=20260724-home-balance-v1';
    document.head.appendChild(link);
  }

  function alignHomepageMetrics(){
    if(document.getElementById('qilyMetricBottomAlignStyle'))return;
    var style=document.createElement('style');
    style.id='qilyMetricBottomAlignStyle';
    style.textContent='.qily-home-balanced .metrics{align-items:stretch!important}.qily-home-balanced .metric{display:flex!important;flex-direction:column!important;height:100%!important}.qily-home-balanced .metric>em{margin-top:auto!important;padding-top:12px!important}';
    document.head.appendChild(style);
  }

  function balanceHomepageHero(){
    var path=(location.pathname||'/').replace(/\/index\.html$/,'/');
    if(path!=='/'&&path!=='/qilylean/home.html'&&path!=='/qilylean/home-live.html')return;
    var grid=document.querySelector('.hero-grid');
    var panel=document.querySelector('.assistant-panel');
    if(!grid||!panel)return;
    if(panel.parentElement!==grid)grid.appendChild(panel);
    document.body.classList.add('qily-home-balanced');
    alignHomepageMetrics();
  }

  loadVisualScale();

  if (!document.getElementById('qilyLeanBrandIdentityScript')) {
    var brandScript = document.createElement('script');
    brandScript.id = 'qilyLeanBrandIdentityScript';
    brandScript.src = '/brand-identity.js?v=20260724-career-v2';
    document.body.appendChild(brandScript);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',balanceHomepageHero,{once:true});
  else balanceHomepageHero();
})();
