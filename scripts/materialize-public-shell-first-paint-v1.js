#!/usr/bin/env node
'use strict';

/* Shared international shell first paint, 2026-10-08.
 * The published HTML supplies the current Dock owner's exact CSS, menu and
 * clearance. The existing runtime adopts those nodes and owns all actions.
 * Independent China/knowledge bridge shells retain their existing footer.
 */
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const {execFileSync}=require('child_process');
const ROOT=path.resolve(__dirname,'..');
const FORMAL_CSS_HREF='/site-vi-standard-v4.css?v=20261006-vi-v4-hero-label-regular-gold-v4&hero=20261007-plain-label-v3&firstpaint=20261008-shell-v1';
const DOCK_RUNTIME_SRC='/site-dock-share-runtime-v1.js?v=20260906-authority-v58-mobile-swipe-fixed-bottom&patch=20260924-footer-like-fixed-r1&firstpaint=20261009-preserve-focus-v1';
const NAV_RAIL_REV='20261008-nav-gap-v1';
const FIRST_PAINT_REV='20261009-shell-v2';
const NAVIGATION_INPUT_REV='20261009-user-nav-v1';
const ORDER=['home','top','back','previous','search','current','contact'];
const LABELS=['首页','顶部','上一层级','上一网页','本站搜索','分享当前','联系我们'];
const DOCK_STYLE_ID='qilyDockUnifiedV58Style';
const DOCK_SPACER_ID='qilyDockBottomSpacerV58';
const runtime=fs.readFileSync(path.join(ROOT,'site-dock-share-runtime-v1.js'),'utf8');
const cssArray=runtime.match(/style\.textContent=(\[[\s\S]*?\])\.join\(''\);/);
if(!cssArray)throw new Error('The authoritative Dock CSS array is unavailable.');
const criticalDockCss=vm.runInNewContext(cssArray[1],Object.create(null),{timeout:1000}).join('');
if(!criticalDockCss.includes('#'+DOCK_SPACER_ID)||!criticalDockCss.includes('position:fixed!important'))throw new Error('The authoritative Dock first-paint contract is incomplete.');
const formalTag=`<link id="qilyViV4Formal" data-qily-vi="v4-formal" rel="stylesheet" href="${FORMAL_CSS_HREF}">`;
const styleTag=`<style id="${DOCK_STYLE_ID}" data-qily-first-paint-dock="v1">${criticalDockCss}</style>`;
const runtimeTag=`<script defer data-qily-dock-share-runtime="v1" src="${DOCK_RUNTIME_SRC}"></script>`;
const dockTag=[
  '<nav id="floatDock" class="qily-float-dock qily-page-action-nav" aria-label="页面快捷导航" data-qily-first-paint-dock="v1" data-qily-standalone-dock="v5.8" data-qily-dock-layout="fixed-bottom-footer-navigation" data-qily-stable-order="'+ORDER.join(',')+'" data-qily-unified-public-module="v5.8-fixed-bottom-footer-navigation">',
  ...ORDER.map((action,i)=>`  <button type="button" class="qily-float-btn qily-float-${action}" data-action="${action}" aria-label="${LABELS[i]}" title="${LABELS[i]}" data-qily-label-owner="dock-v5.8-footer"><span class="qily-dock-label" aria-hidden="true"><span>${LABELS[i]}</span></span></button>`),
  '</nav>'
].join('\n');
const spacerTag=`<div id="${DOCK_SPACER_ID}" aria-hidden="true"></div>`;

