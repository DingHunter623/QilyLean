#!/usr/bin/env node
'use strict';

/*
 * QilyLean R2 clean runtime v3｜2026-08-12
 * 目的：
 * 1) 彻底移除全站可见页尾/联系栏脚本及静态 footer；
 * 2) 禁止历史动态正文增强脚本在页面加载后追加 CTA / 区块，避免“按钮先出现、正文后出现”；
 * 3) 首屏采用原子显示：文档 load 后双 RAF 一次性显示，避免局部旧版/未着色模块抢先露出；
 * 4) 统一 R2 / site-navigation / legacy cache 版本，确保浏览器拿到本次修订。
 */

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const VERSION = '20260812-r2-clean-v3';
const R2_CSS = `/site-r2-stability-fixes-v1.css?v=${VERSION}`;
const NAV_JS = `/site-navigation.js?v=${VERSION}`;
const LEGACY_JS = `/site-navigation-legacy-20260802.js?v=${VERSION}`;
const FIRST_START = '<!-- QILY-R2-FIRST-PAINT:START -->';
const FIRST_END = '<!-- QILY-R2-FIRST-PAINT:END -->';

const firstPaint = `${FIRST_START}\n<style id="qilyR2CriticalFirstPaintGuard">html.qily-r2-first-paint-pending{min-height:100%;background:#eef7f5}html.qily-r2-first-paint-pending body{opacity:0!important;visibility:hidden!important;pointer-events:none!important}html.qily-r2-first-paint-pending #floatDock{opacity:0!important;visibility:hidden!important}@media print{html.qily-r2-first-paint-pending body{opacity:1!important;visibility:visible!important;pointer-events:auto!important}}</style><script data-qily-r2-first-paint>(function(d,w){var e=d.documentElement;e.classList.add('qily-r2-first-paint-pending','qily-shell-pending');var done=false;function reveal(){if(done)return;done=true;e.classList.remove('qily-shell-pending','qily-r2-first-paint-pending')}function stableReveal(){w.requestAnimationFrame(function(){w.requestAnimationFrame(reveal)})}w.__qilyLeanRevealCurrentShell=function(){e.classList.remove('qily-shell-pending')};if(d.readyState==='complete')stableReveal();else w.addEventListener('load',stableReveal,{once:true});w.setTimeout(stableReveal,2400)})(document,window);</script>\n${FIRST_END}`;

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
function normalizeVersions(html) {
  return html
    .replace(/\/site-navigation\.js\?v=[^"'\s<]+/g, NAV_JS)
    .replace(/\/site-r2-stability-fixes-v1\.css\?v=[^"'\s<]+/g, R2_CSS);
}
function normalize(html) {
  let out = removeFooterAssets(html);
  out = removeDynamicContentShapers(out);
  out = installFirstPaint(out);
  out = normalizeVersions(out);
  return out;
}
function patchRuntimeSources(){
  let wrapper=read('site-navigation.js');
  wrapper=wrapper.replace(/\/site-navigation-legacy-20260802\.js\?v=[^'"\s]+/g,LEGACY_JS);
  write('site-navigation.js',wrapper);

  let legacy=read('site-navigation-legacy-20260802.js');
  legacy=legacy.replace(/var CORE_SRC = '\/site-navigation-core\.js\?v=[^']+';/,`var CORE_SRC = '/site-navigation-core.js?v=${VERSION}';`);
  write('site-navigation-legacy-20260802.js',legacy);
}
function verify(rel, html) {
  assert(html.includes(FIRST_START), `${rel}: atomic first-paint guard missing`);
  assert(!/site-footer-standard-v28\.(?:css|js)/i.test(html), `${rel}: footer standard asset still referenced`);
  assert(!/<footer\b/i.test(html), `${rel}: visible footer remains`);
  assert(!/(?:site-information-architecture-v1|site-brand-trust-v1|site-trust-conversion-v2|site-visual-closure-v1|site-visual-closure-v2|site-text-contrast-audit-v1)\.js/i.test(html), `${rel}: dynamic content shaper still referenced`);
  if (/site-navigation\.js\?v=/i.test(html)) assert(html.includes(NAV_JS), `${rel}: R2 clean navigation version missing`);
  if (/site-r2-stability-fixes-v1\.css\?v=/i.test(html)) assert(html.includes(R2_CSS), `${rel}: R2 clean CSS version missing`);
}

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

assert(read('site-navigation.js').includes(LEGACY_JS),'site-navigation.js clean legacy cache version missing');
assert(read('site-navigation-legacy-20260802.js').includes(`/site-navigation-core.js?v=${VERSION}`),'legacy runtime clean core cache version missing');
process.stdout.write(`R2 clean runtime v3 checked ${checked} public HTML pages; refreshed ${changed}; footer and dynamic content shapers removed.\n`);
