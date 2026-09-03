#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const gameFile=path.join(root,'tools','pure-ddz','game','js','game.js');
const visualFile=path.join(root,'tools','pure-ddz','game','css','visual-tuning-v158.css');
const materializerFile=path.join(root,'scripts','materialize-ddz-public-ui-20260824.js');
const homeEntryFile=path.join(root,'scripts','materialize-pure-ddz-home-entry-v158.js');
const visualRuntimeFile=path.join(root,'tools','pure-ddz','game','js','visual-v120.js');
const iosLandscapeFile=path.join(root,'tools','pure-ddz','game','js','ios-virtual-landscape-v154.js');
const CACHE_OLD='20260903-ddz-fast-knowledge-v155-v158-v159-v160-v161';
const CACHE_NEW= `${CACHE_OLD}-v162`;

function read(file){return fs.readFileSync(file,'utf8');}
function write(file,content){fs.writeFileSync(file,content.endsWith('\n')?content:content+'\n');}
function replaceRequired(source,oldText,newText,label){
  if(source.includes(newText))return source;
  if(!source.includes(oldText))throw new Error(`V162 ${label}: source anchor missing`);
  return source.replace(oldText,newText);
}
function replaceRegexRequired(source,regex,replacement,readyToken,label){
  if(readyToken&&source.includes(readyToken))return source;
  if(!regex.test(source))throw new Error(`V162 ${label}: source pattern missing`);
  regex.lastIndex=0;
  return source.replace(regex,replacement);
}

let game=read(gameFile);
if(!game.includes('humanTurnTimer:null')){
  game=replaceRequired(
    game,
    'roundNumber:0,turnTimer:null,musicTimer:null,audioCtx:null,musicMode:',
    'roundNumber:0,turnTimer:null,humanTurnTimer:null,humanTurnInterval:null,humanDeadline:0,musicTimer:null,audioCtx:null,musicMode:',
    'human timer state'
  );
}

const describePlayV162=`  function describePlay(play){
    if(!play?.cards?.length||!play.combo)return'';
    const combo=play.combo,type=combo.type,main=rankText(combo.main),groups=countRanks(play.cards),ranks=[...groups.keys()].sort((a,b)=>a-b);
    const say=body=>play.player===0?\`我出\${body}\`:\`\${playerName(play.player)}出牌：\${body}\`;
    if(type==='rocket')return say('王炸');
    if(type==='bomb')return say(\`四个\${main}，炸弹\`);
    if(type==='single')return say(main);
    if(type==='pair')return say(\`一对\${main}\`);
    if(type==='triple')return say(\`三个\${main}\`);
    if(type==='triple1'){const side=ranks.find(rank=>rank!==combo.main);return say(\`三个\${main}带\${rankText(side)}\`);}
    if(type==='triple2'){const side=ranks.find(rank=>rank!==combo.main);return say(\`三个\${main}带一对\${rankText(side)}\`);}
    if(type==='straight')return say(\`\${rankText(ranks[0])}到\${rankText(ranks.at(-1))}顺子\`);
    if(type==='pairStraight')return say(\`\${rankText(ranks[0])}到\${rankText(ranks.at(-1))}连对\`);
    if(type==='four2'||type==='four2pair'){
      const side=ranks.filter(rank=>rank!==combo.main).map(rank=>rankText(rank)).join('、');
      return say(\`四个\${main}\${type==='four2pair'?'带两对':'带两张'}\${side?\`，\${side}\`:''}\`);
    }
    if(type==='airplane'||type==='airplane1'||type==='airplane2'){
      const tripleRanks=ranks.filter(rank=>(groups.get(rank)||0)>=3&&rank<=14);
      const core=tripleRanks.length>1?\`\${rankText(tripleRanks[0])}到\${rankText(tripleRanks.at(-1))}飞机\`:'飞机';
      if(type==='airplane')return say(core);
      const remain=[];
      groups.forEach((size,rank)=>{let left=size-(tripleRanks.includes(rank)?3:0);while(left-->0)remain.push(rankText(rank));});
      if(type==='airplane1')return say(\`\${core}带翅膀\${remain.length?\`，带\${remain.join('、')}\`:''}\`);
      const pairs=[];for(let i=0;i<remain.length;i+=2)pairs.push(remain[i]);
      return say(\`\${core}带翅膀\${pairs.length?\`，带\${pairs.map(value=>'一对'+value).join('、')}\`:''}\`);
    }
    return say(comboText(combo));
  }
`;
game=replaceRegexRequired(
  game,
  /  function describePlay\(play\)\{[\s\S]*?\n  \}\n(?=  function renderHand)/,
  describePlayV162,
  "const say=body=>play.player===0?`我出${body}`",
  'self/opponent play narration'
);

