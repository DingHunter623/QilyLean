#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const runtime = path.join(root, 'knowledge', 'knowledge-asset-v2.js');
const loader = path.join(root, 'homepage-music.js');
const dailyDir = path.join(root, 'qilylean', 'daily');

function read(file) { return fs.readFileSync(file, 'utf8'); }
function fail(message) { console.error('Knowledge Asset V2 audit failed: ' + message); process.exitCode = 1; }

if (!fs.existsSync(runtime)) fail('knowledge/knowledge-asset-v2.js is missing.');
else {
  const js = read(runtime);
  [
    '工程深读｜从观点进入数据、方法与验证',
    '工程判定口径',
    '工具应用案例',
    '现场动作与验收',
    '相关知识链',
    '教学案例：',
    '代表项目',
    '相关项目能力'
  ].forEach((token) => { if (!js.includes(token)) fail('runtime missing required marker: ' + token); });

  const coreTools = ['VSM','SMED','OEE','PDCA','ECRS','5WHY','FMEA','SPC','MSA','CT','TT','WIP','UPPH','MTBF','MTTR','NPI','APQP','PPAP','RACI','PILOT','MES','ERP','APS','ANDON','TPM','DOE'];
  coreTools.forEach((code) => {
    const re = new RegExp("['\\\"]" + code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "['\\\"]\\s*:",'i');
    if (!re.test(js)) fail('core tool has no dedicated teaching case: ' + code);
  });

  if (!/#[0-9a-fA-F]{6}/.test(js) || !js.includes('#0f4b5a') || !js.includes('#178b94') || !js.includes('#caa15f')) {
    fail('VI palette markers forest/teal/gold are incomplete.');
  }
}

if (!fs.existsSync(loader)) fail('homepage-music.js loader is missing.');
else {
  const js = read(loader);
  if (!js.includes('/knowledge/knowledge-asset-v2.js?v=20260828-knowledge-asset-v2')) fail('Knowledge Asset V2 runtime is not loaded by the shared page enhancement entry.');
  if (!js.includes('data-qily-knowledge-asset-v2')) fail('Knowledge Asset V2 dedupe marker is missing.');
}

if (!fs.existsSync(dailyDir)) fail('qilylean/daily directory is missing.');
else {
  const pages = fs.readdirSync(dailyDir).filter((name) => /^\d{4}-\d{2}-\d{2}\.html$/.test(name));
  if (!pages.length) fail('no dated Daily Brief pages found.');
  let missingTerm = 0;
  let missingTemplate = 0;
  for (const name of pages) {
    const html = read(path.join(dailyDir, name));
    if (!html.includes('QILY-DAILY-TERMINOLOGY:START') || !html.includes('data-daily-terminology-audit=')) missingTerm += 1;
    if (!/<article\b[^>]*class="[^"]*\bpost\b/i.test(html)) missingTemplate += 1;
  }
  if (missingTerm) fail(missingTerm + ' Daily Brief page(s) missing synchronized terminology linkage.');
  if (missingTemplate) fail(missingTemplate + ' Daily Brief page(s) missing the retained post template.');
  if (!process.exitCode) console.log('Knowledge Asset V2 audit passed: ' + pages.length + ' Daily Brief page(s), runtime/tool cases/linkage/VI governance intact.');
}

if (process.exitCode) process.exit(process.exitCode);
