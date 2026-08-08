/* QilyLean APP download/share controls | 2026-08-08 */
(function(){
  'use strict';
  var TIMES_POSITIONING='面向工业工程、现场改善与时间研究场景的专业测时工具，由 QilyLean｜启力精益开发。';
  var apps={
    times26001:{
      name:'Times26001',
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
      '<div class="app-share-dialog-head"><div><h3 id="qilyAppShareTitle">APP页面分享</h3><p>扫码打开官方产品页；正式应用市场上线后以对应商店渠道更新为主。</p></div><button type="button" class="app-share-close" aria-label="关闭">×</button></div>'+
      '<div class="app-share-qr-wrap"><img class="app-share-qr" id="qilyAppShareQr" alt="APP页面二维码"></div>'+
      '<p class="app-share-url" id="qilyAppShareUrl"></p>'+
      '<div class="app-share-dialog-actions"><button type="button" id="qilyAppShareNative">分享页面链接</button><button type="button" class="secondary" id="qilyAppShareCopy">复制页面链接</button></div>'+
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
    document.getElementById('qilyAppShareTitle').textContent=app.name+'｜扫码打开官方页面';
    var img=document.getElementById('qilyAppShareQr');img.src=app.qr;img.alt=app.name+'官方页面二维码';
    document.getElementById('qilyAppShareUrl').textContent=app.url;
    var nativeBtn=document.getElementById('qilyAppShareNative');
    var copyBtn=document.getElementById('qilyAppShareCopy');
    nativeBtn.onclick=function(){shareLink(key);};
    copyBtn.onclick=function(){copy(app.url).then(function(){toast('页面链接已复制');});};
    if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
  }

  function shareLink(key){
    var app=apps[key];if(!app)return;
    var data={title:app.name,text:app.name+' 官方产品页',url:app.url};
    if(navigator.share){navigator.share(data).catch(function(err){if(err&&err.name!=='AbortError')copy(app.url).then(function(){toast('页面链接已复制');});});}
    else{copy(app.url).then(function(){toast('页面链接已复制');});}
  }

  function setMeta(selector,value){
    var el=document.querySelector(selector);if(el)el.setAttribute('content',value);
  }

  function normalizeTimes26001Page(){
    var path=(location.pathname||'').replace(/\/index\.html$/,'/');
    if(path!=='/tools/times26001/')return;

    document.title='Times26001｜工业工程时间研究与IE现场测时工具';
    setMeta('meta[name="description"]',TIMES_POSITIONING+' Times26001提供IE秒表分段、累计总时长、倒计时、闹钟及时间日历辅助功能。');
    setMeta('meta[property="og:title"]','Times26001｜工业工程时间研究与IE现场测时工具');
    setMeta('meta[property="og:description"]',TIMES_POSITIONING);

    var heroLead=document.querySelector('.tool-hero .tool-lead');
    if(heroLead){
      heroLead.innerHTML='<strong>'+TIMES_POSITIONING+'</strong><br>Times26001以工业工程时间研究和制造现场测时为核心，提供IE秒表分段、累计总时长、数据复制、倒计时、闹钟及时间日历辅助能力。<br><strong>当前应用市场候选版：v1.1.6 / versionCode 9 / API 36；固定Release签名完成后进入国内应用市场正式分发。</strong>';
    }

    var visual=document.querySelector('.tool-visual img');
    if(visual)visual.alt='Times26001工业工程时间研究与IE现场测时工具功能概览';

    var heading=document.querySelector('#features .tool-heading p');
    if(heading)heading.textContent='以工业工程时间研究与制造现场测时为主线，同时保留日常提醒和时间日历辅助能力。';

    var scenario=document.querySelector('.tool-section.alt .tool-heading p');
    if(scenario)scenario.textContent='Times26001不是普通闹钟或单纯时间管理APP，而是把测量、记录、复制、提醒组合成面向IE与现场改善的时间研究工具。';

    document.querySelectorAll('h1,h2,h3,p,small,li,a,button').forEach(function(el){
      if(el.children.length)return;
      var text=el.textContent||'';
      if(text.indexOf('Times26001｜思大时间管理')>=0)el.textContent=text.replace(/Times26001｜思大时间管理/g,'Times26001');
      else if(text.indexOf('思大时间管理 / Times26001')>=0)el.textContent=text.replace(/思大时间管理 \/ Times26001/g,'Times26001');
      else if(text.indexOf('思大时间管理')>=0)el.textContent=text.replace(/思大时间管理/g,'Times26001');
      if(el.textContent&&el.textContent.indexOf('"QilyLean AI | 启力精益"为IE时间分析自主开发的时间工具。')>=0){
        el.textContent=el.textContent.replace('"QilyLean AI | 启力精益"为IE时间分析自主开发的时间工具。',TIMES_POSITIONING);
      }
    });
  }

  document.addEventListener('click',function(e){
    var qr=e.target.closest('[data-app-share-qr]');
    if(qr){e.preventDefault();showQr(qr.getAttribute('data-app-share-qr'));return;}
    var share=e.target.closest('[data-app-share-link]');
    if(share){e.preventDefault();shareLink(share.getAttribute('data-app-share-link'));}
  });

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',normalizeTimes26001Page,{once:true});
  else normalizeTimes26001Page();
})();
