(function(){
  'use strict';
  if(window.__qilyLeanDirectNavigationInstalled)return;
  window.__qilyLeanDirectNavigationInstalled=true;

  var SELECTOR='nav[aria-label="网站导航"] a[href],.site-nav a[href]';
  var prefetched=Object.create(null);

  function getLink(target){
    return target&&target.closest?target.closest(SELECTOR):null;
  }

  function getUrl(link,doc){
    try{return new URL(link.href,doc.defaultView.location.href);}catch(error){return null;}
  }

  function prefetch(link,doc){
    var url=getUrl(link,doc);
    if(!url||url.origin!==location.origin||url.hash||prefetched[url.href])return;
    prefetched[url.href]=true;
    var hint=document.createElement('link');
    hint.rel='prefetch';
    hint.as='document';
    hint.href=url.href;
    document.head.appendChild(hint);
  }

  function handleIntent(event){
    var link=getLink(event.target);
    if(link)prefetch(link,link.ownerDocument||document);
  }

  function handleClick(event){
    if(event.defaultPrevented||event.button>0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    var link=getLink(event.target);
    if(!link||link.hasAttribute('download'))return;
    var target=(link.getAttribute('target')||'').toLowerCase();
    if(target==='_blank')return;
    var doc=link.ownerDocument||document;
    var url=getUrl(link,doc);
    if(!url||url.origin!==location.origin||!/^https?:$/.test(url.protocol))return;

    event.preventDefault();
    event.stopImmediatePropagation();

    try{
      if(window.top&&window.top!==window.self)window.top.location.assign(url.href);
      else window.location.assign(url.href);
    }catch(error){
      window.location.href=url.href;
    }
  }

  document.addEventListener('pointerover',handleIntent,{capture:true,passive:true});
  document.addEventListener('touchstart',handleIntent,{capture:true,passive:true});
  document.addEventListener('click',handleClick,true);
})();
