#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(read(file));
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => { throw new Error(`[V4] ${message}`); };
const warnings = [];

const config = json('data/site-system-v4.json');
const build = json('meta/build.json');
const siteData = json(config.sourceOfTruth.siteData);
const searchIndex = json(config.sourceOfTruth.searchIndex);
const sitemap = read(config.sourceOfTruth.sitemap);
const coreSitemap = exists(config.sourceOfTruth.coreSitemap) ? read(config.sourceOfTruth.coreSitemap) : '';
const robots = read(config.sourceOfTruth.robots);

if (config.standard !== 'QL-WEB-STD-001/R6') fail('R6 mother standard changed unexpectedly');
if (!config.production.staticFirst) fail('static-first contract must remain enabled');
if (build.schemaVersion !== 1 || build.site !== 'QilyLean') fail('invalid meta/build.json schema');
if (build.standard !== config.standard) fail('build standard does not match V4 configuration');
if (!/^[0-9a-f]{40}$/i.test(build.sourceCommit)) fail('build sourceCommit must be a full Git SHA');
if (!siteData || typeof siteData !== 'object') fail('site-data SSOT is unavailable');

function canonicalFrom(html) {
  const matches = [...html.matchAll(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/gi)];
  if (matches.length !== 1) fail(`expected exactly one canonical, found ${matches.length}`);
  return matches[0][1];
}

function hasMetaDescription(html) {
  return /<meta\s+[^>]*name=["']description["'][^>]*content=["'][^"']+["'][^>]*>/i.test(html);
}

function expectedUrl(route) {
  if (route === '/') return config.production.baseUrl;
  return `${config.production.baseUrl}${route}`;
}

function sitemapContains(xml, url) {
  if (xml.includes(`<loc>${url}</loc>`)) return { found: true, legacySlash: false };
  if (url !== config.production.baseUrl && xml.includes(`<loc>${url}/</loc>`)) return { found: true, legacySlash: true };
  return { found: false, legacySlash: false };
}

for (const entry of config.coreRoutes) {
  if (!exists(entry.file)) fail(`core route source missing: ${entry.route} -> ${entry.file}`);
  const html = read(entry.file);
  if (!/<title>[^<]+<\/title>/i.test(html)) fail(`title missing: ${entry.file}`);
  if (!hasMetaDescription(html)) fail(`meta description missing: ${entry.file}`);
  if (!/<h1\b[^>]*>[\s\S]*?<\/h1>/i.test(html)) fail(`H1 missing: ${entry.file}`);
  if (entry.marker && !html.includes(entry.marker)) fail(`protected marker missing on ${entry.file}: ${entry.marker}`);

  const canonical = canonicalFrom(html);
  const expected = expectedUrl(entry.route);
  if (canonical !== expected) fail(`canonical mismatch for ${entry.route}: ${canonical} != ${expected}`);
  if (entry.route !== '/' && /\/$/.test(canonical)) fail(`trailing-slash canonical is forbidden: ${canonical}`);

  const sitemapMatch = sitemapContains(sitemap, expected);
  if (!sitemapMatch.found) fail(`core route missing from sitemap.xml: ${expected}`);
  if (sitemapMatch.legacySlash) warnings.push(`legacy trailing-slash sitemap URL retained during staged migration: ${expected}/`);
}

if (!robots.includes(`Sitemap: ${config.production.baseUrl}/sitemap.xml`)) fail('robots.txt does not advertise sitemap.xml');
if (!robots.includes(`Sitemap: ${config.production.baseUrl}/sitemap-core.xml`)) fail('robots.txt does not advertise sitemap-core.xml');

if (coreSitemap) {
  for (const route of ['/', '/capabilities', '/projects', '/knowledge', '/trust', '/cooperation']) {
    const url = expectedUrl(route);
    const match = sitemapContains(coreSitemap, url);
    if (!match.found) fail(`core sitemap missing protected route: ${url}`);
    if (match.legacySlash) warnings.push(`legacy trailing-slash core sitemap URL retained during staged migration: ${url}/`);
  }
}

const searchMeta = searchIndex.meta || {};
if (siteData.search && Number.isInteger(siteData.search.indexedEntries) && Number.isInteger(searchMeta.indexedEntries)) {
  if (siteData.search.indexedEntries !== searchMeta.indexedEntries) fail(`SSOT/search-index count drift: ${siteData.search.indexedEntries} != ${searchMeta.indexedEntries}`);
}
if (siteData.search && Number.isInteger(siteData.search.terminologyTotal) && Number.isInteger(searchMeta.terminologyTotal)) {
  if (siteData.search.terminologyTotal !== searchMeta.terminologyTotal) fail('terminology count drift between SSOT and search index');
}
if (siteData.search && Number.isInteger(siteData.search.briefTotal) && Number.isInteger(searchMeta.briefTotal)) {
  if (siteData.search.briefTotal !== searchMeta.briefTotal) fail('brief count drift between SSOT and search index');
}

const navFile = 'site-navigation.js';
if (exists(navFile)) {
  const nav = read(navFile).toLowerCase();
  const runtimeToken = config.runtimeBaseline.toLowerCase();
  if (!nav.includes(runtimeToken)) fail(`runtime baseline ${config.runtimeBaseline} is not present in ${navFile}`);
}

for (const warning of warnings) console.warn(`[V4][migration-warning] ${warning}`);
console.log(`[V4] G1 source validation PASS: ${config.coreRoutes.length} core routes; SSOT=${config.sourceOfTruth.siteData}; runtime=${config.runtimeBaseline}; migrationWarnings=${warnings.length}`);
