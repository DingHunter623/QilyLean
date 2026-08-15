#!/usr/bin/env node
'use strict';

/*
 * QilyLean R2 clean runtime v5｜2026-08-15 PERFORMANCE V16
 * 目的：
 * 1) 静态 HTML 立即可见，不等待 window.load；
 * 2) 普通页面仅加载轻量 core，合作/资源页面才按需加载 legacy；
 * 3) Fast Native V6 单一预取机制，最多空闲预热3个页面，不做重复 fetch；
 * 4) 七个全站基础 CSS 在构建期按原顺序合并，减少阻塞请求且不改变级联顺序；
 * 5) 首张图片保持首屏策略，其余图片默认 lazy + async decoding；
 * 6) 移除页面直接加载的 parent-navigation，统一由轻量 consistency 处理返回上一层。
 */

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const VERSION = '20260813-r2-clean-v4';
const NAV_VERSION = '20260815-performance-v16';
const CONSISTENCY_VERSION = '20260815-performance-v2';
const CORE_CSS_VERSION = '20260815-core-visual-v1';
const R2_CSS = `/site-r2-stability-fixes-v1.css?v=${VERSION}`;
const NAV_JS = `/site-navigation.js?v=${NAV_VERSION}`;
const LEGACY_JS = `/site-navigation-legacy-20260802.js?v=${NAV_VERSION}`;
const CORE_JS = `/site-navigation-core.js?v=${NAV_VERSION}`;
const CONSISTENCY_JS = `/site-ui-consistency-v1.js?v=${CONSISTENCY_VERSION}`;
const FAST_NATIVE_JS = '/site-music-persistent-navigation-v1.js?v=20260815-prefetch-v6';
const CORE_CSS_BUNDLE = `/site-core-visual-bundle-v1.css?v=${CORE_CSS_VERSION}`;
const CORE_CSS_FILES = [
  'site-shell.css',
  'site-visual-scale-v1.css',
  'site-wide-layout-v1.css',
  'site-typography-v1.css',
  'site-vi-standard-v1.css',
  'site-vi-contrast-restoration-v1.css',
  'site-r2-stability-fixes-v1.css'
];
const FIRST_START = '<!-- QILY-R2-FIRST-PAINT:START -->';
const FIRST_END = '<!-- QILY-R2-FIRST-PAINT:END -->';
const firstPaint = `${FIRST_START}\n<style id="qilyR2CriticalFirstPaintGuard">html.qily-r2-first-paint-pending{min-height:100%;background:#eef7f5}</style><script data-qily-r2-first-paint>(function(d){d.documentElement.classList.remove('qily-shell-pending','qily-r2-first-paint-pending')})(document);</script>\n${FIRST_END}`;

