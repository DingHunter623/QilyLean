/* QilyLean 悬浮栏“返回上一层”父级路由规范 v2｜2026-08-03 */
(function(d,w){
  'use strict';
  if(w.__qilyParentNavigationV2)return;
  w.__qilyParentNavigationV2=true;

  function normalizedPath(path){
    var value=(path||'/').replace(/\/index\.html$/,'/');
    value=value.replace(/\/{2,}/g,'/');
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

    /* 每日简报详情先返回简报目录，再由目录返回知识分享。 */
    if(/^\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html$/.test(path))return '/qilylean/daily-insights.html';
    if(path==='/qilylean/daily-insights.html')return '/knowledge/';

    /* 制造改善佐证的在线预览页先返回佐证总页。 */
    if(path.indexOf('/projects/lean-improvement-evidence/')===0&&path!=='/projects/lean-improvement-evidence/'){
      return '/projects/lean-improvement-evidence/';
    }

    /* QilyLean旧路径知识资产统一归入知识分享。 */
    if(/^\/qilylean\/(?:lean-knowledge|lean-tools|execution-loop|gbt2828|production-operations-organization|reference-[^/]+)\.html$/.test(path)){
      return '/knowledge/';
    }

    /* 各一级栏目详情页返回所属栏目首页。 */
    if(path.indexOf('/projects/')===0&&path!=='/projects/')return '/projects/';
    if(path.indexOf('/improvements/')===0&&path!=='/improvements/')return '/improvements/';
    if(path.indexOf('/capabilities/')===0&&path!=='/capabilities/')return '/capabilities/';
    if(path.indexOf('/experience/')===0&&path!=='/experience/')return '/experience/';
    if(path.indexOf('/knowledge/')===0&&path!=='/knowledge/')return '/knowledge/';
    if(path.indexOf('/moments/')===0&&path!=='/moments/')return '/moments/';
    if(path.indexOf('/cooperation/')===0&&path!=='/cooperation/')return '/cooperation/';
    if(path.indexOf('/links/')===0&&path!=='/links/')return '/links/';
    if(path.indexOf('/trust/')===0&&path!=='/trust/')return '/trust/';

    /* 一级栏目本身的上一层为首页。 */
    if([
      '/ai.html','/capabilities/','/experience/','/projects/','/improvements/',
      '/knowledge/','/moments/','/cooperation/','/links/','/trust/'
    ].indexOf(path)!==-1)return '/';

    /* 未归类的多级路径按目录层级回退，避免直接跳首页。 */
    var clean=path.replace(/\/$/,'');
    var slash=clean.lastIndexOf('/');
    if(slash>0)return clean.slice(0,slash+1);
    return '/';
  }

  function isBackButton(target){
    return target&&target.closest?target.closest('[data-action="back"]'):null;
  }

  function navigateParent(){
    var target=parentRoute(location.pathname);
    if(normalizedPath(target)===normalizedPath(location.pathname))target='/';
    location.href=target;
  }

  var pointer=null;
  var handledAt=0;

  d.addEventListener('pointerdown',function(event){
    var button=isBackButton(event.target);
    if(!button)return;
    pointer={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};
  },true);

  d.addEventListener('pointermove',function(event){
    if(!pointer||event.pointerId!==pointer.id)return;
    if(Math.abs(event.clientX-pointer.x)>8||Math.abs(event.clientY-pointer.y)>8)pointer.moved=true;
  },true);

  d.addEventListener('pointerup',function(event){
    if(!pointer||event.pointerId!==pointer.id)return;
    var shouldNavigate=!pointer.moved&&!!isBackButton(event.target);
    pointer=null;
    if(!shouldNavigate)return;
    handledAt=Date.now();
    event.preventDefault();
    event.stopImmediatePropagation();
    navigateParent();
  },true);

  d.addEventListener('pointercancel',function(event){
    if(pointer&&event.pointerId===pointer.id)pointer=null;
  },true);

  d.addEventListener('click',function(event){
    var button=isBackButton(event.target);
    if(!button)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if(Date.now()-handledAt<600)return;
    navigateParent();
  },true);

  function labelButton(){
    var button=d.querySelector('[data-action="back"]');
    if(!button)return false;
    button.setAttribute('title','返回当前页面所属的上一级栏目');
    button.setAttribute('aria-label','返回上一级栏目');
    button.setAttribute('data-parent-route',parentRoute(location.pathname));
    return true;
  }

  if(!labelButton()){
    var observer=new MutationObserver(function(){
      if(labelButton())observer.disconnect();
    });
    observer.observe(d.documentElement,{childList:true,subtree:true});
    setTimeout(function(){observer.disconnect();},6000);
  }
})(document,window);
