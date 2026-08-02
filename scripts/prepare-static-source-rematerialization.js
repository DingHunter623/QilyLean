#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const files = ['index.html', 'cooperation/index.html', 'qilylean/daily-insights.html'];

for (const relativePath of files) {
  const target = path.join(root, relativePath);
  if (!fs.existsSync(target)) continue;
  const current = fs.readFileSync(target, 'utf8');
  const prepared = current.replace(/\sdata-qily-static-source="[^"]*"/g, '');
  if (prepared !== current) fs.writeFileSync(target, prepared, 'utf8');
}

process.stdout.write('Prepared static pages for deterministic rematerialization.\n');
