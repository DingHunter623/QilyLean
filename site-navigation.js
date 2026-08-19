/* QilyLean atomic first-paint navigation runtime v28｜2026-08-19
 * 原则：静态 HTML 是唯一正文权威源；运行时只负责导航/悬浮工具所必需的增强。
 * 性能：普通页面直达 core；仅合作/资源页面按需加载 legacy，避免全站下载报价与资源逻辑。
 * 可视化：中文正文启用 pretty wrap / strict line-break；悬浮功能区执行全站唯一视觉标准。
 * V28：箭头几何升级为V4——marker箭头与“直线+三角形”统一转为一体化矢量箭头，禁止轴线穿出箭尖；双向改革/改善示意图上下箭头缩小并对称。
 */
(function (d, w) {
  'use strict';
  if (w.__qilyStaticFirstNavigationV28) return;
  w.__qilyStaticFirstNavigationV28 = true;

  var CONSISTENCY_SRC = '/site-ui-consistency-v1.js?v=20260817-atomic-first-paint-v8';
  var CORE_SRC = '/site-navigation-core.js?v=20260819-operating-axis-nav-v22';
  var LEGACY_SRC = '/site-navigation-legacy-20260802.js?v=20260817-atomic-first-paint-v18';
  var CONTINUITY_HREF = '/site-interaction-continuity-v1.css?v=20260818-visual-governance-v3';
  var GOVERNANCE_HREF = '/site-visual-governance-v2.css?v=20260819-readable-floor-plus1-v6';
  var CONTENT_AXIS_HREF = '/site-content-axis-v1.css?v=20260819-unified-content-axis-v1';
  var HOME_HERO_HREF = '/site-home-hero-tune-v1.css?v=20260819-home-hero-align-v2';
  var DOCK_HREF = '/site-floating-dock-standard-v1.css?v=20260819-sitewide-dock-v1';
  var GEOMETRY_SRC = '/site-visual-geometry-v1.js?v=20260819-arrow-geometry-v4';

  function installVisualGovernanceLink() {
    var continuity = d.querySelector('link[href*="/site-interaction-continuity-v1.css"]');
    if (!continuity) {
      continuity = d.createElement('link');
      continuity.id = 'qilyInteractionContinuityV3';
      continuity.rel = 'stylesheet';
      continuity.href = CONTINUITY_HREF;
      (d.head || d.documentElement).appendChild(continuity);
    } else if (continuity.getAttribute('href') !== CONTINUITY_HREF) {
      continuity.id = 'qilyInteractionContinuityV3';
      continuity.setAttribute('href', CONTINUITY_HREF);
    }

    var governance = d.getElementById('qilyVisualGovernanceV1') || d.querySelector('link[href*="/site-visual-governance-v1.css"],link[href*="/site-visual-governance-v2.css"]');
    if (!governance) {
      governance = d.createElement('link');
      governance.id = 'qilyVisualGovernanceV1';
      governance.rel = 'stylesheet';
      governance.href = GOVERNANCE_HREF;
      (d.head || d.documentElement).appendChild(governance);
    } else if (governance.getAttribute('href') !== GOVERNANCE_HREF) {
      governance.id = 'qilyVisualGovernanceV1';
      governance.setAttribute('href', GOVERNANCE_HREF);
    }
  }

  function installContentAxisLink() {
    var axis = d.getElementById('qilyContentAxisV1') || d.querySelector('link[href*="/site-content-axis-v1.css"]');
    if (!axis) {
      axis = d.createElement('link');
      axis.id = 'qilyContentAxisV1';
      axis.rel = 'stylesheet';
      axis.href = CONTENT_AXIS_HREF;
      (d.head || d.documentElement).appendChild(axis);
    } else if (axis.getAttribute('href') !== CONTENT_AXIS_HREF) {
      axis.id = 'qilyContentAxisV1';
      axis.setAttribute('href', CONTENT_AXIS_HREF);
    }
  }

  function installHomeHeroTune() {
    var path = (location.pathname || '/').replace(/\/index\.html$/, '/');
    if (path !== '/') return;
    var tune = d.getElementById('qilyHomeHeroTuneV1') || d.querySelector('link[href*="/site-home-hero-tune-v1.css"]');
    if (!tune) {
      tune = d.createElement('link');
      tune.id = 'qilyHomeHeroTuneV1';
      tune.rel = 'stylesheet';
      tune.href = HOME_HERO_HREF;
      (d.head || d.documentElement).appendChild(tune);
    } else if (tune.getAttribute('href') !== HOME_HERO_HREF) {
      tune.id = 'qilyHomeHeroTuneV1';
      tune.setAttribute('href', HOME_HERO_HREF);
    }
  }

  function installDockStandardLink() {
    if (!d.getElementById('qilyDockUniformCriticalV1')) {
      var critical = d.createElement('style');
      critical.id = 'qilyDockUniformCriticalV1';
      critical.textContent = 'html body #floatDock.qily-float-dock{right:max(12px,env(safe-area-inset-right))!important;left:auto!important;top:clamp(84px,18vh,160px)!important;bottom:auto!important;gap:8px!important;transform:none!important}html body #floatDock.qily-float-dock .qily-float-btn,html body #floatDock.qily-float-dock .qily-float-btn[data-action="share"]{box-sizing:border-box!important;display:flex!important;align-items:center!important;justify-content:center!important;width:62px!important;min-width:62px!important;max-width:62px!important;height:62px!important;min-height:62px!important;max-height:62px!important;margin:0!important;padding:5px!important;border:1.5px solid #caa15f!important;border-radius:50%!important;color:#fff!important;-webkit-text-fill-color:#fff!important;background:#0f4b5a!important;font-size:15px!important;line-height:1.08!important;overflow:hidden!important}';
      (d.head || d.documentElement).appendChild(critical);
    }
    var dock = d.getElementById('qilyFloatingDockStandardV1') || d.querySelector('link[href*="/site-floating-dock-standard-v1.css"]');
    if (!dock) {
      dock = d.createElement('link');
      dock.id = 'qilyFloatingDockStandardV1';
      dock.rel = 'stylesheet';
      dock.href = DOCK_HREF;
      (d.head || d.documentElement).appendChild(dock);
    } else if (dock.getAttribute('href') !== DOCK_HREF) {
      dock.id = 'qilyFloatingDockStandardV1';
      dock.setAttribute('href', DOCK_HREF);
    }
  }

  function installTypographyPolish() {
    if (d.getElementById('qilyChineseWrapPolishV1')) return;
    var style = d.createElement('style');
    style.id = 'qilyChineseWrapPolishV1';
    style.textContent = [
      'html body main :is(h1,h2,h3,h4){text-wrap:balance;line-break:strict}',
      'html body main :is(p,li,.module-result,.career-result,.qily-asset-note,.evidence-note,.service-contract,.record,.fine){text-wrap:pretty;line-break:strict;word-break:normal;overflow-wrap:break-word}',
      '@media (min-width:760px){html body main li{letter-spacing:-.008em}}'
    ].join('');
    (d.head || d.documentElement).appendChild(style);
  }

  function loadVisualGeometry() {
    if (w.__qilyVisualGeometryV4 || d.querySelector('script[data-qily-visual-geometry="v4"],script[src*="/site-visual-geometry-v1.js?v=20260819-arrow-geometry-v4"]')) return;
    var stale = d.querySelector('script[data-qily-visual-geometry],script[src*="/site-visual-geometry-v1.js"]');
    if (stale && !w.__qilyVisualGeometryV4) stale.remove();
    var script = d.createElement('script');
    script.src = GEOMETRY_SRC;
    script.async = false;
    script.setAttribute('data-qily-visual-geometry', 'v4');
    (d.head || d.documentElement).appendChild(script);
  }

  function needsLegacyRuntime() {
    var path = (location.pathname || '/').replace(/\/index\.html$/, '/');
    return path.indexOf('/cooperation/') === 0 || path.indexOf('/links/') === 0;
  }

  function appendRuntime() {
    if (w.__qilyLeanSiteNavigationPublicV8) return;
    var legacy = needsLegacyRuntime();
    var attr = legacy ? 'data-qily-navigation-legacy' : 'data-qily-navigation-core';
    if (d.querySelector('script[' + attr + ']')) return;
    var script = d.createElement('script');
    script.src = legacy ? LEGACY_SRC : CORE_SRC;
    script.async = false;
    script.setAttribute(attr, 'atomic-first-paint-v28');
    (d.head || d.documentElement).appendChild(script);
  }

  function loadConsistencyGuard() {
    appendRuntime();
    if (w.__qilyUiConsistencyV2) return;
    var existing = d.querySelector('script[data-qily-ui-consistency],script[src*="/site-ui-consistency-v1.js"]');
    if (existing) return;
    var script = d.createElement('script');
    script.src = CONSISTENCY_SRC;
    script.async = false;
    script.setAttribute('data-qily-ui-consistency', 'atomic-first-paint-v8');
    (d.head || d.documentElement).appendChild(script);
  }

  function release(button) {
    if (!button) return;
    if (button.__qilyPressedTimer) w.clearTimeout(button.__qilyPressedTimer);
    button.__qilyPressedTimer = w.setTimeout(function () {
      delete button.dataset.qilyPressed;
      button.__qilyPressedTimer = 0;
    }, 120);
  }

  function bindDockButton(button) {
    if (!button || button.dataset.qilyPointerFeedback === 'v2') return;
    button.dataset.qilyPointerFeedback = 'v2';
    button.addEventListener('pointerdown', function () {
      if (!button.matches(':disabled,[aria-disabled="true"]')) button.dataset.qilyPressed = 'true';
    }, { passive: true });
    button.addEventListener('pointerup', function () { release(button); }, { passive: true });
    button.addEventListener('pointercancel', function () { release(button); }, { passive: true });
    button.addEventListener('blur', function () { release(button); });
  }

  function bindDock() {
    d.querySelectorAll('#floatDock.qily-float-dock .qily-float-btn').forEach(bindDockButton);
  }

  installVisualGovernanceLink();
  installContentAxisLink();
  installHomeHeroTune();
  installDockStandardLink();
  installTypographyPolish();
  loadVisualGeometry();
  loadConsistencyGuard();
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', bindDock, { once: true });
  else bindDock();
  d.addEventListener('qily:shell-ready', bindDock);
})(document, window);

