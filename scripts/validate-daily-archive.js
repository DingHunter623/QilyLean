#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { archiveStart, archiveEnd } = require('./daily-engineering-archive');

const root = path.resolve(__dirname, '..');
const dailyDir = path.join(root, 'qilylean', 'daily');
const assetDir = path.join(root, 'qilylean', 'assets');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function dayCount(start, end) {
  return Math.round((new Date(`${end}T00:00:00Z`) - new Date(`${start}T00:00:00Z`)) / 86400000) + 1;
}

function previousDay(date) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() - 1);
  return value.toISOString().slice(0, 10);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function main() {
  const index = JSON.parse(read('qilylean/daily/index.json'));
  const expectedArchive = dayCount(archiveStart, archiveEnd);
  const archive = index.filter((item) => item.date <= archiveEnd);
  const recent = index.filter((item) => item.date > archiveEnd);

  assert(index.length > expectedArchive, 'Archive does not include the recent period');
  assert(archive.length === expectedArchive, `Expected ${expectedArchive} archive briefs; found ${archive.length}`);
  assert(index[index.length - 1].date === archiveStart, `Archive must begin on ${archiveStart}`);
  assert(archive[0].date === archiveEnd, `First archive period must end on ${archiveEnd}`);
  assert(recent[recent.length - 1].date === '2025-12-19', 'Recent period must begin on 2025-12-19');
  const publicFields = ['date', 'dayNo', 'summary', 'theme', 'title'];
  assert(index.every((item) => Object.keys(item).sort().join(',') === publicFields.join(',')), 'Public index contains unexpected classification fields');
  assert(new Set(index.map((item) => item.date)).size === index.length, 'Daily index contains duplicate dates');
  assert(new Set(archive.map((item) => item.title)).size === archive.length, 'Daily brief titles are not unique');

  for (let position = 1; position < index.length; position += 1) {
    assert(index[position].date === previousDay(index[position - 1].date), `Archive gap after ${index[position - 1].date}`);
  }

  archive.forEach((item) => {
    const pagePath = path.join(dailyDir, `${item.date}.html`);
    const assetPath = path.join(assetDir, `daily-${item.date}.svg`);
    assert(fs.existsSync(pagePath), `Daily page is missing: ${item.date}`);
    assert(fs.existsSync(assetPath), `Daily visual is missing: ${item.date}`);
    assert(fs.statSync(pagePath).size > 6500, `Daily page is unexpectedly shallow: ${item.date}`);
    assert(fs.statSync(assetPath).size > 1000, `Daily visual is unexpectedly small: ${item.date}`);
  });

  const samples = [
    '2019-07-10',
    '2020-01-01',
    '2021-06-18',
    '2022-12-31',
    '2023-07-10',
    '2024-05-01',
    '2025-12-18'
  ];
  samples.forEach((date) => {
    const page = read(`qilylean/daily/${date}.html`);
    assert(page.includes('现场识别信号') && page.includes('核心指标与证据口径'), `Engineering depth is missing: ${date}`);
    assert(page.includes('跨职能责任与交付接口') && page.includes('工程者手记'), `Professional closure is missing: ${date}`);
    assert(page.includes('/knowledge/') && page.includes('/projects/') && page.includes('/ai.html') && page.includes('/cooperation/'), `QilyLean module links are incomplete: ${date}`);
    assert(page.includes(`https://qilylean.com/qilylean/daily/${date}.html`), `Canonical URL is missing: ${date}`);
    assert(page.includes(`<img src="/qilylean/assets/daily-${date}.svg"`), `External share visual is missing: ${date}`);
    assert(page.includes('daily-briefs.css?v=20260728-daily-continuity-v4'), `Responsive archive stylesheet is not pinned: ${date}`);
    assert(!page.includes('<div class="date">' + date + '｜' + index.find((item) => item.date === date).theme + ' ·'), `Daily date line contains an unexpected suffix: ${date}`);
  });

  const firstPublished = read('qilylean/daily/2025-12-19.html');
  assert(firstPublished.includes('/qilylean/daily/2025-12-18.html'), 'Adjacent navigation is not continuous at 2025-12-19');

  const directory = read('qilylean/daily-insights.html');
  assert(directory.includes('id="briefSearch"'), 'Archive keyword search is missing');
  assert(directory.includes('data-year-filter="2019"') && directory.includes('data-year-filter="2025"'), 'Archive year filters are missing');
  assert(directory.includes(`共${index.length}期`), 'Archive directory total is incorrect');
  assert(!/<div class="brief-index-meta">[\s\S]*?<i>/i.test(directory), 'Public directory contains an unexpected classification badge');

  const sitemap = read('sitemap.xml');
  const dailyUrls = sitemap.match(/https:\/\/qilylean\.com\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html/g) || [];
  assert(dailyUrls.length === index.length, `Sitemap daily URL count is ${dailyUrls.length}; expected ${index.length}`);
  assert(sitemap.includes(`/qilylean/daily/${archiveStart}.html`), 'Earliest daily page is missing from sitemap');
  assert(!/DAY\d{3}/.test(directory), 'Legacy DAY sequence remains in the archive directory');

  process.stdout.write(`Daily archive validation passed: ${archive.length} archive pages + ${recent.length} recent pages = ${index.length} independent URLs.\n`);
}

main();
