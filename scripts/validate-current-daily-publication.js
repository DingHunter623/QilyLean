#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dailyDir = path.join(root, 'qilylean', 'daily');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function assert(condition, label, details = '') {
  if (!condition) {
    const suffix = details ? `: ${details}` : '';
    throw new Error(`[FAIL] ${label}${suffix}`);
  }
  process.stdout.write(`[PASS] ${label}\n`);
}

function includes(text, needle, label) {
  assert(text.includes(needle), label, `missing ${JSON.stringify(needle)}`);
}

function matches(text, expression, label) {
  assert(expression.test(text), label, `pattern ${expression}`);
}

function collectDailyFiles() {
  return fs.readdirSync(dailyDir)
    .filter((name) => /^\d{4}-\d{2}-\d{2}\.html$/.test(name))
    .sort()
    .reverse();
}

const files = collectDailyFiles();
assert(files.length > 0, 'Daily source files exist');

const sourceLatest = files[0].slice(0, 10);
const index = JSON.parse(read('qilylean/daily/index.json'));
assert(Array.isArray(index) && index.length > 0, 'Daily index is a non-empty array');
assert(index[0].date === sourceLatest, 'Daily index latest date matches newest source file', `${index[0].date} != ${sourceLatest}`);
assert(index.length === files.length, 'Daily index count matches independent brief pages', `${index.length} != ${files.length}`);
assert(index.length >= 2584, 'Daily archive contains at least 2584 briefs', String(index.length));

const latest = read(`qilylean/daily/${sourceLatest}.html`);
const directory = read('qilylean/daily-insights.html');
const knowledge = read('knowledge/index.html');
const sitemap = read('sitemap.xml');
const cooperation = read('cooperation/index.html');
const links = read('links/index.html');
const terminology = read('knowledge/terminology.html');
const searchIndex = read('qilylean/site-search-index.json');
const siteData = JSON.parse(read('qilylean/site-data.json'));
const audit = JSON.parse(read('qilylean/daily/terminology-audit-latest.json'));

includes(latest, `id="${sourceLatest}"`, 'Latest page carries its date identity');
includes(latest, 'data-brief-message-form', 'Latest page contains message form');
includes(latest, '留言交流', 'Latest page contains message section');
includes(latest, 'site-number-badge-contrast-v1.css?v=20260805-number-badge-contrast-v1', 'Latest page loads number-badge contrast');
includes(latest, 'site-interactive-hover-contrast-v1.css?v=20260807-official-contact-hover-v3', 'Latest page loads interactive contrast');
includes(latest, 'site-navigation.js?v=20260804-sitewide-clarity-v2', 'Latest page loads current navigation');
includes(latest, 'site-visual-closure-v1.css?v=20260804-sitewide-clarity-v2', 'Latest page loads current visual closure');
includes(latest, 'site-visual-closure-v2.css?v=20260803-boundary-links-v2', 'Latest page loads boundary-link closure');

includes(directory, sourceLatest, 'Daily directory exposes latest date');
includes(sitemap, `qilylean/daily/${sourceLatest}.html`, 'Sitemap contains latest brief');
matches(knowledge, new RegExp(`data-latest-brief-date=["']${sourceLatest}["']`), 'Knowledge page latest card uses latest date');
const escapedLatestPath = `\\/qilylean\\/daily\\/${sourceLatest}\\.html`;
matches(
  knowledge,
  new RegExp(`<a[^>]*(?:data-latest-brief-link[^>]*href=["']${escapedLatestPath}["']|href=["']${escapedLatestPath}["'][^>]*data-latest-brief-link)[^>]*>`, 'i'),
  'Knowledge page latest link points to latest brief'
);

assert(siteData.briefs && siteData.briefs.latestDate === sourceLatest, 'Site data latest date is current');
assert(siteData.briefs && siteData.briefs.total === index.length, 'Site data brief count matches index');
assert(siteData.search && siteData.search.latestBriefDate === sourceLatest, 'Search metadata latest date matches daily index');
assert(siteData.search && siteData.search.briefTotal === index.length, 'Search metadata brief count matches daily index');
assert(siteData.search && siteData.terminology && siteData.search.terminologyTotal === siteData.terminology.total, 'Search terminology count matches central terminology count');
assert(audit.status === 'passed', 'Latest terminology audit passed');
assert(Array.isArray(audit.unknownTerms) && audit.unknownTerms.length === 0, 'Latest terminology audit has no unknown terms');

