#!/usr/bin/env node
'use strict';

// One-time targeted update: add minimum and recommended Cpk sample-size guidance.
const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '..', 'knowledge', 'terminology.html');
let html = fs.readFileSync(file, 'utf8');

const oldText = '<p><strong>应用场景：</strong>Cp＝(USL−LSL)/(6σ)，反映过程波动宽度相对规格宽度的潜在能力；Cpk＝min[(USL−μ)/(3σ)，(μ−LSL)/(3σ)]，同时考虑均值偏移后的实际能力。常用参考：Cpk＜1.00为能力不足；1.00≤Cpk＜1.33为临界、需改善；1.33≤Cpk＜1.67通常具备一般量产能力；Cpk≥1.67表示能力较好，关键特性或新过程常采用更高目标；Cpk≥2.00表示高能力。使用前应确认过程稳定、数据分布和测量系统可信，最终判定以客户特殊要求、产品风险与企业标准为准。</p>';

const newText = '<p><strong>应用场景：</strong>Cp＝(USL−LSL)/(6σ)，反映过程波动宽度相对规格宽度的潜在能力；Cpk＝min[(USL−μ)/(3σ)，(μ−LSL)/(3σ)]，同时考虑均值偏移后的实际能力。<strong>数据量要求：</strong>纯数学计算至少需要2个不同数值才能估计样本标准差，但该结果不具备过程能力判定意义；初步评估宜至少取得约50个相互独立、来自稳定过程的数据；正式过程能力研究建议不少于100个数据，并覆盖正常生产中的不同时间、班次、人员、设备和材料波动。若数据全相同导致标准差为0，或过程尚未受控、量测系统不可信，则Cpk不能作为有效能力结论。常用参考：Cpk＜1.00为能力不足；1.00≤Cpk＜1.33为临界、需改善；1.33≤Cpk＜1.67通常具备一般量产能力；Cpk≥1.67表示能力较好，关键特性或新过程常采用更高目标；Cpk≥2.00表示高能力。最终判定以客户特殊要求、产品风险与企业标准为准。</p>';

if (!html.includes(oldText)) throw new Error('未找到现有Cp/Cpk术语内容，未执行替换。');
html = html.replace(oldText, newText);
html = html.replace('/site-shell.css?v=20260724-terminology-v3', '/site-shell.css?v=20260724-terminology-v4');

if (!html.includes('正式过程能力研究建议不少于100个数据')) throw new Error('Cpk样本量内容写入失败。');

fs.writeFileSync(file, html);
process.stdout.write('Cp/Cpk sample-size guidance added.\n');
