/* QilyLean CN Primary Navigation Rail V3 | 2026-09-18
 * Exact interaction parity with the international primary navigation:
 * - range rail scrolls the nav
 * - pointer drag on the rail maps directly to scrollLeft
 * - desktop drag on nav scrolls horizontally without accidental link activation
 * - rail is hidden when there is no overflow, so it is never decorative-only
 */
(function(d,w){'use strict';
if(w.__qilyCnNavRailV3)return;w.__qilyCnNavRailV3=true;
function navs(){return Array.prototype.slice.call(d.querySelectorAll('header.site-header nav.nav,header nav[aria-label="主导航"]'))}
function geometry(nav,rail){
  var header=nav.closest('header');if(!header)return;
  var nr=nav.getBoundingClientRect(),hr=header.getBoundingClientRect();
  rail.style.left=Math.max(0,nr.left-hr.left)+'px';
  rail.style.width=Math.max(0,nr.width)+'px';
}
function sync(nav,rail){
  geometry(nav,rail);
  var track=Math.max(0,rail.clientWidth),scrollWidth=Math.max(nav.scrollWidth,nav.clientWidth),maxScroll=Math.max(0,scrollWidth-nav.clientWidth),value=maxScroll>0?(nav.scrollLeft/maxScroll)*100:0;
  var thumb=maxScroll>0?Math.max(58,track*(nav.clientWidth/scrollWidth)):track;thumb=Math.min(track,thumb);
  rail.value=String(Math.max(0,Math.min(100,value)));
  rail.style.setProperty('--qily-nav-range-thumb-width',thumb+'px');
  rail.disabled=maxScroll<=1;
  rail.tabIndex=maxScroll>1?0:-1;
  rail.setAttribute('data-qily-nav-overflow',maxScroll>1?'true':'false');
  rail.setAttribute('aria-hidden',maxScroll>1?'false':'true');
  rail.setAttribute('aria-valuetext',String(Math.round(value))+'%');
}
function installRail(nav){
  if(!nav||nav.dataset.qilyCnNavRail==='v3')return;
  var header=nav.closest('header');if(!header)return;
  var previous=header.querySelector('input.qily-primary-nav-scroll-rail');if(previous)previous.remove();
  nav.dataset.qilyCnNavRail='v3';
  if(!nav.id)nav.id='qilyCnPrimaryNavigation';
  var rail=d.createElement('input');
  rail.type='range';rail.className='qily-primary-nav-scroll-rail';rail.min='0';rail.max='100';rail.step='.1';rail.value='0';
  rail.setAttribute('aria-label','一级导航左右滑动条');rail.setAttribute('aria-controls',nav.id);
  header.appendChild(rail);
  var requestSync=function(){w.requestAnimationFrame(function(){sync(nav,rail)})};
  nav.addEventListener('scroll',requestSync,{passive:true});
  rail.addEventListener('input',function(){var max=Math.max(0,nav.scrollWidth-nav.clientWidth);nav.scrollLeft=(Number(rail.value)||0)*max/100},{passive:true});
  rail.addEventListener('change',requestSync,{passive:true});
  var activePointer=null;
  function setFromPointer(event){
    var rect=rail.getBoundingClientRect(),width=Math.max(1,rect.width),ratio=Math.max(0,Math.min(1,(event.clientX-rect.left)/width)),max=Math.max(0,nav.scrollWidth-nav.clientWidth);
    rail.value=String(ratio*100);nav.scrollLeft=ratio*max;rail.setAttribute('aria-valuetext',String(Math.round(ratio*100))+'%');
  }
  rail.addEventListener('pointerdown',function(event){
    if(event.button!==0||event.isPrimary===false||rail.disabled)return;
    activePointer=event.pointerId;
    try{rail.focus({preventScroll:true});rail.setPointerCapture(activePointer)}catch(error){}
    setFromPointer(event);event.preventDefault();event.stopPropagation();
  },{passive:false});
  rail.addEventListener('pointermove',function(event){
    if(activePointer!==event.pointerId)return;
    setFromPointer(event);event.preventDefault();event.stopPropagation();
  },{passive:false});
  function finish(event){
    if(activePointer!==event.pointerId)return;
    try{rail.releasePointerCapture(activePointer)}catch(error){}
    activePointer=null;requestSync();
  }
  rail.addEventListener('pointerup',finish);rail.addEventListener('pointercancel',finish);
  requestSync();w.setTimeout(requestSync,120);w.setTimeout(requestSync,700);
}
function installNavDrag(nav){
  if(!nav||nav.dataset.qilyCnNavDrag==='v3')return;
  nav.dataset.qilyCnNavDrag='v3';
  var active=false,moved=false,startX=0,startY=0,startScroll=0,pointerId=null,suppressUntil=0;
  nav.addEventListener('pointerdown',function(event){
    if((event.pointerType&&event.pointerType!=='mouse')||event.button!==0||event.target.closest('select,option,input,button'))return;
    active=true;moved=false;pointerId=event.pointerId;startX=event.clientX;startY=event.clientY;startScroll=nav.scrollLeft;
  });
  nav.addEventListener('pointermove',function(event){
    if(!active||event.pointerId!==pointerId)return;
    var dx=event.clientX-startX,dy=event.clientY-startY;
    if(!moved&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){moved=true;nav.classList.add('qily-nav-pointer-dragging')}
    if(!moved)return;
    nav.scrollLeft=startScroll-dx;event.preventDefault();
  },{passive:false});
  function end(event){
    if(!active||event.pointerId!==pointerId)return;
    if(moved)suppressUntil=Date.now()+220;
    active=false;moved=false;pointerId=null;nav.classList.remove('qily-nav-pointer-dragging');
  }
  nav.addEventListener('pointerup',end);nav.addEventListener('pointercancel',end);
  nav.addEventListener('click',function(event){
    if(Date.now()<suppressUntil){event.preventDefault();event.stopPropagation()}
  },true);
}
function boot(){navs().forEach(function(nav){installRail(nav);installNavDrag(nav)})}
function resync(){navs().forEach(function(nav){var h=nav.closest('header'),r=h&&h.querySelector('input.qily-primary-nav-scroll-rail');if(r)sync(nav,r)})}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
w.addEventListener('resize',resync,{passive:true});
w.addEventListener('pageshow',function(){boot();resync()},{passive:true});
})(document,window);
