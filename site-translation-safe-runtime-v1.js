/* QilyLean Google Translate Header Runtime V1.2｜2026-08-31
 * Chinese static HTML remains the authoritative source and default display.
 * Google Translate is the single translation provider exposed to visitors.
 * The translation is a header utility sibling, outside the horizontally scrolling business navigation.
 * V1.1 fixed the header-build race: site-navigation-core may replace header children after this runtime starts.
 * V1.2 removes the legacy .qily-google-translate class because the retired-control stylesheet intentionally hides that class.
 * Android/iPhone: native horizontal nav swiping is authoritative; the auxiliary range rail must not steal coarse-pointer gestures.
 * No page text scan, no custom translation API, no MutationObserver, no reload.
 */
(function(d,w){
  'use strict';
  if(w.__qilyGoogleTranslateHeaderV12)return;
  w.__qilyGoogleTranslateHeaderV12=true;
  w.__qilyGoogleTranslateHeaderV11=true;
  w.__qilyGoogleTranslateHeaderV1=true;

  var CONTROL_ID='qilyGlobalTranslationDualRouteV2';
  var ELEMENT_ID='google_translate_element';
  var SCRIPT_ID='qilyGoogleTranslateElementScriptV1';
  var CALLBACK='googleTranslateElementInit';

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
    wrapper.setAttribute('title','Google 网页翻译');
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

    var target=d.createElement('div');
    target.id=ELEMENT_ID;
    target.className='qily-web-translate__google';
    target.setAttribute('aria-label','Google 网页翻译语言选择');

    wrapper.appendChild(mark);
    wrapper.appendChild(brand);
    wrapper.appendChild(target);
    return wrapper;
  }

  function placeControl(control,nav){
    var header=nav&&nav.closest&&nav.closest('header');
    if(!header){
      if(nav)nav.appendChild(control);
      else if(d.body&&!control.isConnected)d.body.insertBefore(control,d.body.firstChild);
      return;
    }
    if(control.parentNode!==header||nav.nextElementSibling!==control)nav.insertAdjacentElement('afterend',control);
    header.setAttribute('data-qily-google-translate-slot','ready');
  }

  function decorateGoogleControl(){
    var wrapper=d.getElementById(CONTROL_ID);
    if(!wrapper)return;
    var select=wrapper.querySelector('select.goog-te-combo');
    var simple=wrapper.querySelector('.goog-te-gadget-simple');
    if(select){
      select.classList.add('qily-web-translate__select');
      select.setAttribute('aria-label','Google 网页翻译语言');
      select.setAttribute('title','选择网页翻译语言');
    }
    if(select||simple)wrapper.setAttribute('data-state','ready');
  }

  function initGoogleWidget(){
    var target=d.getElementById(ELEMENT_ID);
    if(!target||target.getAttribute('data-qily-google-initialized')==='true')return;
    if(!w.google||!w.google.translate||!w.google.translate.TranslateElement)return;
    target.setAttribute('data-qily-google-initialized','true');
    try{
      new w.google.translate.TranslateElement({
        pageLanguage:'zh-CN',
        autoDisplay:false
      },ELEMENT_ID);
      w.setTimeout(decorateGoogleControl,0);
      w.setTimeout(decorateGoogleControl,250);
    }catch(error){
      target.removeAttribute('data-qily-google-initialized');
      var wrapper=d.getElementById(CONTROL_ID);
      if(wrapper)wrapper.setAttribute('data-state','unavailable');
    }
  }

  function loadGoogleScript(){
    if(w.google&&w.google.translate&&w.google.translate.TranslateElement){initGoogleWidget();return;}
    if(d.getElementById(SCRIPT_ID))return;
    var script=d.createElement('script');
    script.id=SCRIPT_ID;
    script.async=true;
    script.src='https://translate.google.com/translate_a/element.js?cb='+encodeURIComponent(CALLBACK);
    script.referrerPolicy='no-referrer-when-downgrade';
    script.onerror=function(){
      var wrapper=d.getElementById(CONTROL_ID);
      if(wrapper)wrapper.setAttribute('data-state','unavailable');
    };
    (d.head||d.documentElement).appendChild(script);
  }

  function ensureControl(){
    var nav=primaryNav();
    stabilizeMobileNav(nav);
    var control=d.getElementById(CONTROL_ID);
    if(!control)control=buildControl();
    control.classList.remove('qily-google-translate','qily-language-switcher');
    control.setAttribute('data-qily-google-translate-current','true');
    control.style.setProperty('display','inline-flex','important');
    control.style.setProperty('visibility','visible','important');
    control.style.setProperty('opacity','1','important');
    placeControl(control,nav);
    w[CALLBACK]=initGoogleWidget;
    if(w.google&&w.google.translate&&w.google.translate.TranslateElement)initGoogleWidget();
    else loadGoogleScript();
    return control;
  }

  function init(){
    removeLegacyControl();
    w[CALLBACK]=initGoogleWidget;
    ensureControl();
    w.setTimeout(ensureControl,120);
    w.setTimeout(ensureControl,700);
    w.setTimeout(ensureControl,1600);
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
  d.addEventListener('qily:shell-ready',ensureControl);
  d.addEventListener('qily:softnavigate',ensureControl);
  w.addEventListener('pageshow',ensureControl,{passive:true});
  w.addEventListener('resize',function(){stabilizeMobileNav(primaryNav());},{passive:true});
})(document,window);
