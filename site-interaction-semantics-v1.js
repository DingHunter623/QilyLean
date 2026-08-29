/* QilyLean Interaction Semantics Runtime V1.4｜2026-08-29
 * Classifies public UI by actual behavior instead of visual appearance.
 * Route navigation => explicit feedback; local controls => light feedback;
 * static terminology/tools/vocabulary => no fake link feedback.
 * V1.4 also owns a persistent, draggable primary-navigation scroll rail plus
 * a click-suppression guard for pointer drags started on navigation text, so
 * overflow is visible on desktop/mobile even when the OS hides native scrollbars.
 */
(function(d,w){
  'use strict';
  if(w.__qilyInteractionSemanticsV14)return;
  w.__qilyInteractionSemanticsV14=true;
  w.__qilyInteractionSemanticsV13=true;
  w.__qilyInteractionSemanticsV12=true;
  w.__qilyInteractionSemanticsV11=true;
  w.__qilyInteractionSemanticsV1=true;

  var STATIC_SELECTOR=[
    '.tag','.tags>span','.tags>li','.chip','.chips>span','.chips>li','.pill','.badge',
    '.term','.term-chip','.qily-term-chip','.method-chip','.qily-method-chip',
    '.topic-chip','.keyword','.keyword-chip','.taxonomy-chip','.label-chip',
    '.tech-tag','.tool-tag','.method-tag','.glossary-tag','.topic-tag',
    '.brief-action-strip>span','.brief-action-strip>li','.tag-row>span','.tag-row>li',
    '.brief-tags>span','.brief-tags>li','.term-row>span','[data-qily-static-token]'
  ].join(',');
  var PRIMARY_NAV_SELECTOR='header.qily-site-header nav.site-nav,header.qily-site-header nav.qily-global-nav,header.qily-global-header nav.site-nav,header.qily-global-header nav.qily-global-nav,header nav[aria-label="主导航"],header nav[aria-label="网站导航"],header nav[aria-label="QilyLean核心导视"]';

  var PROJECT_EVIDENCE={
    '/projects/smed-300t/':{level:'B',label:'已验证',reason:'改善前后数据与验证方法已公开'},
    '/projects/fuse-improvement/':{level:'B',label:'已验证',reason:'质量结果与验证方法已公开'},
    '/projects/mold-warehouse/':{level:'C',label:'阶段估算',reason:'工程结果公开，综合收益仍需受控复算'},
    '/projects/automotive-lean/':{level:'D',label:'经验陈述',reason:'公开页以方法、数据结构与验证路径为主'},
    '/projects/factory-layout/':{level:'D',label:'经验陈述',reason:'公开页用于说明规划方法与交付范围'},
    '/projects/digital-factory/':{level:'D',label:'经验陈述',reason:'公开页用于说明数据治理与工程方法'},
    '/projects/visual-management/':{level:'D',label:'经验陈述',reason:'公开页用于说明目视化设计与运行机制'}
  };

  function normalizedPath(value){
    var path=(value||'/').split('?')[0].split('#')[0].replace(/\/index\.html$/,'/').replace(/\/{2,}/g,'/');
    if(path.length>1&&path.charAt(path.length-1)!=='/'&&!/\/[^/]+\.[^/]+$/.test(path))path+='/';
    return path;
  }
  function cleanHref(node){var href=(node.getAttribute&&node.getAttribute('href'))||'';return href.trim();}
  function isRealRoute(node){
    if(!node||node.nodeType!==1)return false;
    if(node.matches('a[href]')){
      var href=cleanHref(node);
      if(!href||href==='#'||href.indexOf('javascript:')===0||href.charAt(0)==='#')return false;
      return true;
    }
    return node.hasAttribute('data-route')||node.hasAttribute('data-href')||node.hasAttribute('data-url')||node.hasAttribute('data-external-url');
  }
  function isLocalControl(node){return !!(node&&node.nodeType===1&&node.matches('button,[role="button"],[data-tab],[data-toggle],[aria-controls]'));}
  function freezeStaticVisual(node){
    if(node.dataset.qilyStaticVisualFrozen==='v1')return;
    var cs=w.getComputedStyle?getComputedStyle(node):null;
    if(cs){
      node.style.setProperty('--qily-static-bg',cs.backgroundColor||'transparent');
      node.style.setProperty('--qily-static-bg-image',cs.backgroundImage||'none');
      node.style.setProperty('--qily-static-border',cs.borderColor||'transparent');
      node.style.setProperty('--qily-static-color',cs.color||'inherit');
      node.style.setProperty('--qily-static-shadow',cs.boxShadow||'none');
    }
    node.dataset.qilyStaticVisualFrozen='v1';
  }
  function classifyNode(node){
    if(!node||node.nodeType!==1)return;
    if(node.closest&&node.closest('#floatDock'))return;
    if(isRealRoute(node)){
      node.setAttribute('data-qily-interaction','route');
      node.classList.add('qily-route-action');
      node.classList.remove('qily-static-token');
      return;
    }
    if(isLocalControl(node)){
      if(!node.hasAttribute('data-qily-interaction'))node.setAttribute('data-qily-interaction','local');
      return;
    }
    if(node.matches&&node.matches(STATIC_SELECTOR)){
      freezeStaticVisual(node);
      node.setAttribute('data-qily-interaction','static');
      node.classList.add('qily-static-token');
      node.removeAttribute('tabindex');
      if(node.getAttribute('role')==='button')node.removeAttribute('role');
    }
  }
  function scan(root){
    root=root||d;
    if(root.nodeType===1)classifyNode(root);
    root.querySelectorAll&&root.querySelectorAll('a[href],[data-route],[data-href],[data-url],[data-external-url],button,[role="button"],[data-tab],[data-toggle],[aria-controls],'+STATIC_SELECTOR).forEach(classifyNode);
  }

  function railGeometry(nav,rail){
    var header=nav.closest('header');if(!header)return;
    var nr=nav.getBoundingClientRect(),hr=header.getBoundingClientRect();
    rail.style.left=Math.max(0,nr.left-hr.left)+'px';
    rail.style.width=Math.max(0,nr.width)+'px';
  }
  function syncRail(nav,rail,thumb){
    railGeometry(nav,rail);
    var track=Math.max(0,rail.clientWidth),scrollWidth=Math.max(nav.scrollWidth,nav.clientWidth),maxScroll=Math.max(0,scrollWidth-nav.clientWidth);
    var thumbWidth=maxScroll>0?Math.max(56,track*(nav.clientWidth/scrollWidth)):track;
    thumbWidth=Math.min(track,thumbWidth);
    var maxLeft=Math.max(0,track-thumbWidth),left=maxScroll>0?(nav.scrollLeft/maxScroll)*maxLeft:0;
    thumb.style.width=thumbWidth+'px';thumb.style.transform='translateX('+left+'px)';
    rail.setAttribute('data-qily-nav-overflow',maxScroll>1?'true':'false');
    rail.setAttribute('aria-valuenow',String(Math.round(maxScroll>0?(nav.scrollLeft/maxScroll)*100:0)));
  }
  function installPrimaryNavRail(nav){
    if(!nav||nav.dataset.qilyNavScrollRail==='v1.4')return;
    var header=nav.closest('header');if(!header)return;
    var previous=header.querySelector('.qily-primary-nav-scroll-rail');if(previous)previous.remove();
    nav.dataset.qilyNavScrollRail='v1.4';
    var rail=d.createElement('div');rail.className='qily-primary-nav-scroll-rail';rail.setAttribute('role','scrollbar');rail.setAttribute('aria-label','一级导航左右滑动条');rail.setAttribute('aria-orientation','horizontal');rail.setAttribute('aria-valuemin','0');rail.setAttribute('aria-valuemax','100');rail.setAttribute('aria-valuenow','0');
    var thumb=d.createElement('span');thumb.className='qily-primary-nav-scroll-thumb';thumb.setAttribute('aria-hidden','true');rail.appendChild(thumb);header.appendChild(rail);
    var sync=function(){w.requestAnimationFrame(function(){syncRail(nav,rail,thumb);});};
    nav.addEventListener('scroll',sync,{passive:true});
    rail.addEventListener('click',function(event){
      if(event.target===thumb)return;
      var rect=rail.getBoundingClientRect(),maxScroll=Math.max(0,nav.scrollWidth-nav.clientWidth);if(maxScroll<=0)return;
      var ratio=Math.max(0,Math.min(1,(event.clientX-rect.left)/Math.max(1,rect.width)));nav.scrollTo({left:ratio*maxScroll,behavior:'smooth'});
    });
    thumb.addEventListener('pointerdown',function(event){
      if(nav.scrollWidth<=nav.clientWidth)return;
      event.preventDefault();event.stopPropagation();
      var startX=event.clientX,startScroll=nav.scrollLeft,trackWidth=Math.max(1,rail.clientWidth-thumb.getBoundingClientRect().width),maxScroll=Math.max(1,nav.scrollWidth-nav.clientWidth);
      thumb.setPointerCapture&&thumb.setPointerCapture(event.pointerId);
      function move(e){var dx=e.clientX-startX;nav.scrollLeft=startScroll+(dx/trackWidth)*maxScroll;}
      function end(e){thumb.removeEventListener('pointermove',move);thumb.removeEventListener('pointerup',end);thumb.removeEventListener('pointercancel',end);try{thumb.releasePointerCapture&&thumb.releasePointerCapture(e.pointerId);}catch(error){}}
      thumb.addEventListener('pointermove',move);thumb.addEventListener('pointerup',end);thumb.addEventListener('pointercancel',end);
    });
    sync();setTimeout(sync,120);setTimeout(sync,700);
  }
  function installPrimaryNavDragGuard(nav){
    if(!nav||nav.dataset.qilyNavDragGuard==='v1')return;
    nav.dataset.qilyNavDragGuard='v1';
    var active=false,moved=false,startX=0,startY=0,startScroll=0,suppressUntil=0,pointerId=null;
    nav.addEventListener('pointerdown',function(event){
      if(event.button!==0||event.target.closest('select,option,input,button'))return;
      active=true;moved=false;pointerId=event.pointerId;startX=event.clientX;startY=event.clientY;startScroll=nav.scrollLeft;
    });
    nav.addEventListener('pointermove',function(event){
      if(!active||event.pointerId!==pointerId)return;
      var dx=event.clientX-startX,dy=event.clientY-startY;
      if(!moved&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){moved=true;nav.classList.add('qily-nav-pointer-dragging');}
      if(!moved)return;
      if(event.pointerType==='mouse'){event.preventDefault();nav.scrollLeft=startScroll-dx;}
    },{passive:false});
    function finish(event){
      if(!active||(event&&event.pointerId!==pointerId))return;
      if(moved)suppressUntil=w.performance.now()+320;
      active=false;moved=false;pointerId=null;nav.classList.remove('qily-nav-pointer-dragging');
    }
    nav.addEventListener('pointerup',finish);
    nav.addEventListener('pointercancel',finish);
    nav.addEventListener('click',function(event){
      if(w.performance.now()>suppressUntil||!event.target.closest('a[href]'))return;
      event.preventDefault();event.stopImmediatePropagation();
    },true);
  }
  function installPrimaryNavRails(){d.querySelectorAll(PRIMARY_NAV_SELECTOR).forEach(function(nav){installPrimaryNavRail(nav);installPrimaryNavDragGuard(nav);});}
  function syncPrimaryNavRails(){d.querySelectorAll(PRIMARY_NAV_SELECTOR).forEach(function(nav){var header=nav.closest('header'),rail=header&&header.querySelector('.qily-primary-nav-scroll-rail');if(rail){var thumb=rail.querySelector('.qily-primary-nav-scroll-thumb');if(thumb)syncRail(nav,rail,thumb);}});}
  if(!w.__qilyPrimaryNavRailResizeV1){w.__qilyPrimaryNavRailResizeV1=true;w.addEventListener('resize',syncPrimaryNavRails,{passive:true});}

  function evidenceMarkup(meta,compact){
    var link=d.createElement('a');
    link.href='/trust/#evidence-levels';
    link.className=(compact?'qily-project-list-grade ':'qily-project-evidence-grade ')+'qily-grade-'+meta.level.toLowerCase();
    link.setAttribute('data-qily-project-evidence',meta.level);
    link.setAttribute('aria-label','证据等级 '+meta.level+' '+meta.label+'，查看证据分级口径');
    var badge=d.createElement('b');badge.textContent=meta.level;link.appendChild(badge);
    var text=d.createElement('span');text.textContent='证据等级：'+meta.label;link.appendChild(text);
    if(!compact){var note=d.createElement('small');note.textContent=meta.reason+'｜查看分级口径 →';link.appendChild(note);}
    return link;
  }

  function injectProjectDetailGrade(){
    var path=normalizedPath(w.location.pathname),meta=PROJECT_EVIDENCE[path];
    if(!meta||d.querySelector('[data-qily-project-evidence]'))return;
    var hero=d.querySelector('.module-hero .module-inner,.module-hero');
    if(!hero)return;
    var title=hero.querySelector('h1');if(!title)return;
    title.insertAdjacentElement('afterend',evidenceMarkup(meta,false));
  }

  function injectProjectListGrades(){
    if(normalizedPath(w.location.pathname)!=='/projects/')return;
    d.querySelectorAll('.project-list-card').forEach(function(card){
      if(card.querySelector('[data-qily-project-evidence]'))return;
      var route=card.querySelector('.module-actions a[href^="/projects/"]');if(!route)return;
      var meta=PROJECT_EVIDENCE[normalizedPath(route.getAttribute('href'))];if(!meta)return;
      var content=card.querySelector('.project-list-content')||card;
      var small=content.querySelector('small');
      if(small)small.insertAdjacentElement('afterend',evidenceMarkup(meta,true));else content.insertBefore(evidenceMarkup(meta,true),content.firstChild);
    });
  }

  function trustLink(href,label){var a=d.createElement('a');a.href=href;a.textContent=label+' →';return a;}
  function addTrustLinks(){
    if(normalizedPath(w.location.pathname)!=='/trust/')return;
    var section=d.getElementById('evidence-levels');if(!section||section.dataset.qilyEvidenceLinks==='v1')return;
    var levels=section.querySelectorAll('.trust-level');if(levels.length<4)return;
    var groups=[
      {note:'当前公开项目暂无可公开 A 级归属；A级仅在正式核定记录满足公开条件后列入。',links:[['/projects/qilylean-commercial-deliveries/','查看A级公开条件与商业交付档案']]},
      {note:'当前公开归属：具备改善前后数据或过程验证的历史项目。',links:[['/projects/smed-300t/','300T冲压机SMED'],['/projects/fuse-improvement/','保险丝工艺改善']]},
      {note:'当前公开归属：工程结果可展示，但综合收益仍须结合原始核算资料复算。',links:[['/projects/mold-warehouse/','智能模具库']]},
      {note:'当前公开归属：主要用于说明经历、方法、范围与工程实践。',links:[['/projects/automotive-lean/','汽车电子精益体系'],['/projects/factory-layout/','新工厂规划'],['/projects/digital-factory/','数智化数据治理'],['/projects/visual-management/','现场目视化系统']]}
    ];
    levels.forEach(function(level,index){
      var group=groups[index];if(!group)return;
      var box=d.createElement('div');box.className='trust-evidence-links';
      var note=d.createElement('span');note.textContent=group.note;box.appendChild(note);
      group.links.forEach(function(item){box.appendChild(trustLink(item[0],item[1]));});
      level.appendChild(box);
    });
    section.dataset.qilyEvidenceLinks='v1';
  }

  function boot(){scan(d);installPrimaryNavRails();injectProjectDetailGrade();injectProjectListGrades();addTrustLinks();setTimeout(syncPrimaryNavRails,30);}
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  d.addEventListener('qily:shell-ready',boot);
  d.addEventListener('qily:softnavigate',boot);
  d.addEventListener('qily:language-change',boot);
  w.addEventListener('pageshow',boot,{passive:true});
})(document,window);
