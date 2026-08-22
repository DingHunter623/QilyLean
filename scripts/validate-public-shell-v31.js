#!/usr/bin/env node
'use strict';

// Compatibility entry point for workflows retained under the historical V31 filename.
// The authoritative contract is Navigation V33 + the six-action Dock remediation.
require('./validate-sitewide-remediation-20260822');
process.exit(0);

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const navigationVersion = '/site-navigation.js?v=20260820-resource-collab-dock-home-v31';
const dockVersion = '/site-floating-dock-standard-v1.css?v=20260819-dock-snapback-v3';
const consistencyVersion = '/site-ui-consistency-v1.js?v=20260820-dock-share-functional-v11';
const shareRuntimeVersion = '/site-dock-share-runtime-v1.js?v=20260820-dock-share-runtime-v1';

function read(relative) { return fs.readFileSync(path.join(root, relative), 'utf8'); }
function assert(condition, message) { if (!condition) throw new Error(message); }
function trackedHtml() {
  return execFileSync('git', ['ls-files', '*.html'], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    .split(/\r?\n/).filter(Boolean);
}

const navigation = read('site-navigation.js');
const core = read('site-navigation-core.js');
const dockCss = read('site-floating-dock-standard-v1.css');

assert(navigation.includes("mode: 'atomic-first-paint-v31'"), 'Navigation wrapper is not V31.');
assert(navigation.includes("dockPositionPersistence: false"), 'Navigation wrapper still permits persisted arbitrary Dock positions.');
assert(navigation.includes("dockAutoHome: 'bottom-right'"), 'Navigation wrapper does not declare bottom-right Dock home.');
assert(core.includes('function setDockFreePosition(left, top)'), 'Dock free-drag implementation is missing.');
assert(core.includes('function snapDockHome()'), 'Dock snapback implementation is missing.');
assert(core.includes('Math.hypot(dx, dy) > 7'), 'Dock drag threshold is missing.');
assert(core.includes("localStorage.removeItem('qilyDockPositionV2')"), 'Legacy Dock position cleanup is missing.');
assert(!core.includes("localStorage.setItem('qilyDockPositionV2'"), 'Dock arbitrary-position persistence returned.');
assert(!core.includes('saveDockPosition()'), 'Retired Dock save-position helper returned.');
assert(core.includes('var url = normalizePublicUrl(location.href);'), 'Current-page share URL is not normalized at its output boundary.');
assert(core.includes("var HOME_URL = 'https://qilylean.com';"), 'Official-site share URL is not canonical.');
assert(dockCss.includes('--qily-dock-font-size:15px') && dockCss.includes('--qily-dock-font-size:14px'), 'Dock desktop/mobile font tokens are incomplete.');

const staleNavigation = [];
const staleDock = [];
const staleMetadata = [];
let navigationPages = 0;
let dockPages = 0;

for (const relative of trackedHtml()) {
  const html = read(relative);
  if (/\/site-navigation\.js(?:\?v=[^"']*)?/.test(html)) {
    navigationPages += 1;
    if (!html.includes(navigationVersion)) staleNavigation.push(relative);
  }
  if (/id=["']floatDock["']|data-action=["']share["']/.test(html)) {
    dockPages += 1;
    const compliant = html.includes('分享<br>官网')
      && !html.includes('qily-share-label-line')
      && html.includes('data-qily-dock-firstpaint-lock="v9"')
      && html.includes(dockVersion)
      && html.includes(consistencyVersion)
      && html.includes(shareRuntimeVersion);
    if (!compliant) staleDock.push(relative);
  }
  const metadataUrls = [
    ...Array.from(html.matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*href=["'](https:\/\/(?:www\.)?qilylean\.com[^"']*)["']/gi), (match) => match[1]),
    ...Array.from(html.matchAll(/<meta\b[^>]*property=["']og:url["'][^>]*content=["'](https:\/\/(?:www\.)?qilylean\.com[^"']*)["']/gi), (match) => match[1])
  ];
  if (metadataUrls.some((url) => url.endsWith('/'))) staleMetadata.push(relative);
}

assert(navigationPages >= 400, `Navigation coverage unexpectedly fell to ${navigationPages} pages.`);
assert(dockPages >= 400, `Dock coverage unexpectedly fell to ${dockPages} pages.`);
assert(staleNavigation.length === 0, `Stale navigation cache pages: ${staleNavigation.slice(0, 12).join(', ')}`);
assert(staleDock.length === 0, `Stale Dock/share pages: ${staleDock.slice(0, 12).join(', ')}`);
assert(staleMetadata.length === 0, `Trailing-slash canonical/OG pages: ${staleMetadata.slice(0, 12).join(', ')}`);

process.stdout.write(`PASS: V31 public shell validated across ${navigationPages} navigation pages and ${dockPages} Dock pages.\n`);
