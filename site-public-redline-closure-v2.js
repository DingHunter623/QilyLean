/* QilyLean Translation Public UI V2.2｜2026-08-30
 * Visitor-facing translation UI plus the 0830 shared/public redline closure.
 * Public language choices: 中文简体 / 中文繁体 / 美式英语. Chinese simplified remains default.
 * V2.2 closes the annotated visual/professional redlines as one engineering pass.
 */
(function(d,w){
  'use strict';
  if(w.__qilyTranslationPublicUiV22)return;
  w.__qilyTranslationPublicUiV22=true;
  w.__qilyTranslationPublicUiV21=true;
  w.__qilyTranslationPublicUiV1=true;

  var CONTROL_ID='qilyGlobalTranslationDualRouteV2';
  var observer=null,searchObserver=null,searchReranking=false,lastShareAt=0;
  var canvas=d.createElement('canvas');
  var context=canvas.getContext&&canvas.getContext('2d');
  var PUBLIC_LANGS={'zh-CN':'中文简体','zh-TW':'中文繁体','en':'美式英语'};
  var PUBLIC_ORDER=['zh-CN','zh-TW','en'];
  var DIRECT_SEARCH_ROUTES=[
    {aliases:['pdca单点培训','pdca培训','pdca','甘特图','里程碑管理'],url:'/knowledge/pdca-gantt-milestone-opl.html',title:'PDCA＋甘特图里程碑管理｜OPL单点培训',kind:'单点培训课件'},
    {aliases:['八大浪费','制造业八大浪费'],url:'/qilylean/daily/2026-08-25.html',title:'识别制造业八大浪费｜精选简报',kind:'精选简报'},
    {aliases:['times26001','ie测时','时间研究'],url:'/tools/times26001/',title:'Times26001｜IE时间研究与现场测时',kind:'数字工具'},
    {aliases:['vsm','价值流图','价值流'],url:'/improvements/vsm/',title:'VSM价值流｜改善方法',kind:'改善方法'},
    {aliases:['标准工时','standard time'],url:'/improvements/standard-time/',title:'标准工时｜改善方法',kind:'改善方法'},
    {aliases:['smed','快速换型','快速换模'],url:'/improvements/smed/',title:'SMED快速换型｜改善方法',kind:'改善方法'},
    {aliases:['ie数据','标准产能','upph'],url:'/improvements/ie-data/',title:'IE数据底座｜改善方法',kind:'改善方法'},
    {aliases:['erp mes','erp/mes','erp','mes'],url:'/improvements/erp-mes/',title:'ERP／MES数据协同｜改善方法',kind:'改善方法'},
    {aliases:['目视化','visual management'],url:'/improvements/visual/',title:'现场目视化｜改善方法',kind:'改善方法'},
    {aliases:['新工厂规划','工厂规划'],url:'/projects/factory-layout/',title:'新工厂／新产线规划｜代表项目',kind:'代表项目'},
    {aliases:['汽车电子精益','汽车电子'],url:'/projects/automotive-lean/',title:'汽车电子精益体系｜代表项目',kind:'代表项目'},
    {aliases:['付款核验','主体核验','主体与付款'],url:'/trust/#contact',title:'主体与付款信息核验｜信任中心',kind:'信任中心'}
  ];

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
      if(select.dataset.qilyPublicUiBound!=='v2.2'){
        select.dataset.qilyPublicUiBound='v2.2';
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

  function ensureTrustVerification(){
    if(normalizedPath()!=='/trust/')return;
    var section=d.getElementById('contact');
    if(!section){
      var main=d.querySelector('main');if(!main)return;
      section=d.createElement('section');section.className='module-section alt';section.id='contact';section.setAttribute('data-qily-trust-verification','restored-v1');
      section.innerHTML='<div class="module-inner"><div class="module-heading"><h2>主体与付款信息核验</h2><p>签约、付款或资料交换前，可通过以下官网公开渠道进行核验。</p></div><div class="trust-contact"><a href="tel:13450014003">电话：134 5001 4003</a><a href="mailto:admin@qilylean.com">邮箱：admin@qilylean.com</a></div><div class="module-actions" style="margin-top:18px"><a href="/cooperation/">进入项目合作</a><a class="secondary" href="/projects/">查看代表项目</a><a class="secondary" href="/knowledge/">查看知识分享</a></div></div>';
      main.appendChild(section);
    }
    section.hidden=false;section.removeAttribute('aria-hidden');section.style.removeProperty('display');section.setAttribute('data-qily-trust-verification','visible-v2');splitTrustContact();
  }

  function polishCooperationHero(){
    if(normalizedPath()!=='/cooperation/')return;
    var primary=d.querySelector('.module-hero .hero-actions a.primary[href="#diagnosis"]');if(!primary)return;
    if(primary.dataset.qilyProfessionalCta==='v2')return;
    primary.textContent='提交问题背景｜启动项目研判';
    primary.setAttribute('aria-label','提交问题背景并进入项目合作初步研判');
    primary.setAttribute('title','进入项目合作初步研判；正式诊断范围以双方确认内容为准');
    primary.dataset.qilyProfessionalCta='v2';
  }

  function timesWorkflowMarkup(){
    return '<figure class="qily-times-workflow" data-qily-times-visual="engineering-workflow-v3"><figcaption>Times26001｜IE时间研究与改善复验工作流</figcaption><div class="qily-times-workflow__line">'+
      '<div class="qily-times-workflow__step"><b><span class="qily-times-step-no">01</span><span class="qily-times-step-title">现场观察</span></b><span>确认工序、动作、等待与异常边界</span></div>'+
      '<div class="qily-times-workflow__step"><b><span class="qily-times-step-no">02</span><span class="qily-times-step-title">分段测时</span></b><span>记录CT、分段时间与累计总时长</span></div>'+
      '<div class="qily-times-workflow__step"><b><span class="qily-times-step-no">03</span><span class="qily-times-step-title">数据输出</span></b><span>复制到Excel/WPS，形成可追溯记录</span></div>'+
      '<div class="qily-times-workflow__step"><b><span class="qily-times-step-no">04</span><span class="qily-times-step-title">工程分析</span></b><span>标准工时、线平衡、瓶颈与损失识别</span></div>'+
      '<div class="qily-times-workflow__step"><b><span class="qily-times-step-no">05</span><span class="qily-times-step-title">改善复验</span></b><span>改善前后同口径复测，验证实际效果</span></div></div></figure>';
  }

  function upgradeTimes26001(){
    var current=normalizedPath();
    if(current==='/tools/times26001/'){
      var visual=d.querySelector('.tool-hero .tool-visual');
      if(visual&&visual.dataset.qilyTimesVisual!=='v3'){visual.innerHTML=timesWorkflowMarkup();visual.dataset.qilyTimesVisual='v3'}
      var lead=d.querySelector('.tool-hero .tool-lead');
      if(lead&&lead.dataset.qilyTimesCopy!=='v2'){lead.innerHTML='<strong>面向工业工程、现场改善与时间研究的专业测时工具，由 QilyLean｜启力精益开发。</strong><br>以“现场观察 → 分段测时 → 数据输出 → 工程分析 → 改善复验”为主线，支持IE秒表分段、累计总时长、数据复制、倒计时、提醒、时间日历与天气辅助；核心价值是把现场时间数据转化为标准工时、线平衡和改善验证的工程输入。';lead.dataset.qilyTimesCopy='v2'}
    }
    if(current==='/capabilities/'){
      var card=d.getElementById('times26001');if(!card)return;
      var visual2=card.querySelector('.capability-digital-visual');if(visual2&&visual2.dataset.qilyTimesVisual!=='v3'){visual2.innerHTML=timesWorkflowMarkup();visual2.dataset.qilyTimesVisual='v3'}
      var paragraph=card.querySelector('.capability-digital-content p');
      if(paragraph&&paragraph.dataset.qilyTimesCopy!=='v2'){paragraph.innerHTML='<strong>面向工业工程、现场改善与时间研究场景的专业测时工具，由 QilyLean｜启力精益开发。</strong> 将IE现场观察、分段测时、累计时间、数据复制与改善复验连成一条工程数据链，服务标准工时、线平衡、瓶颈识别与改善前后同口径验证。';paragraph.dataset.qilyTimesCopy='v2'}
    }
  }

  function cleanProductionOperations(){
    if(normalizedPath()!=='/qilylean/production-operations-organization.html')return;
    var preview=d.querySelector('.qily-contact-sheet-preview');
    if(preview&&preview.dataset.qilyContactSheetClean!=='v3'){
      preview.classList.add('qily-contact-sheet-clean');preview.dataset.qilyContactSheetClean='v3';
      preview.innerHTML='<div class="qily-contact-qr-grid"><div class="qily-contact-qr-item"><div class="qily-contact-qr-box"><img src="/assets/contact/qilylean-website-qr.svg?v=20260830" alt="QilyLean官网二维码" loading="lazy" decoding="async"></div><strong>QilyLean｜启力精益</strong><span>qilylean.com</span></div><div class="qily-contact-qr-item"><div class="qily-contact-qr-box"><img src="/qilylean/wechat-qrcode-20260826.png?v=20260826-user-resubmitted-v2" alt="Qily259微信二维码" loading="lazy" decoding="async"></div><strong>微信交流</strong><span>Qily259</span></div></div>';
    }
    var downloads=d.getElementById('downloads'),head=downloads&&downloads.querySelector('.section-head');
    if(head)Array.from(head.querySelectorAll(':scope > p')).forEach(function(p){if(/附件.*品牌|品牌页眉页脚|官网二维码|交流二维码|尺寸与信息层级|对外使用信息/.test(p.textContent||''))p.remove()});
  }

  function directSearchMatch(query){
    var q=(query||'').trim().toLowerCase().replace(/\s+/g,'');if(!q)return null;
    for(var i=0;i<DIRECT_SEARCH_ROUTES.length;i+=1){var item=DIRECT_SEARCH_ROUTES[i];for(var j=0;j<item.aliases.length;j+=1){var alias=String(item.aliases[j]).toLowerCase().replace(/\s+/g,'');if(alias&&q.indexOf(alias)!==-1)return item;}}
    return null;
  }

  function ensureDirectSearchResult(results,query){
    var direct=directSearchMatch(query);if(!direct||!results)return;
    var existing=Array.from(results.querySelectorAll('a.qily-search-result[href]')).find(function(link){var href=(link.getAttribute('href')||'').split('#')[0];return href===direct.url.split('#')[0]});
    if(existing){existing.setAttribute('data-qily-direct-result','v2');results.insertBefore(existing,results.firstChild);return;}
    var link=d.createElement('a');link.className='qily-search-result';link.href=direct.url;link.setAttribute('data-qily-search-navigation','native');link.setAttribute('data-qily-direct-result','v2');link.setAttribute('data-qily-detail-priority','high');
    var meta=d.createElement('span');meta.className='qily-search-meta';var rank=d.createElement('span');rank.className='qily-search-rank';rank.textContent='直接匹配';var kind=d.createElement('span');kind.textContent=direct.kind;meta.appendChild(rank);meta.appendChild(kind);
    var title=d.createElement('strong');title.textContent=direct.title;var path=d.createElement('span');path.className='qily-search-path';path.textContent=direct.url;var snippet=d.createElement('span');snippet.className='qily-search-snippet';snippet.textContent='已匹配到对应的具体网页，点击直接进入，不经过模块清单中转。';var open=d.createElement('span');open.className='qily-search-open';open.textContent='直接打开对应网页 →';
    link.appendChild(meta);link.appendChild(title);link.appendChild(path);link.appendChild(snippet);link.appendChild(open);results.insertBefore(link,results.firstChild);
  }

  function detailScore(link,query){
    var href=(link.getAttribute('href')||'').split('#')[0],title=((link.querySelector('strong')||{}).textContent||'').toLowerCase(),snippet=((link.querySelector('.qily-search-snippet')||{}).textContent||'').toLowerCase(),q=(query||'').trim().toLowerCase(),score=0;
    if(!q)return 0;if(link.hasAttribute('data-qily-direct-result'))score+=10000;if(title===q)score+=3000;if(title.indexOf(q)!==-1)score+=1800;if(snippet.indexOf(q)!==-1)score+=600;
    q.split(/[\s,，。；;、|/]+/).filter(Boolean).forEach(function(term){if(title.indexOf(term)!==-1)score+=420;if(snippet.indexOf(term)!==-1)score+=90});
    if(/\/knowledge\/[^/]+\.html$/.test(href))score+=900;if(/\/qilylean\/(?:training|daily)\/[^/]+\.html$/.test(href))score+=720;if(/\/projects\/[^/]+\/$/.test(href))score+=520;if(/\/improvements\/[^/]+\/$/.test(href))score+=420;
    if(/^\/(?:knowledge|projects|improvements|capabilities|experience|trust|cooperation|links)\/$/.test(href))score-=900;if(href==='/qilylean/daily-insights.html')score-=800;
    if(/单点培训|opl|single-point/.test(title+' '+snippet))score+=(q.indexOf('单点')!==-1||q.indexOf('培训')!==-1||q.indexOf('pdca')!==-1)?1100:120;
    return score;
  }

  function rerankSearch(){
    if(searchReranking)return;
    var panel=d.getElementById('qilySearchMask'),results=panel&&panel.querySelector('.qily-search-results'),input=panel&&panel.querySelector('.qily-search-input');if(!results||!input)return;
    var query=input.value||'';if(!query.trim())return;ensureDirectSearchResult(results,query);
    var links=Array.from(results.querySelectorAll('a.qily-search-result[href]'));if(!links.length)return;
    var ranked=links.map(function(link,index){return{link:link,index:index,score:detailScore(link,query)}}).sort(function(a,b){return b.score-a.score||a.index-b.index});
    var changed=ranked.some(function(item,index){return item.link!==links[index]});
    searchReranking=true;
    if(changed){if(searchObserver)searchObserver.disconnect();ranked.forEach(function(item){results.appendChild(item.link)});if(searchObserver)searchObserver.observe(results,{childList:true,subtree:false})}
    ranked.forEach(function(item,index){var rank=item.link.querySelector('.qily-search-rank');if(rank&&!item.link.hasAttribute('data-qily-direct-result'))rank.textContent='关联 '+String(index+1).padStart(2,'0');if(index<3&&item.score>0)item.link.setAttribute('data-qily-detail-priority','high');else if(!item.link.hasAttribute('data-qily-direct-result'))item.link.removeAttribute('data-qily-detail-priority')});
    searchReranking=false;
  }

  function installSearchRerank(){
    var mask=d.getElementById('qilySearchMask');if(!mask||mask.dataset.qilyDetailRerank==='v2.2')return;
    var results=mask.querySelector('.qily-search-results'),input=mask.querySelector('.qily-search-input');if(!results||!input)return;
    mask.dataset.qilyDetailRerank='v2.2';searchObserver=new MutationObserver(function(){if(!searchReranking)w.requestAnimationFrame(rerankSearch)});searchObserver.observe(results,{childList:true,subtree:false});
    input.addEventListener('input',function(){w.setTimeout(rerankSearch,165)});mask.addEventListener('submit',function(){w.setTimeout(rerankSearch,15)},true);rerankSearch();
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
    copyText(text).then(function(){
      if(navigator.share){shareToast('标题与网址已复制，正在打开系统分享');return navigator.share({title:title,text:title,url:url}).catch(function(error){if(error&&error.name==='AbortError'){shareToast('已复制，可直接粘贴分享');return;}shareToast('已复制，可粘贴到微信、微博等应用')});}
      shareToast('标题与网址已复制，可粘贴到微信、微博等应用');
    }).catch(function(){if(navigator.share)navigator.share({title:title,text:title,url:url}).catch(function(){})});
  }

  function shareClickCapture(event){
    var button=event.target&&event.target.closest?event.target.closest('#floatDock .qily-float-btn[data-action="current"]'):null;if(!button)return;event.preventDefault();event.stopImmediatePropagation();runShare();
  }

  function shareKeyCapture(event){
    if(event.key!=='Enter'&&event.key!==' ')return;var button=event.target&&event.target.closest?event.target.closest('#floatDock .qily-float-btn[data-action="current"]'):null;if(!button)return;event.preventDefault();event.stopImmediatePropagation();runShare();
  }

  function reconcile(){
    cleanControl(d.getElementById(CONTROL_ID));ensureTrustVerification();polishCooperationHero();upgradeTimes26001();cleanProductionOperations();installSearchRerank();d.documentElement.setAttribute('data-qily-redline-closure','v2.2');
  }

  d.addEventListener('click',shareClickCapture,true);d.addEventListener('keydown',shareKeyCapture,true);
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',reconcile,{once:true});else reconcile();
  d.addEventListener('qily:shell-ready',reconcile);d.addEventListener('qily:softnavigate',reconcile);d.addEventListener('qily:language-change',function(){w.setTimeout(reconcile,0)});w.addEventListener('pageshow',reconcile,{passive:true});w.addEventListener('resize',function(){w.requestAnimationFrame(function(){cleanControl(d.getElementById(CONTROL_ID));rerankSearch()})},{passive:true});
  if(w.MutationObserver){observer=new MutationObserver(function(records){var added=false;for(var i=0;i<records.length;i+=1){if(records[i].addedNodes&&records[i].addedNodes.length){added=true;break}}if(added)w.requestAnimationFrame(reconcile)});observer.observe(d.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['data-state','data-qily-language']})}
})(document,window);