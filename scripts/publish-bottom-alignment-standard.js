#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const asset = '/site-bottom-alignment-v1.css?v=20260804-bottom-align-v1';
const tag = `  <link id="qilyBottomAlignmentStylesheet" rel="stylesheet" href="${asset}">`;

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function writeIfChanged(file, value) {
  const normalized = value.endsWith('\n') ? value : `${value}\n`;
  if (read(file) === normalized) return false;
  fs.writeFileSync(file, normalized, 'utf8');
  return true;
}

function walk(directory, callback) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.cache'].includes(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full, callback);
    else callback(full);
  }
}

function install(page) {
  if (!/<\/head>/i.test(page)) return page;
  const cleaned = page
    .replace(/\s*<link\b[^>]*id=["']qilyBottomAlignmentStylesheet["'][^>]*>\s*/gi, '\n')
    .replace(/\s*<link\b[^>]*href=["'][^"']*\/site-bottom-alignment-v1\.css\?v=[^"']+["'][^>]*>\s*/gi, '\n');
  return cleaned.replace(/<\/head>/i, `${tag}\n</head>`);
}

function main() {
  let checked = 0;
  let changed = 0;
  walk(root, (file) => {
    if (!file.endsWith('.html')) return;
    const before = read(file);
    if (!/<\/head>/i.test(before)) return;
    checked += 1;
    const after = install(before);
    if (after !== before && writeIfChanged(file, after)) changed += 1;
  });
  process.stdout.write(`Bottom-alignment standard installed in ${checked} HTML pages; refreshed ${changed}.\n`);
}

main();