game=replaceRegexRequired(
  game,
  /  function renderStatus\(\)\{[^\n]*\}/,
  "  function renderStatus(){if(state.phase==='idle')$('status').textContent='准备开始';else if(state.phase==='bidding')$('status').textContent=state.current===0?'轮到你叫地主':`${playerName(state.current)} 正在考虑叫分…`;else if(state.phase==='ended')$('status').textContent=state.winner===0?'🎉 你先出完了！':`${playerName(state.winner)} 先出完了`;else if(state.current===0)updateHumanCountdown();else $('status').textContent=`${playerName(state.current)} 正在思考…`;}",
  "else if(state.current===0)updateHumanCountdown()",
  'countdown status renderer'
);

const turnHelpers=`
  function clearHumanTurnClock(){
    clearTimeout(state.humanTurnTimer);clearInterval(state.humanTurnInterval);
    state.humanTurnTimer=null;state.humanTurnInterval=null;state.humanDeadline=0;
  }
  function updateHumanCountdown(){
    if(state.phase!=='playing'||state.current!==0){return;}
    const remaining=state.humanDeadline?Math.max(0,Math.ceil((state.humanDeadline-Date.now())/1000)):30;
    $('status').textContent=\`轮到你出牌 · \${remaining}秒\`;
  }
  function handleHumanTimeout(){
    if(state.phase!=='playing'||state.current!==0)return;
    clearHumanTurnClock();
    if(state.lastPlay&&state.lastPlay.player!==0){
      flash('30秒未出牌，自动不要');
      pass(0,{auto:true});
      return;
    }
    const choice=chooseAiPlay(0);
    if(choice?.cards?.length){
      flash('30秒未出牌，系统代出一手');
      commitPlay(0,choice.cards);
      return;
    }
    flash('请尽快出牌');
    beginHumanTurn();
  }
  function beginHumanTurn(){
    clearHumanTurnClock();
    if(state.phase!=='playing'||state.current!==0)return;
    state.humanDeadline=Date.now()+30000;
    updateHumanCountdown();
    speak('该您了');
    state.humanTurnInterval=setInterval(updateHumanCountdown,250);
    state.humanTurnTimer=setTimeout(handleHumanTimeout,30000);
  }
`;
if(!game.includes('function beginHumanTurn(){')){
  game=replaceRequired(
    game,
    "  function afterNarration(text,callback,hold){const token=state.flowToken;speakAsync(text,{hold:hold??narrationHold(text)}).then(()=>{if(token===state.flowToken)callback?.();});}\n",
    "  function afterNarration(text,callback,hold){const token=state.flowToken;speakAsync(text,{hold:hold??narrationHold(text)}).then(()=>{if(token===state.flowToken)callback?.();});}\n"+turnHelpers,
    'turn countdown helpers'
  );
}

game=replaceRequired(
  game,
  'function startRound(){clearTimeout(state.turnTimer);state.flowToken++;',
  'function startRound(){clearTimeout(state.turnTimer);clearHumanTurnClock();state.flowToken++;',
  'round timer reset'
);

game=replaceRegexRequired(
  game,
  /  function scheduleTurn\(\)\{clearTimeout\(state\.turnTimer\);if\(!\['bidding','playing'\]\.includes\(state\.phase\)\|\|state\.current===0\)return;const delay=state\.settings\.difficulty==='easy'\?3000\+Math\.random\(\)\*500:state\.settings\.difficulty==='challenge'\?2450\+Math\.random\(\)\*450:state\.settings\.difficulty==='expert'\?2700\+Math\.random\(\)\*500:2900\+Math\.random\(\)\*550;const token=state\.flowToken;state\.turnTimer=setTimeout\(\(\)=>\{if\(token!==state\.flowToken\)return;const player=state\.current;if\(state\.phase==='bidding'\)placeBid\(player,chooseAiBid\(player\)\);else\{const choice=chooseAiPlay\(player\);choice\?commitPlay\(player,choice\.cards\):pass\(player\);\}\},delay\);\}/,
  "  function scheduleTurn(){clearTimeout(state.turnTimer);if(!['bidding','playing'].includes(state.phase)){clearHumanTurnClock();return;}if(state.current===0){if(state.phase==='playing')beginHumanTurn();return;}clearHumanTurnClock();const delay=state.settings.difficulty==='easy'?3000+Math.random()*500:state.settings.difficulty==='challenge'?2450+Math.random()*450:state.settings.difficulty==='expert'?2700+Math.random()*500:2900+Math.random()*550;const token=state.flowToken;state.turnTimer=setTimeout(()=>{if(token!==state.flowToken)return;const player=state.current;if(state.phase==='bidding')placeBid(player,chooseAiBid(player));else{const choice=chooseAiPlay(player);choice?commitPlay(player,choice.cards):pass(player);}},delay);}",
  "if(state.current===0){if(state.phase==='playing')beginHumanTurn();return;}",
  'turn scheduler'
);

