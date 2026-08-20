#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const target = path.join(root, 'index.html');
let html = fs.readFileSync(target, 'utf8');

const start = '<!-- QILY-C919-STRATEGY-HERO:START -->';
const end = '<!-- QILY-C919-STRATEGY-HERO:END -->';

const hero = `${start}
<section class="qily-c919-strategy-hero" aria-label="QilyLean C919战略视觉">
  <img src="/qilylean/c919-strategy-hero-v10.svg" alt="QilyLean C919战略飞机模型" loading="eager">
</section>
${end}`;

html = html.replace(/\n?<!-- QILY-C919-STRATEGY-HERO:START -->[\s\S]*?<!-- QILY-C919-STRATEGY-HERO:END -->\n?/gi, '\n');

if (html.includes('</section>')) {
  html = html.replace('</main>', `${hero}\n</main>`);
}

fs.writeFileSync(target, html.endsWith('\n') ? html : html + '\n', 'utf8');
console.log('C919 strategic hero enabled.');
