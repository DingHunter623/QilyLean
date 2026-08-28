#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process'),root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const must=(s,t,m)=>{if(!s.includes(t))throw new Error(`${m}: missing ${t}`)};
const forbid=(s,t,m)=>{if(s.includes(t))throw new Error(`${m}: forbidden ${t}`)};
const htmlFiles=()=>execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
const ownership=f=>/^(?:baidu_verify_|google[^/]*\.html$|zohoverify\/)/i.test(f);

const brief=read('qilylean/daily/2026-08-25.html');must(brief,'八大浪费','Eight wastes');
const safe=read('site-translation-safe-runtime-v1.js');must(safe,"runtime:'safe-inpage-v4'",'Translation V4');must(safe,'function retryFailedAdaptive(','Adaptive retry');must(safe,'function scheduleHealing(','Healing');forbid(safe,'https://translate.google.com','External redirect');
const header=read('site-header-axis-v1.css');must(header,'Global Header Axis V1.1','Header Axis');must(header,'overflow-x:scroll!important','Mobile nav scroll');must(header,'scrollbar-width:thin!important','Visible nav scrollbar');
const dock=read('site-dock-share-runtime-v1.js');must(dock,'Floating Dock Authoritative Runtime V5.2','Dock V5.2');must(dock,'setOwnedLabel','Dock single label');must(dock,'--qily-dock-size:56px','Mobile Dock size');
const route=read('site-contact-route-v1.js');must(route,'Contact Route V13.2','Contact V13.2');must(route,'20260829-authority-v52','Contact Dock V52 cache');
const css=read('site-interaction-semantics-v1.css'),js=read('site-interaction-semantics-v1.js');must(css,'Interaction Semantics V1.2','Semantics');forbid(css,'content:"回\\A顶部"','Duplicate top');forbid(css,'content:"回\\A上一层"','Duplicate back');must(css,'.overview-card>.tag','Waste number contrast');must(js,'PROJECT_EVIDENCE','Evidence map');must(js,'addTrustLinks','Trust links');must(js,'injectProjectDetailGrade','Project grades');
const career=read('site-early-career-history-v1.css');must(career,'--qily-career-anchor-offset','Career anchor clearance');
const ddz=read('tools/pure-ddz/game/css/r8-closure-v128.css');must(ddz,'Pure DDZ R9 Closure V129','DDZ R9');must(ddz,'.topbar .brand *','Brand stability');must(ddz,'width:max-content!important','Card-group center');
const mat=read('scripts/materialize-global-language-v3.js');must(mat,"const BASELINE_VERSION='20260829-r9-visual-remediation-v22'",'R9 V22');must(mat,'20260829-dock-functional-public-v132','Contact V132 materializer');

let pages=0,nav=0,shell=0;
for(const file of htmlFiles()){
  const html=read(file);if(!/<\/head>/i.test(html)||ownership(file))continue;pages++;
  must(html,'/site-header-axis-v1.css?v=20260829-primary-navigation-scroll-v5',`${file} header`);must(html,'/site-interaction-semantics-v1.css?v=20260829-r9-semantics-v12',`${file} semantics`);must(html,'/site-contact-route-v1.js?v=20260829-dock-functional-public-v132',`${file} contact`);must(html,'data-qily-contact-route-direct="v13.2"',`${file} contact marker`);
  if(/\/site-navigation\.js/.test(html))nav++;if(/\/site-ui-consistency-v1\.js/.test(html))shell++;
}
if(pages<460||nav<460||shell<460)throw new Error(`coverage regression pages=${pages} nav=${nav} shell=${shell}`);
must(read('tools/pure-ddz/index.html'),'/tools/pure-ddz/game/css/r8-closure-v128.css?v=20260829-r9-v129','DDZ R9 materialization');
console.log(`PASS: R9 V22 remediation closure covers ${pages} public pages — uniform mobile Dock, visible nav scroll, career anchors, evidence linkage, DDZ stability and readable waste numbering.`);
