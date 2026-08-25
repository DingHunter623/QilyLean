/* QilyLean Translation Public UI V1｜2026-08-25
 * Public-facing adapter only: implementation details stay internal.
 * Keeps the selected language fully readable while preserving the governed translation runtime.
 */
(function(d,w){
  'use strict';
  if(w.__qilyTranslationPublicUiV1)return;
  w.__qilyTranslationPublicUiV1=true;

  var CONTROL_ID='qilyGlobalTranslationDualRouteV2';
  var observer=null;

  function selectedName(select){
    if(!select||!select.options||select.selectedIndex<0)return '中文原文';
    var option=select.options[select.selectedIndex];
    return (option&&option.textContent||'中文原文').trim();
  }

  function visualUnits(text){
    return Array.from(text||'').reduce(function(total,char){
      if(/[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(char))return total+1.75;
      if(/\s/.test(char))return total+.55;
      if(/[MW@%]/.test(char))return total+1.25;
      return total+1;
    },0);
  }

  function fitSelect(select){
    if(!select)return;
    var name=selectedName(select);
    var viewport=Math.max(d.documentElement.clientWidth||0,w.innerWidth||0);
    var maxWidth=viewport<=430?210:(viewport<=1180?240:(viewport<=1500?260:280));
    var width=Math.ceil(50+visualUnits(name)*9.8);
    width=Math.max(128,Math.min(maxWidth,width));
    select.style.setProperty('--qily-language-select-width',width+'px');
    select.setAttribute('title',name);
    select.setAttribute('aria-label','网页翻译语言：'+name);
    select.setAttribute('data-qily-selected-language',name);
  }

  function cleanControl(control){
    if(!control)return false;
    control.setAttribute('aria-label','网页翻译');
    control.setAttribute('title','本站默认显示中文原文；选择语言后翻译当前网页。');

    var badge=control.querySelector('.qily-web-translate__badge');
    if(badge)badge.remove();

    var status=control.querySelector('.qily-web-translate__status');
    if(status){
      status.hidden=true;
      status.setAttribute('aria-hidden','true');
      status.removeAttribute('aria-live');
      status.removeAttribute('aria-atomic');
    }

    var select=control.querySelector('.qily-web-translate__select');
    if(select){
      fitSelect(select);
      if(select.dataset.qilyPublicUiBound!=='true'){
        select.dataset.qilyPublicUiBound='true';
        select.addEventListener('change',function(){fitSelect(select)});
        select.addEventListener('input',function(){fitSelect(select)});
      }
    }
    return true;
  }

  function reconcile(){
    cleanControl(d.getElementById(CONTROL_ID));
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',reconcile,{once:true});
  else reconcile();
  d.addEventListener('qily:shell-ready',reconcile);
  d.addEventListener('qily:language-change',reconcile);
  w.addEventListener('pageshow',reconcile,{passive:true});
  w.addEventListener('resize',function(){w.requestAnimationFrame(reconcile)},{passive:true});

  if(w.MutationObserver){
    observer=new MutationObserver(function(){w.requestAnimationFrame(reconcile)});
    observer.observe(d.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['data-state']});
  }
})(document,window);
