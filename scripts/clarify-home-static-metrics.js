#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const file = path.join(root, 'index.html');
let html = fs.readFileSync(file, 'utf8');

const note = '          <p class="metric-display-note" role="note"><strong>浏览说明：</strong>以下为静态成果概览卡片，仅用于信息展示；鼠标经过时的变化为视觉反馈，不代表可点击或页面跳转。</p>';

if (!html.includes('metric-display-note')) {
  const target = '          <p>以制造场景、改善方法、项目结果和机制沉淀为主线，快速呈现职业价值。</p>';
  if (!html.includes(target)) throw new Error('Cannot locate the homepage metrics introduction');
  html = html.replace(target, `${target}\n${note}`);
}

if (!html.includes('.metric-display-note{')) {
  const target = '    .head p{margin:0;color:var(--muted);font-size:19px}';
  if (!html.includes(target)) throw new Error('Cannot locate homepage heading paragraph styles');
  const styles = `${target}\n    .metric-display-note{display:inline-flex;align-items:flex-start;gap:7px;margin-top:11px!important;padding:8px 12px;border-left:4px solid var(--copper);color:#315f64!important;background:#eef8f6;font-size:14px!important;line-height:1.65!important}\n    .metric-display-note strong{flex:0 0 auto;color:var(--forest)}`;
  html = html.replace(target, styles);
}

html = html.replace(
  '    .metric{min-height:168px;padding:20px;border:1px solid var(--line);border-top:4px solid var(--teal);background:#fff;transition:transform .16s ease,box-shadow .16s ease}',
  '    .metric{min-height:168px;padding:20px;border:1px solid var(--line);border-top:4px solid var(--teal);background:#fff;cursor:default;transition:transform .16s ease,box-shadow .16s ease}'
);

fs.writeFileSync(file, html.endsWith('\n') ? html : `${html}\n`, 'utf8');
console.log('Clarified that homepage key-result cards are static display modules.');
