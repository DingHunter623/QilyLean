#!/usr/bin/env node
'use strict';

/**
 * QilyLean global VI palette enforcement.
 *
 * Brand accents:
 *   Olive/deep teal: #0f4b5a / #178b94
 *   Brand red:       #9e4a34
 *   Brand gold:      #caa15f / #ffe39b
 *
 * White and pale green remain neutral web surfaces, not brand accent colors.
 * Semantic reference elements (❌, green check, success/error/warning icons and
 * diagram legends) are intentionally exempt and are never recolored here.
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const reportPath = path.join(root, 'qilylean', 'site-vi-audit.json');
const auditScriptPath = 'scripts/enforce-site-vi-palette.js';
const textExtensions = new Set(['.html', '.css', '.js', '.svg']);
const ignoredDirectories = new Set([
  '.git', 'node_modules', '.next', 'dist', 'build', 'vendor',
  'qilylean/assets/legal'
]);

/* Split legacy values so this audit file never rewrites its own rule definitions. */
const legacyPurple = ['#' + '6e3f5f', '#' + '7d4a70', '#' + '8e4774'];
const replacements = [
  [new RegExp(legacyPurple[0], 'gi'), '#9e4a34'],
  [new RegExp(legacyPurple[1], 'gi'), '#9e4a34'],
  [new RegExp(legacyPurple[2], 'gi'), '#9e4a34'],
  [/rgba\(110\s*,\s*63\s*,\s*95\s*,/gi, 'rgba(158,74,52,'],
  [/rgba\(125\s*,\s*74\s*,\s*112\s*,/gi, 'rgba(158,74,52,'],
  [/rgba\(142\s*,\s*71\s*,\s*116\s*,/gi, 'rgba(158,74,52,']
];

const bannedPatterns = [
  new RegExp(legacyPurple[0], 'i'),
  new RegExp(legacyPurple[1], 'i'),
  new RegExp(legacyPurple[2], 'i'),
  /rgba\(110\s*,\s*63\s*,\s*95\s*,/i,
  /rgba\(125\s*,\s*74\s*,\s*112\s*,/i,
  /rgba\(142\s*,\s*71\s*,\s*116\s*,/i
];

function relative(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function ignored(rel) {
  return [...ignoredDirectories].some((entry) => rel === entry || rel.startsWith(`${entry}/`));
}

function walk(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    const rel = relative(full);
    if (ignored(rel)) continue;
    if (entry.isDirectory()) walk(full, files);
    else if (textExtensions.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
  return files;
}

function injectViStylesheet(html) {
  if (/site-vi-standard-v1\.css/.test(html)) return html;
  if (/site-link-standard-v(?:1|2)\.css/.test(html)) return html;
  if (!/<\/head>/i.test(html)) return html;
  const link = '  <link id="qilyViStandardStylesheet" rel="stylesheet" href="/site-vi-standard-v1.css?v=20260801-vi-v1">\n';
  return html.replace(/<\/head>/i, `${link}</head>`);
}

const changedFiles = [];
const injectedFiles = [];
const replacementsByFile = {};
const scanned = walk(root);

for (const file of scanned) {
  const rel = relative(file);
  if (rel === auditScriptPath) continue;
  const source = fs.readFileSync(file, 'utf8');
  let next = source;
  let count = 0;

  for (const [pattern, replacement] of replacements) {
    const matches = next.match(pattern);
    if (matches) count += matches.length;
    next = next.replace(pattern, replacement);
  }

  if (path.extname(file).toLowerCase() === '.html') {
    const injected = injectViStylesheet(next);
    if (injected !== next) injectedFiles.push(rel);
    next = injected;
  }

  if (next !== source) {
    fs.writeFileSync(file, next, 'utf8');
    changedFiles.push(rel);
    replacementsByFile[rel] = count;
  }
}

const violations = [];
for (const file of scanned) {
  const rel = relative(file);
  if (rel === auditScriptPath) continue;
  const source = fs.readFileSync(file, 'utf8');
  for (const pattern of bannedPatterns) {
    if (pattern.test(source)) violations.push({ file: rel, pattern: String(pattern) });
  }
}

const viCss = fs.readFileSync(path.join(root, 'site-vi-standard-v1.css'), 'utf8');
const requiredStatements = [
  '--qily-vi-olive:#0f4b5a',
  '--qily-vi-red:#9e4a34',
  '--qily-vi-gold:#caa15f',
  '语义通用元素豁免',
  '.qily-float-current',
  '.qily-float-share',
  '.qily-float-contact'
];
const missingRequirements = requiredStatements.filter((value) => !viCss.includes(value));

const report = {
  schemaVersion: 1,
  checkedAt: new Date().toISOString(),
  policy: {
    brandColors: {
      olive: '#0f4b5a',
      oliveLight: '#178b94',
      red: '#9e4a34',
      gold: '#caa15f'
    },
    neutralSurfaces: ['#ffffff', '#eef7f5', '#f7fbfa'],
    semanticExemptions: [
      'red cross / ❌',
      'green background with white check',
      'success, error and warning status icons',
      'semantic diagram legends and process-route colors'
    ]
  },
  scannedFiles: scanned.length,
  changedFiles,
  injectedFiles,
  replacementsByFile,
  violations,
  missingRequirements,
  status: violations.length || missingRequirements.length ? 'failed' : 'passed'
};

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

if (report.status !== 'passed') {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}

console.log(`QilyLean VI audit passed: ${report.scannedFiles} files scanned, ${changedFiles.length} files normalized, ${injectedFiles.length} legacy pages linked.`);
