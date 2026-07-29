#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const targets = [
  path.join(root, 'qilylean', 'daily-insights.html'),
  ...fs.readdirSync(path.join(root, 'qilylean', 'daily'))
    .filter((name) => /^\d{4}-\d{2}-\d{2}\.html$/.test(name))
    .map((name) => path.join(root, 'qilylean', 'daily', name))
];

for (const file of targets) {
  const source = fs.readFileSync(file, 'utf8');
  const next = source.replace(/\/qilylean\/daily-briefs\.css\?v=[^"']+/g, '/qilylean/daily-briefs.css?v=20260729-engineering-system-v11');
  if (next !== source) fs.writeFileSync(file, next);
}

process.stdout.write(`Updated daily brief stylesheet version in ${targets.length} pages.\n`);
