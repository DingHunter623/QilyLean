(() => {
  'use strict';
  if(window.__qilyDdzGameUxV168)return;
  window.__qilyDdzGameUxV168=true;

  const VERSION='1.6.8';
  const MUSIC_KEY='pure_ddz_music_v168';
  const STYLE_ID='qilyDdzGameUxV168Style';
  const ROOT=document.documentElement;
  const $=id=>document.getElementById(id);
  const rankVoice=rank=>({3:'3',4:'4',5:'5',6:'6',7:'7',8:'8',9:'9',10:'10',11:'勾',12:'Q',13:'K',14:'尖',15:'2',16:'小王',17:'大王'}[rank]||String(rank??''));

  let musicEnabled=loadMusicPreference();
  let musicCtx=null;
  let musicMaster=null;
  let musicTimer=null;
  let duckTimer=null;
  let phraseIndex=0;
  let legacyChangePass=false;
  let suppressClickUntil=0;
  let internalCardClick=false;
  let drag=null;

  function loadMusicPreference(){
    try{
      const own=localStorage.getItem(MUSIC_KEY);
      if(own!==null)return own!=='0';
      const legacy=localStorage.getItem('pure_ddz_music_v167');
      return legacy===null?true:legacy!=='0';
    }catch(_error){return true;}
  }
  function saveMusicPreference(){try{localStorage.setItem(MUSIC_KEY,musicEnabled?'1':'0');}catch(_error){}}
  function gamePhase(){try{return window.PureDDZTest?.getState?.().phase||'idle';}catch(_error){return'idle';}}

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* V168｜桌面100%一屏、喜庆音乐、自然牌型播报、稳定连续拖选 */
      html body.ddz-site-page #v120-play-stage{display:none!important}
      html body.ddz-site-page #center-play .played-cards{display:none!important}
      html body.ddz-site-page #center-play{min-height:0!important;height:auto!important;padding:0!important;margin:0!important;border:0!important;background:transparent!important;box-shadow:none!important;overflow:visible!important}
      html body.ddz-site-page #center-play .play-owner{margin:2px auto 0!important;padding:3px 8px!important;border-radius:999px!important;background:rgba(4,57,61,.58)!important;color:#fff!important;-webkit-text-fill-color:#fff!important;font-weight:900!important;white-space:nowrap!important}
      html body.ddz-site-page #hand.hand{touch-action:none!important;-webkit-user-select:none!important;user-select:none!important;cursor:default!important}
      html body.ddz-site-page #hand.hand .card{touch-action:none!important;-webkit-user-select:none!important;user-select:none!important;cursor:pointer!important}
      html body.ddz-site-page #hand.hand .qily-card--normal .qily-rank-suit-line{left:4px!important;top:4px!important;transform:none!important;margin:0!important;padding:0!important;white-space:nowrap!important}
      html body.ddz-site-page #hand.hand .qily-card--normal .qily-rank-suit-line b{font-size:clamp(24px,2.15vw,34px)!important;line-height:.9!important;letter-spacing:-.055em!important;font-weight:950!important;white-space:nowrap!important}
      html body.ddz-site-page #hand.hand .qily-card-theme{inset:36px 4px 5px!important}
      html.ddz-mobile-landscape body.ddz-site-page #hand.hand .qily-card--normal .qily-rank-suit-line b{font-size:calc(24px * var(--ddz-ls,1))!important}
      html.ddz-mobile-landscape body.ddz-site-page #hand.hand .qily-card-theme{inset:calc(30px * var(--ddz-ls,1)) 3px 4px!important}
      html.ddz-ios-virtual-landscape body.ddz-site-page #hand.hand .qily-card--normal .qily-rank-suit-line b{font-size:23px!important}
      html.ddz-ios-virtual-landscape body.ddz-site-page #hand.hand .qily-card-theme{inset:29px 3px 4px!important}
      html.ddz-mobile-portrait body.ddz-site-page #hand.hand .qily-card--normal .qily-rank-suit-line b{font-size:clamp(23px,7vw,30px)!important}
      html.ddz-range-selecting,html.ddz-range-selecting body{overscroll-behavior:none!important;cursor:grabbing!important}

      /* Desktop 100% zoom must show the complete game and bottom controls without page scrolling. */
      html.ddz-desktop-game-fit,html.ddz-desktop-game-fit body.ddz-site-page{width:100%!important;height:100%!important;min-height:100%!important;overflow:hidden!important;overscroll-behavior:none!important;background:#062f36!important}
      html.ddz-desktop-game-fit body.ddz-site-page{position:fixed!important;inset:0!important;margin:0!important;padding:0!important}
      html.ddz-desktop-game-fit body.ddz-site-page :is(header.qily-site-header,header.qily-global-header,#floatDock,.qily-float-dock,#qilyGlobalTranslationDualRouteV2,footer.site-footer,.site-footer){display:none!important;visibility:hidden!important;pointer-events:none!important}
      html.ddz-desktop-game-fit body.ddz-site-page .game-shell.ddz-site-module{position:fixed!important;inset:0!important;z-index:2147482600!important;display:flex!important;flex-direction:column!important;width:100vw!important;height:100dvh!important;max-width:none!important;min-width:0!important;min-height:0!important;margin:0!important;padding:5px!important;box-sizing:border-box!important;overflow:hidden!important;background:#eef7f5!important}
      html.ddz-desktop-game-fit body.ddz-site-page .ddz-page-heading,html.ddz-desktop-game-fit body.ddz-site-page .clean-promise{display:none!important}
      html.ddz-desktop-game-fit body.ddz-site-page .ddz-toolbar{flex:0 0 auto!important;width:100%!important;margin:0 0 4px!important;box-sizing:border-box!important}
      html.ddz-desktop-game-fit body.ddz-site-page .ddz-toolbar .top-actions{flex-wrap:nowrap!important}
      html.ddz-desktop-game-fit body.ddz-site-page .game-main{flex:1 1 auto!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;margin:0!important;overflow:hidden!important;box-sizing:border-box!important}
      html.ddz-desktop-game-fit body.ddz-site-page .table-wrap{width:100%!important;height:100%!important;min-height:0!important;max-height:none!important;margin:0!important;box-sizing:border-box!important;overflow:hidden!important}
      html.ddz-desktop-game-fit body.ddz-site-page #me-panel{max-height:46%!important}
      html.ddz-desktop-game-fit body.ddz-site-page #hand.hand{max-height:calc(100% - 54px)!important}
      html.ddz-desktop-game-fit body.ddz-site-page #play-controls,html.ddz-desktop-game-fit body.ddz-site-page #bid-controls{position:relative!important;z-index:20!important;margin-bottom:2px!important}
      html.ddz-desktop-game-fit body.ddz-site-page .modal:not(.hidden){z-index:2147482800!important;overflow:hidden!important;padding:8px!important}
      html.ddz-desktop-game-fit body.ddz-site-page .modal:not(.hidden)>.modal-card{max-height:calc(100dvh - 16px)!important;overflow:auto!important}
      @media (min-width:900px) and (max-height:820px){
        html.ddz-desktop-game-fit body.ddz-site-page .ddz-toolbar{transform:scale(.94)!important;transform-origin:top center!important;margin-bottom:-3px!important}
        html.ddz-desktop-game-fit body.ddz-site-page #hand.hand .qily-card-theme{inset:34px 3px 3px!important}
        html.ddz-desktop-game-fit body.ddz-site-page #hand.hand .qily-card--normal .qily-rank-suit-line b{font-size:clamp(24px,2vw,31px)!important}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureDesktopHome(){
    const actions=document.querySelector('.ddz-toolbar .top-actions');
    if(!actions)return;
    let home=document.getElementById('qilyDdzDesktopHomeV168');
    if(!home){
      home=document.createElement('a');
      home.id='qilyDdzDesktopHomeV168';
      home.href='/';
      home.textContent='首页';
      home.setAttribute('aria-label','返回QilyLean官网首页');
      home.style.cssText='display:inline-flex;align-items:center;justify-content:center;min-height:36px;padding:5px 12px;border:1px solid #caa15f;border-radius:9px;background:#0f4b5a;color:#fff;font-weight:900;text-decoration:none;white-space:nowrap';
      actions.insertBefore(home,actions.firstChild);
    }
  }

  function syncDesktopFit(){
    const desktop=matchMedia('(min-width:900px)').matches && !/Android|iPhone|iPad|iPod|HarmonyOS|Mobile/i.test(navigator.userAgent||'');
    const active=desktop&&gamePhase()!=='idle';
    ROOT.classList.toggle('ddz-desktop-game-fit',active);
    if(active)ensureDesktopHome();
  }

  function ensureMusicContext(){
    try{
      const Ctx=window.AudioContext||window.webkitAudioContext;
      if(!Ctx)return null;
      if(!musicCtx){
        musicCtx=new Ctx();
        musicMaster=musicCtx.createGain();
        musicMaster.gain.value=.58;
        musicMaster.connect(musicCtx.destination);
      }
      if(musicCtx.state==='suspended')void musicCtx.resume();
      return musicCtx;
    }catch(_error){return null;}
  }

  function tone(freq,start,duration,volume=.009,type='triangle'){
    const ctx=ensureMusicContext();
    if(!ctx||!musicMaster)return;
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    const filter=ctx.createBiquadFilter();
    const t=ctx.currentTime+Math.max(0,start);
    osc.type=type;
    osc.frequency.setValueAtTime(freq,t);
    filter.type='lowpass';
    filter.frequency.setValueAtTime(2200,t);
    filter.Q.value=.35;
    gain.gain.setValueAtTime(.0001,t);
    gain.gain.exponentialRampToValueAtTime(volume,t+.025);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0001,volume*.34),t+Math.max(.10,duration*.62));
    gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
    osc.connect(filter).connect(gain).connect(musicMaster);
    osc.start(t);osc.stop(t+duration+.05);
  }

  function playFestivePhrase(){
    if(!musicEnabled||document.hidden||gamePhase()==='idle')return;
    const scale=[392,440,493.88,587.33,659.25,783.99]; // G-A-B-D-E-G pentatonic, bright but not piercing
    const phrases=[
      [0,2,3,4,3,2,0,2,3,5,4,3,2,0,2,3],
      [3,4,5,4,3,2,3,4,2,3,4,3,2,0,2,0],
      [0,0,2,3,4,3,2,0,2,3,4,5,4,3,2,0]
    ];
    const pattern=phrases[phraseIndex++%phrases.length];
    const step=.34;
    pattern.forEach((degree,index)=>{
      const at=index*step;
      tone(scale[degree],at,.26,index%4===0?.0105:.0082,index%3===0?'triangle':'sine');
      if(index%4===0){
        tone(scale[Math.max(0,degree-2)]/2,at,.42,.0048,'sine');
        tone(scale[0]*2,at+.17,.09,.0028,'triangle');
      }
    });
  }

  function startFestiveMusic(){
    if(!musicEnabled||gamePhase()==='idle'||musicTimer)return;
    playFestivePhrase();
    musicTimer=setInterval(playFestivePhrase,6100);
    if(!duckTimer)duckTimer=setInterval(()=>{
      if(!musicMaster||!musicCtx)return;
      let speaking=false;
      try{speaking=Boolean(window.speechSynthesis?.speaking);}catch(_error){}
      musicMaster.gain.setTargetAtTime(speaking?.14:.58,musicCtx.currentTime,.06);
    },160);
  }
  function stopFestiveMusic(){
    if(musicTimer){clearInterval(musicTimer);musicTimer=null;}
    if(musicMaster&&musicCtx)musicMaster.gain.setTargetAtTime(.0001,musicCtx.currentTime,.05);
  }
  function setMusicEnabled(next){
    musicEnabled=Boolean(next);saveMusicPreference();
    if(musicEnabled&&gamePhase()!=='idle')startFestiveMusic();else stopFestiveMusic();
    syncMusicUi();syncAudioButton();
  }
  function forceLegacyMusicOff(){
    const toggle=$('setting-music');if(!toggle)return;
    legacyChangePass=true;toggle.checked=false;toggle.dispatchEvent(new Event('change',{bubbles:true}));legacyChangePass=false;toggle.checked=musicEnabled;
  }
  function syncMusicUi(){
    const toggle=$('setting-music');if(toggle)toggle.checked=musicEnabled;
    const row=toggle?.closest('.setting-row');
    if(row){
      const title=row.querySelector('b'),copy=row.querySelector('small');
      if(title)title.textContent='喜庆背景音乐';
      if(copy)copy.textContent='轻快热闹的节庆氛围，真人语音播报时自动降低音量';
    }
  }
  function syncAudioButton(){
    const audio=$('audio-toggle');if(!audio)return;
    const voice=Boolean($('setting-voice')?.checked),effects=Boolean($('setting-effects')?.checked);
    const on=musicEnabled||voice||effects;
    audio.innerHTML=`${on?'🔊':'🔇'} <span>${on?'声音开':'声音关'}</span>`;
  }
  function bindAudioReplacement(){
    const music=$('setting-music'),audio=$('audio-toggle');
    if(!music||!audio||music.dataset.qilyV168Bound==='1')return;
    forceLegacyMusicOff();
    music.dataset.qilyV168Bound='1';
    music.addEventListener('change',event=>{
      if(legacyChangePass)return;
      event.preventDefault();event.stopImmediatePropagation();setMusicEnabled(event.target.checked);
    },true);
    audio.addEventListener('click',event=>{
      event.preventDefault();event.stopImmediatePropagation();
      const voice=$('setting-voice'),effects=$('setting-effects');
      const anyOn=musicEnabled||Boolean(voice?.checked)||Boolean(effects?.checked),next=!anyOn;
      if(voice){voice.checked=next;voice.dispatchEvent(new Event('change',{bubbles:true}));}
      if(effects){effects.checked=next;effects.dispatchEvent(new Event('change',{bubbles:true}));}
      setMusicEnabled(next);forceLegacyMusicOff();syncMusicUi();syncAudioButton();
    },true);
  }

  function setCardPressed(card,want){
    if(!card)return;
    const current=card.getAttribute('aria-pressed')==='true';
    if(current===want)return;
    internalCardClick=true;
    try{card.click();}finally{internalCardClick=false;}
  }
  function handCards(){return [...document.querySelectorAll('#hand .card')];}
  function nearestCardIndex(x,y,cards){
    const hit=document.elementFromPoint(x,y)?.closest?.('#hand .card');
    if(hit){const index=cards.indexOf(hit);if(index>=0)return index;}
    let best=-1,bestDistance=Infinity;
    cards.forEach((card,index)=>{
      const r=card.getBoundingClientRect();
      const cx=Math.max(r.left,Math.min(x,r.right));
      const cy=Math.max(r.top,Math.min(y,r.bottom));
      const d=(cx-x)*(cx-x)+(cy-y)*(cy-y);
      if(d<bestDistance){best=index;bestDistance=d;}
    });
    return best;
  }
  function applyDragRange(endIndex){
    if(!drag||endIndex<0)return;
    const cards=handCards();
    if(cards.length!==drag.original.length)return;
    const lo=Math.min(drag.startIndex,endIndex),hi=Math.max(drag.startIndex,endIndex);
    cards.forEach((card,index)=>{
      const want=index>=lo&&index<=hi?drag.want:drag.original[index];
      setCardPressed(card,want);
    });
    drag.endIndex=endIndex;
  }
  function bindContinuousSelection(){
    const hand=$('hand');
    if(!hand||hand.dataset.qilyV168Drag==='1')return;
    hand.dataset.qilyV168Drag='1';
    hand.addEventListener('pointerdown',event=>{
      const card=event.target.closest?.('.card');
      if(!card||!hand.contains(card))return;
      if(event.pointerType==='mouse'&&event.button!==0)return;
      const cards=handCards(),startIndex=cards.indexOf(card);
      if(startIndex<0)return;
      drag={pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,startIndex,endIndex:startIndex,want:card.getAttribute('aria-pressed')!=='true',original:cards.map(item=>item.getAttribute('aria-pressed')==='true'),active:false};
      try{hand.setPointerCapture(event.pointerId);}catch(_error){}
    },true);
    hand.addEventListener('pointermove',event=>{
      if(!drag||event.pointerId!==drag.pointerId)return;
      const dx=event.clientX-drag.startX,dy=event.clientY-drag.startY;
      if(!drag.active&&Math.hypot(dx,dy)>=4){
        drag.active=true;ROOT.classList.add('ddz-range-selecting');applyDragRange(drag.startIndex);
      }
      if(!drag.active)return;
      event.preventDefault();
      const cards=handCards();
      const end=nearestCardIndex(event.clientX,event.clientY,cards);
      if(end>=0&&end!==drag.endIndex)applyDragRange(end);
    },{capture:true,passive:false});
    const finish=event=>{
      if(!drag||event.pointerId!==drag.pointerId)return;
      if(drag.active){event.preventDefault();suppressClickUntil=performance.now()+650;}
      try{hand.releasePointerCapture(event.pointerId);}catch(_error){}
      drag=null;ROOT.classList.remove('ddz-range-selecting');
    };
    hand.addEventListener('pointerup',finish,{capture:true,passive:false});
    hand.addEventListener('pointercancel',finish,{capture:true,passive:false});
    hand.addEventListener('lostpointercapture',event=>{if(drag&&event.pointerId===drag.pointerId){drag=null;ROOT.classList.remove('ddz-range-selecting');}},true);
    hand.addEventListener('click',event=>{
      if(internalCardClick)return;
      if(performance.now()<suppressClickUntil){event.preventDefault();event.stopImmediatePropagation();}
    },true);
  }

  function naturalPlayBody(play){
    const combo=play?.combo||{},type=combo.type||'',main=rankVoice(combo.main);
    const groups=new Map();(play?.cards||[]).forEach(card=>groups.set(card.rank,(groups.get(card.rank)||0)+1));
    const ranks=[...groups.keys()].sort((a,b)=>a-b);
    if(type==='rocket')return'王炸';
    if(type==='bomb')return`${main}炸`;
    if(type==='single')return main;
    if(type==='pair')return`对${main}`;
    if(type==='triple')return`三个${main}`;
    if(type==='triple1'){const side=ranks.find(rank=>rank!==combo.main);return`三${main}带${rankVoice(side)}`;}
    if(type==='triple2'){const side=ranks.find(rank=>rank!==combo.main);return`三${main}带对${rankVoice(side)}`;}
    if(type==='straight')return`${rankVoice(ranks[0])}到${rankVoice(ranks.at(-1))}顺子`;
    if(type==='pairStraight')return`${rankVoice(ranks[0])}到${rankVoice(ranks.at(-1))}连对`;
    if(type==='four2'||type==='four2pair'){
      const side=ranks.filter(rank=>rank!==combo.main);
      if(type==='four2pair')return`四${main}带${side.map(rank=>'对'+rankVoice(rank)).join('、')}`;
      return`四${main}带${side.map(rank=>rankVoice(rank)).join('、')}`;
    }
    if(type==='airplane'||type==='airplane1'||type==='airplane2'){
      const triples=ranks.filter(rank=>(groups.get(rank)||0)>=3&&rank<=14);
      const core=triples.length>1?`${rankVoice(triples[0])}到${rankVoice(triples.at(-1))}飞机`:'飞机';
      if(type==='airplane')return core;
      const remain=[];
      groups.forEach((size,rank)=>{let left=size-(triples.includes(rank)?3:0);while(left-->0)remain.push(rank);});
      if(type==='airplane1')return`${core}带${remain.map(rankVoice).join('、')}`;
      const pairs=[];for(let i=0;i<remain.length;i+=2)pairs.push('对'+rankVoice(remain[i]));
      return`${core}带${pairs.join('、')}`;
    }
    return'';
  }
  function naturalPlayText(source){
    const text=String(source||'').trim();
    if(!/^(?:我出|您.*出|左家.*出|右家.*出)/.test(text))return text;
    let play=null;try{play=window.PureDDZTest?.getState?.()?.lastPlay||null;}catch(_error){}
    const body=naturalPlayBody(play);if(!body)return text.replaceAll('钩','勾').replaceAll('A','尖');
    const who=play.player===0?'我出':play.player===1?'左家出':'右家出';
    return`${who}${body}`;
  }
  function copyUtteranceProps(from,to){
    try{to.lang=from.lang||'zh-CN';}catch(_error){}
    try{to.rate=Math.min(.80,Math.max(.62,Number(from.rate)||.76));}catch(_error){}
    try{to.pitch=from.pitch||1;}catch(_error){}
    try{to.volume=from.volume||.95;}catch(_error){}
    try{if(from.voice)to.voice=from.voice;}catch(_error){}
    ['onstart','onend','onerror','onpause','onresume','onmark','onboundary'].forEach(key=>{try{if(from[key])to[key]=from[key];}catch(_error){}});
  }
  function installVoiceGuard(){
    try{
      const synth=window.speechSynthesis;
      if(synth&&window.SpeechSynthesisUtterance&&!synth.speak?.__qilyV168Natural){
        const downstream=synth.speak.bind(synth);
        const proxy=function(utterance){
          const source=String(utterance?.text||'').trim();
          const natural=naturalPlayText(source);
          if(natural!==source){
            const next=new SpeechSynthesisUtterance('\u2060'+natural);
            copyUtteranceProps(utterance,next);
            return downstream(next);
          }
          return downstream(utterance);
        };
        Object.defineProperty(proxy,'__qilyV168Natural',{value:true});
        synth.speak=proxy;
      }
    }catch(_error){}
    try{
      const bridge=window.QilyLeanAndroid;
      if(bridge&&typeof bridge.speak==='function'&&!bridge.speak.__qilyV168Natural){
        const downstream=bridge.speak.bind(bridge);
        const proxy=function(text){
          const source=String(text||'').trim();
          const natural=naturalPlayText(source);
          return downstream(natural!==source?'\u2060'+natural:source);
        };
        Object.defineProperty(proxy,'__qilyV168Natural',{value:true});
        bridge.speak=proxy;
      }
    }catch(_error){}
  }

  function bindLifecycle(){
    ['welcome-start','start','again'].forEach(id=>$(id)?.addEventListener('click',()=>setTimeout(()=>{syncDesktopFit();if(musicEnabled)startFestiveMusic();},0),true));
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stopFestiveMusic();else if(musicEnabled&&gamePhase()!=='idle')startFestiveMusic();});
    const prime=()=>{if(musicEnabled)ensureMusicContext();window.removeEventListener('pointerdown',prime,true);};
    window.addEventListener('pointerdown',prime,true);
    window.addEventListener('resize',syncDesktopFit,{passive:true});
  }

  function installWhenReady(){
    addStyle();bindContinuousSelection();installVoiceGuard();syncDesktopFit();
    if(!window.PureDDZTest||!$('setting-music')||!$('audio-toggle')){setTimeout(installWhenReady,80);return;}
    if(ROOT.dataset.ddzUx!=='v168'){
      bindAudioReplacement();bindContinuousSelection();bindLifecycle();ROOT.dataset.ddzUx='v168';
    }
    syncMusicUi();syncAudioButton();syncDesktopFit();installVoiceGuard();
    if(musicEnabled&&gamePhase()!=='idle')startFestiveMusic();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installWhenReady,{once:true});else installWhenReady();
  setInterval(()=>{installVoiceGuard();syncDesktopFit();},450);

  window.QilyLeanDdzUxV168=Object.freeze({version:VERSION,setMusicEnabled,startMusic:startFestiveMusic,stopMusic:stopFestiveMusic,naturalPlayText});
})();
