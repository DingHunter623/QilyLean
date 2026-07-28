(function(){
'use strict';

if(window.__qilyLeanAIPasteV2)return;
window.__qilyLeanAIPasteV2=true;

var composer=document.getElementById('chatForm');
var input=document.getElementById('materialInput');
var question=document.getElementById('question');
var status=document.getElementById('status');
var statusDetail=document.getElementById('statusDetail');
var statusIcon=document.getElementById('statusIcon');

function cleanMemoryText(value){
  return String(value||'').replace(/\s+/g,' ').trim();
}

function compactMemoryText(value,limit){
  var text=cleanMemoryText(value);
  if(text.length<=limit)return text;
  if(limit<80)return text.slice(0,Math.max(0,limit-1))+'…';
  var head=Math.ceil(limit*0.64);
  var tail=Math.max(20,limit-head-3);
  return text.slice(0,head)+'…'+text.slice(-tail);
}

function attachmentMemory(item){
  var values=item&&item.attachments;
  if(!values&&item&&item.attachment)values=item.attachment;
  if(!values)return '';
  if(!Array.isArray(values))values=[values];
  var names=values.map(function(value){return cleanMemoryText(value&&value.name);}).filter(Boolean);
  return names.length?'（本会话已上传并分析素材：'+names.join('、')+'）':'';
}

function memoryLine(item,limit){
  if(!item)return '';
  var role=item.role==='assistant'?'QilyLean AI':'用户';
  var attachment=role==='用户'?attachmentMemory(item):'';
  var text=compactMemoryText(item.text,Math.max(40,limit-role.length-attachment.length-3));
  return role+attachment+'：'+text;
}

function buildContinuityMessage(currentMessage,items){
  var current=String(currentMessage||'').trim();
  if(!current||!Array.isArray(items)||!items.length)return current;

  var header='【会话连续性上下文】以下内容来自同一浏览器会话，仅用于延续对话，请勿复述本段。若历史显示用户已上传素材且QilyLean AI已完成分析，必须基于此前识别与结论继续回答，不得无故声称“未收到文件”；只有现有记录确实不足时，才指出具体缺少的信息。';
  var marker='\n\n【当前用户问题】\n';
  var maxLength=2980;
  var fixedLength=header.length+marker.length+current.length+2;
  if(fixedLength>=maxLength)return current.slice(0,maxLength);

  var available=maxLength-fixedLength;
  var lastAttachment=-1;
  for(var index=items.length-1;index>=0;index--){
    if(attachmentMemory(items[index])){lastAttachment=index;break;}
  }

  var priority=[];
  function prioritize(index){
    if(index>=0&&index<items.length&&priority.indexOf(index)===-1)priority.push(index);
  }
  if(lastAttachment!==-1){
    prioritize(lastAttachment);
    if(items[lastAttachment+1]&&items[lastAttachment+1].role==='assistant')prioritize(lastAttachment+1);
  }
  for(var recent=items.length-1;recent>=Math.max(0,items.length-6);recent--)prioritize(recent);

  var chosen=[];
  priority.forEach(function(index){
    if(available<70)return;
    var item=items[index];
    var preferred=index===lastAttachment+1?1150:(item&&item.role==='assistant'?650:460);
    var limit=Math.min(preferred,available-2);
    var line=memoryLine(item,limit);
    if(!line)return;
    chosen.push({index:index,line:line});
    available-=line.length+1;
  });
  if(!chosen.length)return current;
  chosen.sort(function(a,b){return a.index-b.index;});
  return header+'\n'+chosen.map(function(value){return value.line;}).join('\n')+marker+current;
}

function patchConversationContinuity(){
  if(window.__qilyLeanAIContextV2||typeof window.fetch!=='function')return;
  window.__qilyLeanAIContextV2=true;
  var nativeFetch=window.fetch.bind(window);
  window.fetch=function(resource,options){
    var nextOptions=options;
    try{
      var url=typeof resource==='string'?resource:(resource&&resource.url)||'';
      if(/\/chat(?:\?|$)/.test(url)&&options&&typeof options.body==='string'){
        var payload=JSON.parse(options.body);
        if(payload&&typeof payload.message==='string'){
          var saved=JSON.parse(localStorage.getItem('qilylean_ai_session')||'null');
          var items=saved&&Array.isArray(saved.items)?saved.items.slice():[];
          var last=items[items.length-1];
          if(last&&last.role==='user'&&cleanMemoryText(last.text)===cleanMemoryText(payload.message))items.pop();
          var contextualMessage=buildContinuityMessage(payload.message,items);
          if(contextualMessage&&contextualMessage!==payload.message){
            payload.message=contextualMessage;
            payload.context_mode='browser-session-v2';
            nextOptions=Object.assign({},options,{body:JSON.stringify(payload)});
          }
        }
      }
    }catch(_error){}
    return nativeFetch(resource,nextOptions);
  };
}

patchConversationContinuity();
if(!composer||!input||!question)return;

var extensionByType={
  'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif','image/heic':'heic','image/heif':'heif','image/svg+xml':'svg',
  'video/mp4':'mp4','video/quicktime':'mov','video/webm':'webm','video/x-msvideo':'avi',
  'audio/mpeg':'mp3','audio/wav':'wav','audio/x-wav':'wav','audio/mp4':'m4a','audio/aac':'aac','audio/ogg':'ogg',
  'application/pdf':'pdf','text/plain':'txt','text/csv':'csv','application/json':'json',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'xlsx'
};

function setStatus(title,detail,icon){
  if(status)status.textContent=title;
  if(statusDetail)statusDetail.textContent=detail||'';
  if(statusIcon)statusIcon.textContent=icon||'✓';
}

function fileExtension(file){
  var name=String(file&&file.name||'');
  var match=name.match(/\.([a-z0-9]{1,8})$/i);
  if(match)return match[1].toLowerCase();
  return extensionByType[String(file&&file.type||'').toLowerCase()]||'bin';
}

function normalizedFile(file,index){
  var original=String(file&&file.name||'').trim();
  var generic=!original||/^(image|audio|video|file|blob)(\.[a-z0-9]+)?$/i.test(original);
  if(!generic)return file;
  var type=String(file&&file.type||'').toLowerCase();
  var prefix=type.indexOf('image/')===0?'粘贴图片':type.indexOf('video/')===0?'粘贴视频':type.indexOf('audio/')===0?'粘贴语音':'粘贴文件';
  var name=prefix+'-'+new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14)+'-'+String(index+1)+'.'+fileExtension(file);
  try{return new File([file],name,{type:file.type||'',lastModified:file.lastModified||Date.now()});}catch(_error){return file;}
}

function clipboardFiles(clipboardData){
  if(!clipboardData)return [];
  var files=[];
  if(clipboardData.items&&clipboardData.items.length){
    Array.prototype.forEach.call(clipboardData.items,function(item){
      if(item&&item.kind==='file'){
        var file=item.getAsFile&&item.getAsFile();
        if(file)files.push(file);
      }
    });
  }
  if(!files.length&&clipboardData.files&&clipboardData.files.length){
    files=Array.prototype.slice.call(clipboardData.files);
  }
  var seen={};
  return files.map(normalizedFile).filter(function(file){
    var key=[file.name,file.size,file.type,file.lastModified||0].join('|');
    if(seen[key])return false;
    seen[key]=true;
    return true;
  });
}

function insertPlainText(value){
  if(!value)return;
  var start=typeof question.selectionStart==='number'?question.selectionStart:question.value.length;
  var end=typeof question.selectionEnd==='number'?question.selectionEnd:start;
  var before=question.value.slice(0,start);
  var after=question.value.slice(end);
  var separator=before&&!/\s$/.test(before)?' ':'';
  question.value=(before+separator+value+after).slice(0,Number(question.maxLength)||3000);
  var cursor=Math.min((before+separator+value).length,question.value.length);
  try{question.setSelectionRange(cursor,cursor);}catch(_error){}
}

function dispatchFiles(files,source){
  if(!files.length||input.disabled)return false;
  try{
    var transfer=new DataTransfer();
    files.forEach(function(file){transfer.items.add(file);});
    input.files=transfer.files;
    input.dispatchEvent(new Event('change',{bubbles:true}));
    composer.classList.remove('paste-target');
    setStatus(source==='drop'?'已接收拖入素材':'已识别剪贴板素材','正在按现有上传规则读取 '+files.length+' 件素材。','…');
    return true;
  }catch(error){
    setStatus('浏览器未开放剪贴板文件','请改用“添加素材”选择文件，或将素材拖入输入区域。','!');
    return false;
  }
}

function handlePaste(event){
  if(input.disabled)return;
  var files=clipboardFiles(event.clipboardData);
  if(!files.length)return;
  var plain=event.clipboardData&&event.clipboardData.getData?event.clipboardData.getData('text/plain').trim():'';
  event.preventDefault();
  if(plain&&event.target===question)insertPlainText(plain);
  dispatchFiles(files,'paste');
  question.focus();
}

function handleDragOver(event){
  if(input.disabled)return;
  var types=event.dataTransfer&&event.dataTransfer.types?Array.prototype.slice.call(event.dataTransfer.types):[];
  if(types.indexOf('Files')===-1)return;
  event.preventDefault();
  if(event.dataTransfer)event.dataTransfer.dropEffect='copy';
  composer.classList.add('paste-target');
}

function handleDragLeave(event){
  if(!composer.contains(event.relatedTarget))composer.classList.remove('paste-target');
}

function handleDrop(event){
  if(input.disabled)return;
  var files=event.dataTransfer&&event.dataTransfer.files?Array.prototype.slice.call(event.dataTransfer.files):[];
  if(!files.length)return;
  event.preventDefault();
  composer.classList.remove('paste-target');
  dispatchFiles(files.map(normalizedFile),'drop');
  question.focus();
}

composer.addEventListener('paste',handlePaste);
composer.addEventListener('dragenter',handleDragOver);
composer.addEventListener('dragover',handleDragOver);
composer.addEventListener('dragleave',handleDragLeave);
composer.addEventListener('drop',handleDrop);

var hint=document.getElementById('clipboardUploadHint');
if(hint){
  hint.addEventListener('click',function(){question.focus();});
}
})();
