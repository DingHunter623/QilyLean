/* QilyLean Pure DDZ elder-assist runtime v1.4.0｜2026-09-02
 * 1) Qily hint automatically passes when no legal response exists.
 * 2) Web speech expands generic combo names into elder-friendly card-by-card combo announcements.
 */
(function(d,w){
  'use strict';
  if(w.__qilyDdzElderAssistV140)return;
  w.__qilyDdzElderAssistV140=true;
  var autoPassPending=false;
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
    var subject=owner==='我'?'您':owner;
    return subject+'出牌：'+detail;
  }
  function genericPlayText(text){return /^(?:我|左家|右家)，(?:单牌|对子|三张|三带一|三带二|顺子|连对|飞机|飞机带单|飞机带对|四带二|四带两对)$/.test(text)||/^(?:炸弹|王炸)$/.test(text);}
  function patchSpeech(){
    var synth=w.speechSynthesis;if(!synth||typeof synth.speak!=='function'||synth.__qilyElderPatched)return;
    var original=synth.speak.bind(synth);synth.__qilyElderPatched=true;
    try{synth.speak=function(utterance){
      var text=String(utterance&&utterance.text||'');
      if(text==='不要'&&autoPassPending){autoPassPending=false;var passUtter=new SpeechSynthesisUtterance('要不起');passUtter.lang=utterance.lang||'zh-CN';passUtter.rate=utterance.rate||.92;passUtter.pitch=utterance.pitch||1;passUtter.volume=utterance.volume||.9;original(passUtter);return;}
      if(!genericPlayText(text)){original(utterance);return;}
      setTimeout(function(){var detailed=describeCurrentPlay();if(!detailed){original(utterance);return;}var expanded=new SpeechSynthesisUtterance(detailed);expanded.lang=utterance.lang||'zh-CN';expanded.rate=utterance.rate||.92;expanded.pitch=utterance.pitch||1;expanded.volume=utterance.volume||.9;original(expanded);},0);
    };}catch(_error){}
  }
  function installHintAutoPass(){
    var hint=d.getElementById('hint'),pass=d.getElementById('pass'),message=d.getElementById('hint-message');if(!hint||!pass||!message)return;
    hint.addEventListener('click',function(){setTimeout(function(){var text=(message.textContent||'').trim();if(!/当前没有合适组合|没有能压过的牌/.test(text))return;if(pass.disabled)return;autoPassPending=true;message.textContent='启力提示：要不起，已自动交由下家。';pass.click();},0);});
  }
  function init(){patchSpeech();installHintAutoPass();}
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(document,window);
