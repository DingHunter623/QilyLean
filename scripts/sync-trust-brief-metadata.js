#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const siteDataFile = path.join(root, 'qilylean', 'site-data.json');
const trustFile = path.join(root, 'trust', 'index.html');
const checkOnly = process.argv.includes('--check');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function replaceRequired(value, expression, replacement, label) {
  if (!expression.test(value)) throw new Error(`Missing trust metadata target: ${label}`);
  expression.lastIndex = 0;
  return value.replace(expression, replacement);
}

function maxIsoDate(...values) {
  return values
    .filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')))
    .sort()
    .pop() || '';
}

function buildExpected(page, data) {
  if (!data.briefs || !Number.isInteger(data.briefs.total) || data.briefs.total < 1) {
    throw new Error('Invalid central brief total');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.briefs.latestDate || '')) {
    throw new Error('Invalid central latest brief date');
  }

  const briefTotal = data.briefs.total;
  const latestDate = data.briefs.latestDate;
  const indexedEntries = data.search && Number.isInteger(data.search.indexedEntries)
    ? data.search.indexedEntries
    : null;
  const syncVersion = maxIsoDate(data.generatedAt, latestDate) || latestDate;

  let next = page;
  next = replaceRequired(
    next,
    /<div><strong>\d+<\/strong><span>今日简报总数<\/span><\/div>/,
    `<div><strong>${briefTotal}</strong><span>今日简报总数</span></div>`,
    'brief total'
  );
  next = replaceRequired(
    next,
    /<div><strong>\d{4}-\d{2}-\d{2}<\/strong><span>最新简报日期<\/span><\/div>/,
    `<div><strong>${latestDate}</strong><span>最新简报日期</span></div>`,
    'latest brief date'
  );

  if (indexedEntries !== null) {
    next = replaceRequired(
      next,
      /<div><strong>\d+<\/strong><span>站内搜索索引条目<\/span><\/div>/,
      `<div><strong>${indexedEntries}</strong><span>站内搜索索引条目</span></div>`,
      'search index entries'
    );
  }

  next = replaceRequired(
    next,
    /(<strong>同步版本：<\/strong>)\d{4}-\d{2}-\d{2}。/,
    `$1${syncVersion}。`,
    'sync version'
  );

  return next;
}

function validate(page, data) {
  const expectedTotal = `<strong>${data.briefs.total}</strong><span>今日简报总数</span>`;
  const expectedDate = `<strong>${data.briefs.latestDate}</strong><span>最新简报日期</span>`;
  if (!page.includes(expectedTotal)) throw new Error(`Trust brief total is stale: expected ${data.briefs.total}`);
  if (!page.includes(expectedDate)) throw new Error(`Trust latest brief date is stale: expected ${data.briefs.latestDate}`);
  if (data.search && Number.isInteger(data.search.indexedEntries)) {
    const expectedSearch = `<strong>${data.search.indexedEntries}</strong><span>站内搜索索引条目</span>`;
    if (!page.includes(expectedSearch)) throw new Error(`Trust search index count is stale: expected ${data.search.indexedEntries}`);
  }
}

function main() {
  const data = JSON.parse(read(siteDataFile));
  const current = read(trustFile);
  const expected = buildExpected(current, data);

  if (checkOnly) {
    validate(current, data);
    if (current !== expected) throw new Error('Trust metadata contains an unsynchronized generated field');
    process.stdout.write(`Trust brief metadata is synchronized: ${data.briefs.total} briefs, latest ${data.briefs.latestDate}.\n`);
    return;
  }

  if (current !== expected) fs.writeFileSync(trustFile, expected, 'utf8');
  validate(expected, data);
  process.stdout.write(`Trust brief metadata synchronized: ${data.briefs.total} briefs, latest ${data.briefs.latestDate}.\n`);
}

main();
