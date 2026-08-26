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
  '/site-translation-safe-runtime-v1.js?v=20260826-translation-fast-reliable-v3',
  '/site-global-language-v1.css?v=20260825-public-translation-shell-v1',
  '/site-header-axis-v1.css?v=20260825-mobile-navigation-recovery-v3',
  '/site-translation-public-ui-v1.css?v=20260825-mobile-navigation-recovery-v7',
  '/site-translation-public-ui-v1.js?v=20260825-public-language-picker-v6',
  '/site-translation-progress-v1.css?v=20260825-bilingual-progress-v3',
  '/site-translation-progress-v1.js?v=20260826-translation-fast-reliable-v3',
  '/site-interaction-contrast-guard-v1.css?v=20260825-sitewide-contrast-v2',
  '/site-interaction-contrast-guard-v1.js?v=20260825-sitewide-contrast-v2',
  '/site-content-contrast-guard-v1.css?v=20260826-sitewide-content-contrast-v5',
  '/site-content-contrast-guard-v1.js?v=20260826-sitewide-content-contrast-v5',
  '/site-navigation.js?v=20260826-search-navigation-contrast-v44',
  '/site-ui-consistency-v1.js?v=20260826-translation-fast-reliable-v3'
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
  if(!html.includes('<script defer data-qily-translation-safe-direct="inpage-v2"'))failures.push(`${relative}: translation runtime is not deferred`);
  if(!html.includes('data-qily-content-contrast-direct="v5"'))failures.push(`${relative}: content contrast v5 marker missing`);
  if(html.includes('/site-global-language-v3.js'))failures.push(`${relative}: retired external-proxy translator still referenced`);
}

const samples=['index.html','knowledge/terminology.html','qilylean/gbt2828.html','qilylean/daily/2026-08-25.html','knowledge/index.html','qilylean/production-operations-organization.html'];
for(const sample of samples){
  if(!fs.existsSync(path.join(root,sample)))failures.push(`${sample}: required remediation sample missing`);
  else{
    const html=read(sample);
    if(!html.includes('/site-translation-safe-runtime-v1.js?v=20260826-translation-fast-reliable-v3'))failures.push(`${sample}: fast translation runtime absent`);
    if(!html.includes('/site-ui-consistency-v1.js?v=20260826-translation-fast-reliable-v3'))failures.push(`${sample}: fast shared-shell cache bust absent`);
    if(!html.includes('/site-content-contrast-guard-v1.js?v=20260826-sitewide-content-contrast-v5'))failures.push(`${sample}: content contrast v5 baseline absent`);
  }
}

if(failures.length){
  throw new Error(`Public baseline materialization failed (${failures.length}):\n${failures.slice(0,60).join('\n')}${failures.length>60?`\n… +${failures.length-60} more`:''}`);
}
process.stdout.write(`PASS: ${audited} tracked HTML pages carry one deferred fast-translation/readability/mobile-navigation baseline; no retired external-proxy translator remains referenced.\n`);
