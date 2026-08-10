#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const NUMBER_VERSION = '20260805-number-badge-contrast-v1';
const HOVER_VERSION = '20260810-stable-layout-v15';
const LAYOUT_VERSION = '20260810-stable-layout-v19';
const NAV_VERSION = '20260810-native-navigation-stable-v19';
const MUSIC_VERSION = '20260810-demand-music-v6';
const NUMBER_HREF = `/site-number-badge-contrast-v1.css?v=${NUMBER_VERSION}`;
const HOVER_HREF = `/site-interactive-hover-contrast-v1.css?v=${HOVER_VERSION}`;
const LAYOUT_HREF = `/site-layout-footer-closure-v1.css?v=${LAYOUT_VERSION}`;
const NAV_HREF = `/site-navigation.js?v=${NAV_VERSION}`;
const MUSIC_HREF = `/homepage-music-v5.js?v=${MUSIC_VERSION}`;
const MUSIC_WRAPPER_HREF = '/homepage-music.js?v=20260810-demand-music-wrapper-v6';
const STATIC_INTERACTIONS_HREF = '/site-static-core-interactions-v1.js?v=20260810-no-new-badge-v3';
const VISUAL_CLOSURE_HREF = '/site-visual-closure-v1.js?v=20260810-stable-layout-v5';
const WIDE_LAYOUT_HREF = '/site-wide-layout-v1.css?v=20260810-content-axis-v8';
const CORE_DOCK_HREF = '/site-core-service-dock-closure-v1.js?v=20260810-stable-dock-v5';
const FLOATING_SERVICE_HREF = '/qilylean/floating-service.js?v=20260810-native-navigation-dedupe-v1';
const REQUIRED_SOURCE_HTML = [
  'scripts/nda-source/nda-preview-template.html',
  'links.html',
  'trust.html',
  'standards.html',
  'delivery.html'
];
const START = '<!-- QILY-NUMBER-BADGE-CONTRAST:START -->';
const END = '<!-- QILY-NUMBER-BADGE-CONTRAST:END -->';
const BLOCK = [
  START,
  `  <link id="qilyNumberBadgeContrastStylesheet" rel="stylesheet" href="${NUMBER_HREF}">`,
  `  <link id="qilyInteractiveHoverContrastStylesheet" rel="stylesheet" href="${HOVER_HREF}">`,
  `  <link id="qilyLayoutFooterClosureStylesheet" rel="stylesheet" href="${LAYOUT_HREF}">`,
  END
].join('\n');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  const normalized = content.endsWith('\n') ? content : `${content}\n`;
  if (read(file) === normalized) return false;
  fs.writeFileSync(file, normalized, 'utf8');
  return true;
}

function walk(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.cache'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, callback);
    else callback(full);
  }
}

function isPublicPage(html) {
  return /site-navigation\.js\?v=/i.test(html)
    || /homepage-music(?:-v5)?\.js(?:\?v=)?/i.test(html)
    || /qilyCoreServiceDockClosureStylesheet/i.test(html);
}

function removeManaged(html) {
  return html
    .replace(/^[ \t]*<!-- QILY-NUMBER-BADGE-CONTRAST:START -->\r?\n[\s\S]*?^[ \t]*<!-- QILY-NUMBER-BADGE-CONTRAST:END -->[ \t]*(?:\r?\n)?/gmi, '')
    .replace(/^[ \t]*<link\b[^>]*(?:id=["']qilyNumberBadgeContrastStylesheet["']|href=["'][^"']*\/site-number-badge-contrast-v1\.css(?:\?v=[^"']*)?["'])[^>]*>[ \t]*(?:\r?\n)?/gmi, '')
    .replace(/^[ \t]*<link\b[^>]*(?:id=["']qilyInteractiveHoverContrastStylesheet["']|href=["'][^"']*\/site-interactive-hover-contrast-v1\.css(?:\?v=[^"']*)?["'])[^>]*>[ \t]*(?:\r?\n)?/gmi, '')
    .replace(/^[ \t]*<link\b[^>]*(?:id=["']qilyLayoutFooterClosureStylesheet["']|href=["'][^"']*\/site-layout-footer-closure-v1\.css(?:\?v=[^"']*)?["'])[^>]*>[ \t]*(?:\r?\n)?/gmi, '')
    .replace(/^[ \t]+$/gm, '');
}

