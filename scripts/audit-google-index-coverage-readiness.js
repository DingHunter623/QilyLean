#!/usr/bin/env node
'use strict';

/**
 * QilyLean Google index-coverage readiness audit.
 *
 * Static, non-destructive audit only: it never edits HTML, sitemap, robots, or
 * content. The report helps map Search Console exclusions to repository-side
 * causes without risking page regressions.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const BASE = 'https://qilylean.com';
const WRITE = process.argv.includes('--write');
const AUDIT_VERSION = '2026-09-21-v2';

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}
function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}
function trackedHtml() {
  return execFileSync('git', ['ls-files', '*.html'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024
  }).split(/\r?\n/).filter(Boolean);
}
function sitemapUrls(rel) {
  if (!exists(rel)) return [];
  return Array.from(read(rel).matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi), m => m[1].trim());
}
function hasNoindex(html) {
  return /<meta\s+[^>]*name=["'](?:robots|googlebot)["'][^>]*content=["'][^"']*\bnoindex\b/i.test(html)
    || /<meta\s+[^>]*content=["'][^"']*\bnoindex\b[^"']*["'][^>]*name=["'](?:robots|googlebot)["']/i.test(html);
}
function isRedirect(html) {
  return /<meta\s+[^>]*http-equiv=["']refresh["']/i.test(html)
    || /<meta\s+[^>]*content=["']0\s*;\s*url=/i.test(html);
}
function canonical(html) {
  const a = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  if (a) return a[1].trim();
  const b = html.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  return b ? b[1].trim() : '';
}
function title(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/\s+/g, ' ').trim() : '';
}
function description(html) {
  const a = html.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  if (a) return a[1].trim();
  const b = html.match(/<meta\b[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  return b ? b[1].trim() : '';
}
function urlForFile(rel) {
  if (rel === 'index.html') return `${BASE}/`;
  if (rel.endsWith('/index.html')) return `${BASE}/${rel.slice(0, -'index.html'.length)}`;
  return `${BASE}/${rel}`;
}
function normalize(url) {
  try {
    const u = new URL(url, `${BASE}/`);
    if (u.origin !== BASE) return u.href;
    return `${u.origin}${u.pathname}${u.search}`;
  } catch (_) {
    return url;
  }
}
function isPublicHtml(html) {
  return /<html\b/i.test(html) && /<\/head>/i.test(html) && !/data-qily-admin-only=["']true["']/i.test(html);
}

const sitemapFiles = ['sitemap.xml', 'sitemap-core.xml', 'sitemap-topics.xml'];
const sitemapSet = new Set(sitemapFiles.flatMap(sitemapUrls).map(normalize));
const coveragePolicy = exists('data/google-index-coverage-policy.json')
  ? JSON.parse(read('data/google-index-coverage-policy.json'))
  : { routes: [] };
const discoverOnlySet = new Set(
  (coveragePolicy.routes || [])
    .filter(route => route && route.policy === 'discover_only' && route.url)
    .map(route => normalize(route.url))
);
const submitPolicySet = new Set(
  (coveragePolicy.routes || [])
    .filter(route => route && route.policy === 'submit' && route.url)
    .map(route => normalize(route.url))
);
const files = trackedHtml();
const rows = [];
const canonicalOwners = new Map();
const brokenRetiredDailyReferences = [];

for (const file of files) {
  const html = read(file);
  if (!isPublicHtml(html)) continue;

  const pageUrl = normalize(urlForFile(file));
  const can = canonical(html);
  const canUrl = can ? normalize(can) : '';
  const noindex = hasNoindex(html);
  const redirect = isRedirect(html);
  const selfCanonical = !!canUrl && canUrl === pageUrl;
  const pageSubmitted = sitemapSet.has(pageUrl);
  const canonicalSubmitted = !!canUrl && sitemapSet.has(canUrl);
  const discoverableViaSitemap = selfCanonical ? pageSubmitted : canonicalSubmitted;

  let classification = 'indexable_candidate';
  if (noindex) classification = 'intentional_or_review_noindex';
  else if (redirect) classification = 'redirect_excluded';
  else if (!canUrl) classification = 'missing_canonical';
  else if (!selfCanonical) classification = 'alternate_canonical';
  else if (!pageSubmitted && discoverOnlySet.has(pageUrl)) classification = 'intentional_discover_only';
  else if (!pageSubmitted) classification = 'self_canonical_not_in_sitemap';
  else classification = 'self_canonical_in_sitemap';

  const row = {
    file,
    pageUrl,
    canonical: canUrl,
    title: title(html),
    descriptionLength: description(html).length,
    noindex,
    redirect,
    selfCanonical,
    pageSubmitted,
    canonicalSubmitted,
    discoverableViaSitemap,
    classification
  };
  rows.push(row);

  if (canUrl) {
    if (!canonicalOwners.has(canUrl)) canonicalOwners.set(canUrl, []);
    canonicalOwners.get(canUrl).push(file);
  }

  for (const match of html.matchAll(/href=["'](\/qilylean\/daily\/(\d{4}-\d{2}-\d{2})\.html)(?:[?#][^"']*)?["']/gi)) {
    const href = match[1];
    const target = href.replace(/^\//, '');
    if (!exists(target)) brokenRetiredDailyReferences.push({ source: file, href });
  }
}

const duplicateCanonicalGroups = Array.from(canonicalOwners.entries())
  .filter(([, owners]) => owners.length > 1)
  .map(([canonicalUrl, owners]) => ({ canonicalUrl, owners }));

const counts = rows.reduce((acc, row) => {
  acc[row.classification] = (acc[row.classification] || 0) + 1;
  return acc;
}, {});

const highPriorityReview = rows.filter(row =>
  ['missing_canonical', 'self_canonical_not_in_sitemap'].includes(row.classification)
);
const plannedSubmitMissing = rows.filter(row =>
  row.classification === 'self_canonical_not_in_sitemap' && submitPolicySet.has(row.pageUrl)
);
const metadataReview = rows.filter(row =>
  row.classification === 'self_canonical_in_sitemap' && (row.title.length < 8 || row.descriptionLength < 50)
);

const report = {
  auditVersion: AUDIT_VERSION,
  generatedAt: new Date().toISOString(),
  scope: 'tracked public HTML only; no live Google Search Console data is read',
  sitemapFiles,
  publicHtmlCount: rows.length,
  sitemapUrlCount: sitemapSet.size,
  counts,
  highPriorityReview,
  plannedSubmitMissing,
  metadataReview,
  duplicateCanonicalGroups,
  brokenRetiredDailyReferences,
  notes: [
    'alternate_canonical and redirect exclusions can be legitimate and should not be forced into the index',
    'intentional_discover_only pages are explicitly excluded from sitemap submission by the indexing policy and are not defects',
    'retired historical daily URLs should remain retired; current pages must not link to missing retired URLs',
    'noindex pages require intent review; protected/admin/reference pages may be correct exclusions',
    'pageSubmitted means the exact page URL is in a sitemap; canonicalSubmitted means only its canonical target is in a sitemap',
    'Search Console exclusion reasons remain authoritative for live coverage counts; this audit identifies repository-side readiness risks without forcing intentional redirects, noindex utilities, alternates or retired historical briefs into the index'
  ]
};

console.log(`QilyLean Google index-coverage readiness audit ${AUDIT_VERSION}`);
console.log(`Public HTML: ${report.publicHtmlCount}`);
console.log(`Unique sitemap URLs: ${report.sitemapUrlCount}`);
for (const [key, value] of Object.entries(counts).sort()) console.log(`${key}: ${value}`);
console.log(`High-priority repository review candidates: ${highPriorityReview.length}`);
for (const row of highPriorityReview) {
  console.log(`  REVIEW\t${row.classification}\t${row.pageUrl}\t${row.file}`);
}
console.log(`Policy submit routes waiting for sitemap materialization: ${plannedSubmitMissing.length}`);
for (const row of plannedSubmitMissing) {
  console.log(`  PLANNED_SUBMIT\t${row.pageUrl}\t${row.file}`);
}
console.log(`Broken links to retired daily URLs: ${brokenRetiredDailyReferences.length}`);
for (const row of brokenRetiredDailyReferences) {
  console.log(`  RETIRED_LINK\t${row.source}\t${row.href}`);
}
console.log(`Metadata review candidates: ${metadataReview.length}`);
for (const row of metadataReview) {
  console.log(`  META\t${row.pageUrl}\t${row.file}\ttitle=${JSON.stringify(row.title)}\tdescriptionLength=${row.descriptionLength}`);
}
console.log(`Duplicate canonical groups: ${duplicateCanonicalGroups.length}`);

if (WRITE) {
  const outDir = path.join(ROOT, 'reports');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'seo-index-coverage-readiness.json'), JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(
    path.join(outDir, 'seo-index-coverage-candidates.txt'),
    highPriorityReview.map(row => `${row.classification}\t${row.pageUrl}\t${row.file}`).join('\n') + (highPriorityReview.length ? '\n' : '')
  );
  console.log('Wrote reports/seo-index-coverage-readiness.json and reports/seo-index-coverage-candidates.txt');
}

// Only direct structural contradictions are CI-fatal. A redirect/alternate page
// whose canonical target is submitted is normal and must not be misclassified.
const fatal = rows.filter(row => row.pageSubmitted && (row.noindex || row.redirect));
if (brokenRetiredDailyReferences.length) {
  console.error('\nCurrent pages still link to retired daily URLs:');
  brokenRetiredDailyReferences.forEach(row => console.error(`- ${row.source}: ${row.href}`));
  process.exitCode = 1;
}
if (fatal.length) {
  console.error('\nFatal sitemap/indexability contradictions:');
  fatal.forEach(row => console.error(`- ${row.pageUrl}: ${row.noindex ? 'noindex' : 'redirect'} but exact URL is submitted in sitemap`));
  process.exit(1);
}
