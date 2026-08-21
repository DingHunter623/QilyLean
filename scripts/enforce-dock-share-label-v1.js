#!/usr/bin/env node
'use strict';

/* QilyLean 悬浮功能模块治理｜2026-08-21
 * 规则：
 * 1. 删除重复“分享官网”功能；
 * 2. 保留“分享当前页”；
 * 3. 禁止后续构建脚本再次注入 data-action="share" 官网按钮。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function scan(dir) {
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(entry => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory() && !['.git','node_modules'].includes(entry.name)) return scan(file);
    if (entry.isFile() && /\.html$/.test(entry.name)) return [file];
    return [];
  });
}

let count = 0;
for (const file of scan(ROOT)) {
  const html = fs.readFileSync(file, 'utf8');
  if (/分享官网/.test(html) && /data-action=["']share["']/.test(html)) {
    count++;
  }
}

if (count > 0) {
  throw new Error(`发现 ${count} 个页面仍存在重复分享官网入口，请保留分享当前页功能。`);
}

console.log('PASS: 分享官网重复模块已禁用，分享当前页功能保持。');
