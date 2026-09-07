(() => {
  'use strict';
  if(window.__qilyDdzMobileLandscapeAutofitV165)return;
  window.__qilyDdzMobileLandscapeAutofitV165=true;

  const ROOT='ddz-mobile-game-landscape';
  const VIRTUAL='ddz-ios-virtual-landscape';
  const STYLE_ID='qilyDdzMobileLandscapeAutofitV165Style';
  const HOME_ID='qilyDdzLandscapeHome';
  const ua=navigator.userAgent||'';
  const isIOS=/iPhone|iPad|iPod/i.test(ua)||(navigator.platform==='MacIntel'&&(navigator.maxTouchPoints||0)>1);
  const mobileUa=/Android|iPhone|iPad|iPod|HarmonyOS|Mobile/i.test(ua)||isIOS;

  const viewport=()=>{
    const vv=window.visualViewport;
    return {
      width:Math.max(1,Math.round(vv?.width||window.innerWidth||document.documentElement.clientWidth||1)),
      height:Math.max(1,Math.round(vv?.height||window.innerHeight||document.documentElement.clientHeight||1))
    };
  };
  const compactMobile=v=>Boolean((mobileUa||(navigator.maxTouchPoints||0)>0)&&Math.min(v.width,v.height)<=900&&Math.max(v.width,v.height)<=1600);

  function ensureHome(){
    const actions=document.querySelector('.ddz-toolbar .top-actions');
    if(!actions)return null;
    let home=document.getElementById(HOME_ID);
    if(!home){
      home=document.createElement('a');
      home.id=HOME_ID;
      home.href='/';
      home.textContent='首页';
      home.setAttribute('aria-label','返回QilyLean官网首页');
      home.setAttribute('title','返回QilyLean官网首页');
      home.dataset.qilyDdzLandscapeHome='v165';
    }
    if(home.parentElement!==actions)actions.insertBefore(home,actions.firstChild);
    return home;
  }

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
html.${ROOT},html.${ROOT} body.ddz-site-page{width:100%!important;height:100%!important;min-height:100%!important;overflow:hidden!important;overscroll-behavior:none!important;background:#062f36!important}
html.${ROOT} body.ddz-site-page{position:fixed!important;inset:0!important;margin:0!important;padding:0!important}
html.${ROOT} body.ddz-site-page #boot-status{display:none!important}
html.${ROOT} body.ddz-site-page :is(header.qily-site-header,header.qily-global-header,#floatDock,.qily-float-dock,#qilyGlobalTranslationDualRouteV2,footer.site-footer,.site-footer){display:none!important;visibility:hidden!important;pointer-events:none!important}
html.${ROOT} body.ddz-site-page .game-shell.ddz-site-module{position:fixed!important;inset:0!important;display:flex!important;flex-direction:column!important;width:100%!important;height:var(--ddz-gameplay-vh,100dvh)!important;max-width:none!important;min-width:0!important;max-height:none!important;min-height:0!important;margin:0!important;padding:max(3px,env(safe-area-inset-top)) max(3px,env(safe-area-inset-right)) max(3px,env(safe-area-inset-bottom)) max(3px,env(safe-area-inset-left))!important;box-sizing:border-box!important;overflow:hidden!important;z-index:2147482600!important;background:#eef7f5!important}
html.${ROOT} body.ddz-site-page .ddz-page-heading,html.${ROOT} body.ddz-site-page .clean-promise{display:none!important}
html.${ROOT} body.ddz-site-page .ddz-toolbar{flex:0 0 auto!important;width:100%!important;margin:0 0 3px!important;box-sizing:border-box!important}
html.${ROOT} body.ddz-site-page .ddz-toolbar .top-actions{flex-wrap:nowrap!important;gap:3px!important}
html.${ROOT} body.ddz-site-page .ddz-toolbar #audio-toggle span{display:none!important}
html.${ROOT} body.ddz-site-page .game-main{flex:1 1 auto!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;margin:0!important;overflow:hidden!important;border-radius:9px!important;box-sizing:border-box!important}
html.${ROOT} body.ddz-site-page .table-wrap{width:100%!important;height:100%!important;min-height:0!important;max-height:none!important;margin:0!important;box-sizing:border-box!important}
html.${ROOT} body.ddz-site-page .modal:not(.hidden){z-index:2147482800!important}
html.${ROOT} body.ddz-site-page .modal:not(.hidden)>.modal-card{width:min(760px,calc(var(--ddz-gameplay-vw,100vw) - 24px))!important;max-width:none!important;max-height:calc(var(--ddz-gameplay-vh,100dvh) - 18px)!important;overflow:auto!important}
html.${ROOT} body.ddz-site-page #${HOME_ID},html.${VIRTUAL} body.ddz-site-page #${HOME_ID}{display:inline-flex!important;align-items:center!important;justify-content:center!important;flex:0 0 auto!important;min-width:44px!important;min-height:31px!important;height:31px!important;padding:3px 7px!important;border:1px solid #caa15f!important;border-radius:8px!important;background:#0f4b5a!important;color:#fff!important;-webkit-text-fill-color:#fff!important;font-size:11.5px!important;font-weight:950!important;line-height:1!important;text-decoration:none!important;box-sizing:border-box!important;white-space:nowrap!important}
html.${VIRTUAL} body.ddz-site-page :is(header.qily-site-header,header.qily-global-header,#floatDock,.qily-float-dock,#qilyGlobalTranslationDualRouteV2,footer.site-footer,.site-footer){display:none!important;visibility:hidden!important;pointer-events:none!important}
html:not(.${ROOT}):not(.${VIRTUAL}) body.ddz-site-page #${HOME_ID}{display:none!important}
`;
    document.head.appendChild(style);
  }

  function sync(){
    const root=document.documentElement;
    const v=viewport();
    const landscape=compactMobile(v)&&v.width>v.height;
    const scale=Math.max(.72,Math.min(1.08,Math.min(v.width/844,v.height/390)));
    root.style.setProperty('--ddz-mobile-vw',`${v.width}px`);
    root.style.setProperty('--ddz-mobile-vh',`${v.height}px`);
    root.style.setProperty('--ddz-landscape-scale',scale.toFixed(3));
    root.style.setProperty('--ddz-gameplay-vw',`${v.width}px`);
    root.style.setProperty('--ddz-gameplay-vh',`${v.height}px`);
    root.classList.toggle(ROOT,landscape);
    if(landscape){
      root.classList.add('ddz-mobile-landscape');
      root.classList.remove('ddz-mobile-portrait');
      root.dataset.ddzGameplayLandscape='v165';
      ensureHome();
      requestAnimationFrame(()=>window.QilyLeanV120?.fitHand?.());
    }else{
      delete root.dataset.ddzGameplayLandscape;
    }
    if(root.classList.contains(VIRTUAL))ensureHome();
  }

  ensureStyle();
  ensureHome();
  sync();
  window.addEventListener('resize',sync,{passive:true});
  window.visualViewport?.addEventListener?.('resize',sync,{passive:true});
  window.visualViewport?.addEventListener?.('scroll',sync,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(sync,100));
  window.addEventListener('pageshow',sync,{passive:true});
  document.addEventListener('qily:shell-ready',sync,{passive:true});

  window.QilyLeanDdzMobileLandscape=Object.freeze({version:'1.6.5',sync});
})();
