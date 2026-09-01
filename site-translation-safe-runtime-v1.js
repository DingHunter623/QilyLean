/* QilyLean Google Translate Header Runtime V1.3｜reload-free mobile closure｜2026-09-01
 * Chinese static HTML remains the authoritative source and default display.
 * This file is the only public translation lifecycle owner.
 * Google Translate is initialized once, with one retained control and one bounded header recovery.
 * Google-owned assets start only after window load, so they cannot delay first-paint resources.
 * Google owns the native select labels/events; CSS targets its eventual DOM without timing guesses.
 * Android, iPhone and desktop all keep the untouched Google-native change path.
 * Android/iPhone native horizontal nav behavior stays entirely outside this runtime.
 * No page text scan, option rewrite, MutationObserver, interval, retry loop or automatic reload loop.
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
  var control=null;
  var target=null;
  var recoveryUsed=false;
  var widgetInitializationStarted=false;

  function headerNav(){
    return d.querySelector('header .qily-global-nav,header nav.site-nav,header nav.nav,header nav[aria-label="QilyLean核心导视"],header nav[aria-label="主导航"],header nav[aria-label="网站导航"],header nav');
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
    var nav=headerNav();
    var header=nav&&nav.closest&&nav.closest('header');
    if(header){
      if(control.parentNode!==header||nav.nextElementSibling!==control)nav.insertAdjacentElement('afterend',control);
      header.setAttribute('data-qily-google-translate-slot','ready');
      return;
    }
    if(d.body&&!control.isConnected)d.body.insertBefore(control,d.body.firstChild);
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
      control.setAttribute('data-state','ready');
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
    script.src=GOOGLE_SCRIPT_PREFIX+'?cb='+encodeURIComponent(CALLBACK)+'&hl=en';
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

  function loadGoogleAfterPage(){
    if(d.readyState==='complete')loadGoogleScriptOnce();
    else w.addEventListener('load',loadGoogleScriptOnce,{once:true});
  }

  function init(){
    removeLegacyControl();
    control=buildControl();
    placeRetainedControl();
    w[CALLBACK]=initGoogleWidget;
    loadGoogleAfterPage();
    d.addEventListener('qily:shell-ready',recoverRetainedControlOnce,{once:true});
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})(document,window);
