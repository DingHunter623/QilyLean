#!/usr/bin/env node
'use strict';

/*
 * QilyLean C919 Digital Flagship Hero V1
 * 官网视觉升级主版本标识
 *
 * 目标：
 * - C919作为首页首屏第一视觉
 * - 承载QilyLean六大业务能力体系
 * - 品牌文案作为辅助层，不抢主视觉
 */

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const target = path.join(root, 'index.html');
let html = fs.readFileSync(target, 'utf8');

const start = '<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V1:START -->';
const end = '<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V1:END -->';

const hero = `${start}
<section class="qily-c919-digital-flagship-hero" aria-label="QilyLean C919 Digital Flagship Hero V1">
  <img src="/qilylean/c919-strategy-hero-v10.svg" alt="QilyLean C919 Digital Flagship Hero V1" loading="eager">
</section>
${end}`;

html = html.replace(/\n?<!-- QILY-C919-STRATEGY-HERO:START -->[\s\S]*?<!-- QILY-C919-STRATEGY-HERO:END -->\n?/gi, '\n');
html = html.replace(/\n?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V1:START -->[\s\S]*?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V1:END -->\n?/gi, '\n');

if (html.includes('</main>')) {
  html = html.replace('</main>', `${hero}\n</main>`);
}

fs.writeFileSync(target, html.endsWith('\n') ? html : html + '\n', 'utf8');
console.log('QilyLean C919 Digital Flagship Hero V1 enabled.');
