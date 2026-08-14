#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const targets = [
  path.join(root, 'knowledge', 'terminology.html'),
  path.join(root, 'knowledge'),
  path.join(root, 'scripts')
];

const allowExt = new Set(['.html', '.js', '.css', '.json']);
const beforeRe = /启精益之智，聚企业之力。(?:\s|&nbsp;|&#183;|&middot;|·|•|・)*让改善形成体系，让精益产生力量。/g;
const after = '启精益之智，聚企业之力。让改善形成体系，让精益产生力量。';

function filesUnder(p) {
  if (!fs.existsSync(p)) return [];
  const st = fs.statSync(p);
  if (st.isFile()) return [p];
  const out = [];
  for (const name of fs.readdirSync(p)) {
    const next = path.join(p, name);
    const s = fs.statSync(next);
    if (s.isDirectory()) out.push(...filesUnder(next));
    else if (allowExt.has(path.extname(next))) out.push(next);
  }
  return out;
}

const files = [...new Set(targets.flatMap(filesUnder))];
let changed = 0;
let replacements = 0;
for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  let count = 0;
  const next = original.replace(beforeRe, () => { count += 1; return after; });
  if (next !== original) {
    fs.writeFileSync(file, next, 'utf8');
    changed += 1;
    replacements += count;
    console.log(`updated ${path.relative(root, file)}: ${count}`);
  }
}

const terminology = fs.readFileSync(path.join(root, 'knowledge', 'terminology.html'), 'utf8');
if (!terminology.includes(after)) throw new Error('Normalized OPL slogan not found in terminology template.');
if (/聚企业之力。(?:\s|&nbsp;|&#183;|&middot;|·|•|・)+让改善形成体系/.test(terminology)) {
  throw new Error('OPL slogan separator residue still exists in terminology template.');
}
console.log(`OPL slogan separator cleanup PASS: ${replacements} replacement(s) across ${changed} file(s).`);
