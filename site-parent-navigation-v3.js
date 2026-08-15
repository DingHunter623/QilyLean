/* QilyLean 悬浮栏父级导航轻量版 v4｜2026-08-15
 * 仅负责“返回上一层”与导航当前态；禁止运行时重写首页、插入区块、循环扫描 DOM。
 */
(function(d,w){
  'use strict';
  if(w.__qilyParentNavigationV3)return;
  w.__qilyParentNavigationV3=true;

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

  function labelBack(){
    var button=d.querySelector('[data-action="back"]');
    if(!button)return false;
    button.setAttribute('title','返回当前页面所属的上一级有效页面');
    button.setAttribute('aria-label','返回上一级有效页面');
    button.setAttribute('data-parent-route',parentRoute(location.pathname));
    return true;
  }

  function markCurrentNav(){
    var path=normalizedPath(location.pathname);
    var routes=['/','/experience/','/capabilities/','/improvements/','/projects/','/trust/','/cooperation/','/knowledge/'];
    var current='/';
    for(var i=1;i<routes.length;i++)if(path.indexOf(routes[i])===0){current=routes[i];break;}
    d.querySelectorAll('.qily-global-nav a[href],nav.site-nav a[href]').forEach(function(link){
      var href=normalizedPath(link.getAttribute('href')||'');
      if(href===current)link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });
  }

  function boot(){
    markCurrentNav();
    if(!labelBack()){
      w.setTimeout(labelBack,160);
      w.setTimeout(labelBack,600);
    }
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})(document,window);
