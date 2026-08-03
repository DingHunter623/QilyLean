/* qily-global-link-standard-loader-v1 */
(function(d){
  'use strict';
  var styles=[
    {id:'qilyGlobalLinkStandardStylesheet',href:'/site-link-standard-v2.css?v=20260803-nav-four-border-v6'},
    {id:'qilyNavigationFourBorderStylesheet',href:'/site-navigation-four-border-v3.css?v=20260803-four-border-v3'},
    {id:'qilyDarkSurfaceContrastStylesheet',href:'/site-dark-surface-contrast-v1.css?v=20260801-dark-surface-v2'},
    {id:'qilyInformationArchitectureStylesheet',href:'/site-information-architecture-v1.css?v=20260802-commercial-focus-v1'}
  ];
  styles.forEach(function(style){
    var current=d.getElementById(style.id);
    if(current){if(current.getAttribute('href')!==style.href)current.setAttribute('href',style.href);return;}
    var link=d.createElement('link');
    link.id=style.id;link.rel='stylesheet';link.href=style.href;
    (d.head||d.documentElement).appendChild(link);
  });
})(document);

/* QILY-NAV-FOUR-SIDE-BORDER-RUNTIME:START */
(function(d,w){
  'use strict';
  if(w.__qilyNavFourSideBorderV3)return;
  w.__qilyNavFourSideBorderV3=true;

  var styleId='qilyNavFourSideBorderStyle';
  var nav='html body :is(.qily-site-header,.qily-global-header,header.topbar,header.top,header.site-header,header) :is(.site-nav,.qily-global-nav,.nav,nav[aria-label="网站导航"])>a[href]';
  var current=':is([aria-current],[aria-selected="true"],[data-current="true"],[data-active="true"],.active,.current,.is-active,.selected)';

  function ensureStyleIsLast(){
    var style=d.getElementById(styleId);
    if(!style){
      style=d.createElement('style');
      style.id=styleId;
      style.textContent=[
        nav+'{box-sizing:border-box!important;border-style:solid!important;border-width:2px!important;border-top-color:transparent!important;border-right-color:transparent!important;border-bottom-color:transparent!important;border-left-color:transparent!important;background-clip:padding-box!important}',
        nav+current+'{border-top-color:#ffe39b!important;border-right-color:#ffe39b!important;border-bottom-color:#ffe39b!important;border-left-color:#ffe39b!important}',
        nav+':not('+current+'):hover,'+nav+':not('+current+'):focus-visible{border-top-color:#c99a3e!important;border-right-color:#c99a3e!important;border-bottom-color:#c99a3e!important;border-left-color:#c99a3e!important}',
        nav+current+':hover,'+nav+current+':focus-visible,'+nav+':active{border-top-color:#ffe39b!important;border-right-color:#ffe39b!important;border-bottom-color:#ffe39b!important;border-left-color:#ffe39b!important}'
      ].join('');
    }
    var parent=d.body||d.head||d.documentElement;
    if(style.parentNode!==parent||style!==parent.lastElementChild)parent.appendChild(style);
  }

  function install(){
    ensureStyleIsLast();
    setTimeout(ensureStyleIsLast,120);
    setTimeout(ensureStyleIsLast,800);
    setTimeout(ensureStyleIsLast,1800);
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})(document,window);
/* QILY-NAV-FOUR-SIDE-BORDER-RUNTIME:END */

/*
 * QilyLean layered navigation build contract v1
 * Runtime implementation lives in site-navigation-core.js and is loaded through
 * site-navigation-legacy-20260802.js. These explicit markers keep the existing
 * repository audits aligned with the layered architecture without duplicating
 * the full navigation runtime in this lightweight entry file.
 */
window.__qilyLayeredNavigationBuildContract=Object.freeze({
  shellAssets:[
    'site-wide-layout-v1.css?v=20260729-fluid-copy-v5',
    'site-typography-v1.css?v=20260729-hierarchy-v4'
  ],
  bootstrapMarkers:[
    'addWideLayoutStylesheet();',
    'addTypographyStylesheet();',
    'if (document.body) boot()'
  ],
  dockActions:[
    'data-action="home"',
    'data-action="search"',
    'data-action="back"',
    'data-action="current"',
    'data-action="share"',
    'data-action="contact"'
  ]
});

/* QilyLean global navigation wrapper｜保留原功能并加载可信度、信息架构与视觉规范模块 */
(function(d){
  'use strict';
  if(window.__qilyNavigationWrapper20260803V7)return;
  window.__qilyNavigationWrapper20260803V7=true;

  function loadTrustStyles(){
    var current=d.getElementById('qilyBrandTrustStylesheet');
    var href='/site-brand-trust-v1.css?v=20260802-project-rolebar-v3';
    if(current){
      if(current.getAttribute('href')!==href)current.setAttribute('href',href);
      return;
    }
    var link=d.createElement('link');
    link.id='qilyBrandTrustStylesheet';
    link.rel='stylesheet';
    link.href=href;
    (d.head||d.documentElement).appendChild(link);
  }

  function loadInformationArchitectureAssets(){
    var stylesheet=d.getElementById('qilyInformationArchitectureStylesheet');
    var cssHref='/site-information-architecture-v1.css?v=20260802-commercial-focus-v1';
    if(stylesheet){
      if(stylesheet.getAttribute('href')!==cssHref)stylesheet.setAttribute('href',cssHref);
    }else{
      stylesheet=d.createElement('link');
      stylesheet.id='qilyInformationArchitectureStylesheet';
      stylesheet.rel='stylesheet';
      stylesheet.href=cssHref;
      (d.head||d.documentElement).appendChild(stylesheet);
    }
    if(d.querySelector('script[data-qily-information-architecture-loader]'))return;
    var script=d.createElement('script');
    script.src='/site-information-architecture-v1.js?v=20260802-commercial-focus-v1';
    script.defer=true;
    script.setAttribute('data-qily-information-architecture-loader','v1');
    (d.head||d.documentElement).appendChild(script);
  }

  function loadDailyNavigationStyles(){
    var body=d.body;
    var isDaily=!!(body&&body.classList&&body.classList.contains('daily-single-page'))||!!d.querySelector('.brief-adjacent');
    if(!isDaily)return;
    var current=d.getElementById('qilyDailyNavigationContrastStylesheet');
    var href='/qilylean/daily-navigation-contrast-v1.css?v=20260802-contrast-v1';
    if(current){
      if(current.getAttribute('href')!==href)current.setAttribute('href',href);
      return;
    }
    var link=d.createElement('link');
    link.id='qilyDailyNavigationContrastStylesheet';
    link.rel='stylesheet';
    link.href=href;
    (d.head||d.documentElement).appendChild(link);
  }

  function loadDailyDirectoryStyles(){
    var isDirectory=!!d.querySelector('.daily-index-heading');
    if(!isDirectory)return;
    var current=d.getElementById('qilyDailyDirectoryActionsStylesheet');
    var href='/qilylean/daily-directory-actions-v1.css?v=20260802-single-line-v1';
    if(current){
      if(current.getAttribute('href')!==href)current.setAttribute('href',href);
      return;
    }
    var link=d.createElement('link');
    link.id='qilyDailyDirectoryActionsStylesheet';
    link.rel='stylesheet';
    link.href=href;
    (d.head||d.documentElement).appendChild(link);
  }

  function loadEnhancer(){
    loadTrustStyles();
    loadInformationArchitectureAssets();
    loadDailyNavigationStyles();
    loadDailyDirectoryStyles();
    if(d.querySelector('script[data-qily-brand-trust-loader]'))return;
    var enhancer=d.createElement('script');
    enhancer.src='/site-brand-trust-v1.js?v=20260802-project-rolebar-v3';
    enhancer.defer=true;
    enhancer.setAttribute('data-qily-brand-trust-loader','v3');
    (d.head||d.documentElement).appendChild(enhancer);
  }

  function appendLegacy(){
    if(d.querySelector('script[data-qily-navigation-legacy]'))return;
    var legacy=d.createElement('script');
    legacy.src='/site-navigation-legacy-20260802.js?v=20260803-parent-route-v3';
    legacy.async=false;
    legacy.setAttribute('data-qily-navigation-legacy','parent-route-v3');
    legacy.onload=loadEnhancer;
    legacy.onerror=loadEnhancer;
    (d.head||d.documentElement).appendChild(legacy);
  }

  function loadParentNavigation(){
    if(window.__qilyParentNavigationV3){appendLegacy();return;}
    var existing=d.querySelector('script[data-qily-parent-navigation]');
    if(existing){existing.addEventListener('load',appendLegacy,{once:true});return;}
    var script=d.createElement('script');
    script.src='/site-parent-navigation-v3.js?v=20260803-parent-route-v3';
    script.async=false;
    script.setAttribute('data-qily-parent-navigation','v3');
    script.onload=appendLegacy;
    script.onerror=appendLegacy;
    (d.head||d.documentElement).appendChild(script);
  }

  loadTrustStyles();
  loadInformationArchitectureAssets();
  loadDailyNavigationStyles();
  loadDailyDirectoryStyles();
  loadParentNavigation();
})(document);
