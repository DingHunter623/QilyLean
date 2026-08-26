#!/usr/bin/env node
'use strict';

/* QilyLean Daily Brief Layout Guard materializer V1｜2026-08-26
 * Installs one final shared layout/readability stylesheet on every dated Selected Brief page.
 * Business copy and media assets are not modified.
 */
const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const ROOT=path.resolve(__dirname,'..');
const checkOnly=process.argv.includes('--check');
const ID='qilyDailyBriefLayoutGuardV1';
const HREF='/site-daily-brief-layout-guard-v1.css?v=20260826-daily-brief-layout-v1';
const TAG=`<link id="${ID}" rel="stylesheet" href="${HREF}">`;
const DATED=/^qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html$/i;

function files(){return execFileSync('git',['ls-files','qilylean/daily/*.html'],{cwd:ROOT,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean).filter(x=>DATED.test(x))}
function install(html,rel){
  let out=html.replace(/\s*<link\b[^>]*(?:id=["']qilyDailyBriefLayoutGuardV1["']|href=["'][^"']*\/site-daily-brief-layout-guard-v1\.css(?:\?v=[^"']*)?["'])[^>]*>\s*/gi,'\n');
  if(!/<\/head>/i.test(out))throw new Error(`${rel}: missing </head>`);
  return out.replace(/<\/head>/i,`${TAG}\n</head>`);
}

const changed=[];
let count=0;
for(const rel of files()){
  const abs=path.join(ROOT,rel);const html=fs.readFileSync(abs,'utf8');const next=install(html,rel);count+=1;
  if(next!==html){changed.push(rel);if(!checkOnly)fs.writeFileSync(abs,next,'utf8')}
}
if(count<350)throw new Error(`Unexpected dated Selected Brief coverage: ${count}`);
if(checkOnly&&changed.length)throw new Error(`Daily Brief layout guard is stale on ${changed.length} page(s): ${changed.slice(0,20).join(', ')}`);

const css=fs.readFileSync(path.join(ROOT,'site-daily-brief-layout-guard-v1.css'),'utf8');
[
  '.daily-single-section .post',
  'align-items:start!important',
  '.daily-single-section .visual',
  'background:transparent!important',
  'grid-template-columns:minmax(230px,230px) repeat(20,minmax(46px,46px))!important',
  '.npi-gantt-week',
  'white-space:nowrap!important',
  '.npi-gantt-label',
  'overflow-wrap:anywhere!important',
  'article.post .tags>.tag',
  '-webkit-text-fill-color:#0f4b5a!important'
].forEach(token=>{if(!css.includes(token))throw new Error(`Daily Brief layout guard CSS contract missing: ${token}`)});

process.stdout.write(`Daily Brief layout guard ${checkOnly?'check passed':'materialized'}: ${count} dated brief(s), ${changed.length} changed.\n`);
