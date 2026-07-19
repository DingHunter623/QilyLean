(function(){
'use strict';
if(!/daily-insights\.html$/i.test(location.pathname)||document.getElementById('2026-07-18'))return;
var archive=document.querySelector('.archive');if(!archive)return;
var article=document.createElement('article');article.className='post';article.id='2026-07-18';
article.innerHTML='<div class="visual"><img src="assets/daily-2026-07-18.svg" alt="效率提升不是让设备跑得更快而是减少设备等待"></div><div class="content"><div class="date">2026-07-18｜OEE与设备效率 <span class="dayno">DAY011</span></div><h2>效率提升，不是让设备跑得更快，而是减少设备等待</h2><p>很多企业谈设备效率，第一反应是提高速度、增加产量。但真正拉低设备综合效率的，往往不是设备跑得不够快，而是设备频繁处于等待状态。</p><div class="quote">设备真正的效率，不取决于跑得多快，而取决于停得有多少。</div><p>等料、等人、等程序、等换型、等检验和等维修，都会持续侵蚀开动率、性能效率与质量率。改善OEE不能只盯着设备参数，而应从TPM点检、SMED换型、JIT供料、标准作业和一次合格率入手，系统消除停机与波动。</p><p>优秀的工厂，不是让设备始终处于运转状态，而是让每一分钟都尽可能创造客户价值。先识别损失，再消除等待，最后才是合理提速。</p><div class="tags"><span class="tag">OEE</span><span class="tag">TPM</span><span class="tag">SMED</span><span class="tag">设备效率</span></div><button class="share" data-title="效率提升，不是让设备跑得更快，而是减少设备等待">分享本条</button><span class="status"></span></div>';
var day012=document.getElementById('2026-07-19');
if(day012)day012.insertAdjacentElement('afterend',article);else archive.insertBefore(article,archive.firstElementChild);
var latest=document.querySelector('.nav a[href^="#2026-"]');if(latest&&!document.getElementById('2026-07-19'))latest.setAttribute('href','#2026-07-18');
})();