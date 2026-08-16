#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dailyDir = path.join(root, 'qilylean', 'daily');

function read(relativePath) { return fs.readFileSync(path.join(root, relativePath), 'utf8'); }
function exists(relativePath) { return fs.existsSync(path.join(root, relativePath)); }
function assert(condition, label, details = '') {
  if (!condition) {
    const suffix = details ? `: ${details}` : '';
    throw new Error(`[FAIL] ${label}${suffix}`);
  }
  process.stdout.write(`[PASS] ${label}\n`);
}
function includes(text, needle, label) { assert(text.includes(needle), label, `missing ${JSON.stringify(needle)}`); }
function matches(text, expression, label) { assert(expression.test(text), label, `pattern ${expression}`); }
function collectDailyFiles() {
  return fs.readdirSync(dailyDir).filter((name) => /^\d{4}-\d{2}-\d{2}\.html$/.test(name)).sort().reverse();
}

const files = collectDailyFiles();
assert(files.length > 0, 'Curated brief source files exist');
const sourceLatest = files[0].slice(0, 10);
const index = JSON.parse(read('qilylean/daily/index.json'));
const policy = exists('qilylean/brief-curation-policy.json') ? JSON.parse(read('qilylean/brief-curation-policy.json')) : null;
const weeklyCurated = Boolean(policy && policy.cadence === 'weekly_curated');

assert(Array.isArray(index) && index.length > 0, 'Brief index is a non-empty array');
assert(index[0].date === sourceLatest, 'Brief index latest date matches newest source file', `${index[0].date} != ${sourceLatest}`);
assert(index.length === files.length, 'Brief index count matches independent retained pages', `${index.length} != ${files.length}`);
if (weeklyCurated) assert(index.length < 1000, 'Weekly curated archive no longer exposes quantity-first daily volume', String(index.length));

const latest = read(`qilylean/daily/${sourceLatest}.html`);
const navigation = read('site-navigation.js');
const fastNative = read('site-music-persistent-navigation-v1.js');
const directory = read('qilylean/daily-insights.html');
const knowledge = read('knowledge/index.html');
const sitemap = read('sitemap.xml');
const cooperation = read('cooperation/index.html');
const links = read('links/index.html');
const searchIndex = JSON.parse(read('qilylean/site-search-index.json'));
const siteData = JSON.parse(read('qilylean/site-data.json'));
const audit = exists('qilylean/daily/terminology-audit-latest.json') ? JSON.parse(read('qilylean/daily/terminology-audit-latest.json')) : null;

