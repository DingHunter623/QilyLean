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
      '#results .metric.qily-static-card{--qily-static-top:var(--teal);cursor:default!important;transition:none!important;transform:none!important;box-shadow:none!important;filter:none!important;animation:none!important;will-change:auto!important;background:#fff!important;border-left-color:transparent!important;border-right-color:transparent!important;border-bottom-color:transparent!important;border-top-color:var(--qily-static-top)!important;outline:none!important}',
      '#results .metric.qily-static-card:nth-child(2n){--qily-static-top:var(--copper)}',
      '#results .metric.qily-static-card:nth-child(3n){--qily-static-top:var(--plum)}',
      '#results .metric.qily-static-card:hover,#results .metric.qily-static-card:focus,#results .metric.qily-static-card:focus-visible,#results .metric.qily-static-card:active{cursor:default!important;transition:none!important;transform:none!important;box-shadow:none!important;filter:none!important;animation:none!important;will-change:auto!important;background:#fff!important;border-left-color:transparent!important;border-right-color:transparent!important;border-bottom-color:transparent!important;border-top-color:var(--qily-static-top)!important;outline:none!important}',
      '#results .metric.qily-static-card strong,#results .metric.qily-static-card:hover strong,#results .metric.qily-static-card:focus strong,#results .metric.qily-static-card:focus-visible strong,#results .metric.qily-static-card:active strong{color:var(--forest)!important;-webkit-text-fill-color:var(--forest)!important;transition:none!important;transform:none!important;filter:none!important;opacity:1!important;text-shadow:none!important}',
      '#results .metric.qily-static-card span,#results .metric.qily-static-card:hover span,#results .metric.qily-static-card:focus span,#results .metric.qily-static-card:focus-visible span,#results .metric.qily-static-card:active span{color:var(--muted)!important;-webkit-text-fill-color:var(--muted)!important;transition:none!important;transform:none!important;filter:none!important;opacity:1!important;text-shadow:none!important}',
      '#results .metric.qily-static-card em,#results .metric.qily-static-card:hover em,#results .metric.qily-static-card:focus em,#results .metric.qily-static-card:focus-visible em,#results .metric.qily-static-card:active em{color:var(--red)!important;-webkit-text-fill-color:var(--red)!important;transition:none!important;transform:none!important;filter:none!important;opacity:1!important;text-shadow:none!important}',
      '#results .metric.qily-static-card::before,#results .metric.qily-static-card::after,#results .metric.qily-static-card:hover::before,#results .metric.qily-static-card:hover::after{content:none!important;display:none!important;border:0!important;box-shadow:none!important;transform:none!important;animation:none!important}'
    ].join('');
    d.head.appendChild(style);
  }

  function installLatestBriefButtonStyle(){
    if(d.getElementById('qily-home-latest-brief-cta-style'))return;
    var style=d.createElement('style');
    style.id='qily-home-latest-brief-cta-style';
    style.textContent=[
      '.hero .actions .qily-latest-brief-button{position:relative;border-color:#ffe39b;background:rgba(7,60,71,.72);box-shadow:inset 0 0 0 1px rgba(255,227,155,.18)}',
      '.hero .actions .qily-latest-brief-button::after{content:"NEW";position:absolute;right:-7px;top:-10px;padding:2px 6px;border-radius:999px;color:#173238;background:#ffe39b;border:1px solid rgba(202,161,95,.78);font-size:10px;font-weight:950;line-height:1.35;letter-spacing:.04em}',
      '.hero .actions .qily-latest-brief-button:hover,.hero .actions .qily-latest-brief-button:focus-visible{color:#17231e;background:linear-gradient(135deg,#ffe39b,#f5b64b);border-color:#ffe39b}',
      '@media(max-width:820px){.hero .actions .qily-latest-brief-button{width:100%}}'
    ].join('');
    d.head.appendChild(style);
  }

  function formatBriefDate(value){
    var match=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(!match)return '';
    return String(Number(match[2]))+'月'+String(Number(match[3]))+'日';
  }

  function installLatestBriefHeroCta(){
    var path=(w.location.pathname||'/').replace(/\/+$/,'')||'/';
    if(path!=='/'&&path!=='/index.html')return;
    var actions=d.querySelector('.hero .actions');
    if(!actions)return;

    installLatestBriefButtonStyle();

    var button=actions.querySelector('[data-qily-latest-brief-cta]');
    if(!button){
      button=d.createElement('a');
      button.className='button qily-latest-brief-button';
      button.setAttribute('data-qily-latest-brief-cta','v1');
      button.href='/qilylean/daily-insights.html';
      button.textContent='今日简报';
      button.setAttribute('aria-label','打开最新今日简报');
      actions.appendChild(button);
    }

    if(!w.fetch)return;
    w.fetch('/qilylean/site-data.json?homeLatestBrief=1',{cache:'no-store'})
      .then(function(response){if(!response.ok)throw new Error('site-data '+response.status);return response.json();})
      .then(function(data){
        var briefs=data&&data.briefs?data.briefs:null;
        if(!briefs)return;
        var labelDate=formatBriefDate(briefs.latestDate);
        if(briefs.latestUrl)button.href=briefs.latestUrl;
        button.textContent=labelDate?'今日简报｜'+labelDate:'今日简报';
        button.setAttribute('aria-label',button.textContent+'：'+(briefs.latestTitle||'打开最新简报'));
        button.dataset.qilyLatestBriefDate=briefs.latestDate||'';
      })
      .catch(function(){
        button.href='/qilylean/daily-insights.html';
        button.textContent='今日简报';
      });
  }

  ready(function(){
    installLatestBriefHeroCta();

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
