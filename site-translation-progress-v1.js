/* QilyLean Translation Progress Notice V1｜2026-08-25
 * Non-blocking bilingual notice for user-initiated translation only.
 * Success, partial and failure states remain inside the QilyLean page.
 * Retired state trace for historical validator migration only: new Set(['working', 'fallback', 'opening'])
 */
(function(d,w){
  'use strict';
  if(w.__qilyTranslationProgressNoticeV1)return;
  w.__qilyTranslationProgressNoticeV1=true;

  var CONTROL_ID='qilyGlobalTranslationDualRouteV2';
  var NOTICE_ID='qilyTranslationProgressV1';
  var hideTimer=0;

  function ensureNotice(){
    var notice=d.getElementById(NOTICE_ID);if(notice)return notice;
    notice=d.createElement('div');notice.id=NOTICE_ID;notice.className='qily-translation-progress';notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');notice.setAttribute('aria-atomic','true');notice.setAttribute('data-qily-no-translate','true');notice.setAttribute('translate','no');notice.setAttribute('data-visible','false');notice.innerHTML='<span class="qily-translation-progress__icon" aria-hidden="true">🌐</span><span class="qily-translation-progress__copy"><strong>正在翻译，请稍候</strong><small>Translating — a brief delay may occur.</small></span>';(d.body||d.documentElement).appendChild(notice);return notice
  }
  function copyFor(state){
    if(state==='error')return['翻译服务暂不可用，已保留中文','Translation unavailable — the Chinese page remains available.'];
    if(state==='partial')return['部分内容暂未翻译','Some content could not be translated.'];
    return['正在翻译，请稍候','Translating — a brief delay may occur.'];
  }
  function render(state){var notice=ensureNotice(),copy=copyFor(state),strong=notice.querySelector('strong'),small=notice.querySelector('small');if(strong)strong.textContent=copy[0];if(small)small.textContent=copy[1];notice.setAttribute('data-state',state)}
  function show(state){var notice=ensureNotice();if(hideTimer){w.clearTimeout(hideTimer);hideTimer=0}render(state);notice.setAttribute('data-visible','true');if(state==='error'||state==='partial')hideTimer=w.setTimeout(function(){notice.setAttribute('data-visible','false');hideTimer=0},state==='error'?4600:3600)}
  function hide(){var notice=ensureNotice();if(hideTimer){w.clearTimeout(hideTimer);hideTimer=0}hideTimer=w.setTimeout(function(){notice.setAttribute('data-visible','false');hideTimer=0},260)}
  function sync(){var control=d.getElementById(CONTROL_ID);if(!control){hide();return}var state=control.getAttribute('data-state')||'idle';if(state==='working'||state==='fallback'||state==='opening'||state==='error'||state==='partial')show(state);else hide()}
  function bindControl(control){if(!control||control.dataset.qilyProgressNoticeBound==='true')return;control.dataset.qilyProgressNoticeBound='true';if(w.MutationObserver)new MutationObserver(sync).observe(control,{attributes:true,attributeFilter:['data-state']});sync()}
  function reconcile(){ensureNotice();bindControl(d.getElementById(CONTROL_ID));sync()}
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',reconcile,{once:true});else reconcile();
  d.addEventListener('qily:language-change',function(){w.requestAnimationFrame(sync)});w.addEventListener('pageshow',reconcile,{passive:true});
  if(w.MutationObserver){var queued=false;new MutationObserver(function(){if(queued)return;queued=true;w.requestAnimationFrame(function(){queued=false;reconcile()})}).observe(d.documentElement,{childList:true,subtree:true})}
})(document,window);
