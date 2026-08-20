#!/usr/bin/env node
'use strict';

/* QilyLean 悬浮功能模块“分享官网”专项治理｜2026-08-20
 * 处理右侧悬浮 Dock 的“分享官网”按钮：
 * - 文案结构：与其它按钮一致，统一为 分享<br>官网，不再使用独立 span 字号；
 * - 尺寸：与其它悬浮按钮统一 62×62；
 * - 功能：公共外壳直接提供系统分享，同时全站注入分享运行时作为防回退；
 * - 网址：分享输出统一去除末尾斜杠；
 * - 不修改正文中的“官方网址”术语，不触碰业务文案、导航或其它组件。
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CONSISTENCY_VERSION = '20260820-dock-share-functional-v11';
const CORE_SERVICE_VERSION = '20260820-cooperation-dock-v9';
const SHARE_RUNTIME_VERSION = '20260820-dock-share-runtime-v1';
const NAVIGATION_VERSION = '20260820-resource-collab-dock-home-v31';
const DOCK_STYLESHEET_VERSION = '20260819-dock-snapback-v3';
const SHARE_HTML = '分享<br>官网';
const SHARE_RUNTIME_TAG = `<script defer data-qily-dock-share-runtime="v1" src="/site-dock-share-runtime-v1.js?v=${SHARE_RUNTIME_VERSION}"></script>`;
const CRITICAL_STYLE = '<style id="qilyDockCriticalV6">#floatDock [data-action="share"]{width:62px!important;min-width:62px!important;height:62px!important;min-height:62px!important;padding:4px!important;border-radius:50%!important;display:flex!important;align-items:center!important;justify-content:center!important;line-height:1.08!important;white-space:normal!important;overflow:hidden!important;box-sizing:border-box!important}</style>';
const LOCK_SCRIPT = '<script data-qily-dock-firstpaint-lock="v9">(function(d,w){\'use strict\';var h=\'' + SHARE_HTML.replace(/'/g,"\\'") + '\';function f(){var s=d.querySelector(\'#floatDock [data-action="share"]\');if(!s)return;if(s.innerHTML!==h)s.innerHTML=h;if(s.getAttribute(\'aria-label\')!==\'分享官网\')s.setAttribute(\'aria-label\',\'分享官网\');if(s.getAttribute(\'title\')!==\'分享官网\')s.setAttribute(\'title\',\'分享官网\')}f();d.addEventListener(\'qily:shell-ready\',f);w.addEventListener(\'pageshow\',f)})(document,window);</script>';

function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function write(rel, content){
  const file = path.join(ROOT, rel);
  const out = content.endsWith('\n') ? content : content + '\n';
  if (fs.readFileSync(file, 'utf8') === out) return false;
  fs.writeFileSync(file, out, 'utf8');
  return true;
}
function trackedHtml(){
  return execFileSync('git', ['ls-files', '*.html'], {cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024})
    .split(/\r?\n/).filter(Boolean);
}
function isDockPage(html){ return /id=["']floatDock["']|data-action=["']share["']/.test(html); }
function isNavigationPage(html){ return /\/site-navigation\.js(?:\?v=[^"']*)?/.test(html); }
function patchShareButton(html){
  return html.replace(/(<(?:button|a)\b[^>]*data-action=["']share["'][^>]*>)[\s\S]*?(<\/(?:button|a)>)/i, function(all, open, close){
    open = open.replace(/\s+(?:aria-label|title)=["'][^"']*["']/gi, '');
    open = open.replace(/>$/, ' aria-label="分享官网" title="分享官网">');
    return open + SHARE_HTML + close;
  });
}
function patchCriticalStyle(html){
  if (/<style\b[^>]*id=["']qilyDockCriticalV6["'][^>]*>[\s\S]*?<\/style>/i.test(html)) {
    return html.replace(/<style\b[^>]*id=["']qilyDockCriticalV6["'][^>]*>[\s\S]*?<\/style>/i, CRITICAL_STYLE);
  }
  return html;
}
function patchLock(html){
  if (/<script\b[^>]*data-qily-dock-firstpaint-lock=["'][^"']*["'][^>]*>[\s\S]*?<\/script>/i.test(html)) {
    return html.replace(/<script\b[^>]*data-qily-dock-firstpaint-lock=["'][^"']*["'][^>]*>[\s\S]*?<\/script>/i, LOCK_SCRIPT);
  }
  return html;
}
function patchRuntime(html){
  let out = html.replace(/\s*<script\b[^>]*(?:data-qily-dock-share-runtime|src=["'][^"']*\/site-dock-share-runtime-v1\.js(?:\?v=[^"']*)?["'])[^>]*>\s*<\/script>\s*/gi, '\n');
  if (/<\/body>/i.test(out)) return out.replace(/<\/body>/i, '  ' + SHARE_RUNTIME_TAG + '\n</body>');
  if (/<\/html>/i.test(out)) return out.replace(/<\/html>/i, '  ' + SHARE_RUNTIME_TAG + '\n</html>');
  return out + '\n' + SHARE_RUNTIME_TAG + '\n';
}
function patchVersions(html){
  return html
    .replace(/\/site-navigation\.js\?v=[^"'\s<]+/g, '/site-navigation.js?v=' + NAVIGATION_VERSION)
    .replace(/\/site-floating-dock-standard-v1\.css\?v=[^"'\s<]+/g, '/site-floating-dock-standard-v1.css?v=' + DOCK_STYLESHEET_VERSION)
    .replace(/(data-qily-ui-consistency=)["'][^"']*["']/gi, '$1"dock-share-functional-v11"')
    .replace(/\/site-ui-consistency-v1\.js\?v=[^"'\s<]+/g, '/site-ui-consistency-v1.js?v=' + CONSISTENCY_VERSION)
    .replace(/(data-qily-core-service-dock-closure=)["'][^"']*["']/gi, '$1"v9"')
    .replace(/\/site-core-service-dock-closure-v1\.js\?v=[^"'\s<]+/g, '/site-core-service-dock-closure-v1.js?v=' + CORE_SERVICE_VERSION);
}
function validate(rel, html){
  if (isNavigationPage(html) && !html.includes('/site-navigation.js?v=' + NAVIGATION_VERSION)) {
    throw new Error(rel + ': 公共导航仍使用旧缓存版本');
  }
  if (!isDockPage(html)) return;
  const share = (html.match(/<(?:button|a)\b[^>]*data-action=["']share["'][^>]*>[\s\S]*?<\/(?:button|a)>/i) || [])[0] || '';
  if (share) {
    if (!/分享\s*<br\s*\/?>\s*官网/i.test(share)) throw new Error(rel + ': 分享官网未使用统一两行按钮结构');
    if (/qily-share-label-line/.test(share)) throw new Error(rel + ': 分享官网仍使用独立 span 字号结构');
    if (/官方网址/.test(share)) throw new Error(rel + ': 悬浮分享按钮仍残留“官方网址”');
    if (!/aria-label=["']分享官网["']/.test(share) || !/title=["']分享官网["']/.test(share)) throw new Error(rel + ': 分享官网无障碍/提示文案未同步');
  }
  const critical = (html.match(/<style\b[^>]*id=["']qilyDockCriticalV6["'][^>]*>[\s\S]*?<\/style>/i) || [])[0] || '';
  if (critical) {
    if (!critical.includes('width:62px!important') || !critical.includes('height:62px!important')) throw new Error(rel + ': 分享官网按钮未统一为62×62');
    if (/qily-share-label-line|font-size:18px!important/.test(critical)) throw new Error(rel + ': 分享官网仍存在独立字号覆盖');
    if (/width:7[26]px!important|height:7[26]px!important/.test(critical)) throw new Error(rel + ': 仍存在放大的72/76px分享按钮');
  }
  if (!/site-dock-share-runtime-v1\.js\?v=20260820-dock-share-runtime-v1/.test(html)) throw new Error(rel + ': 未注入分享官网功能运行时');
}

let checked = 0, changed = 0;
for (const rel of trackedHtml()) {
  let html;
  try { html = read(rel); } catch (_) { continue; }
  if (!isDockPage(html) && !isNavigationPage(html)) continue;
  checked += 1;
  let out = html;
  if (isDockPage(out)) {
    out = patchShareButton(out);
    out = patchCriticalStyle(out);
    out = patchLock(out);
    out = patchRuntime(out);
  }
  out = patchVersions(out);
  validate(rel, out);
  if (out !== html && write(rel, out)) changed += 1;
}
if (!checked) throw new Error('未发现悬浮Dock页面');
process.stdout.write(`PASS: 公共导航缓存与悬浮“分享官网”功能/字体统一整改 ${changed}/${checked} 个页面；分享输出为无末尾斜杠纯网址。\n`);
