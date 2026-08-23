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
