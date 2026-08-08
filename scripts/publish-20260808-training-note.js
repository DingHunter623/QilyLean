#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const target = path.join(root, 'qilylean', 'daily-insights.html');
const marker = 'data-brief-training-note="2026-08-08"';
const originalTitle = '异常不过夜：从 Andon 暴露、分层响应到复发验证，建立现场异常闭环';
const trainingTitle = '培训纪要｜团队建设与管理执行力提升：从目标到标准，从执行到PDCA闭环';

const card = `<article class="brief-index-card training-note-card" ${marker} data-publish-sequence="2" data-brief-date="2026-08-08" data-brief-theme="培训纪要｜组织管理" data-brief-title="${trainingTitle}" data-brief-summary="2026年8月8日公司团队建设与管理执行力提升培训纪要；在当日原《今日简报》之后发布，作为同日附录独立保留。" data-brief-search="2026-08-08 培训纪要 组织管理 SMART 岗位说明书 流程 SOP PDCA 执行力 团队建设">
  <div class="brief-index-meta"><time datetime="2026-08-08">2026-08-08</time><span>培训纪要 · 同日第2条</span></div>
  <h2><a href="/qilylean/training/2026-08-08.html">${trainingTitle}</a></h2>
  <p style="margin:.55rem 0 0;color:#526967;line-height:1.72"><strong>发布顺序：</strong>先8月8日原《今日简报》，后本培训纪要；两篇独立保留，不相互替代。</p>
  <div class="brief-index-actions"><a class="brief-open" href="/qilylean/training/2026-08-08.html">打开培训纪要</a><button type="button" data-brief-url="https://qilylean.com/qilylean/training/2026-08-08.html" data-brief-title="${trainingTitle}">分享培训纪要网址</button><span class="brief-share-status" aria-live="polite"></span></div>
</article>`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

let html = fs.readFileSync(target, 'utf8');
assert(html.includes(originalTitle), '8月8日原简报标题不存在：禁止发布培训纪要覆盖版');
assert(html.includes('data-brief-date="2026-08-08"'), '8月8日原简报目录卡片不存在');

// 每次都先移除旧培训纪要卡片，再严格插入到原8月8日简报卡片之后。
// 这样即使后续目录被重建或人工调整，也会恢复“先今日简报、后培训纪要”的固定顺序。
const trainingCard = /<article class="brief-index-card training-note-card"[^>]*data-brief-training-note="2026-08-08"[\s\S]*?<\/article>\s*/g;
html = html.replace(trainingCard, '');

const originalCard = /<article class="brief-index-card(?: latest)?"[^>]*data-brief-date="2026-08-08"[\s\S]*?<\/article>/;
const match = html.match(originalCard);
assert(match, '无法定位8月8日原简报卡片');
assert(match[0].includes(originalTitle), '8月8日目录首卡不是原异常管理简报：停止注入');

html = html.replace(match[0], `${match[0]}\n${card}`);

const originalPos = html.indexOf(originalTitle);
const trainingPos = html.indexOf(marker);
assert(originalPos >= 0 && trainingPos > originalPos, '发布顺序错误：培训纪要必须位于8月8日原简报之后');

fs.writeFileSync(target, html, 'utf8');
process.stdout.write('Canonicalized 2026-08-08 order: original daily brief first, training note second.\n');
