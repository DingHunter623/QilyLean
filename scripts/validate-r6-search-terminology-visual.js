#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function assert(condition, message) { if (!condition) throw new Error(message); }

const navigation = read('site-navigation.js');
const runtime = read('site-r6-search-terminology-visual-v1.js');
const siteData = JSON.parse(read('qilylean/site-data.json'));
const pphLesson = read('knowledge/terminology/pph.html');
const npiBrief = read('qilylean/daily/2026-04-05.html');

assert(navigation.includes('site-r6-search-terminology-visual-v1.js?v=20260826-r6-search-terminology-visual-v1'), 'site-navigation must load the R6 search/terminology/visual guard.');
assert(runtime.includes("grid.dataset.qilySearchOrder = query ? 'relevance-first' : 'archive-order'"), 'curated brief search must expose relevance-first ordering while a query is active.');
assert(runtime.includes('title, query, 6800, 5900, 4900'), 'brief title relevance must outrank broad summary/date matches.');
assert(runtime.includes('if (dateMode)'), 'date ranking must be conditional on an explicit date-shaped query.');
assert(runtime.includes("card.setAttribute('data-qily-r6-term', 'PPH')"), 'PPH term must be materialized by the sitewide terminology runtime.');
assert(runtime.includes('PPH与UPPH不得混用'), 'PPH and UPPH distinction must be explicit.');
assert(runtime.includes("if (code === 'upph')"), 'PPH site search must reject the UPPH suffix false-positive.');
assert(runtime.includes('qily-r6-no-decorative-orbit'), 'legacy oversized circular hero decorations must be governed sitewide.');
assert(siteData.terminology.total === 193 && siteData.terminology.lessonTotal === 193, 'site-data terminology and lesson totals must be 193 after adding PPH.');
assert(siteData.search.terminologyTotal === 193, 'site search metadata terminology total must be 193.');
assert(/<h1>PPH｜每小时件数<\/h1>/.test(pphLesson), 'independent PPH OPL page must exist.');
assert(/新产品导入要把风险前移/.test(npiBrief), 'known exact-title search fixture for 新产品导入 must remain present.');

process.stdout.write('R6 search / terminology / visual regression guard: PASS\n');
