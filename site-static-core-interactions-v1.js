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
    var section=d.getElementById('results');
    if(!section)return;

    var misleadingNote=section.querySelector('.metric-display-note');
    if(misleadingNote)misleadingNote.remove();

    Array.prototype.forEach.call(section.querySelectorAll('.metric:not(a):not([role="link"])'),function(card){
      card.classList.add('qily-static-card');
      card.removeAttribute('tabindex');
      card.removeAttribute('aria-label');
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
