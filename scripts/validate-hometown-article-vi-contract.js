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
  ["#qilyHometownManufacturingPaper>.hero .eyebrow", "var(--qily-v5-section-kicker,21px)"],
  ["#qilyHometownManufacturingPaper>.hero .stage", "var(--qily-v5-small,20px)"],
  ["#qilyHometownManufacturingPaper .paper-meta span", "var(--qily-v5-small,20px)"],
  ["#qilyHometownManufacturingPaper .paper-hero-figure figcaption", "var(--qily-v5-small,20px)"],
  ["#qilyHometownManufacturingPaper .paper-keywords", "var(--qily-v5-small,20px)"],
  ["#qilyHometownManufacturingPaper .paper-toc a", "var(--qily-v5-small,20px)"],
  ["#qilyHometownManufacturingPaper .paper-kicker", "var(--qily-v5-section-kicker,21px)"],
  ["#qilyHometownManufacturingPaper .paper-callout", "var(--qily-v5-small,20px)"],
  ["#qilyHometownManufacturingPaper .paper-figure figcaption", "var(--qily-v5-small,20px)"],
  ["#qilyHometownManufacturingPaper .paper-card small", "var(--qily-v5-small,20px)"],
  ["#qilyHometownManufacturingPaper .paper-card p", "var(--qily-v5-small,20px)"],
  ["#qilyHometownManufacturingPaper .paper-table, #qilyHometownManufacturingPaper .paper-table th, #qilyHometownManufacturingPaper .paper-table td", "var(--qily-v5-small,20px)"],
  ["#qilyHometownManufacturingPaper .paper-step b", "var(--qily-v5-small,20px)"],
  ["#qilyHometownManufacturingPaper .paper-step p", "var(--qily-v5-small,20px)"],
  ["#qilyHometownManufacturingPaper .paper-source-list li", "var(--qily-v5-small,20px)"],
  ["#qilyHometownManufacturingPaper .paper-note", "var(--qily-v5-small,20px)"],
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
  if ([...actual.keys()].some(size => size < 17)) {
    throw new Error(label + ' still contains undersized SVG text below 17px.');
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
assertFontCounts(regional, {23:3,18:5,19:1}, 'Regional-path diagram');
assertUnifiedArrows(regional, 2, 'Regional-path diagram');
const policy = getSvg('0 0 1080 330');
assertFontCounts(policy, {19:16,17:4,18:1}, 'Policy-chain diagram');
assertUnifiedArrows(policy, 3, 'Policy-chain diagram');
const leanAi = getSvg('0 0 1080 570');
assertFontCounts(leanAi, {18:1,19:7,20:1}, 'Lean/digital/AI architecture diagram');
assertUnifiedArrows(leanAi, 2, 'Lean/digital/AI architecture diagram');
const knowledge = getSvg('0 0 1080 270');
assertFontCounts(knowledge, {19:5,18:11}, 'Knowledge-loop diagram');
assertUnifiedArrows(knowledge, 5, 'Knowledge-loop diagram');

if (!block.includes('#qilyHometownManufacturingPaper svg .vi-flow-arrow{fill:#0f4b5a!important;stroke:none!important}')) {
  throw new Error('All article diagrams must inherit the official QilyLean V4 arrow color and solid geometry.');
}


const paperStylesStart = html.indexOf('<style id="qilyHometownManufacturingPaperStyles">');
const paperStylesEnd = html.indexOf('</style>', paperStylesStart);
if (paperStylesStart < 0 || paperStylesEnd < 0) {
  throw new Error('Sitewide VI article styles must exist.');
}
const paperStyles = html.slice(paperStylesStart, paperStylesEnd);
const expectedFooter = [
  '.paper-end-card{padding:clamp(24px,4vw,42px);',
  'background:var(--qily-v5-white,#fff)!important',
  'border-left:5px solid var(--qily-v5-gold,#caa15f)',
  '.paper-end-card h2{margin:0 0 12px;color:var(--qily-v5-green,#0f4b5a)!important',
  '.paper-end-card p{margin:0;color:var(--qily-v5-copy,#3f5e5d)!important',
  '.paper-end-actions a.primary{border-color:var(--qily-v5-gold,#caa15f)!important'
];
for (const rule of expectedFooter) {
  if (!paperStyles.includes(rule)) throw new Error('Footer does not follow shared light VI: ' + rule);
}
if (paperStyles.includes('.paper-end-card{padding:clamp(24px,4vw,42px);color:#fff;background:linear-gradient')) {
  throw new Error('Obsolete dark campaign-style footer is prohibited.');
}
if (!block.includes('.paper-kicker{color:var(--qily-v5-gold-text,#b88b45)!important') ||
    !block.includes('.paper-card small{color:var(--qily-v5-green,#0f4b5a)!important')) {
  throw new Error('Section kicker must use sitewide gold and card labels must use sitewide deep teal.');
}
if (!knowledge.includes('data-qily-feedback-return="v1"') ||
    !knowledge.includes('data-qily-flow-direction="feedback"') ||
    !knowledge.includes('d="M105 213 H111 V200 H116 L108 185 L100 200 H105 Z"')) {
  throw new Error('Knowledge-loop must visibly return feedback to the first policy-research node.');
}
if (!block.includes('@media(max-width:1100px)') ||
    !block.includes('width:1080px!important;') ||
    !block.includes('overflow-x:auto!important;') ||
    !block.includes('overscroll-behavior-inline:contain!important;')) {
  throw new Error('Dense SVG diagrams must remain readable through local horizontal scrolling on tablet/mobile widths.');
}

console.log('PASS: H1/H2/H3 and normal body copy remain under sitewide VI authority.');
console.log('PASS: all 16 approved small-text VI token rules are retained.');
console.log('PASS: all four SVG diagrams preserve title hierarchy and enlarge small labels by +2px.');
console.log('PASS: all 12 directional arrows use the solid QilyLean V4 arrow geometry, including the feedback return.');
console.log('PASS: footer uses the shared QilyLean white/gold/teal VI with readable text.');
