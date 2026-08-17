#!/usr/bin/env node
'use strict';

/* QilyLean dock first-paint + navigation polish v4｜2026-08-17
 * 目标：
 * 1) 静态HTML首帧即显示“分享 / 官方网址”，彻底消除“分享官网 → 分享官方网址”的跳变；
 * 2) 静态内容与core生成内容使用同一文案，以shell-ready事件同步，不再用MutationObserver事后改写；
 * 3) 非项目合作页面移除历史 core-service-dock JS/CSS，减少无效请求与运行时DOM工作；
 * 4) 缓存升级到原子首帧版本，导航保持原生整页加载且不预取HTML。
 */
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const CONSISTENCY_SRC='/site-ui-consistency-v1.js?v=20260817-atomic-first-paint-v8';
const FAST_NATIVE_SRC='/site-music-persistent-navigation-v1.js?v=20260817-native-only-v7';
const DIRECT_TAG=`<script defer data-qily-ui-consistency="atomic-first-paint-v8" src="${CONSISTENCY_SRC}"></script>`;
const CRITICAL_STYLE=`<style id="qilyDockCriticalV6">#floatDock [data-action="share"]{width:76px!important;min-width:76px!important;height:76px!important;min-height:76px!important;padding:7px 5px!important;border-radius:50%!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:1px!important;line-height:1!important;white-space:nowrap!important;overflow:hidden!important;box-sizing:border-box!important}#floatDock [data-action="share"] .qily-share-label-line{display:block!important;margin:0!important;padding:0!important;white-space:nowrap!important;text-align:center!important;line-height:1.04!important}#floatDock [data-action="share"] .qily-share-label-primary{font-size:16px!important}#floatDock [data-action="share"] .qily-share-label-url{font-size:12px!important;letter-spacing:-.02em!important}@media(max-width:640px){#floatDock [data-action="share"]{width:72px!important;min-width:72px!important;height:72px!important;min-height:72px!important;padding:6px 4px!important}#floatDock [data-action="share"] .qily-share-label-primary{font-size:15px!important}#floatDock [data-action="share"] .qily-share-label-url{font-size:11px!important;letter-spacing:-.01em!important}}</style>`;
const LOCK_SCRIPT=`<script data-qily-dock-firstpaint-lock="v7">(function(d,w){'use strict';var h='<span class="qily-share-label-line qily-share-label-primary">分享</span><span class="qily-share-label-line qily-share-label-url">官方网址</span>';function f(){var s=d.querySelector('#floatDock [data-action="share"]');if(!s)return;if(s.innerHTML!==h)s.innerHTML=h;if(s.getAttribute('aria-label')!=='分享官方网址')s.setAttribute('aria-label','分享官方网址');if(s.getAttribute('title')!=='分享官方网址')s.setAttribute('title','分享官方网址')}f();d.addEventListener('qily:shell-ready',f);w.addEventListener('pageshow',f)})(document,window);</script>`;

