#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process'),root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const files=()=>execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
const ownership=f=>/^(?:baidu_verify_|google[^/]*\.html$|zohoverify\/)/i.test(f);
const DDZ='tools/pure-ddz/index.html';
const required=['/site-header-axis-v1.css?v=20260901-primary-navigation-native-scroll-v8','/site-interaction-semantics-v1.css?v=20260830-r11-semantics-v14-visual-v3-vi-teal','/site-interaction-semantics-v1.js?v=20260831-r11-semantics-v17-native-range','data-qily-interaction-semantics-direct="v1.7"','/site-visual-components-v1.css?v=20260831-unified-components-v29-native-range','/site-translation-public-ui-v1.css?v=20260901-google-translate-mobile-ui-v16','data-qily-translation-public-ui="google-v1"','/site-translation-safe-runtime-v1.js?v=20260901-google-translate-single-runtime-v16','data-qily-translation-safe-direct="google-v1"','/site-responsive-containment-v1.css?v=20260830-header-integrity-v2','/site-header-project-integrity-v2.css?v=20260831-project-grade-readability-v3','/site-contact-route-v1.js?v=20260829-dock-functional-public-v134','data-qily-contact-route-direct="v13.4"','/site-public-redline-closure-v2.css?v=20260830-annotated-v2','/site-public-redline-closure-v2.js?v=20260831-redline-no-translation-v23','data-qily-public-redline-v2-direct="annotated-v2"'];
const forbidden=['data-qily-translation-safety-bootstrap','site-translation-public-ui-v1.js','site-translation-progress-v1.js','site-translation-progress-v1.css','site-global-language-v1.css','site-global-language-v3.js','20260831-safe-inpage-v7-header-utility','data-qily-translation-safe-direct="v7"','stable-diagnostic','qily_translate_debug','20260831-google-translate-single-runtime-v13','20260831-google-translate-mobile-ui-v14'];
const failures=[];let audited=0,navPages=0,shellPages=0;
for(const file of files()){
  const html=read(file);if(!/<\/head>/i.test(html)||ownership(file)||file===DDZ)continue;audited++;
  for(const token of required)if(!html.includes(token))failures.push(`${file}: missing ${token}`);
  for(const token of forbidden)if(html.includes(token))failures.push(`${file}: retired translator remains (${token})`);
  if(/\/site-navigation\.js(?:\?v=[^"']*)?/.test(html)){navPages++;if(!html.includes('/site-navigation.js?v=20260828-r7-navigation-v45'))failures.push(`${file}: navigation stale`);}
  if(/\/site-ui-consistency-v1\.js(?:\?v=[^"']*)?/.test(html)){shellPages++;if(!html.includes('/site-ui-consistency-v1.js?v=20260831-r7-single-responsibility-v11-safe-translation'))failures.push(`${file}: shared shell stale`);}
  if(/\/site-dock-share-runtime-v1\.js(?:\?v=[^"']*)?/.test(html)&&!html.includes('/site-dock-share-runtime-v1.js?v=20260902-authority-v55'))failures.push(`${file}: direct Dock stale`);
}
for(const sample of ['index.html','trust/index.html','experience/index.html','projects/index.html','qilylean/daily/2026-08-25.html','qilylean/daily/2026-07-29.html']){
  const html=read(sample);for(const token of required)if(!html.includes(token))failures.push(`${sample}: required V32 asset absent (${token})`);for(const token of forbidden)if(html.includes(token))failures.push(`${sample}: retired translator remains (${token})`);
}
const ddz=read(DDZ);
for(const token of ['20260903-ddz-fast-knowledge-v155','data-qily-ddz-fast-shell="v155"','fast-site-shell-v155.js?v=20260903-ddz-fast-shell-v155','/site-dock-share-runtime-v1.js?v=20260902-public-dock-v55'])if(!ddz.includes(token))failures.push(`${DDZ}: missing fast-route contract ${token}`);
if(navPages<460)failures.push(`navigation coverage low: ${navPages}`);if(shellPages<460)failures.push(`shell coverage low: ${shellPages}`);
if(failures.length)throw new Error(`Public materialization failed (${failures.length}):\n${failures.slice(0,50).join('\n')}`);
console.log(`PASS: ${audited} standard public pages use the V32 baseline and Dock V5.5 authority; DDZ V155/V164 remains the single explicitly isolated fast route.`);
