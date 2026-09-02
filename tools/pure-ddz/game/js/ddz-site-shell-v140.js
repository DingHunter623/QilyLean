/* QilyLean Pure DDZ site shell adapter v1.4.1｜2026-09-02
 * Pure DDZ is now a normal QilyLean page. This page-scoped adapter restores the canonical six-action Dock
 * after the historical immersive-page exclusion finishes loading. Reconciliation is bounded, not continuous.
 */
(function(d,w){
  'use strict';
  if(w.__qilyDdzSiteShellV141)return;
  w.__qilyDdzSiteShellV141=true;
  w.__qilyDdzSiteShellV140=true;
  var ORDER=['home','top','back','search','current','contact'];
  var LABELS={home:['首页'],top:['回','顶部'],back:['回','上一层'],search:['本站','搜索'],current:['分享','当前页'],contact:['联系','我们']};

  function ensureDock(){
    d.documentElement.setAttribute('data-qily-dock','enabled');
    var disabled=d.getElementById('qilyDockDisabledV54Style');if(disabled)disabled.remove();
    var dock=d.getElementById('floatDock');
    if(!dock){dock=d.createElement('div');dock.id='floatDock';dock.className='qily-float-dock';dock.setAttribute('aria-label','快捷服务');(d.body||d.documentElement).appendChild(dock);}
    dock.className='qily-float-dock';dock.hidden=false;dock.removeAttribute('aria-hidden');
    var fragment=d.createDocumentFragment();
    ORDER.forEach(function(action){
      var button=dock.querySelector('[data-action="'+action+'"]')||d.createElement('button');
      button.type='button';button.className='qily-float-btn qily-float-'+action;button.setAttribute('data-action',action);
      button.replaceChildren();
      var label=d.createElement('span');label.className='qily-dock-label';label.setAttribute('aria-hidden','true');
      LABELS[action].forEach(function(text){var row=d.createElement('span');row.textContent=text;label.appendChild(row);});
      button.appendChild(label);button.setAttribute('aria-label',LABELS[action].join(''));button.setAttribute('title',LABELS[action].join(''));
      fragment.appendChild(button);
    });
    dock.replaceChildren(fragment);dock.dataset.qilyStableOrder=ORDER.join(',');dock.dataset.qilyDdzSiteDock='v1.4.1';
    return dock;
  }

  function copyText(text){
    if(navigator.clipboard&&w.isSecureContext)return navigator.clipboard.writeText(text).catch(function(){return legacyCopy(text);});
    return legacyCopy(text);
  }
  function legacyCopy(text){var area=d.createElement('textarea');area.value=text;area.setAttribute('readonly','');area.style.position='fixed';area.style.left='-9999px';d.body.appendChild(area);area.select();try{d.execCommand('copy');}catch(_e){}area.remove();return Promise.resolve();}
  function toast(message){var node=d.getElementById('qilyDdzDockToastV141');if(!node){node=d.createElement('div');node.id='qilyDdzDockToastV141';node.setAttribute('role','status');node.style.cssText='position:fixed;left:50%;bottom:22px;z-index:2147483000;transform:translateX(-50%);padding:9px 14px;border-radius:999px;background:#073c47;color:#fff;font:800 14px/1.2 sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.22);pointer-events:none;opacity:0;transition:opacity .16s';d.body.appendChild(node);}node.textContent=message;node.style.opacity='1';clearTimeout(toast.timer);toast.timer=setTimeout(function(){node.style.opacity='0';},2200);}
  function openSearch(){
    if(w.QilySiteSearch&&typeof w.QilySiteSearch.open==='function'){w.QilySiteSearch.open();return;}
    var existing=d.getElementById('qilyDdzSearchRuntimeV141');if(existing)return;
    var script=d.createElement('script');script.id='qilyDdzSearchRuntimeV141';script.src='/site-search.js?v=20260826-search-navigation-v2';
    script.addEventListener('load',function(){if(w.QilySiteSearch&&typeof w.QilySiteSearch.open==='function')w.QilySiteSearch.open();else toast('本站搜索加载失败');},{once:true});
    script.addEventListener('error',function(){toast('本站搜索加载失败');},{once:true});d.body.appendChild(script);
  }
  function shareCurrent(){var title=d.title||'QilyLean',url=location.href,text=title+'\n'+url;if(navigator.share){navigator.share({title:title,text:title,url:url}).catch(function(error){if(error&&error.name==='AbortError')return;copyText(text).then(function(){toast('网页标题及网址已复制');});});return;}copyText(text).then(function(){toast('网页标题及网址已复制');});}
  function run(action){
    if(action==='home'){location.href='/';return;}
    if(action==='top'){w.scrollTo({top:0,left:0,behavior:'smooth'});return;}
    if(action==='back'){location.href='/';return;}
    if(action==='search'){openSearch();return;}
    if(action==='current'){shareCurrent();return;}
    if(action==='contact'){try{w.open('/contact/','_blank','noopener,noreferrer');}catch(_e){location.href='/contact/';}}
  }
  function bindDock(){
    var dock=ensureDock();
    if(dock.dataset.qilyDdzBound==='true')return;
    dock.dataset.qilyDdzBound='true';
    dock.addEventListener('click',function(event){var button=event.target.closest&&event.target.closest('.qily-float-btn[data-action]');if(!button||!dock.contains(button))return;event.preventDefault();run(button.getAttribute('data-action'));});
  }
  function reconcileDock(){bindDock();}
  function init(){
    d.body&&d.body.setAttribute('data-parent-route','/');
    reconcileDock();
    /* Historical Dock V5.4 may finish loading after this page adapter and remove the old immersive-page Dock.
       Four bounded reconciliations close that one-time race without a MutationObserver or permanent polling. */
    [180,520,1100,2200].forEach(function(delay){w.setTimeout(reconcileDock,delay);});
  }
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init,{once:true});else init();
  w.addEventListener('pageshow',reconcileDock,{passive:true});
})(document,window);
