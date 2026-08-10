#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dailyRoot = path.join(root, 'qilylean');
const dailyDir = path.join(dailyRoot, 'daily');
const navigationVersion = '20260810-native-navigation-stable-v19';
const visualStyleVersion = '20260804-sitewide-clarity-v2';
const visualScriptVersion = '20260810-stable-layout-v5';
const boundaryVersion = '20260803-boundary-links-v2';

const assets = [
  `  <link id="qilyVisualClosureStylesheet" rel="stylesheet" href="/site-visual-closure-v1.css?v=${visualStyleVersion}">`,
  `  <link id="qilyBoundaryLinksClosureStylesheet" rel="stylesheet" href="/site-visual-closure-v2.css?v=${boundaryVersion}">`,
  `  <script defer data-qily-visual-closure-loader="v1" src="/site-visual-closure-v1.js?v=${visualScriptVersion}"></script>`,
  `  <script defer data-qily-boundary-links-loader="v2" src="/site-visual-closure-v2.js?v=${boundaryVersion}"></script>`,
  `  <script defer src="/site-navigation.js?v=${navigationVersion}"></script>`
].join('\n');

function normalize(file) {
  let html = fs.readFileSync(file, 'utf8');
  if (!/<\/head>/i.test(html)) return false;

  const before = html;
  html = html
    .replace(/\s*<link\b[^>]*id=["']qilyVisualClosureStylesheet["'][^>]*>\s*/gi, '\n')
    .replace(/\s*<link\b[^>]*id=["']qilyBoundaryLinksClosureStylesheet["'][^>]*>\s*/gi, '\n')
    .replace(/\s*<script\b[^>]*data-qily-visual-closure-loader=["'][^"']+["'][^>]*>[\s\S]*?<\/script>\s*/gi, '\n')
    .replace(/\s*<script\b[^>]*data-qily-boundary-links-loader=["'][^"']+["'][^>]*>[\s\S]*?<\/script>\s*/gi, '\n')
    .replace(/\s*<script\b[^>]*src=["'][^"']*\/site-navigation\.js\?v=[^"']+["'][^>]*>[\s\S]*?<\/script>\s*/gi, '\n')
    .replace(/<\/head>/i, `${assets}\n</head>`);

  if (html === before) return false;
  fs.writeFileSync(file, html.endsWith('\n') ? html : `${html}\n`, 'utf8');
  return true;
}

function files() {
  const output = [path.join(dailyRoot, 'daily-insights.html')];
  if (fs.existsSync(dailyDir)) {
    for (const name of fs.readdirSync(dailyDir)) {
      if (/^\d{4}-\d{2}-\d{2}\.html$/.test(name)) output.push(path.join(dailyDir, name));
    }
  }
  return output.filter(fs.existsSync);
}

let changed = 0;
const failures = [];
const targets = files();
for (const file of targets) {
  if (normalize(file)) changed += 1;
  const html = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file);
  if (!html.includes(`/site-navigation.js?v=${navigationVersion}`)) failures.push(`${relative}: navigation`);
  if (!html.includes(`site-visual-closure-v1.css?v=${visualStyleVersion}`)) failures.push(`${relative}: closure-v1-css`);
  if (!html.includes(`site-visual-closure-v2.css?v=${boundaryVersion}`)) failures.push(`${relative}: closure-v2-css`);
  if (!html.includes(`site-visual-closure-v1.js?v=${visualScriptVersion}`)) failures.push(`${relative}: closure-v1-js`);
  if (!html.includes(`site-visual-closure-v2.js?v=${boundaryVersion}`)) failures.push(`${relative}: closure-v2-js`);
}

if (failures.length) throw new Error(`Daily visual closure incomplete: ${failures.slice(0, 30).join(', ')}`);
process.stdout.write(`Normalized ${targets.length} daily pages to current visual closure; changed ${changed}.\n`);
