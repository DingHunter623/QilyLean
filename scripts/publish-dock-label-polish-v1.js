#!/usr/bin/env node
'use strict';

/* QilyLean dock label polish v2｜2026-08-15
 * 目标：保证“分享官方网址”在电脑和手机均固定为两行完整显示：分享 / 官方网址。
 * 通过独立 cache-busted consistency 脚本直挂公共页面，避免旧导航脚本缓存影响。
 */
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const CONSISTENCY_SRC='/site-ui-consistency-v1.js?v=20260815-dock-label-v4';
const DIRECT_TAG=`<script defer data-qily-ui-consistency="dock-v4" src="${CONSISTENCY_SRC}"></script>`;

function read(rel){return fs.readFileSync(path.join(root,rel),'utf8');}
function write(rel,content){
  const file=path.join(root,rel);
  const out=content.endsWith('\n')?content:`${content}\n`;
  if(fs.readFileSync(file,'utf8')===out)return false;
  fs.writeFileSync(file,out,'utf8');
  return true;
}
function walk(dir,fn){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(['.git','node_modules','.cache'].includes(entry.name))continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())walk(full,fn);else fn(full);
  }
}
function isPublicHtml(html){
  return /<html\b/i.test(html)&&/<body\b/i.test(html)&&/(?:site-navigation\.js|qily-global-nav|site-nav)/i.test(html);
}
function patchWrapper(){
  const rel='site-navigation.js';
  let text=read(rel);
  text=text.replace(/\/site-ui-consistency-v1\.js\?v=[^'"\s]+/g,CONSISTENCY_SRC);
  write(rel,text);
}
function patchHtml(html){
  let out=html.replace(/\s*<script\b[^>]*data-qily-ui-consistency=["'][^"']*["'][^>]*src=["'][^"']*\/site-ui-consistency-v1\.js(?:\?v=[^"']*)?["'][^>]*>\s*<\/script>\s*/gi,'\n');
  const nav=/<script\b[^>]*src=["'][^"']*\/site-navigation\.js\?v=[^"']+["'][^>]*>\s*<\/script>/i;
  if(nav.test(out))return out.replace(nav,`${DIRECT_TAG}\n  $&`);
  return out.replace(/<\/head>/i,`  ${DIRECT_TAG}\n</head>`);
}

patchWrapper();
let checked=0,changed=0;
walk(root,(file)=>{
  if(!file.endsWith('.html'))return;
  const before=fs.readFileSync(file,'utf8');
  if(!isPublicHtml(before))return;
  checked+=1;
  const after=patchHtml(before);
  if(after!==before){fs.writeFileSync(file,after.endsWith('\n')?after:`${after}\n`,'utf8');changed+=1;}
});

const wrapper=read('site-navigation.js');
if(!wrapper.includes(CONSISTENCY_SRC))throw new Error('site-navigation.js dock-label cache version missing');
process.stdout.write(`Dock label polish v2 checked ${checked} public HTML pages; refreshed ${changed}; direct consistency cache=${CONSISTENCY_SRC}.\n`);
