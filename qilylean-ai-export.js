(function(){
'use strict';
var messages=document.getElementById('messages');
var bar=document.querySelector('.chat .bar');
var clearButton=document.getElementById('clearBtn');
if(!messages||!bar||!clearButton)return;

function injectStyles(){
  if(document.getElementById('qilyleanExportStyles'))return;
  var style=document.createElement('style');
  style.id='qilyleanExportStyles';
  style.textContent='.export-tools{display:flex;align-items:center;gap:7px;padding:0 8px}.export-btn{min-height:32px;padding:6px 10px;border:1px solid #b9d9d4;border-radius:8px;background:#f5faf9;color:var(--forest);font:inherit;font-size:12px;font-weight:850;cursor:pointer;white-space:nowrap}.export-btn:hover,.export-btn:focus-visible{background:#e8f6f3;border-color:var(--teal);box-shadow:0 5px 14px rgba(15,75,90,.12);outline:none}.export-excel{border-color:#c8d9b5;background:#f7faef}.export-word{border-color:#b9d9d4}@media(max-width:720px){.bar{flex-wrap:wrap}.export-tools{order:3;width:100%;justify-content:flex-end;padding:7px 10px;border-top:1px solid var(--line)}.clear{margin-left:auto}}';
  document.head.appendChild(style);
}

function esc(value){
  return String(value==null?'':value).replace(/[&<>"']/g,function(character){
    return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[character];
  });
}

function pad(value){return String(value).padStart(2,'0');}

function stamp(){
  var now=new Date();
  return {
    display:now.getFullYear()+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate())+' '+pad(now.getHours())+':'+pad(now.getMinutes()),
    file:now.getFullYear()+pad(now.getMonth()+1)+pad(now.getDate())+'_'+pad(now.getHours())+pad(now.getMinutes())
  };
}

function download(content,type,filename){
  var blob=new Blob(['\ufeff',content],{type:type+';charset=utf-8'});
  var url=URL.createObjectURL(blob);
  var link=document.createElement('a');
  link.href=url;
  link.download=filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(function(){URL.revokeObjectURL(url);},1200);
}

function cleanText(node){
  return String(node&&node.innerText||node&&node.textContent||'').replace(/\n{3,}/g,'\n\n').trim();
}

function conversation(){
  var items=[];
  messages.querySelectorAll('.msg:not(.thinking)').forEach(function(row){
    var bubble=row.querySelector('.bubble');
    if(!bubble)return;
    var text=cleanText(bubble);
    if(!text)return;
    var role=row.classList.contains('user')?'user':'assistant';
    var clone=bubble.cloneNode(true);
    clone.querySelectorAll('script,button,select,input,details,.speech-tools').forEach(function(node){node.remove();});
    items.push({role:role,text:text,html:clone.innerHTML});
  });
  return items;
}

function pairs(items){
  var result=[];
  var current=null;
  items.forEach(function(item){
    if(item.role==='user'){
      current={question:item.text,answer:'',kind:'问答'};
      result.push(current);
    }else if(current&&!current.answer){
      current.answer=item.text;
    }else{
      result.push({question:'',answer:item.text,kind:'说明'});
    }
  });
  return result;
}

function exportWord(){
  var items=conversation();
  if(!items.length)return;
  var time=stamp();
  var questionNo=0;
  var sections=items.map(function(item){
    if(item.role==='user'){
      questionNo+=1;
      return '<section class="question"><h2>问题 '+questionNo+'</h2><div class="content">'+esc(item.text).replace(/\n/g,'<br>')+'</div></section>';
    }
    var heading=questionNo?'QilyLean AI 回答 '+questionNo:'QilyLean AI 使用说明';
    return '<section class="answer"><h2>'+heading+'</h2><div class="content">'+item.html+'</div></section>';
  }).join('');
  var html='<!doctype html><html><head><meta charset="utf-8"><title>QilyLean AI 对话记录</title><style>'+
    '@page{margin:2cm}body{font-family:"Microsoft YaHei","PingFang SC",Arial,sans-serif;color:#173b44;font-size:11pt;line-height:1.65;margin:0}'+
    '.cover{border-bottom:3px solid #177f87;padding-bottom:16px;margin-bottom:24px}.cover h1{font-size:22pt;color:#0f4b5a;margin:0 0 8px}.sub{color:#5f7474;font-size:10pt}.principle{margin-top:8px;color:#177f87;font-weight:700}'+
    'section{margin:0 0 18px;page-break-inside:avoid}section h2{font-size:13pt;margin:0;padding:8px 12px;border-left:5px solid #177f87;background:#edf6f4;color:#0f4b5a}.question h2{border-left-color:#caa15f;background:#fff8e8}.content{border:1px solid #d5e4e3;border-top:0;padding:12px 14px}'+
    'h3,h4{color:#0f4b5a;margin:14px 0 6px}p{margin:0 0 8px}ul,ol{margin:6px 0 10px;padding-left:24px}li{margin:3px 0}table{width:100%;border-collapse:collapse;margin:10px 0;font-size:10pt}th,td{border:1px solid #bfcfcd;padding:7px 8px;vertical-align:top}th{background:#edf6f4;color:#0f4b5a}pre{white-space:pre-wrap;background:#f4f7f6;border:1px solid #d5e4e3;padding:10px}'+
    '.footer{margin-top:26px;padding-top:10px;border-top:1px solid #d5e4e3;color:#6a7777;font-size:9pt}</style></head><body>'+
    '<div class="cover"><h1>QilyLean AI 对话记录</h1><div class="sub">导出时间：'+esc(time.display)+'</div><div class="principle">简单化 · 专业化 · 标准化</div></div>'+sections+
    '<div class="footer">本文件由 QilyLean AI 根据当前对话内容自动整理。重要结论请结合现场数据、专业标准与实际决策要求复核。</div></body></html>';
  download(html,'application/msword','QilyLean_AI_对话记录_'+time.file+'.doc');
  feedback('Word已导出');
}

function exportExcel(){
  var items=conversation();
  if(!items.length)return;
  var rows=pairs(items);
  var time=stamp();
  var body=rows.map(function(row,index){
    return '<tr><td>'+(index+1)+'</td><td>'+esc(row.kind)+'</td><td>'+esc(row.question).replace(/\n/g,'<br>')+'</td><td>'+esc(row.answer).replace(/\n/g,'<br>')+'</td></tr>';
  }).join('');
  var html='<!doctype html><html><head><meta charset="utf-8"><title>QilyLean AI 对话记录</title><style>body{font-family:"Microsoft YaHei","PingFang SC",Arial,sans-serif}table{border-collapse:collapse;width:100%}td,th{border:1px solid #9fb8b5;padding:8px;vertical-align:top;white-space:normal}th{background:#177f87;color:#fff;font-weight:700}.title{background:#0f4b5a;color:#fff;font-size:18px;font-weight:700;text-align:center}.meta{background:#edf6f4;color:#173b44}.no{width:60px}.kind{width:80px}.question{width:32%}.answer{width:58%}</style></head><body><table>'+
    '<tr><td class="title" colspan="4">QilyLean AI 对话记录</td></tr><tr><td class="meta" colspan="4">导出时间：'+esc(time.display)+'　｜　整理逻辑：简单化、专业化、标准化</td></tr>'+
    '<tr><th class="no">序号</th><th class="kind">类型</th><th class="question">用户提问</th><th class="answer">QilyLean AI 回答</th></tr>'+body+'</table></body></html>';
  download(html,'application/vnd.ms-excel','QilyLean_AI_对话记录_'+time.file+'.xls');
  feedback('Excel已导出');
}

function feedback(text){
  var title=document.getElementById('status');
  var detail=document.getElementById('statusDetail');
  var icon=document.getElementById('statusIcon');
  if(!title||!detail||!icon)return;
  title.textContent=text;
  detail.textContent='文件已按简单化、专业化、标准化逻辑整理，可在下载记录中查看并另存。';
  icon.textContent='✓';
}

injectStyles();
var tools=document.createElement('div');
tools.className='export-tools';
var word=document.createElement('button');
word.type='button';
word.className='export-btn export-word';
word.textContent='导出 Word';
word.title='将当前对话按专业文档版式导出为 Word 文件';
word.addEventListener('click',exportWord);
var excel=document.createElement('button');
excel.type='button';
excel.className='export-btn export-excel';
excel.textContent='导出 Excel';
excel.title='将当前对话按标准问答表导出为 Excel 文件';
excel.addEventListener('click',exportExcel);
tools.appendChild(word);
tools.appendChild(excel);
bar.insertBefore(tools,clearButton);
})();