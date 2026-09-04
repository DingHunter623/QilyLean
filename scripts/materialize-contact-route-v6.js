#!/usr/bin/env node
'use strict';

/* QilyLean Contact Route Materializer R12.2｜2026-09-03
 * Single-responsibility boundary:
 * - owns Contact Route V13.4 references, direct authoritative Dock V5.5 references and clean contact-map markup;
 * - does NOT own or rewrite the global UI shell, translation runtime, navigation runtime or visual baseline.
 */
const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const ROUTE='/site-contact-route-v1.js?v=20260829-dock-functional-public-v134';
const DOCK='/site-dock-share-runtime-v1.js?v=20260902-authority-v55';
const REDLINE='/site-public-redline-closure-v1.css?v=20260828-home-dock-v2';
const CONTACT_PATH='contact/index.html';
const DDZ_PATH='tools/pure-ddz/index.html';
const DDZ_FAST_SHELL='/tools/pure-ddz/game/js/fast-site-shell-v155.js?';
const DDZ_FAST_SOURCE_DOCK='/site-dock-share-runtime-v1.js?v=20260902-public-dock-v55';
const checkOnly=process.argv.includes('--check');

function trackedHtml(){
  return execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
}
function ensureRedlineStylesheet(source){
  const link=`<link id="qilyPublicRedlineClosureV1" rel="stylesheet" href="${REDLINE}">`;
  if(/<link\b[^>]*id=["']qilyPublicRedlineClosureV1["'][^>]*>/i.test(source))return source.replace(/<link\b[^>]*id=["']qilyPublicRedlineClosureV1["'][^>]*>/i,link);
  if(/<\/head>/i.test(source))return source.replace(/<\/head>/i,link+'\n</head>');
  throw new Error('HTML head close missing while adding public redline stylesheet.');
}
function navBlock(keyword,region){
  const destination=[keyword,region].filter(Boolean).join(' '),q=encodeURIComponent(keyword),r=encodeURIComponent(region),daddr=encodeURIComponent(destination);
  const amap=`https://uri.amap.com/search?keyword=${q}&city=${r}&callnative=1`,baidu=`https://api.map.baidu.com/place/search?query=${q}&region=${r}&output=html&src=QilyLean`,tencent=`https://apis.map.qq.com/uri/v1/search?keyword=${q}&region=${r}&referer=QilyLean`,google=`https://www.google.com/maps/dir/?api=1&destination=${daddr}`,apple=`https://maps.apple.com/?daddr=${daddr}&dirflg=d`;
  return [
    '            <div class="qily-map-nav-panel" data-qily-clean-map-nav="v2" aria-label="'+keyword+'地图导航">',
    '              <div class="qily-map-nav-copy">','                <strong>地图导航</strong>','                <span>默认高德；也可选择百度、腾讯、Google Maps 或 Apple Maps。本站不嵌入第三方地图页面，避免广告弹层。</span>','              </div>','              <div class="qily-map-nav-actions">',
    '                <a class="qily-map-nav-action primary" data-qily-map-provider="amap" href="'+amap+'" target="_blank" rel="noopener noreferrer" aria-label="高德导航到'+keyword+'">高德导航</a>',
    '                <a class="qily-map-nav-action" data-qily-map-provider="baidu" href="'+baidu+'" target="_blank" rel="noopener noreferrer" aria-label="百度导航到'+keyword+'">百度导航</a>',
    '                <a class="qily-map-nav-action" data-qily-map-provider="tencent" href="'+tencent+'" target="_blank" rel="noopener noreferrer" aria-label="腾讯导航到'+keyword+'">腾讯导航</a>',
    '                <a class="qily-map-nav-action" data-qily-map-provider="google" href="'+google+'" target="_blank" rel="noopener noreferrer" aria-label="Google Maps 导航到'+keyword+'">Google Maps</a>',
    '                <a class="qily-map-nav-action" data-qily-map-provider="apple" href="'+apple+'" target="_blank" rel="noopener noreferrer" aria-label="Apple Maps 导航到'+keyword+'">Apple Maps</a>','              </div>','            </div>'
  ].join('\n');
}
function cleanContactNavigation(source){
  let next=source;const targets=[{keyword:'苏吕党主题公园',region:'温州'},{keyword:'皂三村口 石羊街139号',region:'东莞'}];
  for(const target of targets){
    const articleOpen=`<article class="address-card" data-qily-map-address="${target.keyword}">`,articleStart=next.indexOf(articleOpen);if(articleStart<0)throw new Error(`Contact address card missing: ${target.keyword}`);
    const articleEnd=next.indexOf('</article>',articleStart);if(articleEnd<0)throw new Error(`Contact address card is not closed: ${target.keyword}`);
    const panelStart=next.indexOf('<div class="qily-map-nav-panel"',articleStart),mapStart=next.indexOf('<div class="map-preview">',articleStart);let blockStart=-1;
    if(panelStart>=0&&panelStart<articleEnd)blockStart=panelStart;else if(mapStart>=0&&mapStart<articleEnd)blockStart=mapStart;if(blockStart<0)throw new Error(`Contact map navigation block missing: ${target.keyword}`);
    const lineStart=next.lastIndexOf('\n',blockStart-1)+1;next=next.slice(0,lineStart)+navBlock(target.keyword,target.region)+'\n          '+next.slice(articleEnd);
  }
  next=next.replace(/<iframe\b[^>]*api\.map\.baidu\.com[^>]*><\/iframe>/gi,'');
  if(/api\.map\.baidu\.com\/geocoder/i.test(next)||/<iframe\b/i.test(next))throw new Error('Contact page still contains embedded map markup.');
  for(const provider of ['amap','baidu','tencent','google','apple'])if(!next.includes(`data-qily-map-provider="${provider}"`))throw new Error(`Contact clean map provider missing: ${provider}`);
  return next;
}

let changed=0,covered=0,dockCovered=0;
for(const relative of trackedHtml()){
  const file=path.join(root,relative),source=fs.readFileSync(file,'utf8');if(!/site-contact-route-v1\.js(?:\?v=[^"']*)?/.test(source))continue;covered+=1;
  let next=source.replace(/\/site-contact-route-v1\.js(?:\?v=[^"']*)?/g,ROUTE).replace(/data-qily-contact-route-direct=["'][^"']*["']/g,'data-qily-contact-route-direct="v13.4"');
  if(/\/site-dock-share-runtime-v1\.js(?:\?v=[^"']*)?/.test(next)){next=next.replace(/\/site-dock-share-runtime-v1\.js(?:\?v=[^"']*)?/g,DOCK);dockCovered+=1;}
  next=ensureRedlineStylesheet(next);if(relative===CONTACT_PATH)next=cleanContactNavigation(next);if(next!==source){if(!checkOnly)fs.writeFileSync(file,next);changed+=1;}
}
if(checkOnly){
  if(changed)throw new Error(`R12.2 contact materialization stale on ${changed} HTML file(s).`);if(covered<470)throw new Error(`Contact route coverage unexpectedly low: ${covered}.`);
  const contact=fs.readFileSync(path.join(root,CONTACT_PATH),'utf8'),home=fs.readFileSync(path.join(root,'index.html'),'utf8'),ddz=fs.readFileSync(path.join(root,DDZ_PATH),'utf8');
  if(/api\.map\.baidu\.com\/geocoder|<iframe\b/i.test(contact))throw new Error('Contact page contains a prohibited embedded map surface.');
  for(const provider of ['amap','baidu','tencent','google','apple'])if(!contact.includes(`data-qily-map-provider="${provider}"`))throw new Error(`Contact clean map provider missing after materialization: ${provider}`);
  for(const [label,html] of [['contact',contact],['home',home]]){if(!html.includes(ROUTE))throw new Error(`${label} does not use Contact Route V13.4.`);if(!html.includes(REDLINE))throw new Error(`${label} does not use public redline V2.`);}
  const ddzFastRoute=ddz.includes('data-qily-ddz-fast-shell="v155"')&&ddz.includes('20260903-ddz-fast-knowledge-v155');
  if(ddzFastRoute){
    if(!ddz.includes(DDZ_FAST_SHELL))throw new Error('Pure DDZ fast route does not use the isolated V155 shell.');
    if(!ddz.includes(DDZ_FAST_SOURCE_DOCK)&&!ddz.includes(DOCK))throw new Error('Pure DDZ fast route does not use an approved Dock V5.5 runtime.');
  }else{
    if(!ddz.includes(ROUTE))throw new Error('pure-ddz does not use Contact Route V13.4.');
    if(!ddz.includes(REDLINE))throw new Error('pure-ddz does not use public redline V2.');
    if(/site-dock-share-runtime-v1\.js/.test(ddz)&&!ddz.includes(DOCK))throw new Error('Pure DDZ direct Dock runtime is not cache-busted to authoritative V5.5.');
  }
  process.stdout.write(`PASS: R12.2 contact baseline current on ${covered} HTML pages; Contact Route V13.4; direct Dock V5.5 refs ${dockCovered}; global shell ownership untouched.\n`);
}else process.stdout.write(`R12.2 contact materialized on ${changed} HTML file(s); route coverage ${covered}; Contact V13.4; Dock V5.5 refs ${dockCovered}; global shell ownership untouched.\n`);
