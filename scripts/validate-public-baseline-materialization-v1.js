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
  '/site-header-axis-v1.css?v=20260827-primary-navigation-unified-v4',
  '/site-translation-public-ui-v1.css?v=20260827-primary-navigation-unified-v8',
  '/site-translation-public-ui-v1.js?v=20260825-public-language-picker-v6',
  '/site-translation-progress-v1.css?v=20260825-bilingual-progress-v3',
  '/site-translation-progress-v1.js?v=20260826-translation-fast-reliable-v3',
  '/site-interaction-contrast-guard-v1.css?v=20260825-sitewide-contrast-v2',
  '/site-interaction-contrast-guard-v1.js?v=20260825-sitewide-contrast-v2',
  '/site-content-contrast-guard-v1.css?v=20260826-sitewide-content-contrast-v6',
  '/site-content-contrast-guard-v1.js?v=20260826-sitewide-content-contrast-v6'
];
const NAV='/site-navigation.js?v=20260827-primary-navigation-unified-v45';
const SHELL='/site-ui-consistency-v1.js?v=20260827-primary-navigation-unified-v45';
const failures=[];
let audited=0,navigationPages=0,shellPages=0;
for(const relative of trackedHtml()){
  const html=read(relative);
  if(!/<\/head>/i.test(html))continue;
  audited+=1;
  for(const token of required){
    if(!html.includes(token))failures.push(`${relative}: missing ${token}`);
    else if(count(html,token)!==1)failures.push(`${relative}: duplicate ${token} x${count(html,token)}`);
  }
  if(!html.includes('<script defer data-qily-translation-safe-direct="inpage-v2"'))failures.push(`${relative}: translation runtime is not deferred`);
  if(!html.includes('data-qily-content-contrast-direct="v6"'))failures.push(`${relative}: content contrast v6 marker missing`);
  if(html.includes('/site-global-language-v3.js'))failures.push(`${relative}: retired external-proxy translator still referenced`);
  if(/\/site-navigation\.js(?:\?v=[^"']*)?/.test(html)){
    navigationPages+=1;if(!html.includes(NAV))failures.push(`${relative}: navigation runtime is stale`);
  }
  if(/\/site-ui-consistency-v1\.js(?:\?v=[^"']*)?/.test(html)){
    shellPages+=1;if(!html.includes(SHELL))failures.push(`${relative}: shared-shell runtime is stale`);
  }
}

const samples=['index.html','knowledge/terminology.html','qilylean/gbt2828.html','qilylean/daily/2026-08-25.html','knowledge/index.html','qilylean/production-operations-organization.html','qilylean/daily-insights.html'];
for(const sample of samples){
  if(!fs.existsSync(path.join(root,sample)))failures.push(`${sample}: required remediation sample missing`);
  else{
    const html=read(sample);
    if(!html.includes('/site-translation-safe-runtime-v1.js?v=20260826-translation-fast-reliable-v3'))failures.push(`${sample}: fast translation runtime absent`);
    if(!html.includes('/site-header-axis-v1.css?v=20260827-primary-navigation-unified-v4'))failures.push(`${sample}: unified header-axis baseline absent`);
    if(!html.includes('/site-translation-public-ui-v1.css?v=20260827-primary-navigation-unified-v8'))failures.push(`${sample}: unified primary-navigation public CSS absent`);
    if(!html.includes('/site-content-contrast-guard-v1.js?v=20260826-sitewide-content-contrast-v6'))failures.push(`${sample}: content contrast v6 baseline absent`);
  }
}

if(navigationPages<460)failures.push(`navigation coverage unexpectedly fell to ${navigationPages}`);
if(shellPages<460)failures.push(`shared-shell coverage unexpectedly fell to ${shellPages}`);
if(failures.length){
  throw new Error(`Public baseline materialization failed (${failures.length}):\n${failures.slice(0,60).join('\n')}${failures.length>60?`\n… +${failures.length-60} more`:''}`);
}
process.stdout.write(`PASS: ${audited} public HTML pages carry one deferred translation/readability/primary-navigation baseline; ${navigationPages} use fresh navigation and ${shellPages} use the fresh shared shell.\n`);
