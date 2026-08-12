#!/usr/bin/env node
'use strict';

/*
 * QilyLean R2 runtime stability materializer｜2026-08-12
 * 目标：
 * 1) 静态 HTML 与运行时导航保持同一套 R2 一级导视，禁止加载后再变成旧导航；
 * 2) 停止旧导航核心在运行时重写共享 CSS、重复注入联系栏/文档邮箱尾条；
 * 3) 移除已废止的背景音乐运行时，只保留原生页面导航 + 同源预取 V5；
 * 4) 首屏在 deferred 公共运行时完成前保持隐藏，消除“先旧版/乱版，随后恢复”的 FOUC；
 * 5) 全站注入统一 R2 视觉修复层，覆盖深色按钮可读性与等高卡片动作沉底。
 */

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

const VERSION = '20260812-r2-stability-v1';
const R2_CSS = `/site-r2-stability-fixes-v1.css?v=${VERSION}`;
const NATIVE_NAV = `/site-music-persistent-navigation-v1.js?v=20260812-fast-native-v5`;
const HERO_CONTRAST = `/site-hero-primary-contrast-v1.css?v=20260804-hero-primary-contrast-v1`;

const PRIMARY_ROUTES = [
  ['首页', '/'],
  ['能力体系', '/capabilities/'],
  ['代表项目', '/projects/'],
  ['改善方法', '/improvements/'],
  ['知识资产', '/knowledge/'],
  ['履历主线', '/experience/'],
  ['项目合作', '/cooperation/'],
  ['信任中心', '/trust/']
];

const FIRST_PAINT_START = '<!-- QILY-R2-FIRST-PAINT:START -->';
const FIRST_PAINT_END = '<!-- QILY-R2-FIRST-PAINT:END -->';
const INTERACTION_START = '<!-- QILY-R2-PRIMARY-CONTRAST-NAV:START -->';
const INTERACTION_END = '<!-- QILY-R2-PRIMARY-CONTRAST-NAV:END -->';

const firstPaintBlock = `${FIRST_PAINT_START}\n<style id="qilyR2CriticalFirstPaintGuard">html.qily-r2-first-paint-pending{min-height:100%;background:#eef7f5}html.qily-r2-first-paint-pending body{visibility:hidden!important}@media print{html.qily-r2-first-paint-pending body{visibility:visible!important}}</style><script data-qily-r2-first-paint>(function(d,w){var e=d.documentElement;e.classList.add('qily-r2-first-paint-pending','qily-shell-pending');var done=false;function shellReady(){e.classList.remove('qily-shell-pending')}function reveal(){if(done)return;done=true;shellReady();e.classList.remove('qily-r2-first-paint-pending')}w.__qilyLeanRevealCurrentShell=shellReady;function afterDom(){w.requestAnimationFrame(function(){w.requestAnimationFrame(reveal)})}if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',afterDom,{once:true});else afterDom();w.setTimeout(reveal,1500)})(document,window);</script>\n${FIRST_PAINT_END}`;

