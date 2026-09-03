/* QilyLean Pure DDZ V155 generated core JS bundle. Source files remain authoritative; do not hand-edit this generated file. */
/* ===== card-theme.js */
(() => {
  'use strict';

  const scriptUrl=document.currentScript?.src||'';
  const runtimeRoot=scriptUrl?new URL('../',scriptUrl):new URL('./',window.location.href);
  const assetUrl=file=>new URL(`assets/pure-ddz/${file}`,runtimeRoot).href;
  const siteAssetUrl=file=>new URL(`/assets/${file}`,window.location.origin).href;

  /*
   * V155 knowledge-card contract
   * - Every one of the 52 normal cards owns one QilyLean manufacturing / lean / engineering term.
   * - Rank + suit remains the first-reading gameplay information.
   * - English/code, Chinese name and one concise application cue are all visible on-card.
   * - Jokers intentionally retain their existing visual content.
   */
  const CARD_KNOWLEDGE=Object.freeze({
    '♠':Object.freeze({
      3:{code:'IE 7 Tools',title:'IE七大手法',subtitle:'Industrial Engineering',skill:'防错·动改·流程·五五｜人机·双手·抽查'},
      4:{code:'ECRS',title:'改善四原则',subtitle:'Eliminate Combine Rearrange Simplify',skill:'取消·合并·重排·简化'},
      5:{code:'VSM',title:'价值流图分析',subtitle:'Value Stream Mapping',skill:'识别LT·WIP·等待·增值'},
      6:{code:'Standard Work',title:'标准作业',subtitle:'Standardized Work',skill:'人·机·方法·时序标准化'},
      7:{code:'Time Study',title:'时间研究',subtitle:'Work Measurement',skill:'测定标准工时与标准产能'},
      8:{code:'Line Balance',title:'线平衡',subtitle:'Line Balancing',skill:'平衡CT·工位·人力负荷'},
      9:{code:'Takt Time',title:'节拍时间',subtitle:'Customer Takt',skill:'客户需求驱动生产节奏'},
      10:{code:'FLOW',title:'单件流',subtitle:'One Piece Flow',skill:'连续流动·减少在制品'},
      11:{code:'UPPH',title:'人均时产',subtitle:'Units Per Person Hour',skill:'单位人时产出效率'},
      12:{code:'SMED',title:'快速换型',subtitle:'Single-Minute Exchange of Die',skill:'缩短换线·换模时间'},
      13:{code:'OEE',title:'设备综合效率',subtitle:'Overall Equipment Effectiveness',skill:'开动率·性能·良率'},
      14:{code:'TPM',title:'全员生产维护',subtitle:'Total Productive Maintenance',skill:'预防保全·自主维护'},
      15:{code:'Bottleneck',title:'瓶颈管理',subtitle:'Constraint Management',skill:'识别约束·释放产能'}
    }),
    '♥':Object.freeze({
      3:{code:'Kaizen',title:'持续改善',subtitle:'Continuous Improvement',skill:'小步快跑·持续消除浪费'},
      4:{code:'PDCA',title:'改善闭环',subtitle:'Plan Do Check Act',skill:'计划·执行·检查·改进'},
      5:{code:'5M2E',title:'要因分析',subtitle:'Cause Analysis',skill:'人·机·料·法·测·能·环'},
      6:{code:'5 Why',title:'五问法',subtitle:'Root Cause Analysis',skill:'连续追问·追溯问题根因'},
      7:{code:'Poka-Yoke',title:'防错',subtitle:'Mistake Proofing',skill:'预防错误·异常即识别'},
      8:{code:'FMEA',title:'失效模式与影响分析',subtitle:'Failure Mode and Effects Analysis',skill:'风险识别·预防优先'},
      9:{code:'SPC',title:'统计过程控制',subtitle:'Statistical Process Control',skill:'监控波动·稳定过程'},
      10:{code:'CPK',title:'过程能力指数',subtitle:'Process Capability Index',skill:'评价过程满足规格能力'},
      11:{code:'MSA',title:'测量系统分析',subtitle:'Measurement System Analysis',skill:'评价测量系统可靠性'},
      12:{code:'Control Plan',title:'控制计划',subtitle:'Process Control Plan',skill:'明确过程控制点与方法'},
      13:{code:'8D',title:'8D问题解决',subtitle:'Eight Disciplines',skill:'团队化异常闭环'},
      14:{code:'DOE',title:'试验设计',subtitle:'Design of Experiments',skill:'多因素优化与验证'},
      15:{code:'PQCD',title:'经营四指标',subtitle:'Productivity Quality Cost Delivery',skill:'效率·质量·成本·交付'}
    }),
    '♣':Object.freeze({
      3:{code:'6S',title:'现场6S管理',subtitle:'Workplace Management',skill:'整理·整顿·清扫｜清洁·素养·安全'},
      4:{code:'TPS',title:'丰田生产方式',subtitle:'Toyota Production System',skill:'准时化·自働化'},
      5:{code:'Heijunka',title:'生产均衡化',subtitle:'Production Leveling',skill:'平准品种·数量·负荷'},
      6:{code:'Kanban',title:'看板拉动',subtitle:'Pull System',skill:'按实际需求补充与拉动'},
      7:{code:'JIT',title:'准时化生产',subtitle:'Just In Time',skill:'必要时间·必要数量'},
      8:{code:'Gemba',title:'现场主义',subtitle:'Go and See',skill:'到现场·看现物·抓现实'},
      9:{code:'Gantt',title:'甘特图',subtitle:'Gantt Chart',skill:'里程碑·进度目视化'},
      10:{code:'RACI',title:'权责矩阵',subtitle:'Responsibility Matrix',skill:'负责·审批·协作·知会'},
      11:{code:'Owner',title:'责任人机制',subtitle:'Accountability',skill:'结果负责·资源协调'},
      12:{code:'PMC',title:'生产物料控制',subtitle:'Production & Material Control',skill:'计划·物料·交付协同'},
      13:{code:'BOM',title:'物料清单',subtitle:'Bill of Materials',skill:'产品结构·物料用量基准'},
      14:{code:'SOP',title:'标准作业指导书',subtitle:'Standard Operating Procedure',skill:'固化方法·质量要求'},
      15:{code:'OPL',title:'单点课程',subtitle:'One Point Lesson',skill:'一页一主题·快速训练'}
    }),
    '♦':Object.freeze({
      3:{code:'ERP',title:'企业资源计划',subtitle:'Enterprise Resource Planning',skill:'订单·物料·财务一体化'},
      4:{code:'MES',title:'制造执行系统',subtitle:'Manufacturing Execution System',skill:'现场执行·追溯·报工'},
      5:{code:'APS',title:'高级计划与排程',subtitle:'Advanced Planning & Scheduling',skill:'约束条件下优化排程'},
      6:{code:'MRP',title:'物料需求计划',subtitle:'Material Requirements Planning',skill:'由需求推算物料供给'},
      7:{code:'WMS',title:'仓储管理系统',subtitle:'Warehouse Management System',skill:'库位·库存·收发追溯'},
      8:{code:'QMS',title:'质量管理系统',subtitle:'Quality Management System',skill:'检验·异常·质量闭环'},
      9:{code:'Andon',title:'安灯系统',subtitle:'Visual Alert System',skill:'异常可视·快速响应'},
      10:{code:'Traceability',title:'全程追溯',subtitle:'Manufacturing Traceability',skill:'人·机·料·法·测关联'},
      11:{code:'IoT',title:'物联网',subtitle:'Internet of Things',skill:'设备与现场数据连接'},
      12:{code:'BI',title:'商业智能',subtitle:'Business Intelligence',skill:'数据看板·分析决策'},
      13:{code:'Automation',title:'自动化',subtitle:'Industrial Automation',skill:'人机协同·减少重复作业'},
      14:{code:'Digital Twin',title:'数字孪生',subtitle:'Digital Twin',skill:'虚实映射·仿真验证'},
      15:{code:'Smart Factory',title:'数智工厂',subtitle:'Smart Factory',skill:'数据驱动·系统协同'}
    })
  });

  const SUIT_THEME=Object.freeze({
    '♠':{code:'IE · FLOW',title:'工业工程与流动',icon:'⚙'},
    '♥':{code:'KAIZEN · QA',title:'改善与质量',icon:'◆'},
    '♣':{code:'OPS · PM',title:'运营与项目',icon:'▣'},
    '♦':{code:'DIGITAL · IT',title:'数智工厂',icon:'◇'}
  });
  const HOME_AIRCRAFT=siteAssetUrl('qilylean-aircraft-hero-latest-q98.webp');
  const JOKER_THEME=Object.freeze({
    16:{type:'small-joker',title:'小王',image:HOME_AIRCRAFT},
    17:{type:'big-joker',title:'大王',image:assetUrl('avatar-king.webp')}
  });
  const RULE_RANK=Object.freeze({11:'J',12:'Q',13:'K',14:'A',15:'2',16:'小王',17:'大王'});
  const RANK_THEME=Object.freeze(Object.fromEntries(Object.keys(CARD_KNOWLEDGE['♠']).map(rank=>[rank,CARD_KNOWLEDGE['♠'][rank]])));

  function escapeHtml(value){return String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}
  function ruleRankText(card){return RULE_RANK[card.rank]||String(card.rank)}
  function getTheme(card){
    if(!card)return null;
    if(card.rank>=16)return {...JOKER_THEME[card.rank],rank:card.rank,joker:true};
    const knowledge=CARD_KNOWLEDGE[card.suit]?.[card.rank]||RANK_THEME[card.rank]||CARD_KNOWLEDGE['♠'][3];
    return {...knowledge,suit:SUIT_THEME[card.suit],rank:card.rank,joker:false};
  }
  function renderJoker(card){
    const theme=getTheme(card);
    return `<span class="qily-card qily-card--joker ${theme.type}"><span class="qily-card-corner"><b>${escapeHtml(theme.title)}</b><i>JOKER</i></span><span class="qily-joker-visual"><img class="qily-joker-person" src="${escapeHtml(theme.image)}" alt="${escapeHtml(theme.title)}" draggable="false"></span></span>`;
  }
  function renderNormalCard(card){
    const theme=getTheme(card),red=card.suit==='♥'||card.suit==='♦';
    return `<span class="qily-card qily-card--normal${red?' qily-rule-red':''}" title="${escapeHtml(theme.code+'｜'+theme.title+'｜'+theme.skill)}"><span class="qily-card-corner qily-rank-suit-line"><b>${escapeHtml(ruleRankText(card))}${escapeHtml(card.suit)}</b></span><span class="qily-card-theme"><small>${escapeHtml(theme.suit.code)}</small><strong>${escapeHtml(theme.code)}</strong><b>${escapeHtml(theme.title)}</b><em>${escapeHtml(theme.skill)}</em></span></span>`;
  }
  function renderCard(card){return card.rank>=16?renderJoker(card):renderNormalCard(card)}
  function renderMiniCard(card){
    const theme=getTheme(card);
    if(card.rank>=16){
      return `<span class="mini-card qily-mini-joker ${theme.type}"><span class="qily-mini-joker-person"><img src="${escapeHtml(theme.image)}" alt="${escapeHtml(theme.title)}"></span><b>${escapeHtml(theme.title)}</b></span>`;
    }
    return `<span class="mini-card qily-mini-business${card.suit==='♥'||card.suit==='♦'?' red':''}" title="${escapeHtml(theme.code+'｜'+theme.title)}"><b>${escapeHtml(ruleRankText(card))}${escapeHtml(card.suit)}</b><small>${escapeHtml(theme.code)}</small></span>`;
  }

  /* Card renderer owns card internals only. It must never resize the page, hand container, site header or Dock. */
  function installCardStandards(){
    if(document.getElementById('qily-ddz-card-internal-v155'))return;
    document.getElementById('qily-ddz-card-internal-v150')?.remove();
    const style=document.createElement('style');
    style.id='qily-ddz-card-internal-v155';
    style.textContent=`
      .qily-card{position:absolute;inset:0;display:block;width:100%;height:100%;box-sizing:border-box}
      .qily-card--normal .qily-rank-suit-line{display:flex!important;flex-direction:row!important;align-items:center!important;width:auto!important;white-space:nowrap!important}
      .qily-card--normal .qily-rank-suit-line b{display:block!important;white-space:nowrap!important;letter-spacing:-.06em!important;line-height:1!important}
      .qily-card-theme>small,.qily-card-theme>strong,.qily-card-theme>b,.qily-card-theme>em{display:block!important;max-width:100%!important;text-align:center!important}
      .qily-card-theme>strong,.qily-card-theme>b{white-space:normal!important;overflow-wrap:anywhere!important}
      .qily-card-theme>em{font-style:normal!important;white-space:normal!important;overflow-wrap:anywhere!important;word-break:keep-all!important}
      .qily-card--joker .qily-joker-visual{position:absolute;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important}
      .qily-card--joker .qily-joker-person{display:block!important;width:100%!important;height:100%!important;object-fit:contain!important;object-position:center!important}
      .qily-mini-joker{display:grid!important;grid-template-rows:minmax(0,1fr) auto!important;align-items:center!important;justify-items:center!important;overflow:hidden!important}
      .qily-mini-joker .qily-mini-joker-person{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;height:100%!important;overflow:hidden!important}
      .qily-mini-joker .qily-mini-joker-person>img{width:100%!important;height:100%!important;object-fit:contain!important;object-position:center!important}
      .qily-mini-joker>b{font-size:10px!important;line-height:1!important;color:#073c47!important;-webkit-text-fill-color:#073c47!important}
    `;
    document.head.appendChild(style);
  }

  window.QilyLeanCardTheme=Object.freeze({
    getTheme,renderCard,renderMiniCard,ruleRankText,
    cardKnowledge:CARD_KNOWLEDGE,rankThemes:RANK_THEME,suitThemes:SUIT_THEME,jokerThemes:JOKER_THEME,
    homeAircraft:HOME_AIRCRAFT,runtimeRoot:runtimeRoot.href,version:'1.5.5-knowledge-52'
  });
  installCardStandards();
})();

