#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'scripts', 'nda-source', 'nda-preview-template.html');
const target = path.join(root, 'trust', 'nda-preview.html');

if (!fs.existsSync(source)) throw new Error('Approved confidentiality preview template is missing');

const html = fs.readFileSync(source, 'utf8');
for (const required of [
  'QilyLean项目保密声明',
  '最新版PDF在线预览',
  '300DPI高清预览图',
  'qilylean-confidentiality-statement-v2.png',
  '适应宽度',
  '原始清晰度'
]) {
  if (!html.includes(required)) throw new Error(`Preview template missing: ${required}`);
}
if (/<iframe|download=|qilylean-mutual-nda-v1\.pdf/.test(html)) {
  throw new Error('Preview template exposes a PDF frame or download path');
}

fs.mkdirSync(path.dirname(target), {recursive:true});
fs.writeFileSync(target, html.endsWith('\n') ? html : `${html}\n`, 'utf8');
console.log('Published latest approved PDF as a responsive high-resolution online preview.');
