(function(){
  'use strict';
  var style=document.createElement('style');
  style.id='font-plus-one-patch';
  style.textContent='body{font-size:20px!important;line-height:1.82!important}h1,.hero h1{font-size:clamp(48px,5.2vw,72px)!important;line-height:1.08!important}h2,.section h2,.head h2,.section-head h2{font-size:clamp(34px,3.6vw,48px)!important;line-height:1.16!important}h3,.card h3,.project h3,.paper-card h3,.method-card h3,.article h3{font-size:29px!important;line-height:1.34!important}h4{font-size:22px!important;line-height:1.4!important}.lead{font-size:clamp(22px,1.8vw,27px)!important;line-height:1.82!important}.head p,.section-head p,.card p,.timeline p,.project p,.paper-card p,.method-card p,.article p,.contact p,.credential,.list,.answer,textarea{font-size:20.5px!important;line-height:1.86!important}.answer{font-size:22px!important}textarea{font-size:21px!important}.metric span{font-size:18.5px!important;line-height:1.72!important}.metric em{font-size:17px!important;line-height:1.65!important}.tags li,.pill,.topic-control,.nav{font-size:17px!important}.paper-card .button,.button,button{font-size:17.5px!important}.portrait-badge span{font-size:15px!important}.portrait-badge div:nth-child(2) span{white-space:nowrap!important;font-size:14px!important;letter-spacing:-.2px!important}small,.meta,.tagline{font-size:16px!important}@media(max-width:760px){body{font-size:19.5px!important}h1,.hero h1{font-size:clamp(40px,11vw,52px)!important}h2,.section h2,.head h2,.section-head h2{font-size:clamp(31px,8.5vw,40px)!important}h3,.card h3,.project h3,.paper-card h3,.method-card h3,.article h3{font-size:26px!important}.lead{font-size:21px!important}.answer{font-size:21px!important}.head p,.section-head p,.card p,.timeline p,.project p,.paper-card p,.method-card p,.article p,.contact p,textarea{font-size:20px!important}.portrait-badge div:nth-child(2) span{font-size:15px!important}}';
  document.head.appendChild(style);
  function load(src,id){if(document.getElementById(id))return;var s=document.createElement('script');s.id=id;s.src=src;document.body.appendChild(s);}
  function boot(){
    load('terminology-v2.js?v=term2','terminologyV2Script');
    load('homepage-depth.js?v=depth3','homepageDepthScript');
    load('project-media-home.js?v=20260721-complete-v1','projectMediaHomeScript');
    load('content-restore.js?v=20260721-nav-position-fix-v1','contentRestoreScript');
    load('daily-insights-card.js?v=daily1','dailyInsightsCardScript');
    load('gbt2828-card.js?v=gbt2828-1','gbt2828CardScript');
    load('experience-lock-v3.js?v=lock3','experienceLockV3Script');
    load('career-resume-full.js?v=career-full1','careerResumeFullScript');
    load('dialogue-knowledge-pro.js?v=dialogue-pro1','dialogueKnowledgeProScript');
    load('dialogue-soul-v1.js?v=soul1','dialogueSoulV1Script');
    load('hero-veteran-tag.js?v=veteran1','heroVeteranTagScript');
    load('wechat-qr-official.js?v=official-full1','wechatQrOfficialScript');
    load('public-copy-polish.js?v=public1','publicCopyPolishScript');
    load('public-boundary-fix.js?v=boundary1','publicBoundaryFixScript');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
