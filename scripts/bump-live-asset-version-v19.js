#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const self = path.resolve(__filename);

const replacements = [
  ['20260810-stable-layout-v18', '20260812-runtime-stability-v20'],
  ['20260810-native-navigation-stable-v18', '20260812-native-navigation-stable-v20']
];

const textExtensions = new Set([
  '.js', '.mjs', '.cjs', '.ts', '.py', '.yml', '.yaml', '.html', '.htm',
  '.json', '.xml', '.md', '.css'
]);

function walk(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.cache'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, callback);
    else callback(full);
  }
}

let scanned = 0;
let changed = 0;
let replacementsCount = 0;
const changedFiles = [];

walk(root, (file) => {
  const relative = path.relative(root, file).replace(/\\/g, '/');
  if (path.resolve(file) === self) return;
  // GitHub Actions GITHUB_TOKEN cannot push workflow-file changes from inside a workflow.
  // Workflow references are updated explicitly through the GitHub connector instead.
  if (relative.startsWith('.github/workflows/')) return;
  if (!textExtensions.has(path.extname(file).toLowerCase())) return;

  scanned += 1;
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  let fileReplacements = 0;

  for (const [from, to] of replacements) {
    const parts = after.split(from);
    if (parts.length > 1) {
      fileReplacements += parts.length - 1;
      after = parts.join(to);
    }
  }

  if (after === before) return;
  fs.writeFileSync(file, after, 'utf8');
  changed += 1;
  replacementsCount += fileReplacements;
  changedFiles.push(relative);
});

const mustContainV19 = [
  'site-navigation.js',
  'scripts/publish-number-badge-contrast.js',
  'scripts/validate-sitewide-interaction-clarity.js',
  'index.html',
  'knowledge/index.html',
  'capabilities/index.html',
  'cooperation/index.html'
];

for (const relative of mustContainV19) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) throw new Error(`Required live source missing: ${relative}`);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes('20260812-runtime-stability-v20')) {
    throw new Error(`V19 layout reference missing after cache-bust: ${relative}`);
  }
  if (relative.endsWith('.html') && !text.includes('20260812-native-navigation-stable-v20')) {
    throw new Error(`V19 navigation reference missing after cache-bust: ${relative}`);
  }
}

process.stdout.write(
  `Live asset cache-bust upgraded ${replacementsCount} references in ${changed} files; scanned ${scanned}.\n`
);
if (changedFiles.length) {
  process.stdout.write(changedFiles.slice(0, 40).join('\n') + (changedFiles.length > 40 ? '\n…\n' : '\n'));
}
