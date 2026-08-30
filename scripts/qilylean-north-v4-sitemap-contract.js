#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sitemapFile = path.join(root, 'sitemap.xml');
const configFile = path.join(root, 'data/site-system-v4.json');
const check = process.argv.includes('--check');
const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
const baseUrl = String(config.production?.baseUrl || 'https://qilylean.com').replace(/\/+$/, '');
const trailingSlash = config.production?.canonicalTrailingSlash !== false;

const routePaths = [
  '/north/',
  '/north/inner-mongolia/',
  '/north/shaanxi/',
  '/north/ningxia/',
  '/north/gansu/',
  '/north/diagnosis/'
];
const canonicalUrls = routePaths.map(route => `${baseUrl}${route.replace(/\/+$/, '')}${trailingSlash ? '/' : ''}`);
const alternateUrls = routePaths.map(route => `${baseUrl}${route.replace(/\/+$/, '')}${trailingSlash ? '' : '/'}`);
const protectedSet = new Set([...canonicalUrls, ...alternateUrls]);

let xml = fs.readFileSync(sitemapFile, 'utf8');
const before = xml;

for (let i = 0; i < canonicalUrls.length; i += 1) {
  const canonical = canonicalUrls[i];
  const alternate = alternateUrls[i];
  xml = xml.replaceAll(`<loc>${alternate}</loc>`, `<loc>${canonical}</loc>`);
}

const seen = new Set();
xml = xml.replace(/\s*<url>([\s\S]*?)<\/url>/g, (block, inner) => {
  const match = inner.match(/<loc>([^<]+)<\/loc>/);
  if (!match) return block;
  const loc = match[1].trim();
  if (!protectedSet.has(loc)) return block;
  const routeIndex = [...canonicalUrls, ...alternateUrls].indexOf(loc);
  const canonical = routeIndex < canonicalUrls.length ? canonicalUrls[routeIndex] : canonicalUrls[routeIndex - canonicalUrls.length];
  if (seen.has(canonical)) return '';
  seen.add(canonical);
  return block.replace(`<loc>${loc}</loc>`, `<loc>${canonical}</loc>`);
});

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

const errors = [];
for (let i = 0; i < canonicalUrls.length; i += 1) {
  const canonical = canonicalUrls[i];
  const alternate = alternateUrls[i];
  const canonicalCount = count(xml, `<loc>${canonical}</loc>`);
  const alternateCount = count(xml, `<loc>${alternate}</loc>`);
  if (canonicalCount !== 1) errors.push(`${canonical}: expected one canonical sitemap URL, found ${canonicalCount}`);
  if (alternateCount !== 0) errors.push(`${alternate}: noncanonical slash style remains`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

if (check) {
  if (xml !== before) {
    console.error('NORTH sitemap canonical slash contract is not materialized. Run without --check.');
    process.exit(1);
  }
  console.log(`QilyLean NORTH V4 sitemap canonical contract PASS; canonicalTrailingSlash=${trailingSlash}`);
  process.exit(0);
}

if (xml !== before) {
  fs.writeFileSync(sitemapFile, xml.endsWith('\n') ? xml : `${xml}\n`, 'utf8');
  console.log(`Normalized and deduplicated QilyLean NORTH sitemap URLs to SSOT slash style; canonicalTrailingSlash=${trailingSlash}.`);
} else {
  console.log(`QilyLean NORTH sitemap URLs already canonical and unique; canonicalTrailingSlash=${trailingSlash}.`);
}
