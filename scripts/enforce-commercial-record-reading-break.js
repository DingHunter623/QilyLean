#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const file = path.join(root, 'projects', 'qilylean-commercial-deliveries', 'index.html');
const firstSentence = '这不是缺项隐藏，而是诚信状态披露。职业生涯任职期间项目、团队成果和个人专业作品不会被冒充为QilyLean商业订单。';
const secondSentence = '首个真实项目完成验收并取得客户明确授权后，才会按本页规则登记。';
const desired = `${firstSentence}<br class="desktop-break">${secondSentence}`;

if (!fs.existsSync(file)) throw new Error('Commercial delivery archive page is missing');
let html = fs.readFileSync(file, 'utf8');
let changed = false;

const paragraphPattern = new RegExp(
  `${firstSentence.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:<br\\s+class=["']desktop-break["']\\s*\\/?>)?${secondSentence.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
  'g'
);

if (!html.includes(desired)) {
  if (!paragraphPattern.test(html)) throw new Error('Authorized-record disclosure text changed; manual review required');
  paragraphPattern.lastIndex = 0;
  html = html.replace(paragraphPattern, desired);
  changed = true;
}

if (!html.includes('.desktop-break{display:none}')) {
  if (!/<\/style>/i.test(html)) throw new Error('Commercial page inline style block missing');
  html = html.replace(/<\/style>/i, '.desktop-break{display:none}\n@media(min-width:1024px){.desktop-break{display:block}}\n</style>');
  changed = true;
}

if (!html.includes('@media(min-width:1024px){.desktop-break{display:block}}')) {
  if (!/<\/style>/i.test(html)) throw new Error('Commercial page inline style block missing');
  html = html.replace(/<\/style>/i, '@media(min-width:1024px){.desktop-break{display:block}}\n</style>');
  changed = true;
}

if (changed) fs.writeFileSync(file, html, 'utf8');

const finalHtml = fs.readFileSync(file, 'utf8');
if (!finalHtml.includes(desired)) throw new Error('Desktop reading break was not materialized at the approved sentence boundary');
if (!finalHtml.includes('.desktop-break{display:none}')) throw new Error('Mobile natural-flow rule missing');
if (!finalHtml.includes('@media(min-width:1024px){.desktop-break{display:block}}')) throw new Error('Desktop line-break rule missing');

process.stdout.write(changed ? 'Commercial disclosure reading break restored.\n' : 'Commercial disclosure reading break already compliant.\n');
