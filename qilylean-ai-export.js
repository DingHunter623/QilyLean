(function(){
'use strict';
var messages=document.getElementById('messages');
var bar=document.querySelector('.chat .bar');
var clearButton=document.getElementById('clearBtn');
if(!messages||!bar||!clearButton)return;

var HOME_URL='https://qilylean.com';
var HOME_QR_SRC='/qilylean/qilylean-home-qr.svg?v=20260722-navigation-v4';
var WECHAT_ID='Qily259';
var PHONE_NUMBERS=['13450014003','15168120722','17681788259'];
var WORD_MIME='application/vnd.openxmlformats-officedocument.wordprocessingml.document';
var EXCEL_MIME='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
var utf8=new TextEncoder();
var crcTable=null;

function injectStyles(){
  if(document.getElementById('qilyleanExportStyles'))return;
  var style=document.createElement('style');
  style.id='qilyleanExportStyles';
  style.textContent='.export-tools{display:flex;align-items:center;gap:7px;padding:0 8px}.export-btn{min-height:32px;padding:6px 10px;border:1px solid #b9d9d4;border-radius:8px;background:#f5faf9;color:var(--forest);font:inherit;font-size:12px;font-weight:850;cursor:pointer;white-space:nowrap}.export-btn:hover,.export-btn:focus-visible{background:#e8f6f3;border-color:var(--teal);box-shadow:0 5px 14px rgba(15,75,90,.12);outline:none}.export-btn:disabled{opacity:.55;cursor:wait}.export-word{border-color:#b9d9d4}@media(max-width:720px){.bar{flex-wrap:wrap}.export-tools{order:3;width:100%;justify-content:flex-end;padding:7px 10px;border-top:1px solid var(--line)}.clear{margin-left:auto}}';
  document.head.appendChild(style);
}

function xml(value){
  return String(value==null?'':value)
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'')
    .replace(/[&<>"']/g,function(character){
      return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'})[character];
    });
}

function pad(value){return String(value).padStart(2,'0');}

function stamp(){
  var now=new Date();
  return {
    display:now.getFullYear()+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate())+' '+pad(now.getHours())+':'+pad(now.getMinutes()),
    file:now.getFullYear()+pad(now.getMonth()+1)+pad(now.getDate())+'_'+pad(now.getHours())+pad(now.getMinutes()),
    iso:now.toISOString()
  };
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
    items.push({role:row.classList.contains('user')?'user':'assistant',text:text});
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
  }).catch(function(){return '';});
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
    toPngDataUrl(HOME_QR_SRC,240,240),
    waitForContactQr(0).then(function(source){return toPngDataUrl(source,240,240);})
  ]).then(function(values){
    return {homeQr:values[0],contactQr:values[1]};
  });
}

function dataUrlBytes(source){
  if(!/^data:image\/png;base64,/i.test(source||''))return null;
  var binary=atob(source.slice(source.indexOf(',')+1));
  var bytes=new Uint8Array(binary.length);
  for(var index=0;index<binary.length;index+=1)bytes[index]=binary.charCodeAt(index);
  return bytes;
}

function concat(parts){
  var length=parts.reduce(function(total,part){return total+part.length;},0);
  var output=new Uint8Array(length);
  var offset=0;
  parts.forEach(function(part){output.set(part,offset);offset+=part.length;});
  return output;
}

function u16(value){
  var bytes=new Uint8Array(2);
  new DataView(bytes.buffer).setUint16(0,value,true);
  return bytes;
}

function u32(value){
  var bytes=new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0,value>>>0,true);
  return bytes;
}

function crc32(bytes){
  if(!crcTable){
    crcTable=[];
    for(var index=0;index<256;index+=1){
      var current=index;
      for(var bit=0;bit<8;bit+=1)current=(current&1)?(0xedb88320^(current>>>1)):(current>>>1);
      crcTable[index]=current>>>0;
    }
  }
  var crc=0xffffffff;
  for(var offset=0;offset<bytes.length;offset+=1)crc=crcTable[(crc^bytes[offset])&0xff]^(crc>>>8);
  return (crc^0xffffffff)>>>0;
}

function dosStamp(date){
  var year=Math.max(1980,date.getFullYear());
  return {
    time:(date.getHours()<<11)|(date.getMinutes()<<5)|Math.floor(date.getSeconds()/2),
    date:((year-1980)<<9)|((date.getMonth()+1)<<5)|date.getDate()
  };
}

