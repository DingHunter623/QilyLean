#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '..', 'knowledge', 'terminology.html');
let html = fs.readFileSync(file, 'utf8');

const card = `<article class="term-card" data-term-card data-keywords="A3报告 A3问题解决 精益问题解决 PDCA 现地现物 根因 对策验证 标准化">
  <div class="term-code">A3</div>
  <div class="term-en">A3 Problem Solving / A3 Report</div>
  <h3>A3问题解决／A3报告</h3>
  <p><strong>应用场景：</strong>用于把背景与现状、目标、原因分析、对策、实施计划、效果验证和标准化压缩在一张A3逻辑主线上，推动管理者与现场围绕同一事实基线完成PDCA。A3不是“填一张表”，而是结构化问题解决与辅导机制；没有现场事实、基线数据、责任人和验证证据时，不应以A3完成代替问题关闭。</p>
</article>`;

if (!/<div class="term-code">A3<\/div>/.test(html)) {
  const pdca = `<article class="term-card" data-term-card>
  <div class="term-code">PDCA</div>
  <div class="term-en">Plan-Do-Check-Act</div>
  <h3>计划—执行—检查—处置</h3>
  <p><strong>应用场景：</strong>用于把改善从方案推进到验证、纠偏和标准化，形成持续循环。</p>
</article>`;
  if (!html.includes(pdca)) throw new Error('PDCA anchor not found.');
  html = html.replace(pdca, `${pdca}\n${card}`);
}

html = html.replace(/190项中文诠释/g, '191项中文诠释');
html = html.replace(/190项专业术语/g, '191项专业术语');
html = html.replace(/190项术语/g, '191项术语');

const count = (html.match(/<article class="term-card"\b/g) || []).length;
if (count !== 191) throw new Error(`Expected 191 terminology cards after A3 insert, found ${count}.`);
if (!html.includes('<div class="term-code">A3</div>')) throw new Error('A3 card missing.');
if (!html.includes('A3不是“填一张表”')) throw new Error('A3 application boundary missing.');
fs.writeFileSync(file, html, 'utf8');
console.log(`A3 terminology published; unified terminology cards=${count}.`);
