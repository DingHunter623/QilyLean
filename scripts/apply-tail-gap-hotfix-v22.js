#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const HOTFIX_HREF = '/site-tail-gap-hotfix-v22.css?v=20260810-remove-tail-gap-v22';
const HOTFIX_LINK = `  <link id="qilyTailGapHotfixV22Stylesheet" rel="stylesheet" href="${HOTFIX_HREF}">`;
const UX_PATTERN = /(^[ \t]*<link\b[^>]*(?:id=["']qilyLayoutTypographyClosureV20Stylesheet["']|href=["'][^"']*\/site-layout-typography-closure-v20\.css(?:\?v=[^"']*)?["'])[^>]*>[ \t]*$)/mi;
const MANAGED_END = '<!-- QILY-NUMBER-BADGE-CONTRAST:END -->';

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
    || /qilyCoreServiceDockClosureStylesheet/i.test(html)
    || /qilyLayoutFooterClosureStylesheet/i.test(html);
}

function patch(html) {
  let cleaned = html.replace(/^[ \t]*<link\b[^>]*(?:id=["']qilyTailGapHotfixV22Stylesheet["']|href=["'][^"']*\/site-tail-gap-hotfix-v22\.css(?:\?v=[^"']*)?["'])[^>]*>[ \t]*(?:\r?\n)?/gmi, '');

  const ux = cleaned.match(UX_PATTERN);
  if (ux && typeof ux.index === 'number') {
    const end = ux.index + ux[0].length;
    return cleaned.slice(0, end) + '\n' + HOTFIX_LINK + cleaned.slice(end);
  }

  const markerIndex = cleaned.indexOf(MANAGED_END);
  if (markerIndex >= 0) {
    return cleaned.slice(0, markerIndex) + HOTFIX_LINK + '\n' + cleaned.slice(markerIndex);
  }

  return cleaned.replace(/<\/head>/i, `${HOTFIX_LINK}\n</head>`);
}

let checked = 0;
let changed = 0;
walk(root, (file) => {
  if (!file.endsWith('.html')) return;
  const before = fs.readFileSync(file, 'utf8');
  if (!/<\/head>/i.test(before) || !isPublicPage(before)) return;
  checked += 1;
  const after = patch(before);
  if (after !== before) {
    fs.writeFileSync(file, after.endsWith('\n') ? after : after + '\n', 'utf8');
    changed += 1;
  }
  const current = fs.readFileSync(file, 'utf8');
  if (!current.includes(HOTFIX_HREF)) throw new Error(`V22 tail-gap hotfix missing after patch: ${path.relative(root, file)}`);
});

const css = fs.readFileSync(path.join(root, 'site-tail-gap-hotfix-v22.css'), 'utf8');
[
  'QILY-SITEWIDE-TAIL-GAP-HOTFIX-V22-20260810',
  'body.qily-tail-compact{',
  'min-height:0!important',
  'display:block!important',
  'body.qily-tail-compact > main',
  'flex:none!important'
].forEach((marker) => {
  if (!css.includes(marker)) throw new Error(`V22 tail-gap CSS marker missing: ${marker}`);
});

process.stdout.write(`V22 tail-gap hotfix materialized in ${checked} public pages; refreshed ${changed}.\n`);
