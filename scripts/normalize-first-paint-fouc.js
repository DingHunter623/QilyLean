#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const version = '20260805-first-paint-v1';
const startMarker = '<!-- QILY-FIRST-PAINT-GUARD:START -->';
const endMarker = '<!-- QILY-FIRST-PAINT-GUARD:END -->';
const guard = `${startMarker}\n<style id="qilyCriticalFirstPaintGuard">html.qily-first-paint-pending{min-height:100%;background:#eef7f5}html.qily-first-paint-pending body{visibility:hidden!important}</style><script data-qily-first-paint-guard>(function(d,w){var e=d.documentElement;e.classList.add('qily-first-paint-pending','qily-shell-pending');var done=false;w.__qilyLeanRevealCurrentShell=function(){if(done)return;done=true;e.classList.remove('qily-first-paint-pending','qily-shell-pending')};w.setTimeout(w.__qilyLeanRevealCurrentShell,5000)})(document,window);</script>\n${endMarker}`;

const pagePaths = ['index.html', 'cooperation/index.html'];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function write(relativePath, content) {
  fs.writeFileSync(path.join(root, relativePath), content, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function injectFirstPaintGuard(source, relativePath) {
  const markerExpression = /<!-- QILY-FIRST-PAINT-GUARD:START -->[\s\S]*?<!-- QILY-FIRST-PAINT-GUARD:END -->\s*/g;
  const oldBootstrapExpression = /<script\s+data-qily-shell-bootstrap>[\s\S]*?<\/script>\s*/g;
  let next = source.replace(markerExpression, '').replace(oldBootstrapExpression, '');
  assert(next.includes('<head>'), `${relativePath}: missing <head>`);
  next = next.replace('<head>', `<head>\n${guard}`);
  next = next.replace(/\/site-navigation\.js\?v=[^'"\s<]+/g, `/site-navigation.js?v=${version}`);
  return next;
}

function normalizeLegacyRuntime(source) {
  const eagerBlock = `  repairOnboardingLink();\n  publishCooperationPricing();\n  publishDetailPricing();\n\n`;
  let next = source.replace(eagerBlock, '');

  const oldExisting = `  var existing = document.getElementById('qilySiteNavigationCoreScript');\n  if (existing) {\n    existing.addEventListener('load', function () { applyFixes(); observeShell(); }, { once: true });\n    return;\n  }`;
  const newExisting = `  var existing = document.getElementById('qilySiteNavigationCoreScript');\n  if (existing) {\n    if (window.__qilyLeanSiteNavigationPublicV8) {\n      applyFixes();\n      observeShell();\n    } else {\n      existing.addEventListener('load', function () { applyFixes(); observeShell(); }, { once: true });\n    }\n    return;\n  }`;

  if (next.includes(oldExisting)) next = next.replace(oldExisting, newExisting);
  else assert(next.includes(newExisting), 'site-navigation-legacy-20260802.js: existing-core deferral block missing');

  return next;
}

function normalizeNavigationWrapper(source) {
  const next = source.replace(
    /\/site-navigation-legacy-20260802\.js\?v=[^'"\s]+/g,
    `/site-navigation-legacy-20260802.js?v=${version}`
  );
  assert(next.includes(`/site-navigation-legacy-20260802.js?v=${version}`), 'site-navigation.js: legacy cache version not updated');
  return next;
}

const outputs = new Map();
for (const relativePath of pagePaths) outputs.set(relativePath, injectFirstPaintGuard(read(relativePath), relativePath));
outputs.set('site-navigation-legacy-20260802.js', normalizeLegacyRuntime(read('site-navigation-legacy-20260802.js')));
outputs.set('site-navigation.js', normalizeNavigationWrapper(read('site-navigation.js')));

for (const relativePath of pagePaths) {
  const content = outputs.get(relativePath);
  const headPosition = content.indexOf('<head>');
  const guardPosition = content.indexOf(startMarker);
  const metaPosition = content.indexOf('<meta charset=');
  const firstExternalStyle = content.search(/<link[^>]+rel=["']stylesheet["']/i);
  assert(guardPosition > headPosition, `${relativePath}: guard must be inside head`);
  assert(metaPosition > guardPosition, `${relativePath}: guard must execute before metadata and external assets`);
  assert(firstExternalStyle === -1 || guardPosition < firstExternalStyle, `${relativePath}: guard must precede external stylesheets`);
  assert((content.match(/QILY-FIRST-PAINT-GUARD:START/g) || []).length === 1, `${relativePath}: duplicate first-paint guard`);
  assert(!content.includes('data-qily-shell-bootstrap'), `${relativePath}: legacy late bootstrap remains`);
  assert(content.includes(`/site-navigation.js?v=${version}`), `${relativePath}: navigation cache version not updated`);
}

const legacy = outputs.get('site-navigation-legacy-20260802.js');
const existingPosition = legacy.indexOf("var existing = document.getElementById('qilySiteNavigationCoreScript')");
const eagerTail = legacy.slice(legacy.indexOf('function observeShell()'), existingPosition);
assert(!eagerTail.includes('publishCooperationPricing();'), 'legacy runtime: cooperation pricing still injected before shell core');
assert(!eagerTail.includes('publishDetailPricing();'), 'legacy runtime: detail pricing still injected before shell core');
assert(legacy.includes('if (window.__qilyLeanSiteNavigationPublicV8)'), 'legacy runtime: already-loaded core handling missing');

const changed = [];
for (const [relativePath, content] of outputs.entries()) {
  if (read(relativePath) !== content) changed.push(relativePath);
}

if (checkOnly) {
  if (changed.length) throw new Error(`First-paint FOUC protection is not materialized: ${changed.join(', ')}`);
  process.stdout.write('First-paint FOUC contract passed; no changes required.\n');
  process.exit(0);
}

for (const relativePath of changed) write(relativePath, outputs.get(relativePath));
process.stdout.write(`First-paint FOUC protection updated ${changed.length} file(s): ${changed.join(', ') || 'none'}.\n`);
