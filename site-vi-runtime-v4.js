/* QilyLean | Formal Visual Identity Runtime v4.0 | 2026-09-06
 * Presentation governance only: shell normalization, formal Hero marker,
 * single in-flow shared Dock, and cross-device overflow telemetry.
 * Translation lifecycle and translator DOM remain exclusively owned by site-translation-safe-runtime-v1.js.
 */
(function(d,w){
  'use strict';
  if(w.__qilyViRuntimeV4)return;
  w.__qilyViRuntimeV4=true;

  var root=d.documentElement;
  var timer=0;

  function visible(el){
    if(!el)return false;
    var s=w.getComputedStyle(el),r=el.getBoundingClientRect();
    return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity||1)!==0&&r.width>0&&r.height>0;
  }

  function header(){return d.querySelector('header.qily-site-header,header.qily-global-header,header.topbar,header.top,body>header');}

  function normalizeHeader(){
    var h=header();
    if(!h)return;
    h.classList.add('qily-site-header');
    h.setAttribute('data-qily-vi-v4-header','formal');
    var nav=h.querySelector('nav.qily-global-nav,nav.site-nav,nav.nav,nav[aria-label],nav');
    if(nav){nav.classList.add('site-nav','qily-global-nav');nav.setAttribute('data-qily-vi-v4-nav','formal');}
  }

  function normalizeHeroes(){
    var selector=[
      '.hero','.module-hero','.daily-hero','.article-hub','.document-hero','.project-hero','.projects-hero',
      '.cooperation-hero','.capability-hero','.experience-hero','.improvement-hero','.knowledge-hero','.trust-hero','[data-qily-hero]'
    ].join(',');
    d.querySelectorAll(selector).forEach(function(el){
      if(el.classList.contains('qily-aircraft-brand-hero'))return;
      el.setAttribute('data-qily-vi-v4-hero','118deg');
    });
  }

  function normalizeDock(){
    var docks=Array.prototype.slice.call(d.querySelectorAll('#floatDock.qily-float-dock,.qily-float-dock'));
    if(!docks.length)return;
    var primary=docks.find(function(el){return visible(el);})||docks[0];
    docks.forEach(function(el){
      if(el!==primary){el.hidden=true;el.setAttribute('aria-hidden','true');el.setAttribute('data-qily-vi-v4-duplicate','suppressed');}
    });
    primary.classList.add('qily-vi-v4-flow-dock');
    primary.setAttribute('data-qily-vi-v4-dock','single-flow');
    ['position','top','right','bottom','left','inset','transform','width','height'].forEach(function(name){primary.style.removeProperty(name);});

    var footer=d.querySelector('footer');
    var main=d.querySelector('main');
    if(footer&&footer.parentNode&&primary.parentNode===footer.parentNode&&primary.nextElementSibling!==footer){
      footer.parentNode.insertBefore(primary,footer);
    }else if(main&&main.parentNode&&primary.parentNode!==main&&primary.parentNode!==footer){
      if(footer&&footer.parentNode===main.parentNode)main.parentNode.insertBefore(primary,footer);
      else if(main.nextSibling)main.parentNode.insertBefore(primary,main.nextSibling);
      else main.parentNode.appendChild(primary);
    }
  }

  function markShell(){
    root.setAttribute('data-qily-vi-version','4.0');
    root.setAttribute('data-qily-vi-status','formal');
    if(d.body)d.body.setAttribute('data-qily-vi-shell','v4-formal');
  }

  function auditOverflow(){
    var width=root.clientWidth||w.innerWidth;
    var offenders=[];
    d.querySelectorAll('body *').forEach(function(el){
      if(!(el instanceof Element)||!visible(el))return;
      if(el.closest('.qily-table-scroll,.table-wrap,.table-scroll,.table-responsive,.data-table-wrap,.matrix-wrap,.diagram-scroll,.flow-scroll,.visual-scroll,nav.site-nav,nav.qily-global-nav'))return;
      var s=w.getComputedStyle(el);
      if(s.position==='fixed')return;
      var r=el.getBoundingClientRect();
      if(r.width>width+4||r.right>width+8||r.left<-8)offenders.push(el);
    });
    root.setAttribute('data-qily-vi-v4-overflow',offenders.length?'detected':'clear');
    if(offenders.length&&w.console&&console.warn)console.warn('[QilyLean VI v4] page-level overflow candidates',offenders.slice(0,10));
  }

  function apply(){
    markShell();
    normalizeHeader();
    normalizeHeroes();
    normalizeDock();
    w.requestAnimationFrame(auditOverflow);
  }

  function schedule(){
    if(timer)w.clearTimeout(timer);
    timer=w.setTimeout(function(){timer=0;apply();},0);
  }

  function init(){
    apply();
    w.setTimeout(apply,120);
    w.setTimeout(apply,700);
    w.setTimeout(apply,1400);
    d.addEventListener('qily:shell-ready',schedule);
    w.addEventListener('pageshow',schedule,{passive:true});
    w.addEventListener('resize',schedule,{passive:true});
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(document,window);
