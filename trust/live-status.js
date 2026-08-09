(function(){
  'use strict';

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

  function setStat(name,value){
    var node=document.querySelector('[data-trust-stat="'+name+'"]');
    if(node&&value!==undefined&&value!==null&&value!=='') node.textContent=String(value);
  }

  function validDate(value){return /^\d{4}-\d{2}-\d{2}$/.test(String(value||''));}

  function hydrate(){
    var dailyRequest=fetchJson('/qilylean/daily/index.json');
    var siteRequest=fetchJson('/qilylean/site-data.json');
    var searchRequest=fetchJson('/qilylean/site-search-index.json');

    Promise.allSettled([dailyRequest,siteRequest,searchRequest]).then(function(results){
      var daily=results[0].status==='fulfilled'&&Array.isArray(results[0].value)?results[0].value:null;
      var site=results[1].status==='fulfilled'&&results[1].value?results[1].value:null;
      var search=results[2].status==='fulfilled'&&results[2].value?results[2].value:null;

      if(daily&&daily.length){
        setStat('briefs',daily.length);
        var latest=daily.slice().sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''));})[0];
        if(latest&&validDate(latest.date)) setStat('latest-date',latest.date);
      }else if(site&&site.briefs){
        setStat('briefs',site.briefs.total);
        if(validDate(site.briefs.latestDate)) setStat('latest-date',site.briefs.latestDate);
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
