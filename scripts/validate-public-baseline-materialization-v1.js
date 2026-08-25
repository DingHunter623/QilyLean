#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
function read(relative){return fs.readFileSync(path.join(root,relative),'utf8')}
function trackedHtml(){return execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean)}
function count(source,token){return source.split(token).length-1}

const required=[
  'data-qily-translation-safety-bootstrap="inpage-v2"',
  '/site-translation-safe-runtime-v1.js?v=20260825-translation-safe-inpage-v2',
  '/site-global-language-v1.css?v=20260825-public-translation-shell-v1',
  '/site-header-axis-v1.css?v=20260825-mobile-navigation-recovery-v3',
  '/site-translation-public-ui-v1.css?v=20260825-mobile-navigation-recovery-v7',
  '/site-translation-public-ui-v1.js?v=20260825-public-language-picker-v6',
  '/site-translation-progress-v1.css?v=20260825-bilingual-progress-v3',
  '/site-translation-progress-v1.js?v=20260825-bilingual-progress-v3',
  '/site-interaction-contrast-guard-v1.css?v=20260825-sitewide-contrast-v2',
  '/site-interaction-contrast-guard-v1.js?v=20260825-sitewide-contrast-v2',
  '/site-content-contrast-guard-v1.css?v=20260825-sitewide-content-contrast-v2',
  '/site-content-contrast-guard-v1.js?v=20260825-sitewide-content-contrast-v2'
];
const failures=[];
let audited=0;
for(const relative of trackedHtml()){
  const html=read(relative);
  if(!/<\/head>/i.test(html))continue;
  audited+=1;
  for(const token of required){
    if(!html.includes(token))failures.push(`${relative}: missing ${token}`);
    else if(count(html,token)!==1)failures.push(`${relative}: duplicate ${token} x${count(html,token)}`);
  }
  if(html.includes('/site-global-language-v3.js'))failures.push(`${relative}: retired external-proxy translator still referenced`);
  if(html.includes('/site-ui-consistency-v1.js?v=20260825-global-translation-dual-route-v2'))failures.push(`${relative}: stale shared-shell baseline`);
  if(html.includes('/site-ui-consistency-v1.js?v=20260825-sitewide-baseline-reconcile-v1'))failures.push(`${relative}: pre-mobile-recovery shared-shell baseline`);
}

const samples=['index.html','knowledge/terminology.html','qilylean/gbt2828.html','qilylean/daily/2026-08-25.html','knowledge/index.html'];
for(const sample of samples){
  if(!fs.existsSync(path.join(root,sample)))failures.push(`${sample}: required remediation sample missing`);
  else{
    const html=read(sample);
    if(!html.includes('data-qily-translation-safety-bootstrap="inpage-v2"'))failures.push(`${sample}: safety baseline absent`);
    if(!html.includes('/site-content-contrast-guard-v1.js?v=20260825-sitewide-content-contrast-v2'))failures.push(`${sample}: content contrast baseline absent`);
    if(!html.includes('/site-header-axis-v1.css?v=20260825-mobile-navigation-recovery-v3'))failures.push(`${sample}: mobile header-axis recovery absent`);
    if(!html.includes('/site-translation-public-ui-v1.css?v=20260825-mobile-navigation-recovery-v7'))failures.push(`${sample}: final mobile navigation CSS absent`);
  }
}

if(failures.length){
  throw new Error(`Public baseline materialization failed (${failures.length}):\n${failures.slice(0,60).join('\n')}${failures.length>60?`\n… +${failures.length-60} more`:''}`);
}
process.stdout.write(`PASS: ${audited} tracked HTML pages carry one unified safe translation/readability/mobile-navigation baseline; no retired external-proxy translator remains referenced.\n`);
