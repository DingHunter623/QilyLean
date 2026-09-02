(function(){
  'use strict';

  var FALLBACK_EARLIEST_DATE='2019-07-10';
  var STYLE_ID='qilyTrustBriefDateLinksV2';

  function fetchJson(url){
    var separator=url.indexOf('?')>=0?'&':'?';
    return fetch(url+separator+'t='+Date.now(),{
      credentials:'same-origin',
      cache:'no-store',
      headers:{Accept:'application/json'}
    }).then(function(response){
      if(!response.ok) throw new Error(url+' '+response.status);
      return response.json();
    });
  }

  function validDate(value){return /^\d{4}-\d{2}-\d{2}$/.test(String(value||''));}
  function briefUrl(date){return validDate(date)?'/qilylean/daily/'+date+'.html':'';}

  function setStat(name,value){
    var node=document.querySelector('[data-trust-stat="'+name+'"]');
    if(node&&value!==undefined&&value!==null&&value!=='') node.textContent=String(value);
  }

  function injectStyle(){
    if(document.getElementById(STYLE_ID)) return;
    var style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent='html body .trust-status{grid-template-columns:repeat(5,minmax(0,1fr))!important}html body .trust-status>div.qily-trust-date-card{padding:0!important;overflow:hidden}html body .trust-status .qily-trust-date-link{display:flex!important;min-height:100%;padding:19px;flex-direction:column;align-items:center;justify-content:center;color:inherit!important;text-decoration:none!important;touch-action:manipulation;background:#fff;transition:background-color .12s ease,box-shadow .12s ease}html body .trust-status .qily-trust-date-link:hover{background:#f3faf8;box-shadow:inset 0 -3px 0 #caa15f}html body .trust-status .qily-trust-date-link:active{background:#e8f5f2}html body .trust-status .qily-trust-date-link:focus-visible{outline:3px solid #caa15f!important;outline-offset:-3px!important}html body .trust-status .qily-trust-date-link strong{color:#0f4b5a!important}html body .trust-status .qily-trust-date-link span{color:#5f7474!important}@media(max-width:1100px){html body .trust-status{grid-template-columns:repeat(3,minmax(0,1fr))!important}}@media(max-width:760px){html body .trust-status{grid-template-columns:repeat(2,minmax(0,1fr))!important}}@media(max-width:520px){html body .trust-status{grid-template-columns:1fr!important}}';
    document.head.appendChild(style);
  }

  function findCard(strong,status){
    var node=strong;
    while(node&&node.parentElement&&node.parentElement!==status) node=node.parentElement;
    return node&&node.parentElement===status?node:null;
  }

  function ensureDateCard(name,date,label,beforeCard){
    var status=document.querySelector('.trust-status');
    if(!status||!validDate(date)) return null;
    var strong=document.querySelector('[data-trust-stat="'+name+'"]');
    var card=strong?findCard(strong,status):null;

    if(!strong){
      card=document.createElement('div');
      strong=document.createElement('strong');
      strong.setAttribute('data-trust-stat',name);
      var caption=document.createElement('span');
      caption.textContent=label;
      card.appendChild(strong);
      card.appendChild(caption);
      if(beforeCard&&beforeCard.parentElement===status) status.insertBefore(card,beforeCard);
      else status.appendChild(card);
    }

    setStat(name,date);
    card=findCard(strong,status)||card;
    if(!card) return null;
    card.classList.add('qily-trust-date-card');

    var link=card.querySelector('a.qily-trust-date-link');
    if(!link){
      link=document.createElement('a');
      link.className='qily-trust-date-link';
      while(card.firstChild) link.appendChild(card.firstChild);
      card.appendChild(link);
    }
    link.href=briefUrl(date);
    link.setAttribute('aria-label','打开'+date+'精选简报');
    link.title='打开 '+date+' 精选简报';

    var captionNode=link.querySelector('span');
    if(captionNode) captionNode.textContent=label;
    return card;
  }

  function prepareDateCards(){
    injectStyle();
    var status=document.querySelector('.trust-status');
    if(!status) return;
    var latestStrong=document.querySelector('[data-trust-stat="latest-date"]');
    var latestDate=latestStrong&&validDate(latestStrong.textContent.trim())?latestStrong.textContent.trim():'';
    var latestCard=latestStrong?findCard(latestStrong,status):null;
    ensureDateCard('earliest-date',FALLBACK_EARLIEST_DATE,'最早精选日期',latestCard);
    if(latestDate) ensureDateCard('latest-date',latestDate,'最新精选日期');
  }

  function getDateBounds(daily){
    var earliest=null;
    var latest=null;
    for(var index=0;index<daily.length;index+=1){
      var item=daily[index];
      if(!item||!validDate(item.date)) continue;
      if(!earliest||item.date<earliest.date) earliest=item;
      if(!latest||item.date>latest.date) latest=item;
    }
    return {earliest:earliest,latest:latest};
  }

  function hydrate(){
    prepareDateCards();

    var dailyRequest=fetchJson('/qilylean/daily/index.json');
    var siteRequest=fetchJson('/qilylean/site-data.json');
    var searchRequest=fetchJson('/qilylean/site-search-index.json');

    Promise.allSettled([dailyRequest,siteRequest,searchRequest]).then(function(results){
      var daily=results[0].status==='fulfilled'&&Array.isArray(results[0].value)?results[0].value:null;
      var site=results[1].status==='fulfilled'&&results[1].value?results[1].value:null;
      var search=results[2].status==='fulfilled'&&results[2].value?results[2].value:null;

      if(daily&&daily.length){
        setStat('briefs',daily.length);
        var bounds=getDateBounds(daily);
        if(bounds.earliest) ensureDateCard('earliest-date',bounds.earliest.date,'最早精选日期');
        if(bounds.latest) ensureDateCard('latest-date',bounds.latest.date,'最新精选日期');
      }else if(site&&site.briefs){
        setStat('briefs',site.briefs.total);
        var earliestDate=validDate(site.briefs.earliestDate)?site.briefs.earliestDate:FALLBACK_EARLIEST_DATE;
        ensureDateCard('earliest-date',earliestDate,'最早精选日期');
        if(validDate(site.briefs.latestDate)) ensureDateCard('latest-date',site.briefs.latestDate,'最新精选日期');
      }

      if(site&&site.terminology) setStat('terminology',site.terminology.total);
      var indexed=search&&search.meta&&search.meta.indexedEntries;
      if(!indexed&&site&&site.search) indexed=site.search.indexedEntries;
      if(indexed) setStat('search',indexed);

      var sync=document.querySelector('[data-trust-sync-version]');
      if(sync){
        var version=(site&&site.generatedAt)||(search&&search.generatedAt)||'';
        if(validDate(version)) sync.textContent=version;
      }

      document.documentElement.setAttribute('data-trust-live-status','ready');
    }).catch(function(){
      document.documentElement.setAttribute('data-trust-live-status','fallback');
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',hydrate,{once:true});
  else hydrate();
})();
