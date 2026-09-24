#!/usr/bin/env node
'use strict';

/* QilyLean Dock V5.8 footer-style contract normalizer | 2026-09-24
 * Historical filename is retained because existing workflows call it.
 * Ownership is now intentionally narrow:
 * - normalize the public Dock cache key;
 * - never rewrite Dock geometry;
 * - verify the China-style fixed-footer runtime and its regression gates.
 */
const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const apply=process.argv.includes('--apply');
const BASE='20260906-authority-v58-mobile-swipe-fixed-bottom';
const PATCH='20260924-footer-like-fixed-r1';
const FULL=`${BASE}&patch=${PATCH}`;
const changed=[];

function read(file){return fs.readFileSync(path.join(root,file),'utf8');}
function write(file,next){
  const full=path.join(root,file),before=fs.readFileSync(full,'utf8');
  if(before===next)return false;
  changed.push(file);
  if(apply)fs.writeFileSync(full,next.endsWith('\n')?next:next+'\n','utf8');
  return true;
}
function assert(ok,msg){if(!ok)throw new Error(msg);}
function tracked(pattern){
  return execFileSync('git',['ls-files',pattern],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
}
function normalizeDockUrl(source){
  return source.replace(
    new RegExp('/site-dock-share-runtime-v1\\.js\\?v='+BASE+'(?:&patch=[^\\"\\\'\\s>]*)?','g'),
    '/site-dock-share-runtime-v1.js?v='+FULL
  );
}

for(const file of tracked('*.html'))write(file,normalizeDockUrl(read(file)));
for(const file of tracked('scripts/*.js')){
  if(file==='scripts/normalize-dock-compact-contract-v1.js')continue;
  write(file,normalizeDockUrl(read(file)));
}

const runtime=read('site-dock-share-runtime-v1.js');
for(const token of [
  'Floating Dock Authoritative Runtime V5.8',
  '__qilyFloatingDockUnifiedV58',
  'border-top:3px solid #c8a25a!important',
  'background:#0f4b5a!important',
  'mobile-fixed-bottom-footer-navigation',
  'v5.8-fixed-bottom-footer-navigation',
  "setImportant(dock,'flex-wrap','wrap')",
  "setImportant(button,'flex','0 0 calc((100% - 12px)/4)')"
])assert(runtime.includes(token),`footer-style runtime missing ${token}`);
assert(!runtime.includes('mobile-fixed-bottom-compact-navigation'),'retired compact one-row runtime marker returned');
assert(!runtime.includes('mobile-fixed-bottom-swipe-navigation'),'retired swipe runtime marker returned');

const materializer=normalizeDockUrl(read('scripts/materialize-global-language-v3.js'));
assert(materializer.includes(`DOCK_SHARE='/site-dock-share-runtime-v1.js?v=${FULL}'`),'global materializer does not own footer-style Dock cache');
const gate=read('scripts/validate-dock-flow-navigation-v56.js');
assert(gate.includes('mobile-fixed-bottom-footer-navigation'),'Dock gate is not aligned to footer-style contract');
const spec=read('scripts/dock-flow-navigation-v56.spec.js');
assert(spec.includes("expect(result.layout).toBe('mobile-fixed-bottom-footer-navigation')"),'browser regression does not verify footer-style mobile layout');

if(!apply&&changed.length)throw new Error(`Dock footer cache normalization pending: ${changed.slice(0,20).join(', ')}${changed.length>20?' …':''}`);
console.log(`${apply?'APPLY':'CHECK'} PASS: Dock V5.8 footer-style cache contract; changed=${changed.length}.`);
