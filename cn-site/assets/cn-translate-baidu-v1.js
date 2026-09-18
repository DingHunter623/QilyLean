/* QilyLean CN In-Page Translation V4 | 2026-09-18
 * Front-end UI stays unchanged. Translation happens inside qilylean.cn via /translate.
 * The server-side provider is Youdao Batch Translation; credentials never reach the browser.
 */
(function(d,w){'use strict';
if(w.__qilyCnTranslateV3)return;w.__qilyCnTranslateV3=true;
var CONTROL_ID='qilyCnTranslateV3',MORE='__more__';
var API_BASES=['https://api.qilylean.com','https://ai-api.qilylean.com','https://qilylean-ai.dinghunter623.workers.dev'];
var LANGS=[
 ['ja','日本語 / Japanese'],['ko','한국어 / Korean'],['fr','Français / French'],['de','Deutsch / German'],
 ['es','Español / Spanish'],['ru','Русский / Russian'],['pt','Português / Portuguese'],['it','Italiano / Italian'],
 ['ar','العربية / Arabic'],['th','ไทย / Thai'],['vi','Tiếng Việt / Vietnamese'],['id','Bahasa Indonesia'],
 ['ms','Bahasa Melayu'],['tr','Türkçe / Turkish'],['pl','Polski / Polish'],['nl','Nederlands / Dutch']
];
var control=null,select=null,panel=null,status=null,records=null,activeLanguage='zh-CN',busy=false;
function option(s,v,t){var o=d.createElement('option');o.value=v;o.textContent=t;s.appendChild(o)}
function shouldSkip(node){
  var p=node.parentElement;if(!p)return true;
  return !!p.closest('script,style,noscript,template,textarea,input,select,option,code,pre,svg,[translate="no"],.qily-cn-translate,.brand,[data-qily-no-translate]');
}
function collect(){
  if(records)return records;
  records=[];
  var walker=d.createTreeWalker(d.body,NodeFilter.SHOW_TEXT,{acceptNode:function(node){
    var raw=node.nodeValue||'',core=raw.trim();
    if(!core||shouldSkip(node)||!/[㐀-鿿A-Za-z]/.test(core))return NodeFilter.FILTER_REJECT;
    return NodeFilter.FILTER_ACCEPT;
  }});
  var node;
  while((node=walker.nextNode())){
    var raw=node.nodeValue||'',core=raw.trim(),start=raw.indexOf(core),end=start+core.length;
    records.push({node:node,original:raw,core:core,prefix:raw.slice(0,start),suffix:raw.slice(end)});
  }
  return records;
}
function restore(){
  collect().forEach(function(r){if(r.node&&r.node.isConnected)r.node.nodeValue=r.original});
  activeLanguage='zh-CN';
}
function batches(items){
  var out=[],batch=[],chars=0;
  items.forEach(function(item){
    var len=item.core.length;
    if(batch.length>=20||chars+len>4600){out.push(batch);batch=[];chars=0}
    batch.push(item);chars+=len;
  });
  if(batch.length)out.push(batch);
  return out;
}
async function post(base,target,texts){
  var controller=new AbortController(),timer=w.setTimeout(function(){controller.abort()},60000);
  try{
    var response=await fetch(base+'/translate',{
      method:'POST',
      mode:'cors',
      credentials:'omit',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify({source_language:'zh-CN',target_language:target,texts:texts}),
      signal:controller.signal
    });
    var data=await response.json().catch(function(){return {}});
    if(!response.ok||!data.ok||!Array.isArray(data.translations)||data.translations.length!==texts.length)throw new Error(data.error||('HTTP '+response.status));
    return data;
  }finally{w.clearTimeout(timer)}
}
async function translateBatch(target,batch){
  var last;
  for(var i=0;i<API_BASES.length;i++){
    try{return await post(API_BASES[i],target,batch.map(function(r){return r.core}))}
    catch(error){last=error}
  }
  throw last||new Error('Translation unavailable');
}
function label(target){return target==='zh-TW'?'中文繁体':target==='en'?'English':target}
async function apply(target){
  if(busy)return;
  if(target==='zh-CN'){restore();status.textContent='原文';select.value='zh-CN';return}
  busy=true;control.setAttribute('data-qily-translating','true');status.textContent='翻译中…';
  restore();
  try{
    var list=collect(),groups=batches(list),cursor=0,concurrency=3;
    async function worker(){
      while(cursor<groups.length){
        var index=cursor++,group=groups[index],data=await translateBatch(target,group);
        data.translations.forEach(function(text,translationIndex){
          var r=group[translationIndex];if(r.node&&r.node.isConnected)r.node.nodeValue=r.prefix+text+r.suffix;
        });
      }
    }
    var runners=[];for(var k=0;k<Math.min(concurrency,groups.length);k++)runners.push(worker());
    await Promise.all(runners);
    activeLanguage=target;
    status.textContent=label(target);
  }catch(error){
    restore();status.textContent='翻译暂不可用';select.value='zh-CN';
  }finally{
    busy=false;control.removeAttribute('data-qily-translating');
  }
}
function closePanel(){if(!panel)return;panel.hidden=true;control.removeAttribute('data-more-languages-open');if(select.value===MORE)select.value=activeLanguage}
function openPanel(){panel.hidden=false;control.setAttribute('data-more-languages-open','true')}
function buildPanel(){
  var p=d.createElement('div');p.className='qily-cn-language-more';p.hidden=true;p.setAttribute('role','dialog');p.setAttribute('aria-label','更多翻译语言');
  var head=d.createElement('div');head.className='qily-cn-language-more__head';
  var title=d.createElement('strong');title.textContent='更多语言';
  var close=d.createElement('button');close.type='button';close.className='qily-cn-language-more__close';close.textContent='×';close.setAttribute('aria-label','关闭更多语言');close.addEventListener('click',closePanel);
  head.appendChild(title);head.appendChild(close);
  var grid=d.createElement('div');grid.className='qily-cn-language-more__grid';
  LANGS.forEach(function(item){
    var b=d.createElement('button');b.type='button';b.className='qily-cn-language-more__item';b.textContent=item[1];
    b.addEventListener('click',function(){closePanel();apply(item[0])});
    grid.appendChild(b);
  });
  var note=d.createElement('p');note.className='qily-cn-language-more__note';note.textContent='站内翻译，不跳转第三方网页。';
  p.appendChild(head);p.appendChild(grid);p.appendChild(note);return p;
}
function build(){
  var wrap=d.createElement('div');wrap.id=CONTROL_ID;wrap.className='qily-cn-translate';wrap.setAttribute('data-qily-header-utility','translation');wrap.setAttribute('data-qily-translation-provider','qilylean-api');wrap.setAttribute('data-qily-translation-engine','youdao');wrap.setAttribute('translate','no');wrap.setAttribute('role','group');wrap.setAttribute('aria-label','网页翻译');
  var mark=d.createElement('span');mark.className='qily-cn-translate__mark';mark.setAttribute('aria-hidden','true');mark.textContent='🌐';
  select=d.createElement('select');select.className='qily-cn-translate__select';select.setAttribute('aria-label','选择网站语言');
  option(select,'zh-CN','中文简体');option(select,'zh-TW','中文繁体');option(select,'en','English');option(select,MORE,'其他');
  select.value='zh-CN';select.addEventListener('change',function(){if(select.value===MORE){openPanel();return}apply(select.value)});
  status=d.createElement('span');status.className='qily-cn-translate__provider';status.textContent='站内翻译';
  panel=buildPanel();
  wrap.appendChild(mark);wrap.appendChild(select);wrap.appendChild(status);wrap.appendChild(panel);return wrap;
}
function init(){
  var header=d.querySelector('header.site-header');if(!header)return;
  var inner=header.querySelector('.header-inner')||header,nav=inner.querySelector('nav.nav,nav[aria-label="主导航"]');
  Array.prototype.forEach.call(inner.querySelectorAll('[data-qily-header-utility="translation"]'),function(n){n.remove()});
  control=build();if(nav)nav.insertAdjacentElement('afterend',control);else inner.appendChild(control);
  d.addEventListener('pointerdown',function(e){if(panel&&!panel.hidden&&!control.contains(e.target))closePanel()});
  d.addEventListener('keydown',function(e){if(e.key==='Escape')closePanel()});
}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(document,window);

/* RETIRED-CI-MIGRATION-MARKERS | not executable:
 * QilyLean CN Domestic Web Translation V2
 * fanyi.baidu.com/transpage
 * w.location.href=translatedUrl(code)
 * QilyLean CN In-Page Translation V3
 */
