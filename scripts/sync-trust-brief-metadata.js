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

function statExpression(key, labelPattern, valuePattern) {
  return new RegExp(
    `(<strong\\b[^>]*data-trust-stat=["']${key}["'][^>]*>)${valuePattern}(<\\/strong>\\s*<span>)${labelPattern}(<\\/span>)`,
    'i'
  );
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
  const weeklyCurated = data.briefs.cadence === 'weekly_curated';
  const briefLabel = weeklyCurated ? '精选简报总数' : '今日简报总数';
  const latestLabel = weeklyCurated ? '最新精选日期' : '最新简报日期';
  const indexedEntries = data.search && Number.isInteger(data.search.indexedEntries)
    ? data.search.indexedEntries
    : null;
  const syncVersion = maxIsoDate(data.generatedAt, latestDate) || latestDate;

  let next = page;
  next = replaceRequired(
    next,
    statExpression('briefs', '(?:今日简报总数|精选简报总数)', '\\d+'),
    `$1${briefTotal}$2${briefLabel}$4`,
    'brief total'
  );
  next = replaceRequired(
    next,
    statExpression('latest-date', '(?:最新简报日期|最新精选日期)', '\\d{4}-\\d{2}-\\d{2}'),
    `$1${latestDate}$2${latestLabel}$4`,
    'latest brief date'
  );

  if (indexedEntries !== null) {
    next = replaceRequired(
      next,
      statExpression('search', '站内搜索索引条目', '\\d+'),
      `$1${indexedEntries}$2站内搜索索引条目$4`,
      'search index entries'
    );
  }

  next = replaceRequired(
    next,
    /(<strong>同步版本：<\/strong>\s*<span\b[^>]*data-trust-sync-version[^>]*>)\d{4}-\d{2}-\d{2}(<\/span>。)/i,
    `$1${syncVersion}$2`,
    'sync version'
  );

  return next;
}

function validateStat(page, key, label, expected, valuePattern) {
  const expression = statExpression(key, label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), valuePattern);
  const match = page.match(expression);
  if (!match) throw new Error(`Trust ${label} target is missing`);
  const actual = match[1] ? match[0].match(new RegExp(`>${valuePattern}<`, 'i')) : null;
  const current = actual ? actual[0].slice(1, -1) : '';
  if (String(current) !== String(expected)) {
    throw new Error(`Trust ${label} is stale: expected ${expected}, found ${current || 'unknown'}`);
  }
}

function validate(page, data) {
  const weeklyCurated = data.briefs && data.briefs.cadence === 'weekly_curated';
  const briefLabel = weeklyCurated ? '精选简报总数' : '今日简报总数';
  const latestLabel = weeklyCurated ? '最新精选日期' : '最新简报日期';
  validateStat(page, 'briefs', briefLabel, data.briefs.total, '\\d+');
  validateStat(page, 'latest-date', latestLabel, data.briefs.latestDate, '\\d{4}-\\d{2}-\\d{2}');
  if (data.search && Number.isInteger(data.search.indexedEntries)) {
    validateStat(page, 'search', '站内搜索索引条目', data.search.indexedEntries, '\\d+');
  }

  const syncVersion = maxIsoDate(data.generatedAt, data.briefs.latestDate) || data.briefs.latestDate;
  const syncMatch = page.match(/<span\b[^>]*data-trust-sync-version[^>]*>(\d{4}-\d{2}-\d{2})<\/span>/i);
  if (!syncMatch) throw new Error('Trust sync version target is missing');
  if (syncMatch[1] !== syncVersion) throw new Error(`Trust sync version is stale: expected ${syncVersion}, found ${syncMatch[1]}`);
}

function main() {
  const data = JSON.parse(read(siteDataFile));
  const current = read(trustFile);
  const expected = buildExpected(current, data);

  if (checkOnly) {
    validate(current, data);
    if (current !== expected) throw new Error('Trust metadata contains an unsynchronized generated field');
    process.stdout.write(`Trust brief metadata is synchronized: ${data.briefs.total} ${data.briefs.cadence === 'weekly_curated' ? 'curated briefs' : 'briefs'}, latest ${data.briefs.latestDate}.\n`);
    return;
  }

  if (current !== expected) fs.writeFileSync(trustFile, expected, 'utf8');
  validate(expected, data);
  process.stdout.write(`Trust brief metadata synchronized: ${data.briefs.total} ${data.briefs.cadence === 'weekly_curated' ? 'curated briefs' : 'briefs'}, latest ${data.briefs.latestDate}.\n`);
}

main();
