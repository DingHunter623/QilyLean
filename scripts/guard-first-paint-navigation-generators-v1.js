#!/usr/bin/env node
'use strict';

/* QilyLean first-paint navigation generator guard｜2026-09-06
 * Prevents any source generator from shipping an obsolete navigation label/route
 * that JavaScript would only correct after first paint.
 */
const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const ROOT=path.resolve(__dirname,'..');
const APPLY=process.argv.includes('--apply');
const SELF='scripts/guard-first-paint-navigation-generators-v1.js';

function read(rel){return fs.readFileSync(path.join(ROOT,rel),'utf8');}
function write(rel,next){
  const file=path.join(ROOT,rel);const before=fs.readFileSync(file,'utf8');
  if(before===next)return false;
  if(APPLY)fs.writeFileSync(file,next,'utf8');
  return true;
}
function scripts(){
  return execFileSync('git',['ls-files','scripts/*.js'],{cwd:ROOT,encoding:'utf8',maxBuffer:64*1024*1024})
    .split(/\r?\n/).filter(Boolean);
}
function patch(rel){
  if(rel===SELF)return false;
  let src=read(rel),before=src;
  // Any generated/public link to /links/ must use the authoritative front-end label.
  src=src.replace(/<a\s+href=["']\/links\/["']([^>]*)>\s*友情链接\s*<\/a>/g,'<a href="/links/"$1>资源协同</a>');
  // Static header templates must contain 精益生产 before 代表项目, matching the public axis.
  src=src.replace(/(<a\s+href=["']\/improvements\/["'][^>]*>\s*改善方法\s*<\/a>)(\s*)(<a\s+href=["']\/projects\/["'][^>]*>\s*代表项目\s*<\/a>)/g,'$1$2<a href="/lean-production/">精益生产</a>$2$3');
  return src!==before ? write(rel,src) : false;
}
function validate(){
  const offenders=[];
  const missingLean=[];
  for(const rel of scripts()){
    if(rel===SELF)continue;
    const src=read(rel);
    if(/<a\s+href=["']\/links\/["'][^>]*>\s*友情链接\s*<\/a>/.test(src))offenders.push(rel);
    const headerTemplates=src.match(/<header[\s\S]{0,8000}?<\/header>/g)||[];
    for(const header of headerTemplates){
      if(/href=["']\/improvements\/["']/.test(header)&&/href=["']\/projects\/["']/.test(header)&&!(/href=["']\/lean-production\/["']/.test(header))){missingLean.push(rel);break;}
    }
  }
  if(offenders.length)throw new Error(`obsolete 友情链接 first-paint generators remain: ${offenders.join(', ')}`);
  if(missingLean.length)throw new Error(`runtime-only 精益生产 insertion remains in header generators: ${missingLean.join(', ')}`);
}

let changed=0;
for(const rel of scripts())if(patch(rel))changed++;
validate();
console.log(`${APPLY?'APPLY':'CHECK'} PASS: first-paint navigation generators are authoritative; changed=${changed}.`);
