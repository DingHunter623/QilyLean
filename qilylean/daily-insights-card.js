(function(){
'use strict';
function addCard(){
  var sec=document.getElementById('knowledge');
  if(!sec)return;
  var grid=sec.querySelector('.knowledge-grid');
  if(!grid)return;
  var card=document.getElementById('dailyInsightsKnowledgeCard');
  if(!card){card=document.createElement('article');card.className='knowledge-card';card.id='dailyInsightsKnowledgeCard';grid.insertBefore(card,grid.firstChild);}
  card.innerHTML='<small>每日工程简报</small><h3>每日工程版简报</h3><p>聚焦精益生产、IE、PMC、ERP/MES、数智化工厂、AI工具、汽车电子与半导体制造，按日期沉淀工程视角的行业洞察、管理启发与行动建议。</p><ul class="knowledge-tags"><li>精益/IE</li><li>数智化工厂</li><li>汽车电子</li></ul><div class="knowledge-actions"><a class="button" href="/qilylean/daily-insights.html" target="_top">查看简报目录</a></div>';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addCard,{once:true});else addCard();
window.addEventListener('load',addCard,{once:true});
setTimeout(addCard,400);setTimeout(addCard,1200);
})();