(function(){
'use strict';
function addCard(){
  var sec=document.getElementById('knowledge');
  if(!sec)return;
  var grid=sec.querySelector('.knowledge-grid');
  if(!grid)return;
  var card=document.getElementById('dailyInsightsKnowledgeCard');
  if(!card){card=document.createElement('article');card.className='knowledge-card';card.id='dailyInsightsKnowledgeCard';grid.insertBefore(card,grid.firstChild);}
  card.innerHTML='<small>每日工程简报｜最新：2026-07-24</small><h3>每日工程版简报</h3><p>简报已按日期拆分为独立网页。进入目录选择某一天，只加载本期内容，并可直接分享本期独立网址。</p><ul class="knowledge-tags"><li>精益/IE</li><li>数智化工厂</li><li>汽车电子</li></ul><div class="knowledge-actions"><a class="button" href="/qilylean/daily-insights.html" target="_top">查看简报目录</a><a class="button" href="/qilylean/daily/2026-07-24.html" target="_top">查看最新简报</a></div>';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addCard,{once:true});else addCard();
window.addEventListener('load',addCard,{once:true});
setTimeout(addCard,400);setTimeout(addCard,1200);
})();
