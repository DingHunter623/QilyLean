(function(){
'use strict';
if(!/daily-insights\.html$/i.test(location.pathname))return;
var archive=document.querySelector('.archive');if(!archive)return;
var article=document.getElementById('2026-07-19');
if(!article){
article=document.createElement('article');article.className='post';article.id='2026-07-19';
article.innerHTML='<div class="visual"><img src="assets/daily-2026-07-19.svg" alt="标准工时制造改善的数据起点"></div><div class="content"><div class="date">2026-07-19｜标准工时与制造基础数据 <span class="dayno">DAY012</span></div><h2>标准工时，不只是测时间，而是建立制造管理的共同语言</h2><p>很多企业做效率改善时，第一反应是增加人员、加快设备或压缩生产时间。但真正应该先回答的问题是：一个产品在既定条件下，究竟应该用多少时间完成？</p><div class="quote">标准工时不是限制员工效率，而是让企业知道改善到底创造了多少价值。</div><p>标准工时是制造管理的基础数据，它连接IE效率分析、人员配置、产能规划、生产排程、成本核算、ERP/MES基础数据与改善收益评估。没有可靠的标准工时，改善前后的差异无法量化，计划无法精准，资源投入也难以合理配置。</p><p>真正有效的制造改善，不是凭经验判断，而是用标准定义现状，用数据发现浪费，用改善提升能力。当标准工时持续维护并与系统数据联动时，企业才真正具备稳定的产能管理与持续改善基础。</p><div class="tags"><span class="tag">标准工时</span><span class="tag">IE</span><span class="tag">产能规划</span><span class="tag">ERP/MES</span></div><button class="share" data-title="标准工时，不只是测时间，而是建立制造管理的共同语言">分享本条</button><span class="status"></span></div>';
}
function pinLatest(){var a=document.querySelector('.archive'),p=document.getElementById('2026-07-19');if(a&&p&&a.firstElementChild!==p)a.insertBefore(p,a.firstElementChild);var latest=document.querySelector('.nav a[href^="#2026-"]');if(latest)latest.setAttribute('href','#2026-07-19');}
pinLatest();setTimeout(pinLatest,200);setTimeout(pinLatest,800);setTimeout(pinLatest,1600);
})();