#!/usr/bin/env node
'use strict';

/*
 * Compatibility entrypoint retained for historical workflows.
 * R2 (2026-08-12)废止“背景音乐连续播放”为全站刚性基线。
 * 旧工作流即使继续调用本文件，也只能物化：
 *   - 深色动作可读性；
 *   - 原生页面导航 + 同源预取 V5；
 *   - R2 首屏/缓存/导航稳定性。
 * 不得重新注入 homepage-music-v5.js 或跨页软交换运行时。
 */
require('./publish-r2-runtime-stability.js');