/* ===== ai-expert.js */
(() => {
  'use strict';

  const DIFFICULTY=Object.freeze({EASY:'easy',NORMAL:'normal',SMART:'smart',EXPERT:'expert',CHALLENGE:'challenge'});

  class PublicCardMemory{
    constructor(){ this.reset(); }
    reset(){ this.playedRanks=new Map(); this.playHistory=[]; this.bombsSeen=0; this.rocketSeen=false; }
    observe(player,cards,combo){
      (cards||[]).forEach(card=>this.playedRanks.set(card.rank,(this.playedRanks.get(card.rank)||0)+1));
      if(combo?.type==='bomb') this.bombsSeen+=1;
      if(combo?.type==='rocket') this.rocketSeen=true;
      this.playHistory.push({player,cards:(cards||[]).map(card=>({rank:card.rank,suit:card.suit})),combo:combo?{...combo}:null});
    }
    remainingRankCount(rank){
      const total=rank>=16?1:4;
      return Math.max(0,total-(this.playedRanks.get(rank)||0));
    }
    controlCardsRemaining(){
      return {bigJoker:this.remainingRankCount(17),smallJoker:this.remainingRankCount(16),twos:this.remainingRankCount(15),aces:this.remainingRankCount(14)};
    }
  }

  const memory=new PublicCardMemory();

  function groupByRank(hand){
    const groups=new Map();
    (hand||[]).forEach(card=>{ if(!groups.has(card.rank)) groups.set(card.rank,[]); groups.get(card.rank).push(card); });
    return groups;
  }

  function evaluateHandStructure(hand){
    const groups=groupByRank(hand); let bombs=0,pairs=0,triples=0,controls=0,highSingles=0;
    groups.forEach((cards,rank)=>{
      if(cards.length===4) bombs+=1;
      if(cards.length>=2) pairs+=1;
      if(cards.length>=3) triples+=1;
      if(rank===17) controls+=7;
      else if(rank===16) controls+=6;
      else if(rank===15) controls+=cards.length*4;
      else if(rank===14) controls+=cards.length*2;
      if(rank>=14&&cards.length===1) highSingles+=1;
    });
    return {cards:(hand||[]).length,bombs,pairs,triples,controls,highSingles};
  }

  function evaluateBid(hand){
    const s=evaluateHandStructure(hand),groups=groupByRank(hand); let score=0;
    score+=s.controls+s.bombs*8+s.triples*1.8+s.pairs*.7-s.highSingles*.35;
    if(groups.has(17)&&groups.has(16)) score+=13;
    if(groups.has(17)&&groups.has(15)) score+=4;
    if(groups.has(16)&&groups.has(15)) score+=2;
    return score;
  }

  function chooseExpertBid(hand,currentHighest=0,difficulty=DIFFICULTY.EXPERT){
    let score=evaluateBid(hand);
    if(difficulty===DIFFICULTY.CHALLENGE) score+=1.5;
    if(score>=29) return 3;
    if(score>=22) return currentHighest<2?2:(score>=27?3:0);
    if(score>=16) return currentHighest<1?1:0;
    return 0;
  }

  function sameTeam(a,b,landlord){
    if(landlord===null||landlord===undefined) return false;
    if(a===landlord||b===landlord) return a===b;
    return true;
  }

  function endgamePressure(state,player){
    let pressure=0;
    (state.hands||[]).forEach((hand,index)=>{
      if(index===player) return;
      const ally=sameTeam(player,index,state.landlord);
      if(hand.length<=2) pressure+=ally?-28:60;
      if(hand.length===1) pressure+=ally?-32:90;
    });
    return pressure;
  }

  function structureBreakPenalty(cards,hand){
    const groups=groupByRank(hand); let penalty=0;
    (cards||[]).forEach(card=>{
      const size=(groups.get(card.rank)||[]).length;
      const selected=(cards||[]).filter(c=>c.rank===card.rank).length;
      if(size===4&&selected<4) penalty+=22;
      else if(size===3&&selected<3) penalty+=7;
      else if(size===2&&selected===1) penalty+=3;
      if(card.rank>=15&&selected===1) penalty+=5;
    });
    return penalty;
  }

  function remainingHandScore(hand){
    if(!hand.length) return -10000;
    const s=evaluateHandStructure(hand);
    return hand.length*12-s.bombs*20-s.controls*2.2-s.triples*4-s.pairs*2;
  }

  function publicControlRisk(combo){
    if(!combo) return 0;
    const remain=memory.controlCardsRemaining();
    if(combo.type==='single'&&combo.main<=14&&(remain.bigJoker||remain.smallJoker||remain.twos)) return 3;
    return 0;
  }

  function cooperationAdjustment(state,player,option,target){
    if(state.landlord===null||player===state.landlord) return 0;
    const lastPlayer=state.lastPlay?.player;
    if(lastPlayer===null||lastPlayer===undefined||lastPlayer===player) return 0;
    if(sameTeam(player,lastPlayer,state.landlord)){
      const allyCards=state.hands[lastPlayer]?.length||17;
      if(allyCards<=2&&target){
        if(['bomb','rocket'].includes(option.combo.type)) return 180;
        return 55+option.combo.main*.8;
      }
    }
    const landlordCards=state.hands[state.landlord]?.length||17;
    if(landlordCards<=2) return -Math.min(80,option.cards.length*10+option.combo.main);
    return 0;
  }

  function scoreCandidate({state,player,cards,combo,target,removeCards,difficulty}){
    const nextHand=removeCards(state.hands[player],cards); let score=0;
    score+=remainingHandScore(nextHand);
    score-=cards.length*12;
    score+=structureBreakPenalty(cards,state.hands[player]);
    score+=publicControlRisk(combo);
    score+=cooperationAdjustment(state,player,{cards,combo},target);
    const pressure=endgamePressure(state,player);
    const control=['bomb','rocket'].includes(combo.type);
    if(control) score+=pressure<40?90:-35;
    if(nextHand.length===0) score-=5000;
    score-=pressure;
    if(!target&&['straight','pairStraight','airplane','airplane1','airplane2'].includes(combo.type)) score-=32;
    if(!target&&combo.type==='single'&&combo.main>=15&&nextHand.length>4) score+=18;
    if(difficulty===DIFFICULTY.CHALLENGE){
      if(nextHand.length<=5) score-=55;
      if(combo.type==='single'&&combo.main<10) score-=10;
      if(control&&nextHand.length>6&&pressure<55) score+=35;
      const unseen=memory.controlCardsRemaining();
      if(combo.type==='single'&&combo.main===15&&(unseen.bigJoker||unseen.smallJoker)) score+=8;
    }
    return score;
  }

  function chooseAdvancedPlay(context){
    const {state,player,generateCandidates,analyze,canBeat,removeCards}=context;
    const target=state.lastPlay&&state.lastPlay.player!==player?state.lastPlay.combo:null;
    const options=generateCandidates(state.hands[player])
      .map(cards=>({cards,combo:analyze(cards)}))
      .filter(option=>option.combo&&(!target||canBeat(option.combo,target)));
    if(!options.length) return null;
    const difficulty=state.settings?.difficulty||DIFFICULTY.EXPERT;
    options.forEach(option=>{ option.score=scoreCandidate({state,player,cards:option.cards,combo:option.combo,target,removeCards,difficulty}); });
    options.sort((a,b)=>a.score-b.score||a.combo.main-b.combo.main||b.cards.length-a.cards.length);
    return options[0];
  }

  window.QilyLeanExpertAI=Object.freeze({DIFFICULTY,memory,chooseExpertBid,chooseAdvancedPlay,evaluateBid,evaluateHandStructure});
})();

