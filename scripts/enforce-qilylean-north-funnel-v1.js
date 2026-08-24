#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const DIAG_URL = '/north/diagnosis/';
const DIAG_LINK = '<a href="/north/diagnosis/">工厂改善快速诊断</a>';

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function write(rel, content) {
  const file = path.join(ROOT, rel);
  const normalized = content.endsWith('\n') ? content : content + '\n';
  if (fs.readFileSync(file, 'utf8') === normalized) return false;
  fs.writeFileSync(file, normalized, 'utf8');
  console.log(`funnel materialized ${rel}`);
  return true;
}

function addToFirstActions(rel) {
  let html = read(rel);
  if (html.includes(`href="${DIAG_URL}"`)) return false;
  const marker = '<div class="qily-north-actions">';
  const at = html.indexOf(marker);
  if (at < 0) throw new Error(`actions marker missing in ${rel}`);
  const insertAt = at + marker.length;
  html = html.slice(0, insertAt) + DIAG_LINK + html.slice(insertAt);
  return write(rel, html);
}

function patchHome() {
  const rel = 'index.html';
  let html = read(rel);
  const northAt = html.indexOf('<!-- QILY-NORTH-HOME-V1:START -->');
  if (northAt < 0) throw new Error('QILY NORTH home section missing');
  const northEnd = html.indexOf('<!-- QILY-NORTH-HOME-V1:END -->', northAt);
  if (northEnd < 0) throw new Error('QILY NORTH home end marker missing');
  const block = html.slice(northAt, northEnd);
  if (block.includes(`href="${DIAG_URL}"`)) return false;
  const marker = '<div class="qily-north-actions">';
  const localAt = block.indexOf(marker);
  if (localAt < 0) throw new Error('QILY NORTH home actions missing');
  const absoluteAt = northAt + localAt + marker.length;
  html = html.slice(0, absoluteAt) + DIAG_LINK + html.slice(absoluteAt);
  return write(rel, html);
}

function patchSitemap() {
  const rel = 'sitemap.xml';
  let xml = read(rel);
  const canonical = 'https://qilylean.com/north/diagnosis/';
  if (xml.includes(`<loc>${canonical}</loc>`)) return false;
  const row = `  <url><loc>${canonical}</loc><lastmod>2026-08-24</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`;
  if (!xml.includes('</urlset>')) throw new Error('sitemap closing tag missing');
  xml = xml.replace('</urlset>', `${row}\n</urlset>`);
  return write(rel, xml);
}

function verify() {
  const files = [
    'index.html',
    'north/index.html',
    'north/inner-mongolia/index.html',
    'north/shaanxi/index.html',
    'north/ningxia/index.html',
    'north/gansu/index.html'
  ];
  files.forEach((rel) => {
    if (!read(rel).includes(`href="${DIAG_URL}"`)) throw new Error(`diagnosis funnel link missing in ${rel}`);
  });
  const diagnosis = read('north/diagnosis/index.html');
  ['data-qily-diagnosis-form', '24项自评', '/scripts/north-factory-diagnosis-v1.js', '/styles/qily-north-diagnosis-v1.css'].forEach((token) => {
    if (!diagnosis.includes(token)) throw new Error(`diagnosis page missing ${token}`);
  });
  if (!read('sitemap.xml').includes('https://qilylean.com/north/diagnosis/')) throw new Error('diagnosis sitemap URL missing');
  console.log('QilyLean NORTH diagnosis funnel verification PASS');
}

patchHome();
['north/index.html', 'north/inner-mongolia/index.html', 'north/shaanxi/index.html', 'north/ningxia/index.html', 'north/gansu/index.html'].forEach(addToFirstActions);
patchSitemap();
verify();
