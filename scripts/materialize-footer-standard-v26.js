#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const SCRIPT_SRC = '/site-footer-standard-v26.js?v=20260810-footer-global-v26';
const SCRIPT_TAG = `<script defer id="qilyFooterStandardV26Script" data-qily-footer-standard="v26" src="${SCRIPT_SRC}"></script>`;

function listHtml(directory, prefix = '') {
  const out = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.wrangler', '.cache'].includes(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) out.push(...listHtml(absolute, relative));
    else if (entry.isFile() && /\.html?$/i.test(entry.name)) out.push(relative);
  }
  return out;
}

function normalize(html) {
  if (!/<html[\s>]/i.test(html) || !/<head[\s>]/i.test(html)) return html;
  let next = html.replace(/\s*<script\b[^>]*(?:id=["']qilyFooterStandardV26Script["']|src=["'][^"']*site-footer-standard-v26\.js[^"']*["'])[^>]*><\/script>\s*/gi, '\n');
  next = next.replace(/<\/head>/i, `  ${SCRIPT_TAG}\n</head>`);
  return next;
}

const files = listHtml(root);
let changed = 0;
let eligible = 0;
const changedFiles = [];

for (const relative of files) {
  const absolute = path.join(root, relative);
  const before = fs.readFileSync(absolute, 'utf8');
  if (!/<html[\s>]/i.test(before) || !/<head[\s>]/i.test(before)) continue;
  eligible += 1;
  const after = normalize(before);
  const matches = after.match(/site-footer-standard-v26\.js\?v=20260810-footer-global-v26/g) || [];
  if (matches.length !== 1) throw new Error(`${relative}: expected exactly one V26 footer runtime, found ${matches.length}`);
  if (after === before) continue;
  if (checkOnly) throw new Error(`${relative}: V26 footer runtime is not materialized`);
  fs.writeFileSync(absolute, after, 'utf8');
  changed += 1;
  changedFiles.push(relative);
}

if (checkOnly) {
  process.stdout.write(`V26 footer materialization contract passed for ${eligible} HTML files.\n`);
} else {
  process.stdout.write(`V26 footer runtime materialized in ${changed}/${eligible} HTML files.\n`);
  if (changedFiles.length) process.stdout.write(changedFiles.slice(0, 40).join('\n') + (changedFiles.length > 40 ? '\n…\n' : '\n'));
}
