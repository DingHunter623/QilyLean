#!/usr/bin/env node
'use strict';

/*
 * QilyLean C919 Digital Flagship Hero V2
 * Homepage first visual entry replacement
 *
 * Rules:
 * - C919 is the homepage first visual element
 * - Preserve existing homepage business content
 * - Remove old hero insertion conflicts
 * - Keep six business themes inside the aircraft visual asset
 */

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const target = path.join(root, 'index.html');
let html = fs.readFileSync(target, 'utf8');

const start = '<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V2:START -->';
const end = '<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V2:END -->';

const hero = `${start}
<section class="qily-c919-digital-flagship-hero" aria-label="QilyLean Digital Flagship Hero">
  <img src="/qilylean/c919-strategy-hero-v12.webp" alt="QilyLean C919 Digital Flagship Hero" loading="eager" fetchpriority="high">
</section>
${end}`;

html = html.replace(/\n?<!-- QILY-C919-STRATEGY-HERO:START -->[\s\S]*?<!-- QILY-C919-STRATEGY-HERO:END -->\n?/gi, '\n');
html = html.replace(/\n?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V1:START -->[\s\S]*?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V1:END -->\n?/gi, '\n');
html = html.replace(/\n?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V2:START -->[\s\S]*?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V2:END -->\n?/gi, '\n');

if (!html.includes(start)) {
  html = html.replace(/(<body[^>]*>)/i, `$1\n${hero}`);
}

fs.writeFileSync(target, html.endsWith('\n') ? html : html + '\n', 'utf8');
console.log('QilyLean C919 Digital Flagship Hero V2 enabled as homepage first visual.');
