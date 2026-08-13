/* QilyLean APP product/share normalization | 2026-08-08 */
(function(){
  'use strict';
  var TIMES_POSITIONING='面向工业工程、现场改善与时间研究场景的专业测时工具，由 QilyLean｜启力精益开发。';
  var apps={
    times26001:{
      name:'Times26001',
      url:'https://qilylean.com/tools/times26001/#android-download',
      download:'https://qilylean.com/Times26001-Android-v1.1.13-Location-Fix.apk?build=efe5e188',
      qr:'/assets/tools/qr-times26001-download.svg?v=20260808-share-v1'
    },
    qilyleanHome:{
      name:'QilyLean Home｜官网通用安装包',
      url:'https://qilylean.com/capabilities/#digital-tools',
      download:'https://qilylean.com/QilyLean_Home_v2.3.2_API36_INSTALL.apk?build=efe5e188-qilylean-home-download-v1',
      qr:'/assets/tools/qr-qilylean-home-download.svg?v=20260809-download-v2'
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
      '<div class="app-share-dialog-head"><div><h3 id="qilyAppShareTitle">APP下载分享</h3><p>扫码进入官方下载区；页面内提供可安装APK。正式应用市场上线后，以对应商店渠道更新为主。</p></div><button type="button" class="app-share-close" aria-label="关闭">×</button></div>'+
      '<div class="app-share-qr-wrap"><img class="app-share-qr" id="qilyAppShareQr" alt="APP页面二维码"></div>'+
      '<p class="app-share-url" id="qilyAppShareUrl"></p>'+
      '<div class="app-share-dialog-actions"><button type="button" id="qilyAppShareDownload">直接下载 APK</button><button type="button" id="qilyAppShareNative">分享下载页</button><button type="button" class="secondary" id="qilyAppShareCopy">复制下载页链接</button></div>'+
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
    document.getElementById('qilyAppShareTitle').textContent=app.name+'｜扫码进入下载页';
    var img=document.getElementById('qilyAppShareQr');img.src=app.qr;img.alt=app.name+'官方下载页二维码';
    document.getElementById('qilyAppShareUrl').textContent=app.url;
    var downloadBtn=document.getElementById('qilyAppShareDownload');
    var nativeBtn=document.getElementById('qilyAppShareNative');
    var copyBtn=document.getElementById('qilyAppShareCopy');
    if(app.download){downloadBtn.hidden=false;downloadBtn.onclick=function(){window.location.href=app.download;};}
    else{downloadBtn.hidden=true;downloadBtn.onclick=null;}
    nativeBtn.onclick=function(){shareLink(key);};
    copyBtn.onclick=function(){copy(app.url).then(function(){toast('下载页链接已复制');});};
    if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
  }

  function shareLink(key){
    var app=apps[key];if(!app)return;
    var data={title:app.name+' Android 下载',text:app.name+' 官方下载页',url:app.url};
    if(navigator.share){navigator.share(data).catch(function(err){if(err&&err.name!=='AbortError')copy(app.url).then(function(){toast('下载页链接已复制');});});}
    else{copy(app.url).then(function(){toast('下载页链接已复制');});}
  }

  function setMeta(selector,value){
    var el=document.querySelector(selector);if(el)el.setAttribute('content',value);
  }

  function replaceLeafText(root,from,to){
    if(!root)return;
    root.querySelectorAll('h1,h2,h3,p,small,li,a,button,span,figcaption').forEach(function(el){
      if(el.children.length)return;
      var text=el.textContent||'';
      if(text.indexOf(from)>=0)el.textContent=text.split(from).join(to);
    });
  }

  function normalizeTimes26001Page(){
    var path=(location.pathname||'').replace(/\/index\.html$/,'/');
    if(path!=='/tools/times26001/')return;

    document.title='Times26001｜工业工程时间研究与IE现场测时工具';
    setMeta('meta[name="description"]',TIMES_POSITIONING+' Times26001提供IE秒表分段、累计总时长、倒计时、闹钟、时间日历及天气预报辅助功能。');
    setMeta('meta[property="og:title"]','Times26001｜工业工程时间研究与IE现场测时工具');
    setMeta('meta[property="og:description"]',TIMES_POSITIONING);
  }

  function normalizeCapabilitiesCrossLinks(){
    var path=(location.pathname||'').replace(/\/index\.html$/,'/');
    if(path!=='/capabilities/')return;
    var section=document.getElementById('digital-tools');
    if(!section)return;

    var cards=section.querySelectorAll('.capability-digital-tool');
    var timesCard=cards[0];
    if(timesCard){
      var image=timesCard.querySelector('img');
      if(image)image.alt='Times26001工业工程时间研究与IE现场测时工具功能概览';
      var small=timesCard.querySelector('small');
      if(small)small.textContent='数字工具作品｜工业工程时间研究＋IE现场测时';
      var title=timesCard.querySelector('h3');
      if(title)title.textContent='Times26001';
      var paragraph=timesCard.querySelector('.capability-digital-content > p');
      if(paragraph)paragraph.innerHTML='<strong>'+TIMES_POSITIONING+'</strong> 集成IE秒表分段、累计总时长、数据复制、按秒倒计时、闹钟、北京时间、万年历、农历、黄历、节气与天气预报，可查看当前位置或指定城市的当前实况和未来7天趋势。';
      var result=timesCard.querySelector('.module-result');
      if(result)result.textContent='手机试用版：v1.1.13 / versionCode 16 / API 36｜原生定位权限｜不默认上海｜当前位置/城市搜索｜当前实况＋未来7天';
      timesCard.querySelectorAll('[data-app-share-link="times26001"]').forEach(function(btn){btn.textContent='分享下载页';});
    }

    var homeCard=cards[1];
    if(homeCard){
      var homeActions=homeCard.querySelector('.module-actions');
      if(homeActions){
        var direct=homeActions.querySelector('[data-qilylean-home-direct-download]');
        if(!direct){
          direct=document.createElement('a');
          direct.setAttribute('data-qilylean-home-direct-download','1');
          direct.href='/QilyLean_Home_v2.3.2_API36_INSTALL.apk?build=efe5e188-qilylean-home-download-v1';
          direct.setAttribute('download','');
          direct.textContent='下载 Android APK（v2.2）';
          homeActions.insertBefore(direct,homeActions.firstChild);
        }
        homeActions.querySelectorAll('[data-app-share-qr="qilyleanHome"]').forEach(function(btn){btn.textContent='扫码下载';});
        homeActions.querySelectorAll('[data-app-share-link="qilyleanHome"]').forEach(function(btn){btn.textContent='分享下载页';});
      }
      var homeResult=homeCard.querySelector('.module-result');
      if(homeResult)homeResult.textContent='当前官网可下载APK：v2.2（历史归档／旧Debug签名）｜最新构建：v2.3.1 / API 36（待正式签名发布，不作为当前覆盖升级包）｜秒级时钟｜公历＋农历＋周次｜Times26001直达｜免Root';
    }

    replaceLeafText(section,'Times26001｜思大时间管理','Times26001');
    replaceLeafText(section,'思大时间管理','Times26001');
    replaceLeafText(section,'分享产品页链接','分享下载页');
  }

  function boot(){
    normalizeTimes26001Page();
    normalizeCapabilitiesCrossLinks();
  }

  document.addEventListener('click',function(e){
    var qr=e.target.closest('[data-app-share-qr]');
    if(qr){e.preventDefault();showQr(qr.getAttribute('data-app-share-qr'));return;}
    var share=e.target.closest('[data-app-share-link]');
    if(share){e.preventDefault();shareLink(share.getAttribute('data-app-share-link'));}
  });

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
