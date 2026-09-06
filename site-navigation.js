/* QilyLean navigation runtime v45｜2026-08-28
 * R7 single-responsibility navigation closure:
 * 1) Chinese remains the authoritative static navigation source;
 * 2) Header / Logo / primary navigation / translation utility share the governed 1560px content axis;
 * 3) this runtime owns primary navigation, search-authority links and capability support only;
 * 4) Dock behavior/labels/position are owned exclusively by site-dock-share-runtime-v1.js V5;
 * 5) no MutationObserver or pointer listener may continuously rewrite Dock state here.
 */
(function(d,w){
  'use strict';
  if(w.__qilyStaticFirstNavigationV45)return;
  w.__qilyStaticFirstNavigationV45=true;
  w.__qilyStaticFirstNavigationV44=true;
  w.__qilyStaticFirstNavigationV43=true;
  w.__qilyStaticFirstNavigationV42=true;

  var CORE_SRC='/site-navigation-core.js?v=20260906-primary-first-paint-core-v31';
  var LEGACY_SRC='/site-navigation-legacy-20260802.js?v=20260906-primary-first-paint-legacy-v24';
  var CONSISTENCY_SRC='/site-ui-consistency-v1.js?v=20260830-r7-single-responsibility-v8-stable-picker';
  var SEARCH_RUNTIME_SRC='/site-search.js?v=20260826-search-navigation-v2';
  var INTEGRITY_SRC='/site-integrity-hotfix-v1.js?v=20260826-public-integrity-v2';
  var R6_SEARCH_VISUAL_SRC='/site-r6-search-terminology-visual-v1.js?v=20260826-r6-search-terminology-visual-v1';
  var CONTINUITY_HREF='/site-interaction-continuity-v1.css?v=20260818-visual-governance-v3';
  var GOVERNANCE_HREF='/site-visual-governance-v2.css?v=20260824-readable-floor-plus2-v7';
  var CONTENT_AXIS_HREF='/site-content-axis-v1.css?v=20260822-sitewide-visual-axis-v5';
  var HEADER_AXIS_HREF='/site-header-axis-v1.css?v=20260829-primary-navigation-safe-scroll-v7';
  var HOME_HERO_HREF='/site-home-hero-tune-v1.css?v=20260819-home-hero-align-v3';
  var DOCK_HREF='/site-floating-dock-standard-v1.css?v=20260819-dock-snapback-v3';
  var GEOMETRY_SRC='/site-visual-geometry-v1.js?v=20260819-arrow-geometry-v4';
  var CAPABILITY_DDZ_HREF='/pure-ddz-capability-visual-v2.css?v=20260824-red-heart-ace-v8';
  var APP_SHARE_SRC='/app-download-share-v1.js?v=20260824-capability-home-actions-v2';
  var LUCKY_DATA_CARD_SRC='/lucky-data-capability-card-v1.js?v=20260906-lucky-data-v1';
  var LEAN_AUTHORITY_PATH='/lean-production/';

  function currentPath(){return (w.location.pathname||'/').replace(/\/index\.html$/,'/');}
  function activeLanguage(){return (d.documentElement.getAttribute('data-qily-language')||'zh-CN').trim();}
  function isChineseSourceMode(){return activeLanguage()==='zh-CN';}
  function ensureStylesheet(id,href,selector){
    var link=d.getElementById(id)||(selector?d.querySelector(selector):null);
    if(!link){link=d.createElement('link');link.id=id;link.rel='stylesheet';(d.head||d.documentElement).appendChild(link);}
    if(link.getAttribute('href')!==href)link.setAttribute('href',href);
    return link;
  }
  function loadScript(id,src,onload){
    var existing=d.getElementById(id)||d.querySelector('script[src^="'+src.split('?')[0]+'"]');
    if(existing){if(existing.getAttribute('src')!==src)existing.setAttribute('src',src);if(onload){if(existing.dataset.qilyLoaded==='true')onload();else existing.addEventListener('load',onload,{once:true});}return existing;}
    var script=d.createElement('script');script.id=id;script.src=src;script.async=false;script.addEventListener('load',function(){script.dataset.qilyLoaded='true';if(onload)onload();},{once:true});(d.head||d.documentElement).appendChild(script);return script;
  }

  function installAssets(){
    ensureStylesheet('qilyInteractionContinuityV3',CONTINUITY_HREF,'link[href*="/site-interaction-continuity-v1.css"]');
    ensureStylesheet('qilyVisualGovernanceV1',GOVERNANCE_HREF,'link[href*="/site-visual-governance-v1.css"],link[href*="/site-visual-governance-v2.css"]');
    ensureStylesheet('qilyContentAxisV1',CONTENT_AXIS_HREF,'link[href*="/site-content-axis-v1.css"]');
    ensureStylesheet('qilyHeaderAxisV1',HEADER_AXIS_HREF,'link[href*="/site-header-axis-v1.css"]');
    ensureStylesheet('qilyFloatingDockStandardV1',DOCK_HREF,'link[href*="/site-floating-dock-standard-v1.css"]');
    var p=currentPath();
    if(p==='/')ensureStylesheet('qilyHomeHeroTuneV1',HOME_HERO_HREF,'link[href*="/site-home-hero-tune-v1.css"]');
    if(p==='/capabilities/')ensureStylesheet('qilyPureDdzCapabilityVisualV2',CAPABILITY_DDZ_HREF,'link[href*="/pure-ddz-capability-visual-v2.css"]');
    if(!w.__qilyVisualGeometryV4&&!d.querySelector('script[src*="/site-visual-geometry-v1.js?v=20260819-arrow-geometry-v4"]')){
      var geometry=d.createElement('script');geometry.src=GEOMETRY_SRC;geometry.async=false;geometry.setAttribute('data-qily-visual-geometry','v4');(d.head||d.documentElement).appendChild(geometry);
    }
  }

  function ensureSearchAuthorityNavigation(){
    var path=currentPath(),active=path===LEAN_AUTHORITY_PATH||path.indexOf(LEAN_AUTHORITY_PATH)===0,sourceMode=isChineseSourceMode(),changed=false;
    d.querySelectorAll('.qily-global-nav,header nav.site-nav,header nav.nav,header nav[aria-label="网站导航"],header nav[aria-label="QilyLean核心导视"],header nav').forEach(function(nav){
      var link=nav.querySelector('a[href="/lean-production/"],a[href="/lean-production/"]');
      if(!link){link=d.createElement('a');link.href=LEAN_AUTHORITY_PATH;link.textContent='精益生产';link.setAttribute('data-qily-search-authority','lean-production');link.setAttribute('aria-label','精益生产专题');var improvement=nav.querySelector('a[href="/improvements/"],a[href="/improvements/"]');if(improvement&&improvement.nextSibling)nav.insertBefore(link,improvement.nextSibling);else nav.appendChild(link);changed=true;}
      if(sourceMode&&(link.textContent||'').trim()!=='精益生产'){link.textContent='精益生产';changed=true;}
      link.setAttribute('data-qily-search-authority','lean-production');
      if(sourceMode)link.setAttribute('aria-label','精益生产专题');
      if(active)link.setAttribute('aria-current','page');else if(link.getAttribute('aria-current')==='page')link.removeAttribute('aria-current');
    });
    return changed;
  }

  function normalizeResourceCollaborationLabel(){
    var changed=false,sourceMode=isChineseSourceMode();
    d.querySelectorAll('header nav a[href="/links/"],header nav a[href="/links/index.html"],.qily-global-nav a[href="/links/"],.qily-global-nav a[href="/links/index.html"]').forEach(function(link){
      if(sourceMode&&(link.textContent||'').trim()!=='资源协同'){link.textContent='资源协同';changed=true;}
      if(sourceMode)link.setAttribute('aria-label','资源协同');
    });
    return changed;
  }

  function reconcileNavigation(){ensureSearchAuthorityNavigation();normalizeResourceCollaborationLabel();}
  function needsLegacyRuntime(){var p=currentPath();return p.indexOf('/cooperation/')===0||p.indexOf('/links/')===0;}
  function installCapabilitySelfHeal(){
    if(currentPath()!=='/capabilities/')return;
    ensureStylesheet('qilyPureDdzCapabilityVisualV2',CAPABILITY_DDZ_HREF,'link[href*="/pure-ddz-capability-visual-v2.css"]');
    if(!d.querySelector('script[src*="/app-download-share-v1.js?v=20260824-capability-home-actions-v2"]'))loadScript('qilyAppDownloadShareRuntime',APP_SHARE_SRC);
    if(!d.querySelector('script[src*="/lucky-data-capability-card-v1.js"]'))loadScript('qilyLuckyDataCapabilityCardV1',LUCKY_DATA_CARD_SRC);
  }
  function loadRuntime(){
    loadScript('qilySiteSearchRuntimeV2',SEARCH_RUNTIME_SRC);
    loadScript('qilyR6SearchTerminologyVisualV1',R6_SEARCH_VISUAL_SRC);
    loadScript('qilyPublicIntegrityHotfixV1',INTEGRITY_SRC);
    installCapabilitySelfHeal();
    loadScript('qilySiteNavigationCoreScript',CORE_SRC,function(){
      reconcileNavigation();installCapabilitySelfHeal();
      if(needsLegacyRuntime())loadScript('qilySiteNavigationLegacyScriptV32',LEGACY_SRC,reconcileNavigation);
      if(!w.__qilyUiConsistencyV8&&!d.querySelector('script[src*="/site-ui-consistency-v1.js"]'))loadScript('qilyUiConsistencyRuntimeV34',CONSISTENCY_SRC,reconcileNavigation);
    });
  }

  installAssets();
  reconcileNavigation();
  loadRuntime();
  d.addEventListener('qily:shell-ready',reconcileNavigation);
  d.addEventListener('qily:language-change',reconcileNavigation);
  w.addEventListener('pageshow',reconcileNavigation,{passive:true});
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',function(){installCapabilitySelfHeal();reconcileNavigation();},{once:true});else{installCapabilitySelfHeal();reconcileNavigation();}
})(document,window);

