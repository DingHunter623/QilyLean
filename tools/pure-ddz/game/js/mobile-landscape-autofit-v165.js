(() => {
  'use strict';
  if(window.__qilyDdzMobileLandscapeAutofitV166)return;
  window.__qilyDdzMobileLandscapeAutofitV166=true;

  const ROOT='ddz-mobile-game-landscape';
  const VIRTUAL='ddz-ios-virtual-landscape';
  const STYLE_ID='qilyDdzMobileLandscapeAutofitV166Style';
  const HOME_ID='qilyDdzLandscapeHome';
  const VOICE_RATE=.74;
  const ua=navigator.userAgent||'';
  const isIOS=/iPhone|iPad|iPod/i.test(ua)||(navigator.platform==='MacIntel'&&(navigator.maxTouchPoints||0)>1);
  const mobileUa=/Android|iPhone|iPad|iPod|HarmonyOS|Mobile/i.test(ua)||isIOS;
  const RANK_VOICE=Object.freeze({3:'3',4:'4',5:'5',6:'6',7:'7',8:'8',9:'9',10:'10',11:'J',12:'Q',13:'K',14:'A',15:'2',16:'小王',17:'大王'});
  const COMBO_VOICE=Object.freeze({single:'单牌',pair:'对子',triple:'三张',triple1:'三带一',triple2:'三带二',straight:'顺子',pairStraight:'连对',airplane:'飞机',airplane1:'飞机带单',airplane2:'飞机带对',four2:'四带二',four2pair:'四带两对',bomb:'炸弹',rocket:'王炸'});
  let browserVoicePatched=false;
  let nativeVoicePatched=false;
  let voicePrimeDone=false;

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
      home.dataset.qilyDdzLandscapeHome='v166';
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
html.${ROOT} body.ddz-site-page .modal:not(.hidden){z-index:2147482800!important;padding:6px!important;overflow:hidden!important}
html.${ROOT} body.ddz-site-page .modal:not(.hidden)>.modal-card{width:min(760px,calc(var(--ddz-gameplay-vw,100vw) - 16px))!important;max-width:none!important;max-height:calc(var(--ddz-gameplay-vh,100dvh) - 12px)!important;overflow:hidden!important}
html.${ROOT} body.ddz-site-page #${HOME_ID},html.${VIRTUAL} body.ddz-site-page #${HOME_ID}{display:inline-flex!important;align-items:center!important;justify-content:center!important;flex:0 0 auto!important;min-width:44px!important;min-height:31px!important;height:31px!important;padding:3px 7px!important;border:1px solid #caa15f!important;border-radius:8px!important;background:#0f4b5a!important;color:#fff!important;-webkit-text-fill-color:#fff!important;font-size:11.5px!important;font-weight:950!important;line-height:1!important;text-decoration:none!important;box-sizing:border-box!important;white-space:nowrap!important}
html.${VIRTUAL} body.ddz-site-page :is(header.qily-site-header,header.qily-global-header,#floatDock,.qily-float-dock,#qilyGlobalTranslationDualRouteV2,footer.site-footer,.site-footer){display:none!important;visibility:hidden!important;pointer-events:none!important}
html:not(.${ROOT}):not(.${VIRTUAL}) body.ddz-site-page #${HOME_ID}{display:none!important}

/* V166: elder-friendly result panel must be one-screen and non-scrollable in both physical and virtual landscape. */
html.${ROOT}:root:root body.ddz-site-page #result.modal:not(.hidden),html.${VIRTUAL}:root:root body.ddz-site-page #result.modal:not(.hidden){overflow:hidden!important;padding:5px!important}
html.${ROOT}:root:root body.ddz-site-page #result.modal:not(.hidden)>.result-card{position:relative!important;left:auto!important;top:auto!important;width:min(760px,calc(var(--ddz-gameplay-vw,100vw) - 12px))!important;height:auto!important;max-height:calc(var(--ddz-gameplay-vh,100dvh) - 10px)!important;margin:0!important;padding:8px 10px!important;overflow:hidden!important;transform:none!important;display:grid!important;grid-template-columns:42px minmax(0,1fr) minmax(132px,.6fr)!important;grid-template-areas:"icon eyebrow stats" "icon title stats" "text text stats" "again again close"!important;align-items:center!important;gap:3px 8px!important}
html.${VIRTUAL}:root:root body.ddz-site-page #result.modal:not(.hidden)>.result-card{position:absolute!important;left:50%!important;top:50%!important;width:min(calc(var(--ddz-v154-w,844px) - 14px),760px)!important;height:auto!important;max-height:calc(var(--ddz-v154-h,390px) - 10px)!important;margin:0!important;padding:8px 10px!important;overflow:hidden!important;transform:translate(-50%,-50%) rotate(90deg)!important;transform-origin:50% 50%!important;display:grid!important;grid-template-columns:42px minmax(0,1fr) minmax(132px,.6fr)!important;grid-template-areas:"icon eyebrow stats" "icon title stats" "text text stats" "again again close"!important;align-items:center!important;gap:3px 8px!important}
html.${ROOT}:root:root body.ddz-site-page #result .result-icon,html.${VIRTUAL}:root:root body.ddz-site-page #result .result-icon{grid-area:icon!important;font-size:36px!important;line-height:1!important;margin:0!important}
html.${ROOT}:root:root body.ddz-site-page #result .eyebrow,html.${VIRTUAL}:root:root body.ddz-site-page #result .eyebrow{grid-area:eyebrow!important;margin:0!important;font-size:10.5px!important;line-height:1.1!important}
html.${ROOT}:root:root body.ddz-site-page #result #result-title,html.${VIRTUAL}:root:root body.ddz-site-page #result #result-title{grid-area:title!important;margin:0!important;font-size:23px!important;line-height:1.08!important}
html.${ROOT}:root:root body.ddz-site-page #result #result-text,html.${VIRTUAL}:root:root body.ddz-site-page #result #result-text{grid-area:text!important;margin:1px 0!important;font-size:12.5px!important;line-height:1.3!important}
html.${ROOT}:root:root body.ddz-site-page #result .result-stats,html.${VIRTUAL}:root:root body.ddz-site-page #result .result-stats{grid-area:stats!important;display:grid!important;grid-template-columns:1fr!important;gap:4px!important;margin:0!important}
html.${ROOT}:root:root body.ddz-site-page #result .result-stats span,html.${VIRTUAL}:root:root body.ddz-site-page #result .result-stats span{padding:5px 7px!important;border-radius:8px!important;font-size:10.5px!important;line-height:1.1!important}
html.${ROOT}:root:root body.ddz-site-page #result .result-stats b,html.${VIRTUAL}:root:root body.ddz-site-page #result .result-stats b{margin-top:2px!important;font-size:17px!important;line-height:1!important}
html.${ROOT}:root:root body.ddz-site-page #result #again,html.${VIRTUAL}:root:root body.ddz-site-page #result #again{grid-area:again!important;width:100%!important;min-height:32px!important;height:32px!important;margin:1px 0 0!important;padding:3px 10px!important;font-size:13px!important;border-radius:9px!important}
html.${ROOT}:root:root body.ddz-site-page #result #result-close,html.${VIRTUAL}:root:root body.ddz-site-page #result #result-close{grid-area:close!important;width:100%!important;min-height:32px!important;height:32px!important;margin:1px 0 0!important;padding:3px 8px!important;font-size:12px!important;border-radius:9px!important}

/* V166: keep the played-card face on the same original top-left visual origin; no downward rank/suit or knowledge-art drift. */
html.${ROOT}:root:root body.ddz-site-page .v120-play-card .qily-card-corner,html.${VIRTUAL}:root:root body.ddz-site-page .v120-play-card .qily-card-corner{left:3px!important;top:3px!important;margin:0!important;padding:0!important;transform:none!important;translate:none!important}
html.${ROOT}:root:root body.ddz-site-page .v120-play-card .qily-rank-suit-line,html.${VIRTUAL}:root:root body.ddz-site-page .v120-play-card .qily-rank-suit-line{display:flex!important;align-items:flex-start!important;justify-content:flex-start!important;width:auto!important;height:auto!important;margin:0!important;padding:0!important;line-height:1!important;transform:none!important;translate:none!important;white-space:nowrap!important}
html.${ROOT}:root:root body.ddz-site-page .v120-play-card .qily-rank-suit-line>b,html.${VIRTUAL}:root:root body.ddz-site-page .v120-play-card .qily-rank-suit-line>b{display:block!important;margin:0!important;padding:0!important;line-height:1!important;transform:none!important;translate:none!important;vertical-align:top!important;white-space:nowrap!important}
html.${ROOT}:root:root body.ddz-site-page .v120-play-card .qily-card-theme{inset:23px 3px 7px!important;margin:0!important;transform:none!important;translate:none!important}
html.${VIRTUAL}:root:root body.ddz-site-page .v120-play-card .qily-card-theme{inset:21px 3px 7px!important;margin:0!important;transform:none!important;translate:none!important}

/* V166: portrait welcome/start panel is fully visible without teaching an elder user to scroll. */
@media (max-width:680px) and (orientation:portrait){
  html.ddz-mobile-device body.ddz-site-page #welcome.modal:not(.hidden){padding:6px!important;overflow:hidden!important;align-items:center!important}
  html.ddz-mobile-device body.ddz-site-page #welcome.modal:not(.hidden)>.welcome-card{width:calc(100vw - 12px)!important;max-width:430px!important;max-height:calc(var(--ddz-mobile-vh,100dvh) - 10px)!important;overflow:hidden!important;margin:0!important;padding:10px 12px!important;display:grid!important;grid-template-columns:1fr 1fr!important;grid-template-areas:"mark mark" "eyebrow eyebrow" "title title" "copy copy" "features features" "start start" "landscape settings"!important;gap:5px 7px!important;align-content:center!important}
  html.ddz-mobile-device body.ddz-site-page #welcome .welcome-mark{grid-area:mark!important;margin:0!important;font-size:38px!important;line-height:1!important}
  html.ddz-mobile-device body.ddz-site-page #welcome .eyebrow{grid-area:eyebrow!important;margin:0!important;font-size:clamp(10.5px,1.45vh,12.5px)!important;line-height:1.2!important}
  html.ddz-mobile-device body.ddz-site-page #welcome #welcome-title{grid-area:title!important;margin:0!important;font-size:clamp(26px,4.4vh,34px)!important;line-height:1.08!important}
  html.ddz-mobile-device body.ddz-site-page #welcome .welcome-copy{grid-area:copy!important;margin:1px 0!important;font-size:clamp(12.5px,1.7vh,14.5px)!important;line-height:1.42!important;text-align:left!important}
  html.ddz-mobile-device body.ddz-site-page #welcome .feature-list{grid-area:features!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:5px!important;margin:1px 0!important;padding:0!important}
  html.ddz-mobile-device body.ddz-site-page #welcome .feature-list li{min-height:0!important;margin:0!important;padding:6px 8px!important;border-radius:10px!important;text-align:left!important}
  html.ddz-mobile-device body.ddz-site-page #welcome .feature-list b{font-size:clamp(13px,1.75vh,15px)!important;line-height:1.15!important}
  html.ddz-mobile-device body.ddz-site-page #welcome .feature-list span{margin-top:2px!important;font-size:clamp(10.5px,1.45vh,12.5px)!important;line-height:1.22!important}
  html.ddz-mobile-device body.ddz-site-page #welcome #welcome-start{grid-area:start!important;width:100%!important;min-height:42px!important;height:42px!important;margin:1px 0 0!important;padding:5px 10px!important;font-size:18px!important;border-radius:12px!important}
  html.ddz-mobile-device body.ddz-site-page #welcome #welcome-landscape{grid-area:landscape!important;width:100%!important;min-height:36px!important;height:36px!important;margin:0!important;padding:4px 7px!important;font-size:13px!important;border-radius:10px!important}
  html.ddz-mobile-device body.ddz-site-page #welcome #welcome-settings{grid-area:settings!important;width:100%!important;min-height:36px!important;height:36px!important;margin:0!important;padding:4px 7px!important;font-size:12.5px!important;border-radius:10px!important}
  html.ddz-mobile-device body.ddz-site-page #result.modal:not(.hidden){padding:6px!important;overflow:hidden!important}
  html.ddz-mobile-device body.ddz-site-page #result.modal:not(.hidden)>.result-card{width:calc(100vw - 12px)!important;max-height:calc(var(--ddz-mobile-vh,100dvh) - 10px)!important;overflow:hidden!important;padding:12px!important}
  html.ddz-mobile-device body.ddz-site-page #result .result-icon{font-size:48px!important}
  html.ddz-mobile-device body.ddz-site-page #result #result-title{font-size:28px!important}
  html.ddz-mobile-device body.ddz-site-page #result #result-text{font-size:14px!important;line-height:1.38!important}
  html.ddz-mobile-device body.ddz-site-page #result .result-stats{margin:8px 0!important;gap:5px!important}
  html.ddz-mobile-device body.ddz-site-page #result .result-stats span{padding:7px!important}
  html.ddz-mobile-device body.ddz-site-page #result #again,html.ddz-mobile-device body.ddz-site-page #result #result-close{min-height:40px!important;margin-top:5px!important}
}
`;
    document.head.appendChild(style);
  }

  function rankVoice(rank){return RANK_VOICE[rank]||String(rank??'');}
  function describeFullRankPlay(play){
    if(!play?.cards?.length)return'';
    const who=play.player===0?'我':play.player===1?'左家':'右家';
    const ranks=play.cards.map(card=>rankVoice(card.rank));
    const combo=COMBO_VOICE[play.combo?.type]||'';
    return `${who}出牌：${ranks.join('、')}${combo?`，${combo}`:''}`;
  }
  function currentPlayText(source){
    const text=String(source||'').trim();
    if(!/^(?:我出|左家出牌|右家出牌)/.test(text))return text;
    const play=window.PureDDZTest?.getState?.()?.lastPlay;
    return play?.cards?.length?describeFullRankPlay(play):text;
  }
  function chooseChineseVoice(synth,fallback){
    const voices=synth?.getVoices?.()||[];
    return fallback||voices.find(v=>/^zh-(?:CN|Hans)/i.test(v.lang||''))||voices.find(v=>/^zh/i.test(v.lang||''))||null;
  }
  function copyUtteranceHandlers(from,to){
    ['onstart','onend','onerror','onpause','onresume','onmark','onboundary'].forEach(key=>{if(typeof from?.[key]==='function')to[key]=from[key];});
  }
  function installBrowserVoiceGuard(){
    try{
      const synth=window.speechSynthesis;
      if(!synth||!window.SpeechSynthesisUtterance||synth.__qilyDdzElderVoiceV166){browserVoicePatched=Boolean(synth?.__qilyDdzElderVoiceV166);return;}
      const nativeSpeak=synth.speak.bind(synth);
      synth.speak=function(utterance){
        const source=String(utterance?.text||'').trim();
        const full=currentPlayText(source);
        if(full&&full!==source){
          const next=new SpeechSynthesisUtterance(full);
          next.lang='zh-CN';
          next.rate=VOICE_RATE;
          next.pitch=Number.isFinite(Number(utterance?.pitch))?Number(utterance.pitch):1;
          next.volume=Math.max(.92,Number.isFinite(Number(utterance?.volume))?Number(utterance.volume):1);
          const voice=chooseChineseVoice(synth,utterance?.voice||null);if(voice)next.voice=voice;
          copyUtteranceHandlers(utterance,next);
          return nativeSpeak(next);
        }
        if(utterance&&/^(?:该您了|开始叫地主|您|左家|右家|不要|恭喜|这一局)/.test(source)){
          try{utterance.rate=Math.min(Number(utterance.rate)||1,.78);}catch(_error){}
          try{const voice=chooseChineseVoice(synth,utterance.voice||null);if(voice)utterance.voice=voice;}catch(_error){}
        }
        return nativeSpeak(utterance);
      };
      Object.defineProperty(synth,'__qilyDdzElderVoiceV166',{value:true,configurable:true});
      browserVoicePatched=true;
    }catch(_error){}
  }
  function installNativeVoiceGuard(){
    try{
      const bridge=window.QilyLeanAndroid;
      if(!bridge||typeof bridge.speak!=='function'||bridge.__qilyDdzElderVoiceV166){nativeVoicePatched=Boolean(bridge?.__qilyDdzElderVoiceV166);return;}
      const nativeSpeak=bridge.speak.bind(bridge);
      const proxy=function(text){return nativeSpeak(currentPlayText(text));};
      bridge.speak=proxy;
      try{Object.defineProperty(bridge,'__qilyDdzElderVoiceV166',{value:true,configurable:true});}catch(_error){bridge.__qilyDdzElderVoiceV166=true;}
      nativeVoicePatched=true;
    }catch(_error){}
  }
  function installVoiceGuard(){installBrowserVoiceGuard();installNativeVoiceGuard();}
  function primeVoice(){
    if(voicePrimeDone)return;
    voicePrimeDone=true;
    installVoiceGuard();
    try{
      const synth=window.speechSynthesis;
      if(!synth||!window.SpeechSynthesisUtterance)return;
      const utterance=new SpeechSynthesisUtterance(' ');
      utterance.lang='zh-CN';utterance.rate=VOICE_RATE;utterance.pitch=1;utterance.volume=.01;
      const voice=chooseChineseVoice(synth,null);if(voice)utterance.voice=voice;
      synth.speak(utterance);
    }catch(_error){}
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
      root.dataset.ddzGameplayLandscape='v166';
      ensureHome();
      requestAnimationFrame(()=>window.QilyLeanV120?.fitHand?.());
    }else{
      delete root.dataset.ddzGameplayLandscape;
    }
    if(root.classList.contains(VIRTUAL))ensureHome();
    installVoiceGuard();
  }

  ensureStyle();
  ensureHome();
  installVoiceGuard();
  sync();
  window.addEventListener('resize',sync,{passive:true});
  window.visualViewport?.addEventListener?.('resize',sync,{passive:true});
  window.visualViewport?.addEventListener?.('scroll',sync,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(sync,100));
  window.addEventListener('pageshow',sync,{passive:true});
  document.addEventListener('qily:shell-ready',sync,{passive:true});
  document.addEventListener('pointerdown',primeVoice,{once:true,capture:true,passive:true});
  document.addEventListener('touchstart',primeVoice,{once:true,capture:true,passive:true});
  document.addEventListener('click',primeVoice,{once:true,capture:true});
  let voiceAttempts=0;
  const voiceRetry=setInterval(()=>{installVoiceGuard();voiceAttempts++;if((browserVoicePatched||nativeVoicePatched)||voiceAttempts>=20)clearInterval(voiceRetry);},350);

  window.QilyLeanDdzMobileLandscape=Object.freeze({version:'1.6.6',sync});
  window.QilyLeanDdzElderGuardV166=Object.freeze({version:'1.6.6',voiceRate:VOICE_RATE,describeFullRankPlay,primeVoice,sync});
})();