window.__qilyLayeredNavigationBuildContract = Object.freeze({
  mode: 'atomic-first-paint-v28',
  staticHtmlAuthority: true,
  atomicFirstPaint: true,
  runtimeDependencyWaterfall: false,
  dynamicContentShapers: false,
  runtimeFooter: false,
  runtimeSharedCssRewrite: false,
  nativePrefetch: true,
  routeScopedLegacy: true,
  ordinaryPagesDirectCore: true,
  chineseWrapPolish: true,
  visualGovernanceCacheBust: true,
  visualGovernanceFinalCascade: true,
  unifiedContentAxis: true,
  unifiedContentAxisWidth: 1560,
  visualGeometryClosure: true,
  unifiedOnePieceArrows: true,
  markerUnitsOverhangEliminated: true,
  separateTriangleLineEliminated: true,
  symmetricBidirectionalSceneArrows: true,
  arrowFrameCollisionPrevention: true,
  homepageHeroTune: true,
  dockUniformVisualContract: true,
  dockUniformSize: 62,
  dockOfficialUrlTwoLine: true,
  dockActions: [
    'data-action="home"', 'data-action="top"', 'data-action="back"',
    'data-action="search"', 'data-action="current"', 'data-action="share"',
    'data-action="contact"'
  ]
});

