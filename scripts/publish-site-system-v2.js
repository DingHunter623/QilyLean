#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const navigationFile = path.join(root, 'site-navigation.js');
const wideLayoutFile = path.join(root, 'site-wide-layout-v1.css');
const typographyFile = path.join(root, 'site-typography-v1.css');

const NAV_VERSION = '20260728-layout-type-v2';
const ASSET_VERSION = '20260728-layout-type-v2';
const WIDE_VERSION = '20260728-balanced-layout-v3';
const TYPE_VERSION = '20260728-type-system-v2';

function read(file) { return fs.readFileSync(file, 'utf8'); }
function write(file, content) { fs.writeFileSync(file, content, 'utf8'); }

function validatePublicStyles() {
  const wide = read(wideLayoutFile);
  const type = read(typographyFile);
  const wideMarkers = [
    '--qily-wide-content:1480px',
    '.section>.section-inner',
    'main.main:has(>.chat)>.chat',
    '.paper-grid'
  ];
  const typeMarkers = [
    '--qily-type-nav-1:17px',
    '--qily-type-nav-2:16px',
    '--qily-type-nav-3:15px',
    '--qily-type-body:18.5px',
    '.paper-card h3',
    '.answer-content h2',
    '.composer textarea'
  ];
  for (const marker of wideMarkers) {
    if (!wide.includes(marker)) throw new Error(`Wide-layout marker missing: ${marker}`);
  }
  for (const marker of typeMarkers) {
    if (!type.includes(marker)) throw new Error(`Typography marker missing: ${marker}`);
  }
}

function publishNavigation() {
  let page = read(navigationFile);
  page = page
    .replace(/window\.__qilyLeanSiteNavigation(?:V\d+|PublicV\d+)/g, 'window.__qilyLeanSiteNavigationPublicV5')
    .replace(/var SHARED_ASSET_VERSION = '[^']*';/, `var SHARED_ASSET_VERSION = '${ASSET_VERSION}';`)
    .replace(/var VISUAL_SCALE_VERSION = '[^']*';/, `var VISUAL_SCALE_VERSION = '${ASSET_VERSION}';`)
    .replace(/site-wide-layout-v1\.css\?v=[^'"\s]+/g, `site-wide-layout-v1.css?v=${WIDE_VERSION}`)
    .replace(/site-typography-v1\.css\?v=[^'"\s]+/g, `site-typography-v1.css?v=${TYPE_VERSION}`);

  if (!page.includes(`site-wide-layout-v1.css?v=${WIDE_VERSION}`)) {
    throw new Error('Wide-layout cache version was not published');
  }
  if (!page.includes(`site-typography-v1.css?v=${TYPE_VERSION}`)) {
    throw new Error('Typography cache version was not published');
  }
  if (!page.includes('addWideLayoutStylesheet();') || !page.includes('addTypographyStylesheet();')) {
    throw new Error('Public style loaders are incomplete');
  }
  write(navigationFile, page);
}

function walk(directory, callback) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full, callback);
    else callback(full);
  }
}

function refreshHtmlReferences() {
  let changed = 0;
  walk(root, (file) => {
    if (!file.endsWith('.html')) return;
    const before = read(file);
    const after = before.replace(/site-navigation\.js\?v=[^"']+/g, `site-navigation.js?v=${NAV_VERSION}`);
    if (after !== before) {
      write(file, after);
      changed += 1;
    }
  });
  return changed;
}

function main() {
  validatePublicStyles();
  publishNavigation();
  const refreshed = refreshHtmlReferences();
  process.stdout.write(`Published balanced 1480px layout and typography hierarchy; refreshed ${refreshed} HTML files.\n`);
}

main();
