(function(){
'use strict';
var ORIGIN='https://qilylean.com';
var map={'home.html':'/','daily-insights.html':'/qilylean/daily-insights.html','papers.html':'/qilylean/papers.html','lean-tools.html':'/qilylean/lean-tools.html','lean-knowledge.html':'/qilylean/lean-knowledge.html','execution-loop.html':'/qilylean/execution-loop.html','gbt2828.html':'/qilylean/gbt2828.html'};
var name=(location.pathname.split('/').pop()||'home.html').toLowerCase();
var canonical=ORIGIN+(map[name]||('/'+name));
function meta(attr,key,value){var q='meta['+attr+'="'+key+'"]',el=document.head.querySelector(q);if(!el){el=document.createElement('meta');el.setAttribute(attr,key);document.head.appendChild(el);}el.setAttribute('content',value);}
function link(rel,href){var el=document.head.querySelector('link[rel="'+rel+'"]');if(!el){el=document.createElement('link');el.rel=rel;document.head.appendChild(el);}el.href=href;}
function load(src,id){if(document.getElementById(id))return;var s=document.createElement('script');s.id=id;s.src=src;document.body.appendChild(s);}
function fixSmedAnchorView(){
  if(name!=='papers.html'||document.getElementById('smedAnchorViewFix'))return;
  var style=document.createElement('style');
  style.id='smedAnchorViewFix';
  style.textContent='.article#smed{border-top:0!important}';
  document.head.appendChild(style);
}
var title=document.title||'QilyLean';
var desc=(document.head.querySelector('meta[name="description"]')||{}).content||'QilyLean 制造改善实践平台，聚焦精益生产、工业工程、数智化工厂、MES、ERP、VSM与SMED。';
link('canonical',canonical);
link('manifest','/site.webmanifest');
meta('property','og:site_name','QilyLean');
meta('property','og:type','website');
meta('property','og:title',title);
meta('property','og:description',desc);
meta('property','og:url',canonical);
meta('name','twitter:card','summary');
meta('name','twitter:title',title);
meta('name','twitter:description',desc);
meta('name','theme-color','#0f4b5a');
fixSmedAnchorView();
if(/(?:home|home-live|home-fixed)\.html$|qilylean\/?$/i.test(location.pathname))load('project-mold-video.js?v=20260718','moldWarehouseVideoScript');
if(/daily-insights\.html$/i.test(location.pathname))load('daily-backfill-20251219-20260707.js?v=20260718-1','dailyBackfillArchiveScript');
if(/lean-knowledge\.html$/i.test(location.pathname))load('knowledge-publish-fix-v1.js?v=20260722-dedupe-howdo-v3','knowledgePublishFixScript');
})();