#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const qily = path.join(root, 'qilylean');
const dailyDir = path.join(qily, 'daily');
const policy = JSON.parse(fs.readFileSync(path.join(qily, 'brief-curation-policy.json'), 'utf8'));
const protectedDates = new Set(policy.protected_dates || []);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function mondayKey(date) {
  const value = new Date(`${date}T00:00:00Z`);
  const day = value.getUTCDay() || 7;
  value.setUTCDate(value.getUTCDate() - day + 1);
  return value.toISOString().slice(0, 10);
}
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }

function main() {
  const dates = fs.readdirSync(dailyDir)
    .filter((name) => /^\d{4}-\d{2}-\d{2}\.html$/.test(name))
    .map((name) => name.slice(0, 10))
    .sort()
    .reverse();
  assert(dates.length > 0, 'Curated brief archive is empty');

  const index = JSON.parse(read('qilylean/daily/index.json'));
  assert(index.length === dates.length, `Index/page count mismatch: ${index.length} vs ${dates.length}`);
  assert(index.map((item) => item.date).join('|') === dates.join('|'), 'Index dates do not match retained brief pages');

  for (const date of protectedDates) assert(dates.includes(date), `Protected brief was removed: ${date}`);

  const byWeek = new Map();
  for (const date of dates) {
    const key = mondayKey(date);
    if (!byWeek.has(key)) byWeek.set(key, []);
    byWeek.get(key).push(date);
  }
  for (const [week, weekDates] of byWeek.entries()) {
    const protectedCount = weekDates.filter((date) => protectedDates.has(date)).length;
    if (protectedCount) {
      assert(weekDates.length === protectedCount, `Protected week ${week} contains unapproved extra briefs: ${weekDates.join(', ')}`);
    } else {
      assert(weekDates.length === 1, `Week ${week} must contain exactly one curated brief; found ${weekDates.length}`);
    }
  }

  // The initial 2591 -> 372 curation baseline is immutable historical evidence.
  // Later policy revisions may add newly protected high-value briefs, but must not
  // rewrite the original baseline policy version, counts, or protected-date snapshot.
  const baseline = JSON.parse(read('qilylean/daily/curation-baseline.json'));
  assert(baseline.baseline_id === 'weekly-curation-initial-20260812', `Initial curation baseline id changed: ${baseline.baseline_id}`);
  assert(baseline.policy_version === '2026-08-12-r2', `Initial curation baseline policy version changed: ${baseline.policy_version}`);
  assert(baseline.baseline_date === '2026-08-12', `Initial curation baseline date changed: ${baseline.baseline_date}`);
  assert(baseline.source_total === 2591, `Initial source baseline changed unexpectedly: ${baseline.source_total}`);
  assert(baseline.retained_total === 372, `Initial retained baseline changed unexpectedly: ${baseline.retained_total}`);
  assert(baseline.removed_total === baseline.source_total - baseline.retained_total, 'Initial curation baseline arithmetic is invalid');
  assert(baseline.reduction_rate >= 0.8, `Initial curation reduction baseline is too low: ${baseline.reduction_rate}`);
  const initialProtected = ['2026-07-29', '2026-08-08', '2026-08-09', '2026-08-12'];
  for (const date of initialProtected) {
    assert((baseline.protected_dates || []).includes(date), `Initial curation baseline lost original protected date: ${date}`);
  }

  // Current report must follow the current policy and current retained archive.
  const report = JSON.parse(read('qilylean/daily/curation-report.json'));
  assert(report.policy_version === policy.version, 'Current curation report policy version mismatch');
  assert(report.total_after === dates.length, `Current curation report retained count mismatch: ${report.total_after} vs ${dates.length}`);
  assert(report.total_before >= report.total_after, `Current curation report is invalid: ${report.total_before} -> ${report.total_after}`);
  assert(report.removed === report.total_before - report.total_after, 'Current curation report removal arithmetic is invalid');

  const directory = read('qilylean/daily-insights.html');
  assert(directory.includes('<h1>精选简报</h1>'), 'Curated directory title is missing');
  assert(directory.includes('不以日更数量证明专业度'), 'Weekly quality positioning is missing');
  assert(directory.includes(`现存 ${dates.length} 篇`), 'Curated directory count is stale');
  assert(!directory.includes('每一天对应一个独立网址'), 'Legacy daily-cadence wording remains');

  const feed = read('qilylean/daily/feed.xml');
  const feedDates = Array.from(feed.matchAll(/\/qilylean\/daily\/(\d{4}-\d{2}-\d{2})\.html/g), (match) => match[1]);
  assert(feedDates.every((date) => dates.includes(date)), 'RSS references a deleted brief');

  const sitemap = read('sitemap.xml');
  const sitemapDates = Array.from(sitemap.matchAll(/\/qilylean\/daily\/(\d{4}-\d{2}-\d{2})\.html/g), (match) => match[1]);
  assert(new Set(sitemapDates).size === dates.length, `Sitemap curated page count mismatch: ${new Set(sitemapDates).size} vs ${dates.length}`);
  assert(dates.every((date) => sitemapDates.includes(date)), 'Sitemap is missing a retained brief');

  const npi = read('qilylean/daily/2026-07-29.html');
  assert(npi.includes('EVT') && npi.includes('DVT') && npi.includes('PVT') && npi.includes('MP'), 'Protected NPI four-stage brief lost its core content');
  const training = read('qilylean/daily/2026-08-08.html');
  assert(training.includes('Andon') && training.includes('异常'), 'Protected 2026-08-08 training brief lost its core content');
  const ceiling = read('qilylean/daily/2026-08-09.html');
  assert(ceiling.includes('Ceiling') && ceiling.includes('Benchmark') && ceiling.includes('Stretch Target'), 'Protected ceiling brief lost its core content');
  const pmo = read('qilylean/daily/2026-08-12.html');
  assert(pmo.includes('PMO') && pmo.includes('阶段门'), 'Protected 2026-08-12 PMO brief lost its core content');
  if (protectedDates.has('2026-08-14')) {
    const leanGovernance = read('qilylean/daily/2026-08-14.html');
    assert(leanGovernance.includes('改革自上而下') && leanGovernance.includes('改善自下而上'), 'Protected 2026-08-14 Lean governance brief lost its core thesis');
    assert((leanGovernance.match(/<svg\b/g) || []).length >= 4, 'Protected 2026-08-14 Lean governance brief lost its scene diagrams');
    assert(leanGovernance.includes('90天') && leanGovernance.includes('RACI') && leanGovernance.includes('财务验证'), 'Protected 2026-08-14 Lean governance brief lost its implementation framework');
  }

  const homepage = read('index.html');
  assert(!homepage.includes('2591期'), 'Homepage still exposes the legacy quantity-first brief count');
  assert(homepage.includes(`${dates.length}篇`) || homepage.includes('精选简报按周归档'), 'Homepage weekly curated brief positioning is missing');

  process.stdout.write(`Weekly curation validated: ${dates.length} curated briefs; protected ${protectedDates.size}; immutable initial reduction baseline ${baseline.source_total} -> ${baseline.retained_total}; current policy ${policy.version}.\n`);
}

main();
