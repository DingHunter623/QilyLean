/* QilyLean Google Translate Header Runtime V1.4｜stable fast-path + primary + more languages｜2026-09-02
 * Chinese static HTML remains the authoritative source and default display.
 * This file is the only public translation lifecycle owner.
 * Primary control exposes 中文简体 / 中文繁体 / English / 其他.
 * “其他” opens a bounded language picker populated from Google's own supported options.
 * Google attribution remains visible; native Google translation events stay the execution path.
 * Google library loading starts as soon as the parsed DOM can host the translator; window.load remains a one-shot safety fallback only.
 * Stable fast-path reserves the complete translator line box before Google attribution arrives and warms only Google translation origins.
 * No page text scan, MutationObserver, interval, retry loop or automatic reload loop.
 */
(function(d,w){
  'use strict';
  if(w.__qilyGoogleTranslateHeaderV14)return;
  w.__qilyGoogleTranslateHeaderV14=true;

  var CONTROL_ID='qilyGlobalTranslationDualRouteV2';
  var ELEMENT_ID='google_translate_element';
  var SCRIPT_ID='qilyGoogleTranslateElementScriptV1';
  var CALLBACK='googleTranslateElementInit';
  var GOOGLE_SCRIPT_PREFIX='https://translate.google.com/translate_a/element.js';
  var MORE_VALUE='__more__';
  var PRIMARY_CODES={'zh-CN':true,'zh-TW':true,'en':true};
  var control=null;
  var target=null;
  var primarySelect=null;
  var morePanel=null;
  var moreSearch=null;
  var moreGrid=null;
  var recoveryUsed=false;
  var widgetInitializationStarted=false;

  function headerNav(){
    return d.querySelector('header .qily-global-nav,header nav.site-nav,header nav.nav,header nav[aria-label="QilyLean核心导视"],header nav[aria-label="主导航"],header nav[aria-label="网站导航"],header nav');
  }

  function removeLegacyControl(){
    var legacy=d.getElementById(CONTROL_ID);
    if(legacy&&legacy.parentNode)legacy.parentNode.removeChild(legacy);
  }

  function addOption(select,value,label){
    var option=d.createElement('option');
    option.value=value;
    option.textContent=label;
    select.appendChild(option);
  }

  function buildPrimarySelect(){
    var select=d.createElement('select');
    select.className='qily-web-translate__select';
    select.setAttribute('aria-label','选择网站语言');
    addOption(select,'zh-CN','中文简体');
    addOption(select,'zh-TW','中文繁体');
    addOption(select,'en','English');
    addOption(select,MORE_VALUE,'其他');
    select.value=currentLanguageCode();
    if(!PRIMARY_CODES[select.value])select.value=MORE_VALUE;
    select.addEventListener('change',function(){
      if(select.value===MORE_VALUE){openMorePanel();return;}
      closeMorePanel();
      applyLanguage(select.value);
    });
    return select;
  }

  function buildMorePanel(){
    var panel=d.createElement('div');
    panel.className='qily-language-more';
    panel.hidden=true;
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-modal','false');
    panel.setAttribute('aria-label','更多语言');

    var head=d.createElement('div');
    head.className='qily-language-more__head';
    var title=d.createElement('strong');
    title.textContent='更多语言';
    var close=d.createElement('button');
    close.type='button';
    close.className='qily-language-more__close';
    close.setAttribute('aria-label','关闭更多语言');
    close.textContent='×';
    close.addEventListener('click',closeMorePanel);
    head.appendChild(title);
    head.appendChild(close);

    moreSearch=d.createElement('input');
    moreSearch.type='search';
    moreSearch.className='qily-language-more__search';
    moreSearch.placeholder='搜索语言 / Language';
    moreSearch.setAttribute('aria-label','搜索更多语言');
    moreSearch.addEventListener('input',filterMoreLanguages);

    moreGrid=d.createElement('div');
    moreGrid.className='qily-language-more__grid';

    panel.appendChild(head);
    panel.appendChild(moreSearch);
    panel.appendChild(moreGrid);
    return panel;
  }

  function buildControl(){
    var wrapper=d.createElement('div');
    wrapper.id=CONTROL_ID;
    wrapper.className='qily-web-translate';
    wrapper.setAttribute('data-qily-google-translate-current','true');
    wrapper.setAttribute('data-qily-no-translate','true');
    wrapper.setAttribute('data-qily-header-utility','translation');
    wrapper.setAttribute('data-qily-translation-provider','google');
    wrapper.setAttribute('data-qily-translation-layout','stable-fast-path-v1');
    wrapper.setAttribute('translate','no');
    wrapper.setAttribute('role','group');
    wrapper.setAttribute('aria-label','Google 网页翻译');
    wrapper.setAttribute('title','默认中文简体；可切换中文繁体、English 或更多语言。');
    wrapper.setAttribute('data-state','loading');
    wrapper.style.setProperty('display','inline-grid','important');
    wrapper.style.setProperty('grid-template-columns','24px minmax(0,1fr)');
    wrapper.style.setProperty('grid-template-rows','38px 13px','important');
    wrapper.style.setProperty('column-gap','6px');
    wrapper.style.setProperty('row-gap','0');
    wrapper.style.setProperty('min-height','60px','important');
    wrapper.style.setProperty('visibility','visible','important');
    wrapper.style.setProperty('opacity','1','important');
    wrapper.style.setProperty('align-items','center');
    wrapper.style.setProperty('flex','0 0 auto');
    wrapper.style.setProperty('max-width','100%');

    var mark=d.createElement('span');
    mark.className='qily-web-translate__mark';
    mark.setAttribute('aria-hidden','true');
    mark.textContent='🌐';

    primarySelect=buildPrimarySelect();

    target=d.createElement('div');
    target.id=ELEMENT_ID;
    target.className='qily-web-translate__google';
    target.setAttribute('aria-label','Google 网页翻译服务');
    target.style.setProperty('box-sizing','border-box','important');
    target.style.setProperty('min-height','13px','important');
    target.style.setProperty('height','13px','important');
    target.style.setProperty('overflow','visible','important');

    morePanel=buildMorePanel();

    wrapper.appendChild(mark);
    wrapper.appendChild(primarySelect);
    wrapper.appendChild(target);
    wrapper.appendChild(morePanel);
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

  function nativeCombo(){
    return target&&target.querySelector('select.goog-te-combo');
  }

  function currentLanguageCode(){
    var match=d.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
    if(!match)return'zh-CN';
    try{
      var value=decodeURIComponent(match[1]);
      var parts=value.split('/').filter(Boolean);
      return parts.length?parts[parts.length-1]:'zh-CN';
    }catch(error){return'zh-CN';}
  }

  function stabilizeTranslationReflow(){
    var root=d.documentElement;
    if(root){
      root.setAttribute('data-qily-translation-transition','stable');
      root.style.setProperty('scroll-behavior','auto','important');
    }
    if(d.body)d.body.style.setProperty('overflow-anchor','none','important');
  }

  function applyLanguage(code){
    var combo=nativeCombo();
    if(!combo)return;
    stabilizeTranslationReflow();
    combo.value=code;
    combo.dispatchEvent(new Event('change',{bubbles:true}));
    if(primarySelect)primarySelect.value=PRIMARY_CODES[code]?code:MORE_VALUE;
  }

  function populateMoreLanguages(){
    if(!moreGrid)return false;
    moreGrid.textContent='';
    var combo=nativeCombo();
    if(!combo||!combo.options||combo.options.length<2){
      var pending=d.createElement('p');
      pending.className='qily-language-more__empty';
      pending.textContent='语言列表加载中，请稍后再次打开。';
      moreGrid.appendChild(pending);
      return false;
    }
    Array.prototype.forEach.call(combo.options,function(option){
      var code=String(option.value||'').trim();
      var label=String(option.textContent||'').trim();
      if(!code||PRIMARY_CODES[code]||!label)return;
      var button=d.createElement('button');
      button.type='button';
      button.className='qily-language-more__item';
      button.setAttribute('data-language-code',code);
      button.setAttribute('data-language-search',(label+' '+code).toLocaleLowerCase());
      button.textContent=label;
      button.addEventListener('click',function(){
        applyLanguage(code);
        closeMorePanel();
      });
      moreGrid.appendChild(button);
    });
    if(!moreGrid.children.length){
      var empty=d.createElement('p');
      empty.className='qily-language-more__empty';
      empty.textContent='暂无更多语言。';
      moreGrid.appendChild(empty);
      return false;
    }
    return true;
  }

  function filterMoreLanguages(){
    if(!moreGrid)return;
    var query=String((moreSearch&&moreSearch.value)||'').trim().toLocaleLowerCase();
    Array.prototype.forEach.call(moreGrid.querySelectorAll('.qily-language-more__item'),function(button){
      button.hidden=!!query&&String(button.getAttribute('data-language-search')||'').indexOf(query)<0;
    });
  }

  function openMorePanel(){
    if(!morePanel)return;
    populateMoreLanguages();
    morePanel.hidden=false;
    control&&control.setAttribute('data-more-languages-open','true');
    if(moreSearch){moreSearch.value='';filterMoreLanguages();moreSearch.focus();}
  }

  function closeMorePanel(){
    if(!morePanel)return;
    morePanel.hidden=true;
    control&&control.removeAttribute('data-more-languages-open');
    if(primarySelect&&primarySelect.value===MORE_VALUE&&PRIMARY_CODES[currentLanguageCode()])primarySelect.value=currentLanguageCode();
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
        autoDisplay:false
      },ELEMENT_ID);
      control.setAttribute('data-state','ready');
      var current=currentLanguageCode();
      if(primarySelect)primarySelect.value=PRIMARY_CODES[current]?current:MORE_VALUE;
    }catch(error){
      control.setAttribute('data-state','unavailable');
    }
  }

  function ensureConnectionHint(rel,href,crossOrigin){
    if(!d.head)return;
    var key=rel+'|'+href;
    if(d.head.querySelector('link[data-qily-translation-connection="'+key+'"]'))return;
    var link=d.createElement('link');
    link.rel=rel;
    link.href=href;
    link.setAttribute('data-qily-translation-connection',key);
    if(crossOrigin)link.crossOrigin='anonymous';
    d.head.appendChild(link);
  }

  function warmGoogleConnections(){
    ensureConnectionHint('preconnect','https://translate.google.com',false);
    ensureConnectionHint('preconnect','https://translate.googleapis.com',true);
    ensureConnectionHint('dns-prefetch','//translate.google.com',false);
    ensureConnectionHint('dns-prefetch','//translate.googleapis.com',false);
  }

  function existingGoogleScript(){
    return d.getElementById(SCRIPT_ID)||d.querySelector('script[src^="'+GOOGLE_SCRIPT_PREFIX+'"]');
  }

  function loadGoogleScriptOnce(){
    if(w.google&&w.google.translate&&w.google.translate.TranslateElement){initGoogleWidget();return;}
    if(existingGoogleScript())return;
    warmGoogleConnections();
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
    /* Fast path: start the only external translation dependency immediately after the parsed DOM can host the control.
     * The load listener is retained only as an idempotent one-shot safety boundary; loadGoogleScriptOnce() exits when the script already exists.
     */
    warmGoogleConnections();
    loadGoogleScriptOnce();
    if(d.readyState!=='complete')w.addEventListener('load',loadGoogleScriptOnce,{once:true});
  }

  function onDocumentPointer(event){
    if(!morePanel||morePanel.hidden||!control)return;
    if(!control.contains(event.target))closeMorePanel();
  }

  function onDocumentKey(event){
    if(event.key==='Escape'&&morePanel&&!morePanel.hidden){closeMorePanel();primarySelect&&primarySelect.focus();}
  }

  function init(){
    removeLegacyControl();
    control=buildControl();
    placeRetainedControl();
    w[CALLBACK]=initGoogleWidget;
    loadGoogleAfterPage();
    d.addEventListener('qily:shell-ready',recoverRetainedControlOnce,{once:true});
    d.addEventListener('pointerdown',onDocumentPointer);
    d.addEventListener('keydown',onDocumentKey);
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})(document,window);
