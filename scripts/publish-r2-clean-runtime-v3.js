#!/usr/bin/env node
'use strict';

/*
 * QilyLean R2 clean runtime v4｜2026-08-15 PERFORMANCE V15
 * 目的：
 * 1) 彻底移除全站可见页尾/联系栏脚本及静态 footer；
 * 2) 禁止历史动态正文增强脚本在页面加载后追加 CTA / 区块；
 * 3) 首屏改为静态 HTML 立即可见，严禁等待 window.load 或 2.4s 超时后再显示；
 * 4) 全站保证 Fast Native Navigation V5：浏览器原生导航 + 同源预取，不做跨页 DOM/CSS 搬运；
 * 5) 导航、父级路由、轻量一致性脚本统一刷新缓存版本，避免继续命中卡顿旧脚本。
 */

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const VERSION = '20260813-r2-clean-v4';
const NAV_VERSION = '20260815-performance-v15';
const PARENT_VERSION = '20260815-performance-v4';
const CONSISTENCY_VERSION = '20260815-performance-v2';
const R2_CSS = `/site-r2-stability-fixes-v1.css?v=${VERSION}`;
const NAV_JS = `/site-navigation.js?v=${NAV_VERSION}`;
const LEGACY_JS = `/site-navigation-legacy-20260802.js?v=${NAV_VERSION}`;
const PARENT_JS = `/site-parent-navigation-v3.js?v=${PARENT_VERSION}`;
const CONSISTENCY_JS = `/site-ui-consistency-v1.js?v=${CONSISTENCY_VERSION}`;
const FAST_NATIVE_JS = '/site-music-persistent-navigation-v1.js?v=20260812-fast-native-v5';
const FIRST_START = '<!-- QILY-R2-FIRST-PAINT:START -->';
const FIRST_END = '<!-- QILY-R2-FIRST-PAINT:END -->';

/*
 * 静态 HTML 已经是正文权威源，不再隐藏 body。
 * 只保留兼容标记，并立即清理历史 pending class，避免白屏/假死感。
 */
const firstPaint = `${FIRST_START}\n<style id="qilyR2CriticalFirstPaintGuard">html.qily-r2-first-paint-pending{min-height:100%;background:#eef7f5}</style><script data-qily-r2-first-paint>(function(d){d.documentElement.classList.remove('qily-shell-pending','qily-r2-first-paint-pending')})(document);</script>\n${FIRST_END}`;

