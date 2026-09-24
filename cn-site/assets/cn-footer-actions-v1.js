/* QilyLean CN Footer Quick Actions V1 | 2026-09-24
 * Functional parity with the international-site actions:
 * Top => smooth scroll to top
 * Previous page => browser history.back(), then parent-route fallback
 * Share current => copy title + URL first, then open Web Share API; copied content remains usable after cancel
 */
(function(d,w){'use strict';
if(w.__qilyCnFooterActionsV1)return;w.__qilyCnFooterActionsV1=true;

function parentRoute(path){
  path=(path||'/').split('?')[0].split('#')[0].replace(/\/index\.html$/i,'/').replace(/\/{2,}/g,'/');
  if(path.length>1)path=path.replace(/\/+$/,'');
  if(!path||path==='/')return '/';
  var parts=path.split('/').filter(Boolean);
  if(parts.length<=1)return '/';
  parts.pop();
  return '/'+parts.join('/')+'/';
}

function toast(message){
  var node=d.getElementById('qilyCnFooterActionToast');
  if(!node){
    node=d.createElement('div');
    node.id='qilyCnFooterActionToast';
    node.className='qily-cn-footer-toast';
    node.setAttribute('role','status');
    node.setAttribute('aria-live','polite');
    node.setAttribute('aria-atomic','true');
    (d.body||d.documentElement).appendChild(node);
  }
  node.textContent=message;
  node.classList.add('is-visible');
  if(toast.timer)w.clearTimeout(toast.timer);
  toast.timer=w.setTimeout(function(){node.classList.remove('is-visible');},2200);
}

function copyText(text){
  if(navigator.clipboard&&w.isSecureContext){
    return navigator.clipboard.writeText(text);
  }
  return new Promise(function(resolve,reject){
    var area=d.createElement('textarea');
    area.value=text;
    area.setAttribute('readonly','');
    area.style.position='fixed';
    area.style.left='-9999px';
    area.style.top='0';
    (d.body||d.documentElement).appendChild(area);
    area.select();
    try{
      var ok=d.execCommand('copy');
      area.remove();
      if(ok)resolve();else reject(new Error('copy failed'));
    }catch(error){
      area.remove();reject(error);
    }
  });
}

function goTop(){
  d.documentElement.scrollTop=0;
  if(d.body)d.body.scrollTop=0;
  var reduce=w.matchMedia&&w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  try{w.scrollTo({top:0,left:0,behavior:reduce?'auto':'smooth'});}
  catch(error){w.scrollTo(0,0);}
}

function goPreviousPage(){
  try{
    if(w.history&&w.history.length>1){
      w.history.back();
      return;
    }
  }catch(error){}
  w.location.href=parentRoute(w.location.pathname);
}

var lastShareAt=0;

function setCopiedVisual(button){
  if(!button)return;
  button.classList.add('is-copied');
  button.setAttribute('aria-label','已复制当前网页标题与网址');
  w.setTimeout(function(){
    button.classList.remove('is-copied');
    button.setAttribute('aria-label','分享当前');
  },1500);
}

function shareToast(message){
  var node=d.getElementById('qilyDockShareCopyToastV2');
  if(!node){
    node=d.createElement('div');
    node.id='qilyDockShareCopyToastV2';
    node.setAttribute('role','status');
    node.setAttribute('aria-live','polite');
    node.setAttribute('aria-atomic','true');
    (d.body||d.documentElement).appendChild(node);
  }
  node.textContent=message;
  node.hidden=false;
  clearTimeout(shareToast.timer);
  shareToast.timer=w.setTimeout(function(){node.hidden=true;},2300);
}

function runShare(button){
  if(Date.now()-lastShareAt<350)return;
  lastShareAt=Date.now();
  var title=d.title||'QilyLean',url=w.location.href,text=title+'\n'+url;

  copyText(text).then(function(){
    setCopiedVisual(button);
    if(navigator.share){
      shareToast('标题与网址已复制，正在打开系统分享');
      return navigator.share({title:title,text:title,url:url}).catch(function(error){
        if(error&&error.name==='AbortError'){
          shareToast('已复制，可直接粘贴分享');
          return;
        }
        shareToast('已复制，可粘贴到微信、微博等应用');
      });
    }
    shareToast('标题与网址已复制，可粘贴到微信、微博等应用');
  }).catch(function(){
    if(navigator.share){
      navigator.share({title:title,text:title,url:url}).catch(function(){});
    }
  });
}

function shareClickCapture(event){
  var button=event.target&&event.target.closest
    ? event.target.closest('.footer-actions button[data-qily-footer-action="share"]')
    : null;
  if(!button)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  runShare(button);
}

function shareKeyCapture(event){
  if(event.key!=='Enter'&&event.key!==' ')return;
  var button=event.target&&event.target.closest
    ? event.target.closest('.footer-actions button[data-qily-footer-action="share"]')
    : null;
  if(!button)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  runShare(button);
}

function run(action){
  if(action==='top'){goTop();return;}
  if(action==='previous'){goPreviousPage();}
}

function bind(){
  var group=d.querySelector('.footer-actions');
  if(!group||group.getAttribute('data-qily-bound')==='v1')return;
  group.setAttribute('data-qily-bound','v1');
  group.addEventListener('click',function(event){
    var button=event.target&&event.target.closest?event.target.closest('button[data-qily-footer-action]'):null;
    if(!button||!group.contains(button))return;
    var action=button.getAttribute('data-qily-footer-action')||'';
    if(action==='share')return;
    event.preventDefault();
    run(action);
  });
}

d.addEventListener('click',shareClickCapture,true);
d.addEventListener('keydown',shareKeyCapture,true);
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
w.addEventListener('pageshow',bind,{passive:true});
})(document,window);
