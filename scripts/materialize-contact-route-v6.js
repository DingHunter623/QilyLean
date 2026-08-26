#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const ROUTE='/site-contact-route-v1.js?v=20260826-contact-native-newtab-map-v7';
const CONTACT_PATH='contact/index.html';

function trackedHtml(){
  return execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
}

function navBlock(keyword,region){
  const q=encodeURIComponent(keyword);
  const r=encodeURIComponent(region);
  const amap=`https://uri.amap.com/search?keyword=${q}&city=${r}&callnative=1`;
  const baidu=`https://api.map.baidu.com/place/search?query=${q}&region=${r}&output=html&src=QilyLean`;
  const tencent=`https://apis.map.qq.com/uri/v1/search?keyword=${q}&region=${r}&referer=QilyLean`;
  return [
    '            <div class="qily-map-nav-panel" data-qily-clean-map-nav="v1" aria-label="'+keyword+'地图导航">',
    '              <div class="qily-map-nav-copy">',
    '                <strong>地图导航</strong>',
    '                <span>默认高德；也可选择百度或腾讯。本站不嵌入第三方地图页面，避免广告弹层。</span>',
    '              </div>',
    '              <div class="qily-map-nav-actions">',
    '                <a class="qily-map-nav-action primary" data-qily-map-provider="amap" href="'+amap+'" target="_blank" rel="noopener noreferrer" aria-label="高德导航到'+keyword+'">高德导航</a>',
    '                <a class="qily-map-nav-action" data-qily-map-provider="baidu" href="'+baidu+'" target="_blank" rel="noopener noreferrer" aria-label="百度导航到'+keyword+'">百度导航</a>',
    '                <a class="qily-map-nav-action" data-qily-map-provider="tencent" href="'+tencent+'" target="_blank" rel="noopener noreferrer" aria-label="腾讯导航到'+keyword+'">腾讯导航</a>',
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
    const articleSlice=next.slice(articleStart,articleEnd);
    if(articleSlice.includes('data-qily-clean-map-nav="v1"'))continue;
    const mapStart=next.indexOf('<div class="map-preview">',articleStart);
    if(mapStart<0||mapStart>articleEnd)throw new Error(`Legacy map block missing before clean materialization: ${target.keyword}`);
    const mapEndRaw=next.indexOf('</div>',mapStart);
    if(mapEndRaw<0||mapEndRaw>articleEnd)throw new Error(`Legacy map block is not closed: ${target.keyword}`);
    const mapEnd=mapEndRaw+'</div>'.length;
    next=next.slice(0,mapStart)+navBlock(target.keyword,target.region)+next.slice(mapEnd);
  }
  next=next.replace(/<iframe\b[^>]*api\.map\.baidu\.com[^>]*><\/iframe>/gi,'');
  if(/api\.map\.baidu\.com\/geocoder/i.test(next))throw new Error('Embedded Baidu geocoder iframe returned to contact page.');
  if(/<iframe\b/i.test(next))throw new Error('Contact page still contains iframe markup.');
  for(const provider of ['amap','baidu','tencent']){
    if(!next.includes(`data-qily-map-provider="${provider}"`))throw new Error(`Contact clean map provider missing: ${provider}`);
  }
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
    .replace(/data-qily-contact-route-direct=["'][^"']*["']/g,'data-qily-contact-route-direct="v7"');
  if(relative===CONTACT_PATH)next=cleanContactNavigation(next);
  if(next!==source){fs.writeFileSync(file,next);changed+=1;}
}

if(process.argv.includes('--check')){
  if(changed)throw new Error(`Contact V7 materialization stale on ${changed} HTML file(s).`);
  if(covered<470)throw new Error(`Contact route coverage unexpectedly low: ${covered}.`);
  const contact=fs.readFileSync(path.join(root,CONTACT_PATH),'utf8');
  if(/api\.map\.baidu\.com\/geocoder|<iframe\b/i.test(contact))throw new Error('Contact page contains a prohibited embedded map surface.');
  process.stdout.write(`PASS: contact route V7 cache/marker present on ${covered} tracked HTML pages; contact navigation is iframe-free.\n`);
}else{
  process.stdout.write(`Contact route V7 materialized on ${changed} HTML file(s); coverage ${covered}; embedded map surfaces removed.\n`);
}
