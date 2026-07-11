(function(){
'use strict';
function addCard(){
 const sec=document.getElementById('knowledge');
 if(!sec||document.getElementById('gbt2828KnowledgeCard'))return;
 const grid=sec.querySelector('.knowledge-grid');
 if(!grid)return;
 const card=document.createElement('article');
 card.className='knowledge-card';
 card.id='gbt2828KnowledgeCard';
 card.innerHTML='<small>品质工具专题</small><h3>GB/T 2828 抽样检验实战培训</h3><p>简明掌握AQL、检验水平、样本量、Ac/Re、正常/加严/放宽切换，以及电子制造现场的使用技巧和常见误区。</p><ul class="knowledge-tags"><li>GB/T 2828</li><li>AQL</li><li>抽样检验</li></ul><div class="knowledge-actions"><a class="button" href="gbt2828.html">查看培训</a></div>';
 grid.insertBefore(card,grid.firstChild);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addCard,{once:true});else addCard();
setTimeout(addCard,500);setTimeout(addCard,1500);
})();