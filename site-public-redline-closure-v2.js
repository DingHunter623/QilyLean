/* QilyLean Translation Public UI V2.1｜2026-08-30
 * Visitor-facing translation UI plus the 0830 shared/public redline closure.
 * Public language choices: 中文简体 / 中文繁体 / 美式英语. Chinese simplified remains default.
 */
(function(d,w){
  'use strict';
  if(w.__qilyTranslationPublicUiV21)return;
  w.__qilyTranslationPublicUiV21=true;
  w.__qilyTranslationPublicUiV1=true;

  var CONTROL_ID='qilyGlobalTranslationDualRouteV2';
  var observer=null,searchObserver=null,searchReranking=false,lastShareAt=0;
  var canvas=d.createElement('canvas');
  var context=canvas.getContext&&canvas.getContext('2d');
  var PUBLIC_LANGS={'zh-CN':'中文简体','zh-TW':'中文繁体','en':'美式英语'};
  var PUBLIC_ORDER=['zh-CN','zh-TW','en'];

  function normalizedPath(){
    var value=(w.location.pathname||'/').replace(/\/index\.html$/,'/').replace(/\/{2,}/g,'/');
    if(value.length>1&&value.charAt(value.length-1)!=='/'&&!/\/[^/]+\.[^/]+$/.test(value))value+='/';
    return value;
  }

  function selectedName(select){
    if(!select||!select.options||select.selectedIndex<0)return '中文简体';
    var option=select.options[select.selectedIndex];
    return (option&&option.textContent||'中文简体').trim();
  }

  function measuredTextWidth(select,text){
    if(!context)return Math.max(64,Array.from(text||'').length*16);
    var style=w.getComputedStyle(select);
    context.font=[style.fontStyle,style.fontVariant,style.fontWeight,style.fontSize,style.fontFamily].filter(Boolean).join(' ');
    return Math.ceil(context.measureText(text||'').width);
  }

  function fitSelect(select){
    if(!select)return;
    var name=selectedName(select),viewport=Math.max(d.documentElement.clientWidth||0,w.innerWidth||0),style=w.getComputedStyle(select);
    var chrome=12+(parseFloat(style.paddingLeft)||0)+(parseFloat(style.paddingRight)||0)+(parseFloat(style.borderLeftWidth)||0)+(parseFloat(style.borderRightWidth)||0);
    var required=Math.ceil(measuredTextWidth(select,name)+chrome),maxWidth=viewport<=430?Math.max(108,viewport-54):136,width=Math.max(110,Math.min(maxWidth,required));
    select.style.setProperty('--qily-language-select-width',width+'px');
    select.style.width=width+'px';select.style.minWidth=width+'px';select.style.maxWidth=width+'px';
    select.setAttribute('title',name);select.setAttribute('aria-label','网页翻译语言：'+name);select.setAttribute('data-qily-selected-language',name);
  }

  function revealSelectedLanguage(select){
    var nav=select&&select.closest?select.closest('nav'):null;
    if(!nav||nav.scrollWidth<=nav.clientWidth)return;
    w.requestAnimationFrame(function(){var target=Math.max(0,nav.scrollWidth-nav.clientWidth);try{nav.scrollTo({left:target,behavior:'smooth'})}catch(error){nav.scrollLeft=target}});
  }

  function prunePublicLanguages(select){
    if(!select)return;
    Array.from(select.options).forEach(function(option){if(!Object.prototype.hasOwnProperty.call(PUBLIC_LANGS,option.value))option.remove();else option.textContent=PUBLIC_LANGS[option.value]});
    PUBLIC_ORDER.forEach(function(code){if(Array.from(select.options).some(function(option){return option.value===code}))return;var option=d.createElement('option');option.value=code;option.textContent=PUBLIC_LANGS[code];select.appendChild(option)});
    var active=(d.documentElement.getAttribute('data-qily-language')||'zh-CN').trim();
    if(!Object.prototype.hasOwnProperty.call(PUBLIC_LANGS,active))active='zh-CN';
    select.value=active;
  }

  function cleanControl(control){
    if(!control)return false;
    control.setAttribute('aria-label','网页翻译');control.setAttribute('title','默认中文简体；可切换中文繁体或美式英语。');control.setAttribute('data-qily-public-language-set','zh-CN,zh-TW,en');control.setAttribute('data-qily-default-language','zh-CN');
    var mark=control.querySelector('.qily-web-translate__mark');if(mark)mark.textContent='🌐';
    var brand=control.querySelector('.qily-web-translate__brand');if(brand)brand.remove();
    var badge=control.querySelector('.qily-web-translate__badge');if(badge)badge.remove();
    var status=control.querySelector('.qily-web-translate__status');if(status){status.hidden=true;status.setAttribute('aria-hidden','true');status.removeAttribute('aria-live');status.removeAttribute('aria-atomic')}
    var select=control.querySelector('.qily-web-translate__select');
    if(select){
      prunePublicLanguages(select);fitSelect(select);
      if(select.dataset.qilyPublicUiBound!=='v2.1'){
        select.dataset.qilyPublicUiBound='v2.1';
        select.addEventListener('change',function(){prunePublicLanguages(select);fitSelect(select);revealSelectedLanguage(select)});
        select.addEventListener('input',function(){fitSelect(select);revealSelectedLanguage(select)});
      }
    }
    return true;
  }

  function splitTrustContact(){
    if(normalizedPath()!=='/trust/')return;
    d.querySelectorAll('.trust-contact a[href^="tel:"],.trust-contact a[href^="mailto:"]').forEach(function(link){
      if(link.dataset.qilyContactSemantic==='v2')return;
      var isPhone=(link.getAttribute('href')||'').indexOf('tel:')===0,raw=(link.textContent||'').trim(),label=isPhone?'电话：':'邮箱：';
      var value=raw.replace(/^电话[:：]\s*/,'').replace(/^邮箱[:：]\s*/,'');
      link.textContent='';var fixed=d.createElement('span');fixed.className='qily-contact-fixed';fixed.textContent=label;var dynamic=d.createElement('span');dynamic.className='qily-contact-dynamic';dynamic.textContent=value;link.appendChild(fixed);link.appendChild(dynamic);link.dataset.qilyContactSemantic='v2';
    });
  }

  function timesWorkflowMarkup(){
    return '<figure class="qily-times-workflow" data-qily-times-visual="engineering-workflow-v2"><figcaption>Times26001｜IE时间研究与改善复验工作流</figcaption><div class="qily-times-workflow__line">'+
      '<div class="qily-times-workflow__step"><b>01｜现场观察</b><span>确认工序、动作、等待与异常边界</span></div>'+
      '<div class="qily-times-workflow__step"><b>02｜分段测时</b><span>记录CT、分段时间与累计总时长</span></div>'+
      '<div class="qily-times-workflow__step"><b>03｜数据输出</b><span>复制到Excel/WPS，形成可追溯记录</span></div>'+
      '<div class="qily-times-workflow__step"><b>04｜工程分析</b><span>标准工时、线平衡、瓶颈与损失识别</span></div>'+
      '<div class="qily-times-workflow__step"><b>05｜改善复验</b><span>改善前后同口径复测，验证实际效果</span></div></div></figure>';
  }

  function upgradeTimes26001(){
    var current=normalizedPath();
    if(current==='/tools/times26001/'){
      var visual=d.querySelector('.tool-hero .tool-visual');
      if(visual&&visual.dataset.qilyTimesVisual!=='v2'){visual.innerHTML=timesWorkflowMarkup();visual.dataset.qilyTimesVisual='v2'}
      var lead=d.querySelector('.tool-hero .tool-lead');
      if(lead&&lead.dataset.qilyTimesCopy!=='v2'){lead.innerHTML='<strong>面向工业工程、现场改善与时间研究的专业测时工具，由 QilyLean｜启力精益开发。</strong><br>以“现场观察 → 分段测时 → 数据输出 → 工程分析 → 改善复验”为主线，支持IE秒表分段、累计总时长、数据复制、倒计时、提醒、时间日历与天气辅助；核心价值是把现场时间数据转化为标准工时、线平衡和改善验证的工程输入。';lead.dataset.qilyTimesCopy='v2'}
    }
    if(current==='/capabilities/'){
      var card=d.getElementById('times26001');if(!card)return;
      var visual2=card.querySelector('.capability-digital-visual');if(visual2&&visual2.dataset.qilyTimesVisual!=='v2'){visual2.innerHTML=timesWorkflowMarkup();visual2.dataset.qilyTimesVisual='v2'}
      var paragraph=card.querySelector('.capability-digital-content p');
      if(paragraph&&paragraph.dataset.qilyTimesCopy!=='v2'){paragraph.innerHTML='<strong>面向工业工程、现场改善与时间研究场景的专业测时工具，由 QilyLean｜启力精益开发。</strong> 将IE现场观察、分段测时、累计时间、数据复制与改善复验连成一条工程数据链，服务标准工时、线平衡、瓶颈识别与改善前后同口径验证。';paragraph.dataset.qilyTimesCopy='v2'}
    }
  }

  function cleanProductionOperations(){
    if(normalizedPath()!=='/qilylean/production-operations-organization.html')return;
    var preview=d.querySelector('.qily-contact-sheet-preview');
    if(preview&&preview.dataset.qilyContactSheetClean!=='v2'){
      preview.classList.add('qily-contact-sheet-clean');preview.dataset.qilyContactSheetClean='v2';
      preview.innerHTML='<div class="qily-contact-qr-grid"><div class="qily-contact-qr-item"><div class="qily-contact-qr-box"><img src="/assets/contact/qilylean-website-qr.svg?v=20260830" alt="QilyLean官网二维码" loading="lazy" decoding="async"></div><strong>QilyLean｜启力精益</strong><span>官网：qilylean.com</span></div><div class="qily-contact-qr-item"><div class="qily-contact-qr-box"><img src="/assets/contact/wechat-contact-card.svg?v=20260830" alt="东方猎手微信交流二维码" loading="lazy" decoding="async"></div><strong>微信交流</strong><span>用于项目交流与专业沟通</span></div></div><figcaption><strong>官网与交流</strong><span>二维码尺寸与信息层级统一；仅保留对外使用信息。</span></figcaption>';
    }
    var downloads=d.getElementById('downloads'),head=downloads&&downloads.querySelector('.section-head');
    if(head)Array.from(head.querySelectorAll(':scope > p')).forEach(function(p){if(/附件.*品牌|品牌页眉页脚|官网二维码|交流二维码/.test(p.textContent||''))p.remove()});
  }

  function detailScore(link,query){
    var href=(link.getAttribute('href')||'').split('#')[0],title=((link.querySelector('strong')||{}).textContent||'').toLowerCase(),snippet=((link.querySelector('.qily-search-snippet')||{}).textContent||'').toLowerCase(),q=(query||'').trim().toLowerCase(),score=0;
    if(!q)return 0;if(title===q)score+=3000;if(title.indexOf(q)!==-1)score+=1800;if(snippet.indexOf(q)!==-1)score+=600;
    q.split(/[\s,，。；;、|/]+/).filter(Boolean).forEach(function(term){if(title.indexOf(term)!==-1)score+=420;if(snippet.indexOf(term)!==-1)score+=90});
    if(/\/knowledge\/[^/]+\.html$/.test(href))score+=900;if(/\/qilylean\/(?:training|daily)\/[^/]+\.html$/.test(href))score+=720;if(/\/projects\/[^/]+\/$/.test(href))score+=520;if(/\/improvements\/[^/]+\/$/.test(href))score+=420;
    if(/^\/(?:knowledge|projects|improvements|capabilities|experience|trust|cooperation|links)\/$/.test(href))score-=900;if(href==='/qilylean/daily-insights.html')score-=800;
    if(/单点培训|opl|single-point/.test(title+' '+snippet))score+=(q.indexOf('单点')!==-1||q.indexOf('培训')!==-1)?1100:120;
    return score;
  }

  function rerankSearch(){
    if(searchReranking)return;
    var panel=d.getElementById('qilySearchMask'),results=panel&&panel.querySelector('.qily-search-results'),input=panel&&panel.querySelector('.qily-search-input');if(!results||!input)return;
    var query=input.value||'',links=Array.from(results.querySelectorAll('a.qily-search-result[href]'));if(links.length<2||!query.trim())return;
    var ranked=links.map(function(link,index){return{link:link,index:index,score:detailScore(link,query)}}).sort(function(a,b){return b.score-a.score||a.index-b.index});
    var changed=ranked.some(function(item,index){return item.link!==links[index]});
    searchReranking=true;
    if(changed){if(searchObserver)searchObserver.disconnect();ranked.forEach(function(item){results.appendChild(item.link)});if(searchObserver)searchObserver.observe(results,{childList:true,subtree:false})}
    ranked.forEach(function(item,index){var rank=item.link.querySelector('.qily-search-rank');if(rank)rank.textContent='关联 '+String(index+1).padStart(2,'0');if(index<3&&item.score>0)item.link.setAttribute('data-qily-detail-priority','high');else item.link.removeAttribute('data-qily-detail-priority')});
    searchReranking=false;
  }

  function installSearchRerank(){
    var mask=d.getElementById('qilySearchMask');if(!mask||mask.dataset.qilyDetailRerank==='v2')return;
    var results=mask.querySelector('.qily-search-results'),input=mask.querySelector('.qily-search-input');if(!results||!input)return;
    mask.dataset.qilyDetailRerank='v2';searchObserver=new MutationObserver(function(){if(!searchReranking)w.requestAnimationFrame(rerankSearch)});searchObserver.observe(results,{childList:true,subtree:false});
    input.addEventListener('input',function(){w.setTimeout(rerankSearch,190)});mask.addEventListener('submit',function(){w.setTimeout(rerankSearch,30)},true);rerankSearch();
  }

  function copyText(text){
    if(navigator.clipboard&&w.isSecureContext)return navigator.clipboard.writeText(text);
    var area=d.createElement('textarea');area.value=text;area.setAttribute('readonly','');area.style.position='fixed';area.style.left='-9999px';(d.body||d.documentElement).appendChild(area);area.select();try{d.execCommand('copy')}catch(error){}area.remove();return Promise.resolve();
  }

  function shareToast(message){
    var node=d.getElementById('qilyDockShareCopyToastV2');if(!node){node=d.createElement('div');node.id='qilyDockShareCopyToastV2';node.setAttribute('role','status');(d.body||d.documentElement).appendChild(node)}node.textContent=message;node.hidden=false;clearTimeout(shareToast.timer);shareToast.timer=w.setTimeout(function(){node.hidden=true},2300);
  }

  function runShare(){
    if(Date.now()-lastShareAt<350)return;lastShareAt=Date.now();
    var title=d.title||'QilyLean',url=w.location.href,text=title+'\n'+url;
    copyText(text).then(function(){shareToast('网页标题和网址已复制');if(navigator.share)return navigator.share({title:title,text:title,url:url}).catch(function(error){if(error&&error.name==='AbortError')return;shareToast('已复制，可粘贴到微信、微博等应用')});shareToast('已复制，可粘贴到微信、微博等应用')}).catch(function(){if(navigator.share)navigator.share({title:title,text:title,url:url}).catch(function(){})});
  }

  function shareClickCapture(event){
    var button=event.target&&event.target.closest?event.target.closest('#floatDock .qily-float-btn[data-action="current"]'):null;if(!button)return;event.preventDefault();event.stopImmediatePropagation();runShare();
  }

  function shareKeyCapture(event){
    if(event.key!=='Enter'&&event.key!==' ')return;var button=event.target&&event.target.closest?event.target.closest('#floatDock .qily-float-btn[data-action="current"]'):null;if(!button)return;event.preventDefault();event.stopImmediatePropagation();runShare();
  }

  function reconcile(){
    cleanControl(d.getElementById(CONTROL_ID));splitTrustContact();upgradeTimes26001();cleanProductionOperations();installSearchRerank();d.documentElement.setAttribute('data-qily-redline-closure','v2');
  }

  d.addEventListener('click',shareClickCapture,true);d.addEventListener('keydown',shareKeyCapture,true);
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',reconcile,{once:true});else reconcile();
  d.addEventListener('qily:shell-ready',reconcile);d.addEventListener('qily:softnavigate',reconcile);d.addEventListener('qily:language-change',function(){w.setTimeout(reconcile,0)});w.addEventListener('pageshow',reconcile,{passive:true});w.addEventListener('resize',function(){w.requestAnimationFrame(function(){cleanControl(d.getElementById(CONTROL_ID));rerankSearch()})},{passive:true});
  if(w.MutationObserver){observer=new MutationObserver(function(records){var added=false;for(var i=0;i<records.length;i+=1){if(records[i].addedNodes&&records[i].addedNodes.length){added=true;break}}if(added)w.requestAnimationFrame(reconcile)});observer.observe(d.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['data-state','data-qily-language']})}
})(document,window);
