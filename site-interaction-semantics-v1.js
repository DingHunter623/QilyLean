/* QilyLean Interaction Semantics Runtime V1.2｜2026-08-29
 * Classifies public UI by actual behavior instead of visual appearance.
 * Route navigation => explicit feedback; local controls => light feedback;
 * static terminology/tools/vocabulary => visual state is frozen so hover cannot fake a link.
 * V1.2 also provides one evidence-grade mapping between Trust Center, project list and project detail pages.
 */
(function(d,w){
  'use strict';
  if(w.__qilyInteractionSemanticsV12)return;
  w.__qilyInteractionSemanticsV12=true;
  w.__qilyInteractionSemanticsV11=true;
  w.__qilyInteractionSemanticsV1=true;

  var STATIC_SELECTOR=[
    '.tag','.tags>span','.chip','.chips>span','.pill','.badge',
    '.term','.term-chip','.qily-term-chip','.method-chip','.qily-method-chip',
    '.topic-chip','.keyword','.keyword-chip','.taxonomy-chip','.label-chip',
    '.tech-tag','.tool-tag','.method-tag','.glossary-tag','.topic-tag'
  ].join(',');

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

  function evidenceMarkup(meta,compact){
    var link=d.createElement('a');
    link.href='/trust/#evidence-levels';
    link.className=(compact?'qily-project-list-grade ':'qily-project-evidence-grade ')+'qily-grade-'+meta.level.toLowerCase();
    link.setAttribute('data-qily-project-evidence',meta.level);
    link.setAttribute('aria-label','证据等级 '+meta.level+' '+meta.label+'，查看证据分级口径');
    var badge=d.createElement('b');badge.textContent=meta.level;link.appendChild(badge);
    var text=d.createElement('span');text.textContent=compact?('证据等级：'+meta.label):('证据等级：'+meta.label);link.appendChild(text);
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

  function boot(){scan(d);injectProjectDetailGrade();injectProjectListGrades();addTrustLinks();}
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  d.addEventListener('qily:shell-ready',boot);
  d.addEventListener('qily:softnavigate',boot);
  d.addEventListener('qily:language-change',boot);
  w.addEventListener('pageshow',boot,{passive:true});
})(document,window);
