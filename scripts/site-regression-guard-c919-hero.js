#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const asset = path.join(root, 'qilylean', 'c919-strategy-hero-v14.png');
const css = fs.readFileSync(path.join(root, 'styles', 'qily-c919-digital-flagship-hero-v1.css'), 'utf8');

function assert(ok, msg) {
  if (!ok) throw new Error(msg);
}

assert(html.includes('<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:START -->'), 'C919 V4 homepage start marker missing');
assert(html.includes('<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:END -->'), 'C919 V4 homepage end marker missing');
assert(html.includes('/styles/qily-c919-digital-flagship-hero-v1.css?v=20260822-latest-aircraft-v7'), 'Latest-aircraft V7 stylesheet cache key missing');
assert(html.includes('/qilylean/c919-strategy-hero-v14.png'), 'Latest V14 aircraft model asset is not rendered');
assert(html.indexOf('QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:START') < html.indexOf('<section class="hero">'), 'C919 is not the first homepage content visual');
assert(!html.includes('QILY-C919-DIGITAL-FLAGSHIP-HERO-V1'), 'Retired C919 V1 markup returned');
assert(!html.includes('QILY-C919-DIGITAL-FLAGSHIP-HERO-V2'), 'Retired C919 V2 markup returned');
assert(fs.existsSync(asset), `Latest V14 aircraft asset is missing: ${path.basename(asset)}`);
assert(css.includes('C919 Digital Flagship Hero V6'), 'C919 stylesheet is not V6');

console.log('PASS: C919 V4 is the homepage first content visual and the latest V14 aircraft asset is present.');
