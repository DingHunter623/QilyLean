#!/usr/bin/env node
'use strict';

/* Controlled cache + compatibility migration for Dock V5.7.
 * Purpose: make the fixed-bottom seven-action navigation immediately reachable on
 * every tracked public page and migrate compatibility gates from the V5.6 cache URL.
 * Workflow files are deliberately excluded because Actions tokens may not rewrite workflows.
 */
const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const check=process.argv.includes('--check');
const SELF='scripts/migrate-dock-v56-cache.js';
const OLD_TOKENS=['20260906-authority-v56-flow-navigation','20260902-authority-v55','20260902-public-dock-v55'];
const NEXT='20260906-authority-v57-mobile-fixed-bottom';
const textExt=/\.(?:html?|js|mjs|cjs|css|json|md|ya?ml|xml|txt)$/i;
const tracked=execFileSync('git',['ls-files'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
const changed=[];
const excluded=file=>file===SELF||file.startsWith('.github/');

function writeIfChanged(file,source,next){
  if(next===source)return;
  fs.writeFileSync(path.join(root,file),next);
  if(!changed.includes(file))changed.push(file);
}

if(!check){
  for(const file of tracked){
    if(excluded(file)||!textExt.test(file))continue;
    const full=path.join(root,file);let source;
    try{source=fs.readFileSync(full,'utf8');}catch(error){continue;}
    let next=source;
    for(const old of OLD_TOKENS)next=next.split(old).join(NEXT);
    writeIfChanged(file,source,next);
  }

  const compatibilityFiles=[
    'scripts/materialize-global-language-v3.js',
    'scripts/materialize-contact-route-v6.js',
    'scripts/validate-sitewide-visual-closure-v27.js',
    'scripts/validate-global-language-runtime-compat-v1.js',
    'scripts/validate-sitewide-safety-readability-v1.js',
    'scripts/validate-sitewide-experience-v26.js',
    'scripts/validate-sitewide-remediation-20260822.js',
    'scripts/validate-contact-readability-ddz-20260824.js',
    'scripts/validate-public-shell-v31.js'
  ];
  for(const file of compatibilityFiles){
    const full=path.join(root,file);if(!fs.existsSync(full))continue;
    const source=fs.readFileSync(full,'utf8');
    const next=source
      .replace(/Floating Dock Authoritative Runtime V5\.6/g,'Floating Dock Authoritative Runtime V5.7')
      .replace(/__qilyFloatingDockUnifiedV56/g,'__qilyFloatingDockUnifiedV57')
      .replace(/Dock V5\.6/g,'Dock V5.7')
      .replace(/Dock V56/g,'Dock V57')
      .replace(/seven-action in-flow Dock V5\.7 remediation/g,'seven-action fixed-bottom Dock V5.7 remediation')
      .replace(/seven-action flow Dock/g,'seven-action fixed-bottom Dock');
    writeIfChanged(file,source,next);
  }
}

if(check){
  const remaining=[];
  for(const file of tracked){
    if(excluded(file)||!textExt.test(file))continue;
    const full=path.join(root,file);let source='';try{source=fs.readFileSync(full,'utf8');}catch(error){continue;}
    for(const old of OLD_TOKENS)if(source.includes(old)){remaining.push(`${file}:${old}`);break;}
  }
  if(remaining.length)throw new Error(`Dock V5.7 cache migration incomplete: ${remaining.slice(0,30).join(', ')}${remaining.length>30?` (+${remaining.length-30})`:''}`);
  const materializer=fs.readFileSync(path.join(root,'scripts/materialize-global-language-v3.js'),'utf8');
  if(!materializer.includes(`DOCK_SHARE='/site-dock-share-runtime-v1.js?v=${NEXT}'`))throw new Error('Dock V5.7 cache migration: materializer does not own the V5.7 cache URL');
  const remediation=fs.readFileSync(path.join(root,'scripts/validate-sitewide-remediation-20260822.js'),'utf8');
  if(!remediation.includes(NEXT))throw new Error('Dock V5.7 cache migration: remediation gate still lacks the V5.7 cache contract');
  const runtime=fs.readFileSync(path.join(root,'site-dock-share-runtime-v1.js'),'utf8');
  if(!runtime.includes('Floating Dock Authoritative Runtime V5.7')||!runtime.includes('overflow-x:hidden!important')||runtime.includes('overflow-x:auto!important'))throw new Error('Dock V5.7 cache migration: fixed-bottom no-swipe runtime contract is not authoritative');
  console.log(`PASS: Dock V5.7 cache URL ${NEXT} is authoritative across tracked public/content sources and compatibility gates.`);
}else{
  console.log(`Dock V5.7 cache migration updated ${changed.length} tracked file(s).`);
}