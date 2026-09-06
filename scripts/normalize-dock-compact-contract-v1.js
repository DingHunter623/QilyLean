#!/usr/bin/env node
'use strict';

/* QilyLean Dock V5.8 compact-fixed contract normalizer｜2026-09-06
 * Finalizes the approved phone footer direction:
 * - seven compact actions always visible, fixed to the viewport bottom;
 * - mobile 首页 / 顶部 short labels; no horizontal swipe rail;
 * - first/last button borders and focus rings render internally, never clipped;
 * - compatibility validators must not reinstate the retired swipe contract.
 */
const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const apply=process.argv.includes('--apply');
const BASE='20260906-authority-v58-mobile-swipe-fixed-bottom';
const PATCH='20260906-mobile-compact-fixed-r1';
const FULL=`${BASE}&patch=${PATCH}`;
const changed=[];

function read(file){return fs.readFileSync(path.join(root,file),'utf8');}
function write(file,next){
  const full=path.join(root,file),before=fs.readFileSync(full,'utf8');
  if(before===next)return false;
  if(apply)fs.writeFileSync(full,next.endsWith('\n')?next:next+'\n','utf8');
  changed.push(file);return true;
}
function assert(ok,msg){if(!ok)throw new Error(msg);}

function patchRuntime(){
  const file='site-dock-share-runtime-v1.js';let s=read(file);
  s=s.replace('Mobile is a native horizontal swipe rail fixed to the bottom; controls keep readable tap widths and never collapse into circles.','Mobile is a compact seven-column rail fixed to the viewport bottom; all seven actions remain visible without horizontal scrolling.');
  s=s.replaceAll('v5.8-fixed-bottom-swipe-navigation','v5.8-fixed-bottom-compact-navigation');
  s=s.replaceAll('dock-v5.8-swipe-fixed','dock-v5.8-compact-fixed');
  write(file,s);
}