function insert(html) {
  const cleaned = removeManaged(html)
    .replace(/\/site-navigation\.js\?v=[^"'\s<]+/gi, NAV_HREF)
    .replace(/\/homepage-music-v5\.js\?v=[^"'\s<]+/gi, MUSIC_HREF)
    .replace(/\/homepage-music\.js\?v=[^"'\s<]+/gi, MUSIC_WRAPPER_HREF)
    .replace(/\/site-static-core-interactions-v1\.js\?v=[^"'\s<]+/gi, STATIC_INTERACTIONS_HREF)
    .replace(/\/site-visual-closure-v1\.js\?v=[^"'\s<]+/gi, VISUAL_CLOSURE_HREF)
    .replace(/\/site-wide-layout-v1\.css\?v=[^"'\s<]+/gi, WIDE_LAYOUT_HREF)
    .replace(/\/site-core-service-dock-closure-v1\.js\?v=[^"'\s<]+/gi, CORE_DOCK_HREF)
    .replace(/(?:\/qilylean\/)?floating-service\.js\?v=[^"'\s<]+/gi, FLOATING_SERVICE_HREF)
    .replace(/^[ \t]*<link\b[^>]*(?:id=["']qilyBackgroundMusicPreload["']|href=["'][^"']*%E6%88%91%E7%9A%84%E6%A2%A6[^"']*["'][^>]*\bas=["']audio["'])[^>]*>[ \t]*(?:\r?\n)?/gmi, '')
    .replace(/^[ \t]*<script\b[^>]*(?:id=["']qilyPersistentMusicNavigationScript["']|data-qily-persistent-music-navigation=["'][^"']+["']|src=["'][^"']*\/site-music-persistent-navigation-v1\.js(?:\?v=[^"']*)?["'])[^>]*>[ \t\r\n]*<\/script>[ \t]*(?:\r?\n)?/gmi, '');
  const primary = '<!-- QILY-PRIMARY-CONTRAST-MUSIC:START -->';
  const primaryIndex = cleaned.indexOf(primary);
  if (primaryIndex >= 0) {
    const lineStart = cleaned.lastIndexOf('\n', primaryIndex) + 1;
    return cleaned.slice(0, lineStart) + BLOCK + '\n' + cleaned.slice(lineStart);
  }

  const dock = '<link id="qilyCoreServiceDockClosureStylesheet"';
  const dockIndex = cleaned.indexOf(dock);
  if (dockIndex >= 0) {
    const lineStart = cleaned.lastIndexOf('\n', dockIndex) + 1;
    return cleaned.slice(0, lineStart) + BLOCK + '\n' + cleaned.slice(lineStart);
  }

  return cleaned.replace(/<\/head>/i, `${BLOCK}\n</head>`);
}

function verifyCss() {
  const numberCss = read(path.join(root, 'site-number-badge-contrast-v1.css'));
  [
    '--qily-number-badge-bg:#075767',
    '--qily-number-badge-text:#ffffff',
    '-webkit-text-fill-color:var(--qily-number-badge-text)!important',
    'opacity:1!important',
    'filter:none!important',
    '.service-number',
    '.process-number',
    '> b:first-child'
  ].forEach((marker) => {
    if (!numberCss.includes(marker)) throw new Error(`Number-badge contrast marker missing: ${marker}`);
  });

  const hoverCss = read(path.join(root, 'site-interactive-hover-contrast-v1.css'));
  [
    '--qily-interactive-hover-bg:#ffe39b',
    '--qily-interactive-hover-text:#17322d',
    '.ql-trust-strip-actions',
    '.hero-actions',
    ':is(:hover,:focus-visible)',
    '-webkit-text-fill-color:var(--qily-interactive-hover-text)!important',
    'background-color:var(--qily-interactive-hover-bg)!important',
    'opacity:1!important',
    'filter:none!important'
  ].forEach((marker) => {
    if (!hoverCss.includes(marker)) throw new Error(`Interactive-hover contrast marker missing: ${marker}`);
  });
  if (/content\s*:\s*["']NEW["']/i.test(hoverCss)) throw new Error('Interactive CSS still injects a NEW badge.');

  const layoutCss = read(path.join(root, 'site-layout-footer-closure-v1.css'));
  [
    'QILY-SITEWIDE-STABLE-LAYOUT-V18-20260810',
    '--qily-site-content-width:var(--qily-wide-content,1560px)',
    '.qily-ia-inner',
    '.qtc-inner',
    '.qily-resource-network__inner',
    '.ql-trust-module',
    '.ql-trust-strip-inner',
    '#results.qily-ia-secondary-section',
    'height:auto!important',
    'min-height:0!important',
    'html:root:root body.qily-tail-compact .qtc-global-trust-footer .qtc-global-trust-links > a[href]',
    'border:2px solid var(--qily-site-gold)!important',
    'min-height:44px!important'
  ].forEach((marker) => {
    if (!layoutCss.includes(marker)) throw new Error(`Layout/footer closure marker missing: ${marker}`);
  });

  const navigation = read(path.join(root, 'site-navigation.js'));
  const coreDock = read(path.join(root, 'site-core-service-dock-closure-v1.js'));
  const visualClosure = read(path.join(root, 'site-visual-closure-v1.js'));
  const staticInteractions = read(path.join(root, 'site-static-core-interactions-v1.js'));
  const musicWrapper = read(path.join(root, 'homepage-music.js'));
  if (navigation.includes('if (button) dock.appendChild(button)')) throw new Error('Navigation still contains a perpetual dock reorder loop.');
  if (coreDock.includes('dock.appendChild(button)') || coreDock.includes('ResizeObserver')) throw new Error('Core dock still contains a perpetual observer/layout loop.');
  if (visualClosure.includes('max-width:1240px') || visualClosure.includes('contain-intrinsic-size:auto 520px')) throw new Error('Visual runtime still narrows or reserves phantom module space.');
  if (/content\s*:\s*["']NEW["']/i.test(staticInteractions)) throw new Error('Homepage enhancer still injects a NEW badge.');
  if (!musicWrapper.includes("var PLAYER_SRC = '/homepage-music-v5.js?v=20260810-demand-music-v6'") || musicWrapper.includes('homepage-music-core-v4.js')) throw new Error('Compatibility music entry still activates the eager V4 player.');
}

function verifyPage(relative, requiredText) {
  const html = read(path.join(root, relative));
  if (!html.includes(NUMBER_HREF)) throw new Error(`${relative} missing number-badge contrast asset.`);
  if (!html.includes(HOVER_HREF)) throw new Error(`${relative} missing interactive-hover contrast asset.`);
  if (!html.includes(LAYOUT_HREF)) throw new Error(`${relative} missing layout/footer closure asset.`);
  if (!html.includes(NAV_HREF)) throw new Error(`${relative} missing current navigation loader.`);
  if (!html.includes(WIDE_LAYOUT_HREF)) throw new Error(`${relative} missing current wide-layout asset.`);
  if (!html.includes(MUSIC_HREF)) throw new Error(`${relative} missing demand-loaded background music controller.`);
  if (/qilyBackgroundMusicPreload/i.test(html)) throw new Error(`${relative} still preloads background audio.`);
  if (/site-music-persistent-navigation-v1\.js/i.test(html)) throw new Error(`${relative} still loads iframe navigation.`);
  if (requiredText && !html.includes(requiredText)) throw new Error(`${relative} missing required action text: ${requiredText}`);
}

function verifyRequiredSourceHtml() {
  REQUIRED_SOURCE_HTML.forEach((relative) => {
    if (!fs.existsSync(path.join(root, relative))) {
      throw new Error(`Required HTML source is missing: ${relative}`);
    }
  });
}

function main() {
  verifyRequiredSourceHtml();
  verifyCss();
  let checked = 0;
  let changed = 0;

  walk(root, (file) => {
    if (!file.endsWith('.html')) return;
    const before = read(file);
    if (!/<\/head>/i.test(before) || !/<\/body>/i.test(before) || !isPublicPage(before)) return;
    checked += 1;
    const after = insert(before);
    if (after !== before && write(file, after)) changed += 1;
  });

  const onboarding = read(path.join(root, 'links', 'onboarding', 'index.html'));
  ['<b>1</b>', '<b>2</b>', '<b>3</b>', '<b>4</b>'].forEach((marker) => {
    if (!onboarding.includes(marker)) throw new Error(`Onboarding process marker missing: ${marker}`);
  });
  verifyPage('links/onboarding/index.html', '立即填写入驻资料');
  verifyPage('links/index.html');
  verifyPage('cooperation/index.html', '预约60分钟问题初筛');
  verifyPage('index.html');

  const cooperation = read(path.join(root, 'cooperation', 'index.html'));
  if (!/service-number/i.test(cooperation)) throw new Error('Cooperation service-number markers are missing.');

  const trustJs = read(path.join(root, 'site-brand-trust-v1.js'));
  if (!trustJs.includes('从具体问题开始') || !trustJs.includes('查看信任与边界')) {
    throw new Error('Global trust-strip action labels are missing.');
  }

  process.stdout.write(`Number-badge and interactive-hover contrast materialized in ${checked} public pages; refreshed ${changed}.\n`);
}

main();
