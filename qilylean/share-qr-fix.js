(function(){
'use strict';
var HOME_URL='https://qilylean.com/';
var BRAND='QilyLean｜启力精益';
var SHARE_TITLE='QilyLean｜启力精益｜精益生产、工程改善与数智工厂';
var QR_SRC='/qilylean/qilylean-home-qr.svg?v=20260717-qrfix2';

function copyText(text){
  if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(text);
  var el=document.createElement('textarea');
  el.value=text;el.style.position='fixed';el.style.left='-9999px';
  document.body.appendChild(el);el.select();document.execCommand('copy');el.remove();
  return Promise.resolve();
}

function ensureStyle(){
  if(document.getElementById('qilyShareQrFixStyle'))return;
  var style=document.createElement('style');
  style.id='qilyShareQrFixStyle';
  style.textContent='.qily-share-qr{display:block;width:min(72vw,310px);height:auto;margin:12px auto 16px;background:#fff;image-rendering:pixelated}.share-panel .share-url{font-size:16px}.share-panel h3{margin-bottom:8px}';
  document.head.appendChild(style);
}

function applyFix(){
  var mask=document.getElementById('shareMask');
  if(!mask){setTimeout(applyFix,100);return;}
  var panel=mask.querySelector('.share-panel');
  if(!panel){setTimeout(applyFix,100);return;}
  ensureStyle();

  var brand=panel.querySelector('.share-brand');
  if(brand)brand.textContent=BRAND;
  var title=panel.querySelector('h3');
  if(title)title.textContent='分享“启力精益”官网';

  var urlEl=panel.querySelector('.share-url');
  if(urlEl)urlEl.textContent=HOME_URL;

  var qr=panel.querySelector('.qily-share-qr');
  if(!qr){
    qr=document.createElement('img');
    qr.className='qily-share-qr';
    qr.src=QR_SRC;
    qr.alt='QilyLean启力精益官网二维码，识别后访问 https://qilylean.com/';
    qr.loading='eager';
    if(urlEl)panel.insertBefore(qr,urlEl);else panel.appendChild(qr);
  }else{
    qr.alt='QilyLean启力精益官网二维码';
  }

  var note=panel.querySelector('.share-note');
  if(note)note.textContent='扫码或复制官网地址访问 “QilyLean 启力精益”';

  if(urlEl&&!urlEl.dataset.homeUrlGuard){
    urlEl.dataset.homeUrlGuard='1';
    new MutationObserver(function(){if(urlEl.textContent!==HOME_URL)urlEl.textContent=HOME_URL;}).observe(urlEl,{childList:true,subtree:true,characterData:true});
  }

  if(!document.documentElement.dataset.qilyShareQrEvents){
    document.documentElement.dataset.qilyShareQrEvents='1';
    document.addEventListener('click',function(event){
      var action=event.target.closest&&event.target.closest('#shareMask [data-share]');
      if(!action)return;
      event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
      var noteEl=document.querySelector('#shareMask .share-note');
      if(action.getAttribute('data-share')==='system'&&navigator.share){
        navigator.share({title:SHARE_TITLE,text:'“启精益之智，聚企业之力。”让改善形成体系，让精益产生力量。',url:HOME_URL}).catch(function(){});
      }else{
        copyText(HOME_URL).then(function(){if(noteEl)noteEl.textContent='官方网址已复制：'+HOME_URL;});
      }
    },true);
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyFix,{once:true});else applyFix();
})();
