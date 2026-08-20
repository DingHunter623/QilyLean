/* QilyLean 项目合作页轻量对齐与悬浮入口闭环 V9｜2026-08-20
 * 目标：
 * 1) 项目合作页直接使用已经物化的静态六类能力/边界，不再运行时重复插入正文；
 * 2) 悬浮“分享官网”与其它 Dock 按钮采用相同文字结构与字号继承；
 * 3) 删除延时重试，改用静态DOM就绪与shell-ready事件，避免首屏后再次改变布局。
 */
(function(d,w){
  'use strict';
  if(w.__qilyCoreServiceDockClosureV9)return;
  w.__qilyCoreServiceDockClosureV9=true;

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

  function ensureBackToTop(dock){
    var top=dock.querySelector('[data-action="top"]');
    if(!top){
      top=d.createElement('button');
      top.type='button';
      top.className='qily-float-btn qily-float-top';
      top.setAttribute('data-action','top');
    }
    top.setAttribute('aria-label','回顶部');
    top.setAttribute('title','回顶部');
    top.innerHTML='回<br>顶部';
    return top;
  }

  function bindBackToTop(top){
    if(top.dataset.qilyBound==='3')return;
    top.dataset.qilyBound='3';
    var startY=0,moved=false;
    function goTop(event){
      if(event){event.preventDefault();event.stopPropagation();}
      d.documentElement.scrollTop=0;
      d.body.scrollTop=0;
      w.scrollTo(0,0);
      w.requestAnimationFrame(function(){w.scrollTo(0,0);});
    }
    top.addEventListener('pointerdown',function(event){startY=event.clientY;moved=false;},{capture:true,passive:true});
    top.addEventListener('pointermove',function(event){if(Math.abs(event.clientY-startY)>8)moved=true;},{capture:true,passive:true});
    top.addEventListener('pointerup',function(event){if(!moved)goTop(event);},{capture:true,passive:false});
    top.addEventListener('click',goTop,true);
  }

  function normalizeDock(){
    var dock=d.getElementById('floatDock');
    if(!dock)return false;

    var top=ensureBackToTop(dock);
    var labels={
      home:{html:'首页',aria:'首页'},
      top:{html:'回<br>顶部',aria:'回顶部'},
      back:{html:'回<br>上一层',aria:'回上一层'},
      search:{html:'本站<br>搜索',aria:'本站搜索'},
      current:{html:'分享<br>当前页',aria:'分享当前页'},
      share:{html:'分享<br>官网',aria:'分享官网'},
      contact:{html:'交流',aria:'交流'}
    };
    var order=['home','top','back','search','current','share','contact'];

    var buttons=order.map(function(action){
      var button=action==='top'?top:dock.querySelector('[data-action="'+action+'"]');
      if(!button)return null;
      if(button.innerHTML!==labels[action].html)button.innerHTML=labels[action].html;
      if(button.getAttribute('aria-label')!==labels[action].aria)button.setAttribute('aria-label',labels[action].aria);
      if(button.getAttribute('title')!==labels[action].aria)button.setAttribute('title',labels[action].aria);
      return button;
    }).filter(Boolean);

    var current=Array.from(dock.children).filter(function(node){return node.matches&&node.matches('.qily-float-btn[data-action]');});
    var orderChanged=current.length!==buttons.length||buttons.some(function(button,index){return current[index]!==button;});
    if(orderChanged){
      var fragment=d.createDocumentFragment();
      buttons.forEach(function(button){fragment.appendChild(button);});
      dock.appendChild(fragment);
    }
    dock.dataset.qilyStableOrder=buttons.map(function(button){return button.getAttribute('data-action');}).join(',');
    bindBackToTop(top);
    return buttons.length===order.length;
  }

  var resizeTimer=0;
  function apply(){
    d.documentElement.classList.remove('qily-shell-pending','qily-first-paint-pending','qily-r2-first-paint-pending');
    alignCoreServices();
    normalizeDock();
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();
  d.addEventListener('qily:shell-ready',apply);
  w.addEventListener('resize',function(){
    if(resizeTimer)w.clearTimeout(resizeTimer);
    resizeTimer=w.setTimeout(alignCoreServices,100);
  },{passive:true});
})(document,window);
