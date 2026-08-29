#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const cssPath=path.join(root,'site-visual-system-v2.css');
const materializerPath=path.join(root,'scripts/materialize-global-language-v3.js');
const css=fs.readFileSync(cssPath,'utf8');
const materializer=fs.readFileSync(materializerPath,'utf8');

function assert(condition,message){if(!condition)throw new Error(`Visual System V2 regression: ${message}`)}

assert(css.includes('QilyLean Visual System V2'),'missing V2 authority header');
assert(css.includes('--qv2-axis:1560px'),'missing 1560px content axis token');
assert(css.includes('@media (min-width:1440px)'),'missing Wide Desktop composition');
assert(css.includes('@media (min-width:1180px) and (max-width:1439px)'),'missing Compact Desktop composition');
assert(css.includes('@media (min-width:768px) and (max-width:1179px)'),'missing Tablet composition');
assert(css.includes('@media (max-width:767px)'),'missing Mobile composition');
assert(css.includes('.qily-aircraft-brand-hero'),'missing aircraft visual art-direction contract');
assert(css.includes('#floatDock.qily-float-dock'),'missing responsive Dock visual contract');
assert(css.includes('width:48px!important'),'mobile Dock must reduce visual weight to 48px');
assert(css.includes('grid-template-columns:1fr!important'),'mobile grids must collapse cleanly');
assert(css.includes('navigation != CTA != tag != status'),'component identity contract missing');
assert(materializer.includes("const VISUAL_SYSTEM_V2='/site-visual-system-v2.css?v=20260829-visual-system-v2-r1'"),'materializer does not pin V2 cache key');
assert(materializer.includes('qilyVisualSystemV2'),'materializer does not append V2 as final visual layer');
assert(materializer.includes("'site-visual-system-v2.css'"),'materializer does not remove stale V2 links before rematerializing');

const htmlFiles=execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
const verificationFiles=new Set(['baidu_verify_codeva-0fEjuGTc56.html','google05ce3a1c59e4d8fd.html','zohoverify/verifyforzoho.html']);
let publicCount=0,withV2=0,duplicates=0;
for(const relative of htmlFiles){
  if(verificationFiles.has(relative))continue;
  const source=fs.readFileSync(path.join(root,relative),'utf8');
  if(!/<\/head>/i.test(source))continue;
  publicCount++;
  const matches=source.match(/id=["']qilyVisualSystemV2["']/g)||[];
  if(matches.length===1)withV2++;
  if(matches.length>1)duplicates++;
}
if(process.argv.includes('--materialized')){
  assert(publicCount>0,'no public HTML pages discovered');
  assert(withV2===publicCount,`V2 materialization incomplete: ${withV2}/${publicCount}`);
  assert(duplicates===0,`duplicate V2 stylesheet tags found on ${duplicates} page(s)`);
}

const matrix=[
  ['Wide Desktop','1920x1080'],['Wide Desktop','1680x1050'],['Compact Desktop','1440x900'],
  ['Tablet landscape','1366x768'],['Tablet','1024x768'],['Tablet portrait','834x1194'],
  ['Mobile','430x932'],['Mobile','390x844'],['Mobile','375x812'],['Mobile narrow','360x800']
];
console.log('Visual System V2 source contract: PASS');
console.log('Visual regression matrix:');
for(const [name,viewport] of matrix)console.log(` - ${name}: ${viewport}`);
if(process.argv.includes('--materialized'))console.log(`Visual System V2 sitewide materialization: PASS (${withV2}/${publicCount})`);
