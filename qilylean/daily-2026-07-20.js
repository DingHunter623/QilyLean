(function(){
'use strict';
function loadNextDaily(){if(document.getElementById('daily20260721Script'))return;var s=document.createElement('script');s.id='daily20260721Script';s.src='daily-2026-07-21.js?v=1';document.body.appendChild(s);}
loadNextDaily();
if(document.getElementById('2026-07-20'))return;
var archive=document.querySelector('.archive');if(!archive)return;
var article=document.createElement('article');
article.className='post';
article.id='2026-07-20';
article.innerHTML='<div class="visual"><img src="assets/daily-2026-07-20.svg" alt="精益体系建设从现场改善到数据治理"></div><div class="content"><div class="date">2026-07-20｜制造改善体系 <span class="dayno">DAY013</span></div><h2>精益改善的终点，是形成企业持续改善能力</h2><p>制造企业推进改善，不能只关注单项效率提升，而应建立从问题发现、数据分析、改善实施到标准固化的完整闭环。</p><div class="quote">优秀的精益体系，不依赖个人经验，而依靠标准、数据和机制持续运行。</div><p>从VSM价值流分析识别浪费，到标准工时支撑产能模型；从SMED快速换型提升柔性，到ERP/MES/APS实现数据协同，现场改善最终需要转化为企业能力。</p><p>真正的智能制造，不是先建设系统，而是先建立真实可靠的数据基础，让流程、人员、设备和信息形成闭环。</p><div class="tags"><span class="tag">精益体系</span><span class="tag">IE数据</span><span class="tag">数智化工厂</span><span class="tag">持续改善</span></div><button class="share" data-title="精益改善的终点，是形成企业持续改善能力">分享本条</button><span class="status"></span></div>';
archive.insertBefore(article,archive.firstElementChild);
var latest=document.querySelector('.nav a[href^="#2026-"]');if(latest)latest.setAttribute('href','#2026-07-20');
})();