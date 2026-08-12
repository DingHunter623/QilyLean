#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const siteDataFile = path.join(root, 'qilylean', 'site-data.json');
const trustFile = path.join(root, 'trust', 'index.html');
const checkOnly = process.argv.includes('--check');

function read(file) { return fs.readFileSync(file, 'utf8'); }
function maxIsoDate(...values) {
  return values.filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))).sort().pop() || '';
}
function escapeRe(value) { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function replaceStat(page, key, labels, value, outputLabel) {
  const alternatives = labels.map(escapeRe).join('|');
  const marked = new RegExp(`<div><strong\\b[^>]*data-trust-stat=["']${key}["'][^>]*>[^<]*<\\/strong><span>(?:${alternatives})<\\/span><\\/div>`, 'i');
  const visible = new RegExp(`<div><strong(?:\\s+[^>]*)?>[^<]*<\\/strong><span>(?:${alternatives})<\\/span><\\/div>`, 'i');
  const replacement = `<div><strong data-trust-stat="${key}">${value}</strong><span>${outputLabel}</span></div>`;
  if (marked.test(page)) return page.replace(marked, replacement);
  if (visible.test(page)) return page.replace(visible, replacement);
  throw new Error(`Missing trust metadata target: ${key}`);
}
function buildExpected(page, data) {
  if (!data.briefs || !Number.isInteger(data.briefs.total) || data.briefs.total < 1) throw new Error('Invalid central brief total');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.briefs.latestDate || '')) throw new Error('Invalid central latest brief date');
  const weekly = data.briefs.cadence === 'weekly_curated';
  const briefLabel = weekly ? '精选简报总数' : '今日简报总数';
  const latestLabel = weekly ? '最新精选日期' : '最新简报日期';
  let next = page;
  if (data.terminology && Number.isInteger(data.terminology.total)) {
    next = replaceStat(next, 'terminology', ['术语及单点课件'], data.terminology.total, '术语及单点课件');
  }
  next = replaceStat(next, 'briefs', ['今日简报总数', '精选简报总数'], data.briefs.total, briefLabel);
  next = replaceStat(next, 'latest-date', ['最新简报日期', '最新精选日期'], data.briefs.latestDate, latestLabel);
  if (data.search && Number.isInteger(data.search.indexedEntries)) {
    next = replaceStat(next, 'search', ['站内搜索索引条目'], data.search.indexedEntries, '站内搜索索引条目');
  }
  const syncVersion = maxIsoDate(data.generatedAt, data.briefs.latestDate) || data.briefs.latestDate;
  const markedSync = /(<strong>同步版本：<\/strong>\s*)<span\b[^>]*data-trust-sync-version[^>]*>\d{4}-\d{2}-\d{2}<\/span>(。)/i;
  const plainSync = /(<strong>同步版本：<\/strong>\s*)\d{4}-\d{2}-\d{2}(。)/i;
  const replacement = `$1<span data-trust-sync-version>${syncVersion}</span>$2`;
  if (markedSync.test(next)) next = next.replace(markedSync, replacement);
  else if (plainSync.test(next)) next = next.replace(plainSync, replacement);
  else throw new Error('Missing trust metadata target: sync version');
  return next;
}
function validate(page, data) {
  const weekly = data.briefs.cadence === 'weekly_curated';
  const expected = [
    ['briefs', data.briefs.total, weekly ? '精选简报总数' : '今日简报总数'],
    ['latest-date', data.briefs.latestDate, weekly ? '最新精选日期' : '最新简报日期']
  ];
  if (data.terminology && Number.isInteger(data.terminology.total)) expected.unshift(['terminology', data.terminology.total, '术语及单点课件']);
  if (data.search && Number.isInteger(data.search.indexedEntries)) expected.push(['search', data.search.indexedEntries, '站内搜索索引条目']);
  for (const [key, value, label] of expected) {
    const re = new RegExp(`<div><strong\\b[^>]*data-trust-stat=["']${escapeRe(key)}["'][^>]*>${escapeRe(value)}<\\/strong><span>${escapeRe(label)}<\\/span><\\/div>`, 'i');
    if (!re.test(page)) throw new Error(`Trust statistic is stale: ${key}`);
  }
  const syncVersion = maxIsoDate(data.generatedAt, data.briefs.latestDate) || data.briefs.latestDate;
  if (!new RegExp(`<span\\b[^>]*data-trust-sync-version[^>]*>${escapeRe(syncVersion)}<\\/span>`, 'i').test(page)) throw new Error('Trust sync version is stale');
}
function main() {
  const data = JSON.parse(read(siteDataFile));
  const current = read(trustFile);
  const expected = buildExpected(current, data);
  if (checkOnly) {
    validate(current, data);
    if (current !== expected) throw new Error('Trust metadata contains an unsynchronized generated field');
    process.stdout.write(`Trust metadata is synchronized: ${data.briefs.total} ${data.briefs.cadence === 'weekly_curated' ? 'curated briefs' : 'briefs'}, latest ${data.briefs.latestDate}.\n`);
    return;
  }
  if (current !== expected) fs.writeFileSync(trustFile, expected, 'utf8');
  validate(expected, data);
  process.stdout.write(`Trust metadata synchronized: ${data.briefs.total} ${data.briefs.cadence === 'weekly_curated' ? 'curated briefs' : 'briefs'}, latest ${data.briefs.latestDate}.\n`);
}
main();
