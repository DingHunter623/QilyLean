#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dailyDir = path.join(root, 'qilylean', 'daily');
const indexFile = path.join(dailyDir, 'index.json');
const directoryFile = path.join(root, 'qilylean', 'daily-insights.html');
const latestBriefFile = path.join(root, 'qilylean', 'latest-brief.js');
const latestCardFile = path.join(root, 'qilylean', 'daily-insights-card.js');

function decode(value) {
  return String(value)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function jsString(value) {
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, ' ')}'`;
}

function writeIfChanged(file, content) {
  const normalized = content.endsWith('\n') ? content : `${content}\n`;
  const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (current === normalized) return false;
  fs.writeFileSync(file, normalized);
  return true;
}

function capture(value, expression) {
  const match = String(value).match(expression);
  return match ? match[1] : '';
}

function parseBrief(file, existing) {
  const date = path.basename(file, '.html');
  const page = fs.readFileSync(file, 'utf8');
  const article = capture(page, /(<article\b[^>]*class="[^"]*\bpost\b[^"]*"[^>]*>[\s\S]*?<\/article>)/i) || page;
  const dateLine = decode(capture(article, /<div\b[^>]*class="[^"]*\bdate\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i));
  const title = decode(capture(article, /<h2\b[^>]*>([\s\S]*?)<\/h2>/i));
  const summary = decode(capture(article, /<p\b[^>]*>([\s\S]*?)<\/p>/i));
  const dayNo = (dateLine.match(/DAY\d+/i) || [existing && existing.dayNo || ''])[0];
  const theme = dateLine
    .replace(date, '')
    .replace(dayNo || '', '')
    .replace(/[｜|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!title && existing) return existing;
  if (!title) throw new Error(`Cannot parse title from ${file}`);
  return {
    date,
    title,
    summary: summary || existing && existing.summary || '',
    dayNo: dayNo || '',
    theme: theme || existing && existing.theme || '今日简报'
  };
}

function buildIndex() {
  let existing = [];
  try {
    existing = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
  } catch (error) {
    existing = [];
  }
  const existingMap = new Map(existing.map((item) => [item.date, item]));
  const files = fs.readdirSync(dailyDir)
    .filter((name) => /^\d{4}-\d{2}-\d{2}\.html$/.test(name))
    .sort()
    .reverse();
  const items = files.map((name) => parseBrief(path.join(dailyDir, name), existingMap.get(name.slice(0, 10))));
  writeIfChanged(indexFile, JSON.stringify(items, null, 2));
  return items;
}

function updateDirectory(items) {
  if (!fs.existsSync(directoryFile)) return;
  const latest = items[0];
  const earliest = items[items.length - 1];
  let page = fs.readFileSync(directoryFile, 'utf8');
  page = page.replace(
    /<p id="briefRange">[\s\S]*?<\/p>/,
    `<p id="briefRange">${earliest.date}—${latest.date}｜共${items.length}期｜按月份收纳、最新优先</p>`
  );
  page = page.replace(
    /<a id="latestBriefLink" href="[^"]*">[\s\S]*?<\/a>/,
    `<a id="latestBriefLink" href="/qilylean/daily/${latest.date}.html">打开最新简报</a>`
  );
  page = page.replace(/正在加载全部\d+期简报…/g, `正在加载全部${items.length}期简报…`);
  page = page.replace(
    /<noscript>[\s\S]*?<\/noscript>/,
    `<noscript><article class="brief-index-card latest"><div class="brief-index-meta"><time datetime="${latest.date}">${latest.date}</time><span>${escapeHtml(latest.theme)}</span></div><h2><a href="/qilylean/daily/${latest.date}.html">${escapeHtml(latest.title)}</a></h2><div class="brief-index-actions"><a class="brief-open" href="/qilylean/daily/${latest.date}.html">打开本期简报</a></div></article></noscript>`
  );
  const release = `var RELEASE={date:${jsString(latest.date)},title:${jsString(latest.title)},summary:${jsString(latest.summary)},dayNo:${jsString(latest.dayNo || '')},theme:${jsString(latest.theme)}};`;
  page = page.replace(/var RELEASE=\{[\s\S]*?\};/, release);
  writeIfChanged(directoryFile, page);
}

function updateLatestBriefFallback(items) {
  if (!fs.existsSync(latestBriefFile)) return;
  const latest = items[0];
  let script = fs.readFileSync(latestBriefFile, 'utf8');
  const object = `var releaseCandidate={\n  date:${jsString(latest.date)},\n  theme:${jsString(latest.theme)},\n  title:${jsString(latest.title)},\n  summary:${jsString(latest.summary)},\n  href:${jsString(`/qilylean/daily/${latest.date}.html`)}\n};`;
  script = script.replace(/var releaseCandidate=\{[\s\S]*?\n\};/, object);
  writeIfChanged(latestBriefFile, script);

  if (fs.existsSync(latestCardFile)) {
    let card = fs.readFileSync(latestCardFile, 'utf8');
    card = card.replace(/var release=\{date:'\d{4}-\d{2}-\d{2}'\};/, `var release={date:${jsString(latest.date)}};`);
    writeIfChanged(latestCardFile, card);
  }
}

function main() {
  const items = buildIndex();
  if (!items.length) throw new Error('No published daily brief pages were found');
  updateDirectory(items);
  updateLatestBriefFallback(items);
  process.stdout.write(`Daily brief source synchronized: ${items.length} pages, latest ${items[0].date}.\n`);
}

main();
