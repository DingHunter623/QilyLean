#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process'),root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const files=()=>execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
const ownership=f=>/^(?:baidu_verify_|google[^/]*\.html$|zohoverify\/)/i.test(f);
const required=['data-qily-translation-safety-bootstrap="inpage-v5"','/site-translation-safe-runtime-v1.js?v=20260829-first-readable-v7','/site-header-axis-v1.css?v=20260829-primary-navigation-safe-scroll-v7','/site-interaction-semantics-v1.css?v=20260829-r11-semantics-v14','/site-interaction-semantics-v1.js?v=20260829-r11-semantics-v14','data-qily-interaction-semantics-direct="v1.4"','/site-contact-route-v1.js?v=20260829-dock-functional-public-v134','data-qily-contact-route-direct="v13.4"','/site-public-redline-closure-v2.css?v=20260830-annotated-v2','/site-public-redline-closure-v2.js?v=20260830-annotated-v2','data-qily-public-redline-v2-direct="annotated-v2"'];
const failures=[];let audited=0,navPages=0,shellPages=0;
for(const file of files()){
  const html=read(file);if(!/<\/head>/i.test(html)||ownership(file))continue;audited++;
  for(const token of required)if(!html.includes(token))failures.push(`${file}: missing ${token}`);
  if(!html.includes('<script defer data-qily-translation-safe-direct="inpage-v5"'))failures.push(`${file}: translation runtime is not deferred`);
  if(/\/site-navigation\.js(?:\?v=[^"']*)?/.test(html)){navPages++;if(!html.includes('/site-navigation.js?v=20260828-r7-navigation-v45'))failures.push(`${file}: navigation stale`);}
  if(/\/site-ui-consistency-v1\.js(?:\?v=[^"']*)?/.test(html)){shellPages++;if(!html.includes('/site-ui-consistency-v1.js?v=20260828-r7-single-responsibility-v7'))failures.push(`${file}: shared shell stale`);}
  if(/\/site-dock-share-runtime-v1\.js(?:\?v=[^"']*)?/.test(html)&&!html.includes('/site-dock-share-runtime-v1.js?v=20260829-authority-v54'))failures.push(`${file}: direct Dock stale`);
}
for(const sample of ['index.html','trust/index.html','experience/index.html','projects/index.html','qilylean/daily/2026-08-25.html','qilylean/daily/2026-07-29.html']){
  const html=read(sample);if(!html.includes('/site-header-axis-v1.css?v=20260829-primary-navigation-safe-scroll-v7'))failures.push(`${sample}: R11 header absent`);if(!html.includes('/site-interaction-semantics-v1.js?v=20260829-r11-semantics-v14'))failures.push(`${sample}: Semantics V1.4 absent`);if(!html.includes('/site-contact-route-v1.js?v=20260829-dock-functional-public-v134'))failures.push(`${sample}: Contact V13.4 absent`);if(!html.includes('/site-public-redline-closure-v2.css?v=20260830-annotated-v2'))failures.push(`${sample}: Redline V2 CSS absent`);if(!html.includes('/site-public-redline-closure-v2.js?v=20260830-annotated-v2'))failures.push(`${sample}: Redline V2 JS absent`);
}
const ddz=read('tools/pure-ddz/index.html');if(!ddz.includes('/tools/pure-ddz/game/css/r8-closure-v128.css?v=20260829-r12-v132'))failures.push('tools/pure-ddz/index.html: DDZ R12 closure absent');
if(navPages<460)failures.push(`navigation coverage low: ${navPages}`);if(shellPages<460)failures.push(`shell coverage low: ${shellPages}`);
if(failures.length)throw new Error(`V28 + Redline V2 public materialization failed (${failures.length}):\n${failures.slice(0,50).join('\n')}`);
console.log(`PASS: ${audited} public pages carry V28 + Public Redline Closure V2, including sticky header, unified rail, compact language UI and annotated visual corrections.`);
