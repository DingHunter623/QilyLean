#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const target = path.join(root, 'index.html');
const IMAGE = '/qilylean/c919-strategy-hero-approved-20260818.png';
const PUBLIC = 'https://qilylean.com/qilylean/c919-strategy-hero-approved-20260818.png';
let html = fs.readFileSync(target, 'utf8');

// The user-approved 1672x941 PNG is the single source of truth. Never regenerate the aircraft artwork.
html = html.replace(/\/qilylean\/c919-strategy-hero(?:-approved-20260818|-v\d+)?\.(?:png|webp|svg)/gi, IMAGE);
html = html.replace(/https:\/\/qilylean\.com\/qilylean\/c919-strategy-hero(?:-approved-20260818|-v\d+)?\.(?:png|webp|svg)/gi, PUBLIC);

// Force the homepage hero image itself to the exact approved asset.
html = html.replace(/(<!-- QILY-C919-STRATEGY-HERO:START -->[\s\S]*?<img\b[^>]*?src=["'])[^"']+(["'][^>]*>)/i, `$1${IMAGE}$2`);

// Keep intrinsic dimensions fixed to the approved artwork.
html = html.replace(/(<!-- QILY-C919-STRATEGY-HERO:START -->[\s\S]*?<img\b[^>]*?)\swidth=["'][^"']*["']/i, '$1 width="1672"');
html = html.replace(/(<!-- QILY-C919-STRATEGY-HERO:START -->[\s\S]*?<img\b[^>]*?)\sheight=["'][^"']*["']/i, '$1 height="941"');

// Rebuild the preload for PNG so browsers cannot prefer a retired WebP.
html = html.replace(/<link[^>]+rel=["']preload["'][^>]+href=["']\/qilylean\/c919-strategy-hero[^"']+["'][^>]*>\s*/gi, '');
const preload = `<link rel="preload" as="image" href="${IMAGE}" type="image/png" fetchpriority="high">`;
if (/<link rel="canonical"[^>]*>/i.test(html)) {
  html = html.replace(/(<link rel="canonical"[^>]*>)/i, `$1\n${preload}`);
}

function setMeta(property, value, attr='property') {
  const esc = property.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const re = new RegExp(`<meta\\s+${attr}=["']${esc}["'][^>]*>`, 'i');
  const tag = `<meta ${attr}="${property}" content="${value}">`;
  if (re.test(html)) html = html.replace(re, tag);
  else html = html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}
setMeta('og:image', PUBLIC);
setMeta('twitter:image', PUBLIC, 'name');

fs.writeFileSync(target, html.endsWith('\n') ? html : html + '\n', 'utf8');
console.log('C919 homepage hero enforced: exact user-approved 1672x941 PNG is the sole homepage artwork source.');
