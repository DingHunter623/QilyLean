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

const files = changedFiles().filter(f => /^qilylean\/daily\/assets\/.*-brief\.css$/.test(f));
if (!files.length) {
  console.log('Brief layout policy: no changed per-brief CSS files.');
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
for (const rel of files) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) continue;
  const css = fs.readFileSync(abs, 'utf8');

  if (!css.includes(CANONICAL_IMPORT)) {
    errors.push(`${rel}: must import ${CANONICAL_IMPORT}`);
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

if (errors.length) {
  console.error('Brief layout policy failed:');
  for (const error of [...new Set(errors)]) console.error(`- ${error}`);
  console.error('Rule: every curated brief uses the canonical sitewide content axis; only content/components may differ.');
  process.exit(1);
}

console.log(`Brief layout policy passed for ${files.length} changed per-brief CSS file(s).`);
