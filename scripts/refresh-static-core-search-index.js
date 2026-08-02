#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const indexFile = path.join(root, 'qilylean', 'site-search-index.json');
const siteDataFile = path.join(root, 'qilylean', 'site-data.json');
const targets = [
  { url: '/', file: 'index.html', kind: '首页' },
  { url: '/cooperation/', file: 'cooperation/index.html', kind: '项目合作' },
  { url: '/qilylean/daily-insights.html', file: 'qilylean/daily-insights.html', kind: '今日简报目录' }
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/\s+/g, ' ')
    .trim();
}

function capture(value, expression) {
  const match = String(value).match(expression);
  return match ? match[1] : '';
}

function stripDocument(html) {
  return String(html)
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<header\b[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer\b[\s\S]*?<\/footer>/gi, ' ');
}

function makeEntry(data) {
  return {
    url: data.url,
    title: decodeHtml(data.title) || 'QilyLean',
    code: '',
    description: decodeHtml(data.description),
    headings: decodeHtml(data.headings),
    text: decodeHtml(data.text).slice(0, 12000),
    kind: data.kind,
    date: ''
  };
}

function pageEntries(target) {
  const html = read(target.file);
  const clean = stripDocument(html);
  const title = capture(html, /<meta\b[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i)
    || capture(html, /<title>([\s\S]*?)<\/title>/i)
    || capture(clean, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const description = capture(html, /<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  const headings = Array.from(clean.matchAll(/<h[123]\b[^>]*>([\s\S]*?)<\/h[123]>/gi), (match) => decodeHtml(match[1])).join(' ｜ ');
  const entries = [makeEntry({
    url: target.url,
    title,
    description,
    headings,
    text: clean,
    kind: target.kind
  })];

  Array.from(clean.matchAll(/<article\b[^>]*class=["'][^"']*(?:qily-ia-card|module-card)[^"']*["'][^>]*>([\s\S]*?)<\/article>/gi)).forEach((match) => {
    const card = match[1];
    const cardTitle = capture(card, /<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>/i);
    if (!decodeHtml(cardTitle)) return;
    const paragraph = capture(card, /<p\b[^>]*>([\s\S]*?)<\/p>/i);
    entries.push(makeEntry({
      url: target.url,
      title: cardTitle,
      description: paragraph,
      headings: title,
      text: card,
      kind: target.kind
    }));
  });
  return entries;
}

const payload = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
if (!Array.isArray(payload.entries)) throw new Error('Generated search index entries are missing');

const targetUrls = new Set(targets.map((target) => target.url));
const preserved = payload.entries.filter((entry) => !targetUrls.has(entry.url));
const refreshed = targets.flatMap(pageEntries);
const merged = [...refreshed, ...preserved];
const seen = new Set();
payload.entries = merged.filter((entry) => {
  const key = `${entry.url}|${entry.title}`.toLocaleLowerCase('zh-CN');
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});
payload.generatedAt = new Date().toISOString().slice(0, 10);
payload.meta = payload.meta || {};
payload.meta.indexedEntries = payload.entries.length;
payload.meta.indexedPages = new Set(payload.entries.map((entry) => entry.url)).size;
fs.writeFileSync(indexFile, JSON.stringify(payload, null, 2) + '\n', 'utf8');

if (fs.existsSync(siteDataFile)) {
  const siteData = JSON.parse(fs.readFileSync(siteDataFile, 'utf8'));
  siteData.search = Object.assign({}, siteData.search || {}, payload.meta);
  siteData.generatedAt = payload.generatedAt;
  fs.writeFileSync(siteDataFile, JSON.stringify(siteData, null, 2) + '\n', 'utf8');
}

const home = payload.entries.find((entry) => entry.url === '/');
const cooperation = payload.entries.find((entry) => entry.url === '/cooperation/');
const daily = payload.entries.find((entry) => entry.url === '/qilylean/daily-insights.html');
if (!home || !home.text.includes('把复杂制造问题，转化为可验证的交付结果')) throw new Error('Homepage search entry is not based on final static HTML');
if (home.text.includes('职能标签') || home.text.includes('超千万元累计改善收益')) throw new Error('Legacy homepage text remains in search index');
if (!cooperation || !cooperation.text.includes('分阶段付款') || !cooperation.text.includes('验收边界')) throw new Error('Cooperation search entry misses the static transaction summary');
if (cooperation.text.includes('超千万元累计项目改善收益')) throw new Error('Legacy cooperation claim remains in search index');
if (!daily || !daily.text.includes('不等同于网页首次公开发布日期')) throw new Error('Daily archive search entry misses the static disclosure');

process.stdout.write(`Refreshed final static core search entries; index now contains ${payload.entries.length} entries.\n`);
