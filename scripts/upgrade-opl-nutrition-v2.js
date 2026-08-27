#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dailyDir = path.join(root, 'qilylean', 'daily');
const indexPath = path.join(dailyDir, 'index.json');
const terminologyPath = path.join(root, 'knowledge', 'terminology.html');
const styleHref = '/qilylean/knowledge-asset-v2.css?v=20260828-knowledge-asset-v2';
const runtimeSrc = '/knowledge/terminology-knowledge-linkage-v2.js?v=20260828-knowledge-asset-v2';

function ensureStyle(html) {
  if (html.includes('/qilylean/knowledge-asset-v2.css')) return html;
  const link = `<link rel="stylesheet" href="${styleHref}">`;
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `  ${link}\n</head>`);
  throw new Error('Cannot find </head> while installing Knowledge Asset 2.0 stylesheet.');
}

function ensureRuntime(html) {
  if (html.includes('/knowledge/terminology-knowledge-linkage-v2.js')) return html;
  const script = `<script defer src="${runtimeSrc}"></script>`;
  if (/<script defer src="\/knowledge\/terminology-sponsor-v1\.js/i.test(html)) {
    return html.replace(/(<script defer src="\/knowledge\/terminology-sponsor-v1\.js[^>]*><\/script>)/i, `${script}\n$1`);
  }
  if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, `${script}\n</body>`);
  throw new Error('Cannot find OPL script insertion point.');
}

function upgradeDailyStyles() {
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  let changed = 0;
  for (const item of index) {
    const file = path.join(dailyDir, `${item.date}.html`);
    if (!fs.existsSync(file)) throw new Error(`Missing curated brief: ${item.date}`);
    const original = fs.readFileSync(file, 'utf8');
    const updated = ensureStyle(original);
    if (updated !== original) {
      fs.writeFileSync(file, updated);
      changed += 1;
    }
  }
  return changed;
}

function upgradeTerminology() {
  const original = fs.readFileSync(terminologyPath, 'utf8');
  if (!/block\('6','制造现场案例'/.test(original)) {
    throw new Error('OPL template no longer contains the required 制造现场案例 block.');
  }
  if (!/term-opl-meta-label">课件编号/.test(original) || !/class="term-opl-theme"/.test(original)) {
    throw new Error('OPL header/meta structure changed; refusing to overwrite the established template blindly.');
  }
  let updated = ensureStyle(original);
  updated = ensureRuntime(updated);
  if (updated !== original) fs.writeFileSync(terminologyPath, updated);
  return updated !== original;
}

function main() {
  const dailyChanged = upgradeDailyStyles();
  const terminologyChanged = upgradeTerminology();
  process.stdout.write(`Knowledge Asset 2.0 VI wiring: ${dailyChanged} curated brief stylesheet link(s) installed; OPL runtime ${terminologyChanged ? 'updated' : 'already current'}.\n`);
}

if (require.main === module) main();

module.exports = { ensureStyle, ensureRuntime };
