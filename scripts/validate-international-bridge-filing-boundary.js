#!/usr/bin/env node
'use strict';
const fs=require('fs');
const os=require('os');
const path=require('path');
const {execFileSync}=require('child_process');
const pages=['global-knowledge/briefs/index.html','links/cn-public/index.html'];
let failed=false,footers=[];
const bridgeCss=fs.readFileSync('global-knowledge/cn-bridge-footer-v1.css','utf8');
if(!bridgeCss.includes('QILY-CN-BRIDGE-FOOTER-ACTION-EQUAL-WIDTH-V6')||!bridgeCss.includes('width:calc(4em + 24px)!important')){
  console.error('ERROR: shared CN-bridge footer must keep 顶部 / 分享当前 at one canonical width.');
  failed=true;
}

for(const rel of pages){
  const html=fs.readFileSync(rel,'utf8');
  const banned=['湘ICP备','湘公网安备','beian.miit.gov.cn','beian.mps.gov.cn','cn-bridge-footer-records','site-contact-route-v1.js','site-dock-share-runtime-v1.js'];
  for(const marker of banned){
    if(html.includes(marker)){console.error('ERROR: '+rel+' must not include China filing records or international Dock loaders: '+marker);failed=true;}
  }
  const logo='<a class="cn-bridge-brand" href="https://qilylean.com/" aria-label="返回国际站" title="返回国际站"><img src="/assets/brand/qilylean-logo.svg?v=20260724-logo-red-dot-v5" alt="QilyLean｜启力精益"></a>';
  if(!html.includes(logo)){console.error('ERROR: '+rel+' bridge logo must return to the international site with exact tooltip.');failed=true;}
  if(html.includes('class="cn-bridge-brand" href="https://qilylean.cn/"')){console.error('ERROR: '+rel+' logo must not route back to China site.');failed=true;}
  if(!html.includes('class="bridge-hero-eyebrow"')&&!html.includes('bridge-hero-eyebrow')){console.error('ERROR: '+rel+' hero eyebrow must use the shared gold VI class.');failed=true;}
  for(const marker of ['data-action="top"','data-action="share"']){
    if(!html.includes(marker)){console.error('ERROR: '+rel+' missing China-parity footer action '+marker);failed=true;}
  }
  if(html.includes('data-action="previous"')||html.includes('>上一网页</button>')){console.error('ERROR: '+rel+' must not restore the retired previous-page footer action.');failed=true;}
  if(/data-action="home"|>首页<\/button>/.test(html)){console.error('ERROR: '+rel+' footer must not expose an international-home button.');failed=true;}
  if(!html.includes('/global-knowledge/cn-bridge-shell-v1.css?v=20260928-cn-parity-shell-v6-footer-nav-parity')){console.error('ERROR: '+rel+' must load bridge shell V2.');failed=true;}
  if(!html.includes('/global-knowledge/cn-bridge-shell-v1.js?v=20261007-international-home-v7')){console.error('ERROR: '+rel+' must load international-home bridge shell V4.');failed=true;}
  const footer=(html.match(/<footer class="cn-bridge-footer">[\s\S]*?<\/footer>/)||[])[0]||'';
  if(!footer){console.error('ERROR: '+rel+' missing China-parity fixed footer.');failed=true;}
  if(footer.includes('cn-bridge-footer-brand')){console.error('ERROR: '+rel+' must not show China filing name as a footer button.');failed=true;}
  if(/湘ICP备|湘公网安备|beian\.miit|beian\.mps|cn-bridge-footer-records/.test(footer)){console.error('ERROR: '+rel+' international footer contains mainland filing information.');failed=true;}
  footers.push(footer);
}
if(footers.length===2&&footers[0]!==footers[1]){console.error('ERROR: briefs/resources bridge footers must be identical.');failed=true;}
// Exercise the actual publishing transform: it must not reintroduce the seven-action Dock.
const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'qily-bridge-footer-'));
try{
  const materializer='scripts/materialize-global-language-v3.js';
  for(const rel of [materializer,...pages]){
    const target=path.join(fixture,rel);
    fs.mkdirSync(path.dirname(target),{recursive:true});
    fs.copyFileSync(rel,target);
  }
  execFileSync('git',['init','--quiet'],{cwd:fixture});
  execFileSync('git',['add','--',...pages],{cwd:fixture});
  for(let pass=0;pass<2;pass++){
    execFileSync(process.execPath,[path.join(fixture,materializer)],{cwd:fixture});
    for(const rel of pages){
      if(fs.readFileSync(path.join(fixture,rel),'utf8')!==fs.readFileSync(rel,'utf8')){
        console.error('ERROR: publishing materializer must preserve the independent bridge shell: '+rel);
        failed=true;
      }
    }
  }
}finally{
  fs.rmSync(fixture,{recursive:true,force:true});
}
if(failed)process.exit(1);
console.log('International bridge boundary gate passed: international-home logo, gold eyebrow, identical top/share-only footer, and no China filing record on qilylean.com.');
