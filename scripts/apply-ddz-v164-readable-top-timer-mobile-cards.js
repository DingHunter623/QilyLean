#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const runtimeFile=path.join(root,'tools','pure-ddz','game','js','visual-v120.js');
const gameFile=path.join(root,'tools','pure-ddz','game','js','game.js');
const visualFile=path.join(root,'tools','pure-ddz','game','css','visual-tuning-v158.css');
const materializerFile=path.join(root,'scripts','materialize-ddz-public-ui-20260824.js');
const homeEntryFile=path.join(root,'scripts','materialize-pure-ddz-home-entry-v158.js');
const indexFile=path.join(root,'tools','pure-ddz','index.html');
const homeCardFile=path.join(root,'times26001-home-card.js');
const CACHE_OLD='20260903-ddz-fast-knowledge-v155-v158-v159-v160-v161-v162-v163';
const CACHE_NEW=`${CACHE_OLD}-v164`;

function read(file){return fs.readFileSync(file,'utf8');}
function write(file,content){fs.writeFileSync(file,content.endsWith('\n')?content:content+'\n');}
function replaceRequired(source,oldText,newText,label){
  if(source.includes(newText))return source;
  if(!source.includes(oldText))throw new Error(`V164 ${label}: source anchor missing`);
  return source.replace(oldText,newText);
}

let runtime=read(runtimeFile);
const oldTimer=`  function ensureTurnTimer(){
    let timer=$('v163-turn-timer');if(timer)return timer;
    const actions=document.querySelector('.ddz-toolbar .top-actions');if(!actions)return null;
    timer=document.createElement('div');timer.id='v163-turn-timer';timer.className='v163-turn-timer';timer.setAttribute('role','timer');timer.setAttribute('aria-live','polite');timer.setAttribute('aria-label','出牌倒计时');timer.textContent='⏱ 计时';
    actions.insertBefore(timer,actions.firstChild);return timer;
  }
`;
const newTimer=`  function ensureTurnTimer(){
    const toolbar=document.querySelector('.ddz-toolbar'),actions=document.querySelector('.ddz-toolbar .top-actions');
    if(!toolbar||!actions)return null;
    let timer=$('v163-turn-timer');
    if(!timer){timer=document.createElement('div');timer.id='v163-turn-timer';timer.className='v163-turn-timer v164-independent-timer';timer.setAttribute('role','timer');timer.setAttribute('aria-live','polite');timer.setAttribute('aria-label','出牌倒计时');timer.textContent='⏱ 计时';}
    timer.classList.add('v164-independent-timer');
    if(timer.parentElement!==toolbar)toolbar.insertBefore(timer,actions);
    return timer;
  }
`;
runtime=replaceRequired(runtime,oldTimer,newTimer,'independent timer placement');
for(const token of ["className='v163-turn-timer v164-independent-timer'","toolbar.insertBefore(timer,actions)","timer.classList.add('v164-independent-timer')"]){if(!runtime.includes(token))throw new Error(`V164 runtime token missing: ${token}`);}
write(runtimeFile,runtime);

let game=read(gameFile);
if(!game.includes('function voiceRankText(rank)')){
  game=replaceRequired(
    game,
    "  function rankText(rank){return RANK_TEXT[rank]||String(rank??'');}\n",
    "  function rankText(rank){return RANK_TEXT[rank]||String(rank??'');}\n  function voiceRankText(rank){if(rank===14)return'尖';if(rank===11)return'钩';return rankText(rank);}\n",
    'voice rank map'
  );
}
const describeStart=game.indexOf('  function describePlay(play){');
const describeEnd=game.indexOf('\n  function renderHand()',describeStart);
if(describeStart<0||describeEnd<0)throw new Error('V164 describePlay block missing');
let describe=game.slice(describeStart,describeEnd);
describe=describe.replace('main=rankText(combo.main)','main=voiceRankText(combo.main)').replaceAll('rankText(side)','voiceRankText(side)').replaceAll('rankText(ranks[0])','voiceRankText(ranks[0])').replaceAll('rankText(ranks.at(-1))','voiceRankText(ranks.at(-1))').replaceAll('rankText(rank)','voiceRankText(rank)').replaceAll('rankText(tripleRanks[0])','voiceRankText(tripleRanks[0])').replaceAll('rankText(tripleRanks.at(-1))','voiceRankText(tripleRanks.at(-1))');
game=game.slice(0,describeStart)+describe+game.slice(describeEnd);
for(const token of ["function voiceRankText(rank){if(rank===14)return'尖';if(rank===11)return'钩';return rankText(rank);}",'main=voiceRankText(combo.main)']){if(!game.includes(token))throw new Error(`V164 voice token missing: ${token}`);}
write(gameFile,game);