function isEligible(relative,source){
  if(relative.startsWith('cn-site/')||relative.startsWith('global-knowledge/')||relative==='links/cn-public/index.html'||relative==='tools/pure-ddz/index.html')return false;
  if(/(?:class=["'][^"']*\bcn-bridge-footer\b|data-cn-bridge-fallback)/i.test(source))return false;
  return /(?:site-navigation\.js|site-contact-route-v1\.js|site-dock-share-runtime-v1\.js)/.test(source)&&/<\/head\s*>/i.test(source)&&/<body\b[^>]*>/i.test(source)&&/<\/body\s*>/i.test(source);
}

function materialize(source,relative){
  if(!isEligible(relative,source))return source;
  let next=source;
  next=next.replace(/\/site-navigation\.js\?[^"'\s<>]*/g,url=>url.replace(/&(?:firstpaint|input)=[^&"'\s<>]*/g,'')+'&firstpaint='+FIRST_PAINT_REV+'&input='+NAVIGATION_INPUT_REV);
  next=next.replace(/\/site-(?:interaction-semantics-v1\.js|visual-authority-r8\.css)\?[^"'\s<>]*/g,url=>url.replace(/&rail=[^&"'\s<>]*/g,'')+'&rail='+NAV_RAIL_REV);
  next=next.replace(/\/site-brand-home-feedback-v1\.js\?[^"'\s<>]*/g,url=>url.replace(/&firstpaint=[^&"'\s<>]*/g,'')+'&firstpaint='+FIRST_PAINT_REV);
  next=next.replace(/\/site-contact-route-v1\.js\?[^"'\s<>]*/g,url=>url.replace(/&firstpaint=[^&"'\s<>]*/g,'')+'&firstpaint='+FIRST_PAINT_REV);
  // Replace only the nodes owned by this shared first-paint contract.
  next=next.replace(/\n?<link\b[^>]*id=["']qilyViV4Formal["'][^>]*>\n?/gi,'\n');
  next=next.replace(/\n?<style\b[^>]*id=["']qilyDockUnifiedV58Style["'][^>]*>[\s\S]*?<\/style>\n?/gi,'\n');
  next=next.replace(/\n?<nav\b[^>]*id=["']floatDock["'][^>]*data-qily-first-paint-dock=["']v1["'][^>]*>[\s\S]*?<\/nav>\n?/gi,'\n');
  next=next.replace(/\n?<div\b[^>]*id=["']qilyDockBottomSpacerV58["'][^>]*>\s*<\/div>\n?/gi,'\n');
  if(/\bid=["']floatDock["']/.test(next))throw new Error(relative+': a non-materialized Dock already exists.');
  // Regional generators can introduce this owned runtime on their first pass.
  // Reinsert it at the same head position when another materializer rebuilds its tags.
  next=next.replace(/\s*<script\b[^>]*data-qily-dock-share-runtime=["']v1["'][^>]*>[\s\S]*?<\/script>\s*/gi,'\n');
  const extraRuntime=/<script\b[^>]*\bsrc=["'][^"']*\/site-dock-share-runtime-v1\.js(?:\?[^"']*)?["'][^>]*>/i.test(next)?'':runtimeTag+'\n';
  next=next.replace(/<\/head\s*>/i,extraRuntime+formalTag+'\n'+styleTag+'\n'+'</head>');
  next=next.replace(/(<body\b[^>]*>)\n?/i,'$1\n'+dockTag+'\n');
  next=next.replace(/\s*<\/body\s*>/i,'\n'+spacerTag+'\n</body>');
  return next;
}

function main(){
  const check=process.argv.includes('--check');
  const files=execFileSync('git',['ls-files','*.html'],{cwd:ROOT,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
  let eligible=0,changed=0,directAdded=0;
  for(const relative of files){
    const file=path.join(ROOT,relative);if(!fs.existsSync(file))continue;
    const source=fs.readFileSync(file,'utf8');if(!isEligible(relative,source))continue;
    eligible++;
    const next=materialize(source,relative);
    if(next!==source){changed++;if(!/site-dock-share-runtime-v1\.js/.test(source))directAdded++;if(!check)fs.writeFileSync(file,next);}
  }
  if(check&&changed)throw new Error('Shared international first-paint shell is stale on '+changed+'/'+eligible+' eligible HTML pages.');
  console.log(`${check?'CHECK':'APPLY'} PASS: shared international first-paint shell; eligible=${eligible}; changed=${changed}; directRuntimeAdded=${directAdded}; canonicalDockCssBytes=${Buffer.byteLength(criticalDockCss)}.`);
}

module.exports={ROOT,FORMAL_CSS_HREF,DOCK_RUNTIME_SRC,NAV_RAIL_REV,FIRST_PAINT_REV,NAVIGATION_INPUT_REV,ORDER,LABELS,DOCK_STYLE_ID,DOCK_SPACER_ID,criticalDockCss,isEligible,materialize};
if(require.main===module)main();
