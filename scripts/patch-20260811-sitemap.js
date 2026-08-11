#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const sitemapPath = path.join(root, 'sitemap.xml');
const url = 'https://qilylean.com/qilylean/daily/2026-08-11.html';

let sitemap = fs.readFileSync(sitemapPath, 'utf8');
if (!sitemap.includes(url)) {
  const anchor = '  <url><loc>https://qilylean.com/qilylean/daily/2026-08-10.html</loc>';
  if (!sitemap.includes(anchor)) throw new Error('Cannot locate 2026-08-10 sitemap anchor');
  const entry = '  <url><loc>' + url + '</loc><lastmod>2026-08-11</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n';
  sitemap = sitemap.replace(anchor, entry + anchor);
  fs.writeFileSync(sitemapPath, sitemap.endsWith('\n') ? sitemap : sitemap + '\n', 'utf8');
}
console.log('Sitemap includes 2026-08-11 daily brief.');
