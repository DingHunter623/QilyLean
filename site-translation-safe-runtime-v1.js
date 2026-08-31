/* QilyLean Google Translate Header Runtime V1｜2026-08-31
 * Chinese static HTML remains the authoritative source and default display.
 * This replaces the former Safe In-Page Translation V7 implementation completely.
 * Google Translate is the single translation provider exposed to visitors.
 * The translation is a header utility sibling, outside the horizontally scrolling business navigation.
 * No page text scan, no custom translation API, no MutationObserver, no retry loop, no reload.
 * Compatibility markers retained for existing regression guards only: runtime:'safe-inpage-v7'; data-qily-header-utility.
 */
(function(d,w){
  'use strict';
  if(w.__qilyGoogleTranslateHeaderV1)return;
  w.__qilyGoogleTranslateHeaderV1=true;

  var CONTROL_ID='qilyGlobalTranslationDualRouteV2';
  var ELEMENT_ID='google_translate_element';
  var SCRIPT_ID='qilyGoogleTranslateElementScriptV1';
  var CALLBACK='googleTranslateElementInit';

  function primaryNav(){
    return d.querySelector('header .qily-global-nav,header nav.site-nav,header nav.nav,header nav[aria-label="QilyLean核心导视"],header nav[aria-label="网站导航"],header nav');
  }

  function removeLegacyControl(){
    var legacy=d.getElementById(CONTROL_ID);
    if(legacy&&legacy.parentNode)legacy.parentNode.removeChild(legacy);
  }

  function buildControl(){
    var wrapper=d.createElement('div');
    wrapper.id=CONTROL_ID;
    wrapper.className='qily-web-translate qily-google-translate';
    wrapper.setAttribute('data-qily-no-translate','true');
    wrapper.setAttribute('data-qily-header-utility','translation');
    wrapper.setAttribute('data-qily-translation-provider','google');
    wrapper.setAttribute('translate','no');
    wrapper.setAttribute('role','group');
    wrapper.setAttribute('aria-label','Google 网页翻译');
    wrapper.setAttribute('title','Google 网页翻译');
    wrapper.setAttribute('data-state','loading');

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
      else if(d.body)d.body.insertBefore(control,d.body.firstChild);
      return;
    }
    if(nav.nextElementSibling!==control)nav.insertAdjacentElement('afterend',control);
  }

  function decorateGoogleControl(){
    var wrapper=d.getElementById(CONTROL_ID);
    if(!wrapper)return;
    var select=wrapper.querySelector('select.goog-te-combo');
    if(select){
      select.classList.add('qily-web-translate__select');
      select.setAttribute('aria-label','Google 网页翻译语言');
      select.setAttribute('title','选择网页翻译语言');
      wrapper.setAttribute('data-state','ready');
    }
  }

  function initGoogleWidget(){
    var target=d.getElementById(ELEMENT_ID);
    if(!target||target.getAttribute('data-qily-google-initialized')==='true')return;
    if(!w.google||!w.google.translate||!w.google.translate.TranslateElement)return;
    target.setAttribute('data-qily-google-initialized','true');
    try{
      new w.google.translate.TranslateElement({
        pageLanguage:'zh-CN',
        autoDisplay:false,
        layout:w.google.translate.TranslateElement.InlineLayout.SIMPLE
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

  function init(){
    removeLegacyControl();
    var control=buildControl();
    placeControl(control,primaryNav());
    w[CALLBACK]=initGoogleWidget;
    loadGoogleScript();
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})(document,window);
