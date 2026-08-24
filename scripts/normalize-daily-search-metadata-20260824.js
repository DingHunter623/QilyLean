#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DAILY = path.join(ROOT, 'qilylean', 'daily');
const CHECK_ONLY = process.argv.includes('--check');
const TWITTER_IMAGE = 'https://qilylean.com/assets/social/qilylean-home-share-1200x630.png';

function titleFor(html) {
  return ((html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '').replace(/\s+/g, ' ').trim();
}

function descriptionFor(html) {
  const forward = /<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i;
  const reverse = /<meta\b[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i;
  return (html.match(forward) || html.match(reverse) || [])[1] || '';
}

function hasNamedMeta(html, name) {
  return new RegExp(`<meta\\b[^>]*name=["']${name}["']`, 'i').test(html);
}

function escapeAttribute(value) {
  return String(value).replace(/&(?!(?:amp|lt|gt|quot|#39);)/g, '&amp;').replace(/"/g, '&quot;');
}

function ensureTwitterMetadata(html) {
  const title = titleFor(html);
  const description = descriptionFor(html);
  const lines = [];
  if (!hasNamedMeta(html, 'twitter:card')) lines.push('<meta name="twitter:card" content="summary_large_image">');
  if (!hasNamedMeta(html, 'twitter:title')) lines.push(`<meta name="twitter:title" content="${escapeAttribute(title)}">`);
  if (!hasNamedMeta(html, 'twitter:description')) lines.push(`<meta name="twitter:description" content="${escapeAttribute(description)}">`);
  if (!hasNamedMeta(html, 'twitter:image')) lines.push(`<meta name="twitter:image" content="${TWITTER_IMAGE}">`);
  if (!hasNamedMeta(html, 'twitter:image:alt')) lines.push('<meta name="twitter:image:alt" content="QilyLean启力精益精选工程简报视觉预览">');
  if (!lines.length) return html;
  const firstStylesheet = html.match(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/i);
  return firstStylesheet
    ? html.replace(firstStylesheet[0], `${lines.join('\n')}\n${firstStylesheet[0]}`)
    : html.replace('</head>', `${lines.join('\n')}\n</head>`);
}

function duplicateValues(records, field) {
  const grouped = new Map();
  for (const record of records) {
    const value = record[field];
    if (!value) continue;
    const files = grouped.get(value) || [];
    files.push(record.file);
    grouped.set(value, files);
  }
  return new Map(Array.from(grouped.entries()).filter(([, files]) => files.length > 1));
}

function scan() {
  return fs.readdirSync(DAILY)
    .filter(name => /^\d{4}-\d{2}-\d{2}\.html$/.test(name))
    .sort()
    .map(name => {
      const file = path.join(DAILY, name);
      const html = fs.readFileSync(file, 'utf8');
      return { file, name, date: name.slice(0, 10), html, title: titleFor(html), description: descriptionFor(html) };
    });
}

let records = scan();
let duplicateTitles = duplicateValues(records, 'title');
let duplicateDescriptions = duplicateValues(records, 'description');
let changed = 0;

if (!CHECK_ONLY) {
  for (const record of records) {
    let html = record.html;
    if (duplicateTitles.has(record.title)) {
      const uniqueTitle = /｜(?:今日|精选)简报$/.test(record.title)
        ? record.title.replace(/｜((?:今日|精选)简报)$/, `｜${record.date}｜$1`)
        : `${record.title}｜${record.date}`;
      html = html.replace(/(<title\b[^>]*>)[\s\S]*?(<\/title>)/i, `$1${uniqueTitle}$2`);
    }
    if (duplicateDescriptions.has(record.description)) {
      const uniqueDescription = `${record.description}｜${record.date} QilyLean精选简报`;
      html = html.replace(
        /(<meta\b[^>]*name=["']description["'][^>]*content=["'])[^"']*(["'][^>]*>)/i,
        `$1${uniqueDescription}$2`
      );
    }
    html = ensureTwitterMetadata(html);
    if (html !== record.html) {
      fs.writeFileSync(record.file, html);
      changed += 1;
    }
  }
  records = scan();
  duplicateTitles = duplicateValues(records, 'title');
  duplicateDescriptions = duplicateValues(records, 'description');
}

if (duplicateTitles.size || duplicateDescriptions.size) {
  for (const [title, files] of duplicateTitles) console.error(`Duplicate title: ${title} -> ${files.map(file => path.basename(file)).join(', ')}`);
  for (const [description, files] of duplicateDescriptions) console.error(`Duplicate description: ${description} -> ${files.map(file => path.basename(file)).join(', ')}`);
  process.exit(1);
}

const missingTwitter = records.filter(record => ['twitter:card','twitter:title','twitter:description','twitter:image','twitter:image:alt'].some(name => !hasNamedMeta(record.html, name)));
if (missingTwitter.length) {
  console.error(`Daily Twitter preview metadata missing: ${missingTwitter.map(record => record.name).join(', ')}`);
  process.exit(1);
}

console.log(CHECK_ONLY
  ? `Daily search metadata validation passed: ${records.length} curated pages have unique titles, descriptions and large-image social previews.`
  : `Daily search metadata normalized: ${changed} file(s) updated.`);
