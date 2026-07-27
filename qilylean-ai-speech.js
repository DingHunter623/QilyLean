(function(){
'use strict';
var messages=document.getElementById('messages');
if(!messages)return;

var API_BASES=['https://api.qilylean.com','https://qilylean-ai.dinghunter623.workers.dev'];
var API_PROBE_TIMEOUT=6000;
var TTS_TIMEOUT=38000;
var activeButton=null;
var audioContext=null;
var audioSource=null;
var audioController=null;
var speechChunks=[];
var speechIndex=0;
var speechPaused=false;
var speechRequestId=0;
var decorateFrame=0;
var preferredApiBase='';
var apiProbe=null;
var DEFAULT_RATE='1.2';
var SETTINGS_VERSION='20260727-click-start-v1';
var settings={gender:'female',rate:DEFAULT_RATE,version:SETTINGS_VERSION};
var INTRO_TEXT='您好，我是 QilyLean AI 智能解惑顾问。这里不仅解答工作中的疑难问题，也面向生活、学习、兴趣爱好及其他各类困惑。您可以直接提问，或上传文件、图片、视频及语音，我会结合实际需求提供清晰、专业、可执行的分析与建议。';

function injectStyles(){
  if(document.getElementById('qilyleanSpeechStyles'))return;
  var style=document.createElement('style');
  style.id='qilyleanSpeechStyles';
  style.textContent='.speech-tools{display:flex!important;align-items:center!important;flex-wrap:wrap!important;gap:8px!important;margin:8px 4px 0!important;position:relative}.assistant .bubble{cursor:text}.assistant .bubble .speech-start{border-radius:4px;background:#fff0bd;box-shadow:0 0 0 3px #fff0bd}.speech-click-hint{color:var(--muted);font-size:11px;font-weight:750;line-height:1.45}.speech-play,.speech-settings summary,.speech-save{min-height:34px;border:1px solid #b9d9d4;border-radius:8px;background:#f5faf9;color:var(--forest);font:inherit;font-size:12px;font-weight:850;cursor:pointer}.speech-play{padding:6px 11px}.speech-play:hover,.speech-play:focus-visible,.speech-settings summary:hover,.speech-settings summary:focus-visible{background:#e8f6f3;border-color:var(--teal);outline:none}.speech-play.playing{background:var(--forest);border-color:var(--forest);color:#fff}.speech-play.paused{background:#fff5dc;border-color:#d7b66c;color:#745511}.speech-settings{position:relative}.speech-settings summary{list-style:none;padding:6px 10px;white-space:nowrap}.speech-settings summary::-webkit-details-marker{display:none}.speech-settings summary::after{content:"⌄";margin-left:5px}.speech-settings[open] summary::after{content:"⌃"}.speech-panel{position:absolute;left:0;top:40px;z-index:30;display:grid;gap:10px;width:230px;padding:12px;border:1px solid var(--line);border-radius:10px;background:#fff;box-shadow:0 12px 28px rgba(15,75,90,.18)}.speech-panel label{display:grid;grid-template-columns:54px 1fr;align-items:center;gap:8px;color:var(--muted);font-size:12px;font-weight:800}.speech-panel select,.speech-panel input{width:100%;min-height:35px;border:1px solid var(--line);border-radius:7px;background:#fff;color:var(--ink);padding:5px 7px;font:inherit}.speech-panel select:focus,.speech-panel input:focus{border-color:var(--teal);outline:2px solid rgba(23,127,135,.12)}.speech-rate-note{margin:-3px 0 0 62px;color:var(--muted);font-size:11px;line-height:1.4}.speech-save{padding:6px 10px;background:var(--forest);border-color:var(--forest);color:#fff}.speech-save:hover,.speech-save:focus-visible{opacity:.9;outline:none}@media(max-width:640px){.speech-tools{align-items:stretch!important}.speech-play{min-height:38px}.speech-panel{position:fixed;left:14px;right:14px;top:auto;bottom:18px;width:auto;z-index:2147483200}.speech-settings summary{min-height:38px}}';
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
    var savedRate=normaliseRate(saved.rate);
    settings.rate=(saved.version===SETTINGS_VERSION||Number(savedRate)!==1)?savedRate:DEFAULT_RATE;
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

function restoreButton(button){
  if(!button)return;
  button.classList.remove('playing','paused');
  button.textContent='🔊 语音播报';
  button.setAttribute('aria-pressed','false');
}

function closeAudioContext(){
  if(audioSource){
    try{audioSource.onended=null;audioSource.stop();}catch(_e){}
    try{audioSource.disconnect();}catch(_e){}
  }
  audioSource=null;
  if(audioController)audioController.abort();
  audioController=null;
  if(audioContext&&audioContext.state!=='closed'){
    try{audioContext.close();}catch(_e){}
  }
  audioContext=null;
}

function resetActive(){
  restoreButton(activeButton);
  activeButton=null;
  speechChunks=[];
  speechIndex=0;
  speechPaused=false;
  closeAudioContext();
}

function stopSpeech(){
  speechRequestId+=1;
  resetActive();
}

function probeApiBase(base){
  var controller=new AbortController();
  var timeout=setTimeout(function(){controller.abort();},API_PROBE_TIMEOUT);
  return fetch(base+'/health',{
    method:'GET',
    mode:'cors',
    credentials:'omit',
    cache:'no-store',
    signal:controller.signal
  }).then(function(response){return response.ok;}).catch(function(){return false;}).finally(function(){clearTimeout(timeout);});
}

function resolveApiBase(){
  if(preferredApiBase)return Promise.resolve(preferredApiBase);
  if(apiProbe)return apiProbe;
  apiProbe=new Promise(function(resolve){
    var settled=false;
    var remaining=API_BASES.length;
    API_BASES.forEach(function(base){
      probeApiBase(base).then(function(ok){
        if(ok&&!settled){
          settled=true;
          preferredApiBase=base;
          resolve(base);
          return;
        }
        remaining-=1;
        if(!remaining&&!settled){
          settled=true;
          preferredApiBase=API_BASES[API_BASES.length-1];
          resolve(preferredApiBase);
        }
      });
    });
    window.setTimeout(function(){
      if(settled)return;
      settled=true;
      preferredApiBase=API_BASES[API_BASES.length-1];
      resolve(preferredApiBase);
    },API_PROBE_TIMEOUT+300);
  });
  return apiProbe;
}

function alternateApiBase(current){
  return API_BASES.filter(function(base){return base!==current;})[0]||current;
}

function requestTtsOnce(base,text,gender){
  var controller=new AbortController();
  audioController=controller;
  var timeout=setTimeout(function(){controller.abort();},TTS_TIMEOUT);
  return fetch(base+'/tts',{
    method:'POST',
    headers:{'Content-Type':'text/plain;charset=UTF-8','Accept':'audio/wav,audio/*'},
    body:JSON.stringify({text:text,gender:gender}),
    mode:'cors',
    credentials:'omit',
    cache:'no-store',
    signal:controller.signal
  }).then(async function(response){
    if(!response.ok)throw new Error('speech_http_'+response.status);
    var expected=gender==='male'?'Neil':'Cherry';
    var actual=response.headers.get('X-QilyLean-Voice')||'';
    if(actual&&actual!==expected)throw new Error('speech_voice_mismatch');
    return response.arrayBuffer();
  }).finally(function(){
    clearTimeout(timeout);
    if(audioController===controller)audioController=null;
  });
}

async function requestTts(text,gender){
  var base=await resolveApiBase();
  try{
    return await requestTtsOnce(base,text,gender);
  }catch(error){
    var message=String(error&&error.message||'');
    if(message.indexOf('speech_http_')===0&&!/speech_http_50[234]/.test(message))throw error;
    var alternate=alternateApiBase(base);
    var data=await requestTtsOnce(alternate,text,gender);
    preferredApiBase=alternate;
    return data;
  }
}

function splitSpeechText(value){
  var clean=String(value||'').replace(/\s+/g,' ').trim();
  if(!clean)return [];
  var sentences=clean.match(/[^。！？；.!?;]+[。！？；.!?;]?/g)||[clean];
  var chunks=[];
  var current='';
  sentences.forEach(function(sentence){
    var part=sentence.trim();
    if(!part)return;
    while(part.length>360){
      if(current){chunks.push(current);current='';}
      chunks.push(part.slice(0,360));
      part=part.slice(360);
    }
    if(!part)return;
    if(current&&(current.length+part.length)>360){
      chunks.push(current);
      current=part;
    }else current+=part;
  });
  if(current)chunks.push(current);
  return chunks;
}

function speechTextFromClick(bubble,event){
  var node=null;
  var offset=0;
  if(document.caretRangeFromPoint){
    var caretRange=document.caretRangeFromPoint(event.clientX,event.clientY);
    if(caretRange){node=caretRange.startContainer;offset=caretRange.startOffset;}
  }else if(document.caretPositionFromPoint){
    var caretPosition=document.caretPositionFromPoint(event.clientX,event.clientY);
    if(caretPosition){node=caretPosition.offsetNode;offset=caretPosition.offset;}
  }
  var container=node&&(node.nodeType===3?node.parentNode:node);
  if(node&&container&&bubble.contains(container)){
    try{
      var range=document.createRange();
      range.selectNodeContents(bubble);
      var maxOffset=node.nodeType===3?node.nodeValue.length:node.childNodes.length;
      range.setStart(node,Math.min(offset,maxOffset));
      var exact=(range.toString()||'').replace(/\s+/g,' ').trim();
      if(exact)return exact;
    }catch(_e){}
  }
  var target=event.target&&event.target.closest?event.target.closest('h2,h3,h4,p,li,th,td,pre,code'):null;
  if(target&&bubble.contains(target)){
    try{
      var fallbackRange=document.createRange();
      fallbackRange.selectNodeContents(bubble);
      fallbackRange.setStartBefore(target);
      var fallback=(fallbackRange.toString()||'').replace(/\s+/g,' ').trim();
      if(fallback)return fallback;
    }catch(_e){}
  }
  return (bubble.innerText||bubble.textContent||'').trim();
}

function markSpeechStart(target,bubble){
  messages.querySelectorAll('.speech-start').forEach(function(node){node.classList.remove('speech-start');});
  var segment=target&&target.closest?target.closest('h2,h3,h4,p,li,th,td,pre,code'):null;
  if(!segment||!bubble.contains(segment))segment=bubble;
  segment.classList.add('speech-start');
  window.setTimeout(function(){segment.classList.remove('speech-start');},1600);
}

function speakFromBubble(event){
  if(!event.target||!event.target.closest)return;
  if(event.target.closest('a,button,input,textarea,select,summary,details'))return;
  var bubble=event.target.closest('.msg.assistant:not(.thinking) .bubble');
  if(!bubble||!messages.contains(bubble))return;
  var row=bubble.closest('.msg.assistant');
  var button=row&&row.querySelector('.speech-play');
  if(!button)return;
  var text=speechTextFromClick(bubble,event);
  if(!text)return;
  markSpeechStart(event.target,bubble);
  speak(text,button,true);
}

function ensureAudioContext(){
  var AudioContextClass=window.AudioContext||window.webkitAudioContext;
  if(!AudioContextClass)throw new Error('audio_context_unsupported');
  if(!audioContext||audioContext.state==='closed')audioContext=new AudioContextClass();
  return audioContext.resume();
}

function buttonPlaying(button){
  button.classList.remove('paused');
  button.classList.add('playing');
  button.textContent='⏸ 暂停播报';
  button.setAttribute('aria-pressed','true');
}

function buttonPaused(button){
  button.classList.remove('playing');
  button.classList.add('paused');
  button.textContent='▶ 继续播报';
  button.setAttribute('aria-pressed','true');
}

function playBuffer(buffer,requestId,button){
  if(requestId!==speechRequestId||activeButton!==button)return;
  var source=audioContext.createBufferSource();
  audioSource=source;
  source.buffer=buffer;
  source.playbackRate.value=Number(settings.rate)||1;
  source.connect(audioContext.destination);
  source.onended=function(){
    if(requestId!==speechRequestId||audioSource!==source)return;
    audioSource=null;
    speechIndex+=1;
    if(speechIndex>=speechChunks.length){
      resetActive();
      return;
    }
    playNext(requestId,button);
  };
  if(speechPaused)buttonPaused(button);else buttonPlaying(button);
  source.start(0);
}

async function playNext(requestId,button){
  if(requestId!==speechRequestId||activeButton!==button)return;
  button.classList.add('playing');
  button.textContent='正在准备语音…';
  try{
    var bytes=await requestTts(speechChunks[speechIndex],settings.gender);
    if(requestId!==speechRequestId||activeButton!==button)return;
    var buffer=await audioContext.decodeAudioData(bytes.slice(0));
    playBuffer(buffer,requestId,button);
  }catch(error){
    if(requestId!==speechRequestId||activeButton!==button)return;
    closeAudioContext();
    button.classList.remove('playing','paused');
    button.textContent='语音服务暂时不可用';
    activeButton=null;
    window.setTimeout(function(){restoreButton(button);},2400);
  }
}

function pauseSpeech(button){
  if(activeButton!==button||speechPaused)return;
  speechPaused=true;
  if(audioContext&&audioContext.state==='running')audioContext.suspend();
  buttonPaused(button);
}

function resumeSpeech(button){
  if(activeButton!==button||!speechPaused)return;
  speechPaused=false;
  if(audioContext)audioContext.resume();
  buttonPlaying(button);
}

function speak(text,button,restart){
  if(activeButton===button&&!restart){
    if(speechPaused)resumeSpeech(button);else pauseSpeech(button);
    return;
  }
  stopSpeech();
  speechChunks=splitSpeechText(text);
  if(!speechChunks.length)return;
  activeButton=button;
  speechIndex=0;
  speechPaused=false;
  var requestId=speechRequestId;
  button.classList.add('playing');
  button.textContent='正在准备语音…';
  button.setAttribute('aria-pressed','true');
  try{
    ensureAudioContext().then(function(){
      if(requestId===speechRequestId&&activeButton===button)playNext(requestId,button);
    }).catch(function(){
      if(activeButton===button){
        activeButton=null;
        button.textContent='浏览器不支持播报';
        button.disabled=true;
      }
    });
  }catch(_error){
    activeButton=null;
    button.textContent='浏览器不支持播报';
    button.disabled=true;
  }
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
  var hint=document.createElement('span');
  hint.className='speech-click-hint';
  hint.textContent='点击回答任意文字，可从该处开始播放';
  tools.appendChild(play);
  tools.appendChild(details);
  tools.appendChild(hint);
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
messages.addEventListener('click',speakFromBubble);
resolveApiBase();
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