/* ===== game.js */
(() => {
  'use strict';

  const VERSION = '1.5.2';
  const PROFILE_KEY = 'pure_ddz_profile_v1';
  const SETTINGS_KEY = 'pure_ddz_settings_v2';
  const RANK_TEXT = {3:'3',4:'4',5:'5',6:'6',7:'7',8:'8',9:'9',10:'10',11:'J',12:'Q',13:'K',14:'A',15:'2',16:'小王',17:'大王'};
  const SUITS = ['♠','♥','♣','♦'];
  const COMBO_TEXT = {single:'单牌',pair:'对子',triple:'三张',triple1:'三带一',triple2:'三带二',straight:'顺子',pairStraight:'连对',airplane:'飞机',airplane1:'飞机带单',airplane2:'飞机带对',four2:'四带二',four2pair:'四带两对',bomb:'炸弹',rocket:'王炸'};
  const DEFAULT_PROFILE = {score:1000,wins:0,losses:0,streak:0,bestStreak:0,games:0,lastRewardDate:''};
  const DEFAULT_SETTINGS = {music:true,voice:true,effects:true,font:'large',difficulty:'expert'};
  const state = {phase:'idle',hands:[[],[],[]],bottom:[],landlord:null,current:0,lastPlay:null,passCount:0,selected:new Set(),winner:null,bids:[null,null,null],bidStart:0,bidTurns:0,highestBid:0,highestBidder:null,baseScore:1,multiplier:1,playCounts:[0,0,0],roundNumber:0,turnTimer:null,musicTimer:null,audioCtx:null,musicMode:'normal',flowToken:0,profile:loadJson(PROFILE_KEY,DEFAULT_PROFILE),settings:loadJson(SETTINGS_KEY,DEFAULT_SETTINGS)};

  const $ = id => document.getElementById(id);
  const nextPlayer = player => (player + 1) % 3;
  const playerName = player => player === 0 ? '我' : (player === 1 ? '左家' : '右家');
  const playerVoiceName = player => player === 0 ? '您' : playerName(player);
  const deepCopy = value => JSON.parse(JSON.stringify(value));
  function loadJson(key, fallback){ try{ const parsed=JSON.parse(localStorage.getItem(key)||'null'); return parsed&&typeof parsed==='object'?{...fallback,...parsed}:{...fallback}; }catch(_error){ return {...fallback}; } }
  function saveProfile(){ try{localStorage.setItem(PROFILE_KEY,JSON.stringify(state.profile));}catch(_error){} renderProfile(); }
  function saveSettings(){ try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(state.settings));}catch(_error){} applySettings(); }
  function createDeck(){ const deck=[]; let id=0; for(let rank=3;rank<=15;rank++) for(const suit of SUITS) deck.push({id:id++,rank,suit}); deck.push({id:id++,rank:16,suit:'🃏'}); deck.push({id:id++,rank:17,suit:'🃏'}); return deck; }
  function shuffle(deck){ for(let i=deck.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [deck[i],deck[j]]=[deck[j],deck[i]]; } return deck; }
  function sortHand(hand){ hand.sort((a,b)=>b.rank-a.rank || a.suit.localeCompare(b.suit)); }
  function countRanks(cards){ const map=new Map(); cards.forEach(card=>map.set(card.rank,(map.get(card.rank)||0)+1)); return map; }
  function consecutive(ranks){ if(!ranks.length||ranks[ranks.length-1]>14)return false; for(let i=1;i<ranks.length;i++)if(ranks[i]!==ranks[i-1]+1)return false; return true; }
  function sequenceWindows(ranks,minLength){ const sorted=[...new Set(ranks)].sort((a,b)=>a-b).filter(rank=>rank<=14),windows=[]; for(let start=0;start<sorted.length;start++)for(let end=start+minLength-1;end<sorted.length;end++){const seq=sorted.slice(start,end+1);if(consecutive(seq))windows.push(seq);else break;} return windows; }
  function analyze(cards){ if(!cards?.length)return null; const n=cards.length,map=countRanks(cards),entries=[...map.entries()].sort((a,b)=>a[0]-b[0]),ranks=entries.map(([rank])=>rank),byCount=count=>entries.filter(([,size])=>size===count).map(([rank])=>rank); if(n===1)return{type:'single',main:ranks[0],len:1}; if(n===2&&ranks.length===2&&ranks[0]===16&&ranks[1]===17)return{type:'rocket',main:17,len:2}; if(n===2&&ranks.length===1)return{type:'pair',main:ranks[0],len:2}; if(n===3&&ranks.length===1)return{type:'triple',main:ranks[0],len:3}; if(n===4&&ranks.length===1)return{type:'bomb',main:ranks[0],len:4}; if(n===4&&byCount(3).length===1)return{type:'triple1',main:byCount(3)[0],len:4}; if(n===5&&byCount(3).length===1&&byCount(2).length===1)return{type:'triple2',main:byCount(3)[0],len:5}; if(n>=5&&ranks.length===n&&consecutive(ranks))return{type:'straight',main:ranks.at(-1),len:n}; if(n>=6&&n%2===0&&ranks.length===n/2&&entries.every(([,size])=>size===2)&&consecutive(ranks))return{type:'pairStraight',main:ranks.at(-1),len:n}; const tripleRanks=entries.filter(([rank,size])=>rank<=14&&size>=3).map(([rank])=>rank); for(const seq of sequenceWindows(tripleRanks,2).sort((a,b)=>b.length-a.length)){const remain=new Map(entries);seq.forEach(rank=>remain.set(rank,remain.get(rank)-3));const remaining=[...remain.entries()].filter(([,size])=>size>0),remainingCount=remaining.reduce((sum,[,size])=>sum+size,0);if(n===seq.length*3&&remainingCount===0)return{type:'airplane',main:seq.at(-1),len:n,seq:seq.length};if(n===seq.length*4&&remainingCount===seq.length)return{type:'airplane1',main:seq.at(-1),len:n,seq:seq.length};if(n===seq.length*5&&remaining.length===seq.length&&remaining.every(([,size])=>size===2))return{type:'airplane2',main:seq.at(-1),len:n,seq:seq.length};} if(n===6&&byCount(4).length===1)return{type:'four2',main:byCount(4)[0],len:6}; if(n===8&&byCount(4).length===1){const four=byCount(4)[0],others=entries.filter(([rank])=>rank!==four);if(others.length===2&&others.every(([,size])=>size===2))return{type:'four2pair',main:four,len:8};} return null; }
  function canBeat(candidate,target){ if(!candidate)return false;if(!target)return true;if(candidate.type==='rocket')return true;if(target.type==='rocket')return false;if(candidate.type==='bomb'&&target.type!=='bomb')return true;if(candidate.type!=='bomb'&&target.type==='bomb')return false;return candidate.type===target.type&&candidate.len===target.len&&(candidate.seq||0)===(target.seq||0)&&candidate.main>target.main; }
  function rankGroups(hand){const groups=new Map();hand.forEach(card=>{if(!groups.has(card.rank))groups.set(card.rank,[]);groups.get(card.rank).push(card);});return groups;}
  function uniqueCandidates(list){const seen=new Set();return list.filter(cards=>{const key=cards.map(card=>card.id).sort((a,b)=>a-b).join('-');if(seen.has(key))return false;seen.add(key);return Boolean(analyze(cards));});}
  function generateCandidates(hand){const groups=rankGroups(hand),ranks=[...groups.keys()].sort((a,b)=>a-b),candidates=[];ranks.forEach(rank=>{const cards=groups.get(rank);candidates.push(cards.slice(0,1));if(cards.length>=2)candidates.push(cards.slice(0,2));if(cards.length>=3)candidates.push(cards.slice(0,3));if(cards.length===4)candidates.push(cards.slice(0,4));});if(groups.has(16)&&groups.has(17))candidates.push([groups.get(16)[0],groups.get(17)[0]]);ranks.filter(rank=>groups.get(rank).length>=3).forEach(tripleRank=>{const triple=groups.get(tripleRank).slice(0,3);ranks.filter(rank=>rank!==tripleRank).forEach(rank=>candidates.push([...triple,groups.get(rank)[0]]));ranks.filter(rank=>rank!==tripleRank&&groups.get(rank).length>=2).forEach(rank=>candidates.push([...triple,...groups.get(rank).slice(0,2)]));});sequenceWindows(ranks.filter(rank=>groups.get(rank).length>=1),5).forEach(seq=>candidates.push(seq.map(rank=>groups.get(rank)[0])));sequenceWindows(ranks.filter(rank=>groups.get(rank).length>=2),3).forEach(seq=>candidates.push(seq.flatMap(rank=>groups.get(rank).slice(0,2))));const tripleRanks=ranks.filter(rank=>rank<=14&&groups.get(rank).length>=3);sequenceWindows(tripleRanks,2).forEach(seq=>{const core=seq.flatMap(rank=>groups.get(rank).slice(0,3));candidates.push(core);const outsideRanks=ranks.filter(rank=>!seq.includes(rank));const singles=outsideRanks.flatMap(rank=>groups.get(rank));if(singles.length>=seq.length)candidates.push([...core,...singles.slice(0,seq.length)]);const pairs=outsideRanks.filter(rank=>groups.get(rank).length>=2);if(pairs.length>=seq.length)candidates.push([...core,...pairs.slice(0,seq.length).flatMap(rank=>groups.get(rank).slice(0,2))]);});ranks.filter(rank=>groups.get(rank).length===4).forEach(fourRank=>{const core=groups.get(fourRank).slice(0,4),outside=ranks.filter(rank=>rank!==fourRank),singles=outside.flatMap(rank=>groups.get(rank));if(singles.length>=2)candidates.push([...core,...singles.slice(0,2)]);const pairs=outside.filter(rank=>groups.get(rank).length>=2);if(pairs.length>=2)candidates.push([...core,...pairs.slice(0,2).flatMap(rank=>groups.get(rank).slice(0,2))]);});return uniqueCandidates(candidates);}
  function candidateScore(option,target,player){const{cards,combo}=option,bomb=['bomb','rocket'].includes(combo.type),nextHand=state.hands[nextPlayer(player)]?.length||17;let score=combo.main+(bomb?130:0)-cards.length*7;if(!target)score-=cards.length*11;if(state.settings.difficulty==='easy')score+=Math.random()*45;if(state.settings.difficulty==='smart'){if(nextHand<=2&&bomb)score-=90;if(cards.length===state.hands[player].length)score-=300;if(player!==state.landlord&&state.landlord!==null&&state.hands[state.landlord].length<=2)score-=cards.length*9;}return score;}
  function advancedAiEnabled(){return['expert','challenge'].includes(state.settings.difficulty)&&window.QilyLeanExpertAI;}
  function chooseAiPlay(player){if(advancedAiEnabled())return window.QilyLeanExpertAI.chooseAdvancedPlay({state,player,generateCandidates,analyze,canBeat,removeCards});const target=state.lastPlay&&state.lastPlay.player!==player?state.lastPlay.combo:null,options=generateCandidates(state.hands[player]).map(cards=>({cards,combo:analyze(cards)})).filter(option=>!target||canBeat(option.combo,target));if(!options.length)return null;options.sort((a,b)=>candidateScore(a,target,player)-candidateScore(b,target,player));return options[0];}
  function removeCards(hand,cards){const ids=new Set(cards.map(card=>card.id));return hand.filter(card=>!ids.has(card.id));}
  function comboText(combo){return COMBO_TEXT[combo?.type]||'出牌';}
  function rankText(rank){return RANK_TEXT[rank]||String(rank??'');}
  function cardLabel(card){return card.rank>=16?RANK_TEXT[card.rank]:`${RANK_TEXT[card.rank]}${card.suit}`;}
  function isRed(card){return card.suit==='♥'||card.suit==='♦'||card.rank===17;}
  function renderMiniCard(card){if(window.QilyLeanCardTheme)return window.QilyLeanCardTheme.renderMiniCard(card);return `<span class="mini-card${isRed(card)?' red':''}">${cardLabel(card)}</span>`;}
  function renderProfile(){$('score').textContent=state.profile.score;$('wins').textContent=state.profile.wins;$('losses').textContent=state.profile.losses;$('streak').textContent=state.profile.streak;}
  function roleText(player){if(state.landlord===null)return state.phase==='bidding'?'叫地主':'等待开局';return state.landlord===player?'地主':'农民';}
  function updateRole(id,player){const el=$(id);el.textContent=roleText(player);el.classList.toggle('landlord',state.landlord===player);el.classList.toggle('farmer',state.landlord!==null&&state.landlord!==player);}
  function renderBacks(id,count){const visible=Math.min(7,Math.max(0,count));$(id).innerHTML=Array.from({length:visible},()=>'<i class="card-back"></i>').join('');}
  function renderBottomCards(){const reveal=state.landlord!==null&&state.phase!=='idle';$('bottom-cards').innerHTML=reveal?state.bottom.map(renderMiniCard).join(''):Array.from({length:3},()=>'<i class="bottom-back"></i>').join('');}
  function describePlay(play){
    if(!play?.cards?.length||!play.combo)return'';
    const who=playerVoiceName(play.player),combo=play.combo,type=combo.type,main=rankText(combo.main),groups=countRanks(play.cards),ranks=[...groups.keys()].sort((a,b)=>a-b);
    if(type==='rocket')return`${who}出牌：王炸`;
    if(type==='bomb')return`${who}出牌：四个${main}，炸弹`;
    if(type==='single')return`${who}出牌：${main}`;
    if(type==='pair')return`${who}出牌：一对${main}`;
    if(type==='triple')return`${who}出牌：三个${main}`;
    if(type==='triple1'){const side=ranks.find(rank=>rank!==combo.main);return`${who}出牌：三个${main}带${rankText(side)}`;}
    if(type==='triple2'){const side=ranks.find(rank=>rank!==combo.main);return`${who}出牌：三个${main}带一对${rankText(side)}`;}
    if(type==='straight')return`${who}出牌：${rankText(ranks[0])}到${rankText(ranks.at(-1))}顺子`;
    if(type==='pairStraight')return`${who}出牌：${rankText(ranks[0])}到${rankText(ranks.at(-1))}连对`;
    if(type==='four2'||type==='four2pair'){
      const side=ranks.filter(rank=>rank!==combo.main).map(rank=>rankText(rank)).join('、');
      return`${who}出牌：四个${main}${type==='four2pair'?'带两对':'带两张'}${side?`，${side}`:''}`;
    }
    if(type==='airplane'||type==='airplane1'||type==='airplane2'){
      const tripleRanks=ranks.filter(rank=>(groups.get(rank)||0)>=3&&rank<=14);
      const core=tripleRanks.length>1?`${rankText(tripleRanks[0])}到${rankText(tripleRanks.at(-1))}飞机`:'飞机';
      if(type==='airplane')return`${who}出牌：${core}`;
      const remain=[];
      groups.forEach((size,rank)=>{let left=size-(tripleRanks.includes(rank)?3:0);while(left-->0)remain.push(rankText(rank));});
      if(type==='airplane1')return`${who}出牌：${core}带翅膀${remain.length?`，带${remain.join('、')}`:''}`;
      const pairs=[];for(let i=0;i<remain.length;i+=2)pairs.push(remain[i]);
      return`${who}出牌：${core}带翅膀${pairs.length?`，带${pairs.map(value=>'一对'+value).join('、')}`:''}`;
    }
    return`${who}出牌：${comboText(combo)}`;
  }
  function renderHand(){const hand=$('hand');hand.innerHTML='';state.hands[0].forEach(card=>{const button=document.createElement('button'),selected=state.selected.has(card.id);button.type='button';button.className=`card${selected?' selected':''}${isRed(card)?' red':''}${card.rank>=16?' joker':''}`;button.dataset.id=String(card.id);button.setAttribute('aria-label',`${cardLabel(card)}${selected?'，已选择':'，未选择'}`);button.setAttribute('aria-pressed',String(selected));button.innerHTML=window.QilyLeanCardTheme?window.QilyLeanCardTheme.renderCard(card):(card.rank>=16?`<strong>${RANK_TEXT[card.rank]}</strong>`:`<strong>${RANK_TEXT[card.rank]}</strong><span>${card.suit}</span>`);button.addEventListener('click',()=>toggleSelect(card.id));hand.appendChild(button);});}
  function renderLastPlay(){if(state.lastPlay){const last=state.lastPlay;$('center-play').innerHTML=`<div class="play-owner">${describePlay(last)}</div><div class="played-cards">${last.cards.map(renderMiniCard).join('')}</div>`;return;}const copy=state.phase==='bidding'?'正在叫地主，分数最高者获得三张底牌':state.phase==='playing'?'新一轮，领出玩家可以出任意合规牌型':'点击“开始游戏”，无需登录即可游玩';$('center-play').innerHTML=`<div class="center-tip">${copy}</div>`;}
  function renderStatus(){if(state.phase==='idle')$('status').textContent='准备开始';else if(state.phase==='bidding')$('status').textContent=state.current===0?'轮到你叫地主':`${playerName(state.current)} 正在考虑叫分…`;else if(state.phase==='ended')$('status').textContent=state.winner===0?'🎉 你先出完了！':`${playerName(state.winner)} 先出完了`;else $('status').textContent=state.current===0?'轮到你出牌':`${playerName(state.current)} 正在思考…`;}
  function renderControls(){const humanBid=state.phase==='bidding'&&state.current===0,humanTurn=state.phase==='playing'&&state.current===0;$('bid-controls').classList.toggle('hidden',!humanBid);$('play-controls').classList.toggle('hidden',state.phase!=='playing');$('play').disabled=!humanTurn;$('hint').disabled=!humanTurn;$('pass').disabled=!humanTurn||!state.lastPlay||state.lastPlay.player===0;document.querySelectorAll('[data-bid]').forEach(button=>{button.disabled=!humanBid||Number(button.dataset.bid)<=state.highestBid&&Number(button.dataset.bid)!==0;});}
  function renderActivePlayer(){document.querySelectorAll('.player-panel').forEach(panel=>panel.classList.remove('active'));if(!['bidding','playing'].includes(state.phase))return;$(state.current===0?'me-panel':state.current===1?'left-panel':'right-panel').classList.add('active');}
  function render(){const sizes=state.hands.map(hand=>hand.length);$('left-count').textContent=`${sizes[1]||0} 张`;$('right-count').textContent=`${sizes[2]||0} 张`;$('me-count').textContent=`${sizes[0]||0} 张`;updateRole('left-role',1);updateRole('right-role',2);updateRole('me-role',0);['me','left','right'].forEach((key,index)=>{const bid=state.bids[index];$(`${key}-bid`).textContent=bid===null?'':bid===0?'不叫':`${bid} 分`;});renderBacks('left-backs',sizes[1]);renderBacks('right-backs',sizes[2]);renderBottomCards();renderHand();renderLastPlay();renderStatus();renderControls();renderActivePlayer();$('round-number').textContent=state.roundNumber;$('base-score').textContent=state.baseScore;$('multiplier').textContent=`×${state.multiplier}`;$('start').textContent=state.phase==='idle'?'开始游戏':'重新开局';renderProfile();}
  function toggleSelect(id){if(state.phase!=='playing'||state.current!==0)return;state.selected.has(id)?state.selected.delete(id):state.selected.add(id);playEffect('select');render();}
  function handStrength(hand){const groups=rankGroups(hand);let value=0;hand.forEach(card=>{if(card.rank===17)value+=5;else if(card.rank===16)value+=4;else if(card.rank===15)value+=2.2;else if(card.rank===14)value+=1.2;});groups.forEach(cards=>{if(cards.length===4)value+=5;else if(cards.length===3)value+=1.4;});return value;}
  function chooseAiBid(player){if(advancedAiEnabled())return window.QilyLeanExpertAI.chooseExpertBid(state.hands[player],state.highestBid,state.settings.difficulty);const strength=handStrength(state.hands[player]),jitter=Math.random()*2.3;let bid=0;if(strength+jitter>13)bid=3;else if(strength+jitter>9)bid=2;else if(strength+jitter>6)bid=1;if(state.settings.difficulty==='easy'&&Math.random()<.25)bid=Math.max(0,bid-1);if(bid<=state.highestBid)bid=0;return bid;}
  function narrationHold(text){return Math.max(900,Math.min(1600,700+String(text||'').length*28));}
  function nativeSpeak(text){try{if(window.QilyLeanAndroid?.speak){window.QilyLeanAndroid.speak(String(text));return true;}}catch(_error){}return false;}
  function speakAsync(text,{hold=narrationHold(text)}={}){
    return new Promise(resolve=>{
      const finish=()=>setTimeout(resolve,Math.max(0,hold));
      if(!state.settings.voice){finish();return;}
      if(nativeSpeak(text)){setTimeout(finish,Math.max(1200,Math.min(5200,String(text).length*190)));return;}
      try{
        if(!('speechSynthesis'in window)||!window.SpeechSynthesisUtterance){finish();return;}
        speechSynthesis.cancel();
        const utterance=new SpeechSynthesisUtterance(String(text));
        utterance.lang='zh-CN';utterance.rate=.82;utterance.pitch=1;utterance.volume=.94;
        let done=false;const settle=()=>{if(done)return;done=true;finish();};
        utterance.onend=settle;utterance.onerror=settle;
        speechSynthesis.speak(utterance);
        setTimeout(settle,Math.max(3200,Math.min(8000,String(text).length*300)));
      }catch(_error){finish();}
    });
  }
  function speak(text){void speakAsync(text,{hold:0});}
  function afterNarration(text,callback,hold){const token=state.flowToken;speakAsync(text,{hold:hold??narrationHold(text)}).then(()=>{if(token===state.flowToken)callback?.();});}
  function startRound(){clearTimeout(state.turnTimer);state.flowToken++;try{speechSynthesis.cancel();}catch(_error){}closeModal('welcome');closeModal('result');if(window.QilyLeanExpertAI)window.QilyLeanExpertAI.memory.reset();state.phase='bidding';state.hands=[[],[],[]];state.bottom=[];state.landlord=null;state.lastPlay=null;state.passCount=0;state.selected.clear();state.winner=null;state.bids=[null,null,null];state.bidTurns=0;state.highestBid=0;state.highestBidder=null;state.baseScore=1;state.multiplier=1;state.playCounts=[0,0,0];const deck=shuffle(createDeck());state.hands=[deck.slice(0,17),deck.slice(17,34),deck.slice(34,51)];state.bottom=deck.slice(51);state.hands.forEach(sortHand);state.bidStart=Math.floor(Math.random()*3);state.current=state.bidStart;state.roundNumber=state.profile.games+1;$('hint-message').textContent='';render();try{startMusic();}catch(error){console.warn('Pure DDZ music unavailable:',error);}afterNarration('开始叫地主',scheduleTurn,500);}
  function placeBid(player,bid){if(state.phase!=='bidding'||state.current!==player)return;const safeBid=Number(bid);state.bids[player]=safeBid;state.bidTurns++;if(safeBid>state.highestBid){state.highestBid=safeBid;state.highestBidder=player;}playEffect(safeBid?'confirm':'pass');render();const text=safeBid?`${playerVoiceName(player)}叫${safeBid}分`:`${playerVoiceName(player)}不叫`;if(safeBid===3||state.bidTurns>=3){afterNarration(text,finishBidding,650);return;}afterNarration(text,()=>{state.current=nextPlayer(player);render();scheduleTurn();},650);}
  function finishBidding(){if(state.phase!=='bidding')return;if(state.highestBidder===null){flash('本轮都不叫，自动重新发牌');afterNarration('都不叫，重新发牌',startRound,900);return;}state.landlord=state.highestBidder;state.baseScore=Math.max(1,state.highestBid);state.hands[state.landlord].push(...state.bottom);sortHand(state.hands[state.landlord]);state.current=state.landlord;state.phase='playing';$('hint-message').textContent='';playEffect('start');render();afterNarration(`${playerVoiceName(state.landlord)}当地主，游戏开始`,scheduleTurn,850);}
  function humanBid(bid){placeBid(0,bid);}
  function scheduleTurn(){clearTimeout(state.turnTimer);if(!['bidding','playing'].includes(state.phase)||state.current===0)return;const delay=state.settings.difficulty==='easy'?3000+Math.random()*500:state.settings.difficulty==='challenge'?2450+Math.random()*450:state.settings.difficulty==='expert'?2700+Math.random()*500:2900+Math.random()*550;const token=state.flowToken;state.turnTimer=setTimeout(()=>{if(token!==state.flowToken)return;const player=state.current;if(state.phase==='bidding')placeBid(player,chooseAiBid(player));else{const choice=chooseAiPlay(player);choice?commitPlay(player,choice.cards):pass(player);}},delay);}
  function commitPlay(player,cards){if(state.phase!=='playing'||state.current!==player)return{ok:false,message:'现在不能出牌'};const combo=analyze(cards);if(!combo)return{ok:false,message:'这组牌不符合斗地主牌型'};const target=state.lastPlay&&state.lastPlay.player!==player?state.lastPlay.combo:null;if(target&&!canBeat(combo,target))return{ok:false,message:'这组牌压不过上一手'};state.hands[player]=removeCards(state.hands[player],cards);state.lastPlay={player,cards:[...cards],combo};state.passCount=0;state.playCounts[player]++;if(window.QilyLeanExpertAI)window.QilyLeanExpertAI.memory.observe(player,cards,combo);if(['bomb','rocket'].includes(combo.type))state.multiplier*=2;playEffect(['bomb','rocket'].includes(combo.type)?'bomb':'play');render();const narration=describePlay(state.lastPlay);if(state.hands[player].length===0){finishIfNeeded(player,narration);return{ok:true,finished:true};}afterNarration(narration,()=>{state.current=nextPlayer(player);render();scheduleTurn();},1100);return{ok:true};}
  function playSelected(){if(state.phase!=='playing'||state.current!==0)return;const cards=state.hands[0].filter(card=>state.selected.has(card.id));if(!cards.length){flash('请先选择要出的牌');speak('请先选牌');return;}const result=commitPlay(0,cards);if(!result.ok){flash(result.message);speak('这样不能出');return;}state.selected.clear();$('hint-message').textContent='';}
  function pass(player=0,{auto=false}={}){if(state.phase!=='playing'||state.current!==player)return;if(!state.lastPlay||state.lastPlay.player===player){if(player===0)flash('你是本轮首出，不能选择“不要”');return;}state.passCount++;playEffect('pass');const text=player===0?(auto?'不要':'您不要'):`${playerName(player)}要不起`;const resetRound=state.passCount>=2;const next=resetRound?state.lastPlay.player:nextPlayer(player);render();afterNarration(text,()=>{if(resetRound){state.lastPlay=null;state.passCount=0;}state.current=next;render();scheduleTurn();},1000);}
  function hint(){if(state.phase!=='playing'||state.current!==0)return;if(advancedAiEnabled()){const choice=window.QilyLeanExpertAI.chooseAdvancedPlay({state,player:0,generateCandidates,analyze,canBeat,removeCards});if(!choice){state.selected.clear();render();flash('不要，自动轮到下家');$('hint-message').textContent='';pass(0,{auto:true});return;}state.selected.clear();choice.cards.forEach(card=>state.selected.add(card.id));render();$('hint-message').textContent='';flash(`启力提示：${comboText(choice.combo)}`);speak(`建议出${comboText(choice.combo)}`);return;}const target=state.lastPlay&&state.lastPlay.player!==0?state.lastPlay.combo:null;const options=generateCandidates(state.hands[0]).map(cards=>({cards,combo:analyze(cards)})).filter(option=>!target||canBeat(option.combo,target));if(!options.length){state.selected.clear();render();flash('不要，自动轮到下家');$('hint-message').textContent='';pass(0,{auto:true});return;}options.sort((a,b)=>candidateScore(a,target,0)-candidateScore(b,target,0));state.selected.clear();options[0].cards.forEach(card=>state.selected.add(card.id));render();$('hint-message').textContent='';flash(`启力提示：${comboText(options[0].combo)}`);speak(`建议出${comboText(options[0].combo)}`);}
  function finishIfNeeded(player,playNarration=''){if(state.hands[player].length!==0)return false;state.winner=player;state.phase='ended';const landlordWon=player===state.landlord,humanWon=state.landlord===0?landlordWon:!landlordWon;const spring=landlordWon?(state.playCounts.filter((_,index)=>index!==state.landlord).reduce((a,b)=>a+b,0)===0):(state.playCounts[state.landlord]<=1);if(spring)state.multiplier*=2;const roleFactor=state.landlord===0?2:1,raw=Math.max(10,state.baseScore*state.multiplier*10*roleFactor),delta=humanWon?raw:-raw;state.profile.games++;state.profile.score=Math.max(0,state.profile.score+delta);if(humanWon){state.profile.wins++;state.profile.streak++;state.profile.bestStreak=Math.max(state.profile.bestStreak,state.profile.streak);}else{state.profile.losses++;state.profile.streak=0;}let reward=0,today=new Date().toLocaleDateString('en-CA');if(humanWon&&state.profile.lastRewardDate!==today){reward=50;state.profile.score+=reward;state.profile.lastRewardDate=today;}saveProfile();render();$('result-icon').textContent=humanWon?'🏆':'🌱';$('result-title').textContent=humanWon?'恭喜，我们赢了！':'这一局惜败，再来一局';$('result-text').textContent=`${state.landlord===0?'你是地主':'你与另一位农民同队'}；${spring?'本局触发“春天”，倍数翻倍。':'本局牌局已正常结算。'}${reward?' 今日首胜再奖励 50 安心积分。':''}`;$('result-score').textContent=`${delta+reward>=0?'+':''}${delta+reward}`;$('result-multiplier').textContent=`×${state.multiplier}`;$('result-score').style.color=delta+reward>=0?'#18724b':'#b23c35';const resultVoice=humanWon?'恭喜，我们赢了':'这一局惜败，休息一下再来';afterNarration(playNarration||resultVoice,()=>{openModal('result');playMusicSting(humanWon?'win':'lose');playEffect(humanWon?'win':'lose');if(playNarration)speak(resultVoice);},900);return true;}
  function flash(message){const toast=$('toast');toast.textContent=message;toast.classList.add('show');clearTimeout(flash.timer);flash.timer=setTimeout(()=>toast.classList.remove('show'),1800);}
  function audioContext(){try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return null;state.audioCtx=state.audioCtx||new Ctx();if(state.audioCtx.state==='suspended')state.audioCtx.resume();return state.audioCtx;}catch(_error){return null;}}
  function playNote(frequency,duration=.22,volume=.035,type='triangle',delay=0){const ctx=audioContext();if(!ctx)return;const oscillator=ctx.createOscillator(),gain=ctx.createGain(),start=ctx.currentTime+delay;oscillator.type=type;oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(volume,start+.02);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);oscillator.connect(gain).connect(ctx.destination);oscillator.start(start);oscillator.stop(start+duration+.03);}
  function playEffect(kind){if(!state.settings.effects)return;const notes={select:[[520,.08,.025]],confirm:[[440,.1,.03],[660,.14,.03,.08]],pass:[[260,.12,.02]],play:[[420,.1,.028],[520,.12,.025,.06]],bomb:[[170,.26,.055],[110,.35,.045,.05]],start:[[392,.1,.03],[523,.14,.035,.08],[659,.18,.035,.16]],win:[[523,.12,.04],[659,.12,.04,.1],[784,.26,.05,.2]],lose:[[392,.16,.03],[330,.24,.028,.12]]};(notes[kind]||notes.play).forEach(([f,d,v,delay=0])=>playNote(f,d,v,kind==='bomb'?'sawtooth':'triangle',delay));}
  function playTraditionalPhrase(){const melody=[392,440,523,587,659,587,523,440,392,330,392,440,523,440,392,330],bass=[196,220,174,196,165,174,147,165];let now=0;melody.forEach((note,index)=>{playNote(note,.23,index%4===0?.02:.015,index%3===0?'square':'triangle',now);if(index%2===0)playNote(bass[(index/2)%bass.length],.32,.011,'sine',now);if(index%4===2)playNote(784,.055,.008,'square',now+.08);now+=.19;});}
  function playExcitingPhrase(){const melody=[523,659,784,659,587,698,880,784,659,587,523,659],bass=[196,220,247,220,174,196];let now=0;melody.forEach((note,index)=>{playNote(note,.16,.022,index%2?'square':'triangle',now);if(index%2===0)playNote(bass[(index/2)%bass.length],.25,.014,'sawtooth',now);if(index%3===1)playNote(1046,.045,.009,'square',now+.05);now+=.14;});}
  function desiredMusicMode(){if(state.phase!=='playing')return'normal';const landlordCards=state.landlord===null?17:(state.hands[state.landlord]?.length||17),shortest=Math.min(...state.hands.map(hand=>hand.length||17));return state.multiplier>=4||landlordCards<=5||shortest<=3?'exciting':'normal';}
  function playMusicLoop(){if(!state.settings.music)return;const next=desiredMusicMode();state.musicMode=next;if(next==='exciting')playExcitingPhrase();else playTraditionalPhrase();}
  function playMusicSting(kind){if(!state.settings.music)return;if(kind==='win'){playNote(523,.14,.03,'triangle');playNote(659,.16,.032,'triangle',.12);playNote(784,.28,.04,'square',.25);}else if(kind==='lose'){playNote(392,.16,.025,'triangle');playNote(349,.18,.024,'triangle',.13);playNote(294,.32,.022,'sine',.28);}}
  function startMusic(){if(!state.settings.music||state.musicTimer)return;playMusicLoop();state.musicTimer=setInterval(playMusicLoop,3200);}
  function stopMusic(){clearInterval(state.musicTimer);state.musicTimer=null;}
  function applySettings(){document.documentElement.dataset.font=state.settings.font;$('setting-music').checked=state.settings.music;$('setting-voice').checked=state.settings.voice;$('setting-effects').checked=state.settings.effects;$('setting-font').value=state.settings.font;$('setting-difficulty').value=state.settings.difficulty;const soundOn=state.settings.music||state.settings.voice||state.settings.effects;$('audio-toggle').innerHTML=`${soundOn?'🔊':'🔇'} <span>${soundOn?'声音开':'声音关'}</span>`;if(state.settings.music&&state.phase!=='idle')startMusic();else if(!state.settings.music)stopMusic();}
  function toggleAllAudio(){const next=!(state.settings.music||state.settings.voice||state.settings.effects);state.settings.music=next;state.settings.voice=next;state.settings.effects=next;saveSettings();if(next){startMusic();speak('声音已开启');}else{try{speechSynthesis.cancel();}catch(_error){}stopMusic();}}
  function openModal(id){$(id)?.classList.remove('hidden');}
  function closeModal(id){$(id)?.classList.add('hidden');}
  function bindEvents(){$('start').addEventListener('click',()=>{const current=window.PureDDZTest?.getState?.();const inProgress=current&&['bidding','playing'].includes(current.phase)&&current.hands?.some(hand=>Array.isArray(hand)&&hand.length>0);if(inProgress&&!window.confirm('确定要重新发牌吗？当前这一局不会计分。'))return;startRound();});$('welcome-start').addEventListener('click',startRound);$('welcome-settings').addEventListener('click',()=>{closeModal('welcome');openModal('settings-modal');});$('again').addEventListener('click',startRound);$('result-close').addEventListener('click',()=>closeModal('result'));$('play').addEventListener('click',playSelected);$('pass').addEventListener('click',()=>pass(0));$('hint').addEventListener('click',hint);$('audio-toggle').addEventListener('click',toggleAllAudio);$('settings-open').addEventListener('click',()=>openModal('settings-modal'));$('help-open').addEventListener('click',()=>openModal('help-modal'));document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>closeModal(button.dataset.close)));document.querySelectorAll('[data-bid]').forEach(button=>button.addEventListener('click',()=>humanBid(Number(button.dataset.bid))));$('setting-music').addEventListener('change',event=>{state.settings.music=event.target.checked;saveSettings();});$('setting-voice').addEventListener('change',event=>{state.settings.voice=event.target.checked;if(!state.settings.voice){try{speechSynthesis.cancel();}catch(_error){}}saveSettings();});$('setting-effects').addEventListener('change',event=>{state.settings.effects=event.target.checked;saveSettings();});$('setting-font').addEventListener('change',event=>{state.settings.font=event.target.value;saveSettings();});$('setting-difficulty').addEventListener('change',event=>{state.settings.difficulty=event.target.value;saveSettings();});document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMusic();else if(state.settings.music&&state.phase!=='idle')startMusic();});}
  window.PureDDZNativeBack=()=>{for(const id of['settings-modal','help-modal','result','welcome'])if(!$(id).classList.contains('hidden')){closeModal(id);return true;}return false;};
  window.PureDDZTest=Object.freeze({version:VERSION,start:startRound,bid:humanBid,hint,analyze,canBeat,generateCandidates,chooseAiBid,chooseAiPlay,describePlay,getState:()=>deepCopy({...state,selected:[...state.selected],turnTimer:null,musicTimer:null,audioCtx:null}),analyzeRanks:ranks=>analyze(ranks.map((rank,index)=>({id:index,rank,suit:'♠'}))),expertMemory:()=>window.QilyLeanExpertAI?{history:deepCopy(window.QilyLeanExpertAI.memory.playHistory),controls:window.QilyLeanExpertAI.memory.controlCardsRemaining()}:null,stop:()=>{state.flowToken++;clearTimeout(state.turnTimer);try{speechSynthesis.cancel();}catch(_error){}stopMusic();}});
  bindEvents();applySettings();render();
})();

