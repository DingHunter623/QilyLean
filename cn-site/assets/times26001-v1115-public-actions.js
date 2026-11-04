/* Times26001 中国站非商务产品操作适配 v1.1.15｜仅 /archive/tools/times26001/ */
(function(){
  'use strict';
  if(window.__qilyCnTimes26001ActionsV115)return;
  var main=document.querySelector('main[data-cn-source-content="tools/times26001/index.html"]');
  if(!main)return;
  window.__qilyCnTimes26001ActionsV115=true;
  var pageUrl='https://qilylean.cn/archive/tools/times26001/#android-download';
  var qr='/assets/times26001-v1115-cn-qr.svg';
  function support(){
    var s=document.getElementById('cnTimes26001QrDialog');
    if(s)return s;
    var css=document.createElement('style');css.id='cnTimes26001ModalStyles';
    css.textContent='#cnTimes26001QrDialog{padding:0;border:1px solid #b9d4d1;border-radius:20px;max-width:min(92vw,480px);width:100%;background:#f8fcfb;color:#0f4b5a;box-shadow:0 20px 60px rgba(0,0,0,.25)}#cnTimes26001QrDialog::backdrop{background:rgba(3,30,35,.7)}#cnTimes26001QrDialog .cn-times-dialog-inner{padding:23px;text-align:center}#cnTimes26001QrDialog h2{font-size:23px;line-height:1.4;color:#0f4b5a!important;-webkit-text-fill-color:#0f4b5a!important;margin:0 0 8px}#cnTimes26001QrDialog p{font-size:16px;line-height:1.6;color:#3d6165;margin:9px 0}#cnTimes26001QrDialog img{display:block;margin:12px auto;width:min(68vw,270px);height:auto;aspect-ratio:1;background:#fff;border:12px solid #fff;border-radius:12px}#cnTimes26001QrDialog a,#cnTimes26001QrDialog button{display:inline-block;margin:7px 4px;padding:10px 14px;background:#0f4b5a;color:#fff!important;-webkit-text-fill-color:#fff!important;border:1px solid #0f4b5a;border-radius:12px;font-weight:800;font-size:15px;text-decoration:none;cursor:pointer}#cnTimes26001QrDialog a:focus-visible,#cnTimes26001QrDialog button:focus-visible{outline:3px solid #caa15f;outline-offset:3px}';
    document.head.appendChild(css);
    s=document.createElement('dialog');s.id='cnTimes26001QrDialog';
    var inner=document.createElement('div');inner.className='cn-times-dialog-inner';
    var h=document.createElement('h2');h.textContent='Times26001｜扫码查看下载页';
    var p=document.createElement('p');p.textContent='个人时间管理 · v1.1.15 正式签名版';
    var image=document.createElement('img');image.src=qr;image.alt='Times26001 中国站产品及下载页二维码';image.width=270;image.height=270;
    var url=document.createElement('p');url.textContent=pageUrl;url.style.overflowWrap='anywhere';
    var download=main.querySelector('.tool-actions a.download, .app-share-inline a[download]');
    var buttons=document.createElement('div');
    if(download&&download.getAttribute('href')){
      var a=document.createElement('a');a.href=download.getAttribute('href');a.setAttribute('download','');a.textContent='下载 APK';buttons.appendChild(a);
    }
    var copy=document.createElement('button');copy.type='button';copy.textContent='复制页面链接';
    copy.addEventListener('click',function(){
      if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(pageUrl).then(function(){copy.textContent='已复制';}).catch(function(){copy.textContent=pageUrl;});}
      else{copy.textContent=pageUrl;}
    });
    var close=document.createElement('button');close.type='button';close.textContent='关闭';
    close.addEventListener('click',function(){if(s.close)s.close();else s.removeAttribute('open');});
    buttons.appendChild(copy);buttons.appendChild(close);
    inner.appendChild(h);inner.appendChild(p);inner.appendChild(image);inner.appendChild(url);inner.appendChild(buttons);s.appendChild(inner);
    s.addEventListener('click',function(e){if(e.target===s){if(s.close)s.close();else s.removeAttribute('open');}});
    document.body.appendChild(s);
    return s;
  }
  main.querySelectorAll('[data-app-share-qr="times26001"]').forEach(function(trigger){
    trigger.addEventListener('click',function(e){e.preventDefault();var dialog=support();if(dialog.showModal){if(!dialog.open)dialog.showModal();}else dialog.setAttribute('open','');});
  });
})();