#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'scripts', 'nda-source', 'nda-preview-template.html');
const target = path.join(root, 'trust', 'nda-preview.html');

if (!fs.existsSync(source)) {
  throw new Error('Approved confidentiality preview template is missing');
}

const html = fs.readFileSync(source, 'utf8');
for (const required of [
  'QilyLean项目保密声明',
  '本人知悉并同意',
  '项目责任人：丁启利',
  '委托单位（填写）',
  '项目名称（填写）',
  'qilylean-trust-qr.svg'
]) {
  if (!html.includes(required)) throw new Error(`Preview template missing: ${required}`);
}
if (/<iframe|download=|qilylean-mutual-nda-v1\.pdf/.test(html)) {
  throw new Error('Preview template exposes a PDF frame or download path');
}

fs.mkdirSync(path.dirname(target), {recursive:true});
fs.writeFileSync(target, html.endsWith('\n') ? html : `${html}\n`, 'utf8');
console.log('Published responsive, mobile-readable confidentiality statement preview.');
