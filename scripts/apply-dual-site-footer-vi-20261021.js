#!/usr/bin/env node
'use strict';

/* QilyLean dual-site footer/VI delivery closure.
 * Restrict mutations to public Dock cache URLs, China About navigation,
 * and the shared public-footer type URL. Preserve all filing DOM and content.
 */
const fs=require('fs');
const path=require('path');
const cp=require('child_process');
const root=path.resolve(__dirname,'..');
const check=process.argv.includes('--check');
const OLD_DOCK='20261020-public-footer-v5';
const DOCK='20261021-footer-vi-v6';
const OLD_NAV='20261021-nav-rail-v22-contact-preserved';
const NAV='20261021-nav-rail-v23-about';
const OLD_TYPE='20261005-public-footer-v3';
const TYPE='20261021-footer-type-v4';
const files=cp.execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
const generators=[
 'cn-site/scripts/materialize-public-content-mirror.py',
 'cn-site/scripts/materialize-brief-visual-parity.py',
 'cn-site/scripts/build-content-discovery.py',
 'cn-site/scripts/validate-personal-content.sh',
 'scripts/validate-global-knowledge-isolation.js',
 'scripts/redline-navigation-footer-parity.spec.js',
 'cn-site/scripts/materialize-public-content-mirror.py',
 'cn-site/scripts/materialize-brief-visual-parity.py',
 'scripts/validate-global-language-runtime-compat-v1.js'
];
const changed=[];let navCount=0,dockCount=0,typeCount=0;
function patch(rel){
 const file=path.join(root,rel);if(!fs.existsSync(file))return;
 const old=fs.readFileSync(file,'utf8');
 let next=old;
 // Replace scoped asset query revisions only, never editorial content.
 next=next.replace(/(\/(?:site-dock-share-runtime-v1\.js|assets\/cn-footer-actions-v1\.(?:js|css))\?[^"'\s<>]*)/g,u=>u.replaceAll(OLD_DOCK,DOCK));
 next=next.replace(/(\/site-public-footer-type-v1\.css\?[^"'\s<>]*)/g,u=>u.replaceAll(OLD_TYPE,TYPE));
 next=next.replace(/(\/assets\/cn-nav-rail-v1\.js\?[^"'\s<>]*)/g,u=>u.replaceAll(OLD_NAV,NAV));
 if(rel.startsWith('cn-site/')&&rel.endsWith('.html')){
  // Static first paint must match the run-time owner: label & destination.
  next=next.replace(/<a\b[^>]*\bdata-qily-nav-key="contact"[^>]*>\s*联系我们\s*<\/a>/g,tag=>tag.replace('href="/about/#contact"','href="/about/"').replace('>联系我们</a>','>关于我们</a>'));
  // Generated page families can have alternate attribute order.
  next=next.replace(/<a\b[^>]*\bhref="\/about\/#contact"[^>]*\bdata-qily-nav-key="contact"[^>]*>\s*联系我们\s*<\/a>/g,tag=>tag.replace('href="/about/#contact"','href="/about/"').replace('>联系我们</a>','>关于我们</a>'));
 }
 if(rel==='cn-site/scripts/materialize-public-content-mirror.py'){
   next=next.replace('["contact","/about/#contact","联系我们"]','["contact","/about/","关于我们"]');
 }
 if(rel==='cn-site/scripts/build-content-discovery.py'){
   next=next.replace('("/about/#contact", "contact", "联系我们")','("/about/", "contact", "关于我们")');
 }
 if(next!==old){
  if(!check)fs.writeFileSync(file,next);
  changed.push(rel);
 }
 if(rel.startsWith('cn-site/')&&rel.endsWith('.html')){
   if(/data-qily-nav-key="contact"[^>]*>关于我们<\/a>/.test(next))navCount++;
   if(next.includes('/assets/cn-footer-actions-v1.css?v='+DOCK))dockCount++;
   if(next.includes('/site-public-footer-type-v1.css?v='+TYPE))typeCount++;
 }
}
for(const rel of files)patch(rel);
for(const rel of new Set(generators))patch(rel);
if(check&&changed.length)throw Error('Dual-site footer VI materialization stale: '+changed.slice(0,20).join(', ')+(changed.length>20?' ...':''));
console.log((check?'CHECK':'APPLY')+' dual-site footer VI: changed='+changed.length+'; CN about='+navCount+'; CN dock='+dockCount+'; CN type='+typeCount+'; shared footer filings untouched.');
