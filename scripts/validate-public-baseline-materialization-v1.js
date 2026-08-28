#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process'),root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const files=()=>execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
const ownership=f=>/^(?:baidu_verify_|google[^/]*\.html$|zohoverify\/)/i.test(f);
const required=['data-qily-translation-safety-bootstrap="inpage-v4"','/site-translation-safe-runtime-v1.js?v=20260828-long-page-resilience-v5','/site-header-axis-v1.css?v=20260829-primary-navigation-scroll-v5','/site-interaction-semantics-v1.css?v=20260829-r9-semantics-v12','/site-interaction-semantics-v1.js?v=20260829-r9-semantics-v12','/site-contact-route-v1.js?v=20260829-dock-functional-public-v132','data-qily-contact-route-direct="v13.2"'];
const failures=[];let audited=0,navPages=0,shellPages=0;
for(const file of files()){
  const html=read(file);if(!/<\/head>/i.test(html)||ownership(file))continue;audited++;
  for(const token of required)if(!html.includes(token))failures.push(`${file}: missing ${token}`);
  if(!html.includes('<script defer data-qily-translation-safe-direct="inpage-v4"'))failures.push(`${file}: translation runtime is not deferred`);
  if(!html.includes('data-qily-interaction-semantics-direct="v1.2"'))failures.push(`${file}: semantics marker stale`);
  if(/\/site-navigation\.js(?:\?v=[^"']*)?/.test(html)){navPages++;if(!html.includes('/site-navigation.js?v=20260828-r7-navigation-v45'))failures.push(`${file}: navigation stale`);}
  if(/\/site-ui-consistency-v1\.js(?:\?v=[^"']*)?/.test(html)){shellPages++;if(!html.includes('/site-ui-consistency-v1.js?v=20260828-r7-single-responsibility-v7'))failures.push(`${file}: shared shell stale`);}
  if(/\/site-dock-share-runtime-v1\.js(?:\?v=[^"']*)?/.test(html)&&!html.includes('/site-dock-share-runtime-v1.js?v=20260829-authority-v52'))failures.push(`${file}: direct Dock stale`);
}
for(const sample of ['index.html','trust/index.html','experience/index.html','projects/index.html','qilylean/daily/2026-08-25.html']){
  const html=read(sample);if(!html.includes('/site-header-axis-v1.css?v=20260829-primary-navigation-scroll-v5'))failures.push(`${sample}: R9 header absent`);if(!html.includes('/site-contact-route-v1.js?v=20260829-dock-functional-public-v132'))failures.push(`${sample}: Contact V13.2 absent`);
}
const ddz=read('tools/pure-ddz/index.html');if(!ddz.includes('/tools/pure-ddz/game/css/r8-closure-v128.css?v=20260829-r9-v129'))failures.push('tools/pure-ddz/index.html: DDZ R9 closure absent');
if(navPages<460)failures.push(`navigation coverage low: ${navPages}`);if(shellPages<460)failures.push(`shell coverage low: ${shellPages}`);
if(failures.length)throw new Error(`R9 V22 public materialization failed (${failures.length}):\n${failures.slice(0,50).join('\n')}`);
console.log(`PASS: ${audited} public pages carry R9 V22; Contact V13.2, Dock V5.2, visible nav scrolling and semantics V1.2 are materialized.`);
