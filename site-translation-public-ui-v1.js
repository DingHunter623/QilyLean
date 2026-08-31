/* QilyLean Translation Public UI V1.3｜2026-08-31
 * Visitor-facing adapter only: implementation details stay internal.
 * Public picker contract: 中文简体 / 中文繁体 / English, in that exact order.
 * V1.3 keeps the browser-native select geometry stable while its popup is opening:
 * - no width measurement or inline geometry writes on pointer/focus;
 * - no resize or language-change reconciliation loop;
 * - no option mutation while the native picker is active;
 * - no document-wide observer.
 */
(function(d,w){
  'use strict';
  if(w.__qilyTranslationPublicUiV13)return;
  w.__qilyTranslationPublicUiV13=true;
  w.__qilyTranslationPublicUiV12=true;
  w.__qilyTranslationPublicUiV11=true;
  w.__qilyTranslationPublicUiV1=true;

  var CONTROL_ID='qilyGlobalTranslationDualRouteV2';
  var PUBLIC_LANGUAGE_LABELS={'zh-CN':'中文简体','zh-TW':'中文繁体','en':'English'};
  var PUBLIC_LANGUAGE_ORDER=['zh-CN','zh-TW','en'];

  function normalizePublicLanguageOptions(select){
    if(!select||!select.options||select.getAttribute('data-qily-native-picker-open')==='true')return;
    var optionsByValue={};
    Array.from(select.options).forEach(function(option){
      if(!Object.prototype.hasOwnProperty.call(PUBLIC_LANGUAGE_LABELS,option.value)){option.remove();return;}
      optionsByValue[option.value]=option;
      option.textContent=PUBLIC_LANGUAGE_LABELS[option.value];
      option.label=PUBLIC_LANGUAGE_LABELS[option.value];
      option.setAttribute('label',PUBLIC_LANGUAGE_LABELS[option.value]);
    });
    PUBLIC_LANGUAGE_ORDER.forEach(function(code){
      if(optionsByValue[code])return;
      var option=d.createElement('option');
      option.value=code;
      option.textContent=PUBLIC_LANGUAGE_LABELS[code];
      option.label=PUBLIC_LANGUAGE_LABELS[code];
      option.setAttribute('label',PUBLIC_LANGUAGE_LABELS[code]);
      select.appendChild(option);
      optionsByValue[code]=option;
    });
    var currentOrder=Array.from(select.options).map(function(option){return option.value;}).join(',');
    var requiredOrder=PUBLIC_LANGUAGE_ORDER.join(',');
    if(currentOrder!==requiredOrder)PUBLIC_LANGUAGE_ORDER.forEach(function(code){select.appendChild(optionsByValue[code]);});
  }

  function selectedName(select){
    if(!select||!select.options||select.selectedIndex<0)return '中文简体';
    var option=select.options[select.selectedIndex];
    return (option&&(PUBLIC_LANGUAGE_LABELS[option.value]||option.label||option.textContent)||'中文简体').trim();
  }

  function decorateSelect(select){
    if(!select)return;
    var name=selectedName(select);
    select.setAttribute('title',name);
    select.setAttribute('aria-label','网页翻译语言：'+name);
    select.setAttribute('data-qily-selected-language',name);
    select.setAttribute('data-qily-public-language-order','zh-CN,zh-TW,en');
    select.setAttribute('data-qily-picker-geometry','native-stable-v1');
  }

  function bindNativePickerGuard(select){
    if(!select||select.dataset.qilyPublicUiBound==='v1.3')return;
    select.dataset.qilyPublicUiBound='v1.3';
    var markOpen=function(){select.setAttribute('data-qily-native-picker-open','true');};
    var markClosed=function(){select.removeAttribute('data-qily-native-picker-open');decorateSelect(select);};
    select.addEventListener('pointerdown',markOpen,{passive:true});
    select.addEventListener('touchstart',markOpen,{passive:true});
    select.addEventListener('change',markClosed);
    select.addEventListener('blur',markClosed);
    select.addEventListener('keydown',function(event){if(event.key==='Escape')markClosed();});
  }

  function cleanControl(control){
    if(!control)return false;
    control.setAttribute('aria-label','网页翻译');
    control.setAttribute('title','本站默认显示中文简体；仅支持中文繁体与 English 切换。');
    control.setAttribute('data-qily-public-language-set','zh-CN,zh-TW,en');
    control.setAttribute('data-qily-default-language','zh-CN');
    control.setAttribute('data-qily-public-ui-version','v1.3');

    var badge=control.querySelector('.qily-web-translate__badge');
    if(badge)badge.remove();

    var status=control.querySelector('.qily-web-translate__status');
    if(status){status.hidden=true;status.setAttribute('aria-hidden','true');status.removeAttribute('aria-live');status.removeAttribute('aria-atomic');}

    var select=control.querySelector('.qily-web-translate__select');
    if(select){
      normalizePublicLanguageOptions(select);
      decorateSelect(select);
      bindNativePickerGuard(select);
    }
    return true;
  }

  function reconcile(){cleanControl(d.getElementById(CONTROL_ID));}
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',reconcile,{once:true});else reconcile();
  d.addEventListener('qily:shell-ready',reconcile);
  w.addEventListener('pageshow',reconcile,{passive:true});
})(document,window);
