/* QilyLean 三大核心业务对齐与悬浮入口精确排序闭环｜2026-08-04 */
(function(d,w){
  'use strict';
  if(w.__qilyCoreServiceDockClosureV3)return;
  w.__qilyCoreServiceDockClosureV3=true;

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

  function normalizeDock(){
    var dock=d.getElementById('floatDock');
    if(!dock)return;

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

    order.forEach(function(action){
      var button=action==='top'?top:dock.querySelector('[data-action="'+action+'"]');
      if(!button)return;
      button.innerHTML=labels[action].html;
      button.setAttribute('aria-label',labels[action].aria);
      button.setAttribute('title',labels[action].aria);
      dock.appendChild(button);
    });

    bindBackToTop(top);
  }

  function apply(){alignCoreServices();normalizeDock();}

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
