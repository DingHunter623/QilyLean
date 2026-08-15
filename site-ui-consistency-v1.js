/* QilyLean 全站术语与父级导航防错闭环 v1｜2026-08-15 */
(function(d,w){
  'use strict';
  if(w.__qilyUiConsistencyV1)return;
  w.__qilyUiConsistencyV1=true;

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

    /* Times26001 与应用支持页：禁止按物理目录回退到不存在的 /tools/ 或 /legal/times26001/。 */
    if(/^\/legal\/times26001\/(?:privacy|terms)\/$/.test(path))return '/tools/times26001/';
    if(path==='/app-support/')return '/tools/times26001/';
    if(path.indexOf('/tools/')===0)return '/';

    /* 每日简报详情先返回简报目录，再返回知识资产。 */
    if(/^\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html$/.test(path))return '/qilylean/daily-insights.html';
    if(path==='/qilylean/daily-insights.html')return '/knowledge/';

    /* 制造改善佐证在线预览页先返回佐证总页。 */
    if(path.indexOf('/projects/lean-improvement-evidence/')===0&&path!=='/projects/lean-improvement-evidence/')return '/projects/lean-improvement-evidence/';

    /* 旧知识路径统一归入知识资产。 */
    if(/^\/qilylean\/(?:lean-knowledge|lean-tools|execution-loop|gbt2828|production-operations-organization|reference-[^/]+)\.html$/.test(path))return '/knowledge/';

    /* 一级栏目详情返回所属栏目。 */
    var roots=['projects','improvements','capabilities','experience','knowledge','moments','cooperation','links','trust'];
    for(var i=0;i<roots.length;i++){
      var root='/'+roots[i]+'/';
      if(path.indexOf(root)===0&&path!==root)return root;
    }

    /* 一级栏目本身返回首页。 */
    if(path==='/ai.html')return '/';
    for(var j=0;j<roots.length;j++)if(path==='/'+roots[j]+'/')return '/';

    /* 分享页、独立页及未归类路径统一安全回首页，不再推导不存在的父目录。 */
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

  /* 本脚本先于旧父级导航脚本加载，以捕获阶段优先阻止旧逻辑跳入不存在目录。 */
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
    var shouldNavigate=!pointer.moved;
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

  function normalizeTextValue(value){
    var text=String(value||'');
    if(!text||text.indexOf('官网')===-1)return text;
    text=text.replace(/官网(?=\s*https?:\/\/(?:www\.)?qilylean\.com)/g,'官方网址');
    text=text.replace(/官网(?=\s*(?:www\.)?qilylean\.com)/g,'官方网址');
    text=text.replace(/官网[：:](?=\s*(?:https?:\/\/)?(?:www\.)?qilylean\.com)/g,'官方网址：');
    text=text.replace(/官网地址/g,'官方网址');
    text=text.replace(/官网链接/g,'官方网址');
    text=text.replace(/访问官网/g,'访问官方网址');
    text=text.replace(/打开官网/g,'打开官方网址');
    text=text.replace(/前往官网/g,'前往官方网址');
    text=text.replace(/分享官网/g,'分享官方网址');
    text=text.replace(/官网与官网邮箱/g,'官方网址与官网邮箱');
    return text;
  }

  function normalizeTextNodes(root){
    if(!root)return;
    var walker=d.createTreeWalker(root,NodeFilter.SHOW_TEXT,null);
    var nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(function(node){
      var parent=node.parentElement;
      if(!parent||/^(SCRIPT|STYLE|TEXTAREA|CODE|PRE)$/.test(parent.tagName))return;
      var original=node.nodeValue||'';
      var trimmed=original.trim();
      var next=normalizeTextValue(original);
      if(trimmed==='官网'){
        var href=parent.closest&&parent.closest('a[href]');
        if(href){
          var value=href.getAttribute('href')||'';
          if(value==='/'||/^https?:\/\/(?:www\.)?qilylean\.com\/?$/.test(value))next=original.replace('官网','官方网址');
        }
      }
      if(next!==original)node.nodeValue=next;
    });
  }

  function normalizeAttributes(root){
    var scope=root&&root.querySelectorAll?root:d;
    scope.querySelectorAll('[aria-label],[title]').forEach(function(node){
      ['aria-label','title'].forEach(function(name){
        var value=node.getAttribute(name);
        if(!value)return;
        var next=normalizeTextValue(value);
        if(value==='分享官网')next='分享官方网址';
        if(next!==value)node.setAttribute(name,next);
      });
    });
  }

  function normalizeDock(){
    var dock=d.getElementById('floatDock');
    if(!dock)return;
    var back=dock.querySelector('[data-action="back"]');
    if(back){
      back.setAttribute('data-parent-route',parentRoute(location.pathname));
      back.setAttribute('title','返回当前页面所属的上一级有效页面');
      back.setAttribute('aria-label','返回上一级有效页面');
    }
    var share=dock.querySelector('[data-action="share"]');
    if(share){
      share.innerHTML='分享<br>官方网址';
      share.setAttribute('title','分享官方网址');
      share.setAttribute('aria-label','分享官方网址');
    }
  }

  function run(root){
    normalizeDock();
    normalizeTextNodes(root||d.body);
    normalizeAttributes(root||d);
  }

  function start(){
    run(d.body);
    var observer=new MutationObserver(function(records){
      records.forEach(function(record){
        Array.from(record.addedNodes||[]).forEach(function(node){
          if(node.nodeType===1)run(node);
          else if(node.nodeType===3&&node.parentElement)run(node.parentElement);
        });
      });
      normalizeDock();
    });
    observer.observe(d.documentElement,{childList:true,subtree:true});
    [180,600,1400,2800].forEach(function(delay){w.setTimeout(function(){run(d.body);},delay);});
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})(document,window);
