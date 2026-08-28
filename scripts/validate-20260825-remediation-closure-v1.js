#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process'),root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8'),must=(s,t,m)=>{if(!s.includes(t))throw new Error(`${m}: missing ${t}`)},forbid=(s,t,m)=>{if(s.includes(t))throw new Error(`${m}: forbidden ${t}`)};
const htmlFiles=()=>execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean),ownership=f=>/^(?:baidu_verify_|google[^/]*\.html$|zohoverify\/)/i.test(f);
must(read('qilylean/daily/2026-08-25.html'),'八大浪费','Eight wastes');
const safe=read('site-translation-safe-runtime-v1.js');must(safe,"runtime:'safe-inpage-v4'",'Translation V4');forbid(safe,'https://translate.google.com','External redirect');
const header=read('site-header-axis-v1.css');must(header,'Global Header Axis V1.1','Header Axis');must(header,'overflow-x:scroll!important','Mobile nav scroll');must(header,'white-space:nowrap!important','Full nav text');
const dock=read('site-dock-share-runtime-v1.js');must(dock,'Floating Dock Authoritative Runtime V5.3','Dock V5.3');must(dock,'setOwnedLabel','Dock single label');must(dock,"w.open(url,'_blank','noopener,noreferrer')",'Full contact new tab');forbid(dock,"mask.classList.add('show')",'Contact modal');
const route=read('site-contact-route-v1.js');must(route,'Contact Route V13.3','Contact V13.3');must(route,'20260829-authority-v53','Contact Dock V53 cache');
const css=read('site-interaction-semantics-v1.css'),js=read('site-interaction-semantics-v1.js');must(css,'Interaction Semantics V1.3','Semantics');must(css,'.qily-primary-nav-scroll-rail','Persistent rail');must(css,'.brief-action-strip>span','Static brief tokens');forbid(css,'content:"回\\A顶部"','Duplicate top');forbid(css,'content:"回\\A上一层"','Duplicate back');must(css,'.overview-card>.tag','Waste number contrast');must(js,'__qilyInteractionSemanticsV13','Semantics runtime');must(js,'qily-primary-nav-scroll-thumb','Rail runtime');must(js,'PROJECT_EVIDENCE','Evidence map');
must(read('site-early-career-history-v1.css'),'--qily-career-anchor-offset','Career anchor clearance');
const ddz=read('tools/pure-ddz/game/css/r8-closure-v128.css');must(ddz,'Pure DDZ R10 Closure V130','DDZ R10');must(ddz,'.topbar .brand *','Brand stability');must(ddz,'justify-content:safe center!important','Safe card center');forbid(ddz,'width:max-content!important','Old hand strategy');
const mat=read('scripts/materialize-global-language-v3.js');must(mat,"const BASELINE_VERSION='20260829-r10-regression-closure-v23'",'R10 V23');must(mat,'20260829-dock-functional-public-v133','Contact V133 materializer');
let pages=0,nav=0,shell=0;
for(const file of htmlFiles()){
  const html=read(file);if(!/<\/head>/i.test(html)||ownership(file))continue;pages++;
  must(html,'/site-header-axis-v1.css?v=20260829-primary-navigation-scroll-v6',`${file} header`);must(html,'/site-interaction-semantics-v1.css?v=20260829-r10-semantics-v13',`${file} semantics`);must(html,'/site-interaction-semantics-v1.js?v=20260829-r10-semantics-v13',`${file} semantics js`);must(html,'data-qily-interaction-semantics-direct="v1.3"',`${file} semantics marker`);must(html,'/site-contact-route-v1.js?v=20260829-dock-functional-public-v133',`${file} contact`);must(html,'data-qily-contact-route-direct="v13.3"',`${file} contact marker`);
  if(/\/site-navigation\.js/.test(html))nav++;if(/\/site-ui-consistency-v1\.js/.test(html))shell++;
}
if(pages<460||nav<460||shell<460)throw new Error(`coverage regression pages=${pages} nav=${nav} shell=${shell}`);
must(read('tools/pure-ddz/index.html'),'/tools/pure-ddz/game/css/r8-closure-v128.css?v=20260829-r10-v130','DDZ R10 materialization');
console.log(`PASS: R10 V23 remediation closure covers ${pages} public pages — persistent nav rail, inert static vocabulary, Dock full-contact route and DDZ safe centering.`);
