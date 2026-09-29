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
  const logo='<a class="cn-bridge-brand" href="https://qilylean.cn/" aria-label="返回精益制造经验分享中国站首页" title="返回中国站首页"><img src="/assets/brand/qilylean-logo.svg?v=20260724-logo-red-dot-v5" alt="QilyLean｜启力精益"></a>';
  if(!html.includes(logo)){console.error('ERROR: '+rel+' China-parity bridge logo must return to qilylean.cn.');failed=true;}
  if(html.includes('href="https://qilylean.com/" aria-label="返回QilyLean国际站首页"')){console.error('ERROR: '+rel+' must not expose an international-home shortcut in the China-parity shell.');failed=true;}
  if(!html.includes('class="bridge-hero-eyebrow"')&&!html.includes('bridge-hero-eyebrow')){console.error('ERROR: '+rel+' hero eyebrow must use the shared gold VI class.');failed=true;}
  for(const marker of ['data-action="top"','data-action="share"']){
    if(!html.includes(marker)){console.error('ERROR: '+rel+' missing China-parity footer action '+marker);failed=true;}
  }
  if(html.includes('data-action="previous"')||html.includes('>上一网页</button>')){console.error('ERROR: '+rel+' must not restore the retired previous-page footer action.');failed=true;}
  if(/data-action="home"|>首页<\/button>/.test(html)){console.error('ERROR: '+rel+' footer must not expose an international-home button.');failed=true;}
  if(!html.includes('/global-knowledge/cn-bridge-shell-v1.css?v=20260928-cn-parity-shell-v6-footer-nav-parity')){console.error('ERROR: '+rel+' must load bridge shell V2.');failed=true;}
  if(!html.includes('/global-knowledge/cn-bridge-shell-v1.js?v=20260928-cn-home-locked-v6')){console.error('ERROR: '+rel+' must load China-home-locked bridge shell V3.');failed=true;}
  const footer=(html.match(/<footer class="cn-bridge-footer">[\s\S]*?<\/footer>/)||[])[0]||'';
  if(!footer){console.error('ERROR: '+rel+' missing China-parity fixed footer.');failed=true;}
  if(!footer.includes('<a class="cn-bridge-footer-brand" href="https://qilylean.cn/"')){console.error('ERROR: '+rel+' footer brand must link to the China-site homepage.');failed=true;}
  if(!footer.includes('>精益制造经验分享</a>')){console.error('ERROR: '+rel+' footer brand label must be 精益制造经验分享.');failed=true;}
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
console.log('International bridge boundary gate passed: canonical logo, gold eyebrow, identical top/share reference footer, and no China filing record on qilylean.com.');
