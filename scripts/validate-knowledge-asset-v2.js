#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { hasConcreteCase } = require('./upgrade-curated-brief-nutrition-v2');

const root = path.resolve(__dirname, '..');
const dailyDir = path.join(root, 'qilylean', 'daily');
const indexPath = path.join(dailyDir, 'index.json');
const terminologyPath = path.join(root, 'knowledge', 'terminology.html');
const runtimePath = path.join(root, 'knowledge', 'terminology-knowledge-linkage-v2.js');
const stylePath = path.join(root, 'qilylean', 'knowledge-asset-v2.css');

function fail(message) {
  throw new Error(`[Knowledge Asset 2.0] ${message}`);
}

const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
if (!Array.isArray(index) || !index.length) fail('curated daily index is empty');

let caseReady = 0;
let linked = 0;
let styled = 0;
for (const item of index) {
  const file = path.join(dailyDir, `${item.date}.html`);
  if (!fs.existsSync(file)) fail(`missing curated brief ${item.date}`);
  const html = fs.readFileSync(file, 'utf8');
  const article = (html.match(/<article\b[^>]*class="[^"]*\bpost\b[^"]*"[^>]*>[\s\S]*?<\/article>/i) || [])[0] || '';
  if (!article) fail(`${item.date} has no article.post shell`);
  if (!hasConcreteCase(article)) fail(`${item.date} explains manufacturing knowledge without a concrete case marker`);
  caseReady += 1;
  if (/\/knowledge\/terminology\.html\?(?:opl|term)=/i.test(article) || /data-knowledge-nutrition-v2="v2"/.test(article)) linked += 1;
  if (html.includes('/qilylean/knowledge-asset-v2.css')) styled += 1;
}

if (caseReady !== index.length) fail(`case coverage mismatch: ${caseReady}/${index.length}`);
if (styled !== index.length) fail(`VI stylesheet coverage mismatch: ${styled}/${index.length}`);
if (linked < Math.max(1, Math.floor(index.length * 0.9))) fail(`knowledge linkage coverage is too low: ${linked}/${index.length}`);

const terminology = fs.readFileSync(terminologyPath, 'utf8');
const cardCount = (terminology.match(/data-term-card(?:\s|>)/g) || []).length;
if (cardCount < 190) fail(`OPL terminology coverage unexpectedly low: ${cardCount}`);
if (!terminology.includes('term-opl-meta-label">课件编号')) fail('OPL header lost lesson number metadata');
if (!terminology.includes('class="term-opl-theme"')) fail('OPL header lost theme metadata');
if (!/block\('6','制造现场案例'/.test(terminology)) fail('OPL template lost mandatory case block');
if (!terminology.includes('/qilylean/knowledge-asset-v2.css')) fail('OPL page is not wired to Knowledge Asset 2.0 VI stylesheet');
if (!terminology.includes('/knowledge/terminology-knowledge-linkage-v2.js')) fail('OPL page is not wired to knowledge linkage runtime');

const runtime = fs.readFileSync(runtimePath, 'utf8');
if (!runtime.includes('关联知识与交付链')) fail('OPL runtime lacks related knowledge module');
if (!runtime.includes('案例判定')) fail('OPL runtime lacks application-case quality rule');
if (!runtime.includes('themeBySection')) fail('OPL runtime lacks category-specific header themes');
if (!runtime.includes('/projects/') || !runtime.includes('/cooperation/')) fail('OPL runtime lacks project/service delivery linkage');

const css = fs.readFileSync(stylePath, 'utf8');
['.qa-nutrition-v2', '.qa-nutrition-grid', '.term-opl-related-v2', '.term-opl-case-rule'].forEach((selector) => {
  if (!css.includes(selector)) fail(`VI stylesheet missing ${selector}`);
});

process.stdout.write(`Knowledge Asset 2.0 passed: ${index.length}/${index.length} curated briefs carry case evidence, ${styled}/${index.length} carry unified VI, ${linked}/${index.length} carry knowledge linkage, OPL header/case/linkage gates passed across ${cardCount} terminology cards.\n`);
