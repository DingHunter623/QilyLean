#!/usr/bin/env node
'use strict';

/* release trigger: 2026-08-25 Chinese-default + Google Translate on-demand */
/* post-merge materialization trigger: 2026-08-25T09:07+08:00 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const CONSISTENCY = '/site-ui-consistency-v1.js?v=20260825-google-translate-on-demand-v1';
const NAVIGATION = '/site-navigation.js?v=20260825-language-runtime-compat-v41';
const PARENT_NAV = '/site-parent-navigation-v3.js?v=20260825-language-runtime-compat-v42';
const DOCK_SHARE = '/site-dock-share-runtime-v1.js?v=20260825-language-runtime-compat-v31';
const CORE_SERVICE_DOCK = '/site-core-service-dock-closure-v1.js?v=20260825-language-runtime-compat-v101';
const LANGUAGE_SRC = '/site-global-language-v3.js?v=20260825-google-translate-on-demand-v1';
const MARKER = 'data-qily-google-translate-direct="on-demand-v1"';

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
  next = next.replace(/\s*<script\b[^>]*(?:data-qily-global-language-direct|data-qily-google-translate-direct)=["'][^"']+["'][^>]*><\/script>\s*/gi, '\n');
  next = next.replace(/\/site-global-language-v3\.js(?:\?v=[^"']*)?/g, LANGUAGE_SRC);
  const tag = `<script defer ${MARKER} src="${LANGUAGE_SRC}"></script>`;
  if (/<\/head>/i.test(next)) next = next.replace(/<\/head>/i, `${tag}\n</head>`);
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
  throw new Error(`Chinese-default Google Translate on-demand materialization stale: ${changed.slice(0, 30).join(', ')}${changed.length > 30 ? ` … +${changed.length - 30}` : ''}`);
}

process.stdout.write(`Chinese-default Google Translate on-demand ${checkOnly ? 'check passed' : 'materialized'}: ${changed.length} tracked HTML file(s).\n`);