const interactionBlock = `${INTERACTION_START}\n  <link id="qilyHeroPrimaryContrastStylesheet" rel="stylesheet" href="${HERO_CONTRAST}">\n  <script defer id="qilyPersistentMusicNavigationScript" data-qily-persistent-music-navigation="v5" src="${NATIVE_NAV}"></script>\n${INTERACTION_END}`;

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}
function write(rel, content) {
  const file = path.join(root, rel);
  const normalized = content.endsWith('\n') ? content : `${content}\n`;
  if (fs.readFileSync(file, 'utf8') === normalized) return false;
  fs.writeFileSync(file, normalized, 'utf8');
  return true;
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function walk(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.cache'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, callback);
    else callback(full);
  }
}
function normalizedRouteFromFile(relativePath) {
  const rel = relativePath.replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  if (/^capabilities\//.test(rel)) return '/capabilities/';
  if (/^projects\//.test(rel)) return '/projects/';
  if (/^improvements\//.test(rel)) return '/improvements/';
  if (/^(knowledge\/|qilylean\/daily\/|qilylean\/daily-insights\.html)/.test(rel)) return '/knowledge/';
  if (/^experience\//.test(rel)) return '/experience/';
  if (/^cooperation\//.test(rel)) return '/cooperation/';
  if (/^trust\//.test(rel)) return '/trust/';
  return '';
}
function canonicalNavMarkup(relativePath) {
  const current = normalizedRouteFromFile(relativePath);
  return PRIMARY_ROUTES.map(([label, href]) => {
    const currentAttr = href === current ? ' aria-current="page"' : '';
    return `      <a href="${href}"${currentAttr}>${label}</a>`;
  }).join('\n');
}
function normalizePrimaryNavigation(html, relativePath) {
  return html.replace(/<nav\b([^>]*)>([\s\S]*?)<\/nav>/gi, (whole, attrs, inner) => {
    const classMatch = attrs.match(/\bclass=["']([^"']*)["']/i);
    const className = classMatch ? classMatch[1] : '';
    const isPrimaryClass = /(?:^|\s)(?:qily-global-nav|site-nav)(?:\s|$)/.test(className);
    const knownLinks = ['/capabilities/', '/projects/', '/improvements/', '/knowledge/', '/experience/', '/cooperation/']
      .filter((href) => inner.includes(`href="${href}"`) || inner.includes(`href='${href}'`)).length;
    if (!isPrimaryClass && knownLinks < 4) return whole;
    let nextAttrs = attrs;
    if (/\baria-label=["'][^"']*["']/i.test(nextAttrs)) {
      nextAttrs = nextAttrs.replace(/\baria-label=["'][^"']*["']/i, 'aria-label="QilyLean核心导视"');
    } else {
      nextAttrs += ' aria-label="QilyLean核心导视"';
    }
    return `<nav${nextAttrs}>\n${canonicalNavMarkup(relativePath)}\n    </nav>`;
  });
}
function stripLegacyInteraction(html) {
  let next = html
    .replace(/<!-- QILY-PRIMARY-CONTRAST-MUSIC:START -->[\s\S]*?<!-- QILY-PRIMARY-CONTRAST-MUSIC:END -->\s*/gi, '')
    .replace(/<!-- QILY-R2-PRIMARY-CONTRAST-NAV:START -->[\s\S]*?<!-- QILY-R2-PRIMARY-CONTRAST-NAV:END -->\s*/gi, '')
    .replace(/^[ \t]*<script\b[^>]*(?:id=["']qilyBackgroundMusicScript["']|data-qily-background-music=["'][^"']+["']|src=["'][^"']*\/homepage-music(?:-v5)?\.js(?:\?v=[^"']*)?["'])[^>]*>\s*<\/script>\s*/gmi, '')
    .replace(/^[ \t]*<script\b[^>]*(?:id=["']qilyPersistentMusicNavigationScript["']|data-qily-persistent-music-navigation=["'][^"']+["']|src=["'][^"']*\/site-music-persistent-navigation-v1\.js(?:\?v=[^"']*)?["'])[^>]*>\s*<\/script>\s*/gmi, '')
    .replace(/^[ \t]*<link\b[^>]*(?:id=["']qilyHeroPrimaryContrastStylesheet["']|href=["'][^"']*\/site-hero-primary-contrast-v1\.css(?:\?v=[^"']*)?["'])[^>]*>\s*/gmi, '');
  return next;
}
function installFirstPaint(html) {
  let next = html
    .replace(/<!-- QILY-R2-FIRST-PAINT:START -->[\s\S]*?<!-- QILY-R2-FIRST-PAINT:END -->\s*/gi, '')
    .replace(/<!-- QILY-FIRST-PAINT-GUARD:START -->[\s\S]*?<!-- QILY-FIRST-PAINT-GUARD:END -->\s*/gi, '')
    .replace(/\s*<script\b[^>]*data-qily-shell-bootstrap[^>]*>[\s\S]*?<\/script>\s*/gi, '\n')
    .replace(/\s*<script\b[^>]*data-qily-r2-first-paint[^>]*>[\s\S]*?<\/script>\s*/gi, '\n')
    .replace(/\s*<style\b[^>]*id=["']qilyR2CriticalFirstPaintGuard["'][^>]*>[\s\S]*?<\/style>\s*/gi, '\n');
  assert(/<head>/i.test(next), 'HTML missing <head>');
  return next.replace(/<head>\s*/i, `<head>\n${firstPaintBlock}\n  `);
}
function installR2Css(html) {
  let next = html
    .replace(/\s*<link\b[^>]*(?:id=["']qilyR2RuntimeStabilityStylesheet["']|href=["'][^"']*\/site-r2-stability-fixes-v1\.css(?:\?v=[^"']*)?["'])[^>]*>\s*/gi, '\n')
    .replace(/\/site-shell\.css\?v=[^"'\s<]+/g, `/site-shell.css?v=${VERSION}`)
    .replace(/\/site-navigation\.js\?v=[^"'\s<]+/g, `/site-navigation.js?v=${VERSION}`);
  const tag = `  <link id="qilyR2RuntimeStabilityStylesheet" rel="stylesheet" href="${R2_CSS}">`;
  const contrast = /(<link\b[^>]*id=["']qilyViContrastRestorationStylesheet["'][^>]*>)/i;
  if (contrast.test(next)) return next.replace(contrast, `$1\n${tag}`);
  return next.replace(/<\/head>/i, `${tag}\n</head>`);
}
function installInteraction(html) {
  const next = stripLegacyInteraction(html);
  return next.replace(/<\/head>/i, `${interactionBlock}\n</head>`);
}
function normalizeHtml(html, relativePath) {
  let next = installFirstPaint(html);
  next = installR2Css(next);
  next = normalizePrimaryNavigation(next, relativePath);
  next = installInteraction(next);
  return next;
}

function patchNavigationCore() {
  const rel = 'site-navigation-core.js';
  let source = read(rel);
  const routes = `  var routes = [\n${PRIMARY_ROUTES.map(([label, href]) => `    ['${label}', '${href}']`).join(',\n')}\n  ];`;
  source = source.replace(/  var routes = \[[\s\S]*?\n  \];/, routes);
  source = source.replace(/var SHARED_ASSET_VERSION = '[^']+';/, `var SHARED_ASSET_VERSION = '${VERSION}';`);
  source = source.replace(/20260729-fluid-copy-v5/g, '20260810-content-axis-v8');

  const replacements = [
    ['      addStylesheet();', '      // R2 static-first: shared shell CSS is materialized in HTML; do not rewrite it at runtime.'],
    ['      addVisualScaleStylesheet();', '      // R2 static-first: visual-scale CSS is materialized in HTML.'],
    ['      addWideLayoutStylesheet();', '      // R2 static-first: wide-layout CSS is materialized in HTML.'],
    ['      addGlobalHeaderStyles();', '      // R2 static-first: header CSS is materialized in shared stylesheets.'],
    ['      addTypographyStylesheet();', '      // R2 static-first: typography CSS is materialized in HTML.'],
    ['      buildNavigation();', "      if (!document.querySelector('header.qily-site-header .qily-global-nav,header.qily-global-header .qily-global-nav')) buildNavigation();"],
    ['      ensureGlobalContactFooter();', '      // R2: ordinary pages must not inject a repeated global contact footer.'],
    ['      ensureKnowledgeDocumentEnhancements();', '      // R2: ordinary knowledge/document pages must not inject repeated site/email tail rows.'],
    ['      enableNavigationPrefetch();', '      // Fast Native Navigation V5 is the single prefetch owner; avoid duplicate prefetch listeners here.']
  ];
  for (const [oldText, newText] of replacements) {
    if (source.includes(oldText)) source = source.replace(oldText, newText);
    else assert(source.includes(newText), `site-navigation-core.js missing R2 replacement marker: ${newText}`);
  }
  assert(source.includes("['能力体系', '/capabilities/']"), 'navigation core missing R2 capability route');
  assert(source.includes("['信任中心', '/trust/']"), 'navigation core missing R2 trust route');
  assert(!/\n\s*ensureGlobalContactFooter\(\);/.test(source), 'navigation core still calls obsolete global contact footer');
  assert(!/\n\s*ensureKnowledgeDocumentEnhancements\(\);/.test(source), 'navigation core still calls obsolete document contact tail');
  return write(rel, source);
}

function patchLegacyNavigation() {
  const rel = 'site-navigation-legacy-20260802.js';
  let source = read(rel);
  source = source.replace(/var CORE_SRC = '\/site-navigation-core\.js\?v=[^']+';/, `var CORE_SRC = '/site-navigation-core.js?v=${VERSION}';`);
  source = source.replace(/\n\s*ensureFriendLinksNavigation\(\);/g, '');
  source = source.replace(/  function observeShell\(\) \{[\s\S]*?\n  \}\n\n  var existing =/, `  function observeShell() {\n    // R2: deferred scripts run after parsing; one deterministic pass is enough.\n    // Continuous MutationObserver rewriting caused navigation/content to change after first paint.\n    applyFixes();\n  }\n\n  var existing =`);
  assert(!/function applyFixes\(\)[\s\S]{0,220}ensureFriendLinksNavigation\(\)/.test(source), 'legacy navigation still inserts 友情链接 into primary nav');
  assert(!/function observeShell\(\)[\s\S]{0,500}MutationObserver/.test(source), 'legacy navigation still runs mutation-loop rewrites');
  return write(rel, source);
}

function patchNavigationWrapper() {
  const rel = 'site-navigation.js';
  let source = read(rel);
  source = source.replace(/\/site-navigation-legacy-20260802\.js\?v=[^'"\s]+/g, `/site-navigation-legacy-20260802.js?v=${VERSION}`);
  assert(source.includes(`/site-navigation-legacy-20260802.js?v=${VERSION}`), 'site-navigation.js legacy cache version not normalized');
  return write(rel, source);
}

function verifyHtml(relativePath, html) {
  assert(html.includes(FIRST_PAINT_START) && html.includes(FIRST_PAINT_END), `${relativePath}: missing R2 first-paint guard`);
  assert(html.includes(R2_CSS), `${relativePath}: missing R2 stability CSS`);
  assert(html.includes(NATIVE_NAV), `${relativePath}: missing Fast Native Navigation V5`);
  assert(!/homepage-music(?:-v5)?\.js(?:\?v=)?/i.test(html), `${relativePath}: deprecated background-music runtime returned`);
  assert(!html.includes('QILY-PRIMARY-CONTRAST-MUSIC:START'), `${relativePath}: legacy music managed block returned`);
  assert(!/setTimeout\([^;]*180\)/.test(html), `${relativePath}: legacy 180ms shell reveal returned`);
  const primary = html.match(/<nav\b[^>]*(?:qily-global-nav|site-nav)[^>]*>([\s\S]*?)<\/nav>/i);
  if (primary) {
    assert(primary[1].includes('能力体系') && primary[1].includes('信任中心'), `${relativePath}: primary nav is not R2`);
    assert(!primary[1].includes('QilyLean AI') && !primary[1].includes('能力画像') && !primary[1].includes('知识分享') && !primary[1].includes('友情链接'), `${relativePath}: retired/secondary item remains in primary nav`);
  }
}

function main() {
  assert(fs.existsSync(path.join(root, 'site-r2-stability-fixes-v1.css')), 'R2 stability CSS missing');
  patchNavigationCore();
  patchLegacyNavigation();
  patchNavigationWrapper();

  let checked = 0;
  let changed = 0;
  walk(root, (file) => {
    if (!file.endsWith('.html')) return;
    const relativePath = path.relative(root, file).split(path.sep).join('/');
    const before = fs.readFileSync(file, 'utf8');
    if (!/<head>/i.test(before) || !/<\/head>/i.test(before) || !/<body\b/i.test(before)) return;
    // 只处理公共站点页面：存在全站导航或原生导航运行时才纳入物化。
    if (!/site-navigation\.js\?v=|qily-global-nav|site-nav|site-music-persistent-navigation-v1\.js/i.test(before)) return;
    checked += 1;
    const after = normalizeHtml(before, relativePath);
    verifyHtml(relativePath, after);
    if (after !== before) {
      fs.writeFileSync(file, after.endsWith('\n') ? after : `${after}\n`, 'utf8');
      changed += 1;
    }
  });

  ['index.html','ai.html','capabilities/index.html','projects/index.html','improvements/index.html','knowledge/index.html','experience/index.html','cooperation/index.html','trust/index.html'].forEach((relativePath) => {
    if (!fs.existsSync(path.join(root, relativePath))) return;
    verifyHtml(relativePath, read(relativePath));
  });

  process.stdout.write(`R2 runtime stability materialized across ${checked} public HTML pages; refreshed ${changed}; runtime navigation sources normalized.\n`);
}

main();
