#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHECK_ONLY = process.argv.includes('--check');
const SKIP_DIRS = new Set([
  '.git', '.github', 'node_modules', 'vendor', 'dist', 'build', 'coverage', '.next',
  'desktop', 'android', 'app-store', 'cloudflare-worker', 'services', 'docs', 'scripts',
  'data', 'assets', 'fonts', 'styles', 'tests'
]);

function walk(dir, output) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (entry) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) return;
      walk(path.join(dir, entry.name), output);
      return;
    }
    if (entry.isFile() && /\.html?$/i.test(entry.name)) output.push(path.join(dir, entry.name));
  });
}

function siteKind(relativePath, source) {
  const relative = relativePath.split(path.sep).join('/');
  const scriptTag = /<script\b[^>]*\bsrc=["'][^"']*["'][^>]*>/gi;
  const scripts = source.match(scriptTag) || [];
  if (relative.startsWith('cn-site/')) {
    const isCnPage = scripts.some(function (tag) {
      return /\/assets\/cn-nav-rail-v1\.js(?:\?[^"']*)?["']/i.test(tag) ||
        /\/assets\/cn-footer-actions-v1\.js(?:\?[^"']*)?["']/i.test(tag);
    });
    return isCnPage ? 'cn' : null;
  }
  const isInternationalPage = scripts.some(function (tag) {
    return /\/site-navigation\.js(?:\?[^"']*)?["']/i.test(tag) ||
      /\/site-navigation-core\.js(?:\?[^"']*)?["']/i.test(tag);
  });
  return isInternationalPage ? 'intl' : null;
}

function expectedTag(kind) {
  if (kind === 'cn') {
    return '<script defer data-qily-traffic-loader="v1" src="/assets/site-traffic-stats-v1.js?v=20261030-cn-light-analytics-v3"></script>';
  }
  return '<script defer data-qily-traffic-loader="v1" src="/site-traffic-stats-v1.js?v=20261030-light-analytics-v2"></script>';
}

function isCanonicalPlacement(source, tag, kind) {
  const tagIndex = source.indexOf(tag);
  const headEnd = source.toLowerCase().indexOf('</head>');
  if (tagIndex < 0 || headEnd < 0 || tagIndex > headEnd) return false;
  if (kind === 'cn') return true;
  const runtimeIndex = source.indexOf('data-qily-dock-share-runtime="v1"');
  if (runtimeIndex >= 0) return tagIndex < runtimeIndex;
  const formalIndex = source.indexOf('id="qilyViV4Formal"');
  if (formalIndex >= 0) return tagIndex < formalIndex;
  return true;
}

function insertTag(source, tag, kind) {
  const withoutOldTags = source.replace(/^[\t ]*<script\b[^>]*\bdata-qily-traffic-loader(?:=["'][^"']*["'])?[^>]*><\/script>[\t ]*(?:\r?\n)?/gim, '');
  if (kind === 'intl') {
    const runtimeTag = /<script\b[^>]*\bdata-qily-dock-share-runtime=["']v1["'][^>]*><\/script>/i;
    if (runtimeTag.test(withoutOldTags)) {
      return withoutOldTags.replace(runtimeTag, function (match) { return tag + '\n' + match; });
    }
    const formalTag = /<link\b[^>]*\bid=["']qilyViV4Formal["'][^>]*>/i;
    if (formalTag.test(withoutOldTags)) {
      return withoutOldTags.replace(formalTag, function (match) { return tag + '\n' + match; });
    }
  }
  const headClose = /<\/head\s*>/i;
  if (headClose.test(withoutOldTags)) {
    return withoutOldTags.replace(headClose, '\n  ' + tag + '\n</head>');
  }
  const bodyClose = /<\/body\s*>/i;
  if (bodyClose.test(withoutOldTags)) {
    return withoutOldTags.replace(bodyClose, '\n' + tag + '\n</body>');
  }
  throw new Error('No </head> or </body> found while materializing ' + tag);
}

const allHtml = [];
walk(ROOT, allHtml);
let eligible = 0;
let updated = 0;
const errors = [];

allHtml.forEach(function (absolutePath) {
  const relativePath = path.relative(ROOT, absolutePath);
  const source = fs.readFileSync(absolutePath, 'utf8');
  const kind = siteKind(relativePath, source);
  if (!kind) return;
  eligible += 1;
  const tag = expectedTag(kind);
  const found = source.match(/<script\b[^>]*\bdata-qily-traffic-loader(?:=["'][^"']*["'])?[^>]*><\/script>/gi) || [];
  const correct = found.length === 1 && found[0] === tag && isCanonicalPlacement(source, tag, kind);
  if (CHECK_ONLY) {
    if (!correct) errors.push(relativePath + ': expected exactly one canonical traffic loader');
    return;
  }
  if (correct) return;
  const next = insertTag(source, tag, kind);
  fs.writeFileSync(absolutePath, next, 'utf8');
  updated += 1;
});

if (CHECK_ONLY && errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log((CHECK_ONLY ? 'PASS' : 'Materialized') + ': ' + eligible + ' public HTML pages inspected; ' + updated + ' page(s) ' + (CHECK_ONLY ? 'missing loader(s)' : 'updated') + '.');
