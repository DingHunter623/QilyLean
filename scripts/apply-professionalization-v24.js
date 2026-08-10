#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const START = '// QILY-PROFESSIONALIZATION-V24:START';
const END = '// QILY-PROFESSIONALIZATION-V24:END';

function target(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath) {
  return fs.readFileSync(target(relativePath), 'utf8');
}

function write(relativePath, content) {
  const file = target(relativePath);
  const normalized = content.endsWith('\n') ? content : `${content}\n`;
  const current = fs.readFileSync(file, 'utf8');
  if (current === normalized) return false;
  if (checkOnly) throw new Error(`${relativePath}: V24 source integration is not current`);
  fs.writeFileSync(file, normalized, 'utf8');
  return true;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function upsertRuntimeHook(source, label) {
  const block = `${START}\n// ${label}: keep consolidated closure CSS, freshness metadata and render optimizations materialized.\nif (require.main === module && !process.argv.includes('--check')) {\n  require('./materialize-professionalization-v24.js');\n}\n${END}`;
  const expression = new RegExp(`${escapeRegExp(START)}[\\s\\S]*?${escapeRegExp(END)}`, 'm');
  if (expression.test(source)) return source.replace(expression, block);
  return `${source.trimEnd()}\n\n${block}\n`;
}

function patchBuildDailyWorkflow(source) {
  let next = source;

  if (!next.includes('      - "scripts/materialize-professionalization-v24.js"')) {
    const anchor = '      - "scripts/build-daily-archive.js"';
    if (!next.includes(anchor)) throw new Error('build-daily-archive.yml: trigger anchor missing');
    next = next.replace(anchor, `${anchor}\n      - "scripts/materialize-professionalization-v24.js"`);
  }

  if (!next.includes('          node --check scripts/materialize-professionalization-v24.js')) {
    const anchor = '          node --check scripts/normalize-daily-quality-label.js';
    if (!next.includes(anchor)) throw new Error('build-daily-archive.yml: syntax-check anchor missing');
    next = next.replace(anchor, `${anchor}\n          node --check scripts/materialize-professionalization-v24.js`);
  }

  if (!next.includes('      - name: Apply V24 professionalization closure')) {
    const anchor = '      - name: Validate trust brief metadata contract';
    if (!next.includes(anchor)) throw new Error('build-daily-archive.yml: finalization anchor missing');
    const step = `      - name: Apply V24 professionalization closure\n        run: node scripts/materialize-professionalization-v24.js\n\n`;
    next = next.replace(anchor, `${step}${anchor}`);
  }

  const slash = "\\";
  const gitAddInsertions = [
    `            capabilities/index.html ${slash}`,
    `            projects/index.html ${slash}`,
    `            experience/index.html ${slash}`,
    `            site-closure-bundle-v24.css ${slash}`,
    `            qilylean/daily/feed.xml ${slash}`
  ];
  if (!next.includes(`            site-closure-bundle-v24.css ${slash}`)) {
    const anchor = `            sitemap.xml ${slash}`;
    if (!next.includes(anchor)) throw new Error('build-daily-archive.yml: git-add anchor missing');
    next = next.replace(anchor, `${gitAddInsertions.join('\n')}\n${anchor}`);
  }

  return next;
}

const outputs = new Map();
outputs.set('scripts/build-daily-archive.js', upsertRuntimeHook(read('scripts/build-daily-archive.js'), 'Daily archive generator'));
outputs.set('scripts/build-site-metadata.js', upsertRuntimeHook(read('scripts/build-site-metadata.js'), 'Site metadata generator'));
outputs.set('.github/workflows/build-daily-archive.yml', patchBuildDailyWorkflow(read('.github/workflows/build-daily-archive.yml')));

const changed = [];
for (const [relativePath, content] of outputs) {
  if (write(relativePath, content)) changed.push(relativePath);
}

if (checkOnly) {
  process.stdout.write('V24 source integration contract passed.\n');
} else {
  process.stdout.write(`V24 source integration updated ${changed.length} file(s): ${changed.join(', ') || 'none'}.\n`);
}
