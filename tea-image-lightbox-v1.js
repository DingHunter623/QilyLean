(function(){
 'use strict';
 if(window.__qilyTeaImageLightboxV1)return;
 window.__qilyTeaImageLightboxV1=true;
 const pageImages='main.tea-page img';
 const layer=document.createElement('div');
 layer.id='qilyTeaImageLightbox';
 layer.className='qily-tea-lightbox';
 layer.hidden=true;
 layer.setAttribute('role','dialog');
 layer.setAttribute('aria-modal','true');
 layer.setAttribute('aria-label','图片原图预览');
 layer.setAttribute('aria-hidden','true');
 layer.innerHTML='<div class="qily-tea-lightbox__backdrop" data-qily-lightbox-backdrop></div><div class="qily-tea-lightbox__stage"><img class="qily-tea-lightbox__image" alt=""></div><button type="button" class="qily-tea-lightbox__close" data-qily-lightbox-close aria-label="关闭图片预览" title="关闭">×</button>';
 document.body.appendChild(layer);
 const preview=layer.querySelector('.qily-tea-lightbox__image');
 const closeButton=layer.querySelector('[data-qily-lightbox-close]');
 let activeImage=null,scrollTop=0,previousOverflow='';
 function open(image){
  if(!(image instanceof HTMLImageElement)||!image.matches(pageImages))return;
  activeImage=image;
  scrollTop=window.scrollY||window.pageYOffset||0;
  previousOverflow=document.documentElement.style.overflow;
  preview.src=image.currentSrc||image.src;
  preview.alt=image.alt||'图片原图';
  preview.width=image.naturalWidth||image.width;
  preview.height=image.naturalHeight||image.height;
  layer.hidden=false;
  layer.setAttribute('aria-hidden','false');
  document.documentElement.style.overflow='hidden';
  closeButton.focus({preventScroll:true});
 }
 function close(){
  if(layer.hidden)return;
  layer.hidden=true;
  layer.setAttribute('aria-hidden','true');
  preview.removeAttribute('src');
  document.documentElement.style.overflow=previousOverflow;
  window.scrollTo(0,scrollTop);
  const restore=activeImage;
  activeImage=null;
  if(restore&&restore.isConnected)restore.focus({preventScroll:true});
 }
 document.querySelectorAll(pageImages).forEach(image=>{
  image.setAttribute('tabindex','0');
  image.setAttribute('role','button');
  image.setAttribute('aria-haspopup','dialog');
  if(!image.hasAttribute('aria-label'))image.setAttribute('aria-label','放大图片：'+(image.alt||'图片原图'));
 });
 document.addEventListener('click',event=>{
  const target=event.target;
  if(target instanceof Element&&target.closest('[data-qily-lightbox-close]')){close();return;}
  if(target===layer||(target instanceof Element&&target.matches('[data-qily-lightbox-backdrop]'))){close();return;}
  const image=target instanceof Element?target.closest(pageImages):null;
  if(image&&!layer.contains(image)){event.preventDefault();open(image);}
 });
 document.addEventListener('keydown',event=>{
  if(!layer.hidden&&event.key==='Escape'){event.preventDefault();close();return;}
  const target=event.target;
  if((event.key==='Enter'||event.key===' ')&&target instanceof HTMLImageElement&&target.matches(pageImages)){
   event.preventDefault();open(target);
  }
 });
 closeButton.addEventListener('click',close);
 window.__qilyTeaImageLightbox={open,close};
})();