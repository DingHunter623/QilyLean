/* QilyLean APP download/share controls | 2026-08-08 */
(function(){
  'use strict';
  var apps={
    times26001:{
      name:'Times26001｜思大时间管理',
      url:'https://qilylean.com/tools/times26001/#android-download',
      qr:'/assets/tools/qr-times26001-download.svg?v=20260808-share-v1'
    },
    qilyleanHome:{
      name:'QilyLean Home｜安卓通用品牌桌面',
      url:'https://qilylean.com/capabilities/#digital-tools',
      qr:'/assets/tools/qr-qilylean-home-download.svg?v=20260808-share-v1'
    }
  };

  function copy(text){
    if(navigator.clipboard&&window.isSecureContext){return navigator.clipboard.writeText(text);}
    var area=document.createElement('textarea');
    area.value=text;area.setAttribute('readonly','');area.style.position='fixed';area.style.left='-9999px';
    document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();return Promise.resolve();
  }

  function toast(text){
    var old=document.querySelector('.app-share-toast');if(old)old.remove();
    var el=document.createElement('div');el.className='app-share-toast';el.setAttribute('role','status');el.textContent=text;
    document.body.appendChild(el);setTimeout(function(){el.remove();},2200);
  }

  function ensureDialog(){
    var dialog=document.getElementById('qilyAppShareDialog');
    if(dialog)return dialog;
    dialog=document.createElement('dialog');
    dialog.id='qilyAppShareDialog';dialog.className='app-share-dialog';
    dialog.innerHTML='<div class="app-share-dialog-card">'+
      '<div class="app-share-dialog-head"><div><h3 id="qilyAppShareTitle">APP下载分享</h3><p>扫码打开稳定下载页；版本更新后二维码入口保持不变。</p></div><button type="button" class="app-share-close" aria-label="关闭">×</button></div>'+
      '<div class="app-share-qr-wrap"><img class="app-share-qr" id="qilyAppShareQr" alt="APP下载二维码"></div>'+
      '<p class="app-share-url" id="qilyAppShareUrl"></p>'+
      '<div class="app-share-dialog-actions"><button type="button" id="qilyAppShareNative">分享下载链接</button><button type="button" class="secondary" id="qilyAppShareCopy">复制下载链接</button></div>'+
      '</div>';
    document.body.appendChild(dialog);
    dialog.querySelector('.app-share-close').addEventListener('click',function(){dialog.close();});
    dialog.addEventListener('click',function(e){if(e.target===dialog)dialog.close();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&dialog.open)dialog.close();});
    return dialog;
  }

  function showQr(key){
    var app=apps[key];if(!app)return;
    var dialog=ensureDialog();
    dialog.dataset.app=key;
    document.getElementById('qilyAppShareTitle').textContent=app.name+'｜扫码下载';
    var img=document.getElementById('qilyAppShareQr');img.src=app.qr;img.alt=app.name+'下载二维码';
    document.getElementById('qilyAppShareUrl').textContent=app.url;
    var nativeBtn=document.getElementById('qilyAppShareNative');
    var copyBtn=document.getElementById('qilyAppShareCopy');
    nativeBtn.onclick=function(){shareLink(key);};
    copyBtn.onclick=function(){copy(app.url).then(function(){toast('下载链接已复制');});};
    if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
  }

  function shareLink(key){
    var app=apps[key];if(!app)return;
    var data={title:app.name,text:app.name+' 下载页',url:app.url};
    if(navigator.share){navigator.share(data).catch(function(err){if(err&&err.name!=='AbortError')copy(app.url).then(function(){toast('下载链接已复制');});});}
    else{copy(app.url).then(function(){toast('下载链接已复制');});}
  }

  document.addEventListener('click',function(e){
    var qr=e.target.closest('[data-app-share-qr]');
    if(qr){e.preventDefault();showQr(qr.getAttribute('data-app-share-qr'));return;}
    var share=e.target.closest('[data-app-share-link]');
    if(share){e.preventDefault();shareLink(share.getAttribute('data-app-share-link'));}
  });
})();
