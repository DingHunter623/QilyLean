(function(){
 'use strict';
 function render(card,latest){
   var date=latest&&latest.date||'2026-07-29';
   var href='/qilylean/daily/'+date+'.html';
   card.innerHTML='<small>今日简报｜最新：'+date+'</small><h3>今日简报</h3><p>贯通PE、IE、NPI、ME、JIT、PDCA、PQCD、OEE、精益物流与Kaizen；每期均有独立网址，可连续翻阅与直接分享。</p><ul class="knowledge-tags"><li>工程体系</li><li>精益运营</li><li>项目交付</li></ul><div class="knowledge-actions"><a class="button" href="/qilylean/daily-insights.html" target="_top">查看简报目录</a><a class="button" href="'+href+'" target="_top">查看最新简报</a></div>';
 }
 function addCard(){
   var sec=document.getElementById('knowledge');
   if(!sec)return;
   var grid=sec.querySelector('.knowledge-grid');
   if(!grid)return;
   var card=document.getElementById('dailyInsightsKnowledgeCard');
   if(!card){card=document.createElement('article');card.className='knowledge-card';card.id='dailyInsightsKnowledgeCard';grid.insertBefore(card,grid.firstChild);}
   render(card);
   if(card.getAttribute('data-latest-loading')==='1')return;
   card.setAttribute('data-latest-loading','1');
   fetch('/qilylean/daily/index.json?latest='+Date.now(),{cache:'no-store'})
     .then(function(response){if(!response.ok)throw new Error('Latest brief index is unavailable');return response.json();})
     .then(function(items){var latest=Array.isArray(items)&&items[0];if(latest&&/^\d{4}-\d{2}-\d{2}$/.test(latest.date||''))render(card,latest);})
     .catch(function(){})
     .then(function(){card.removeAttribute('data-latest-loading');});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addCard,{once:true});else addCard();
 window.addEventListener('load',addCard,{once:true});
 setTimeout(addCard,400);setTimeout(addCard,1200);
})();
