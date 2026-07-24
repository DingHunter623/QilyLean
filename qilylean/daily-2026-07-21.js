(function(){
'use strict';
function loadNextDaily(){if(document.getElementById('daily20260722Script'))return;var s=document.createElement('script');s.id='daily20260722Script';s.src='daily-2026-07-22.js?v=20260724-howmuch-v5';document.body.appendChild(s);}
loadNextDaily();
if(document.getElementById('2026-07-21'))return;
var archive=document.querySelector('.archive');if(!archive)return;
var article=document.createElement('article');
article.className='post';
article.id='2026-07-21';
article.innerHTML='<div class="visual"><img src="assets/daily-2026-07-21.svg" alt="质量防错不是提醒员工小心而是让错误难以发生"></div><div class="content"><div class="date">2026-07-21｜质量防错 / Poka-Yoke <span class="dayno">DAY014</span></div><h2>防错不是提醒员工小心，而是让错误难以发生</h2><p>制造现场出现错装、漏装、反装或误操作后，最常见的对策是培训、通报和要求员工加强注意。但人在重复作业、换线赶产和疲劳状态下必然会产生波动，仅靠责任心无法长期保证零缺陷。</p><div class="quote">真正有效的防错，不是要求人永远不犯错，而是用结构和流程让错误无法继续流到下一站。</div><p>防错应优先从源头设计：利用形状、尺寸、方向或治具实现只能正确装配；通过传感器、互锁、计数和程序校验阻止漏装与误动作；在风险无法完全消除时，再设置声光报警和快速停机，把异常控制在发生点。</p><p>评估一项防错是否有效，不只看“有没有装置”，还要验证能否稳定识别异常、是否容易被绕过、故障时是否进入安全状态，以及点检责任是否明确。把经验提醒变成工程控制，质量才真正从检验走向预防。</p><div class="tags"><span class="tag">Poka-Yoke</span><span class="tag">源头质量</span><span class="tag">工程控制</span><span class="tag">零缺陷</span></div><button class="share" data-title="防错不是提醒员工小心，而是让错误难以发生">分享本条</button><span class="status"></span></div>';
archive.insertBefore(article,archive.firstElementChild);
var latest=document.querySelector('.nav a[href^="#2026-"]');if(latest)latest.setAttribute('href','#2026-07-21');
})();
