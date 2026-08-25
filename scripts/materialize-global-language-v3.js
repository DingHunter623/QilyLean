#!/usr/bin/env node
'use strict';

/* QilyLean Global Translation Safety + Header + Public UI + Contrast materializer｜2026-08-25
 * Retired validator migration references only:
 * /site-translation-progress-v1.css?v=20260825-bilingual-progress-v1
 * /site-translation-progress-v1.js?v=20260825-bilingual-progress-v1
 * /site-translation-public-ui-v1.css?v=20260825-public-language-picker-v4
 * /site-translation-public-ui-v1.js?v=20260825-public-language-picker-v4
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const VERSION = '20260825-global-translation-dual-route-v2';
const SAFE_VERSION = '20260825-translation-safe-inpage-v1';
const CONSISTENCY = `/site-ui-consistency-v1.js?v=${VERSION}`;
const NAVIGATION = '/site-navigation.js?v=20260825-language-runtime-compat-v42';
const PARENT_NAV = '/site-parent-navigation-v3.js?v=20260825-language-runtime-compat-v42';
const DOCK_SHARE = '/site-dock-share-runtime-v1.js?v=20260825-language-runtime-compat-v31';
const CORE_SERVICE_DOCK = '/site-core-service-dock-closure-v1.js?v=20260825-language-runtime-compat-v101';
const LEGACY_LANGUAGE_SRC = `/site-global-language-v3.js?v=${VERSION}`;
const SAFE_RUNTIME = `/site-translation-safe-runtime-v1.js?v=${SAFE_VERSION}`;
const HEADER_AXIS = '/site-header-axis-v1.css?v=20260825-header-axis-nav-fit-v1';
const PROGRESS_CSS = '/site-translation-progress-v1.css?v=20260825-bilingual-progress-v2';
const PROGRESS_JS = '/site-translation-progress-v1.js?v=20260825-bilingual-progress-v2';
const PUBLIC_UI_CSS = '/site-translation-public-ui-v1.css?v=20260825-public-language-picker-v5';
const PUBLIC_UI_JS = '/site-translation-public-ui-v1.js?v=20260825-public-language-picker-v5';
const INTERACTION_CONTRAST_CSS = '/site-interaction-contrast-guard-v1.css?v=20260825-sitewide-contrast-v1';
const INTERACTION_CONTRAST_JS = '/site-interaction-contrast-guard-v1.js?v=20260825-sitewide-contrast-v1';
const CONTENT_CONTRAST_CSS = '/site-content-contrast-guard-v1.css?v=20260825-sitewide-content-contrast-v1';
const CONTENT_CONTRAST_JS = '/site-content-contrast-guard-v1.js?v=20260825-sitewide-content-contrast-v1';
const LEGACY_MARKER = 'data-qily-web-translate-direct="dual-route-v2"';

function trackedHtml() {
  return execFileSync('git', ['ls-files', '*.html'], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    .split(/\r?\n/).filter(Boolean);
}

function materialize(source) {
  let next = source;
  next = next.replace(/\/site-ui-consistency-v1\.js(?:\?v=[^"']*)?/g, CONSISTENCY);
  next = next.replace(/\/site-navigation\.js(?:\?v=[^"']*)?/g, NAVIGATION);
  next = next.replace(/\/site-parent-navigation-v3\.js(?:\?v=[^"']*)?/g, PARENT_NAV);
  next = next.replace(/\/site-dock-share-runtime-v1\.js(?:\?v=[^"']*)?/g, DOCK_SHARE);
  next = next.replace(/\/site-core-service-dock-closure-v1\.js(?:\?v=[^"']*)?/g, CORE_SERVICE_DOCK);
  next = next.replace(/\s*<script\b[^>]*(?:data-qily-global-language-direct|data-qily-google-translate-direct|data-qily-web-translate-direct|data-qily-translation-progress-direct|data-qily-translation-public-ui-direct|data-qily-interaction-contrast-direct|data-qily-content-contrast-direct|data-qily-translation-safe-direct|data-qily-translation-safety-bootstrap)[^>]*>[\s\S]*?<\/script>\s*/gi, '\n');
  next = next.replace(/\s*<link\b[^>]*href=["'][^"']*\/site-header-axis-v1\.css[^"']*["'][^>]*>\s*/gi, '\n');
  next = next.replace(/\s*<link\b[^>]*href=["'][^"']*\/site-translation-progress-v1\.css[^"']*["'][^>]*>\s*/gi, '\n');
  next = next.replace(/\s*<link\b[^>]*href=["'][^"']*\/site-translation-public-ui-v1\.css[^"']*["'][^>]*>\s*/gi, '\n');
  next = next.replace(/\s*<link\b[^>]*href=["'][^"']*\/site-interaction-contrast-guard-v1\.css[^"']*["'][^>]*>\s*/gi, '\n');
  next = next.replace(/\s*<link\b[^>]*href=["'][^"']*\/site-content-contrast-guard-v1\.css[^"']*["'][^>]*>\s*/gi, '\n');
  next = next.replace(/\/site-global-language-v3\.js(?:\?v=[^"']*)?/g, LEGACY_LANGUAGE_SRC);
  const tags = [
    '<script data-qily-translation-safety-bootstrap="inpage-v1">window.__qilyGlobalTranslationDualRouteV2=true;window.__qilyGoogleTranslateOnDemandV1=true;window.__qilyGlobalLanguageV31=true;window.__qilyGlobalLanguageV3=true;window.__qilyGlobalLanguageV2=true;window.__qilyGlobalLanguageV1=true;</script>',
    `<script data-qily-translation-safe-direct="inpage-v1" src="${SAFE_RUNTIME}"></script>`,
    `<link id="qilyHeaderAxisV1" rel="stylesheet" href="${HEADER_AXIS}">`,
    `<link id="qilyTranslationProgressV1Stylesheet" rel="stylesheet" href="${PROGRESS_CSS}">`,
    `<link id="qilyTranslationPublicUiV1Stylesheet" rel="stylesheet" href="${PUBLIC_UI_CSS}">`,
    `<link id="qilyInteractionContrastGuardV1Stylesheet" rel="stylesheet" href="${INTERACTION_CONTRAST_CSS}">`,
    `<link id="qilyContentContrastGuardV1Stylesheet" rel="stylesheet" href="${CONTENT_CONTRAST_CSS}">`,
    `<script defer ${LEGACY_MARKER} src="${LEGACY_LANGUAGE_SRC}"></script>`,
    `<script defer data-qily-translation-public-ui-direct="visitor-v1" src="${PUBLIC_UI_JS}"></script>`,
    `<script defer data-qily-translation-progress-direct="bilingual-v1" src="${PROGRESS_JS}"></script>`,
    `<script defer data-qily-interaction-contrast-direct="v1" src="${INTERACTION_CONTRAST_JS}"></script>`,
    `<script defer data-qily-content-contrast-direct="v1" src="${CONTENT_CONTRAST_JS}"></script>`
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
  throw new Error(`Global shell / translation safety / readability materialization stale: ${changed.slice(0, 30).join(', ')}${changed.length > 30 ? ` … +${changed.length - 30}` : ''}`);
}

process.stdout.write(`Global shell / translation safety / readability ${checkOnly ? 'check passed' : 'materialized'}: ${changed.length} tracked HTML file(s).\n`);
