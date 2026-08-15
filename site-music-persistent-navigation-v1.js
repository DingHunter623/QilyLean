/* QilyLean fast native navigation v6.1 | 2026-08-15
 * 目标：保持原生导航稳定与视觉零变化，同时更早、更精准地预取用户最可能访问的模块。
 * 不跨页面搬运 DOM/CSS，不直接 fetch；桌面按悬停/聚焦预取，移动端仅在真实 pointerdown 意图时预取。
 */
(function(window,document){
'use strict';
if(window.top!==window.self||window.__qilyFastNativeNavigationV6)return;
window.__qilyFastNativeNavigationV6=true;
window.__qilyFastNativeNavigationV5=true;

var warmed=new Set();
var PREFETCH_BUDGET=3;
var SECONDARY_PREFETCH_BUDGET=2;
var blocked=/\.(?:pdf|xlsx?|docx?|pptx?|zip|rar|7z|apk|aab|mp3|mp4|webm|mov|jpe?g|png|gif|webp|svg)(?:$|\?)/i;

function urlOf(h){
  try{return new URL(h,location.href)}catch(e){return null}
}

function connectionProfile(){
  var c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
  if(!c)return {allow:true,fast:true};
  if(c.saveData)return {allow:false,fast:false};
  var type=c.effectiveType||'';
  if(/(?:^|-)2g$/.test(type))return {allow:false,fast:false};
  return {allow:true,fast:!type||type==='4g'};
}

function networkAllowsPrefetch(){return connectionProfile().allow;}

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
  link.setAttribute('fetchpriority','low');
  (document.head||document.documentElement).appendChild(link);
}

function prefetchAnchor(a){
  if(!a)return;
  var url=urlOf(a.href);
  if(allowed(url,a))prefetch(url);
}

/* 桌面端明确悬停/键盘聚焦即时预取。 */
document.addEventListener('pointerover',function(e){
  if(e.pointerType&&e.pointerType!=='mouse'&&e.pointerType!=='pen')return;
  var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;
  prefetchAnchor(a);
},{capture:true,passive:true});

document.addEventListener('focusin',function(e){
  var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;
  prefetchAnchor(a);
},true);

/* 真正按下导航链接时立即预取目标页面：兼顾手机点击，无 touchstart 全站抢带宽。 */
document.addEventListener('pointerdown',function(e){
  var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;
  var url=a&&urlOf(a.href);
  if(allowed(url,a)){
    prefetch(url);
    writeMusicState();
  }
},true);

function primaryAnchors(){
  var anchors=Array.from(document.querySelectorAll('header a[href],.topbar a[href],nav a[href]'));
  var current=location.pathname.replace(/\/index\.html$/,'/');
  var preferred=[];
  var rest=[];
  anchors.forEach(function(a){
    var url=urlOf(a.href);
    if(!allowed(url,a))return;
    var path=url.pathname.replace(/\/index\.html$/,'/');
    if(path==='/'||path==='/capabilities/'||path==='/projects/'||path==='/improvements/'||path==='/knowledge/'||path==='/experience/'||path==='/cooperation/'||path==='/trust/')preferred.push(a);
    else rest.push(a);
  });
  /* 当前页相邻核心模块优先，其余保持DOM顺序。 */
  var currentIndex=preferred.findIndex(function(a){return urlOf(a.href).pathname.replace(/\/index\.html$/,'/')===current;});
  if(currentIndex>=0){
    var nearby=[];
    [currentIndex+1,currentIndex-1,currentIndex+2,currentIndex-2].forEach(function(i){if(preferred[i])nearby.push(preferred[i]);});
    preferred=nearby.concat(preferred.filter(function(a){return nearby.indexOf(a)===-1;}));
  }
  return preferred.concat(rest);
}

function warmBatch(limit,offset){
  if(!networkAllowsPrefetch())return;
  var anchors=primaryAnchors();
  var count=0;
  var skipped=0;
  for(var i=0;i<anchors.length;i++){
    var url=urlOf(anchors[i].href);
    if(!allowed(url,anchors[i])||warmed.has(url.href))continue;
    if(skipped<offset){skipped+=1;continue;}
    prefetch(url);
    count+=1;
    if(count>=limit)break;
  }
}

function warmPrimaryNav(){warmBatch(PREFETCH_BUDGET,0);}
function warmSecondaryNav(){
  var profile=connectionProfile();
  if(profile.allow&&profile.fast)warmBatch(SECONDARY_PREFETCH_BUDGET,0);
}

/* 首批更早预热，第二批只在快速网络空闲时补充；页面视觉与交互不受影响。 */
if('requestIdleCallback'in window){
  window.requestIdleCallback(warmPrimaryNav,{timeout:700});
  window.requestIdleCallback(warmSecondaryNav,{timeout:2200});
}else{
  window.setTimeout(warmPrimaryNav,320);
  window.setTimeout(warmSecondaryNav,1600);
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
  secondaryPrefetchBudget:2,
  duplicateFetch:false,
  touchPrefetch:false,
  intentPrefetch:true,
  visualMutation:false
});
})(window,document);