function asBytes(value){
  return value instanceof Uint8Array?value:utf8.encode(String(value));
}

function zipBlob(entries,mime){
  var local=[];
  var central=[];
  var offset=0;
  var now=dosStamp(new Date());
  Object.keys(entries).forEach(function(name){
    var nameBytes=utf8.encode(name);
    var data=asBytes(entries[name]);
    var crc=crc32(data);
    var localHeader=concat([
      u32(0x04034b50),u16(20),u16(0x0800),u16(0),u16(now.time),u16(now.date),
      u32(crc),u32(data.length),u32(data.length),u16(nameBytes.length),u16(0),nameBytes
    ]);
    local.push(localHeader,data);
    central.push(concat([
      u32(0x02014b50),u16(20),u16(20),u16(0x0800),u16(0),u16(now.time),u16(now.date),
      u32(crc),u32(data.length),u32(data.length),u16(nameBytes.length),u16(0),u16(0),
      u16(0),u16(0),u32(0),u32(offset),nameBytes
    ]));
    offset+=localHeader.length+data.length;
  });
  var centralBytes=concat(central);
  var end=concat([
    u32(0x06054b50),u16(0),u16(0),u16(central.length),u16(central.length),
    u32(centralBytes.length),u32(offset),u16(0)
  ]);
  return new Blob(local.concat([centralBytes,end]),{type:mime});
}

function downloadBlob(blob,filename){
  var url=URL.createObjectURL(blob);
  var link=document.createElement('a');
  link.href=url;
  link.download=filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(function(){URL.revokeObjectURL(url);},2000);
}

function wordRuns(text,runProperties){
  var lines=String(text||'').replace(/\r/g,'').split('\n');
  var properties=runProperties&&runProperties.length?'<w:rPr>'+runProperties.join('')+'</w:rPr>':'';
  return lines.map(function(line,index){
    return (index?'<w:r><w:br/></w:r>':'')+'<w:r>'+properties+'<w:t xml:space="preserve">'+xml(line)+'</w:t></w:r>';
  }).join('');
}

function wordParagraph(text,options){
  options=options||{};
  var properties=[];
  var runProperties=[];
  if(options.style)properties.push('<w:pStyle w:val="'+xml(options.style)+'"/>');
  if(options.keep)properties.push('<w:keepNext/>');
  if(options.keepLines)properties.push('<w:keepLines/>');
  if(options.align)properties.push('<w:jc w:val="'+options.align+'"/>');
  if(options.before!=null||options.after!=null||options.line)properties.push('<w:spacing w:before="'+(options.before||0)+'" w:after="'+(options.after||0)+'"'+(options.line?' w:line="'+options.line+'" w:lineRule="auto"':'')+'/>');
  if(options.left!=null||options.right!=null||options.firstLine!=null)properties.push('<w:ind w:left="'+(options.left||0)+'" w:right="'+(options.right||0)+'"'+(options.firstLine?' w:firstLine="'+options.firstLine+'"':'')+'/>');
  if(options.shade)properties.push('<w:shd w:fill="'+options.shade+'"/>');
  if(options.leftBorder)properties.push('<w:pBdr><w:left w:val="single" w:sz="18" w:space="8" w:color="'+options.leftBorder+'"/></w:pBdr>');
  if(options.bottomBorder)properties.push('<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="4" w:color="'+options.bottomBorder+'"/></w:pBdr>');
  if(options.bold)runProperties.push('<w:b/>');
  if(options.color)runProperties.push('<w:color w:val="'+options.color+'"/>');
  if(options.size)runProperties.push('<w:sz w:val="'+options.size+'"/><w:szCs w:val="'+options.size+'"/>');
  var runs=wordRuns(text,runProperties);
  return '<w:p>'+(properties.length?'<w:pPr>'+properties.join('')+'</w:pPr>':'')+runs+'</w:p>';
}

function wordDrawing(relationshipId,documentId,name){
  var size=720000;
  return '<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="20" w:after="40"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0">'+
    '<wp:extent cx="'+size+'" cy="'+size+'"/><wp:docPr id="'+documentId+'" name="'+xml(name)+'"/><wp:cNvGraphicFramePr/>'+
    '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic>'+
    '<pic:nvPicPr><pic:cNvPr id="0" name="'+xml(name)+'"/><pic:cNvPicPr/></pic:nvPicPr>'+
    '<pic:blipFill><a:blip r:embed="'+relationshipId+'"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>'+
    '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="'+size+'" cy="'+size+'"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>'+
    '</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>';
}

