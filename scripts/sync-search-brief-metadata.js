#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dailyIndexFile = path.join(root, 'qilylean', 'daily', 'index.json');
const siteDataFile = path.join(root, 'qilylean', 'site-data.json');

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

const briefs = readJson(dailyIndexFile);
const siteData = readJson(siteDataFile);

if (!Array.isArray(briefs) || briefs.length === 0) {
  throw new Error('Daily index is empty; search metadata cannot be synchronized.');
}

const sorted = [...briefs].sort((a, b) => String(b.date).localeCompare(String(a.date)));
const latestDate = sorted[0] && sorted[0].date;
if (!/^\d{4}-\d{2}-\d{2}$/.test(latestDate || '')) {
  throw new Error(`Invalid latest daily date: ${latestDate || '(empty)'}`);
}

siteData.search = {
  ...(siteData.search && typeof siteData.search === 'object' ? siteData.search : {}),
  terminologyTotal: siteData.terminology && Number.isInteger(siteData.terminology.total)
    ? siteData.terminology.total
    : 0,
  briefTotal: sorted.length,
  latestBriefDate: latestDate
};

if (siteData.search.terminologyTotal < 1) {
  throw new Error('Terminology total is unavailable; search metadata cannot be synchronized.');
}

const changed = writeIfChanged(siteDataFile, siteData);
process.stdout.write(
  `Search metadata synchronized: ${siteData.search.briefTotal} briefs, latest ${siteData.search.latestBriefDate}, ${siteData.search.terminologyTotal} terms; changed ${changed}.\n`
);
