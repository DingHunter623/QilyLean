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

  ready(function(){
    Array.prototype.forEach.call(d.querySelectorAll('.metric'),function(card){
      var interactive=!!card.querySelector('a[href],button,[role="link"]');
      card.classList.toggle('qily-interactive-card',interactive);
      card.classList.toggle('qily-static-card',!interactive);
      if(interactive)card.setAttribute('data-qily-interactive','true');
      else card.removeAttribute('data-qily-interactive');
    });

    var section=d.getElementById('results');
    var button=d.querySelector('[data-qily-results-toggle]');
    if(!section||!button)return;
    button.addEventListener('click',function(){
      var expanded=section.classList.toggle('qily-results-expanded');
      button.setAttribute('aria-expanded',String(expanded));
      button.textContent=expanded?'收起成果概览':'展开全部成果概览';
    });
  });
})(document,window);
