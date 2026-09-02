(() => {
  'use strict';

  const ROOT_CLASS='ddz-ios-virtual-landscape';
  const STYLE_ID='qilyDdzIosVirtualLandscapeV154Style';
  const VERSION='1.5.4-ios-virtual-landscape';
  const ua=navigator.userAgent||'';
  const isIOS=/iPhone|iPad|iPod/i.test(ua)||(navigator.platform==='MacIntel'&&(navigator.maxTouchPoints||0)>1);
  const isWechat=/MicroMessenger/i.test(ua)||Boolean(window.__PURE_DDZ_WECHAT_WEBVIEW__);
  const isMobile=Boolean(window.__PURE_DDZ_MOBILE_DEVICE__)||/Android|iPhone|iPad|iPod|HarmonyOS|Mobile/i.test(ua)||(navigator.maxTouchPoints||0)>0;
  const nativeLockAvailable=typeof screen.orientation?.lock==='function';
  const needsVirtualFallback=isMobile&&(isIOS||isWechat||!nativeLockAvailable);
  let active=false,savedScrollX=0,savedScrollY=0;

  const $=id=>document.getElementById(id);
  const viewport=()=>{
    const vv=window.visualViewport;
    return{
      width:Math.max(1,Math.round(vv?.width||window.innerWidth||document.documentElement.clientWidth||1)),
      height:Math.max(1,Math.round(vv?.height||window.innerHeight||document.documentElement.clientHeight||1)),
      offsetLeft:Math.round(vv?.offsetLeft||0),
      offsetTop:Math.round(vv?.offsetTop||0)
    };
  };
  const physicalLandscape=()=>{const v=viewport();return v.width>v.height;};

  function toast(message){
    const el=$('toast');
    if(!el)return;
    el.textContent=message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer=setTimeout(()=>el.classList.remove('show'),2200);
  }

  function ensureStyle(){
    if($(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
html.${ROOT_CLASS},html.${ROOT_CLASS} body.ddz-site-page{width:100%!important;height:100%!important;overflow:hidden!important;overscroll-behavior:none!important;background:#062f36!important}
html.${ROOT_CLASS} body.ddz-site-page{position:fixed!important;inset:0!important;margin:0!important;padding:0!important}
html.${ROOT_CLASS} body.ddz-site-page #boot-status{display:none!important}
html.${ROOT_CLASS} body.ddz-site-page .game-shell.ddz-site-module{position:fixed!important;left:50%!important;top:50%!important;width:var(--ddz-v154-w,844px)!important;height:var(--ddz-v154-h,390px)!important;max-width:none!important;min-width:0!important;max-height:none!important;min-height:0!important;margin:0!important;padding-top:max(4px,env(safe-area-inset-left))!important;padding-right:max(4px,env(safe-area-inset-bottom))!important;padding-bottom:max(4px,env(safe-area-inset-right))!important;padding-left:max(4px,env(safe-area-inset-top))!important;box-sizing:border-box!important;overflow:hidden!important;transform:translate(-50%,-50%) rotate(90deg)!important;transform-origin:50% 50%!important;z-index:2147482700!important;background:#eef7f5!important}
html.${ROOT_CLASS} body.ddz-site-page .ddz-page-heading,html.${ROOT_CLASS} body.ddz-site-page .clean-promise{display:none!important}
html.${ROOT_CLASS} body.ddz-site-page .ddz-toolbar{display:grid!important;grid-template-columns:minmax(230px,300px) minmax(0,1fr)!important;align-items:center!important;gap:4px!important;width:100%!important;min-height:40px!important;height:40px!important;margin:0 0 3px!important;padding:3px 5px!important;border-radius:9px!important;box-sizing:border-box!important}
html.${ROOT_CLASS} body.ddz-site-page .ddz-toolbar .scoreboard{grid-template-columns:repeat(3,minmax(68px,1fr))!important;gap:3px!important}
html.${ROOT_CLASS} body.ddz-site-page .ddz-toolbar .scoreboard div{min-height:31px!important;height:31px!important;padding:2px 4px!important;border-radius:7px!important}
html.${ROOT_CLASS} body.ddz-site-page .ddz-toolbar .scoreboard small{font-size:10px!important}
html.${ROOT_CLASS} body.ddz-site-page .ddz-toolbar .scoreboard strong{font-size:15px!important}
html.${ROOT_CLASS} body.ddz-site-page .ddz-toolbar .top-actions{display:flex!important;align-items:center!important;justify-content:flex-end!important;flex-wrap:nowrap!important;gap:3px!important}
html.${ROOT_CLASS} body.ddz-site-page .ddz-toolbar .apk-inline{display:none!important}
html.${ROOT_CLASS} body.ddz-site-page .ddz-toolbar :is(#audio-toggle,#help-open,#settings-open,#v120-landscape-toggle,.start-btn){display:inline-flex!important;align-items:center!important;justify-content:center!important;flex:0 0 auto!important;min-width:0!important;min-height:30px!important;height:30px!important;padding:3px 6px!important;border-radius:7px!important;font-size:11px!important;line-height:1!important}
html.${ROOT_CLASS} body.ddz-site-page .ddz-toolbar #audio-toggle{width:38px!important}
html.${ROOT_CLASS} body.ddz-site-page .ddz-toolbar #audio-toggle span{display:none!important}
html.${ROOT_CLASS} body.ddz-site-page .ddz-toolbar #help-open,html.${ROOT_CLASS} body.ddz-site-page .ddz-toolbar #settings-open{width:38px!important}
html.${ROOT_CLASS} body.ddz-site-page .ddz-toolbar #v120-landscape-toggle{width:62px!important;color:#fff!important;-webkit-text-fill-color:#fff!important;background:linear-gradient(145deg,#0d7077,#07424c)!important;border:1px solid rgba(255,227,155,.72)!important}
html.${ROOT_CLASS} body.ddz-site-page .ddz-toolbar .start-btn{width:68px!important}
html.${ROOT_CLASS} body.ddz-site-page .game-main{width:100%!important;height:calc(var(--ddz-v154-h,390px) - 43px)!important;max-height:none!important;min-height:0!important;margin:0!important;border-radius:9px!important;overflow:hidden!important;box-shadow:none!important}
html.${ROOT_CLASS} body.ddz-site-page .table-wrap{width:100%!important;height:100%!important;min-height:0!important;max-height:none!important;margin:0!important;padding:4px 5px!important;border-radius:9px!important;box-sizing:border-box!important}
html.${ROOT_CLASS} body.ddz-site-page .table-wrap:before{inset:5px!important;border-radius:43% / 18%!important}
html.${ROOT_CLASS} body.ddz-site-page .ai{top:40px!important;width:82px!important;min-height:100px!important;padding:4px 3px!important;border-radius:10px!important}
html.${ROOT_CLASS} body.ddz-site-page .left-player{left:5px!important}
html.${ROOT_CLASS} body.ddz-site-page .right-player{right:5px!important}
html.${ROOT_CLASS} body.ddz-site-page .avatar{font-size:21px!important}
html.${ROOT_CLASS} body.ddz-site-page .player-name{font-size:14px!important}
html.${ROOT_CLASS} body.ddz-site-page .role,html.${ROOT_CLASS} body.ddz-site-page .count,html.${ROOT_CLASS} body.ddz-site-page .bid-tag{font-size:10.5px!important}
html.${ROOT_CLASS} body.ddz-site-page .card-backs{transform:scale(.58)!important;transform-origin:center bottom!important}
html.${ROOT_CLASS} body.ddz-site-page .center-area{width:calc(100% - 186px)!important;padding-top:0!important}
html.${ROOT_CLASS} body.ddz-site-page .round-meta{gap:3px!important}
html.${ROOT_CLASS} body.ddz-site-page .round-meta span{padding:3px 5px!important;font-size:10.5px!important}
html.${ROOT_CLASS} body.ddz-site-page .bottom-zone{margin-top:0!important}
html.${ROOT_CLASS} body.ddz-site-page .bottom-label{font-size:10.5px!important}
html.${ROOT_CLASS} body.ddz-site-page .bottom-cards{min-height:44px!important;gap:2px!important}
html.${ROOT_CLASS} body.ddz-site-page .bottom-cards>.mini-card{flex:0 0 34px!important;min-width:34px!important;width:34px!important;max-width:34px!important;height:46px!important;min-height:46px!important;max-height:46px!important;padding:2px!important;margin:1px!important;border-radius:6px!important}
html.${ROOT_CLASS} body.ddz-site-page .status{min-width:150px!important;min-height:25px!important;padding:3px 7px!important;font-size:12.5px!important}
html.${ROOT_CLASS} body.ddz-site-page .center-tip{font-size:10.5px!important}
html.${ROOT_CLASS} body.ddz-site-page .v120-play-stage{top:54px!important;width:calc(100% - 194px)!important;min-height:72px!important;max-height:92px!important;padding:4px 5px!important;border-radius:9px!important}
html.${ROOT_CLASS} body.ddz-site-page .v120-play-stage.left{left:86px!important}
html.${ROOT_CLASS} body.ddz-site-page .v120-play-stage.right{right:86px!important}
html.${ROOT_CLASS} body.ddz-site-page .v120-play-owner{font-size:11.5px!important;margin-bottom:2px!important}
html.${ROOT_CLASS} body.ddz-site-page .v120-play-card{flex:0 0 40px!important;width:40px!important;height:58px!important;margin-left:-5px!important}
html.${ROOT_CLASS} body.ddz-site-page .v120-pass-flash{font-size:12px!important;padding:5px 8px!important}
html.${ROOT_CLASS} body.ddz-site-page .v120-pass-flash.me{bottom:145px!important}
html.${ROOT_CLASS} body.ddz-site-page #me-panel.me-player{left:5px!important;right:5px!important;bottom:4px!important;width:auto!important;height:136px!important;min-height:136px!important;padding:3px 5px 4px!important;border-radius:9px!important}
html.${ROOT_CLASS} body.ddz-site-page .me-meta{height:20px!important;min-height:20px!important;gap:4px!important}
html.${ROOT_CLASS} body.ddz-site-page .me-meta .avatar{font-size:15px!important}
html.${ROOT_CLASS} body.ddz-site-page .me-meta .player-name{font-size:13px!important}
html.${ROOT_CLASS} body.ddz-site-page #hand.hand{display:flex!important;align-items:flex-end!important;justify-content:safe center!important;width:100%!important;height:82px!important;min-height:82px!important;padding:3px 4px 1px!important;overflow-x:auto!important;overflow-y:visible!important;box-sizing:border-box!important}
html.${ROOT_CLASS} body.ddz-site-page #hand.hand .card,html.${ROOT_CLASS} body.ddz-site-page #hand.hand:has(.card:nth-child(19)) .card{flex:0 0 52px!important;width:52px!important;min-width:52px!important;max-width:52px!important;height:76px!important;min-height:76px!important;max-height:76px!important;margin-left:-12px!important;padding:3px!important;border-radius:7px!important}
html.${ROOT_CLASS} body.ddz-site-page #hand.hand .card:first-child{margin-left:0!important}
html.${ROOT_CLASS} body.ddz-site-page #hand.hand .qily-card-corner{left:3px!important;top:3px!important}
html.${ROOT_CLASS} body.ddz-site-page #hand.hand .qily-card--normal .qily-rank-suit-line b{font-size:15px!important}
html.${ROOT_CLASS} body.ddz-site-page #hand.hand .qily-card-theme{inset:23px 3px 5px!important;gap:1px!important}
html.${ROOT_CLASS} body.ddz-site-page #hand.hand .qily-card-theme>small{font-size:4.5px!important}
html.${ROOT_CLASS} body.ddz-site-page #hand.hand .qily-card-theme>strong{font-size:9px!important}
html.${ROOT_CLASS} body.ddz-site-page #hand.hand .qily-card-theme>b{font-size:5.6px!important}
html.${ROOT_CLASS} body.ddz-site-page #hand.hand .qily-card-theme>em{font-size:4.5px!important}
html.${ROOT_CLASS} body.ddz-site-page .controls{flex-wrap:nowrap!important;gap:4px!important;margin-top:1px!important;min-height:29px!important}
html.${ROOT_CLASS} body.ddz-site-page .control-btn{flex:0 1 96px!important;min-width:72px!important;min-height:29px!important;height:29px!important;padding:3px 7px!important;border-radius:7px!important;font-size:12px!important}
html.${ROOT_CLASS} body.ddz-site-page .modal:not(.hidden){z-index:2147482800!important}
html.${ROOT_CLASS} body.ddz-site-page .modal:not(.hidden)>.modal-card{position:absolute!important;left:50%!important;top:50%!important;width:min(calc(var(--ddz-v154-w,844px) - 24px),760px)!important;max-width:none!important;max-height:calc(var(--ddz-v154-h,390px) - 18px)!important;overflow:auto!important;transform:translate(-50%,-50%) rotate(90deg)!important;transform-origin:50% 50%!important;margin:0!important}
html.${ROOT_CLASS} body.ddz-site-page #welcome.mobile-landscape-auto-start{pointer-events:none!important}
`;
    document.head.appendChild(style);
  }

  function syncGeometry(){
    if(!active)return;
    const v=viewport();
    if(v.width>v.height){
      exitVirtual(false);
      return;
    }
    const virtualWidth=v.height;
    const virtualHeight=v.width;
    const scale=Math.max(.72,Math.min(1.08,Math.min(virtualWidth/844,virtualHeight/390)));
    const root=document.documentElement;
    root.style.setProperty('--ddz-v154-w',`${virtualWidth}px`);
    root.style.setProperty('--ddz-v154-h',`${virtualHeight}px`);
    root.style.setProperty('--ddz-v154-s',scale.toFixed(3));
    root.dataset.ddzVirtualViewport=`${virtualWidth}x${virtualHeight}`;
    requestAnimationFrame(()=>window.QilyLeanV120?.fitHand?.());
  }

  function setButtonState(){
    const toolbar=$('v120-landscape-toggle');
    const welcome=$('welcome-landscape');
    if(toolbar){
      toolbar.textContent=active?'↕ 竖屏':'↔ 横屏';
      toolbar.setAttribute('aria-label',active?'退出横屏斗地主':'切换横屏斗地主');
      if(active){toolbar.hidden=false;toolbar.setAttribute('aria-hidden','false');}
    }
    if(welcome&&!active)welcome.textContent='↔ 横屏游玩';
  }

  function enterVirtual(source){
    if(active)return true;
    ensureStyle();
    savedScrollX=window.scrollX||0;
    savedScrollY=window.scrollY||0;
    active=true;
    document.documentElement.classList.add(ROOT_CLASS);
    document.documentElement.dataset.ddzVirtualLandscape='v154';
    syncGeometry();
    setButtonState();
    if(source==='welcome'){
      $('welcome')?.classList.add('mobile-landscape-auto-start');
      setTimeout(()=>{
        $('welcome-start')?.click();
        $('welcome')?.classList.remove('mobile-landscape-auto-start');
      },60);
    }
    toast('已进入横屏牌桌，iPhone 将以页面横屏方式自动适配');
    return true;
  }

  function exitVirtual(announce=true){
    if(!active)return false;
    active=false;
    const root=document.documentElement;
    root.classList.remove(ROOT_CLASS);
    delete root.dataset.ddzVirtualLandscape;
    root.style.removeProperty('--ddz-v154-w');
    root.style.removeProperty('--ddz-v154-h');
    root.style.removeProperty('--ddz-v154-s');
    setButtonState();
    requestAnimationFrame(()=>{
      window.scrollTo(savedScrollX,savedScrollY);
      window.QilyLeanV120?.fitHand?.();
    });
    if(announce)toast('已退出横屏牌桌');
    return true;
  }

  function handleLandscapeClick(event){
    const target=event.target?.closest?.('#v120-landscape-toggle,#welcome-landscape');
    if(!target||!needsVirtualFallback||physicalLandscape())return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if(active)exitVirtual(true);else enterVirtual(target.id==='welcome-landscape'?'welcome':'toolbar');
  }

  function onViewportChange(){
    if(active)syncGeometry();
  }

  ensureStyle();
  document.addEventListener('click',handleLandscapeClick,true);
  window.addEventListener('resize',onViewportChange,{passive:true});
  window.visualViewport?.addEventListener?.('resize',onViewportChange,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(onViewportChange,100));
  window.addEventListener('pagehide',()=>exitVirtual(false),{once:true});

  window.QilyLeanDdzVirtualLandscape=Object.freeze({
    version:VERSION,
    needsVirtualFallback,
    get active(){return active;},
    enter:()=>enterVirtual('toolbar'),
    exit:()=>exitVirtual(true),
    syncGeometry
  });
})();
