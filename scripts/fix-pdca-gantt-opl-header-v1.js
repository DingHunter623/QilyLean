#!/usr/bin/env node
'use strict';

const fs = require('fs');
const file = 'knowledge/pdca-gantt-milestone-opl.html';
let html = fs.readFileSync(file, 'utf8');

const oldBrandCss = '.opl-brand{font-size:20px;font-weight:950;color:var(--opl-teal);text-decoration:none}';
const newBrandCss = '.opl-brand{display:inline-flex;align-items:center;text-decoration:none;flex:0 0 auto}.opl-brand img{display:block;width:auto;height:36px;max-width:min(300px,48vw)}';
if (!html.includes(oldBrandCss) && !html.includes(newBrandCss)) {
  throw new Error('OPL brand CSS anchor not found');
}
html = html.replace(oldBrandCss, newBrandCss);

const oldSecondaryCss = '.opl-btn.secondary{background:transparent;color:#fff}';
const newSecondaryCss = '.opl-btn.secondary{background:rgba(6,49,58,.24)!important;color:#fff!important;-webkit-text-fill-color:#fff!important;border-color:rgba(255,255,255,.58)!important}.opl-btn.secondary:visited,.opl-btn.secondary:hover,.opl-btn.secondary:focus-visible{color:#fff!important;-webkit-text-fill-color:#fff!important}';
if (!html.includes(oldSecondaryCss) && !html.includes(newSecondaryCss)) {
  throw new Error('OPL secondary button CSS anchor not found');
}
html = html.replace(oldSecondaryCss, newSecondaryCss);

const oldBrandHtml = '<a class="opl-brand" href="/">QilyLean｜启力精益</a>';
const newBrandHtml = '<a class="opl-brand" href="/" aria-label="QilyLean｜启力精益"><img src="/assets/brand/qilylean-logo.svg" alt="QilyLean｜启力精益"></a>';
if (!html.includes(oldBrandHtml) && !html.includes(newBrandHtml)) {
  throw new Error('OPL brand HTML anchor not found');
}
html = html.replace(oldBrandHtml, newBrandHtml);

fs.writeFileSync(file, html, 'utf8');

const out = fs.readFileSync(file, 'utf8');
const required = [
  '/assets/brand/qilylean-logo.svg',
  'height:36px',
  '-webkit-text-fill-color:#fff!important',
  'opl-btn secondary'
];
for (const token of required) {
  if (!out.includes(token)) throw new Error('Missing expected token: ' + token);
}
console.log('PASS: PDCA Gantt OPL now uses official website logo and white text on dark secondary CTA.');
