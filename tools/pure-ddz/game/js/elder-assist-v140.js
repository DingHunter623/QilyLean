/* QilyLean Pure DDZ elder-assist runtime v1.4.1｜2026-09-02
 * 1) Qily hint automatically passes when no legal response exists.
 * 2) Detailed play narration follows the rendered legal combo and cards for elder-friendly listening.
 * The observer is read-only and limited to the center play region; it never rebuilds page structure.
 */
(function(d,w){
  'use strict';
  if(w.__qilyDdzElderAssistV141)return;
  w.__qilyDdzElderAssistV141=true;
  w.__qilyDdzElderAssistV140=true;
  var lastPlaySignature='';
  var ORDER={'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,'J':11,'Q':12,'K':13,'A':14,'2':15,'小王':16,'大王':17};
  function rankText(node){var b=node&&node.querySelector('b');if(!b)return'';return (b.textContent||'').trim().replace(/[♠♥♣♦]/g,'');}
  function counts(ranks){var map={};ranks.forEach(function(rank){map[rank]=(map[rank]||0)+1;});return map;}
  function sortedRanks(ranks){return Array.from(new Set(ranks)).sort(function(a,b){return (ORDER[a]||99)-(ORDER[b]||99);});}
  function byCount(map,n){return Object.keys(map).filter(function(rank){return map[rank]===n;}).sort(function(a,b){return (ORDER[a]||99)-(ORDER[b]||99);});}
  function joinRanks(list){return list.join('、');}
  function describeCurrentPlay(){
    var ownerNode=d.querySelector('#center-play .play-owner');if(!ownerNode)return'';
    var ownerRaw=(ownerNode.textContent||'').trim(),parts=ownerRaw.split('·'),owner=(parts[0]||'').trim(),combo=(parts[1]||'').trim();
    var cardNodes=Array.from(d.querySelectorAll('#center-play .mini-card')),ranks=cardNodes.map(rankText).filter(Boolean);if(!ranks.length)return'';
    var map=counts(ranks),unique=sortedRanks(ranks),detail='';
    if(combo==='单牌')detail=ranks[0];
    else if(combo==='对子')detail='一对'+byCount(map,2)[0];
    else if(combo==='三张')detail='三个'+byCount(map,3)[0];
    else if(combo==='三带一'){var t1=byCount(map,3)[0],s1=byCount(map,1)[0];detail='三个'+t1+'带'+s1;}
    else if(combo==='三带二'){var t2=byCount(map,3)[0],p2=byCount(map,2)[0];detail='三个'+t2+'带两个'+p2;}
    else if(combo==='顺子')detail=unique[0]+'到'+unique[unique.length-1]+'顺子';
    else if(combo==='连对')detail=unique[0]+'到'+unique[unique.length-1]+'连对';
    else if(combo==='飞机'||combo==='飞机带单'||combo==='飞机带对'){
      var triples=Object.keys(map).filter(function(rank){return map[rank]>=3&&(ORDER[rank]||99)<=14;}).sort(function(a,b){return ORDER[a]-ORDER[b];});
      var core=triples.length?triples[0]+'到'+triples[triples.length-1]+'飞机':'飞机';
      if(combo==='飞机')detail=core;
      else if(combo==='飞机带单'){var wings1=Object.keys(map).filter(function(rank){return triples.indexOf(rank)===-1;});detail=core+'带翅膀'+(wings1.length?'，带'+joinRanks(sortedRanks(wings1)):'');}
      else {var wings2=Object.keys(map).filter(function(rank){return triples.indexOf(rank)===-1&&map[rank]===2;});detail=core+'带翅膀'+(wings2.length?'，带两对'+joinRanks(sortedRanks(wings2)):'');}
    }
    else if(combo==='四带二'||combo==='四带两对'){var four=byCount(map,4)[0],others=Object.keys(map).filter(function(rank){return rank!==four;});detail='四个'+four+(combo==='四带两对'?'带两对':'带')+joinRanks(sortedRanks(others));}
    else if(combo==='炸弹')detail='四个'+byCount(map,4)[0];
    else if(combo==='王炸')detail='王炸';
    else detail=combo||joinRanks(unique);
    if(!detail)return'';
    return (owner==='我'?'您':owner)+'出牌：'+detail;
  }
  function voiceEnabled(){var checkbox=d.getElementById('setting-voice');return !checkbox||checkbox.checked;}
  function speakDirect(text){
    if(!text||!voiceEnabled())return;
    try{if(w.QilyLeanAndroid&&typeof w.QilyLeanAndroid.speak==='function'){w.QilyLeanAndroid.speak(String(text));return;}}catch(_e){}
    try{
      if(!('speechSynthesis'in w))return;
      w.speechSynthesis.cancel();
      var utterance=new SpeechSynthesisUtterance(String(text));utterance.lang='zh-CN';utterance.rate=.9;utterance.pitch=1;utterance.volume=.92;w.speechSynthesis.speak(utterance);
    }catch(_error){}
  }
  function announceRenderedPlay(){
    var center=d.getElementById('center-play');if(!center)return;
    var detailed=describeCurrentPlay();if(!detailed)return;
    var signature=(center.textContent||'').replace(/\s+/g,' ').trim();if(!signature||signature===lastPlaySignature)return;
    lastPlaySignature=signature;
    /* game.js starts a short generic phrase before render(); this post-render announcement cancels it and replaces it with the precise combo. */
    w.setTimeout(function(){speakDirect(detailed);},0);
  }
  function installDetailedNarration(){
    var center=d.getElementById('center-play');if(!center)return;
    if('MutationObserver'in w){
      var observer=new MutationObserver(announceRenderedPlay);observer.observe(center,{childList:true,subtree:true,characterData:true});w.__qilyDdzNarrationObserverV141=observer;
    }
  }
  function installHintAutoPass(){
    var hint=d.getElementById('hint'),pass=d.getElementById('pass'),message=d.getElementById('hint-message');if(!hint||!pass||!message)return;
    hint.addEventListener('click',function(){
      w.setTimeout(function(){
        var text=(message.textContent||'').trim();if(!/当前没有合适组合|没有能压过的牌/.test(text)||pass.disabled)return;
        message.textContent='启力提示：要不起，已自动交由下家。';
        pass.click();
        w.setTimeout(function(){speakDirect('要不起');},0);
      },0);
    });
  }
  function init(){installDetailedNarration();installHintAutoPass();}
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(document,window);
