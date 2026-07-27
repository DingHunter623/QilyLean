(function(){
'use strict';

function copyText(text){
  if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(text);
  var field=document.createElement('textarea');
  field.value=text;
  field.style.position='fixed';
  field.style.left='-9999px';
  document.body.appendChild(field);
  field.select();
  document.execCommand('copy');
  field.remove();
  return Promise.resolve();
}

function addStyles(){
  if(document.getElementById('times26001HomeStyles'))return;
  var style=document.createElement('style');
  style.id='times26001HomeStyles';
  style.textContent=[
    '.times26001-home-section{padding:clamp(48px,6vw,78px) clamp(18px,4vw,56px);background:#eef7f5;border-bottom:1px solid #d5e4e3}',
    '.times26001-home-inner{width:min(1280px,100%);margin:auto}',
    '.times26001-home-head{max-width:1080px;margin-bottom:28px}',
    '.times26001-home-head h2{margin:0 0 10px;color:#0f4b5a;font-size:clamp(32px,3.4vw,46px);line-height:1.18}',
    '.times26001-home-head p{margin:0;color:#5f7474;font-size:20px;line-height:1.76}',
    '.times26001-home-card{display:grid;grid-template-columns:minmax(340px,.9fr) minmax(0,1.1fr);gap:28px;align-items:center;padding:26px;border:1px solid #d5e4e3;border-top:5px solid #ef4e47;background:#fff;box-shadow:0 14px 38px rgba(15,75,90,.09)}',
    '.times26001-home-visual{overflow:hidden;margin:0;border:1px solid #d5e4e3;border-radius:20px;background:#fff}',
    '.times26001-home-visual img{display:block;width:100%;height:auto}',
    '.times26001-home-content small{color:#9a6f25;font-size:16px;font-weight:900}',
    '.times26001-home-content h3{margin:8px 0 10px;color:#0f4b5a;font-size:30px;line-height:1.3}',
    '.times26001-home-content>p{margin:0;color:#5f7474;font-size:19px;line-height:1.78}',
    '.times26001-feature-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px 14px;margin:18px 0;padding:0;list-style:none}',
    '.times26001-feature-list li{position:relative;padding-left:20px;color:#355;font-size:16.5px;line-height:1.62}',
    '.times26001-feature-list li:before{content:"";position:absolute;left:0;top:.62em;width:8px;height:8px;border-radius:50%;background:#ef4e47}',
    '.times26001-home-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}',
    '.times26001-home-actions a,.times26001-home-actions button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:9px 17px;border:1px solid #0f4b5a;border-radius:999px;color:#fff;background:#0f4b5a;font:inherit;font-size:16px;font-weight:900;text-decoration:none;cursor:pointer}',
    '.times26001-home-actions .download{border-color:#ef4e47;background:linear-gradient(135deg,#ef4e47,#c93836);box-shadow:0 9px 22px rgba(113,30,31,.16)}',
    '.times26001-home-actions .secondary{color:#0f4b5a;background:#fff}',
    '.times26001-home-status{align-self:center;color:#1f714f;font-size:15px;font-weight:900}',
    '.times26001-hero-link{border-color:#ef817b!important;background:rgba(239,78,71,.18)!important}',
    '.times26001-hero-link:hover,.times26001-hero-link:focus-visible{background:#ef4e47!important;border-color:#ef4e47!important;color:#fff!important}',
    '@media(max-width:900px){.times26001-home-card{grid-template-columns:1fr}.times26001-home-visual{max-width:720px;margin:auto}.times26001-feature-list{grid-template-columns:1fr}}',
    '@media(max-width:620px){.times26001-home-section{padding:42px 18px}.times26001-home-card{padding:20px}.times26001-home-head p{font-size:18.5px}.times26001-home-content h3{font-size:26px}.times26001-home-content>p{font-size:18px}.times26001-home-actions a,.times26001-home-actions button{width:100%}}'
  ].join('');
  document.head.appendChild(style);
}

function addHeroLink(){
  var actions=document.querySelector('.hero .actions');
  if(!actions||actions.querySelector('.times26001-hero-link'))return;
  var link=document.createElement('a');
  link.className='button times26001-hero-link';
  link.href='/tools/times26001/';
  link.textContent='Times26001 工时工具';
  actions.appendChild(link);
}

function addSection(){
  if(document.getElementById('times26001HomeSection'))return;
  var results=document.getElementById('results');
  if(!results||!results.parentNode)return;
  var section=document.createElement('section');
  section.id='times26001HomeSection';
  section.className='times26001-home-section';
  section.innerHTML='<div class="times26001-home-inner"><div class="times26001-home-head"><h2>数字化工具作品</h2><p>将工业工程测时需求与日常时间管理结合，形成可直接使用、可持续迭代的移动端工具；Android v1.1.2现已开放官网下载。</p></div><article class="times26001-home-card"><figure class="times26001-home-visual"><a href="/tools/times26001/" aria-label="查看Times26001应用介绍"><img src="/assets/tools/times26001-overview.svg?v=20260727-android-v112" alt="Times26001思大时间管理APP功能概览" width="1200" height="720" loading="lazy" decoding="async"></a></figure><div class="times26001-home-content"><small>移动端APP｜时间管理＋IE现场测时</small><h3>Times26001｜思大时间管理</h3><p>"QilyLean AI | 启力精益"为IE时间分析自主开发的时间工具。集成北京时间、万年历、闹钟响铃、秒表分段、总时长汇总、按秒倒计时、黄历与节气信息，可用于标准工时测量、工序分析和改善前后对比。</p><ul class="times26001-feature-list"><li>北京时间、阳历、农历、节气与节假日</li><li>一次性、工作日、周末及自定义提醒</li><li>秒表分段、总计汇总与文本复制</li><li>预设／自定义倒计时及离线通知</li><li>黄历宜忌、冲煞与传统时间信息</li><li>Android v1.1.2已开放直接下载</li></ul><div class="times26001-home-actions"><a class="download" href="/Times26001-Android-v1.1.2-IE-Stopwatch.apk" download>Android直接下载 v1.1.2</a><a class="secondary" href="/tools/times26001/">查看APP介绍</a><button class="secondary" type="button" data-copy-times26001>复制分享简介</button><span class="times26001-home-status" aria-live="polite"></span></div></div></article></div>';
  results.parentNode.insertBefore(section,results);
  var button=section.querySelector('[data-copy-times26001]');
  var status=section.querySelector('.times26001-home-status');
  button.addEventListener('click',function(){
    var text='"QilyLean AI | 启力精益"为IE时间分析自主开发的时间工具。Times26001 Android v1.1.2支持闹钟响铃、秒表分段、总时长汇总、按秒倒计时及结束响铃通知，现已开放官网直接下载。\nhttps://qilylean.com/tools/times26001/';
    copyText(text).then(function(){status.textContent='简介及网址已复制';setTimeout(function(){status.textContent='';},2200);});
  });
}

function boot(){
  var path=(location.pathname||'/').replace(/\/index\.html$/,'/');
  if(path!=='/'&&path!=='/qilylean/home.html'&&path!=='/qilylean/home-live.html')return;
  addStyles();
  addHeroLink();
  addSection();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
