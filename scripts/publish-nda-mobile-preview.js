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
  '当前页面直接读取并渲染最新上传的正式PDF',
  'pdf.js/3.11.174/pdf.min.js',
  'pdfjsLib.getDocument',
  'qilylean-mutual-nda-v1.pdf?v=20260801-upload-v2',
  '适应宽度',
  '原始比例'
]) {
  if (!html.includes(required)) throw new Error(`Preview template missing: ${required}`);
}
if (/<iframe|download=|href=["'][^"']*qilylean-mutual-nda-v1\.pdf/.test(html)) {
  throw new Error('Preview template exposes a PDF frame or direct download link');
}

fs.mkdirSync(path.dirname(target), {recursive:true});
fs.writeFileSync(target, html.endsWith('\n') ? html : `${html}\n`, 'utf8');
console.log('Published the exact latest PDF through an inline, mobile-readable PDF.js preview.');
