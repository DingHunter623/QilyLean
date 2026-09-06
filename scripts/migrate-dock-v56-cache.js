#!/usr/bin/env node
'use strict';

/* Dock V5.8 compact-fixed cache normalizer｜2026-09-06
 * Historical V58 base token is retained for compatibility; the patch query is the public cache authority.
 * This script may normalize cache URLs only. It must never change Dock geometry or restore the retired swipe rail.
 */
const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const check=process.argv.includes('--check');
const BASE='20260906-authority-v58-mobile-swipe-fixed-bottom';
const PATCH='20260906-mobile-compact-fixed-r2';
const FULL=BASE+'&patch='+PATCH;
const tracked=execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
let changed=0;
if(!check){
  for(const file of tracked){
    const full=path.join(root,file);let s=fs.readFileSync(full,'utf8');
    const before=s;
    s=s.replace(new RegExp('/site-dock-share-runtime-v1\\.js\\?v='+BASE+'(?:&patch=[^\"\'\\s>]*)?','g'),'/site-dock-share-runtime-v1.js?v='+FULL);
    if(s!==before){fs.writeFileSync(full,s,'utf8');changed++;}
  }
}
const runtime=fs.readFileSync(path.join(root,'site-dock-share-runtime-v1.js'),'utf8');
for(const token of ['Floating Dock Authoritative Runtime V5.8','__qilyFloatingDockUnifiedV58','position:fixed!important','grid-template-columns:repeat(7,minmax(0,1fr))!important','overflow-x:visible!important','scroll-snap-type:none!important','mobile-fixed-bottom-compact-navigation',"MOBILE_LABELS={home:['首页'],top:['顶部']"])if(!runtime.includes(token))throw new Error('Dock compact-fixed contract missing '+token);
if(runtime.includes('mobile-fixed-bottom-swipe-navigation'))throw new Error('Retired mobile swipe layout marker returned');
const mat=fs.readFileSync(path.join(root,'scripts/materialize-global-language-v3.js'),'utf8');
if(!mat.includes("DOCK_SHARE='/site-dock-share-runtime-v1.js?v="+FULL+"'"))throw new Error('Global materializer does not own compact Dock cache');
const gate=fs.readFileSync(path.join(root,'scripts/validate-dock-flow-navigation-v56.js'),'utf8');
if(!gate.includes('mobile-fixed-bottom-compact-navigation')||gate.includes('mobile-fixed-bottom-swipe-navigation'))throw new Error('Dock gate is not aligned to compact contract');
console.log((check?'CHECK':'APPLY')+' PASS: Dock V5.8 compact-fixed cache contract; changed='+changed);
