#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'styles','qily-aircraft-brand-hero-v1.css'),'utf8');
const asset=path.join(root,'assets','qilylean-aircraft-hero-approved-20260826.png');
function assert(ok,msg){if(!ok)throw new Error(msg)}
const b=fs.readFileSync(asset);
const start='<!-- QILY-AIRCRAFT-BRAND-HERO-V1:START -->';
const end='<!-- QILY-AIRCRAFT-BRAND-HERO-V1:END -->';
const block=(html.match(/<!-- QILY-AIRCRAFT-BRAND-HERO-V1:START -->[\s\S]*?<!-- QILY-AIRCRAFT-BRAND-HERO-V1:END -->/)||[''])[0];
assert(block,'Aircraft hero block missing');
assert(html.includes(start)&&html.includes(end),'Aircraft hero markers incomplete');
assert(block.includes('/assets/qilylean-aircraft-hero-approved-20260826.png?v=20260826-aircraft-approved-v1'),'Approved aircraft image is not rendered in hero');
assert(html.includes('/styles/qily-aircraft-brand-hero-v1.css?v=20260826-aircraft-hero-v1'),'Canonical aircraft stylesheet/cache key missing');
assert(!/C919/i.test(block),'Aircraft hero semantic block must not describe the aircraft as C919');
assert(!/<(?:img|source)\b[^>]+(?:c919-strategy-hero|qilylean-aircraft-hero-v1\.webp)/i.test(html),'A retired aircraft image source is still rendered on homepage');
assert(!/<picture\b/i.test(block),'Approved aircraft hero must not have a competing picture/source chain');
assert(!/\bsrcset\s*=|\bdata-src\s*=|\bdata-srcset\s*=/i.test(block),'Approved aircraft hero must not have srcset or lazy fallback sources');
assert((html.match(/qilylean-aircraft-hero-approved-20260826\.png/g)||[]).length>=2,'Approved aircraft preload/render chain incomplete');
const heroPos=html.indexOf(start); const legacyHeroPos=html.indexOf('<section class="hero">');
assert(heroPos>=0&&(legacyHeroPos<0||heroPos<legacyHeroPos),'Aircraft visual must be the first homepage content visual');
assert(b.length>500000,'Approved PNG is unexpectedly small');
assert(b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'Approved aircraft asset is not a valid PNG');
assert(b.readUInt32BE(16)===1672&&b.readUInt32BE(20)===941,'Approved aircraft PNG dimensions changed');
assert(css.includes('QilyLean Aircraft Brand Hero V1'),'Aircraft stylesheet identity missing');
console.log('PASS: homepage renders one approved aircraft PNG source with no competing fallback chain.');
