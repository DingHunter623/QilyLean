(function(){
'use strict';
var API_BASES=['https://api.qilylean.com','https://qilylean-ai.dinghunter623.workers.dev'];
var TEXT_REQUEST_TIMEOUT=56000;
var API_PROBE_TIMEOUT=6000;
var MATERIAL_REQUEST_TIMEOUT=88000;
var RETRY_DELAY=650;
var MAX_FILE_SIZE=25*1024*1024;
var messages=document.getElementById('messages');
var form=document.getElementById('chatForm');
var q=document.getElementById('question');
var send=document.getElementById('sendBtn');
var status=document.getElementById('status');
var statusDetail=document.getElementById('statusDetail');
var statusPanel=document.getElementById('statusPanel');
var statusIcon=document.getElementById('statusIcon');
var clear=document.getElementById('clearBtn');
var quick=document.getElementById('quick');
var fileInput=document.getElementById('materialInput');
var uploadBtn=document.getElementById('uploadBtn');
var attachmentPreview=document.getElementById('attachmentPreview');
var attachmentKind=document.getElementById('attachmentKind');
var attachmentName=document.getElementById('attachmentName');
var attachmentSize=document.getElementById('attachmentSize');
var removeFile=document.getElementById('removeFile');
var selected=null;
var phaseTimer=null;
var state={previousResponseId:null,items:[]};
var preferredApiBase='';
var apiProbe=null;

try{
  var saved=JSON.parse(localStorage.getItem('qilylean_ai_session')||'null');
  if(saved&&Array.isArray(saved.items))state=saved;
}catch(_e){}

function save(){
  try{localStorage.setItem('qilylean_ai_session',JSON.stringify(state));}catch(_e){}
}

function esc(s){
  return String(s).replace(/[&<>"']/g,function(c){
    return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
  });
}

function inlineFormat(s){
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
    .replace(/__([^_]+)__/g,'<strong>$1</strong>')
    .replace(/`([^`]+)`/g,'<code>$1</code>');
}

function tableCells(line){
  var value=String(line).trim();
  if(value.charAt(0)==='|')value=value.slice(1);
  if(value.charAt(value.length-1)==='|')value=value.slice(0,-1);
  return value.split('|').map(function(cell){return cell.trim();});
}

function isTableSeparator(line){
  var cells=tableCells(line);
  return cells.length>1&&cells.every(function(cell){return /^:?-{3,}:?$/.test(cell);});
}

function renderAnswer(text){
  var lines=String(text||'').replace(/\r/g,'').split('\n');
  var out=[];
  var listType='';
  var inCode=false;
  var code=[];
  function closeList(){if(listType){out.push('</'+listType+'>');listType='';}}
  function closeCode(){if(inCode){out.push('<pre><code>'+esc(code.join('\n'))+'</code></pre>');code=[];inCode=false;}}
  for(var i=0;i<lines.length;i++){
    var raw=lines[i];
    var trimmed=raw.trim();
    if(/^\x60\x60\x60/.test(trimmed)){
      closeList();
      if(inCode)closeCode();else{inCode=true;code=[];}
      continue;
    }
    if(inCode){code.push(raw);continue;}
    if(trimmed&&i+1<lines.length&&trimmed.indexOf('|')!==-1&&isTableSeparator(lines[i+1])){
      closeList();
      var headers=tableCells(trimmed);
      i+=2;
      var rows=[];
      while(i<lines.length&&lines[i].trim()&&lines[i].indexOf('|')!==-1){
        rows.push(tableCells(lines[i]));
        i++;
      }
      i--;
      var table='<div class="table-wrap"><table><thead><tr>';
      headers.forEach(function(cell){table+='<th>'+inlineFormat(cell)+'</th>';});
      table+='</tr></thead><tbody>';
      rows.forEach(function(row){table+='<tr>';headers.forEach(function(_h,index){table+='<td>'+inlineFormat(row[index]||'')+'</td>';});table+='</tr>';});
      table+='</tbody></table></div>';
      out.push(table);
      continue;
    }
    if(!trimmed){closeList();continue;}
    if(/^---+$/.test(trimmed)||/^___+$/.test(trimmed)){closeList();continue;}
    var heading=trimmed.match(/^(#{1,4})\s+(.+)$/);
    if(heading){
      closeList();
      var level=Math.min(4,heading[1].length+1);
      out.push('<h'+level+'>'+inlineFormat(heading[2])+'</h'+level+'>');
      continue;
    }
    var bullet=trimmed.match(/^[-*•]\s+(.+)$/);
    if(bullet){
      if(listType!=='ul'){closeList();listType='ul';out.push('<ul>');}
      out.push('<li>'+inlineFormat(bullet[1])+'</li>');
      continue;
    }
    var numbered=trimmed.match(/^\d+[.)、]\s*(.+)$/);
    if(numbered){
      if(listType!=='ol'){closeList();listType='ol';out.push('<ol>');}
      out.push('<li>'+inlineFormat(numbered[1])+'</li>');
      continue;
    }
    closeList();
    out.push('<p>'+inlineFormat(trimmed)+'</p>');
  }
  closeList();
  closeCode();
  return '<div class="answer-content">'+out.join('')+'</div>';
}

function formatBytes(bytes){
  if(bytes<1024)return bytes+' B';
  if(bytes<1024*1024)return (bytes/1024).toFixed(1)+' KB';
  return (bytes/(1024*1024)).toFixed(1)+' MB';
}

function attachmentLabel(meta){
  if(meta.kind==='image')return '图片';
  if(meta.kind==='video')return '视频';
  if(meta.kind==='audio')return '语音';
  return '文件';
}

function add(role,text,persist,attachment){
  var row=document.createElement('div');
  row.className='msg '+role;
  var wrap=document.createElement('div');
  var bubble=document.createElement('div');
  bubble.className='bubble';
  if(role==='assistant')bubble.innerHTML=renderAnswer(text);
  else{
    var userText=document.createElement('div');
    userText.textContent=text;
    bubble.appendChild(userText);
    if(attachment){
      var chip=document.createElement('div');
      chip.className='attachment-chip';
      var kind=document.createElement('strong');
      kind.textContent=attachmentLabel(attachment);
      var name=document.createElement('span');
      name.textContent=attachment.name+' · '+formatBytes(attachment.size||0);
      chip.appendChild(kind);
      chip.appendChild(name);
      bubble.appendChild(chip);
    }
  }
  var meta=document.createElement('div');
  meta.className='meta';
  meta.textContent=role==='user'?'您':'QilyLean AI';
  wrap.appendChild(bubble);
  wrap.appendChild(meta);
  row.appendChild(wrap);
  messages.appendChild(row);
  messages.scrollTop=messages.scrollHeight;
  if(persist!==false){
    state.items.push({role:role,text:text,attachment:attachment||null});
    if(state.items.length>30)state.items=state.items.slice(-30);
    save();
  }
}

function render(){
  messages.innerHTML='';
  if(!state.items.length){
    add('assistant','您好，我是 QilyLean 制造改善 AI 顾问。您可以直接描述问题，也可以上传文件、图片、视频或语音，我会按工程化逻辑协助分析。',false);
  }else{
    state.items.forEach(function(item){add(item.role,item.text,false,item.attachment||null);});
  }
}

function setStatus(title,detail,icon){
  status.textContent=title;
  statusDetail.textContent=detail||'';
  statusIcon.textContent=icon||'✓';
}

function busy(value,kind){
  send.disabled=value;
  q.disabled=value;
  fileInput.disabled=value;
  uploadBtn.classList.toggle('disabled',value);
  statusPanel.classList.toggle('busy',value);
  if(phaseTimer){clearInterval(phaseTimer);phaseTimer=null;}
  if(value){
    var phases=kind==='document'
      ?['正在读取文档内容，请稍候…','正在提炼关键信息与数据…','正在组织专业分析建议…']
      :kind
        ?['正在识别素材内容，请稍候…','正在分析重点与异常信息…','正在组织专业分析建议…']
        :['正在理解您的问题…','正在梳理关键要点…','正在生成专业回答…'];
    var index=0;
    setStatus('QilyLean AI 正在分析',phases[0],'');
    phaseTimer=setInterval(function(){index=(index+1)%phases.length;statusDetail.textContent=phases[index];},2600);
  }
}

function showThinking(kind){
  removeThinking();
  var row=document.createElement('div');
  row.className='msg assistant thinking';
  row.id='thinkingMessage';
  var wrap=document.createElement('div');
  var bubble=document.createElement('div');
  bubble.className='bubble';
  var label=document.createElement('span');
  label.textContent=kind?'素材已收到，正在进行针对性分析':'问题已收到，正在组织回答';
  var dots=document.createElement('span');
  dots.className='thinking-dots';
  dots.innerHTML='<i></i><i></i><i></i>';
  bubble.appendChild(label);
  bubble.appendChild(dots);
  wrap.appendChild(bubble);
  row.appendChild(wrap);
  messages.appendChild(row);
  messages.scrollTop=messages.scrollHeight;
}

function removeThinking(){
  var working=document.getElementById('thinkingMessage');
  if(working)working.remove();
}

function fileKind(file){
  var type=(file.type||'').toLowerCase();
  var ext=(file.name.split('.').pop()||'').toLowerCase();
  if(type.indexOf('image/')===0)return 'image';
  if(type.indexOf('video/')===0)return 'video';
  if(type.indexOf('audio/')===0)return 'audio';
  if(['pdf','docx','xlsx','txt','md','csv','json','epub','mobi'].indexOf(ext)!==-1)return 'document';
  return '';
}

function readDataUrl(file){
  return new Promise(function(resolve,reject){
    var reader=new FileReader();
    reader.onload=function(){resolve(String(reader.result||''));};
    reader.onerror=function(){reject(new Error('读取素材失败，请重新选择。'));};
    reader.readAsDataURL(file);
  });
}

function clearAttachment(){
  selected=null;
  fileInput.value='';
  attachmentPreview.classList.remove('show');
  attachmentName.textContent='';
  attachmentSize.textContent='';
}

async function selectAttachment(file){
  if(!file)return;
  var kind=fileKind(file);
  if(!kind){
    clearAttachment();
    setStatus('格式暂不支持','请上传页面列出的文件、图片、视频或语音格式。','!');
    return;
  }
  if(file.size>MAX_FILE_SIZE){
    clearAttachment();
    setStatus('素材过大','单个素材不能超过 25MB，请压缩后重新上传。','!');
    return;
  }
  setStatus('正在读取素材','请稍候，读取完成后即可发送。','…');
  try{
    var data=await readDataUrl(file);
    selected={file:file,data:data,kind:kind,name:file.name,type:file.type||'',size:file.size};
    attachmentKind.textContent=attachmentLabel(selected);
    attachmentName.textContent=file.name;
    attachmentSize.textContent=formatBytes(file.size)+' · 已就绪';
    attachmentPreview.classList.add('show');
    setStatus('素材已就绪','请填写分析要求，或直接点击发送。','✓');
    q.focus();
  }catch(error){
    clearAttachment();
    setStatus('素材读取失败',error.message,'!');
  }
}

function wait(ms){
  return new Promise(function(resolve){setTimeout(resolve,ms);});
}

function isNetworkFailure(error){
  var name=String(error&&error.name||'');
  var message=String(error&&error.message||'');
  return name==='AbortError'||/load failed|failed to fetch|networkerror|network request failed|timed out/i.test(message);
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

function requestOnce(payload,hasAttachment,isRetry,base){
  var controller=new AbortController();
  var timeout=setTimeout(function(){controller.abort();},hasAttachment?MATERIAL_REQUEST_TIMEOUT:TEXT_REQUEST_TIMEOUT);
  var url=base+'/chat'+(isRetry?'?retry=1&t='+Date.now():'');
  return fetch(url,{
    method:'POST',
    headers:{'Content-Type':'text/plain;charset=UTF-8','Accept':'application/json'},
    body:JSON.stringify(payload),
    mode:'cors',
    credentials:'omit',
    cache:'no-store',
    signal:controller.signal
  }).finally(function(){clearTimeout(timeout);});
}

async function requestAnswer(payload,hasAttachment){
  var base=await resolveApiBase();
  try{
    var first=await requestOnce(payload,hasAttachment,false,base);
    if(!hasAttachment&&(first.status===502||first.status===503||first.status===504)){
      var gatewayAlternate=alternateApiBase(base);
      setStatus('主链路暂时不可用，正在切换备用链路','系统正在自动切换接口，您无需重复提问。','↻');
      await wait(RETRY_DELAY);
      var gatewayResponse=await requestOnce(payload,false,true,gatewayAlternate);
      preferredApiBase=gatewayAlternate;
      return gatewayResponse;
    }
    return first;
  }catch(error){
    if(hasAttachment||error&&error.name==='AbortError'||!isNetworkFailure(error))throw error;
    var alternate=alternateApiBase(base);
    setStatus('主链路未连接，正在切换备用链路','系统正在自动切换接口，您无需重复提问。','↻');
    var response=await requestOnce(payload,false,true,alternate);
    preferredApiBase=alternate;
    return response;
  }
}

function clientErrorMessage(error){
  var message=String(error&&error.message||'');
  if((error&&error.name==='AbortError')||/timed out/i.test(message)){
    return '本次回答等待超过约55秒，系统已停止等待且没有重复提交。请点击发送再次提交；若使用4G，可切换至Wi-Fi后重试。';
  }
  if(/load failed|failed to fetch|networkerror|network request failed/i.test(message)){
    return '主链路与备用链路均未能连接。请点击发送再次提交；若使用4G，可切换至Wi-Fi后重试。';
  }
  return message||'AI 服务暂时未能完成回答，请稍后重试。';
}

function friendlyError(response,data){
  if(response.status===413)return '素材超过处理限制，请压缩后重新上传。';
  if(response.status===415)return '该素材格式暂不支持，请更换页面列出的格式。';
  if(response.status===429)return '今日使用次数已达上限，请明日再试。';
  if(response.status===504)return '本次分析超时，请压缩素材或稍后重试。';
  if(data&&data.error==='Attachment analysis is unavailable')return '素材分析服务暂时不可用，请稍后重试。';
  return 'AI 服务暂时未能完成回答，请稍后重试。';
}

async function ask(text){
  var current=selected;
  var attachmentMeta=current?{name:current.name,size:current.size,kind:current.kind}:null;
  var shownText=text||'请分析这份素材，提炼关键信息、问题判断与可执行建议。';
  add('user',shownText,true,attachmentMeta);
  busy(true,current&&current.kind);
  showThinking(current&&current.kind);
  try{
    var payload={message:shownText,previous_response_id:state.previousResponseId};
    if(current){
      payload.attachment={name:current.name,type:current.type,size:current.size,kind:current.kind,data:current.data};
    }
    var response=await requestAnswer(payload,Boolean(current));
    var data=await response.json().catch(function(){return{};});
    if(!response.ok)throw new Error(friendlyError(response,data));
    state.previousResponseId=data.response_id||null;
    removeThinking();
    add('assistant',data.answer||'暂未获得有效回答，请重试。');
    save();
    busy(false);
    setStatus('回答完成','您可以继续追问，或上传新的素材。','✓');
  }catch(error){
    removeThinking();
    add('assistant',clientErrorMessage(error));
    busy(false);
    setStatus('本次回答未完成','请稍后重试；如上传了素材，也可压缩后再次提交。','!');
  }finally{
    clearAttachment();
    q.focus();
  }
}

form.addEventListener('submit',function(event){
  event.preventDefault();
  var text=q.value.trim();
  if(!text&&!selected){
    setStatus('请输入问题或上传素材','两者至少选择一项后再发送。','!');
    q.focus();
    return;
  }
  q.value='';
  ask(text);
});

q.addEventListener('keydown',function(event){
  if(event.key==='Enter'&&!event.shiftKey){
    event.preventDefault();
    form.requestSubmit();
  }
});

quick.addEventListener('click',function(event){
  if(event.target.tagName==='BUTTON'&&!send.disabled){
    q.value=event.target.textContent;
    form.requestSubmit();
  }
});

fileInput.addEventListener('change',function(){selectAttachment(fileInput.files&&fileInput.files[0]);});
uploadBtn.addEventListener('keydown',function(event){
  if((event.key==='Enter'||event.key===' ')&&!fileInput.disabled){
    event.preventDefault();
    fileInput.click();
  }
});
removeFile.addEventListener('click',function(){
  clearAttachment();
  setStatus('素材已移除','可重新选择素材，或直接输入问题。','✓');
});

clear.addEventListener('click',function(){
  state={previousResponseId:null,items:[]};
  save();
  clearAttachment();
  removeThinking();
  busy(false);
  render();
  setStatus('会话已清空','可开始新的问题或素材分析。','✓');
  q.focus();
});

render();
resolveApiBase();
})();