/* ===== visual-v120.js */
(() => {
  'use strict';
  const HINT_KEY='pure_ddz_qily_hint_enabled_v2',VISUAL_HOLD_MS=900,IS_WECHAT_WEBVIEW=Boolean(window.__PURE_DDZ_WECHAT_WEBVIEW__)||/MicroMessenger/i.test(navigator.userAgent||''),IS_MOBILE_DEVICE=Boolean(window.__PURE_DDZ_MOBILE_DEVICE__)||/Android|iPhone|iPad|iPod|HarmonyOS|Mobile/i.test(navigator.userAgent||'');
  let hintEnabled=localStorage.getItem(HINT_KEY)!=='0',previousState=null,stageSignature='',stageBusy=false,stageTimer=null;
  const visualQueue=[],queuedSignatures=new Set(),$=id=>document.getElementById(id);
  const comboText={single:'单牌',pair:'对子',triple:'三张',triple1:'三带一',triple2:'三带二',straight:'顺子',pairStraight:'连对',airplane:'飞机',airplane1:'飞机带单',airplane2:'飞机带对',four2:'四带二',four2pair:'四带两对',bomb:'炸弹',rocket:'王炸'};
  try{localStorage.removeItem('pure_ddz_qily_autoplay_v1')}catch(_error){}

  function viewportSize(){const vv=window.visualViewport;return{width:Math.max(1,Math.round(vv?.width||window.innerWidth||document.documentElement.clientWidth||1)),height:Math.max(1,Math.round(vv?.height||window.innerHeight||document.documentElement.clientHeight||1))}}
  function isTouchMobile(){const{width,height}=viewportSize();return Boolean(IS_MOBILE_DEVICE||(navigator.maxTouchPoints||0)>0)&&Math.min(width,height)<=900&&Math.max(width,height)<=1400}
  function syncViewportProfile(){
    const root=document.documentElement,{width,height}=viewportSize(),mobile=isTouchMobile(),landscape=mobile&&width>height;
    const scale=Math.max(.78,Math.min(1.08,Math.min(width/844,height/390)));
    root.style.setProperty('--ddz-mobile-vw',`${width}px`);
    root.style.setProperty('--ddz-mobile-vh',`${height}px`);
    root.style.setProperty('--ddz-landscape-scale',scale.toFixed(3));
    root.classList.toggle('ddz-mobile-landscape',landscape);
    root.classList.toggle('ddz-mobile-portrait',mobile&&!landscape);
    root.dataset.ddzViewport=`${width}x${height}`;
    root.dataset.ddzOrientation=landscape?'landscape':mobile?'portrait':'desktop';
    const toggle=$('v120-landscape-toggle');
    if(toggle){toggle.hidden=!mobile||landscape;toggle.setAttribute('aria-hidden',String(!mobile||landscape));}
    const welcomeToggle=$('welcome-landscape');
    if(welcomeToggle){welcomeToggle.hidden=!mobile||landscape;welcomeToggle.setAttribute('aria-hidden',String(!mobile||landscape));}
    return{width,height,mobile,landscape,scale};
  }
  function playSignature(play){return !play?.cards?.length?'':`${play.player}|${play.combo?.type||''}|${play.cards.map(card=>card.id).join('-')}`}
  function snapshotPlay(play){return {player:play.player,combo:{...(play.combo||{})},cards:play.cards.map(card=>({...card}))}}
  function toast(message){const el=$('toast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2200)}
  function ensureVisualStage(){const table=document.querySelector('.table-wrap');if(!table)return;if(!$('v120-play-stage')){const stage=document.createElement('div');stage.id='v120-play-stage';stage.className='v120-play-stage';stage.setAttribute('aria-live','assertive');stage.setAttribute('aria-label','本次出牌视觉反馈');table.appendChild(stage)}if(!$('v120-pass-flash')){const bubble=document.createElement('div');bubble.id='v120-pass-flash';bubble.className='v120-pass-flash';table.appendChild(bubble)}}
  function ensureScrollCue(){if($('v120-scroll-cue'))return;const cue=document.createElement('div');cue.id='v120-scroll-cue';cue.className='v120-scroll-cue';cue.setAttribute('aria-label','页面可上下滑动');cue.innerHTML='<span>↑</span><b>上下滑动</b><span>↓</span>';document.body.appendChild(cue)}
  function updateOrientationUi(){ensureScrollCue();const profile=syncViewportProfile(),scrollable=document.documentElement.scrollHeight>window.innerHeight+12;$('v120-scroll-cue')?.classList.toggle('show',profile.mobile&&!profile.landscape&&scrollable)}
  async function requestLandscape(silent=false){
    const profile=syncViewportProfile();if(!profile.mobile)return false;
    document.documentElement.classList.add('ddz-landscape-requested');
    let locked=false;
    try{if(!document.fullscreenElement&&document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen({navigationUI:'hide'}).catch(()=>{});}catch(_error){}
    try{if(screen.orientation?.lock){await screen.orientation.lock('landscape');locked=true;}}catch(_error){}
    await new Promise(resolve=>setTimeout(resolve,80));
    const after=syncViewportProfile();
    setTimeout(()=>{updateOrientationUi();fitHand();document.querySelector('.game-shell')?.scrollIntoView?.({block:'start',behavior:'smooth'})},120);
    if(after.landscape||locked){toast('已进入横屏牌桌，界面会按屏幕尺寸自动适配');return true;}
    if(!silent)toast(IS_WECHAT_WEBVIEW?'当前微信环境无法强制旋转，请打开系统“自动旋转”后横向放置手机':'浏览器未允许自动横屏，请打开系统“自动旋转”后横向放置手机');
    return false;
  }
  function playerName(player){return player===0?'我':player===1?'左家':'右家'}
  function positionClass(player){return player===0?'me':player===1?'left':'right'}
  function renderLargeCard(card){return window.QilyLeanCardTheme?.renderCard?`<span class="v120-play-card">${window.QilyLeanCardTheme.renderCard(card)}</span>`:`<span class="v120-play-card">${String(card.rank)}</span>`}
  function renderStage(play){ensureVisualStage();const stage=$('v120-play-stage');if(!stage)return;stageSignature=playSignature(play);const text=comboText[play.combo?.type]||'出牌';stage.className=`v120-play-stage ${positionClass(play.player)}`;void stage.offsetWidth;stage.innerHTML=`<div class="v120-play-owner">${playerName(play.player)} · ${text} · ${play.cards.length} 张</div><div class="v120-play-cards">${play.cards.map(renderLargeCard).join('')}</div>`;if(['bomb','rocket'].includes(play.combo?.type))stage.classList.add('is-bomb');stage.classList.add('show');stageBusy=true;if(stageTimer)clearTimeout(stageTimer);stageTimer=setTimeout(()=>{stageBusy=false;stageTimer=null;processVisualQueue()},VISUAL_HOLD_MS)}
  function processVisualQueue(){if(stageBusy||!visualQueue.length)return;const play=visualQueue.shift();queuedSignatures.delete(playSignature(play));renderStage(play)}
  function showPlay(play){if(!play?.cards?.length)return;const signature=playSignature(play);if(signature===stageSignature||queuedSignatures.has(signature))return;const copy=snapshotPlay(play);visualQueue.push(copy);queuedSignatures.add(signature);processVisualQueue()}
  function clearPlayStage(force=false){if(!force&&(stageBusy||visualQueue.length))return;const stage=$('v120-play-stage');if(stage){stage.className='v120-play-stage';stage.innerHTML=''}stageSignature='';if(force){visualQueue.length=0;queuedSignatures.clear();stageBusy=false;if(stageTimer){clearTimeout(stageTimer);stageTimer=null}}}
  function showPass(player){ensureVisualStage();const bubble=$('v120-pass-flash');if(!bubble)return;bubble.className=`v120-pass-flash ${positionClass(player)}`;bubble.textContent=`${playerName(player)} · 不要`;void bubble.offsetWidth;bubble.classList.add('show');setTimeout(()=>bubble.classList.remove('show'),920)}
  function runHint(){if(!hintEnabled){toast('启力提示已关闭，可在设置中开启');return}if(!window.PureDDZTest)return;const state=window.PureDDZTest.getState();if(state.phase!=='playing'||state.current!==0){toast('当前不是你的出牌回合，请自主判断');return}window.PureDDZTest.hint()}
  function ensureHintControl(){const old=$('hint');if(!old)return null;if(old.dataset.qilyHint==='1')return old;const button=old.cloneNode(true);button.id='hint';button.dataset.qilyHint='1';button.classList.remove('autoplay-btn','on');button.classList.add('qily-hint-btn');old.replaceWith(button);button.addEventListener('click',runHint);return button}
  function ensureSettingsToggle(){const grid=document.querySelector('.settings-grid');if(!grid||$('setting-qily-hint'))return;const row=document.createElement('label');row.className='setting-row';row.innerHTML='<span><b>启力提示功能</b><small>可开/关。有牌可压时只推荐并选中；无牌可压时自动喊“不要”并轮到下家。</small></span><input id="setting-qily-hint" type="checkbox">';const difficulty=grid.querySelector('.setting-select:last-of-type');grid.insertBefore(row,difficulty||null);$('setting-qily-hint').addEventListener('change',event=>setHintEnabled(event.target.checked,true))}
  function setHintEnabled(next,announce=false){hintEnabled=Boolean(next);try{localStorage.setItem(HINT_KEY,hintEnabled?'1':'0')}catch(_error){}updateHintUi();if(announce)toast(hintEnabled?'启力提示已开启':'启力提示已关闭')}
  function updateHintUi(state){const button=ensureHintControl();if(button){button.textContent='启力提示';button.title='有牌可压时推荐并选中；无牌可压时自动喊“不要”并轮到下家';button.setAttribute('aria-pressed','false');if(state)button.disabled=!hintEnabled||state.phase!=='playing'||state.current!==0}const setting=$('setting-qily-hint');if(setting)setting.checked=hintEnabled;const play=$('play');if(play)play.textContent='出牌'}
  function normalizeCopy(){document.title='启力精益斗地主｜简单娱乐，益智生活';const brand=document.querySelector('.brand strong');if(brand)brand.textContent='启力精益斗地主';const welcome=$('welcome-title');if(welcome)welcome.textContent='启力精益斗地主';document.querySelector('#left-panel .player-name')?.replaceChildren(document.createTextNode('左家'));document.querySelector('#right-panel .player-name')?.replaceChildren(document.createTextNode('右家'));const apk=document.querySelector('.apk-inline');if(apk&&!apk.classList.contains('apk-hold')){const badge=document.createElement('span');badge.className='apk-inline apk-hold';badge.textContent='Android版暂未开放';apk.replaceWith(badge)}document.querySelectorAll('.feature-list li').forEach(li=>{if(li.textContent.includes('启力托管'))li.innerHTML='<b>语音、音乐、启力提示</b><span>有牌可压时只推荐选牌；无牌可压时自动喊“不要”并轮到下家</span>'});const help=$('help-modal');if(help){const eyebrow=help.querySelector('.eyebrow');if(eyebrow)eyebrow.textContent='自主思考优先，AI 只做必要提示';const ai=[...help.querySelectorAll('.help-sections section')].find(section=>section.querySelector('b')?.textContent.trim()==='AI');if(ai){const title=ai.querySelector('h3'),copy=ai.querySelector('p');if(title)title.textContent='启力提示';if(copy)copy.textContent='有牌可压时只推荐并选中建议牌，由你手动确认“出牌”；没有合法可压牌时自动喊“不要”并直接轮到下家。'}}const hint=$('hint-message');if(hint)hint.textContent=''}
  function ensureStatsReset(){const board=document.querySelector('.scoreboard');if(!board||$('v120-reset-stats'))return;const button=document.createElement('button');button.id='v120-reset-stats';button.className='v120-reset-stats';button.type='button';button.textContent='清零';button.title='清零安心积分、胜负和连胜统计';button.addEventListener('click',()=>{if(!window.confirm('确定清零安心积分、胜负和连胜统计吗？游戏设置不会改变。'))return;try{localStorage.setItem('pure_ddz_profile_v1',JSON.stringify({score:1000,wins:0,losses:0,streak:0,bestStreak:0,games:0,lastRewardDate:''}))}catch(_error){}location.reload()});board.appendChild(button)}
  function fitHand(){const hand=$('hand');if(!hand)return;const cards=[...hand.querySelectorAll('.card')];if(!cards.length)return;cards.forEach((card,index)=>{if(index)card.style.removeProperty('margin-left')});const styles=getComputedStyle(hand),paddingLeft=parseFloat(styles.paddingLeft)||0,paddingRight=parseFloat(styles.paddingRight)||0;const available=Math.max(120,hand.clientWidth-paddingLeft-paddingRight-4),cardWidth=cards[0].getBoundingClientRect().width,count=cards.length;if(count<=1){hand.style.justifyContent='center';return}const natural=cardWidth*count;if(natural<=available){hand.style.justifyContent='center';return}const exactStep=Math.max(1,(available-cardWidth)/(count-1));const overlap=Math.max(0,cardWidth-exactStep);cards.forEach((card,index)=>{if(index)card.style.marginLeft=`-${overlap.toFixed(2)}px`});hand.style.justifyContent='center'}
  function detectPass(prev,next){if(!prev||prev.phase!=='playing'||next.phase!=='playing'||prev.current===next.current)return;const beforeSig=playSignature(prev.lastPlay),afterSig=playSignature(next.lastPlay);if(beforeSig===afterSig&&beforeSig){showPass(prev.current);return}if(beforeSig&&!afterSig&&next.current===prev.lastPlay?.player)showPass(prev.current)}
  function refresh(){if(!window.PureDDZTest)return;ensureVisualStage();ensureSettingsToggle();ensureStatsReset();normalizeCopy();updateOrientationUi();const state=window.PureDDZTest.getState();updateHintUi(state);detectPass(previousState,state);const signature=playSignature(state.lastPlay);if(signature)showPlay(state.lastPlay);else if(state.phase!=='bidding')clearPlayStage();previousState=state;fitHand()}
  function bindLandscapeControls(){const bind=id=>{const button=$(id);if(!button||button.dataset.ddzLandscapeBound==='1')return;button.dataset.ddzLandscapeBound='1';button.addEventListener('click',event=>{event.preventDefault();void requestLandscape(false)})};bind('v120-landscape-toggle');bind('welcome-landscape')}
  function onViewportChanged(){updateOrientationUi();fitHand()}
  function start(){ensureVisualStage();ensureScrollCue();ensureSettingsToggle();ensureStatsReset();normalizeCopy();bindLandscapeControls();updateOrientationUi();document.documentElement.classList.add('ddz-ready');window.addEventListener('orientationchange',()=>setTimeout(onViewportChanged,120));screen.orientation?.addEventListener?.('change',()=>setTimeout(onViewportChanged,100));window.addEventListener('resize',onViewportChanged,{passive:true});window.visualViewport?.addEventListener?.('resize',onViewportChanged,{passive:true});window.visualViewport?.addEventListener?.('scroll',onViewportChanged,{passive:true});document.addEventListener('fullscreenchange',()=>setTimeout(onViewportChanged,80));window.addEventListener('scroll',updateOrientationUi,{passive:true});setInterval(refresh,120)}
  window.QilyLeanV120=Object.freeze({version:'1.2.4-mobile-landscape-adaptive',visualHoldMs:VISUAL_HOLD_MS,wechatWebView:IS_WECHAT_WEBVIEW,mobileDevice:IS_MOBILE_DEVICE,get hintEnabled(){return hintEnabled},setHintEnabled,runHint,requestLandscape,refresh,fitHand,syncViewportProfile});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
