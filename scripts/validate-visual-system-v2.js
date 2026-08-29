#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const cssPath=path.join(root,'site-visual-system-v2.css');
const materializerPath=path.join(root,'scripts/materialize-global-language-v3.js');
const matrixPath=path.join(root,'visual-regression-matrix.json');
const css=fs.readFileSync(cssPath,'utf8');
const materializer=fs.readFileSync(materializerPath,'utf8');
const matrix=JSON.parse(fs.readFileSync(matrixPath,'utf8'));

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
assert(css.includes('Only real navigation cards receive elevation feedback'),'static-card hover governance missing');
assert(materializer.includes("const BASELINE_VERSION='20260829-visual-system-v2-v25'"),'materializer baseline is not V25');
assert(materializer.includes("const VISUAL_SYSTEM_V2='/site-visual-system-v2.css?v=20260829-visual-system-v2-r2'"),'materializer does not pin V2 r2 cache key');
assert(materializer.includes('qilyVisualSystemV2'),'materializer does not append V2 as final visual layer');
assert(materializer.includes("'site-visual-system-v2.css'"),'materializer does not remove stale V2 links before rematerializing');

assert(matrix.schemaVersion===1,'visual regression matrix schema must be 1');
assert(matrix.system==='QilyLean Visual System V2','matrix system name drifted');
assert(matrix.scope==='visual-only','matrix scope must remain visual-only');
assert(Array.isArray(matrix.viewports)&&matrix.viewports.length>=10,'matrix must retain the full desktop/tablet/mobile viewport set');
const platforms=new Set(matrix.viewports.map(v=>v.platform));
for(const platform of ['desktop','tablet','mobile'])assert(platforms.has(platform),`matrix missing ${platform} platform`);
for(const viewport of matrix.viewports){
  assert(Number.isInteger(viewport.width)&&viewport.width>=320,`invalid viewport width: ${viewport.name}`);
  assert(Number.isInteger(viewport.height)&&viewport.height>=600,`invalid viewport height: ${viewport.name}`);
}
for(const checkpoint of ['primary-navigation','aircraft-brand-hero','heading-hierarchy','card-grid','floating-dock','footer']){
  assert(matrix.visualCheckpoints.includes(checkpoint),`matrix missing checkpoint ${checkpoint}`);
}

const htmlFiles=execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
const verificationFiles=new Set(['baidu_verify_codeva-0fEjuGTc56.html','google05ce3a1c59e4d8fd.html','zohoverify/verifyforzoho.html']);
let publicCount=0,withV2=0,duplicates=0,wrongCache=0;
for(const relative of htmlFiles){
  if(verificationFiles.has(relative))continue;
  const source=fs.readFileSync(path.join(root,relative),'utf8');
  if(!/<\/head>/i.test(source))continue;
  publicCount++;
  const matches=source.match(/id=["']qilyVisualSystemV2["']/g)||[];
  if(matches.length===1)withV2++;
  if(matches.length>1)duplicates++;
  if(matches.length===1&&!source.includes('/site-visual-system-v2.css?v=20260829-visual-system-v2-r2'))wrongCache++;
}
if(process.argv.includes('--materialized')){
  assert(publicCount>0,'no public HTML pages discovered');
  assert(withV2===publicCount,`V2 materialization incomplete: ${withV2}/${publicCount}`);
  assert(duplicates===0,`duplicate V2 stylesheet tags found on ${duplicates} page(s)`);
  assert(wrongCache===0,`stale V2 cache key remains on ${wrongCache} page(s)`);
}

console.log('Visual System V2 source contract: PASS');
console.log('Visual regression matrix:');
for(const viewport of matrix.viewports)console.log(` - ${viewport.platform}: ${viewport.name} ${viewport.width}x${viewport.height}`);
console.log(`Visual checkpoints: ${matrix.visualCheckpoints.join(', ')}`);
if(process.argv.includes('--materialized'))console.log(`Visual System V2 sitewide materialization: PASS (${withV2}/${publicCount})`);
