/* QilyLean Google Translate Header Runtime V1.3｜2026-08-31
 * Chinese static HTML remains the authoritative source and default display.
 * This file is the only public translation lifecycle owner.
 * Google Translate is initialized once, with one retained control and one bounded header recovery.
 * Android/iPhone native horizontal nav swiping remains unchanged; its existing guard stays isolated here.
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
  var control=null;
  var target=null;
  var recoveryUsed=false;
  var widgetInitializationStarted=false;

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
    return wrapper;
  }

  function placeRetainedControl(){
    if(!control)return;
    var nav=primaryNav();
    stabilizeMobileNav(nav);
    var header=nav&&nav.closest&&nav.closest('header');
    if(header){
      if(control.parentNode!==header||nav.nextElementSibling!==control)nav.insertAdjacentElement('afterend',control);
      header.setAttribute('data-qily-google-translate-slot','ready');
      return;
    }
    if(d.body&&!control.isConnected)d.body.insertBefore(control,d.body.firstChild);
  }

  function decorateGoogleControlOnce(){
    if(!control)return;
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
  }

  function initGoogleWidget(){
    if(widgetInitializationStarted||w.__qilyGoogleTranslateElementInitialized)return;
    if(!target||!target.isConnected)return;
    if(!w.google||!w.google.translate||!w.google.translate.TranslateElement)return;
    widgetInitializationStarted=true;
    w.__qilyGoogleTranslateElementInitialized=true;
    target.setAttribute('data-qily-google-initialized','true');
    try{
      new w.google.translate.TranslateElement({
        pageLanguage:'zh-CN',
        includedLanguages:'zh-CN,zh-TW,en',
        autoDisplay:false
      },ELEMENT_ID);
      w.setTimeout(decorateGoogleControlOnce,250);
    }catch(error){
      control.setAttribute('data-state','unavailable');
    }
  }

  function existingGoogleScript(){
    return d.getElementById(SCRIPT_ID)||d.querySelector('script[src^="'+GOOGLE_SCRIPT_PREFIX+'"]');
  }

  function loadGoogleScriptOnce(){
    if(w.google&&w.google.translate&&w.google.translate.TranslateElement){initGoogleWidget();return;}
    if(existingGoogleScript())return;
    var script=d.createElement('script');
    script.id=SCRIPT_ID;
    script.async=true;
    script.src=GOOGLE_SCRIPT_PREFIX+'?cb='+encodeURIComponent(CALLBACK);
    script.referrerPolicy='no-referrer-when-downgrade';
    script.onerror=function(){if(control)control.setAttribute('data-state','unavailable');};
    (d.head||d.documentElement).appendChild(script);
  }

  function recoverRetainedControlOnce(){
    if(recoveryUsed)return;
    recoveryUsed=true;
    placeRetainedControl();
    if(w.google&&w.google.translate&&w.google.translate.TranslateElement)initGoogleWidget();
  }

  function init(){
    removeLegacyControl();
    control=buildControl();
    placeRetainedControl();
    w[CALLBACK]=initGoogleWidget;
    loadGoogleScriptOnce();
    d.addEventListener('qily:shell-ready',recoverRetainedControlOnce,{once:true});
    w.addEventListener('resize',function(){stabilizeMobileNav(primaryNav());},{passive:true});
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})(document,window);