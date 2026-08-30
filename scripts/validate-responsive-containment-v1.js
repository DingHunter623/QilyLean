#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const must=(source,token,label)=>{if(!source.includes(token))throw new Error(`${label}: missing ${token}`)};
const forbid=(source,token,label)=>{if(source.includes(token))throw new Error(`${label}: forbidden ${token}`)};
const materialized=process.argv.includes('--materialized');

const css=read('site-responsive-containment-v1.css');
for(const token of [
  'QilyLean Responsive Containment V1',
  '@media (max-width:1179px)',
  '@media (max-width:767px)',
  'overscroll-behavior-inline:contain',
  '-webkit-overflow-scrolling:touch',
  'html body main table',
  'display:block!important',
  '.flow-wrap',
  '.diagram-wrap',
  '.opl-table-wrap',
  '.opl-flow-wrap',
  'max-width:100%!important'
])must(css,token,'Responsive containment');
for(const token of ['position:fixed','width:100vw','min-width:680px','min-width:980px'])forbid(css,token,'Responsive containment');

const materializer=read('scripts/materialize-global-language-v3.js');
must(materializer,"BASELINE_VERSION='20260830-sitewide-responsive-containment-v28'",'V28 public baseline');
must(materializer,"RESPONSIVE_CONTAINMENT_CSS='/site-responsive-containment-v1.css?v=20260830-mobile-containment-v1'",'Responsive containment cache owner');
must(materializer,'qilyResponsiveContainmentV1','Responsive containment materialization');

if(materialized){
  const html=execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
  const ownership=file=>/^(?:baidu_verify_|google[^/]*\.html$|zohoverify\/)/i.test(file);
  const missing=[];
  const duplicates=[];
  let audited=0;
  for(const file of html){
    const source=read(file);
    if(ownership(file)||!/<\/head>/i.test(source))continue;
    audited++;
    const count=(source.match(/site-responsive-containment-v1\.css/g)||[]).length;
    if(count===0)missing.push(file);
    if(count>1)duplicates.push(file);
  }
  if(audited<460)throw new Error(`Responsive containment public-page coverage unexpectedly low: ${audited}`);
  if(missing.length)throw new Error(`Responsive containment missing in ${missing.length} public HTML file(s): ${missing.slice(0,20).join(', ')}`);
  if(duplicates.length)throw new Error(`Responsive containment duplicated in ${duplicates.length} public HTML file(s): ${duplicates.slice(0,20).join(', ')}`);
}

process.stdout.write(`PASS: responsive containment keeps tablet/mobile tables, flows, diagrams and legacy visual frames inside the page shell${materialized?' across every public HTML page':''}.\n`);