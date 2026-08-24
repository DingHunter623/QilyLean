#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sitemapFile = path.join(root, 'sitemap.xml');
const check = process.argv.includes('--check');

const canonicalUrls = [
  'https://qilylean.com/north',
  'https://qilylean.com/north/inner-mongolia',
  'https://qilylean.com/north/shaanxi',
  'https://qilylean.com/north/ningxia',
  'https://qilylean.com/north/gansu',
  'https://qilylean.com/north/diagnosis'
];
const protectedSet = new Set(canonicalUrls);

let xml = fs.readFileSync(sitemapFile, 'utf8');
const before = xml;

for (const canonical of canonicalUrls) {
  xml = xml.replaceAll(`<loc>${canonical}/</loc>`, `<loc>${canonical}</loc>`);
}

const seen = new Set();
xml = xml.replace(/\s*<url>([\s\S]*?)<\/url>/g, (block, inner) => {
  const match = inner.match(/<loc>([^<]+)<\/loc>/);
  if (!match) return block;
  const loc = match[1].trim();
  if (!protectedSet.has(loc)) return block;
  if (seen.has(loc)) return '';
  seen.add(loc);
  return block;
});

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

const errors = [];
for (const canonical of canonicalUrls) {
  const canonicalCount = count(xml, `<loc>${canonical}</loc>`);
  const slashCount = count(xml, `<loc>${canonical}/</loc>`);
  if (canonicalCount !== 1) errors.push(`${canonical}: expected one canonical sitemap URL, found ${canonicalCount}`);
  if (slashCount !== 0) errors.push(`${canonical}: legacy trailing-slash sitemap URL remains`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

if (check) {
  if (xml !== before) {
    console.error('NORTH sitemap canonical migration is not materialized. Run without --check.');
    process.exit(1);
  }
  console.log('QilyLean NORTH V4 sitemap canonical contract PASS');
  process.exit(0);
}

if (xml !== before) {
  fs.writeFileSync(sitemapFile, xml.endsWith('\n') ? xml : `${xml}\n`, 'utf8');
  console.log('Normalized and deduplicated QilyLean NORTH sitemap URLs to no-trailing-slash canonical form.');
} else {
  console.log('QilyLean NORTH sitemap URLs already canonical and unique.');
}
