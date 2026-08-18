#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const retainedAssets = [
  path.join(root, 'qilylean', 'c919-strategy-hero-approved-20260818.png'),
  path.join(root, 'qilylean', 'c919-strategy-hero-v13.png')
];

function assert(ok, msg) {
  if (!ok) throw new Error(msg);
}

// Temporary release policy: retain C919 artwork sources, but do not render the model or its overview anywhere on the homepage.
assert(!html.includes('<!-- QILY-C919-STRATEGY-HERO:START -->'), 'C919 homepage hero start marker must remain offline');
assert(!html.includes('<!-- QILY-C919-STRATEGY-HERO:END -->'), 'C919 homepage hero end marker must remain offline');
assert(!html.includes('<!-- QILY-C919-HERO-STYLES:START -->'), 'C919 homepage hero styles must remain offline');
assert(!html.includes('<!-- QILY-C919-HERO-STYLES:END -->'), 'C919 homepage hero styles must remain offline');
assert(!/qily-c919-flightmap/i.test(html), 'C919 homepage flight-map markup unexpectedly returned');
assert(!/c919-strategy-hero/i.test(html), 'Homepage still contains a C919 model reference, preload, or social-image hook');

for (const asset of retainedAssets) {
  assert(fs.existsSync(asset), `Retained C919 source asset is missing: ${path.basename(asset)}`);
}

console.log('C919 homepage guard passed: model and overview remain offline; source artwork retained for future optimized release.');
