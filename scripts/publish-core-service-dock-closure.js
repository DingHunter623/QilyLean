#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const css='/site-core-service-dock-closure-v1.css?v=20260804-core-service-dock-v3';
const js='/site-core-service-dock-closure-v1.js?v=20260810-stable-dock-v5';
const cssTag=`  <link id="qilyCoreServiceDockClosureStylesheet" rel="stylesheet" href="${css}">`;
const jsTag=`  <script defer data-qily-core-service-dock-closure="v4" src="${js}"></script>`;

function walk(dir,cb){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(['.git','node_modules','.cache'].includes(entry.name))continue;const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full,cb);else cb(full);}}
function read(file){return fs.readFileSync(file,'utf8');}
function write(file,value){const next=value.endsWith('\n')?value:value+'\n';if(read(file)===next)return false;fs.writeFileSync(file,next,'utf8');return true;}
function install(html){if(!/<\/head>/i.test(html))return html;const cleaned=html
.replace(/\s*<link\b[^>]*id=["']qilyCoreServiceDockClosureStylesheet["'][^>]*>\s*/gi,'\n')
.replace(/\s*<link\b[^>]*href=["'][^"']*\/site-core-service-dock-closure-v1\.css\?v=[^"']+["'][^>]*>\s*/gi,'\n')
.replace(/\s*<script\b[^>]*(?:data-qily-core-service-dock-closure|src=["'][^"']*\/site-core-service-dock-closure-v1\.js\?v=[^"']+["'])[^>]*>\s*<\/script>\s*/gi,'\n');
return cleaned.replace(/<\/head>/i,`${cssTag}\n${jsTag}\n</head>`);}

let checked=0,changed=0;
walk(root,file=>{if(!file.endsWith('.html'))return;const before=read(file);if(!/<\/head>/i.test(before))return;checked+=1;const after=install(before);if(after!==before&&write(file,after))changed+=1;});
process.stdout.write(`Six-core-service closure and exact seven-item floating dock order installed in ${checked} pages; refreshed ${changed}.\n`);
