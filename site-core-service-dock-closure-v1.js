/* QilyLean 三大核心业务对齐与悬浮入口增补闭环｜2026-08-04 */
(function(d,w){
  'use strict';
  if(w.__qilyCoreServiceDockClosureV2)return;
  w.__qilyCoreServiceDockClosureV2=true;

  function groupByVisualRow(nodes){
    var rows=[];
    nodes.forEach(function(node){
      var top=Math.round(node.getBoundingClientRect().top);
      var row=rows.find(function(item){return Math.abs(item.top-top)<=6;});
      if(!row){row={top:top,nodes:[]};rows.push(row);}
      row.nodes.push(node);
    });
    return rows;
  }

  function directChild(card,selector){
    try{return card.querySelector(':scope > '+selector);}catch(error){return card.querySelector(selector);}
  }

  function alignCoreServices(){
    var cards=Array.from(d.querySelectorAll('.cooperation-page #services .service-card'));
    if(!cards.length)return;
    var selectors=['.service-heading-link','p','.scope-list','.module-result','.service-contract'];
    cards.forEach(function(card){
      selectors.forEach(function(selector){
        var node=directChild(card,selector);
        if(node)node.style.minHeight='';
      });
    });
    if(w.innerWidth<=820)return;
    groupByVisualRow(cards).forEach(function(row){
      if(row.nodes.length<2)return;
      selectors.forEach(function(selector){
        var nodes=row.nodes.map(function(card){return directChild(card,selector);}).filter(Boolean);
        if(nodes.length<2)return;
        var max=Math.max.apply(null,nodes.map(function(node){return Math.ceil(node.getBoundingClientRect().height);}));
        nodes.forEach(function(node){node.style.minHeight=max+'px';});
      });
    });
  }

  function addBackToTop(){
    var dock=d.getElementById('floatDock');
    if(!dock)return;

    var home=dock.querySelector('[data-action="home"]');
    var top=dock.querySelector('[data-action="top"]');
    if(!top){
      top=d.createElement('button');
      top.type='button';
      top.className='qily-float-btn qily-float-top';
      top.setAttribute('data-action','top');
      top.setAttribute('aria-label','回到页面顶部');
      top.innerHTML='回到<br>顶部';
    }

    /* 只在“首页”后新增“回顶部”，不得删除、替换或重排任何原有功能。 */
    if(home&&home.parentNode===dock){
      dock.insertBefore(top,home.nextSibling);
    }else if(top.parentNode!==dock){
      dock.insertBefore(top,dock.firstChild);
    }

    if(top.dataset.qilyBound==='1')return;
    top.dataset.qilyBound='1';
    var startY=0;
    var moved=false;
    top.addEventListener('pointerdown',function(event){startY=event.clientY;moved=false;},{capture:true,passive:true});
    top.addEventListener('pointermove',function(event){if(Math.abs(event.clientY-startY)>8)moved=true;},{capture:true,passive:true});
    top.addEventListener('pointerup',function(){if(!moved)w.scrollTo({top:0,behavior:'smooth'});},{capture:true,passive:true});
    top.addEventListener('click',function(event){
      if(event.detail===0){event.preventDefault();w.scrollTo({top:0,behavior:'smooth'});}
    },true);
  }

  function apply(){alignCoreServices();addBackToTop();}

  var queued=false;
  function queue(){
    if(queued)return;
    queued=true;
    w.requestAnimationFrame(function(){queued=false;apply();});
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',queue,{once:true});
  else queue();
  w.addEventListener('load',queue,{once:true});
  w.addEventListener('resize',queue,{passive:true});
  if('ResizeObserver'in w){
    var resizeObserver=new ResizeObserver(queue);
    resizeObserver.observe(d.documentElement);
  }
  var observer=new MutationObserver(queue);
  observer.observe(d.documentElement,{childList:true,subtree:true});
  [60,220,700,1600].forEach(function(delay){w.setTimeout(queue,delay);});
})(document,window);
