#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = path.resolve(__dirname, '..');
const outFile = path.join(root, 'maintenance', 'site-system-v4-repository-audit.json');
const config = JSON.parse(fs.readFileSync(path.join(root, 'data', 'site-system-v4.json'), 'utf8'));

function git(args, options = {}) {
  const result = cp.spawnSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 512 * 1024 * 1024,
    ...options
  });
  if (result.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${result.stderr || result.stdout}`);
  return result.stdout;
}

function human(bytes) {
  const units = ['B', 'KiB', 'MiB', 'GiB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit += 1; }
  return `${value.toFixed(unit === 0 ? 0 : 2)} ${units[unit]}`;
}

const tracked = git(['ls-files', '-z']).split('\0').filter(Boolean);
const files = [];
const byExtension = new Map();
let workingTreeBytes = 0;

for (const relative of tracked) {
  const full = path.join(root, relative);
  let stat;
  try { stat = fs.statSync(full); } catch { continue; }
  if (!stat.isFile()) continue;
  const bytes = stat.size;
  workingTreeBytes += bytes;
  const ext = (path.extname(relative).replace(/^\./, '').toLowerCase() || '(none)');
  const bucket = byExtension.get(ext) || { files: 0, bytes: 0 };
  bucket.files += 1;
  bucket.bytes += bytes;
  byExtension.set(ext, bucket);
  files.push({ path: relative, bytes, humanBytes: human(bytes), extension: ext });
}

files.sort((a, b) => b.bytes - a.bytes);
const warning = config.performanceBudget.warningAssetBytes;
const critical = config.performanceBudget.criticalAssetBytes;

const objectList = git(['rev-list', '--objects', '--all']);
const cat = cp.spawnSync('git', ['cat-file', '--batch-check=%(objecttype) %(objectname) %(objectsize) %(rest)'], {
  cwd: root,
  input: objectList,
  encoding: 'utf8',
  maxBuffer: 512 * 1024 * 1024
});
if (cat.status !== 0) throw new Error(`git cat-file audit failed: ${cat.stderr || cat.stdout}`);

const historical = [];
for (const line of cat.stdout.split('\n')) {
  if (!line.startsWith('blob ')) continue;
  const match = line.match(/^blob\s+([0-9a-f]{40,64})\s+(\d+)\s*(.*)$/i);
  if (!match) continue;
  historical.push({ sha: match[1], bytes: Number(match[2]), humanBytes: human(Number(match[2])), path: match[3] || '(historical-path-unavailable)' });
}
historical.sort((a, b) => b.bytes - a.bytes);

const countObjects = git(['count-objects', '-vH']).trim().split('\n').reduce((acc, line) => {
  const index = line.indexOf(':');
  if (index > 0) acc[line.slice(0, index)] = line.slice(index + 1).trim();
  return acc;
}, {});

const report = {
  generatedAt: new Date().toISOString(),
  policy: 'audit-only; no deletion; no history rewrite',
  trackedFileCount: files.length,
  workingTreeBytes,
  workingTreeHuman: human(workingTreeBytes),
  warningAssetBytes: warning,
  criticalAssetBytes: critical,
  warningOrLargerCount: files.filter((file) => file.bytes >= warning).length,
  criticalOrLargerCount: files.filter((file) => file.bytes >= critical).length,
  largeReleaseAssetExtensions: config.repositoryPolicy.largeReleaseAssets,
  gitObjectStore: countObjects,
  topWorkingTreeFiles: files.slice(0, 100),
  topHistoricalBlobs: historical.slice(0, 100),
  extensionSummary: Object.fromEntries([...byExtension.entries()].sort((a, b) => b[1].bytes - a[1].bytes).map(([ext, value]) => [ext, { ...value, humanBytes: human(value.bytes) }]))
};

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, `${JSON.stringify(report, null, 2)}\n`);
console.log(`[V4] Repository audit: ${report.trackedFileCount} tracked files, ${report.workingTreeHuman}; ${report.warningOrLargerCount} files >= ${human(warning)}; ${report.criticalOrLargerCount} files >= ${human(critical)}.`);
console.log(`[V4] Report: ${path.relative(root, outFile)}`);
