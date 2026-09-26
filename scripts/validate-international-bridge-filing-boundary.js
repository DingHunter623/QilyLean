#!/usr/bin/env node
'use strict';
const fs=require('fs');
const pages=['global-knowledge/briefs/index.html','links/cn-public/index.html'];
let failed=false;
for(const rel of pages){
  const html=fs.readFileSync(rel,'utf8');
  const banned=['湘ICP备','湘公网安备','beian.miit.gov.cn','beian.mps.gov.cn','cn-bridge-footer-records'];
  for(const marker of banned){
    if(html.includes(marker)){
      console.error('ERROR: '+rel+' must not expose China filing records on qilylean.com: '+marker);
      failed=true;
    }
  }
  for(const marker of ['data-action="top"','data-action="previous"','data-action="share"']){
    if(!html.includes(marker)){console.error('ERROR: '+rel+' missing China-parity footer action '+marker);failed=true;}
  }
  if(!html.includes('class="cn-bridge-brand" href="https://qilylean.com/"')){
    console.error('ERROR: '+rel+' logo must remain the only international-home return affordance.');
    failed=true;
  }
}
if(failed)process.exit(1);
console.log('International bridge filing-boundary gate passed: no China ICP/MPS record is rendered on qilylean.com bridge pages.');
