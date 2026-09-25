/* QilyLean CN Footer Navigation V2 | 2026-09-26
 * Seven-action structural parity with the international dock.
 * China-site actions: 首页 / 顶部 / 上一层级 / 上一网页 / 知识索引 / 分享当前 / 关于我们.
 */
(function(d,w){'use strict';
if(w.__qilyCnFooterActionsV2)return;w.__qilyCnFooterActionsV2=true;

var ORDER=[
  ['home','首页'],['top','顶部'],['parent','上一层级'],['previous','上一网页'],
  ['knowledge','知识索引'],['share','分享当前'],['about','关于我们']
];

function parentRoute(path){
  path=(path||'/').split('?')[0].split('#')[0].replace(/\/index\.html$/i,'/').replace(/\/{2,}/g,'/');
  if(path.length>1)path=path.replace(/\/+$/,'');
  if(!path||path==='/')return '/';
  var parts=path.split('/').filter(Boolean);
  if(parts.length<=1)return '/';
  parts.pop();
  return '/'+parts.join('/')+'/';
}
function copyText(text){
  if(navigator.clipboard&&w.isSecureContext)return navigator.clipboard.writeText(text);
  var area=d.createElement('textarea');area.value=text;area.setAttribute('readonly','');
  area.style.position='fixed';area.style.left='-9999px';(d.body||d.documentElement).appendChild(area);
  area.select();try{d.execCommand('copy')}catch(error){}area.remove();return Promise.resolve();
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
function ensureButtons(){
  var group=d.querySelector('.footer-actions');if(!group)return null;
  var signature=ORDER.map(function(item){return item[0];}).join(',');
  if(group.getAttribute('data-qily-footer-contract')===signature&&group.querySelectorAll('button[data-qily-footer-action]').length===ORDER.length)return group;
  group.textContent='';
  ORDER.forEach(function(item){
    var button=d.createElement('button');button.type='button';
    button.setAttribute('data-qily-footer-action',item[0]);button.textContent=item[1];
    button.setAttribute('aria-label',item[1]);button.setAttribute('title',item[1]);group.appendChild(button);
  });
  group.setAttribute('data-qily-footer-contract',signature);
  return group;
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
function run(action,button){
  if(action==='home'){w.location.href='/';return;}
  if(action==='top'){goTop();return;}
  if(action==='parent'){w.location.href=parentRoute(w.location.pathname);return;}
  if(action==='previous'){goPreviousPage();return;}
  if(action==='knowledge'){w.location.href='/knowledge/';return;}
  if(action==='about'){w.location.href='/about/';return;}
  if(action==='share'){runShare(button);}
}
function bind(){
  var group=ensureButtons();if(!group||group.getAttribute('data-qily-bound')==='v2')return;
  group.setAttribute('data-qily-bound','v2');
  group.addEventListener('pointerdown',function(event){var b=event.target.closest&&event.target.closest('button[data-qily-footer-action]');if(b)b.setAttribute('data-qily-pressed','true');},{passive:true});
  group.addEventListener('pointerup',function(event){var b=event.target.closest&&event.target.closest('button[data-qily-footer-action]');if(b)b.removeAttribute('data-qily-pressed');},{passive:true});
  group.addEventListener('pointercancel',function(){group.querySelectorAll('[data-qily-pressed="true"]').forEach(function(b){b.removeAttribute('data-qily-pressed');});},{passive:true});
  group.addEventListener('click',function(event){
    var button=event.target&&event.target.closest?event.target.closest('button[data-qily-footer-action]'):null;
    if(!button||!group.contains(button))return;event.preventDefault();event.stopPropagation();
    run(button.getAttribute('data-qily-footer-action')||'',button);
  });
}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
w.addEventListener('pageshow',bind,{passive:true});
})(document,window);
