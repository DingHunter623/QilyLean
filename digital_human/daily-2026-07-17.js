(function(){
'use strict';

function patchFuseProject(){
  if(!/(?:home|home-live)\.html$/i.test(location.pathname))return;
  var gallery=document.getElementById('fuseCuttingProjectImages');
  if(!gallery){setTimeout(patchFuseProject,120);return;}
  var card=gallery.closest('.project');
  if(card){var h3=card.querySelector('h3');if(h3)h3.textContent='玻璃管保险丝切口断裂率改善';}
  var imgs=gallery.querySelectorAll('img');
  var labels=gallery.querySelectorAll('.fuse-photo-grid span');
  if(imgs[0]){imgs[0].src='fuse-finished-product.svg?v=20260717-1';imgs[0].alt='玻璃管保险丝切口改善后成品';}
  if(imgs[1]){imgs[1].src='fuse-semi-finished.svg?v=20260717-1';imgs[1].alt='玻璃管保险丝切口改善后半成品';}
  if(labels[0])labels[0].textContent='改善后成品';
  if(labels[1])labels[1].textContent='改善后半成品';
  var caption=gallery.querySelector('figcaption');
  if(caption)caption.textContent='玻璃管保险丝切口断裂率改善｜改善后成品与半成品实物';
}

if(/(?:home|home-live)\.html$/i.test(location.pathname)){
  patchFuseProject();
  return;
}

if(!/daily-insights\.html$/i.test(location.pathname)||document.getElementById('2026-07-17'))return;
var archive=document.querySelector('.archive');if(!archive)return;
var article=document.createElement('article');article.className='post';article.id='2026-07-17';
article.innerHTML='<div class="visual"><img src="assets/daily-2026-07-17.svg" alt="现场越忙不代表交付越快"></div><div class="content"><div class="date">2026-07-17｜精益物流 <span class="dayno">DAY010</span></div><h2>现场越忙，不代表交付越快</h2><p>很多制造现场每天都在赶料、催料、找料，人员与车辆不停穿梭，看起来十分忙碌，交付却仍然不稳定。真正的问题往往不是搬运动作不够快，而是物料没有按照生产节拍和实际需求进行组织。</p><div class="quote">真正的精益物流，不是让物流部门更忙，而是让物料在正确的时间、以正确数量，到达正确的位置。</div><p>精益物流应从客户需求与生产计划出发，建立清晰的拉动规则、超市库存、补料频次、配送路线和工位定置。通过控制WIP、缩短搬运距离、减少重复搬运与等待，使物料流、信息流和生产节拍保持一致。</p><p>当物料能够按需拉动、按节拍补充，现场不再依赖临时催料和个人经验，品质、效率与交付才能真正稳定。真正高效的工厂，不是物料跑得快，而是物料根本不用到处跑。</p><div class="tags"><span class="tag">精益物流</span><span class="tag">Pull System</span><span class="tag">JIT</span><span class="tag">WIP控制</span></div><button class="share" data-title="现场越忙，不代表交付越快">分享本条</button><span class="status"></span></div>';
archive.insertBefore(article,archive.firstElementChild);
var latest=document.querySelector('.nav a[href^="#2026-"]');if(latest)latest.setAttribute('href','#2026-07-17');
})();