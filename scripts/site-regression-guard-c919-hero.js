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

// The approved aircraft asset remains archived and immutable for future optimization/reuse.
assert(fs.existsSync(image),'Archived approved C919 PNG is missing');
const buf = fs.readFileSync(image);
assert(buf.length===2303286,`Archived approved C919 PNG size changed: ${buf.length}`);
const actualSha256 = crypto.createHash('sha256').update(buf).digest('hex');
assert(actualSha256===expectedSha256,`Archived approved C919 PNG SHA256 mismatch: ${actualSha256}`);
assert(buf.subarray(0,8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])),'Archived approved C919 asset is not PNG');
const width = buf.readUInt32BE(16), height = buf.readUInt32BE(20);
assert(width===1672 && height===941,`Archived approved C919 dimensions changed: ${width}x${height}`);

// Temporary homepage policy: the aircraft model and its strategic overview must not render.
assert(!html.includes('<!-- QILY-C919-STRATEGY-HERO:START -->'),'C919 homepage hero was reintroduced');
assert(!html.includes('<!-- QILY-C919-STRATEGY-HERO:END -->'),'C919 homepage hero end marker was reintroduced');
assert(!html.includes('<!-- QILY-C919-HERO-STYLES:START -->'),'C919 homepage hero styles were reintroduced');
assert(!html.includes('qily-c919-flightmap'),'C919 homepage flightmap class was reintroduced');
assert(!html.includes(`src="${rel}"`) && !html.includes(`src='${rel}'`),'Homepage directly references the archived C919 PNG');
assert(!html.includes(`href="${rel}"`) && !html.includes(`href='${rel}'`),'Homepage still preloads the archived C919 PNG');
assert(!html.includes(`content="${pub}"`) && !html.includes(`content='${pub}'`),'Homepage still exposes C919-specific social image metadata');

console.log(`C919 homepage suppression guard passed; archived artwork preserved ${width}x${height}, ${buf.length} bytes, SHA256 ${actualSha256}.`);
