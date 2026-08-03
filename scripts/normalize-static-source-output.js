#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const navigationVersion = '20260803-vi-contrast-restored-v1';
const files = [
  'index.html',
  'cooperation/index.html',
  'qilylean/daily-insights.html',
  'projects/index.html',
  'trust/index.html',
  'projects/qilylean-commercial-deliveries/index.html',
  'projects/qilylean-commercial-deliveries/delivery-record-template.html',
  'projects/qilylean-commercial-deliveries/review-authorization-template.html'
];

for (const relativePath of files) {
  const target = path.join(root, relativePath);
  if (!fs.existsSync(target)) continue;
  let content = fs.readFileSync(target, 'utf8');
  let previous;
  do {
    previous = content;
    content = content
      .replace(/data-qily-static-source="([^"]+)"\s+data-qily-static-source="\1"/g, 'data-qily-static-source="$1"')
      .replace(/site-navigation\.js\?v=[^"'\s<]+/g, `site-navigation.js?v=${navigationVersion}`)
      .replace(/^[ \t]+(?=<!-- (?:QILY-[A-Z0-9-]+|SITE-METADATA:[A-Z0-9-]+):(?:START|END) -->)/gm, '')
      .replace(/^[ \t]+$/gm, '')
      .replace(/<\/section>\s*(?=<!-- (?:QILY-[A-Z0-9-]+|SITE-METADATA:[A-Z0-9-]+):START -->)/g, '</section>\n\n')
      .replace(/(<!-- (?:QILY-[A-Z0-9-]+|SITE-METADATA:[A-Z0-9-]+):END -->)\s*(?=<!--|<section)/g, '$1\n\n')
      .replace(/\n{3,}/g, '\n\n');
  } while (content !== previous);
  const normalized = content.trimEnd() + '\n';
  if (fs.readFileSync(target, 'utf8') !== normalized) fs.writeFileSync(target, normalized, 'utf8');
}

process.stdout.write(`Normalized static-source attributes, QILY markers, restored VI navigation cache ${navigationVersion} and whitespace.\n`);
