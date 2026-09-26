#!/usr/bin/env node
'use strict';
const fs=require('fs');
const pages=['global-knowledge/briefs/index.html','links/cn-public/index.html'];
let failed=false,footers=[];
for(const rel of pages){
  const html=fs.readFileSync(rel,'utf8');
  const banned=['湘ICP备','湘公网安备','beian.miit.gov.cn','beian.mps.gov.cn','cn-bridge-footer-records'];
  for(const marker of banned){
    if(html.includes(marker)){console.error('ERROR: '+rel+' must not expose China filing records on qilylean.com: '+marker);failed=true;}
  }
  const logo='<a class="cn-bridge-brand" href="https://qilylean.com/" aria-label="返回QilyLean国际站首页" title="返回QilyLean国际站首页"><img src="/assets/brand/qilylean-logo.svg?v=20260724-logo-red-dot-v5" alt="QilyLean｜启力精益"></a>';
  if(!html.includes(logo)){console.error('ERROR: '+rel+' must use the canonical international logo and return it to qilylean.com.');failed=true;}
  if(!html.includes('class="bridge-hero-eyebrow"')&&!html.includes('bridge-hero-eyebrow')){console.error('ERROR: '+rel+' hero eyebrow must use the shared gold VI class.');failed=true;}
  for(const marker of ['data-action="top"','data-action="previous"','data-action="share"']){
    if(!html.includes(marker)){console.error('ERROR: '+rel+' missing China-parity footer action '+marker);failed=true;}
  }
  if(/data-action="home"|>首页<\/button>/.test(html)){console.error('ERROR: '+rel+' footer must not expose an international-home button.');failed=true;}
  if(!html.includes('/global-knowledge/cn-bridge-shell-v1.css?v=20260926-cn-parity-shell-v2')){console.error('ERROR: '+rel+' must load bridge shell V2.');failed=true;}
  if(!html.includes('/global-knowledge/cn-bridge-shell-v1.js?v=20260926-cn-parity-shell-v2')){console.error('ERROR: '+rel+' must load bridge footer runtime V2.');failed=true;}
  const footer=(html.match(/<footer class="cn-bridge-footer">[\s\S]*?<\/footer>/)||[])[0]||'';
  if(!footer){console.error('ERROR: '+rel+' missing China-parity fixed footer.');failed=true;}
  footers.push(footer);
}
if(footers.length===2&&footers[0]!==footers[1]){console.error('ERROR: briefs/resources bridge footers must be identical.');failed=true;}
if(failed)process.exit(1);
console.log('International bridge boundary gate passed: canonical logo, gold eyebrow, identical three-action footer, and no China filing record on qilylean.com.');
