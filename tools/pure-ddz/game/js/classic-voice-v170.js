(() => {
  'use strict';
  if(window.__qilyDdzClassicVoiceV170)return;
  window.__qilyDdzClassicVoiceV170=true;

  const VERSION='1.7.2';
  const rankVoice=rank=>({3:'3',4:'4',5:'5',6:'6',7:'7',8:'8',9:'9',10:'10',11:'勾',12:'抠',13:'K',14:'尖',15:'2',16:'小王',17:'大王'}[rank]||String(rank??''));

  function currentPlay(){
    try{return window.PureDDZTest?.getState?.()?.lastPlay||null;}catch(_error){return null;}
  }
  function groupRanks(cards){
    const groups=new Map();
    (cards||[]).forEach(card=>groups.set(card.rank,(groups.get(card.rank)||0)+1));
    return groups;
  }
  function expandRanks(groups,exclude=[]){
    const out=[];
    [...groups.keys()].sort((a,b)=>a-b).forEach(rank=>{
      let count=groups.get(rank)||0;
      if(exclude.includes(rank))count=Math.max(0,count-3);
      while(count-->0)out.push(rank);
    });
    return out;
  }

  function classicPlayBody(play){
    const combo=play?.combo||{},type=combo.type||'',main=rankVoice(combo.main),groups=groupRanks(play?.cards);
    const ranks=[...groups.keys()].sort((a,b)=>a-b);
    if(type==='rocket')return'王炸';
    if(type==='bomb')return`${main}炸弹`;
    if(type==='single')return main;
    if(type==='pair')return`对${main}`;
    if(type==='triple')return`三个${main}`;
    if(type==='triple1'){
      const side=ranks.find(rank=>rank!==combo.main);
      return`三个${main}带${rankVoice(side)}`;
    }
    if(type==='triple2'){
      const side=ranks.find(rank=>rank!==combo.main);
      return`三个${main}带对${rankVoice(side)}`;
    }
    if(type==='straight')return`${rankVoice(ranks[0])}到${rankVoice(ranks.at(-1))}顺子`;
    if(type==='pairStraight')return`${rankVoice(ranks[0])}到${rankVoice(ranks.at(-1))}连对`;
    if(type==='airplane'||type==='airplane1'||type==='airplane2'){
      const triples=ranks.filter(rank=>(groups.get(rank)||0)>=3&&rank<=14);
      const core=triples.length>1?`${rankVoice(triples[0])}到${rankVoice(triples.at(-1))}飞机`:'飞机';
      if(type==='airplane')return core;
      const remain=expandRanks(groups,triples);
      if(type==='airplane1')return`${core}带${remain.map(rankVoice).join('、')}`;
      const pairRanks=[];
      for(let i=0;i<remain.length;i+=2)pairRanks.push(remain[i]);
      return`${core}带${pairRanks.map(rank=>`对${rankVoice(rank)}`).join('、')}`;
    }
    if(type==='four2'||type==='four2pair'){
      const side=[];
      ranks.filter(rank=>rank!==combo.main).forEach(rank=>{
        const count=groups.get(rank)||0;
        for(let i=0;i<count;i++)side.push(rank);
      });
      if(type==='four2pair'){
        const pairRanks=[];for(let i=0;i<side.length;i+=2)pairRanks.push(side[i]);
        return`四个${main}带${pairRanks.map(rank=>`对${rankVoice(rank)}`).join('、')}`;
      }
      return`四个${main}带${side.map(rankVoice).join('、')}`;
    }
    return'';
  }

  function classicPlayText(source){
    const text=String(source||'').replace(/^\u2060+/,'').trim();
    if(!/^(?:我出|您.*出|左家.*出|右家.*出)/.test(text))return source;
    const body=classicPlayBody(currentPlay());
    return body||source;
  }

  function copyUtteranceProps(from,to){
    try{to.lang=from.lang||'zh-CN';}catch(_error){}
    try{to.rate=Math.min(.92,Math.max(.72,Number(from.rate)||.84));}catch(_error){}
    try{to.pitch=from.pitch||1;}catch(_error){}
    try{to.volume=from.volume||.95;}catch(_error){}
    try{if(from.voice)to.voice=from.voice;}catch(_error){}
    ['onstart','onend','onerror','onpause','onresume','onmark','onboundary'].forEach(key=>{try{if(from[key])to[key]=from[key];}catch(_error){}});
  }

  function markProxy(proxy){
    Object.defineProperty(proxy,'__qilyClassicVoiceV170',{value:true});
    Object.defineProperty(proxy,'__qilyV168Natural',{value:true});
  }

  function installBrowserVoice(){
    try{
      const synth=window.speechSynthesis;
      if(!synth||!window.SpeechSynthesisUtterance||synth.speak?.__qilyClassicVoiceV170)return;
      const downstream=synth.speak.bind(synth);
      const proxy=function(utterance){
        const source=String(utterance?.text||'');
        const classic=classicPlayText(source);
        if(classic!==source){
          const next=new SpeechSynthesisUtterance('\u2060'+classic);
          copyUtteranceProps(utterance,next);
          return downstream(next);
        }
        return downstream(utterance);
      };
      markProxy(proxy);
      synth.speak=proxy;
    }catch(_error){}
  }

  function installAndroidVoice(){
    try{
      const bridge=window.QilyLeanAndroid;
      if(!bridge||typeof bridge.speak!=='function'||bridge.speak.__qilyClassicVoiceV170)return;
      const downstream=bridge.speak.bind(bridge);
      const proxy=function(text){
        const source=String(text||'');
        const classic=classicPlayText(source);
        return downstream(classic!==source?'\u2060'+classic:source);
      };
      markProxy(proxy);
      bridge.speak=proxy;
    }catch(_error){}
  }

  function install(){installBrowserVoice();installAndroidVoice();}
  install();
  const timer=setInterval(install,400);
  window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});

  window.QilyLeanDdzClassicVoiceV170=Object.freeze({version:VERSION,classicPlayBody,classicPlayText,install});
})();