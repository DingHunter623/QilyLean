#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const files = ['index.html', 'cooperation/index.html', 'qilylean/daily-insights.html'];

for (const relativePath of files) {
  const target = path.join(root, relativePath);
  if (!fs.existsSync(target)) continue;
  let content = fs.readFileSync(target, 'utf8');
  let previous;
  do {
    previous = content;
    content = content.replace(/data-qily-static-source="([^"]+)"\s+data-qily-static-source="\1"/g, 'data-qily-static-source="$1"');
  } while (content !== previous);
  const normalized = content.endsWith('\n') ? content : `${content}\n`;
  if (fs.readFileSync(target, 'utf8') !== normalized) fs.writeFileSync(target, normalized, 'utf8');
}

process.stdout.write('Normalized static-source attributes.\n');
