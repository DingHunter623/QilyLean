/* QilyLean Interaction Semantics Runtime V1｜2026-08-28
 * Classifies public UI by actual behavior instead of visual appearance.
 * Route navigation => strong feedback; local controls => light feedback;
 * static terminology/tools/vocabulary => no fake clickable feedback.
 */
(function(d,w){
  'use strict';
  if(w.__qilyInteractionSemanticsV1)return;
  w.__qilyInteractionSemanticsV1=true;

  var STATIC_SELECTOR=[
    '.tag','.tags>span','.chip','.chips>span','.pill','.badge',
    '.term','.term-chip','.qily-term-chip','.method-chip','.qily-method-chip',
    '.topic-chip','.keyword','.keyword-chip','.taxonomy-chip','.label-chip',
    '.tech-tag','.tool-tag','.method-tag','.glossary-tag','.topic-tag'
  ].join(',');

  function cleanHref(node){
    var href=(node.getAttribute&&node.getAttribute('href'))||'';
    return href.trim();
  }
  function isRealRoute(node){
    if(!node||node.nodeType!==1)return false;
    if(node.matches('a[href]')){
      var href=cleanHref(node);
      if(!href||href==='#'||href.indexOf('javascript:')===0)return false;
      if(href.charAt(0)==='#')return false;
      return true;
    }
    return node.hasAttribute('data-route')||node.hasAttribute('data-href')||node.hasAttribute('data-url')||node.hasAttribute('data-external-url');
  }
  function isLocalControl(node){
    if(!node||node.nodeType!==1)return false;
    return node.matches('button,[role="button"],[data-tab],[data-toggle],[aria-controls]');
  }
  function classifyNode(node){
    if(!node||node.nodeType!==1)return;
    if(node.closest&&node.closest('#floatDock'))return; // Dock has its own authority.
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
  function boot(){scan(d);}
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  d.addEventListener('qily:shell-ready',boot);
  d.addEventListener('qily:softnavigate',boot);
  d.addEventListener('qily:language-change',boot);
  w.addEventListener('pageshow',boot,{passive:true});
})(document,window);
