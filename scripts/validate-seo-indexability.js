#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const errors = [];
const warnings = [];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function walk(dir, output = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, output);
    else output.push(path.relative(ROOT, full).replace(/\\/g, '/'));
  }
  return output;
}

function hasNoindex(html) {
  return /<meta\s+[^>]*name=["'](?:robots|googlebot)["'][^>]*content=["'][^"']*\bnoindex\b/i.test(html)
    || /<meta\s+[^>]*content=["'][^"']*\bnoindex\b[^"']*["'][^>]*name=["'](?:robots|googlebot)["']/i.test(html);
}

function localFileForUrl(urlString) {
  const url = new URL(urlString);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') return 'index.html';
  pathname = pathname.replace(/^\//, '');
  if (pathname.endsWith('/')) return pathname + 'index.html';
  return pathname;
}

function sitemapUrls(file) {
  if (!exists(file)) return [];
  const xml = read(file);
  return Array.from(xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi), match => match[1].trim());
}

const protectedNoindex = [
  /^404\.html$/,
  /^admin\.html$/,
  /^qilylean\/reference-[^/]+\.html$/,
  // Supporting viewers duplicate the indexed evidence hub and source assets.
  /^projects\/lean-improvement-evidence\/(?:award|q3|q4)-(?:online-view|preview)\.html$/
];

const redirectPages = {
  'tools.html': 'https://qilylean.com/qilylean/lean-tools.html',
  'papers.html': 'https://qilylean.com/improvements',
  'moments.html': 'https://qilylean.com/moments',
  'knowledge.html': 'https://qilylean.com/knowledge',
  'execution.html': 'https://qilylean.com/qilylean/execution-loop.html',
  'qilylean/home.html': 'https://qilylean.com',
  'qilylean/index.html': 'https://qilylean.com',
  'daily-insights.html': 'https://qilylean.com/qilylean/daily-insights.html',
  'qilylean/papers.html': 'https://qilylean.com/improvements',
  'qilylean/home-fixed.html': 'https://qilylean.com',
  'qilylean/home-live.html': 'https://qilylean.com'
};

const htmlFiles = walk(ROOT).filter(file => file.endsWith('.html'));
for (const file of htmlFiles) {
  const html = read(file);
  const publicMetadataUrls = [
    ...Array.from(html.matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*href=["'](https:\/\/(?:www\.)?qilylean\.com[^"']*)["']/gi), (match) => match[1]),
    ...Array.from(html.matchAll(/<link\b[^>]*href=["'](https:\/\/(?:www\.)?qilylean\.com[^"']*)["'][^>]*rel=["']canonical["']/gi), (match) => match[1]),
    ...Array.from(html.matchAll(/<meta\b[^>]*property=["']og:url["'][^>]*content=["'](https:\/\/(?:www\.)?qilylean\.com[^"']*)["']/gi), (match) => match[1]),
    ...Array.from(html.matchAll(/<meta\b[^>]*content=["'](https:\/\/(?:www\.)?qilylean\.com[^"']*)["'][^>]*property=["']og:url["']/gi), (match) => match[1])
  ];
  for (const url of publicMetadataUrls) {
    if (url.endsWith('/')) errors.push(`${file}: canonical/og:url must omit trailing slash (${url})`);
  }
  if (!hasNoindex(html)) continue;
  if (!protectedNoindex.some(pattern => pattern.test(file))) {
    errors.push(`${file}: unexpected noindex on a public or legacy page`);
  }
}

for (const [file, canonical] of Object.entries(redirectPages)) {
  if (!exists(file)) {
    errors.push(`${file}: legacy redirect page is missing`);
    continue;
  }
  const html = read(file);
  if (hasNoindex(html)) errors.push(`${file}: redirect page must not contain noindex`);
  if (!/<meta\s+http-equiv=["']refresh["']\s+content=["']0\s*;\s*url=/i.test(html)
      && !/<meta\s+content=["']0\s*;\s*url=[^"']+["']\s+http-equiv=["']refresh["']/i.test(html)) {
    errors.push(`${file}: missing instant meta refresh redirect`);
  }
  const escaped = canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!new RegExp(`<link\\s+[^>]*rel=["']canonical["'][^>]*href=["']${escaped}["']`, 'i').test(html)
      && !new RegExp(`<link\\s+[^>]*href=["']${escaped}["'][^>]*rel=["']canonical["']`, 'i').test(html)) {
    errors.push(`${file}: canonical must point to ${canonical}`);
  }
}

const sitemapFiles = ['sitemap.xml', 'sitemap-core.xml'];
const allSitemapUrls = [];
for (const sitemap of sitemapFiles) {
  const urls = sitemapUrls(sitemap);
  if (new Set(urls).size !== urls.length) warnings.push(`${sitemap}: duplicate canonical URLs detected`);
  for (const url of urls) {
    allSitemapUrls.push(url);
    const localFile = localFileForUrl(url);
    if (!exists(localFile)) {
      errors.push(`${sitemap}: ${url} maps to missing file ${localFile}`);
      continue;
    }
    if (localFile.endsWith('.html') && hasNoindex(read(localFile))) {
      errors.push(`${sitemap}: ${url} is submitted for indexing but ${localFile} contains noindex`);
    }
  }
}

const robots = read('robots.txt');
if (!/^Allow:\s*\/$/mi.test(robots)) errors.push('robots.txt: missing Allow: /');
if (!/^Sitemap:\s*https:\/\/qilylean\.com\/sitemap\.xml$/mi.test(robots)) {
  errors.push('robots.txt: primary sitemap declaration is missing');
}
if (!/^Sitemap:\s*https:\/\/qilylean\.com\/sitemap-core\.xml$/mi.test(robots)) {
  warnings.push('robots.txt: sitemap-core.xml has not been declared');
}

// sitemap-core.xml is intentionally a focused subset of sitemap.xml. Overlap
// between the two files is valid; only duplicates inside one sitemap are noisy.
const uniqueSitemapUrls = new Set(allSitemapUrls);

if (warnings.length) {
  console.warn('\nSEO warnings:');
  warnings.forEach(item => console.warn(`- ${item}`));
}

if (errors.length) {
  console.error('\nSEO indexability validation failed:');
  errors.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}

console.log(`SEO indexability validation passed: ${htmlFiles.length} HTML files checked, ${uniqueSitemapUrls.size} sitemap URLs checked.`);
