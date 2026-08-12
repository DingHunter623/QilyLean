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
const viFile = path.join(root, 'site-vi-standard-v1.css');
const contrastFile = path.join(root, 'site-vi-contrast-restoration-v1.css');
const musicCoreFile = path.join(root, 'homepage-music-core-v4.js');

const NAV_VERSION = '20260812-competition-upgrade-v21';
const SHELL_VERSION = '20260729-no-old-flash-v1';
const VISUAL_VERSION = '20260803-home-badge-wrap-v5';
const WIDE_VERSION = '20260810-content-axis-v8';
const TYPE_VERSION = '20260729-hierarchy-v4';
const VI_VERSION = '20260812-manufacturing-asset-system-v3';
const CONTRAST_VERSION = '20260811-text-color-standard-v2';
const MUSIC_VERSION = '20260810-demand-music-wrapper-v6';

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
  const shell = read(shellFile);
  const vi = read(viFile);
  const contrast = read(contrastFile);
  const musicCore = read(musicCoreFile);

  const required = [
    [shell, 'html.qily-shell-pending body', 'No-flash shell guard'],
    [wide, '--qily-wide-content:1560px', 'Wide layout'],
    [wide, '.hero>.hero-grid', 'Homepage grid'],
    [type, '--qily-type-body:18.5px', 'Typography'],
    [type, 'text-wrap:wrap', 'Phrase wrapping'],
    [visual, '.qily-home-balanced .portrait-badge', 'Homepage portrait'],
    [vi, '--qily-vi-olive:#0f4b5a', 'VI palette'],
    [vi, '.qily-float-contact', 'VI floating contact'],
    [contrast, 'QilyLean 全站文字色彩语义规范 V2', 'Text color semantic standard V2'],
    [contrast, '.site-music-toggle', 'Music control restoration'],
    [contrast, '#qily-commercial-deliveries', 'Trust action contrast'],
    [contrast, '.qily-modal-close', 'Modal close contrast'],
    [musicCore, 'var speakerOn', 'Speaker SVG'],
    [musicCore, "button.className = 'site-music-toggle'", 'Music button class']
  ];
  required.forEach(([source, marker, label]) => {
    if (!source.includes(marker)) throw new Error(`${label} marker missing: ${marker}`);
  });

  const navigation = read(navigationFile);
  if (navigation.includes('site-microsoft-international-v1.css?v=')) throw new Error('Microsoft international CSS must be disabled');
  if (navigation.includes('site-microsoft-enterprise-components-v2.css?v=')) throw new Error('Microsoft enterprise component CSS must be disabled');
  if (/enhancer\.src\s*=\s*['"]\/site-microsoft-international-v1\.js/.test(navigation)) throw new Error('Microsoft international JS loader must be disabled');
  if (!navigation.includes(`site-vi-contrast-restoration-v1.css?v=${CONTRAST_VERSION}`)) throw new Error('Contrast restoration loader missing');
}

function publishNavigation() {
  let page = read(navigationFile);
  page = page
    .replace(/site-vi-standard-v1\.css\?v=[^'"\s]+/g, `site-vi-standard-v1.css?v=${VI_VERSION}`)
    .replace(/site-vi-contrast-restoration-v1\.css\?v=[^'"\s]+/g, `site-vi-contrast-restoration-v1.css?v=${CONTRAST_VERSION}`)
    .replace(/site-wide-layout-v1\.css\?v=[^'"\s]+/g, `site-wide-layout-v1.css?v=${WIDE_VERSION}`)
    .replace(/site-typography-v1\.css\?v=[^'"\s]+/g, `site-typography-v1.css?v=${TYPE_VERSION}`);
  write(navigationFile, page);
}

function publicHeadAssets() {
  return [
    '  <script data-qily-shell-bootstrap>(function(d){var e=d.documentElement;e.classList.add("qily-shell-pending");window.__qilyLeanRevealCurrentShell=function(){e.classList.remove("qily-shell-pending")};setTimeout(window.__qilyLeanRevealCurrentShell,180)})(document);</script>',
    '  <link rel="stylesheet" href="/site-shell.css?v=' + SHELL_VERSION + '">',
    '  <link id="qilyVisualScaleStylesheet" rel="stylesheet" href="/site-visual-scale-v1.css?v=' + VISUAL_VERSION + '">',
    '  <link id="qilyWideLayoutStylesheet" rel="stylesheet" href="/site-wide-layout-v1.css?v=' + WIDE_VERSION + '">',
    '  <link id="qilyTypographyStylesheet" rel="stylesheet" href="/site-typography-v1.css?v=' + TYPE_VERSION + '">',
    '  <link id="qilyViStandardStylesheet" rel="stylesheet" href="/site-vi-standard-v1.css?v=' + VI_VERSION + '">',
    '  <link id="qilyViContrastRestorationStylesheet" rel="stylesheet" href="/site-vi-contrast-restoration-v1.css?v=' + CONTRAST_VERSION + '">',
    '  <script defer src="/site-navigation.js?v=' + NAV_VERSION + '"></script>'
  ].join('\n');
}

function installHeadAssets(page) {
  if (!/site-navigation\.js\?v=/i.test(page) || !/<\/head>/i.test(page)) return page;
  const next = page
    .replace(/\s*<script\b[^>]*data-qily-shell-bootstrap[^>]*>[\s\S]*?<\/script>\s*/gi, '\n')
    .replace(/\s*<script\b[^>]*src=["'][^"']*\/site-navigation\.js\?v=[^"']+["'][^>]*>\s*<\/script>\s*/gi, '\n')
    .replace(/\s*<link\b[^>]*href=["'][^"']*\/(?:site-shell|site-visual-scale-v1|site-wide-layout-v1|site-typography-v1|site-vi-standard-v1|site-vi-contrast-restoration-v1)\.css\?v=[^"']+["'][^>]*>\s*/gi, '\n')
    .replace(/\s*<link\b[^>]*href=["'][^"']*\/site-microsoft-(?:international-v1|enterprise-components-v2)\.css\?v=[^"']+["'][^>]*>\s*/gi, '\n')
    .replace(/\s*<script\b[^>]*src=["'][^"']*\/site-microsoft-international-v1\.js\?v=[^"']+["'][^>]*>\s*<\/script>\s*/gi, '\n');
  return next.replace(/<\/head>/i, publicHeadAssets() + '\n</head>');
}

function patchEvidenceContext(page, relativePath) {
  if (relativePath === 'capabilities/index.html') {
    page = page
      .replace('<h2>制造改善项目佐证资料</h2>', '<h2>2022年度某制造企业｜制造改善项目佐证资料</h2>')
      .replace(
        '以企业内部形成的课题评审、效益核算、风险评价，以及年度／月度6S评比、每周稽核整改与奖励兑现资料，补充验证制造改善项目的组织推进与成果闭环。',
        '以下资料来自2022年度某制造企业的制造改善项目，包括第三季度课题效益评审、第四季度项目结案评审，以及年度／月度6S评比、每周稽核整改与奖励兑现记录，用于补充验证项目组织推进与成果闭环。'
      );
  }
  if (relativePath === 'projects/index.html') {
    page = page.replace(/<h3>制造改善项目佐证资料<\/h3>/g, '<h3>2022年度某制造企业｜制造改善项目佐证资料</h3>');
  }
  return page;
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
    const relativePath = path.relative(root, file).split(path.sep).join('/');
    const before = read(file);
    const after = patchEvidenceContext(installHeadAssets(before), relativePath)
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
  process.stdout.write(`Restored QilyLean VI, contrast-safe controls and 2022 enterprise evidence context; refreshed ${refreshed} HTML files.\n`);
}

main();
