#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const visualRuntimeFile=path.join(root,'tools','pure-ddz','game','js','visual-v120.js');
const gameFile=path.join(root,'tools','pure-ddz','game','js','game.js');
const visualFile=path.join(root,'tools','pure-ddz','game','css','visual-tuning-v158.css');
const materializerFile=path.join(root,'scripts','materialize-ddz-public-ui-20260824.js');
const homeEntryFile=path.join(root,'scripts','materialize-pure-ddz-home-entry-v158.js');
const indexFile=path.join(root,'tools','pure-ddz','index.html');
const homeCardFile=path.join(root,'times26001-home-card.js');
const CACHE='20260903-ddz-fast-knowledge-v155-v158-v159-v160-v161-v162-v163';

function read(file){return fs.readFileSync(file,'utf8');}
function write(file,content){fs.writeFileSync(file,content.endsWith('\n')?content:content+'\n');}
function replaceRequired(source,oldText,newText,label){
  if(source.includes(newText))return source;
  if(!source.includes(oldText))throw new Error(`V163 ${label}: source anchor missing`);
  return source.replace(oldText,newText);
}

let runtime=read(visualRuntimeFile);
if(!runtime.includes('function ensureRoundMetaPlacement(')){
  const helpers=`  function ensureRoundMetaPlacement(profile=syncViewportProfile()){
    const meta=document.querySelector('.round-meta'),center=document.querySelector('.center-area'),heading=document.querySelector('.ddz-page-heading>div');
    if(!meta||!center||!heading)return;
    const useHeading=!profile.mobile&&!profile.landscape;
    if(useHeading){
      if(meta.parentElement!==heading){const copy=heading.querySelector(':scope>p:last-child');heading.insertBefore(meta,copy||null);}
      meta.dataset.v163Placement='heading';
    }else{
      if(meta.parentElement!==center)center.insertBefore(meta,center.firstChild);
      meta.dataset.v163Placement='table';
    }
  }
  function ensureTurnTimer(){
    let timer=$('v163-turn-timer');if(timer)return timer;
    const actions=document.querySelector('.ddz-toolbar .top-actions');if(!actions)return null;
    timer=document.createElement('div');timer.id='v163-turn-timer';timer.className='v163-turn-timer';timer.setAttribute('role','timer');timer.setAttribute('aria-live','polite');timer.setAttribute('aria-label','出牌倒计时');timer.textContent='⏱ 计时';
    actions.insertBefore(timer,actions.firstChild);return timer;
  }
  function updateTurnTimer(state){
    const timer=ensureTurnTimer();if(!timer)return;
    const active=state?.phase==='playing'&&state.current===0&&Number(state.humanDeadline)>0;
    if(active){const remaining=Math.max(0,Math.ceil((Number(state.humanDeadline)-Date.now())/1000));timer.textContent=\`⏱ \${remaining}秒\`;timer.classList.add('active');timer.setAttribute('aria-label',\`出牌倒计时\${remaining}秒\`);}
    else{timer.textContent='⏱ 计时';timer.classList.remove('active');timer.setAttribute('aria-label','出牌计时器');}
  }
`;
  runtime=replaceRequired(runtime,'  function playSignature(play){',helpers+'  function playSignature(play){','visual helpers');
}
runtime=replaceRequired(
  runtime,
  "  function refresh(){if(!window.PureDDZTest)return;ensureVisualStage();ensureSettingsToggle();ensureStatsReset();normalizeCopy();updateOrientationUi();const state=window.PureDDZTest.getState();updateHintUi(state);",
  "  function refresh(){if(!window.PureDDZTest)return;ensureVisualStage();ensureSettingsToggle();ensureStatsReset();normalizeCopy();const profile=syncViewportProfile();ensureRoundMetaPlacement(profile);updateOrientationUi();const state=window.PureDDZTest.getState();updateTurnTimer(state);updateHintUi(state);",
  'refresh integration'
);
runtime=replaceRequired(
  runtime,
  '  function onViewportChanged(){updateOrientationUi();fitHand()}',
  '  function onViewportChanged(){const profile=syncViewportProfile();ensureRoundMetaPlacement(profile);updateOrientationUi();fitHand()}',
  'viewport placement sync'
);
runtime=replaceRequired(
  runtime,
  '  function start(){ensureVisualStage();ensureScrollCue();ensureSettingsToggle();ensureStatsReset();normalizeCopy();bindLandscapeControls();updateOrientationUi();',
  '  function start(){ensureVisualStage();ensureScrollCue();ensureSettingsToggle();ensureStatsReset();normalizeCopy();ensureTurnTimer();ensureRoundMetaPlacement(syncViewportProfile());bindLandscapeControls();updateOrientationUi();',
  'startup integration'
);
for(const token of ['function ensureRoundMetaPlacement(','function ensureTurnTimer(){','function updateTurnTimer(state){',"timer.id='v163-turn-timer'","meta.dataset.v163Placement='heading'"]){if(!runtime.includes(token))throw new Error(`V163 runtime token missing: ${token}`);}
write(visualRuntimeFile,runtime);

