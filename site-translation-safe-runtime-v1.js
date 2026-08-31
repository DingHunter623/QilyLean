/* QilyLean Google Translate Header Runtime V1.3｜2026-08-31
 * Chinese static HTML remains the authoritative source and default display.
 * This file is the only public translation lifecycle owner.
 * Google Translate is initialized once, with one retained control and one bounded header recovery.
 * Android/iPhone native horizontal nav swiping remains unchanged; its existing guard stays isolated here.
 * Optional diagnostics run only with ?qily_translate_debug=1 and do not alter normal translation behavior.
 * No page text scan, custom translation API, MutationObserver, interval, retry loop, reload or redirect.
 */
(function(d,w){
  'use strict';
  if(w.__qilyGoogleTranslateHeaderV13)return;
  w.__qilyGoogleTranslateHeaderV13=true;

  var CONTROL_ID='qilyGlobalTranslationDualRouteV2';
  var ELEMENT_ID='google_translate_element';
  var SCRIPT_ID='qilyGoogleTranslateElementScriptV1';
  var CALLBACK='googleTranslateElementInit';
  var GOOGLE_SCRIPT_PREFIX='https://translate.google.com/translate_a/element.js';
  var PUBLIC_LANGUAGE_LABELS={'zh-CN':'中文简体','zh-TW':'中文繁体','en':'English'};
  var DEBUG_ENABLED=/(?:^|[?&])qily_translate_debug=1(?:&|$)/.test((w.location&&w.location.search)||'');
  var debugLines=[];
  var control=null;
  var target=null;
  var recoveryUsed=false;
  var widgetInitializationStarted=false;

  function debugStage(stage,detail){
    if(!DEBUG_ENABLED)return;
    debugLines.push(stage+': '+detail);
    if(!d.body)return;
    var panel=d.getElementById('qilyTranslationDebugV1');
    if(!panel){
      panel=d.createElement('pre');
      panel.id='qilyTranslationDebugV1';
      panel.setAttribute('data-qily-translation-debug','true');
      panel.style.cssText='position:fixed;left:8px;right:8px;bottom:8px;z-index:2147483647;max-height:46vh;overflow:auto;margin:0;padding:10px 12px;border:2px solid #0f4b5a;border-radius:10px;background:rgba(255,255,255,.97);color:#102b2d;font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre-wrap;word-break:break-word;box-shadow:0 8px 30px rgba(0,0,0,.24);';
      d.body.appendChild(panel);
    }
    panel.textContent='QilyLean Translate Debug\n'+debugLines.join('\n')+'\nUA: '+((w.navigator&&w.navigator.userAgent)||'unknown');
  }

  function primaryNav(){
    return d.querySelector('header .qily-global-nav,header nav.site-nav,header nav.nav,header nav[aria-label="QilyLean核心导视"],header nav[aria-label="主导航"],header nav[aria-label="网站导航"],header nav');
  }

  function isCoarseOrMobile(){
    try{return !!(w.matchMedia&&w.matchMedia('(max-width: 900px), (pointer: coarse)').matches);}catch(error){return w.innerWidth<=900;}
  }

  function stabilizeMobileNav(nav){
    if(!nav||!isCoarseOrMobile())return;
    nav.style.setProperty('display','flex','important');
    nav.style.setProperty('flex-wrap','nowrap','important');
    nav.style.setProperty('width','100%','important');
    nav.style.setProperty('min-width','0','important');
    nav.style.setProperty('max-width','100%','important');
    nav.style.setProperty('overflow-x','auto','important');
    nav.style.setProperty('overflow-y','hidden','important');
    nav.style.setProperty('-webkit-overflow-scrolling','touch','important');
    nav.style.setProperty('touch-action','pan-x','important');
    nav.style.setProperty('overscroll-behavior-x','contain','important');
    nav.style.setProperty('scroll-behavior','auto','important');
    nav.style.setProperty('scroll-snap-type','none','important');
    Array.prototype.forEach.call(nav.children,function(child){
      if(child&&child.style)child.style.setProperty('flex','0 0 auto','important');
    });
    var header=nav.closest&&nav.closest('header');
    var rail=header&&header.querySelector('.qily-primary-nav-scroll-rail');
    if(rail){
      rail.style.setProperty('display','none','important');
      rail.style.setProperty('pointer-events','none','important');
      rail.setAttribute('aria-hidden','true');
      rail.tabIndex=-1;
    }
    nav.setAttribute('data-qily-mobile-nav','native-swipe');
  }

  function removeLegacyControl(){
    var legacy=d.getElementById(CONTROL_ID);
    if(legacy&&legacy.parentNode)legacy.parentNode.removeChild(legacy);
  }

  function buildControl(){
    var wrapper=d.createElement('div');
    wrapper.id=CONTROL_ID;
    wrapper.className='qily-web-translate';
    wrapper.setAttribute('data-qily-google-translate-current','true');
    wrapper.setAttribute('data-qily-no-translate','true');
    wrapper.setAttribute('data-qily-header-utility','translation');
    wrapper.setAttribute('data-qily-translation-provider','google');
    wrapper.setAttribute('translate','no');
    wrapper.setAttribute('role','group');
    wrapper.setAttribute('aria-label','Google 网页翻译');
    wrapper.setAttribute('title','默认中文简体；可切换中文繁体或 English。');
    wrapper.setAttribute('data-state','loading');
    wrapper.style.setProperty('display','inline-flex','important');
    wrapper.style.setProperty('visibility','visible','important');
    wrapper.style.setProperty('opacity','1','important');
    wrapper.style.setProperty('align-items','center');
    wrapper.style.setProperty('gap','6px');
    wrapper.style.setProperty('flex','0 0 auto');
    wrapper.style.setProperty('max-width','100%');

    var mark=d.createElement('span');
    mark.className='qily-web-translate__mark';
    mark.setAttribute('aria-hidden','true');
    mark.textContent='🌐';

    var brand=d.createElement('span');
    brand.className='qily-web-translate__brand';
    brand.textContent='Google 翻译';

    target=d.createElement('div');
    target.id=ELEMENT_ID;
    target.className='qily-web-translate__google';
    target.setAttribute('aria-label','Google 网页翻译语言选择');

    wrapper.appendChild(mark);
    wrapper.appendChild(brand);
    wrapper.appendChild(target);
    debugStage('control','built');
    return wrapper;
  }

  function placeRetainedControl(){
    if(!control){debugStage('place','no control');return;}
    var nav=primaryNav();
    stabilizeMobileNav(nav);
    var header=nav&&nav.closest&&nav.closest('header');
    if(header){
      if(control.parentNode!==header||nav.nextElementSibling!==control)nav.insertAdjacentElement('afterend',control);
      header.setAttribute('data-qily-google-translate-slot','ready');
      debugStage('place','header; connected='+control.isConnected);
      return;
    }
    if(d.body&&!control.isConnected)d.body.insertBefore(control,d.body.firstChild);
    debugStage('place','body fallback; connected='+(!!(control&&control.isConnected)));
  }

  function decorateGoogleControlOnce(){
    if(!control){debugStage('widget','decorate without control');return;}
    var select=control.querySelector('select.goog-te-combo');
    var simple=control.querySelector('.goog-te-gadget-simple');
    if(select){
      Array.prototype.forEach.call(select.options,function(option){
        var label=PUBLIC_LANGUAGE_LABELS[option.value];
        if(label&&option.textContent!==label)option.textContent=label;
        if(label&&option.label!==label)option.label=label;
      });
      select.classList.add('qily-web-translate__select');
      select.setAttribute('aria-label','Google 网页翻译语言');
      select.setAttribute('title','中文简体 / 中文繁体 / English');
    }
    if(select||simple)control.setAttribute('data-state','ready');
    debugStage('widget','select='+(!!select)+'; simple='+(!!simple)+'; targetChildren='+(target?target.children.length:0)+'; state='+(control.getAttribute('data-state')||''));
  }

  function initGoogleWidget(){
    debugStage('callback','entered');
    if(widgetInitializationStarted||w.__qilyGoogleTranslateElementInitialized){debugStage('constructor','skipped: already initialized');return;}
    if(!target||!target.isConnected){debugStage('constructor','skipped: target disconnected');return;}
    if(!w.google||!w.google.translate||!w.google.translate.TranslateElement){debugStage('constructor','skipped: TranslateElement unavailable');return;}
    widgetInitializationStarted=true;
    w.__qilyGoogleTranslateElementInitialized=true;
    target.setAttribute('data-qily-google-initialized','true');
    try{
      new w.google.translate.TranslateElement({
        pageLanguage:'zh-CN',
        includedLanguages:'zh-CN,zh-TW,en',
        autoDisplay:false
      },ELEMENT_ID);
      debugStage('constructor','success');
      w.setTimeout(decorateGoogleControlOnce,250);
    }catch(error){
      control.setAttribute('data-state','unavailable');
      debugStage('constructor','error: '+((error&&error.message)||String(error)));
    }
  }

  function existingGoogleScript(){
    return d.getElementById(SCRIPT_ID)||d.querySelector('script[src^="'+GOOGLE_SCRIPT_PREFIX+'"]');
  }

  function loadGoogleScriptOnce(){
    if(w.google&&w.google.translate&&w.google.translate.TranslateElement){
      debugStage('script','Google API already available');
      initGoogleWidget();
      return;
    }
    var existing=existingGoogleScript();
    if(existing){
      debugStage('script','existing: '+(existing.src||SCRIPT_ID));
      if(DEBUG_ENABLED){
        existing.addEventListener('load',function(){debugStage('script','existing load event');},{once:true});
        existing.addEventListener('error',function(){debugStage('script','existing error event');},{once:true});
      }
      return;
    }
    var script=d.createElement('script');
    script.id=SCRIPT_ID;
    script.async=true;
    script.src=GOOGLE_SCRIPT_PREFIX+'?cb='+encodeURIComponent(CALLBACK);
    script.referrerPolicy='no-referrer-when-downgrade';
    if(DEBUG_ENABLED)script.addEventListener('load',function(){debugStage('script','load event');},{once:true});
    script.onerror=function(){
      if(control)control.setAttribute('data-state','unavailable');
      debugStage('script','error event');
    };
    (d.head||d.documentElement).appendChild(script);
    debugStage('script','appended: '+script.src);
  }

  function recoverRetainedControlOnce(){
    if(recoveryUsed)return;
    recoveryUsed=true;
    debugStage('shell','recovery');
    placeRetainedControl();
    if(w.google&&w.google.translate&&w.google.translate.TranslateElement)initGoogleWidget();
  }

  function init(){
    debugStage('runtime','init');
    removeLegacyControl();
    control=buildControl();
    placeRetainedControl();
    w[CALLBACK]=initGoogleWidget;
    debugStage('callback','registered');
    loadGoogleScriptOnce();
    d.addEventListener('qily:shell-ready',recoverRetainedControlOnce,{once:true});
    w.addEventListener('resize',function(){stabilizeMobileNav(primaryNav());},{passive:true});
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})(document,window);