function wordContactCell(width,title,drawing,line){
  return '<w:tc><w:tcPr><w:tcW w:w="'+width+'" w:type="dxa"/><w:shd w:fill="F8FBFA"/><w:noWrap/><w:tcMar><w:top w:w="100" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="100" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tcMar><w:vAlign w:val="center"/></w:tcPr>'+
    wordParagraph(title,{style:'QLContactTitle',keep:true})+
    (drawing||wordParagraph('二维码暂未载入',{align:'center',color:'6A7777'}))+
    wordParagraph(line,{style:'QLContactLine'})+'</w:tc>';
}

function wordMetadataCell(width,text,label){
  return '<w:tc><w:tcPr><w:tcW w:w="'+width+'" w:type="dxa"/><w:shd w:fill="'+(label?'F2F4F7':'FFFFFF')+'"/><w:tcMar><w:top w:w="80" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar><w:vAlign w:val="center"/></w:tcPr>'+
    wordParagraph(text,{style:label?'QLMetaLabel':'QLMetaValue'})+'</w:tc>';
}

function wordMetadataTable(time,questionCount){
  var borders='<w:tblBorders><w:top w:val="single" w:sz="6" w:color="AEBBBC"/><w:left w:val="single" w:sz="6" w:color="AEBBBC"/><w:bottom w:val="single" w:sz="6" w:color="AEBBBC"/><w:right w:val="single" w:sz="6" w:color="AEBBBC"/><w:insideH w:val="single" w:sz="6" w:color="D5DDDE"/><w:insideV w:val="single" w:sz="6" w:color="D5DDDE"/></w:tblBorders>';
  return '<w:tbl><w:tblPr><w:tblW w:w="10092" w:type="dxa"/><w:tblInd w:w="0" w:type="dxa"/>'+borders+'<w:tblLayout w:type="fixed"/></w:tblPr>'+
    '<w:tblGrid><w:gridCol w:w="1450"/><w:gridCol w:w="3300"/><w:gridCol w:w="1450"/><w:gridCol w:w="3892"/></w:tblGrid>'+
    '<w:tr><w:trPr><w:cantSplit/></w:trPr>'+
      wordMetadataCell(1450,'文件名称',true)+wordMetadataCell(3300,'QilyLean AI 对话记录',false)+
      wordMetadataCell(1450,'导出时间',true)+wordMetadataCell(3892,time.display,false)+
    '</w:tr>'+
    '<w:tr><w:trPr><w:cantSplit/></w:trPr>'+
      wordMetadataCell(1450,'文档类型',true)+wordMetadataCell(3300,'AI 对话记录',false)+
      wordMetadataCell(1450,'对话轮次',true)+wordMetadataCell(3892,questionCount+' 轮',false)+
    '</w:tr></w:tbl>';
}