if(!game.includes("if(player===0)clearHumanTurnClock();state.hands[player]=removeCards")){
  game=replaceRequired(
    game,
    "if(target&&!canBeat(combo,target))return{ok:false,message:'这组牌压不过上一手'};state.hands[player]=removeCards(state.hands[player],cards);",
    "if(target&&!canBeat(combo,target))return{ok:false,message:'这组牌压不过上一手'};if(player===0)clearHumanTurnClock();state.hands[player]=removeCards(state.hands[player],cards);",
    'clear timer on human play'
  );
}
if(!game.includes("if(player===0)clearHumanTurnClock();state.passCount++")){
  game=replaceRequired(
    game,
    "if(!state.lastPlay||state.lastPlay.player===player){if(player===0)flash('你是本轮首出，不能选择“不要”');return;}state.passCount++;",
    "if(!state.lastPlay||state.lastPlay.player===player){if(player===0)flash('你是本轮首出，不能选择“不要”');return;}if(player===0)clearHumanTurnClock();state.passCount++;",
    'clear timer on human pass'
  );
}
if(!game.includes('humanTurnTimer:null,humanTurnInterval:null,musicTimer:null')){
  game=replaceRequired(
    game,
    'selected:[...state.selected],turnTimer:null,musicTimer:null,audioCtx:null',
    'selected:[...state.selected],turnTimer:null,humanTurnTimer:null,humanTurnInterval:null,musicTimer:null,audioCtx:null',
    'test snapshot timer sanitization'
  );
}
if(!game.includes('clearHumanTurnClock();try{speechSynthesis.cancel()')){
  game=replaceRequired(
    game,
    "stop:()=>{state.flowToken++;clearTimeout(state.turnTimer);try{speechSynthesis.cancel();}",
    "stop:()=>{state.flowToken++;clearTimeout(state.turnTimer);clearHumanTurnClock();try{speechSynthesis.cancel();}",
    'test stop timer cleanup'
  );
}

for(const token of ['humanTurnTimer:null','function beginHumanTurn(){','Date.now()+30000',"speak('该您了')","我出${body}","flash('30秒未出牌，自动不要')"]){
  if(!game.includes(token))throw new Error(`V162 game contract missing: ${token}`);
}
write(gameFile,game);

