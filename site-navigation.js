/* QilyLean global VI and visual-closure loader v7 */
(function(d,w){
  'use strict';
  if(w.__qilyViRestorationLoaderV7)return;
  w.__qilyViRestorationLoaderV7=true;

  function removeMicrosoftOverrides(){
    [
      'qilyMicrosoftInternationalStylesheet',
      'qilyMicrosoftEnterpriseComponentsStylesheet',
      'qilyMicrosoftNavUnderlineStyle',
      'qilyNavFourSideBorderStyle'
    ].forEach(function(id){
      var node=d.getElementById(id);
      if(node&&node.parentNode)node.parentNode.removeChild(node);
    });
    d.querySelectorAll('script[data-qily-microsoft-international-loader]').forEach(function(node){node.remove();});
    d.documentElement.classList.remove('qily-ms-international');
    if(d.body)d.body.classList.remove('qily-ms-international');
  }

  var styles=[
    {id:'qilyVisualScaleStylesheet',href:'/site-visual-scale-v1.css?v=20260803-home-badge-wrap-v5'},
    {id:'qilyHomePortraitBadgeFixStylesheet',href:'/home-portrait-badge-fix-v1.css?v=20260803-badge-wrap-v2'},
    {id:'qilyGlobalLinkStandardStylesheet',href:'/site-link-standard-v2.css?v=20260803-nav-four-border-v6'},
    {id:'qilyDarkSurfaceContrastStylesheet',href:'/site-dark-surface-contrast-v1.css?v=20260801-dark-surface-v2'},
    {id:'qilyInformationArchitectureStylesheet',href:'/site-information-architecture-v1.css?v=20260802-commercial-focus-v1'},
    {id:'qilyViStandardStylesheet',href:'/site-vi-standard-v1.css?v=20260801-vi-standard-v1'},
    {id:'qilyViContrastRestorationStylesheet',href:'/site-vi-contrast-restoration-v1.css?v=20260803-vi-contrast-hotfix-v1'},
    {id:'qilyVisualClosureStylesheet',href:'/site-visual-closure-v1.css?v=20260804-sitewide-clarity-v2'},
    {id:'qilyBoundaryLinksClosureStylesheet',href:'/site-visual-closure-v2.css?v=20260803-boundary-links-v2'}
  ];

  function ensureStyles(){
    removeMicrosoftOverrides();
    styles.forEach(function(style){
      var current=d.getElementById(style.id);
      if(current){
        if(current.getAttribute('href')!==style.href)current.setAttribute('href',style.href);
        return;
      }
      var link=d.createElement('link');
      link.id=style.id;
      link.rel='stylesheet';
      link.href=style.href;
      (d.head||d.documentElement).appendChild(link);
    });
  }

  function ensureScript(attribute,value,src){
    var current=d.querySelector('script['+attribute+'="'+value+'"]');
    if(current){
      if(current.getAttribute('src')!==src)current.setAttribute('src',src);
      return;
    }
    var script=d.createElement('script');
    script.src=src;
    script.defer=true;
    script.setAttribute(attribute,value);
    (d.head||d.documentElement).appendChild(script);
  }

  function ensureClosureScripts(){
    ensureScript('data-qily-visual-closure-loader','v1','/site-visual-closure-v1.js?v=20260804-sitewide-clarity-v2');
    ensureScript('data-qily-boundary-links-loader','v2','/site-visual-closure-v2.js?v=20260803-boundary-links-v2');
  }

  function promoteRestoration(){
    removeMicrosoftOverrides();
    var parent=d.head||d.documentElement;
    ['qilyViStandardStylesheet','qilyViContrastRestorationStylesheet','qilyVisualClosureStylesheet','qilyBoundaryLinksClosureStylesheet'].forEach(function(id){
      var current=d.getElementById(id);
      if(current&&current.parentNode===parent)parent.appendChild(current);
    });
  }

  ensureStyles();
  ensureClosureScripts();
  promoteRestoration();
  setTimeout(promoteRestoration,120);
  setTimeout(promoteRestoration,600);
  setTimeout(promoteRestoration,1500);
  setTimeout(promoteRestoration,3000);
})(document,window);

