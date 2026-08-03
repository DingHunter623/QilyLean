#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dailyDir = path.join(root, 'qilylean', 'daily');
const indexPath = path.join(dailyDir, 'index.json');
const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

if (!Array.isArray(index) || !index.length) throw new Error('Daily brief index is empty.');

const windowSize = 10;
const recent = index.slice(0, windowSize);
const qualityPatterns = [
  /质量|品质|FPY|DPPM|COPQ|防错|PFMEA|控制计划/,
  /\/qilylean\/daily\/2026-07-31\.html/,
  /\/knowledge\/terminology\.html\?opl=质量改善/
];

const linked = [];
for (const item of recent) {
  const file = path.join(dailyDir, `${item.date}.html`);
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  if (qualityPatterns.some((pattern) => pattern.test(html))) linked.push(item.date);
}

if (!linked.length) {
  throw new Error(`Recent ${windowSize} Daily Briefs contain no explicit quality linkage.`);
}

const latest = recent[0];
const latestHtml = fs.readFileSync(path.join(dailyDir, `${latest.date}.html`), 'utf8');
if (latest.date === '2026-08-04') {
  if (!latestHtml.includes('data-quality-throughline="2026-08-04"')) {
    throw new Error('2026-08-04 productivity brief is missing its quality-throughline module.');
  }
  if (!latestHtml.includes('/qilylean/daily/2026-07-31.html')) {
    throw new Error('2026-08-04 productivity brief is not linked to the quality专题 brief.');
  }
}

process.stdout.write(`Daily quality linkage passed: ${linked.length}/${recent.length} recent brief(s) carry explicit quality context (${linked.join(', ')}).\n`);
