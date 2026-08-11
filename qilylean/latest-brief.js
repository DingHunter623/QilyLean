(function(){
'use strict';
var card=document.querySelector('[data-latest-brief-card]');
if(!card)return;
var datePattern=/^\d{4}-\d{2}-\d{2}$/;
var stamp=Date.now();
var releaseCandidate={
  date:'2026-08-12',
  theme:'汽车座椅开关PMO项目管理',
  title:'汽车座椅开关PMO：从职能架构到量产交付的项目管理闭环',
  summary:'汽车座椅开关项目不是研发部门单独完成的一组任务，而是一条把客户要求、产品设计、模具与设备、供应链、过程质量、产能爬坡和量产移交连成一体的交付链。PMO的价值，是建立统一目标、阶段门、责任界面和升级机制，让跨职能团队围绕同一基线做决策。',
  href:'/qilylean/daily/2026-08-12.html'
};

function request(url,type){
  return fetch(url+(url.indexOf('?')>=0?'&':'?')+'latest='+stamp,{cache:'no-store'}).then(function(response){
    if(!response.ok)throw new Error('request_failed');
    return type==='json'?response.json():response.text();
  });
}

function staticCandidate(){
  var date=card.getAttribute('data-latest-brief-date')||'';
  if(!datePattern.test(date))return null;
  var meta=card.querySelector('[data-latest-brief-meta]');
  var metaText=meta?meta.textContent.trim():'';
  var link=card.querySelector('[data-latest-brief-link]');
  return {
    date:date,
    theme:metaText.replace(/^最新：\d{4}-\d{2}-\d{2}｜/,''),
    title:(card.querySelector('[data-latest-brief-title]')||{}).textContent||'',
    summary:(card.querySelector('[data-latest-brief-summary]')||{}).textContent||'',
    href:link?link.getAttribute('href'):''
  };
}

function indexCandidate(items){
  var latest=Array.isArray(items)&&items[0];
  if(!latest||!datePattern.test(latest.date||''))return null;
  return {
    date:latest.date,
    theme:latest.theme||'',
    title:latest.title||'',
    summary:latest.summary||'',
    href:'/qilylean/daily/'+latest.date+'.html'
  };
}

function directoryCandidate(html){
  var page=new DOMParser().parseFromString(html,'text/html');
  var entry=page.querySelector('.brief-index-card.latest')||page.querySelector('.brief-index-card[data-brief-date]');
  if(!entry)return null;
  var date=entry.getAttribute('data-brief-date')||'';
  if(!datePattern.test(date))return null;
  var meta=entry.querySelector('.brief-index-meta span');
  var link=entry.querySelector('h2 a')||entry.querySelector('.brief-open');
  return {
    date:date,
    theme:meta?meta.textContent.trim():'',
    title:entry.getAttribute('data-brief-title')||(link?link.textContent.trim():''),
    summary:entry.getAttribute('data-brief-summary')||'',
    href:link?link.getAttribute('href'):'/qilylean/daily/'+date+'.html'
  };
}

function pageDetails(latest){
  if(latest.summary&&latest.title&&latest.theme)return Promise.resolve(latest);
  return request(latest.href||('/qilylean/daily/'+latest.date+'.html'),'text').then(function(html){
    var page=new DOMParser().parseFromString(html,'text/html');
    var article=page.querySelector('article.post');
    if(!article)return latest;
    var dateLine=article.querySelector('.date');
    var title=article.querySelector('.content > h2')||article.querySelector('h2');
    var summary=article.querySelector('.content > p')||article.querySelector('p');
    var line=dateLine?dateLine.textContent.trim():'';
    latest.theme=latest.theme||line.replace(latest.date,'').replace(/[｜|]/g,'').trim();
    latest.title=latest.title||(title?title.textContent.trim():'');
    latest.summary=latest.summary||(summary?summary.textContent.trim():'');
    return latest;
  }).catch(function(){return latest;});
}

function render(latest){
  if(!latest||!datePattern.test(latest.date||''))return;
  var meta=card.querySelector('[data-latest-brief-meta]');
  var title=card.querySelector('[data-latest-brief-title]');
  var summary=card.querySelector('[data-latest-brief-summary]');
  var link=card.querySelector('[data-latest-brief-link]');
  if(meta)meta.textContent='最新：'+latest.date+'｜'+(latest.theme||'今日简报');
  if(title&&latest.title)title.textContent=latest.title;
  if(summary&&latest.summary)summary.textContent=latest.summary;
  if(link)link.setAttribute('href',latest.href||('/qilylean/daily/'+latest.date+'.html'));
  card.setAttribute('data-latest-brief-date',latest.date);
}

Promise.all([
  request('/qilylean/daily/index.json','json').then(indexCandidate).catch(function(){return null;}),
  request('/qilylean/daily-insights.html','text').then(directoryCandidate).catch(function(){return null;})
]).then(function(candidates){
  candidates.push(staticCandidate());
  candidates.push(releaseCandidate);
  var latest=candidates.filter(Boolean).sort(function(a,b){return b.date.localeCompare(a.date);})[0];
  return latest?pageDetails(latest):null;
}).then(render).catch(function(){});
})();
