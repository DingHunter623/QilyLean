#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dailyIndexFile = path.join(root, 'qilylean', 'daily', 'index.json');
const siteDataFile = path.join(root, 'qilylean', 'site-data.json');
const searchIndexFile = path.join(root, 'qilylean', 'site-search-index.json');
const sitemapFile = path.join(root, 'sitemap.xml');

function read(file) { return fs.readFileSync(file, 'utf8'); }
function readJson(file) { return JSON.parse(read(file)); }
function writeIfChanged(file, value) {
  const next = `${JSON.stringify(value, null, 2)}\n`;
  const current = fs.existsSync(file) ? read(file) : '';
  if (current === next) return false;
  fs.writeFileSync(file, next, 'utf8');
  return true;
}
function clean(value) { return String(value == null ? '' : value).replace(/\s+/g, ' ').trim(); }
function decodeHtml(value) {
  return String(value == null ? '' : value)
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
function entry(data) {
  return {
    url: data.url || '/',
    title: decodeHtml(data.title) || 'QilyLean',
    code: decodeHtml(data.code || ''),
    description: decodeHtml(data.description || ''),
    headings: decodeHtml(data.headings || ''),
    text: decodeHtml(data.text || '').slice(0, 12000),
    kind: decodeHtml(data.kind || '网页'),
    date: decodeHtml(data.date || '')
  };
}
function urlToFile(url) {
  let pathname;
  try {
    const parsed = new URL(url);
    if (parsed.origin !== 'https://qilylean.com') return '';
    pathname = decodeURIComponent(parsed.pathname);
  } catch (_) { return ''; }
  if (pathname === '/') return 'index.html';
  const cleanPath = pathname.replace(/^\//, '');
  if (pathname.endsWith('/')) return `${cleanPath}index.html`;
  if (/\.html$/i.test(cleanPath)) return cleanPath;
  return '';
}
function pageEntries(url, html) {
  const stripped = stripDocument(html);
  const title = capture(html, /<meta\b[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i)
    || capture(html, /<title>([\s\S]*?)<\/title>/i)
    || capture(stripped, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const description = capture(html, /<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  const headings = Array.from(stripped.matchAll(/<h[123]\b[^>]*>([\s\S]*?)<\/h[123]>/gi), (match) => decodeHtml(match[1])).join(' ｜ ');
  const result = [entry({ url, title, description, headings, text: stripped, kind: '网页' })];

  if (url === '/knowledge/terminology.html') {
    Array.from(html.matchAll(/<article\b[^>]*data-term-card[^>]*>([\s\S]*?)<\/article>/gi)).forEach((match) => {
      const card = match[1];
      const code = capture(card, /<div\b[^>]*class=["'][^"']*term-code[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
      const english = capture(card, /<div\b[^>]*class=["'][^"']*term-en[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
      const chinese = capture(card, /<h3\b[^>]*>([\s\S]*?)<\/h3>/i);
      const decodedCode = decodeHtml(code);
      if (!decodedCode) return;
      result.push(entry({
        url: `${url}?term=${encodeURIComponent(decodedCode)}`,
        title: `${decodedCode}｜${decodeHtml(chinese)}`,
        code,
        description: english,
        headings: '全站术语词典',
        text: card,
        kind: '全站术语'
      }));
    });
  }

  Array.from(stripped.matchAll(/<article\b[^>]*class=["'][^"']*module-card[^"']*["'][^>]*>([\s\S]*?)<\/article>/gi)).forEach((match) => {
    const card = match[1];
    const cardTitle = capture(card, /<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>/i);
    if (!decodeHtml(cardTitle)) return;
    const paragraph = capture(card, /<p\b[^>]*>([\s\S]*?)<\/p>/i);
    result.push(entry({ url, title: cardTitle, description: paragraph, headings: title, text: card, kind: decodeHtml(title) }));
  });
  return result;
}
function sitemapEntries() {
  if (!fs.existsSync(sitemapFile)) return [];
  const entries = [];
  for (const absoluteUrl of Array.from(read(sitemapFile).matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1])) {
    let pathname;
    try {
      const parsed = new URL(absoluteUrl);
      if (parsed.origin !== 'https://qilylean.com') continue;
      pathname = parsed.pathname;
    } catch (_) { continue; }
    if (/^\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html$/.test(pathname)) continue;
    const relative = urlToFile(absoluteUrl);
    if (!relative) continue;
    const file = path.join(root, relative);
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) continue;
    entries.push(...pageEntries(pathname, read(file)));
  }
  return entries;
}
function curatedBriefEntry(item) {
  const date = clean(item.date);
  const title = clean(item.title) || `精选简报｜${date}`;
  const theme = clean(item.theme) || '制造工程';
  const summary = clean(item.summary) || 'QilyLean精选制造工程简报。';
  return entry({
    url: `/qilylean/daily/${date}.html`,
    title,
    description: summary,
    headings: `${date} ｜ ${theme} ｜ ${title}`,
    text: `${title} ${summary} 主题：${theme}。QilyLean精选简报，按周保留具备制造专业相关性、工程逻辑、验证与长期复用价值的内容。`,
    kind: '精选简报',
    date
  });
}
function dedupe(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.url}|${item.title}`.toLocaleLowerCase('zh-CN');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const briefs = readJson(dailyIndexFile);
const siteData = readJson(siteDataFile);
if (!Array.isArray(briefs) || briefs.length === 0) throw new Error('Curated brief index is empty; search index cannot be synchronized.');
const sorted = [...briefs].sort((a, b) => String(b.date).localeCompare(String(a.date)));
const latestDate = sorted[0] && sorted[0].date;
if (!/^\d{4}-\d{2}-\d{2}$/.test(latestDate || '')) throw new Error(`Invalid latest curated brief date: ${latestDate || '(empty)'}`);
const terminologyTotal = siteData.terminology && Number.isInteger(siteData.terminology.total) ? siteData.terminology.total : 0;
if (terminologyTotal < 1) throw new Error('Terminology total is unavailable; search index cannot be synchronized.');

const staticEntries = sitemapEntries();
const briefEntries = sorted.map(curatedBriefEntry);
const entries = dedupe([...staticEntries, ...briefEntries]);
const uniqueUrls = new Set(entries.map((item) => item.url).filter(Boolean));
const searchIndex = {
  generatedAt: latestDate,
  schemaVersion: 1,
  meta: {
    indexedEntries: entries.length,
    indexedPages: uniqueUrls.size,
    terminologyTotal,
    briefTotal: sorted.length,
    latestBriefDate: latestDate,
    sitemapLastmod: latestDate
  },
  entries
};
siteData.search = { ...searchIndex.meta };

const searchChanged = writeIfChanged(searchIndexFile, searchIndex);
const siteDataChanged = writeIfChanged(siteDataFile, siteData);

const retainedUrls = new Set(briefEntries.map((item) => item.url));
if (retainedUrls.size !== sorted.length) throw new Error('Curated brief search URLs are not unique.');
if (!retainedUrls.has(`/qilylean/daily/${latestDate}.html`)) throw new Error('Latest curated brief is missing from the search index.');
if (searchIndex.meta.briefTotal !== sorted.length) throw new Error('Search index brief count is stale.');
const homeEntry = entries.find((item) => item.url === '/' && item.kind === '网页');
if (!homeEntry) throw new Error('Homepage is missing from the rebuilt search index.');
if (siteData.briefs && siteData.briefs.cadence === 'weekly_curated' && /2591期|今日简报连续归档|每日复盘/.test(`${homeEntry.headings} ${homeEntry.text}`)) {
  throw new Error('Homepage search document still contains retired quantity-first/daily-cadence content.');
}

process.stdout.write(`Search index rebuilt from current static pages: ${sorted.length} curated briefs, latest ${latestDate}, ${terminologyTotal} terms, ${entries.length} entries / ${uniqueUrls.size} URLs; index changed ${searchChanged}, site data changed ${siteDataChanged}.\n`);
