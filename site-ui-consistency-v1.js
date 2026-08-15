/* QilyLean 轻量术语与父级导航防错 v2｜2026-08-15
 * 性能原则：不做全站 MutationObserver，不反复扫描正文，不重写整页 DOM。
 * 仅处理悬浮栏与“返回上一层”必要交互，避免移动端/桌面端主线程卡死。
 */
(function(d,w){
  'use strict';
  if(w.__qilyUiConsistencyV2)return;
  w.__qilyUiConsistencyV2=true;

  function normalizedPath(path){
    var value=(path||'/').replace(/\/index\.html$/,'/').replace(/\/{2,}/g,'/');
    return value.length>1?value.replace(/\/+$/,'/'):'/';
  }

  function configuredParent(){
    var body=d.body;
    var value=(body&&body.getAttribute('data-parent-route'))||'';
    if(value)return value;
    var link=d.querySelector('link[rel="up"][href]');
    return link?link.getAttribute('href')||'':'';
  }

  function parentRoute(path){
    path=normalizedPath(path);
    var configured=configuredParent();
    if(configured)return configured;
    if(path==='/')return '/';

    if(/^\/legal\/times26001\/(?:privacy|terms)\/$/.test(path))return '/tools/times26001/';
    if(path==='/app-support/')return '/tools/times26001/';
    if(path.indexOf('/tools/')===0)return '/';

    if(/^\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html$/.test(path))return '/qilylean/daily-insights.html';
    if(path==='/qilylean/daily-insights.html')return '/knowledge/';

    if(path.indexOf('/projects/lean-improvement-evidence/')===0&&path!=='/projects/lean-improvement-evidence/')return '/projects/lean-improvement-evidence/';
    if(/^\/qilylean\/(?:lean-knowledge|lean-tools|execution-loop|gbt2828|production-operations-organization|reference-[^/]+)\.html$/.test(path))return '/knowledge/';

    var roots=['projects','improvements','capabilities','experience','knowledge','moments','cooperation','links','trust'];
    for(var i=0;i<roots.length;i++){
      var root='/'+roots[i]+'/';
      if(path.indexOf(root)===0&&path!==root)return root;
    }
    if(path==='/ai.html')return '/';
    for(var j=0;j<roots.length;j++)if(path==='/'+roots[j]+'/')return '/';
    return '/';
  }

  function navigateParent(){
    var target=parentRoute(location.pathname);
    if(normalizedPath(target)===normalizedPath(location.pathname))target='/';
    location.assign(target);
  }

  var pointer=null;
  var handledAt=0;

  d.addEventListener('pointerdown',function(event){
    var button=event.target&&event.target.closest?event.target.closest('[data-action="back"]'):null;
    if(!button)return;
    pointer={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};
  },true);

  d.addEventListener('pointermove',function(event){
    if(!pointer||event.pointerId!==pointer.id)return;
    if(Math.abs(event.clientX-pointer.x)>8||Math.abs(event.clientY-pointer.y)>8)pointer.moved=true;
  },true);

  d.addEventListener('pointerup',function(event){
    if(!pointer||event.pointerId!==pointer.id)return;
    var go=!pointer.moved;
    pointer=null;
    if(!go)return;
    handledAt=Date.now();
    event.preventDefault();
    event.stopImmediatePropagation();
    navigateParent();
  },true);

  d.addEventListener('pointercancel',function(event){
    if(pointer&&event.pointerId===pointer.id)pointer=null;
  },true);

  d.addEventListener('click',function(event){
    var button=event.target&&event.target.closest?event.target.closest('[data-action="back"]'):null;
    if(!button)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if(Date.now()-handledAt<600)return;
    navigateParent();
  },true);

  function normalizeDock(){
    var dock=d.getElementById('floatDock');
    if(!dock)return false;
    var back=dock.querySelector('[data-action="back"]');
    if(back){
      back.setAttribute('data-parent-route',parentRoute(location.pathname));
      back.setAttribute('title','返回当前页面所属的上一级有效页面');
      back.setAttribute('aria-label','返回上一级有效页面');
    }
    var share=dock.querySelector('[data-action="share"]');
    if(share){
      var current=(share.textContent||'').replace(/\s+/g,'');
      if(current!=='分享官方网址')share.innerHTML='分享<br>官方网址';
      share.setAttribute('title','分享官方网址');
      share.setAttribute('aria-label','分享官方网址');
    }
    return true;
  }

  function normalizeInteractiveLabels(){
    d.querySelectorAll('a,button,[aria-label],[title]').forEach(function(node){
      if(node.childElementCount===0){
        var text=node.textContent||'';
        if(text.trim()==='官网')node.textContent=text.replace('官网','官方网址');
        else if(text.trim()==='分享官网')node.textContent=text.replace('分享官网','分享官方网址');
      }
      ['aria-label','title'].forEach(function(name){
        var value=node.getAttribute&&node.getAttribute(name);
        if(!value)return;
        var next=value.replace(/分享官网/g,'分享官方网址').replace(/访问官网/g,'访问官方网址').replace(/打开官网/g,'打开官方网址').replace(/前往官网/g,'前往官方网址');
        if(next!==value)node.setAttribute(name,next);
      });
    });
  }

  function boot(){
    normalizeInteractiveLabels();
    if(!normalizeDock()){
      /* 只做少量定时重试，不监听全站 DOM 变化。 */
      [120,450,1000].forEach(function(delay){w.setTimeout(normalizeDock,delay);});
    }
  }

  /* 已在本脚本实现父级导航，阻止后续再加载体量较大的旧 parent-navigation-v3 运行时。 */
  w.__qilyParentNavigationV3=true;

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})(document,window);