let visual=read(visualFile);
if(!visual.includes('V162 turn-information placement')){
  visual=visual.replace(
    '/* QilyLean Pure DDZ V161｜Nav-aligned capsule feedback + table depth + larger bottom cards｜2026-09-03',
    '/* QilyLean Pure DDZ V161/V162｜Nav-aligned capsule feedback + turn-information placement + larger bottom cards｜2026-09-03'
  );
  visual=replaceRequired(
    visual,
    "  html body.ddz-site-page .center-area{\n    width:min(580px,calc(100% - 350px))!important;\n    padding-top:0!important;\n  }\n\n  html body.ddz-site-page .bottom-zone{margin-top:2px!important}\n",
    "  html body.ddz-site-page .center-area{\n    width:min(580px,calc(100% - 350px))!important;\n    padding-top:0!important;\n  }\n  /* V162 turn-information placement: lift round/base/multiplier one visual row without changing the approved table shell. */\n  html body.ddz-site-page .round-meta{\n    position:relative!important;\n    z-index:4!important;\n    transform:translateY(-14px)!important;\n    margin-bottom:-10px!important;\n  }\n\n  html body.ddz-site-page .bottom-zone{margin-top:-2px!important}\n",
    'round-meta lift'
  );
  visual=replaceRequired(
    visual,
    "  html body.ddz-site-page .bottom-cards{\n    min-height:116px!important;\n    margin-top:3px!important;\n    gap:8px!important;\n  }",
    "  html body.ddz-site-page .bottom-cards{\n    min-height:136px!important;\n    margin-top:3px!important;\n    gap:14px!important;\n  }",
    'bottom card stage depth'
  );
  visual=replaceRequired(
    visual,
    "    margin:1px!important;\n    padding:6px 7px!important;",
    "    margin:8px 6px 0!important;\n    padding:6px 7px!important;\n    transform:scale(1.15)!important;\n    transform-origin:center bottom!important;",
    'revealed bottom card visual scale'
  );
  visual=replaceRequired(
    visual,
    "  html body.ddz-site-page .bottom-cards>.qily-mini-business small{font-size:9.2px!important;line-height:1.05!important}\n",
    "  html body.ddz-site-page .bottom-cards>.qily-mini-business small{font-size:9.2px!important;line-height:1.05!important}\n  html body.ddz-site-page .bottom-cards>.bottom-back{width:52px!important;height:78px!important;margin:10px 7px 0!important;border-radius:9px!important}\n",
    'hidden bottom card scale'
  );
}
for(const token of ['V162 turn-information placement','transform:translateY(-14px)!important','transform:scale(1.15)!important','width:52px!important;height:78px!important']){
  if(!visual.includes(token))throw new Error(`V162 visual contract missing: ${token}`);
}
write(visualFile,visual);

let materializer=read(materializerFile);
materializer=materializer.replaceAll(CACHE_OLD,CACHE_NEW);
if(!materializer.includes('DDZ V162 turn countdown contract is missing')){
  materializer=replaceRequired(
    materializer,
    "const jsBundle=fs.readFileSync(jsBundleFile,'utf8');\n",
    "const jsBundle=fs.readFileSync(jsBundleFile,'utf8');\nif(!jsBundle.includes('function beginHumanTurn(){')||!jsBundle.includes('Date.now()+30000')||!jsBundle.includes(\"speak('该您了')\")||!jsBundle.includes('我出${body}'))throw new Error('DDZ V162 turn countdown contract is missing');\nif(!jsBundle.includes('function syncViewportProfile()')||!jsBundle.includes('window.visualViewport'))throw new Error('DDZ V162 mobile viewport adaptation contract is missing');\nif(!cssBundle.includes('transform:translateY(-14px)!important')||!cssBundle.includes('transform:scale(1.15)!important'))throw new Error('DDZ V162 center visual scale contract is missing');\n",
    'materializer V162 hard gates'
  );
}
write(materializerFile,materializer);

let homeEntry=read(homeEntryFile);
homeEntry=homeEntry.replaceAll(CACHE_OLD,CACHE_NEW);
homeEntry=homeEntry.replace(
  /20260903-ddz-fast-knowledge-v155-v158\(\?:-v159\)\?\(\?:-v160\)\?\(\?:-v161\)\?/g,
  '20260903-ddz-fast-knowledge-v155-v158(?:-v159)?(?:-v160)?(?:-v161)?(?:-v162)?'
);
write(homeEntryFile,homeEntry);

const visualRuntime=read(visualRuntimeFile);
for(const token of ['function syncViewportProfile()','window.visualViewport','--ddz-landscape-scale','orientationchange','requestLandscape']){
  if(!visualRuntime.includes(token))throw new Error(`V162 responsive landscape contract missing from visual-v120.js: ${token}`);
}
const iosLandscape=read(iosLandscapeFile);
for(const token of ['const viewport=()=>','window.visualViewport','syncGeometry()','--ddz-v154-w','--ddz-v154-h']){
  if(!iosLandscape.includes(token))throw new Error(`V162 iOS virtual-landscape contract missing: ${token}`);
}

execFileSync(process.execPath,[materializerFile],{cwd:root,stdio:'inherit'});
execFileSync(process.execPath,[homeEntryFile],{cwd:root,stdio:'inherit'});
execFileSync(process.execPath,['--check',gameFile],{cwd:root,stdio:'inherit'});
execFileSync(process.execPath,['--check',path.join(root,'tools','pure-ddz','game','js','ddz-core-v155.js')],{cwd:root,stdio:'inherit'});

console.log('PASS: DDZ V162 applied — 30s human turn clock, “该您了” prompt, “我出…” narration, lifted round meta, larger bottom cards, and existing adaptive phone landscape preserved.');
