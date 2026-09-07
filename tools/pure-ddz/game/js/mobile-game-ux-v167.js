(() => {
  'use strict';
  if(window.__qilyDdzMobileGameUxV167)return;
  window.__qilyDdzMobileGameUxV167=true;

  const VERSION='1.6.7';
  const MUSIC_KEY='pure_ddz_music_v167';
  const STYLE_ID='qilyDdzMobileGameUxV167Style';
  const MUSIC_LOOP_MS=11200;
  const root=document.documentElement;
  const $=id=>document.getElementById(id);
  let musicEnabled=loadMusicPreference();
  let legacyChangePass=false;
  let musicCtx=null;
  let musicMaster=null;
  let musicTimer=null;
  let duckTimer=null;
  let phraseIndex=0;
  let internalCardClick=false;
  let suppressClickUntil=0;
  let drag=null;

  function loadMusicPreference(){
    try{
      const saved=localStorage.getItem(MUSIC_KEY);
      return saved===null?true:saved!=='0';
    }catch(_error){return true;}
  }
  function saveMusicPreference(){try{localStorage.setItem(MUSIC_KEY,musicEnabled?'1':'0');}catch(_error){}}

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* V167 feedback closure: cleaner table + bigger ranks + drag selection */
      html body.ddz-site-page #v120-play-stage{display:none!important}
      html body.ddz-site-page #center-play .played-cards{display:none!important}
      html body.ddz-site-page #center-play{min-height:0!important;height:auto!important;padding:0!important;margin:0!important;border:0!important;background:transparent!important;box-shadow:none!important;overflow:visible!important}
      html body.ddz-site-page #center-play .play-owner{margin:2px auto 0!important;padding:3px 8px!important;border-radius:999px!important;background:rgba(4,57,61,.58)!important;color:#fff!important;-webkit-text-fill-color:#fff!important;font-weight:900!important;white-space:nowrap!important}
      html body.ddz-site-page #hand.hand{touch-action:none!important;-webkit-user-select:none!important;user-select:none!important}
      html body.ddz-site-page #hand.hand .card{touch-action:none!important;-webkit-user-select:none!important;user-select:none!important}
      html body.ddz-site-page #hand.hand .qily-card--normal .qily-rank-suit-line{left:4px!important;top:4px!important;transform:none!important;margin:0!important;padding:0!important;white-space:nowrap!important}
      html body.ddz-site-page #hand.hand .qily-card--normal .qily-rank-suit-line b{font-size:clamp(24px,2.15vw,34px)!important;line-height:.9!important;letter-spacing:-.055em!important;font-weight:950!important;white-space:nowrap!important}
      html body.ddz-site-page #hand.hand .qily-card-theme{inset:36px 4px 5px!important}
      html.ddz-mobile-landscape body.ddz-site-page #hand.hand .qily-card--normal .qily-rank-suit-line b{font-size:calc(24px * var(--ddz-ls,1))!important}
      html.ddz-mobile-landscape body.ddz-site-page #hand.hand .qily-card-theme{inset:calc(30px * var(--ddz-ls,1)) 3px 4px!important}
      html.ddz-ios-virtual-landscape body.ddz-site-page #hand.hand .qily-card--normal .qily-rank-suit-line b{font-size:23px!important}
      html.ddz-ios-virtual-landscape body.ddz-site-page #hand.hand .qily-card-theme{inset:29px 3px 4px!important}
      html.ddz-mobile-portrait body.ddz-site-page #hand.hand .qily-card--normal .qily-rank-suit-line b{font-size:clamp(23px,7vw,30px)!important}
      html.ddz-range-selecting,html.ddz-range-selecting body{overscroll-behavior:none!important}
    `;
    document.head.appendChild(style);
  }

  function gamePhase(){try{return window.PureDDZTest?.getState?.().phase||'idle';}catch(_error){return'idle';}}

  function ensureMusicContext(){
    try{
      const Ctx=window.AudioContext||window.webkitAudioContext;
      if(!Ctx)return null;
      if(!musicCtx){
        musicCtx=new Ctx();
        musicMaster=musicCtx.createGain();
        musicMaster.gain.value=.72;
        musicMaster.connect(musicCtx.destination);
      }
      if(musicCtx.state==='suspended')void musicCtx.resume();
      return musicCtx;
    }catch(_error){return null;}
  }

  function softTone(freq,start,duration,volume=.008,type='sine'){
    const ctx=ensureMusicContext();
    if(!ctx||!musicMaster)return;
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    const filter=ctx.createBiquadFilter();
    const t=ctx.currentTime+Math.max(0,start);
    osc.type=type;
    osc.frequency.setValueAtTime(freq,t);
    filter.type='lowpass';
    filter.frequency.setValueAtTime(type==='triangle'?1550:1200,t);
    filter.Q.value=.35;
    gain.gain.setValueAtTime(.0001,t);
    gain.gain.exponentialRampToValueAtTime(volume,t+.08);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0001,volume*.42),t+Math.max(.15,duration*.72));
    gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
    osc.connect(filter).connect(gain).connect(musicMaster);
    osc.start(t);
    osc.stop(t+duration+.06);
  }

  function playCalmPhrase(){
    if(!musicEnabled||document.hidden||gamePhase()==='idle')return;
    const ctx=ensureMusicContext();
    if(!ctx)return;
    const scale=[261.63,293.66,329.63,392,440,523.25];
    const phrases=[
      [0,2,4,2,1,3,4,2,0,1,2,0],
      [2,3,4,5,4,2,1,2,3,1,0,2],
      [0,1,3,2,4,3,2,1,0,2,3,1]
    ];
    const pattern=phrases[phraseIndex++%phrases.length];
    const step=.78;
    pattern.forEach((degree,index)=>{
      const at=index*step;
      softTone(scale[degree],at,.62,index%4===0?.0085:.0065,index%3===0?'triangle':'sine');
      if(index%4===0)softTone(scale[Math.max(0,degree-2)]/2,at,.95,.0038,'sine');
    });
  }

  function startCalmMusic(){
    if(!musicEnabled||gamePhase()==='idle'||musicTimer)return;
    playCalmPhrase();
    musicTimer=window.setInterval(playCalmPhrase,MUSIC_LOOP_MS);
    if(!duckTimer){
      duckTimer=window.setInterval(()=>{
        if(!musicMaster||!musicCtx)return;
        let speaking=false;
        try{speaking=Boolean(window.speechSynthesis?.speaking);}catch(_error){}
        const target=speaking?.22:.72;
        musicMaster.gain.setTargetAtTime(target,musicCtx.currentTime,.08);
      },180);
    }
  }

  function stopCalmMusic(){
    if(musicTimer){clearInterval(musicTimer);musicTimer=null;}
    if(musicMaster&&musicCtx){musicMaster.gain.setTargetAtTime(.0001,musicCtx.currentTime,.05);}
  }

  function setMusicEnabled(next){
    musicEnabled=Boolean(next);
    saveMusicPreference();
    if(musicEnabled&&gamePhase()!=='idle')startCalmMusic();
    else stopCalmMusic();
    syncMusicUi();
    syncAudioButton();
  }

  function forceLegacyMusicOff(){
    const toggle=$('setting-music');
    if(!toggle)return;
    legacyChangePass=true;
    toggle.checked=false;
    toggle.dispatchEvent(new Event('change',{bubbles:true}));
    legacyChangePass=false;
    toggle.checked=musicEnabled;
  }

  function syncMusicUi(){
    const toggle=$('setting-music');
    if(toggle)toggle.checked=musicEnabled;
    const row=toggle?.closest('.setting-row');
    if(row){
      const title=row.querySelector('b');
      const copy=row.querySelector('small');
      if(title)title.textContent='轻柔背景音乐';
      if(copy)copy.textContent='低音量舒缓纯音乐，不干扰中文语音播报';
    }
  }

  function syncAudioButton(){
    const audio=$('audio-toggle');
    if(!audio)return;
    const voice=Boolean($('setting-voice')?.checked);
    const effects=Boolean($('setting-effects')?.checked);
    const on=musicEnabled||voice||effects;
    audio.innerHTML=`${on?'🔊':'🔇'} <span>${on?'声音开':'声音关'}</span>`;
  }

  function bindAudioReplacement(){
    const music=$('setting-music'),audio=$('audio-toggle');
    if(!music||!audio||music.dataset.qilyV167Bound==='1')return;

    /* Disable legacy square/sawtooth loop once, then keep the visible switch for V167 calm music. */
    forceLegacyMusicOff();
    music.dataset.qilyV167Bound='1';
    music.addEventListener('change',event=>{
      if(legacyChangePass)return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setMusicEnabled(event.target.checked);
    },true);

    audio.addEventListener('click',event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      const voice=$('setting-voice'),effects=$('setting-effects');
      const anyOn=musicEnabled||Boolean(voice?.checked)||Boolean(effects?.checked);
      const next=!anyOn;
      if(voice){voice.checked=next;voice.dispatchEvent(new Event('change',{bubbles:true}));}
      if(effects){effects.checked=next;effects.dispatchEvent(new Event('change',{bubbles:true}));}
      setMusicEnabled(next);
      forceLegacyMusicOff();
      syncMusicUi();
      syncAudioButton();
    },true);

    document.addEventListener('change',event=>{
      if(['setting-voice','setting-effects','setting-font','setting-difficulty'].includes(event.target?.id||'')){
        setTimeout(()=>{syncMusicUi();syncAudioButton();},0);
      }
    },true);
    syncMusicUi();
    syncAudioButton();
  }

  function cardFromPoint(x,y){
    const el=document.elementFromPoint(x,y);
    return el?.closest?.('#hand .card')||null;
  }
  function selectCardId(id,want){
    if(!id)return;
    const card=document.querySelector(`#hand .card[data-id="${String(id).replaceAll('"','\\"')}"]`);
    if(!card)return;
    const current=card.getAttribute('aria-pressed')==='true';
    if(current===want)return;
    internalCardClick=true;
    try{card.click();}finally{internalCardClick=false;}
  }
  function applyDragCard(card){
    if(!drag||!card)return;
    const id=card.dataset.id;
    if(!id||drag.ids.has(id))return;
    drag.ids.add(id);
    selectCardId(id,drag.want);
  }

  function bindContinuousSelection(){
    const hand=$('hand');
    if(!hand||hand.dataset.qilyV167Drag==='1')return;
    hand.dataset.qilyV167Drag='1';

    hand.addEventListener('pointerdown',event=>{
      const card=event.target.closest?.('.card');
      if(!card||!hand.contains(card))return;
      if(event.pointerType==='mouse'&&event.button!==0)return;
      drag={pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,startId:card.dataset.id,want:card.getAttribute('aria-pressed')!=='true',active:false,ids:new Set()};
    },true);

    document.addEventListener('pointermove',event=>{
      if(!drag||event.pointerId!==drag.pointerId)return;
      const dx=event.clientX-drag.startX,dy=event.clientY-drag.startY;
      if(!drag.active&&Math.hypot(dx,dy)>=7){
        drag.active=true;
        root.classList.add('ddz-range-selecting');
        selectCardId(drag.startId,drag.want);
        drag.ids.add(drag.startId);
      }
      if(!drag.active)return;
      event.preventDefault();
      applyDragCard(cardFromPoint(event.clientX,event.clientY));
    },{capture:true,passive:false});

    const endDrag=event=>{
      if(!drag||event.pointerId!==drag.pointerId)return;
      if(drag.active){
        event.preventDefault();
        suppressClickUntil=performance.now()+520;
      }
      drag=null;
      root.classList.remove('ddz-range-selecting');
    };
    document.addEventListener('pointerup',endDrag,{capture:true,passive:false});
    document.addEventListener('pointercancel',endDrag,{capture:true,passive:false});

    hand.addEventListener('click',event=>{
      if(internalCardClick)return;
      if(performance.now()<suppressClickUntil){
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },true);
  }

  function bindGameMusicLifecycle(){
    ['welcome-start','start','again'].forEach(id=>{
      $(id)?.addEventListener('click',()=>setTimeout(()=>{if(musicEnabled)startCalmMusic();},0),true);
    });
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden)stopCalmMusic();
      else if(musicEnabled&&gamePhase()!=='idle')startCalmMusic();
    });
    const prime=()=>{
      if(musicEnabled)ensureMusicContext();
      window.removeEventListener('pointerdown',prime,true);
      window.removeEventListener('touchstart',prime,true);
    };
    window.addEventListener('pointerdown',prime,true);
    window.addEventListener('touchstart',prime,{capture:true,passive:true});
  }

  function installWhenReady(){
    addStyle();
    bindContinuousSelection();
    if(!window.PureDDZTest||!$('setting-music')||!$('audio-toggle')){
      setTimeout(installWhenReady,80);
      return;
    }
    bindAudioReplacement();
    bindContinuousSelection();
    bindGameMusicLifecycle();
    if(musicEnabled&&gamePhase()!=='idle')startCalmMusic();
    root.dataset.ddzUx='v167';
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installWhenReady,{once:true});
  else installWhenReady();

  window.QilyLeanDdzUxV167=Object.freeze({version:VERSION,setMusicEnabled,startMusic:startCalmMusic,stopMusic:stopCalmMusic});
})();
