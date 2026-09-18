/* QilyLean CN Primary Navigation Rail V2 | 2026-09-18
 * Mirrors the international-site primary navigation range rail.
 * Navigation-only owner: translation is exclusively owned by cn-translate-baidu-v1.js.
 */
(function(d,w){'use strict';
if(w.__qilyCnNavRailV2)return;w.__qilyCnNavRailV2=true;
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
  rail.setAttribute('data-qily-nav-overflow',maxScroll>1?'true':'false');
  rail.setAttribute('aria-valuetext',String(Math.round(value))+'%');
}
function install(nav){
  if(!nav||nav.dataset.qilyCnNavRail==='v2')return;
  var header=nav.closest('header');if(!header)return;
  var old=header.querySelector('input.qily-primary-nav-scroll-rail');if(old)old.remove();
  nav.dataset.qilyCnNavRail='v2';
  if(!nav.id)nav.id='qilyCnPrimaryNavigation';
  var rail=d.createElement('input');
  rail.type='range';rail.className='qily-primary-nav-scroll-rail';rail.min='0';rail.max='100';rail.step='.1';rail.value='0';
  rail.setAttribute('aria-label','一级导航左右滑动条');rail.setAttribute('aria-controls',nav.id);
  header.appendChild(rail);
  var raf=function(){w.requestAnimationFrame(function(){sync(nav,rail)})};
  nav.addEventListener('scroll',raf,{passive:true});
  rail.addEventListener('input',function(){var max=Math.max(0,nav.scrollWidth-nav.clientWidth);nav.scrollLeft=(Number(rail.value)||0)*max/100},{passive:true});
  rail.addEventListener('change',raf,{passive:true});
  raf();w.setTimeout(raf,120);w.setTimeout(raf,700);
}
function boot(){navs().forEach(install)}
function resync(){navs().forEach(function(nav){var h=nav.closest('header'),r=h&&h.querySelector('input.qily-primary-nav-scroll-rail');if(r)sync(nav,r)})}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
w.addEventListener('resize',resync,{passive:true});
w.addEventListener('pageshow',function(){boot();resync()},{passive:true});
})(document,window);
