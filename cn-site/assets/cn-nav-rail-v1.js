/* QilyLean CN Primary Navigation + Baidu Web Translation Utility V2 | 2026-09-18
 * Mirrors the international-site navigation rail and language-control interaction.
 * Mainland translation uses Baidu's public whole-page URL translation entry.
 * No translation API credential or secret is embedded in the browser.
 */
(function(d,w){'use strict';
if(w.__qilyCnHeaderUtilityV2)return;w.__qilyCnHeaderUtilityV2=true;

var MORE_VALUE='__more__';
var COMMON_LANGUAGES=[
  ['yue','粤语 / Cantonese'],['wyw','文言文 / Classical Chinese'],['jp','日本語 / Japanese'],
  ['kor','한국어 / Korean'],['fra','Français / French'],['spa','Español / Spanish'],
  ['th','ไทย / Thai'],['ara','العربية / Arabic'],['ru','Русский / Russian'],
  ['pt','Português / Portuguese'],['de','Deutsch / German'],['it','Italiano / Italian'],
  ['el','Ελληνικά / Greek'],['nl','Nederlands / Dutch'],['pl','Polski / Polish'],
  ['bul','Български / Bulgarian'],['est','Eesti / Estonian'],['dan','Dansk / Danish'],
  ['fin','Suomi / Finnish'],['cs','Čeština / Czech'],['rom','Română / Romanian'],
  ['slo','Slovenščina / Slovenian'],['swe','Svenska / Swedish'],['hu','Magyar / Hungarian'],
  ['vie','Tiếng Việt / Vietnamese']
];

function navs(){return Array.prototype.slice.call(d.querySelectorAll('header.site-header nav.nav,header nav[aria-label="主导航"]'))}
function geometry(nav,rail){
  var header=nav.closest('header');if(!header)return;
  var nr=nav.getBoundingClientRect(),hr=header.getBoundingClientRect();
  rail.style.left=Math.max(0,nr.left-hr.left)+'px';
  rail.style.width=Math.max(0,nr.width)+'px';
}
function sync(nav,rail){
  geometry(nav,rail);
  var track=Math.max(0,rail.clientWidth),scrollWidth=Math.max(nav.scrollWidth,nav.clientWidth),maxScroll=Math.max(0,scrollWidth-nav.clientWidth),value=maxScroll>0?(nav.scrollLeft/maxScroll)*100:0;
  var thumb=maxScroll>0?Math.max(58,track*(nav.clientWidth/scrollWidth)):track;thumb=Math.min(track,thumb);
  rail.value=String(Math.max(0,Math.min(100,value)));
  rail.style.setProperty('--qily-nav-range-thumb-width',thumb+'px');
  rail.disabled=maxScroll<=1;
  rail.setAttribute('data-qily-nav-overflow',maxScroll>1?'true':'false');
  rail.setAttribute('aria-valuetext',String(Math.round(value))+'%');
}
function installRail(nav){
  if(!nav||nav.dataset.qilyCnNavRail==='v2')return;
  var header=nav.closest('header');if(!header)return;
  var old=header.querySelector('input.qily-primary-nav-scroll-rail');if(old)old.remove();
  nav.dataset.qilyCnNavRail='v2';
  if(!nav.id)nav.id='qilyCnPrimaryNavigation';
  var rail=d.createElement('input');
  rail.type='range';rail.className='qily-primary-nav-scroll-rail';rail.min='0';rail.max='100';rail.step='.1';rail.value='0';
  rail.setAttribute('aria-label','一级导航左右滑动条');rail.setAttribute('aria-controls',nav.id);
  header.appendChild(rail);
  var raf=function(){w.requestAnimationFrame(function(){sync(nav,rail)})};
  nav.addEventListener('scroll',raf,{passive:true});
  rail.addEventListener('input',function(){var max=Math.max(0,nav.scrollWidth-nav.clientWidth);nav.scrollLeft=(Number(rail.value)||0)*max/100},{passive:true});
  rail.addEventListener('change',raf,{passive:true});
  raf();w.setTimeout(raf,120);w.setTimeout(raf,700);
}

function canonicalUrl(){
  var link=d.querySelector('link[rel="canonical"][href]');
  var value=link&&link.href?link.href:w.location.href;
  try{
    var url=new URL(value,w.location.href);url.hash='';
    if(url.hostname==='fanyi.baidu.com')return 'https://qilylean.cn/';
    return url.href;
  }catch(error){return String(value||'https://qilylean.cn/').split('#')[0]}
}
function baiduTranslationUrl(code){
  return 'https://fanyi.baidu.com/transpage?source=url&from=zh&to='+encodeURIComponent(code)+'&query='+encodeURIComponent(canonicalUrl());
}
function openExternal(url){
  var opened=null;try{opened=w.open(url,'_blank')}catch(error){}
  if(opened){try{opened.opener=null}catch(error){}}else w.location.assign(url);
}
function translateTo(code){if(!code||code==='zh')return;openExternal(baiduTranslationUrl(code))}
function addOption(select,value,label){var option=d.createElement('option');option.value=value;option.textContent=label;select.appendChild(option)}

function createMorePanel(wrapper,select){
  var panel=d.createElement('div');panel.className='qily-cn-language-more';panel.hidden=true;
  panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','false');panel.setAttribute('aria-label','更多翻译语言');

  var head=d.createElement('div');head.className='qily-cn-language-more__head';
  var title=d.createElement('strong');title.textContent='更多语言';
  var close=d.createElement('button');close.type='button';close.className='qily-cn-language-more__close';close.textContent='×';close.setAttribute('aria-label','关闭更多语言');
  head.appendChild(title);head.appendChild(close);

  var search=d.createElement('input');search.type='search';search.className='qily-cn-language-more__search';
  search.placeholder='搜索语言 / Language';search.setAttribute('aria-label','搜索更多语言');
  var grid=d.createElement('div');grid.className='qily-cn-language-more__grid';

  COMMON_LANGUAGES.forEach(function(item){
    var button=d.createElement('button');button.type='button';button.className='qily-cn-language-more__item';
    button.setAttribute('data-language-code',item[0]);button.setAttribute('data-language-search',(item[1]+' '+item[0]).toLocaleLowerCase());
    button.textContent=item[1];
    button.addEventListener('click',function(){translateTo(item[0]);panel.hidden=true;wrapper.removeAttribute('data-more-languages-open');select.value='zh'});
    grid.appendChild(button);
  });

  var all=d.createElement('a');all.className='qily-cn-language-more__all';all.href='https://fanyi.baidu.com/';
  all.target='_blank';all.rel='noopener noreferrer';all.textContent='更多语种 · 百度翻译 →';

  function closePanel(){panel.hidden=true;wrapper.removeAttribute('data-more-languages-open');select.value='zh'}
  close.addEventListener('click',closePanel);
  search.addEventListener('input',function(){
    var q=String(search.value||'').trim().toLocaleLowerCase();
    Array.prototype.forEach.call(grid.querySelectorAll('.qily-cn-language-more__item'),function(button){
      button.hidden=!!q&&String(button.getAttribute('data-language-search')||'').indexOf(q)<0;
    });
  });
  wrapper._qilyCloseMoreLanguages=closePanel;
  wrapper._qilyMoreSearch=search;
  panel.appendChild(head);panel.appendChild(search);panel.appendChild(grid);panel.appendChild(all);
  return panel;
}

function installTranslator(nav){
  if(!nav||nav.dataset.qilyCnTranslator==='v2')return;
  var inner=nav.parentElement,header=nav.closest('header');if(!inner||!header)return;
  nav.dataset.qilyCnTranslator='v2';inner.setAttribute('data-qily-cn-translation-ready','v2');
  var existing=inner.querySelector('.qily-cn-web-translate[data-qily-header-utility="translation"]');if(existing)existing.remove();

  var wrapper=d.createElement('div');wrapper.className='qily-cn-web-translate';
  wrapper.setAttribute('data-qily-header-utility','translation');
  wrapper.setAttribute('data-qily-translation-provider','baidu');
  wrapper.setAttribute('data-qily-translation-layout','international-parity-v2');
  wrapper.setAttribute('translate','no');wrapper.setAttribute('role','group');wrapper.setAttribute('aria-label','百度网页翻译');
  wrapper.setAttribute('title','中国大陆可直接使用；简体中文为原文，可切换繁体、English 或更多语言。');

  var mark=d.createElement('span');mark.className='qily-cn-web-translate__mark';mark.setAttribute('aria-hidden','true');mark.textContent='🌐';
  var select=d.createElement('select');select.className='qily-cn-web-translate__select';select.setAttribute('aria-label','选择网站语言');
  addOption(select,'zh','中文简体');addOption(select,'cht','中文繁体');addOption(select,'en','English');addOption(select,MORE_VALUE,'其他');
  select.value='zh';

  var provider=d.createElement('a');provider.className='qily-cn-web-translate__provider';provider.href='https://fanyi.baidu.com/';
  provider.target='_blank';provider.rel='noopener noreferrer';provider.textContent='百度翻译';
  var panel=createMorePanel(wrapper,select);

  select.addEventListener('change',function(){
    if(select.value===MORE_VALUE){
      panel.hidden=false;wrapper.setAttribute('data-more-languages-open','true');
      if(wrapper._qilyMoreSearch){
        wrapper._qilyMoreSearch.value='';wrapper._qilyMoreSearch.dispatchEvent(new Event('input'));wrapper._qilyMoreSearch.focus();
      }
      return;
    }
    var code=select.value;
    if(wrapper._qilyCloseMoreLanguages)wrapper._qilyCloseMoreLanguages();
    if(code!=='zh')translateTo(code);
    select.value='zh';
  });

  wrapper.appendChild(mark);wrapper.appendChild(select);wrapper.appendChild(provider);wrapper.appendChild(panel);
  nav.insertAdjacentElement('afterend',wrapper);
}
function closeOutside(event){
  var open=d.querySelector('.qily-cn-web-translate[data-more-languages-open="true"]');
  if(open&&!open.contains(event.target)&&open._qilyCloseMoreLanguages)open._qilyCloseMoreLanguages();
}
function closeEscape(event){
  if(event.key!=='Escape')return;
  var open=d.querySelector('.qily-cn-web-translate[data-more-languages-open="true"]');
  if(open&&open._qilyCloseMoreLanguages){
    open._qilyCloseMoreLanguages();
    var select=open.querySelector('.qily-cn-web-translate__select');if(select)select.focus();
  }
}
function boot(){navs().forEach(function(nav){installRail(nav);installTranslator(nav)})}
function resync(){navs().forEach(function(nav){var h=nav.closest('header'),r=h&&h.querySelector('input.qily-primary-nav-scroll-rail');if(r)sync(nav,r)})}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
d.addEventListener('pointerdown',closeOutside);d.addEventListener('keydown',closeEscape);
w.addEventListener('resize',resync,{passive:true});w.addEventListener('pageshow',function(){boot();resync()},{passive:true});
})(document,window);
