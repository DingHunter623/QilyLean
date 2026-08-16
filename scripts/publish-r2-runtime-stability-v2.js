#!/usr/bin/env node
'use strict';

/* QilyLean R2 runtime stability materializer v2｜2026-08-12 */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const VERSION = '20260812-r2-stability-v1';
const CONTACT_VERSION = '20260814-contact-v13';
const R2_CSS = `/site-r2-stability-fixes-v1.css?v=${VERSION}`;
const NATIVE_NAV = '/site-music-persistent-navigation-v1.js?v=20260812-fast-native-v5';
const HERO_CONTRAST = '/site-hero-primary-contrast-v1.css?v=20260804-hero-primary-contrast-v1';
const ROUTES = [
  ['首页','/'],['能力体系','/capabilities/'],['代表项目','/projects/'],['改善方法','/improvements/'],
  ['知识资产','/knowledge/'],['履历主线','/experience/'],['项目合作','/cooperation/'],['信任中心','/trust/']
];

const FIRST_START='<!-- QILY-R2-FIRST-PAINT:START -->';
const FIRST_END='<!-- QILY-R2-FIRST-PAINT:END -->';
const NAV_START='<!-- QILY-R2-PRIMARY-CONTRAST-NAV:START -->';
const NAV_END='<!-- QILY-R2-PRIMARY-CONTRAST-NAV:END -->';
const firstPaint=`${FIRST_START}\n<style id="qilyR2CriticalFirstPaintGuard">html.qily-r2-first-paint-pending{min-height:100%;background:#eef7f5}html.qily-r2-first-paint-pending body{visibility:hidden!important}@media print{html.qily-r2-first-paint-pending body{visibility:visible!important}}</style><script data-qily-r2-first-paint>(function(d,w){var e=d.documentElement;e.classList.add('qily-r2-first-paint-pending','qily-shell-pending');var done=false;function shellReady(){e.classList.remove('qily-shell-pending')}function reveal(){if(done)return;done=true;shellReady();e.classList.remove('qily-r2-first-paint-pending')}w.__qilyLeanRevealCurrentShell=shellReady;function afterDom(){w.requestAnimationFrame(function(){w.requestAnimationFrame(reveal)})}if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',afterDom,{once:true});else afterDom();w.setTimeout(reveal,1500)})(document,window);</script>\n${FIRST_END}`;
const interaction=`${NAV_START}\n  <link id="qilyHeroPrimaryContrastStylesheet" rel="stylesheet" href="${HERO_CONTRAST}">\n  <script defer id="qilyPersistentMusicNavigationScript" data-qily-persistent-music-navigation="v5" src="${NATIVE_NAV}"></script>\n${NAV_END}`;

function read(rel){return fs.readFileSync(path.join(root,rel),'utf8');}
function write(rel,content){const file=path.join(root,rel);const out=content.endsWith('\n')?content:`${content}\n`;if(read(rel)===out)return false;fs.writeFileSync(file,out,'utf8');return true;}
function assert(ok,msg){if(!ok)throw new Error(msg);}
function walk(dir,fn){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(['.git','node_modules','.cache'].includes(e.name))continue;const full=path.join(dir,e.name);e.isDirectory()?walk(full,fn):fn(full);}}

