(function(){
'use strict';

if(window.__qilyLeanAIPasteV1)return;
window.__qilyLeanAIPasteV1=true;

var composer=document.getElementById('chatForm');
var input=document.getElementById('materialInput');
var question=document.getElementById('question');
var status=document.getElementById('status');
var statusDetail=document.getElementById('statusDetail');
var statusIcon=document.getElementById('statusIcon');
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
