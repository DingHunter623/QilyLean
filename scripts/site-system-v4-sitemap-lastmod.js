#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'data', 'site-system-v4.json'), 'utf8'));
const writeMode = process.argv.includes('--write');
const reportFile = path.join(root, 'maintenance', 'site-system-v4-sitemap-audit.json');

function gitDate(relative) {
  const result = cp.spawnSync('git', ['log', '-1', '--format=%cs', '--', relative], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) return null;
  const value = result.stdout.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function sourceForUrl(rawUrl) {
  let url;
  try { url = new URL(rawUrl); } catch { return null; }
  if (url.origin !== config.production.baseUrl) return null;
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/' || pathname === '') return 'index.html';
  pathname = pathname.replace(/^\/+|\/+$/g, '');
  const direct = pathname;
  const candidates = /\.[a-z0-9]+$/i.test(pathname) ? [direct] : [`${direct}/index.html`, `${direct}.html`, direct];
  return candidates.find((candidate) => fs.existsSync(path.join(root, candidate)) && fs.statSync(path.join(root, candidate)).isFile()) || null;
}

function processSitemap(relative) {
  const full = path.join(root, relative);
  let xml = fs.readFileSync(full, 'utf8');
  const entries = [];
  let changed = false;

  xml = xml.replace(/<url>([\s\S]*?)<\/url>/g, (block, inner) => {
    const locMatch = inner.match(/<loc>([^<]+)<\/loc>/);
    if (!locMatch) return block;
    const url = locMatch[1].trim();
    const source = sourceForUrl(url);
    const currentMatch = inner.match(/<lastmod>([^<]+)<\/lastmod>/);
    const current = currentMatch ? currentMatch[1].trim() : null;
    const expected = source ? gitDate(source) : null;
    const status = !source ? 'NO_LOCAL_SOURCE' : !expected ? 'NO_GIT_DATE' : current === expected ? 'MATCH' : 'DRIFT';
    entries.push({ url, source, currentLastmod: current, expectedLastmod: expected, status });

    if (!writeMode || !expected || current === expected) return block;
    changed = true;
    if (currentMatch) return block.replace(/<lastmod>[^<]+<\/lastmod>/, `<lastmod>${expected}</lastmod>`);
    return block.replace('</loc>', `</loc><lastmod>${expected}</lastmod>`);
  });

  if (writeMode && changed) fs.writeFileSync(full, xml.endsWith('\n') ? xml : `${xml}\n`);
  return { file: relative, changed, entries };
}

const results = [processSitemap(config.sourceOfTruth.sitemap)];
if (fs.existsSync(path.join(root, config.sourceOfTruth.coreSitemap))) results.push(processSitemap(config.sourceOfTruth.coreSitemap));

const flat = results.flatMap((result) => result.entries);
const report = {
  generatedAt: new Date().toISOString(),
  mode: writeMode ? 'write' : 'audit',
  sitemapFiles: results.map(({ file, changed }) => ({ file, changed })),
  urlCount: flat.length,
  mappedCount: flat.filter((entry) => entry.source).length,
  driftCount: flat.filter((entry) => entry.status === 'DRIFT').length,
  noLocalSourceCount: flat.filter((entry) => entry.status === 'NO_LOCAL_SOURCE').length,
  entries: flat
};

fs.mkdirSync(path.dirname(reportFile), { recursive: true });
fs.writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`);
console.log(`[V4] Sitemap ${report.mode}: ${report.urlCount} URLs; ${report.mappedCount} mapped; ${report.driftCount} lastmod drift; ${report.noLocalSourceCount} without local source.`);
if (writeMode) console.log(`[V4] Updated: ${results.filter((result) => result.changed).map((result) => result.file).join(', ') || 'none'}`);
