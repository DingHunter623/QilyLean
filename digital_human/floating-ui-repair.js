(function(){
  function clamp(el,left,top){
    var m=8;
    return {
      left:Math.min(Math.max(m,left),Math.max(m,window.innerWidth-el.offsetWidth-m)),
      top:Math.min(Math.max(m,top),Math.max(m,window.innerHeight-el.offsetHeight-m))
    };
  }
  function copyText(text){
    if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(text);
    return new Promise(function(resolve,reject){
      try{var i=document.createElement('input');i.value=text;i.style.position='fixed';i.style.left='-9999px';document.body.appendChild(i);i.select();document.execCommand('copy');i.remove();resolve();}catch(e){reject(e);}
    });
  }
  function toast(msg){
    var el=document.getElementById('floatToast');
    if(!el){el=document.createElement('div');el.id='floatToast';el.className='float-toast';document.body.appendChild(el);}
    el.textContent=msg;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(function(){el.classList.remove('show');},2200);
  }
  function bindDock(){
    var dock=document.getElementById('floatDock');
    if(!dock||dock.dataset.fullRepair==='1')return;
    dock.dataset.fullRepair='1';dock.style.touchAction='none';
    var saved=null;try{saved=JSON.parse(localStorage.getItem('floatDockPos')||'null')}catch(e){}
    if(saved){var p=clamp(dock,saved.left,saved.top);dock.style.left=p.left+'px';dock.style.top=p.top+'px';dock.style.right='auto';dock.style.bottom='auto';}
    var down=false,moved=false,sx=0,sy=0,sl=0,st=0,action='';
    dock.onclick=null;
    dock.addEventListener('pointerdown',function(e){
      var btn=e.target.closest('.float-btn');if(!btn)return;
      down=true;moved=false;action=btn.dataset.action||'';
      var r=dock.getBoundingClientRect();sx=e.clientX;sy=e.clientY;sl=r.left;st=r.top;
      dock.style.left=sl+'px';dock.style.top=st+'px';dock.style.right='auto';dock.style.bottom='auto';
      try{dock.setPointerCapture(e.pointerId)}catch(err){}
    });
    dock.addEventListener('pointermove',function(e){
      if(!down)return;var dx=e.clientX-sx,dy=e.clientY-sy;
      if(Math.abs(dx)>4||Math.abs(dy)>4)moved=true;if(!moved)return;
      e.preventDefault();var p=clamp(dock,sl+dx,st+dy);dock.style.left=p.left+'px';dock.style.top=p.top+'px';
    });
    dock.addEventListener('pointerup',function(e){
      if(!down)return;down=false;try{dock.releasePointerCapture(e.pointerId)}catch(err){}
      if(moved){var r=dock.getBoundingClientRect();localStorage.setItem('floatDockPos',JSON.stringify({left:r.left,top:r.top}));return;}
      if(action==='home'){
        if(/\/home\.html$|\/digital_human\/?$/i.test(location.pathname))window.scrollTo({top:0,behavior:'smooth'});else location.href='home.html';
      }else if(action==='share'){
        var u=location.href.split('#')[0];
        if(navigator.share)navigator.share({title:document.title,url:u}).catch(function(){});else copyText(document.title+'\n'+u).then(function(){toast('链接已复制');});
      }else if(action==='contact'){
        var mask=document.getElementById('wxMask');if(mask)mask.classList.add('show');
      }
    });
    dock.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();},true);
  }
  function bindContact(){
    var mask=document.getElementById('wxMask');if(!mask||mask.dataset.fullRepair==='1')return;
    mask.dataset.fullRepair='1';
    var close=document.getElementById('wxCloseBtn');if(close)close.onclick=function(e){e.preventDefault();e.stopPropagation();mask.classList.remove('show');};
    mask.addEventListener('click',function(e){if(e.target===mask)mask.classList.remove('show');});
  }
  function bindVoice(){
    var card=document.getElementById('voiceCard');var mini=document.getElementById('voiceMini');
    [card,mini].forEach(function(el){
      if(!el||el.dataset.fullRepair==='1')return;el.dataset.fullRepair='1';el.style.touchAction='none';
      var key=el===mini?'voiceMiniPos':'voicePos';var saved=null;try{saved=JSON.parse(localStorage.getItem(key)||'null')}catch(e){}
      if(saved){var p=clamp(el,saved.left,saved.top);el.style.left=p.left+'px';el.style.top=p.top+'px';el.style.right='auto';el.style.bottom='auto';}
      var down=false,moved=false,sx=0,sy=0,sl=0,st=0;
      el.addEventListener('pointerdown',function(e){
        if(!e.target.closest('.voice-head,.voice-mini'))return;
        if(e.target.closest('button,input,select,textarea,a'))return;
        down=true;moved=false;var r=el.getBoundingClientRect();sx=e.clientX;sy=e.clientY;sl=r.left;st=r.top;
        el.style.left=sl+'px';el.style.top=st+'px';el.style.right='auto';el.style.bottom='auto';
        try{el.setPointerCapture(e.pointerId)}catch(err){}
      });
      el.addEventListener('pointermove',function(e){
        if(!down)return;var dx=e.clientX-sx,dy=e.clientY-sy;
        if(Math.abs(dx)>3||Math.abs(dy)>3)moved=true;if(!moved)return;
        e.preventDefault();var p=clamp(el,sl+dx,st+dy);el.style.left=p.left+'px';el.style.top=p.top+'px';
      });
      el.addEventListener('pointerup',function(e){
        if(!down)return;down=false;try{el.releasePointerCapture(e.pointerId)}catch(err){}
        if(moved){var r=el.getBoundingClientRect();localStorage.setItem(key,JSON.stringify({left:r.left,top:r.top}));e.preventDefault();e.stopPropagation();}
      });
    });
    if(card){
      var play=document.getElementById('voicePlay'),pause=document.getElementById('voicePause'),stop=document.getElementById('voiceStop'),close=document.getElementById('voiceClose');
      [play,pause,stop,close].forEach(function(btn){if(btn)btn.style.pointerEvents='auto';});
    }
  }
  function apply(){bindDock();bindContact();bindVoice();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
  setTimeout(apply,300);setTimeout(apply,900);setTimeout(apply,1800);
  new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
})();