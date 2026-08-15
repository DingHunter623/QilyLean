/* QilyLean 轻量术语、父级导航与页面新鲜度防错 v2.5｜2026-08-15
 * 性能原则：不做全站 MutationObserver，不反复扫描正文，不重写整页 DOM。
 * 目标：统一悬浮栏“分享官方网址”、清理旧主导航“友情链接”，并在浏览器 BFCache 恢复旧页面时自动校正/刷新。
 */
(function(d,w){
  'use strict';
  if(w.__qilyUiConsistencyV2)return;
  w.__qilyUiConsistencyV2=true;

  var BUILD_ID='20260815-dock-label-v5';
  var BUILD_KEY='qily_site_ui_build_v1';
  var resizeTimer=0;

  d.documentElement.classList.remove('qily-shell-pending','qily-r2-first-paint-pending');

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

  function rememberBuild(){
    try{w.localStorage.setItem(BUILD_KEY,BUILD_ID);}catch(error){}
    d.documentElement.setAttribute('data-qily-ui-build',BUILD_ID);
  }

  function restoredBuildIsStale(){
    try{
      var active=w.localStorage.getItem(BUILD_KEY)||'';
      return !!active&&active!==BUILD_ID;
    }catch(error){return false;}
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
    var go=!pointer.moved;pointer=null;if(!go)return;
    handledAt=Date.now();event.preventDefault();event.stopImmediatePropagation();navigateParent();
  },true);
  d.addEventListener('pointercancel',function(event){if(pointer&&event.pointerId===pointer.id)pointer=null;},true);
  d.addEventListener('click',function(event){
    var button=event.target&&event.target.closest?event.target.closest('[data-action="back"]'):null;
    if(!button)return;
    event.preventDefault();event.stopImmediatePropagation();
    if(Date.now()-handledAt<600)return;navigateParent();
  },true);

  function ensureDockPolish(){
    if(d.getElementById('qilyDockOfficialUrlPolishV2'))return;
    var style=d.createElement('style');
    style.id='qilyDockOfficialUrlPolishV2';
    style.textContent=[
      '#floatDock [data-action="share"]{width:76px!important;min-width:76px!important;height:76px!important;min-height:76px!important;padding:7px 5px!important;border-radius:50%!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:1px!important;line-height:1!important;white-space:nowrap!important;overflow:hidden!important;box-sizing:border-box!important}',
      '#floatDock [data-action="share"] .qily-share-label-line{display:block!important;margin:0!important;padding:0!important;white-space:nowrap!important;text-align:center!important;line-height:1.04!important}',
      '#floatDock [data-action="share"] .qily-share-label-primary{font-size:16px!important}',
      '#floatDock [data-action="share"] .qily-share-label-url{font-size:12px!important;letter-spacing:-.02em!important}',
      '@media(max-width:640px){#floatDock [data-action="share"]{width:72px!important;min-width:72px!important;height:72px!important;min-height:72px!important;padding:6px 4px!important}#floatDock [data-action="share"] .qily-share-label-primary{font-size:15px!important}#floatDock [data-action="share"] .qily-share-label-url{font-size:11px!important;letter-spacing:-.01em!important}}'
    ].join('');
    (d.head||d.documentElement).appendChild(style);
  }

  function normalizePrimaryNav(){
    var path=normalizedPath(location.pathname);
    d.querySelectorAll('.qily-global-nav,nav.site-nav,nav.nav').forEach(function(nav){
      nav.querySelectorAll('a[href="/links/"],a[href="/links/index.html"]').forEach(function(link){
        /* 友情链接保留为独立资源页，但不再占用全站核心主导航。 */
        if(path.indexOf('/links/')!==0)link.remove();
      });
    });
  }

  function normalizeDock(){
    var dock=d.getElementById('floatDock');
    if(!dock)return false;
    ensureDockPolish();
    var back=dock.querySelector('[data-action="back"]');
    if(back){
      back.setAttribute('data-parent-route',parentRoute(location.pathname));
      back.setAttribute('title','返回当前页面所属的上一级有效页面');
      back.setAttribute('aria-label','返回上一级有效页面');
    }
    var share=dock.querySelector('[data-action="share"]');
    if(share){
      var html='<span class="qily-share-label-line qily-share-label-primary">分享</span><span class="qily-share-label-line qily-share-label-url">官方网址</span>';
      if(share.innerHTML!==html)share.innerHTML=html;
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
        var value=node.getAttribute&&node.getAttribute(name);if(!value)return;
        var next=value.replace(/分享官网/g,'分享官方网址').replace(/访问官网/g,'访问官方网址').replace(/打开官网/g,'打开官方网址').replace(/前往官网/g,'前往官方网址');
        if(next!==value)node.setAttribute(name,next);
      });
    });
  }

  function reconcile(){
    ensureDockPolish();
    normalizePrimaryNav();
    normalizeInteractiveLabels();
    normalizeDock();
  }

  function boot(){
    rememberBuild();
    reconcile();
    [120,450,1000,1800].forEach(function(delay){w.setTimeout(reconcile,delay);});
  }

  /* BFCache：若浏览器把旧版本 DOM 直接恢复出来，发现站点已有更新版本就自动重新取页。 */
  w.addEventListener('pageshow',function(event){
    if(event.persisted&&restoredBuildIsStale()){
      w.location.reload();
      return;
    }
    reconcile();
  });
  w.addEventListener('load',reconcile,{once:true});
  w.addEventListener('resize',function(){
    if(resizeTimer)w.clearTimeout(resizeTimer);
    resizeTimer=w.setTimeout(reconcile,80);
  },{passive:true});

  w.__qilyParentNavigationV3=true;
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(document,window);
