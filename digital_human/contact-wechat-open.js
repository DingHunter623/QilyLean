(function(){
  var WECHAT_ID='Qily259';
  function copyText(text){
    if(navigator.clipboard&&window.isSecureContext){
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function(resolve,reject){
      try{
        var input=document.createElement('input');
        input.value=text;
        input.style.position='fixed';
        input.style.left='-9999px';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        input.remove();
        resolve();
      }catch(e){reject(e);}
    });
  }
  function openWeChat(){
    var started=Date.now();
    window.location.href='weixin://';
    setTimeout(function(){
      if(Date.now()-started<1800){
        window.location.href='https://weixin.qq.com/';
      }
    },1200);
  }
  function patch(){
    var panel=document.querySelector('.wx-panel');
    if(!panel)return;
    var oldTip=panel.querySelector('.wx-tip');
    if(oldTip)oldTip.textContent='点击下方按钮后，将自动复制微信号 Qily259，并尝试直接打开微信。进入微信后粘贴微信号即可添加。';
    var oldCopy=document.getElementById('copyWxBtn')||panel.querySelector('.wx-copy-btn');
    if(oldCopy&&oldCopy.dataset.wechatOpenReady!=='1'){
      oldCopy.dataset.wechatOpenReady='1';
      oldCopy.textContent='复制微信号并打开微信';
      oldCopy.onclick=function(e){
        e.preventDefault();
        e.stopPropagation();
        copyText(WECHAT_ID).then(function(){
          var toast=document.getElementById('floatToast');
          if(toast){toast.textContent='微信号已复制，正在打开微信…';toast.classList.add('show');setTimeout(function(){toast.classList.remove('show');},2200);}
          openWeChat();
        }).catch(function(){openWeChat();});
      };
    }
    var actionRow=panel.querySelector('.wx-action-row');
    if(actionRow){
      var links=actionRow.querySelectorAll('a');
      links.forEach(function(a){
        if(/微信|WeChat/i.test(a.textContent||''))a.remove();
      });
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patch);else patch();
  setTimeout(patch,300);
  setTimeout(patch,900);
  new MutationObserver(patch).observe(document.documentElement,{childList:true,subtree:true});
})();