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

function baseUrl() {
  return String(config.production.baseUrl || '').replace(/\/+$/, '');
}

function expectedUrl(route) {
  const base = baseUrl();
  const slashMode = config.production.canonicalTrailingSlash !== false;
  if (route === '/') return slashMode ? `${base}/` : base;
  let normalized = `/${String(route || '').replace(/^\/+|\/+$/g, '')}`;
  if (slashMode) normalized += '/';
  return `${base}${normalized}`;
}

function sitemapContains(xml, url) {
  if (xml.includes(`<loc>${url}</loc>`)) return { found: true, alternateStyle: false };
  const alternate = url.endsWith('/') ? url.slice(0, -1) : `${url}/`;
  if (alternate && xml.includes(`<loc>${alternate}</loc>`)) return { found: true, alternateStyle: true, alternate };
  return { found: false, alternateStyle: false, alternate };
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
  if (config.production.canonicalTrailingSlash !== false && !canonical.endsWith('/')) fail(`trailing-slash canonical required by SSOT: ${canonical}`);
  if (config.production.canonicalTrailingSlash === false && entry.route !== '/' && canonical.endsWith('/')) fail(`trailing-slash canonical forbidden by SSOT: ${canonical}`);

  const sitemapMatch = sitemapContains(sitemap, expected);
  if (!sitemapMatch.found) fail(`core route missing from sitemap.xml: ${expected}`);
  if (sitemapMatch.alternateStyle) warnings.push(`alternate sitemap slash style retained during staged migration: ${sitemapMatch.alternate}`);
}

const base = baseUrl();
if (!robots.includes(`Sitemap: ${base}/sitemap.xml`)) fail('robots.txt does not advertise sitemap.xml');
if (!robots.includes(`Sitemap: ${base}/sitemap-core.xml`)) fail('robots.txt does not advertise sitemap-core.xml');

if (coreSitemap) {
  for (const route of ['/', '/capabilities/', '/projects/', '/knowledge/', '/trust/', '/cooperation/']) {
    const url = expectedUrl(route);
    const match = sitemapContains(coreSitemap, url);
    if (!match.found) fail(`core sitemap missing protected route: ${url}`);
    if (match.alternateStyle) warnings.push(`alternate core-sitemap slash style retained during staged migration: ${match.alternate}`);
  }
}

const searchMeta = searchIndex.meta || {};
const searchEntries = Array.isArray(searchIndex.entries) ? searchIndex.entries : [];
const searchUrls = new Set(searchEntries.map((entry) => entry && entry.url).filter(Boolean));
if (searchMeta.indexedEntries !== searchEntries.length) fail(`search-index metadata/entry drift: ${searchMeta.indexedEntries} != ${searchEntries.length}`);
if (searchMeta.indexedPages !== searchUrls.size) fail(`search-index metadata/URL drift: ${searchMeta.indexedPages} != ${searchUrls.size}`);
if (siteData.search && Number.isInteger(siteData.search.indexedEntries) && Number.isInteger(searchMeta.indexedEntries)) {
  if (siteData.search.indexedEntries !== searchMeta.indexedEntries) fail(`SSOT/search-index count drift: ${siteData.search.indexedEntries} != ${searchMeta.indexedEntries}`);
}
if (siteData.search && Number.isInteger(siteData.search.terminologyTotal) && Number.isInteger(searchMeta.terminologyTotal)) {
  if (siteData.search.terminologyTotal !== searchMeta.terminologyTotal) fail('terminology count drift between SSOT and search index');
}
if (siteData.search && Number.isInteger(siteData.search.briefTotal) && Number.isInteger(searchMeta.briefTotal)) {
  if (siteData.search.briefTotal !== searchMeta.briefTotal) fail('brief count drift between SSOT and search index');
}
const aiKnowledgeRegistry = siteData.knowledge && siteData.knowledge.aiKnowledge;
if (aiKnowledgeRegistry) {
  if (!aiKnowledgeRegistry.url || /\.md(?:$|[?#])/i.test(aiKnowledgeRegistry.url)) fail('AI knowledge primary URL must be the formal public landing page');
  if (!searchEntries.some((entry) => entry && entry.url === aiKnowledgeRegistry.url)) fail(`AI knowledge public page missing from search index: ${aiKnowledgeRegistry.url}`);
  const aiSources = aiKnowledgeRegistry.sources;
  if (!Array.isArray(aiSources) || aiSources.length === 0) fail('AI knowledge repository-management source registry is invalid');
  for (const source of aiSources) {
    if (!source || !source.source) fail('AI knowledge repository-management source entry is incomplete');
    if (source.visibility !== 'repository-management') fail(`AI knowledge source is not marked repository-management: ${source.source}`);
    if (!exists(source.source)) fail(`AI knowledge source missing: ${source.source}`);
    const publicSourceUrl = `/${String(source.source).replace(/^\/+/, '')}`;
    if (searchEntries.some((entry) => entry && entry.url === publicSourceUrl)) fail(`Repository-management AI source leaked into search index: ${publicSourceUrl}`);
    if (sitemap.includes(`<loc>${base}${publicSourceUrl}</loc>`)) fail(`Repository-management AI source leaked into sitemap: ${publicSourceUrl}`);
  }
}

const navFile = 'site-navigation.js';
if (exists(navFile)) {
  const nav = read(navFile).toLowerCase();
  const runtimeToken = config.runtimeBaseline.toLowerCase();
  if (!nav.includes(runtimeToken)) fail(`runtime baseline ${config.runtimeBaseline} is not present in ${navFile}`);
}

for (const warning of warnings) console.warn(`[V4][migration-warning] ${warning}`);
console.log(`[V4] G1 source validation PASS: ${config.coreRoutes.length} core routes; canonicalTrailingSlash=${config.production.canonicalTrailingSlash !== false}; SSOT=${config.sourceOfTruth.siteData}; runtime=${config.runtimeBaseline}; migrationWarnings=${warnings.length}`);
