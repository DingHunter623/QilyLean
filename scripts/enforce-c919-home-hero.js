#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const target = path.join(root, 'index.html');
let html = fs.readFileSync(target, 'utf8');

// C919 strategic flight map is intentionally OFFLINE until the aircraft model is optimized and approved again.
// Keep the artwork files in the repository for future reuse, but remove all homepage rendering hooks.
html = html.replace(/\n?<!-- QILY-C919-STRATEGY-HERO:START -->[\s\S]*?<!-- QILY-C919-STRATEGY-HERO:END -->\n?/gi, '\n');
html = html.replace(/\n?<!-- QILY-C919-HERO-STYLES:START -->[\s\S]*?<!-- QILY-C919-HERO-STYLES:END -->\n?/gi, '\n');
html = html.replace(/\s*<link[^>]+rel=["']preload["'][^>]+href=["'][^"']*c919-strategy-hero[^"']*["'][^>]*>\s*/gi, '\n');
html = html.replace(/\s*<meta\s+property=["']og:image["'][^>]*content=["'][^"']*c919-strategy-hero[^"']*["'][^>]*>\s*/gi, '\n');
html = html.replace(/\s*<meta\s+name=["']twitter:image["'][^>]*content=["'][^"']*c919-strategy-hero[^"']*["'][^>]*>\s*/gi, '\n');
html = html.replace(/\n{4,}/g, '\n\n\n');

fs.writeFileSync(target, html.endsWith('\n') ? html : html + '\n', 'utf8');
console.log('C919 homepage head-position model and overview are intentionally offline; artwork files retained for future optimized release.');
