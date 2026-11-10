#!/usr/bin/env node
'use strict';

/* QilyLean curated-brief first-frame Dock anchor.
 * Only new issues from 2026-11-10 onward; existing approved historical
 * pages are immutable. Canonical V5.8 style remains the terminal head owner.
 * This tiny early rule prevents a cold-load fallback from painting the Dock
 * in flow while presentation styles/runtimes are still arriving.
 */
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const daily=path.join(root,'qilylean','daily');
const START_DATE='2026-11-10';
const STYLE_ID='qilyBriefDockFirstFrameV1';
const AFTER='<!-- QILY-R2-FIRST-PAINT:END -->';
const STYLE=`<style id="${STYLE_ID}" data-qily-brief-first-frame="dock-v1">html:root:root:root:root:root:root body #floatDock.qily-page-action-nav[data-qily-first-paint-dock="v1"]{position:fixed!important;top:auto!important;left:0!important;right:0!important;bottom:0!important;width:100%!important;max-width:none!important;box-sizing:border-box!important;z-index:2147482000!important;display:flex!important;flex-wrap:nowrap!important;margin:0!important;transform:none!important;transition:none!important;background:#0f4b5a!important;border-top:3px solid #c8a25a!important}html:root:root:root:root:root:root body #floatDock.qily-page-action-nav[data-qily-first-paint-dock="v1"] .qily-float-btn{transition:none!important}</style>`;
const check=process.argv.includes('--check');
let candidates=0,changed=0;
for(const file of fs.readdirSync(daily).filter(n=>/^\\d{4}-\\d{2}-\\d{2}\\.html$/.test(n)&&n.slice(0,10)>=START_DATE).sort()){
  candidates++;
  const filename=path.join(daily,file);
  const original=fs.readFileSync(filename,'utf8');
  if(!original.includes(AFTER))throw Error(file+': missing early readable first paint marker');
  if(!original.includes('id="qilyDockUnifiedV58Style"')||!original.includes('id="floatDock"'))throw Error(file+': no canonical V5.8 Dock');
  if((original.match(/id="floatDock"/g)||[]).length!==1)throw Error(file+': duplicate Dock elements');
  const escaped=STYLE_ID.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&');
  const without=original.replace(new RegExp('\\\\s*<style\\\\b[^>]*id=["\\\']'+escaped+'["\\\'][^>]*>[\\\\s\\\\S]*?<\\\\/style>','g'),'');
  if(!without.includes(AFTER))throw Error(file+': no anchor after cleanup');
  const updated=without.replace(AFTER,AFTER+'\\n'+STYLE);
  const firstStyle=updated.indexOf('id="'+STYLE_ID+'"');
  const firstExternal=updated.search(/<link\\s+[^>]*rel=["']stylesheet["']/i);
  const canonical=updated.indexOf('id="qilyDockUnifiedV58Style"');
  if(firstStyle<0 || (firstExternal>=0&&firstStyle>firstExternal) || canonical<firstStyle)throw Error(file+': first-frame rule must precede blocking styles, with canonical Dock CSS terminal');
  if(updated!==original){changed++;if(!check)fs.writeFileSync(filename,updated,'utf8');}
}
if(check&&changed)throw Error('Curated Dock first-frame guard is stale on '+changed+' newly approved issue(s)');
console.log((check?'CHECK':'APPLY')+' PASS: new curated issue Dock pre-paint lock ('+candidates+' pages; '+changed+' updated).');