function wordStyles(){
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'+
    '<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:eastAsia="Microsoft YaHei" w:hAnsi="Arial" w:cs="Arial"/><w:sz w:val="21"/><w:szCs w:val="21"/><w:color w:val="222222"/><w:lang w:val="zh-CN" w:eastAsia="zh-CN"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="320" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>'+
    '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="120" w:line="320" w:lineRule="auto"/></w:pPr><w:rPr><w:rFonts w:ascii="Arial" w:eastAsia="Microsoft YaHei" w:hAnsi="Arial"/><w:sz w:val="21"/><w:szCs w:val="21"/><w:color w:val="222222"/></w:rPr></w:style>'+
    '<w:style w:type="paragraph" w:styleId="QLTitle"><w:name w:val="QilyLean Document Title"/><w:basedOn w:val="Normal"/><w:next w:val="QLSubtitle"/><w:qFormat/><w:pPr><w:keepNext/><w:jc w:val="center"/><w:spacing w:before="120" w:after="60" w:line="420" w:lineRule="auto"/></w:pPr><w:rPr><w:b/><w:color w:val="173B44"/><w:sz w:val="38"/><w:szCs w:val="38"/></w:rPr></w:style>'+
    '<w:style w:type="paragraph" w:styleId="QLSubtitle"><w:name w:val="QilyLean Document Subtitle"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:jc w:val="center"/><w:spacing w:before="0" w:after="180" w:line="260" w:lineRule="auto"/></w:pPr><w:rPr><w:color w:val="5F7474"/><w:sz w:val="19"/><w:szCs w:val="19"/></w:rPr></w:style>'+
    '<w:style w:type="paragraph" w:styleId="QLHeading1"><w:name w:val="QilyLean Heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="QLSectionHeading"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="260" w:after="100"/><w:pBdr><w:bottom w:val="single" w:sz="8" w:space="5" w:color="7B9395"/></w:pBdr><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:color w:val="173B44"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr></w:style>'+
    '<w:style w:type="paragraph" w:styleId="QLSectionHeading"><w:name w:val="QilyLean Section Heading"/><w:basedOn w:val="Normal"/><w:next w:val="QLProcedureBody"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="140" w:after="70" w:line="280" w:lineRule="auto"/><w:shd w:fill="F2F4F5"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:color w:val="263F45"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:style>'+
    '<w:style w:type="paragraph" w:styleId="QLProcedureBody"><w:name w:val="QilyLean Procedure Body"/><w:basedOn w:val="Normal"/><w:next w:val="QLSectionHeading"/><w:pPr><w:widowControl/><w:spacing w:before="0" w:after="180" w:line="320" w:lineRule="auto"/><w:ind w:left="240" w:right="120"/></w:pPr><w:rPr><w:color w:val="222222"/><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr></w:style>'+
    '<w:style w:type="paragraph" w:styleId="QLMetaLabel"><w:name w:val="QilyLean Metadata Label"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:rPr><w:b/><w:color w:val="44585C"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr></w:style>'+
    '<w:style w:type="paragraph" w:styleId="QLMetaValue"><w:name w:val="QilyLean Metadata Value"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:rPr><w:color w:val="263F45"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr></w:style>'+
    '<w:style w:type="paragraph" w:styleId="QLContactTitle"><w:name w:val="QilyLean Contact Title"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:jc w:val="center"/><w:spacing w:before="0" w:after="40" w:line="240" w:lineRule="auto"/></w:pPr><w:rPr><w:b/><w:color w:val="173B44"/><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr></w:style>'+
    '<w:style w:type="paragraph" w:styleId="QLContactLine"><w:name w:val="QilyLean Contact Line"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="0" w:line="220" w:lineRule="auto"/></w:pPr><w:rPr><w:color w:val="35636C"/><w:sz w:val="15"/><w:szCs w:val="15"/></w:rPr></w:style>'+
    '<w:style w:type="paragraph" w:styleId="QLNote"><w:name w:val="QilyLean Note"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="100" w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:rPr><w:color w:val="6A7777"/><w:sz w:val="16"/><w:szCs w:val="16"/></w:rPr></w:style>'+
    '</w:styles>';
}

function wordHeader(){
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:tabs><w:tab w:val="right" w:pos="10092"/></w:tabs><w:spacing w:after="0"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="177F87"/><w:sz w:val="18"/></w:rPr><w:t>QilyLean｜启力精益</w:t></w:r><w:r><w:tab/></w:r><w:r><w:rPr><w:color w:val="6A7777"/><w:sz w:val="16"/></w:rPr><w:t>AI 对话记录</w:t></w:r></w:p></w:hdr>';
}

function wordFooter(){
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:tabs><w:tab w:val="right" w:pos="10092"/></w:tabs><w:spacing w:before="40" w:after="0"/><w:pBdr><w:top w:val="single" w:sz="4" w:space="4" w:color="C8D3D4"/></w:pBdr></w:pPr><w:r><w:rPr><w:color w:val="6A7777"/><w:sz w:val="15"/></w:rPr><w:t>QilyLean AI 对话记录</w:t></w:r><w:r><w:tab/></w:r><w:r><w:rPr><w:color w:val="6A7777"/><w:sz w:val="15"/></w:rPr><w:t>第 </w:t></w:r><w:fldSimple w:instr=" PAGE "><w:r><w:rPr><w:color w:val="6A7777"/><w:sz w:val="15"/></w:rPr><w:t>1</w:t></w:r></w:fldSimple><w:r><w:rPr><w:color w:val="6A7777"/><w:sz w:val="15"/></w:rPr><w:t> 页 / 共 </w:t></w:r><w:fldSimple w:instr=" NUMPAGES "><w:r><w:rPr><w:color w:val="6A7777"/><w:sz w:val="15"/></w:rPr><w:t>1</w:t></w:r></w:fldSimple><w:r><w:rPr><w:color w:val="6A7777"/><w:sz w:val="15"/></w:rPr><w:t> 页</w:t></w:r></w:p></w:ftr>';
}

