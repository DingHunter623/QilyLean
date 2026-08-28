#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process'),root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const must=(s,t,m)=>{if(!s.includes(t))throw new Error(`${m}: missing ${t}`)};
const forbid=(s,t,m)=>{if(s.includes(t))throw new Error(`${m}: forbidden ${t}`)};
const files=()=>execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
const ownership=f=>/^(?:baidu_verify_codeva-[^/]+\.html|google[^/]+\.html|zohoverify\/verifyforzoho\.html)$/i.test(f);
const nav=read('site-navigation.js'),dock=read('site-dock-share-runtime-v1.js'),route=read('site-contact-route-v1.js'),header=read('site-header-axis-v1.css'),css=read('site-interaction-semantics-v1.css'),js=read('site-interaction-semantics-v1.js'),ddz=read('tools/pure-ddz/game/css/r8-closure-v128.css'),career=read('site-early-career-history-v1.js'),mat=read('scripts/materialize-global-language-v3.js'),contactMat=read('scripts/materialize-contact-route-v6.js');
must(nav,'navigation runtime v45','Navigation V45');must(nav,'r7DockSingleAuthority:true','Nav Dock split');if(/new\s+MutationObserver\s*\(/.test(nav))throw new Error('Navigation MutationObserver forbidden');
must(dock,'Floating Dock Authoritative Runtime V5.2','Dock V5.2');must(dock,'setOwnedLabel','Dock label owner');must(dock,'--qily-dock-size:56px','Mobile Dock size');if(/new\s+MutationObserver\s*\(/.test(dock))throw new Error('Dock MutationObserver forbidden');
must(route,'Contact Route V13.2','Contact V13.2');must(route,'__qilyFloatingDockUnifiedV52','Contact Dock V52');must(contactMat,'20260829-dock-functional-public-v132','Contact materializer V132');must(contactMat,'20260829-authority-v52','Contact materializer V52');
must(header,'Global Header Axis V1.1','Header Axis');must(header,'overflow-x:auto!important','Desktop scroll');must(header,'overflow-x:scroll!important','Mobile scroll');must(header,'scrollbar-width:thin!important','Visible scrollbar');
must(css,'Interaction Semantics V1.2','Semantics');forbid(css,'content:"回\\A顶部"','Duplicate top label');forbid(css,'content:"回\\A上一层"','Duplicate back label');must(css,'.overview-card>.tag','Waste number contrast');must(js,'PROJECT_EVIDENCE','Evidence map');must(js,'addTrustLinks','Trust links');
must(ddz,'Pure DDZ R9 Closure V129','DDZ R9');must(ddz,'.topbar .brand *','DDZ brand stability');must(ddz,'width:max-content!important','DDZ card-group center');must(career,'function stickyHeaderOffset()','Career anchor offset');
must(mat,"const BASELINE_VERSION='20260829-r9-visual-remediation-v22'",'R9 V22');must(mat,'20260829-dock-functional-public-v132','Contact V132 owner');
let pages=0,navPages=0,contactPages=0,owners=0,fail=[];
for(const file of files()){
 const html=read(file);if(ownership(file)){owners++;continue;}if(!/<\/head>/i.test(html))continue;pages++;
 if(/\/site-navigation\.js/.test(html))navPages++;
 if(/\/site-contact-route-v1\.js/.test(html)){contactPages++;if(!html.includes('/site-contact-route-v1.js?v=20260829-dock-functional-public-v132')||!html.includes('data-qily-contact-route-direct="v13.2"'))fail.push(`${file}: contact stale`);}
 if(!html.includes('/site-header-axis-v1.css?v=20260829-primary-navigation-scroll-v5'))fail.push(`${file}: header stale`);
 if(!html.includes('/site-interaction-semantics-v1.css?v=20260829-r9-semantics-v12')||!html.includes('/site-interaction-semantics-v1.js?v=20260829-r9-semantics-v12'))fail.push(`${file}: semantics stale`);
 if(/\/site-dock-share-runtime-v1\.js/.test(html)&&!html.includes('/site-dock-share-runtime-v1.js?v=20260829-authority-v52'))fail.push(`${file}: Dock stale`);
}
if(pages<460||navPages<460||contactPages<470)fail.push(`coverage pages=${pages} nav=${navPages} contact=${contactPages}`);if(fail.length)throw new Error(`R9 sitewide remediation failed:\n${fail.slice(0,40).join('\n')}`);
console.log(`PASS: R9 V22 sitewide remediation covers ${pages} pages; ${owners} ownership artifacts remain shell-free; Dock V5.2/Contact V13.2 and visual closure are current.`);
