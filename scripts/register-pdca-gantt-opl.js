#!/usr/bin/env node
'use strict';

const fs = require('fs');
const file = 'knowledge/index.html';
const start = '<!-- QILY-PDCA-GANTT-OPL:START -->';
const end = '<!-- QILY-PDCA-GANTT-OPL:END -->';
const anchor = '<div class="module-actions"><a href="/knowledge/terminology.html">进入术语词典</a></div></article>';
const block = `${start}\n<article class="module-card" id="pdca-gantt-opl-training" style="margin-top:16px"><small>单点培训课件｜项目管理</small><h3>PDCA项目管理 × 甘特图里程碑推进</h3><p>应用PDCA工具进行项目管理，应用甘特图进行项目推进的里程碑管理计划；覆盖PDCA闭环、WBS、甘特图、里程碑评审与项目推进话术。</p><div class="module-result">OPL培训课件｜项目闭环＋里程碑管理｜支持在线学习与打印/另存PDF</div><div class="module-actions"><a href="/knowledge/pdca-gantt-milestone-opl.html">打开单点培训课件</a></div></article>\n${end}`;

let html = fs.readFileSync(file, 'utf8');
if (!html.includes(start)) {
  if (!html.includes(anchor)) throw new Error('Terminology section anchor not found');
  html = html.replace(anchor, `${anchor}\n${block}`);
  fs.writeFileSync(file, html, 'utf8');
}

const out = fs.readFileSync(file, 'utf8');
for (const token of [start, end, 'PDCA项目管理 × 甘特图里程碑推进', '/knowledge/pdca-gantt-milestone-opl.html']) {
  if (!out.includes(token)) throw new Error(`Missing token: ${token}`);
}
console.log('PASS: PDCA × Gantt OPL registered in terminology section.');
