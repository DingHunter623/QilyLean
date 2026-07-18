(function(){
'use strict';
var ORIGIN='https://qilylean.com';
var map={'home.html':'/','daily-insights.html':'/daily-insights.html','papers.html':'/papers.html','lean-tools.html':'/tools.html','lean-knowledge.html':'/knowledge.html','execution-loop.html':'/execution.html','gbt2828.html':'/gbt2828.html'};
var name=(location.pathname.split('/').pop()||'home.html').toLowerCase();
var canonical=ORIGIN+(map[name]||('/'+name));
function meta(attr,key,value){var q='meta['+attr+'="'+key+'"]',el=document.head.querySelector(q);if(!el){el=document.createElement('meta');el.setAttribute(attr,key);document.head.appendChild(el);}el.setAttribute('content',value);}
function link(rel,href){var el=document.head.querySelector('link[rel="'+rel+'"]');if(!el){el=document.createElement('link');el.rel=rel;document.head.appendChild(el);}el.href=href;}
function load(src,id){if(document.getElementById(id))return;var s=document.createElement('script');s.id=id;s.src=src;document.body.appendChild(s);}
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
if(/daily-insights\.html$/i.test(location.pathname)){load('daily-2026-07-18.js?v=20260719','daily20260718Script');load('daily-2026-07-19.js?v=20260719','daily20260719Script');}
if(/(?:home|home-live|home-fixed)\.html$|digital_human\/?$/i.test(location.pathname)){load('project-mold-video.js?v=20260719','moldWarehouseVideoScript');}
})();