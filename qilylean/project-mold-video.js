(function(){
'use strict';
var isHome=location.pathname==='/'||/(?:home|home-live|home-fixed)\.html$|(?:digital_human|qilylean)\/?$/i.test(location.pathname);
if(!isHome||document.getElementById('moldWarehouseProjectVideo'))return;
function mount(){
  var cards=[].slice.call(document.querySelectorAll('#projects .project'));
  var card=cards.find(function(item){
    var h=item.querySelector('h3');
    if(!h)return false;
    var title=h.textContent;
    return title.indexOf('智能模具库与可追溯管理')>-1||
           title.indexOf('1200+副模具标准化与二维码追溯')>-1||
           title.indexOf('1200副模具立体库')>-1;
  });
  if(!card){setTimeout(mount,180);return;}
  card.id='mold-warehouse-project';
  if(!document.getElementById('moldWarehouseProjectVideo')){
    var style=document.getElementById('moldWarehouseVideoStyle');
    if(!style){
      style=document.createElement('style');
      style.id='moldWarehouseVideoStyle';
      style.textContent='.project-video{margin:18px 0 4px;padding:14px;border:1px solid rgba(15,75,90,.16);border-radius:14px;background:#f7fbfa}.project-video h4{margin:0 0 10px;color:#0f4b5a;font-size:16px}.project-video video{display:block;width:100%;max-height:560px;border-radius:10px;background:#0b1113}.project-video p{margin:9px 2px 0;color:#607474;font-size:13px;line-height:1.6}.project-video-error{padding:18px;border-radius:10px;background:#fff3f0;color:#9a3f2b;font-weight:700}@media(max-width:760px){.project-video{padding:10px}.project-video video{max-height:420px}}';
      document.head.appendChild(style);
    }
    var box=document.createElement('section');
    box.id='moldWarehouseProjectVideo';
    box.className='project-video';
    box.innerHTML='<h4>项目现场视频｜智能模具库运行实录</h4><video controls preload="metadata" playsinline poster="/mold-smart-warehouse.png?v=20260718"><source src="/zhinengmujuku.mp4?v=20260718-7" type="video/mp4">您的浏览器暂不支持视频播放。</video><p>1200+副模具立体库｜库位管理、存取运行与数字化追溯现场记录</p>';
    var gallery=document.getElementById('moldProjectGalleryV2');
    if(gallery&&gallery.parentNode===card)gallery.insertAdjacentElement('afterend',box);else card.insertBefore(box,card.firstChild);
    var video=box.querySelector('video');
    video.addEventListener('error',function(){
      var msg=document.createElement('div');
      msg.className='project-video-error';
      msg.textContent='视频暂未加载成功，请稍后刷新或检查视频文件。';
      video.replaceWith(msg);
    },{once:true});
  }
  if(location.hash==='#mold-warehouse-project'){
    setTimeout(function(){card.scrollIntoView({behavior:'smooth',block:'start'});},120);
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
setTimeout(mount,500);
window.addEventListener('hashchange',mount);
})();