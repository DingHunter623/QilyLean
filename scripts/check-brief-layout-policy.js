#!/usr/bin/env node
'use strict';

const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const ROOT = process.cwd();
const CANONICAL_IMPORT = '/qilylean/daily/brief-layout-standard.css';

function changedFiles() {
  try {
    return cp.execSync('git diff --name-only HEAD^ HEAD', { encoding: 'utf8' })
      .split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  } catch (_) {
    return [];
  }
}

const changed = changedFiles();
const cssFiles = changed.filter(f => /^qilylean\/daily\/assets\/.*-brief\.css$/.test(f));
const svgFiles = changed.filter(f => /^qilylean\/daily\/assets\/\d{4}-\d{2}-\d{2}-.*\.svg$/.test(f));

if (!cssFiles.length && !svgFiles.length) {
  console.log('Brief layout policy: no changed per-brief CSS or dated SVG files.');
  process.exit(0);
}

const forbiddenSelectors = [
  'lean-brief-copy',
  'brief-copy',
  'article-copy',
  'post-copy',
  'knowledge-brief-section>.module-inner',
  'knowledge-brief-section > .module-inner',
  'knowledge-brief-hero>.module-inner',
  'knowledge-brief-hero > .module-inner'
];

function declarations(body) {
  const out = [];
  const re = /\b(max-width|max-inline-size|width)\s*:\s*([^;}]+)/ig;
  let match;
  while ((match = re.exec(body))) {
    out.push({ property: match[1].toLowerCase(), value: match[2].trim().toLowerCase() });
  }
  return out;
}

function isCanonicalAxisValue(value) {
  const normalized = value.replace(/\s+/g, '');
  return normalized === '100%' ||
    normalized === 'none' ||
    normalized.startsWith('var(--qily-brief-content-axis') ||
    normalized.startsWith('var(--qily-wide-content') ||
    normalized.startsWith('min(var(--qily-brief-content-axis') ||
    normalized.startsWith('min(var(--qily-wide-content');
}

function isPrivateSizedWidth(value) {
  const normalized = value.replace(/\s+/g, '');
  if (isCanonicalAxisValue(normalized)) return false;
  return /^(?:calc\(|min\(|max\(|clamp\()/.test(normalized) ||
    /^\d+(?:\.\d+)?(?:px|rem|em|vw)$/.test(normalized);
}

const errors = [];

for (const rel of cssFiles) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) continue;
  const css = fs.readFileSync(abs, 'utf8');

  if (!css.includes(CANONICAL_IMPORT)) {
    errors.push(`${rel}: must import ${CANONICAL_IMPORT}`);
  }

  /* Typography is centrally governed. Per-issue CSS may not invent its own scale. */
  if (/\bfont-size\s*:/i.test(css)) {
    errors.push(`${rel}: per-issue font-size is forbidden; use the shared curated-brief typography hierarchy`);
  }

  const compact = css.replace(/\s+/g, ' ');
  for (const selector of forbiddenSelectors) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const blockRe = new RegExp(`[^{}]*${escaped}[^{}]*\\{([^}]*)\\}`, 'ig');
    let match;
    while ((match = blockRe.exec(compact))) {
      for (const decl of declarations(match[1])) {
        if ((decl.property === 'max-width' || decl.property === 'max-inline-size') &&
            !isCanonicalAxisValue(decl.value)) {
          errors.push(`${rel}: private ${decl.property} is forbidden on ${selector}`);
        }
        if (decl.property === 'width' && isPrivateSizedWidth(decl.value)) {
          errors.push(`${rel}: private width is forbidden on ${selector}`);
        }
      }
    }
  }
}

for (const rel of svgFiles) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) continue;
  const svg = fs.readFileSync(abs, 'utf8');

  const viewBox = svg.match(/viewBox=["']\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*["']/i);
  const viewWidth = viewBox ? Number(viewBox[1]) : 720;
  const maxAllowed = 22 * (viewWidth / 720);

  const sizes = [];
  for (const m of svg.matchAll(/font-size=["']([\d.]+)(?:px)?["']/ig)) sizes.push(Number(m[1]));
  for (const m of svg.matchAll(/font-size\s*:\s*([\d.]+)(?:px)?/ig)) sizes.push(Number(m[1]));

  for (const size of sizes) {
    if (Number.isFinite(size) && size > maxAllowed + 0.01) {
      errors.push(`${rel}: SVG font-size ${size} exceeds VI scale limit ${maxAllowed.toFixed(1)} for viewBox width ${viewWidth}`);
    }
  }
}

if (errors.length) {
  console.error('Brief layout policy failed:');
  for (const error of [...new Set(errors)]) console.error(`- ${error}`);
  console.error('Rule: curated briefs share one content axis and one typography hierarchy; body/supporting text must never visually outrank headings.');
  process.exit(1);
}

console.log(`Brief layout policy passed for ${cssFiles.length} changed per-brief CSS file(s) and ${svgFiles.length} dated SVG file(s).`);
