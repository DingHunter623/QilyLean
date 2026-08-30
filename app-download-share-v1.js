/* QilyLean APP product/share normalization | 2026-08-27 */
(function(){
  'use strict';
  var TIMES_POSITIONING='面向工业工程、现场改善与时间研究场景的专业测时工具，由 QilyLean｜启力精益开发。';
  var TIMES_VERSION='1.1.14';
  var TIMES_CODE='17';
  var TIMES_TARGET='36';
  var TIMES_DEVICE='三星 C55';
  var TIMES_REAL_HERO='/assets/tools/times26001-v1.1.14-home-samsung-c55.webp?v=20260827-c55-v1';
  var TIMES_REAL_GALLERY='/assets/tools/times26001-v1.1.14-gallery-samsung-c55.webp?v=20260827-c55-v1';
  var apps={
    times26001:{
      name:'Times26001',
      url:'https://qilylean.com/tools/times26001/#android-download',
      download:'https://qilylean.com/Times26001-Android-v1.1.14-Standard-Website-Logo.apk?build=20260827-v114',
      qr:'/assets/tools/qr-times26001-download.svg?v=20260808-share-v1'
    },
    qilyleanHome:{
      name:'QilyLean Home｜官网通用安装包',
      url:'https://qilylean.com/capabilities/#qilylean-home',
      download:'https://qilylean.com/QilyLean_Home_v2.3.3_API36_INSTALL.apk?build=20260824-qhome-v233',
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

  function ensureQilyLeanHomeActions(homeCard){
    if(!homeCard)return;
    var homeActions=homeCard.querySelector('.module-actions');
    if(!homeActions)return;
    var required=['下载 Android APK','下载说明','扫码下载','分享下载页','隐私政策','用户协议','技术支持'];
    var current=[].map.call(homeActions.querySelectorAll('a,button'),function(el){return (el.textContent||'').trim();});
    var complete=required.every(function(label){return current.indexOf(label)>=0;}) && homeActions.querySelectorAll('a,button').length===7;
    if(!complete || homeActions.dataset.qilyHomeActions!=='20260824-v2'){
      homeActions.dataset.qilyHomeActions='20260824-v2';
      homeActions.innerHTML=''
        + '<a data-qilylean-home-direct-download="1" href="/QilyLean_Home_v2.3.3_API36_INSTALL.apk?build=20260824-qhome-v233" download>下载 Android APK</a>'
        + '<a href="/app-support/">下载说明</a>'
        + '<a href="#qilylean-home-qr" data-app-share-qr="qilyleanHome" aria-label="扫码下载 QilyLean Home">扫码下载</a>'
        + '<a href="https://qilylean.com/capabilities/#qilylean-home" data-app-share-link="qilyleanHome" aria-label="分享 QilyLean Home 下载页">分享下载页</a>'
        + '<a href="/legal/qilylean-home/privacy/">隐私政策</a>'
        + '<a href="/legal/qilylean-home/terms/">用户协议</a>'
        + '<a href="mailto:admin@qilylean.com?subject=QilyLean%20Home%20%E6%8A%80%E6%9C%AF%E6%94%AF%E6%8C%81">技术支持</a>';
    }
  }

  function injectTimes26001RealDeviceGallery(){
    if(document.getElementById('times26001-real-device-gallery'))return;
    var features=document.getElementById('features');
    if(!features)return;
    var section=document.createElement('section');
    section.className='tool-section alt';
    section.id='times26001-real-device-gallery';
    section.setAttribute('data-times26001-real-device','20260827-samsung-c55-v114');
    section.innerHTML=''
      + '<div class="tool-inner">'
      + '<div class="tool-heading"><h2>三星 C55 真机界面｜v1.1.14</h2><p><strong>2026-08-27 已完成 Android 真机安装与代表性核心界面验证。</strong> 以下全部采用实际手机截屏，不以概念图替代产品界面；验证版本为 v1.1.14 / versionCode 17 / API 36。</p></div>'
      + '<div style="display:grid;grid-template-columns:minmax(0,1.25fr) minmax(280px,.75fr);gap:clamp(20px,4vw,42px);align-items:start">'
      + '<figure style="margin:0;padding:16px;border:1px solid #d5e4e3;border-radius:22px;background:#0d1016;box-shadow:0 16px 42px rgba(15,75,90,.12)"><img src="'+TIMES_REAL_GALLERY+'" alt="Times26001 v1.1.14 三星C55真机代表性界面：万年历、天气、计时、设置" width="720" height="936" loading="lazy" decoding="async" style="display:block;width:100%;height:auto;border-radius:14px"><figcaption style="padding:14px 5px 2px;color:#dbe8ea;font-size:15px;line-height:1.65">真实界面拼图：万年历 / 天气定位与未来7天 / 秒表与倒计时 / 个性化设置、权限、隐私与版本信息。</figcaption></figure>'
      + '<div style="display:grid;gap:14px">'
      + '<article class="tool-card"><small>REAL DEVICE｜首页</small><h3>北京时间与本地时间信息</h3><p>首页集中展示当前时间、日期、周次、农历、生肖、传统时辰、节假日与星座；默认按 Asia/Shanghai 处理时间与日历信息。</p></article>'
      + '<article class="tool-card"><small>REAL DEVICE｜万年历</small><h3>月历＋农历＋宜忌信息</h3><p>支持月份切换与日期详情，展示农历、生肖/干支、节气/节日、宜忌、冲煞、星座等信息，1900—2100 年历法信息本机离线计算。</p></article>'
      + '<article class="tool-card"><small>REAL DEVICE｜天气</small><h3>当前位置＋未来7天</h3><p>用户可主动搜索城市或使用当前位置，查看温度、体感、湿度、风速、降水与未来7天天气趋势；位置权限可在设置中重新管理。</p></article>'
      + '<article class="tool-card"><small>REAL DEVICE｜计时</small><h3>IE分段秒表＋倒计时</h3><p>秒表支持不限次数分段，并同时保留本段与累计时间；记录可复制到 Excel/WPS。倒计时提供常用预设、自定义分钟以及响铃、震动和通知提醒。</p></article>'
      + '<article class="tool-card"><small>REAL DEVICE｜设置</small><h3>本地优先、无账号、无广告</h3><p>支持深浅主题、多国语言、字号、色弱模式、生日星座、天气定位与隐私/协议/技术支持入口。当前版本不设账号、不投放广告，核心记录保存在本机。</p></article>'
      + '</div></div></div>';
    features.insertAdjacentElement('afterend',section);
  }

  function normalizeTimes26001Page(){
    var path=(location.pathname||'').replace(/\/index\.html$/,'/');
    if(path!=='/tools/times26001/')return;

    document.title='Times26001｜工业工程时间研究与IE现场测时工具';
    setMeta('meta[name="description"]',TIMES_POSITIONING+' Times26001提供IE秒表分段、累计总时长、倒计时、闹钟、万年历及天气定位辅助功能；v1.1.14已完成三星C55真机安装验证。');
    setMeta('meta[property="og:title"]','Times26001｜工业工程时间研究与IE现场测时工具');
    setMeta('meta[property="og:description"]',TIMES_POSITIONING+' v1.1.14已完成三星C55真机安装验证。');
    setMeta('meta[property="og:image"]','https://qilylean.com'+TIMES_REAL_HERO.split('?')[0]);
    setMeta('meta[name="twitter:image"]','https://qilylean.com'+TIMES_REAL_HERO.split('?')[0]);

    var lead=document.querySelector('.tool-lead');
    if(lead)lead.innerHTML='<strong>'+TIMES_POSITIONING+'</strong><br>Times26001以工业工程时间研究和制造现场测时为核心，提供IE秒表分段、累计总时长、数据复制、倒计时、闹钟、万年历及天气定位与未来7天预报辅助能力。<br><strong>当前验证版本：v'+TIMES_VERSION+' / versionCode '+TIMES_CODE+' / API '+TIMES_TARGET+'；已于2026-08-27完成'+TIMES_DEVICE+'真机安装及首页、万年历、天气、计时与设置等代表性界面验证。</strong>';

    var visual=document.querySelector('.tool-visual');
    if(visual){
      var image=visual.querySelector('img');
      if(image){image.src=TIMES_REAL_HERO;image.alt='Times26001 v1.1.14 三星C55真机首页截图';image.width=480;image.height=1067;}
      if(!visual.querySelector('figcaption')){
        var caption=document.createElement('figcaption');
        caption.textContent='三星 C55 真机截屏｜Times26001 v1.1.14 / versionCode 17 / API 36';
        caption.style.cssText='padding:12px 16px;color:#355;background:#f4fbfa;font-size:14px;font-weight:800;text-align:center';
        visual.appendChild(caption);
      }
    }
    injectTimes26001RealDeviceGallery();
  }

  function normalizeCapabilitiesCrossLinks(){
    var path=(location.pathname||'').replace(/\/index\.html$/,'/');
    if(path!=='/capabilities/')return;
    var section=document.getElementById('digital-tools');
    if(!section)return;

    var timesCard=document.getElementById('times26001');
    if(timesCard){
      var image=timesCard.querySelector('img');
      if(image){image.src=TIMES_REAL_HERO;image.alt='Times26001 v1.1.14 三星C55真机首页截图';}
      var small=timesCard.querySelector('small');
      if(small)small.textContent='数字工具作品｜工业工程时间研究＋IE现场测时';
      var title=timesCard.querySelector('h3');
      if(title)title.textContent='Times26001';
      var paragraph=timesCard.querySelector('.capability-digital-content > p');
      if(paragraph)paragraph.innerHTML='<strong>'+TIMES_POSITIONING+'</strong> 集成IE秒表分段、累计总时长、数据复制、按秒倒计时、闹钟、北京时间、万年历、农历、黄历、节气与天气定位/未来7天预报；v1.1.14已完成三星C55真机安装与代表性界面验证。';
      var result=timesCard.querySelector('.module-result');
      if(result)result.textContent='当前验证版：v1.1.14 / versionCode 17 / API 36｜三星C55真机验证｜本地优先｜当前位置/城市搜索｜当前实况＋未来7天';
      timesCard.querySelectorAll('[data-app-share-link="times26001"]').forEach(function(btn){btn.textContent='分享下载页';});
    }

    var homeCard=document.getElementById('qilylean-home');
    if(homeCard){
      ensureQilyLeanHomeActions(homeCard);
      var homeResult=homeCard.querySelector('.module-result');
      if(homeResult)homeResult.textContent='当前版本：v2.3.3 | versionCode 11 | Android 16 / API 36 | R5官网最新导航 | 实时时钟 + 农历 | Times26001直达 | 通用设置 + 全部应用抽屉';
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
