#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');

function tracked(globs) {
  const args = ['ls-files', ...globs];
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    .split(/\r?\n/).filter(Boolean);
}

const publicTextFiles = [...new Set([
  ...tracked(['*.html', '*.htm', '*.svg']),
  'robots.txt',
  'homepage-music.js',
  'global-knowledge/knowledge-dock-v1.js',
  'site-information-architecture-v1.js',
  'site-certificate-facts-v2.js',
  'site-integrity-hotfix-v1.js',
  'qilylean/site-data.json',
].filter((p) => fs.existsSync(path.join(root, p))))];

const banned = [
  'QilyLean 运维管理后台',
  '管理口令只保存在',
  '知识隔离视图',
  '隔离资料目录',
  '白名单隔离阅读器',
  '本隔离区',
  '不继承国际站商业导航',
  '不提供经营性功能',
  '不进入商业导航',
  '非商业数字知识区',
  '原国际站主导航',
  '本页只提取既有术语卡片正文',
  '只呈现白名单知识正文',
  '知识与经营功能物理隔离',
  'Global Knowledge 隔离知识区',
  '三项增强能力，不与三大核心业务同级',
  '在官网信息架构上不再称为',
  'PROFESSIONAL LABELS｜原首页标签统一归档',
  '首页不再平铺大量缩写和工具名称',
  'PUBLIC REDACTION',
  '正式洽谈核验：',
  '官网仅开放受控在线预览',
  '不在公开端展示受控原档',
  '公开资料必须脱敏',
  '国际站当前 8 项代表项目均已在中国站转化',
  '已全部映射为中国站个人实践档案',
  '不引入国际站经营功能',
  '首页仅展示精选入口',
  '不设置国际站商务页面导流',
  '个人非经营知识站',
  '页面定位：',
  '展示经历，不包装成商业案例',
  '中国站采用无二维码版本',
  '不设置图片跳转入口',
  '颁奖照片可以展示，但必须说明它证明的是什么',
];

const findings = [];
for (const rel of publicTextFiles) {
  const abs = path.join(root, rel);
  let text;
  try { text = fs.readFileSync(abs, 'utf8'); } catch (_) { continue; }
  for (const phrase of banned) {
    if (text.includes(phrase)) findings.push({ rel, phrase });
  }
}

for (const rel of ['admin.html', 'qily-admin.js']) {
  if (fs.existsSync(path.join(root, rel))) {
    findings.push({ rel, phrase: 'public static admin surface must not exist' });
  }
}

if (findings.length) {
  console.error('ERROR: public-facing operational/admin copy regression detected:');
  for (const item of findings) console.error(`- ${item.rel}: ${item.phrase}`);
  process.exit(1);
}

console.log(`Public copy governance passed: ${publicTextFiles.length} public-facing HTML/SVG/runtime data files checked; no operational/admin wording found.`);
