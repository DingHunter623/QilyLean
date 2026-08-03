/* QilyLean 全站视觉闭环分类器 v1｜2026-08-03 */
(function(d,w){
  'use strict';
  if(w.__qilyVisualClosureV1)return;
  w.__qilyVisualClosureV1=true;

  function ready(fn){
    if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',fn,{once:true});
    else fn();
  }

  function markAll(selector,attribute,value){
    d.querySelectorAll(selector).forEach(function(node){node.setAttribute(attribute,value);});
  }

  function classifyCards(){
    var selector=[
      '.module-card','.qily-ia-card','.metric','.trust-card','.flow-step',
      '.resource-item','.price-card','.evidence','.trust-level','.boundary article'
    ].join(',');
    d.querySelectorAll(selector).forEach(function(card){
      var selfInteractive=card.matches('a,button,[role="link"],[onclick]');
      card.classList.toggle('qily-interactive-card',selfInteractive);
      card.classList.toggle('qily-static-card',!selfInteractive);
    });
  }

  function classifyActions(){
    d.querySelectorAll('a[href="/projects/qilylean-commercial-deliveries/"]').forEach(function(link){
      link.classList.add('qily-action-primary');
    });
    d.querySelectorAll('a[href*="/projects/qilylean-commercial-deliveries/review-authorization-template"]').forEach(function(link){
      link.classList.add('qily-action-secondary');
    });
  }

  function preservePhrases(){
    d.querySelectorAll('.flow-step strong,.module-heading h2,.qily-ia-heading h2').forEach(function(node){
      var text=(node.textContent||'').trim();
      if(text==='Pilot试点'||text==='阶段门')node.classList.add('qily-no-break');
    });
  }

  function boot(){
    d.documentElement.classList.add('qily-visual-closure-ready');
    markAll('.qily-ia-dark,.qily-ai-secondary,.contact-card,.resource-stage,.capability-home-screen','data-qily-dark-surface','true');
    markAll('.status,.trust-callout,.evidence-note,.qily-ia-boundary,.core-contract-viewer-note,.brief-output','data-qily-notice','true');
    markAll('.flow-grid,.trust-levels','data-qily-process-grid','true');
    markAll('.flow-step,.trust-level','data-qily-step-card','true');
    classifyActions();
    classifyCards();
    preservePhrases();
  }

  ready(boot);
})(document,window);
