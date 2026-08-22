(function(){
'use strict';

var TIMES26001_POSITIONING='面向工业工程、现场改善与时间研究场景的专业测时工具，由 QilyLean｜启力精益开发。';
var PURE_DDZ_POSITIONING='以QilyLean制造运营六大业务主旨为视觉寓意的纯净单机斗地主：无广告、无登录、无支付，网页版直接玩，Android可离线安装。';

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
    '.pure-ddz-home-section{padding:clamp(48px,6vw,78px) clamp(18px,4vw,56px);background:#f8fbfa;border-bottom:1px solid #d5e4e3}',
    '.pure-ddz-home-inner{width:min(1280px,100%);margin:auto}',
    '.pure-ddz-home-card{display:grid;grid-template-columns:minmax(340px,.92fr) minmax(0,1.08fr);gap:28px;align-items:center;padding:26px;border:1px solid #cfe2df;border-top:5px solid #178b94;background:#fff;box-shadow:0 14px 38px rgba(15,75,90,.10)}',
    '.pure-ddz-home-visual{min-height:340px;display:grid;place-items:center;overflow:hidden;border:1px solid #bfd8d4;border-radius:20px;background:radial-gradient(circle at 50% 42%,rgba(33,161,103,.46),transparent 34%),linear-gradient(145deg,#063f35,#0c6848 48%,#073c47)}',
    '.pure-ddz-table{width:min(430px,88%);padding:28px;border:2px solid rgba(244,223,170,.55);border-radius:42% / 22%;text-align:center;color:#fff;box-shadow:0 18px 42px rgba(0,0,0,.22)}',
    '.pure-ddz-cards{display:flex;justify-content:center;margin:8px 0 18px}.pure-ddz-cards i{width:58px;height:84px;margin-left:-15px;display:grid;place-items:center;border:2px solid #fff;border-radius:9px;background:linear-gradient(145deg,#0f4b5a,#178b94);color:#fff3c9;font:900 30px Georgia;box-shadow:0 7px 16px rgba(0,0,0,.25)}.pure-ddz-cards i:first-child{margin-left:0}',
    '.pure-ddz-table strong{display:block;font-size:30px}.pure-ddz-table span{display:block;margin-top:8px;color:#ffe39b;font-size:15px;font-weight:850}',
    '.pure-ddz-business{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-top:18px}.pure-ddz-business b{padding:7px 5px;border:1px solid rgba(255,255,255,.18);border-radius:8px;background:rgba(255,255,255,.08);font-size:12px;white-space:nowrap}',
    '.pure-ddz-home-content small{color:#9a6f25;font-size:16px;font-weight:900}.pure-ddz-home-content h3{margin:8px 0 10px;color:#0f4b5a;font-size:30px;line-height:1.3}.pure-ddz-home-content>p{margin:0;color:#5f7474;font-size:19px;line-height:1.78}',
    '.pure-ddz-feature-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px 14px;margin:18px 0;padding:0;list-style:none}.pure-ddz-feature-list li{position:relative;padding-left:20px;color:#355;font-size:16.5px;line-height:1.62}.pure-ddz-feature-list li:before{content:"";position:absolute;left:0;top:.62em;width:8px;height:8px;border-radius:50%;background:#178b94}',
    '.pure-ddz-home-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}.pure-ddz-home-actions a,.pure-ddz-home-actions button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:9px 17px;border:1px solid #0f4b5a;border-radius:999px;color:#fff;background:#0f4b5a;font:inherit;font-size:16px;font-weight:900;text-decoration:none;cursor:pointer}.pure-ddz-home-actions .play{border-color:#178b94;background:linear-gradient(135deg,#178b94,#0f6873)}.pure-ddz-home-actions .apk{border-color:#d5a83d;color:#4e3000;background:linear-gradient(145deg,#ffe39b,#efb73e)}.pure-ddz-home-actions .secondary{color:#0f4b5a;background:#fff}',
    '.pure-ddz-hero-link{border-color:#66cbc7!important;background:rgba(23,139,148,.18)!important}.pure-ddz-hero-link:hover,.pure-ddz-hero-link:focus-visible{background:#178b94!important;border-color:#178b94!important;color:#fff!important}',
    '@media(max-width:900px){.times26001-home-card,.pure-ddz-home-card{grid-template-columns:1fr}.times26001-home-visual{max-width:720px;margin:auto}.times26001-feature-list,.pure-ddz-feature-list{grid-template-columns:1fr}}',
    '@media(max-width:620px){.times26001-home-section,.pure-ddz-home-section{padding:42px 18px}.times26001-home-card,.pure-ddz-home-card{padding:20px}.times26001-home-head p{font-size:18.5px}.times26001-home-content h3,.pure-ddz-home-content h3{font-size:26px}.times26001-home-content>p,.pure-ddz-home-content>p{font-size:18px}.times26001-home-actions a,.times26001-home-actions button,.pure-ddz-home-actions a,.pure-ddz-home-actions button{width:100%}.pure-ddz-business{grid-template-columns:repeat(2,minmax(0,1fr))}}'
  ].join('');
  document.head.appendChild(style);
}

