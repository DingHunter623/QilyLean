#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const versions = {
  navigation: '/site-navigation.js?v=20260824-contact-readable-v41',
  governance: '/site-visual-governance-v2.css?v=20260824-readable-floor-plus2-v7',
  firstPaintBuild: '20260824-readable-floor-plus2-v4',
  contentAxis: '/site-content-axis-v1.css?v=20260822-sitewide-visual-axis-v5',
  consistency: '/site-ui-consistency-v1.js?v=20260822-dock-back-label-v13',
  dockOrder: '/site-dock-share-runtime-v1.js?v=20260822-dock-back-label-v3'
};

function trackedHtml() {
  return execFileSync('git', ['ls-files', '*.html'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024
  }).split(/\r?\n/).filter(Boolean);
}

function publish(source) {
  let next = source;
  next = next.replace(/\/site-navigation\.js(?:\?v=[^"']*)?/g, versions.navigation);
  next = next.replace(/\/site-visual-governance-v2\.css(?:\?v=[^"']*)?/g, versions.governance);
  next = next.replace(/(data-qily-r2-first-paint[^>]*>\s*\(function\([^)]*\)\{[\s\S]{0,180}?\bBUILD=)'[^']+'/gi, `$1'${versions.firstPaintBuild}'`);
  next = next.replace(/\/site-content-axis-v1\.css(?:\?v=[^"']*)?/g, versions.contentAxis);
  next = next.replace(/\/site-ui-consistency-v1\.js(?:\?v=[^"']*)?/g, versions.consistency);
  next = next.replace(/\/site-dock-share-runtime-v1\.js(?:\?v=[^"']*)?/g, versions.dockOrder);
  next = next.replace(/\s*<script\b[^>]*data-qily-dock-firstpaint-lock=["'][^"']+["'][^>]*>[\s\S]*?<\/script>\s*/gi, '\n');
  return next;
}

const changed = [];
for (const relative of trackedHtml()) {
  const target = path.join(root, relative);
  const source = fs.readFileSync(target, 'utf8');
  const next = publish(source);
  if (next === source) continue;
  changed.push(relative);
  if (!checkOnly) fs.writeFileSync(target, next, 'utf8');
}

if (checkOnly && changed.length) {
  throw new Error(`Site-wide remediation publication is stale: ${changed.slice(0, 20).join(', ')}`);
}

process.stdout.write(`Site-wide remediation ${checkOnly ? 'check passed' : 'updated'}: ${changed.length} tracked HTML file(s).\n`);
