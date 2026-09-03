#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const ROOT=path.resolve(__dirname,'..');
const CHECK=process.argv.includes('--check');
const TYPE_VERSION='20260903-r8-home-heading-ceiling-v5';
const CN_VERSION='20260903-r8-heading-ceiling-v2';

function tracked(){
  return execFileSync('git',['ls-files','*.html','site-navigation.js'],{cwd:ROOT,encoding:'utf8',maxBuffer:64*1024*1024})
    .split(/\r?\n/).filter(Boolean);
}

function patch(rel,source){
  let out=source.replace(/site-typography-v1\.css\?v=[^"'\s)>]+/g,`site-typography-v1.css?v=${TYPE_VERSION}`);
  if(rel==='cn-site/index.html')out=out.replace(/\/assets\/site\.css\?v=[^"'\s)>]+/g,`/assets/site.css?v=${CN_VERSION}`);
  return out;
}

const changed=[];
let typeRefs=0;
for(const rel of tracked()){
  const abs=path.join(ROOT,rel);
  const before=fs.readFileSync(abs,'utf8');
  const after=patch(rel,before);
  typeRefs+=(after.match(new RegExp(`site-typography-v1\\.css\\?v=${TYPE_VERSION}`,'g'))||[]).length;
  if(after!==before){changed.push(rel);if(!CHECK)fs.writeFileSync(abs,after,'utf8')}
}

const cn=fs.readFileSync(path.join(ROOT,'cn-site/index.html'),'utf8');
if(!patch('cn-site/index.html',cn).includes(`/assets/site.css?v=${CN_VERSION}`))throw new Error('CN heading-scale cache contract missing.');
if(typeRefs<400)throw new Error(`Unexpected typography coverage after R8 materialization: ${typeRefs}`);
if(CHECK&&changed.length)throw new Error(`R8 heading-scale references stale on ${changed.length} file(s): ${changed.slice(0,20).join(', ')}`);

process.stdout.write(`R8 heading-scale ${CHECK?'check passed':'materialized'}: ${typeRefs} typography reference(s), ${changed.length} file(s) changed.\n`);