let visual=read(visualFile);
if(!visual.includes('V164｜Independent timer + larger top typography + mobile card readability')){
  visual += `

/* V164｜Independent timer + larger top typography + mobile card readability｜2026-09-03
 * Screenshot closure: the timer is a true toolbar grid item, never overlaid on “清零”.
 * Top-fold typography is enlarged without changing the approved QilyLean VI language.
 * Mobile landscape bottom cards and played cards prioritize rank/suit and knowledge readability.
 */
@media (min-width:1181px){
  html body.ddz-site-page .ddz-page-heading{height:46px!important;min-height:46px!important;padding:4px 12px!important}
  html body.ddz-site-page .ddz-page-heading .ddz-eyebrow{font-size:11.5px!important}
  html body.ddz-site-page .ddz-page-heading h1{font-size:24px!important}
  html body.ddz-site-page .ddz-page-heading>div>p:last-child{font-size:13px!important}
  html:not(.ddz-mobile-landscape):not(.ddz-mobile-portrait):not(.ddz-ios-virtual-landscape) body.ddz-site-page .ddz-page-heading .round-meta span{min-height:28px!important;padding:4px 10px!important;font-size:14px!important;font-weight:950!important}

  html body.ddz-site-page .ddz-toolbar{
    grid-template-columns:minmax(580px,640px) minmax(150px,1fr) auto!important;
    min-height:48px!important;height:48px!important;gap:10px!important;padding:2px 7px!important;
  }
  html body.ddz-site-page .ddz-toolbar .scoreboard{grid-column:1!important;grid-template-columns:repeat(4,minmax(116px,1fr))!important;gap:7px!important}
  html body.ddz-site-page .ddz-toolbar .scoreboard div,
  html body.ddz-site-page #v120-reset-stats{min-height:40px!important;height:40px!important;padding:2px 9px!important}
  html body.ddz-site-page .ddz-toolbar .scoreboard small{font-size:14px!important;font-weight:900!important}
  html body.ddz-site-page .ddz-toolbar .scoreboard strong{font-size:22px!important;font-weight:950!important}
  html body.ddz-site-page #v120-reset-stats{font-size:17px!important;letter-spacing:.02em!important}
  html body.ddz-site-page .ddz-toolbar>.v163-turn-timer.v164-independent-timer{
    grid-column:2!important;grid-row:1!important;position:static!important;right:auto!important;top:auto!important;transform:none!important;
    justify-self:center!important;align-self:center!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;
    min-width:160px!important;height:40px!important;padding:4px 18px!important;border:1px solid rgba(255,227,155,.62)!important;border-radius:999px!important;
    background:rgba(255,255,255,.075)!important;color:#ffe39b!important;-webkit-text-fill-color:#ffe39b!important;box-shadow:0 5px 14px rgba(0,0,0,.14)!important;
    font-size:17px!important;font-weight:950!important;line-height:1!important;white-space:nowrap!important;pointer-events:none!important;
  }
  html body.ddz-site-page .ddz-toolbar>.v163-turn-timer.v164-independent-timer.active{background:#0f4b5a!important;border-color:#ffe39b!important;color:#fff!important;-webkit-text-fill-color:#fff!important;box-shadow:0 7px 18px rgba(15,75,90,.28)!important}
  html body.ddz-site-page .ddz-toolbar .top-actions{grid-column:3!important;justify-self:end!important;position:relative!important}
  html body.ddz-site-page .ddz-toolbar :is(#audio-toggle,#help-open,#settings-open,#v120-landscape-toggle,.start-btn){height:40px!important;min-height:40px!important;padding:5px 13px!important;font-size:16px!important;font-weight:950!important}
}

@media (min-width:901px) and (max-width:1180px){
  html body.ddz-site-page .ddz-page-heading h1{font-size:22px!important}
  html body.ddz-site-page .ddz-page-heading .ddz-eyebrow{font-size:10.5px!important}
  html body.ddz-site-page .ddz-page-heading>div>p:last-child{font-size:12px!important}
  html body.ddz-site-page .ddz-toolbar{grid-template-columns:minmax(390px,1.15fr) minmax(105px,.45fr) auto!important;min-height:48px!important;gap:6px!important}
  html body.ddz-site-page .ddz-toolbar .scoreboard{grid-column:1!important;grid-template-columns:repeat(4,minmax(84px,1fr))!important}
  html body.ddz-site-page .ddz-toolbar .scoreboard small{font-size:12.5px!important}
  html body.ddz-site-page .ddz-toolbar .scoreboard strong{font-size:19px!important}
  html body.ddz-site-page #v120-reset-stats{font-size:15px!important}
  html body.ddz-site-page .ddz-toolbar>.v163-turn-timer.v164-independent-timer{grid-column:2!important;grid-row:1!important;position:static!important;transform:none!important;justify-self:center!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:108px!important;height:36px!important;padding:3px 10px!important;border:1px solid rgba(255,227,155,.56)!important;border-radius:999px!important;background:rgba(255,255,255,.075)!important;color:#ffe39b!important;-webkit-text-fill-color:#ffe39b!important;font-size:14px!important;font-weight:950!important;white-space:nowrap!important;pointer-events:none!important}
  html body.ddz-site-page .ddz-toolbar>.v163-turn-timer.v164-independent-timer.active{background:#0f4b5a!important;color:#fff!important;-webkit-text-fill-color:#fff!important;border-color:#ffe39b!important}
  html body.ddz-site-page .ddz-toolbar .top-actions{grid-column:3!important;justify-self:end!important}
  html body.ddz-site-page .ddz-toolbar :is(#audio-toggle,#help-open,#settings-open,#v120-landscape-toggle,.start-btn){font-size:14.5px!important;font-weight:950!important}
}

html.ddz-mobile-landscape body.ddz-site-page .ddz-toolbar{
  grid-template-columns:minmax(calc(245px * var(--ddz-ls,1)),calc(330px * var(--ddz-ls,1))) auto minmax(0,1fr)!important;
  gap:3px!important;
}
html.ddz-mobile-landscape body.ddz-site-page .ddz-toolbar .scoreboard{grid-column:1!important;grid-template-columns:repeat(4,minmax(calc(55px * var(--ddz-ls,1)),1fr))!important;gap:2px!important}
html.ddz-mobile-landscape body.ddz-site-page .ddz-toolbar .scoreboard div,
html.ddz-mobile-landscape body.ddz-site-page #v120-reset-stats{min-height:calc(32px * var(--ddz-ls,1))!important;height:calc(32px * var(--ddz-ls,1))!important;padding:2px calc(4px * var(--ddz-ls,1))!important}
html.ddz-mobile-landscape body.ddz-site-page .ddz-toolbar .scoreboard small{font-size:calc(11.5px * var(--ddz-ls,1))!important}
html.ddz-mobile-landscape body.ddz-site-page .ddz-toolbar .scoreboard strong{font-size:calc(17px * var(--ddz-ls,1))!important}
html.ddz-mobile-landscape body.ddz-site-page #v120-reset-stats{font-size:calc(12px * var(--ddz-ls,1))!important}
html.ddz-mobile-landscape body.ddz-site-page .ddz-toolbar>.v163-turn-timer.v164-independent-timer{grid-column:2!important;grid-row:1!important;position:static!important;transform:none!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:calc(68px * var(--ddz-ls,1))!important;height:calc(31px * var(--ddz-ls,1))!important;padding:2px calc(6px * var(--ddz-ls,1))!important;border:1px solid rgba(255,227,155,.56)!important;border-radius:999px!important;background:rgba(255,255,255,.075)!important;color:#ffe39b!important;-webkit-text-fill-color:#ffe39b!important;font-size:calc(11.5px * var(--ddz-ls,1))!important;font-weight:950!important;white-space:nowrap!important;pointer-events:none!important}
html.ddz-mobile-landscape body.ddz-site-page .ddz-toolbar>.v163-turn-timer.v164-independent-timer.active{background:#0f4b5a!important;color:#fff!important;-webkit-text-fill-color:#fff!important;border-color:#ffe39b!important}
html.ddz-mobile-landscape body.ddz-site-page .ddz-toolbar .top-actions{grid-column:3!important;grid-row:1!important;justify-self:end!important}
html.ddz-mobile-landscape body.ddz-site-page .ddz-toolbar :is(#audio-toggle,#help-open,#settings-open,.start-btn){font-size:calc(12.5px * var(--ddz-ls,1))!important;font-weight:950!important}

html.ddz-mobile-landscape body.ddz-site-page .bottom-cards{min-height:calc(76px * var(--ddz-ls,1))!important;gap:4px!important}
html.ddz-mobile-landscape body.ddz-site-page .bottom-cards>.mini-card{flex:0 0 calc(52px * var(--ddz-ls,1))!important;min-width:calc(52px * var(--ddz-ls,1))!important;width:calc(52px * var(--ddz-ls,1))!important;max-width:calc(52px * var(--ddz-ls,1))!important;height:calc(72px * var(--ddz-ls,1))!important;min-height:calc(72px * var(--ddz-ls,1))!important;max-height:calc(72px * var(--ddz-ls,1))!important;padding:3px 4px!important;margin:2px!important}
html.ddz-mobile-landscape body.ddz-site-page .bottom-cards>.qily-mini-business b{font-size:calc(17px * var(--ddz-ls,1))!important;line-height:1!important}
html.ddz-mobile-landscape body.ddz-site-page .bottom-cards>.qily-mini-business small{font-size:calc(7.4px * var(--ddz-ls,1))!important;line-height:1.05!important;font-weight:850!important}
html.ddz-mobile-landscape body.ddz-site-page .v120-play-stage{min-height:calc(108px * var(--ddz-ls,1))!important;max-height:calc(132px * var(--ddz-ls,1))!important}
html.ddz-mobile-landscape body.ddz-site-page .v120-play-card{flex:0 0 calc(58px * var(--ddz-ls,1))!important;width:calc(58px * var(--ddz-ls,1))!important;height:calc(84px * var(--ddz-ls,1))!important;margin-left:calc(-5px * var(--ddz-ls,1))!important}
html.ddz-mobile-landscape body.ddz-site-page .v120-play-card .qily-card-corner{left:3px!important;top:3px!important}
html.ddz-mobile-landscape body.ddz-site-page .v120-play-card .qily-card--normal .qily-rank-suit-line b{font-size:calc(18px * var(--ddz-ls,1))!important;line-height:.95!important}
html.ddz-mobile-landscape body.ddz-site-page .v120-play-card .qily-card-theme{inset:27px 3px 7px!important;gap:1px!important}
html.ddz-mobile-landscape body.ddz-site-page .v120-play-card .qily-card-theme>small{font-size:calc(5.5px * var(--ddz-ls,1))!important}
html.ddz-mobile-landscape body.ddz-site-page .v120-play-card .qily-card-theme>strong{font-size:calc(10px * var(--ddz-ls,1))!important;line-height:1.02!important}
html.ddz-mobile-landscape body.ddz-site-page .v120-play-card .qily-card-theme>b{font-size:calc(7px * var(--ddz-ls,1))!important;line-height:1.05!important}
html.ddz-mobile-landscape body.ddz-site-page .v120-play-card .qily-card-theme>em{font-size:calc(5.4px * var(--ddz-ls,1))!important;line-height:1.05!important}

html.ddz-ios-virtual-landscape:root:root body.ddz-site-page .ddz-toolbar{grid-template-columns:250px 62px minmax(0,1fr)!important;gap:3px!important}
html.ddz-ios-virtual-landscape:root:root body.ddz-site-page .ddz-toolbar .scoreboard{grid-column:1!important;grid-template-columns:repeat(4,minmax(54px,1fr))!important;gap:2px!important}
html.ddz-ios-virtual-landscape:root:root body.ddz-site-page .ddz-toolbar .scoreboard small{font-size:10.5px!important}
html.ddz-ios-virtual-landscape:root:root body.ddz-site-page .ddz-toolbar .scoreboard strong{font-size:15.5px!important}
html.ddz-ios-virtual-landscape:root:root body.ddz-site-page #v120-reset-stats{font-size:11px!important;min-height:29px!important;height:29px!important}
html.ddz-ios-virtual-landscape:root:root body.ddz-site-page .ddz-toolbar>.v163-turn-timer.v164-independent-timer{grid-column:2!important;grid-row:1!important;position:static!important;transform:none!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:60px!important;height:28px!important;padding:2px 4px!important;border:1px solid rgba(255,227,155,.56)!important;border-radius:999px!important;background:rgba(255,255,255,.075)!important;color:#ffe39b!important;-webkit-text-fill-color:#ffe39b!important;font-size:10px!important;font-weight:950!important;white-space:nowrap!important;pointer-events:none!important}
html.ddz-ios-virtual-landscape:root:root body.ddz-site-page .ddz-toolbar>.v163-turn-timer.v164-independent-timer.active{background:#0f4b5a!important;color:#fff!important;-webkit-text-fill-color:#fff!important;border-color:#ffe39b!important}
html.ddz-ios-virtual-landscape:root:root body.ddz-site-page .ddz-toolbar .top-actions{grid-column:3!important;grid-row:1!important;justify-self:end!important}
html.ddz-ios-virtual-landscape:root:root body.ddz-site-page .bottom-cards{min-height:66px!important;gap:3px!important}
html.ddz-ios-virtual-landscape:root:root body.ddz-site-page .bottom-cards>.mini-card{flex:0 0 48px!important;min-width:48px!important;width:48px!important;max-width:48px!important;height:66px!important;min-height:66px!important;max-height:66px!important;padding:3px!important;margin:2px!important}
html.ddz-ios-virtual-landscape:root:root body.ddz-site-page .bottom-cards>.qily-mini-business b{font-size:15px!important;line-height:1!important}
html.ddz-ios-virtual-landscape:root:root body.ddz-site-page .bottom-cards>.qily-mini-business small{font-size:6.7px!important;font-weight:850!important}
html.ddz-ios-virtual-landscape:root:root body.ddz-site-page .v120-play-stage{min-height:96px!important;max-height:118px!important}
html.ddz-ios-virtual-landscape:root:root body.ddz-site-page .v120-play-card{flex:0 0 54px!important;width:54px!important;height:78px!important;margin-left:-4px!important}
html.ddz-ios-virtual-landscape:root:root body.ddz-site-page .v120-play-card .qily-card--normal .qily-rank-suit-line b{font-size:17px!important;line-height:.95!important}
html.ddz-ios-virtual-landscape:root:root body.ddz-site-page .v120-play-card .qily-card-theme{inset:25px 3px 7px!important;gap:1px!important}
html.ddz-ios-virtual-landscape:root:root body.ddz-site-page .v120-play-card .qily-card-theme>small{font-size:5.2px!important}
html.ddz-ios-virtual-landscape:root:root body.ddz-site-page .v120-play-card .qily-card-theme>strong{font-size:9.2px!important;line-height:1.02!important}
html.ddz-ios-virtual-landscape:root:root body.ddz-site-page .v120-play-card .qily-card-theme>b{font-size:6.5px!important}
html.ddz-ios-virtual-landscape:root:root body.ddz-site-page .v120-play-card .qily-card-theme>em{font-size:5px!important}
`;
}
write(visualFile,visual);

let materializer=read(materializerFile);
materializer=materializer.replaceAll(CACHE_OLD,CACHE_NEW);
if(!materializer.includes(CACHE_NEW))throw new Error('V164 public materializer cache not advanced');
write(materializerFile,materializer);

let homeEntry=read(homeEntryFile);
homeEntry=homeEntry.replaceAll(CACHE_OLD,CACHE_NEW);
if(!homeEntry.includes(CACHE_NEW))throw new Error('V164 home entry cache not advanced');
write(homeEntryFile,homeEntry);

execFileSync(process.execPath,[path.relative(root,materializerFile)],{cwd:root,stdio:'inherit'});
execFileSync(process.execPath,[path.relative(root,homeEntryFile)],{cwd:root,stdio:'inherit'});

const index=read(indexFile),homeCard=read(homeCardFile);
for(const token of [CACHE_NEW,'v164-independent-timer']){
  if(token===CACHE_NEW&&!index.includes(token))throw new Error(`V164 index token missing: ${token}`);
}
if(!homeCard.includes(CACHE_NEW))throw new Error('V164 home prefetch cache missing');
console.log('V164 materialized: independent timer, larger top typography, A=尖/J=钩 narration, mobile card readability.');
