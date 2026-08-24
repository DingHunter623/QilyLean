#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['.git', 'node_modules', 'scripts']);
const verificationPages = new Set([
  'baidu_verify_codeva-S23TyCutdc.html',
  'googleb7a991efbed3aa8a.html',
  'zohoverify/verifyforzoho.html'
]);

function walk(directory, output = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full, output);
    else if (entry.name.endsWith('.html')) output.push(path.relative(ROOT, full).replace(/\\/g, '/'));
  }
  return output;
}

function match(html, pattern) {
  const result = html.match(pattern);
  return result ? result[1].trim() : '';
}

function stripTags(value) {
  return value.replace(/<[^>]*>/g, ' ').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
}

function isNoindex(html) {
  return /<meta\b[^>]*name=["'](?:robots|googlebot)["'][^>]*content=["'][^"']*\bnoindex\b/i.test(html)
    || /<meta\b[^>]*content=["'][^"']*\bnoindex\b[^"']*["'][^>]*name=["'](?:robots|googlebot)["']/i.test(html);
}

function isRedirect(html) {
  return /<meta\b[^>]*http-equiv=["']refresh["']/i.test(html)
    || /<meta\b[^>]*content=["']0\s*;\s*url=/i.test(html);
}

function attr(tag, name) {
  const pattern = new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i');
  return match(tag, pattern);
}

function localTarget(file, href) {
  if (!href || /^(?:https?:|\/\/|mailto:|tel:|javascript:|data:|blob:|#)/i.test(href)) return null;
  const clean = href.split('#')[0].split('?')[0];
  if (!clean) return null;
  const decoded = decodeURIComponent(clean);
  const relative = decoded.startsWith('/')
    ? decoded.slice(1)
    : path.posix.normalize(path.posix.join(path.posix.dirname(file), decoded));
  if (!relative) return 'index.html';
  if (relative.endsWith('/')) return `${relative}index.html`;
  if (path.posix.extname(relative)) return relative;
  return `${relative}/index.html`;
}

function addGrouped(map, key, file) {
  if (!key) return;
  const normalized = key.replace(/\s+/g, ' ').trim();
  const files = map.get(normalized) || [];
  files.push(file);
  map.set(normalized, files);
}

const files = walk(ROOT).sort();
const indexable = [];
const missing = {
  title: [], description: [], canonical: [], h1: [], ogImage: [], twitterImage: [], lang: [], main: []
};
const imageAltIssues = [];
const brokenInternalTargets = [];
const duplicateTitles = new Map();
const duplicateDescriptions = new Map();
const duplicateCanonicals = new Map();

for (const file of files) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  if (verificationPages.has(file) || isNoindex(html) || isRedirect(html)) continue;

  const title = stripTags(match(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i));
  const description = match(html, /<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    || match(html, /<meta\b[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  const canonical = match(html, /<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
    || match(html, /<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const lang = match(html, /<html\b[^>]*lang=["']([^"']+)["']/i);
  const ogImage = /<meta\b[^>]*property=["']og:image["']/i.test(html);
  const twitterImage = /<meta\b[^>]*name=["']twitter:image["']/i.test(html);

  indexable.push(file);
  if (!title) missing.title.push(file);
  if (!description) missing.description.push(file);
  if (!canonical) missing.canonical.push(file);
  if (h1Count !== 1) missing.h1.push(`${file} (${h1Count})`);
  if (!ogImage) missing.ogImage.push(file);
  if (!twitterImage) missing.twitterImage.push(file);
  if (!lang) missing.lang.push(file);
  if (!/<main\b/i.test(html)) missing.main.push(file);

  addGrouped(duplicateTitles, title, file);
  addGrouped(duplicateDescriptions, description, file);
  addGrouped(duplicateCanonicals, canonical, file);

  for (const image of html.match(/<img\b[^>]*>/gi) || []) {
    const src = attr(image, 'src') || '(inline image)';
    const alt = attr(image, 'alt');
    if (!/\balt\s*=/i.test(image)) {
      imageAltIssues.push(`${file}: ${src}`);
    }
  }

  for (const tag of html.match(/<(?:a|img|script|link|source)\b[^>]*>/gi) || []) {
    const reference = attr(tag, 'href') || attr(tag, 'src');
    const target = localTarget(file, reference);
    if (!target) continue;
    const fullTarget = path.join(ROOT, target);
    const fallbackHtml = target.endsWith('.html') ? null : `${fullTarget}.html`;
    if (!fs.existsSync(fullTarget) && !(fallbackHtml && fs.existsSync(fallbackHtml))) {
      brokenInternalTargets.push(`${file}: ${reference} -> ${target}`);
    }
  }
}

function duplicates(map) {
  return Array.from(map.entries())
    .filter(([, groupedFiles]) => groupedFiles.length > 1)
    .map(([value, groupedFiles]) => ({ value, files: groupedFiles }));
}

const report = {
  generatedAt: '2026-08-24',
  totals: { html: files.length, indexable: indexable.length },
  missing,
  duplicates: {
    titles: duplicates(duplicateTitles),
    descriptions: duplicates(duplicateDescriptions),
    canonicals: duplicates(duplicateCanonicals)
  },
  imageAltIssues,
  brokenInternalTargets: Array.from(new Set(brokenInternalTargets)).sort()
};

const criticalCount = missing.title.length + missing.description.length + missing.canonical.length
  + missing.h1.length + missing.lang.length + report.duplicates.canonicals.length
  + imageAltIssues.length + report.brokenInternalTargets.length;

if (process.argv.includes('--check')) {
  console.log(`Site quality audit: ${report.totals.indexable} indexable pages; ${criticalCount} critical finding(s); ${missing.ogImage.length} Open Graph image warning(s); ${missing.twitterImage.length} Twitter image warning(s).`);
  if (criticalCount > 0) {
    console.error(JSON.stringify(report, null, 2));
    process.exit(1);
  }
} else {
  console.log(JSON.stringify(report, null, 2));
}
