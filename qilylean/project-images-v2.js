(function(){
'use strict';
function addStyle(){
  if(document.getElementById('projectImagesV2Style'))return;
  var s=document.createElement('style');
  s.id='projectImagesV2Style';
  s.textContent='.project-media-v2{margin:-22px -22px 18px;border-bottom:1px solid var(--line);background:#eef3f5;overflow:hidden}.project-media-v2 img{display:block;width:100%;height:auto;object-fit:contain;background:#eef3f5}.project-media-v2 figcaption{padding:10px 14px;color:var(--muted);background:#f8fbfa;font-size:14px;line-height:1.55;font-weight:750}.project-photo-grid-v2{display:grid;grid-template-columns:1fr 1fr;gap:1px;align-items:start;background:var(--line)}.project-photo-grid-v2>div{position:relative;background:#eef3f5}.project-photo-grid-v2 span{position:absolute;left:10px;bottom:10px;padding:4px 9px;color:#fff;background:rgba(15,75,90,.88);font-size:13px;font-weight:900}.mold-gallery-v2{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line)}.mold-gallery-v2 .mold-main-v2{grid-column:1/-1}.mold-gallery-v2>div{position:relative;background:#eef3f5}.mold-gallery-v2 span{position:absolute;left:10px;bottom:10px;padding:4px 9px;color:#fff;background:rgba(15,75,90,.88);font-size:13px;font-weight:900}@media(max-width:760px){.project-photo-grid-v2,.mold-gallery-v2{grid-template-columns:1fr}.mold-gallery-v2 .mold-main-v2{grid-column:auto}}';
  document.head.appendChild(s);
}
function findProject(words){
  var cards=[].slice.call(document.querySelectorAll('#projects .project'));
  return cards.find(function(card){var h=card.querySelector('h3');if(!h)return false;return words.some(function(w){return h.textContent.indexOf(w)>-1;});});
}
function addFuse(){
  var card=findProject(['切口工艺改良','玻璃管保险丝切口断裂率改善']);
  if(!card)return;
  var old=card.querySelector('#fuseCuttingProjectImages,.fuse-project-media');if(old)old.remove();
  if(card.querySelector('#fuseProjectImagesV2'))return;
  var h=card.querySelector('h3');if(h)h.textContent='玻璃管保险丝切口断裂率改善';
  var f=document.createElement('figure');f.id='fuseProjectImagesV2';f.className='project-media-v2';
  f.innerHTML='<div class="project-photo-grid-v2"><div><img src="/fuse-cutting-after.jpg?v=20260718-4" alt="玻璃管保险丝改善后成品"><span>改善后成品</span></div><div><img src="/fuse-cutting-before.jpg?v=20260718-4" alt="玻璃管保险丝改善后半成品"><span>改善后半成品</span></div></div><figcaption>玻璃管保险丝切口断裂率改善｜改善后成品与半成品实物</figcaption>';
  card.insertBefore(f,card.firstChild);
}
function addMold(){
  var card=findProject(['智能模具库与可追溯管理','1200+副模具标准化与二维码追溯']);
  if(!card)return;
  var old=card.querySelector('#moldWarehouseProjectImage,#moldProjectImageV2,#moldProjectGalleryV2');if(old)old.remove();
  var f=document.createElement('figure');f.id='moldProjectGalleryV2';f.className='project-media-v2';
  f.innerHTML='<div class="mold-gallery-v2"><div class="mold-main-v2"><img src="/%E7%AB%8B%E4%BD%93%E5%BA%93%E9%9B%8F%E5%BD%A2.png?v=20260718-4" alt="模具智能立体库现场"><span>现场实景</span></div><div><img src="/mold-warehouse-layout.jpg?v=20260718-4" alt="模具智能立体库布局规划"><span>Layout规划</span></div><div><img src="/%E6%99%BA%E8%83%BD%E7%AB%8B%E4%BD%93%E5%BA%93%E7%B3%BB%E7%BB%9F.jpg?v=20260718-4" alt="智能存取立体货仓系统界面"><span>系统界面</span></div></div><figcaption>智能模具库｜库位与追溯管理｜1200+副模具立体库：现场、Layout规划与智能存取系统</figcaption>';
  card.insertBefore(f,card.firstChild);
}
function addDigitalFactory(){
  var card=findProject(['ERP/MES/APS协同与IE基础数据治理','数智化工厂｜数据地基']);
  if(!card)return;
  var old=card.querySelector('#digitalFactoryProjectImageV2');if(old)old.remove();
  var f=document.createElement('figure');f.id='digitalFactoryProjectImageV2';f.className='project-media-v2';
  f.innerHTML='<img src="https://raw.githubusercontent.com/DingHunter623/QilyLean/main/shuzhihua.png?raw=1&v=20260718-6" alt="数智化工厂数据地基与制造运营协同"><figcaption>数智化工厂｜数据地基：ERP、MES、APS与IE基础数据协同</figcaption>';
  card.insertBefore(f,card.firstChild);
}
function run(){addStyle();addFuse();addMold();addDigitalFactory();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
setTimeout(run,300);
})();