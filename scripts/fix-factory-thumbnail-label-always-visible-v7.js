#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pagePath = path.join(root, 'projects', 'factory-layout', 'index.html');
const viewerPath = path.join(root, 'projects', 'factory-plan-viewer.js');
const projectCssPath = path.join(root, 'projects', 'project-pages.css');
const cssHref = '/projects/factory-layout/factory-thumbnail-label-v7.css?v=20260813-always-visible-v7';

function patchPage() {
  let html = fs.readFileSync(pagePath, 'utf8');

  // Replace only direct thumbnail labels. This intentionally breaks dependency on historical span rules.
  html = html.replace(
    /(<button\b[^>]*class="[^"]*factory-plan-preview[^"]*"[^>]*>[\s\S]*?<img\b[^>]*>)(<span>)([^<]+)(<\/span>)(<\/button>)/g,
    (all, before, _open, label, _close, end) => `${before}<div class="factory-plan-label-v7" aria-hidden="true">${label.trim()}</div>${end}`
  );

  // Remove previous V6 inline hard-stop block; V7 is a real dedicated stylesheet and markup contract.
  html = html.replace(/\n?<!-- QILY-FACTORY-THUMB-CONTRAST-V6:START -->[\s\S]*?<!-- QILY-FACTORY-THUMB-CONTRAST-V6:END -->\n?/g, '\n');

  // Ensure V7 loads last in head, after all historical/public stylesheets.
  html = html.replace(new RegExp(`\\n?<link[^>]+factory-thumbnail-label-v7\\.css[^>]*>\\n?`, 'g'), '\n');
  if (!html.includes('</head>')) throw new Error('factory page </head> missing');
  html = html.replace('</head>', `<link id="qilyFactoryThumbnailLabelV7Stylesheet" rel="stylesheet" href="${cssHref}">\n</head>`);

  const labels = Array.from(html.matchAll(/class="factory-plan-label-v7"[^>]*>([^<]+)<\/div>/g)).map((m) => m[1].trim());
  const expected = ['1F｜方案1','1F｜方案2','2F｜功能布局','3F｜功能布局','2#｜1F','2#｜2F','2#｜3F','2#｜3F','4#｜1F'];
  for (const label of expected) {
    if (!labels.includes(label)) throw new Error(`V7 label missing: ${label}`);
  }
  if (html.includes('<span>1F｜方案1</span>')) throw new Error('legacy span label still present');
  if (!html.includes(cssHref)) throw new Error('V7 stylesheet link missing');

  fs.writeFileSync(pagePath, html, 'utf8');
  console.log(`Factory page upgraded to V7 always-visible labels: ${labels.length} labels.`);
}

function patchViewer() {
  let js = fs.readFileSync(viewerPath, 'utf8');
  const old = "trigger.setAttribute('title','点击进入站内图纸预览');";
  const replacement = "trigger.removeAttribute('title');\n    trigger.setAttribute('data-qily-preview-hint','站内图纸预览');";
  if (js.includes(old)) js = js.replace(old, replacement);
  if (js.includes("setAttribute('title','点击进入站内图纸预览')")) throw new Error('hover tooltip dependency still present');
  fs.writeFileSync(viewerPath, js, 'utf8');
  console.log('Factory viewer tooltip dependency removed; aria-label remains the accessible name.');
}

function patchProjectCss() {
  let css = fs.readFileSync(projectCssPath, 'utf8');
  // Legacy span fallback must also remain readable if an older/generated page survives.
  css = css.replace(
    /.factory-plan-thumb-grid \.factory-plan-preview:active span\{[\s\S]*?\}/,
    `.factory-plan-thumb-grid .factory-plan-preview:active span{\n  color:#073c47!important;\n  -webkit-text-fill-color:#073c47!important;\n  background:#ffeab3!important;\n  border-color:#c99a3e!important;\n}`
  );
  fs.writeFileSync(projectCssPath, css, 'utf8');
  console.log('Legacy span active-state fallback upgraded to high contrast.');
}

patchPage();
patchViewer();
patchProjectCss();

const finalPage = fs.readFileSync(pagePath, 'utf8');
const finalCss = fs.readFileSync(path.join(root, 'projects', 'factory-layout', 'factory-thumbnail-label-v7.css'), 'utf8');
const finalViewer = fs.readFileSync(viewerPath, 'utf8');
const required = [
  'factory-plan-label-v7',
  'font-size:13px!important',
  'background:#f7fbfa!important',
  'color:#073c47!important',
  'border-top:2px solid #c99a3e!important'
];
for (const token of required) {
  if (!(finalPage + finalCss).includes(token)) throw new Error(`VI-17 token missing: ${token}`);
}
if (finalViewer.includes("setAttribute('title','点击进入站内图纸预览')")) throw new Error('title tooltip still used as primary hint');
console.log('VI-17 PASS: labels are default-visible and hover-independent.');
