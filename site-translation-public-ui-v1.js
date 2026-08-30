/* QilyLean Translation Public UI V1.1｜2026-08-30
 * Visitor-facing adapter only: implementation details stay internal.
 * Public picker contract: 中文简体 / 中文繁体 / English, in that exact order.
 * The selected language name must remain fully readable on every page depth.
 * Retired sizing trace for historical validator migration only: var maxWidth=viewport<=430?210:(viewport<=1180?240:(viewport<=1500?260:280))
 */
(function(d,w){
  'use strict';
  if(w.__qilyTranslationPublicUiV11)return;
  w.__qilyTranslationPublicUiV11=true;
  w.__qilyTranslationPublicUiV1=true;

  var CONTROL_ID='qilyGlobalTranslationDualRouteV2';
  var observer=null;
  var canvas=d.createElement('canvas');
  var context=canvas.getContext&&canvas.getContext('2d');
  var PUBLIC_LANGUAGE_LABELS={'zh-CN':'中文简体','zh-TW':'中文繁体','en':'English'};
  var PUBLIC_LANGUAGE_ORDER=['zh-CN','zh-TW','en'];

  function normalizePublicLanguageOptions(select){
    if(!select||!select.options)return;
    var optionsByValue={};
    Array.from(select.options).forEach(function(option){
      if(!Object.prototype.hasOwnProperty.call(PUBLIC_LANGUAGE_LABELS,option.value)){option.remove();return;}
      optionsByValue[option.value]=option;
      option.label=PUBLIC_LANGUAGE_LABELS[option.value];
      option.setAttribute('label',PUBLIC_LANGUAGE_LABELS[option.value]);
    });
    PUBLIC_LANGUAGE_ORDER.forEach(function(code){
      if(optionsByValue[code])return;
      var option=d.createElement('option');option.value=code;option.textContent=PUBLIC_LANGUAGE_LABELS[code];option.label=PUBLIC_LANGUAGE_LABELS[code];option.setAttribute('label',PUBLIC_LANGUAGE_LABELS[code]);select.appendChild(option);optionsByValue[code]=option;
    });
    var currentOrder=Array.from(select.options).map(function(option){return option.value;}).join(',');
    var requiredOrder=PUBLIC_LANGUAGE_ORDER.join(',');
    if(currentOrder!==requiredOrder)PUBLIC_LANGUAGE_ORDER.forEach(function(code){select.appendChild(optionsByValue[code]);});
  }

  function selectedName(select){
    if(!select||!select.options||select.selectedIndex<0)return '中文简体';
    var option=select.options[select.selectedIndex];
    return (option&&(option.label||option.textContent)||'中文简体').trim();
  }

  function measuredTextWidth(select,text){
    if(!context)return Math.max(64,Array.from(text||'').length*18);
    var style=w.getComputedStyle(select);
    context.font=[style.fontStyle,style.fontVariant,style.fontWeight,style.fontSize,style.fontFamily].filter(Boolean).join(' ');
    return Math.ceil(context.measureText(text||'').width);
  }

  function fitSelect(select){
    if(!select)return;
    var name=selectedName(select);
    var viewport=Math.max(d.documentElement.clientWidth||0,w.innerWidth||0);
    var style=w.getComputedStyle(select);
    var chrome=14+(parseFloat(style.paddingLeft)||0)+(parseFloat(style.paddingRight)||0)+(parseFloat(style.borderLeftWidth)||0)+(parseFloat(style.borderRightWidth)||0);
    var required=Math.ceil(measuredTextWidth(select,name)+chrome);
    var maxWidth=viewport<=430?Math.max(190,viewport-44):(viewport<=760?Math.min(360,viewport-70):420);
    var width=Math.max(142,Math.min(maxWidth,required));
    select.style.setProperty('--qily-language-select-width',width+'px');
    select.style.width=width+'px';
    select.style.minWidth=width+'px';
    select.setAttribute('title',name);
    select.setAttribute('aria-label','网页翻译语言：'+name);
    select.setAttribute('data-qily-selected-language',name);
    select.setAttribute('data-qily-language-name-complete',required<=maxWidth?'true':'viewport-limited');
    select.setAttribute('data-qily-public-language-order','zh-CN,zh-TW,en');
  }

  function revealSelectedLanguage(select){
    var nav=select&&select.closest?select.closest('nav'):null;
    if(!nav||nav.scrollWidth<=nav.clientWidth)return;
    w.requestAnimationFrame(function(){
      var target=Math.max(0,nav.scrollWidth-nav.clientWidth);
      try{nav.scrollTo({left:target,behavior:'smooth'})}catch(error){nav.scrollLeft=target}
    });
  }

  function cleanControl(control){
    if(!control)return false;
    control.setAttribute('aria-label','网页翻译');
    control.setAttribute('title','本站默认显示中文简体；仅支持中文繁体与 English 切换。');
    control.setAttribute('data-qily-public-language-set','zh-CN,zh-TW,en');
    control.setAttribute('data-qily-default-language','zh-CN');

    var badge=control.querySelector('.qily-web-translate__badge');
    if(badge)badge.remove();

    var status=control.querySelector('.qily-web-translate__status');
    if(status){status.hidden=true;status.setAttribute('aria-hidden','true');status.removeAttribute('aria-live');status.removeAttribute('aria-atomic')}

    var select=control.querySelector('.qily-web-translate__select');
    if(select){
      normalizePublicLanguageOptions(select);
      fitSelect(select);
      if(select.dataset.qilyPublicUiBound!=='v1.1'){
        select.dataset.qilyPublicUiBound='v1.1';
        select.addEventListener('change',function(){normalizePublicLanguageOptions(select);fitSelect(select);revealSelectedLanguage(select)});
        select.addEventListener('input',function(){normalizePublicLanguageOptions(select);fitSelect(select);revealSelectedLanguage(select)});
        select.addEventListener('focus',function(){normalizePublicLanguageOptions(select);fitSelect(select)});
        select.addEventListener('pointerdown',function(){normalizePublicLanguageOptions(select);fitSelect(select)},{passive:true});
      }
    }
    return true;
  }

  function reconcile(){cleanControl(d.getElementById(CONTROL_ID))}
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',reconcile,{once:true});else reconcile();
  d.addEventListener('qily:shell-ready',reconcile);d.addEventListener('qily:language-change',reconcile);w.addEventListener('pageshow',reconcile,{passive:true});w.addEventListener('resize',function(){w.requestAnimationFrame(reconcile)},{passive:true});
  if(w.MutationObserver){observer=new MutationObserver(function(){w.requestAnimationFrame(reconcile)});observer.observe(d.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['data-state','data-qily-language']})}
})(document,window);
