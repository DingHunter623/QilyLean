#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'styles','qily-aircraft-brand-hero-v1.css'),'utf8');
const sourcePath=path.join(root,'官网首图.png');
const assetPath=path.join(root,'assets','qilylean-aircraft-hero-approved-20260826.png');
const EXPECTED_SOURCE_BLOB='e67ad0ac7881da8e0fdbf6041fb9858882204ac4';
function assert(ok,msg){if(!ok)throw new Error(msg)}
function gitBlobSha(buffer){return crypto.createHash('sha1').update(Buffer.from(`blob ${buffer.length}\0`)).update(buffer).digest('hex')}
const source=fs.readFileSync(sourcePath),asset=fs.readFileSync(assetPath),block=(html.match(/<!-- QILY-AIRCRAFT-BRAND-HERO-V1:START -->[\s\S]*?<!-- QILY-AIRCRAFT-BRAND-HERO-V1:END -->/)||[''])[0];
assert(block,'Aircraft hero block missing');
assert(block.includes('/assets/qilylean-aircraft-hero-approved-20260826.png?v=20260827-home-original-approved-v2'),'Canonical aircraft image cache identity is not rendered');
assert(!/C919/i.test(block),'Aircraft hero semantic block must not describe the aircraft as C919');
assert(!/<picture\b|<source\b|\bsrcset\s*=|\bdata-src\s*=|\bdata-srcset\s*=/i.test(block),'Competing aircraft source chain returned');
assert(!/<(?:img|source)\b[^>]+(?:c919-strategy-hero|qilylean-aircraft-hero-v1\.webp)/i.test(html),'Retired aircraft image source returned');
assert((html.match(/qilylean-aircraft-hero-approved-20260826\.png/g)||[]).length>=2,'Canonical preload/render chain incomplete');
assert(gitBlobSha(source)===EXPECTED_SOURCE_BLOB,'官网首图.png is no longer the exact user-approved SSOT');
assert(source.equals(asset),'Production aircraft PNG is not byte-identical to 官网首图.png');
assert(asset.length>500000,'Canonical PNG unexpectedly small');
assert(asset.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'Canonical aircraft asset is not PNG');
assert(asset.readUInt32BE(16)===1672&&asset.readUInt32BE(20)===941,'Canonical PNG dimensions changed');
assert(css.includes('QilyLean Aircraft Brand Hero V1'),'Aircraft stylesheet identity missing');
/* Anti-rollback checks target executable legacy fetch/show behavior only. Guard/rejection grep lines are policy text, not rollback actions. */
const activeRuntimeFiles=['.github/workflows/v4-build.yml','scripts/enforce-aircraft-home-hero.js'];
for(const rel of activeRuntimeFiles){
  const text=fs.readFileSync(path.join(root,rel),'utf8');
  const executable=text.split(/\r?\n/).filter(line=>!/^\s*(?:!\s*)?grep\b/.test(line)&&!line.includes("c919-approved-20260826|git show")&& !line.includes('executable legacy aircraft rollback')) .join('\n');
  assert(!/git\s+fetch[^\n]*c919-approved-20260826|git\s+show[^\n]*c919-strategy-hero-v14\.png/i.test(executable),`${rel}: executable legacy aircraft rollback source is forbidden`);
}
console.log('PASS: homepage uses byte-identical 官网首图.png SSOT, one high-priority production PNG URL, and no executable legacy rollback source.');
