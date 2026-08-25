#!/usr/bin/env node
'use strict';

/* QilyLean Global Translation Dual Route V2 + Header Axis V1 materializer｜2026-08-25 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const VERSION = '20260825-global-translation-dual-route-v2';
const CONSISTENCY = `/site-ui-consistency-v1.js?v=${VERSION}`;
const NAVIGATION = '/site-navigation.js?v=20260825-language-runtime-compat-v42';
const PARENT_NAV = '/site-parent-navigation-v3.js?v=20260825-language-runtime-compat-v42';
const DOCK_SHARE = '/site-dock-share-runtime-v1.js?v=20260825-language-runtime-compat-v31';
const CORE_SERVICE_DOCK = '/site-core-service-dock-closure-v1.js?v=20260825-language-runtime-compat-v101';
const LANGUAGE_SRC = `/site-global-language-v3.js?v=${VERSION}`;
const HEADER_AXIS = '/site-header-axis-v1.css?v=20260825-header-axis-nav-fit-v1';
const PROGRESS_CSS = '/site-translation-progress-v1.css?v=20260825-bilingual-progress-v1';
const PROGRESS_JS = '/site-translation-progress-v1.js?v=20260825-bilingual-progress-v1';
const MARKER = 'data-qily-web-translate-direct="dual-route-v2"';

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
  next = next.replace(/\s*<script\b[^>]*(?:data-qily-global-language-direct|data-qily-google-translate-direct|data-qily-web-translate-direct|data-qily-translation-progress-direct)=["'][^"']+["'][^>]*><\/script>\s*/gi, '\n');
  next = next.replace(/\s*<link\b[^>]*href=["'][^"']*\/site-header-axis-v1\.css[^"']*["'][^>]*>\s*/gi, '\n');
  next = next.replace(/\s*<link\b[^>]*href=["'][^"']*\/site-translation-progress-v1\.css[^"']*["'][^>]*>\s*/gi, '\n');
  next = next.replace(/\/site-global-language-v3\.js(?:\?v=[^"']*)?/g, LANGUAGE_SRC);
  const tags = [
    `<link id="qilyHeaderAxisV1" rel="stylesheet" href="${HEADER_AXIS}">`,
    `<link id="qilyTranslationProgressV1Stylesheet" rel="stylesheet" href="${PROGRESS_CSS}">`,
    `<script defer ${MARKER} src="${LANGUAGE_SRC}"></script>`,
    `<script defer data-qily-translation-progress-direct="bilingual-v1" src="${PROGRESS_JS}"></script>`
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
  throw new Error(`Global Translation / Header Axis materialization stale: ${changed.slice(0, 30).join(', ')}${changed.length > 30 ? ` … +${changed.length - 30}` : ''}`);
}

process.stdout.write(`Global Translation / Header Axis ${checkOnly ? 'check passed' : 'materialized'}: ${changed.length} tracked HTML file(s).\n`);
