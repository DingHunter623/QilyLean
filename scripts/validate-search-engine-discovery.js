#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const errors = [];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function sitemapUrls(relativePath) {
  if (!exists(relativePath)) return [];
  return Array.from(read(relativePath).matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi), match => match[1].trim());
}

function repoPathForUrl(urlString) {
  const url = new URL(urlString);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') return 'index.html';
  pathname = pathname.replace(/^\/+|\/+$/g, '');
  if (/\.[a-z0-9]+$/i.test(pathname)) return pathname;
  return `${pathname}/index.html`;
}

function hasNoindex(html) {
  return /<meta\s+[^>]*name=["'](?:robots|googlebot)["'][^>]*content=["'][^"']*\bnoindex\b/i.test(html)
    || /<meta\s+[^>]*content=["'][^"']*\bnoindex\b[^"']*["'][^>]*name=["'](?:robots|googlebot)["']/i.test(html);
}

function isRedirectPage(html) {
  return /<meta\s+[^>]*http-equiv=["']refresh["']/i.test(html)
    || /<meta\s+[^>]*content=["']0\s*;\s*url=/i.test(html);
}

if (!exists('data/search-authority-map.json')) errors.push('missing data/search-authority-map.json');
if (!exists('sitemap-topics.xml')) errors.push('missing sitemap-topics.xml');
if (!exists('.github/workflows/indexnow.yml')) errors.push('missing .github/workflows/indexnow.yml');

if (!errors.length) {
  const authority = JSON.parse(read('data/search-authority-map.json'));
  const targets = Array.isArray(authority.targets) ? authority.targets : [];
  const topicUrls = sitemapUrls('sitemap-topics.xml');
  const topicSet = new Set(topicUrls);
  const governedUrls = new Set(targets.map(target => target.url));

  if (!targets.length) errors.push('search authority targets must not be empty');
  if (topicUrls.length !== topicSet.size) errors.push('sitemap-topics.xml contains duplicate URLs');

  for (const url of governedUrls) {
    if (!topicSet.has(url)) errors.push(`authority URL missing from sitemap-topics.xml: ${url}`);
  }

  for (const url of topicUrls) {
    if (!governedUrls.has(url)) errors.push(`sitemap-topics.xml URL is not governed by search-authority-map.json: ${url}`);
    const repoPath = repoPathForUrl(url);
    if (!exists(repoPath)) {
      errors.push(`topic URL maps to missing file: ${url} -> ${repoPath}`);
      continue;
    }
    if (repoPath.endsWith('.html')) {
      const html = read(repoPath);
      if (hasNoindex(html)) errors.push(`topic URL points to noindex page: ${url}`);
      if (isRedirectPage(html)) errors.push(`topic URL points to redirect page: ${url}`);
      const canonicalPattern = new RegExp(`<link\\b[^>]*rel=["']canonical["'][^>]*href=["']${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'i');
      const canonicalReversePattern = new RegExp(`<link\\b[^>]*href=["']${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*rel=["']canonical["']`, 'i');
      if (!canonicalPattern.test(html) && !canonicalReversePattern.test(html)) errors.push(`topic page canonical mismatch: ${url}`);
    }
  }

  const robots = read('robots.txt');
  if (!/^Sitemap:\s*https:\/\/qilylean\.com\/sitemap-topics\.xml$/mi.test(robots)) {
    errors.push('robots.txt must declare sitemap-topics.xml');
  }

  const workflow = read('.github/workflows/indexnow.yml');
  for (const required of ['sitemap-topics.xml', 'data/search-authority-map.json', 'https://api.indexnow.org/indexnow']) {
    if (!workflow.includes(required)) errors.push(`IndexNow workflow missing discovery contract: ${required}`);
  }
  if (!workflow.includes('BAIDU_PUSH_TOKEN') || !workflow.includes('data.zz.baidu.com/urls')) {
    errors.push('IndexNow workflow must retain optional Baidu API submission support');
  }
}

if (errors.length) {
  console.error('\nSearch-engine discovery validation failed:');
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

const authority = JSON.parse(read('data/search-authority-map.json'));
console.log(`Search-engine discovery validation passed: ${authority.targets.length} keyword targets mapped to ${new Set(authority.targets.map(target => target.url)).size} canonical topic URLs.`);
