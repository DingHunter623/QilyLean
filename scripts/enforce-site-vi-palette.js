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
 * Canonical dark Hero surface:
 *   #073c47 → #0f4b5a → #178b94
 *   linear-gradient(118deg, rgba(7,60,71,.99), rgba(15,75,90,.97) 58%, rgba(23,139,148,.90))
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

const canonicalHeroGradient = 'linear-gradient(118deg,rgba(7,60,71,.99),rgba(15,75,90,.97) 58%,rgba(23,139,148,.90))';
const finalGuardHref = '/site-stability-recovery-v1.css?v=20260828-vi-surface-v3';
const contentGuardHref = '/site-content-contrast-guard-v1.css?v=20260828-vi-surface-v7';

/* Split legacy values so this audit file never rewrites its own rule definitions. */
const legacyPurple = ['#' + '6e3f5f', '#' + '7d4a70', '#' + '8e4774'];

/*
 * Historical QilyLean dark-surface gradients that visibly drift from the current majority VI.
 * These patterns intentionally target known brand-gradient variants rather than arbitrary gradients,
 * so semantic charts, photographs and unrelated decorative treatments are not flattened.
 */
const legacyHeroGradientPatterns = [
  /linear-gradient\(\s*125deg\s*,\s*var\(--qily-read-deep\)\s*,\s*var\(--qily-read-teal\)\s*\)/gi,
  /linear-gradient\(\s*125deg\s*,\s*var\(--forest\)\s*,\s*var\(--teal\)\s*\)/gi,
  /linear-gradient\(\s*125deg\s*,\s*var\(--qily-forest\)\s*,\s*var\(--qily-teal\)\s*\)/gi,
  /linear-gradient\(\s*125deg\s*,\s*#0a3540\s+0(?:%)?\s*,\s*#0f4b5a\s+58%\s*,\s*#178b94\s+100%\s*\)/gi,
  /linear-gradient\(\s*125deg\s*,\s*#0f4b5a\s*,\s*#177f87\s+58%\s*,\s*#296776\s*\)/gi,
  /linear-gradient\(\s*125deg\s*,\s*#0f4b5a\s*,\s*#178b94\s*\)/gi,
  /linear-gradient\(\s*125deg\s*,\s*#073c47\s*,\s*#178b94\s*\)/gi
];

const replacements = [
  [new RegExp(legacyPurple[0], 'gi'), '#9e4a34'],
  [new RegExp(legacyPurple[1], 'gi'), '#9e4a34'],
  [new RegExp(legacyPurple[2], 'gi'), '#9e4a34'],
  [/rgba\(110\s*,\s*63\s*,\s*95\s*,/gi, 'rgba(158,74,52,'],
  [/rgba\(125\s*,\s*74\s*,\s*112\s*,/gi, 'rgba(158,74,52,'],
  [/rgba\(142\s*,\s*71\s*,\s*116\s*,/gi, 'rgba(158,74,52,'],
  ...legacyHeroGradientPatterns.map((pattern) => [pattern, canonicalHeroGradient])
];

const bannedPatterns = [
  new RegExp(legacyPurple[0], 'i'),
  new RegExp(legacyPurple[1], 'i'),
  new RegExp(legacyPurple[2], 'i'),
  /rgba\(110\s*,\s*63\s*,\s*95\s*,/i,
  /rgba\(125\s*,\s*74\s*,\s*112\s*,/i,
  /rgba\(142\s*,\s*71\s*,\s*116\s*,/i,
  ...legacyHeroGradientPatterns.map((pattern) => new RegExp(pattern.source, 'i'))
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

function ensureFinalSurfaceGuard(html) {
  if (!/<\/head>/i.test(html)) return html;

  let next = html.replace(
    /\/site-stability-recovery-v1\.css\?v=[^"'\s>]+/gi,
    finalGuardHref
  );
  next = next.replace(
    /\/site-content-contrast-guard-v1\.css\?v=[^"'\s>]+/gi,
    contentGuardHref
  );

  if (!/site-stability-recovery-v1\.css/i.test(next)) {
    const link = `  <link id="qilyStabilityRecoveryV1Stylesheet" rel="stylesheet" href="${finalGuardHref}">\n`;
    next = next.replace(/<\/head>/i, `${link}</head>`);
  }

  return next;
}

const changedFiles = [];
const injectedFiles = [];
const finalGuardInjectedFiles = [];
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
    const withVi = injectViStylesheet(next);
    if (withVi !== next) injectedFiles.push(rel);
    next = withVi;

    const hadFinalGuard = /site-stability-recovery-v1\.css/i.test(next);
    const guarded = ensureFinalSurfaceGuard(next);
    if (!hadFinalGuard && guarded !== next) finalGuardInjectedFiles.push(rel);
    next = guarded;
  }

  if (next !== source) {
    fs.writeFileSync(file, next, 'utf8');
    changedFiles.push(rel);
    replacementsByFile[rel] = count;
  }
}

const violations = [];
const missingFinalGuardLinks = [];
const staleFinalGuardLinks = [];

for (const file of scanned) {
  const rel = relative(file);
  if (rel === auditScriptPath) continue;
  const source = fs.readFileSync(file, 'utf8');

  for (const pattern of bannedPatterns) {
    if (pattern.test(source)) violations.push({ file: rel, pattern: String(pattern) });
  }

  if (path.extname(file).toLowerCase() === '.html' && /<\/head>/i.test(source)) {
    if (!/site-stability-recovery-v1\.css/i.test(source)) missingFinalGuardLinks.push(rel);
    if (/site-stability-recovery-v1\.css/i.test(source) && !source.includes(finalGuardHref)) {
      staleFinalGuardLinks.push(rel);
    }
  }
}

const viCss = fs.readFileSync(path.join(root, 'site-vi-standard-v1.css'), 'utf8');
const stabilityCss = fs.readFileSync(path.join(root, 'site-stability-recovery-v1.css'), 'utf8');

const requiredViStatements = [
  '--qily-vi-olive:#0f4b5a',
  '--qily-vi-red:#9e4a34',
  '--qily-vi-gold:#caa15f',
  'linear-gradient(118deg,rgba(7,60,71,.99),rgba(15,75,90,.97) 58%,rgba(23,139,148,.90))',
  '语义通用元素豁免',
  '.qily-float-current',
  '.qily-float-share',
  '.qily-float-contact'
];
const requiredFinalGuardStatements = [
  'QILY-VI-SURFACE-FINAL-GUARD:START',
  '--qily-final-vi-hero-base:#0f4b5a',
  canonicalHeroGradient,
  '.contact-hero',
  '.preview-head',
  '[data-qily-hero-surface="dark"]'
];

const missingRequirements = [
  ...requiredViStatements.filter((value) => !viCss.includes(value)).map((value) => `site-vi-standard-v1.css:${value}`),
  ...requiredFinalGuardStatements.filter((value) => !stabilityCss.includes(value)).map((value) => `site-stability-recovery-v1.css:${value}`)
];

const report = {
  schemaVersion: 2,
  checkedAt: new Date().toISOString(),
  policy: {
    brandColors: {
      olive: '#0f4b5a',
      oliveDeep: '#073c47',
      oliveLight: '#178b94',
      red: '#9e4a34',
      gold: '#caa15f'
    },
    canonicalHeroGradient,
    finalGuardHref,
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
  finalGuardInjectedFiles,
  replacementsByFile,
  violations,
  missingFinalGuardLinks,
  staleFinalGuardLinks,
  missingRequirements,
  status: violations.length || missingFinalGuardLinks.length || staleFinalGuardLinks.length || missingRequirements.length ? 'failed' : 'passed'
};

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

if (report.status !== 'passed') {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}

console.log(
  `QilyLean VI audit passed: ${report.scannedFiles} files scanned, ` +
  `${changedFiles.length} files normalized, ${injectedFiles.length} legacy VI links added, ` +
  `${finalGuardInjectedFiles.length} final surface guards added.`
);