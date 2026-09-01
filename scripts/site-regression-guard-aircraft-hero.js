#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'styles','qily-aircraft-brand-hero-v1.css'),'utf8');
const homeCss=fs.readFileSync(path.join(root,'styles','qily-home-conversion-v1.css'),'utf8');
const homeVisualFix=fs.readFileSync(path.join(root,'styles','qily-home-conversion-visual-fix-v2.css'),'utf8');
const homeJs=fs.readFileSync(path.join(root,'site-home-conversion-v1.js'),'utf8');
const ownerProfileCss=fs.readFileSync(path.join(root,'styles','qily-home-owner-profile-v1.css'),'utf8');
const ownerProfileJs=fs.readFileSync(path.join(root,'site-home-owner-profile-v1.js'),'utf8');
const sourcePath=path.join(root,'官网首图.png');
const pngPath=path.join(root,'assets','qilylean-aircraft-hero-approved-20260826.png');
const webpPath=path.join(root,'assets','qilylean-aircraft-hero-latest-q98.webp');
const EXPECTED_SOURCE_BLOB='32a218ed835ff0518cc7e2530f37c8cfa0b05b53';
const EXPECTED_SOURCE_BYTES=2339701;
const ASSET_VERSION='20260831-aircraft-latest-v5';
const HOME_VERSION='20260901-home-conversion-axis-v2';
const HOME_JS_VERSION='20260901-home-public-brand-copy-v2';
const HOME_VISUAL_FIX_VERSION='20260901-home-visual-fix-v2';
const OWNER_PROFILE_VERSION='20260901-owner-profile-v2';
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
assert(html.includes(`<link id="qilyHomeConversionVisualFixV2" rel="stylesheet" href="/styles/qily-home-conversion-visual-fix-v2.css?v=${HOME_VISUAL_FIX_VERSION}">`),'Homepage visual-fix stylesheet is not directly materialized with cache-busting');
assert(html.includes(`<link id="qilyHomeOwnerProfileV1Stylesheet" rel="stylesheet" href="/styles/qily-home-owner-profile-v1.css?v=${OWNER_PROFILE_VERSION}">`),'Homepage owner-profile stylesheet is not directly materialized');
assert(html.includes(`<script defer id="qilyHomeConversionV1Runtime" src="/site-home-conversion-v1.js?v=${HOME_JS_VERSION}"></script>`),'Conversion homepage runtime is not directly materialized with the current public-copy cache version');
assert(html.includes(`<script defer id="qilyHomeOwnerProfileV1Runtime" src="/site-home-owner-profile-v1.js?v=${OWNER_PROFILE_VERSION}"></script>`),'Homepage owner-profile runtime is not directly materialized');
assert(homeCss.includes('project hero -> three core deliveries -> industry scenes -> representative cases'),'Homepage conversion visual order contract missing');
assert(homeCss.includes('.qily-home-conversion-heading{\n  width:100%;\n  max-width:none;'),'Homepage conversion heading must follow the full content axis');
assert(homeCss.includes('#qily-core-services .qily-ia-heading{\n  width:100%!important;\n  max-width:none!important;'),'Core-delivery heading must not regress to a narrow 980px window');
assert(!homeCss.includes('.qily-home-conversion-heading{\n  max-width:980px'),'Narrow homepage conversion heading returned');
assert(!homeCss.includes('#qily-core-services .qily-ia-heading{\n  max-width:980px!important'),'Narrow core-delivery heading returned');
assert(homeVisualFix.includes('font-size:clamp(30px,2.75vw,44px)!important'),'Homepage hero title readable-size override missing');
assert(homeVisualFix.includes('background:#fff3cf!important')&&homeVisualFix.includes('color:#0b3f4b!important'),'Homepage capsule high-contrast VI override missing');
assert(homeVisualFix.includes('background:rgba(7,60,71,.96)!important')&&homeVisualFix.includes('-webkit-text-fill-color:#fff!important'),'Homepage project-caption high-contrast override missing');
assert(homeJs.includes('用工程数据解决工厂效率、质量、交付与布局问题'),'Approved homepage value proposition missing');
assert(homeJs.includes('60分钟匹配沟通'),'Approved 60-minute conversion entry missing');
assert(homeJs.includes('qily-home-representative-cases'),'Representative-case section missing');
assert(homeJs.includes('qily-home-six-step-method'),'Six-step method section missing');
assert(homeJs.includes('qily-home-standard-deliverables'),'Standard-deliverables section missing');
assert(homeJs.includes('qily-home-collaboration'),'Principal/collaboration section missing');
assert(homeJs.includes('qily-home-brand-extension'),'Aircraft brand-extension relocation missing');
assert(homeJs.includes('QILYLEAN BRAND｜启力精益品牌视觉'),'Public-facing aircraft brand kicker missing');
assert(homeJs.includes('以制造工程为翼，让专业能力抵达更多工厂'),'Public-facing aircraft brand title missing');
assert(!homeJs.includes('飞机模型保留，但不再占据首页首屏'),'Internal aircraft placement copy must never be public');
assert(!homeJs.includes('不再承担第一屏转化任务'),'Internal conversion-management copy must never be public');
assert(ownerProfileJs.includes('丁启利｜20年制造业工程技术与精益改善履历'),'Owner career summary title missing');
assert(ownerProfileJs.includes('9年任职欧美企业'),'Owner career summary missing 9-year multinational experience');
assert(ownerProfileJs.includes('4年担任上市公司工程部长'),'Owner career summary missing listed-company engineering leadership');
assert(ownerProfileJs.includes('累计6年多从事咨询交付'),'Owner career summary missing consulting-delivery experience');
assert(ownerProfileJs.includes('PQCD改善、数智化工厂规划、目视化项目交付与精益体系建设'),'Owner career focus summary missing');
assert(ownerProfileJs.includes('href="/experience/"')&&ownerProfileJs.includes('查看履历主线'),'Owner profile must expose a direct experience-timeline link');
assert(ownerProfileCss.includes('.qily-home-owner-profile'),'Owner profile VI styling missing');
assert(ownerProfileCss.includes('grid-template-rows:minmax(0,1fr)!important')&&ownerProfileCss.includes('.qily-home-role{'),'Owner role cards must stretch to the portrait height on desktop');
assert(ownerProfileCss.includes('.qily-home-owner-profile__experience'),'Owner experience-link VI styling missing');
assert(css.includes('QilyLean Aircraft Brand Hero V1'),'Aircraft stylesheet identity missing');

/* Policy/rejection text may name retired refs; only executable fetch/show lines are prohibited. */
const activeRuntimeFiles=['.github/workflows/v4-build.yml','scripts/enforce-aircraft-home-hero.js'];
for(const rel of activeRuntimeFiles){
  const text=fs.readFileSync(path.join(root,rel),'utf8');
  const executable=text.split(/\r?\n/).filter(line=>!/^\s*(?:!\s*)?grep\b/.test(line)&&!line.includes("c919-approved-20260826|git show")&&!line.includes('executable legacy aircraft rollback')).join('\n');
  assert(!/git\s+fetch[^\n]*c919-approved-20260826|git\s+show[^\n]*c919-strategy-hero-v14\.png/i.test(executable),`${rel}: executable legacy aircraft rollback source is forbidden`);
}
console.log(`PASS: aircraft SSOT preserved as lazy extended brand asset; project-first homepage, full-width section headings, readable hero scale, high-contrast VI labels, public-facing brand copy, restored owner career summary, portrait-aligned role cards and direct experience-timeline link are guarded.`);
