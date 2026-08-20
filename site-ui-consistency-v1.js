/* QilyLean 轻量父级导航与外壳一致性 v3.1｜2026-08-20
 * 性能原则：静态HTML首帧即正确；运行时只校正导航和悬浮栏，不扫描或改写正文。
 * 本轮将悬浮Dock“分享官网”改为与其它按钮完全相同的文字结构，并在公共外壳层直接提供系统分享/复制网址回退。
 */
(function(d,w){
  'use strict';
  if(w.__qilyUiConsistencyV2)return;
  w.__qilyUiConsistencyV2=true;

  var BUILD_ID='20260820-dock-share-functional-v11';
  var BUILD_KEY='qily_site_ui_build_v1';
  var OFFICIAL_HOME='https://qilylean.com';

  d.documentElement.classList.remove('qily-shell-pending','qily-r2-first-paint-pending');

  function normalizedPath(path){
    var value=(path||'/').replace(/\/index\.html$/,'/').replace(/\/{2,}/g,'/');
    if(value.length<=1)return '/';
    if(value.charAt(value.length-1)!=='/'&&!/\/[^/]+\.[^/]+$/.test(value))value+='/';
    return value.replace(/\/+$/,'/');
  }

  function configuredParent(){
    var body=d.body;
    var value=(body&&body.getAttribute('data-parent-route'))||'';
    if(value)return value;
    var link=d.querySelector('link[rel="up"][href]');
    return link?link.getAttribute('href')||'':'';
  }

  function parentRoute(path){
    path=normalizedPath(path);
    var configured=configuredParent();
    if(configured)return configured;
    if(path==='/')return '/';
    if(/^\/legal\/times26001\/(?:privacy|terms)\/$/.test(path))return '/tools/times26001/';
    if(path==='/app-support/')return '/tools/times26001/';
    if(path.indexOf('/tools/')===0)return '/';
    if(/^\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html$/.test(path))return '/qilylean/daily-insights.html';
    if(path==='/qilylean/daily-insights.html')return '/knowledge/';
    if(path.indexOf('/projects/lean-improvement-evidence/')===0&&path!=='/projects/lean-improvement-evidence/')return '/projects/lean-improvement-evidence/';
    if(/^\/qilylean\/(?:lean-knowledge|lean-tools|execution-loop|gbt2828|production-operations-organization|reference-[^/]+)\.html$/.test(path))return '/knowledge/';
    var roots=['projects','improvements','capabilities','experience','knowledge','moments','cooperation','links','trust'];
    for(var i=0;i<roots.length;i++){
      var root='/'+roots[i]+'/';
      if(path.indexOf(root)===0&&path!==root)return root;
    }
    if(path==='/ai.html')return '/';
    for(var j=0;j<roots.length;j++)if(path==='/'+roots[j]+'/')return '/';
    return '/';
  }

  function navigateParent(){
    var target=parentRoute(location.pathname);
    if(normalizedPath(target)===normalizedPath(location.pathname))target='/';
    location.assign(target);
  }

  function rememberBuild(){
    try{w.localStorage.setItem(BUILD_KEY,BUILD_ID);}catch(error){}
    d.documentElement.setAttribute('data-qily-ui-build',BUILD_ID);
  }

  var pointer=null;
  var handledAt=0;
  d.addEventListener('pointerdown',function(event){
    var button=event.target&&event.target.closest?event.target.closest('[data-action="back"]'):null;
    if(!button)return;
    pointer={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};
  },true);
  d.addEventListener('pointermove',function(event){
    if(!pointer||event.pointerId!==pointer.id)return;
    if(Math.abs(event.clientX-pointer.x)>8||Math.abs(event.clientY-pointer.y)>8)pointer.moved=true;
  },true);
  d.addEventListener('pointerup',function(event){
    if(!pointer||event.pointerId!==pointer.id)return;
    var go=!pointer.moved;pointer=null;if(!go)return;
    handledAt=Date.now();event.preventDefault();event.stopImmediatePropagation();navigateParent();
  },true);
  d.addEventListener('pointercancel',function(event){if(pointer&&event.pointerId===pointer.id)pointer=null;},true);
  d.addEventListener('click',function(event){
    var button=event.target&&event.target.closest?event.target.closest('[data-action="back"]'):null;
    if(!button)return;
    event.preventDefault();event.stopImmediatePropagation();
    if(Date.now()-handledAt<600)return;navigateParent();
  },true);

  function normalizePublicUrl(value){
    if(w.QilyLeanNormalizePublicUrl)return w.QilyLeanNormalizePublicUrl(value);
    var text=String(value==null?'':value).trim();
    if(!text)return text;
    try{
      var u=new URL(text,w.location.origin);
      if(u.hostname!=='qilylean.com'&&u.hostname!=='www.qilylean.com')return text;
      var pathname=u.pathname||'';
      pathname=pathname==='/'?'':pathname.replace(/\/+$/,'');
      return u.protocol+'//'+u.host+pathname+u.search+u.hash;
    }catch(error){return text.replace(/\/(?=(?:[?#]|$))/,'');}
  }

  function copyText(text){
    if(navigator.clipboard&&w.isSecureContext)return navigator.clipboard.writeText(text);
    var field=d.createElement('textarea');
    field.value=text;field.setAttribute('readonly','');field.style.position='fixed';field.style.left='-9999px';
    d.body.appendChild(field);field.select();d.execCommand('copy');field.remove();return Promise.resolve();
  }

  function showToast(message){
    var toast=d.getElementById('qilyDockToast');
    if(!toast)return;
    toast.textContent=message;toast.classList.add('show');w.clearTimeout(showToast.timer);
    showToast.timer=w.setTimeout(function(){toast.classList.remove('show');},2400);
  }

  function shareOfficialSite(){
    var url=normalizePublicUrl(OFFICIAL_HOME);
    var mask=d.getElementById('shareMask');if(mask)mask.classList.remove('show');
    if(navigator.share){
      return navigator.share({url:url}).then(function(){showToast('已调起系统分享');}).catch(function(error){
        if(error&&error.name==='AbortError')return;
        return copyText(url).then(function(){showToast('官网网址已复制');});
      });
    }
    return copyText(url).then(function(){showToast('官网网址已复制');});
  }
  w.__qilyShareOfficialSite=shareOfficialSite;

  var sharePointer=null;
  var shareHandledAt=0;
  d.addEventListener('pointerdown',function(event){
    var button=event.target&&event.target.closest?event.target.closest('#floatDock [data-action="share"]'):null;
    if(!button){sharePointer=null;return;}
    sharePointer={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};
  },true);
  d.addEventListener('pointermove',function(event){
    if(!sharePointer||sharePointer.id!==event.pointerId)return;
    if(Math.hypot(event.clientX-sharePointer.x,event.clientY-sharePointer.y)>7)sharePointer.moved=true;
  },true);
  d.addEventListener('pointerup',function(event){
    if(!sharePointer||sharePointer.id!==event.pointerId)return;
    var go=!sharePointer.moved;sharePointer=null;if(!go)return;
    shareHandledAt=Date.now();event.preventDefault();event.stopImmediatePropagation();shareOfficialSite();
  },true);
  d.addEventListener('pointercancel',function(event){if(sharePointer&&sharePointer.id===event.pointerId)sharePointer=null;},true);
  d.addEventListener('click',function(event){
    var button=event.target&&event.target.closest?event.target.closest('#floatDock [data-action="share"]'):null;
    if(!button)return;
    event.preventDefault();event.stopImmediatePropagation();
    if(Date.now()-shareHandledAt<600)return;
    shareHandledAt=Date.now();shareOfficialSite();
  },true);

  function ensureDockPolish(){
    if(d.getElementById('qilyDockOfficialUrlPolishV4'))return;
    var style=d.createElement('style');
    style.id='qilyDockOfficialUrlPolishV4';
    style.textContent='#floatDock [data-action="share"]{width:62px!important;min-width:62px!important;height:62px!important;min-height:62px!important;padding:4px!important;border-radius:50%!important;display:flex!important;align-items:center!important;justify-content:center!important;line-height:1.08!important;white-space:normal!important;overflow:hidden!important;box-sizing:border-box!important}';
    (d.head||d.documentElement).appendChild(style);
  }

  function primaryModule(path){
    path=normalizedPath(path);
    if(path==='/')return '/';
    if(path.indexOf('/capabilities/')===0)return '/capabilities/';
    if(path.indexOf('/projects/')===0)return '/projects/';
    if(path.indexOf('/improvements/')===0||/\/(?:execution|papers)\.html$/.test(path)||/\/qilylean\/papers\.html$/.test(path))return '/improvements/';
    if(path.indexOf('/knowledge/')===0||path.indexOf('/qilylean/daily/')===0||/^\/(?:knowledge|daily|daily-insights|gbt2828)\.html$/.test(path)||/\/qilylean\/(?:lean-knowledge|daily-insights|lean-tools|execution-loop|reference-|gbt2828)/.test(path))return '/knowledge/';
    if(path.indexOf('/experience/')===0)return '/experience/';
    if(path.indexOf('/links/')===0)return '/links/';
    if(path.indexOf('/cooperation/')===0)return '/cooperation/';
    if(path.indexOf('/trust/')===0||path.indexOf('/certificates/')===0||path.indexOf('/legal/')===0)return '/trust/';
    return '';
  }

  function ensurePrimaryNavCurrentStyles(){
    if(d.getElementById('qilyPrimaryNavCurrentStateV7'))return;
    var style=d.createElement('style');
    style.id='qilyPrimaryNavCurrentStateV7';
    style.textContent=[
      'html body header :is(.qily-global-nav,nav.site-nav,nav.nav,nav[aria-label="网站导航"],nav[aria-label="QilyLean核心导视"])>a[href][aria-current="page"][data-qily-primary-current="true"]{color:#fff!important;-webkit-text-fill-color:#fff!important;background:#0f4b5a!important;border:2px solid #ffe39b!important;text-decoration-color:#ffe39b!important;text-decoration-thickness:2.2px!important;box-shadow:0 7px 18px rgba(15,75,90,.24)!important}',
      'html body header :is(.qily-global-nav,nav.site-nav,nav.nav,nav[aria-label="网站导航"],nav[aria-label="QilyLean核心导视"])>a[href][aria-current="page"][data-qily-primary-current="true"]:is(:hover,:focus-visible){color:#fff!important;-webkit-text-fill-color:#fff!important;background:#12606f!important;border-color:#ffe39b!important;box-shadow:0 9px 22px rgba(15,75,90,.30)!important}'
    ].join('');
    (d.head||d.documentElement).appendChild(style);
  }

  function primaryRouteForLink(link){
    var target;
    try{target=new URL(link.getAttribute('href')||'',location.origin);}catch(error){return '';}
    if(target.origin!==location.origin)return '';
    var path=normalizedPath(target.pathname);
    return ['/','/capabilities/','/projects/','/improvements/','/knowledge/','/experience/','/links/','/cooperation/','/trust/'].indexOf(path)!==-1?path:'';
  }

  function normalizePrimaryNav(){
    var path=normalizedPath(location.pathname);
    var modulePath=primaryModule(path);
    ensurePrimaryNavCurrentStyles();
    d.querySelectorAll('.qily-global-nav,nav.site-nav,nav.nav').forEach(function(nav){
      if(!modulePath)return;
      Array.from(nav.children).forEach(function(link){
        if(!link.matches||!link.matches('a[href]'))return;
        var routePath=primaryRouteForLink(link);if(!routePath)return;
        var active=routePath===modulePath;
        if(active){
          link.setAttribute('aria-current','page');
          link.setAttribute('data-qily-primary-current','true');
        }else{
          link.removeAttribute('aria-current');link.removeAttribute('aria-selected');link.removeAttribute('data-current');link.removeAttribute('data-active');link.removeAttribute('data-qily-primary-current');
          link.classList.remove('active','current','is-active','selected');
        }
      });
    });
  }

  function normalizeDock(){
    var dock=d.getElementById('floatDock');
    if(!dock)return false;
    ensureDockPolish();
    var back=dock.querySelector('[data-action="back"]');
    if(back){back.setAttribute('data-parent-route',parentRoute(location.pathname));back.setAttribute('title','返回当前页面所属的上一级有效页面');back.setAttribute('aria-label','返回上一级有效页面');}
    var share=dock.querySelector('[data-action="share"]');
    if(share){
      var html='分享<br>官网';if(share.innerHTML!==html)share.innerHTML=html;
      if(share.getAttribute('title')!=='分享官网')share.setAttribute('title','分享官网');
      if(share.getAttribute('aria-label')!=='分享官网')share.setAttribute('aria-label','分享官网');
    }
    return true;
  }

  function reconcileFast(){normalizePrimaryNav();normalizeDock();}
  function boot(){rememberBuild();ensureDockPolish();reconcileFast();}

  d.addEventListener('qily:shell-ready',reconcileFast);
  w.addEventListener('pageshow',reconcileFast);

  w.__qilyParentNavigationV3=true;
  w.__qilyDockShareImmediateContract=Object.freeze({action:'native-share-or-copy-url',payload:'url-only',homeUrl:OFFICIAL_HOME,trailingSlash:false,version:'20260820-dock-share-functional-v11'});
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(document,window);
