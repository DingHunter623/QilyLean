#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const OLD = '/site-visual-readability-v4.css?v=20260813-visual-readability-v4';
const NEXT = '/site-visual-readability-v4.css?v=20260813-visual-readability-v5-compact-contact-factory';
const textExt = new Set(['.html','.js','.md','.yml','.yaml']);
const skipDirs = new Set(['.git','node_modules']);
let changed = 0;
let scanned = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (textExt.has(path.extname(entry.name).toLowerCase())) patch(full);
  }
}

function patch(file) {
  scanned += 1;
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch (_) { return; }
  if (!text.includes(OLD)) return;
  const next = text.split(OLD).join(NEXT);
  if (next === text) return;
  fs.writeFileSync(file, next, 'utf8');
  changed += 1;
}

walk(root);

const css = fs.readFileSync(path.join(root, 'site-visual-readability-v4.css'), 'utf8');
const requiredCss = [
  'qily-modal-panel.qily-contact-panel',
  'width:220px!important',
  'min-height:42px!important',
  'body.factory-layout-page .factory-plan-thumb-grid .factory-plan-preview',
  'background:#f8fcfb!important',
  'color:#0b4651!important'
];
for (const token of requiredCss) {
  if (!css.includes(token)) throw new Error('Visual V5 CSS guard missing: ' + token);
}

const factory = fs.readFileSync(path.join(root, 'projects', 'factory-layout', 'index.html'), 'utf8');
const knowledge = fs.readFileSync(path.join(root, 'knowledge', 'index.html'), 'utf8');
if (!factory.includes(NEXT)) throw new Error('Factory layout page did not receive V5 cache version');
if (!knowledge.includes(NEXT)) throw new Error('Knowledge page did not receive V5 cache version');
if (!factory.includes('factory-plan-thumb-grid')) throw new Error('Factory plan thumbnail grid missing');

console.log(`Visual V5 cache-bust complete: ${changed} files changed / ${scanned} text files scanned.`);
