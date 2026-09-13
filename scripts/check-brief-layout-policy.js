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
    let m;
    while ((m = blockRe.exec(compact))) {
      const body = m[1];
      if (/\b(max-width|max-inline-size)\s*:\s*(?!100%|none|var\(--qily-brief-content-axis|var\(--qily-wide-content)[^;]+/i.test(body)) {
        errors.push(`${rel}: private max-width/max-inline-size is forbidden on ${selector}`);
      }
      if (/\bwidth\s*:\s*(?:calc\(|min\(|max\(|clamp\(|\d+(?:\.\d+)?(?:px|rem|em|vw))/i.test(body) &&
          !/\bwidth\s*:\s*(?:100%|min\(var\(--qily-brief-content-axis|var\(--qily-wide-content))/i.test(body)) {
        errors.push(`${rel}: private width is forbidden on ${selector}`);
      }
    }
  }
}

if (errors.length) {
  console.error('Brief layout policy failed:');
  for (const e of [...new Set(errors)]) console.error(`- ${e}`);
  console.error('Rule: every curated brief uses the canonical sitewide content axis; only content/components may differ.');
  process.exit(1);
}

console.log(`Brief layout policy passed for ${files.length} changed per-brief CSS file(s).`);
