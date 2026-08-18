#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const target = path.join(root, 'index.html');
const IMAGE = '/qilylean/c919-strategy-hero-approved-20260818.png';
const PUBLIC = 'https://qilylean.com/qilylean/c919-strategy-hero-approved-20260818.png';
let html = fs.readFileSync(target, 'utf8');

// Temporary homepage policy (2026-08-18): do not display the C919 strategic hero
// until the aircraft model is optimized and explicitly approved again.
// Keep the approved image asset in the repository for future reuse.

// Remove the complete C919 visual + overview block from the homepage.
html = html.replace(/\n?<!-- QILY-C919-STRATEGY-HERO:START -->[\s\S]*?<!-- QILY-C919-STRATEGY-HERO:END -->\n?/gi, '\n');

// Remove page-local C919 styling because the module is intentionally offline.
html = html.replace(/\n?<!-- QILY-C919-HERO-STYLES:START -->[\s\S]*?<!-- QILY-C919-HERO-STYLES:END -->\n?/gi, '\n');

// Do not preload a homepage image that is not displayed.
html = html.replace(/\s*<link[^>]+rel=["']preload["'][^>]+href=["'][^"']*c919-strategy-hero[^"']*["'][^>]*>\s*/gi, '\n');

// Remove C919-specific social-image metadata while the visual is temporarily withdrawn.
html = html.replace(/\s*<meta\s+property=["']og:image["'][^>]*content=["'][^"']*c919-strategy-hero[^"']*["'][^>]*>\s*/gi, '\n');
html = html.replace(/\s*<meta\s+name=["']twitter:image["'][^>]*content=["'][^"']*c919-strategy-hero[^"']*["'][^>]*>\s*/gi, '\n');

// Defensive cleanup for any accidental direct homepage reference to the archived asset.
html = html.replace(new RegExp(`<img\\b[^>]*src=["']${IMAGE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'gi'), '');
html = html.replace(new RegExp(`<meta\\b[^>]*content=["']${PUBLIC.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'gi'), '');

// Normalize excessive blank lines caused by removing the temporary module.
html = html.replace(/\n{4,}/g, '\n\n\n');
fs.writeFileSync(target, html.endsWith('\n') ? html : html + '\n', 'utf8');
console.log('C919 homepage hero temporarily suppressed; approved aircraft asset retained for later optimization.');
