#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const indexFile=path.join(root,'tools','pure-ddz','index.html');

if(!fs.existsSync(indexFile)) throw new Error('Missing tools/pure-ddz/index.html');
let page=fs.readFileSync(indexFile,'utf8');
const before=page;

// Keep the 2026-08-28 elder-friendly release pinned during whole-site materialization.
// V1.2.6 keeps the homepage-aircraft small joker while tightening the desktop safe view,
// widening the visible rank/suit exposure for 17/20-card hands and forcing guidance text white on all layouts.
page=page.replace(/const version='[^']+';/, "const version='20260828-elder-ux-v126';");
page=page.replace(/window.__PURE_DDZ_CACHE_KEY__\|\|'[^']+'/g, "window.__PURE_DDZ_CACHE_KEY__||'20260828-elder-ux-v126'");
page=page.replace(/loadStyle\('css\/card-comfort-v\d+\.css'\)/, "loadStyle('css/card-comfort-v122.css')");

page=page.replace(/<span>企业邮箱<\/span>/g,'<span>官网邮箱</span>');
page=page.replace(/安装包待验证后发布/g,'Android版暂未开放');
page=page.replace(/安装包待验证/g,'Android版暂未开放');
page=page.replace(/Android：待验证后发布/g,'Android：暂未开放下载');

if(!page.includes("const version='20260828-elder-ux-v126';")) throw new Error('DDZ elder UX cache key not updated');
if(!page.includes("window.__PURE_DDZ_CACHE_KEY__||'20260828-elder-ux-v126'")) throw new Error('DDZ fallback cache key not updated');
if(!page.includes("loadStyle('css/card-comfort-v122.css')")) throw new Error('DDZ comfort-scale stylesheet is missing');
if(!page.includes('name="screen-orientation" content="landscape"')) throw new Error('DDZ landscape orientation metadata is missing');
if(!page.includes('__PURE_DDZ_MOBILE_DEVICE__')) throw new Error('DDZ mobile runtime marker is missing');
if(!page.includes('__PURE_DDZ_WECHAT_WEBVIEW__')) throw new Error('DDZ WeChat-webview compatibility marker is missing');
if(!page.includes('__PURE_DDZ_MANAGED_LOADER__')) throw new Error('DDZ deterministic managed-loader marker is missing');
if(page.includes('<span>企业邮箱</span>')) throw new Error('Legacy 企业邮箱 label still exposed');
if(!page.includes('<span>官网邮箱</span>')) throw new Error('官网邮箱 label missing');

if(page!==before){
  fs.writeFileSync(indexFile,page.endsWith('\n')?page:page+'\n');
  console.log('Updated tools/pure-ddz/index.html with elder UX v1.2.6 release');
}else{
  console.log('Pure DDZ elder UX v1.2.6 public UI already current.');
}
