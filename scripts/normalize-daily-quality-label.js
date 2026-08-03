#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '..', 'qilylean', 'daily', '2026-08-04.html');
let html = fs.readFileSync(file, 'utf8');
html = html.replace(/QUALITY GATE｜/g, '质量门槛｜');
if (/\bGATE\b/.test(html)) throw new Error('Unexplained GATE label remains in 2026-08-04 brief.');
fs.writeFileSync(file, html.endsWith('\n') ? html : `${html}\n`, 'utf8');
process.stdout.write('Daily quality label normalized to Chinese wording.\n');
