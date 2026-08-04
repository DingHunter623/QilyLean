#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const archiveEnhancerFile = path.resolve(__dirname, 'enhance-daily-archive.js');
let source = fs.readFileSync(archiveEnhancerFile, 'utf8');

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

fs.writeFileSync(archiveEnhancerFile, source.endsWith('\n') ? source : `${source}\n`, 'utf8');

const augustFourthBrief = path.resolve(__dirname, '..', 'qilylean', 'daily', '2026-08-04.html');
if (fs.existsSync(augustFourthBrief)) {
  let brief = fs.readFileSync(augustFourthBrief, 'utf8');
  brief = brief
    .replace(
      '<table class="rule-table"><thead><tr><th>观察层级</th>',
      '<table class="rule-table compact-first-col"><thead><tr><th>观察层级</th>'
    )
    .replace(
      '<table class="rule-table"><thead><tr><th>试点前</th>',
      '<table class="rule-table balanced-cols"><thead><tr><th>试点前</th>'
    );

  if (brief.includes('<table class="rule-table">')) {
    throw new Error('An unclassified equal-width table remains in the 2026-08-04 brief.');
  }
  fs.writeFileSync(augustFourthBrief, brief.endsWith('\n') ? brief : `${brief}\n`, 'utf8');
}

process.stdout.write('Explicit recent-theme aliases and 2026-08-04 table layouts enforced.\n');
