#!/usr/bin/env node
'use strict';

/* QilyLean R6 static-first performance materializer｜2026-08-19
 * 根因治理：最终视觉CSS不得等待 defer JS 再改 href/补挂；首屏静态HTML直接引用当前受保护版本。
 * 导航治理：继续使用浏览器原生整页导航，并静态加载同源低优先级预取增强。
 */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

const GOVERNANCE = '<link id="qilyVisualGovernanceV1" rel="stylesheet" href="/site-visual-governance-v2.css?v=20260819-readable-floor-plus1-v6">';
const CONTENT_AXIS = '<link id="qilyContentAxisV1" rel="stylesheet" href="/site-content-axis-v1.css?v=20260819-unified-content-axis-v1">';
const HOME_HERO = '<link id="qilyHomeHeroTuneV1" rel="stylesheet" href="/site-home-hero-tune-v1.css?v=20260819-home-hero-align-v2">';
const PREFETCH = '<script defer id="qilyR6NativePrefetchV1" data-qily-native-prefetch="v1" src="/site-native-prefetch-v1.js?v=20260819-r6-native-prefetch-v1"></script>';
const HOME_PARITY = '<style id="qilyR6HomeFirstPaintParity">@media(min-width:981px){html body.qily-home-v3 .hero .hero-grid{width:min(1540px,100%)!important;grid-template-columns:minmax(0,1fr) minmax(330px,360px)!important;column-gap:clamp(52px,4.5vw,76px)!important}html body.qily-home-v3 .hero h1.qily-home-hero-title{font-size:clamp(44px,4vw,56px)!important;line-height:1.08!important;letter-spacing:-.022em!important}html body.qily-home-v3 .hero .hero-grid>aside,html body.qily-home-v3 .hero .portrait-frame{max-width:360px!important}}@media(min-width:981px) and (max-width:1280px){html body.qily-home-v3 .hero h1.qily-home-hero-title{font-size:clamp(40px,4.2vw,52px)!important}}@media(max-width:980px){html body.qily-home-v3 .hero h1.qily-home-hero-title{font-size:clamp(34px,6.6vw,48px)!important;line-height:1.08!important}}@media(max-width:620px){html body.qily-home-v3 .hero h1.qily-home-hero-title{font-size:clamp(28px,8vw,36px)!important;line-height:1.1!important}}</style>';

function isPublicHtml(html) {
  return /<html\b/i.test(html) && /<body\b/i.test(html) && !/data-qily-admin-only=["']true["']/i.test(html);
}
function strip(html, regex) { return html.replace(regex, ''); }
function beforeHeadEnd(html, fragment) {
  if (!/<\/head>/i.test(html)) return html;
  return html.replace(/<\/head>/i, fragment + '\n</head>');
}
function normalize(html, rel) {
  let out = html;

  // 清除旧/重复最终视觉链接；统一静态物化当前版本，避免 site-navigation defer 后二次改 href 触发重排闪现。
  out = strip(out, /\s*<link\b[^>]*(?:id=["']qilyVisualGovernanceV1["']|href=["'][^"']*\/site-visual-governance-v[12]\.css(?:\?[^"']*)?["'])[^>]*>\s*/gi);
  out = strip(out, /\s*<link\b[^>]*(?:id=["']qilyContentAxisV1["']|href=["'][^"']*\/site-content-axis-v1\.css(?:\?[^"']*)?["'])[^>]*>\s*/gi);
  out = strip(out, /\s*<script\b[^>]*(?:id=["']qilyR6NativePrefetchV1["']|src=["'][^"']*\/site-native-prefetch-v1\.js(?:\?[^"']*)?["'])[^>]*>\s*<\/script>\s*/gi);
  out = strip(out, /\s*<style\b[^>]*id=["']qilyR6HomeFirstPaintParity["'][^>]*>[\s\S]*?<\/style>\s*/gi);

  out = beforeHeadEnd(out, GOVERNANCE + '\n' + CONTENT_AXIS + '\n' + PREFETCH);

  const home = rel === 'index.html' || /<body\b[^>]*\bqily-home-v3\b/i.test(out);
  if (home) {
    out = strip(out, /\s*<link\b[^>]*(?:id=["']qilyHomeHeroTuneV1["']|href=["'][^"']*\/site-home-hero-tune-v1\.css(?:\?[^"']*)?["'])[^>]*>\s*/gi);
    out = beforeHeadEnd(out, HOME_PARITY + '\n' + HOME_HERO);
  }

  return out;
}

let scanned = 0;
let changed = 0;
const changedFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.cache'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(full); continue; }
    if (!/\.html?$/i.test(entry.name)) continue;
    const rel = path.relative(root, full).replace(/\\/g, '/');
    const html = fs.readFileSync(full, 'utf8');
    if (!isPublicHtml(html)) continue;
    scanned += 1;
    const next = normalize(html, rel);
    if (next === html) continue;
    fs.writeFileSync(full, next.endsWith('\n') ? next : next + '\n', 'utf8');
    changed += 1;
    changedFiles.push(rel);
  }
}

walk(root);

// 最低静态验收：主页首屏最终视觉必须在HTML head直接存在；预取增强必须全站物化。
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
[
  '/site-visual-governance-v2.css?v=20260819-readable-floor-plus1-v6',
  '/site-content-axis-v1.css?v=20260819-unified-content-axis-v1',
  '/site-home-hero-tune-v1.css?v=20260819-home-hero-align-v2',
  'qilyR6HomeFirstPaintParity',
  '/site-native-prefetch-v1.js?v=20260819-r6-native-prefetch-v1'
].forEach((marker) => {
  if (!home.includes(marker)) throw new Error('R6 first-paint baseline missing from homepage: ' + marker);
});

process.stdout.write(`R6 first-paint/performance materialized: scanned ${scanned} public HTML, changed ${changed}.\n`);
if (changedFiles.length) process.stdout.write(changedFiles.join('\n') + '\n');
