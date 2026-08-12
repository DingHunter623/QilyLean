/* QilyLean same-document soft navigation v4 | 2026-08-12
 * 同源HTML在音乐播放时使用同文档导航保留同一audio；页面级CSS采用“先加载新页→再清旧页→再换main”的事务式交接。
 * 非音乐状态也对高概率站内链接进行低优先级预取；异常自动回退原生导航。
 */
(function(window,document){
'use strict';
if(window.top!==window.self||window.__qilySoftNavigationV4)return;
window.__qilySoftNavigationV4=true;
var cache=new Map(),busy=false,MAX_CACHE=12;
var blocked=/\.(?:pdf|xlsx?|docx?|pptx?|zip|rar|7z|apk|aab|mp3|mp4|webm|mov|jpe?g|png|gif|webp|svg)(?:$|\?)/i;
var globals=/(?:homepage-music-v5|site-music-persistent-navigation-v1|site-navigation(?:-legacy)?|site-parent-navigation|site-core-service-dock-closure|site-footer-standard|site-brand-trust|site-information-architecture|site-visual-closure|site-trust-conversion|site-text-contrast-audit|site-wide-layout|site-typography|site-vi-|site-dark-surface|site-link-standard|site-layout-footer-closure|site-hero-primary-contrast|site-interactive-hover-contrast|site-number-badge)/i;
var globalStyleIds=/^(?:qilyCriticalFirstPaintGuard|siteMusicStyle|qily.*(?:Global|Navigation|Footer|Music|Dock|Contrast|Closure|Typography|Visual|Trust|Information|Link|Layout))/i;
function audioPlaying(){var a=document.getElementById('siteBackgroundMusic');return !!(a&&!a.paused&&!a.ended)}
function urlOf(h){try{return new URL(h,location.href)}catch(e){return null}}
function assetPath(h){var u=urlOf(h);return u?u.pathname:String(h||'')}
function isGlobalHref(h){return globals.test(assetPath(h))}
function networkAllowsPrefetch(){var c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;if(!c)return true;if(c.saveData)return false;return !/(?:^|-)2g$/.test(c.effectiveType||'')}
function allowed(url,a){if(!url||url.origin!==location.origin||!/^https?:$/.test(url.protocol)||blocked.test(url.pathname+url.search))return false;if(url.pathname===location.pathname&&url.search===location.search&&url.hash)return false;if(a&&(a.hasAttribute('download')||(a.getAttribute('target')||'').toLowerCase()==='_blank'||a.closest('[data-qily-native-navigation="true"]')))return false;return true}
function markInitialAssets(){
  document.head.querySelectorAll('link[rel="stylesheet"]').forEach(function(n){if(!n.dataset.qilySoftNavScope)n.dataset.qilySoftNavScope=isGlobalHref(n.href)?'global':'page'});
  document.head.querySelectorAll('style').forEach(function(n){if(!n.dataset.qilySoftNavScope)n.dataset.qilySoftNavScope=(n.id&&globalStyleIds.test(n.id))?'global':'page'});
  document.querySelectorAll('script[src]').forEach(function(n){if(!n.dataset.qilySoftNavScope)n.dataset.qilySoftNavScope=isGlobalHref(n.src)?'global':'page'});
}
function fetchPage(url){if(cache.has(url.href))return Promise.resolve(cache.get(url.href));return fetch(url.href,{credentials:'same-origin',cache:'force-cache',headers:{'X-Qily-Soft-Navigation':'1'}}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);if(!/text\/html/i.test(r.headers.get('content-type')||''))throw new Error('not html');return r.text()}).then(function(t){cache.set(url.href,t);if(cache.size>MAX_CACHE)cache.delete(cache.keys().next().value);return t})}
function syncMetadata(next){document.title=next.title||document.title;[['meta[name="description"]','content'],['meta[property="og:title"]','content'],['meta[property="og:description"]','content'],['meta[property="og:url"]','content']].forEach(function(pair){var n=next.head.querySelector(pair[0]),c=document.head.querySelector(pair[0]);if(!n)return;if(!c){c=n.cloneNode(true);document.head.appendChild(c)}else c.setAttribute(pair[1],n.getAttribute(pair[1])||'')});var can=next.head.querySelector('link[rel="canonical"]'),cc=document.head.querySelector('link[rel="canonical"]');if(can){if(!cc){cc=document.createElement('link');cc.rel='canonical';document.head.appendChild(cc)}cc.href=can.href}}
function waitStyles(nodes){return Promise.all(nodes.map(function(node){return new Promise(function(resolve){var done=false;function finish(){if(done)return;done=true;resolve()}node.addEventListener('load',finish,{once:true});node.addEventListener('error',finish,{once:true});window.setTimeout(finish,900)})}))}
function reconcileHeadAssets(next){
  markInitialAssets();
  var targetLinks=Array.from(next.head.querySelectorAll('link[rel="stylesheet"]'));
  var pageTargets=targetLinks.filter(function(n){return !isGlobalHref(n.href)});
  var targetKeys=new Set(pageTargets.map(function(n){return n.href}));
  var existingExact=new Set(Array.from(document.head.querySelectorAll('link[rel="stylesheet"]')).map(function(n){return n.href}));
  var added=[];
  pageTargets.forEach(function(n){if(existingExact.has(n.href))return;var c=n.cloneNode(true);c.dataset.qilySoftNavScope='page';c.dataset.qilySoftNavIncoming='true';document.head.appendChild(c);added.push(c);existingExact.add(n.href)});
  return waitStyles(added).then(function(){
    document.head.querySelectorAll('link[rel="stylesheet"][data-qily-soft-nav-scope="page"]').forEach(function(n){if(!targetKeys.has(n.href))n.remove();else n.removeAttribute('data-qily-soft-nav-incoming')});
    var nextStyles=Array.from(next.head.querySelectorAll('style'));
    document.head.querySelectorAll('style[data-qily-soft-nav-scope="page"]').forEach(function(n){n.remove()});
    nextStyles.forEach(function(n){if(n.id&&globalStyleIds.test(n.id)){if(!document.getElementById(n.id)){var g=n.cloneNode(true);g.dataset.qilySoftNavScope='global';document.head.appendChild(g)}return}var c=n.cloneNode(true);c.dataset.qilySoftNavScope='page';document.head.appendChild(c)});
  })
}
function preparePageAssets(next){syncMetadata(next);return reconcileHeadAssets(next)}
function scripts(next){
  document.querySelectorAll('script[src][data-qily-soft-nav-scope="page"]').forEach(function(n){n.remove()});
  var knownGlobal=new Set(Array.from(document.querySelectorAll('script[src][data-qily-soft-nav-scope="global"]')).map(function(n){return assetPath(n.src)}));
  next.querySelectorAll('script[src]').forEach(function(n){var src=n.getAttribute('src')||'';if(!src)return;var global=isGlobalHref(src),key=assetPath(src);if(global){if(knownGlobal.has(key))return;var gs=n.cloneNode(false);gs.src=urlOf(src)?urlOf(src).href:src;gs.defer=true;gs.dataset.qilySoftNavScope='global';document.body.appendChild(gs);knownGlobal.add(key);return}var s=n.cloneNode(false);s.src=urlOf(src)?urlOf(src).href:src;s.defer=true;s.dataset.qilySoftNavScope='page';document.body.appendChild(s)})
}
function cleanIncomingMain(main){main.querySelectorAll('#qilyGlobalFooter,#floatDock,#shareMask,#wxMask,#qilySearchMask,#qilyDockToast,#siteMusicMute,#siteBackgroundMusic').forEach(function(n){n.remove()})}
function swap(url,text,push){
  var next=new DOMParser().parseFromString(text,'text/html'),main=next.querySelector('main'),old=document.querySelector('main');
  if(!main||!old)throw new Error('shell');
  cleanIncomingMain(main);
  return preparePageAssets(next).then(function(){
    var nh=next.querySelector('header.qily-site-header,header.topbar,header.top'),oh=document.querySelector('header.qily-site-header,header.topbar,header.top');
    if(nh&&oh)oh.replaceWith(document.importNode(nh,true));
    old.replaceWith(document.importNode(main,true));
    var keep=document.body.classList.contains('qily-tail-compact');document.body.className=next.body.className||'';if(keep)document.body.classList.add('qily-tail-compact');
    scripts(next);
    if(push)history.pushState({qilySoftNavigation:true},'',url.href);else history.replaceState({qilySoftNavigation:true},'',url.href);
    document.documentElement.dataset.qilySoftNavigation='v4';
    document.dispatchEvent(new CustomEvent('qily:softnavigate',{detail:{url:url.href}}));
    window.dispatchEvent(new Event('resize'));
    requestAnimationFrame(function(){if(url.hash){var t=document.getElementById(decodeURIComponent(url.hash.slice(1)));if(t){t.scrollIntoView({block:'start'});return}}scrollTo({top:0,left:0,behavior:'auto'})});
    return true
  })
}
function nativeNav(url){try{if(window.__qilyLeanMusicWriteState)window.__qilyLeanMusicWriteState()}catch(e){}location.assign(url.href)}
function go(h,opt){var url=urlOf(h),o=opt||{};if(!allowed(url,o.anchor)||busy){if(url)nativeNav(url);return Promise.resolve(false)}busy=true;document.documentElement.setAttribute('aria-busy','true');return fetchPage(url).then(function(t){return swap(url,t,o.push!==false)}).then(function(){busy=false;document.documentElement.removeAttribute('aria-busy');return true}).catch(function(){busy=false;document.documentElement.removeAttribute('aria-busy');nativeNav(url);return false})}
function prefetchAnchor(a){if(!networkAllowsPrefetch()||!a)return;var u=urlOf(a.href);if(allowed(u,a))fetchPage(u).catch(function(){})}
markInitialAssets();
document.addEventListener('click',function(e){if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||!audioPlaying())return;var a=e.target.closest&&e.target.closest('a[href]'),u=a&&urlOf(a.href);if(!allowed(u,a))return;e.preventDefault();go(u.href,{anchor:a,push:true})},true);
document.addEventListener('pointerover',function(e){var a=e.target.closest&&e.target.closest('a[href]');prefetchAnchor(a)},{capture:true,passive:true});
document.addEventListener('focusin',function(e){var a=e.target.closest&&e.target.closest('a[href]');prefetchAnchor(a)},true);
document.addEventListener('touchstart',function(e){var a=e.target.closest&&e.target.closest('a[href]');prefetchAnchor(a)},{capture:true,passive:true});
function warmPrimaryNav(){if(!networkAllowsPrefetch())return;Array.from(document.querySelectorAll('header a[href],.topbar a[href],#floatDock a[href]')).slice(0,8).forEach(prefetchAnchor)}
if('requestIdleCallback'in window)window.requestIdleCallback(warmPrimaryNav,{timeout:1600});else window.setTimeout(warmPrimaryNav,700);
window.addEventListener('popstate',function(){var u=urlOf(location.href);if(!u)return;if(!audioPlaying()){location.reload();return}go(u.href,{push:false})});
window.__qilyPersistentNavigate=function(h){var u=urlOf(h||'/');if(!u)return;if(audioPlaying()&&allowed(u,null))go(u.href,{push:true});else nativeNav(u)};
})(window,document);