function patchCompatibilityValidators(){
  const files=execFileSync('git',['ls-files','scripts/*.js'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
  for(const file of files){
    if(file==='scripts/normalize-dock-compact-contract-v1.js'||file==='scripts/migrate-dock-v56-cache.js'||file==='scripts/validate-dock-flow-navigation-v56.js'||file==='scripts/dock-flow-navigation-v56.spec.js')continue;
    let s=read(file),before=s;
    s=s.replaceAll(`DOCK_SHARE='/site-dock-share-runtime-v1.js?v=${BASE}'`,`DOCK_SHARE='/site-dock-share-runtime-v1.js?v=${FULL}'`);
    s=s.replaceAll('mobile-fixed-bottom-swipe-navigation','mobile-fixed-bottom-compact-navigation');
    s=s.replace(/must\(dock,'overflow-x:auto!important','[^']*'\);/g,"must(dock,'overflow-x:visible!important','Mobile Dock horizontal scrolling disabled');");
    s=s.replace(/must\(dock,'scroll-snap-type:x proximity!important','[^']*'\);/g,"must(dock,'scroll-snap-type:none!important','Mobile Dock scroll snapping disabled');");
    s=s.replace(/must\(dock,'-webkit-overflow-scrolling:touch!important','[^']*'\);/g,"must(dock,'touch-action:pan-y pinch-zoom!important','Mobile Dock vertical gesture ownership');");
    s=s.replace("assert(dock.includes('overflow-x:auto!important')&&dock.includes('scroll-snap-type:x proximity!important')&&dock.includes('mobile-fixed-bottom-compact-navigation'),'移动端 Dock 固定底栏/横向滑动契约缺失');","assert(dock.includes('overflow-x:visible!important')&&dock.includes('scroll-snap-type:none!important')&&dock.includes('mobile-fixed-bottom-compact-navigation'),'移动端 Dock 固定底栏/七栏紧凑布局契约缺失');");
    s=s.replace(/fixed-bottom swipe/g,'fixed-bottom compact');
    s=s.replace(/fixed-bottom Dock V5\.8 with native mobile horizontal swiping/g,'fixed-bottom Dock V5.8 with compact seven-column mobile navigation');
    s=s.replace(/native mobile horizontal swiping/g,'compact seven-column mobile navigation');
    s=s.replace(/horizontal swiping/g,'compact seven-column layout');
    s=s.replace(/horizontal swipe/g,'compact seven-column layout');
    if(s!==before)write(file,s);
  }
}

function rewriteMigration(){
  const file='scripts/migrate-dock-v56-cache.js';
  const src=`#!/usr/bin/env node\n'use strict';\n\n/* Dock V5.8 compact-fixed cache normalizer｜2026-09-06\n * Historical V58 base token is retained for compatibility; the patch query is the public cache authority.\n * This script may normalize cache URLs only. It must never change Dock geometry or restore the retired swipe rail.\n */\nconst fs=require('fs');\nconst path=require('path');\nconst {execFileSync}=require('child_process');\nconst root=path.resolve(__dirname,'..');\nconst check=process.argv.includes('--check');\nconst BASE='${BASE}';\nconst PATCH='${PATCH}';\nconst FULL=BASE+'&patch='+PATCH;\nconst tracked=execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\\r?\\n/).filter(Boolean);\nlet changed=0;\nif(!check){\n  for(const file of tracked){\n    const full=path.join(root,file);let s=fs.readFileSync(full,'utf8');\n    const before=s;\n    s=s.replace(new RegExp('/site-dock-share-runtime-v1\\\\.js\\\\?v='+BASE+'(?:&patch=[^\\"\\\'\\\\s>]*)?','g'),'/site-dock-share-runtime-v1.js?v='+FULL);\n    if(s!==before){fs.writeFileSync(full,s,'utf8');changed++;}\n  }\n}\nconst runtime=fs.readFileSync(path.join(root,'site-dock-share-runtime-v1.js'),'utf8');\nfor(const token of ['Floating Dock Authoritative Runtime V5.8','__qilyFloatingDockUnifiedV58','position:fixed!important','grid-template-columns:repeat(7,minmax(0,1fr))!important','overflow-x:visible!important','scroll-snap-type:none!important','mobile-fixed-bottom-compact-navigation',\"MOBILE_LABELS={home:['首页'],top:['顶部']\"])if(!runtime.includes(token))throw new Error('Dock compact-fixed contract missing '+token);\nif(runtime.includes('mobile-fixed-bottom-swipe-navigation'))throw new Error('Retired mobile swipe layout marker returned');\nconst mat=fs.readFileSync(path.join(root,'scripts/materialize-global-language-v3.js'),'utf8');\nif(!mat.includes(\"DOCK_SHARE='/site-dock-share-runtime-v1.js?v=\"+FULL+\"'\"))throw new Error('Global materializer does not own compact Dock cache');\nconst gate=fs.readFileSync(path.join(root,'scripts/validate-dock-flow-navigation-v56.js'),'utf8');\nif(!gate.includes('mobile-fixed-bottom-compact-navigation')||gate.includes('mobile-fixed-bottom-swipe-navigation'))throw new Error('Dock gate is not aligned to compact contract');\nconsole.log((check?'CHECK':'APPLY')+' PASS: Dock V5.8 compact-fixed cache contract; changed='+changed);\n`;
  write(file,src);
}

function validate(){
  const runtime=read('site-dock-share-runtime-v1.js');
  for(const token of [
    "MOBILE_LABELS={home:['首页'],top:['顶部']",
    'grid-template-columns:repeat(7,minmax(0,1fr))!important',
    'overflow-x:visible!important',
    'scroll-snap-type:none!important',
    'mobile-fixed-bottom-compact-navigation',
    'box-shadow:inset 0 0 0 2px rgba(202,161,95,.55)!important'
  ])assert(runtime.includes(token),`runtime missing ${token}`);
  assert(!runtime.includes('mobile-fixed-bottom-swipe-navigation'),'runtime still contains retired swipe layout marker');
  const primary=read('scripts/validate-dock-flow-navigation-v56.js');
  assert(primary.includes('mobile-fixed-bottom-compact-navigation'),'primary Dock gate not compact');
  assert(!primary.includes("must('overflow-x:auto!important'"),'primary Dock gate still requires swipe overflow');
  const spec=read('scripts/dock-flow-navigation-v56.spec.js');
  assert(spec.includes("expect(result.layout).toBe('mobile-fixed-bottom-compact-navigation')"),'browser regression does not verify compact layout');
  assert(spec.includes('mobile dock must not need horizontal scrolling'),'browser regression does not forbid swipe overflow');
  const mat=read('scripts/materialize-global-language-v3.js');
  assert(mat.includes(`DOCK_SHARE='/site-dock-share-runtime-v1.js?v=${FULL}'`),'materializer compact cache missing');
  const stale=[];
  const files=execFileSync('git',['ls-files','scripts/*.js'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
  for(const file of files){
    if(file==='scripts/normalize-dock-compact-contract-v1.js'||file==='scripts/migrate-dock-v56-cache.js')continue;
    const s=read(file);
    if(/must\(dock,'overflow-x:auto!important'/.test(s)||s.includes('mobile-fixed-bottom-swipe-navigation'))stale.push(file);
  }
  assert(!stale.length,`stale swipe Dock validators remain: ${stale.join(', ')}`);
}

patchRuntime();
patchCompatibilityValidators();
rewriteMigration();
validate();
console.log(`${apply?'APPLY':'CHECK'} PASS: Dock V5.8 compact contract normalized; changed=${changed.length}.`);
