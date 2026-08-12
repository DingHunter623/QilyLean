#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

const candidateFiles = [
  'index.html',
  'cooperation/index.html',
  'site-information-architecture-v1.js',
  'scripts/materialize-static-core-pages.js',
  'scripts/prepare-static-source-rematerialization.js',
  'site-brand-trust-v1.js',
  'docs/QILYLEAN_SITE_SYSTEM_V3.md',
  'docs/QilyLean全站业务口径规范_20260809.md'
];

function replaceAll(text, from, to) {
  return text.split(from).join(to);
}

function normalize(text) {
  let next = text;
  const replacements = [
    ['六类项目合作能力｜三类核心项目交付 + 三项数智化产品与技术能力', '六类核心能力｜统一服务于制造运营资产化'],
    ['三类核心项目交付 + 三项数智化产品与技术能力', '六类核心能力'],
    ['三类核心项目交付与三项数智化产品与技术能力', '六类核心能力'],
    ['三类核心项目交付（新工厂／新产线规划、精益改善、目视化项目）与三项数智化产品与技术能力（数字化工厂、APP软件开发、官网建设），合计六类项目合作能力', '六类核心能力：新工厂／新产线规划、精益改善、目视化项目设计与交付、数字化工厂、APP软件开发、官网建设'],
    ['围绕六类核心能力，提供三类核心项目交付（新工厂／新产线规划、精益改善、目视化）与三项数智化产品与技术能力（数字化工厂、APP软件开发、官网建设），合计六类项目合作能力。', '围绕六类核心能力，把现场事实、工程数据、精益改善、质量保证、数智固化与知识资产连成制造运营闭环。'],
    ['前三类核心项目交付直接解决工厂、产线与现场运营问题；后三项数智化产品与技术能力把制造业务逻辑进一步沉淀为数字化系统、软件工具与专业互联网载体。', '六类能力不是分成两个阵营，而是沿同一制造运营价值链协同：从工厂与产线规划、现场改善和目视化，到数字化系统、轻量软件与专业互联网资产。'],
    ['六类能力采用“3+3”结构：前三类为核心项目交付，后三项为数智化产品与技术能力；', '六类能力采用统一编号与统一项目闭环，不再使用“3+3”作为业务分类；'],
    ['六类项目合作能力采用“3+3”结构', '六类核心能力采用统一制造运营闭环'],
    ['COOPERATION CAPABILITIES｜核心项目交付 + 数智化技术能力', 'CORE CAPABILITIES｜六类能力，一个制造运营闭环'],
    ['三类核心项目交付｜三项数智化产品与技术能力｜六类项目合作能力', '制造运营资产化｜六类核心能力｜问题到组织复制'],
    ['形成三类核心项目交付与三项数智化产品与技术能力，合计六类项目合作能力', '形成六类核心能力，并以同一制造运营闭环推进'],
    ['核心项目交付｜01', '核心能力｜01'],
    ['核心项目交付｜02', '核心能力｜02'],
    ['核心项目交付｜03', '核心能力｜03'],
    ['数智化产品与技术能力｜04', '核心能力｜04'],
    ['数智化产品与技术能力｜05', '核心能力｜05'],
    ['数智化产品与技术能力｜06', '核心能力｜06'],
    ['CORE PROJECT DELIVERY 01', 'CORE CAPABILITY 01'],
    ['CORE PROJECT DELIVERY 02', 'CORE CAPABILITY 02'],
    ['CORE PROJECT DELIVERY 03', 'CORE CAPABILITY 03'],
    ['DIGITAL PRODUCT & TECH 04', 'CORE CAPABILITY 04'],
    ['DIGITAL PRODUCT & TECH 05', 'CORE CAPABILITY 05'],
    ['DIGITAL PRODUCT & TECH 06', 'CORE CAPABILITY 06']
  ];
  for (const [from, to] of replacements) next = replaceAll(next, from, to);

  next = next.replace(/六类项目合作能力｜六类核心能力/g, '六类核心能力｜统一服务于制造运营资产化');
  next = next.replace(/六类能力采用[“"]?3\+3[”"]?结构[^。；;]*[。；;]/g, '六类能力采用统一编号与统一项目闭环，不再使用“3+3”作为业务分类；');
  next = next.replace(/前三类(?:为|是)[^；。]*；?后三(?:项|类)[^。]*。/g, '六类能力共同服务于问题定义、数据基线、改善验证、标准固化、系统运行与组织复制。');
  next = next.replace(/三类核心项目交付（[^）]*）与三项数智化产品与技术能力（[^）]*），?合计六类项目合作能力/g, '六类核心能力统一服务于制造运营资产化');
  return next;
}

