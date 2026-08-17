#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'enforce-c919-home-hero.js');
let s = fs.readFileSync(file, 'utf8');

s = s.replace("const IMAGE = '/qilylean/c919-strategy-hero-v10.svg';", "const IMAGE = '/qilylean/c919-strategy-hero-v11.png';");
s = s.replace('type="image/svg+xml" fetchpriority="high">`;', 'type="image/png" fetchpriority="high">`;');
s = s.replace("setMeta('og:image','https://qilylean.com/qilylean/c919-strategy-hero.png');", "setMeta('og:image','https://qilylean.com/qilylean/c919-strategy-hero-v11.png');");
s = s.replace("setMeta('twitter:image','https://qilylean.com/qilylean/c919-strategy-hero.png','name');", "setMeta('twitter:image','https://qilylean.com/qilylean/c919-strategy-hero-v11.png','name');");
s = s.replace('official QilyLean logo and exact Q icon patches locked in v10 asset.', 'official QilyLean logo and exact Q icon patches baked into standalone v11 PNG.');

if (!s.includes("const IMAGE = '/qilylean/c919-strategy-hero-v11.png';")) {
  throw new Error('Unable to migrate C919 enforcer to v11 standalone PNG');
}
fs.writeFileSync(file, s, 'utf8');
console.log('C919 enforcer migrated to standalone v11 PNG.');
