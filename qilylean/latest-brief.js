(function(){
'use strict';
var card=document.querySelector('[data-latest-brief-card]');
if(!card)return;
fetch('/qilylean/daily/index.json?latest='+Date.now(),{cache:'no-store'})
  .then(function(response){
    if(!response.ok)throw new Error('Latest brief index is unavailable');
    return response.json();
  })
  .then(function(items){
    var latest=Array.isArray(items)&&items[0];
    if(!latest||!/^\d{4}-\d{2}-\d{2}$/.test(latest.date||''))return;
    var meta=card.querySelector('[data-latest-brief-meta]');
    var title=card.querySelector('[data-latest-brief-title]');
    var summary=card.querySelector('[data-latest-brief-summary]');
    var link=card.querySelector('[data-latest-brief-link]');
    if(meta)meta.textContent='最新：'+latest.date+'｜'+(latest.theme||'每日工程版简报');
    if(title)title.textContent=latest.title||'每日工程版简报';
    if(summary)summary.textContent=latest.summary||'查看最新一期每日工程版简报。';
    if(link)link.setAttribute('href','/qilylean/daily/'+latest.date+'.html');
    card.setAttribute('data-latest-brief-date',latest.date);
  })
  .catch(function(){});
})();
