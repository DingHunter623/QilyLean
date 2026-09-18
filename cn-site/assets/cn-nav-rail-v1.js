/* QilyLean CN Primary Navigation Rail V6 | 2026-09-18
 * Safari-safe custom primary-navigation scrollbar.
 * Visual geometry stays aligned with the international site, while drag behavior
 * is fully controlled by QilyLean instead of relying on native input[type=range].
 */
(function(d,w){'use strict';
if(w.__qilyCnNavRailV6)return;w.__qilyCnNavRailV6=true;

function navs(){
  return Array.prototype.slice.call(d.querySelectorAll('header.site-header nav.nav,header nav[aria-label="主导航"]'));
}
function ensureShell(nav){
  if(nav.parentElement&&nav.parentElement.classList.contains('qily-cn-nav-shell'))return nav.parentElement;
  var shell=d.createElement('div');
  shell.className='qily-cn-nav-shell';
  shell.setAttribute('data-qily-cn-nav-shell','v6');
  nav.parentNode.insertBefore(shell,nav);
  shell.appendChild(nav);
  return shell;
}
function metrics(nav,rail){
  var track=Math.max(0,rail.clientWidth);
  var scrollWidth=Math.max(nav.scrollWidth,nav.clientWidth);
  var maxScroll=Math.max(0,scrollWidth-nav.clientWidth);
  var thumb=maxScroll>0?Math.max(58,track*(nav.clientWidth/scrollWidth)):track;
  thumb=Math.min(track,thumb);
  var travel=Math.max(0,track-thumb);
  var ratio=maxScroll>0?Math.max(0,Math.min(1,nav.scrollLeft/maxScroll)):0;
  return {track:track,scrollWidth:scrollWidth,maxScroll:maxScroll,thumb:thumb,travel:travel,ratio:ratio};
}
function sync(nav,rail,thumb){
  var m=metrics(nav,rail);
  if(m.maxScroll<=1&&nav.scrollLeft!==0)nav.scrollLeft=0;
  thumb.style.width=m.thumb+'px';
  thumb.style.transform='translate3d('+(m.travel*m.ratio)+'px,-50%,0)';
  rail.setAttribute('data-qily-nav-overflow',m.maxScroll>1?'true':'false');
  rail.setAttribute('aria-disabled',m.maxScroll>1?'false':'true');
  rail.setAttribute('aria-valuenow',String(Math.round(m.ratio*100)));
  rail.setAttribute('aria-valuetext',String(Math.round(m.ratio*100))+'%');
  rail.tabIndex=m.maxScroll>1?0:-1;
}
function installRail(nav){
  if(!nav)return;
  var shell=ensureShell(nav);
  if(nav.dataset.qilyCnNavRail==='v6'&&shell.querySelector('.qily-primary-nav-scroll-rail'))return;
  var previous=(nav.closest('header')||shell).querySelector('.qily-primary-nav-scroll-rail');
  if(previous)previous.remove();
  nav.dataset.qilyCnNavRail='v6';
  if(!nav.id)nav.id='qilyCnPrimaryNavigation';

  var rail=d.createElement('div');
  rail.className='qily-primary-nav-scroll-rail';
  rail.setAttribute('role','scrollbar');
  rail.setAttribute('aria-label','一级导航左右滑动条');
  rail.setAttribute('aria-controls',nav.id);
  rail.setAttribute('aria-orientation','horizontal');
  rail.setAttribute('aria-valuemin','0');
  rail.setAttribute('aria-valuemax','100');

  var thumb=d.createElement('span');
  thumb.className='qily-primary-nav-scroll-thumb';
  thumb.setAttribute('aria-hidden','true');
  rail.appendChild(thumb);
  shell.appendChild(rail);

  var requestSync=function(){w.requestAnimationFrame(function(){sync(nav,rail,thumb);});};
  nav.addEventListener('scroll',requestSync,{passive:true});

  var activePointer=null,dragOffset=0;
  function setFromPointer(event){
    var m=metrics(nav,rail);
    if(m.maxScroll<=1)return;
    var rect=rail.getBoundingClientRect();
    var local=event.clientX-rect.left-dragOffset;
    var ratio=m.travel>0?Math.max(0,Math.min(1,local/m.travel)):0;
    nav.scrollLeft=ratio*m.maxScroll;
    rail.setAttribute('aria-valuenow',String(Math.round(ratio*100)));
    rail.setAttribute('aria-valuetext',String(Math.round(ratio*100))+'%');
    thumb.style.transform='translate3d('+(m.travel*ratio)+'px,-50%,0)';
  }
  rail.addEventListener('pointerdown',function(event){
    var m=metrics(nav,rail);
    if(event.button!==0||event.isPrimary===false||m.maxScroll<=1)return;
    var rect=rail.getBoundingClientRect();
    var thumbLeft=m.travel*m.ratio;
    var local=event.clientX-rect.left;
    var onThumb=event.target===thumb;
    dragOffset=onThumb?Math.max(0,Math.min(m.thumb,local-thumbLeft)):m.thumb/2;
    activePointer=event.pointerId;
    try{rail.focus({preventScroll:true});rail.setPointerCapture(activePointer);}catch(error){}
    setFromPointer(event);
    event.preventDefault();event.stopPropagation();
  },{passive:false});
  rail.addEventListener('pointermove',function(event){
    if(activePointer!==event.pointerId)return;
    setFromPointer(event);
    event.preventDefault();event.stopPropagation();
  },{passive:false});
  function finish(event){
    if(activePointer!==event.pointerId)return;
    try{rail.releasePointerCapture(activePointer);}catch(error){}
    activePointer=null;requestSync();
  }
  rail.addEventListener('pointerup',finish);
  rail.addEventListener('pointercancel',finish);

  rail.addEventListener('keydown',function(event){
    var m=metrics(nav,rail);
    if(m.maxScroll<=1)return;
    var delta=Math.max(36,nav.clientWidth*.12);
    if(event.key==='ArrowLeft')nav.scrollLeft=Math.max(0,nav.scrollLeft-delta);
    else if(event.key==='ArrowRight')nav.scrollLeft=Math.min(m.maxScroll,nav.scrollLeft+delta);
    else if(event.key==='Home')nav.scrollLeft=0;
    else if(event.key==='End')nav.scrollLeft=m.maxScroll;
    else return;
    event.preventDefault();requestSync();
  });

  if('ResizeObserver'in w){
    var ro=new ResizeObserver(requestSync);
    ro.observe(nav);ro.observe(shell);ro.observe(rail);
    var header=nav.closest('header');if(header)ro.observe(header);
  }
  requestSync();
  w.setTimeout(requestSync,120);
  w.setTimeout(requestSync,500);
  w.setTimeout(requestSync,1100);
}
function installNavDrag(nav){
  if(!nav||nav.dataset.qilyCnNavDrag==='v6')return;
  nav.dataset.qilyCnNavDrag='v6';
  var active=false,moved=false,startX=0,startY=0,startScroll=0,pointerId=null,suppressUntil=0;
  nav.addEventListener('pointerdown',function(event){
    if((event.pointerType&&event.pointerType!=='mouse')||event.button!==0||event.target.closest('select,option,input,button'))return;
    active=true;moved=false;pointerId=event.pointerId;startX=event.clientX;startY=event.clientY;startScroll=nav.scrollLeft;
  });
  nav.addEventListener('pointermove',function(event){
    if(!active||event.pointerId!==pointerId)return;
    var dx=event.clientX-startX,dy=event.clientY-startY;
    if(!moved&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){
      moved=true;nav.classList.add('qily-nav-pointer-dragging');
    }
    if(!moved)return;
    nav.scrollLeft=startScroll-dx;
    event.preventDefault();
  },{passive:false});
  function end(event){
    if(!active||event.pointerId!==pointerId)return;
    if(moved)suppressUntil=Date.now()+220;
    active=false;moved=false;pointerId=null;nav.classList.remove('qily-nav-pointer-dragging');
  }
  nav.addEventListener('pointerup',end);
  nav.addEventListener('pointercancel',end);
  nav.addEventListener('click',function(event){
    if(Date.now()<suppressUntil){event.preventDefault();event.stopPropagation();}
  },true);
}
function boot(){navs().forEach(function(nav){installRail(nav);installNavDrag(nav);});}
function resync(){
  navs().forEach(function(nav){
    var shell=nav.closest('.qily-cn-nav-shell');
    var rail=shell&&shell.querySelector('.qily-primary-nav-scroll-rail');
    var thumb=rail&&rail.querySelector('.qily-primary-nav-scroll-thumb');
    if(rail&&thumb)sync(nav,rail,thumb);
  });
}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
w.addEventListener('resize',resync,{passive:true});
w.addEventListener('pageshow',function(){boot();resync();},{passive:true});
})(document,window);