#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const START = '// QILY-FOOTER-STANDARD-V28:START';
const END = '// QILY-FOOTER-STANDARD-V28:END';
const OLD_START = '// QILY-FOOTER-STANDARD-V26:START';
const OLD_END = '// QILY-FOOTER-STANDARD-V26:END';

function file(relative) { return path.join(root, relative); }
function read(relative) { return fs.readFileSync(file(relative), 'utf8'); }
function escapeRegExp(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function stripBlock(source, start, end) {
  const expression = new RegExp(`\\n?${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}\\n?`, 'm');
  return source.replace(expression, '\n');
}

function patchGenerator(relative, label) {
  const source = read(relative);
  const block = `${START}\n// ${label}: keep the single authoritative V28 footer after generated HTML updates.\nif (require.main === module && !process.argv.includes('--check')) {\n  require('./materialize-footer-standard-v28.js');\n}\n${END}`;
  let next = stripBlock(source, OLD_START, OLD_END);
  next = stripBlock(next, START, END);
  next = `${next.trimEnd()}\n\n${block}\n`;
  if (next === source) return false;
  if (checkOnly) throw new Error(`${relative}: V28 publication hook is not current`);
  fs.writeFileSync(file(relative), next, 'utf8');
  return true;
}

const changed = [];
[
  ['scripts/build-daily-archive.js', 'Daily archive generator'],
  ['scripts/build-site-metadata.js', 'Site metadata generator']
].forEach(([relative, label]) => {
  if (patchGenerator(relative, label)) changed.push(relative);
});

if (checkOnly) process.stdout.write('V28 publication-source integration contract passed.\n');
else process.stdout.write(`V28 publication-source integration updated ${changed.length} file(s): ${changed.join(', ') || 'none'}.\n`);
