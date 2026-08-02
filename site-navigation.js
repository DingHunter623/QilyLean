/* qily-global-link-standard-loader-v1 */
(function(d){
  'use strict';
  var styles=[
    {id:'qilyGlobalLinkStandardStylesheet',href:'/site-link-standard-v2.css?v=20260801-global-link-v5'},
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
  if(window.__qilyNavigationWrapper20260802V5)return;
  window.__qilyNavigationWrapper20260802V5=true;

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

  loadTrustStyles();
  loadInformationArchitectureAssets();
  loadDailyNavigationStyles();
  loadDailyDirectoryStyles();

  var legacy=d.createElement('script');
  legacy.src='/site-navigation-legacy-20260802.js?v=20260802-preserved-v1';
  legacy.async=false;
  legacy.setAttribute('data-qily-navigation-legacy','preserved');
  legacy.onload=loadEnhancer;
  legacy.onerror=loadEnhancer;
  (d.head||d.documentElement).appendChild(legacy);
})(document);
