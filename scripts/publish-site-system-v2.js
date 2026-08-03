#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const navigationFile = path.join(root, 'site-navigation.js');
const shellFile = path.join(root, 'site-shell.css');
const visualFile = path.join(root, 'site-visual-scale-v1.css');
const wideLayoutFile = path.join(root, 'site-wide-layout-v1.css');
const typographyFile = path.join(root, 'site-typography-v1.css');
const musicFile = path.join(root, 'homepage-music.js');
const internationalCssFile = path.join(root, 'site-microsoft-international-v1.css');
const internationalJsFile = path.join(root, 'site-microsoft-international-v1.js');

const NAV_VERSION = '20260803-ms-international-v1';
const SHELL_VERSION = '20260729-no-old-flash-v1';
const VISUAL_VERSION = '20260803-home-badge-wrap-v5';
const WIDE_VERSION = '20260729-fluid-copy-v5';
const TYPE_VERSION = '20260729-hierarchy-v4';
const MUSIC_VERSION = '20260729-continuous-v4';
const INTERNATIONAL_VERSION = '20260803-ms-international-v1';

function read(file) { return fs.readFileSync(file, 'utf8'); }
function write(file, content) {
  const normalized = content.endsWith('\n') ? content : `${content}\n`;
  if (fs.existsSync(file) && read(file) === normalized) return false;
  fs.writeFileSync(file, normalized, 'utf8');
  return true;
}

function validatePublicStyles() {
  const wide = read(wideLayoutFile);
  const type = read(typographyFile);
  const visual = read(visualFile);
  const music = read(musicFile);
  const shell = read(shellFile);
  const internationalCss = read(internationalCssFile);
  const internationalJs = read(internationalJsFile);
  if (!shell.includes('html.qily-shell-pending body')) throw new Error('No-flash shell guard is missing');

  const wideMarkers = [
    '--qily-wide-content:1560px',
    '.hero>.hero-grid',
    'main.main:has(>.chat)>.chat',
    '.career-full-grid',
    '.module-grid.four{grid-template-columns:repeat(auto-fit'
  ];
  const typeMarkers = [
    '--qily-type-nav-1:17px',
    '--qily-type-nav-2:16px',
    '--qily-type-nav-3:15px',
    '--qily-type-body:18.5px',
    'text-wrap:wrap',
    '.career-full-card h3',
    '.answer-content h2',
    '.composer textarea'
  ];
  const visualMarkers = [
    '.qily-home-balanced .portrait-badge{grid-template-columns:repeat(2,minmax(0,1fr))',
    '.qily-home-balanced .portrait-badge div{display:flex!important;min-width:0!important;min-height:96px!important',
    '.qily-home-balanced .portrait-badge div:nth-child(2) span{font-size:13px!important;line-height:1.48!important;white-space:normal!important'
  ];
  const musicMarkers = [
    'var restoreSettled = false',
    'if (!restoreSettled) return',
    'function settlePlaybackRestore()',
    'localStorage.setItem(STATE_KEY, payload)'
  ];
  const internationalCssMarkers = [
    '--qily-ms-content:min(1280px',
    '.capability-digital-tool:nth-child(even)',
    '.qily-ms-static-card:hover',
    '.qily-ms-interactive-card:hover',
    'QilyLean Microsoft-inspired international visual system'
  ];
  const internationalJsMarkers = [
    'window.__qilyMicrosoftInternationalV1',
    "d.documentElement.classList.add('qily-ms-international')",
    "card.classList.add(isDirectlyInteractive(card)?'qily-ms-interactive-card':'qily-ms-static-card')",
    "section.classList.add('qily-ms-product-showcase')"
  ];

  for (const marker of wideMarkers) if (!wide.includes(marker)) throw new Error(`Wide-layout marker missing: ${marker}`);
  for (const marker of typeMarkers) if (!type.includes(marker)) throw new Error(`Typography marker missing: ${marker}`);
  for (const marker of visualMarkers) if (!visual.includes(marker)) throw new Error(`Homepage portrait marker missing: ${marker}`);
  for (const marker of musicMarkers) if (!music.includes(marker)) throw new Error(`Music continuity marker missing: ${marker}`);
  for (const marker of internationalCssMarkers) if (!internationalCss.includes(marker)) throw new Error(`International CSS marker missing: ${marker}`);
  for (const marker of internationalJsMarkers) if (!internationalJs.includes(marker)) throw new Error(`International JS marker missing: ${marker}`);
}

