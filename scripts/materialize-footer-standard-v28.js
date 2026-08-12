#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const CSS_VERSION = '20260812-footer-runtime-stable-v34';
const SCRIPT_VERSION = '20260812-footer-runtime-stable-v34';
const CSS_HREF = `/site-footer-standard-v28.css?v=${CSS_VERSION}`;
const SCRIPT_SRC = `/site-footer-standard-v28.js?v=${SCRIPT_VERSION}`;
const CSS_TAG = `<link id="qilyFooterStandardV28Stylesheet" rel="stylesheet" href="${CSS_HREF}">`;
const SCRIPT_TAG = `<script defer id="qilyFooterStandardV28Script" data-qily-footer-standard="v34" src="${SCRIPT_SRC}"></script>`;

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
  let next = html;

  next = next.replace(/\s*<link\b[^>]*(?:id=["']qilyFooterStandardV28Stylesheet["']|href=["'][^"']*site-footer-standard-v28\.css[^"']*["'])[^>]*>\s*/gi, '\n');
  next = next.replace(/\s*<script\b[^>]*(?:id=["']qilyFooterStandardV28Script["']|src=["'][^"']*site-footer-standard-v28\.js[^"']*["'])[^>]*><\/script>\s*/gi, '\n');
  next = next.replace(/\s*<script\b[^>]*(?:id=["']qilyFooterStandardV26Script["']|src=["'][^"']*site-footer-standard-v26\.js[^"']*["'])[^>]*><\/script>\s*/gi, '\n');

  next = next.replace(/<\/head>/i, `  ${CSS_TAG}\n  ${SCRIPT_TAG}\n</head>`);
  return next;
}

const files = listHtml(root);
let eligible = 0;
let changed = 0;
const changedFiles = [];

for (const relative of files) {
  const absolute = path.join(root, relative);
  const before = fs.readFileSync(absolute, 'utf8');
  if (!/<html[\s>]/i.test(before) || !/<head[\s>]/i.test(before)) continue;
  eligible += 1;
  const after = normalize(before);

  const cssMatches = after.match(new RegExp(`site-footer-standard-v28\\.css\\?v=${CSS_VERSION}`, 'g')) || [];
  const scriptMatches = after.match(new RegExp(`site-footer-standard-v28\\.js\\?v=${SCRIPT_VERSION}`, 'g')) || [];
  const v26Matches = after.match(/site-footer-standard-v26\.js/g) || [];
  if (cssMatches.length !== 1) throw new Error(`${relative}: expected exactly one V33 footer stylesheet reference, found ${cssMatches.length}`);
  if (scriptMatches.length !== 1) throw new Error(`${relative}: expected exactly one V33 footer runtime reference, found ${scriptMatches.length}`);
  if (v26Matches.length !== 0) throw new Error(`${relative}: obsolete V26 footer runtime still present`);

  if (after === before) continue;
  if (checkOnly) throw new Error(`${relative}: V34 stable footer standard is not materialized`);
  fs.writeFileSync(absolute, after, 'utf8');
  changed += 1;
  changedFiles.push(relative);
}

if (checkOnly) {
  process.stdout.write(`V34 stable footer contract passed for ${eligible} HTML files.\n`);
} else {
  process.stdout.write(`V34 stable footer standard materialized in ${changed}/${eligible} HTML files.\n`);
  if (changedFiles.length) process.stdout.write(changedFiles.slice(0, 40).join('\n') + (changedFiles.length > 40 ? '\n…\n' : '\n'));
}
