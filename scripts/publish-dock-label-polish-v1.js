#!/usr/bin/env node
'use strict';

/* QilyLean dock publisher compatibility wrapper｜2026-08-19
 * 历史脚本名称保留，实际只执行“分享官网”专项治理。
 * 不再顺带改写正文、导航、其它运行时资产或业务术语，避免越界整改。
 */
const path = require('path');
const cp = require('child_process');

const target = path.join(__dirname, 'enforce-dock-share-label-v1.js');
const result = cp.spawnSync(process.execPath, [target], {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit'
});
if (result.status !== 0) process.exit(result.status || 1);
