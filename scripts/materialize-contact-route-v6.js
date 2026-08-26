#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const ROUTE='/site-contact-route-v1.js?v=20260826-contact-native-newtab-map-v6';

function trackedHtml(){
  return execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
}

let changed=0,covered=0;
for(const relative of trackedHtml()){
  const file=path.join(root,relative);
  const source=fs.readFileSync(file,'utf8');
  if(!/site-contact-route-v1\.js(?:\?v=[^"']*)?/.test(source))continue;
  covered+=1;
  let next=source
    .replace(/\/site-contact-route-v1\.js(?:\?v=[^"']*)?/g,ROUTE)
    .replace(/data-qily-contact-route-direct=["'][^"']*["']/g,'data-qily-contact-route-direct="v6"');
  if(next!==source){fs.writeFileSync(file,next);changed+=1;}
}

if(process.argv.includes('--check')){
  if(changed)throw new Error(`Contact V6 materialization stale on ${changed} HTML file(s).`);
  if(covered<470)throw new Error(`Contact route coverage unexpectedly low: ${covered}.`);
  process.stdout.write(`PASS: contact route V6 cache/marker present on ${covered} tracked HTML pages.\n`);
}else{
  process.stdout.write(`Contact route V6 materialized on ${changed} HTML file(s); coverage ${covered}.\n`);
}
