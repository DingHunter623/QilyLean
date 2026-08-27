#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const HREF='/site-floating-dock-gold-v1.css?v=20260827-dock-gold-v1';
const TAG=`<link id="qilyFloatingDockGoldV1" rel="stylesheet" href="${HREF}">`;
function trackedHtml(){return execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean)}
function isPublic(html){return /<html\b/i.test(html)&&/<\/head>/i.test(html)&&!(/data-qily-admin-only=["']true["']/i.test(html));}
function install(html){let out=html.replace(/\s*<link\b[^>]*(?:id=["']qilyFloatingDockGoldV1["']|href=["'][^"']*\/site-floating-dock-gold-v1\.css(?:\?v=[^"']*)?["'])[^>]*>\s*/gi,'\n');return out.replace(/<\/head>/i,`  ${TAG}\n</head>`)}
let changed=0,checked=0;
for(const rel of trackedHtml()){
  const abs=path.join(root,rel); let html;
  try{html=fs.readFileSync(abs,'utf8')}catch(_){continue}
  if(!isPublic(html))continue;
  checked++;
  const next=install(html);
  if(next!==html){fs.writeFileSync(abs,next.endsWith('\n')?next:next+'\n','utf8');changed++;}
}
const css=fs.readFileSync(path.join(root,'site-floating-dock-gold-v1.css'),'utf8');
if(!css.includes('--qily-dock-text:#ffe39b'))throw new Error('Gold dock token missing');
if(!css.includes('-webkit-text-fill-color:var(--qily-dock-text)!important'))throw new Error('Gold text hard stop missing');
for(const rel of trackedHtml()){
  const abs=path.join(root,rel); let html;
  try{html=fs.readFileSync(abs,'utf8')}catch(_){continue}
  if(!isPublic(html))continue;
  if(!html.includes(HREF))throw new Error(`${rel}: dock gold guard missing or stale`);
}
console.log(`Floating Dock Gold V1 PASS: ${checked} public pages checked; ${changed} refreshed.`);