function addHeroLink(){
  var actions=document.querySelector('.hero .actions');
  if(!actions||actions.querySelector('.times26001-hero-link'))return;
  var link=document.createElement('a');
  link.className='button times26001-hero-link';
  link.href='/tools/times26001/';
  link.textContent='Times26001｜IE现场测时';
  actions.appendChild(link);
}

function addPureDdzHeroLink(){
  var actions=document.querySelector('.hero .actions');
  if(!actions||actions.querySelector('.pure-ddz-hero-link'))return;
  var link=document.createElement('a');
  link.className='button pure-ddz-hero-link';
  link.href='/tools/pure-ddz/';
  link.textContent='纯净斗地主｜在线玩';
  actions.appendChild(link);
}

function addSection(){
  if(document.getElementById('times26001HomeSection'))return;
  var results=document.getElementById('results');
  if(!results||!results.parentNode)return;
  var section=document.createElement('section');
  section.id='times26001HomeSection';
  section.className='times26001-home-section';
  section.innerHTML='<div class="times26001-home-inner"><div class="times26001-home-head"><h2>数字化工具作品</h2><p>Times26001聚焦工业工程时间研究与制造现场测时，形成可直接使用、可持续迭代的移动端专业工具；同时保留日常时间管理辅助能力。</p></div><article class="times26001-home-card"><figure class="times26001-home-visual"><a href="/tools/times26001/" aria-label="查看Times26001应用介绍"><img src="/assets/tools/times26001-overview.svg?v=20260805-android-v114" alt="Times26001工业工程时间研究与IE现场测时工具功能概览" width="1200" height="720" loading="lazy" decoding="async"></a></figure><div class="times26001-home-content"><small>移动端APP｜工业工程时间研究＋IE现场测时</small><h3>Times26001</h3><p><strong>'+TIMES26001_POSITIONING+'</strong> 集成IE秒表分段、累计总时长、文本复制、倒计时、闹钟、北京时间、万年历、农历、黄历与节气信息，可用于标准工时测量、工序分析和改善前后对比。</p><ul class="times26001-feature-list"><li>IE秒表分段、本段时间与累计总时长</li><li>测时记录复制到Excel/WPS等工程工具</li><li>预设／自定义倒计时及离线通知</li><li>一次性、工作日、周末及自定义提醒</li><li>北京时间、阳历、农历、节气与节假日</li><li>当前手机试用版 v1.1.13 / versionCode 16 / API 36</li></ul><div class="times26001-home-actions"><a class="download" href="/Times26001-Android-v1.1.13-Standard-Website-Logo.apk?build=efe5e188" download>下载 v1.1.13 官网标准LOGO统一修正版</a><a class="secondary" href="/tools/times26001/">查看APP介绍与发布状态</a><button class="secondary" type="button" data-copy-times26001>复制分享简介</button><span class="times26001-home-status" aria-live="polite"></span></div></div></article></div>';
  results.parentNode.insertBefore(section,results);
  var button=section.querySelector('[data-copy-times26001]');
  var status=section.querySelector('.times26001-home-status');
  button.addEventListener('click',function(){
    var text='Times26001｜'+TIMES26001_POSITIONING+'\nhttps://qilylean.com/tools/times26001/';
    copyText(text).then(function(){status.textContent='简介及网址已复制';setTimeout(function(){status.textContent='';},2200);});
  });
}

