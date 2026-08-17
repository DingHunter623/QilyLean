#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
const image = path.join(root,'qilylean','c919-strategy-hero-approved-20260818.png');
const rel = '/qilylean/c919-strategy-hero-approved-20260818.png';
const pub = 'https://qilylean.com/qilylean/c919-strategy-hero-approved-20260818.png';
const expectedSha256 = '71f37901a72a345ebf298d22055ff28325511594c19f70859dd7ab4ca2cce4f7';
function assert(ok,msg){ if(!ok) throw new Error(msg); }

assert((html.match(/<!-- QILY-C919-STRATEGY-HERO:START -->/g)||[]).length===1,'C919 hero start marker must exist once');
assert((html.match(/<!-- QILY-C919-STRATEGY-HERO:END -->/g)||[]).length===1,'C919 hero end marker must exist once');
assert(fs.existsSync(image),'Exact approved C919 PNG is missing');
const buf = fs.readFileSync(image);
assert(buf.length===2303286,`Exact approved C919 PNG size changed: ${buf.length}`);
const actualSha256 = crypto.createHash('sha256').update(buf).digest('hex');
assert(actualSha256===expectedSha256,`Exact approved C919 PNG SHA256 mismatch: ${actualSha256}`);
assert(buf.subarray(0,8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])),'Approved C919 asset is not PNG');
const width = buf.readUInt32BE(16), height = buf.readUInt32BE(20);
assert(width===1672 && height===941,`Approved C919 dimensions changed: ${width}x${height}`);
assert(html.includes(`src="${rel}"`),'Homepage does not reference exact approved C919 PNG');
assert(html.includes(`rel="preload" as="image" href="${rel}" type="image/png"`),'Approved C919 PNG preload missing');
assert(html.includes(`content="${pub}"`),'Approved C919 PNG social image missing');
assert(!html.includes('c919-strategy-hero-v12.webp'),'Retired scrambled v12 WebP is still referenced by homepage');
console.log(`C919 guard passed: exact approved artwork verified ${width}x${height}, ${buf.length} bytes, SHA256 ${actualSha256}.`);
