#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const NUMBER_VERSION = '20260805-number-badge-contrast-v1';
const HOVER_VERSION = '20260809-sitewide-interaction-clarity-v5';
const NUMBER_HREF = `/site-number-badge-contrast-v1.css?v=${NUMBER_VERSION}`;
const HOVER_HREF = `/site-interactive-hover-contrast-v1.css?v=${HOVER_VERSION}`;
const START = '<!-- QILY-NUMBER-BADGE-CONTRAST:START -->';
const END = '<!-- QILY-NUMBER-BADGE-CONTRAST:END -->';
const BLOCK = [
  START,
  `  <link id="qilyNumberBadgeContrastStylesheet" rel="stylesheet" href="${NUMBER_HREF}">`,
  `  <link id="qilyInteractiveHoverContrastStylesheet" rel="stylesheet" href="${HOVER_HREF}">`,
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
    .replace(/^[ \t]+$/gm, '');
}

function insert(html) {
  const cleaned = removeManaged(html);
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
}

function verifyPage(relative, requiredText) {
  const html = read(path.join(root, relative));
  if (!html.includes(NUMBER_HREF)) throw new Error(`${relative} missing number-badge contrast asset.`);
  if (!html.includes(HOVER_HREF)) throw new Error(`${relative} missing interactive-hover contrast asset.`);
  if (requiredText && !html.includes(requiredText)) throw new Error(`${relative} missing required action text: ${requiredText}`);
}

function main() {
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
