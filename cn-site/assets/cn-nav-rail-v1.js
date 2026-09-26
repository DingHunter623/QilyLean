/* QilyLean CN Primary Navigation Rail V7 | 2026-09-18
 * Cross-browser deterministic scrollbar for Safari / Chrome / Chromium-based browsers.
 * No native range and no PointerEvent dependency:
 * mouse => mousedown/mousemove/mouseup; touch => touchstart/touchmove/touchend.
 * Track and thumb are real DOM elements and directly map movement to nav.scrollLeft.
 */
(function(d,w){'use strict';
if(w.__qilyCnNavRailV7)return;w.__qilyCnNavRailV7=true;

var NAV_SELECTOR='header.site-header nav.nav,header nav[aria-label="主导航"]';

var CANONICAL_NAV_ITEMS=[
  {key:'home',href:'/',label:'首页'},
  {key:'lean',href:'/lean/',label:'精益制造'},
  {key:'projects',href:'/notes/',label:'代表项目'},
  {key:'knowledge',href:'/knowledge/',label:'知识分享'},
  {key:'briefs',href:'https://qilylean.com/global-knowledge/briefs/',label:'精选简报',external:true,title:'进入 QilyLean 国际站精选简报（新标签页）'},
  {key:'resources',href:'https://qilylean.com/links/cn-public/',label:'资源协同',external:true,title:'进入 QilyLean 国际站资源协同公开入口（新标签页）'},
  {key:'about',href:'/about/',label:'关于我们'}
];

function ensureCanonicalNavigation(nav){
  if(!nav||nav.getAttribute('aria-label')!=='主导航')return false;
  var expected=CANONICAL_NAV_ITEMS.map(function(item){
    var a=d.createElement('a');
    a.href=item.href;
    a.textContent=item.label;
    a.setAttribute('data-qily-nav-key',item.key);
    if(item.external)a.setAttribute('data-qily-external','international');
    if(item.external){
      a.target='_blank';
      a.rel='noopener noreferrer';
      if(item.title)a.title=item.title;
    }
    return a;
  });
  var current=Array.prototype.slice.call(nav.children).filter(function(node){
    return node.tagName==='A'&&node.hasAttribute('data-qily-nav-key');
  });
  var same=nav.getAttribute('data-qily-cn-nav-contract')==='20260926-v4'&&
    current.length===expected.length&&current.every(function(a,i){
      return a.getAttribute('data-qily-nav-key')===expected[i].getAttribute('data-qily-nav-key')&&
        a.textContent===expected[i].textContent&&a.href===expected[i].href;
    });
  if(same)return false;
  nav.textContent='';
  expected.forEach(function(a){nav.appendChild(a);});
  nav.setAttribute('data-qily-cn-nav-contract','20260926-v4');
  return true;
}


function navs(){return Array.prototype.slice.call(d.querySelectorAll(NAV_SELECTOR));}

function ensureShell(nav){
  if(nav.parentElement&&nav.parentElement.classList.contains('qily-cn-nav-shell')){
    nav.parentElement.setAttribute('data-qily-cn-nav-shell','v7');
    return nav.parentElement;
  }
  var shell=d.createElement('div');
  shell.className='qily-cn-nav-shell';
  shell.setAttribute('data-qily-cn-nav-shell','v7');
  nav.parentNode.insertBefore(shell,nav);
  shell.appendChild(nav);
  return shell;
}

function geometry(nav,rail){
  var track=Math.max(0,rail.clientWidth);
  var scrollWidth=Math.max(nav.scrollWidth,nav.clientWidth);
  var maxScroll=Math.max(0,scrollWidth-nav.clientWidth);
  var thumbWidth=maxScroll>0?Math.max(72,track*(nav.clientWidth/scrollWidth)):track;
  thumbWidth=Math.min(track,thumbWidth);
  var travel=Math.max(0,track-thumbWidth);
  var ratio=maxScroll>0?Math.max(0,Math.min(1,nav.scrollLeft/maxScroll)):0;
  return {track:track,scrollWidth:scrollWidth,maxScroll:maxScroll,thumbWidth:thumbWidth,travel:travel,ratio:ratio};
}

function sync(nav,rail,thumb){
  var g=geometry(nav,rail);
  thumb.style.width=g.thumbWidth+'px';
  thumb.style.transform='translate3d('+(g.travel*g.ratio)+'px,-50%,0)';
  rail.setAttribute('data-qily-nav-overflow',g.maxScroll>1?'true':'false');
  rail.setAttribute('aria-disabled',g.maxScroll>1?'false':'true');
  rail.setAttribute('aria-valuenow',String(Math.round(g.ratio*100)));
  rail.setAttribute('aria-valuetext',String(Math.round(g.ratio*100))+'%');
  rail.tabIndex=g.maxScroll>1?0:-1;
}

function installRail(nav){
  if(!nav)return;
  var shell=ensureShell(nav);
  var old=shell.querySelector('.qily-primary-nav-scroll-rail');
  if(old)old.remove();

  nav.dataset.qilyCnNavRail='v7';
  if(!nav.id)nav.id='qilyCnPrimaryNavigation';
  nav.scrollLeft=0;

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

  var framePending=false;
  function requestSync(){
    if(framePending)return;
    framePending=true;
    w.requestAnimationFrame(function(){framePending=false;sync(nav,rail,thumb);});
  }

  function setFromClientX(clientX,dragOffset){
    var g=geometry(nav,rail);
    if(g.maxScroll<=1)return;
    var rect=rail.getBoundingClientRect();
    var local=clientX-rect.left-dragOffset;
    var ratio=g.travel>0?Math.max(0,Math.min(1,local/g.travel)):0;
    nav.scrollLeft=ratio*g.maxScroll;
    thumb.style.transform='translate3d('+(g.travel*ratio)+'px,-50%,0)';
    rail.setAttribute('aria-valuenow',String(Math.round(ratio*100)));
    rail.setAttribute('aria-valuetext',String(Math.round(ratio*100))+'%');
  }

  var mouseActive=false,mouseOffset=0;
  function mouseDown(event){
    if(event.button!==0)return;
    var g=geometry(nav,rail);
    if(g.maxScroll<=1)return;
    var rect=rail.getBoundingClientRect();
    var local=event.clientX-rect.left;
    var thumbLeft=g.travel*g.ratio;
    mouseOffset=event.target===thumb?Math.max(0,Math.min(g.thumbWidth,local-thumbLeft)):g.thumbWidth/2;
    mouseActive=true;
    rail.classList.add('qily-nav-rail-dragging');
    try{rail.focus({preventScroll:true});}catch(error){rail.focus();}
    setFromClientX(event.clientX,mouseOffset);
    event.preventDefault();
    event.stopPropagation();
  }
  function mouseMove(event){
    if(!mouseActive)return;
    setFromClientX(event.clientX,mouseOffset);
    event.preventDefault();
  }
  function mouseUp(){
    if(!mouseActive)return;
    mouseActive=false;
    rail.classList.remove('qily-nav-rail-dragging');
    requestSync();
  }
  rail.addEventListener('mousedown',mouseDown,false);
  d.addEventListener('mousemove',mouseMove,{passive:false});
  d.addEventListener('mouseup',mouseUp,false);

  var touchActive=false,touchOffset=0,touchId=null;
  function findTouch(list,id){
    for(var i=0;i<list.length;i++)if(list[i].identifier===id)return list[i];
    return null;
  }
  rail.addEventListener('touchstart',function(event){
    var g=geometry(nav,rail);
    if(g.maxScroll<=1||!event.changedTouches.length)return;
    var touch=event.changedTouches[0],rect=rail.getBoundingClientRect();
    var local=touch.clientX-rect.left,thumbLeft=g.travel*g.ratio;
    touchId=touch.identifier;
    touchOffset=event.target===thumb?Math.max(0,Math.min(g.thumbWidth,local-thumbLeft)):g.thumbWidth/2;
    touchActive=true;
    rail.classList.add('qily-nav-rail-dragging');
    setFromClientX(touch.clientX,touchOffset);
    event.preventDefault();
  },{passive:false});
  rail.addEventListener('touchmove',function(event){
    if(!touchActive)return;
    var touch=findTouch(event.touches,touchId);
    if(!touch)return;
    setFromClientX(touch.clientX,touchOffset);
    event.preventDefault();
  },{passive:false});
  function touchEnd(event){
    if(!touchActive)return;
    var touch=findTouch(event.changedTouches,touchId);
    if(!touch)return;
    touchActive=false;touchId=null;
    rail.classList.remove('qily-nav-rail-dragging');
    requestSync();
  }
  rail.addEventListener('touchend',touchEnd,{passive:true});
  rail.addEventListener('touchcancel',touchEnd,{passive:true});

  rail.addEventListener('keydown',function(event){
    var g=geometry(nav,rail);
    if(g.maxScroll<=1)return;
    var delta=Math.max(40,nav.clientWidth*.14);
    if(event.key==='ArrowLeft')nav.scrollLeft=Math.max(0,nav.scrollLeft-delta);
    else if(event.key==='ArrowRight')nav.scrollLeft=Math.min(g.maxScroll,nav.scrollLeft+delta);
    else if(event.key==='Home')nav.scrollLeft=0;
    else if(event.key==='End')nav.scrollLeft=g.maxScroll;
    else return;
    event.preventDefault();
    requestSync();
  });

  nav.addEventListener('scroll',requestSync,{passive:true});

  if('ResizeObserver'in w){
    var ro=new ResizeObserver(requestSync);
    ro.observe(nav);ro.observe(shell);ro.observe(rail);
    var header=nav.closest('header');if(header)ro.observe(header);
  }
  if('MutationObserver'in w){
    var mo=new MutationObserver(requestSync);
    mo.observe(nav,{subtree:true,childList:true,characterData:true,attributes:true});
  }

  requestSync();
  w.setTimeout(requestSync,80);
  w.setTimeout(requestSync,250);
  w.setTimeout(requestSync,700);
  w.setTimeout(requestSync,1400);
}

function installNavMouseDrag(nav){
  if(!nav||nav.dataset.qilyCnNavMouseDrag==='v7')return;
  nav.dataset.qilyCnNavMouseDrag='v7';
  var active=false,moved=false,startX=0,startY=0,startScroll=0,suppressUntil=0;
  function down(event){
    if(event.button!==0||event.target.closest('select,option,input,button'))return;
    active=true;moved=false;startX=event.clientX;startY=event.clientY;startScroll=nav.scrollLeft;
  }
  function move(event){
    if(!active)return;
    var dx=event.clientX-startX,dy=event.clientY-startY;
    if(!moved&&Math.abs(dx)>7&&Math.abs(dx)>Math.abs(dy)){
      moved=true;nav.classList.add('qily-nav-pointer-dragging');
    }
    if(!moved)return;
    nav.scrollLeft=startScroll-dx;
    event.preventDefault();
  }
  function up(){
    if(!active)return;
    if(moved)suppressUntil=Date.now()+260;
    active=false;moved=false;
    nav.classList.remove('qily-nav-pointer-dragging');
  }
  nav.addEventListener('mousedown',down,false);
  d.addEventListener('mousemove',move,{passive:false});
  d.addEventListener('mouseup',up,false);
  nav.addEventListener('click',function(event){
    if(Date.now()<suppressUntil&&event.target.closest('a[href]')){
      event.preventDefault();event.stopImmediatePropagation();
    }
  },true);
}

function boot(){
  navs().forEach(function(nav){
    ensureCanonicalNavigation(nav);
    if(nav.dataset.qilyCnNavRail!=='v7')installRail(nav);
    installNavMouseDrag(nav);
  });
}
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

/* QILY-CN-CURRENT-MODULE-RUNTIME-V1 | 2026-09-22
 * Semantic fallback for every China-site route. It keeps aria-current correct
 * on nested knowledge pages and brings the active item into the horizontal
 * navigation viewport without moving the document vertically.
 */
(function(d,w){'use strict';
if(w.__qilyCnCurrentModuleV1)return;w.__qilyCnCurrentModuleV1=true;

function normalize(path){
  path=(path||'/').replace(/\/index\.html$/i,'/').replace(/\/{2,}/g,'/');
  if(path.length>1)path=path.replace(/\/+$/,'');
  return path||'/';
}
function routeKey(path){
  path=normalize(path);
  if(path==='/')return 'home';
  if(/^\/(?:lean|ie|standardization|factory|digital|methods)(?:\/|$)/.test(path))return 'lean';
  if(/^\/notes(?:\/|$)/.test(path))return 'projects';
  if(/^\/knowledge(?:\/|$)/.test(path))return 'knowledge';
  if(/^\/about(?:\/|$)/.test(path))return 'about';
  return '';
}
function mark(nav){
  if(!nav)return null;
  var current=normalize(w.location.pathname);
  var key=routeKey(current);
  var links=Array.prototype.slice.call(nav.querySelectorAll('a[href]'));
  var best=null,bestLength=-1;
  links.forEach(function(link){
    link.removeAttribute('aria-current');
    if(key&&link.getAttribute('data-qily-nav-key')===key){
      best=link;bestLength=999;return;
    }
    var url;
    try{url=new URL(link.getAttribute('href'),w.location.href);}catch(error){return;}
    if(url.origin!==w.location.origin)return;
    var target=normalize(url.pathname);
    if(target==='/'||target.length<2)return;
    if(current===target||current.indexOf(target+'/')===0){
      if(target.length>bestLength){best=link;bestLength=target.length;}
    }
  });
  if(best){
    best.setAttribute('aria-current','page');
    nav.setAttribute('data-qily-current-module',best.getAttribute('data-qily-nav-key')||normalize(new URL(best.href,w.location.href).pathname));
  }else{
    nav.removeAttribute('data-qily-current-module');
  }
  return best;
}
function reveal(nav,active){
  if(!nav||!active)return;
  w.requestAnimationFrame(function(){
    var left=active.offsetLeft;
    var right=left+active.offsetWidth;
    var viewLeft=nav.scrollLeft;
    var viewRight=viewLeft+nav.clientWidth;
    if(left>=viewLeft+8&&right<=viewRight-8)return;
    var target=Math.max(0,left-(nav.clientWidth-active.offsetWidth)/2);
    nav.scrollLeft=target;
    nav.dispatchEvent(new Event('scroll'));
  });
}
function boot(){
  Array.prototype.slice.call(d.querySelectorAll('header.site-header nav.nav,header nav[aria-label="主导航"]')).forEach(function(nav){
    reveal(nav,mark(nav));
  });
}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
w.addEventListener('pageshow',boot,{passive:true});
})(document,window);

/* QILY-CN-NAV-ARROW-CLOSURE-V12: labels above are canonical and include external arrows. */