function wordSettings(){
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:zoom w:percent="100"/><w:defaultTabStop w:val="420"/><w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat></w:settings>';
}

function buildDocx(items,assets,time){
  var homeBytes=dataUrlBytes(assets.homeQr);
  var contactBytes=dataUrlBytes(assets.contactQr);
  var relationships=[
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>',
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>',
    '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>',
    '<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>'
  ];
  var media={};
  var homeDrawing='';
  var contactDrawing='';
  var nextId=5;
  if(homeBytes){
    relationships.push('<Relationship Id="rId'+nextId+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/home-qr.png"/>');
    media['word/media/home-qr.png']=homeBytes;
    homeDrawing=wordDrawing('rId'+nextId,nextId,'QilyLean官网二维码');
    nextId+=1;
  }
  if(contactBytes){
    relationships.push('<Relationship Id="rId'+nextId+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/contact-qr.png"/>');
    media['word/media/contact-qr.png']=contactBytes;
    contactDrawing=wordDrawing('rId'+nextId,nextId,'QilyLean交流二维码');
  }

  var questionNo=0;
  var questionCount=items.reduce(function(total,item){return total+(item.role==='user'?1:0);},0);
  var body=wordParagraph('QilyLean AI 对话记录',{style:'QLTitle',keep:true})+
    wordParagraph('对话内容导出文件',{style:'QLSubtitle',keep:true})+
    wordMetadataTable(time,questionCount)+
    wordParagraph('一、对话记录',{style:'QLHeading1',keep:true});
  items.forEach(function(item){
    if(item.role==='user'){
      questionNo+=1;
      body+=wordParagraph(questionNo+'.1　用户提问',{style:'QLSectionHeading',keep:true});
    }else{
      body+=wordParagraph(questionNo?questionNo+'.2　QilyLean AI 回复':'QilyLean AI 使用说明',{style:'QLSectionHeading',keep:true});
    }
    body+=wordParagraph(item.text,{style:'QLProcedureBody'});
  });
  body+=wordParagraph('二、联系与分享',{style:'QLHeading1',keep:true})+
    '<w:tbl><w:tblPr><w:tblW w:w="10092" w:type="dxa"/><w:tblInd w:w="0" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="6" w:color="D5E4E3"/><w:left w:val="single" w:sz="6" w:color="D5E4E3"/><w:bottom w:val="single" w:sz="6" w:color="D5E4E3"/><w:right w:val="single" w:sz="6" w:color="D5E4E3"/><w:insideH w:val="single" w:sz="6" w:color="D5E4E3"/><w:insideV w:val="single" w:sz="6" w:color="D5E4E3"/></w:tblBorders><w:tblLayout w:type="fixed"/></w:tblPr>'+
    '<w:tblGrid><w:gridCol w:w="3500"/><w:gridCol w:w="6592"/></w:tblGrid><w:tr><w:trPr><w:cantSplit/></w:trPr>'+
    wordContactCell(3500,'官网',homeDrawing,'qilylean.com')+
    wordContactCell(6592,'交流',contactDrawing,'微信：'+WECHAT_ID+'　手机：'+PHONE_NUMBERS.join(' / '))+
    '</w:tr></w:tbl>'+
    wordParagraph('说明：本文件由 QilyLean AI 根据当前对话自动整理。重要结论请结合现场数据、专业标准与实际决策要求复核。',{style:'QLNote'});

  var entries={
    '[Content_Types].xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/><Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>',
    '_rels/.rels':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>',
    'docProps/core.xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>QilyLean AI 对话记录</dc:title><dc:creator>QilyLean AI</dc:creator><cp:lastModifiedBy>QilyLean AI</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">'+xml(time.iso)+'</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">'+xml(time.iso)+'</dcterms:modified></cp:coreProperties>',
    'docProps/app.xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>QilyLean AI</Application><AppVersion>1.0</AppVersion></Properties>',
    'word/styles.xml':wordStyles(),
    'word/settings.xml':wordSettings(),
    'word/header1.xml':wordHeader(),
    'word/footer1.xml':wordFooter(),
    'word/_rels/document.xml.rels':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+relationships.join('')+'</Relationships>',
    'word/document.xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>'+body+'<w:sectPr><w:headerReference w:type="default" r:id="rId3"/><w:footerReference w:type="default" r:id="rId4"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="907" w:right="907" w:bottom="907" w:left="907" w:header="454" w:footer="454" w:gutter="0"/></w:sectPr></w:body></w:document>'
  };
  Object.keys(media).forEach(function(path){entries[path]=media[path];});
  return zipBlob(entries,WORD_MIME);
}

function excelCell(ref,value,style){
  var safe=String(value==null?'':value).slice(0,32760);
  return '<c r="'+ref+'" t="inlineStr" s="'+(style||0)+'"><is><t xml:space="preserve">'+xml(safe)+'</t></is></c>';
}

function excelRow(number,cells,height){
  return '<row r="'+number+'"'+(height?' ht="'+height+'" customHeight="1"':'')+'>'+cells.join('')+'</row>';
}

function excelDrawing(imageCount,rowIndex){
  if(!imageCount)return '';
  var anchors=[];
  if(imageCount>=1){
    anchors.push('<xdr:oneCellAnchor><xdr:from><xdr:col>0</xdr:col><xdr:colOff>200000</xdr:colOff><xdr:row>'+rowIndex+'</xdr:row><xdr:rowOff>80000</xdr:rowOff></xdr:from><xdr:ext cx="900000" cy="900000"/><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="1" name="QilyLean官网二维码"/><xdr:cNvPicPr/></xdr:nvPicPr><xdr:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="900000" cy="900000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:oneCellAnchor>');
  }
  if(imageCount>=2){
    anchors.push('<xdr:oneCellAnchor><xdr:from><xdr:col>2</xdr:col><xdr:colOff>200000</xdr:colOff><xdr:row>'+rowIndex+'</xdr:row><xdr:rowOff>80000</xdr:rowOff></xdr:from><xdr:ext cx="900000" cy="900000"/><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="2" name="QilyLean交流二维码"/><xdr:cNvPicPr/></xdr:nvPicPr><xdr:blipFill><a:blip r:embed="rId2"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="900000" cy="900000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:oneCellAnchor>');
  }
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'+anchors.join('')+'</xdr:wsDr>';
}

function buildXlsx(items,assets,time){
  var rows=pairs(items);
  var sheetRows=[
    excelRow(1,[excelCell('A1','QilyLean AI 对话记录',1)],28),
    excelRow(2,[excelCell('A2','导出时间：'+time.display+'　｜　简单化 · 专业化 · 标准化',4)],22),
    excelRow(4,[excelCell('A4','序号',2),excelCell('B4','类型',2),excelCell('C4','用户提问',2),excelCell('D4','QilyLean AI 回答',2)],24)
  ];
  rows.forEach(function(row,index){
    var number=index+5;
    sheetRows.push(excelRow(number,[
      excelCell('A'+number,index+1,3),
      excelCell('B'+number,row.kind,3),
      excelCell('C'+number,row.question,3),
      excelCell('D'+number,row.answer,3)
    ],54));
  });
  var contactTitleRow=rows.length+6;
  var qrRow=contactTitleRow+1;
  var contactInfoRow=qrRow+1;
  sheetRows.push(excelRow(contactTitleRow,[
    excelCell('A'+contactTitleRow,'分享“启力精益”官网',5),
    excelCell('C'+contactTitleRow,'交流',5)
  ],24));
  sheetRows.push(excelRow(qrRow,[
    excelCell('A'+qrRow,'',3),
    excelCell('C'+qrRow,'',3)
  ],82));
  sheetRows.push(excelRow(contactInfoRow,[
    excelCell('A'+contactInfoRow,HOME_URL,3),
    excelCell('C'+contactInfoRow,'微信：'+WECHAT_ID+'\n手机：'+PHONE_NUMBERS.join(' / '),3)
  ],38));

  var homeBytes=dataUrlBytes(assets.homeQr);
  var contactBytes=dataUrlBytes(assets.contactQr);
  var images=[];
  if(homeBytes)images.push({name:'home-qr.png',bytes:homeBytes});
  if(contactBytes)images.push({name:'contact-qr.png',bytes:contactBytes});
  var hasDrawing=images.length>0;
  var drawingRels=images.map(function(image,index){
    return '<Relationship Id="rId'+(index+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/'+image.name+'"/>';
  }).join('');
  var merges='<mergeCells count="4"><mergeCell ref="A1:D1"/><mergeCell ref="A2:D2"/><mergeCell ref="A'+contactTitleRow+':B'+contactTitleRow+'"/><mergeCell ref="C'+contactTitleRow+':D'+contactTitleRow+'"/></mergeCells>';
  var worksheet='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><dimension ref="A1:D'+contactInfoRow+'"/><sheetViews><sheetView workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="18"/><cols><col min="1" max="1" width="8" customWidth="1"/><col min="2" max="2" width="11" customWidth="1"/><col min="3" max="3" width="38" customWidth="1"/><col min="4" max="4" width="56" customWidth="1"/></cols><sheetData>'+sheetRows.join('')+'</sheetData>'+merges+'<pageMargins left="0.35" right="0.35" top="0.5" bottom="0.5" header="0.2" footer="0.2"/><pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/>'+(hasDrawing?'<drawing r:id="rId1"/>':'')+'</worksheet>';

  var entries={
    '[Content_Types].xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'+(hasDrawing?'<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>':'')+'<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>',
    '_rels/.rels':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>',
    'docProps/core.xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>QilyLean AI 对话记录</dc:title><dc:creator>QilyLean AI</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">'+xml(time.iso)+'</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">'+xml(time.iso)+'</dcterms:modified></cp:coreProperties>',
    'docProps/app.xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>QilyLean AI</Application><AppVersion>1.0</AppVersion></Properties>',
    'xl/workbook.xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets><sheet name="对话记录" sheetId="1" r:id="rId1"/></sheets><definedNames><definedName name="_xlnm.Print_Area" localSheetId="0">&apos;对话记录&apos;!$A$1:$D$'+contactInfoRow+'</definedName></definedNames><calcPr calcId="191029"/></workbook>',
    'xl/_rels/workbook.xml.rels':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
    'xl/styles.xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="3"><font><sz val="10"/><name val="Microsoft YaHei"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="12"/><name val="Microsoft YaHei"/></font><font><b/><color rgb="FF0F4B5A"/><sz val="11"/><name val="Microsoft YaHei"/></font></fonts><fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0F4B5A"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEDF6F4"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFB9D9D4"/></left><right style="thin"><color rgb="FFB9D9D4"/></right><top style="thin"><color rgb="FFB9D9D4"/></top><bottom style="thin"><color rgb="FFB9D9D4"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="6"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>',
    'xl/worksheets/sheet1.xml':worksheet
  };
  if(hasDrawing){
    entries['xl/worksheets/_rels/sheet1.xml.rels']='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>';
    entries['xl/drawings/drawing1.xml']=excelDrawing(images.length,qrRow-1);
    entries['xl/drawings/_rels/drawing1.xml.rels']='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+drawingRels+'</Relationships>';
    images.forEach(function(image){entries['xl/media/'+image.name]=image.bytes;});
  }
  return zipBlob(entries,EXCEL_MIME);
}

function setExportBusy(value){
  bar.querySelectorAll('.export-btn').forEach(function(button){button.disabled=value;});
}

function feedback(titleText,detailText,iconText){
  var title=document.getElementById('status');
  var detail=document.getElementById('statusDetail');
  var icon=document.getElementById('statusIcon');
  if(!title||!detail||!icon)return;
  title.textContent=titleText;
  detail.textContent=detailText||'文件已按标准 Word 格式生成，可直接打开、保存与打印。';
  icon.textContent=iconText||'✓';
}

async function exportWord(){
  var items=conversation();
  if(!items.length)return;
  setExportBusy(true);
  feedback('正在生成 Word','正在创建标准 DOCX 文件并整理 A4 排版。','…');
  try{
    var assets=await exportAssets();
    var time=stamp();
    downloadBlob(buildDocx(items,assets,time),'QilyLean_AI_对话记录_'+time.file+'.docx');
    feedback('Word已导出','标准 DOCX 已生成；A4 四边页边距均为 1.6cm，可直接打印。','✓');
  }catch(error){
    console.error('DOCX export failed',error);
    feedback('Word导出未完成','标准 DOCX 生成失败，请刷新页面后重试。','!');
  }finally{
    setExportBusy(false);
  }
}

injectStyles();
var tools=document.createElement('div');
tools.className='export-tools';
var word=document.createElement('button');
word.type='button';
word.className='export-btn export-word';
word.textContent='导出 Word';
word.title='将当前对话导出为标准 DOCX 文件';
word.addEventListener('click',exportWord);
tools.appendChild(word);
bar.insertBefore(tools,clearButton);
})();
