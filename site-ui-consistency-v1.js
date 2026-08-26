/* QilyLean 轻量父级导航与外壳一致性 v4.1｜2026-08-26
 * 静态 HTML 首帧优先；公共运行时仅负责导航、Dock 与全站公共增强兜底。
 * 中文静态 HTML 是权威源和默认展示；翻译仅由访客主动选择后在当前 QilyLean 页面内执行。
 */
(function(d,w){
  'use strict';
  if(w.__qilyUiConsistencyV4)return;
  w.__qilyUiConsistencyV4=true;
  w.__qilyUiConsistencyV3=true;
  w.__qilyUiConsistencyV2=true;

  var BUILD_ID='20260826-translation-fast-reliable-v3';
  var BUILD_KEY='qily_site_ui_build_v1';
  var ASSETS={
    languageCss:'/site-global-language-v1.css?v=20260825-public-translation-shell-v1',
    safeRuntime:'/site-translation-safe-runtime-v1.js?v=20260826-translation-fast-reliable-v3',
    publicCss:'/site-translation-public-ui-v1.css?v=20260825-mobile-navigation-recovery-v7',
    publicJs:'/site-translation-public-ui-v1.js?v=20260825-public-language-picker-v6',
    progressCss:'/site-translation-progress-v1.css?v=20260825-bilingual-progress-v3',
    progressJs:'/site-translation-progress-v1.js?v=20260826-translation-fast-reliable-v3',
    interactionCss:'/site-interaction-contrast-guard-v1.css?v=20260825-sitewide-contrast-v2',
    interactionJs:'/site-interaction-contrast-guard-v1.js?v=20260825-sitewide-contrast-v2',
    contentCss:'/site-content-contrast-guard-v1.css?v=20260826-sitewide-content-contrast-v6',
    contentJs:'/site-content-contrast-guard-v1.js?v=20260826-sitewide-content-contrast-v6',
    headerCss:'/site-header-axis-v1.css?v=20260825-mobile-navigation-recovery-v3'
  };
  d.documentElement.classList.remove('qily-shell-pending','qily-r2-first-paint-pending');

  function normalizedPath(path){
    var value=(path||'/').replace(/\/index\.html$/,'/').replace(/\/{2,}/g,'/');
    if(value.length<=1)return '/';
    if(value.charAt(value.length-1)!=='/'&&!/\/[^/]+\.[^/]+$/.test(value))value+='/';
    return value.replace(/\/+$/,'/');
  }
  function configuredParent(){var body=d.body,value=(body&&body.getAttribute('data-parent-route'))||'';if(value)return value;var link=d.querySelector('link[rel="up"][href]');return link?link.getAttribute('href')||'':''}
  function parentRoute(path){
    path=normalizedPath(path);var configured=configuredParent();if(configured)return configured;if(path==='/')return '/';
    if(/^\/legal\/times26001\/(?:privacy|terms)\/$/.test(path))return '/tools/times26001/';if(path==='/app-support/')return '/tools/times26001/';if(path.indexOf('/tools/')===0)return '/';
    if(/^\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html$/.test(path))return '/qilylean/daily-insights.html';if(path==='/qilylean/daily-insights.html')return '/knowledge/';
    if(path.indexOf('/projects/lean-improvement-evidence/')===0&&path!=='/projects/lean-improvement-evidence/')return '/projects/lean-improvement-evidence/';
    if(/^\/qilylean\/(?:lean-knowledge|lean-tools|execution-loop|gbt2828|production-operations-organization|reference-[^/]+)\.html$/.test(path))return '/knowledge/';
    var roots=['projects','improvements','capabilities','experience','knowledge','moments','cooperation','links','trust'];for(var i=0;i<roots.length;i++){var root='/'+roots[i]+'/';if(path.indexOf(root)===0&&path!==root)return root}
    if(path==='/ai.html')return '/';for(var j=0;j<roots.length;j++)if(path==='/'+roots[j]+'/')return '/';return '/';
  }
  function navigateParent(){var target=parentRoute(location.pathname);if(normalizedPath(target)===normalizedPath(location.pathname))target='/';location.assign(target)}
  function rememberBuild(){try{w.localStorage.setItem(BUILD_KEY,BUILD_ID)}catch(error){}d.documentElement.setAttribute('data-qily-ui-build',BUILD_ID)}
  function sourceMode(){return (d.documentElement.getAttribute('data-qily-language')||'zh-CN')==='zh-CN'}

  function preemptRetiredTranslation(){
    w.__qilyGlobalTranslationDualRouteV2=true;
    w.__qilyGoogleTranslateOnDemandV1=true;
    w.__qilyGlobalLanguageV31=true;
    w.__qilyGlobalLanguageV3=true;
    w.__qilyGlobalLanguageV2=true;
    w.__qilyGlobalLanguageV1=true;
    d.querySelectorAll('script[src*="/site-global-language-v3.js"],script[data-qily-web-translate-direct],script[data-qily-google-translate-direct],script[data-qily-global-language-direct]').forEach(function(node){node.remove()});
  }
  function ensureStylesheet(id,href){
    var head=d.head||d.documentElement;
    var link=d.getElementById(id)||d.querySelector('link[href^="'+href.split('?')[0]+'"]');
    if(!link){link=d.createElement('link');link.id=id;link.rel='stylesheet';head.appendChild(link)}
    if(link.getAttribute('href')!==href)link.setAttribute('href',href);
  }
  function ensureScript(id,src,marker){
    var head=d.head||d.documentElement;
    var script=d.getElementById(id)||d.querySelector('script[src^="'+src.split('?')[0]+'"]');
    if(!script){script=d.createElement('script');script.id=id;script.src=src;script.async=false;if(marker)script.setAttribute(marker,'true');head.appendChild(script)}
    else if(script.getAttribute('src')!==src)script.setAttribute('src',src);
  }
  function ensureSitewideBaselineAssets(){
    preemptRetiredTranslation();
    ensureStylesheet('qilyGlobalLanguageV1Stylesheet',ASSETS.languageCss);
    ensureStylesheet('qilyHeaderAxisV1',ASSETS.headerCss);
    ensureStylesheet('qilyTranslationPublicUiV1Stylesheet',ASSETS.publicCss);
    ensureStylesheet('qilyTranslationProgressV1Stylesheet',ASSETS.progressCss);
    ensureStylesheet('qilyInteractionContrastGuardV1Stylesheet',ASSETS.interactionCss);
    ensureStylesheet('qilyContentContrastGuardV1Stylesheet',ASSETS.contentCss);
    if(!w.__qilyTranslationSafeInPageV1)ensureScript('qilyTranslationSafeInPageV1Script',ASSETS.safeRuntime,'data-qily-translation-safe-fallback');
    if(!w.__qilyTranslationPublicUiV1)ensureScript('qilyTranslationPublicUiV1Script',ASSETS.publicJs,'data-qily-translation-public-ui-fallback');
    if(!w.__qilyTranslationProgressNoticeV1)ensureScript('qilyTranslationProgressV1Script',ASSETS.progressJs,'data-qily-translation-progress-fallback');
    if(!w.__qilyInteractionContrastGuardV1)ensureScript('qilyInteractionContrastGuardV1Script',ASSETS.interactionJs,'data-qily-interaction-contrast-fallback');
    if(!w.__qilyContentContrastGuardV1)ensureScript('qilyContentContrastGuardV1Script',ASSETS.contentJs,'data-qily-content-contrast-fallback');
  }

  var pointer=null,handledAt=0;
  d.addEventListener('pointerdown',function(event){var button=event.target&&event.target.closest?event.target.closest('[data-action="back"]'):null;if(!button)return;pointer={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false}},true);
  d.addEventListener('pointermove',function(event){if(!pointer||event.pointerId!==pointer.id)return;if(Math.abs(event.clientX-pointer.x)>8||Math.abs(event.clientY-pointer.y)>8)pointer.moved=true},true);
  d.addEventListener('pointerup',function(event){if(!pointer||event.pointerId!==pointer.id)return;var go=!pointer.moved;pointer=null;if(!go)return;handledAt=Date.now();event.preventDefault();event.stopImmediatePropagation();navigateParent()},true);
  d.addEventListener('pointercancel',function(event){if(pointer&&event.pointerId===pointer.id)pointer=null},true);
  d.addEventListener('click',function(event){var button=event.target&&event.target.closest?event.target.closest('[data-action="back"]'):null;if(!button)return;event.preventDefault();event.stopImmediatePropagation();if(Date.now()-handledAt<600)return;navigateParent()},true);

  function primaryModule(path){path=normalizedPath(path);if(path==='/')return '/';if(path.indexOf('/capabilities/')===0)return '/capabilities/';if(path.indexOf('/projects/')===0)return '/projects/';if(path.indexOf('/improvements/')===0||/\/(?:execution|papers)\.html$/.test(path)||/\/qilylean\/papers\.html$/.test(path))return '/improvements/';if(path.indexOf('/knowledge/')===0||path.indexOf('/qilylean/daily/')===0||/^\/(?:knowledge|daily|daily-insights|gbt2828)\.html$/.test(path)||/\/qilylean\/(?:lean-knowledge|daily-insights|lean-tools|execution-loop|reference-|gbt2828)/.test(path))return '/knowledge/';if(path.indexOf('/experience/')===0)return '/experience/';if(path.indexOf('/links/')===0)return '/links/';if(path.indexOf('/cooperation/')===0)return '/cooperation/';if(path.indexOf('/trust/')===0||path.indexOf('/certificates/')===0||path.indexOf('/legal/')===0)return '/trust/';return ''}
  function ensurePrimaryNavCurrentStyles(){if(d.getElementById('qilyPrimaryNavCurrentStateV7'))return;var style=d.createElement('style');style.id='qilyPrimaryNavCurrentStateV7';style.textContent='html body header :is(.qily-global-nav,nav.site-nav,nav.nav,nav[aria-label="网站导航"],nav[aria-label="QilyLean核心导视"])>a[href][aria-current="page"][data-qily-primary-current="true"]{color:#fff!important;-webkit-text-fill-color:#fff!important;background:#0f4b5a!important;border:2px solid #ffe39b!important;text-decoration-color:#ffe39b!important;text-decoration-thickness:2.2px!important;box-shadow:0 7px 18px rgba(15,75,90,.24)!important}';(d.head||d.documentElement).appendChild(style)}
  function primaryRouteForLink(link){var target;try{target=new URL(link.getAttribute('href')||'',location.origin)}catch(error){return ''}if(target.origin!==location.origin)return '';var path=normalizedPath(target.pathname);return ['/','/capabilities/','/projects/','/improvements/','/knowledge/','/experience/','/links/','/cooperation/','/trust/'].indexOf(path)!==-1?path:''}
  function normalizePrimaryNav(){var path=normalizedPath(location.pathname),modulePath=primaryModule(path);ensurePrimaryNavCurrentStyles();d.querySelectorAll('.qily-global-nav,nav.site-nav,nav.nav').forEach(function(nav){if(!modulePath)return;Array.from(nav.children).forEach(function(link){if(!link.matches||!link.matches('a[href]'))return;var routePath=primaryRouteForLink(link);if(!routePath)return;var active=routePath===modulePath;if(active){link.setAttribute('aria-current','page');link.setAttribute('data-qily-primary-current','true')}else{link.removeAttribute('aria-current');link.removeAttribute('aria-selected');link.removeAttribute('data-current');link.removeAttribute('data-active');link.removeAttribute('data-qily-primary-current');link.classList.remove('active','current','is-active','selected')}})})}
  function normalizeDock(){var dock=d.getElementById('floatDock');if(!dock)return false;var back=dock.querySelector('[data-action="back"]');if(back){back.setAttribute('data-parent-route',parentRoute(location.pathname));if(sourceMode()){back.setAttribute('title','回到当前页面所属的上一级有效页面');back.setAttribute('aria-label','回上一层')}}dock.querySelectorAll('[data-action="share"]').forEach(function(button){button.remove()});return true}
  function removeLegacyPureDdzHomeEntry(){if(normalizedPath(location.pathname)!=='/')return;var stable=d.getElementById('qilyPureDdzStableEntry');if(stable)stable.remove();d.querySelectorAll('[data-qily-pure-ddz-entry="hero"]').forEach(function(link){link.remove()})}
  function reconcileFast(){ensureSitewideBaselineAssets();normalizePrimaryNav();normalizeDock();removeLegacyPureDdzHomeEntry()}
  function boot(){rememberBuild();ensureSitewideBaselineAssets();reconcileFast()}
  d.addEventListener('qily:shell-ready',reconcileFast);d.addEventListener('qily:language-change',reconcileFast);w.addEventListener('pageshow',reconcileFast);
  w.__qilyParentNavigationV3=true;w.__qilyDockOrderContract=Object.freeze({order:['home','top','back','search','current','contact'],version:BUILD_ID});
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(document,window);
