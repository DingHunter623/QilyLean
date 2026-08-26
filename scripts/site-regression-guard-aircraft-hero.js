#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'styles','qily-aircraft-brand-hero-v1.css'),'utf8');
const asset=path.join(root,'assets','qilylean-aircraft-hero-v1.webp');
function assert(ok,msg){if(!ok)throw new Error(msg)}
const b=fs.readFileSync(asset);
const start='<!-- QILY-AIRCRAFT-BRAND-HERO-V1:START -->';
const end='<!-- QILY-AIRCRAFT-BRAND-HERO-V1:END -->';
const block=(html.match(/<!-- QILY-AIRCRAFT-BRAND-HERO-V1:START -->[\s\S]*?<!-- QILY-AIRCRAFT-BRAND-HERO-V1:END -->/)||[''])[0];
assert(block,'Aircraft hero block missing');
assert(html.includes(start)&&html.includes(end),'Aircraft hero markers incomplete');
assert(block.includes('/assets/qilylean-aircraft-hero-v1.webp?v=20260826-aircraft-hero-v1'),'Canonical aircraft image is not rendered in hero');
assert(html.includes('/styles/qily-aircraft-brand-hero-v1.css?v=20260826-aircraft-hero-v1'),'Canonical aircraft stylesheet/cache key missing');
assert(!/C919/i.test(block),'Aircraft hero semantic block must not describe the aircraft as C919');
assert(!/<img\b[^>]+c919-strategy-hero-v14\.(?:png|webp)/i.test(html),'A legacy aircraft image is still rendered on homepage');
assert(!/<link\b[^>]+qily-c919-digital-flagship-hero-v1\.css/i.test(html),'Legacy aircraft hero stylesheet is still active on homepage');
assert((html.match(/qilylean-aircraft-hero-v1\.webp/g)||[]).length>=2,'Aircraft asset preload/render chain incomplete');
const heroPos=html.indexOf(start); const legacyHeroPos=html.indexOf('<section class="hero">');
assert(heroPos>=0&&(legacyHeroPos<0||heroPos<legacyHeroPos),'Aircraft visual must be the first homepage content visual');
assert(b.length>50000,'Canonical WebP is unexpectedly small');
assert(b.subarray(0,4).toString('ascii')==='RIFF'&&b.subarray(8,12).toString('ascii')==='WEBP','Canonical aircraft asset is not a valid WebP');
assert(css.includes('QilyLean Aircraft Brand Hero V1'),'Aircraft stylesheet identity missing');
console.log('PASS: homepage renders the neutral canonical aircraft artwork and does not render the retired aircraft asset.');
