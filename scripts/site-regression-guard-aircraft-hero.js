#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'styles','qily-aircraft-brand-hero-v1.css'),'utf8');
const homeCss=fs.readFileSync(path.join(root,'styles','qily-home-conversion-v1.css'),'utf8');
const homeJs=fs.readFileSync(path.join(root,'site-home-conversion-v1.js'),'utf8');
const sourcePath=path.join(root,'官网首图.png');
const pngPath=path.join(root,'assets','qilylean-aircraft-hero-approved-20260826.png');
const webpPath=path.join(root,'assets','qilylean-aircraft-hero-latest-q98.webp');
const EXPECTED_SOURCE_BLOB='32a218ed835ff0518cc7e2530f37c8cfa0b05b53';
const EXPECTED_SOURCE_BYTES=2339701;
const ASSET_VERSION='20260831-aircraft-latest-v5';
const HOME_VERSION='20260901-home-conversion-v1';
function assert(ok,msg){if(!ok)throw new Error(msg)}
function gitBlobSha(buffer){return crypto.createHash('sha1').update(Buffer.from(`blob ${buffer.length}\0`)).update(buffer).digest('hex')}
const source=fs.readFileSync(sourcePath),png=fs.readFileSync(pngPath),block=(html.match(/<!-- QILY-AIRCRAFT-BRAND-HERO-V1:START -->[\s\S]*?<!-- QILY-AIRCRAFT-BRAND-HERO-V1:END -->/)||[''])[0];
assert(block,'Aircraft brand-extension block missing');
assert(!/C919/i.test(block),'Aircraft semantic block must not describe the aircraft as C919');
assert(block.includes('data-qily-home-aircraft-position="extended"'),'Aircraft must be governed as an extended brand asset');
assert(block.includes('loading="lazy"'),'Aircraft extension image must be lazy-loaded');
assert(block.includes('fetchpriority="low"'),'Aircraft extension image must not compete with first-screen project imagery');
assert(!/<(?:img|source)\b[^>]+(?:c919-strategy-hero|qilylean-aircraft-hero-v1\.webp)/i.test(html),'Retired aircraft image source returned');
assert(gitBlobSha(source)===EXPECTED_SOURCE_BLOB,'官网首图.png is no longer the exact latest user-approved SSOT');
assert(source.length===EXPECTED_SOURCE_BYTES,'Latest 官网首图.png byte size changed unexpectedly');
assert(source.equals(png),'Production aircraft PNG is not byte-identical to 官网首图.png');
assert(png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'Canonical aircraft asset is not PNG');
const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
assert(width>=1200&&height>=675,`Canonical aircraft resolution too small: ${width}x${height}`);
assert(block.includes(`width="${width}" height="${height}"`),'Aircraft intrinsic dimensions do not match the latest SSOT');
assert(block.includes(`qilylean-aircraft-hero-latest-q98.webp?v=${ASSET_VERSION}`),'Latest aircraft WebP cache version missing');
assert(block.includes(`qilylean-aircraft-hero-approved-20260826.png?v=${ASSET_VERSION}`),'Latest canonical PNG fallback missing');
assert((block.match(/<picture\b/g)||[]).length===1,'Aircraft extension must contain exactly one picture wrapper');
assert((block.match(/<source\b/g)||[]).length===1,'Aircraft extension must contain exactly one optimized source');
assert((block.match(/<img\b/g)||[]).length===1,'Aircraft extension must contain exactly one PNG fallback');
assert(fs.existsSync(webpPath),'Optimized WebP derivative missing');
const webp=fs.readFileSync(webpPath);
assert(webp.length>=150000&&webp.length<1600000,'Optimized WebP outside governed 150KB–1.6MB payload window');
assert(webp.subarray(0,4).toString('ascii')==='RIFF'&&webp.subarray(8,12).toString('ascii')==='WEBP','Optimized derivative is not WebP');

/* First-screen contract: aircraft cannot immediately follow <main>; conversion dependencies are direct and cache-versioned. */
const mainOpen=html.search(/<main\b[^>]*>/i),aircraftAt=html.indexOf('<!-- QILY-AIRCRAFT-BRAND-HERO-V1:START -->');
assert(mainOpen>=0&&aircraftAt>mainOpen,'Homepage main/aircraft ordering invalid');
const between=html.slice(mainOpen,aircraftAt);
assert(/<section\b[^>]*class=["'][^"']*\bhero\b/i.test(between),'A real homepage hero must precede the aircraft extension');
assert(!html.includes('id="qilyAircraftHeroPreloadV1"'),'Aircraft preload must stay removed after first-screen demotion');
assert(html.includes(`<link id="qilyHomeConversionV1Stylesheet" rel="stylesheet" href="/styles/qily-home-conversion-v1.css?v=${HOME_VERSION}">`),'Conversion homepage stylesheet is not directly materialized');
assert(html.includes(`<script defer id="qilyHomeConversionV1Runtime" src="/site-home-conversion-v1.js?v=${HOME_VERSION}"></script>`),'Conversion homepage runtime is not directly materialized');
assert(homeCss.includes('project hero -> three core deliveries -> industry scenes -> representative cases'),'Homepage conversion visual order contract missing');
assert(homeJs.includes('用工程数据解决工厂效率、质量、交付与布局问题'),'Approved homepage value proposition missing');
assert(homeJs.includes('60分钟匹配沟通'),'Approved 60-minute conversion entry missing');
assert(homeJs.includes('qily-home-representative-cases'),'Representative-case section missing');
assert(homeJs.includes('qily-home-six-step-method'),'Six-step method section missing');
assert(homeJs.includes('qily-home-standard-deliverables'),'Standard-deliverables section missing');
assert(homeJs.includes('qily-home-collaboration'),'Principal/collaboration section missing');
assert(homeJs.includes('qily-home-brand-extension'),'Aircraft brand-extension relocation missing');
assert(css.includes('QilyLean Aircraft Brand Hero V1'),'Aircraft stylesheet identity missing');

/* Policy/rejection text may name retired refs; only executable fetch/show lines are prohibited. */
const activeRuntimeFiles=['.github/workflows/v4-build.yml','scripts/enforce-aircraft-home-hero.js'];
for(const rel of activeRuntimeFiles){
  const text=fs.readFileSync(path.join(root,rel),'utf8');
  const executable=text.split(/\r?\n/).filter(line=>!/^\s*(?:!\s*)?grep\b/.test(line)&&!line.includes("c919-approved-20260826|git show")&&!line.includes('executable legacy aircraft rollback')).join('\n');
  assert(!/git\s+fetch[^\n]*c919-approved-20260826|git\s+show[^\n]*c919-strategy-hero-v14\.png/i.test(executable),`${rel}: executable legacy aircraft rollback source is forbidden`);
}
console.log(`PASS: aircraft SSOT preserved as lazy extended brand asset; project-first homepage conversion structure and 60-minute entry are guarded.`);
