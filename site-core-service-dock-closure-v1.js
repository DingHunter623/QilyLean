/* QilyLean 项目合作页轻量对齐 V10.5｜2026-08-28
 * R7 single-responsibility correction:
 * - this runtime only aligns cooperation service-card rows;
 * - Dock/contact markup and behavior are owned exclusively by Dock V5 + site-navigation-core;
 * - #wxMask must never be removed here.
 */
(function(d,w){
  'use strict';
  if(w.__qilyCoreServiceAlignmentV105)return;
  w.__qilyCoreServiceAlignmentV105=true;
  w.__qilyCoreServiceDockClosureV104=true;
  w.__qilyCoreServiceDockClosureV103=true;

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
    cards.forEach(function(card){selectors.forEach(function(selector){var node=directChild(card,selector);if(node)node.style.minHeight='';});});
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

  function apply(){
    d.documentElement.classList.remove('qily-shell-pending','qily-first-paint-pending','qily-r2-first-paint-pending','qily-stale-document');
    alignCoreServices();
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  d.addEventListener('qily:shell-ready',apply);
  w.addEventListener('resize',alignCoreServices,{passive:true});
  w.addEventListener('pageshow',alignCoreServices,{passive:true});
})(document,window);
