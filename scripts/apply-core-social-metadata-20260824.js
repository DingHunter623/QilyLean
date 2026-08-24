#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHECK_ONLY = process.argv.includes('--check');
const DEFAULT_IMAGE = 'https://qilylean.com/assets/social/qilylean-home-share-1200x630.png';
const GAME_IMAGE = 'https://qilylean.com/assets/social/pure-ddz-classic-share-1200x630.png';
const EXTRA_INDEXABLE_URLS = [
  'https://qilylean.com/cooperation/factory-planning/',
  'https://qilylean.com/cooperation/lean-improvement/',
  'https://qilylean.com/cooperation/visual-management/',
  'https://qilylean.com/certificates/chatgpt-lean/',
  'https://qilylean.com/gbt2828.html',
  'https://qilylean.com/projects/lean-improvement-evidence/',
  'https://qilylean.com/qilylean/daily/2026-08-14.html',
  'https://qilylean.com/qilylean/training/2026-08-08.html',
  'https://qilylean.com/share/'
];
const errors = [];
let changed = 0;

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function localFile(urlString) {
  const url = new URL(urlString);
  const pathname = decodeURIComponent(url.pathname).replace(/^\//, '');
  if (!pathname) return 'index.html';
  if (pathname.endsWith('/')) return `${pathname}index.html`;
  if (path.posix.extname(pathname)) return pathname;
  return `${pathname}/index.html`;
}

function contentFor(html, key, attribute = 'property') {
  const forward = new RegExp(`<meta\\b[^>]*${attribute}=["']${key}["'][^>]*content=["']([^"']+)["']`, 'i');
  const reverse = new RegExp(`<meta\\b[^>]*content=["']([^"']+)["'][^>]*${attribute}=["']${key}["']`, 'i');
  return (html.match(forward) || html.match(reverse) || [])[1] || '';
}

function canonicalFor(html) {
  const forward = /<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i;
  const reverse = /<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i;
  return (html.match(forward) || html.match(reverse) || [])[1] || '';
}

function titleFor(html) {
  return ((html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function descriptionFor(html) {
  return contentFor(html, 'description', 'name');
}

function hasMeta(html, key, attribute = 'property') {
  return new RegExp(`<meta\\b[^>]*${attribute}=["']${key}["']`, 'i').test(html);
}

function imageFor(file, html) {
  const existing = contentFor(html, 'og:image');
  if (existing) return existing;
  return file.includes('pure-ddz') ? GAME_IMAGE : DEFAULT_IMAGE;
}

function blockFor(file, html, canonical, title, description) {
  const image = imageFor(file, html);
  const existingImage = contentFor(html, 'og:image');
  const alt = contentFor(html, 'og:image:alt') || (existingImage
    ? title
    : file.includes('pure-ddz')
      ? '纯净斗地主无广告单机长辈版功能与视觉预览'
      : 'QilyLean启力精益飞机数字品牌旗舰与制造、数智能力预览');
  const lines = ['<!-- QILY-CORE-SOCIAL-PREVIEW:START -->'];

  if (!hasMeta(html, 'og:type')) lines.push('<meta property="og:type" content="website">');
  if (!hasMeta(html, 'og:site_name')) lines.push('<meta property="og:site_name" content="QilyLean｜启力精益">');
  if (!hasMeta(html, 'og:title')) lines.push(`<meta property="og:title" content="${title}">`);
  if (!hasMeta(html, 'og:description')) lines.push(`<meta property="og:description" content="${description}">`);
  if (!hasMeta(html, 'og:url')) lines.push(`<meta property="og:url" content="${canonical}">`);
  if (!hasMeta(html, 'og:image')) {
    lines.push(`<meta property="og:image" content="${image}">`);
    lines.push(`<meta property="og:image:secure_url" content="${image}">`);
    lines.push('<meta property="og:image:type" content="image/png">');
    lines.push('<meta property="og:image:width" content="1200">');
    lines.push('<meta property="og:image:height" content="630">');
    lines.push(`<meta property="og:image:alt" content="${alt}">`);
  }
  if (!hasMeta(html, 'twitter:card', 'name')) lines.push('<meta name="twitter:card" content="summary_large_image">');
  if (!hasMeta(html, 'twitter:title', 'name')) lines.push(`<meta name="twitter:title" content="${title}">`);
  if (!hasMeta(html, 'twitter:description', 'name')) lines.push(`<meta name="twitter:description" content="${description}">`);
  if (!hasMeta(html, 'twitter:image', 'name')) lines.push(`<meta name="twitter:image" content="${image}">`);
  if (!hasMeta(html, 'twitter:image:alt', 'name')) lines.push(`<meta name="twitter:image:alt" content="${alt}">`);
  lines.push('<!-- QILY-CORE-SOCIAL-PREVIEW:END -->');
  return lines.length > 2 ? lines.join('\n') : '';
}

const coreUrls = Array.from(read('sitemap-core.xml').matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi), match => match[1].trim());
const publicLandingUrls = Array.from(read('sitemap.xml').matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi), match => match[1].trim())
  .filter(url => !url.includes('/qilylean/daily/'));
const urls = Array.from(new Set([...coreUrls, ...publicLandingUrls, ...EXTRA_INDEXABLE_URLS]));
for (const url of urls) {
  const file = localFile(url);
  const absolute = path.join(ROOT, file);
  if (!fs.existsSync(absolute)) {
    errors.push(`${file}: sitemap-core target is missing`);
    continue;
  }

  let html = read(file);
  if (!CHECK_ONLY) {
    html = html.replace(/\n?<!-- QILY-CORE-SOCIAL-PREVIEW:START -->[\s\S]*?<!-- QILY-CORE-SOCIAL-PREVIEW:END -->\n?/g, '\n');
  }
  const canonical = canonicalFor(html);
  const title = titleFor(html);
  const description = descriptionFor(html);
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (!canonical) errors.push(`${file}: canonical is missing`);
  if (!title) errors.push(`${file}: title is missing`);
  if (!description) errors.push(`${file}: description is missing`);
  if (h1Count !== 1) errors.push(`${file}: expected one H1, found ${h1Count}`);
  if (!canonical || !title || !description) continue;

  if (!CHECK_ONLY) {
    const block = blockFor(file, html, canonical, title, description);
    if (block) {
      const canonicalTag = html.match(/<link\b[^>]*(?:rel=["']canonical["'][^>]*href=["'][^"']+["']|href=["'][^"']+["'][^>]*rel=["']canonical["'])[^>]*>/i);
      if (!canonicalTag) errors.push(`${file}: canonical insertion point is missing`);
      else {
        html = html.replace(canonicalTag[0], `${canonicalTag[0]}\n${block}`);
        fs.writeFileSync(absolute, html);
        changed += 1;
      }
    }
  }
}

if (CHECK_ONLY) {
  for (const url of urls) {
    const file = localFile(url);
    const absolute = path.join(ROOT, file);
    if (!fs.existsSync(absolute)) continue;
    const html = read(file);
    if (!hasMeta(html, 'og:image')) errors.push(`${file}: og:image is missing`);
    if (!hasMeta(html, 'twitter:card', 'name')) errors.push(`${file}: twitter:card is missing`);
    if (!hasMeta(html, 'twitter:image', 'name')) errors.push(`${file}: twitter:image is missing`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(CHECK_ONLY
  ? `Search landing social metadata validation passed: ${urls.length} priority URLs checked.`
  : `Search landing social metadata applied: ${changed} file(s) updated.`);
