/* QilyLean fast native navigation v6 | 2026-08-15
 * 目标：保持原生导航稳定，同时严格控制预取预算。
 * 不跨页面搬运 DOM/CSS，不双重 fetch；桌面仅在真实意图或空闲时预取，移动端触摸不抢占当前导航带宽。
 */
(function(window,document){
'use strict';
if(window.top!==window.self||window.__qilyFastNativeNavigationV6)return;
window.__qilyFastNativeNavigationV6=true;
window.__qilyFastNativeNavigationV5=true;

var warmed=new Set();
var PREFETCH_BUDGET=3;
var blocked=/\.(?:pdf|xlsx?|docx?|pptx?|zip|rar|7z|apk|aab|mp3|mp4|webm|mov|jpe?g|png|gif|webp|svg)(?:$|\?)/i;

function urlOf(h){
  try{return new URL(h,location.href)}catch(e){return null}
}

function networkAllowsPrefetch(){
  var c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
  if(!c)return true;
  if(c.saveData)return false;
  return !/(?:^|-)2g$/.test(c.effectiveType||'');
}

function allowed(url,a){
  if(!url||url.origin!==location.origin||!/^https?:$/.test(url.protocol))return false;
  if(blocked.test(url.pathname+url.search))return false;
  if(url.pathname===location.pathname&&url.search===location.search)return false;
  if(a){
    if(a.hasAttribute('download'))return false;
    var target=(a.getAttribute('target')||'').toLowerCase();
    if(target&&target!=='_self'&&target!=='_top')return false;
  }
  return true;
}

function writeMusicState(){
  try{
    if(window.__qilyLeanMusicWriteState)window.__qilyLeanMusicWriteState();
  }catch(e){}
}

function prefetch(url){
  if(!networkAllowsPrefetch()||!url||warmed.has(url.href))return;
  warmed.add(url.href);
  var link=document.createElement('link');
  link.rel='prefetch';
  link.href=url.href;
  link.as='document';
  link.setAttribute('data-qily-fast-prefetch','v6');
  (document.head||document.documentElement).appendChild(link);
}

function prefetchAnchor(a){
  if(!a)return;
  var url=urlOf(a.href);
  if(allowed(url,a))prefetch(url);
}

/* 桌面端明确悬停/键盘聚焦才即时预取；移动端 touchstart 不再抢占当前页面资源。 */
document.addEventListener('pointerover',function(e){
  if(e.pointerType&&e.pointerType!=='mouse'&&e.pointerType!=='pen')return;
  var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;
  prefetchAnchor(a);
},{capture:true,passive:true});

document.addEventListener('focusin',function(e){
  var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;
  prefetchAnchor(a);
},true);

/* 导航发生前只保存音乐状态，不拦截浏览器 click。 */
document.addEventListener('pointerdown',function(e){
  var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;
  var url=a&&urlOf(a.href);
  if(allowed(url,a))writeMusicState();
},true);

function warmPrimaryNav(){
  if(!networkAllowsPrefetch())return;
  var anchors=Array.from(document.querySelectorAll('header a[href],.topbar a[href],nav a[href]'));
  var seen=new Set();
  anchors.some(function(a){
    if(seen.size>=PREFETCH_BUDGET)return true;
    var url=urlOf(a.href);
    if(!allowed(url,a)||seen.has(url.href))return false;
    seen.add(url.href);
    prefetch(url);
    return false;
  });
}

if('requestIdleCallback'in window){
  window.requestIdleCallback(warmPrimaryNav,{timeout:1800});
}else{
  window.setTimeout(warmPrimaryNav,900);
}

window.__qilyPersistentNavigate=function(h){
  var url=urlOf(h||'/');
  if(!url)return;
  writeMusicState();
  location.assign(url.href);
};

window.__qilyNavigationRuntimeContract=Object.freeze({
  mode:'native-prefetch-v6',
  domSwap:false,
  nativeHistory:true,
  musicStatePersistence:true,
  prefetch:true,
  prefetchBudget:3,
  duplicateFetch:false,
  touchPrefetch:false
});
})(window,document);
