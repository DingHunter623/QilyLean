/* QilyLean 全站视觉、数据与操作区闭环分类器 v2.2｜2026-08-04｜标识条与专业边界沉底对齐 */
/* Backward-compatible validation marker: qilySitewideClarityStyleV2 */
(function(d,w){
  'use strict';
  if(w.__qilyVisualClosureV3)return;
  w.__qilyVisualClosureV3=true;

  function ready(fn){
    if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',fn,{once:true});
    else fn();
  }

  function markAll(selector,attribute,value){
    d.querySelectorAll(selector).forEach(function(node){node.setAttribute(attribute,value);});
  }

  function ensureSitewideClarityStyle(){
    var id='qilySitewideClarityStyleV3';
    if(d.getElementById(id))return;
    var style=d.createElement('style');
    style.id=id;
    style.setAttribute('data-qily-sitewide-clarity','2026-08-04-v2.2');
    style.textContent=[
      'html body .cooperation-page #services .service-number{display:inline-grid!important;place-items:center!important;width:40px!important;height:40px!important;border:2px solid #fff!important;border-radius:50%!important;color:#fff!important;-webkit-text-fill-color:#fff!important;background:#073c47!important;box-shadow:0 0 0 2px #178b94!important;opacity:1!important;filter:none!important;text-shadow:none!important;font-family:Arial,"Segoe UI",sans-serif!important;font-size:18px!important;font-weight:900!important;line-height:1!important;letter-spacing:0!important}',
      'html body .cooperation-page .hero-actions a.primary,html body .cooperation-page .hero-actions a.primary *{color:#332100!important;-webkit-text-fill-color:#332100!important;opacity:1!important;filter:none!important;text-shadow:none!important;font-weight:950!important}',
      'html body .cooperation-page .hero-actions a.primary{border:2px solid #fff3c6!important;background:#ffd36a!important;box-shadow:0 10px 24px rgba(0,0,0,.24)!important}',
      'html body .cooperation-page .hero-actions a.primary:hover,html body .cooperation-page .hero-actions a.primary:focus-visible{color:#201400!important;-webkit-text-fill-color:#201400!important;background:#ffe39b!important;border-color:#fff!important}',
      'html body .module-grid>.module-card{display:flex!important;flex-direction:column!important;align-self:stretch!important;height:100%!important}',
      'html body .module-grid>.module-card>.module-actions{display:flex!important;align-items:flex-end!important;flex-wrap:wrap!important;gap:10px!important;margin-top:auto!important;padding-top:16px!important}',
      'html body .module-grid>.module-card>.module-actions>a,html body .module-grid>.module-card>.module-actions>button{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:44px!important;box-sizing:border-box!important}',
      'html body .module-grid>.module-card>.module-result{margin-top:auto!important}',
      'html body .module-grid>.module-card>.module-result+.module-actions{margin-top:0!important;padding-top:16px!important}',
      'html body .boundary-service-grid>.boundary-service-card{display:flex!important;flex-direction:column!important;align-self:stretch!important;height:100%!important}',
      'html body .boundary-service-grid>.boundary-service-card>.boundary-note{margin-top:auto!important}',
      '@media(max-width:560px){html body .module-grid>.module-card>.module-actions>a,html body .module-grid>.module-card>.module-actions>button{width:100%!important}}'
    ].join('\n');
    (d.head||d.documentElement).appendChild(style);
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

  function setText(node,value){
    if(node&&typeof value==='string'&&node.textContent!==value)node.textContent=value;
  }

  function updateHomeLatest(latest,total){
    var cards=d.querySelectorAll('#latest-content .metrics>.metric');
    if(cards.length>=2){
      setText(cards[0].querySelector('strong'),latest.date||'');
      setText(cards[0].querySelector('span'),latest.title||'');
      var latestLink=cards[0].querySelector('a');
      if(latestLink)latestLink.href='/qilylean/daily/'+latest.date+'.html';
      setText(cards[1].querySelector('strong'),String(total)+'期');
    }
  }

  function updateKnowledgeStats(latest,total){
    var section=d.getElementById('knowledge-stats');
    if(!section)return;
    section.querySelectorAll('.module-card').forEach(function(card){
      var label=(card.querySelector('small')||{}).textContent||'';
      if(label.indexOf('今日简报')<0)return;
      setText(card.querySelector('h3'),String(total)+' 期');
      setText(card.querySelector('p'),'最新更新至 '+latest.date+'，按日期连续归档。');
    });
  }

  function updateLatestBriefCards(latest){
    d.querySelectorAll('[data-latest-brief-card]').forEach(function(card){
      card.setAttribute('data-latest-brief-date',latest.date||'');
      setText(card.querySelector('[data-latest-brief-meta]'),'最新：'+(latest.date||'')+'｜'+(latest.theme||''));
      setText(card.querySelector('[data-latest-brief-title]'),latest.title||'');
      setText(card.querySelector('[data-latest-brief-summary]'),latest.summary||'');
      var link=card.querySelector('[data-latest-brief-link]');
      if(link)link.href='/qilylean/daily/'+latest.date+'.html';
    });
  }

  function replaceStaleVisibleStatistics(latest,total){
    d.querySelectorAll('[data-site-metadata-source] h3,[data-site-metadata-source] strong,[data-site-metadata-source] p').forEach(function(node){
      var text=node.textContent||'';
      if(/^\s*\d+\s*期\s*$/.test(text)&&/2582/.test(text))setText(node,String(total)+(text.indexOf(' ')>=0?' 期':'期'));
      if(/最新更新至\s*\d{4}-\d{2}-\d{2}/.test(text))setText(node,text.replace(/最新更新至\s*\d{4}-\d{2}-\d{2}/,'最新更新至 '+latest.date));
    });
  }

  function syncDailyMetadata(){
    if(!w.fetch)return;
    fetch('/qilylean/daily/index.json?v=20260804-sitewide-sync-v2',{cache:'no-store'})
      .then(function(response){if(!response.ok)throw new Error('daily index unavailable');return response.json();})
      .then(function(items){
        if(!Array.isArray(items)||!items.length)return;
        var sorted=items.slice().sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''));});
        var latest=sorted[0];
        updateHomeLatest(latest,sorted.length);
        updateKnowledgeStats(latest,sorted.length);
        updateLatestBriefCards(latest);
        replaceStaleVisibleStatistics(latest,sorted.length);
        d.documentElement.setAttribute('data-qily-daily-sync',latest.date+'-'+sorted.length);
      })
      .catch(function(){d.documentElement.setAttribute('data-qily-daily-sync','fallback');});
  }

  function boot(){
    d.documentElement.classList.add('qily-visual-closure-ready');
    ensureSitewideClarityStyle();
    markAll('.qily-ia-dark,.qily-ai-secondary,.contact-card,.resource-stage,.capability-home-screen','data-qily-dark-surface','true');
    markAll('.status,.trust-callout,.evidence-note,.qily-ia-boundary,.core-contract-viewer-note,.brief-output','data-qily-notice','true');
    markAll('.flow-grid,.trust-levels','data-qily-process-grid','true');
    markAll('.flow-step,.trust-level','data-qily-step-card','true');
    classifyActions();
    classifyCards();
    preservePhrases();
    syncDailyMetadata();
  }

  ready(boot);
})(document,window);