if (sourceLatest === '2026-08-05') {
  includes(latest, '设备停机不是维修单', 'August 5 brief has independent equipment-reliability theme');
  includes(latest, '2026-08-05｜ME工程', 'August 5 brief category is ME engineering');
  ['MTBF', 'MTTR', 'OEE', 'TPM'].forEach((term) => includes(latest, term, `August 5 brief includes ${term}`));
  matches(latest, /href=["']\/knowledge\/terminology\/mtbf\.html["']/i, 'August 5 brief links MTBF lesson');
  matches(latest, /href=["']\/knowledge\/terminology\/mttr\.html["']/i, 'August 5 brief links MTTR lesson');
  includes(terminology, '<div class="term-code">MTBF</div>', 'Terminology dictionary contains MTBF');
  includes(terminology, '<div class="term-code">MTTR</div>', 'Terminology dictionary contains MTTR');
  includes(terminology, '词典：183项中文诠释', 'Terminology dictionary count is 183');
  assert(siteData.terminology && siteData.terminology.total === 183, 'Site data terminology count is 183');
  assert(siteData.search && siteData.search.terminologyTotal === 183, 'Search terminology count is 183');
  assert(exists('knowledge/terminology/mtbf.html'), 'MTBF independent lesson exists');
  assert(exists('knowledge/terminology/mttr.html'), 'MTTR independent lesson exists');
  includes(read('knowledge/terminology/mtbf.html'), '<h1>MTBF｜平均故障间隔时间</h1>', 'MTBF lesson title is correct');
  includes(read('knowledge/terminology/mttr.html'), '<h1>MTTR｜平均修复时间</h1>', 'MTTR lesson title is correct');
  includes(searchIndex, 'knowledge/terminology/mtbf.html', 'Search index contains MTBF lesson');
  includes(searchIndex, 'knowledge/terminology/mttr.html', 'Search index contains MTTR lesson');
  includes(sitemap, 'knowledge/terminology/mtbf.html', 'Sitemap contains MTBF lesson');
  includes(sitemap, 'knowledge/terminology/mttr.html', 'Sitemap contains MTTR lesson');
  assert(!latest.includes('科学改进生产力：从“催人提速”转向“系统减少损失”'), 'August 5 brief does not reuse August 4 title');
}

const augustFourth = read('qilylean/daily/2026-08-04.html');
includes(augustFourth, 'data-quality-throughline="2026-08-04"', 'August 4 quality-throughline remains intact');
includes(augustFourth, '质量门槛｜科学改进生产力', 'August 4 quality label remains intact');

includes(cooperation, 'QILY-PRICING-PUBLIC-DISABLED', 'Public pricing remains disabled');
includes(cooperation, '<h2>合作启动路径</h2>', 'Cooperation start path remains visible');
includes(cooperation, '质量不是PQCD中的一个并列数字', 'Cooperation quality-throughline remains visible');
assert(!/¥|公开价格参考与报价依据|公开报价不包含|<div class="price">/.test(cooperation), 'No public quotation is rendered');
includes(links, 'qilyCommercialQualityClosureStylesheet', 'Links page keeps commercial-quality closure');

assert(!/评价本期简报|五星好评|点赞好评|data-brief-rating|data-brief-sentiment|data-like-count|data-dislike-count/.test(latest), 'Obsolete public rating module is absent');
assert(!/\bGATE\b/.test(latest), 'No unexplained GATE label remains');
assert(!/id="brief-consultation"|id="briefConsultationForm"|简报留言交流|留言来源：今日简报总目录/.test(directory), 'Daily directory has no duplicate consultation module');

const legacyExpression = /site-navigation\.js\?v=20260728-layout-type-v3|site-navigation\.js\?v=20260729-no-old-flash-v1|site-shell\.css\?v=20260725-compact-hero-v1|homepage-music\.js\?v=20260722-continuous-v3/;
const legacyFiles = [];
const obsoleteCtaFiles = [];
for (const name of files) {
  const page = fs.readFileSync(path.join(dailyDir, name), 'utf8');
  if (legacyExpression.test(page)) legacyFiles.push(name);
  if (/brief-consultation-cta|#brief-consultation/.test(page)) obsoleteCtaFiles.push(name);
}
assert(legacyFiles.length === 0, 'All daily pages are free of legacy shared assets', legacyFiles.slice(0, 10).join(', '));
assert(obsoleteCtaFiles.length === 0, 'All daily pages are free of obsolete directory CTAs', obsoleteCtaFiles.slice(0, 10).join(', '));
assert(!legacyExpression.test(directory), 'Daily directory has no legacy shared asset');

process.stdout.write(`Current daily publication validated: ${sourceLatest}, ${index.length} briefs.\n`);
