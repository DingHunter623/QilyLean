#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const asset=path.join(root,"qilylean/c919-strategy-hero-v14.png");
const css=fs.readFileSync(path.join(root,'styles','qily-c919-digital-flagship-hero-v1.css'),'utf8');
function assert(ok,msg){if(!ok)throw new Error(msg)}
const b=fs.readFileSync(asset);
assert(html.includes("<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:START -->"),'C919 V4 homepage start marker missing');
assert(html.includes("<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:END -->"),'C919 V4 homepage end marker missing');
assert(html.includes('/styles/qily-c919-digital-flagship-hero-v1.css?v=20260822-latest-aircraft-v7'),'Latest-aircraft V7 stylesheet cache key missing');
assert(html.includes("src=\"/qilylean/c919-strategy-hero-v14.png?v=20260826-c919-crossbrowser-v1\""),'C919 single-source PNG is not rendered');
assert(html.includes("href=\"/qilylean/c919-strategy-hero-v14.png?v=20260826-c919-crossbrowser-v1\" type=\"image/png\""),'C919 PNG preload/cache key missing');
assert(!html.includes('c919-strategy-hero-v14.webp'),'Retired V14 WebP source returned to homepage');
assert(!/<picture>[\s\S]*?c919-strategy-hero-v14/i.test(html),'Competing picture/source chain returned to C919 hero');
assert(html.indexOf('QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:START')<html.indexOf('<section class="hero">'),'C919 is not the first homepage content visual');
assert(b.length>500000,'C919 PNG asset is unexpectedly small');
assert(b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'C919 PNG signature invalid');
assert(b.readUInt32BE(16)===1672&&b.readUInt32BE(20)===941,'C919 PNG dimensions invalid');
assert(css.includes('C919 Digital Flagship Hero V6'),'C919 stylesheet is not V6');
console.log('PASS: C919 homepage uses one validated PNG authority asset with cache-busting and no competing WebP source.');
