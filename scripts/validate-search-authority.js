#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const mapPath = path.join(root, 'data/search-authority-map.json');
const sitemapPath = path.join(root, 'sitemap-core.xml');
const navPath = path.join(root, 'site-navigation.js');

function fail(message) {
  console.error(`SEARCH-AUTHORITY: ${message}`);
  process.exitCode = 1;
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function urlToRepoPath(url) {
  const parsed = new URL(url);
  let pathname = decodeURIComponent(parsed.pathname || '/');
  if (pathname === '/') return 'index.html';
  pathname = pathname.replace(/^\/+|\/+$/g, '');
  if (/\.[a-z0-9]+$/i.test(pathname)) return pathname;
  return `${pathname}/index.html`;
}

if (!fs.existsSync(mapPath)) {
  fail('missing data/search-authority-map.json');
  process.exit();
}

const authority = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
const site = String(authority.site || '').replace(/\/+$/, '');
const targets = Array.isArray(authority.targets) ? authority.targets : [];

if (!site.startsWith('https://')) fail('site must be HTTPS');
if (!targets.length) fail('targets must not be empty');

const keywords = new Set();
for (const target of targets) {
  if (!target.keyword || !target.url || !target.class || !target.priority) {
    fail(`incomplete target: ${JSON.stringify(target)}`);
    continue;
  }
  if (keywords.has(target.keyword)) fail(`duplicate keyword: ${target.keyword}`);
  keywords.add(target.keyword);
  if (!String(target.url).startsWith(site)) fail(`off-site target URL: ${target.url}`);

  const repoPath = urlToRepoPath(target.url);
  if (!fs.existsSync(path.join(root, repoPath))) {
    fail(`target page missing for “${target.keyword}”: ${repoPath}`);
  }
}

const pillar = targets.find((item) => item.pillar === true && item.keyword === '精益生产');
if (!pillar) {
  fail('“精益生产” pillar target is required');
} else {
  const pillarPath = urlToRepoPath(pillar.url);
  const html = read(pillarPath);
  const canonical = `<link rel="canonical" href="${pillar.url}">`;

  if (!/<title>[^<]*精益生产[^<]*QilyLean[^<]*<\/title>/i.test(html)) fail('pillar title must contain 精益生产 and QilyLean');
  if (!/<h1[^>]*>\s*精益生产/i.test(html)) fail('pillar must have a visible H1 beginning with 精益生产');
  if (!html.includes(canonical)) fail(`pillar canonical must be ${pillar.url}`);
  if (!/<meta\s+name="robots"\s+content="[^"]*index[^"]*follow[^"]*"/i.test(html)) fail('pillar must be index,follow');
  if (!html.includes('application/ld+json')) fail('pillar structured data is missing');
  if (!html.includes('BreadcrumbList')) fail('pillar BreadcrumbList schema is missing');
  if (!html.includes('Service')) fail('pillar Service schema is missing');

  const requiredInternalLinks = [
    '/improvements/vsm/',
    '/improvements/standard-time/',
    '/improvements/smed/',
    '/improvements/ie-data/',
    '/projects/automotive-lean/',
    '/projects/digital-factory/'
  ];
  for (const href of requiredInternalLinks) {
    if (!html.includes(`href="${href}"`)) fail(`pillar missing internal cluster link: ${href}`);
  }
}

const sitemap = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, 'utf8') : '';
if (!sitemap.includes('<loc>https://qilylean.com/lean-production</loc>')) {
  fail('sitemap-core.xml must include the lean-production pillar');
}

const nav = fs.existsSync(navPath) ? fs.readFileSync(navPath, 'utf8') : '';
if (!nav.includes('/lean-production/')) fail('site-navigation.js must expose the lean-production authority route');
if (!nav.includes('精益生产')) fail('site-navigation.js must expose the 精益生产 label');

if (!process.exitCode) {
  console.log(`SEARCH-AUTHORITY OK: ${targets.length} governed keyword targets; lean-production pillar is indexable, clustered and discoverable.`);
}
