#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const must=(s,t,m)=>{if(!s.includes(t))throw new Error(`${m}: missing ${t}`);};
const forbid=(s,t,m)=>{if(s.includes(t))throw new Error(`${m}: forbidden ${t}`);};
const files=()=>execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
const ownership=f=>/^(?:baidu_verify_|google[^/]*\.html$|zohoverify\/)/i.test(f);

const authority=read('site-visual-authority-r8.css');
const runtime=read('site-visual-runtime-r8.js');
const containment=read('site-responsive-containment-v1.css');
const visual=read('site-visual-system-v2.css');
const header=read('site-header-axis-v1.css');
const semantics=read('site-interaction-semantics-v1.css');
const redline=read('site-public-redline-closure-v2.css');

must(authority,'QilyLean Visual Authority R8','R8 CSS');
must(authority,'--qily-r8-axis:1560px','R8 axis');
must(authority,'--qily-r8-nav-thumb:#0f4b5a','R8 VI rail');
must(authority,'.qily-table-scroll','Qily Table');
must(authority,'.qily-flow-frame','Qily Flow');
must(authority,'[data-qily-card-count="5"]','Qily Visual Card');
must(authority,'var(--qily-header-live-height,86px)','Measured anchor offset');

must(runtime,'__qilyVisualRuntimeR8','R8 runtime guard');
must(runtime,'ResizeObserver','Measured header');
must(runtime,'wrapTables','Table wrapper');
must(runtime,'annotateCardGrids','Card count materialization');
must(runtime,'annotateFrames','Diagram/flow annotation');
forbid(runtime,'MutationObserver','R8 runtime continuous DOM mutation');
forbid(runtime,'normalizeDockButton','R8 runtime Dock ownership');

forbid(visual,'overflow-x:clip','VIS-010 page-level overflow masking');
forbid(containment,'QILY-0830-HEADER-INTEGRITY-V1:START','Containment must not own header');
forbid(containment,'display:block!important;\n    width:100%!important;\n    max-width:100%!important;\n    overflow-x:auto!important;','Containment must not convert tables to blocks');
must(containment,'QILY-R8-CONTAINMENT-ONLY','Containment single responsibility marker');

must(header,'--qily-nav-scroll-track:#dbe8e6','Header deep-teal track');
must(header,'--qily-nav-scroll-thumb:#0f4b5a','Header deep-teal thumb');
must(semantics,'--qily-nav-rail-thumb:#0f4b5a','Interaction deep-teal thumb');
must(redline,'--ql-redline-rail-track:#dbe8e6','Redline fallback track');
must(redline,'--ql-redline-rail-thumb:#0f4b5a','Redline fallback thumb');
must(redline,'--ql-redline-header-offset:var(--qily-header-live-height,86px)','Measured redline header offset');
forbid(redline,'clamp(260px,17vw,300px)','Oversized translator fallback');

let pages=0,covered=0,duplicates=0,fail=[];
for(const file of files()){
  if(ownership(file))continue;
  const html=read(file);
  if(!/<\/head>/i.test(html))continue;
  pages++;
  const css=(html.match(/site-visual-authority-r8\.css/g)||[]).length;
  const js=(html.match(/site-visual-runtime-r8\.js/g)||[]).length;
  if(css===1&&js===1&&html.includes('data-qily-visual-authority="r8"')&&html.includes('data-qily-visual-runtime="r8"'))covered++;
  else fail.push(`${file}: css=${css}, js=${js}`);
  if(css>1||js>1)duplicates++;
}
if(pages<450)throw new Error(`Unexpected public-page coverage floor: ${pages}`);
if(covered!==pages)throw new Error(`R8 public coverage regression: covered=${covered}/${pages}; sample=${fail.slice(0,12).join(' | ')}`);
if(duplicates)throw new Error(`R8 duplicate authority references detected: ${duplicates}`);

console.log(`PASS: R8 single visual authority covers ${covered}/${pages} public pages; 1560 axis, measured header anchors, VI deep-teal navigation rail, wrapper-owned tables, card/flow/diagram contracts and observable overflow are protected.`);
