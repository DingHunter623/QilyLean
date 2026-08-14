#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, 'audit-daily-terminology.js');
let source = fs.readFileSync(file, 'utf8');

const from = "  'DAILY', 'ENGINEERING', 'BRIEF', 'SINGLE', 'POINT', 'LESSON',";
const to = "  'DAILY', 'ENGINEERING', 'BRIEF', 'CURATED', 'SINGLE', 'POINT', 'LESSON',";

if (!source.includes("'CURATED'")) {
  if (!source.includes(from)) throw new Error('Daily terminology UI allowlist anchor not found.');
  source = source.replace(from, to);
}

if (!source.includes("'CURATED'")) throw new Error('CURATED UI allowlist update failed.');
fs.writeFileSync(file, source, 'utf8');
console.log('Daily terminology gate updated: CURATED is classified as UI vocabulary, not a governed manufacturing term.');
