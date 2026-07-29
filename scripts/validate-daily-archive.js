#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { archiveStart, archiveEnd, careerTimeline } = require('./daily-engineering-archive');

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
  const productTerms = ['电子烟', '游戏机手柄', '电磁阀', '新能源负极材料', '负极材料', '逆变器', '汽车电子', '整流器', '继电器', '小家电', '汽车座椅开关总成', '汽车座椅开关', '座椅开关'];
  const requiredEngineeringThemes = ['PE工程', 'IE方法', 'ME工程', 'JIT', 'PDCA', 'PQCD', 'OEE', 'NPI四阶段', '精益物流', 'Kaizen'];

  assert(index.length > expectedArchive, 'Archive does not include the recent period');
  assert(index[0].date === '2026-07-29', `Latest daily brief must be 2026-07-29; found ${index[0].date}`);
  assert(archive.length === expectedArchive, `Expected ${expectedArchive} archive briefs; found ${archive.length}`);
  assert(index[index.length - 1].date === archiveStart, `Archive must begin on ${archiveStart}`);
  assert(archive[0].date === archiveEnd, `First archive period must end on ${archiveEnd}`);
  assert(recent[recent.length - 1].date === '2025-12-19', 'Recent period must begin on 2025-12-19');
  const publicFields = ['date', 'dayNo', 'summary', 'theme', 'title'];
  assert(index.every((item) => Object.keys(item).sort().join(',') === publicFields.join(',')), 'Public index contains unexpected classification fields');
  assert(new Set(index.map((item) => item.date)).size === index.length, 'Daily index contains duplicate dates');
  assert(new Set(archive.map((item) => item.title)).size === archive.length, 'Daily brief titles are not unique');
  assert(archive.every((item) => !item.title.includes('｜')), 'Archive titles still use the former uniform pipe pattern');
  assert(archive.every((item) => !productTerms.some((term) => `${item.title} ${item.summary} ${item.theme}`.includes(term))), 'Archive index still exposes product-led daily wording');
  requiredEngineeringThemes.forEach((theme) => {
    assert(archive.some((item) => item.theme === theme), `Engineering theme is missing from the long-term archive: ${theme}`);
  });
  const titleShape = (title) => title.replace(/[\u3400-\u9fffA-Za-z0-9／-]+/g, '字');
  let sameShapeRun = 1;
  let longestShapeRun = 1;
  for (let position = 1; position < archive.length; position += 1) {
    sameShapeRun = titleShape(archive[position].title) === titleShape(archive[position - 1].title) ? sameShapeRun + 1 : 1;
    longestShapeRun = Math.max(longestShapeRun, sameShapeRun);
  }
  assert(longestShapeRun <= 2, `Archive title sentence patterns repeat ${longestShapeRun} times consecutively`);

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
    assert((page.match(/<h3>/g) || []).length >= 9, `Engineering depth is missing: ${date}`);
    assert(page.includes('class="owner-grid"') && page.includes('工程者手记'), `Professional closure is missing: ${date}`);
    assert(page.includes('/knowledge/') && page.includes('/projects/') && page.includes('/ai.html') && page.includes('/cooperation/'), `QilyLean module links are incomplete: ${date}`);
    assert(page.includes(`https://qilylean.com/qilylean/daily/${date}.html`), `Canonical URL is missing: ${date}`);
    assert(page.includes(`<img src="/qilylean/assets/daily-${date}.svg"`), `External share visual is missing: ${date}`);
    assert(page.includes('daily-briefs.css?v=20260729-engineering-system-v5'), `Responsive archive stylesheet is not pinned: ${date}`);
    assert(!page.includes('<div class="date">' + date + '｜' + index.find((item) => item.date === date).theme + ' ·'), `Daily date line contains an unexpected suffix: ${date}`);
  });

  index.forEach((item) => {
    const page = read(`qilylean/daily/${item.date}.html`);
    assert(!productTerms.some((term) => page.includes(term)), `Product-led wording remains in daily brief: ${item.date}`);
    assert(!page.includes('每日工程版简报'), `Former public brief name remains: ${item.date}`);
  });
  fs.readdirSync(assetDir).filter((name) => /^daily-.*\.svg$/.test(name)).forEach((name) => {
    assert(!fs.readFileSync(path.join(assetDir, name), 'utf8').includes('每日工程版简报'), `Former public brief name remains in visual: ${name}`);
  });

  const firstPublished = read('qilylean/daily/2025-12-19.html');
  assert(firstPublished.includes('/qilylean/daily/2025-12-18.html'), 'Adjacent navigation is not continuous at 2025-12-19');

  const directory = read('qilylean/daily-insights.html');
  assert(!directory.includes('每日工程版简报'), 'Former public brief name remains in the directory');
  assert(directory.includes('<h1>今日简报</h1>'), 'Unified public brief name is missing from the directory');
  assert(directory.includes('id="briefSearch"'), 'Archive keyword search is missing');
  assert(directory.includes('data-year-filter="2019"') && directory.includes('data-year-filter="2025"'), 'Archive year filters are missing');
  assert(directory.includes(`共${index.length}期`), 'Archive directory total is incorrect');
  assert(!/<div class="brief-index-meta">[\s\S]*?<i>/i.test(directory), 'Public directory contains an unexpected classification badge');
  assert(directory.includes('工程项目履历主线'), 'Consolidated career timeline is missing');
  assert(directory.includes('<col class="career-year-col">'), 'Career timeline does not use the narrow year column');
  careerTimeline.forEach((item) => {
    assert(directory.includes(`${item.year}年`) && directory.includes(item.field), `Career timeline is incomplete for ${item.year}`);
  });
  assert(
    careerTimeline.every((item, position) => position === 0 || Number(careerTimeline[position - 1].year) > Number(item.year)),
    'Career timeline is not ordered from newest to earliest'
  );
  assert(careerTimeline.find((item) => item.year === '2024').field === '汽车电子、整流器', 'The 2024 career field is not correct');
  const dailyCss = read('qilylean/daily-briefs.css');
  assert(/\.career-table \.career-year-col\{width:116px\}/.test(dailyCss), 'Desktop career year column is not narrowed');
  assert(/\.career-table \.career-year-col\{width:70px\}/.test(dailyCss), 'Mobile career year column is not narrowed');

  const latestPage = read('qilylean/daily/2026-07-29.html');
  ['PE', 'IE', 'NPI', 'ME', 'JIT', 'PDCA', 'PQCD', 'OEE', 'EVT', 'DVT', 'PVT', 'MP', '精益物流', 'Kaizen'].forEach((term) => {
    assert(latestPage.includes(term), `July 29 engineering brief is missing: ${term}`);
  });

  const sitemap = read('sitemap.xml');
  const dailyUrls = sitemap.match(/https:\/\/qilylean\.com\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html/g) || [];
  assert(dailyUrls.length === index.length, `Sitemap daily URL count is ${dailyUrls.length}; expected ${index.length}`);
  assert(sitemap.includes(`/qilylean/daily/${archiveStart}.html`), 'Earliest daily page is missing from sitemap');
  assert(!/DAY\d{3}/.test(directory), 'Legacy DAY sequence remains in the archive directory');

  process.stdout.write(`Daily archive validation passed: ${archive.length} archive pages + ${recent.length} recent pages = ${index.length} independent URLs.\n`);
}

main();
