#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CHECK = process.argv.includes('--check');

function trackedHtml() {
  return execFileSync('git', ['ls-files', '*.html'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    .split(/\r?\n/).filter(Boolean);
}

function normalizeUrl(url) {
  if (!/^https:\/\/(?:www\.)?qilylean\.com(?:\/|$)/i.test(url)) return url;
  if (!url.endsWith('/')) return url;
  return url.slice(0, -1);
}

function normalizeMetadata(html) {
  return html
    .replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi, tag => tag.replace(/href=(["'])(https:\/\/(?:www\.)?qilylean\.com[^"']*)\1/i, (all, quote, url) => `href=${quote}${normalizeUrl(url)}${quote}`))
    .replace(/<link\b[^>]*href=["']https:\/\/(?:www\.)?qilylean\.com[^"']*["'][^>]*rel=["']canonical["'][^>]*>/gi, tag => tag.replace(/href=(["'])(https:\/\/(?:www\.)?qilylean\.com[^"']*)\1/i, (all, quote, url) => `href=${quote}${normalizeUrl(url)}${quote}`))
    .replace(/<meta\b[^>]*property=["']og:url["'][^>]*>/gi, tag => tag.replace(/content=(["'])(https:\/\/(?:www\.)?qilylean\.com[^"']*)\1/i, (all, quote, url) => `content=${quote}${normalizeUrl(url)}${quote}`))
    .replace(/<meta\b[^>]*content=["']https:\/\/(?:www\.)?qilylean\.com[^"']*["'][^>]*property=["']og:url["'][^>]*>/gi, tag => tag.replace(/content=(["'])(https:\/\/(?:www\.)?qilylean\.com[^"']*)\1/i, (all, quote, url) => `content=${quote}${normalizeUrl(url)}${quote}`));
}

const changed = [];
for (const rel of trackedHtml()) {
  const file = path.join(ROOT, rel);
  const before = fs.readFileSync(file, 'utf8');
  const after = normalizeMetadata(before);
  if (after === before) continue;
  changed.push(rel);
  if (!CHECK) fs.writeFileSync(file, after, 'utf8');
}

if (CHECK && changed.length) {
  console.error(`Canonical/og:url trailing slash remains in: ${changed.join(', ')}`);
  process.exit(1);
}

console.log(changed.length ? `${CHECK ? 'would normalize' : 'normalized'} ${changed.length} HTML canonical/og:url files` : 'canonical/og:url normalization PASS');
