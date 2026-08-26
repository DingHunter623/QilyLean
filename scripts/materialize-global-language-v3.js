#!/usr/bin/env node
'use strict';

/* QilyLean Sitewide Public Baseline Materializer V5｜2026-08-26
 * Single public baseline: Chinese source + in-page safe translation + public language UI +
 * header axis + interaction/content contrast. The retired external-proxy translator is never emitted.
 * V5: dark visual surfaces preserve authored light text while opaque light cards nested inside them
 * are evaluated independently; navigation query is refreshed for deterministic site-search opening.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const BASELINE_VERSION = '20260825-mobile-navigation-recovery-v1';
const SAFE_VERSION = '20260825-translation-safe-inpage-v2';
const CONSISTENCY = `/site-ui-consistency-v1.js?v=${BASELINE_VERSION}`;
const NAVIGATION = '/site-navigation.js?v=20260826-search-navigation-contrast-v44';
const PARENT_NAV = '/site-parent-navigation-v3.js?v=20260825-language-runtime-compat-v42';
const DOCK_SHARE = '/site-dock-share-runtime-v1.js?v=20260825-language-runtime-compat-v31';
const CORE_SERVICE_DOCK = '/site-core-service-dock-closure-v1.js?v=20260825-language-runtime-compat-v101';
const LANGUAGE_CSS = '/site-global-language-v1.css?v=20260825-public-translation-shell-v1';
const SAFE_RUNTIME = `/site-translation-safe-runtime-v1.js?v=${SAFE_VERSION}`;
const HEADER_AXIS = '/site-header-axis-v1.css?v=20260825-mobile-navigation-recovery-v3';
const PROGRESS_CSS = '/site-translation-progress-v1.css?v=20260825-bilingual-progress-v3';
const PROGRESS_JS = '/site-translation-progress-v1.js?v=20260825-bilingual-progress-v3';
const PUBLIC_UI_CSS = '/site-translation-public-ui-v1.css?v=20260825-mobile-navigation-recovery-v7';
const PUBLIC_UI_JS = '/site-translation-public-ui-v1.js?v=20260825-public-language-picker-v6';
const INTERACTION_CONTRAST_CSS = '/site-interaction-contrast-guard-v1.css?v=20260825-sitewide-contrast-v2';
const INTERACTION_CONTRAST_JS = '/site-interaction-contrast-guard-v1.js?v=20260825-sitewide-contrast-v2';
const CONTENT_CONTRAST_CSS = '/site-content-contrast-guard-v1.css?v=20260826-sitewide-content-contrast-v5';
const CONTENT_CONTRAST_JS = '/site-content-contrast-guard-v1.js?v=20260826-sitewide-content-contrast-v5';

function trackedHtml() {
  return execFileSync('git', ['ls-files', '*.html'], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    .split(/\r?\n/).filter(Boolean);
}

function removeScriptByMarker(source) {
  return source.replace(/\s*<script\b[^>]*(?:data-qily-global-language-direct|data-qily-google-translate-direct|data-qily-web-translate-direct|data-qily-translation-progress-direct|data-qily-translation-public-ui-direct|data-qily-interaction-contrast-direct|data-qily-content-contrast-direct|data-qily-translation-safe-direct|data-qily-translation-safety-bootstrap)[^>]*>[\s\S]*?<\/script>\s*/gi, '\n');
}
function removeLegacyTranslatorScripts(source) {
  return source.replace(/\s*<script\b[^>]*src=["'][^"']*\/site-global-language-v3\.js[^"']*["'][^>]*><\/script>\s*/gi, '\n');
}
function removeManagedStyles(source) {
  const patterns = [
    /\s*<link\b[^>]*href=["'][^"']*\/site-global-language-v1\.css[^"']*["'][^>]*>\s*/gi,
    /\s*<link\b[^>]*href=["'][^"']*\/site-header-axis-v1\.css[^"']*["'][^>]*>\s*/gi,
    /\s*<link\b[^>]*href=["'][^"']*\/site-translation-progress-v1\.css[^"']*["'][^>]*>\s*/gi,
    /\s*<link\b[^>]*href=["'][^"']*\/site-translation-public-ui-v1\.css[^"']*["'][^>]*>\s*/gi,
    /\s*<link\b[^>]*href=["'][^"']*\/site-interaction-contrast-guard-v1\.css[^"']*["'][^>]*>\s*/gi,
    /\s*<link\b[^>]*href=["'][^"']*\/site-content-contrast-guard-v1\.css[^"']*["'][^>]*>\s*/gi
  ];
  let next = source;
  for (const pattern of patterns) next = next.replace(pattern, '\n');
  return next;
}

function materialize(source) {
  let next = source;
  next = next.replace(/\/site-ui-consistency-v1\.js(?:\?v=[^"']*)?/g, CONSISTENCY);
  next = next.replace(/\/site-navigation\.js(?:\?v=[^"']*)?/g, NAVIGATION);
  next = next.replace(/\/site-parent-navigation-v3\.js(?:\?v=[^"']*)?/g, PARENT_NAV);
  next = next.replace(/\/site-dock-share-runtime-v1\.js(?:\?v=[^"']*)?/g, DOCK_SHARE);
  next = next.replace(/\/site-core-service-dock-closure-v1\.js(?:\?v=[^"']*)?/g, CORE_SERVICE_DOCK);
  next = removeScriptByMarker(next);
  next = removeLegacyTranslatorScripts(next);
  next = removeManagedStyles(next);

  const tags = [
    '<script data-qily-translation-safety-bootstrap="inpage-v2">window.__qilyGlobalTranslationDualRouteV2=true;window.__qilyGoogleTranslateOnDemandV1=true;window.__qilyGlobalLanguageV31=true;window.__qilyGlobalLanguageV3=true;window.__qilyGlobalLanguageV2=true;window.__qilyGlobalLanguageV1=true;</script>',
    `<link id="qilyGlobalLanguageV1Stylesheet" rel="stylesheet" href="${LANGUAGE_CSS}">`,
    `<link id="qilyHeaderAxisV1" rel="stylesheet" href="${HEADER_AXIS}">`,
    `<link id="qilyTranslationProgressV1Stylesheet" rel="stylesheet" href="${PROGRESS_CSS}">`,
    `<link id="qilyTranslationPublicUiV1Stylesheet" rel="stylesheet" href="${PUBLIC_UI_CSS}">`,
    `<link id="qilyInteractionContrastGuardV1Stylesheet" rel="stylesheet" href="${INTERACTION_CONTRAST_CSS}">`,
    `<link id="qilyContentContrastGuardV1Stylesheet" rel="stylesheet" href="${CONTENT_CONTRAST_CSS}">`,
    `<script data-qily-translation-safe-direct="inpage-v2" src="${SAFE_RUNTIME}"></script>`,
    `<script defer data-qily-translation-public-ui-direct="visitor-v2" src="${PUBLIC_UI_JS}"></script>`,
    `<script defer data-qily-translation-progress-direct="bilingual-v2" src="${PROGRESS_JS}"></script>`,
    `<script defer data-qily-interaction-contrast-direct="v2" src="${INTERACTION_CONTRAST_JS}"></script>`,
    `<script defer data-qily-content-contrast-direct="v5" src="${CONTENT_CONTRAST_JS}"></script>`
  ].join('\n');
  if (/<\/head>/i.test(next)) next = next.replace(/<\/head>/i, `${tags}\n</head>`);
  return next;
}

const changed = [];
for (const relative of trackedHtml()) {
  const target = path.join(root, relative);
  const source = fs.readFileSync(target, 'utf8');
  const next = materialize(source);
  if (next === source) continue;
  changed.push(relative);
  if (!checkOnly) fs.writeFileSync(target, next, 'utf8');
}

if (checkOnly && changed.length) {
  throw new Error(`Sitewide public baseline materialization stale: ${changed.slice(0, 30).join(', ')}${changed.length > 30 ? ` … +${changed.length - 30}` : ''}`);
}

process.stdout.write(`Sitewide public baseline ${checkOnly ? 'check passed' : 'materialized'}: ${changed.length} tracked HTML file(s).\n`);
