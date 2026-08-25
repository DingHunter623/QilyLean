#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function assert(condition, message) { if (!condition) throw new Error(message); }

const navigation = read('site-navigation.js');
const runtime = read('site-r6-search-terminology-visual-v1.js');
const terminology = read('knowledge/terminology.html');
const pphPublisher = read('scripts/publish-pph-terminology.js');
const publication = read('scripts/publish-curated-daily.js');
const siteData = JSON.parse(read('qilylean/site-data.json'));
const pphLesson = read('knowledge/terminology/pph.html');
const npiBrief = read('qilylean/daily/2026-04-05.html');

const pphStatic = terminology.includes('<div class="term-code">PPH</div>');
const effectiveTerminologyTotal = Number(siteData.terminology && siteData.terminology.total || 0) + (pphStatic ? 0 : 1);
const effectiveLessonTotal = Number(siteData.terminology && siteData.terminology.lessonTotal || 0) + (pphStatic ? 0 : 1);
const effectiveSearchTerminologyTotal = Number(siteData.search && siteData.search.terminologyTotal || 0) + (pphStatic ? 0 : 1);

assert(navigation.includes('site-r6-search-terminology-visual-v1.js?v=20260826-r6-search-terminology-visual-v1'), 'site-navigation must load the R6 search/terminology/visual guard.');
assert(runtime.includes("grid.dataset.qilySearchOrder = query ? 'relevance-first' : 'archive-order'"), 'curated brief search must expose relevance-first ordering while a query is active.');
assert(runtime.includes('title, query, 6800, 5900, 4900'), 'brief title relevance must outrank broad summary/date matches.');
assert(runtime.includes('if (dateMode)'), 'date ranking must be conditional on an explicit date-shaped query.');
assert(runtime.includes("card.setAttribute('data-qily-r6-term', 'PPH')"), 'PPH term must have a runtime recovery path before generated assets refresh.');
assert(runtime.includes('PPH与UPPH不得混用'), 'PPH and UPPH distinction must be explicit.');
assert(runtime.includes("if (code === 'upph')"), 'PPH site search must reject the UPPH suffix false-positive.');
assert(runtime.includes('qily-r6-no-decorative-orbit'), 'legacy oversized circular hero decorations must be governed sitewide.');

assert(pphPublisher.includes('PPH_CODE') && pphPublisher.includes('UPPH_CODE'), 'permanent PPH publisher must locate both PPH and UPPH terminology sources.');
assert(pphPublisher.includes('PPH与UPPH不得混用'), 'permanent PPH source must preserve the metric boundary.');
assert(pphPublisher.includes('knowledge/terminology/pph.html'), 'permanent PPH source must bind the independent OPL URL.');
assert(pphPublisher.includes('Unsafe acronym suffix matching'), 'permanent PPH source must harden terminology acronym matching.');
assert(publication.includes("['publish-pph-terminology.js']"), 'curated publication SSOT must materialize PPH before terminology/search metadata synchronization.');

// A source-only PR may still carry the previously generated 192-count snapshot until
// the publication job runs. The protected source guarantees the next build becomes
// 193; after materialization pphStatic=true and the generated values themselves must
// already be 193. This prevents both false red PRs and silent rollback to 192.
assert(effectiveTerminologyTotal === 193 && effectiveLessonTotal === 193, 'effective terminology and lesson totals must resolve to 193 with the protected PPH source.');
assert(effectiveSearchTerminologyTotal === 193, 'effective search terminology total must resolve to 193 with the protected PPH source.');
if (pphStatic) {
  assert(siteData.terminology.total === 193 && siteData.terminology.lessonTotal === 193, 'once PPH is static, site-data must be materialized as 193/193.');
  assert(siteData.search.terminologyTotal === 193, 'once PPH is static, generated search metadata must be 193.');
}

assert(/<h1>PPH｜每小时件数<\/h1>/.test(pphLesson), 'independent PPH OPL page must exist.');
assert(pphLesson.includes('PPH＝合格件数 ÷ 实际生产小时'), 'PPH OPL must state its time-only denominator.');
assert(/新产品导入要把风险前移/.test(npiBrief), 'known exact-title search fixture for 新产品导入 must remain present.');

process.stdout.write(`R6 search / terminology / visual regression guard: PASS (PPH static=${pphStatic}, effective terms=${effectiveTerminologyTotal})\n`);
