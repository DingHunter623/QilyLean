(function(){
  'use strict';

  if(window.__qilyFactoryPlanViewerReady)return;
  window.__qilyFactoryPlanViewerReady=true;

  var triggers=Array.prototype.slice.call(document.querySelectorAll('[data-plan-preview]'));
  if(!triggers.length)return;

  var activeIndex=0;
  var zoom=1;
  var baseWidth=0;
  var previousFocus=null;

  var lightbox=document.createElement('div');
  lightbox.className='factory-plan-lightbox';
  lightbox.setAttribute('aria-hidden','true');
  lightbox.innerHTML=[
    '<div class="factory-plan-lightbox-panel" role="dialog" aria-modal="true" aria-label="新工厂规划图纸在线预览">',
      '<div class="factory-plan-lightbox-toolbar">',
        '<button type="button" data-plan-action="close" aria-label="关闭图纸预览">×</button>',
        '<div class="factory-plan-lightbox-title"></div>',
        '<div class="factory-plan-lightbox-tools">',
          '<button type="button" data-plan-action="zoom-out" aria-label="缩小图纸">－</button>',
          '<button type="button" data-plan-action="reset" aria-label="恢复适合屏幕">适屏</button>',
          '<button type="button" data-plan-action="zoom-in" aria-label="放大图纸">＋</button>',
        '</div>',
      '</div>',
      '<button class="factory-plan-lightbox-nav prev" type="button" data-plan-action="prev" aria-label="上一张图纸">‹</button>',
      '<div class="factory-plan-lightbox-stage"><img alt="" draggable="false"></div>',
      '<button class="factory-plan-lightbox-nav next" type="button" data-plan-action="next" aria-label="下一张图纸">›</button>',
      '<div class="factory-plan-lightbox-footer">',
        '<div class="factory-plan-lightbox-counter"></div>',
        '<div class="factory-plan-lightbox-note">图纸仅限站内在线预览；页面不提供下载与打印功能。</div>',
      '</div>',
    '</div>'
  ].join('');
  document.body.appendChild(lightbox);

  var stage=lightbox.querySelector('.factory-plan-lightbox-stage');
  var viewer=stage.querySelector('img');
  var title=lightbox.querySelector('.factory-plan-lightbox-title');
  var counter=lightbox.querySelector('.factory-plan-lightbox-counter');
  var prevButton=lightbox.querySelector('[data-plan-action="prev"]');
  var nextButton=lightbox.querySelector('[data-plan-action="next"]');
  var note=lightbox.querySelector('.factory-plan-lightbox-note');
  var defaultNote=note.textContent;
  var touchStart=null;

  function cardOf(trigger){return trigger.closest('.factory-plan-card');}
  function titleOf(trigger){
    var custom=trigger.getAttribute('data-plan-title');
    if(custom)return custom.trim();
    var heading=cardOf(trigger)&&cardOf(trigger).querySelector('h3');
    return heading?heading.textContent.trim():'新工厂规划图纸';
  }
  function previewSourceOf(trigger){
    var img=trigger.querySelector('img');
    if(!img)return '';
    return img.currentSrc||img.getAttribute('src')||'';
  }
  function sourceOf(trigger){
    var original=trigger.getAttribute('data-plan-source');
    if(original)return original;
    var img=trigger.querySelector('img');
    if(!img)return '';
    var srcset=img.getAttribute('srcset');
    if(srcset){
      var candidates=srcset.split(',').map(function(item){return item.trim().split(/\s+/)[0];}).filter(Boolean);
      if(candidates.length)return candidates[candidates.length-1];
    }
    return img.currentSrc||img.getAttribute('src')||'';
  }
  function calculateBaseWidth(){
    if(!viewer.naturalWidth||!viewer.naturalHeight)return;
    var maxWidth=Math.max(280,window.innerWidth-(window.innerWidth<620?24:120));
    var maxHeight=Math.max(240,window.innerHeight-(window.innerWidth<620?150:175));
    var fit=Math.min(maxWidth/viewer.naturalWidth,maxHeight/viewer.naturalHeight,1);
    baseWidth=Math.max(1,Math.floor(viewer.naturalWidth*fit));
    renderZoom();
  }
  function renderZoom(){
    if(!baseWidth)return;
    viewer.style.width=Math.round(baseWidth*zoom)+'px';
    viewer.style.height='auto';
    viewer.style.maxWidth='none';
    stage.scrollTop=0;
    stage.scrollLeft=0;
  }
  function setZoom(value){
    zoom=Math.min(5,Math.max(.7,value));
    renderZoom();
  }
  function show(index){
    activeIndex=(index+triggers.length)%triggers.length;
    var trigger=triggers[activeIndex];
    zoom=1;
    baseWidth=0;
    viewer.removeAttribute('style');
    viewer.alt=titleOf(trigger)+'在线预览';
    title.textContent=titleOf(trigger);
    counter.textContent=(activeIndex+1)+' / '+triggers.length;
    prevButton.hidden=triggers.length<2;
    nextButton.hidden=triggers.length<2;
    note.textContent='高清原图加载中；完成后可适屏、缩放及连续切换。';
    viewer.onload=function(){note.textContent=defaultNote;calculateBaseWidth();};
    viewer.onerror=function(){
      var fallback=previewSourceOf(trigger);
      if(fallback&&viewer.getAttribute('src')!==fallback){
        note.textContent='高清原图暂未载入，已切换轻量预览。';
        viewer.src=fallback;
        return;
      }
      note.textContent='图纸暂未载入，请稍后重新打开。';
    };
    viewer.src=sourceOf(trigger);
  }
  function open(index,trigger){
    previousFocus=trigger||document.activeElement;
    show(index);
    lightbox.classList.add('show');
    lightbox.setAttribute('aria-hidden','false');
    document.body.classList.add('factory-plan-viewer-open');
    lightbox.querySelector('[data-plan-action="close"]').focus();
  }
  function close(){
    lightbox.classList.remove('show');
    lightbox.setAttribute('aria-hidden','true');
    document.body.classList.remove('factory-plan-viewer-open');
    viewer.onload=null;
    viewer.onerror=null;
    viewer.removeAttribute('src');
    if(previousFocus&&typeof previousFocus.focus==='function')previousFocus.focus();
  }

  triggers.forEach(function(trigger,index){
    trigger.setAttribute('title','点击进入站内图纸预览');
    trigger.addEventListener('click',function(){open(index,trigger);});
    trigger.addEventListener('contextmenu',function(event){event.preventDefault();});
    var img=trigger.querySelector('img');
    if(img){img.draggable=false;img.addEventListener('dragstart',function(event){event.preventDefault();});}
  });

  lightbox.addEventListener('click',function(event){
    var control=event.target.closest('[data-plan-action]');
    if(control){
      var action=control.getAttribute('data-plan-action');
      if(action==='close')close();
      else if(action==='prev')show(activeIndex-1);
      else if(action==='next')show(activeIndex+1);
      else if(action==='zoom-in')setZoom(zoom+.25);
      else if(action==='zoom-out')setZoom(zoom-.25);
      else if(action==='reset')setZoom(1);
      return;
    }
    if(event.target===lightbox)close();
  });
  lightbox.addEventListener('contextmenu',function(event){event.preventDefault();});
  viewer.addEventListener('dragstart',function(event){event.preventDefault();});
  viewer.addEventListener('dblclick',function(){setZoom(zoom===1?2:1);});
  viewer.addEventListener('wheel',function(event){
    if(!lightbox.classList.contains('show'))return;
    event.preventDefault();
    setZoom(zoom+(event.deltaY<0?.15:-.15));
  },{passive:false});
  stage.addEventListener('touchstart',function(event){
    if(event.touches.length!==1||zoom!==1){touchStart=null;return;}
    touchStart={x:event.touches[0].clientX,y:event.touches[0].clientY,time:Date.now()};
  },{passive:true});
  stage.addEventListener('touchend',function(event){
    if(!touchStart||!event.changedTouches.length||zoom!==1){touchStart=null;return;}
    var point=event.changedTouches[0];
    var dx=point.clientX-touchStart.x;
    var dy=point.clientY-touchStart.y;
    var elapsed=Date.now()-touchStart.time;
    touchStart=null;
    if(elapsed>800||Math.max(Math.abs(dx),Math.abs(dy))<45||triggers.length<2)return;
    if(Math.abs(dx)>Math.abs(dy))show(activeIndex+(dx<0?1:-1));
    else show(activeIndex+(dy<0?1:-1));
  },{passive:true});
  document.addEventListener('keydown',function(event){
    var protectedShortcut=(event.ctrlKey||event.metaKey)&&['p','s'].indexOf(event.key.toLowerCase())!==-1;
    if(protectedShortcut){
      event.preventDefault();
      if(lightbox.classList.contains('show'))note.textContent='图纸仅限在线预览，当前未开放下载、另存或打印功能。';
      return;
    }
    if(!lightbox.classList.contains('show'))return;
    if(event.key==='Escape')close();
    else if(event.key==='ArrowLeft')show(activeIndex-1);
    else if(event.key==='ArrowRight')show(activeIndex+1);
    else if(event.key==='+'||event.key==='=')setZoom(zoom+.25);
    else if(event.key==='-')setZoom(zoom-.25);
    else if(event.key==='0')setZoom(1);
  });
  window.addEventListener('resize',function(){
    if(lightbox.classList.contains('show'))calculateBaseWidth();
  },{passive:true});
  window.addEventListener('beforeprint',function(){
    if(lightbox.classList.contains('show'))close();
  });
})();
