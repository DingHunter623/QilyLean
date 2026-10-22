#!/usr/bin/env node
'use strict';

/* China footer: the canonical shared four actions above original filings.
 * Run after CN page generators and before the final source-content parity pass.
 */
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const crypto=require('crypto');
const ROOT=path.resolve(__dirname,'..');
const CN=path.join(ROOT,'cn-site');
const VERSION='20261022-four-actions-v1';
const ACTIONS=['top','previous','search','current'];
const LABELS=['回到顶部','上一网页','本站搜索','分享当前'];
const CSS_HREF='/assets/cn-footer-actions-v1.css?v='+VERSION;
const JS_SRC='/assets/cn-footer-actions-v1.js?v='+VERSION;
const runtime=fs.readFileSync(path.join(ROOT,'site-dock-share-runtime-v1.js'),'utf8');
const cssArray=runtime.match(/style\.textContent=(\[[\s\S]*?\])\.join\(''\);/);
if(!cssArray)throw new Error('Canonical public action CSS unavailable.');
const actionCss=vm.runInNewContext(cssArray[1],Object.create(null),{timeout:1000}).join('');
const START='/* QILY-CN-SHARED-SEVEN-ACTIONS-V2:START */';
const END='/* QILY-CN-SHARED-SEVEN-ACTIONS-V2:END */';
const regionCss=`
:root{--qily-footer-record-h:46px}
@media(max-width:760px){:root{--qily-footer-record-h:84px}}
html:root:root:root:root:root:root{scrollbar-gutter:stable!important}
html:root:root:root:root:root:root body footer.footer{
  padding:0 0 env(safe-area-inset-bottom)!important;
  background:#0f4b5a!important;border-top:3px solid #c8a25a!important;
}
html:root:root:root:root:root:root body footer.footer .footer-inner{
  display:flex!important;flex-direction:column!important;flex-wrap:nowrap!important;
  width:100%!important;max-width:none!important;min-height:0!important;
  margin:0!important;padding:0!important;gap:0!important;align-items:center!important;
}
html:root:root:root:root:root:root body footer.footer #floatDock.qily-page-action-nav{
  position:static!important;left:auto!important;right:auto!important;bottom:auto!important;
  border:0!important;box-shadow:none!important;z-index:auto!important;
  padding-bottom:7px!important;
}
html:root:root:root:root:root:root body footer.footer .footer-records{
  display:flex!important;flex-direction:row!important;align-items:center!important;
  justify-content:center!important;flex:0 0 auto!important;gap:8px!important;
  width:min(var(--qily-cn-axis,1180px),calc(100% - 32px))!important;
  min-height:var(--qily-footer-record-h,46px)!important;margin:0 auto!important;padding:4px 0!important;
}
html:root:root:root:root:root:root body footer.footer .footer-records>a{
  flex:0 0 auto!important;width:auto!important;
}
@media(max-width:820px){
  html:root:root:root:root:root:root body footer.footer #floatDock.qily-page-action-nav{padding-bottom:5px!important}
}
@media(max-width:760px){
  html:root:root:root:root:root:root body footer.footer .footer-records{
    flex-direction:column!important;gap:5px!important;min-height:var(--qily-footer-record-h,84px)!important;
    width:calc(100% - 16px)!important;
  }
}
html:root:root:root:root:root:root body #qilyCnFooterSearch{
  box-sizing:border-box!important;width:min(760px,calc(100vw - 24px))!important;
  max-height:calc(100dvh - 40px)!important;padding:22px!important;
  border:1px solid #b9d9d4!important;border-top:3px solid #c8a25a!important;
  border-radius:12px!important;background:#fff!important;color:#17322d!important;
  font:18px/1.5 "Microsoft YaHei","PingFang SC",Arial,sans-serif!important;
}
#qilyCnFooterSearch:not([open]){display:none!important}
#qilyCnFooterSearch::backdrop{background:rgba(4,32,39,.66)}
#qilyCnFooterSearch .qily-cn-footer-search-head{display:flex;align-items:center;justify-content:space-between;gap:12px}
html:root:root:root:root:root:root body #qilyCnFooterSearch h2{margin:0 0 14px!important;font-size:24px!important;color:#0f4b5a!important}
html:root:root:root:root:root:root body #qilyCnFooterSearch :is(button,input){box-sizing:border-box!important;font:inherit!important;min-height:42px!important;border:1px solid #b9d9d4!important;border-radius:8px!important;padding:8px 12px!important;background:#fff!important;color:#17322d!important}
html:root:root:root:root:root:root body #qilyCnFooterSearch input{display:block!important;width:100%!important;margin-top:8px!important}
#qilyCnFooterSearch ul{margin:0;padding:0;list-style:none}
#qilyCnFooterSearch li+li{border-top:1px solid #d5e4e3}
#qilyCnFooterSearch a{display:block;padding:12px 4px;color:#0f4b5a;text-underline-offset:3px}
#qilyCnFooterSearch :is(a,button,input):focus-visible{outline:3px solid #caa15f;outline-offset:2px}
@media print{html:root:root:root:root:root:root body footer.footer #floatDock{display:none!important}}

/* QILY-CN-FIVE-ACTIONS-PARITY-V1: shared action row, destination filings below. */
html:root:root:root:root:root:root:root:root body footer.footer .footer-inner{
 display:flex!important;flex-direction:column!important;align-items:stretch!important;
 width:100%!important;max-width:none!important;margin:0!important;padding:0!important;gap:0!important;
}
html:root:root:root:root:root:root:root:root body footer.footer #floatDock.qily-page-action-nav{
 position:static!important;width:100%!important;max-width:none!important;
 padding:5px max(22px,calc((100vw - var(--qily-dock-axis,1180px))/2))!important;
 border:0!important;box-shadow:none!important;
}
html:root:root:root:root:root:root:root:root body footer.footer .footer-records{
 display:flex!important;align-items:center!important;justify-content:center!important;
 flex-direction:row!important;flex-wrap:wrap!important;gap:5px!important;
 box-sizing:border-box!important;min-height:0!important;width:min(1180px,calc(100% - 44px))!important;
 margin:0 auto!important;padding:0 0 5px!important;
}
html:root:root:root:root:root:root:root:root body footer.footer .footer-records>a{
 display:flex!important;align-items:center!important;justify-content:center!important;
 width:auto!important;max-width:100%!important;min-width:0!important;min-height:36px!important;
 padding:5px 9px!important;border:1px solid rgba(255,227,155,.52)!important;border-radius:8px!important;
 color:#ffe39b!important;-webkit-text-fill-color:#ffe39b!important;
 background:rgba(255,255,255,.055)!important;font:500 14px/1.3 "Microsoft YaHei","PingFang SC",Arial,sans-serif!important;
 white-space:nowrap!important;text-decoration:none!important;
}
html:root:root:root:root:root:root:root:root body footer.footer .footer-records>a:is(:hover,:focus-visible){
 background:#ffe39b!important;color:#0f4b5a!important;-webkit-text-fill-color:#0f4b5a!important;
}
@media(max-width:820px){
 html:root:root:root:root:root:root:root:root body footer.footer #floatDock.qily-page-action-nav{padding:4px 6px!important}
 html:root:root:root:root:root:root:root:root body footer.footer .footer-records{width:calc(100% - 12px)!important}
}
@media(max-width:620px){
 html:root:root:root:root:root:root:root:root body footer.footer .footer-records{flex-direction:column!important;align-items:center!important;position:relative!important;left:calc(50vw - 50%)!important}
 html:root:root:root:root:root:root:root:root body footer.footer .footer-records>a{width:fit-content!important;max-width:100%!important;box-sizing:border-box!important;font-size:13px!important;white-space:normal!important;overflow-wrap:anywhere!important}
}

/* QILY-FOUR-ACTIONS-20261022: desktop 4 actions + filings, mobile single-row controls. */
html:root:root:root:root:root:root:root:root:root body footer.footer .footer-inner{
 display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;
 width:min(1180px,calc(100% - 24px))!important;max-width:1180px!important;
 margin-inline:auto!important;gap:6px!important;align-items:center!important;
}
html:root:root:root:root:root:root:root:root:root body footer.footer #floatDock.qily-page-action-nav{
 flex:1 1 auto!important;min-width:0!important;width:auto!important;
 display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;
 padding:5px 0!important;gap:5px!important;position:static!important;
}
html:root:root:root:root:root:root:root:root:root body footer.footer .footer-records{
 display:flex!important;flex:0 1 auto!important;width:auto!important;
 flex-flow:row nowrap!important;align-items:center!important;gap:5px!important;
 padding:0!important;margin:0!important;min-width:0!important;
}
html:root:root:root:root:root:root:root:root body footer.footer .footer-records>a{
 white-space:nowrap!important;overflow-wrap:normal!important;
 font-size:clamp(11px,1vw,14px)!important;font-weight:500!important;
 padding:5px 5px!important;min-height:36px!important;
}
@media(max-width:820px){
 html:root:root:root:root:root:root:root:root:root body footer.footer .footer-inner{
  flex-direction:column!important;gap:2px!important;width:100%!important;
 }
 html:root:root:root:root:root:root:root:root:root body footer.footer #floatDock.qily-page-action-nav{
  width:100%!important;flex:0 0 auto!important;display:grid!important;
  grid-template-columns:repeat(4,minmax(0,1fr))!important;
  gap:4px!important;padding:4px 6px!important;
 }
 html:root:root:root:root:root:root:root:root body footer.footer .footer-records{
  display:flex!important;flex-flow:row nowrap!important;justify-content:center!important;
  width:100%!important;left:auto!important;position:static!important;
  gap:4px!important;padding:0 3px 5px!important;
 }
 html:root:root:root:root:root:root:root:root body footer.footer .footer-records>a{
  width:auto!important;max-width:none!important;white-space:nowrap!important;
  font-size:clamp(10px,2.4vw,13px)!important;padding:3px!important;
  min-height:30px!important;
 }
 html:root:root:root:root:root:root:root:root body footer.footer .police-record img{
  width:14px!important;height:16px!important;flex:0 0 14px!important;
 }
}
@media(max-width:359px){
 html:root:root:root:root:root:root:root:root body footer.footer .footer-records{
  flex-direction:column!important;padding-bottom:4px!important;
 }
}
`;

