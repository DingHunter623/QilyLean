#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const indexFile=path.join(root,'tools','pure-ddz','index.html');

if(!fs.existsSync(indexFile)) throw new Error('Missing tools/pure-ddz/index.html');
let page=fs.readFileSync(indexFile,'utf8');
const before=page;
const CACHE='20260902-ddz-integrated-v152';

// Pure DDZ is a normal QilyLean public page. Keep one integrated layout authority and one core game runtime.
page=page.replace(/const version='[^']+';/, `const version='${CACHE}';`);
page=page.replace(/window.__PURE_DDZ_CACHE_KEY__\|\|'[^']+'/g, `window.__PURE_DDZ_CACHE_KEY__||'${CACHE}'`);
page=page.replace(/loadStyle\('css\/card-comfort-v\d+\.css'\)/, "loadStyle('css/card-comfort-v122.css')");

// Retire page-level patch stacking. V152 owns the DDZ page layout; old V141 and R8 layout closures must stay unloaded.
page=page.replace(/\s*,?\s*loadStyle\('css\/ddz-playability-v141\.css'\)/g,'');
page=page.replace(/\s*<link[^>]+qilyPureDdzR8ClosureV128[^>]*>\s*/g,'\n');
page=page.replace(/\s*<script[^>]+ddz-site-shell-v140\.js[^>]*><\/script>\s*/g,'\n');

// Core runtime owns narration and auto-pass. Historical observer runtimes are intentionally not loaded.
page=page.replace(
  /const chain=\[[^\]]*\];/,
  "const chain=['js/card-theme.js','js/ai-expert.js','js/game.js','js/visual-v120.js'];"
);

// Screenshot-annotated maintenance copy is not a public module. Keep the internal hint node only as a silent runtime target.
page=page.replace(/\s*<div class="ddz-page-note">[\s\S]*?<\/div>\s*/g,'\n');
page=page.replace(/<p id="hint-message" class="hint-message">[\s\S]*?<\/p>/g,'<p id="hint-message" class="hint-message" aria-hidden="true"></p>');

page=page.replace(/<span>企业邮箱<\/span>/g,'<span>官网邮箱</span>');
page=page.replace(/安装包待验证后发布/g,'Android版暂未开放');
page=page.replace(/安装包待验证/g,'Android版暂未开放');
page=page.replace(/Android：待验证后发布/g,'Android：暂未开放下载');

if(!page.includes(`const version='${CACHE}';`)) throw new Error('DDZ integrated cache key not updated');
if(!page.includes(`window.__PURE_DDZ_CACHE_KEY__||'${CACHE}'`)) throw new Error('DDZ fallback cache key not updated');
if(!page.includes("loadStyle('css/card-comfort-v122.css')")) throw new Error('DDZ comfort stylesheet is missing');
if(!page.includes("loadStyle('css/ddz-site-page-v140.css')")) throw new Error('DDZ integrated site-page stylesheet is missing');
if(page.includes("loadStyle('css/ddz-playability-v141.css')")) throw new Error('Legacy DDZ V141 patch must stay unloaded');
if(page.includes('qilyPureDdzR8ClosureV128')) throw new Error('Legacy DDZ R8 closure must stay unloaded');
if(page.includes('ddz-site-shell-v140.js')) throw new Error('Game-specific site shell adapter must stay unloaded');
if(page.includes('js/qilylean-theme.js')||page.includes('js/elder-assist-v140.js')) throw new Error('Legacy observer runtimes must stay unloaded');
if(!page.includes("const chain=['js/card-theme.js','js/ai-expert.js','js/game.js','js/visual-v120.js'];")) throw new Error('DDZ V152 core runtime chain is missing');
if(!page.includes('/site-navigation.js?')) throw new Error('Canonical QilyLean navigation runtime is missing');
if(!page.includes('/site-dock-share-runtime-v1.js?')) throw new Error('Canonical QilyLean Dock runtime is missing');
if(page.includes('class="ddz-page-note"')) throw new Error('Maintenance page-note must stay removed');
if(!page.includes('<p id="hint-message" class="hint-message" aria-hidden="true"></p>')) throw new Error('Silent hint runtime target is missing');
if(page.includes('<footer class="site-footer">')) throw new Error('Game-specific fixed footer must stay removed');
if(page.includes('name="screen-orientation"')||page.includes('name="x5-orientation"')) throw new Error('DDZ forced-orientation metadata must stay removed');
if(!page.includes('__PURE_DDZ_MOBILE_DEVICE__')) throw new Error('DDZ mobile runtime marker is missing');
if(!page.includes('__PURE_DDZ_WECHAT_WEBVIEW__')) throw new Error('DDZ WeChat-webview compatibility marker is missing');
if(!page.includes('__PURE_DDZ_MANAGED_LOADER__')) throw new Error('DDZ deterministic managed-loader marker is missing');
if(page.includes('<span>企业邮箱</span>')) throw new Error('Legacy 企业邮箱 label still exposed');
if(!page.includes('<span>官网邮箱</span>')) throw new Error('官网邮箱 label missing');

if(page!==before){
  fs.writeFileSync(indexFile,page.endsWith('\n')?page:page+'\n');
  console.log('Updated tools/pure-ddz/index.html with integrated V152 public-page runtime');
}else{
  console.log('Pure DDZ integrated V152 public UI already current.');
}
