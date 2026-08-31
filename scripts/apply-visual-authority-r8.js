#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const checkOnly=process.argv.includes('--check');

const CSS='/site-visual-authority-r8.css?v=20260831-r8-authority-v1';
const JS='/site-visual-runtime-r8.js?v=20260831-r8-runtime-v1';
const LINK=`<link id="qilyVisualAuthorityR8" data-qily-visual-authority="r8" rel="stylesheet" href="${CSS}">`;
const SCRIPT=`<script defer id="qilyVisualRuntimeR8" data-qily-visual-runtime="r8" src="${JS}"></script>`;
const CACHE_MAP=[
  ['/site-visual-system-v2.css?v=20260830-visual-system-v2-r7','/site-visual-system-v2.css?v=20260831-r8-observable-overflow-v1'],
  ['/site-responsive-containment-v1.css?v=20260830-header-integrity-v2','/site-responsive-containment-v1.css?v=20260831-r8-containment-only-v1'],
  ['/site-header-axis-v1.css?v=20260829-primary-navigation-safe-scroll-v7','/site-header-axis-v1.css?v=20260831-r8-vi-rail-v1'],
  ['/site-public-redline-closure-v2.css?v=20260830-annotated-v2','/site-public-redline-closure-v2.css?v=20260831-r8-fallback-aligned-v1']
];

function read(file){return fs.readFileSync(path.join(root,file),'utf8');}
function write(file,content){if(!checkOnly)fs.writeFileSync(path.join(root,file),content,'utf8');}
function tracked(patterns){return execFileSync('git',['ls-files',...patterns],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);}
function trackedHtml(){return tracked(['*.html']);}
function trackedText(){return tracked(['*.html','*.js','*.css','*.yml','*.yaml']);}
function ownership(file){return /^(?:baidu_verify_|google[^/]*\.html$|zohoverify\/)/i.test(file);}
function cleanR8Refs(html){
  return html
    .replace(/\s*<link[^>]+(?:id=["']qilyVisualAuthorityR8["']|site-visual-authority-r8\.css)[^>]*>\s*/gi,'\n')
    .replace(/\s*<script[^>]+(?:id=["']qilyVisualRuntimeR8["']|site-visual-runtime-r8\.js)[^>]*><\/script>\s*/gi,'\n');
}
function materializeHtml(html){
  let next=cleanR8Refs(html);
  if(!/<\/head>/i.test(next))return next;
  next=next.replace(/\s*<\/head>/i,`\n${LINK}\n${SCRIPT}\n</head>`);
  return next;
}
function replaceLiteral(file,from,to,required=false){
  const text=read(file);
  if(!text.includes(from)){
    if(required)throw new Error(`${file}: required source fragment missing: ${from.slice(0,90)}`);
    return 0;
  }
  const next=text.split(from).join(to);
  if(next!==text){write(file,next);return 1;}
  return 0;
}
function replaceRegex(file,re,to,required=false){
  const text=read(file);
  if(!re.test(text)){
    if(required)throw new Error(`${file}: required pattern missing: ${re}`);
    return 0;
  }
  re.lastIndex=0;
  const next=text.replace(re,to);
  if(next!==text){write(file,next);return 1;}
  return 0;
}
function alignCacheContracts(){
  let filesChanged=0,replacements=0;
  for(const file of trackedText()){
    if(file==='scripts/apply-visual-authority-r8.js')continue;
    const text=read(file);
    let next=text;
    for(const [from,to] of CACHE_MAP){
      if(next.includes(from)){
        replacements+=next.split(from).length-1;
        next=next.split(from).join(to);
      }
    }
    if(next!==text){filesChanged++;write(file,next);}
  }
  return {filesChanged,replacements};
}

let sourceChanges=0;

/* VIS-010: overflow defects must be observable by CI, not hidden by a page-level clip. */
sourceChanges+=replaceLiteral('site-visual-system-v2.css','html,body{max-width:100%;overflow-x:clip}','html,body{max-width:100%}',false);

/* VIS-005 / VIS-008 / VIS-009: Responsive Containment owns containment only. */
sourceChanges+=replaceRegex(
  'site-responsive-containment-v1.css',
  /\n\s*\/\* A direct legacy table without a wrapper becomes its own horizontal viewport\. \*\/[\s\S]*?(?=\n\s*\/\* Fixed-width legacy visual blocks keep their authored detail but cannot widen the page shell\. \*\/)/,
  '\n',
  false
);
sourceChanges+=replaceRegex(
  'site-responsive-containment-v1.css',
  /\n\/\* QILY-0830-HEADER-INTEGRITY-V1:START[\s\S]*?\/\* QILY-0830-HEADER-INTEGRITY-V1:END \*\/\s*/,
  '\n/* QILY-R8-CONTAINMENT-ONLY: Header/nav/translator authority moved to dedicated owners. */\n',
  false
);

/* VIS-004 / VIS-008 / VIS-009: stale redline fallbacks must agree with R8 even before final authority loads. */
sourceChanges+=replaceLiteral('site-public-redline-closure-v2.css','--ql-redline-header-offset:86px;','--ql-redline-header-offset:var(--qily-header-live-height,86px);',false);
sourceChanges+=replaceLiteral('site-public-redline-closure-v2.css','--ql-redline-rail-track:#f3e6cf;','--ql-redline-rail-track:#dbe8e6;',false);
sourceChanges+=replaceLiteral('site-public-redline-closure-v2.css','--ql-redline-rail-thumb:#caa15f;','--ql-redline-rail-thumb:#0f4b5a;',false);
sourceChanges+=replaceLiteral('site-public-redline-closure-v2.css','--ql-redline-rail-hover:#b88b45;','--ql-redline-rail-hover:#12606f;',false);
sourceChanges+=replaceLiteral('site-public-redline-closure-v2.css','clamp(260px,17vw,300px)','clamp(198px,13vw,224px)',false);
sourceChanges+=replaceLiteral('site-public-redline-closure-v2.css','min-width:260px!important;','min-width:198px!important;',false);
sourceChanges+=replaceLiteral('site-public-redline-closure-v2.css','max-width:300px!important;','max-width:224px!important;',false);

/* Header Axis native fallback uses the same VI deep-teal movement language. */
sourceChanges+=replaceLiteral('site-header-axis-v1.css','--qily-nav-scroll-track:#f3e6cf;','--qily-nav-scroll-track:#dbe8e6;',false);
sourceChanges+=replaceLiteral('site-header-axis-v1.css','--qily-nav-scroll-thumb:#caa15f;','--qily-nav-scroll-thumb:#0f4b5a;',false);

/* Cache-bust every changed authority source in HTML, materializers, guards and workflows so self-heal cannot restore an older visual layer. */
const cache=alignCacheContracts();

let pages=0,changed=0,skipped=0;
for(const file of trackedHtml()){
  if(ownership(file)){skipped++;continue;}
  const text=read(file);
  if(!/<\/head>/i.test(text)){skipped++;continue;}
  pages++;
  const next=materializeHtml(text);
  if(next!==text){changed++;write(file,next);}
}

if(checkOnly&&(changed||sourceChanges||cache.filesChanged)){
  throw new Error(`R8 materialization drift: html=${changed}, sources=${sourceChanges}, cache files=${cache.filesChanged}. Run node scripts/apply-visual-authority-r8.js`);
}
process.stdout.write(`R8 visual authority ${checkOnly?'check':'materialize'}: public pages=${pages}, html changed=${changed}, source cleanups=${sourceChanges}, cache files=${cache.filesChanged}, cache replacements=${cache.replacements}, skipped=${skipped}.\n`);
