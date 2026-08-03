/* QilyLean static core interactions v1
 * Static HTML is the source of truth. This file only enhances interaction.
 */
(function(d,w){
  'use strict';
  if(w.__qilyStaticCoreInteractionsV1)return;
  w.__qilyStaticCoreInteractionsV1=true;

  function ready(fn){
    if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',fn,{once:true});
    else fn();
  }

  function installStaticMetricStyle(){
    if(d.getElementById('qily-static-metric-no-hover-style'))return;
    var style=d.createElement('style');
    style.id='qily-static-metric-no-hover-style';
    style.textContent=[
      '#results .metric.qily-static-card,#results .metric.qily-static-card:hover,#results .metric.qily-static-card:focus,#results .metric.qily-static-card:focus-visible,#results .metric.qily-static-card:active{cursor:default!important;transition:none!important;transform:none!important;box-shadow:none!important;filter:none!important;animation:none!important;will-change:auto!important;background:#fff!important;border-left-color:var(--line)!important;border-right-color:var(--line)!important;border-bottom-color:var(--line)!important;outline:none!important}',
      '#results .metric.qily-static-card:nth-child(1n),#results .metric.qily-static-card:nth-child(1n):hover,#results .metric.qily-static-card:nth-child(1n):focus,#results .metric.qily-static-card:nth-child(1n):focus-visible,#results .metric.qily-static-card:nth-child(1n):active{border-top-color:var(--teal)!important}',
      '#results .metric.qily-static-card:nth-child(2n),#results .metric.qily-static-card:nth-child(2n):hover,#results .metric.qily-static-card:nth-child(2n):focus,#results .metric.qily-static-card:nth-child(2n):focus-visible,#results .metric.qily-static-card:nth-child(2n):active{border-top-color:var(--copper)!important}',
      '#results .metric.qily-static-card:nth-child(3n),#results .metric.qily-static-card:nth-child(3n):hover,#results .metric.qily-static-card:nth-child(3n):focus,#results .metric.qily-static-card:nth-child(3n):focus-visible,#results .metric.qily-static-card:nth-child(3n):active{border-top-color:var(--plum)!important}'
    ].join('');
    d.head.appendChild(style);
  }

  ready(function(){
    var section=d.getElementById('results');
    if(!section)return;

    installStaticMetricStyle();

    var misleadingNote=section.querySelector('.metric-display-note');
    if(misleadingNote)misleadingNote.remove();

    Array.prototype.forEach.call(section.querySelectorAll('.metric:not(a):not([role="link"])'),function(card){
      card.classList.add('qily-static-card');
      card.removeAttribute('tabindex');
      card.removeAttribute('aria-label');
      card.removeAttribute('role');
    });

    var button=d.querySelector('[data-qily-results-toggle]');
    if(!button)return;
    button.addEventListener('click',function(){
      var expanded=section.classList.toggle('qily-results-expanded');
      button.setAttribute('aria-expanded',String(expanded));
      button.textContent=expanded?'收起成果概览':'展开全部成果概览';
    });
  });
})(document,window);
