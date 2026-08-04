#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const VERSION = '20260805-number-badge-contrast-v1';
const HREF = `/site-number-badge-contrast-v1.css?v=${VERSION}`;
const START = '<!-- QILY-NUMBER-BADGE-CONTRAST:START -->';
const END = '<!-- QILY-NUMBER-BADGE-CONTRAST:END -->';
const BLOCK = `${START}\n  <link id="qilyNumberBadgeContrastStylesheet" rel="stylesheet" href="${HREF}">\n${END}`;

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
  const css = read(path.join(root, 'site-number-badge-contrast-v1.css'));
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
    if (!css.includes(marker)) throw new Error(`Number-badge contrast marker missing: ${marker}`);
  });
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
  const sequence = ['<b>1</b>', '<b>2</b>', '<b>3</b>', '<b>4</b>'];
  sequence.forEach((marker) => {
    if (!onboarding.includes(marker)) throw new Error(`Onboarding process marker missing: ${marker}`);
  });
  if (!onboarding.includes(HREF)) throw new Error('Onboarding page missing number-badge contrast asset.');

  const cooperation = read(path.join(root, 'cooperation', 'index.html'));
  if (!cooperation.includes(HREF)) throw new Error('Cooperation page missing number-badge contrast asset.');
  if (!/service-number/i.test(cooperation)) throw new Error('Cooperation service-number markers are missing.');

  process.stdout.write(`Number-badge contrast materialized in ${checked} public pages; refreshed ${changed}.\n`);
}

main();
