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

function validateCanonicalUrl(url, label) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch (error) {
    errors.push(`${label} is not a valid URL: ${url}`);
    return;
  }
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'qilylean.com') {
    errors.push(`${label} must use canonical https://qilylean.com host: ${url}`);
    return;
  }
  const repoPath = repoPathForUrl(url);
  if (!exists(repoPath)) {
    errors.push(`${label} maps to missing file: ${url} -> ${repoPath}`);
    return;
  }
  if (!repoPath.endsWith('.html')) return;
  const html = read(repoPath);
  if (hasNoindex(html)) errors.push(`${label} points to noindex page: ${url}`);
  if (isRedirectPage(html)) errors.push(`${label} points to redirect page: ${url}`);
  const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const canonicalPattern = new RegExp(`<link\\b[^>]*rel=["']canonical["'][^>]*href=["']${escaped}["']`, 'i');
  const canonicalReversePattern = new RegExp(`<link\\b[^>]*href=["']${escaped}["'][^>]*rel=["']canonical["']`, 'i');
  if (!canonicalPattern.test(html) && !canonicalReversePattern.test(html)) errors.push(`${label} canonical mismatch: ${url}`);
}

for (const required of [
  'data/search-authority-map.json',
  'data/google-index-coverage-policy.json',
  'data/baidu-core-urls.json',
  'sitemap-topics.xml',
  'sitemap-baidu.xml',
  '.github/workflows/indexnow.yml'
]) {
  if (!exists(required)) errors.push(`missing ${required}`);
}

if (!errors.length) {
  const authority = JSON.parse(read('data/search-authority-map.json'));
  const coverage = JSON.parse(read('data/google-index-coverage-policy.json'));
  const baidu = JSON.parse(read('data/baidu-core-urls.json'));
  const targets = Array.isArray(authority.targets) ? authority.targets : [];
  const baiduTargets = Array.isArray(baidu.targets) ? baidu.targets : [];
  const coverageUrls = Array.isArray(coverage.routes)
    ? coverage.routes.filter((route) => route && route.policy === 'submit' && route.url).map((route) => route.url)
    : [];
  const topicUrls = sitemapUrls('sitemap-topics.xml');
  const baiduUrls = sitemapUrls('sitemap-baidu.xml');
  const topicSet = new Set(topicUrls);
  const baiduSet = new Set(baiduUrls);
  const governedUrls = new Set(targets.map(target => target.url));
  const allowedUrls = new Set([...governedUrls, ...coverageUrls]);
  const baiduTargetUrls = [...new Set(baiduTargets.map(target => target && target.url).filter(Boolean))];

  if (!targets.length) errors.push('search authority targets must not be empty');
  if (!baiduTargets.length) errors.push('Baidu core targets must not be empty');
  if (baiduTargets.length > 12) errors.push('Baidu core target list must stay focused at 12 targets or fewer');
  if (!coverageUrls.length) errors.push('search index coverage URLs must not be empty');
  if (coverageUrls.length !== new Set(coverageUrls).size) errors.push('search index coverage URLs contain duplicates');
  if (topicUrls.length !== topicSet.size) errors.push('sitemap-topics.xml contains duplicate URLs');
  if (baiduUrls.length !== baiduSet.size) errors.push('sitemap-baidu.xml contains duplicate URLs');

  for (const url of governedUrls) {
    if (!topicSet.has(url)) errors.push(`authority URL missing from sitemap-topics.xml: ${url}`);
  }
  for (const url of topicUrls) {
    if (!allowedUrls.has(url)) errors.push(`sitemap-topics.xml URL is not governed by search authority or index coverage: ${url}`);
    validateCanonicalUrl(url, 'topic URL');
  }

  for (const url of baiduTargetUrls) {
    if (!baiduSet.has(url)) errors.push(`Baidu core URL missing from sitemap-baidu.xml: ${url}`);
  }
  for (const url of baiduUrls) {
    if (!baiduTargetUrls.includes(url)) errors.push(`sitemap-baidu.xml URL is not governed by data/baidu-core-urls.json: ${url}`);
    validateCanonicalUrl(url, 'Baidu core URL');
  }

  const robots = read('robots.txt');
  if (!/^Sitemap:\s*https:\/\/qilylean\.com\/sitemap-topics\.xml$/mi.test(robots)) {
    errors.push('robots.txt must declare sitemap-topics.xml');
  }
  if (!/^Sitemap:\s*https:\/\/qilylean\.com\/sitemap-baidu\.xml$/mi.test(robots)) {
    errors.push('robots.txt must declare sitemap-baidu.xml');
  }

  const workflow = read('.github/workflows/indexnow.yml');
  for (const required of [
    'sitemap-topics.xml',
    'sitemap-baidu.xml',
    'data/search-authority-map.json',
    'data/google-index-coverage-policy.json',
    'data/baidu-core-urls.json',
    'https://api.indexnow.org/indexnow'
  ]) {
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
const baidu = JSON.parse(read('data/baidu-core-urls.json'));
console.log(`Search-engine discovery validation passed: ${authority.targets.length} keyword targets mapped to ${new Set(authority.targets.map(target => target.url)).size} canonical topic URLs; ${baidu.targets.length} Baidu core keyword targets are governed by sitemap-baidu.xml.`);
