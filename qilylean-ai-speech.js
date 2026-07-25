(function(){
'use strict';
var messages=document.getElementById('messages');
if(!messages)return;

var synth=window.speechSynthesis;
var supported=Boolean(synth&&window.SpeechSynthesisUtterance);
var activeButton=null;
var speechRequestId=0;
var settings={gender:'female',rate:'1'};
var INTRO_TEXT='您好，我是 QilyLean AI 智能解惑顾问。这里不仅解答工作中的疑难问题，也面向生活、学习、兴趣爱好及其他各类困惑。您可以直接提问，或上传文件、图片、视频及语音，我会结合实际需求提供清晰、专业、可执行的分析与建议。';

function injectStyles(){
  if(document.getElementById('qilyleanSpeechStyles'))return;
  var style=document.createElement('style');
  style.id='qilyleanSpeechStyles';
  style.textContent='.speech-tools{display:flex!important;align-items:center!important;flex-wrap:wrap!important;gap:8px!important;margin:8px 4px 0!important;position:relative}.speech-play{flex:0 0 auto}.speech-settings-bar{display:flex;align-items:center;flex-wrap:wrap;gap:7px;min-height:34px;padding:5px 8px;border:1px solid #c9dfdc;border-radius:9px;background:#f8fbfa;color:var(--forest);font-size:12px;font-weight:800}.speech-field{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}.speech-field-name{color:var(--muted);font-weight:800}.speech-gender,.speech-rate{min-height:28px;border:1px solid var(--line);border-radius:6px;background:#fff;color:var(--ink);font:inherit;font-weight:800}.speech-gender{width:148px;padding:3px 6px}.speech-rate{width:58px;padding:3px 5px;text-align:center}.speech-gender:focus,.speech-rate:focus{border-color:var(--teal);outline:2px solid rgba(23,127,135,.12)}.speech-save-state{display:inline-flex;align-items:center;min-height:24px;padding:2px 7px;border-radius:999px;background:#e8f6f3;color:var(--teal);font-size:11px;font-weight:900;white-space:nowrap}.speech-save-state.warning{background:#fff5dc;color:#8a661a}.speech-save-state.error{background:#fdecea;color:#9b3f35}@media(max-width:640px){.speech-tools{align-items:stretch!important}.speech-play{min-height:36px}.speech-settings-bar{width:100%;align-items:flex-start}.speech-field{flex:1 1 150px}.speech-gender{width:100%;min-width:132px}.speech-save-state{flex-basis:100%;width:max-content}}';
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

function updateSettingState(savedNow){
  var choice=chooseVoice(settings.gender);
  messages.querySelectorAll('.speech-save-state').forEach(function(state){
    state.classList.remove('warning','error');
    state.removeAttribute('title');
    if(!supported){
      state.textContent='浏览器不支持语音';
      state.classList.add('error');
      return;
    }
    if(settings.gender==='male'){
      if(choice&&choice.matched){
        state.textContent=savedNow?'✓ 男声已保存':'✓ 男声已启用';
        state.title='当前男声：'+(choice.voice.name||'系统中文男声');
      }else{
        state.textContent=savedNow?'✓ 已保存 · 低沉模式':'⚠ 未检测到中文男声';
        state.classList.add('warning');
        state.title='当前设备未提供可识别的中文男声，将使用中文语音的低沉音调模式。';
      }
    }else{
      state.textContent=savedNow?'✓ 女声已保存':'自动保存';
      if(choice&&choice.voice)state.title='当前女声：'+(choice.voice.name||'系统中文女声');
    }
  });
}

function ensureVoices(callback){
  if(!supported){callback();return;}
  if(availableVoices().length){callback();return;}
  var finished=false;
  var finish=function(){
    if(finished)return;
    finished=true;
    synth.removeEventListener&&synth.removeEventListener('voiceschanged',finish);
    callback();
  };
  synth.addEventListener&&synth.addEventListener('voiceschanged',finish,{once:true});
  window.setTimeout(finish,650);
}

function speak(text,button){
  if(!supported){
    button.textContent='浏览器不支持播报';
    button.disabled=true;
    return;
  }
  if(activeButton===button){
    stopSpeech();
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
    utterance.lang='zh-CN';
    utterance.rate=Number(settings.rate)||1;
    utterance.volume=1;
    if(choice&&choice.voice)utterance.voice=choice.voice;
    if(settings.gender==='male')utterance.pitch=choice&&choice.matched ? .88 : .58;
    else utterance.pitch=1.04;
    button.textContent='■ 停止播报';
    utterance.onend=resetActive;
    utterance.onerror=function(){
      resetActive();
      updateSettingState(false);
    };
    synth.cancel();
    synth.speak(utterance);
    updateSettingState(false);
  });
}

function syncMenus(){
  messages.querySelectorAll('.speech-gender').forEach(function(select){select.value=settings.gender;});
  messages.querySelectorAll('.speech-rate').forEach(function(input){input.value=settings.rate;});
}

function applyGender(value){
  settings.gender=value==='male'?'male':'female';
  saveSettings();
  syncMenus();
  stopSpeech();
  updateSettingState(true);
}

function applyRate(value){
  settings.rate=normaliseRate(value);
  saveSettings();
  syncMenus();
  stopSpeech();
  updateSettingState(true);
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

function createField(name,control){
  var label=document.createElement('label');
  label.className='speech-field';
  var title=document.createElement('span');
  title.className='speech-field-name';
  title.textContent=name;
  label.appendChild(title);
  label.appendChild(control);
  return label;
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

  var settingsBar=document.createElement('div');
  settingsBar.className='speech-settings-bar';
  settingsBar.setAttribute('aria-label','语音播报设置，修改后自动保存');

  var gender=document.createElement('select');
  gender.className='speech-gender';
  gender.innerHTML='<option value="female">女播音员</option><option value="male">男播音员（庄重有力）</option>';
  gender.value=settings.gender;
  gender.setAttribute('aria-label','播音员');
  gender.addEventListener('change',function(){applyGender(gender.value);});

  var rate=document.createElement('input');
  rate.type='number';
  rate.min='.5';
  rate.max='3';
  rate.step='.1';
  rate.inputMode='decimal';
  rate.className='speech-rate';
  rate.value=settings.rate;
  rate.setAttribute('aria-label','播放速度倍率');
  bindRateInput(rate);
  var rateWrap=document.createElement('span');
  rateWrap.style.display='inline-flex';
  rateWrap.style.alignItems='center';
  rateWrap.style.gap='4px';
  rateWrap.appendChild(rate);
  var rateUnit=document.createElement('span');
  rateUnit.textContent='×';
  rateWrap.appendChild(rateUnit);

  var state=document.createElement('span');
  state.className='speech-save-state';
  state.textContent='自动保存';

  settingsBar.appendChild(createField('播音员',gender));
  settingsBar.appendChild(createField('速度',rateWrap));
  settingsBar.appendChild(state);

  tools.appendChild(play);
  tools.appendChild(settingsBar);
  wrap.insertBefore(tools,meta||null);
}

function decorateAll(){
  updateIntro();
  messages.querySelectorAll('.msg.assistant').forEach(decorate);
  syncMenus();
  updateSettingState(false);
}

injectStyles();
decorateAll();
new MutationObserver(function(){decorateAll();}).observe(messages,{childList:true,subtree:true});
window.addEventListener('beforeunload',stopSpeech);
var clearButton=document.getElementById('clearBtn');
if(clearButton)clearButton.addEventListener('click',stopSpeech);
if(supported){
  var refreshVoices=function(){updateSettingState(false);};
  synth.addEventListener?synth.addEventListener('voiceschanged',refreshVoices):synth.onvoiceschanged=refreshVoices;
}
})();