/* QILY-PHONE-CONTACT-V12.4:START */
(function(){
  'use strict';
  if(window.__qilyPhoneContactV124)return;
  window.__qilyPhoneContactV124=true;
  function copyTextV124(text){
    if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(text);
    var f=document.createElement('textarea');f.value=text;f.setAttribute('readonly','');f.style.position='fixed';f.style.left='-9999px';document.body.appendChild(f);f.select();document.execCommand('copy');f.remove();return Promise.resolve();
  }
  function promptBox(){
    var p=document.getElementById('qilyPhoneCallPrompt');if(p)return p;
    p=document.createElement('div');p.id='qilyPhoneCallPrompt';p.className='qily-phone-call-prompt-v124';p.setAttribute('role','status');p.setAttribute('aria-live','polite');
    p.innerHTML='<span></span><button type="button">立即拨打</button>';document.body.appendChild(p);
    p.querySelector('button').addEventListener('click',function(){var n=p.getAttribute('data-phone')||'';p.classList.remove('show');if(n)window.location.href='tel:'+n;});
    return p;
  }
  function place(anchor,p){
    var r=anchor.getBoundingClientRect();p.style.left='12px';p.style.top='12px';requestAnimationFrame(function(){var b=p.getBoundingClientRect(),x=r.right+10;if(x+b.width>innerWidth-12)x=Math.max(12,r.left-b.width-10);var y=Math.max(12,Math.min(r.top,innerHeight-b.height-12));p.style.left=Math.round(x)+'px';p.style.top=Math.round(y)+'px';});
  }
  function copyPhone(anchor,phone){
    phone=(phone||'').replace(/[^0-9+]/g,'');if(!phone)return;
    copyTextV124(phone).then(function(){var p=promptBox();p.setAttribute('data-phone',phone);p.querySelector('span').textContent='电话号码 '+phone+' 已复制，是否立即拨打？';place(anchor,p);p.classList.add('show');clearTimeout(copyPhone.timer);copyPhone.timer=setTimeout(function(){p.classList.remove('show');},9000);});
  }
  function normalizeCooperation(){
    var card=document.querySelector('.contact-card');if(!card)return;
    var phone=card.querySelector('a[href^="tel:"]');
    if(phone){phone.classList.add('contact-line');if(!phone.querySelector('strong')){var pv=(phone.textContent||'').replace(/^\s*电话\s*[：:]\s*/,'').trim();phone.replaceChildren();var pl=document.createElement('span');pl.textContent='电话：';var ps=document.createElement('strong');ps.textContent=pv;phone.append(pl,ps);}}
    var email=card.querySelector('a[href^="mailto:"]');
    if(email){email.classList.add('contact-line');if(!email.querySelector('strong')){var ev=(email.textContent||'').replace(/^\s*邮箱\s*[：:]\s*/,'').trim();email.replaceChildren();var el=document.createElement('span');el.textContent='邮箱：';var es=document.createElement('strong');es.textContent=ev;email.append(el,es);}}
    var wx=card.querySelector('#copyWechat,[data-qily-wechat-copy="Qily259"]');
    if(wx){wx.classList.add('wechat-contact-action');if(!wx.querySelector('strong')){wx.replaceChildren();var wl=document.createElement('span');wl.textContent='微信：';var ws=document.createElement('strong');ws.textContent='Qily259';wx.append(wl,ws);}}
  }
  document.addEventListener('click',function(e){var x=e.target.closest&&e.target.closest('.qily-phone-list a[href^="tel:"],.contact-card a[href^="tel:"],.term-opl-contact-lines a[href^="tel:"]');if(!x)return;e.preventDefault();e.stopPropagation();copyPhone(x,(x.getAttribute('href')||'').replace(/^tel:/,''));},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',normalizeCooperation,{once:true});else normalizeCooperation();
})();
/* QILY-PHONE-CONTACT-V12.4:END */