function read(rel){return fs.readFileSync(path.join(root,rel),'utf8');}
function write(rel,content){
  const file=path.join(root,rel);
  const out=content.endsWith('\n')?content:`${content}\n`;
  if(fs.readFileSync(file,'utf8')===out)return false;
  fs.writeFileSync(file,out,'utf8');
  return true;
}
function walk(dir,fn){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(['.git','node_modules','.cache'].includes(entry.name))continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())walk(full,fn);else fn(full);
  }
}
function isPublicHtml(html){
  return /<html\b/i.test(html)&&/<body\b/i.test(html)&&/(?:site-navigation\.js|qily-global-nav|site-nav)/i.test(html);
}
function patchWrapper(){
  const rel='site-navigation.js';
  let text=read(rel);
  text=text.replace(/\/site-ui-consistency-v1\.js\?v=[^'"\s]+/g,CONSISTENCY_SRC);
  write(rel,text);
}
function removeOldDirectAssets(html){
  return html
    .replace(/\s*<script\b[^>]*data-qily-ui-consistency=["'][^"']*["'][^>]*src=["'][^"']*\/site-ui-consistency-v1\.js(?:\?v=[^"']*)?["'][^>]*>\s*<\/script>\s*/gi,'\n')
    .replace(/\s*<style\b[^>]*id=["']qilyDockCriticalV6["'][^>]*>[\s\S]*?<\/style>\s*/gi,'\n')
    .replace(/\s*<script\b[^>]*data-qily-dock-firstpaint-lock=["'][^"']*["'][^>]*>[\s\S]*?<\/script>\s*/gi,'\n');
}
function removeCoreServiceRuntime(html){
  return html
    .replace(/\s*<link\b[^>]*(?:id=["']qilyCoreServiceDockClosureStylesheet["']|href=["'][^"']*\/site-core-service-dock-closure-v1\.css(?:\?v=[^"']*)?["'])[^>]*>\s*/gi,'\n')
    .replace(/\s*<script\b[^>]*(?:data-qily-core-service-dock-closure|src=["'][^"']*\/site-core-service-dock-closure-v1\.js(?:\?v=[^"']*)?["'])[^>]*>\s*<\/script>\s*/gi,'\n');
}
function patchShareMarkup(html){
  const final='<span class="qily-share-label-line qily-share-label-primary">分享</span><span class="qily-share-label-line qily-share-label-url">官方网址</span>';
  let out=html.replace(/(<(button|a)\b[^>]*data-action=["']share["'][^>]*>)[\s\S]*?(<\/\2>)/i,function(_,open,tag,close){return open+final+close;});
  out=out.replace(/(aria-label|title)=["']分享官网["']/g,'$1="分享官方网址"');
  return out;
}
function patchFastNative(html){
  return html.replace(/\/site-music-persistent-navigation-v1\.js\?v=[^"'\s<]+/g,FAST_NATIVE_SRC);
}
function patchHtml(html,rel){
  let out=removeOldDirectAssets(html);
  const cooperation=/^cooperation\/index\.html$/i.test(rel)||/class=["'][^"']*\bcooperation-page\b/i.test(out);
  if(!cooperation)out=removeCoreServiceRuntime(out);
  out=patchShareMarkup(out);
  out=patchFastNative(out);
  const continuity=/<link\b[^>]*href=["'][^"']*\/site-interaction-continuity-v1\.css(?:\?[^"']*)?["'][^>]*>/i;
  if(continuity.test(out))out=out.replace(continuity,`${CRITICAL_STYLE}\n$&`);
  else out=out.replace(/<\/head>/i,`${CRITICAL_STYLE}\n</head>`);
  const nav=/<script\b[^>]*src=["'][^"']*\/site-navigation\.js\?v=[^"']+["'][^>]*>\s*<\/script>/i;
  if(nav.test(out))out=out.replace(nav,`${DIRECT_TAG}\n  $&`);
  else out=out.replace(/<\/head>/i,`  ${DIRECT_TAG}\n</head>`);
  out=out.replace(/<\/body>/i,`${LOCK_SCRIPT}\n</body>`);
  return out;
}

patchWrapper();
let checked=0,changed=0,trimmed=0;
walk(root,(file)=>{
  if(!file.endsWith('.html'))return;
  const before=fs.readFileSync(file,'utf8');
  if(!isPublicHtml(before))return;
  checked+=1;
  const rel=path.relative(root,file).split(path.sep).join('/');
  const hadCore=/site-core-service-dock-closure-v1\.(?:css|js)/i.test(before);
  const cooperation=/^cooperation\/index\.html$/i.test(rel)||/class=["'][^"']*\bcooperation-page\b/i.test(before);
  const after=patchHtml(before,rel);
  if(hadCore&&!cooperation&&!/site-core-service-dock-closure-v1\.(?:css|js)/i.test(after))trimmed+=1;
  if(after!==before){fs.writeFileSync(file,after.endsWith('\n')?after:`${after}\n`,'utf8');changed+=1;}
});

const wrapper=read('site-navigation.js');
if(!wrapper.includes(CONSISTENCY_SRC))throw new Error('site-navigation.js atomic first-paint consistency version missing');
process.stdout.write(`Dock first-paint v4 checked ${checked} public HTML pages; refreshed ${changed}; removed redundant core-service dock assets from ${trimmed} non-cooperation pages; consistency=${CONSISTENCY_SRC}; native-navigation=${FAST_NATIVE_SRC}.\n`);
