/* QilyLean 全站视觉、数据与操作区闭环分类器 v3.1｜2026-08-09｜信息密度与视觉层级收口 */
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
    style.setAttribute('data-qily-sitewide-clarity','2026-08-09-v3.1');
    style.textContent=[
      'html body .cooperation-page #services .service-number{display:inline-grid!important;place-items:center!important;width:40px!important;height:40px!important;border:2px solid #fff!important;border-radius:50%!important;color:#fff!important;-webkit-text-fill-color:#fff!important;background:#073c47!important;box-shadow:0 0 0 2px #178b94!important;opacity:1!important;filter:none!important;text-shadow:none!important;font-family:Arial,"Segoe UI",sans-serif!important;font-size:18px!important;font-weight:900!important;line-height:1!important;letter-spacing:0!important}',
      'html body .cooperation-page .hero-actions a.primary,html body .cooperation-page .hero-actions a.primary *{color:#332100!important;-webkit-text-fill-color:#332100!important;opacity:1!important;filter:none!important;text-shadow:none!important;font-weight:950!important}',
      'html body .cooperation-page .hero-actions a.primary{border:2px solid #fff3c6!important;background:#ffd36a!important;box-shadow:0 10px 24px rgba(0,0,0,.24)!important}',
      'html body .cooperation-page .hero-actions a.primary:hover,html body .cooperation-page .hero-actions a.primary:focus-visible{color:#201400!important;-webkit-text-fill-color:#201400!important;background:#ffe39b!important;border-color:#fff!important}',
      'html body .module-grid>.module-card{display:flex!important;flex-direction:column!important;align-self:stretch!important;height:100%!important}',
      'html body .module-grid>.module-card>.module-actions{display:flex!important;align-items:flex-end!important;flex-wrap:wrap!important;gap:10px!important;margin-top:auto!important;padding-top:14px!important}',
      'html body .module-grid>.module-card>.module-actions>a,html body .module-grid>.module-card>.module-actions>button{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:42px!important;box-sizing:border-box!important}',
      'html body .module-grid>.module-card>.module-result{margin-top:auto!important}',
      'html body .module-grid>.module-card>.module-result+.module-actions{margin-top:0!important;padding-top:14px!important}',
      'html body .boundary-service-grid>.boundary-service-card{display:flex!important;flex-direction:column!important;align-self:stretch!important;height:100%!important}',
      'html body .boundary-service-grid>.boundary-service-card>.boundary-note{margin-top:auto!important}',
      '@media(max-width:560px){html body .module-grid>.module-card>.module-actions>a,html body .module-grid>.module-card>.module-actions>button{width:100%!important}}'
    ].join('\n');
    (d.head||d.documentElement).appendChild(style);
  }

  function ensureDensityStyle(){
    var id='qilySiteDensityStyleV1';
    if(d.getElementById(id))return;
    var style=d.createElement('style');
    style.id=id;
    style.setAttribute('data-qily-site-density','2026-08-09-v1.1');
    style.textContent=[
      ':root{--qily-density-section:clamp(32px,4.1vw,54px);--qily-density-section-mobile:28px;--qily-density-card:20px;--qily-density-gap:14px;--qily-density-copy:17px;--qily-density-line:1.68}',
      'html body :is(.module-section,.qily-ia-section,.section,.qily-resource-network){padding-top:var(--qily-density-section)!important;padding-bottom:var(--qily-density-section)!important}',
      'html body :is(.module-inner,.qily-ia-inner,.inner,.qily-resource-network__inner){max-width:1240px}',
      'html body :is(.module-heading,.qily-ia-heading,.head){max-width:1040px!important;margin-bottom:clamp(17px,1.8vw,22px)!important}',
      'html body :is(.module-heading,.qily-ia-heading,.head)>:is(h1,h2,h3){text-wrap:balance}',
      'html body :is(.module-heading,.qily-ia-heading,.head)>p{line-height:1.68!important}',
      'html body :is(.module-grid,.qily-ia-grid,.metrics,.qily-resource-network__grid){gap:var(--qily-density-gap)!important}',
      'html body :is(.module-card,.qily-ia-card,.metric,.qily-resource-network__card){min-height:0!important;padding:var(--qily-density-card)!important}',
      'html body :is(.price-card,.evidence,.boundary article,.diagnosis-form,.contact-card,.trust-card,.resource-item){padding:20px!important}',
      'html body :is(.price-ladder,.evidence-grid,.boundary,.diagnosis-layout){gap:14px!important}',
      'html body .module-card :is(p,li){font-size:var(--qily-density-copy)!important;line-height:var(--qily-density-line)!important}',
      'html body .module-card p{margin-bottom:10px!important}',
      'html body .module-card h4{margin-top:14px!important}',
      'html body .module-result{margin-top:13px!important;padding:11px 13px!important;font-size:16px!important;line-height:1.62!important}',
      'html body :is(.module-actions,.article-actions,.qily-ia-actions){margin-top:14px!important;gap:9px!important}',
      'html body :is(.module-note,.qily-ia-boundary,.evidence-note,.trust-callout,.status){margin-top:14px!important;padding:13px 15px!important}',
      'html body :is(.flow-step,.trust-level,[data-qily-step-card="true"]){min-height:0!important;padding:18px 15px!important}',
      'html body :is(.flow-step,.trust-level,[data-qily-step-card="true"])>b:first-child{width:34px!important;height:34px!important;min-width:34px!important;min-height:34px!important;margin-bottom:10px!important}',
      'html body :is(.flow-step,.trust-level,[data-qily-step-card="true"])>strong{margin-bottom:6px!important}',
      'html body .module-media{margin:-20px -20px 15px!important}',
      'html body .module-media figcaption{padding:8px 12px!important}',
      'html body .module-video{margin-top:14px!important;padding:12px!important}',
      'html body .module-hero,html body .daily-hero,html body .hero:not(:has(.hero-grid)):has(>.inner),html body .hero:has(>.hero-inner){padding-top:30px!important;padding-bottom:30px!important}',
      'html body .module-subnav{margin-top:13px!important;gap:8px!important}',
      'html body .module-subnav a{min-height:38px!important;padding:6px 12px!important}',
      'html body .module-section{contain-intrinsic-size:auto 520px!important}',
      'html body .hero-actions{margin-top:18px!important;gap:9px!important}',
      'html body .trust-strip{margin-top:20px!important}',
      'html body .scope-list{margin-top:12px!important;gap:8px!important}',
      'html body .service-contract{margin-top:13px!important;padding:12px!important}',
      'html body .core-contract-viewer{margin-top:18px!important;padding:20px!important}',
      'html body .fine-print{margin-top:14px!important;line-height:1.65!important}',
      'html body .qily-resource-network__grid{margin-top:20px!important}',
      'html body .qily-resource-network__card{padding:18px!important}',
      'html body .qily-resource-network__card strong{padding-top:12px!important}',
      'html body .qily-resource-network__actions{margin-top:18px!important;gap:9px!important}',
      'html body .qily-resource-network__definition{margin-top:18px!important;padding:18px!important}',
      'html body .qily-resource-network__loop{margin-top:20px!important}',
      'html body .qily-resource-network__loop article{min-height:0!important;padding:17px 15px!important}',
      'html body .qily-resource-network__notice{margin-top:18px!important;padding:14px 16px!important}',
      'html body.qily-home-commercial-focus .hero{padding-top:clamp(34px,4.4vw,54px)!important;padding-bottom:clamp(34px,4.4vw,54px)!important}',
      'html body.qily-home-commercial-focus .hero-grid{gap:clamp(26px,3vw,48px)!important;align-items:center!important}',
      'html body.qily-home-commercial-focus .hero h1{font-size:clamp(40px,4.4vw,64px)!important;line-height:1.05!important}',
      'html body.qily-home-commercial-focus .hero .lead{font-size:clamp(18px,1.32vw,21px)!important;line-height:1.68!important}',
      'html body.qily-home-commercial-focus .portrait-frame{width:min(470px,100%)!important}',
      'html body.qily-home-commercial-focus .actions{margin-top:16px!important;gap:9px!important}',
      'html body.qily-home-commercial-focus .metric{padding:18px!important}',
      'html body.qily-home-commercial-focus .metric strong{font-size:clamp(23px,1.8vw,31px)!important}',
      'html body.qily-home-commercial-focus .metric span{margin-top:6px!important;font-size:15.5px!important;line-height:1.58!important}',
      'html body.qily-home-commercial-focus .metric em{margin-top:6px!important;font-size:14px!important;line-height:1.5!important}',
      'html body.qily-home-commercial-focus .qily-ia-card{padding:20px!important}',
      'html body.qily-home-commercial-focus .qily-ia-card p{font-size:16px!important;line-height:1.64!important}',
      'html body.qily-home-commercial-focus #qily-home-ai .qily-ia-inner{width:min(1220px,100%)!important;display:grid!important;grid-template-columns:minmax(250px,.62fr) minmax(0,1.38fr)!important;gap:28px!important;align-items:start!important}',
      'html body.qily-home-commercial-focus #qily-home-ai .qily-ia-heading{margin:0!important}',
      'html body.qily-home-commercial-focus #qily-home-ai .assistant-panel{margin:0!important}',
      'html body.qily-home-commercial-focus #qily-home-ai .panel-body{padding:14px 16px 16px!important}',
      'html body.qily-home-commercial-focus #qily-home-ai textarea{min-height:66px!important}',
      'html body.qily-home-commercial-focus #qily-home-ai .answer{padding:15px!important;font-size:18px!important;line-height:1.68!important}',
      'html body.qily-home-commercial-focus #qily-more-context .qily-ia-heading{margin-bottom:16px!important}',
      'html body.qily-home-commercial-focus #qily-more-context .qily-ia-secondary-link{padding:14px 15px!important}',
      'html body.qily-home-commercial-focus #cumulative-contribution-disclosure{display:none!important}',
      'html body .qily-interactive-card{transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease,background-color .16s ease!important}',
      'html body .qily-interactive-card:is(:hover,:focus-visible){transform:translateY(-2px)!important;box-shadow:0 12px 28px rgba(15,75,90,.15)!important}',
      '@media(max-width:900px){html body.qily-home-commercial-focus #qily-home-ai .qily-ia-inner{grid-template-columns:1fr!important;gap:18px!important}}',
      '@media(max-width:820px){html body :is(.module-section,.qily-ia-section,.section,.qily-resource-network){padding-top:var(--qily-density-section-mobile)!important;padding-bottom:var(--qily-density-section-mobile)!important}html body :is(.module-card,.qily-ia-card,.metric,.qily-resource-network__card,.price-card,.evidence,.boundary article,.diagnosis-form,.contact-card,.trust-card,.resource-item){padding:18px!important}html body .module-media{margin:-18px -18px 14px!important}html body.qily-home-commercial-focus .hero-grid{align-items:start!important}}',
      '@media(max-width:560px){html body :is(.module-section,.qily-ia-section,.section,.qily-resource-network){padding-top:24px!important;padding-bottom:24px!important}html body :is(.module-heading,.qily-ia-heading,.head){margin-bottom:16px!important}html body :is(.module-card,.qily-ia-card,.metric,.qily-resource-network__card,.price-card,.evidence,.boundary article,.diagnosis-form,.contact-card,.trust-card,.resource-item){padding:16px!important}html body .module-media{margin:-16px -16px 13px!important}html body.qily-home-commercial-focus .hero{padding-top:28px!important;padding-bottom:28px!important}html body.qily-home-commercial-focus .hero h1{font-size:clamp(36px,11vw,48px)!important}html body.qily-home-commercial-focus #qily-more-context .qily-ia-secondary-link{padding:13px 14px!important}}',
      '@media(prefers-reduced-motion:reduce){html body .qily-interactive-card{transition:none!important}}'
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
      if(!link.classList.contains('qtc-action'))link.classList.add('qily-action-primary');
    });
    d.querySelectorAll('a[href*="/projects/qilylean-commercial-deliveries/review-authorization-template"]').forEach(function(link){
      if(!link.classList.contains('qtc-action'))link.classList.add('qily-action-secondary');
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
    fetch('/qilylean/daily/index.json?v=20260809-sitewide-sync-v3',{cache:'no-store'})
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
    ensureDensityStyle();
    markAll('.qily-ia-dark,.qily-ai-secondary,.contact-card,.resource-stage,.capability-home-screen','data-qily-dark-surface','true');
    markAll('.status,.trust-callout,.evidence-note,.qily-ia-boundary,.core-contract-viewer-note,.brief-output','data-qily-notice','true');
    markAll('.flow-grid,.trust-levels','data-qily-process-grid','true');
    markAll('.flow-step,.trust-level','data-qily-step-card','true');
    classifyActions();
    classifyCards();
    preservePhrases();
    syncDailyMetadata();
    d.documentElement.setAttribute('data-qily-density','2026-08-09-v1.1');
  }

  ready(boot);
})(document,window);
