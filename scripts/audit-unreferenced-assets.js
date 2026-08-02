#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
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

const protectedPathPatterns = [
  /^assets\/brand\//i,
  /^qilylean\/assets\/daily-[^/]+\.svg$/i,
  /(?:^|\/)(?:favicon|apple-touch-icon|site-icon|browserconfig)(?:[._-]|$)/i,
  /(?:^|\/)[^/]*(?:logo|brandmark|wechat|weixin|qrcode|qr-code|home-qr)[^/]*$/i,
  /^maintenance\//i
];

function trackedFiles() {
  return execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
    .split('\0')
    .filter(Boolean)
    .map((item) => item.replace(/\\/g, '/'));
}

function safeDecode(value) {
  try { return decodeURIComponent(value); } catch (_) { return value; }
}

function cleanReference(raw) {
  let value = String(raw || '').trim().replace(/\\/g, '/');
  value = value.replace(/^['"`(]+|['"`)]+$/g, '');
  value = value.split('#')[0].split('?')[0];
  value = safeDecode(value);
  if (!value) return null;

  if (/^(?:data|mailto|tel|javascript):/i.test(value)) return null;
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      if (!/(^|\.)qilylean\.com$/i.test(url.hostname)) return null;
      value = url.pathname;
    } catch (_) { return null; }
  }

  value = value.replace(/^\/+/, '').replace(/^\.\//, '');
  return value ? path.posix.normalize(value) : null;
}

function extractRawReferences(content) {
  const ext = Array.from(assetExtensions).map((item) => item.slice(1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`([^\\s"'\\` + '`' + `()<>{}]+?\\.(?:${ext}))(?:[?#][^\\s"'\\` + '`' + `()<>{}]*)?`, 'gi');
  const refs = [];
  let match;
  while ((match = regex.exec(content)) !== null) refs.push(match[1]);
  return refs;
}

function isProtected(file) {
  return protectedPathPatterns.some((pattern) => pattern.test(file));
}

function sha256(file) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(path.join(root, file)));
  return hash.digest('hex');
}

function main() {
  const files = trackedFiles();
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

  files.forEach((source) => {
    const ext = path.posix.extname(source).toLowerCase();
    if (!textExtensions.has(ext)) return;
    let content;
    try { content = fs.readFileSync(path.join(root, source), 'utf8'); } catch (_) { return; }
    extractRawReferences(content).forEach((raw) => {
      const cleaned = cleanReference(raw);
      if (!cleaned) return;
      const variants = new Set([
        cleaned,
        path.posix.normalize(path.posix.join(path.posix.dirname(source), cleaned))
      ]);
      variants.forEach((variant) => {
        const key = variant.replace(/^\.\.\//g, '').toLowerCase();
        if (!candidateSet.has(key)) return;
        directReferences.add(key);
        if (!referenceSources.has(key)) referenceSources.set(key, []);
        referenceSources.get(key).push(source);
      });
      basenameReferences.add(path.posix.basename(cleaned).toLowerCase());
    });
  });

  const fileMeta = candidates.map((file) => {
    const stat = fs.statSync(path.join(root, file));
    const key = file.toLowerCase();
    const base = path.posix.basename(file).toLowerCase();
    const direct = directReferences.has(key);
    const uniqueBasename = (basenameMap.get(base) || []).length === 1;
    const basenameOnly = !direct && uniqueBasename && basenameReferences.has(base);
    return {
      path: file,
      size: stat.size,
      hash: sha256(file),
      protected: isProtected(file),
      referenced: direct || basenameOnly,
      referenceMode: direct ? 'path' : (basenameOnly ? 'unique-basename' : null),
      sources: direct ? Array.from(new Set(referenceSources.get(key) || [])).slice(0, 20) : []
    };
  });

  const hashGroups = new Map();
  fileMeta.forEach((item) => {
    if (!hashGroups.has(item.hash)) hashGroups.set(item.hash, []);
    hashGroups.get(item.hash).push(item);
  });

  const deletable = [];
  const retained = [];
  fileMeta.forEach((item) => {
    const group = hashGroups.get(item.hash) || [];
    const duplicateOfReferenced = group.some((peer) => peer.path !== item.path && (peer.referenced || peer.protected));
    const record = {
      path: item.path,
      bytes: item.size,
      reason: item.protected
        ? 'protected-core-asset'
        : item.referenced
          ? `referenced-${item.referenceMode}`
          : duplicateOfReferenced
            ? 'unreferenced-duplicate-of-retained-file'
            : 'no-reference-found',
      sources: item.sources
    };
    if (!item.protected && !item.referenced) deletable.push(record);
    else retained.push(record);
  });

  deletable.sort((a, b) => b.bytes - a.bytes || a.path.localeCompare(b.path));
  retained.sort((a, b) => a.path.localeCompare(b.path));

  const deleted = [];
  if (apply) {
    deletable.forEach((item) => {
      const target = path.join(root, item.path);
      if (fs.existsSync(target)) {
        fs.unlinkSync(target);
        deleted.push(item);
      }
    });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    mode: apply ? 'apply' : 'audit',
    trackedFiles: files.length,
    assetFiles: candidates.length,
    retainedAssets: retained.length,
    unreferencedAssets: deletable.length,
    potentialBytesToRelease: deletable.reduce((sum, item) => sum + item.bytes, 0),
    deletedAssets: deleted.length,
    deletedBytes: deleted.reduce((sum, item) => sum + item.bytes, 0),
    note: 'This scans the current branch only. Deleting files reduces the current tree and Pages payload; Git history still retains previous blobs until a separate history rewrite.',
    deletable,
    retained
  };

  fs.mkdirSync(path.dirname(reportFile), { recursive: true });
  fs.writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  process.stdout.write(`${apply ? 'Deleted' : 'Found'} ${apply ? deleted.length : deletable.length} unreferenced assets; ${apply ? report.deletedBytes : report.potentialBytesToRelease} bytes.\n`);
}

main();
