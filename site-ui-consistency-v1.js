/* QilyLean 轻量父级导航与外壳一致性 v3.9｜2026-08-25
 * 性能原则：静态HTML首帧即正确；运行时只校正导航、悬浮栏与全站公共增强。
 * 翻译原则：中文静态HTML既是权威源也是默认展示；翻译仅由访客主动选择后启动，大陆优先国内线路，海外优先 Google。
 */
(function(d,w){
  'use strict';
  if(w.__qilyUiConsistencyV3)return;
  w.__qilyUiConsistencyV3=true;
  w.__qilyUiConsistencyV2=true;

  var BUILD_ID='20260825-global-translation-dual-route-v2';
  var BUILD_KEY='qily_site_ui_build_v1';
  var LANGUAGE_CSS='/site-global-language-v1.css?v=20260825-global-translation-dual-route-v2';
  var LANGUAGE_JS='/site-global-language-v3.js?v=20260825-global-translation-dual-route-v2';
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

  function ensureGlobalLanguageAssets(){
    var head=d.head||d.documentElement;
    var link=d.getElementById('qilyGlobalLanguageV1Stylesheet')||d.querySelector('link[href*="/site-global-language-v1.css"]');
    if(!link){link=d.createElement('link');link.id='qilyGlobalLanguageV1Stylesheet';link.rel='stylesheet';head.appendChild(link)}
    if(link.getAttribute('href')!==LANGUAGE_CSS)link.setAttribute('href',LANGUAGE_CSS);
    if(w.__qilyGlobalTranslationDualRouteV2)return;
    var runtime=d.getElementById('qilyGlobalTranslationDualRouteV2Script')||d.querySelector('script[src*="/site-global-language-v3.js?v=20260825-global-translation-dual-route-v2"]');
    if(!runtime){runtime=d.createElement('script');runtime.id='qilyGlobalTranslationDualRouteV2Script';runtime.src=LANGUAGE_JS;runtime.async=false;runtime.setAttribute('data-qily-web-translate','dual-route-v2');head.appendChild(runtime)}
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
  function removeLegacyPureDdzHomeEntry(){if(normalizedPath(location.pathname)!=='/')return;d.getElementById('qilyPureDdzStableEntry')?.remove();d.querySelectorAll('[data-qily-pure-ddz-entry="hero"]').forEach(function(link){link.remove()})}
  function reconcileFast(){ensureGlobalLanguageAssets();normalizePrimaryNav();normalizeDock();removeLegacyPureDdzHomeEntry()}
  function boot(){rememberBuild();ensureGlobalLanguageAssets();reconcileFast()}
  d.addEventListener('qily:shell-ready',reconcileFast);d.addEventListener('qily:language-change',reconcileFast);w.addEventListener('pageshow',reconcileFast);
  w.__qilyParentNavigationV3=true;w.__qilyDockOrderContract=Object.freeze({order:['home','top','back','search','current','contact'],version:'20260825-global-translation-dual-route-v2'});
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(document,window);
