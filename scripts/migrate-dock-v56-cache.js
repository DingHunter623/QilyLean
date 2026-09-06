#!/usr/bin/env node
'use strict';

/* Controlled cache + compatibility migration for Dock V5.8.
 * Purpose: publish the fixed-bottom seven-action Dock with native mobile horizontal swiping
 * across every tracked public page and migrate compatibility gates from older Dock contracts.
 * Workflow files are deliberately excluded because Actions tokens may not rewrite workflows.
 * The historical V5.4 token is replaced only in HTML so JS recovery compatibility remains intact.
 */
const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const check=process.argv.includes('--check');
const SELF='scripts/migrate-dock-v56-cache.js';
const OLD_TOKENS=['20260906-authority-v57-mobile-fixed-bottom','20260906-authority-v56-flow-navigation','20260902-authority-v55','20260902-public-dock-v55'];
const HTML_OLD_TOKENS=['20260829-authority-v54'];
const NEXT='20260906-authority-v58-mobile-swipe-fixed-bottom';
const textExt=/\.(?:html?|js|mjs|cjs|css|json|md|ya?ml|xml|txt)$/i;
const htmlExt=/\.html?$/i;
const tracked=execFileSync('git',['ls-files'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
const changed=[];
const excluded=file=>file===SELF||file.startsWith('.github/');

function writeIfChanged(file,source,next){
  if(next===source)return;
  fs.writeFileSync(path.join(root,file),next);
  if(!changed.includes(file))changed.push(file);
}

function migrateCompatibility(file,source){
  let next=source
    .replace(/Floating Dock Authoritative Runtime V5\.7/g,'Floating Dock Authoritative Runtime V5.8')
    .replace(/__qilyFloatingDockUnifiedV57/g,'__qilyFloatingDockUnifiedV58')
    .replace(/Dock V5\.7/g,'Dock V5.8')
    .replace(/Dock V57/g,'Dock V58')
    .replace(/mobile-fixed-bottom-navigation/g,'mobile-fixed-bottom-swipe-navigation')
    .replace(/seven-action fixed-bottom Dock V5\.8 remediation/g,'seven-action fixed-bottom swipe Dock V5.8 remediation');

  if(file==='scripts/validate-sitewide-experience-v26.js'){
    next=next
      .replace('rectangular fixed-bottom V5.8','rectangular fixed-bottom swipe V5.8')
      .replace("must(dock,'overflow-x:hidden!important','Dock mobile horizontal scroll disabled');","must(dock,'overflow-x:auto!important','Dock mobile horizontal swipe');")
      .replace("must(dock,'scroll-snap-type:none!important','Dock mobile snap disabled');","must(dock,'scroll-snap-type:x proximity!important','Dock mobile snap');must(dock,'-webkit-overflow-scrolling:touch!important','Dock mobile inertial swipe');")
      .replace('rectangular fixed-bottom Dock V5.8','rectangular fixed-bottom swipe Dock V5.8');
  }

  if(file==='scripts/validate-sitewide-remediation-20260822.js'){
    next=next.replace("must(dock,'mobile-fixed-bottom-swipe-navigation','Mobile Dock fixed-bottom layout');","must(dock,'mobile-fixed-bottom-swipe-navigation','Mobile Dock fixed-bottom swipe layout');must(dock,'overflow-x:auto!important','Mobile Dock horizontal swipe');");
  }

  if(file==='scripts/validate-contact-readability-ddz-20260824.js'){
    next=next
      .replace("dock.includes('overflow-x:hidden!important')&&dock.includes('mobile-fixed-bottom-swipe-navigation')","dock.includes('overflow-x:auto!important')&&dock.includes('scroll-snap-type:x proximity!important')&&dock.includes('mobile-fixed-bottom-swipe-navigation')")
      .replace('移动端 Dock 固定底栏/禁止横向滚动契约缺失','移动端 Dock 固定底栏/横向滑动契约缺失');
  }

  if(file==='scripts/validate-r7-authoritative-runtime-20260828.js'){
    next=next
      .replace("must(dock,'overflow-x:hidden!important','Mobile Dock horizontal scrolling disabled');","must(dock,'overflow-x:auto!important','Mobile Dock horizontal swipe');")
      .replace("forbid(dock,'overflow-x:auto!important','Retired mobile Dock horizontal scrolling');","must(dock,'scroll-snap-type:x proximity!important','Mobile Dock snap rail');must(dock,'-webkit-overflow-scrolling:touch!important','Mobile Dock inertial swipe');")
      .replace('Dock V5.8 fixed-bottom compatibility','Dock V5.8 fixed-bottom swipe compatibility')
      .replace('Dock V5.8 fixed-bottom single ownership','Dock V5.8 fixed-bottom swipe single ownership');
  }

  if(file==='scripts/validate-home-hero-dock-snapback-v1.js'){
    next=next
      .replace("must(dock,'overflow-x:hidden!important','Mobile Dock no horizontal scroll');","must(dock,'overflow-x:auto!important','Mobile Dock horizontal swipe');")
      .replace("forbid(dock,'overflow-x:auto!important','Retired swipe rail');","must(dock,'scroll-snap-type:x proximity!important','Mobile Dock snap rail');must(dock,'-webkit-overflow-scrolling:touch!important','Mobile Dock inertial swipe');")
      .replace('Dock V5.8 fixed-bottom |','Dock V5.8 fixed-bottom swipe |')
      .replace('fixed-bottom Dock V5.8 with mobile horizontal scrolling disabled','fixed-bottom Dock V5.8 with native mobile horizontal swiping');
  }

  return next;
}

if(!check){
  for(const file of tracked){
    if(excluded(file)||!textExt.test(file))continue;
    const full=path.join(root,file);let source;
    try{source=fs.readFileSync(full,'utf8');}catch(error){continue;}
    let next=source;
    for(const old of OLD_TOKENS)next=next.split(old).join(NEXT);
    if(htmlExt.test(file))for(const old of HTML_OLD_TOKENS)next=next.split(old).join(NEXT);
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
    'scripts/validate-public-shell-v31.js',
    'scripts/validate-r7-authoritative-runtime-20260828.js',
    'scripts/validate-home-hero-dock-snapback-v1.js'
  ];
  for(const file of compatibilityFiles){
    const full=path.join(root,file);if(!fs.existsSync(full))continue;
    const source=fs.readFileSync(full,'utf8');
    writeIfChanged(file,source,migrateCompatibility(file,source));
  }
}

if(check){
  const remaining=[];
  for(const file of tracked){
    if(excluded(file)||!textExt.test(file))continue;
    const full=path.join(root,file);let source='';try{source=fs.readFileSync(full,'utf8');}catch(error){continue;}
    const tokens=htmlExt.test(file)?OLD_TOKENS.concat(HTML_OLD_TOKENS):OLD_TOKENS;
    for(const old of tokens)if(source.includes(old)){remaining.push(`${file}:${old}`);break;}
  }
  if(remaining.length)throw new Error(`Dock V5.8 cache migration incomplete: ${remaining.slice(0,30).join(', ')}${remaining.length>30?` (+${remaining.length-30})`:''}`);
  const materializer=fs.readFileSync(path.join(root,'scripts/materialize-global-language-v3.js'),'utf8');
  if(!materializer.includes(`DOCK_SHARE='/site-dock-share-runtime-v1.js?v=${NEXT}'`))throw new Error('Dock V5.8 cache migration: materializer does not own the V5.8 cache URL');
  const remediation=fs.readFileSync(path.join(root,'scripts/validate-sitewide-remediation-20260822.js'),'utf8');
  if(!remediation.includes(NEXT))throw new Error('Dock V5.8 cache migration: remediation gate still lacks the V5.8 cache contract');
  const runtime=fs.readFileSync(path.join(root,'site-dock-share-runtime-v1.js'),'utf8');
  for(const token of ['Floating Dock Authoritative Runtime V5.8','__qilyFloatingDockUnifiedV58','position:fixed!important','overflow-x:auto!important','scroll-snap-type:x proximity!important','-webkit-overflow-scrolling:touch!important','mobile-fixed-bottom-swipe-navigation'])if(!runtime.includes(token))throw new Error(`Dock V5.8 cache migration: runtime swipe-fixed contract missing ${token}`);
  const experience=fs.readFileSync(path.join(root,'scripts/validate-sitewide-experience-v26.js'),'utf8');
  for(const token of ['overflow-x:auto!important','scroll-snap-type:x proximity!important','-webkit-overflow-scrolling:touch!important','mobile-fixed-bottom-swipe-navigation','position:fixed!important'])if(!experience.includes(token))throw new Error(`Dock V5.8 cache migration: V26 swipe-fixed compatibility missing ${token}`);
  const r7=fs.readFileSync(path.join(root,'scripts/validate-r7-authoritative-runtime-20260828.js'),'utf8');
  if(r7.includes("forbid(dock,'overflow-x:auto!important'"))throw new Error('Dock V5.8 cache migration: R7 still forbids mobile horizontal swiping');
  const home=fs.readFileSync(path.join(root,'scripts/validate-home-hero-dock-snapback-v1.js'),'utf8');
  if(home.includes("forbid(dock,'overflow-x:auto!important'"))throw new Error('Dock V5.8 cache migration: homepage guard still forbids mobile horizontal swiping');
  console.log(`PASS: Dock V5.8 cache URL ${NEXT} is authoritative across tracked public/content sources; mobile Dock is fixed at the viewport bottom and horizontally swipeable.`);
}else{
  console.log(`Dock V5.8 cache migration updated ${changed.length} tracked file(s).`);
}