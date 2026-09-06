#!/usr/bin/env node
'use strict';

/* QilyLean Search Favicon Authority V1 | 2026-09-06
 * Google Search does not rely on the browser's implicit /favicon.ico fallback.
 * This gate declares the stable root favicon explicitly on the hostname home page,
 * validates that the ICO contains a square >=48px image, and prevents regression.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const homePath = path.join(root, 'index.html');
const iconPath = path.join(root, 'favicon.ico');
const robotsPath = path.join(root, 'robots.txt');
const apply = process.argv.includes('--apply');

const START = '<!-- QILY-SEARCH-FAVICON:START -->';
const END = '<!-- QILY-SEARCH-FAVICON:END -->';
const BLOCK = `${START}\n<link rel="icon" href="/favicon.ico" sizes="48x48" type="image/x-icon">\n${END}`;

function inspectIco(buffer) {
  if (buffer.length < 22) throw new Error('favicon.ico is too small to be a valid ICO');
  const reserved = buffer.readUInt16LE(0);
  const type = buffer.readUInt16LE(2);
  const count = buffer.readUInt16LE(4);
  if (reserved !== 0 || type !== 1 || count < 1) throw new Error('favicon.ico header is invalid');
  const sizes = [];
  for (let i = 0; i < count; i += 1) {
    const offset = 6 + i * 16;
    if (offset + 16 > buffer.length) throw new Error('favicon.ico directory is truncated');
    const width = buffer[offset] || 256;
    const height = buffer[offset + 1] || 256;
    sizes.push([width, height]);
  }
  if (!sizes.some(([w, h]) => w === h && w >= 48)) {
    throw new Error(`favicon.ico lacks a square >=48px image; found ${sizes.map(v => v.join('x')).join(', ')}`);
  }
  return sizes;
}

function normalizeHome(source) {
  let html = source;
  const marker = new RegExp(`${START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'm');
  html = html.replace(marker, '');
  // Remove any historical favicon declarations so the hostname has one unambiguous owner.
  html = html.replace(/\s*<link\b[^>]*\brel=["'](?:shortcut\s+)?icon["'][^>]*>\s*/gi, '\n');
  const viewport = /<meta\s+name=["']viewport["'][^>]*>/i;
  if (viewport.test(html)) return html.replace(viewport, match => `${match}\n${BLOCK}`);
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, match => `${match}\n${BLOCK}`);
  throw new Error('Homepage <head> is missing');
}

if (!fs.existsSync(homePath)) throw new Error('index.html missing');
if (!fs.existsSync(iconPath)) throw new Error('root favicon.ico missing');
const sizes = inspectIco(fs.readFileSync(iconPath));

if (fs.existsSync(robotsPath)) {
  const robots = fs.readFileSync(robotsPath, 'utf8');
  if (/^\s*Disallow:\s*\/favicon\.ico\s*$/mi.test(robots)) throw new Error('robots.txt blocks /favicon.ico');
}

const before = fs.readFileSync(homePath, 'utf8');
const after = normalizeHome(before);
if (apply && after !== before) fs.writeFileSync(homePath, after, 'utf8');
const finalHtml = apply ? fs.readFileSync(homePath, 'utf8') : after;

if (!finalHtml.includes(BLOCK)) throw new Error('Explicit Google-search favicon declaration missing');
if ((finalHtml.match(/rel=["']icon["']/gi) || []).length !== 1) throw new Error('Homepage must have exactly one rel="icon" owner');
if (!/<meta\s+name=["']robots["'][^>]*content=["'][^"']*index/i.test(finalHtml)) throw new Error('Homepage is not explicitly indexable');
if (!/<link\s+rel=["']canonical["'][^>]*href=["']https:\/\/qilylean\.com\/["']/i.test(finalHtml)) throw new Error('Homepage canonical hostname is not https://qilylean.com/');

console.log(`${apply ? 'APPLY' : 'CHECK'} PASS: Search favicon authority; ICO sizes=${sizes.map(v => v.join('x')).join(', ')}; href=/favicon.ico.`);
