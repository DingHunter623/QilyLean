#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CHECK = process.argv.includes('--check');
const siteSystem = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/site-system-v4.json'), 'utf8'));
const canonicalTrailingSlash = siteSystem.production?.canonicalTrailingSlash !== false;

function trackedHtml() {
  return execFileSync('git', ['ls-files', '*.html'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    .split(/\r?\n/).filter(Boolean);
}

function normalizeUrl(url) {
  if (!/^https:\/\/(?:www\.)?qilylean\.com(?:\/|$)/i.test(url)) return url;
  const parsed = new URL(url);
  const isFileRoute = /\.[a-z0-9]+$/i.test(parsed.pathname);
  if (isFileRoute || !canonicalTrailingSlash) {
    parsed.pathname = parsed.pathname === '/' ? '/' : parsed.pathname.replace(/\/+$/, '');
  } else {
    parsed.pathname = `${parsed.pathname.replace(/\/+$/, '')}/`;
  }
  return parsed.toString();
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
  console.error(`Canonical/og:url SSOT slash drift remains in: ${changed.join(', ')}`);
  process.exit(1);
}

console.log(changed.length ? `${CHECK ? 'would normalize' : 'normalized'} ${changed.length} HTML canonical/og:url files to SSOT slash style` : `canonical/og:url SSOT normalization PASS; canonicalTrailingSlash=${canonicalTrailingSlash}`);
