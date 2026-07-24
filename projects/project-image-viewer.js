(function(){
  'use strict';

  if(window.__qilyProjectImageViewerReady)return;
  window.__qilyProjectImageViewerReady=true;

  var images=Array.prototype.slice.call(document.querySelectorAll('.project-detail-page main img')).filter(function(img){
    return !img.closest('.project-lightbox');
  });
  if(!images.length)return;

  var activeIndex=0;
  var zoom=1;
  var baseWidth=0;
  var previousFocus=null;

  var lightbox=document.createElement('div');
  lightbox.className='project-lightbox';
  lightbox.setAttribute('aria-hidden','true');
  lightbox.innerHTML=[
    '<div class="project-lightbox-panel" role="dialog" aria-modal="true" aria-label="代表项目图片放大查看">',
      '<div class="project-lightbox-toolbar">',
        '<button type="button" data-image-action="close" aria-label="关闭图片">×</button>',
        '<span class="project-lightbox-counter"></span>',
        '<div class="project-lightbox-tools">',
          '<button type="button" data-image-action="zoom-out" aria-label="缩小">−</button>',
          '<button type="button" data-image-action="reset" aria-label="恢复适合屏幕">适屏</button>',
          '<button type="button" data-image-action="zoom-in" aria-label="放大">＋</button>',
          '<button type="button" data-image-action="original">查看原图</button>',
        '</div>',
      '</div>',
      '<button class="project-lightbox-nav prev" type="button" data-image-action="prev" aria-label="上一张">‹</button>',
      '<div class="project-lightbox-stage"><img alt=""></div>',
      '<button class="project-lightbox-nav next" type="button" data-image-action="next" aria-label="下一张">›</button>',
      '<div class="project-lightbox-caption"></div>',
    '</div>'
  ].join('');
  document.body.appendChild(lightbox);

  var stage=lightbox.querySelector('.project-lightbox-stage');
  var viewer=stage.querySelector('img');
  var caption=lightbox.querySelector('.project-lightbox-caption');
  var counter=lightbox.querySelector('.project-lightbox-counter');
  var prevButton=lightbox.querySelector('[data-image-action="prev"]');
  var nextButton=lightbox.querySelector('[data-image-action="next"]');

  function imageCaption(img){
    var figure=img.closest('figure');
    var figcaption=figure&&figure.querySelector('figcaption');
    return (figcaption&&figcaption.textContent.trim())||img.alt||'代表项目图片';
  }

  function sourceOf(img){return img.currentSrc||img.getAttribute('src')||'';}
  function calculateBaseWidth(){if(!viewer.naturalWidth||!viewer.naturalHeight)return;var maxWidth=Math.max(280,window.innerWidth-(window.innerWidth<620?24:120));var maxHeight=Math.max(240,window.innerHeight-(window.innerWidth<620?150:175));var fit=Math.min(maxWidth/viewer.naturalWidth,maxHeight/viewer.naturalHeight,1);baseWidth=Math.max(1,Math.floor(viewer.naturalWidth*fit));renderZoom();}
  function renderZoom(){if(!baseWidth)return;viewer.style.width=Math.round(baseWidth*zoom)+'px';viewer.style.maxWidth='none';viewer.style.height='auto';stage.scrollTop=0;stage.scrollLeft=0;}
  function setZoom(value){zoom=Math.min(4,Math.max(.75,value));renderZoom();}
  function show(index){activeIndex=(index+images.length)%images.length;var source=images[activeIndex];zoom=1;baseWidth=0;viewer.removeAttribute('style');viewer.alt=source.alt||'代表项目图片';caption.textContent=imageCaption(source);counter.textContent=(activeIndex+1)+' / '+images.length;prevButton.hidden=images.length<2;nextButton.hidden=images.length<2;viewer.src=sourceOf(source);viewer.onload=calculateBaseWidth;}
  function open(index,trigger){previousFocus=trigger||document.activeElement;show(index);lightbox.classList.add('show');lightbox.setAttribute('aria-hidden','false');document.body.classList.add('project-lightbox-open');lightbox.querySelector('[data-image-action="close"]').focus();}
  function close(){lightbox.classList.remove('show');lightbox.setAttribute('aria-hidden','true');document.body.classList.remove('project-lightbox-open');viewer.removeAttribute('src');if(previousFocus&&typeof previousFocus.focus==='function')previousFocus.focus();}

  images.forEach(function(img,index){img.classList.add('project-zoomable');img.setAttribute('tabindex','0');img.setAttribute('role','button');img.setAttribute('title','点击放大查看');img.setAttribute('aria-label','放大查看：'+imageCaption(img));img.addEventListener('click',function(){open(index,img);});img.addEventListener('keydown',function(event){if(event.key==='Enter'||event.key===' '){event.preventDefault();open(index,img);}});});
  lightbox.addEventListener('click',function(event){var action=event.target.closest('[data-image-action]');if(action){var name=action.getAttribute('data-image-action');if(name==='close')close();else if(name==='prev')show(activeIndex-1);else if(name==='next')show(activeIndex+1);else if(name==='zoom-in')setZoom(zoom+.25);else if(name==='zoom-out')setZoom(zoom-.25);else if(name==='reset')setZoom(1);else if(name==='original')window.open(sourceOf(images[activeIndex]),'_blank','noopener');return;}if(event.target===lightbox)close();});
  viewer.addEventListener('dblclick',function(){setZoom(zoom===1?2:1);});
  viewer.addEventListener('wheel',function(event){if(!lightbox.classList.contains('show'))return;event.preventDefault();setZoom(zoom+(event.deltaY<0?.15:-.15));},{passive:false});
  document.addEventListener('keydown',function(event){if(!lightbox.classList.contains('show'))return;if(event.key==='Escape')close();else if(event.key==='ArrowLeft'&&images.length>1)show(activeIndex-1);else if(event.key==='ArrowRight'&&images.length>1)show(activeIndex+1);else if(event.key==='+'||event.key==='=')setZoom(zoom+.25);else if(event.key==='-')setZoom(zoom-.25);else if(event.key==='0')setZoom(1);});
  window.addEventListener('resize',function(){if(lightbox.classList.contains('show'))calculateBaseWidth();},{passive:true});
})();
