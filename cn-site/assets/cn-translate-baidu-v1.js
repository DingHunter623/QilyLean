/* QilyLean CN Domestic Web Translation V1 | 2026-09-18
 * Provider: Baidu Web Translation (mainland-accessible, no client-side API secret).
 * Public primary language choices mirror the international site:
 * 中文简体 / 中文繁体 / English / 其他.
 * "其他" provides a common-language picker plus a full-language Baidu entry.
 */
(function(d,w){'use strict';
if(w.__qilyCnDomesticTranslateV1)return;w.__qilyCnDomesticTranslateV1=true;

var CONTROL_ID='qilyCnDomesticTranslateV1';
var MORE_VALUE='__more__';
var ALL_VALUE='__all__';
var BAIDU_WEB_TRANSLATE='https://fanyi.baidu.com/transpage';
var BAIDU_HOME='https://fanyi.baidu.com/';
var COMMON=[
  ['jp','日本語 / 日语'],['kor','한국어 / 韩语'],['fra','Français / 法语'],
  ['de','Deutsch / 德语'],['spa','Español / 西班牙语'],['ru','Русский / 俄语'],
  ['pt','Português / 葡萄牙语'],['it','Italiano / 意大利语'],['ara','العربية / 阿拉伯语'],
  ['th','ไทย / 泰语'],['vie','Tiếng Việt / 越南语'],['yue','粤语'],
  ['nl','Nederlands / 荷兰语'],['pl','Polski / 波兰语'],['dan','Dansk / 丹麦语'],
  ['fin','Suomi / 芬兰语'],['swe','Svenska / 瑞典语'],['cs','Čeština / 捷克语'],
  ['rom','Română / 罗马尼亚语'],['hu','Magyar / 匈牙利语'],['el','Ελληνικά / 希腊语'],
  ['bul','Български / 保加利亚语'],['est','Eesti / 爱沙尼亚语'],['slo','Slovenščina / 斯洛文尼亚语'],
  ['wyw','文言文']
];
var control=null,select=null,panel=null,search=null,grid=null;

function addOption(node,value,label){
  var option=d.createElement('option');option.value=value;option.textContent=label;node.appendChild(option);
}
function cleanPageUrl(){
  var u=new URL(w.location.href);
  u.hash='';
  return u.toString();
}
function translatedUrl(code){
  var p=new URLSearchParams();
  p.set('query',cleanPageUrl());
  p.set('from','auto');
  p.set('to',code||'auto');
  p.set('source','url');
  p.set('render','1');
  return BAIDU_WEB_TRANSLATE+'?'+p.toString();
}
function go(code){
  if(code==='zh'){
    closePanel();
    select.value='zh';
    return;
  }
  if(code===ALL_VALUE){
    w.location.assign(translatedUrl('auto'));
    return;
  }
  w.location.assign(translatedUrl(code));
}
function buildPanel(){
  var el=d.createElement('div');el.className='qily-cn-language-more';el.hidden=true;el.setAttribute('role','dialog');el.setAttribute('aria-modal','false');el.setAttribute('aria-label','更多翻译语言');
  var head=d.createElement('div');head.className='qily-cn-language-more__head';
  var title=d.createElement('strong');title.textContent='更多语言';
  var close=d.createElement('button');close.type='button';close.className='qily-cn-language-more__close';close.setAttribute('aria-label','关闭更多语言');close.textContent='×';close.addEventListener('click',closePanel);
  head.appendChild(title);head.appendChild(close);
  search=d.createElement('input');search.type='search';search.className='qily-cn-language-more__search';search.placeholder='搜索语言 / Language';search.setAttribute('aria-label','搜索更多语言');search.addEventListener('input',filter);
  grid=d.createElement('div');grid.className='qily-cn-language-more__grid';
  COMMON.forEach(function(item){
    var b=d.createElement('button');b.type='button';b.className='qily-cn-language-more__item';b.textContent=item[1];
    b.setAttribute('data-language-search',(item[0]+' '+item[1]).toLocaleLowerCase());
    b.addEventListener('click',function(){go(item[0])});grid.appendChild(b);
  });
  var all=d.createElement('button');all.type='button';all.className='qily-cn-language-more__all';all.textContent='全部语种｜百度网页翻译';all.addEventListener('click',function(){go(ALL_VALUE)});
  var note=d.createElement('p');note.className='qily-cn-language-more__note';note.textContent='国内直连；翻译页由百度翻译提供。';
  el.appendChild(head);el.appendChild(search);el.appendChild(grid);el.appendChild(all);el.appendChild(note);
  return el;
}
function filter(){
  var q=String(search&&search.value||'').trim().toLocaleLowerCase();
  Array.prototype.forEach.call(grid.querySelectorAll('.qily-cn-language-more__item'),function(b){
    b.hidden=!!q&&String(b.getAttribute('data-language-search')||'').indexOf(q)<0;
  });
}
function openPanel(){
  if(!panel)return;
  panel.hidden=false;control.setAttribute('data-more-languages-open','true');
  if(search){search.value='';filter();search.focus();}
}
function closePanel(){
  if(!panel)return;
  panel.hidden=true;control.removeAttribute('data-more-languages-open');
  if(select&&select.value===MORE_VALUE)select.value='zh';
}
function build(){
  var wrap=d.createElement('div');wrap.id=CONTROL_ID;wrap.className='qily-cn-translate';wrap.setAttribute('data-qily-header-utility','translation');wrap.setAttribute('data-qily-translation-provider','baidu');wrap.setAttribute('role','group');wrap.setAttribute('aria-label','百度网页翻译');wrap.setAttribute('title','国内直连翻译：中文简体、中文繁体、English 或更多语言');
  var mark=d.createElement('span');mark.className='qily-cn-translate__mark';mark.setAttribute('aria-hidden','true');mark.textContent='🌐';
  select=d.createElement('select');select.className='qily-cn-translate__select';select.setAttribute('aria-label','选择网站语言');
  addOption(select,'zh','中文简体');addOption(select,'cht','中文繁体');addOption(select,'en','English');addOption(select,MORE_VALUE,'其他');
  select.value='zh';
  select.addEventListener('change',function(){
    if(select.value===MORE_VALUE){openPanel();return;}
    go(select.value);
  });
  var provider=d.createElement('span');provider.className='qily-cn-translate__provider';provider.textContent='百度网页翻译';
  panel=buildPanel();
  wrap.appendChild(mark);wrap.appendChild(select);wrap.appendChild(provider);wrap.appendChild(panel);
  return wrap;
}
function place(){
  if(control&&control.isConnected)return;
  var header=d.querySelector('header.site-header');if(!header)return;
  var inner=header.querySelector('.header-inner')||header;
  var nav=inner.querySelector('nav.nav,nav[aria-label="主导航"]');
  control=build();
  if(nav)nav.insertAdjacentElement('afterend',control);else inner.appendChild(control);
  header.setAttribute('data-qily-cn-translation','baidu-v1');
}
function onPointer(e){if(panel&&!panel.hidden&&control&&!control.contains(e.target))closePanel();}
function onKey(e){if(e.key==='Escape'&&panel&&!panel.hidden){closePanel();select&&select.focus();}}
function init(){place();d.addEventListener('pointerdown',onPointer);d.addEventListener('keydown',onKey);}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(document,window);
