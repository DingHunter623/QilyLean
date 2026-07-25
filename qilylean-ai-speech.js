(function(){
'use strict';
var messages=document.getElementById('messages');
if(!messages)return;

var synth=window.speechSynthesis;
var supported=Boolean(synth&&window.SpeechSynthesisUtterance);
var activeButton=null;
var settings={gender:'female',rate:'1'};
var INTRO_TEXT='您好，我是 QilyLean AI 智能解惑顾问。这里不仅解答工作中的疑难问题，也面向生活、学习、兴趣爱好及其他各类困惑。您可以直接提问，或上传文件、图片、视频及语音，我会结合实际需求提供清晰、专业、可执行的分析与建议。';

function injectStyles(){
  if(document.getElementById('qilyleanSpeechStyles'))return;
  var style=document.createElement('style');
  style.id='qilyleanSpeechStyles';
  style.textContent='.speech-tools{flex-wrap:wrap}.speech-quick-rate-wrap{display:inline-flex;align-items:center;gap:5px;min-height:32px;padding:4px 8px;border:1px solid #b9d9d4;border-radius:8px;background:#f5faf9;color:var(--forest);font-size:12px;font-weight:800}.speech-quick-rate,.speech-rate{width:58px;min-height:28px;padding:3px 5px;border:1px solid var(--line);border-radius:6px;background:#fff;color:var(--ink);font:inherit;text-align:center}.speech-quick-rate:focus,.speech-rate:focus{border-color:var(--teal);outline:2px solid rgba(23,127,135,.12)}.speech-rate-field{display:inline-flex;align-items:center;gap:5px}.speech-rate-hint{margin-top:-3px;color:var(--muted);font-size:11px;line-height:1.45}.speech-panel{width:238px}.speech-panel label{grid-template-columns:72px 1fr}@media(max-width:640px){.speech-quick-rate-wrap{order:3}.speech-panel{width:min(238px,78vw)}}';
  document.head.appendChild(style);
}

function normaliseRate(value){
  var number=Number(value);
  if(!Number.isFinite(number))number=1;
  number=Math.min(3,Math.max(.5,number));
  return String(Math.round(number*10)/10);
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

function scoreVoice(voice,gender){
  var name=((voice.name||'')+' '+(voice.voiceURI||'')).toLowerCase();
  var score=0;
  if(/^zh-cn/i.test(voice.lang||''))score+=8;
  else if(/^zh/i.test(voice.lang||''))score+=5;
  if(voice.localService)score+=1;
  if(gender==='male'){
    if(/yunyang|yunfeng|yunhao|yunxi|kangkang|zhiwei|liang|danny/.test(name))score+=30;
    if(/male|man|男声|男/.test(name))score+=18;
    if(/narrator|news|anchor|documentary|广播|播音|新闻/.test(name))score+=8;
    if(/xiaoxiao|xiaoyi|xiaomo|xiaohan|female|woman|女声|女/.test(name))score-=20;
  }else{
    if(/xiaoxiao|xiaoyi|xiaomo|xiaohan|xiaorui|xiaoshuang|huihui|yaoyao|ting|meijia|lili/.test(name))score+=30;
    if(/female|woman|女声|女/.test(name))score+=18;
    if(/male|man|男声|男/.test(name))score-=20;
  }
  return score;
}

function chooseVoice(gender){
  var voices=availableChineseVoices();
  if(!voices.length)return null;
  return voices.slice().sort(function(a,b){return scoreVoice(b,gender)-scoreVoice(a,gender);})[0]||voices[0];
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
  utterance.pitch=settings.gender==='male'?.72:1.06;
  utterance.volume=1;
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
  messages.querySelectorAll('.speech-rate,.speech-quick-rate').forEach(function(input){input.value=settings.rate;});
}

function applyRate(value){
  settings.rate=normaliseRate(value);
  saveSettings();
  syncMenus();
  stopSpeech();
}

function bindRateInput(input){
  input.addEventListener('change',function(){applyRate(input.value);});
  input.addEventListener('blur',function(){applyRate(input.value);});
  input.addEventListener('keydown',function(event){
    if(event.key==='Enter'){
      event.preventDefault();
      applyRate(input.value);
      input.blur();
    }
  });
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
  gender.innerHTML='<option value="female">女播音员</option><option value="male">男播音员（庄重有力）</option>';
  gender.value=settings.gender;
  genderLabel.appendChild(gender);

  var rateLabel=document.createElement('label');
  rateLabel.textContent='播放速度';
  var rateWrap=document.createElement('span');
  rateWrap.className='speech-rate-field';
  var rate=document.createElement('input');
  rate.type='number';
  rate.min='.5';
  rate.max='3';
  rate.step='.1';
  rate.inputMode='decimal';
  rate.className='speech-rate';
  rate.value=settings.rate;
  rate.setAttribute('aria-label','自定义播放速度倍率');
  bindRateInput(rate);
  var rateUnit=document.createElement('span');
  rateUnit.textContent='×';
  rateWrap.appendChild(rate);
  rateWrap.appendChild(rateUnit);
  rateLabel.appendChild(rateWrap);

  var rateHint=document.createElement('div');
  rateHint.className='speech-rate-hint';
  rateHint.textContent='可自定义 0.5～3.0 倍，步进 0.1。';

  var save=document.createElement('button');
  save.type='button';
  save.className='speech-save';
  save.textContent='保存并收起';
  save.addEventListener('click',function(){
    settings.gender=gender.value;
    settings.rate=normaliseRate(rate.value);
    saveSettings();
    syncMenus();
    stopSpeech();
    details.removeAttribute('open');
  });

  panel.appendChild(genderLabel);
  panel.appendChild(rateLabel);
  panel.appendChild(rateHint);
  panel.appendChild(save);
  details.appendChild(panel);

  var quickRateWrap=document.createElement('label');
  quickRateWrap.className='speech-quick-rate-wrap';
  quickRateWrap.textContent='速度';
  var quickRate=document.createElement('input');
  quickRate.type='number';
  quickRate.min='.5';
  quickRate.max='3';
  quickRate.step='.1';
  quickRate.inputMode='decimal';
  quickRate.className='speech-quick-rate';
  quickRate.value=settings.rate;
  quickRate.setAttribute('aria-label','播放速度倍率');
  bindRateInput(quickRate);
  var quickRateUnit=document.createElement('span');
  quickRateUnit.textContent='×';
  quickRateWrap.appendChild(quickRate);
  quickRateWrap.appendChild(quickRateUnit);

  tools.appendChild(play);
  tools.appendChild(details);
  tools.appendChild(quickRateWrap);
  wrap.insertBefore(tools,meta||null);
}

function decorateAll(){
  updateIntro();
  messages.querySelectorAll('.msg.assistant').forEach(decorate);
  syncMenus();
}

injectStyles();
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