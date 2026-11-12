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

const getSvg = (viewBox) => {
  const start = html.indexOf('<svg viewBox="' + viewBox + '"');
  const end = html.indexOf('</svg>', start);
  if (start < 0 || end < 0) throw new Error('Required article diagram is missing: ' + viewBox);
  return html.slice(start, end + 6);
};
const fontCounts = (svg) => {
  const counts = new Map();
  for (const match of svg.matchAll(/font-size="(\d+)"/g)) {
    const size = Number(match[1]);
    counts.set(size, (counts.get(size) || 0) + 1);
  }
  return counts;
};
const assertFontCounts = (svg, expected, label) => {
  const actual = fontCounts(svg);
  for (const [size, count] of Object.entries(expected)) {
    if ((actual.get(Number(size)) || 0) !== count) {
      throw new Error(label + ' typography drift at ' + size + 'px: expected ' + count + ', got ' + (actual.get(Number(size)) || 0));
    }
  }
  const expectedTotal = Object.values(expected).reduce((sum, count) => sum + count, 0);
  const actualTotal = [...actual.values()].reduce((sum, count) => sum + count, 0);
  if (actualTotal !== expectedTotal) throw new Error(label + ' contains an unapproved SVG text size.');
  if ([...actual.keys()].some(size => size < 15)) {
    throw new Error(label + ' still contains undersized SVG text below 15px.');
  }
};
const assertUnifiedArrows = (svg, expectedCount, label) => {
  const arrows = [...svg.matchAll(/<path\b[^>]*class="vi-flow-arrow"[^>]*data-qily-unified-arrow="v4"[^>]*\/>/g)];
  if (arrows.length !== expectedCount) {
    throw new Error(label + ' must contain ' + expectedCount + ' site-standard V4 flow arrows; found ' + arrows.length + '.');
  }
  if (/marker-end=|policyArrow|knowledgeArrow/.test(svg)) {
    throw new Error(label + ' still uses a detached marker-end arrowhead.');
  }
};

const regional = getSvg('0 0 1080 220');
assertFontCounts(regional, {23:3,16:3,18:2,19:1}, 'Regional-path diagram');
assertUnifiedArrows(regional, 2, 'Regional-path diagram');
const policy = getSvg('0 0 1080 330');
assertFontCounts(policy, {19:4,17:12,15:4,16:1}, 'Policy-chain diagram');
assertUnifiedArrows(policy, 3, 'Policy-chain diagram');
const leanAi = getSvg('0 0 1080 570');
assertFontCounts(leanAi, {18:1,19:7,20:1}, 'Lean/digital/AI architecture diagram');
assertUnifiedArrows(leanAi, 2, 'Lean/digital/AI architecture diagram');
const knowledge = getSvg('0 0 1080 270');
assertFontCounts(knowledge, {19:5,16:11}, 'Knowledge-loop diagram');
assertUnifiedArrows(knowledge, 4, 'Knowledge-loop diagram');

if (!block.includes('#qilyHometownManufacturingPaper svg .vi-flow-arrow{fill:#0f4b5a!important;stroke:none!important}')) {
  throw new Error('All article diagrams must inherit the official QilyLean V4 arrow color and solid geometry.');
}

if (!block.includes('@media(max-width:1100px)') ||
    !block.includes('width:1080px!important;') ||
    !block.includes('overflow-x:auto!important;') ||
    !block.includes('overscroll-behavior-inline:contain!important;')) {
  throw new Error('Dense SVG diagrams must remain readable through local horizontal scrolling on tablet/mobile widths.');
}

console.log('PASS: H1/H2/H3 and normal body copy remain under sitewide VI authority.');
console.log('PASS: all 15 approved small-text rules are retained at original size +2px.');
console.log('PASS: all four SVG diagrams preserve title hierarchy and enlarge small labels by +2px.');
console.log('PASS: all 11 directional arrows use the solid QilyLean V4 arrow geometry.');
console.log('PASS: no local article end-card palette override; shared VI surfaces remain authoritative.');
