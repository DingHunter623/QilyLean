#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dailyDir = path.join(root, 'qilylean', 'daily');
const manifestPath = path.join(dailyDir, 'retired-weekly-redirects.json');
const indexPath = path.join(dailyDir, 'index.json');
const ORIGIN = 'https://qilylean.com';
const MARKER = 'data-qily-retired-daily-redirect="v1"';

function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[ch]);
}

function mondayKey(date) {
  const value = new Date(date + 'T00:00:00Z');
  const day = value.getUTCDay() || 7;
  value.setUTCDate(value.getUTCDate() - day + 1);
  return value.toISOString().slice(0, 10);
}

function redirectHtml(row) {
  const target = row.target;
  const canonical = ORIGIN + target;
  const title = '本期工程简报已并入周度精选｜QilyLean';
  const note = row.source_date + ' 原工程简报已按周度精选策略合并至 ' + row.target_date + ' 精选简报。';
  return '<!doctype html>\n'
    + '<html lang="zh-CN">\n<head>\n'
    + '<meta charset="utf-8">\n'
    + '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
    + '<title>' + title + '</title>\n'
    + '<meta name="robots" content="noindex,follow">\n'
    + '<link rel="canonical" href="' + canonical + '">\n'
    + '<meta http-equiv="refresh" content="0; url=' + target + '">\n'
    + '<script>(function(){var t=' + JSON.stringify(target) + ';location.replace(t+location.search+location.hash)})();</script>\n'
    + '</head>\n'
    + '<body ' + MARKER + ' data-source-date="' + esc(row.source_date) + '" data-target-date="' + esc(row.target_date) + '">\n'
    + '<main><h1>本期工程简报已并入周度精选</h1><p>' + esc(note) + '</p>'
    + '<p><a href="' + target + '">前往对应周度精选简报</a></p>'
    + '<p><a href="/qilylean/daily-insights.html">返回精选简报目录</a></p></main>\n'
    + '</body>\n</html>\n';
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  const kept = new Set(index.map((item) => item.date));
  const redirects = Array.isArray(manifest.redirects) ? manifest.redirects : [];

  if (manifest.generated_from?.baseline !== 'qilylean/daily/curation-baseline.json') {
    throw new Error('Retired redirect manifest is not tied to the immutable curation baseline.');
  }

  let written = 0;
  let skippedRepublished = 0;
  for (const row of redirects) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.source_date || '') || !/^\d{4}-\d{2}-\d{2}$/.test(row.target_date || '')) {
      throw new Error('Invalid retired redirect date row: ' + JSON.stringify(row));
    }
    if (mondayKey(row.source_date) !== mondayKey(row.target_date)) {
      throw new Error('Retired brief target escaped its curated ISO week: ' + row.source_date + ' -> ' + row.target_date);
    }
    if (!kept.has(row.target_date)) {
      throw new Error('Retired brief target is not a retained curated page: ' + row.target_date);
    }
    const targetFile = path.join(dailyDir, row.target_date + '.html');
    if (!fs.existsSync(targetFile)) throw new Error('Retired brief target file is missing: ' + targetFile);

    if (kept.has(row.source_date)) {
      skippedRepublished += 1;
      continue;
    }

    const sourceFile = path.join(dailyDir, row.source_date + '.html');
    const next = redirectHtml(row);
    const current = fs.existsSync(sourceFile) ? fs.readFileSync(sourceFile, 'utf8') : '';
    if (current !== next) {
      fs.writeFileSync(sourceFile, next, 'utf8');
      written += 1;
    }
  }

  process.stdout.write(
    'Retired Daily Brief redirects materialized: '
    + redirects.length + ' baseline rows; ' + written + ' written/updated; '
    + skippedRepublished + ' skipped because a date is currently republished.\n'
  );
}

main();
