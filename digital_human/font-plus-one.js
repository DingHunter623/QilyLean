(function(){
  var style=document.createElement('style');
  style.id='font-plus-one-patch';
  style.textContent='body{font-size:19px!important;line-height:1.78!important}.lead{font-size:clamp(21px,1.65vw,25px)!important;line-height:1.78!important}.head p,.section-head p,.card p,.timeline p,.project p,.paper-card p,.method-card p,.article p,.contact p,.credential,.list,.answer,textarea{font-size:19.5px!important;line-height:1.82!important}.answer{font-size:21px!important}textarea{font-size:20px!important}.metric span{font-size:17.5px!important;line-height:1.68!important}.metric em{font-size:16px!important;line-height:1.6!important}.tags li,.pill,.topic-control,.nav{font-size:16px!important}.paper-card .button,.button{font-size:16.5px!important}.portrait-badge span{font-size:14px!important}@media(max-width:760px){body{font-size:18.5px!important}.answer{font-size:20px!important}.head p,.card p,.timeline p,.project p,.paper-card p,.method-card p,.contact p,textarea{font-size:19px!important}}';
  document.head.appendChild(style);
  function load(src,id){if(document.getElementById(id))return;var s=document.createElement('script');s.id=id;s.src=src;document.body.appendChild(s)}
  function boot(){load('homepage-depth.js?v=depth2','homepageDepthScript');load('content-restore.js?v=restore-entries2','contentRestoreScript');load('contact-wechat-open.js?v=wechat-open1','contactWechatOpenScript');load('floating-ui-repair.js?v=repair1','floatingUiRepairScript')}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();