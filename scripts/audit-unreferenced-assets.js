#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const reportFile = path.join(root, 'maintenance', 'unreferenced-assets-report.json');
const reportRepoPath = 'maintenance/unreferenced-assets-report.json';
const apply = process.argv.includes('--apply');

const assetExtensions = new Set([
  '.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.tif', '.tiff', '.svg', '.ico',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.zip', '.rar', '.7z', '.apk', '.ipa',
  '.mp4', '.mov', '.m4v', '.webm', '.mp3', '.wav', '.m4a'
]);

const textExtensions = new Set([
  '.html', '.htm', '.css', '.js', '.mjs', '.cjs', '.json', '.md', '.txt', '.xml',
  '.yml', '.yaml', '.csv', '.ts', '.tsx', '.jsx', '.py', '.sh', '.ps1', '.toml',
  '.ini', '.conf', '.map', '.webmanifest', '.svg'
]);

const protectedPathPatterns = [
  /^assets\/brand\//i,
  /^android\//i,
  /^ios\//i,
  /^projects\/lean-improvement-evidence\//i,
  /(?:^|\/)(?:favicon|apple-touch-icon|site-icon|browserconfig)(?:[._-]|$)/i,
  /(?:^|\/)[^/]*(?:logo|brandmark|wechat|weixin|qrcode|qr-code|home-qr)[^/]*$/i
];

const ignoredReferenceSources = new Set([reportRepoPath.toLowerCase()]);

function trackedFiles() {
  return execFileSync('git', ['ls-files', '-z'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 96 * 1024 * 1024
  })
    .split('\0')
    .filter(Boolean)
    .map((item) => item.replace(/\\/g, '/'));
}

function isProtectedCore(file) {
  return protectedPathPatterns.some((pattern) => pattern.test(file));
}

function humanBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KiB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GiB`;
}

function encodedVariants(value) {
  const variants = new Set([value]);
  try { variants.add(encodeURI(value)); } catch (_) {}
  try { variants.add(encodeURIComponent(value)); } catch (_) {}
  return Array.from(variants).filter(Boolean);
}

function contentContainsReference(content, file, uniqueBasename) {
  const normalized = String(content || '').replace(/\\/g, '/');
  const basename = path.posix.basename(file);
  const candidates = new Set();

  encodedVariants(file).forEach((value) => {
    candidates.add(value);
    candidates.add('/' + value.replace(/^\/+/, ''));
  });

  if (uniqueBasename) {
    encodedVariants(basename).forEach((value) => candidates.add(value));
  }

  for (const candidate of candidates) {
    if (normalized.includes(candidate)) return true;
  }
  return false;
}

function main() {
  const files = trackedFiles();
  const textFiles = files.filter((file) => {
    if (ignoredReferenceSources.has(file.toLowerCase())) return false;
    return textExtensions.has(path.posix.extname(file).toLowerCase());
  });
  const candidates = files.filter((file) => assetExtensions.has(path.posix.extname(file).toLowerCase()));

  const basenameMap = new Map();
  candidates.forEach((file) => {
    const base = path.posix.basename(file).toLowerCase();
    if (!basenameMap.has(base)) basenameMap.set(base, []);
    basenameMap.get(base).push(file);
  });

  const textDocuments = [];
  textFiles.forEach((source) => {
    try {
      textDocuments.push({ source, content: fs.readFileSync(path.join(root, source), 'utf8') });
    } catch (_) {}
  });

  const deletable = [];
  const retained = [];

  candidates.forEach((file) => {
    const absolute = path.join(root, file);
    if (!fs.existsSync(absolute)) return;
    const stat = fs.statSync(absolute);
    const base = path.posix.basename(file).toLowerCase();
    const uniqueBasename = (basenameMap.get(base) || []).length === 1;
    const protectedCore = isProtectedCore(file);
    const sources = [];

    if (!protectedCore) {
      for (const document of textDocuments) {
        if (!contentContainsReference(document.content, file, uniqueBasename)) continue;
        if (sources.length < 20) sources.push(document.source);
      }
    }

    const referenced = sources.length > 0;
    const record = {
      path: file,
      bytes: stat.size,
      humanBytes: humanBytes(stat.size),
      reason: protectedCore ? 'protected-source-or-core-asset' : referenced ? 'referenced-current-text-source' : 'no-current-reference-found',
      sources
    };

    if (!protectedCore && !referenced) deletable.push(record);
    else retained.push(record);
  });

  deletable.sort((a, b) => b.bytes - a.bytes || a.path.localeCompare(b.path));
  retained.sort((a, b) => a.path.localeCompare(b.path));

  const potentialBytes = deletable.reduce((sum, item) => sum + item.bytes, 0);
  const totalAssetBytes = candidates.reduce((sum, file) => {
    try { return sum + fs.statSync(path.join(root, file)).size; } catch (_) { return sum; }
  }, 0);
  const deletionRatio = candidates.length ? deletable.length / candidates.length : 0;
  const byteRatio = totalAssetBytes ? potentialBytes / totalAssetBytes : 0;

  const report = {
    generatedAt: new Date().toISOString(),
    mode: apply ? 'apply' : 'audit',
    trackedFiles: files.length,
    scannedTextFiles: textDocuments.length,
    assetFiles: candidates.length,
    retainedAssets: retained.length,
    unreferencedAssets: deletable.length,
    potentialBytesToRelease: potentialBytes,
    potentialReleaseHuman: humanBytes(potentialBytes),
    deletionRatioByCount: Number((deletionRatio * 100).toFixed(2)),
    deletionRatioByBytes: Number((byteRatio * 100).toFixed(2)),
    deletedAssets: 0,
    deletedBytes: 0,
    deletedHuman: '0 B',
    safetyStop: apply && (deletionRatio > 0.65 || byteRatio > 0.75),
    note: 'Current-branch cleanup only. Git history retains older blobs until a separately approved history rewrite. The cleanup report itself is excluded from reference scanning. Versioned URLs, URL-encoded paths, absolute site URLs, direct paths and unique basenames are recognized as live references.',
    deletable,
    retained
  };

  fs.mkdirSync(path.dirname(reportFile), { recursive: true });
  fs.writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  if (report.safetyStop) {
    throw new Error(`Safety stop: ${deletable.length}/${candidates.length} assets or ${report.deletionRatioByBytes}% of asset bytes were classified as unreferenced.`);
  }

  if (apply) {
    deletable.forEach((item) => {
      const target = path.join(root, item.path);
      if (!fs.existsSync(target)) return;
      fs.unlinkSync(target);
      report.deletedAssets += 1;
      report.deletedBytes += item.bytes;
    });
    report.deletedHuman = humanBytes(report.deletedBytes);
    fs.writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }

  process.stdout.write(`${apply ? 'Deleted' : 'Found'} ${apply ? report.deletedAssets : deletable.length} unreferenced assets; ${apply ? report.deletedHuman : report.potentialReleaseHuman}.\n`);
}

main();
