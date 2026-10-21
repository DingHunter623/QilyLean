#!/usr/bin/env node
'use strict';
/* Small dual-site navigation change, 2026-10-21.
 * Keep China About separate from the canonical international contact page.
 * Do not regenerate editorial content or remove mainland filing links.
 */
const fs=require('fs'),path=require('path'),cp=require('child_process');
const root=path.resolve(__dirname,'..');
const check=process.argv.includes('--check');
const newContact='20261021-contact-about-v1';
const previousContact='20261021-footer-vi-v6';
const navRev='20261021-intl-about-v1';
const tracks=cp.execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
let count=0,cn=0,intl=0;
function patch(rel){
  const file=path.join(root,rel);if(!fs.existsSync(file))return;
  let html=fs.readFileSync(file,'utf8'),next=html;
  if(rel.startsWith('cn-site/')){
    next=next.replace(/(\\/assets\\/cn-footer-actions-v1\\.(?:js|css)\\?v=)20261021-footer-vi-v6/g,'$1'+newContact);
    if(rel.endsWith('/about/index.html')&&!next.includes('湘ICP备2026041143号-1'))throw Error('China About lost ICP record');
    if(next!==html)cn++;
  } else if(!rel.startsWith('global-knowledge/')&&rel!=='links/cn-public/index.html'){
    next=next.replace(/(\\/site-dock-share-runtime-v1\\.js\\?v=[^"'\\s<>]*?&patch=)20261021-footer-vi-v6/g,'$1'+newContact);
    next=next.replace(/(\\/site-navigation\\.js\\?[^"'\\s<>]*)/g,url=>url.includes('aboutmenu='+navRev)?url:url+'&aboutmenu='+navRev);
    next=next.replace(/<header\\b[^>]*>[\\s\\S]*?<\\/header>/gi,header=>header.replace(/<nav\\b[^>]*class="[^"]*(?:qily-global-nav|site-nav)[^"]*"[^>]*>[\\s\\S]*?<\\/nav>/gi,nav=>{
      if(!/href=["']\\/links\\/["']/.test(nav)||/href=["']\\/about\\/["']/.test(nav))return nav;
      const active=rel==='about/index.html'?' aria-current="page"':'';
      return nav.replace(/<\\/nav>$/i,'<a href="/about/"'+active+'>关于我们</a></nav>');
    }));
    if(next!==html)intl++;
  }
  if(next!==html){count++;if(!check)fs.writeFileSync(file,next);}
}
for(const rel of tracks)patch(rel);
if(check&&count)throw Error('About/Contact navigation stale in '+count+' pages.');
console.log((check?'CHECK':'APPLY')+' About & Contact dual-site materialization: changed='+count+'; CN='+cn+'; international='+intl);
