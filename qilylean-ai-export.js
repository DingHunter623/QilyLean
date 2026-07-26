(function(){
'use strict';
var messages=document.getElementById('messages');
var bar=document.querySelector('.chat .bar');
var clearButton=document.getElementById('clearBtn');
if(!messages||!bar||!clearButton)return;

var HOME_URL='https://qilylean.com/';
var HOME_QR_SRC='/qilylean/qilylean-home-qr.svg?v=20260722-navigation-v4';
var BRAND_LOGO_SRC='/assets/brand/qilylean-logo.svg?v=20260724-logo-red-dot-v5';
var WECHAT_ID='Qily259';
var PHONE_NUMBERS=['13450014003','15168120722','17681788259'];

function injectStyles(){
  if(document.getElementById('qilyleanExportStyles'))return;
  var style=document.createElement('style');
  style.id='qilyleanExportStyles';
  style.textContent='.export-tools{display:flex;align-items:center;gap:7px;padding:0 8px}.export-btn{min-height:32px;padding:6px 10px;border:1px solid #b9d9d4;border-radius:8px;background:#f5faf9;color:var(--forest);font:inherit;font-size:12px;font-weight:850;cursor:pointer;white-space:nowrap}.export-btn:hover,.export-btn:focus-visible{background:#e8f6f3;border-color:var(--teal);box-shadow:0 5px 14px rgba(15,75,90,.12);outline:none}.export-btn:disabled{opacity:.55;cursor:wait}.export-excel{border-color:#c8d9b5;background:#f7faef}.export-word{border-color:#b9d9d4}@media(max-width:720px){.bar{flex-wrap:wrap}.export-tools{order:3;width:100%;justify-content:flex-end;padding:7px 10px;border-top:1px solid var(--line)}.clear{margin-left:auto}}';
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
  setTimeout(function(){URL.revokeObjectURL(url);},1500);
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

function loadImage(source){
  return new Promise(function(resolve,reject){
    if(!source){reject(new Error('图片尚未就绪'));return;}
    var image=new Image();
    image.onload=function(){resolve(image);};
    image.onerror=function(){reject(new Error('二维码读取失败'));};
    image.src=source;
  });
}

function toPngDataUrl(source,width,height){
  return loadImage(source).then(function(image){
    var canvas=document.createElement('canvas');
    canvas.width=width;
    canvas.height=height||width;
    var context=canvas.getContext('2d');
    context.fillStyle='#fff';
    context.fillRect(0,0,canvas.width,canvas.height);
    context.imageSmoothingEnabled=false;
    context.drawImage(image,0,0,canvas.width,canvas.height);
    return canvas.toDataURL('image/png');
  }).catch(function(){return source||'';});
}

function waitForContactQr(attempt){
  var image=document.querySelector('.wx-qr-image');
  var source=image&&image.getAttribute('src');
  if(source)return Promise.resolve(source);
  if(attempt>=12)return Promise.resolve('');
  return new Promise(function(resolve){
    setTimeout(function(){resolve(waitForContactQr(attempt+1));},100);
  });
}

function exportAssets(){
  return Promise.all([
    toPngDataUrl(HOME_QR_SRC,360,360),
    waitForContactQr(0).then(function(source){return toPngDataUrl(source,420,420);}),
    toPngDataUrl(BRAND_LOGO_SRC,520,112)
  ]).then(function(values){
    return {homeQr:values[0],contactQr:values[1],brandLogo:values[2]};
  });
}

function imageTag(source,alt){
  if(!source)return '<div class="qr-missing">二维码载入失败，请访问 '+esc(HOME_URL)+' 查看。</div>';
  return '<img class="qr" src="'+esc(source)+'" alt="'+esc(alt)+'">';
}

function brandTag(source){
  if(!source)return '<strong>QilyLean｜启力精益</strong>';
  return '<img class="brand-logo" src="'+esc(source)+'" alt="QilyLean｜启力精益">';
}

function contactBlock(assets){
  return '<table class="contact-grid" role="presentation"><tr>'+
    '<td class="contact-card"><h2>分享“启力精益”官网</h2>'+imageTag(assets.homeQr,'QilyLean官网二维码')+
    '<p class="contact-url">'+esc(HOME_URL)+'</p><p>扫码或复制官网地址访问“QilyLean 启力精益”</p></td>'+
    '<td class="contact-card"><h2>交流</h2>'+imageTag(assets.contactQr,'微信二维码')+
    '<p><strong>微信号　'+esc(WECHAT_ID)+'</strong></p><p>手机号码<br>'+PHONE_NUMBERS.map(esc).join('<br>')+'</p></td>'+
    '</tr></table>';
}

function setExportBusy(value){
  bar.querySelectorAll('.export-btn').forEach(function(button){button.disabled=value;});
}

async function exportWord(){
  var items=conversation();
  if(!items.length)return;
  setExportBusy(true);
  feedback('正在整理 Word','正在载入官网与交流二维码，请稍候。','…');
  try{
    var assets=await exportAssets();
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
      '.cover{border-bottom:3px solid #177f87;padding-bottom:16px;margin-bottom:24px}.brand-logo{display:block;width:260px;height:56px;object-fit:contain;object-position:left center;margin:0 0 12px}.cover h1{font-size:22pt;color:#0f4b5a;margin:0 0 8px}.sub{color:#5f7474;font-size:10pt}.principle{margin-top:8px;color:#177f87;font-weight:700}'+
      'section{margin:0 0 18px;page-break-inside:avoid}section h2{font-size:13pt;margin:0;padding:8px 12px;border-left:5px solid #177f87;background:#edf6f4;color:#0f4b5a}.question h2{border-left-color:#caa15f;background:#fff8e8}.content{border:1px solid #d5e4e3;border-top:0;padding:12px 14px}'+
      'h3,h4{color:#0f4b5a;margin:14px 0 6px}p{margin:0 0 8px}ul,ol{margin:6px 0 10px;padding-left:24px}li{margin:3px 0}table{width:100%;border-collapse:collapse;margin:10px 0;font-size:10pt}th,td{border:1px solid #bfcfcd;padding:7px 8px;vertical-align:top}th{background:#edf6f4;color:#0f4b5a}pre{white-space:pre-wrap;background:#f4f7f6;border:1px solid #d5e4e3;padding:10px}'+
      '.contact-grid{width:100%;table-layout:fixed;margin-top:26px;page-break-inside:avoid}.contact-card{width:50%;padding:14px;text-align:center;background:#f8fbfa}.contact-card h2{margin:0 0 10px;color:#0f4b5a;font-size:14pt}.qr{display:block;width:175px;height:175px;object-fit:contain;margin:0 auto 9px}.contact-url{font-size:10pt;color:#35636c}.qr-missing{padding:18px;color:#6a7777}'+
      '.footer{margin-top:26px;padding-top:10px;border-top:1px solid #d5e4e3;color:#6a7777;font-size:9pt}</style></head><body>'+
      '<div class="cover">'+brandTag(assets.brandLogo)+'<h1>QilyLean AI 对话记录</h1><div class="sub">导出时间：'+esc(time.display)+'</div><div class="principle">简单化 · 专业化 · 标准化</div></div>'+sections+contactBlock(assets)+
      '<div class="footer">本文件由 QilyLean AI 根据当前对话内容自动整理。重要结论请结合现场数据、专业标准与实际决策要求复核。</div></body></html>';
    download(html,'application/msword','QilyLean_AI_对话记录_'+time.file+'.doc');
    feedback('Word已导出','聊天记录已附官网二维码、微信二维码、微信号及联系电话。','✓');
  }catch(error){
    feedback('Word导出未完成','二维码或文档整理失败，请稍后重试。','!');
  }finally{
    setExportBusy(false);
  }
}

async function exportExcel(){
  var items=conversation();
  if(!items.length)return;
  setExportBusy(true);
  feedback('正在整理 Excel','正在载入官网与交流二维码，请稍候。','…');
  try{
    var assets=await exportAssets();
    var rows=pairs(items);
    var time=stamp();
    var body=rows.map(function(row,index){
      return '<tr><td>'+(index+1)+'</td><td>'+esc(row.kind)+'</td><td>'+esc(row.question).replace(/\n/g,'<br>')+'</td><td>'+esc(row.answer).replace(/\n/g,'<br>')+'</td></tr>';
    }).join('');
    var html='<!doctype html><html><head><meta charset="utf-8"><title>QilyLean AI 对话记录</title><style>body{font-family:"Microsoft YaHei","PingFang SC",Arial,sans-serif}table{border-collapse:collapse;width:100%}td,th{border:1px solid #9fb8b5;padding:8px;vertical-align:top;white-space:normal}th{background:#177f87;color:#fff;font-weight:700}.brand-row{background:#fff;text-align:center}.brand-logo{display:block;width:260px;height:56px;object-fit:contain;margin:4px auto}.title{background:#0f4b5a;color:#fff;font-size:18px;font-weight:700;text-align:center}.meta{background:#edf6f4;color:#173b44}.no{width:60px}.kind{width:80px}.question{width:32%}.answer{width:58%}.contact-title{background:#edf6f4;color:#0f4b5a;font-size:15px;font-weight:700;text-align:center}.contact-cell{text-align:center}.qr{display:block;width:190px;height:190px;object-fit:contain;margin:8px auto}.contact-url{color:#35636c}.qr-missing{padding:18px;color:#6a7777}</style></head><body><table>'+
      '<tr><td class="brand-row" colspan="4">'+brandTag(assets.brandLogo)+'</td></tr><tr><td class="title" colspan="4">QilyLean AI 对话记录</td></tr><tr><td class="meta" colspan="4">导出时间：'+esc(time.display)+'　｜　整理逻辑：简单化、专业化、标准化</td></tr>'+
      '<tr><th class="no">序号</th><th class="kind">类型</th><th class="question">用户提问</th><th class="answer">QilyLean AI 回答</th></tr>'+body+
      '<tr><td class="contact-title" colspan="2">分享“启力精益”官网</td><td class="contact-title" colspan="2">交流</td></tr>'+
      '<tr><td class="contact-cell" colspan="2">'+imageTag(assets.homeQr,'QilyLean官网二维码')+'<div class="contact-url">'+esc(HOME_URL)+'</div><div>扫码或复制官网地址访问“QilyLean 启力精益”</div></td>'+
      '<td class="contact-cell" colspan="2">'+imageTag(assets.contactQr,'微信二维码')+'<div><strong>微信号　'+esc(WECHAT_ID)+'</strong></div><div>手机号码<br>'+PHONE_NUMBERS.map(esc).join('<br>')+'</div></td></tr>'+
      '</table></body></html>';
    download(html,'application/vnd.ms-excel','QilyLean_AI_对话记录_'+time.file+'.xls');
    feedback('Excel已导出','聊天记录已附官网二维码、微信二维码、微信号及联系电话。','✓');
  }catch(error){
    feedback('Excel导出未完成','二维码或表格整理失败，请稍后重试。','!');
  }finally{
    setExportBusy(false);
  }
}

function feedback(titleText,detailText,iconText){
  var title=document.getElementById('status');
  var detail=document.getElementById('statusDetail');
  var icon=document.getElementById('statusIcon');
  if(!title||!detail||!icon)return;
  title.textContent=titleText;
  detail.textContent=detailText||'文件已按简单化、专业化、标准化逻辑整理，可在下载记录中查看并另存。';
  icon.textContent=iconText||'✓';
}

injectStyles();
var tools=document.createElement('div');
tools.className='export-tools';
var word=document.createElement('button');
word.type='button';
word.className='export-btn export-word';
word.textContent='导出 Word';
word.title='将当前对话及二维码联系信息导出为 Word 文件';
word.addEventListener('click',exportWord);
var excel=document.createElement('button');
excel.type='button';
excel.className='export-btn export-excel';
excel.textContent='导出 Excel';
excel.title='将当前对话及二维码联系信息导出为 Excel 文件';
excel.addEventListener('click',exportExcel);
tools.appendChild(word);
tools.appendChild(excel);
bar.insertBefore(tools,clearButton);
})();
