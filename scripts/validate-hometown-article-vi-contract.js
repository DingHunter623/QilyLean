'use strict';

const fs = require('node:fs');
const path = require('node:path');

const file = path.join(process.cwd(), 'links/hometown-manufacturing/index.html');
const html = fs.readFileSync(file, 'utf8');
const marker = '<style id="qilyHometownManufacturingRefinementV1">';
const start = html.indexOf(marker);
const end = html.indexOf('</style>', start);
if (start < 0 || end < 0) throw new Error('Missing hometown article VI refinement block.');

const block = html.slice(start, end + 8);
const expected = new Map([
  ['#qilyHometownManufacturingPaper>.hero .eyebrow', '17px'],
  ['#qilyHometownManufacturingPaper>.hero .stage', '16px'],
  ['#qilyHometownManufacturingPaper .paper-meta span', '15px'],
  ['#qilyHometownManufacturingPaper .paper-hero-figure figcaption', '15px'],
  ['#qilyHometownManufacturingPaper .paper-keywords', '17px'],
  ['#qilyHometownManufacturingPaper .paper-toc a', '16px'],
  ['#qilyHometownManufacturingPaper .paper-kicker', '15px'],
  ['#qilyHometownManufacturingPaper .paper-figure figcaption', '16px'],
  ['#qilyHometownManufacturingPaper .paper-card small', '14px'],
  ['#qilyHometownManufacturingPaper .paper-card p', '17px'],
  ['#qilyHometownManufacturingPaper .paper-table, #qilyHometownManufacturingPaper .paper-table th, #qilyHometownManufacturingPaper .paper-table td', '17px'],
  ['#qilyHometownManufacturingPaper .paper-step b', '16px'],
  ['#qilyHometownManufacturingPaper .paper-step p', '17px'],
  ['#qilyHometownManufacturingPaper .paper-source-list li', '17px'],
  ['#qilyHometownManufacturingPaper .paper-note', '16px'],
]);

const seen = new Set();
for (const match of block.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  const selector = match[1].trim().replace(/\s+/g, ' ');
  const declarations = [...match[2].matchAll(/font-size\s*:\s*([^;!]+)\s*!important/g)]
    .map(item => item[1].trim());
  if (!declarations.length) continue;
  if (!expected.has(selector)) {
    throw new Error('Unapproved local font-size override (heading/body changes are prohibited): ' + selector);
  }
  if (declarations.length !== 1 || declarations[0] !== expected.get(selector)) {
    throw new Error('Small-text +2px contract mismatch for ' + selector + ': ' + declarations.join(','));
  }
  seen.add(selector);
}
for (const selector of expected.keys()) {
  if (!seen.has(selector)) throw new Error('Required small-text +2px rule is missing: ' + selector);
}

if (!html.includes('site-visual-readability-v5.css')) {
  throw new Error('The page must retain the sitewide VI heading authority stylesheet.');
}
if (block.includes('.paper-end-card') || /\.paper-(?:abstract|section|end-card).*\bh[123]\b[^{}]*\{[^}]*font-size/i.test(block)) {
  throw new Error('Article module/title styling must inherit the sitewide VI authority.');
}

const svgStart = html.indexOf('<svg viewBox="0 0 1080 220"');
const svgEnd = html.indexOf('</svg>', svgStart);
if (svgStart < 0 || svgEnd < 0) throw new Error('Regional-path diagram is missing.');
const svg = html.slice(svgStart, svgEnd + 6);
const count = (value) => (svg.match(new RegExp('font-size="' + value + '"', 'g')) || []).length;
if (count(23) !== 3 || count(14) !== 3 || count(16) !== 2 || count(17) !== 1) {
  throw new Error('Regional-path diagram typography has drifted from its approved hierarchy.');
}

console.log('PASS: H1/H2/H3 and normal body copy remain under sitewide VI authority.');
console.log('PASS: exactly 15 approved small-text rules are retained at original size +2px.');
console.log('PASS: regional-path diagram preserves node-title hierarchy and +2px small labels.');
console.log('PASS: no local article end-card palette override; shared VI surfaces remain authoritative.');
