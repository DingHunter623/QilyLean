#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'styles','qily-aircraft-brand-hero-v1.css'),'utf8');
const sourcePath=path.join(root,'官网首图.png');
const pngPath=path.join(root,'assets','qilylean-aircraft-hero-approved-20260826.png');
const webpPath=path.join(root,'assets','qilylean-aircraft-hero-latest-q98.webp');
const EXPECTED_SOURCE_BLOB='32a218ed835ff0518cc7e2530f37c8cfa0b05b53';
const EXPECTED_SOURCE_BYTES=2339701;
const ASSET_VERSION='20260831-aircraft-latest-v5';
function assert(ok,msg){if(!ok)throw new Error(msg)}
function gitBlobSha(buffer){return crypto.createHash('sha1').update(Buffer.from(`blob ${buffer.length}\0`)).update(buffer).digest('hex')}
const source=fs.readFileSync(sourcePath),png=fs.readFileSync(pngPath),block=(html.match(/<!-- QILY-AIRCRAFT-BRAND-HERO-V1:START -->[\s\S]*?<!-- QILY-AIRCRAFT-BRAND-HERO-V1:END -->/)||[''])[0];
assert(block,'Aircraft hero block missing');
assert(!/C919/i.test(block),'Aircraft hero semantic block must not describe the aircraft as C919');
assert(!/<(?:img|source)\b[^>]+(?:c919-strategy-hero|qilylean-aircraft-hero-v1\.webp)/i.test(html),'Retired aircraft image source returned');
assert(gitBlobSha(source)===EXPECTED_SOURCE_BLOB,'官网首图.png is no longer the exact latest user-approved SSOT');
assert(source.length===EXPECTED_SOURCE_BYTES,'Latest 官网首图.png byte size changed unexpectedly');
assert(source.equals(png),'Production aircraft PNG is not byte-identical to 官网首图.png');
assert(png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'Canonical aircraft asset is not PNG');
const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
assert(width>=1200&&height>=675,`Canonical aircraft resolution too small: ${width}x${height}`);
assert(block.includes(`width="${width}" height="${height}"`),'Aircraft hero intrinsic dimensions do not match the latest SSOT');
const modern=block.includes(`qilylean-aircraft-hero-latest-q98.webp?v=${ASSET_VERSION}`);
assert(modern,'Latest aircraft WebP cache version missing');
assert((block.match(/<picture\b/g)||[]).length===1,'Aircraft hero must contain exactly one picture wrapper');
assert((block.match(/<source\b/g)||[]).length===1,'Aircraft hero must contain exactly one optimized source');
assert((block.match(/<img\b/g)||[]).length===1,'Aircraft hero must contain exactly one PNG fallback');
assert(block.includes(`qilylean-aircraft-hero-approved-20260826.png?v=${ASSET_VERSION}`),'Latest canonical PNG fallback missing');
assert(fs.existsSync(webpPath),'Optimized WebP derivative missing');
const webp=fs.readFileSync(webpPath);
assert(webp.length>=150000&&webp.length<1600000,'Optimized WebP outside governed 150KB–1.6MB payload window');
assert(webp.subarray(0,4).toString('ascii')==='RIFF'&&webp.subarray(8,12).toString('ascii')==='WEBP','Optimized derivative is not WebP');
assert(html.includes(`<link id="qilyAircraftHeroPreloadV1" rel="preload" as="image" href="/assets/qilylean-aircraft-hero-latest-q98.webp?v=${ASSET_VERSION}" type="image/webp" fetchpriority="high">`),'Latest optimized aircraft preload missing');
assert(css.includes('QilyLean Aircraft Brand Hero V1'),'Aircraft stylesheet identity missing');
/* Policy/rejection text may name retired refs; only executable fetch/show lines are prohibited. */
const activeRuntimeFiles=['.github/workflows/v4-build.yml','scripts/enforce-aircraft-home-hero.js'];
for(const rel of activeRuntimeFiles){
  const text=fs.readFileSync(path.join(root,rel),'utf8');
  const executable=text.split(/\r?\n/).filter(line=>!/^\s*(?:!\s*)?grep\b/.test(line)&&!line.includes("c919-approved-20260826|git show")&&!line.includes('executable legacy aircraft rollback')).join('\n');
  assert(!/git\s+fetch[^\n]*c919-approved-20260826|git\s+show[^\n]*c919-strategy-hero-v14\.png/i.test(executable),`${rel}: executable legacy aircraft rollback source is forbidden`);
}
console.log(`PASS: exact latest 官网首图.png SSOT (${width}x${height}) + Q98 WebP transport derivative + PNG fallback; no executable legacy rollback source.`);
