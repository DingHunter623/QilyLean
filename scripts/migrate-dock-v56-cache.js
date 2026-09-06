#!/usr/bin/env node
'use strict';

/* One-time controlled cache migration for Dock V5.6.
 * Purpose: make the rectangular in-flow navigation runtime immediately reachable
 * on every tracked public page instead of reusing the historical V5.5 cache URL.
 */
const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const check=process.argv.includes('--check');
const OLD='20260902-authority-v55';
const NEXT='20260906-authority-v56-flow-navigation';
const textExt=/\.(?:html?|js|mjs|cjs|css|json|md|ya?ml|xml|txt)$/i;
const tracked=execFileSync('git',['ls-files'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
const changed=[];
let remaining=[];
for(const file of tracked){
  if(!textExt.test(file))continue;
  const full=path.join(root,file);
  let source;
  try{source=fs.readFileSync(full,'utf8');}catch(error){continue;}
  if(!source.includes(OLD))continue;
  if(check){remaining.push(file);continue;}
  const next=source.split(OLD).join(NEXT);
  if(next!==source){fs.writeFileSync(full,next);changed.push(file);}
}

const wordingFiles=[
  'scripts/materialize-global-language-v3.js',
  'scripts/materialize-contact-route-v6.js',
  'scripts/validate-sitewide-visual-closure-v27.js',
  'scripts/validate-global-language-runtime-compat-v1.js',
  'scripts/validate-sitewide-safety-readability-v1.js',
  'scripts/validate-sitewide-experience-v26.js'
];
if(!check){
  for(const file of wordingFiles){
    const full=path.join(root,file);if(!fs.existsSync(full))continue;
    const source=fs.readFileSync(full,'utf8');
    const next=source.replace(/Dock V5\.5/g,'Dock V5.6').replace(/Dock V55/g,'Dock V56');
    if(next!==source){fs.writeFileSync(full,next);if(!changed.includes(file))changed.push(file);}
  }
}

if(check){
  for(const file of tracked){
    if(!textExt.test(file))continue;
    const full=path.join(root,file);let source='';try{source=fs.readFileSync(full,'utf8');}catch(error){continue;}
    if(source.includes(OLD)&&!remaining.includes(file))remaining.push(file);
  }
  if(remaining.length)throw new Error(`Dock V5.6 cache migration incomplete: ${remaining.slice(0,30).join(', ')}${remaining.length>30?` (+${remaining.length-30})`:''}`);
  const materializer=fs.readFileSync(path.join(root,'scripts/materialize-global-language-v3.js'),'utf8');
  if(!materializer.includes(`DOCK_SHARE='/site-dock-share-runtime-v1.js?v=${NEXT}'`))throw new Error('Dock V5.6 cache migration: materializer does not own the V5.6 cache URL');
  console.log(`PASS: Dock V5.6 cache URL ${NEXT} is authoritative across tracked text/public sources.`);
}else{
  console.log(`Dock V5.6 cache migration updated ${changed.length} tracked file(s).`);
}
