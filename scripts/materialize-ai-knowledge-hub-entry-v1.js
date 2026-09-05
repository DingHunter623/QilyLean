#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const file = path.join(root, 'knowledge', 'index.html');
let html = fs.readFileSync(file, 'utf8');

const START = '<!-- QILY-AI-KNOWLEDGE-FRONTEND:START -->';
const END = '<!-- QILY-AI-KNOWLEDGE-FRONTEND:END -->';
const anchor = '<!-- SITE-METADATA:KNOWLEDGE-STATS:END -->';

const block = `${START}
<section class="module-section alt" id="ai-manufacturing-knowledge"><div class="module-inner">
<div class="module-heading"><span class="module-eyebrow">AI × MANUFACTURING KNOWLEDGE</span><h2>AI赋能制造知识库</h2><p>面向工业工程 IE、精益生产 Lean、智能制造、新工厂规划、制造改善方法体系的企业级知识资产库。</p></div>
<article class="module-card"><small>QilyLean · AI Manufacturing Knowledge Asset</small><h3>从制造问题进入可复用知识资产</h3><p>以现场事实、工程数据和制造改善方法为基础，组织AI辅助检索、分析、方案形成与知识复用；前台只呈现正式知识资产页面，仓库README与开源归属文件继续作为管理资料保留。</p><div class="module-actions"><a href="/AI-Knowledge/">进入AI赋能制造知识库</a></div></article>
</div></section>
${END}`;

const markerPattern = new RegExp(`${START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n?`, 'g');
html = html.replace(markerPattern, '');
if (!html.includes(anchor)) throw new Error('Knowledge hub metadata anchor not found');
html = html.replace(anchor, `${anchor}\n\n${block}`);

if (!html.includes('href="/AI-Knowledge/"')) throw new Error('Knowledge hub AI public route was not materialized');
if (!html.includes('>AI赋能制造知识库<')) throw new Error('Knowledge hub public AI label was not materialized');
if (html.includes('href="/AI-Knowledge/README.md"')) throw new Error('Knowledge hub still exposes README.md as a frontend route');
if (html.includes('>AI Knowledge Base<')) throw new Error('Knowledge hub still exposes the old English label');

fs.writeFileSync(file, html, 'utf8');
console.log('Knowledge hub AI manufacturing entry PASS');
