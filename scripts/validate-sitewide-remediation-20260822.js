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
must(dock,'Floating Dock Authoritative Runtime V5.4','Dock V5.4');must(dock,'__qilyFloatingDockUnifiedV54','Dock V54 guard');must(dock,'setOwnedLabel','Dock label owner');must(dock,'--qily-dock-size:52px','Mobile Dock size');must(dock,'function openContactPage()','Full contact route');must(dock,"w.open(url,'_blank','noopener,noreferrer')",'New-tab contact route');forbid(dock,"mask.classList.add('show')",'Dock contact modal');if(/new\s+MutationObserver\s*\(/.test(dock))throw new Error('Dock MutationObserver forbidden');
must(route,'Contact Route V13.4','Contact V13.4');must(route,'__qilyFloatingDockUnifiedV54','Contact Dock V54');must(contactMat,'20260829-dock-functional-public-v134','Contact materializer V133');must(contactMat,'20260829-authority-v54','Contact materializer V53');
must(header,'Global Header Axis V1.2','Header Axis');must(header,'overflow-x:auto!important','Desktop scroll');must(header,'overflow-x:scroll!important','Mobile scroll');must(header,'white-space:nowrap!important','Full nav labels');
must(css,'Interaction Semantics V1.4','Semantics CSS');must(css,'--qily-nav-rail-thumb:#0f4b5a','VI deep-teal rail');must(css,'.qily-primary-nav-scroll-rail','Persistent nav rail');must(css,'.qily-primary-nav-scroll-thumb','Nav rail thumb');must(css,'.brief-action-strip>span','Static brief labels');must(css,'.tag-row>li','Static tag rows');forbid(css,'content:"回\\A顶部"','Duplicate top label');forbid(css,'content:"回\\A上一层"','Duplicate back label');must(css,'.overview-card>.tag','Waste number contrast');
must(js,'__qilyInteractionSemanticsV15','Semantics JS V15');must(js,'qily-primary-nav-scroll-rail','Nav rail runtime');must(js,'.brief-action-strip>span','Static token runtime');must(js,'PROJECT_EVIDENCE','Evidence map');must(js,'addTrustLinks','Trust links');
must(ddz,'Pure DDZ R12 Closure V132','DDZ R12');must(ddz,'.topbar .brand *','DDZ brand stability');must(ddz,'justify-content:safe center!important','DDZ safe center');must(ddz,'width:100%!important','DDZ full hand axis');forbid(ddz,'width:max-content!important','Old left-biased hand width');must(career,'function stickyHeaderOffset()','Career anchor offset');
must(mat,"const BASELINE_VERSION='20260830-sitewide-responsive-containment-v28'",'V28');must(mat,'20260829-dock-functional-public-v134','Contact V134 owner');must(mat,'20260829-authority-v54','Dock V54 owner');must(mat,'20260830-r11-semantics-v15-ios-drag','Semantics V15 owner');must(mat,'20260830-r11-semantics-v14-visual-v3-vi-teal','VI rail owner');must(mat,'20260830-public-language-picker-v8-stable','Stable picker owner');must(mat,'20260829-r12-v132','DDZ R12 owner');
let pages=0,navPages=0,contactPages=0,owners=0,fail=[];
for(const file of files()){
 const html=read(file);if(ownership(file)){owners++;continue;}if(!/<\/head>/i.test(html))continue;pages++;
 if(/\/site-navigation\.js/.test(html))navPages++;
 if(/\/site-contact-route-v1\.js/.test(html)){contactPages++;if(!html.includes('/site-contact-route-v1.js?v=20260829-dock-functional-public-v134')||!html.includes('data-qily-contact-route-direct="v13.4"'))fail.push(`${file}: contact stale`);}
 if(!html.includes('/site-header-axis-v1.css?v=20260829-primary-navigation-safe-scroll-v7'))fail.push(`${file}: header stale`);
 if(!html.includes('/site-interaction-semantics-v1.css?v=20260830-r11-semantics-v14-visual-v3-vi-teal')||!html.includes('/site-interaction-semantics-v1.js?v=20260830-r11-semantics-v15-ios-drag'))fail.push(`${file}: semantics stale`);
 if(!html.includes('/site-translation-public-ui-v1.js?v=20260830-public-language-picker-v8-stable'))fail.push(`${file}: picker stale`);
 if(/\/site-dock-share-runtime-v1\.js/.test(html)&&!html.includes('/site-dock-share-runtime-v1.js?v=20260829-authority-v54'))fail.push(`${file}: Dock stale`);
 if(file==='tools/pure-ddz/index.html'&&!html.includes('/tools/pure-ddz/game/css/r8-closure-v128.css?v=20260829-r12-v132'))fail.push(`${file}: DDZ closure stale`);
}
if(pages<460||navPages<460||contactPages<470)fail.push(`coverage pages=${pages} nav=${navPages} contact=${contactPages}`);if(fail.length)throw new Error(`V26 sitewide remediation failed:\n${fail.slice(0,40).join('\n')}`);
console.log(`PASS: V26 sitewide remediation covers ${pages} pages; ${owners} ownership artifacts remain shell-free; persistent nav rail, inert vocabulary, Dock V5.4/Contact V13.4 and DDZ V132 are current.`);