function routeFor(rel){
  rel=rel.replace(/\\/g,'/');
  if(rel==='index.html')return '/';
  if(rel.startsWith('capabilities/'))return '/capabilities/';
  if(rel.startsWith('projects/'))return '/projects/';
  if(rel.startsWith('improvements/'))return '/improvements/';
  if(rel.startsWith('knowledge/')||rel.startsWith('qilylean/daily/')||rel==='qilylean/daily-insights.html')return '/knowledge/';
  if(rel.startsWith('experience/'))return '/experience/';
  if(rel.startsWith('cooperation/'))return '/cooperation/';
  if(rel.startsWith('trust/'))return '/trust/';
  return '';
}
function navMarkup(rel){
  const current=routeFor(rel);
  const pageLocalCurrent=rel==='index.html'||rel==='projects/index.html';
  return ROUTES.map(([label,href])=>{
    const active=href===current;
    const attrs=active?` aria-current="page"${pageLocalCurrent?' data-qily-page-current="true" data-qily-primary-current="true"':''}`:'';
    return `      <a href="${href}"${attrs}>${label}</a>`;
  }).join('\n');
}
function normalizeNav(html,rel){
  return html.replace(/<nav\b([^>]*)>([\s\S]*?)<\/nav>/gi,(whole,attrs,inner)=>{
    const m=attrs.match(/\bclass=["']([^"']*)["']/i);const cls=m?m[1]:'';
    const primary=/(?:^|\s)(?:qily-global-nav|site-nav)(?:\s|$)/.test(cls);
    const hits=['/capabilities/','/projects/','/improvements/','/knowledge/','/experience/','/cooperation/'].filter(h=>inner.includes(h)).length;
    if(!primary&&hits<4)return whole;
    let a=attrs;
    a=/\baria-label=["'][^"']*["']/i.test(a)?a.replace(/\baria-label=["'][^"']*["']/i,'aria-label="QilyLean核心导视"'):`${a} aria-label="QilyLean核心导视"`;
    return `<nav${a}>\n${navMarkup(rel)}\n    </nav>`;
  });
}
function normalizeHtml(html,rel){
  let out=html
    .replace(/<!-- QILY-R2-FIRST-PAINT:START -->[\s\S]*?<!-- QILY-R2-FIRST-PAINT:END -->\s*/gi,'')
    .replace(/<!-- QILY-FIRST-PAINT-GUARD:START -->[\s\S]*?<!-- QILY-FIRST-PAINT-GUARD:END -->\s*/gi,'')
    .replace(/\s*<script\b[^>]*data-qily-shell-bootstrap[^>]*>[\s\S]*?<\/script>\s*/gi,'\n')
    .replace(/\s*<script\b[^>]*data-qily-r2-first-paint[^>]*>[\s\S]*?<\/script>\s*/gi,'\n')
    .replace(/\s*<style\b[^>]*id=["']qilyR2CriticalFirstPaintGuard["'][^>]*>[\s\S]*?<\/style>\s*/gi,'\n')
    .replace(/<!-- QILY-PRIMARY-CONTRAST-MUSIC:START -->[\s\S]*?<!-- QILY-PRIMARY-CONTRAST-MUSIC:END -->\s*/gi,'')
    .replace(/<!-- QILY-R2-PRIMARY-CONTRAST-NAV:START -->[\s\S]*?<!-- QILY-R2-PRIMARY-CONTRAST-NAV:END -->\s*/gi,'')
    .replace(/^[ \t]*<script\b[^>]*(?:id=["']qilyBackgroundMusicScript["']|data-qily-background-music=["'][^"']+["']|src=["'][^"']*\/homepage-music(?:-v5)?\.js(?:\?v=[^"']*)?["'])[^>]*>\s*<\/script>\s*/gmi,'')
    .replace(/^[ \t]*<script\b[^>]*(?:id=["']qilyPersistentMusicNavigationScript["']|data-qily-persistent-music-navigation=["'][^"']+["']|src=["'][^"']*\/site-music-persistent-navigation-v1\.js(?:\?v=[^"']*)?["'])[^>]*>\s*<\/script>\s*/gmi,'')
    .replace(/^[ \t]*<link\b[^>]*(?:id=["']qilyHeroPrimaryContrastStylesheet["']|href=["'][^"']*\/site-hero-primary-contrast-v1\.css(?:\?v=[^"']*)?["'])[^>]*>\s*/gmi,'')
    .replace(/\s*<link\b[^>]*(?:id=["']qilyR2RuntimeStabilityStylesheet["']|href=["'][^"']*\/site-r2-stability-fixes-v1\.css(?:\?v=[^"']*)?["'])[^>]*>\s*/gi,'\n')
    .replace(/\/site-shell\.css\?v=[^"'\s<]+/g,`/site-shell.css?v=${CONTACT_VERSION}`)
    .replace(/\/site-navigation\.js\?v=[^"'\s<]+/g,`/site-navigation.js?v=${CONTACT_VERSION}`);
  out=out.replace(/<head>\s*/i,`<head>\n${firstPaint}\n  `);
  const r2Tag=`  <link id="qilyR2RuntimeStabilityStylesheet" rel="stylesheet" href="${R2_CSS}">`;
  if(/<link\b[^>]*id=["']qilyViContrastRestorationStylesheet["'][^>]*>/i.test(out))out=out.replace(/(<link\b[^>]*id=["']qilyViContrastRestorationStylesheet["'][^>]*>)/i,`$1\n${r2Tag}`);
  else out=out.replace(/<\/head>/i,`${r2Tag}\n</head>`);
  out=normalizeNav(out,rel);
  out=out.replace(/<\/head>/i,`${interaction}\n</head>`);
  return out;
}

function patchCore(){
  let s=read('site-navigation-core.js');
  const routes=`  var routes = [\n${ROUTES.map(([l,h])=>`    ['${l}', '${h}']`).join(',\n')}\n  ];`;
  s=s.replace(/  var routes = \[[\s\S]*?\n  \];/,routes)
    .replace(/var SHARED_ASSET_VERSION = '[^']+';/,`var SHARED_ASSET_VERSION = '${CONTACT_VERSION}';`)
    .replace(/20260729-fluid-copy-v5/g,'20260810-content-axis-v8');
  const removeCalls=[
    ['addStylesheet();','// R2 static-first: shell CSS already materialized.'],
    ['addVisualScaleStylesheet();','// R2 static-first: visual scale already materialized.'],
    ['addWideLayoutStylesheet();','// R2 static-first: wide layout already materialized.'],
    ['addGlobalHeaderStyles();','// R2 static-first: header styles already materialized.'],
    ['addTypographyStylesheet();','// R2 static-first: typography already materialized.'],
    ['ensureGlobalContactFooter();','// R2: no repeated global contact footer on ordinary pages.'],
    ['ensureKnowledgeDocumentEnhancements();','// R2: no repeated document contact/email tail.'],
    ['enableNavigationPrefetch();','// R2: Fast Native Navigation V5 owns prefetch.']
  ];
  for(const [call,comment] of removeCalls)s=s.replace(new RegExp(`^\\s{6}${call.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\s*$`,'m'),`      ${comment}`);
  s=s.replace(/^\s{6}buildNavigation\(\);\s*$/m,"      if (!document.querySelector('header.qily-site-header .qily-global-nav,header.qily-global-header .qily-global-nav')) buildNavigation();");
  write('site-navigation-core.js',s);
}
function patchLegacy(){
  let s=read('site-navigation-legacy-20260802.js');
  s=s.replace(/var CORE_SRC = '\/site-navigation-core\.js\?v=[^']+';/,`var CORE_SRC = '/site-navigation-core.js?v=${CONTACT_VERSION}';`)
    .replace(/\n\s*ensureFriendLinksNavigation\(\);/g,'')
    .replace(/  function observeShell\(\) \{[\s\S]*?\n  \}\n\n  var existing =/,"  function observeShell() {\n    // R2: deterministic one-pass enhancement; no mutation-loop rewrites.\n    applyFixes();\n  }\n\n  var existing =");
  write('site-navigation-legacy-20260802.js',s);
}
function patchWrapper(){let s=read('site-navigation.js').replace(/\/site-navigation-legacy-20260802\.js\?v=[^'"\s]+/g,`/site-navigation-legacy-20260802.js?v=${CONTACT_VERSION}`);write('site-navigation.js',s);}

function verifyKey(rel){
  const h=read(rel);
  assert(h.includes(FIRST_START),`${rel}: R2 first-paint guard missing`);
  assert(h.includes(R2_CSS),`${rel}: R2 CSS missing`);
  assert(h.includes(NATIVE_NAV),`${rel}: native navigation V5 missing`);
  assert(!/<script\b[^>]*src=["'][^"']*\/homepage-music(?:-v5)?\.js/i.test(h),`${rel}: background music script returned`);
}

function main(){
  assert(fs.existsSync(path.join(root,'site-r2-stability-fixes-v1.css')),'site-r2-stability-fixes-v1.css missing');
  patchCore();patchLegacy();patchWrapper();
  let checked=0,changed=0;
  walk(root,file=>{
    if(!file.endsWith('.html'))return;
    const rel=path.relative(root,file).split(path.sep).join('/');
    const before=fs.readFileSync(file,'utf8');
    if(!/<head>/i.test(before)||!/<\/head>/i.test(before)||!/<body\b/i.test(before))return;
    if(!/site-navigation\.js\?v=|qily-global-nav|site-nav|site-music-persistent-navigation-v1\.js/i.test(before))return;
    checked++;const after=normalizeHtml(before,rel);
    if(after!==before){fs.writeFileSync(file,after.endsWith('\n')?after:`${after}\n`,'utf8');changed++;}
  });
  ['index.html','ai.html','capabilities/index.html','projects/index.html','improvements/index.html','knowledge/index.html','experience/index.html','cooperation/index.html','trust/index.html'].forEach(rel=>{if(fs.existsSync(path.join(root,rel)))verifyKey(rel);});
  const core=read('site-navigation-core.js'),legacy=read('site-navigation-legacy-20260802.js');
  assert(core.includes("['能力体系', '/capabilities/']")&&core.includes("['信任中心', '/trust/']"),'navigation core R2 routes missing');
  assert(!/^\s{6}ensureGlobalContactFooter\(\);\s*$/m.test(core),'obsolete global contact footer call remains');
  assert(!/^\s{6}ensureKnowledgeDocumentEnhancements\(\);\s*$/m.test(core),'obsolete document tail call remains');
  assert(!/function applyFixes\(\)[\s\S]{0,220}ensureFriendLinksNavigation\(\)/.test(legacy),'legacy primary-nav friend-link injection remains');
  process.stdout.write(`R2 runtime stability v2 materialized ${checked} public pages; refreshed ${changed}; contact cache ${CONTACT_VERSION}.\n`);
}
main();
