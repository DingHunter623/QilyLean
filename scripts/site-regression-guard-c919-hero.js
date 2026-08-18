#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
const image = path.join(root,'qilylean','c919-strategy-hero-v13.png');
const rel = '/qilylean/c919-strategy-hero-v13.png';
const pub = 'https://qilylean.com/qilylean/c919-strategy-hero-v13.png';
const expectedSha256 = '220e893d9db3dedaa7f4c95e57ef30e8af522c9bfcea0da19f4506f496fc306a';
const expectedSize = 2275175;
function assert(ok,msg){ if(!ok) throw new Error(msg); }

assert(fs.existsSync(image),'Approved C919 v13 PNG is missing');
const buf = fs.readFileSync(image);
assert(buf.length===expectedSize,`Approved C919 v13 PNG size changed: ${buf.length}`);
const actualSha256 = crypto.createHash('sha256').update(buf).digest('hex');
assert(actualSha256===expectedSha256,`Approved C919 v13 PNG SHA256 mismatch: ${actualSha256}`);
assert(buf.subarray(0,8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])),'Approved C919 v13 asset is not PNG');
const width = buf.readUInt32BE(16), height = buf.readUInt32BE(20);
assert(width===1693 && height===929,`Approved C919 v13 dimensions changed: ${width}x${height}`);

const start = html.indexOf('<!-- QILY-C919-STRATEGY-HERO:START -->');
const end = html.indexOf('<!-- QILY-C919-STRATEGY-HERO:END -->');
const oldHero = html.indexOf('<section class="hero">');
assert(start>=0 && end>start,'C919 homepage hero markers missing');
assert(oldHero<0 || start<oldHero,'C919 strategic flight map is not the homepage head-position module');
const hero = html.slice(start,end);
assert(hero.includes(`${rel}?v=20260818-v13-approved`),'C919 v13 image path missing from homepage hero');
assert(hero.includes('数智化业务翼｜6 → 5 → 4'),'Digital-wing 6→5→4 order missing');
assert(hero.includes('官网建设 → APP软件开发 → 数字化工厂'),'Digital-wing business sequence drifted');
assert(hero.includes('制造／精益工程翼｜1 → 2 → 3'),'Manufacturing-wing 1→2→3 order missing');
assert(hero.includes('职能技术决定“动力”'),'Technology-as-energy strategic thesis missing');
assert(html.includes(`href="${rel}?v=20260818-v13-approved"`),'C919 v13 preload missing');
assert(html.includes(`content="${pub}"`),'C919 v13 social image metadata missing');
assert(html.includes('<!-- QILY-C919-HERO-STYLES:START -->') && html.includes('<!-- QILY-C919-HERO-STYLES:END -->'),'C919 v13 styles missing');
console.log(`C919 v13 homepage guard passed: head position, 6→5→4 digital wing, ${buf.length} bytes, SHA256 ${actualSha256}.`);
