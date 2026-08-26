#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'styles','qily-aircraft-brand-hero-v1.css'),'utf8');
const asset=path.join(root,'assets','qilylean-aircraft-hero-approved-20260826.png');
function assert(ok,msg){if(!ok)throw new Error(msg)}
const b=fs.readFileSync(asset),block=(html.match(/<!-- QILY-AIRCRAFT-BRAND-HERO-V1:START -->[\s\S]*?<!-- QILY-AIRCRAFT-BRAND-HERO-V1:END -->/)||[''])[0];
assert(block,'Aircraft hero block missing');
assert(block.includes('/assets/qilylean-aircraft-hero-approved-20260826.png?v=20260826-aircraft-approved-v1'),'Approved aircraft image is not rendered');
assert(!/C919/i.test(block),'Aircraft hero semantic block must not describe the aircraft as C919');
assert(!/<picture\b|<source\b|\bsrcset\s*=|\bdata-src\s*=|\bdata-srcset\s*=/i.test(block),'Competing aircraft source chain returned');
assert(!/<(?:img|source)\b[^>]+(?:c919-strategy-hero|qilylean-aircraft-hero-v1\.webp)/i.test(html),'Retired aircraft image source returned');
assert((html.match(/qilylean-aircraft-hero-approved-20260826\.png/g)||[]).length>=2,'Approved preload/render chain incomplete');
assert(b.length>500000,'Approved PNG unexpectedly small');
assert(b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'Approved aircraft asset is not PNG');
assert(b.readUInt32BE(16)===1672&&b.readUInt32BE(20)===941,'Approved PNG dimensions changed');
assert(css.includes('QilyLean Aircraft Brand Hero V1'),'Aircraft stylesheet identity missing');
console.log('PASS: homepage renders one approved aircraft PNG source with no fallback chain.');
