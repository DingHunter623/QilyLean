/* QilyLean 轻量外壳一致性 v11｜2026-08-31
 * Translation ownership is intentionally outside this shell.
 * Safe In-Page Translation V7 alone owns language selection and translation behavior.
 * This runtime owns primary-navigation current state and low-cost baseline fallbacks.
 * Dock markup, labels, behavior and pressed state remain owned exclusively by site-dock-share-runtime-v1.js V5.
 */
(function(d,w){
  'use strict';
  if(w.__qilyUiConsistencyV11)return;
  w.__qilyUiConsistencyV11=true;
  w.__qilyUiConsistencyV10=true;
  w.__qilyUiConsistencyV9=true;
  w.__qilyUiConsistencyV8=true;
  w.__qilyUiConsistencyV7=true;
  w.__qilyUiConsistencyV6=true;
  w.__qilyUiConsistencyV5=true;
  w.__qilyUiConsistencyV4=true;
  w.__qilyUiConsistencyV3=true;
  w.__qilyUiConsistencyV2=true;

  var BUILD_ID='20260831-r7-single-responsibility-v11-safe-translation';
  var BUILD_KEY='qily_site_ui_build_v1';
  var ASSETS={
    interactionCss:'/site-interaction-contrast-guard-v1.css?v=20260825-sitewide-contrast-v2',
    interactionJs:'/site-interaction-contrast-guard-v1.js?v=20260825-sitewide-contrast-v2',
    contentCss:'/site-content-contrast-guard-v1.css?v=20260826-sitewide-content-contrast-v6',
    contentJs:'/site-content-contrast-guard-v1.js?v=20260826-sitewide-content-contrast-v6',
    headerCss:'/site-header-axis-v1.css?v=20260829-primary-navigation-safe-scroll-v7'
  };

  d.documentElement.classList.remove('qily-shell-pending','qily-r2-first-paint-pending');

  function normalizedPath(path){
    var value=(path||'/').replace(/\/index\.html$/,'/').replace(/\/{2,}/g,'/');
    if(value.length<=1)return '/';
    if(value.charAt(value.length-1)!=='/'&&!/\/[^/]+\.[^/]+$/.test(value))value+='/';
    return value.replace(/\/+$/,'/');
  }

  function rememberBuild(){
    try{w.localStorage.setItem(BUILD_KEY,BUILD_ID)}catch(error){}
    d.documentElement.setAttribute('data-qily-ui-build',BUILD_ID);
  }

  function ensureStylesheet(id,href){
    var head=d.head||d.documentElement;
    var link=d.getElementById(id)||d.querySelector('link[href^="'+href.split('?')[0]+'"]');
    if(!link){link=d.createElement('link');link.id=id;link.rel='stylesheet';head.appendChild(link);}
    if(link.getAttribute('href')!==href)link.setAttribute('href',href);
  }

  function ensureScript(id,src,marker){
    var head=d.head||d.documentElement;
    var script=d.getElementById(id)||d.querySelector('script[src^="'+src.split('?')[0]+'"]');
    if(!script){script=d.createElement('script');script.id=id;script.src=src;script.async=false;if(marker)script.setAttribute(marker,'true');head.appendChild(script);}
    else if(script.getAttribute('src')!==src)script.setAttribute('src',src);
  }

  function ensureSitewideBaselineAssets(){
    ensureStylesheet('qilyHeaderAxisV1',ASSETS.headerCss);
    ensureStylesheet('qilyInteractionContrastGuardV1Stylesheet',ASSETS.interactionCss);
    ensureStylesheet('qilyContentContrastGuardV1Stylesheet',ASSETS.contentCss);
    if(!w.__qilyInteractionContrastGuardV1)ensureScript('qilyInteractionContrastGuardV1Script',ASSETS.interactionJs,'data-qily-interaction-contrast-fallback');
    if(!w.__qilyContentContrastGuardV1)ensureScript('qilyContentContrastGuardV1Script',ASSETS.contentJs,'data-qily-content-contrast-fallback');
  }

  function primaryModule(path){
    path=normalizedPath(path);
    if(path==='/')return '/';
    if(path.indexOf('/capabilities/')===0)return '/capabilities/';
    if(path.indexOf('/projects/')===0)return '/projects/';
    if(path.indexOf('/improvements/')===0||/\/(?:execution|papers)\.html$/.test(path)||/\/qilylean\/papers\.html$/.test(path))return '/improvements/';
    if(path.indexOf('/knowledge/')===0||path.indexOf('/qilylean/daily/')===0||/^\/(?:knowledge|daily|daily-insights|gbt2828)\.html$/.test(path)||/\/qilylean\/(?:lean-knowledge|daily-insights|lean-tools|execution-loop|reference-|gbt2828)/.test(path))return '/knowledge/';
    if(path.indexOf('/experience/')===0)return '/experience/';
    if(path.indexOf('/links/')===0)return '/links/';
    if(path.indexOf('/cooperation/')===0)return '/cooperation/';
    if(path.indexOf('/trust/')===0||path.indexOf('/certificates/')===0||path.indexOf('/legal/')===0)return '/trust/';
    return '';
  }

  function ensurePrimaryNavCurrentStyles(){
    if(d.getElementById('qilyPrimaryNavCurrentStateV8'))return;
    var style=d.createElement('style');
    style.id='qilyPrimaryNavCurrentStateV8';
    style.textContent='html body header :is(.qily-global-nav,nav.site-nav,nav.nav,nav[aria-label="网站导航"],nav[aria-label="QilyLean核心导视"])>a[href][aria-current="page"][data-qily-primary-current="true"]{color:#fff!important;-webkit-text-fill-color:#fff!important;background:#0f4b5a!important;border:2px solid #ffe39b!important;text-decoration-color:#ffe39b!important;text-decoration-thickness:2.2px!important;box-shadow:0 7px 18px rgba(15,75,90,.24)!important}';
    (d.head||d.documentElement).appendChild(style);
  }

  function primaryRouteForLink(link){
    var target;
    try{target=new URL(link.getAttribute('href')||'',location.origin)}catch(error){return '';}
    if(target.origin!==location.origin)return '';
    var path=normalizedPath(target.pathname);
    return ['/','/capabilities/','/projects/','/improvements/','/knowledge/','/experience/','/links/','/cooperation/','/trust/'].indexOf(path)!==-1?path:'';
  }

  function normalizePrimaryNav(){
    var modulePath=primaryModule(location.pathname);
    ensurePrimaryNavCurrentStyles();
    d.querySelectorAll('.qily-global-nav,nav.site-nav,nav.nav').forEach(function(nav){
      if(!modulePath)return;
      Array.from(nav.children).forEach(function(link){
        if(!link.matches||!link.matches('a[href]'))return;
        var routePath=primaryRouteForLink(link);if(!routePath)return;
        var active=routePath===modulePath;
        if(active){link.setAttribute('aria-current','page');link.setAttribute('data-qily-primary-current','true');}
        else{link.removeAttribute('aria-current');link.removeAttribute('aria-selected');link.removeAttribute('data-current');link.removeAttribute('data-active');link.removeAttribute('data-qily-primary-current');link.classList.remove('active','current','is-active','selected');}
      });
    });
  }

  function removeLegacyPureDdzHomeEntry(){
    if(normalizedPath(location.pathname)!=='/')return;
    var stable=d.getElementById('qilyPureDdzStableEntry');if(stable)stable.remove();
    d.querySelectorAll('[data-qily-pure-ddz-entry="hero"]').forEach(function(link){link.remove();});
  }

  function reconcileFast(){
    ensureSitewideBaselineAssets();
    normalizePrimaryNav();
    removeLegacyPureDdzHomeEntry();
  }

  function boot(){rememberBuild();reconcileFast();}
  d.addEventListener('qily:shell-ready',reconcileFast);
  w.addEventListener('pageshow',reconcileFast,{passive:true});
  w.__qilyUiSingleResponsibilityV11=true;
  w.__qilyUiSingleResponsibilityV10=true;
  w.__qilyUiSingleResponsibilityV9=true;
  w.__qilyUiSingleResponsibilityV8=true;
  w.__qilyUiSingleResponsibilityV7=true;
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(document,window);