includes(latest, `id="${sourceLatest}"`, 'Latest retained page carries its date identity');
includes(latest, 'data-brief-message-form', 'Latest retained page contains message form');
includes(latest, '留言交流', 'Latest retained page contains message section');
includes(latest, 'site-navigation.js?v=20260815-performance-v16', 'Latest retained page uses current static-first navigation');
includes(latest, 'site-music-persistent-navigation-v1.js?v=20260815-prefetch-v6p1', 'Latest retained page uses Fast Native Navigation V6.1');
assert(!latest.includes('qilyBackgroundMusicPreload'), 'Latest retained page does not preload background audio');
assert(!latest.includes('site-footer-standard-v28.js'), 'Latest retained page does not load retired footer runtime');
assert(!/<footer\b/i.test(latest), 'Latest retained page does not restore retired visible footer');
includes(navigation, 'site-navigation-legacy-20260802.js?v=20260815-performance-v16', 'Navigation wrapper uses current legacy runtime version');
includes(navigation, "mode: 'r2-static-first-v21'", 'Navigation wrapper declares current static-first mode');
includes(fastNative, "mode:'native-prefetch-v6'", 'Fast Native V6 declares native-prefetch mode');
includes(fastNative, 'domSwap:false', 'Fast Native V6 forbids cross-page DOM swapping');
includes(fastNative, 'nativeHistory:true', 'Fast Native V6 keeps browser-native history');
includes(fastNative, 'prefetch:true', 'Fast Native V6 keeps same-origin prefetch');
assert(!/DOMParser|history\.pushState|replaceWith\s*\(|document\.body\.innerHTML/i.test(fastNative), 'Fast Native V6 contains no soft full-page swap implementation');

includes(directory, sourceLatest, 'Curated directory exposes latest date');
includes(sitemap, `qilylean/daily/${sourceLatest}.html`, 'Sitemap contains latest retained brief');
matches(knowledge, new RegExp(`data-latest-brief-date=["']${sourceLatest}["']`), 'Knowledge page latest card uses latest date');
const escapedLatestPath = `\\/qilylean\\/daily\\/${sourceLatest}\\.html`;
matches(knowledge, new RegExp(`<a[^>]*(?:data-latest-brief-link[^>]*href=["']${escapedLatestPath}["']|href=["']${escapedLatestPath}["'][^>]*data-latest-brief-link)[^>]*>`, 'i'), 'Knowledge page latest link points to latest retained brief');

assert(siteData.briefs && siteData.briefs.latestDate === sourceLatest, 'Site data latest date is current');
assert(siteData.briefs && siteData.briefs.total === index.length, 'Site data brief count matches retained index');
if (weeklyCurated) assert(siteData.briefs.cadence === 'weekly_curated', 'Site data records weekly curated cadence');
assert(siteData.search && siteData.search.latestBriefDate === sourceLatest, 'Search metadata latest date matches retained index');
assert(siteData.search && siteData.search.briefTotal === index.length, 'Search metadata brief count matches retained index');
assert(siteData.search && siteData.terminology && siteData.search.terminologyTotal === siteData.terminology.total, 'Search terminology count matches central terminology count');
assert(searchIndex.meta && searchIndex.meta.latestBriefDate === sourceLatest, 'Search index metadata latest date matches retained index');
assert(searchIndex.meta && searchIndex.meta.briefTotal === index.length, 'Search index metadata brief count matches retained index');
assert(searchIndex.meta && siteData.terminology && searchIndex.meta.terminologyTotal === siteData.terminology.total, 'Search index terminology count matches central terminology count');
if (audit) {
  assert(audit.status === 'passed', 'Latest terminology audit passed');
  assert(Array.isArray(audit.unknownTerms) && audit.unknownTerms.length === 0, 'Latest terminology audit has no unknown terms');
}

includes(cooperation, 'QILY-PRICING-PUBLIC-DISABLED', 'Public pricing remains disabled');
includes(cooperation, '<h2>合作启动路径与公开报价边界</h2>', 'Cooperation start path remains visible');
includes(cooperation, '质量不是PQCD中的一个并列数字', 'Cooperation quality-throughline remains visible');
assert(!/¥|公开价格参考与报价依据|公开报价不包含|<div class="price">/.test(cooperation), 'No public quotation is rendered');
includes(links, 'qilyCommercialQualityClosureStylesheet', 'Links page keeps commercial-quality closure');

assert(!/评价本期简报|五星好评|点赞好评|data-brief-rating|data-brief-sentiment|data-like-count|data-dislike-count/.test(latest), 'Obsolete public rating module is absent');
assert(!/\bGATE\b/.test(latest), 'No unexplained GATE label remains');
assert(!/id="brief-consultation"|id="briefConsultationForm"|简报留言交流|留言来源：今日简报总目录/.test(directory), 'Curated directory has no duplicate consultation module');

const legacyExpression = /site-navigation\.js\?v=20260728-layout-type-v3|site-navigation\.js\?v=20260729-no-old-flash-v1|site-shell\.css\?v=20260725-compact-hero-v1|homepage-music\.js\?v=20260722-continuous-v3/;
const legacyFiles = [];
const obsoleteCtaFiles = [];
for (const name of files) {
  const page = fs.readFileSync(path.join(dailyDir, name), 'utf8');
  if (legacyExpression.test(page)) legacyFiles.push(name);
  if (/brief-consultation-cta|#brief-consultation/.test(page)) obsoleteCtaFiles.push(name);
  if (/site-footer-standard-v28\.js/i.test(page) || /<footer\b/i.test(page)) throw new Error(`[FAIL] Retained brief restored retired footer runtime: ${name}`);
  if (/qilyBackgroundMusicPreload/i.test(page)) throw new Error(`[FAIL] Retained brief restored background-audio preload: ${name}`);
}
assert(legacyFiles.length === 0, 'All retained brief pages are free of legacy shared assets', legacyFiles.slice(0, 10).join(', '));
assert(obsoleteCtaFiles.length === 0, 'All retained brief pages are free of obsolete directory CTAs', obsoleteCtaFiles.slice(0, 10).join(', '));
assert(!legacyExpression.test(directory), 'Curated directory has no legacy shared asset');

if (weeklyCurated) {
  includes(directory, '<h1>精选简报</h1>', 'Directory is explicitly positioned as curated briefs');
  includes(directory, '不以日更数量证明专业度', 'Directory states quality-first publication rule');
  assert(!directory.includes('每一天对应一个独立网址'), 'Retired daily-cadence claim is absent');
}
process.stdout.write(`Current ${weeklyCurated ? 'weekly curated' : 'archive'} publication validated: ${sourceLatest}, ${index.length} retained briefs.\n`);