function read(rel){return fs.readFileSync(path.join(root,rel),'utf8');}
function write(rel,content){
  const file=path.join(root,rel);
  const out=content.endsWith('\n')?content:`${content}\n`;
  if(fs.existsSync(file)&&fs.readFileSync(file,'utf8')===out)return false;
  fs.writeFileSync(file,out,'utf8');
  return true;
}
function walk(dir, fn) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git','node_modules','.cache'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, fn); else fn(full);
  }
}
function assert(ok, msg) { if (!ok) throw new Error(msg); }
function escapeRe(value){return value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function isPublicHtml(html) {
  return /<html\b/i.test(html) && /<body\b/i.test(html) && /(?:site-navigation\.js|qily-global-nav|site-nav|site-parent-navigation-v3\.js)/i.test(html);
}
function removeFooterAssets(html) {
  return html
    .replace(/^[ \t]*<link\b[^>]*(?:id=["']qilyFooterStandardV28Stylesheet["']|href=["'][^"']*\/site-footer-standard-v28\.css(?:\?v=[^"']*)?["'])[^>]*>\s*/gmi, '')
    .replace(/^[ \t]*<script\b[^>]*(?:id=["']qilyFooterStandardV28Script["']|data-qily-footer-standard=["'][^"']+["']|src=["'][^"']*\/site-footer-standard-v28\.js(?:\?v=[^"']*)?["'])[^>]*>\s*<\/script>\s*/gmi, '')
    .replace(/<footer\b[^>]*>[\s\S]*?<\/footer>\s*/gi, '')
    .replace(/<div\b[^>]*(?:id=["']qilyGlobalContactFooter["']|class=["'][^"']*(?:qily-global-contact-footer|qily-global-contact-footer-shell|qtc-global-trust-footer)[^"']*["'])[^>]*>[\s\S]*?<\/div>\s*/gi, '');
}
function removeDynamicContentShapers(html) {
  return html.replace(/<script\b[^>]*\bsrc=["'][^"']*\/(?:site-information-architecture-v1|site-brand-trust-v1|site-trust-conversion-v2|site-visual-closure-v1|site-visual-closure-v2|site-text-contrast-audit-v1)\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>\s*/gi, '');
}
function removeParentNavigationScript(html){
  return html.replace(/\s*<script\b[^>]*\bsrc=["'][^"']*\/site-parent-navigation-v3\.js(?:\?v=[^"']*)?["'][^>]*>\s*<\/script>\s*/gi,'\n');
}
function installFirstPaint(html) {
  let out = html
    .replace(/<!-- QILY-R2-FIRST-PAINT:START -->[\s\S]*?<!-- QILY-R2-FIRST-PAINT:END -->\s*/gi, '')
    .replace(/\s*<script\b[^>]*data-qily-r2-first-paint[^>]*>[\s\S]*?<\/script>\s*/gi, '\n')
    .replace(/\s*<style\b[^>]*id=["']qilyR2CriticalFirstPaintGuard["'][^>]*>[\s\S]*?<\/style>\s*/gi, '\n');
  return out.replace(/<head>\s*/i, `<head>\n${firstPaint}\n  `);
}
function ensureFastNative(html) {
  let out = html.replace(/\s*<script\b[^>]*\bsrc=["'][^"']*\/site-music-persistent-navigation-v1\.js(?:\?v=[^"']*)?["'][^>]*>\s*<\/script>\s*/gi, '\n');
  const tag = `  <script defer id="qilyFastNativeNavigationV6" data-qily-fast-native-navigation="v6" src="${FAST_NATIVE_JS}"></script>`;
  return out.replace(/<\/head>/i, `${tag}\n</head>`);
}
function materializeCoreCssBundle(){
  const parts=CORE_CSS_FILES.map((file)=>{
    assert(fs.existsSync(path.join(root,file)),`core CSS source missing: ${file}`);
    const body=read(file).replace(/^\uFEFF/,'').replace(/^\s*@charset\s+[^;]+;\s*/i,'');
    return `/* QILY-CORE-CSS:${file} */\n${body.trim()}\n`;
  });
  write('site-core-visual-bundle-v1.css',`/* QilyLean core visual bundle v1｜${CORE_CSS_VERSION}\n * 构建期按既有顺序合并，不改任何选择器与声明。\n */\n${parts.join('\n')}`);
}
function installCoreCssBundle(html){
  if(html.includes('/site-core-visual-bundle-v1.css'))return html.replace(/\/site-core-visual-bundle-v1\.css\?v=[^"'\s<]+/g,CORE_CSS_BUNDLE);
  const matches=[];
  for(const file of CORE_CSS_FILES){
    const re=new RegExp(`<link\\b[^>]*href=["'][^"']*\\/${escapeRe(file)}(?:\\?[^"']*)?["'][^>]*>`,'i');
    const m=re.exec(html);
    if(!m)return html;
    matches.push({start:m.index,end:m.index+m[0].length});
  }
  for(let i=1;i<matches.length;i++){
    if(matches[i].start<matches[i-1].end)return html;
    if(!/^\s*$/.test(html.slice(matches[i-1].end,matches[i].start)))return html;
  }
  const tag=`<link id="qilyCoreVisualBundleV1" rel="stylesheet" href="${CORE_CSS_BUNDLE}">`;
  return html.slice(0,matches[0].start)+tag+html.slice(matches[matches.length-1].end);
}
function optimizeImages(html){
  let index=0;
  return html.replace(/<img\b[^>]*>/gi,function(tag){
    index+=1;
    let out=tag;
    const high=/fetchpriority=["']high["']/i.test(out)||/loading=["']eager["']/i.test(out);
    if(!/\bdecoding=/i.test(out))out=out.replace(/\s*\/?>(?=$)/,function(end){return ` decoding="async"${end}`;});
    if(index>1&&!high&&!/\bloading=/i.test(out))out=out.replace(/\s*\/?>(?=$)/,function(end){return ` loading="lazy"${end}`;});
    return out;
  });
}
function normalizeVersions(html) {
  return html
    .replace(/\/site-navigation\.js\?v=[^"'\s<]+/g, NAV_JS)
    .replace(/\/site-r2-stability-fixes-v1\.css\?v=[^"'\s<]+/g, R2_CSS);
}
function normalize(html) {
  let out = removeFooterAssets(html);
  out = removeDynamicContentShapers(out);
  out = removeParentNavigationScript(out);
  out = installFirstPaint(out);
  out = ensureFastNative(out);
  out = normalizeVersions(out);
  out = installCoreCssBundle(out);
  out = optimizeImages(out);
  return out;
}
function patchRuntimeSources(){
  let wrapper=read('site-navigation.js');
  wrapper=wrapper.replace(/\/site-navigation-legacy-20260802\.js\?v=[^'"\s]+/g,LEGACY_JS);
  wrapper=wrapper.replace(/\/site-navigation-core\.js\?v=[^'"\s]+/g,CORE_JS);
  wrapper=wrapper.replace(/\/site-ui-consistency-v1\.js\?v=[^'"\s]+/g,CONSISTENCY_JS);
  write('site-navigation.js',wrapper);

  let legacy=read('site-navigation-legacy-20260802.js');
  legacy=legacy.replace(/var CORE_SRC = '\/site-navigation-core\.js\?v=[^']+';/,`var CORE_SRC = '${CORE_JS}';`);
  write('site-navigation-legacy-20260802.js',legacy);
}
function verify(rel, html) {
  assert(html.includes(FIRST_START), `${rel}: first-paint compatibility marker missing`);
  const first=(html.match(/<!-- QILY-R2-FIRST-PAINT:START -->[\s\S]*?<!-- QILY-R2-FIRST-PAINT:END -->/)||[])[0]||'';
  assert(first && !/opacity\s*:\s*0|visibility\s*:\s*hidden|pointer-events\s*:\s*none|window\.load|setTimeout\([^,]+,\s*2400/.test(first), `${rel}: blocking first-paint guard returned`);
  assert(html.includes(FAST_NATIVE_JS), `${rel}: Fast Native Navigation V6 missing`);
  assert(!/site-parent-navigation-v3\.js/i.test(html), `${rel}: redundant parent-navigation request returned`);
  assert(!/site-footer-standard-v28\.(?:css|js)/i.test(html), `${rel}: footer standard asset still referenced`);
  assert(!/<footer\b/i.test(html), `${rel}: visible footer remains`);
  assert(!/(?:site-information-architecture-v1|site-brand-trust-v1|site-trust-conversion-v2|site-visual-closure-v1|site-visual-closure-v2|site-text-contrast-audit-v1)\.js/i.test(html), `${rel}: dynamic content shaper still referenced`);
  assert(!/qilyBackgroundMusicPreload/i.test(html), `${rel}: retired background-audio preload remains`);
  if (/site-navigation\.js\?v=/i.test(html)) assert(html.includes(NAV_JS), `${rel}: performance V16 navigation version missing`);
}

materializeCoreCssBundle();
const fastNativeSource = read('site-music-persistent-navigation-v1.js');
assert(fastNativeSource.includes("mode:'native-prefetch-v6'"),'Fast Native V6 runtime contract missing');
assert(fastNativeSource.includes('prefetchBudget:3'),'Fast Native V6 prefetch budget missing');
assert(fastNativeSource.includes('duplicateFetch:false'),'Fast Native V6 duplicate-fetch guard missing');
assert(!/\bfetch\s*\(/.test(fastNativeSource),'Fast Native V6 must not issue duplicate fetch requests');
assert(fastNativeSource.includes('domSwap:false'),'Fast Native V6 must forbid DOM swap');
assert(!/DOMParser|history\.pushState|document\.body\.innerHTML/i.test(fastNativeSource),'Fast Native V6 contains retired soft-navigation logic');

patchRuntimeSources();
let checked = 0, changed = 0, bundled = 0, lazyImages = 0;
walk(root, (file) => {
  if (!file.endsWith('.html')) return;
  const before = fs.readFileSync(file, 'utf8');
  if (!isPublicHtml(before)) return;
  const rel = path.relative(root, file).split(path.sep).join('/');
  checked += 1;
  const beforeLazy=(before.match(/loading=["']lazy["']/gi)||[]).length;
  const after = normalize(before);
  if(after.includes('/site-core-visual-bundle-v1.css'))bundled+=1;
  lazyImages += Math.max(0,(after.match(/loading=["']lazy["']/gi)||[]).length-beforeLazy);
  verify(rel, after);
  if (after !== before) {
    fs.writeFileSync(file, after.endsWith('\n') ? after : `${after}\n`, 'utf8');
    changed += 1;
  }
});

assert(read('site-navigation.js').includes(LEGACY_JS),'site-navigation.js performance V16 legacy cache version missing');
assert(read('site-navigation.js').includes(CORE_JS),'site-navigation.js performance V16 direct-core cache version missing');
assert(read('site-navigation.js').includes(CONSISTENCY_JS),'site-navigation.js lightweight consistency cache version missing');
assert(read('site-navigation.js').includes('needsLegacyRuntime'),'site-navigation.js route-scoped legacy selector missing');
assert(read('site-navigation-legacy-20260802.js').includes(`var CORE_SRC = '${CORE_JS}';`),'legacy runtime performance V16 core cache version missing');
process.stdout.write(`R2 clean runtime v5 checked ${checked} public HTML pages; refreshed ${changed}; bundled core CSS on ${bundled}; added ${lazyImages} lazy image hints; Fast Native V6 budget=3; ordinary pages direct-core; parent runtime request removed.\n`);
