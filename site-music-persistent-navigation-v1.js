/* QilyLean fast native navigation v5 | 2026-08-12
 * 目标：优先保证全站版式稳定与跳转速度。
 * 不再跨页面搬运 main/head/style/script，不再模拟整页历史状态；
 * 采用浏览器原生导航 + 同源预取 + 音乐状态持久化，避免 CSS 串扰、脚本重复执行和样式等待。
 */
(function(window,document){
'use strict';
if(window.top!==window.self||window.__qilyFastNativeNavigationV5)return;
window.__qilyFastNativeNavigationV5=true;

var warmed=new Set();
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
  link.setAttribute('data-qily-fast-prefetch','v5');
  (document.head||document.documentElement).appendChild(link);

  /* fetch 同时预热 HTTP cache；不解析、不替换页面结构。 */
  if(window.fetch){
    fetch(url.href,{
      credentials:'same-origin',
      cache:'force-cache',
      priority:'low',
      headers:{'X-Qily-Prefetch':'1'}
    }).catch(function(){});
  }
}

function prefetchAnchor(a){
  if(!a)return;
  var url=urlOf(a.href);
  if(allowed(url,a))prefetch(url);
}

/* 指针悬停、键盘聚焦、触摸开始时抢先预取下一页。 */
document.addEventListener('pointerover',function(e){
  var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;
  prefetchAnchor(a);
},{capture:true,passive:true});

document.addEventListener('focusin',function(e){
  var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;
  prefetchAnchor(a);
},true);

document.addEventListener('touchstart',function(e){
  var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;
  prefetchAnchor(a);
},{capture:true,passive:true});

/* 导航发生前只保存音乐状态，不拦截浏览器 click。 */
document.addEventListener('pointerdown',function(e){
  var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;
  var url=a&&urlOf(a.href);
  if(allowed(url,a))writeMusicState();
},true);

function warmPrimaryNav(){
  if(!networkAllowsPrefetch())return;
  var anchors=Array.from(document.querySelectorAll('header a[href],.topbar a[href],nav a[href],#floatDock a[href]'));
  var seen=new Set();
  anchors.forEach(function(a){
    if(seen.size>=10)return;
    var url=urlOf(a.href);
    if(!allowed(url,a)||seen.has(url.href))return;
    seen.add(url.href);
    prefetch(url);
  });
}

if('requestIdleCallback'in window){
  window.requestIdleCallback(warmPrimaryNav,{timeout:1200});
}else{
  window.setTimeout(warmPrimaryNav,500);
}

/* 供悬浮坞等旧调用方继续使用；最终仍走原生导航。 */
window.__qilyPersistentNavigate=function(h){
  var url=urlOf(h||'/');
  if(!url)return;
  writeMusicState();
  location.assign(url.href);
};

/* 明确暴露运行时契约，便于门禁验证。 */
window.__qilyNavigationRuntimeContract=Object.freeze({
  mode:'native-prefetch-v5',
  domSwap:false,
  nativeHistory:true,
  musicStatePersistence:true,
  prefetch:true
});
})(window,document);