let game=read(gameFile);
game=replaceRequired(
  game,
  "    $('status').textContent=`轮到你出牌 · ${remaining}秒`;",
  "    $('status').textContent='轮到你出牌';",
  'separate status from timer'
);
if(!game.includes("$('status').textContent='轮到你出牌';"))throw new Error('V163 separated status copy missing');
write(gameFile,game);

let visual=read(visualFile);
if(!visual.includes('V163｜Header-aligned round meta + dedicated timer + full selected-card visibility')){
  visual += `

/* V163｜Header-aligned round meta + dedicated timer + full selected-card visibility｜2026-09-03
 * Desktop moves round/base/multiplier into the title row through the existing visual runtime.
 * Mobile keeps the meta inside the table because the title strip is intentionally hidden in landscape.
 * The timer reuses QilyLean capsule language and selected cards must remain fully visible.
 */
@media (min-width:1181px){
  html:not(.ddz-mobile-landscape):not(.ddz-mobile-portrait):not(.ddz-ios-virtual-landscape) body.ddz-site-page .ddz-page-heading>div{
    grid-template-columns:auto auto auto minmax(0,1fr)!important;
    grid-template-areas:"eyebrow title round copy"!important;
    column-gap:12px!important;
  }
  html:not(.ddz-mobile-landscape):not(.ddz-mobile-portrait):not(.ddz-ios-virtual-landscape) body.ddz-site-page .ddz-page-heading .round-meta{
    grid-area:round!important;
    position:relative!important;
    z-index:6!important;
    transform:none!important;
    margin:0!important;
    align-self:center!important;
    justify-self:center!important;
    flex-wrap:nowrap!important;
    gap:5px!important;
    white-space:nowrap!important;
  }
  html:not(.ddz-mobile-landscape):not(.ddz-mobile-portrait):not(.ddz-ios-virtual-landscape) body.ddz-site-page .ddz-page-heading .round-meta span{
    padding:3px 8px!important;
    min-height:24px!important;
    display:inline-flex!important;
    align-items:center!important;
    border:1px solid rgba(15,75,90,.28)!important;
    background:#eef7f5!important;
    color:#0f4b5a!important;
    -webkit-text-fill-color:#0f4b5a!important;
    font-size:12px!important;
    line-height:1!important;
  }
  html:not(.ddz-mobile-landscape):not(.ddz-mobile-portrait):not(.ddz-ios-virtual-landscape) body.ddz-site-page .ddz-page-heading .round-meta b{color:#0f4b5a!important;-webkit-text-fill-color:#0f4b5a!important}
  html body.ddz-site-page .ddz-toolbar .top-actions .v163-turn-timer{
    position:absolute!important;
    right:calc(100% + 18px)!important;
    top:50%!important;
    transform:translateY(-50%)!important;
    display:inline-flex!important;
    align-items:center!important;
    justify-content:center!important;
    min-width:148px!important;
    height:34px!important;
    padding:3px 14px!important;
    border:1px solid rgba(255,227,155,.48)!important;
    border-radius:999px!important;
    background:rgba(255,255,255,.075)!important;
    color:#ffe39b!important;
    -webkit-text-fill-color:#ffe39b!important;
    box-shadow:0 4px 12px rgba(0,0,0,.12)!important;
    font-size:14px!important;
    font-weight:950!important;
    line-height:1!important;
    white-space:nowrap!important;
    pointer-events:none!important;
  }
  html body.ddz-site-page .ddz-toolbar .top-actions .v163-turn-timer.active{
    border-color:#ffe39b!important;
    background:#0f4b5a!important;
    color:#fff!important;
    -webkit-text-fill-color:#fff!important;
    box-shadow:0 6px 16px rgba(15,75,90,.24)!important;
  }
  html body.ddz-site-page #me-panel.me-player,
  html body.ddz-site-page #hand.hand{overflow:visible!important}
  html body.ddz-site-page #hand.hand .card.selected{
    z-index:30!important;
    transform:translateY(-24px) scale(1.02)!important;
    box-shadow:0 14px 24px rgba(0,0,0,.28)!important;
  }
}
@media (min-width:901px) and (max-width:1180px){
  html body.ddz-site-page .ddz-toolbar .top-actions .v163-turn-timer{
    position:absolute!important;right:calc(100% + 8px)!important;top:50%!important;transform:translateY(-50%)!important;
    display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:104px!important;height:32px!important;padding:3px 9px!important;
    border:1px solid rgba(255,227,155,.48)!important;border-radius:999px!important;background:rgba(255,255,255,.075)!important;color:#ffe39b!important;-webkit-text-fill-color:#ffe39b!important;font-size:12px!important;font-weight:950!important;white-space:nowrap!important;pointer-events:none!important;
  }
  html body.ddz-site-page .ddz-toolbar .top-actions .v163-turn-timer.active{background:#0f4b5a!important;color:#fff!important;-webkit-text-fill-color:#fff!important;border-color:#ffe39b!important}
  html body.ddz-site-page #me-panel.me-player,html body.ddz-site-page #hand.hand{overflow:visible!important}
  html body.ddz-site-page #hand.hand .card.selected{z-index:30!important;transform:translateY(-20px) scale(1.02)!important}
}
html.ddz-mobile-landscape body.ddz-site-page .ddz-toolbar .top-actions .v163-turn-timer{
  position:static!important;transform:none!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;
  min-width:calc(58px * var(--ddz-ls,1))!important;height:calc(30px * var(--ddz-ls,1))!important;padding:2px calc(5px * var(--ddz-ls,1))!important;
  border:1px solid rgba(255,227,155,.5)!important;border-radius:999px!important;background:rgba(255,255,255,.07)!important;color:#ffe39b!important;-webkit-text-fill-color:#ffe39b!important;font-size:calc(10px * var(--ddz-ls,1))!important;font-weight:950!important;white-space:nowrap!important;pointer-events:none!important;
}
html.ddz-mobile-landscape body.ddz-site-page .ddz-toolbar .top-actions .v163-turn-timer.active{background:#0f4b5a!important;color:#fff!important;-webkit-text-fill-color:#fff!important}
html.ddz-mobile-landscape body.ddz-site-page #hand.hand .card.selected{z-index:30!important;transform:translateY(calc(-4px * var(--ddz-ls,1))) scale(1.01)!important}
html.ddz-ios-virtual-landscape body.ddz-site-page .ddz-toolbar .top-actions .v163-turn-timer{
  position:static!important;transform:none!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:52px!important;height:26px!important;padding:2px 4px!important;border:1px solid rgba(255,227,155,.5)!important;border-radius:999px!important;background:rgba(255,255,255,.07)!important;color:#ffe39b!important;-webkit-text-fill-color:#ffe39b!important;font-size:9px!important;font-weight:950!important;white-space:nowrap!important;pointer-events:none!important;
}
html.ddz-ios-virtual-landscape body.ddz-site-page .ddz-toolbar .top-actions .v163-turn-timer.active{background:#0f4b5a!important;color:#fff!important;-webkit-text-fill-color:#fff!important}
html.ddz-ios-virtual-landscape body.ddz-site-page #hand.hand .card.selected{z-index:30!important;transform:translateY(-3px) scale(1.01)!important}
`;
}
for(const token of ['V163｜Header-aligned round meta + dedicated timer + full selected-card visibility','.ddz-page-heading .round-meta','.v163-turn-timer.active','#hand.hand .card.selected']){if(!visual.includes(token))throw new Error(`V163 visual token missing: ${token}`);}
write(visualFile,visual);

