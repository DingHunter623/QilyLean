#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process'),root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const files=()=>execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
const ownership=f=>/^(?:baidu_verify_|google[^/]*\.html$|zohoverify\/)/i.test(f);
const required=['data-qily-translation-safety-bootstrap="inpage-v4"','/site-translation-safe-runtime-v1.js?v=20260828-long-page-resilience-v5','/site-header-axis-v1.css?v=20260829-primary-navigation-scroll-v6','/site-interaction-semantics-v1.css?v=20260829-r10-semantics-v13','/site-interaction-semantics-v1.js?v=20260829-r10-semantics-v13','data-qily-interaction-semantics-direct="v1.3"','/site-contact-route-v1.js?v=20260829-dock-functional-public-v133','data-qily-contact-route-direct="v13.3"'];
const failures=[];let audited=0,navPages=0,shellPages=0;
for(const file of files()){
  const html=read(file);if(!/<\/head>/i.test(html)||ownership(file))continue;audited++;
  for(const token of required)if(!html.includes(token))failures.push(`${file}: missing ${token}`);
  if(!html.includes('<script defer data-qily-translation-safe-direct="inpage-v4"'))failures.push(`${file}: translation runtime is not deferred`);
  if(/\/site-navigation\.js(?:\?v=[^"']*)?/.test(html)){navPages++;if(!html.includes('/site-navigation.js?v=20260828-r7-navigation-v45'))failures.push(`${file}: navigation stale`);}
  if(/\/site-ui-consistency-v1\.js(?:\?v=[^"']*)?/.test(html)){shellPages++;if(!html.includes('/site-ui-consistency-v1.js?v=20260828-r7-single-responsibility-v7'))failures.push(`${file}: shared shell stale`);}
  if(/\/site-dock-share-runtime-v1\.js(?:\?v=[^"']*)?/.test(html)&&!html.includes('/site-dock-share-runtime-v1.js?v=20260829-authority-v53'))failures.push(`${file}: direct Dock stale`);
}
for(const sample of ['index.html','trust/index.html','experience/index.html','projects/index.html','qilylean/daily/2026-08-25.html','qilylean/daily/2026-07-29.html']){
  const html=read(sample);if(!html.includes('/site-header-axis-v1.css?v=20260829-primary-navigation-scroll-v6'))failures.push(`${sample}: R10 header absent`);if(!html.includes('/site-interaction-semantics-v1.js?v=20260829-r10-semantics-v13'))failures.push(`${sample}: Semantics V1.3 absent`);if(!html.includes('/site-contact-route-v1.js?v=20260829-dock-functional-public-v133'))failures.push(`${sample}: Contact V13.3 absent`);
}
const ddz=read('tools/pure-ddz/index.html');if(!ddz.includes('/tools/pure-ddz/game/css/r8-closure-v128.css?v=20260829-r10-v130'))failures.push('tools/pure-ddz/index.html: DDZ R10 closure absent');
if(navPages<460)failures.push(`navigation coverage low: ${navPages}`);if(shellPages<460)failures.push(`shell coverage low: ${shellPages}`);
if(failures.length)throw new Error(`R10 V23 public materialization failed (${failures.length}):\n${failures.slice(0,50).join('\n')}`);
console.log(`PASS: ${audited} public pages carry R10 V23; visible nav rail, inert vocabulary semantics V1.3, Contact V13.3/Dock V5.3 and DDZ V130 are materialized.`);
