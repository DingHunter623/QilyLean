(function(){
'use strict';
function text(el){return (el&&el.textContent||'').replace(/\s+/g,'').trim();}
function isKnowledgeLink(link){
  var href=link.getAttribute('href')||'';
  var label=text(link);
  return label==='知识分享'||label==='精益知识分享'||/knowledge\.html(?:$|[?#])/.test(href)||/lean-knowledge\.html(?:$|[?#])/.test(href);
}
function fixNavigation(){
  var links=[].slice.call(document.querySelectorAll('.nav a')).filter(isKnowledgeLink);
  var primary=links[0];
  if(!primary){
    var nav=document.querySelector('.nav');
    if(!nav)return;
    primary=document.createElement('a');
    nav.appendChild(primary);
  }
  primary.textContent='知识分享';
  primary.setAttribute('href','/qilylean/lean-knowledge.html#daily-insights');
  primary.setAttribute('target','_top');
  links.slice(1).forEach(function(link){link.remove();});
}
function makeReferenceCard(id,title,summary,url){
  var card=document.createElement('article');
  card.className='paper-card';card.id=id;
  card.innerHTML='<small>参考资料</small><h3>'+title+'</h3><p>'+summary+'</p><div class="actions"><a class="button" href="'+url+'" target="_top">在线预览</a></div>';
  return card;
}
function addReferenceCards(){
  var papers=document.getElementById('papers');
  if(!papers)return;
  var grid=papers.querySelector('.grid-3');if(!grid)return;
  if(!document.getElementById('referenceAuditCard'))grid.appendChild(makeReferenceCard('referenceAuditCard','客户验厂常查程序文件清单与审核重点','围绕体系文件、生产控制、质量保证、供应链、EHS、人事及数据管理，梳理客户验厂高频审核点、常见不符合与证据链准备方法。','/qilylean/reference-audit-documents.html?build=20260722-publish-v1'));
  if(!document.getElementById('referenceIatfCard'))grid.appendChild(makeReferenceCard('referenceIatfCard','IATF16949六大核心工具简介及官方原著链接','系统说明APQP、Control Plan、PPAP、FMEA、MSA、SPC的职责分工与逻辑链，面向汽车电子NPI、量产策划与质量体系培训。','/qilylean/reference-iatf16949-core-tools.html?build=20260722-publish-v1'));
  var intro=papers.querySelector('.head p');
  if(intro&&intro.textContent.indexOf('客户验厂')<0)intro.textContent='围绕VSM、标准工时、SMED、ERP/MES、IE数据底座、目视化管理、单件流、客户验厂与IATF16949核心工具等主题，持续沉淀制造改善方法与标准化参考资料。';
}
function addDailyInsights(){
  if(!/lean-knowledge\.html$/i.test(location.pathname))return;
  var main=document.querySelector('main');if(!main)return;
  var nav=[].slice.call(document.querySelectorAll('.topbar .nav a'));
  nav.forEach(function(a){if(text(a)==='知识分享'||text(a)==='精益知识分享'){a.textContent='每日工程版简报';a.setAttribute('href','#daily-insights');}});
  var toc=document.querySelector('.toc');
  if(toc&&!toc.querySelector('a[href="#daily-insights"]')){
    var dailyEntry=document.createElement('a');dailyEntry.href='#daily-insights';dailyEntry.textContent='每日工程版简报';toc.insertBefore(dailyEntry,toc.firstChild);
  }
  if(toc&&!toc.querySelector('a[href="/qilylean/lean-tools.html"]')){
    var toolEntry=document.createElement('a');toolEntry.href='/qilylean/lean-tools.html';toolEntry.textContent='精益工具库';
    var daily=toc.querySelector('a[href="#daily-insights"]');
    if(daily&&daily.nextSibling)toc.insertBefore(toolEntry,daily.nextSibling);else toc.appendChild(toolEntry);
  }
  if(document.getElementById('daily-insights'))return;
  var directory=document.querySelector('main .section.alt');
  var section=document.createElement('section');section.className='section';section.id='daily-insights';
  section.innerHTML='<div class="inner"><div class="head"><h2>每日工程版简报</h2><p>围绕精益生产、IE、PMC、ERP/MES、数智化工厂、AI工具、汽车电子与半导体制造，持续发布可用于工作决策、行业观察和个人知识沉淀的工程版内容。</p></div><article class="article"><small>2026-07-22｜5W2H / 问题澄清</small><h2>5W2H不是要因分析，而是把问题和行动说清楚</h2><ul class="tag-row"><li>5W2H</li><li>问题澄清</li><li>行动策划</li><li>5M2E</li></ul><p>5W2H用于明确发生了什么、为什么处理、谁负责、何时何地完成、怎么做以及投入多少；需要展开要因时，应配合5M2E、鱼骨图和5Why，原因验证后再把对策转化为责任、节点与资源安排。</p><div class="actions"><a class="button" href="/qilylean/daily-insights.html#2026-07-22" target="_top">查看今日简报</a><a class="button secondary" href="/qilylean/daily-insights.html" target="_top">查看全部简报</a><a class="button secondary" href="/qilylean/lean-tools.html" target="_top">进入精益工具库</a></div></article></div>';
  if(directory&&directory.nextSibling)directory.parentNode.insertBefore(section,directory.nextSibling);else main.appendChild(section);
}
function boot(){fixNavigation();addReferenceCards();addDailyInsights();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('load',boot,{once:true});
setTimeout(boot,500);
setTimeout(boot,1500);
})();