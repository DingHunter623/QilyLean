#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const assert=(ok,msg)=>{if(!ok)throw new Error(`VI v4 formal audit: ${msg}`);};
const must=(s,t,msg)=>assert(s.includes(t),`${msg}: missing ${t}`);
const forbid=(s,t,msg)=>assert(!s.toLowerCase().includes(t.toLowerCase()),`${msg}: forbidden ${t}`);

const css=read('site-vi-standard-v4.css');
const runtime=read('site-vi-runtime-v4.js');
const bootstrap=read('site-brand-home-feedback-v1.js');

for(const token of [
  '--qily-vi-olive:#0F4B5A','--qily-vi-olive-deep:#073C47','--qily-vi-olive-light:#178B94',
  '--qily-vi-red:#9E4A34','--qily-vi-gold:#CAA15F','--qily-container:1240px','--qily-copy:920px',
  '--qily-radius-sm:8px','--qily-radius:12px','--qily-radius-lg:18px',
  'linear-gradient(118deg,rgba(7,60,71,.99),rgba(15,75,90,.97) 58%,rgba(23,139,148,.90))',
  '.qily-primary-nav-scroll-rail','position:relative!important','qily-vi-v4-flow-dock'
])must(css,token,'formal CSS');
for(const banned of ['#ef4e47','#c93836','#4d6f30','#b86f1b','color-scheme:dark','linear-gradient(125deg','linear-gradient(135deg','linear-gradient(145deg'])forbid(css,banned,'formal CSS red line');

for(const token of ['__qilyViRuntimeV4','data-qily-vi-version','4.0','data-qily-vi-v4-hero','118deg','normalizeDock','single-flow','normalizeHeader','data-qily-vi-v4-overflow','Translation lifecycle and translator DOM remain exclusively owned'])must(runtime,token,'formal runtime');
for(const token of ['/site-vi-standard-v4.css?v=20260906-vi-v4-formal-closure','/site-vi-runtime-v4.js?v=20260906-vi-v4-formal-closure','ensureFormalVi','data-qily-vi-loader'])must(bootstrap,token,'sitewide bootstrap');

const htmlFiles=execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
const ownership=f=>/^(?:baidu_verify_|google[^/]*\.html$|zohoverify\/)/i.test(f);
const DDZ='tools/pure-ddz/index.html';
let governed=0,formalCovered=0,duplicateBootstraps=0;
const missing=[];
for(const file of htmlFiles){
  if(ownership(file)||file===DDZ)continue;
  const html=read(file);
  if(!/<\/head>/i.test(html))continue;
  governed++;
  const bootstrapRefs=(html.match(/site-brand-home-feedback-v1\.js/g)||[]).length;
  const directCss=html.includes('/site-vi-standard-v4.css?v=20260906-vi-v4-formal-closure');
  const directJs=html.includes('/site-vi-runtime-v4.js?v=20260906-vi-v4-formal-closure');
  if(bootstrapRefs===1||(directCss&&directJs))formalCovered++;
  else missing.push(file);
  if(bootstrapRefs>1)duplicateBootstraps++;
}
assert(governed>450,`public-page coverage floor too low: ${governed}`);
assert(formalCovered===governed,`formal authority reachability ${formalCovered}/${governed}; missing=${missing.slice(0,20).join(',')}`);
assert(duplicateBootstraps===0,`duplicate formal bootstrap hosts: ${duplicateBootstraps}`);

const audit={
  schemaVersion:1,
  viVersion:'4.0',
  status:'static-passed',
  p0:0,
  p1:0,
  governedPublicPages:governed,
  formalAuthorityCoveredPages:formalCovered,
  explicitProductInteriorExceptions:[DDZ],
  checks:{tokens:'passed',hero118:'passed',headerShell:'runtime-enforced',translationOwnership:'single-owner-preserved',dockSingleFlow:'runtime-enforced',responsiveOverflow:'browser-required',browserRegression:'pending'},
  generatedAt:new Date().toISOString()
};
if(process.argv.includes('--write')){
  const out=path.join(root,'qilylean','site-vi-audit-v4.json');
  fs.mkdirSync(path.dirname(out),{recursive:true});
  fs.writeFileSync(out,JSON.stringify(audit,null,2)+'\n');
}
console.log(`PASS: VI v4 formal static authority; P0=0 P1=0; formal reachability ${formalCovered}/${governed}. Browser regression remains a release gate.`);
