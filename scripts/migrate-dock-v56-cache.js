#!/usr/bin/env node
'use strict';

/* Dock V5.8 footer-style cache normalizer | 2026-09-24
 * Historical V58 base token remains for compatibility.
 * This script normalizes cache URLs only and never owns Dock geometry.
 */
const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const check=process.argv.includes('--check');
const BASE='20260906-authority-v58-mobile-swipe-fixed-bottom';
const PATCH='20260924-footer-like-fixed-r1';
const FULL=BASE+'&patch='+PATCH;
const tracked=execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
let changed=0;
for(const file of tracked){
  const full=path.join(root,file),before=fs.readFileSync(full,'utf8');
  const next=before.replace(new RegExp('/site-dock-share-runtime-v1\\.js\\?v='+BASE+'(?:&patch=[^\\"\\\'\\s>]*)?','g'),'/site-dock-share-runtime-v1.js?v='+FULL);
  if(next!==before){changed++;if(!check)fs.writeFileSync(full,next,'utf8');}
}
const runtime=fs.readFileSync(path.join(root,'site-dock-share-runtime-v1.js'),'utf8');
for(const token of [
  'Floating Dock Authoritative Runtime V5.8',
  '__qilyFloatingDockUnifiedV58',
  'border-top:3px solid #c8a25a!important',
  'background:#0f4b5a!important',
  'mobile-fixed-bottom-footer-navigation',
  "setImportant(dock,'flex-wrap','wrap')"
])if(!runtime.includes(token))throw new Error('Dock footer-style contract missing '+token);
if(runtime.includes('mobile-fixed-bottom-compact-navigation')||runtime.includes('mobile-fixed-bottom-swipe-navigation'))throw new Error('Retired Dock layout marker returned');
const mat=fs.readFileSync(path.join(root,'scripts/materialize-global-language-v3.js'),'utf8');
if(!mat.includes("DOCK_SHARE='/site-dock-share-runtime-v1.js?v="+FULL+"'"))throw new Error('Global materializer does not own footer-style Dock cache');
const gate=fs.readFileSync(path.join(root,'scripts/validate-dock-flow-navigation-v56.js'),'utf8');
if(!gate.includes('mobile-fixed-bottom-footer-navigation'))throw new Error('Dock gate is not aligned to footer-style contract');
if(check&&changed)throw new Error('Dock footer-style HTML cache normalization pending: '+changed+' file(s)');
console.log((check?'CHECK':'APPLY')+' PASS: Dock V5.8 footer-style cache contract; changed='+changed);