window.__qilyLayeredNavigationBuildContract=Object.freeze({
  mode:'atomic-first-paint-v44',staticHtmlAuthority:true,runtimeDependencyWaterfall:false,routeScopedLegacy:true,ordinaryPagesDirectCore:true,homepageHeroTune:true,unifiedContentAxis:true,unifiedHeaderAxis:true,headerAxisWidth:1560,headerDesktopNoClip:true,primaryNavigationUnifiedVisualContract:true,primaryNavigationFontSize:20,primaryNavigationFontWeight:900,mobilePrimaryNavigationMayShrinkTypography:false,publicIntegrityHotfix:true,siteSearchDirectNavigation:true,siteSearchRuntimeVersion:'20260826-search-navigation-v2',r6RankedSearchTerminologyVisualGuard:true,r6RankedSearchTerminologyVisualVersion:'20260826-r6-search-terminology-visual-v1',capabilitySelfHeal:true,capabilityQHomeCompleteActions:true,capabilityDdzReadableLightPalette:true,terminologyLiveSource:'/qilylean/site-data.json',terminologySingleCanonicalStrip:true,certificateVerificationBoundary:true,dockUniformVisualContract:true,dockUniformSize:62,dockFreeDragXY:false,dockPositionPersistence:false,dockAutoHome:'bottom-right',dockViewportBoundaryClamp:true,dockMobileDesktopParity:true,dockOrder:['home','top','back','search','current','contact'],dockUniformFontSize:true,resourceCollaborationPrimaryLabel:true,friendLinksPageIdentityPreserved:true,unifiedOnePieceArrows:true,searchAuthorityRoute:'/lean-production/',searchAuthorityLabel:'精益生产',searchAuthoritySitewide:true,translationAwareSelfHeal:true,r7DockSingleAuthority:true,r7NoNavigationDockMutation:true,version:'20260828-r7-navigation-v45'
});
