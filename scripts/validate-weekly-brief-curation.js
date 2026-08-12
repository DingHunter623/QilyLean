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

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

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

  for (const date of protectedDates) {
    assert(dates.includes(date), `Protected brief was removed: ${date}`);
  }

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

  const report = JSON.parse(read('qilylean/daily/curation-report.json'));
  assert(report.policy_version === policy.version, 'Curation report policy version mismatch');
  assert(report.total_after === dates.length, 'Curation report retained count mismatch');
  assert(report.removed > 0, 'Curation did not remove any low-priority briefs');
  assert(report.total_after < report.total_before * 0.25, `Curation reduction is not substantial enough: ${report.total_before} -> ${report.total_after}`);

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
  assert(pmo.includes('PMO') && pmo.includes('阶段门'), 'Current weekly flagship brief lost its core content');

  const homepage = read('index.html');
  assert(!homepage.includes('2591期'), 'Homepage still exposes the legacy quantity-first brief count');
  assert(homepage.includes(`${dates.length}篇`) || homepage.includes('精选简报按周归档'), 'Homepage weekly curated brief positioning is missing');

  process.stdout.write(`Weekly curation validated: ${dates.length} curated briefs; protected ${protectedDates.size}.\n`);
}

main();
