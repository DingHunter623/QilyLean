#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');

const replacements = {
  'projects/index.html': [
    [
      '项目启动后3个月完成施工落地、系统联调及交付验收；取放缩短至1–5分钟，年创效约300万元。',
      '项目启动后3个月内由供应商完成施工安装与系统联调；本人主导方案设计、供应商技术对接、跨方协调与验收推进。取放时间缩短至1–5分钟，年创效约300万元。'
    ]
  ],
  'projects/mold-warehouse/index.html': [
    [
      '按分级库位方案完成货架落地、安全边界与现场作业验证。',
      '供应商按分级库位方案完成货架安装；本人主导方案设计、技术评审、安全边界确认与现场作业验证。'
    ],
    [
      '项目启动后3个月内完成施工落地、系统联调、交付验收，使长期停滞的项目快速转化为可运行成果。',
      '项目启动后3个月内由供应商完成施工安装与系统联调；本人主导技术方案、供应商对接、跨方协调与验收推进，使长期停滞的项目转化为可运行成果。'
    ]
  ],
  'moments/work/index.html': [
    [
      '为规划优化和后续落地提供依据。',
      '为规划优化、外协设计衔接、实施协调与后续验收提供依据。'
    ],
    [
      '为新工厂规划方案的深化与落地提供依据。',
      '为新工厂规划方案深化、外协设计衔接与实施推进提供依据。'
    ]
  ],
  'knowledge/index.html': [
    ['12周落地路线', '12周实施推进路线']
  ],
  'qilylean/production-operations-organization.html': [
    ['12周组织落地路线', '12周组织实施推进路线'],
    ['12周落地路线', '12周实施推进路线']
  ],
  'qilylean/public-copy-polish.js': [
    [
      '沉淀可理解、可借鉴、可落地的制造改善方法。',
      '沉淀可理解、可借鉴、可执行、可验证、可复用的制造改善方法。'
    ]
  ],
  'cloudflare-worker/worker.js': [
    [
      '提供更深入、工程化、可落地的分析。',
      '提供更深入、工程化、可执行且可验证的分析。'
    ]
  ],
  'improvements/visual/index.html': [
    ['四、落地场景：从公司级看板到工位级细节', '四、应用场景：从公司级看板到工位级细节']
  ],
  'improvements/vsm/index.html': [
    [
      '汽车电子装配行业VSM价值流分析的落地方法',
      '汽车电子装配行业VSM价值流分析的实施与验证方法'
    ],
    ['VSM价值流分析的落地关键', 'VSM价值流分析的实施关键']
  ],
  'improvements/index.html': [
    [
      '汽车电子装配行业VSM价值流分析的落地方法',
      '汽车电子装配行业VSM价值流分析的实施与验证方法'
    ]
  ],
  'qilylean/lean-knowledge.html': [
    ['可落地动作', '可执行动作'],
    ['精益工具应用与项目落地', '精益工具应用与项目实施'],
    ['真正落地时', '真正实施时']
  ],
  'qilylean/terminology-v2.js': [
    ['核心观点、可落地动作和原文链接', '核心观点、可执行动作和原文链接']
  ]
};

const forbiddenPatterns = [
  /保证落地/g,
  /承诺落地/g,
  /独立落地/g,
  /全过程落地/g,
  /端到端落地/g,
  /一站式落地/g,
  /施工落地/g,
  /货架落地/g,
  /后续落地/g,
  /深化与落地/g,
  /可落地的制造改善方法/g,
  /可落地的分析/g,
  /12周(?:组织)?落地路线/g,
  /可落地动作/g
];

const requiredPhrases = {
  'projects/index.html': [
    '由供应商完成施工安装与系统联调',
    '本人主导方案设计、供应商技术对接、跨方协调与验收推进'
  ],
  'projects/mold-warehouse/index.html': [
    '供应商按分级库位方案完成货架安装',
    '本人主导方案设计、技术评审、安全边界确认与现场作业验证',
    '本人主导技术方案、供应商对接、跨方协调与验收推进'
  ],
  'moments/work/index.html': [
    '外协设计衔接、实施协调与后续验收',
    '外协设计衔接与实施推进'
  ],
  'knowledge/index.html': ['12周实施推进路线'],
  'qilylean/production-operations-organization.html': [
    '12周组织实施推进路线',
    '12周实施推进路线'
  ],
  'qilylean/public-copy-polish.js': ['可执行、可验证、可复用的制造改善方法'],
  'cloudflare-worker/worker.js': ['工程化、可执行且可验证的分析'],
  'improvements/visual/index.html': ['四、应用场景：从公司级看板到工位级细节'],
  'improvements/vsm/index.html': [
    '汽车电子装配行业VSM价值流分析的实施与验证方法',
    'VSM价值流分析的实施关键'
  ],
  'improvements/index.html': ['汽车电子装配行业VSM价值流分析的实施与验证方法'],
  'qilylean/lean-knowledge.html': ['可执行动作', '精益工具应用与项目实施']
};

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function write(relativePath, content) {
  fs.writeFileSync(path.join(root, relativePath), content, 'utf8');
}

function replaceAllLiteral(source, from, to) {
  return source.split(from).join(to);
}

function normalizeFile(relativePath, rules) {
  const original = read(relativePath);
  let next = original;
  for (const [from, to] of rules) {
    if (!next.includes(from) && !next.includes(to)) {
      throw new Error(`${relativePath}: expected source or normalized phrase missing: ${from}`);
    }
    next = replaceAllLiteral(next, from, to);
  }
  return { original, next };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const outputs = new Map();
const changed = [];
for (const [relativePath, rules] of Object.entries(replacements)) {
  const result = normalizeFile(relativePath, rules);
  outputs.set(relativePath, result.next);
  if (result.next !== result.original) changed.push(relativePath);
}

for (const [relativePath, phrases] of Object.entries(requiredPhrases)) {
  const content = outputs.get(relativePath) || read(relativePath);
  for (const phrase of phrases) {
    assert(content.includes(phrase), `${relativePath}: required role-boundary phrase missing: ${phrase}`);
  }
}

for (const [relativePath, content] of outputs.entries()) {
  for (const pattern of forbiddenPatterns) {
    pattern.lastIndex = 0;
    const matched = content.match(pattern);
    assert(!matched, `${relativePath}: risky unqualified wording remains: ${matched && matched[0]}`);
  }
}

const moldCopy = outputs.get('projects/mold-warehouse/index.html');
assert(moldCopy.includes('供应商') && moldCopy.includes('本人主导'), 'mold warehouse: external implementation and personal role must both be explicit');
assert(!moldCopy.includes('由本人完成施工'), 'mold warehouse: must not imply personal construction execution');

const projectCopy = outputs.get('projects/index.html');
assert(projectCopy.includes('供应商') && projectCopy.includes('本人主导'), 'project list: supplier implementation and personal leadership must both be explicit');

if (checkOnly) {
  if (changed.length) {
    throw new Error(`Role-boundary copy is not current: ${changed.join(', ')}`);
  }
  process.stdout.write(`Role-boundary audit passed for ${outputs.size} public source files; no changes required.\n`);
  process.exit(0);
}

for (const relativePath of changed) write(relativePath, outputs.get(relativePath));
process.stdout.write(`Role-boundary copy normalized in ${changed.length} file(s): ${changed.join(', ') || 'none'}.\n`);
