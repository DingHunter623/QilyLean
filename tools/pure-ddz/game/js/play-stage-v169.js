(() => {
  'use strict';
  if(window.__qilyDdzPlayStageV169)return;
  window.__qilyDdzPlayStageV169=true;

  const LEGACY_UX='/tools/pure-ddz/game/js/mobile-game-ux-v168.js?v=20260907-ddz-ux-v168';
  const STYLE_ID='qilyDdzPlayStageV169Style';
  const $=id=>document.getElementById(id);

  function ensureStage(){
    const table=document.querySelector('.table-wrap');
    if(!table)return null;
    let stage=$('v120-play-stage');
    if(!stage){
      stage=document.createElement('div');
      stage.id='v120-play-stage';
      stage.className='v120-play-stage';
      stage.setAttribute('aria-live','assertive');
      stage.setAttribute('aria-label','出牌显示区');
      table.appendChild(stage);
    }
    return stage;
  }

  function installFix(){
    ensureStage();
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* V169｜恢复固定出牌显示区。V168 曾把真实出牌层全局 display:none。 */
      html:root body.ddz-site-page #v120-play-stage{
        display:flex!important;
        visibility:visible!important;
        opacity:1!important;
        align-items:center!important;
        justify-content:center!important;
        flex-direction:column!important;
        pointer-events:none!important;
      }
      html:root body.ddz-site-page #v120-play-stage:not(.show):empty::before{
        content:'出牌显示区';
        display:block;
        color:#ffe39b;
        font-size:16px;
        line-height:1.2;
        font-weight:950;
        letter-spacing:.08em;
        opacity:.92;
      }
      html:root body.ddz-site-page #v120-play-stage:not(.show):empty::after{
        content:'等待出牌';
        display:block;
        margin-top:8px;
        color:rgba(255,255,255,.78);
        font-size:13px;
        line-height:1.2;
        font-weight:850;
      }
      html.ddz-desktop-game-fit body.ddz-site-page #v120-play-stage{
        z-index:18!important;
      }
      html.ddz-mobile-landscape body.ddz-site-page #v120-play-stage,
      html.ddz-ios-virtual-landscape body.ddz-site-page #v120-play-stage{
        display:flex!important;
        visibility:visible!important;
        opacity:1!important;
      }
    `;
    document.head.appendChild(style);
    try{window.QilyLeanV120?.refresh?.();}catch(_error){}
  }

  function loadLegacyThenFix(){
    if(window.__qilyDdzGameUxV168){installFix();return;}
    const existing=[...document.scripts].find(script=>(script.src||'').includes('/tools/pure-ddz/game/js/mobile-game-ux-v168.js'));
    if(existing){
      existing.addEventListener('load',installFix,{once:true});
      setTimeout(installFix,80);
      return;
    }
    const script=document.createElement('script');
    script.src=LEGACY_UX;
    script.async=false;
    script.dataset.qilyDdzMobileUxLegacy='v168';
    script.addEventListener('load',installFix,{once:true});
    script.addEventListener('error',installFix,{once:true});
    document.head.appendChild(script);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>{ensureStage();loadLegacyThenFix();},{once:true});
  }else{
    ensureStage();
    loadLegacyThenFix();
  }

  window.QilyLeanDdzPlayStageV169=Object.freeze({version:'1.6.9',ensureStage,installFix});
})();