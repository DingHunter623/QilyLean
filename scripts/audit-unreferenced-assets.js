#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const reportFile = path.join(root, 'maintenance', 'unreferenced-assets-report.json');
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

const extensionPattern = Array.from(assetExtensions)
  .map((item) => item.slice(1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .join('|');
const referenceRegex = new RegExp(
  "([^\\s\"'`()<>{}]+?\\.(?:" + extensionPattern + "))(?:[?#][^\\s\"'`()<>{}]*)?",
  'gi'
);

const protectedPathPatterns = [
  /^assets\/brand\//i,
  /^qilylean\/assets\/daily-[^/]+\.svg$/i,
  /^projects\/lean-improvement-evidence\//i,
  /(?:^|\/)(?:favicon|apple-touch-icon|site-icon|browserconfig)(?:[._-]|$)/i,
  /(?:^|\/)[^/]*(?:logo|brandmark|wechat|weixin|qrcode|qr-code|home-qr)[^/]*$/i,
  /^maintenance\//i
];

function trackedFiles() {
  return execFileSync('git', ['ls-files', '-z'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024
  })
    .split('\0')
    .filter(Boolean)
    .map((item) => item.replace(/\\/g, '/'));
}

function safeDecode(value) {
  try { return decodeURIComponent(value); } catch (_) { return value; }
}

function cleanReference(raw) {
  let value = String(raw || '').trim().replace(/\\/g, '/');
  value = value.replace(/^[\s'"`(]+|[\s'"`)]+$/g, '');
  value = value.split('#')[0].split('?')[0];
  value = safeDecode(value);
  if (!value || /^(?:data|mailto|tel|javascript):/i.test(value)) return null;

  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      if (!/(^|\.)qilylean\.com$/i.test(url.hostname)) return null;
      value = url.pathname;
    } catch (_) {
      return null;
    }
  }

  value = value.replace(/^\/+/, '').replace(/^\.\//, '');
  return value ? path.posix.normalize(value) : null;
}

function extractRawReferences(content) {
  referenceRegex.lastIndex = 0;
  const refs = [];
  let match;
  while ((match = referenceRegex.exec(content)) !== null) refs.push(match[1]);
  return refs;
}

function isProtectedCore(file) {
  return protectedPathPatterns.some((pattern) => pattern.test(file));
}

function isDynamicSequence(file, textDirectories) {
  const directory = path.posix.dirname(file);
  if (!textDirectories.has(directory)) return false;
  const stem = path.posix.basename(file, path.posix.extname(file));
  return /(?:^|[-_ ])(?:page|slide|frame|sheet|thumb|preview|render|img|image|photo|scan|drawing|layout|view)[-_ ]?\d+/i.test(stem)
    || /(?:^|[-_ ])\d{2,}(?:[-_ ]|$)/.test(stem);
}

function main() {
  const files = trackedFiles();
  const textFiles = files.filter((file) => textExtensions.has(path.posix.extname(file).toLowerCase()));
  const textDirectories = new Set(textFiles.map((file) => path.posix.dirname(file)));
  const candidates = files.filter((file) => assetExtensions.has(path.posix.extname(file).toLowerCase()));
  const candidateSet = new Set(candidates.map((file) => file.toLowerCase()));
  const basenameMap = new Map();

  candidates.forEach((file) => {
    const base = path.posix.basename(file).toLowerCase();
    if (!basenameMap.has(base)) basenameMap.set(base, []);
    basenameMap.get(base).push(file);
  });

  const directReferences = new Set();
  const basenameReferences = new Set();
  const referenceSources = new Map();

  textFiles.forEach((source) => {
    let content;
    try {
      content = fs.readFileSync(path.join(root, source), 'utf8');
    } catch (_) {
      return;
    }

    extractRawReferences(content).forEach((raw) => {
      const cleaned = cleanReference(raw);
      if (!cleaned) return;

      const variants = new Set([
        cleaned,
        path.posix.normalize(path.posix.join(path.posix.dirname(source), cleaned))
      ]);

      variants.forEach((variant) => {
        const key = variant.replace(/^(?:\.\.\/)+/, '').toLowerCase();
        if (!candidateSet.has(key)) return;
        directReferences.add(key);
        if (!referenceSources.has(key)) referenceSources.set(key, []);
        referenceSources.get(key).push(source);
      });

      basenameReferences.add(path.posix.basename(cleaned).toLowerCase());
    });
  });

  const deletable = [];
  const retained = [];

  candidates.forEach((file) => {
    const stat = fs.statSync(path.join(root, file));
    const key = file.toLowerCase();
    const base = path.posix.basename(file).toLowerCase();
    const direct = directReferences.has(key);
    const uniqueBasename = (basenameMap.get(base) || []).length === 1;
    const basenameOnly = !direct && uniqueBasename && basenameReferences.has(base);
    const protectedCore = isProtectedCore(file);
    const dynamicSequence = isDynamicSequence(file, textDirectories);
    const referenced = direct || basenameOnly;

    const record = {
      path: file,
      bytes: stat.size,
      reason: protectedCore
        ? 'protected-core-asset'
        : dynamicSequence
          ? 'protected-dynamic-sequence'
          : direct
            ? 'referenced-path'
            : basenameOnly
              ? 'referenced-unique-basename'
              : 'no-reference-found',
      sources: direct ? Array.from(new Set(referenceSources.get(key) || [])).slice(0, 20) : []
    };

    if (!protectedCore && !dynamicSequence && !referenced) deletable.push(record);
    else retained.push(record);
  });

  deletable.sort((a, b) => b.bytes - a.bytes || a.path.localeCompare(b.path));
  retained.sort((a, b) => a.path.localeCompare(b.path));

  const potentialBytes = deletable.reduce((sum, item) => sum + item.bytes, 0);
  const deletionRatio = candidates.length ? deletable.length / candidates.length : 0;

  const report = {
    generatedAt: new Date().toISOString(),
    mode: apply ? 'apply' : 'audit',
    trackedFiles: files.length,
    assetFiles: candidates.length,
    retainedAssets: retained.length,
    unreferencedAssets: deletable.length,
    potentialBytesToRelease: potentialBytes,
    deletedAssets: 0,
    deletedBytes: 0,
    safetyStop: apply && deletionRatio > 0.65,
    note: 'Current-branch cleanup only. Git history retains older blobs until a separate, explicitly approved history rewrite.',
    deletable,
    retained
  };

  fs.mkdirSync(path.dirname(reportFile), { recursive: true });
  fs.writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  if (report.safetyStop) {
    throw new Error(`Safety stop: ${deletable.length}/${candidates.length} assets were classified as unreferenced (${(deletionRatio * 100).toFixed(1)}%).`);
  }

  if (apply) {
    deletable.forEach((item) => {
      const target = path.join(root, item.path);
      if (!fs.existsSync(target)) return;
      fs.unlinkSync(target);
      report.deletedAssets += 1;
      report.deletedBytes += item.bytes;
    });
    fs.writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }

  process.stdout.write(`${apply ? 'Deleted' : 'Found'} ${apply ? report.deletedAssets : deletable.length} unreferenced assets; ${apply ? report.deletedBytes : potentialBytes} bytes.\n`);
}

main();
