(function(){
'use strict';
function apply(){
var sec=document.getElementById('experience');
if(sec){
var head=sec.querySelector('.head,.section-head');
if(head){var h=head.querySelector('h2'),p=head.querySelector('p');if(h)h.textContent='履历主线（加密）';if(p)p.textContent='详细内容已加密保护，请输入访问口令查看。';}
var lockText=sec.querySelector('.experience-lock-card p');if(lockText)lockText.textContent='详细内容已加密保护，请输入访问口令查看。';
}
document.querySelectorAll('.answer,.assistant-answer,.answer-box').forEach(function(el){var t=(el.textContent||'').trim();if(t.indexOf('改善经验栏目不是文章数量展示')>=0||t.indexOf('目前六个核心方向分别对应')>=0){el.textContent='改善经验栏目围绕制造现场的知识沉淀与方法复用，覆盖VSM价值流、标准工时、SMED、ERP/MES协同、IE数据底座和目视化管理等方向。每项内容按照“问题场景—关键概念—数据口径—实施步骤—常见误区—案例结果—可复用模板”展开，重点说明方法边界、实施逻辑与现场应用。';}});
document.querySelectorAll('.wx-qr-image,.wx-panel img').forEach(function(img){img.remove();});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
setTimeout(apply,500);setTimeout(apply,1500);
})();