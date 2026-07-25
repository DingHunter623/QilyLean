(function(){
'use strict';
var messages=document.getElementById('messages');
if(!messages)return;

var synth=window.speechSynthesis;
var supported=Boolean(synth&&window.SpeechSynthesisUtterance);
var activeButton=null;
var settings={gender:'female',rate:'1'};
var INTRO_TEXT='您好，我是 QilyLean AI 智能解惑顾问。这里不仅解答工作中的疑难问题，也面向生活、学习、兴趣爱好及其他各类困惑。您可以直接提问，或上传文件、图片、视频及语音，我会结合实际需求提供清晰、专业、可执行的分析与建议。';

try{
  var saved=JSON.parse(localStorage.getItem('qilylean_ai_speech_settings')||'null');
  if(saved){
    if(saved.gender==='male'||saved.gender==='female')settings.gender=saved.gender;
    if(['0.8','1','1.2','1.5'].indexOf(String(saved.rate))!==-1)settings.rate=String(saved.rate);
  }
}catch(_e){}

function saveSettings(){
  try{localStorage.setItem('qilylean_ai_speech_settings',JSON.stringify(settings));}catch(_e){}
}

function updateIntro(){
  var first=messages.querySelector('.msg.assistant:not(.thinking) .bubble');
  if(!first)return;
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
    activeButton.classList.remove('playing');
    activeButton.textContent='🔊 语音播报';
    activeButton.setAttribute('aria-pressed','false');
    activeButton=null;
  }
}

function stopSpeech(){
  if(supported)synth.cancel();
  resetActive();
}

function availableChineseVoices(){
  if(!supported)return [];
  return synth.getVoices().filter(function(voice){
    return /^zh/i.test(voice.lang||'')||/chinese|mandarin|中文|普通话/i.test((voice.name||'')+' '+(voice.voiceURI||''));
  });
}

function chooseVoice(gender){
  var voices=availableChineseVoices();
  if(!voices.length)return null;
  var female=/female|woman|xiaoxiao|xiaoyi|xiaomo|xiaohan|xiaorui|xiaoshuang|huihui|yaoyao|ting[- ]?ting|sin[- ]?ji|mei[- ]?jia|meijia|lili/i;
  var male=/male|man|yunxi|yunyang|yunfeng|yunhao|kangkang|danny|liang|zhiwei/i;
  var pattern=gender==='male'?male:female;
  var matched=voices.find(function(voice){return pattern.test((voice.name||'')+' '+(voice.voiceURI||''));});
  if(matched)return matched;
  if(gender==='male'&&voices.length>1)return voices[1];
  return voices[0];
}

function speak(text,button){
  if(!supported){
    button.textContent='浏览器不支持播报';
    button.disabled=true;
    return;
  }
  if(activeButton===button&&synth.speaking){
    stopSpeech();
    return;
  }
  stopSpeech();
  var clean=String(text||'').replace(/\s+/g,' ').trim();
  if(!clean)return;
  var utterance=new SpeechSynthesisUtterance(clean);
  utterance.lang='zh-CN';
  utterance.rate=Number(settings.rate)||1;
  utterance.pitch=settings.gender==='male'?0.88:1.08;
  var voice=chooseVoice(settings.gender);
  if(voice)utterance.voice=voice;
  activeButton=button;
  button.classList.add('playing');
  button.textContent='■ 停止播报';
  button.setAttribute('aria-pressed','true');
  utterance.onend=resetActive;
  utterance.onerror=resetActive;
  synth.speak(utterance);
}

function syncMenus(){
  messages.querySelectorAll('.speech-gender').forEach(function(select){select.value=settings.gender;});
  messages.querySelectorAll('.speech-rate,.speech-quick-rate').forEach(function(select){select.value=settings.rate;});
}

function applyRate(value){
  settings.rate=String(value);
  saveSettings();
  syncMenus();
  stopSpeech();
}

function closeOtherMenus(current){
  messages.querySelectorAll('.speech-settings[open]').forEach(function(details){
    if(details!==current)details.removeAttribute('open');
  });
}

function decorate(row){
  if(!row||row.classList.contains('thinking')||row.querySelector('.speech-tools'))return;
  var bubble=row.querySelector('.bubble');
  if(!bubble)return;
  var wrap=bubble.parentElement;
  var meta=wrap.querySelector('.meta');
  var text=(bubble.innerText||bubble.textContent||'').trim();
  if(!text)return;

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
  details.addEventListener('toggle',function(){if(details.open)closeOtherMenus(details);});
  var summary=document.createElement('summary');
  summary.textContent='播报设置';
  details.appendChild(summary);

  var panel=document.createElement('div');
  panel.className='speech-panel';

  var genderLabel=document.createElement('label');
  genderLabel.textContent='播音员';
  var gender=document.createElement('select');
  gender.className='speech-gender';
  gender.innerHTML='<option value="female">女播音员</option><option value="male">男播音员</option>';
  gender.value=settings.gender;
  genderLabel.appendChild(gender);

  var rateLabel=document.createElement('label');
  rateLabel.textContent='播放速度';
  var rate=document.createElement('select');
  rate.className='speech-rate';
  rate.innerHTML='<option value="0.8">较慢 0.8×</option><option value="1">标准 1.0×</option><option value="1.2">稍快 1.2×</option><option value="1.5">快速 1.5×</option>';
  rate.value=settings.rate;
  rateLabel.appendChild(rate);

  var save=document.createElement('button');
  save.type='button';
  save.className='speech-save';
  save.textContent='保存并收起';
  save.addEventListener('click',function(){
    settings.gender=gender.value;
    settings.rate=rate.value;
    saveSettings();
    syncMenus();
    stopSpeech();
    details.removeAttribute('open');
  });

  panel.appendChild(genderLabel);
  panel.appendChild(rateLabel);
  panel.appendChild(save);
  details.appendChild(panel);

  var quickRate=document.createElement('select');
  quickRate.className='speech-quick-rate';
  quickRate.setAttribute('aria-label','播放速度');
  quickRate.innerHTML='<option value="0.8">播放速度 0.8×</option><option value="1">播放速度 1.0×</option><option value="1.2">播放速度 1.2×</option><option value="1.5">播放速度 1.5×</option>';
  quickRate.value=settings.rate;
  quickRate.addEventListener('change',function(){applyRate(quickRate.value);});

  tools.appendChild(play);
  tools.appendChild(details);
  tools.appendChild(quickRate);
  wrap.insertBefore(tools,meta||null);
}

function decorateAll(){
  updateIntro();
  messages.querySelectorAll('.msg.assistant').forEach(decorate);
  syncMenus();
}

decorateAll();
new MutationObserver(function(){decorateAll();}).observe(messages,{childList:true,subtree:true});

document.addEventListener('click',function(event){
  if(!event.target.closest('.speech-settings'))closeOtherMenus(null);
});
window.addEventListener('beforeunload',stopSpeech);
var clearButton=document.getElementById('clearBtn');
if(clearButton)clearButton.addEventListener('click',stopSpeech);
if(supported)synth.onvoiceschanged=decorateAll;
})();