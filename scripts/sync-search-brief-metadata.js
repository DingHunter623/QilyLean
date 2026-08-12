#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dailyIndexFile = path.join(root, 'qilylean', 'daily', 'index.json');
const siteDataFile = path.join(root, 'qilylean', 'site-data.json');
const searchIndexFile = path.join(root, 'qilylean', 'site-search-index.json');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeIfChanged(file, value) {
  const next = `${JSON.stringify(value, null, 2)}\n`;
  const current = fs.readFileSync(file, 'utf8');
  if (current === next) return false;
  fs.writeFileSync(file, next, 'utf8');
  return true;
}

function clean(value) {
  return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
}

function curatedBriefEntry(item) {
  const date = clean(item.date);
  const title = clean(item.title) || `精选简报｜${date}`;
  const theme = clean(item.theme) || '制造工程';
  const summary = clean(item.summary) || 'QilyLean精选制造工程简报。';
  return {
    url: `/qilylean/daily/${date}.html`,
    title,
    code: '',
    description: summary,
    headings: `${date} ｜ ${theme} ｜ ${title}`,
    text: `${title} ${summary} 主题：${theme}。QilyLean精选简报，按周保留具备制造专业相关性、工程逻辑、验证与长期复用价值的内容。`,
    kind: '精选简报',
    date
  };
}

const briefs = readJson(dailyIndexFile);
const siteData = readJson(siteDataFile);
const searchIndex = readJson(searchIndexFile);

if (!Array.isArray(briefs) || briefs.length === 0) {
  throw new Error('Curated brief index is empty; search metadata cannot be synchronized.');
}
if (!searchIndex || !Array.isArray(searchIndex.entries)) {
  throw new Error('Site search index has no entries array.');
}

const sorted = [...briefs].sort((a, b) => String(b.date).localeCompare(String(a.date)));
const latestDate = sorted[0] && sorted[0].date;
if (!/^\d{4}-\d{2}-\d{2}$/.test(latestDate || '')) {
  throw new Error(`Invalid latest curated brief date: ${latestDate || '(empty)'}`);
}

const nonBriefEntries = searchIndex.entries.filter((entry) => {
  const url = String(entry && entry.url || '');
  return !/^\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html$/.test(url);
});
const briefEntries = sorted.map(curatedBriefEntry);
searchIndex.entries = [...nonBriefEntries, ...briefEntries];
searchIndex.generatedAt = latestDate;
searchIndex.schemaVersion = searchIndex.schemaVersion || 1;
searchIndex.meta = {
  ...(searchIndex.meta && typeof searchIndex.meta === 'object' ? searchIndex.meta : {}),
  indexedEntries: searchIndex.entries.length,
  indexedPages: new Set(searchIndex.entries.map((entry) => String(entry && entry.url || '')).filter(Boolean)).size,
  terminologyTotal: siteData.terminology && Number.isInteger(siteData.terminology.total)
    ? siteData.terminology.total
    : 0,
  briefTotal: sorted.length,
  latestBriefDate: latestDate,
  sitemapLastmod: latestDate
};

if (searchIndex.meta.terminologyTotal < 1) {
  throw new Error('Terminology total is unavailable; search metadata cannot be synchronized.');
}

siteData.search = {
  ...(siteData.search && typeof siteData.search === 'object' ? siteData.search : {}),
  indexedEntries: searchIndex.meta.indexedEntries,
  indexedPages: searchIndex.meta.indexedPages,
  terminologyTotal: searchIndex.meta.terminologyTotal,
  briefTotal: searchIndex.meta.briefTotal,
  latestBriefDate: searchIndex.meta.latestBriefDate
};

const searchChanged = writeIfChanged(searchIndexFile, searchIndex);
const siteDataChanged = writeIfChanged(siteDataFile, siteData);

const retainedUrls = new Set(briefEntries.map((entry) => entry.url));
if (retainedUrls.size !== sorted.length) throw new Error('Curated brief search URLs are not unique.');
if (!retainedUrls.has(`/qilylean/daily/${latestDate}.html`)) throw new Error('Latest curated brief is missing from the search index.');
if (searchIndex.meta.briefTotal !== sorted.length) throw new Error('Search index brief count is stale.');

process.stdout.write(
  `Search index synchronized: ${sorted.length} curated briefs, latest ${latestDate}, ${searchIndex.meta.terminologyTotal} terms, ${searchIndex.meta.indexedEntries} entries / ${searchIndex.meta.indexedPages} URLs; index changed ${searchChanged}, site data changed ${siteDataChanged}.\n`
);
