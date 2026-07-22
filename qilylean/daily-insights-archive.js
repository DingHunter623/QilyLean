(function(){
'use strict';
if(!/daily-insights\.html$/i.test(location.pathname))return;
var archive=document.querySelector('.archive');
if(!archive)return;
archive.id='all-briefs';

var style=document.createElement('style');
style.id='dailyArchiveStyle';
style.textContent='.archive-summary{padding:16px 20px;border:1px solid var(--line);border-left:5px solid var(--gold);background:#fff;color:var(--forest);font-weight:900}.archive-summary span{color:var(--muted);font-weight:750}.archive#all-briefs{scroll-margin-top:86px}';
document.head.appendChild(style);

function posts(){
  return Array.prototype.filter.call(archive.children,function(node){return node.classList&&node.classList.contains('post')&&/^\d{4}-\d{2}-\d{2}$/.test(node.id);});
}
function alignArchive(){
  if(location.hash!=='#all-briefs')return;
  requestAnimationFrame(function(){archive.scrollIntoView({block:'start',behavior:'auto'});});
}
function sortAndSummarize(){
  var list=posts().sort(function(a,b){return b.id.localeCompare(a.id);});
  if(!list.length)return;
  list.forEach(function(post){archive.appendChild(post);});
  var latest=list[0],earliest=list[list.length-1];
  var navLatest=document.querySelector('.nav a[href^="#2026-"]');
  if(navLatest)navLatest.setAttribute('href','#'+latest.id);
  var latestTitle=(latest.querySelector('h2')||{}).textContent||'';
  document.documentElement.setAttribute('data-latest-brief',latest.id);
  document.documentElement.setAttribute('data-latest-title',latestTitle.trim());
  var summary=document.getElementById('dailyArchiveSummary');
  if(!summary){summary=document.createElement('div');summary.id='dailyArchiveSummary';summary.className='archive-summary';archive.insertBefore(summary,archive.firstChild);}
  summary.innerHTML='全部简报：'+list.length+'期 <span>｜'+earliest.id+'—'+latest.id+'｜按最新至最早排列</span>';
  alignArchive();
}
var timer=0;
function schedule(){clearTimeout(timer);timer=setTimeout(sortAndSummarize,80);}
var observer=new MutationObserver(schedule);
observer.observe(archive,{childList:true});

function copyText(text){
  if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(text);
  var area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.left='-9999px';document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();return Promise.resolve();
}
document.addEventListener('click',function(event){
  var button=event.target.closest&&event.target.closest('.share');
  if(!button)return;
  event.preventDefault();event.stopImmediatePropagation();
  var article=button.closest('.post');if(!article)return;
  var url=location.href.split('#')[0]+'#'+article.id;
  var title=button.dataset.title||((article.querySelector('h2')||{}).textContent)||document.title;
  var status=article.querySelector('.status');
  function done(){if(status)status.textContent='链接已复制';setTimeout(function(){if(status)status.textContent='';},2200);}
  if(navigator.share)navigator.share({title:title,text:title,url:url}).catch(function(){copyText(title+'\n'+url).then(done);});
  else copyText(title+'\n'+url).then(done);
},true);
window.addEventListener('hashchange',alignArchive);

schedule();
window.addEventListener('load',function(){schedule();setTimeout(schedule,350);setTimeout(schedule,1200);setTimeout(schedule,2600);});
})();