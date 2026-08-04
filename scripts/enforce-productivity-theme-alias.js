#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, 'enhance-daily-archive.js');
let source = fs.readFileSync(file, 'utf8');

const startMarker = '  // QILY-EXPLICIT-RECENT-THEME-ALIASES:START';
const endMarker = '  // QILY-EXPLICIT-RECENT-THEME-ALIASES:END';
const legacyMarker = "  if (/科学改进生产力|生产力改善|有效生产力/.test(value) && guides['科学改进生产力']) return '科学改进生产力';";
const aliasBlock = `${startMarker}\n  if (/科学改进生产力|生产力改善|有效生产力/.test(value) && guides['科学改进生产力']) return '科学改进生产力';\n  if (/成果|证据|核验|验收|阶段门|公开链接|交付资产/.test(value) && guides['项目管理']) return '项目管理';\n${endMarker}`;
const blockExpression = /  \/\/ QILY-EXPLICIT-RECENT-THEME-ALIASES:START[\s\S]*?  \/\/ QILY-EXPLICIT-RECENT-THEME-ALIASES:END/;

if (blockExpression.test(source)) {
  source = source.replace(blockExpression, aliasBlock);
} else if (source.includes(legacyMarker)) {
  source = source.replace(legacyMarker, aliasBlock);
} else {
  const anchor = '  if (guides[value]) return value;';
  if (!source.includes(anchor)) throw new Error('resolveTopicKey anchor is missing.');
  source = source.replace(anchor, `${aliasBlock}\n${anchor}`);
}

if (!source.includes("'科学改进生产力': {")) throw new Error('Scientific productivity guide is missing.');
if (!source.includes("'项目管理': {")) throw new Error('Project management guide is missing.');
if (!source.includes(startMarker) || !source.includes(endMarker)) throw new Error('Explicit recent-theme aliases were not applied.');

fs.writeFileSync(file, source.endsWith('\n') ? source : `${source}\n`, 'utf8');
process.stdout.write('Explicit scientific-productivity and evidence-verification theme aliases enforced.\n');
