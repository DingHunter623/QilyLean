#!/usr/bin/env node
'use strict';
/* Materialize QilyLean About: root menu, experience child section, footer actions and asset revisions. */
const fs=require('fs'),path=require('path'),cp=require('child_process');
const root=path.resolve(__dirname,'..'),check=process.argv.includes('--check'),cnOnly=process.argv.includes('--cn-only');
const tracked=cp.execFileSync('git',['ls-files','-z','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split('\0').filter(Boolean);
function walk(dir){
 if(!fs.existsSync(dir))return [];
 return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
  const target=path.join(dir,entry.name);
  if(entry.isDirectory())return walk(target);
  return entry.isFile()&&entry.name.endsWith('.html')?[path.relative(root,target).replaceAll('\\','/')]:[];
 });
}
const files=Array.from(new Set(tracked.concat(walk(path.join(root,'cn-site'))))).filter(rel=>!cnOnly||rel.startsWith('cn-site/')).sort();
const rev='20261021-about-contact-career-v1';
let changed=0,intl=0,cn=0,removedMenu=0,removedFooter=0;
function version(str,pattern){
 return str.replace(pattern,url=>url.includes('aboutcareer='+rev)?url:url+(url.includes('?')?'&':'?')+'aboutcareer='+rev);
}
for(const rel of files){
 const f=path.join(root,rel);if(!fs.existsSync(f))continue;
 const before=fs.readFileSync(f,'utf8');let after=before;
 const china=rel.startsWith('cn-site/');
 after=after.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi,menu=>{
  if(!/aria-label=["'](?:主导航|网站导航|QilyLean核心导视)["']|qily-global-nav|site-nav/.test(menu))return menu;
  // Career is a child of About, never a standalone global-navigation item.
  let next=menu.replace(/<a\b[^>]*href=["']\/(?:archive\/profile\/)?experience\/["'][^>]*>\s*履历主线\s*<\/a>/gi,'');
  if(next!==menu)removedMenu++;
  // Legacy Improvements/Resources snapshots missed About entirely.
  if(!/href=["']\/about\/["']/.test(next)&&/href=["']\/links\/["']/.test(next)){
   next=next.replace(/<\/nav>$/i,'<a href="/about/">关于我们</a></nav>');
  }
  return next;
 });
 if(china){
   after=version(after,/\/assets\/cn-nav-rail-v1\.js\?[^"'\s<>]*/g);
 }else{
   after=after.replace(/<nav\b(?=[^>]*\bid=["']floatDock["'])[^>]*>[\s\S]*?<\/nav>/gi,menu=>{
     const next=menu.replace(/<button\b(?=[^>]*data-action=["'](?:home|contact)["'])[^>]*>[\s\S]*?<\/button>/gi,'');
     if(next!==menu)removedFooter++;
     return next;
   });
   if(after.includes('qily-page-action-nav'))after=after.replaceAll('grid-template-columns:repeat(7,minmax(0,1fr))','grid-template-columns:repeat(5,minmax(0,1fr))');
   after=version(after,/\/site-navigation\.js\?[^"'\s<>]*/g);
   // The canonical footer materializer owns its runtime revision. Do not add
   // About-only cache parameters that make the shared first paint drift.
 }
 // Existing first-paint generator emits whitespace-only blank lines; normalize them before the check.
 after=after.replace(/^[ \t]+$/gm,'');
 if(after!==before){if(!check)fs.writeFileSync(f,after);changed++;if(china)cn++;else intl++;}
}
if(check&&changed)throw Error('About menu/footer snapshots stale: '+changed);
console.log((check?'CHECK':'APPLY')+' About menu/footer: total='+files.length+' changed='+changed+' intl='+intl+' cn='+cn+' removed menu='+removedMenu+' removed footer='+removedFooter);