function filings(footer){
  const opening=/<span\b[^>]*\bclass=["'][^"']*\bfooter-records\b[^"']*["'][^>]*>/i.exec(footer);
  if(!opening)throw new Error('Original filing records unavailable.');
  const tags=/<\/?span\b[^>]*>/gi;tags.lastIndex=opening.index;let depth=0,match;
  while((match=tags.exec(footer))){depth+=/^<\//.test(match[0])?-1:1;if(depth===0)return footer.slice(opening.index,tags.lastIndex);}
  throw new Error('Unbalanced original filing records.');
}
function nav(){
  return '<nav id="floatDock" class="footer-actions qily-float-dock qily-page-action-nav" aria-label="精益制造经验分享页面快捷导航" data-qily-footer-contract="'+ACTIONS.join(',')+'" data-qily-standalone-dock="v5.8" data-qily-dock-layout="fixed-bottom-footer-navigation">'+ACTIONS.map((action,i)=>'<button type="button" class="qily-float-btn qily-float-'+action+'" data-action="'+action+'" data-qily-footer-action="'+action+'" aria-label="'+LABELS[i]+'" title="'+LABELS[i]+'" data-qily-label-owner="dock-v5.8-footer"><span class="qily-dock-label" aria-hidden="true"><span>'+LABELS[i]+'</span></span></button>').join('')+'</nav>';
}
function materialize(source){
  const match=/<footer\b[^>]*\bclass=["']footer["'][^>]*>[\s\S]*?<\/footer>/i.exec(source);
  if(!match)return source;
  const records=filings(match[0]);
  if(!records.includes('湘ICP备2026041143号-1')||!records.includes('湘公网安备43020002000443号'))throw new Error('Expected China filing records missing.');
  let next=source.slice(0,match.index)+'<footer class="footer"><div class="footer-inner">'+nav()+records+'</div></footer>'+source.slice(match.index+match[0].length);
  next=next.replace(/(?<![\w/-])\/assets\/cn-footer-actions-v1\.css(?:\?[^"'\s<>]*)?/g,CSS_HREF);
  next=next.replace(/(?<![\w/-])\/assets\/cn-footer-actions-v1\.js(?:\?[^"'\s<>]*)?/g,JS_SRC);
  if(filings(next.match(/<footer\b[^>]*\bclass=["']footer["'][^>]*>[\s\S]*?<\/footer>/i)[0])!==records)throw new Error('Filing DOM changed.');
  return next;
}
function pages(folder){return fs.readdirSync(folder,{withFileTypes:true}).flatMap(entry=>{const file=path.join(folder,entry.name);return entry.isDirectory()?pages(file):entry.isFile()&&entry.name.endsWith('.html')?[file]:[];});}
function main(){
  const check=process.argv.includes('--check');let changed=0,count=0;
  const cssFile=path.join(CN,'assets/cn-footer-actions-v1.css');
  const oldCss=fs.readFileSync(cssFile,'utf8'),base=oldCss.includes(START)?oldCss.slice(0,oldCss.indexOf(START)).trimEnd():oldCss.trimEnd();
  const css=base+'\n\n'+START+'\n'+actionCss+'\n'+regionCss+'\n'+END+'\n';
  for(const [file,value] of [[cssFile,css],[path.join(CN,'assets/cn-footer-actions-v1.js'),runtime]]){
    if(fs.readFileSync(file,'utf8')!==value){changed++;if(!check)fs.writeFileSync(file,value);}
  }
  for(const file of pages(CN)){
    const source=fs.readFileSync(file,'utf8'),next=materialize(source);if(next===source)continue;
    count++;changed++;if(!check)fs.writeFileSync(file,next);
  }
  if(check&&changed)throw new Error('Public five-action footer stale: '+changed+' assets/pages.');
  console.log((check?'CHECK':'APPLY')+' PASS: CN canonical five-action footer; changed='+changed+'; pages='+count+'; filing DOM unchanged; runtime matches international owner.');
}
module.exports={VERSION,ACTIONS,LABELS,CSS_HREF,JS_SRC,actionCss,regionCss,filings,nav,materialize};
if(require.main===module)main();
