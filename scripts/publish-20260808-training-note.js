#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const target = path.join(root, 'qilylean', 'daily-insights.html');
const marker = 'data-brief-training-note="2026-08-08"';
const originalTitle = '异常不过夜：从 Andon 暴露、分层响应到复发验证，建立现场异常闭环';
const trainingTitle = '培训纪要｜团队建设与管理执行力提升：从目标到标准，从执行到PDCA闭环';

const card = `<article class="brief-index-card training-note-card" ${marker} data-publish-sequence="2" data-brief-date="2026-08-08" data-brief-theme="培训纪要｜组织管理" data-brief-title="${trainingTitle}" data-brief-summary="2026年8月8日公司团队建设与管理执行力提升培训纪要；作为当日后发布的培训记录独立保留。" data-brief-search="2026-08-08 培训纪要 组织管理 SMART 岗位说明书 流程 SOP PDCA 执行力 团队建设">
  <div class="brief-index-meta"><time datetime="2026-08-08">2026-08-08</time><span>培训纪要 · 同日第2条</span></div>
  <h2><a href="/qilylean/training/2026-08-08.html">${trainingTitle}</a></h2>
  <div class="brief-index-actions"><a class="brief-open" href="/qilylean/training/2026-08-08.html">打开培训纪要</a><button type="button" data-brief-url="https://qilylean.com/qilylean/training/2026-08-08.html" data-brief-title="${trainingTitle}">分享培训纪要网址</button><span class="brief-share-status" aria-live="polite"></span></div>
</article>`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

let html = fs.readFileSync(target, 'utf8');
assert(html.includes(originalTitle), '8月8日原简报标题不存在：停止发布');
assert(html.includes('data-brief-date="2026-08-08"'), '8月8日原简报目录卡片不存在');

// 同日按“后发布优先”展示：培训纪要为第2条，因此目录位置放在原《今日简报》之前。
// 每次重建先移除旧培训纪要卡片，再按固定位置重新注入，防止自动构建回退。
const trainingCard = /<article class="brief-index-card training-note-card"[^>]*data-brief-training-note="2026-08-08"[\s\S]*?<\/article>\s*/g;
html = html.replace(trainingCard, '');

const originalCard = /<article class="brief-index-card(?: latest)?"[^>]*data-brief-date="2026-08-08"[\s\S]*?<\/article>/;
const match = html.match(originalCard);
assert(match, '无法定位8月8日原简报卡片');
assert(match[0].includes(originalTitle), '8月8日原简报卡片识别异常：停止注入');

html = html.replace(match[0], `${card}\n${match[0]}`);

const originalPos = html.indexOf(originalTitle);
const trainingPos = html.indexOf(marker);
assert(trainingPos >= 0 && originalPos > trainingPos, '展示顺序错误：同日后发布的培训纪要必须位于原简报之前');
assert(!html.includes('<strong>发布顺序：</strong>'), '培训纪要目录卡片不得保留发布顺序说明句');

fs.writeFileSync(target, html, 'utf8');
process.stdout.write('Canonicalized 2026-08-08 display order: training note first, original daily brief second.\n');
