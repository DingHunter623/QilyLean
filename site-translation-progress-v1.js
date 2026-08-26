/* QilyLean Translation Progress Notice V2｜2026-08-26
 * Non-blocking bilingual notice for user-initiated translation only.
 * V2 never restarts the same partial/error timer on unrelated DOM changes.
 */
(function(d,w){
  'use strict';
  if(w.__qilyTranslationProgressNoticeV1)return;
  w.__qilyTranslationProgressNoticeV1=true;

  var CONTROL_ID='qilyGlobalTranslationDualRouteV2';
  var NOTICE_ID='qilyTranslationProgressV1';
  var hideTimer=0,lastState='',lastMessage='';

  function ensureNotice(){
    var notice=d.getElementById(NOTICE_ID);if(notice)return notice;
    notice=d.createElement('div');notice.id=NOTICE_ID;notice.className='qily-translation-progress';notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');notice.setAttribute('aria-atomic','true');notice.setAttribute('data-qily-no-translate','true');notice.setAttribute('translate','no');notice.setAttribute('data-visible','false');notice.innerHTML='<span class="qily-translation-progress__icon" aria-hidden="true">🌐</span><span class="qily-translation-progress__copy"><strong>正在翻译，请稍候</strong><small>Translating — a brief delay may occur.</small></span>';(d.body||d.documentElement).appendChild(notice);return notice
  }
  function copyFor(state,message){
    if(state==='error')return[message||'翻译未完整完成，已恢复中文原文','Translation did not complete; the full Chinese source has been restored.'];
    if(state==='partial')return[message||'新增内容暂未完整翻译','Newly loaded content could not be fully translated.'];
    if(state==='working'&&message)return[message,'Translating current page…'];
    return['正在翻译，请稍候','Translating — a brief delay may occur.'];
  }
  function render(state,message){var notice=ensureNotice(),copy=copyFor(state,message),strong=notice.querySelector('strong'),small=notice.querySelector('small');if(strong)strong.textContent=copy[0];if(small)small.textContent=copy[1];notice.setAttribute('data-state',state)}
  function hideSoon(ms){var notice=ensureNotice();if(hideTimer)w.clearTimeout(hideTimer);hideTimer=w.setTimeout(function(){notice.setAttribute('data-visible','false');hideTimer=0},ms)}
  function sync(){
    var control=d.getElementById(CONTROL_ID);if(!control){hideSoon(100);return}
    var state=control.getAttribute('data-state')||'idle';var message=control.getAttribute('data-qily-public-message')||'';var notice=ensureNotice();
    if(state==='idle'){lastState=state;lastMessage=message;hideSoon(180);return}
    var unchanged=state===lastState&&message===lastMessage;lastState=state;lastMessage=message;render(state,message);notice.setAttribute('data-visible','true');
    if(unchanged)return;
    if(hideTimer){w.clearTimeout(hideTimer);hideTimer=0}
    if(state==='error')hideSoon(4200);else if(state==='partial')hideSoon(3200);
  }
  function bindControl(control){if(!control||control.dataset.qilyProgressNoticeBound==='true')return;control.dataset.qilyProgressNoticeBound='true';if(w.MutationObserver)new MutationObserver(sync).observe(control,{attributes:true,attributeFilter:['data-state','data-qily-public-message']});sync()}
  function reconcile(){ensureNotice();bindControl(d.getElementById(CONTROL_ID));sync()}
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',reconcile,{once:true});else reconcile();d.addEventListener('qily:language-change',function(){w.requestAnimationFrame(sync)});w.addEventListener('pageshow',reconcile,{passive:true});d.addEventListener('qily:shell-ready',reconcile);
})(document,window);
