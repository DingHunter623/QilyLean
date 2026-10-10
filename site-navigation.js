/* QilyLean navigation runtime v46｜2026-09-16
 * navigation runtime v45 compatibility marker retained for validators; V46 is the active authority.
 * atomic-first-paint-v44 compatibility marker retained for the V44 system-baseline validator.
 * R7 single-responsibility navigation closure:
 * 1) Chinese remains the authoritative static navigation source;
 * 2) Header / Logo / primary navigation / translation utility share the governed 1180px content axis;
 * 3) this runtime owns primary navigation, search-authority links and capability support only;
 * 4) Dock behavior/labels/position are owned exclusively by site-dock-share-runtime-v1.js V5;
 * 5) no MutationObserver or pointer listener may continuously rewrite Dock state here.
 */
(function(d,w){
  'use strict';
  if(w.__qilyStaticFirstNavigationV46)return;
  w.__qilyStaticFirstNavigationV46=true;
  w.__qilyStaticFirstNavigationV45=true;
  w.__qilyStaticFirstNavigationV44=true;
  w.__qilyStaticFirstNavigationV43=true;
  w.__qilyStaticFirstNavigationV42=true;

  var CORE_SRC='/site-navigation-core.js?v=20260924-primary-nav-render-parity-core-v35&firstpaint=20261008-shell-v1&input=20261010-user-nav-v5';
  var LEGACY_SRC='/site-navigation-legacy-20260802.js?v=20260927-pricing-type-floor-v25';
  var CONSISTENCY_SRC='/site-ui-consistency-v1.js?v=20260830-r7-single-responsibility-v8-stable-picker';
  var SEARCH_RUNTIME_SRC='/site-search.js?v=20260826-search-navigation-v2';
  var INTEGRITY_SRC='/site-integrity-hotfix-v1.js?v=20260826-public-integrity-v2';
  var R6_SEARCH_VISUAL_SRC='/site-r6-search-terminology-visual-v1.js?v=20260826-r6-search-terminology-visual-v1';
  var CONTINUITY_HREF='/site-interaction-continuity-v1.css?v=20260818-visual-governance-v3';
  var GOVERNANCE_HREF='/site-visual-governance-v2.css?v=20260926-bilingual-label-gold-v1';
  var CONTENT_AXIS_HREF='/site-content-axis-v1.css?v=20260916-unified-1180-axis-v7';
  var HEADER_AXIS_HREF='/site-header-axis-v1.css?v=20260831-r8-vi-rail-v1';
  var HOME_HERO_HREF='/site-home-hero-tune-v1.css?v=20260819-home-hero-align-v3';
  var DOCK_HREF='/site-floating-dock-standard-v1.css?v=20260819-dock-snapback-v3';
  var GEOMETRY_SRC='/site-visual-geometry-v1.js?v=20260819-arrow-geometry-v4';
  var CAPABILITY_DDZ_HREF='/pure-ddz-capability-visual-v2.css?v=20260824-red-heart-ace-v8';
  var APP_SHARE_SRC='/app-download-share-v1.js?v=20260824-capability-home-actions-v2';
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

  /* QILY-PRIMARY-NAV-ACTIVE-REVEAL-V1 | 2026-09-27
   * Keep the current primary module inside the horizontal navigation viewport.
   * Uses scrollLeft only, so revealing the active item never changes document Y position.
   */
  var PRIMARY_NAV_SELECTOR='.qily-global-nav,header nav.site-nav,header nav.nav,header nav[aria-label="网站导航"],header nav[aria-label="QilyLean核心导视"]';
  var userControlledPrimaryNavigation=new WeakSet();
  function retainPrimaryNavigationInput(event){
    var target=event.target;if(!target||!target.closest)return;
    var nav=target.closest(PRIMARY_NAV_SELECTOR);
    if(!nav&&target.matches('input.qily-primary-nav-scroll-rail[aria-controls]')){
      nav=d.getElementById(target.getAttribute('aria-controls'));
      if(nav&&!nav.matches(PRIMARY_NAV_SELECTOR))nav=null;
    }
    if(nav)userControlledPrimaryNavigation.add(nav);
  }
  ['pointerdown','keydown','wheel','input'].forEach(function(type){
    d.addEventListener(type,retainPrimaryNavigationInput,{capture:true,passive:true});
  });
  function revealActivePrimaryNavigation(){
    d.querySelectorAll(PRIMARY_NAV_SELECTOR).forEach(function(nav){
      if(userControlledPrimaryNavigation.has(nav))return;
      var active=nav.querySelector('a[aria-current="page"],a[data-qily-page-current="true"],a[data-qily-primary-current="true"]');
      if(!active)return;
      w.requestAnimationFrame(function(){
        // Delayed initialization may reveal the current page until the visitor
        // takes over. Never undo their rail, keyboard, drag or wheel movement.
        if(userControlledPrimaryNavigation.has(nav))return;
        var left=active.offsetLeft,right=left+active.offsetWidth,viewLeft=nav.scrollLeft,viewRight=viewLeft+nav.clientWidth;
        if(left>=viewLeft+8&&right<=viewRight-8)return;
        var max=Math.max(0,nav.scrollWidth-nav.clientWidth);
        var target=Math.max(0,left-(nav.clientWidth-active.offsetWidth)/2);
        nav.scrollLeft=Math.min(max,target);
      });
    });
  }
  function schedulePrimaryNavigationReveal(){
    [0,80,250,700].forEach(function(delay){w.setTimeout(revealActivePrimaryNavigation,delay);});
  }
  // Primary-navigation text is NEVER underlined: the CN-approved active state
  // uses its existing teal fill and gold border as the sole current indicator.
  // Explicit inline-important stops legacy all-link CSS and cached stylesheet
  // cascade order from restoring a gold underline beneath the current label.
  function enforcePrimaryNavigationNoUnderline(){
    d.querySelectorAll('header.qily-site-header :is(nav.site-nav,nav.qily-global-nav,nav.nav)>a[href],header.qily-global-header :is(nav.site-nav,nav.qily-global-nav,nav.nav)>a[href]').forEach(function(link){
      link.style.setProperty('text-decoration','none','important');
      link.style.setProperty('text-decoration-line','none','important');
    });
  }
  function reconcileNavigation(){ensureSearchAuthorityNavigation();normalizeResourceCollaborationLabel();enforcePrimaryNavigationNoUnderline();schedulePrimaryNavigationReveal();}
  function needsLegacyRuntime(){var p=currentPath();return p.indexOf('/cooperation/')===0||p.indexOf('/links/')===0;}
  function installCapabilitySelfHeal(){
    if(currentPath()!=='/capabilities/')return;
    ensureStylesheet('qilyPureDdzCapabilityVisualV2',CAPABILITY_DDZ_HREF,'link[href*="/pure-ddz-capability-visual-v2.css"]');
    if(!d.querySelector('script[src*="/app-download-share-v1.js?v=20260824-capability-home-actions-v2"]'))loadScript('qilyAppDownloadShareRuntime',APP_SHARE_SRC);
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
  mode:'atomic-first-paint-v46',staticHtmlAuthority:true,runtimeDependencyWaterfall:false,routeScopedLegacy:true,ordinaryPagesDirectCore:true,homepageHeroTune:true,unifiedContentAxis:true,unifiedHeaderAxis:true,headerAxisWidth:1180,headerDesktopNoClip:true,primaryNavigationUnifiedVisualContract:true,primaryNavigationFontSize:20,primaryNavigationFontWeight:900,primaryNavigationActiveReveal:true,mobilePrimaryNavigationMayShrinkTypography:false,publicIntegrityHotfix:true,siteSearchDirectNavigation:true,siteSearchRuntimeVersion:'20260826-search-navigation-v2',r6RankedSearchTerminologyVisualGuard:true,r6RankedSearchTerminologyVisualVersion:'20260826-r6-search-terminology-visual-v1',capabilitySelfHeal:true,capabilityQHomeCompleteActions:true,capabilityDdzReadableLightPalette:true,terminologyLiveSource:'/qilylean/site-data.json',terminologySingleCanonicalStrip:true,certificateVerificationBoundary:true,dockUniformVisualContract:true,dockUniformSize:62,dockFreeDragXY:false,dockPositionPersistence:false,dockAutoHome:'bottom-right',dockViewportBoundaryClamp:true,dockMobileDesktopParity:true,dockOrder:['home','top','back','search','current','contact'],dockUniformFontSize:true,resourceCollaborationPrimaryLabel:true,friendLinksPageIdentityPreserved:true,unifiedOnePieceArrows:true,searchAuthorityRoute:'/lean-production/',searchAuthorityLabel:'精益生产',searchAuthoritySitewide:true,translationAwareSelfHeal:true,r7DockSingleAuthority:true,r7NoNavigationDockMutation:true,version:'20260916-r7-navigation-v46-1180-axis'
});
