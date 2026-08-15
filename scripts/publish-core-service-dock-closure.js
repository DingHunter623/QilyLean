#!/usr/bin/env node
'use strict';

/* QilyLean core-service runtime scoping v2｜2026-08-15
 * 历史版本把项目合作增强脚本/样式注入所有页面，导致无效请求、DOM改写和悬浮栏旧文案闪现。
 * 现在仅 cooperation/index.html 保留；其余页面全部清除该运行时，由静态HTML + consistency负责悬浮栏。
 */
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const css='/site-core-service-dock-closure-v1.css?v=20260804-core-service-dock-v3';
const js='/site-core-service-dock-closure-v1.js?v=20260810-stable-dock-v5';
const cssTag=`  <link id="qilyCoreServiceDockClosureStylesheet" rel="stylesheet" href="${css}">`;
const jsTag=`  <script defer data-qily-core-service-dock-closure="v5" src="${js}"></script>`;

function walk(dir,cb){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(['.git','node_modules','.cache'].includes(entry.name))continue;const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full,cb);else cb(full);}}
function read(file){return fs.readFileSync(file,'utf8');}
function write(file,value){const next=value.endsWith('\n')?value:value+'\n';if(read(file)===next)return false;fs.writeFileSync(file,next,'utf8');return true;}
function removeAssets(html){return html
.replace(/\s*<link\b[^>]*(?:id=["']qilyCoreServiceDockClosureStylesheet["']|href=["'][^"']*\/site-core-service-dock-closure-v1\.css(?:\?v=[^"']*)?["'])[^>]*>\s*/gi,'\n')
.replace(/\s*<script\b[^>]*(?:data-qily-core-service-dock-closure|src=["'][^"']*\/site-core-service-dock-closure-v1\.js(?:\?v=[^"']*)?["'])[^>]*>\s*<\/script>\s*/gi,'\n');}
function install(html,rel){
  if(!/<\/head>/i.test(html))return html;
  let out=removeAssets(html);
  const cooperation=/^cooperation\/index\.html$/i.test(rel)||/class=["'][^"']*\bcooperation-page\b/i.test(out);
  if(cooperation)out=out.replace(/<\/head>/i,`${cssTag}\n${jsTag}\n</head>`);
  return out;
}

let checked=0,changed=0,kept=0,removed=0;
walk(root,file=>{
  if(!file.endsWith('.html'))return;
  const before=read(file);if(!/<\/head>/i.test(before))return;
  const rel=path.relative(root,file).split(path.sep).join('/');
  checked+=1;
  const had=/site-core-service-dock-closure-v1\.(?:css|js)/i.test(before);
  const after=install(before,rel);
  const cooperation=/^cooperation\/index\.html$/i.test(rel)||/class=["'][^"']*\bcooperation-page\b/i.test(after);
  if(cooperation)kept+=1;else if(had&&!/site-core-service-dock-closure-v1\.(?:css|js)/i.test(after))removed+=1;
  if(after!==before&&write(file,after))changed+=1;
});
process.stdout.write(`Core-service runtime scoping checked ${checked} HTML pages; refreshed ${changed}; cooperation pages kept=${kept}; redundant non-cooperation assets removed=${removed}.\n`);
