(function(){
'use strict';
function addStyle(){if(document.getElementById('projectImagesV2Style'))return;var s=document.createElement('style');s.id='projectImagesV2Style';s.textContent='.project-media-v2{margin:-22px -22px 18px;border-bottom:1px solid var(--line);background:#eef3f5;overflow:hidden}.project-media-v2 img{display:block;width:100%;height:auto;object-fit:contain;background:#eef3f5}.project-media-v2 figcaption{padding:10px 14px;color:var(--muted);background:#f8fbfa;font-size:14px;line-height:1.55;font-weight:750}.project-photo-grid-v2,.mold-gallery-v2{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line)}.project-photo-grid-v2>div,.mold-gallery-v2>div{position:relative;background:#eef3f5}.project-photo-grid-v2 span,.mold-gallery-v2 span{position:absolute;left:10px;bottom:10px;padding:4px 9px;color:#fff;background:rgba(15,75,90,.88);font-size:13px;font-weight:900}.mold-main-v2{grid-column:1/-1}}';document.head.appendChild(s)}
function findProject(words){return [].slice.call(document.querySelectorAll('#projects .project')).find(function(card){var h=card.querySelector('h3');return h&&words.some(function(w){return h.textContent.indexOf(w)>-1})})}
function addFuse(){var c=findProject(['切口工艺改良','玻璃管保险丝切口断裂率改善']);if(!c)return;var f=document.createElement('figure');f.className='project-media-v2';f.innerHTML='<div class="project-photo-grid-v2"><div><img src="/qilylean/fuse-cutting-after.jpg"><span>改善后成品</span></div><div><img src="/qilylean/fuse-cutting-before.jpg"><span>改善前状态</span></div></div>';c.insertBefore(f,c.firstChild)}
function addMold(){var c=findProject(['智能模具库与可追溯管理','1200+副模具标准化与二维码追溯']);if(!c)return;var f=document.createElement('figure');f.className='project-media-v2';f.innerHTML='<div class="mold-gallery-v2"><div class="mold-main-v2"><img src="/qilylean/mold-after1.png"><span>现场实景</span></div><div><img src="/qilylean/mold-after2.jpg"><span>改善后</span></div><div><img src="/qilylean/mold-before.jpg"><span>改善前</span></div></div>';c.insertBefore(f,c.firstChild)}
function addDigitalFactory(){var c=findProject(['ERP/MES/APS协同与IE基础数据治理','数智化工厂｜数据地基']);if(!c)return;var f=document.createElement('figure');f.className='project-media-v2';f.innerHTML='<img src="/qilylean/shuzhihua.png">';c.insertBefore(f,c.firstChild)}
function run(){addStyle();addFuse();addMold();addDigitalFactory();addSMED()}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();setTimeout(run,300)})();
function addSMED(){
var c=findProject(['300T冲压机3.5T大型模具换模改善','大型模具｜SMED快速换型']);
if(!c)return;
var f=document.createElement('figure');
f.className='project-media-v2';
f.innerHTML='<img src="/300T.png">';
c.insertBefore(f,c.firstChild)
}