for(const file of [materializerFile,homeEntryFile]){
  let source=read(file);
  source=source.replace(/const CACHE='[^']+';/,`const CACHE='${CACHE}';`);
  write(file,source);
}

execFileSync(process.execPath,[materializerFile],{cwd:root,stdio:'inherit'});
execFileSync(process.execPath,[homeEntryFile],{cwd:root,stdio:'inherit'});

let homeCard=read(homeCardFile);
homeCard=homeCard.replace(/20260903-ddz-fast-knowledge-v155-v158-v159-v160-v161(?:-v162)*(?:-v163)*/g,CACHE);
write(homeCardFile,homeCard);
let index=read(indexFile);
index=index.replace(/20260903-ddz-fast-knowledge-v155-v158-v159-v160-v161(?:-v162)*(?:-v163)*/g,CACHE);
write(indexFile,index);

const cssBundle=read(path.join(root,'tools','pure-ddz','game','css','ddz-core-v155.css'));
const jsBundle=read(path.join(root,'tools','pure-ddz','game','js','ddz-core-v155.js'));
for(const token of ['V163｜Header-aligned round meta + dedicated timer + full selected-card visibility','.v163-turn-timer.active','#hand.hand .card.selected'])if(!cssBundle.includes(token))throw new Error(`V163 CSS bundle token missing: ${token}`);
for(const token of ['function ensureRoundMetaPlacement(','function ensureTurnTimer(){','function updateTurnTimer(state){',"$('status').textContent='轮到你出牌';"] )if(!jsBundle.includes(token))throw new Error(`V163 JS bundle token missing: ${token}`);
if(!read(indexFile).includes(CACHE))throw new Error('V163 index cache missing');
if(!read(homeCardFile).includes(CACHE))throw new Error('V163 homepage prefetch cache missing');
console.log('Pure DDZ V163 materialized: title-row round meta + dedicated timer capsule + full selected-card visibility + mobile landscape preservation.');
