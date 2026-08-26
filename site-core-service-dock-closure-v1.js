/* QilyLean 项目合作页轻量对齐与悬浮入口闭环 V10.4｜2026-08-26
 * 恢复永久六项 Dock 合同：home/top/back/search/current/contact。
 * 联系入口显示“联系我们”，仍保留 data-action="contact"，由核心/恢复运行时直接跳转 /contact/。
 */
(function(d,w){
  'use strict';
  if(w.__qilyCoreServiceDockClosureV104)return;
  w.__qilyCoreServiceDockClosureV104=true;
  w.__qilyCoreServiceDockClosureV103=true;
  function sourceMode(){return (d.documentElement.getAttribute('data-qily-language')||'zh-CN')==='zh-CN'}
  function groupByVisualRow(nodes){var rows=[];nodes.forEach(function(node){var top=Math.round(node.getBoundingClientRect().top);var row=rows.find(function(item){return Math.abs(item.top-top)<=6;});if(!row){row={top:top,nodes:[]};rows.push(row);}row.nodes.push(node);});return rows;}
  function directChild(card,selector){try{return card.querySelector(':scope > '+selector);}catch(error){return card.querySelector(selector);}}
  function alignCoreServices(){
    var cards=Array.from(d.querySelectorAll('.cooperation-page #services .service-card'));if(!cards.length)return;
    var selectors=['.service-heading-link','p','.scope-list','.module-result','.service-contract'];
    cards.forEach(function(card){selectors.forEach(function(selector){var node=directChild(card,selector);if(node)node.style.minHeight='';});});
    if(w.innerWidth<=820)return;
    groupByVisualRow(cards).forEach(function(row){if(row.nodes.length<2)return;selectors.forEach(function(selector){var nodes=row.nodes.map(function(card){return directChild(card,selector);}).filter(Boolean);if(nodes.length<2)return;var max=Math.max.apply(null,nodes.map(function(node){return Math.ceil(node.getBoundingClientRect().height);}));nodes.forEach(function(node){node.style.minHeight=max+'px';});});});
  }
  function ensureBackToTop(dock){var top=dock.querySelector('[data-action="top"]');if(!top){top=d.createElement('button');top.type='button';top.className='qily-float-btn qily-float-top';top.setAttribute('data-action','top');dock.appendChild(top);}if(sourceMode()){top.setAttribute('aria-label','回顶部');top.setAttribute('title','回顶部');top.innerHTML='回<br>顶部';}return top;}
  function bindBackToTop(top){if(top.dataset.qilyBound==='4')return;top.dataset.qilyBound='4';top.addEventListener('click',function(event){event.preventDefault();event.stopPropagation();d.documentElement.scrollTop=0;d.body.scrollTop=0;w.scrollTo(0,0);},true);}
  function normalizeDock(){
    var dock=d.getElementById('floatDock');if(!dock)return false;
    var legacyMask=d.getElementById('wxMask');if(legacyMask)legacyMask.remove();
    var migrated=dock.querySelector('[data-action="contact-page"]');if(migrated)migrated.setAttribute('data-action','contact');
    var top=ensureBackToTop(dock);
    var labels={home:{html:'首页',aria:'首页'},top:{html:'回<br>顶部',aria:'回顶部'},back:{html:'回<br>上一层',aria:'回上一层'},search:{html:'本站<br>搜索',aria:'本站搜索'},current:{html:'分享<br>当前页',aria:'分享当前页'},contact:{html:'联系<br>我们',aria:'联系我们'}};
    var order=['home','top','back','search','current','contact'];var enforceChinese=sourceMode();
    dock.querySelectorAll('[data-action="share"]').forEach(function(button){button.remove();});
    var buttons=order.map(function(action){var button=action==='top'?top:dock.querySelector('[data-action="'+action+'"]');if(!button)return null;if(enforceChinese){button.innerHTML=labels[action].html;button.setAttribute('aria-label',labels[action].aria);button.setAttribute('title',labels[action].aria);}return button;}).filter(Boolean);
    var fragment=d.createDocumentFragment();buttons.forEach(function(button){fragment.appendChild(button);});dock.appendChild(fragment);
    dock.dataset.qilyStableOrder=order.join(',');bindBackToTop(top);return buttons.length===order.length;
  }
  function apply(){d.documentElement.classList.remove('qily-shell-pending','qily-first-paint-pending','qily-r2-first-paint-pending','qily-stale-document');alignCoreServices();normalizeDock();}
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  d.addEventListener('qily:shell-ready',apply);d.addEventListener('qily:language-change',normalizeDock);w.addEventListener('pageshow',normalizeDock,{passive:true});
})(document,window);
