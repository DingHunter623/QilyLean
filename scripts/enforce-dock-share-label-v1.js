#!/usr/bin/env node
'use strict';

/* QilyLean 悬浮功能模块“分享官网”专项治理｜2026-08-19
 * 仅处理右侧悬浮 Dock 的“分享官网”按钮：
 * - 文案：分享官网（视觉分两行：分享 / 官网）
 * - 尺寸：与其它悬浮按钮统一 62×62，不再因长文案放大为 72/76px
 * - 不修改正文中的“官方网址”术语，不触碰业务文案、导航或其它组件。
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CONSISTENCY_VERSION = '20260819-dock-share-site-v9';
const CORE_SERVICE_VERSION = '20260819-cooperation-dock-v8';
const SHARE_HTML = '<span class="qily-share-label-line qily-share-label-primary">分享</span><span class="qily-share-label-line qily-share-label-url">官网</span>';
const CRITICAL_STYLE = '<style id="qilyDockCriticalV6">#floatDock [data-action="share"]{width:62px!important;min-width:62px!important;height:62px!important;min-height:62px!important;padding:4px!important;border-radius:50%!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:0!important;line-height:1!important;white-space:nowrap!important;overflow:hidden!important;box-sizing:border-box!important}#floatDock [data-action="share"] .qily-share-label-line{display:block!important;margin:0!important;padding:0!important;white-space:nowrap!important;text-align:center!important;font-size:18px!important;line-height:1.08!important;letter-spacing:0!important}</style>';
const LOCK_SCRIPT = '<script data-qily-dock-firstpaint-lock="v8">(function(d,w){\'use strict\';var h=\'' + SHARE_HTML.replace(/'/g,"\\'") + '\';function f(){var s=d.querySelector(\'#floatDock [data-action="share"]\');if(!s)return;if(s.innerHTML!==h)s.innerHTML=h;if(s.getAttribute(\'aria-label\')!==\'分享官网\')s.setAttribute(\'aria-label\',\'分享官网\');if(s.getAttribute(\'title\')!==\'分享官网\')s.setAttribute(\'title\',\'分享官网\')}f();d.addEventListener(\'qily:shell-ready\',f);w.addEventListener(\'pageshow\',f)})(document,window);</script>';

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
function patchVersions(html){
  return html
    .replace(/(data-qily-ui-consistency=)["'][^"']*["']/gi, '$1"dock-share-site-v9"')
    .replace(/\/site-ui-consistency-v1\.js\?v=[^"'\s<]+/g, '/site-ui-consistency-v1.js?v=' + CONSISTENCY_VERSION)
    .replace(/(data-qily-core-service-dock-closure=)["'][^"']*["']/gi, '$1"v8"')
    .replace(/\/site-core-service-dock-closure-v1\.js\?v=[^"'\s<]+/g, '/site-core-service-dock-closure-v1.js?v=' + CORE_SERVICE_VERSION);
}
function validate(rel, html){
  const share = (html.match(/<(?:button|a)\b[^>]*data-action=["']share["'][^>]*>[\s\S]*?<\/(?:button|a)>/i) || [])[0] || '';
  if (share) {
    if (!share.includes('>官网</span>')) throw new Error(rel + ': 分享官网可视文案未落地');
    if (/官方网址/.test(share)) throw new Error(rel + ': 悬浮分享按钮仍残留“官方网址”');
    if (!/aria-label=["']分享官网["']/.test(share) || !/title=["']分享官网["']/.test(share)) throw new Error(rel + ': 分享官网无障碍/提示文案未同步');
  }
  const critical = (html.match(/<style\b[^>]*id=["']qilyDockCriticalV6["'][^>]*>[\s\S]*?<\/style>/i) || [])[0] || '';
  if (critical) {
    if (!critical.includes('width:62px!important') || !critical.includes('height:62px!important')) throw new Error(rel + ': 分享官网按钮未统一为62×62');
    if (/width:7[26]px!important|height:7[26]px!important/.test(critical)) throw new Error(rel + ': 仍存在放大的72/76px分享按钮');
  }
}

let checked = 0, changed = 0;
for (const rel of trackedHtml()) {
  let html;
  try { html = read(rel); } catch (_) { continue; }
  if (!isDockPage(html)) continue;
  checked += 1;
  let out = patchShareButton(html);
  out = patchCriticalStyle(out);
  out = patchLock(out);
  out = patchVersions(out);
  validate(rel, out);
  if (out !== html && write(rel, out)) changed += 1;
}
if (!checked) throw new Error('未发现悬浮Dock页面');
process.stdout.write(`PASS: 悬浮“分享官网”专项整改 ${changed}/${checked} 个页面；仅修改Dock分享入口，不修改正文“官方网址”术语。\n`);
