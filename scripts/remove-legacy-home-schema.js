#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '..', 'index.html');
let html = fs.readFileSync(file, 'utf8');
let removed = 0;

html = html.replace(/\s*<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi, (full, source) => {
  try {
    const data = JSON.parse(source.trim());
    if (data && data['@type'] === 'Person' && !Array.isArray(data['@graph'])) {
      removed += 1;
      return '';
    }
  } catch (error) {
    // Keep non-JSON or independently managed structured-data blocks unchanged.
  }
  return full;
});

html = html.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
fs.writeFileSync(file, html, 'utf8');

const remainingStandalonePerson = Array.from(html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)).some((match) => {
  try {
    const data = JSON.parse(match[1].trim());
    return data && data['@type'] === 'Person' && !Array.isArray(data['@graph']);
  } catch (error) {
    return false;
  }
});

if (remainingStandalonePerson) throw new Error('Legacy standalone Person schema remains on homepage');
if (!html.includes('QILY-HOME-STATIC-SCHEMA:START') || !html.includes('"@type":"Service"')) {
  throw new Error('Unified homepage structured data is missing');
}

process.stdout.write(`Removed ${removed} legacy standalone homepage schema block(s).\n`);
