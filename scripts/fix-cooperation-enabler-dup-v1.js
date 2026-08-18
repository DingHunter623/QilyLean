#!/usr/bin/env node
'use strict';

/* Remove duplicated Digital Enablers sections while preserving the first canonical block. */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const rel = 'cooperation/index.html';
const file = path.join(root, rel);
let html = fs.readFileSync(file, 'utf8');

const re = /<section class="module-section alt" id="engineering-enablers">[\s\S]*?<\/section>/g;
const before = html.match(re) || [];
if (before.length === 0) throw new Error('Digital Enablers section missing');

let seen = 0;
html = html.replace(re, block => {
  seen += 1;
  return seen === 1 ? block : '';
});

const after = html.match(re) || [];
if (after.length !== 1) throw new Error(`Digital Enablers section count must be 1, got ${after.length}`);
const canonical = after[0];
['<span class="service-number">04</span>','<span class="service-number">05</span>','<span class="service-number">06</span>'].forEach(token => {
  if (!canonical.includes(token)) throw new Error(`Canonical Digital Enablers block missing ${token}`);
});
if (!canonical.includes('三项增强能力，不与三大核心业务同级')) throw new Error('Digital Enablers hierarchy copy missing');

const out = html.endsWith('\n') ? html : `${html}\n`;
if (fs.readFileSync(file, 'utf8') !== out) fs.writeFileSync(file, out, 'utf8');
process.stdout.write(`Cooperation Digital Enablers deduplicated: ${before.length} -> 1.\n`);
