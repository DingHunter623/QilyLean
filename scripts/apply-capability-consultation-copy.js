#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function update(relativePath, transform) {
  const file = path.join(root, relativePath);
  const before = fs.readFileSync(file, 'utf8');
  const after = transform(before);
  if (after !== before) fs.writeFileSync(file, after);
}

update('cooperation/index.html', (html) => html
  .replaceAll('预约15分钟问题初筛', '预约60分钟问题初筛')
  .replaceAll('15分钟问题初筛', '60分钟问题初筛')
  .replaceAll('15分钟初筛', '60分钟初筛'));

update('projects/index.html', (html) => html
  .replaceAll('15分钟问题初筛', '60分钟问题初筛')
  .replaceAll('15分钟初筛', '60分钟初筛'));

update('capabilities/index.html', (html) => {
  if (html.includes('<a href="/projects/">代表项目</a>')) return html;
  const anchor = '          <a href="#mechanism">项目机制</a>';
  if (!html.includes(anchor)) throw new Error('未找到能力画像中的“项目机制”入口');
  return html.replace(anchor, `${anchor}\n          <a href="/projects/">代表项目</a>`);
});

const cooperation = fs.readFileSync(path.join(root, 'cooperation/index.html'), 'utf8');
const projects = fs.readFileSync(path.join(root, 'projects/index.html'), 'utf8');
const capabilities = fs.readFileSync(path.join(root, 'capabilities/index.html'), 'utf8');

if (/15分钟问题初筛|预约15分钟问题初筛|15分钟初筛/.test(cooperation + projects)) {
  throw new Error('仍存在15分钟初筛关联文案');
}
if (!cooperation.includes('60分钟问题初筛') || !projects.includes('60分钟问题初筛')) {
  throw new Error('60分钟问题初筛未完整同步');
}
if (!capabilities.includes('<a href="#mechanism">项目机制</a>\n          <a href="/projects/">代表项目</a>')) {
  throw new Error('代表项目未添加在项目机制右侧');
}

process.stdout.write('Applied 60-minute consultation copy and capability representative-project entry.\n');