function strengthenHome(html) {
  let next = html;
  next = next.replace(
    /<meta name="description" content="[^"]*">/i,
    '<meta name="description" content="QilyLean｜启力精益把制造现场问题转化为可计算、可验证、可固化、可复制的运营资产，围绕新工厂／新产线规划、精益改善、目视化、数字化工厂、APP软件开发与官网建设六类核心能力开展实践与合作。">'
  );
  next = next.replace(
    /<meta property="og:title" content="[^"]*">/i,
    '<meta property="og:title" content="QilyLean｜启力精益｜制造运营资产化与六类核心能力">'
  );
  next = next.replace(
    /<meta property="og:description" content="[^"]*">/i,
    '<meta property="og:description" content="从现场事实、工程数据和精益改善，到质量保证、数智固化与知识资产，QilyLean以六类核心能力形成制造运营闭环。">'
  );
  next = next.replace(
    /<meta name="twitter:description" content="[^"]*">/i,
    '<meta name="twitter:description" content="把制造现场问题转化为可计算、可验证、可固化、可复制的运营资产。">'
  );
  next = next.replace(
    /<span class="qily-ia-kicker">CORE CAPABILITIES｜六类能力，一个制造运营闭环<\/span><h2>[^<]*<\/h2>/,
    '<span class="qily-ia-kicker">CORE CAPABILITIES｜六类能力，一个制造运营闭环</span><h2>六类核心能力｜不是六块业务孤岛，而是一条制造运营价值链</h2>'
  );
  return next;
}

function main() {
  const changed = [];
  for (const rel of candidateFiles) {
    const file = path.join(root, rel);
    if (!fs.existsSync(file)) continue;
    const before = fs.readFileSync(file, 'utf8');
    let after = normalize(before);
    if (rel === 'index.html') after = strengthenHome(after);
    if (after !== before) {
      fs.writeFileSync(file, after, 'utf8');
      changed.push(rel);
    }
  }

  const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const cooperation = fs.readFileSync(path.join(root, 'cooperation', 'index.html'), 'utf8');
  const combined = `${home}\n${cooperation}`;
  if (!home.includes('六类核心能力')) throw new Error('Homepage six-core capability statement is missing');
  if (!home.includes('制造运营资产')) throw new Error('Homepage manufacturing-operations asset positioning is missing');
  if (/三类核心项目交付(?:（[^）]*）)?\s*[+＋与]\s*三项数智化产品与技术能力/.test(combined)) throw new Error('Legacy 3+3 taxonomy remains in public core pages or structured data');
  if (/六类能力采用[“"]?3\+3/.test(combined)) throw new Error('Legacy 3+3 taxonomy rule remains in public core pages');
  ['新工厂／新产线规划', '精益改善', '目视化', '数字化工厂', 'APP软件开发', '官网建设'].forEach((name) => {
    if (!combined.includes(name)) throw new Error(`Six-core capability missing: ${name}`);
  });
  process.stdout.write(changed.length ? `Normalized six-core system: ${changed.join(', ')}\n` : 'Six-core system already normalized.\n');
}

main();
