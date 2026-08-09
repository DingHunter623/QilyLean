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

// The canonical static source has moved to home-core-v2 and the sitewide service
// wording is now "目视化项目设计与交付". Normalize the legacy validation aliases
// before materialization so the validator checks the current canonical vocabulary.
const materializer = path.join(root, 'scripts', 'materialize-static-core-pages.js');
if (fs.existsSync(materializer)) {
  const current = fs.readFileSync(materializer, 'utf8');
  const prepared = current
    .replace('data-qily-static-source="home-core-v1"', 'data-qily-static-source="home-core-v2"')
    .replace("'目视化项目设计与实施',", "'目视化项目设计与交付',");
  if (prepared !== current) fs.writeFileSync(materializer, prepared, 'utf8');
}

process.stdout.write('Prepared static pages and current validation aliases for deterministic rematerialization.\n');
