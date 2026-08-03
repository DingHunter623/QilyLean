#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, 'enhance-daily-archive.js');
let source = fs.readFileSync(file, 'utf8');
const marker = "  if (/科学改进生产力|生产力改善|有效生产力/.test(value) && guides['科学改进生产力']) return '科学改进生产力';";

if (!source.includes(marker)) {
  const anchor = '  if (guides[value]) return value;';
  if (!source.includes(anchor)) throw new Error('resolveTopicKey anchor is missing.');
  source = source.replace(anchor, `${marker}\n${anchor}`);
}

if (!source.includes("'科学改进生产力': {")) throw new Error('Scientific productivity guide is missing.');
if (!source.includes(marker)) throw new Error('Explicit scientific productivity alias was not applied.');
fs.writeFileSync(file, source.endsWith('\n') ? source : `${source}\n`, 'utf8');
process.stdout.write('Explicit scientific productivity theme alias enforced.\n');
