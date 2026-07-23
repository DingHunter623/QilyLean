(function(){
'use strict';
function text(el){return (el&&el.textContent||'').replace(/\s+/g,'').trim();}
function isLeanKnowledgePage(){return /lean-knowledge\.html$/i.test(location.pathname);}
function isKnowledgeLink(link){
  var href=link.getAttribute('href')||'';
  var label=text(link);
  return label==='知识分享'||label==='精益知识分享'||label==='每日工程版简报'||/knowledge\.html(?:$|[?#])/.test(href)||/lean-knowledge\.html(?:$|[?#])/.test(href)||href==='#daily-insights';
}
function fixNavigation(){
  var nav=document.querySelector('.nav');
  if(!nav)return;
  var links=[].slice.call(nav.querySelectorAll('a')).filter(isKnowledgeLink);
  var primary=links[0];
  if(!primary){primary=document.createElement('a');nav.appendChild(primary);}
  if(isLeanKnowledgePage()){
    primary.textContent='每日工程版简报';
    primary.setAttribute('href','#daily-insights');
  }else{
    primary.textContent='知识分享';
    primary.setAttribute('href','/knowledge/');
    primary.setAttribute('target','_top');
  }
  links.slice(1).forEach(function(link){link.remove();});
}
function makeReferenceCard(id,title,summary,methodUrl,previewUrl){
  var card=document.createElement('article');
  card.className='paper-card';card.id=id;
  card.innerHTML='<small>参考资料</small><h3>'+title+'</h3><p>'+summary+'</p><div class="knowledge-actions"><a class="button" href="'+methodUrl+'" target="_top">方法解读</a><a class="button secondary" href="'+previewUrl+'" target="_top" rel="noopener">在线预览</a></div>';
  return card;
}
function ensureReferenceCard(grid,id,title,summary,methodUrl,previewUrl){
  var matches=[].slice.call(grid.querySelectorAll('.paper-card')).filter(function(card){return text(card.querySelector('h3'))===text({textContent:title});});
  var primary=matches[0];
  if(!primary){primary=makeReferenceCard(id,title,summary,methodUrl,previewUrl);grid.appendChild(primary);}else{
    primary.id=id;
    var actions=primary.querySelector('.knowledge-actions');
    if(!actions){actions=document.createElement('div');actions.className='knowledge-actions';primary.appendChild(actions);}
    actions.innerHTML='<a class="button" href="'+methodUrl+'" target="_top">方法解读</a><a class="button secondary" href="'+previewUrl+'" target="_top" rel="noopener">在线预览</a>';
  }
  matches.slice(1).forEach(function(card){card.remove();});
}
function addReferenceCards(){
  var papers=document.getElementById('papers');
  if(!papers)return;
  var grid=papers.querySelector('.grid-3');if(!grid)return;
  ensureReferenceCard(grid,'referenceAuditCard','客户验厂常查程序文件清单与审核重点','围绕体系文件、生产控制、质量保证、供应链、EHS、人事及数据管理，梳理客户验厂高频审核点、常见不符合与证据链准备方法。','/knowledge/customer-audit-document-control.html','/qilylean/reference-audit-documents.html?build=20260722-hd-v2');
  ensureReferenceCard(grid,'referenceIatfCard','IATF16949六大核心工具简介及官方原著链接','系统说明APQP、Control Plan、FMEA、MSA、SPC、PPAP的职责分工与逻辑链，面向汽车电子NPI、量产策划与质量体系培训。','/knowledge/iatf16949-core-tools.html','/qilylean/reference-iatf16949-core-tools.html?build=20260722-hd-v2');
  var intro=papers.querySelector('.head p');
  if(intro&&intro.textContent.indexOf('客户验厂')<0)intro.textContent='围绕VSM、标准工时、SMED、ERP/MES、IE数据底座、目视化管理、单件流、客户验厂与IATF16949核心工具等主题，持续沉淀制造改善方法与标准化参考资料。';
}
function addDailyInsights(){
  if(!isLeanKnowledgePage())return;
  var main=document.querySelector('main');if(!main)return;
  fixNavigation();
  var toc=document.querySelector('.toc');
  if(toc){
    var dailyEntries=[].slice.call(toc.querySelectorAll('a')).filter(function(a){return text(a)==='每日工程版简报'||a.getAttribute('href')==='#daily-insights';});
    var dailyEntry=dailyEntries[0];
    if(!dailyEntry){dailyEntry=document.createElement('a');toc.insertBefore(dailyEntry,toc.firstChild);}
    dailyEntry.href='#daily-insights';dailyEntry.textContent='每日工程版简报';
    dailyEntries.slice(1).forEach(function(a){a.remove();});
    if(!toc.querySelector('a[href="/qilylean/lean-tools.html"]')){
      var toolEntry=document.createElement('a');toolEntry.href='/qilylean/lean-tools.html';toolEntry.textContent='精益工具库';
      if(dailyEntry.nextSibling)toc.insertBefore(toolEntry,dailyEntry.nextSibling);else toc.appendChild(toolEntry);
    }
  }
  if(document.getElementById('daily-insights'))return;
  var directory=document.querySelector('main .section.alt');
  var section=document.createElement('section');section.className='section';section.id='daily-insights';
  section.innerHTML='<div class="inner"><div class="head"><h2>每日工程版简报</h2><p>围绕精益生产、IE、PMC、ERP/MES、数智化工厂、AI工具、汽车电子与半导体制造，持续发布可用于工作决策、行业观察和个人知识沉淀的工程版内容。</p></div><article class="article"><small>2026-07-23｜闭环管理 / 实绩验证</small><h2>改善有没有完成，不看“已处理”，要看实绩是否验证</h2><ul class="tag-row"><li>5W2H</li><li>PDCA</li><li>实绩验证</li><li>标准固化</li></ul><p>5W2H把行动说清楚，PDCA与实绩数据证明结果；验证通过后再更新标准作业、点检表、系统字段和责任机制，未达目标则回到原因验证，不能用“已处理”替代真正结案。</p><div class="actions"><a class="button" href="/qilylean/daily/2026-07-23.html" target="_top">查看今日简报</a><a class="button secondary" href="/qilylean/daily-insights.html" target="_top">查看简报目录</a><a class="button secondary" href="/qilylean/lean-tools.html" target="_top">进入精益工具库</a></div></article></div>';
  if(directory&&directory.nextSibling)directory.parentNode.insertBefore(section,directory.nextSibling);else main.appendChild(section);
}
function boot(){fixNavigation();addReferenceCards();addDailyInsights();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('load',boot,{once:true});
setTimeout(boot,500);
setTimeout(boot,1500);
})();