function addPureDdzSection(){
  if(document.getElementById('pureDdzHomeSection'))return;
  var results=document.getElementById('results');
  if(!results||!results.parentNode)return;
  var section=document.createElement('section');
  section.id='pureDdzHomeSection';
  section.className='pure-ddz-home-section';
  section.innerHTML='<div class="pure-ddz-home-inner"><article class="pure-ddz-home-card"><div class="pure-ddz-home-visual" aria-label="QilyLean六大业务主题斗地主牌桌示意"><div class="pure-ddz-table"><div class="pure-ddz-cards"><i>Q</i><i>Q</i><i>Q</i></div><strong>纯净斗地主</strong><span>QilyLean｜启力精益 六大业务主题</span><div class="pure-ddz-business"><b>现场事实</b><b>工程数据</b><b>精益改善</b><b>质量保证</b><b>数智固化</b><b>知识资产</b></div></div></div><div class="pure-ddz-home-content"><small>网页游戏＋Android APP｜休闲数字产品</small><h3>Pure DDZ Classic｜纯净斗地主</h3><p><strong>'+PURE_DDZ_POSITIONING+'</strong> 完整支持三人叫地主、经典牌型、AI电脑对手、智能提示、积分战绩、中文语音及横竖屏适配；牌面识别保持传统规则，QilyLean业务元素主要用于牌背与桌面视觉。</p><ul class="pure-ddz-feature-list"><li>完整三人斗地主、叫分、地主与胜负结算</li><li>单牌、对子、顺子、连对、飞机、炸弹、王炸等完整牌型</li><li>AI电脑对手与AI智能提示</li><li>无广告、无注册、无登录、无支付</li><li>网页版直接游玩，手机/平板/电脑自适应</li><li>Android v1.0.0 离线安装包</li></ul><div class="pure-ddz-home-actions"><a class="play" href="/tools/pure-ddz/">立即在线玩</a><a class="apk" href="https://github.com/DingHunter623/Pure-DDZ-Classic/releases/download/v1.0.0/Pure-DDZ-Classic-v1.0.0.apk">下载 Android APK</a><a class="secondary" href="https://github.com/DingHunter623/Pure-DDZ-Classic" target="_blank" rel="noopener">查看项目仓库</a><button class="secondary" type="button" data-copy-pure-ddz>复制分享简介</button><span class="times26001-home-status" aria-live="polite"></span></div></div></article></div>';
  results.parentNode.insertBefore(section,results);
  var button=section.querySelector('[data-copy-pure-ddz]');
  var status=section.querySelector('.times26001-home-status');
  button.addEventListener('click',function(){
    var text='纯净斗地主｜'+PURE_DDZ_POSITIONING+'\nhttps://qilylean.com/tools/pure-ddz/';
    copyText(text).then(function(){status.textContent='简介及网址已复制';setTimeout(function(){status.textContent='';},2200);});
  });
}

function boot(){
  var path=(location.pathname||'/').replace(/\/index\.html$/,'/');
  if(path!=='/'&&path!=='/qilylean/home.html'&&path!=='/qilylean/home-live.html')return;
  addStyles();
  addHeroLink();
  addPureDdzHeroLink();
  addSection();
  addPureDdzSection();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
