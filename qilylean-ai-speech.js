(function(){
'use strict';
var messages=document.getElementById('messages');
if(!messages)return;

var synth=window.speechSynthesis;
var supported=Boolean(synth&&window.SpeechSynthesisUtterance);
var activeButton=null;
var activeUtterance=null;
var speechPaused=false;
var speechRequestId=0;
var decorateFrame=0;
var settings={gender:'female',rate:'1'};
var INTRO_TEXT='您好，我是 QilyLean AI 智能解惑顾问。这里不仅解答工作中的疑难问题，也面向生活、学习、兴趣爱好及其他各类困惑。您可以直接提问，或上传文件、图片、视频及语音，我会结合实际需求提供清晰、专业、可执行的分析与建议。';

function injectStyles(){
  if(document.getElementById('qilyleanSpeechStyles'))return;
  var style=document.createElement('style');
  style.id='qilyleanSpeechStyles';
  style.textContent='.speech-tools{display:flex!important;align-items:center!important;flex-wrap:wrap!important;gap:8px!important;margin:8px 4px 0!important;position:relative}.speech-play,.speech-settings summary,.speech-save{min-height:34px;border:1px solid #b9d9d4;border-radius:8px;background:#f5faf9;color:var(--forest);font:inherit;font-size:12px;font-weight:850;cursor:pointer}.speech-play{padding:6px 11px}.speech-play:hover,.speech-play:focus-visible,.speech-settings summary:hover,.speech-settings summary:focus-visible{background:#e8f6f3;border-color:var(--teal);outline:none}.speech-play.playing{background:var(--forest);border-color:var(--forest);color:#fff}.speech-play.paused{background:#fff5dc;border-color:#d7b66c;color:#745511}.speech-settings{position:relative}.speech-settings summary{list-style:none;padding:6px 10px;white-space:nowrap}.speech-settings summary::-webkit-details-marker{display:none}.speech-settings summary::after{content:"⌄";margin-left:5px}.speech-settings[open] summary::after{content:"⌃"}.speech-panel{position:absolute;left:0;top:40px;z-index:30;display:grid;gap:10px;width:230px;padding:12px;border:1px solid var(--line);border-radius:10px;background:#fff;box-shadow:0 12px 28px rgba(15,75,90,.18)}.speech-panel label{display:grid;grid-template-columns:54px 1fr;align-items:center;gap:8px;color:var(--muted);font-size:12px;font-weight:800}.speech-panel select,.speech-panel input{width:100%;min-height:35px;border:1px solid var(--line);border-radius:7px;background:#fff;color:var(--ink);padding:5px 7px;font:inherit}.speech-panel select:focus,.speech-panel input:focus{border-color:var(--teal);outline:2px solid rgba(23,127,135,.12)}.speech-rate-note{margin:-3px 0 0 62px;color:var(--muted);font-size:11px;line-height:1.4}.speech-save{padding:6px 10px;background:var(--forest);border-color:var(--forest);color:#fff}.speech-save:hover,.speech-save:focus-visible{opacity:.9;outline:none}@media(max-width:640px){.speech-tools{align-items:stretch!important}.speech-play{min-height:38px}.speech-panel{position:fixed;left:14px;right:14px;top:auto;bottom:18px;width:auto;z-index:2147483200}.speech-settings summary{min-height:38px}}';
  document.head.appendChild(style);
}

function normaliseRate(value){
  var number=Number(value);
  if(!Number.isFinite(number))number=1;
  number=Math.min(3,Math.max(.5,number));
  return String(Math.round(number*100)/100);
}

try{
  var saved=JSON.parse(localStorage.getItem('qilylean_ai_speech_settings')||'null');
  if(saved){
    if(saved.gender==='male'||saved.gender==='female')settings.gender=saved.gender;
    settings.rate=normaliseRate(saved.rate);
  }
}catch(_e){}

function saveSettings(){
  try{localStorage.setItem('qilylean_ai_speech_settings',JSON.stringify(settings));}catch(_e){}
}

function updateIntro(){
  var first=messages.querySelector('.msg.assistant:not(.thinking) .bubble');
  if(!first||first.dataset.qilyIntroReady==='1')return;
  first.dataset.qilyIntroReady='1';
  var text=(first.innerText||first.textContent||'').trim();
  if(text.indexOf('您好，我是 QilyLean 制造改善 AI 顾问')!==0)return;
  first.innerHTML='';
  var content=document.createElement('div');
  content.className='answer-content';
  var paragraph=document.createElement('p');
  paragraph.textContent=INTRO_TEXT;
  content.appendChild(paragraph);
  first.appendChild(content);
}

function resetActive(){
  if(activeButton){
    activeButton.classList.remove('playing','paused');
    activeButton.textContent='🔊 语音播报';
    activeButton.setAttribute('aria-pressed','false');
    activeButton=null;
  }
  activeUtterance=null;
  speechPaused=false;
}

function stopSpeech(){
  speechRequestId+=1;
  if(supported)synth.cancel();
  resetActive();
}

function voiceText(voice){
  return ((voice&&voice.name)||'')+' '+((voice&&voice.voiceURI)||'');
}

function normaliseVoiceName(voice){
  return voiceText(voice).toLowerCase().replace(/[\s_]+/g,'-');
}

function detectVoiceGender(voice){
  var name=normaliseVoiceName(voice);
  var male=/yun(?:xi|yang|jian|feng|hao|ze|xia|song|fan)|li-?mu|kangkang|zhiwei|danny|liang|male|\bman\b|男声|男播音|reed|rocko|eddy|gordon|aaron/.test(name);
  var female=/xiaoxiao|xiaoyi|xiaomo|xiaohan|xiaorui|xiaoshuang|xiaomei|huihui|yaoyao|ting-?ting|tian-?tian|mei-?jia|sin-?ji|meijia|lili|female|woman|女声|女播音/.test(name);
  if(male&&!female)return 'male';
  if(female&&!male)return 'female';
  return '';
}

function availableVoices(){
  if(!supported)return [];
  return synth.getVoices()||[];
}

function availableChineseVoices(){
  return availableVoices().filter(function(voice){
    return /^zh/i.test(voice.lang||'')||/chinese|mandarin|中文|普通话|国语/i.test(voiceText(voice));
  });
}

function scoreVoice(voice,gender){
  var name=normaliseVoiceName(voice);
  var detected=detectVoiceGender(voice);
  var score=0;
  if(/^zh-cn/i.test(voice.lang||''))score+=40;
  else if(/^zh/i.test(voice.lang||''))score+=24;
  if(voice.localService)score+=3;
  if(detected===gender)score+=120;
  else if(detected&&detected!==gender)score-=140;
  if(gender==='male'){
    if(/yunyang|yunjian|yunfeng|yunhao|yunxi|li-?mu|kangkang|zhiwei/.test(name))score+=25;
    if(/narrator|news|anchor|documentary|广播|播音|新闻/.test(name))score+=7;
  }else if(/xiaoxiao|xiaoyi|ting-?ting|mei-?jia|xiaorui|huihui/.test(name))score+=25;
  return score;
}

function chooseVoice(gender){
  var voices=availableChineseVoices();
  if(!voices.length)return null;
  var exact=voices.filter(function(voice){return detectVoiceGender(voice)===gender;});
  var pool=exact.length?exact:voices;
  var voice=pool.slice().sort(function(a,b){return scoreVoice(b,gender)-scoreVoice(a,gender);})[0]||null;
  return voice?{voice:voice,matched:detectVoiceGender(voice)===gender}:null;
}

function ensureVoices(callback){
  if(!supported||availableVoices().length){callback();return;}
  var finished=false;
  var finish=function(){
    if(finished)return;
    finished=true;
    synth.removeEventListener&&synth.removeEventListener('voiceschanged',finish);
    callback();
  };
  synth.addEventListener&&synth.addEventListener('voiceschanged',finish,{once:true});
  window.setTimeout(finish,500);
}

function pauseSpeech(button){
  if(!supported||activeButton!==button||speechPaused)return;
  synth.pause();
  speechPaused=true;
  button.classList.remove('playing');
  button.classList.add('paused');
  button.textContent='▶ 继续播报';
  button.setAttribute('aria-pressed','true');
}

function resumeSpeech(button){
  if(!supported||activeButton!==button||!speechPaused)return;
  synth.resume();
  speechPaused=false;
  button.classList.remove('paused');
  button.classList.add('playing');
  button.textContent='⏸ 暂停播报';
}

function speak(text,button){
  if(!supported){
    button.textContent='浏览器不支持播报';
    button.disabled=true;
    return;
  }
  if(activeButton===button){
    if(speechPaused)resumeSpeech(button);
    else pauseSpeech(button);
    return;
  }
  stopSpeech();
  var clean=String(text||'').replace(/\s+/g,' ').trim();
  if(!clean)return;
  var requestId=speechRequestId;
  activeButton=button;
  button.classList.add('playing');
  button.textContent='正在准备语音…';
  button.setAttribute('aria-pressed','true');

  ensureVoices(function(){
    if(requestId!==speechRequestId||activeButton!==button)return;
    var utterance=new SpeechSynthesisUtterance(clean);
    var choice=chooseVoice(settings.gender);
    activeUtterance=utterance;
    utterance.lang='zh-CN';
    utterance.rate=Number(settings.rate)||1;
    utterance.volume=1;
    if(choice&&choice.voice)utterance.voice=choice.voice;
    if(settings.gender==='male')utterance.pitch=(choice&&choice.matched)?0.88:0.58;
    else utterance.pitch=1.04;
    button.textContent='⏸ 暂停播报';
    utterance.onend=function(){if(activeUtterance===utterance)resetActive();};
    utterance.onerror=function(){if(activeUtterance===utterance)resetActive();};
    synth.cancel();
    synth.speak(utterance);
  });
}

function createField(name,control){
  var label=document.createElement('label');
  var title=document.createElement('span');
  title.textContent=name;
  label.appendChild(title);
  label.appendChild(control);
  return label;
}

function decorate(row){
  if(!row||row.classList.contains('thinking')||row.dataset.speechReady==='1')return;
  var bubble=row.querySelector('.bubble');
  if(!bubble)return;
  var wrap=bubble.parentElement;
  var meta=wrap.querySelector('.meta');
  var text=(bubble.innerText||bubble.textContent||'').trim();
  if(!text)return;
  row.dataset.speechReady='1';

  var tools=document.createElement('div');
  tools.className='speech-tools';

  var play=document.createElement('button');
  play.type='button';
  play.className='speech-play';
  play.textContent='🔊 语音播报';
  play.setAttribute('aria-pressed','false');
  play.addEventListener('click',function(){speak(text,play);});

  var details=document.createElement('details');
  details.className='speech-settings';
  var summary=document.createElement('summary');
  summary.textContent='播音设置';
  var panel=document.createElement('div');
  panel.className='speech-panel';

  var gender=document.createElement('select');
  gender.innerHTML='<option value="female">女声</option><option value="male">男声</option>';
  gender.value=settings.gender;
  gender.setAttribute('aria-label','声音');

  var rate=document.createElement('input');
  rate.type='number';
  rate.min='.5';
  rate.max='3';
  rate.step='.05';
  rate.inputMode='decimal';
  rate.value=settings.rate;
  rate.setAttribute('aria-label','自定义播放速度');

  var note=document.createElement('p');
  note.className='speech-rate-note';
  note.textContent='可输入 0.50～3.00';

  var save=document.createElement('button');
  save.type='button';
  save.className='speech-save';
  save.textContent='保存设置';
  save.addEventListener('click',function(){
    settings.gender=gender.value==='male'?'male':'female';
    settings.rate=normaliseRate(rate.value);
    saveSettings();
    stopSpeech();
    details.open=false;
  });

  details.addEventListener('toggle',function(){
    if(!details.open)return;
    gender.value=settings.gender;
    rate.value=settings.rate;
  });

  panel.appendChild(createField('声音',gender));
  panel.appendChild(createField('速度',rate));
  panel.appendChild(note);
  panel.appendChild(save);
  details.appendChild(summary);
  details.appendChild(panel);
  tools.appendChild(play);
  tools.appendChild(details);
  wrap.insertBefore(tools,meta||null);
}

function decorateNewRows(){
  decorateFrame=0;
  updateIntro();
  messages.querySelectorAll('.msg.assistant:not(.thinking):not([data-speech-ready="1"])').forEach(decorate);
}

function scheduleDecorate(){
  if(decorateFrame)return;
  decorateFrame=requestAnimationFrame(decorateNewRows);
}

injectStyles();
decorateNewRows();
new MutationObserver(function(records){
  var hasNewRows=records.some(function(record){
    return Array.prototype.some.call(record.addedNodes,function(node){
      return node.nodeType===1&&node.classList&&node.classList.contains('msg');
    });
  });
  if(hasNewRows)scheduleDecorate();
}).observe(messages,{childList:true});

window.addEventListener('beforeunload',stopSpeech);
var clearButton=document.getElementById('clearBtn');
if(clearButton)clearButton.addEventListener('click',stopSpeech);
})();