function read(rel){return fs.readFileSync(path.join(root,rel),'utf8');}
function write(rel,content){const file=path.join(root,rel);const out=content.endsWith('\n')?content:`${content}\n`;if(read(rel)===out)return false;fs.writeFileSync(file,out,'utf8');return true;}
function walk(dir, fn) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git','node_modules','.cache'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, fn); else fn(full);
  }
}
function assert(ok, msg) { if (!ok) throw new Error(msg); }
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
function installFirstPaint(html) {
  let out = html
    .replace(/<!-- QILY-R2-FIRST-PAINT:START -->[\s\S]*?<!-- QILY-R2-FIRST-PAINT:END -->\s*/gi, '')
    .replace(/\s*<script\b[^>]*data-qily-r2-first-paint[^>]*>[\s\S]*?<\/script>\s*/gi, '\n')
    .replace(/\s*<style\b[^>]*id=["']qilyR2CriticalFirstPaintGuard["'][^>]*>[\s\S]*?<\/style>\s*/gi, '\n');
  return out.replace(/<head>\s*/i, `<head>\n${firstPaint}\n  `);
}
function ensureFastNative(html) {
  let out = html.replace(/\s*<script\b[^>]*\bsrc=["'][^"']*\/site-music-persistent-navigation-v1\.js(?:\?v=[^"']*)?["'][^>]*>\s*<\/script>\s*/gi, '\n');
  const tag = `  <script defer id="qilyFastNativeNavigationV5" data-qily-fast-native-navigation="v5" src="${FAST_NATIVE_JS}"></script>`;
  return out.replace(/<\/head>/i, `${tag}\n</head>`);
}
function normalizeVersions(html) {
  return html
    .replace(/\/site-navigation\.js\?v=[^"'\s<]+/g, NAV_JS)
    .replace(/\/site-parent-navigation-v3\.js\?v=[^"'\s<]+/g, PARENT_JS)
    .replace(/\/site-r2-stability-fixes-v1\.css\?v=[^"'\s<]+/g, R2_CSS);
}
function normalize(html) {
  let out = removeFooterAssets(html);
  out = removeDynamicContentShapers(out);
  out = installFirstPaint(out);
  out = ensureFastNative(out);
  out = normalizeVersions(out);
  return out;
}
function patchRuntimeSources(){
  let wrapper=read('site-navigation.js');
  wrapper=wrapper.replace(/\/site-navigation-legacy-20260802\.js\?v=[^'"\s]+/g,LEGACY_JS);
  wrapper=wrapper.replace(/\/site-parent-navigation-v3\.js\?v=[^'"\s]+/g,PARENT_JS);
  wrapper=wrapper.replace(/\/site-ui-consistency-v1\.js\?v=[^'"\s]+/g,CONSISTENCY_JS);
  write('site-navigation.js',wrapper);

  let legacy=read('site-navigation-legacy-20260802.js');
  legacy=legacy.replace(/var CORE_SRC = '\/site-navigation-core\.js\?v=[^']+';/,`var CORE_SRC = '/site-navigation-core.js?v=${NAV_VERSION}';`);
  write('site-navigation-legacy-20260802.js',legacy);
}
function verify(rel, html) {
  assert(html.includes(FIRST_START), `${rel}: first-paint compatibility marker missing`);
  const first=(html.match(/<!-- QILY-R2-FIRST-PAINT:START -->[\s\S]*?<!-- QILY-R2-FIRST-PAINT:END -->/)||[])[0]||'';
  assert(first && !/opacity\s*:\s*0|visibility\s*:\s*hidden|pointer-events\s*:\s*none|window\.load|setTimeout\([^,]+,\s*2400/.test(first), `${rel}: blocking first-paint guard returned`);
  assert(html.includes(FAST_NATIVE_JS), `${rel}: Fast Native Navigation V5 missing`);
  assert(!/site-footer-standard-v28\.(?:css|js)/i.test(html), `${rel}: footer standard asset still referenced`);
  assert(!/<footer\b/i.test(html), `${rel}: visible footer remains`);
  assert(!/(?:site-information-architecture-v1|site-brand-trust-v1|site-trust-conversion-v2|site-visual-closure-v1|site-visual-closure-v2|site-text-contrast-audit-v1)\.js/i.test(html), `${rel}: dynamic content shaper still referenced`);
  assert(!/qilyBackgroundMusicPreload/i.test(html), `${rel}: retired background-audio preload remains`);
  if (/site-navigation\.js\?v=/i.test(html)) assert(html.includes(NAV_JS), `${rel}: performance V15 navigation version missing`);
  if (/site-parent-navigation-v3\.js\?v=/i.test(html)) assert(html.includes(PARENT_JS), `${rel}: lightweight parent-navigation cache version missing`);
  if (/site-r2-stability-fixes-v1\.css\?v=/i.test(html)) assert(html.includes(R2_CSS), `${rel}: R2 clean CSS version missing`);
}

const fastNativeSource = read('site-music-persistent-navigation-v1.js');
assert(fastNativeSource.includes("mode:'native-prefetch-v5'"),'Fast Native V5 runtime contract missing');
assert(fastNativeSource.includes('domSwap:false'),'Fast Native V5 must forbid DOM swap');
assert(fastNativeSource.includes('nativeHistory:true') && fastNativeSource.includes('prefetch:true'),'Fast Native V5 native navigation/prefetch contract missing');
assert(!/DOMParser|history\.pushState|document\.body\.innerHTML/i.test(fastNativeSource),'Fast Native V5 contains retired soft-navigation logic');

patchRuntimeSources();
let checked = 0, changed = 0;
walk(root, (file) => {
  if (!file.endsWith('.html')) return;
  const before = fs.readFileSync(file, 'utf8');
  if (!isPublicHtml(before)) return;
  const rel = path.relative(root, file).split(path.sep).join('/');
  checked += 1;
  const after = normalize(before);
  verify(rel, after);
  if (after !== before) {
    fs.writeFileSync(file, after.endsWith('\n') ? after : `${after}\n`, 'utf8');
    changed += 1;
  }
});

assert(read('site-navigation.js').includes(LEGACY_JS),'site-navigation.js performance V15 legacy cache version missing');
assert(read('site-navigation.js').includes(PARENT_JS),'site-navigation.js lightweight parent cache version missing');
assert(read('site-navigation.js').includes(CONSISTENCY_JS),'site-navigation.js lightweight consistency cache version missing');
assert(read('site-navigation-legacy-20260802.js').includes(`/site-navigation-core.js?v=${NAV_VERSION}`),'legacy runtime performance V15 core cache version missing');
process.stdout.write(`R2 clean runtime v4 checked ${checked} public HTML pages; refreshed ${changed}; static first paint is non-blocking; Fast Native V5 guaranteed; performance V15 caches protected; footer and dynamic content shapers removed.\n`);
