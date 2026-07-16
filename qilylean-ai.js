(function(){
'use strict';
var API='https://qilylean-ai.dinghunter623.workers.dev/chat';
var messages=document.getElementById('messages'),form=document.getElementById('chatForm'),q=document.getElementById('question'),send=document.getElementById('sendBtn'),status=document.getElementById('status'),clear=document.getElementById('clearBtn'),quick=document.getElementById('quick');
var state={previousResponseId:null,items:[]};
try{var saved=JSON.parse(localStorage.getItem('qilylean_ai_session')||'null');if(saved&&Array.isArray(saved.items))state=saved;}catch(_e){}
function save(){localStorage.setItem('qilylean_ai_session',JSON.stringify(state));}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];});}
function add(role,text,persist){var row=document.createElement('div');row.className='msg '+role;row.innerHTML='<div><div class="bubble">'+esc(text)+'</div><div class="meta">'+(role==='user'?'您':'QilyLean AI')+'</div></div>';messages.appendChild(row);messages.scrollTop=messages.scrollHeight;if(persist!==false){state.items.push({role:role,text:text});if(state.items.length>30)state.items=state.items.slice(-30);save();}}
function render(){messages.innerHTML='';if(!state.items.length)add('assistant','您好，我是 QilyLean 制造改善AI顾问。您可以直接描述产品、工序、节拍、人员、设备、质量或交付问题，我会按工程化逻辑协助分析。',false);else state.items.forEach(function(x){add(x.role,x.text,false);});}
function busy(v,label){send.disabled=v;q.disabled=v;status.textContent=label||'准备就绪';}
function diagnosticMessage(data){var lines=[data.error||'AI服务请求失败'];if(data.upstream_status)lines.push('状态码：'+data.upstream_status);if(data.upstream_code)lines.push('错误代码：'+data.upstream_code);if(data.upstream_type)lines.push('错误类型：'+data.upstream_type);if(data.request_id)lines.push('请求ID：'+data.request_id);return lines.join('\n');}
async function ask(text){add('user',text);busy(true,'正在分析…');try{var r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,previous_response_id:state.previousResponseId})});var data=await r.json().catch(function(){return{};});if(!r.ok)throw new Error(diagnosticMessage(data));state.previousResponseId=data.response_id||null;add('assistant',data.answer||'暂未获得有效回答，请重试。');save();status.textContent='回答完成';}catch(e){add('assistant','连接AI服务失败：\n'+e.message+'\n请稍后重试。');status.textContent='连接失败';}finally{busy(false,status.textContent);q.focus();}}
form.addEventListener('submit',function(e){e.preventDefault();var text=q.value.trim();if(!text)return;q.value='';ask(text);});
q.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit();}});
quick.addEventListener('click',function(e){if(e.target.tagName==='BUTTON'){q.value=e.target.textContent;form.requestSubmit();}});
clear.addEventListener('click',function(){state={previousResponseId:null,items:[]};save();render();status.textContent='会话已清空';q.focus();});
render();
})();