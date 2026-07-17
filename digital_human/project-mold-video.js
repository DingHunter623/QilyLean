(function(){
'use strict';
var isHome=location.pathname==='/'||/(?:home|home-live|home-fixed)\.html$|digital_human\/?$/i.test(location.pathname);
if(!isHome||document.getElementById('moldWarehouseProjectVideo'))return;
function mount(){
  var cards=[].slice.call(document.querySelectorAll('#projects .project'));
  var card=cards.find(function(item){var h=item.querySelector('h3');return h&&h.textContent.indexOf('智能模具库与可追溯管理')>-1;});
  if(!card){setTimeout(mount,160);return;}
  if(document.getElementById('moldWarehouseProjectVideo'))return;
  var style=document.getElementById('moldWarehouseVideoStyle');
  if(!style){style=document.createElement('style');style.id='moldWarehouseVideoStyle';style.textContent='.project-video{margin:18px 0 4px;padding:14px;border:1px solid rgba(15,75,90,.16);border-radius:14px;background:#f7fbfa}.project-video h4{margin:0 0 10px;color:#0f4b5a;font-size:16px}.project-video video{display:block;width:100%;max-height:560px;border-radius:10px;background:#0b1113}.project-video p{margin:9px 2px 0;color:#607474;font-size:13px;line-height:1.6}@media(max-width:760px){.project-video{padding:10px}.project-video video{max-height:420px}}';document.head.appendChild(style);}
  var box=document.createElement('section');
  box.id='moldWarehouseProjectVideo';
  box.className='project-video';
  box.innerHTML='<h4>项目现场视频｜智能模具库运行实录</h4><video controls preload="metadata" playsinline poster="/mold-smart-warehouse.png?v=20260718"><source src="/zhinengmujuku.mp4?v=20260718-4" type="video/mp4">您的浏览器暂不支持视频播放。</video><p>1200+副模具立体库｜库位管理、存取运行与数字化追溯现场记录</p>';
  var media=document.getElementById('moldWarehouseProjectImage');
  if(media&&media.parentNode===card)media.insertAdjacentElement('afterend',box);else card.insertBefore(box,card.firstChild);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();