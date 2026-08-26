#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const ROUTE='/site-contact-route-v1.js?v=20260826-contact-native-newtab-map-v8';
const CONTACT_PATH='contact/index.html';

function trackedHtml(){
  return execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
}

function navBlock(keyword,region){
  const destination=[keyword,region].filter(Boolean).join(' ');
  const q=encodeURIComponent(keyword);
  const r=encodeURIComponent(region);
  const daddr=encodeURIComponent(destination);
  const amap=`https://uri.amap.com/search?keyword=${q}&city=${r}&callnative=1`;
  const baidu=`https://api.map.baidu.com/place/search?query=${q}&region=${r}&output=html&src=QilyLean`;
  const tencent=`https://apis.map.qq.com/uri/v1/search?keyword=${q}&region=${r}&referer=QilyLean`;
  const google=`https://www.google.com/maps/dir/?api=1&destination=${daddr}`;
  const apple=`https://maps.apple.com/?daddr=${daddr}&dirflg=d`;
  return [
    '            <div class="qily-map-nav-panel" data-qily-clean-map-nav="v2" aria-label="'+keyword+'地图导航">',
    '              <div class="qily-map-nav-copy">',
    '                <strong>地图导航</strong>',
    '                <span>默认高德；也可选择百度、腾讯、Google Maps 或 Apple Maps。本站不嵌入第三方地图页面，避免广告弹层。</span>',
    '              </div>',
    '              <div class="qily-map-nav-actions">',
    '                <a class="qily-map-nav-action primary" data-qily-map-provider="amap" href="'+amap+'" target="_blank" rel="noopener noreferrer" aria-label="高德导航到'+keyword+'">高德导航</a>',
    '                <a class="qily-map-nav-action" data-qily-map-provider="baidu" href="'+baidu+'" target="_blank" rel="noopener noreferrer" aria-label="百度导航到'+keyword+'">百度导航</a>',
    '                <a class="qily-map-nav-action" data-qily-map-provider="tencent" href="'+tencent+'" target="_blank" rel="noopener noreferrer" aria-label="腾讯导航到'+keyword+'">腾讯导航</a>',
    '                <a class="qily-map-nav-action" data-qily-map-provider="google" href="'+google+'" target="_blank" rel="noopener noreferrer" aria-label="Google Maps 导航到'+keyword+'">Google Maps</a>',
    '                <a class="qily-map-nav-action" data-qily-map-provider="apple" href="'+apple+'" target="_blank" rel="noopener noreferrer" aria-label="Apple Maps 导航到'+keyword+'">Apple Maps</a>',
    '              </div>',
    '            </div>'
  ].join('\n');
}

function cleanContactNavigation(source){
  let next=source;
  const targets=[
    {keyword:'苏吕党主题公园',region:'温州'},
    {keyword:'皂三村口 石羊街139号',region:'东莞'}
  ];
  for(const target of targets){
    const articleOpen=`<article class="address-card" data-qily-map-address="${target.keyword}">`;
    const articleStart=next.indexOf(articleOpen);
    if(articleStart<0)throw new Error(`Contact address card missing: ${target.keyword}`);
    const articleEnd=next.indexOf('</article>',articleStart);
    if(articleEnd<0)throw new Error(`Contact address card is not closed: ${target.keyword}`);
    const panelStart=next.indexOf('<div class="qily-map-nav-panel"',articleStart);
    const mapStart=next.indexOf('<div class="map-preview">',articleStart);
    let blockStart=-1;
    if(panelStart>=0&&panelStart<articleEnd)blockStart=panelStart;
    else if(mapStart>=0&&mapStart<articleEnd)blockStart=mapStart;
    if(blockStart<0)throw new Error(`Contact map navigation block missing: ${target.keyword}`);
    const lineStart=next.lastIndexOf('\n',blockStart-1)+1;
    next=next.slice(0,lineStart)+navBlock(target.keyword,target.region)+'\n          '+next.slice(articleEnd);
  }
  next=next.replace(/<iframe\b[^>]*api\.map\.baidu\.com[^>]*><\/iframe>/gi,'');
  if(/api\.map\.baidu\.com\/geocoder/i.test(next))throw new Error('Embedded Baidu geocoder iframe returned to contact page.');
  if(/<iframe\b/i.test(next))throw new Error('Contact page still contains iframe markup.');
  for(const provider of ['amap','baidu','tencent','google','apple']){
    if(!next.includes(`data-qily-map-provider="${provider}"`))throw new Error(`Contact clean map provider missing: ${provider}`);
  }
  if(!next.includes('data-qily-clean-map-nav="v2"'))throw new Error('Contact clean map navigation V2 marker missing.');
  if(!next.includes('www.google.com/maps/dir/?api=1'))throw new Error('Google Maps directions URL missing.');
  if(!next.includes('maps.apple.com/?daddr='))throw new Error('Apple Maps directions URL missing.');
  return next;
}

let changed=0,covered=0;
for(const relative of trackedHtml()){
  const file=path.join(root,relative);
  const source=fs.readFileSync(file,'utf8');
  if(!/site-contact-route-v1\.js(?:\?v=[^"']*)?/.test(source))continue;
  covered+=1;
  let next=source
    .replace(/\/site-contact-route-v1\.js(?:\?v=[^"']*)?/g,ROUTE)
    .replace(/data-qily-contact-route-direct=["'][^"']*["']/g,'data-qily-contact-route-direct="v8"');
  if(relative===CONTACT_PATH)next=cleanContactNavigation(next);
  if(next!==source){fs.writeFileSync(file,next);changed+=1;}
}

if(process.argv.includes('--check')){
  if(changed)throw new Error(`Contact V8 materialization stale on ${changed} HTML file(s).`);
  if(covered<470)throw new Error(`Contact route coverage unexpectedly low: ${covered}.`);
  const contact=fs.readFileSync(path.join(root,CONTACT_PATH),'utf8');
  if(/api\.map\.baidu\.com\/geocoder|<iframe\b/i.test(contact))throw new Error('Contact page contains a prohibited embedded map surface.');
  for(const provider of ['amap','baidu','tencent','google','apple']){
    if(!contact.includes(`data-qily-map-provider="${provider}"`))throw new Error(`Contact clean map provider missing after materialization: ${provider}`);
  }
  process.stdout.write(`PASS: contact route V8 cache/marker present on ${covered} tracked HTML pages; five-provider navigation is iframe-free.\n`);
}else{
  process.stdout.write(`Contact route V8 materialized on ${changed} HTML file(s); coverage ${covered}; five-provider navigation enabled without embedded maps.\n`);
}