function publishNavigation() {
  let page = read(navigationFile);
  page = page
    .replace(/window\.__qilyLeanSiteNavigation(?:V\d+|PublicV\d+)/g, 'window.__qilyLeanSiteNavigationPublicV8')
    .replace(/var SHARED_ASSET_VERSION = '[^']*';/, `var SHARED_ASSET_VERSION = '${SHELL_VERSION}';`)
    .replace(/var VISUAL_SCALE_VERSION = '[^']*';/, `var VISUAL_SCALE_VERSION = '${VISUAL_VERSION}';`)
    .replace(/site-wide-layout-v1\.css\?v=[^'"\s]+/g, `site-wide-layout-v1.css?v=${WIDE_VERSION}`)
    .replace(/site-typography-v1\.css\?v=[^'"\s]+/g, `site-typography-v1.css?v=${TYPE_VERSION}`)
    .replace(/site-microsoft-international-v1\.css\?v=[^'"\s]+/g, `site-microsoft-international-v1.css?v=${INTERNATIONAL_VERSION}`)
    .replace(/site-microsoft-international-v1\.js\?v=[^'"\s]+/g, `site-microsoft-international-v1.js?v=${INTERNATIONAL_VERSION}`);

  if (!page.includes(`site-wide-layout-v1.css?v=${WIDE_VERSION}`)) throw new Error('Wide-layout cache version was not published');
  if (!page.includes(`site-typography-v1.css?v=${TYPE_VERSION}`)) throw new Error('Typography cache version was not published');
  if (!page.includes(`site-microsoft-international-v1.css?v=${INTERNATIONAL_VERSION}`)) throw new Error('International CSS cache version was not published');
  if (!page.includes(`site-microsoft-international-v1.js?v=${INTERNATIONAL_VERSION}`)) throw new Error('International JS cache version was not published');
  if (!page.includes('addWideLayoutStylesheet();') || !page.includes('addTypographyStylesheet();')) {
    throw new Error('Public style loaders are incomplete');
  }
  write(navigationFile, page);
}

function publicHeadAssets() {
  return [
    '  <script data-qily-shell-bootstrap>(function(d){var e=d.documentElement;e.classList.add("qily-shell-pending");window.__qilyLeanRevealCurrentShell=function(){e.classList.remove("qily-shell-pending")};setTimeout(window.__qilyLeanRevealCurrentShell,1800)})(document);</script>',
    '  <link rel="stylesheet" href="/site-shell.css?v=' + SHELL_VERSION + '">',
    '  <link id="qilyVisualScaleStylesheet" rel="stylesheet" href="/site-visual-scale-v1.css?v=' + VISUAL_VERSION + '">',
    '  <link id="qilyWideLayoutStylesheet" rel="stylesheet" href="/site-wide-layout-v1.css?v=' + WIDE_VERSION + '">',
    '  <link id="qilyTypographyStylesheet" rel="stylesheet" href="/site-typography-v1.css?v=' + TYPE_VERSION + '">',
    '  <script defer src="/site-navigation.js?v=' + NAV_VERSION + '"></script>'
  ].join('\n');
}

function installHeadAssets(page) {
  if (!/site-navigation\.js\?v=/i.test(page) || !/<\/head>/i.test(page)) return page;
  const alreadyCurrent = page.includes('data-qily-shell-bootstrap')
    && page.includes('/site-shell.css?v=' + SHELL_VERSION)
    && page.includes('/site-visual-scale-v1.css?v=' + VISUAL_VERSION)
    && page.includes('/site-wide-layout-v1.css?v=' + WIDE_VERSION)
    && page.includes('/site-typography-v1.css?v=' + TYPE_VERSION)
    && page.includes('<script defer src="/site-navigation.js?v=' + NAV_VERSION + '"></script>');
  if (alreadyCurrent) return page;

  const next = page
    .replace(/\s*<script\b[^>]*data-qily-shell-bootstrap[^>]*>[\s\S]*?<\/script>\s*/gi, '\n')
    .replace(/\s*<script\b[^>]*src=["'][^"']*\/site-navigation\.js\?v=[^"']+["'][^>]*>\s*<\/script>\s*/gi, '\n')
    .replace(/\s*<link\b[^>]*href=["'][^"']*\/(?:site-shell|site-visual-scale-v1|site-wide-layout-v1|site-typography-v1)\.css\?v=[^"']+["'][^>]*>\s*/gi, '\n');
  return next.replace(/<\/head>/i, publicHeadAssets() + '\n</head>');
}

function walk(directory, callback) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.cache'].includes(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full, callback);
    else callback(full);
  }
}

function refreshHtmlReferences() {
  let changed = 0;
  walk(root, (file) => {
    if (!file.endsWith('.html')) return;
    const before = read(file);
    const after = installHeadAssets(before)
      .replace(/homepage-music\.js\?v=[^"']+/g, `homepage-music.js?v=${MUSIC_VERSION}`);
    if (after !== before) {
      write(file, after);
      changed += 1;
    }
  });
  return changed;
}

function main() {
  validatePublicStyles();
  publishNavigation();
  const refreshed = refreshHtmlReferences();
  process.stdout.write(`Published QilyLean international enterprise layout, alternating digital-tool showcases, current shell, unified typography and continuous music; refreshed ${refreshed} HTML files.\n`);
}

main();
