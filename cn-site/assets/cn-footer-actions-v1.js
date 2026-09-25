/* QilyLean CN Footer Actions V3 | 2026-09-26
 * Canonical China actions only: 顶部 / 上一网页 / 分享当前.
 */
(function(d,w){'use strict';
if(w.__qilyCnFooterActionsV3)return;w.__qilyCnFooterActionsV3=true;
var ORDER=[['top','顶部'],['previous','上一网页'],['share','分享当前']];

function parentRoute(path){
  path=(path||'/').split('?')[0].split('#')[0].replace(/\/index\.html$/i,'/').replace(/\/{2,}/g,'/');
  if(path.length>1)path=path.replace(/\/+$/,'');
  if(!path||path==='/')return '/';
  var parts=path.split('/').filter(Boolean);
  if(parts.length<=1)return '/';
  parts.pop();return '/'+parts.join('/')+'/';
}
function copyText(text){
  if(navigator.clipboard&&w.isSecureContext)return navigator.clipboard.writeText(text);
  var area=d.createElement('textarea');area.value=text;area.setAttribute('readonly','');
  area.style.position='fixed';area.style.left='-9999px';(d.body||d.documentElement).appendChild(area);
  area.select();try{d.execCommand('copy')}catch(error){}area.remove();return Promise.resolve();
}
function ensureButtons(){
  var group=d.querySelector('.footer-actions');if(!group)return null;
  group.textContent='';
  ORDER.forEach(function(item){
    var b=d.createElement('button');b.type='button';b.setAttribute('data-qily-footer-action',item[0]);
    b.textContent=item[1];b.setAttribute('aria-label',item[1]);b.setAttribute('title',item[1]);group.appendChild(b);
  });
  group.setAttribute('data-qily-footer-contract','top,previous,share');return group;
}
function goTop(){
  d.documentElement.scrollTop=0;if(d.body)d.body.scrollTop=0;
  var reduce=w.matchMedia&&w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  try{w.scrollTo({top:0,left:0,behavior:reduce?'auto':'smooth'});}catch(error){w.scrollTo(0,0);}
}
function goPreviousPage(){
  try{if(w.history&&w.history.length>1){w.history.back();return;}}catch(error){}
  w.location.href=parentRoute(w.location.pathname);
}
var lastShareAt=0;
function setCopiedVisual(button){
  if(!button)return;button.classList.add('is-copied');button.setAttribute('aria-label','已复制当前网页标题与网址');
  w.setTimeout(function(){button.classList.remove('is-copied');button.setAttribute('aria-label','分享当前');},1500);
}
function shareToast(message){
  var node=d.getElementById('qilyDockShareCopyToastV2');
  if(!node){node=d.createElement('div');node.id='qilyDockShareCopyToastV2';node.setAttribute('role','status');node.setAttribute('aria-live','polite');(d.body||d.documentElement).appendChild(node);}
  node.textContent=message;node.hidden=false;clearTimeout(shareToast.timer);shareToast.timer=w.setTimeout(function(){node.hidden=true;},2300);
}
function runShare(button){
  if(Date.now()-lastShareAt<350)return;lastShareAt=Date.now();
  var title=d.title||'QilyLean',url=w.location.href,text=title+'\n'+url;
  copyText(text).then(function(){
    setCopiedVisual(button);
    if(navigator.share){
      shareToast('标题与网址已复制，正在打开系统分享');
      return navigator.share({title:title,text:title,url:url}).catch(function(error){
        if(error&&error.name==='AbortError'){shareToast('已复制，可直接粘贴分享');return;}
        shareToast('已复制，可粘贴到微信、微博等应用');
      });
    }
    shareToast('标题与网址已复制，可粘贴到微信、微博等应用');
  }).catch(function(){if(navigator.share)navigator.share({title:title,text:title,url:url}).catch(function(){});});
}
function bind(){
  var group=ensureButtons();if(!group)return;
  if(group.getAttribute('data-qily-bound')==='v3')return;group.setAttribute('data-qily-bound','v3');
  group.addEventListener('click',function(event){
    var b=event.target&&event.target.closest?event.target.closest('button[data-qily-footer-action]'):null;
    if(!b||!group.contains(b))return;event.preventDefault();
    var action=b.getAttribute('data-qily-footer-action')||'';
    if(action==='top'){goTop();return;}if(action==='previous'){goPreviousPage();return;}if(action==='share')runShare(b);
  });
}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
w.addEventListener('pageshow',bind,{passive:true});
})(document,window);