/* QilyLean layered navigation build contract v7 */
window.__qilyLayeredNavigationBuildContract=Object.freeze({
  shellAssets:[
    'site-wide-layout-v1.css?v=20260729-fluid-copy-v5',
    'site-typography-v1.css?v=20260729-hierarchy-v4',
    'site-vi-standard-v1.css?v=20260801-vi-standard-v1',
    'site-vi-contrast-restoration-v1.css?v=20260803-vi-contrast-hotfix-v1',
    'site-visual-closure-v1.css?v=20260804-sitewide-clarity-v2',
    'site-visual-closure-v1.js?v=20260804-sitewide-clarity-v2',
    'site-visual-closure-v2.css?v=20260803-boundary-links-v2',
    'site-visual-closure-v2.js?v=20260803-boundary-links-v2'
  ],
  disabledAssets:[
    'site-microsoft-international-v1.css',
    'site-microsoft-enterprise-components-v2.css',
    'site-microsoft-international-v1.js'
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

/* QilyLean global navigation wrapper｜保留原功能并加载可信度、信息架构及视觉闭环 */
(function(d,w){
  'use strict';
  if(w.__qilyNavigationWrapper20260804V13)return;
  w.__qilyNavigationWrapper20260804V13=true;

  function promoteVi(){
    var parent=d.head||d.documentElement;
    ['qilyViStandardStylesheet','qilyViContrastRestorationStylesheet','qilyVisualClosureStylesheet','qilyBoundaryLinksClosureStylesheet'].forEach(function(id){
      var node=d.getElementById(id);
      if(node&&node.parentNode===parent)parent.appendChild(node);
    });
  }

  function ensureStylesheet(id,href){
    var stylesheet=d.getElementById(id);
    if(stylesheet){
      if(stylesheet.getAttribute('href')!==href)stylesheet.setAttribute('href',href);
      return;
    }
    stylesheet=d.createElement('link');
    stylesheet.id=id;
    stylesheet.rel='stylesheet';
    stylesheet.href=href;
    (d.head||d.documentElement).appendChild(stylesheet);
  }

  function ensureScript(attribute,value,src){
    var current=d.querySelector('script['+attribute+'="'+value+'"]');
    if(current){
      if(current.getAttribute('src')!==src)current.setAttribute('src',src);
      return;
    }
    var script=d.createElement('script');
    script.src=src;
    script.defer=true;
    script.setAttribute(attribute,value);
    (d.head||d.documentElement).appendChild(script);
  }

  function loadVisualClosure(){
    ensureStylesheet('qilyVisualClosureStylesheet','/site-visual-closure-v1.css?v=20260804-sitewide-clarity-v2');
    ensureStylesheet('qilyBoundaryLinksClosureStylesheet','/site-visual-closure-v2.css?v=20260803-boundary-links-v2');
    ensureScript('data-qily-visual-closure-loader','v1','/site-visual-closure-v1.js?v=20260804-sitewide-clarity-v2');
    ensureScript('data-qily-boundary-links-loader','v2','/site-visual-closure-v2.js?v=20260803-boundary-links-v2');
  }

  function loadTrustStyles(){
    var current=d.getElementById('qilyBrandTrustStylesheet');
    var href='/site-brand-trust-v1.css?v=20260802-project-rolebar-v3';
    if(current){if(current.getAttribute('href')!==href)current.setAttribute('href',href);return;}
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
    if(!d.querySelector('script[data-qily-information-architecture-loader]')){
      var script=d.createElement('script');
      script.src='/site-information-architecture-v1.js?v=20260802-commercial-focus-v1';
      script.defer=true;
      script.setAttribute('data-qily-information-architecture-loader','v1');
      (d.head||d.documentElement).appendChild(script);
    }
  }

  function loadDailyNavigationStyles(){
    var body=d.body;
    var isDaily=!!(body&&body.classList&&body.classList.contains('daily-single-page'))||!!d.querySelector('.brief-adjacent');
    if(!isDaily)return;
    var current=d.getElementById('qilyDailyNavigationContrastStylesheet');
    var href='/qilylean/daily-navigation-contrast-v1.css?v=20260802-contrast-v1';
    if(current){if(current.getAttribute('href')!==href)current.setAttribute('href',href);return;}
    var link=d.createElement('link');
    link.id='qilyDailyNavigationContrastStylesheet';
    link.rel='stylesheet';
    link.href=href;
    (d.head||d.documentElement).appendChild(link);
  }

  function loadDailyDirectoryStyles(){
    if(!d.querySelector('.daily-index-heading'))return;
    var current=d.getElementById('qilyDailyDirectoryActionsStylesheet');
    var href='/qilylean/daily-directory-actions-v1.css?v=20260802-single-line-v1';
    if(current){if(current.getAttribute('href')!==href)current.setAttribute('href',href);return;}
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
    loadVisualClosure();
    if(!d.querySelector('script[data-qily-brand-trust-loader]')){
      var enhancer=d.createElement('script');
      enhancer.src='/site-brand-trust-v1.js?v=20260802-project-rolebar-v3';
      enhancer.defer=true;
      enhancer.setAttribute('data-qily-brand-trust-loader','v3');
      (d.head||d.documentElement).appendChild(enhancer);
    }
    promoteVi();
    setTimeout(promoteVi,180);
    setTimeout(promoteVi,900);
  }

  function appendLegacy(){
    if(d.querySelector('script[data-qily-navigation-legacy]')){loadEnhancer();return;}
    var legacy=d.createElement('script');
    legacy.src='/site-navigation-legacy-20260802.js?v=20260805-pricing-role-boundary-v1';
    legacy.async=false;
    legacy.setAttribute('data-qily-navigation-legacy','parent-route-v3');
    legacy.onload=loadEnhancer;
    legacy.onerror=loadEnhancer;
    (d.head||d.documentElement).appendChild(legacy);
  }

  function loadParentNavigation(){
    if(w.__qilyParentNavigationV3){appendLegacy();return;}
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
  loadVisualClosure();
  loadParentNavigation();
})(document,window);
