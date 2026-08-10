#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const UX_LINK = '  <link id="qilyLayoutTypographyClosureV20Stylesheet" rel="stylesheet" href="/site-layout-typography-closure-v20.css?v=20260810-footer-visual-v21">';
const TAIL_GAP_LINK = '  <link id="qilyTailGapHotfixV22Stylesheet" rel="stylesheet" href="/site-tail-gap-hotfix-v22.css?v=20260810-remove-tail-gap-v22">';
const TARGETS = [
  'index.html',
  'knowledge/index.html',
  'knowledge/terminology.html',
  'capabilities/index.html',
  'projects/index.html',
  'cooperation/index.html',
  'trust/index.html',
  'qilylean/daily-insights.html'
];

function patch(html) {
  const cleaned = html
    .replace(/^[ \t]*<link\b[^>]*(?:id=["']qilyLayoutTypographyClosureV20Stylesheet["']|href=["'][^"']*\/site-layout-typography-closure-v20\.css(?:\?v=[^"']*)?["'])[^>]*>[ \t]*(?:\r?\n)?/gmi, '')
    .replace(/^[ \t]*<link\b[^>]*(?:id=["']qilyTailGapHotfixV22Stylesheet["']|href=["'][^"']*\/site-tail-gap-hotfix-v22\.css(?:\?v=[^"']*)?["'])[^>]*>[ \t]*(?:\r?\n)?/gmi, '');
  const marker = '<!-- QILY-NUMBER-BADGE-CONTRAST:END -->';
  const end = cleaned.indexOf(marker);
  if (end < 0) throw new Error('Managed interaction block is missing.');
  return cleaned.slice(0, end) + UX_LINK + '\n' + TAIL_GAP_LINK + '\n' + cleaned.slice(end);
}

let changed = 0;
for (const relative of TARGETS) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) continue;
  const before = fs.readFileSync(file, 'utf8');
  const after = patch(before);
  if (after !== before) {
    fs.writeFileSync(file, after.endsWith('\n') ? after : after + '\n', 'utf8');
    changed += 1;
  }
  const current = fs.readFileSync(file, 'utf8');
  if (!current.includes('site-layout-typography-closure-v20.css?v=20260810-footer-visual-v21')) {
    throw new Error(`V21 footer closure missing after patch: ${relative}`);
  }
  if (!current.includes('site-tail-gap-hotfix-v22.css?v=20260810-remove-tail-gap-v22')) {
    throw new Error(`V22 tail-gap hotfix missing after patch: ${relative}`);
  }
}

process.stdout.write(`V21 footer visuals + V22 tail-gap hotfix preserved in generated core pages; refreshed ${changed}.\n`);
