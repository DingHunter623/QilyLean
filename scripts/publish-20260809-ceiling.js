#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dailyIndexPath = path.join(root, 'qilylean', 'daily-insights.html');
const dailyJsonPath = path.join(root, 'qilylean', 'daily', 'index.json');
const todayPath = path.join(root, 'qilylean', 'daily', '2026-08-09.html');
const previousPath = path.join(root, 'qilylean', 'daily', '2026-08-08.html');
const terminologyPath = path.join(root, 'knowledge', 'terminology.html');
const sitemapPath = path.join(root, 'sitemap.xml');

const date = '2026-08-09';
const theme = '职场术语与目标管理';
const title = '别把“天花板”当成努力目标：上限、标杆与挑战目标必须分开';
const summary = '职场与管理语境中的“天花板”本质是上限，不等于“努努力就能达到的标准”。管理中应把 Ceiling（天花板／上限）、Benchmark（标杆）、Target（目标）与 Stretch Target（挑战目标）分开定义，否则绩效、改善和资源配置容易因为术语混用而失真。';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function write(file, content) {
  fs.writeFileSync(file, content.endsWith('\n') ? content : `${content}\n`, 'utf8');
}

assert(fs.existsSync(todayPath), '2026-08-09 daily brief page is missing');
assert(fs.existsSync(dailyIndexPath), 'daily-insights.html is missing');
assert(fs.existsSync(dailyJsonPath), 'daily index.json is missing');
assert(fs.existsSync(terminologyPath), 'terminology.html is missing');

// 1) Terminology: add Ceiling as a managed term. The existing OPL engine automatically
// generates the independent lesson link /knowledge/terminology.html?opl=Ceiling from term cards.
let terminology = fs.readFileSync(terminologyPath, 'utf8');
if (!/<div class="term-code">Ceiling<\/div>/.test(terminology)) {
  const anchor = '<article class="term-card" data-term-card>\n  <div class="term-code">SMART</div>';
  assert(terminology.includes(anchor), 'Cannot locate SMART term card insertion anchor');
  const card = `<article class="term-card" data-term-card>\n  <div class="term-code">Ceiling</div>\n  <div class="term-en">Ceiling / Upper Limit</div>\n  <h3>天花板／上限</h3>\n  <p><strong>应用场景：</strong>用于描述岗位、能力、薪资、产能、技术或商业模式在既定条件下能够达到的上限。它不同于目标值、挑战目标和标杆值；若要突破天花板，通常需要改变资源、技术、流程、组织或其他约束条件。</p>\n</article>\n`;
  terminology = terminology.replace(anchor, card + anchor);
  write(terminologyPath, terminology);
}

// 2) Daily JSON source: prepend today's canonical metadata exactly once.
let briefs = JSON.parse(fs.readFileSync(dailyJsonPath, 'utf8'));
briefs = briefs.filter((item) => item.date !== date);
briefs.unshift({ date, title, summary, dayNo: '', theme });
write(dailyJsonPath, JSON.stringify(briefs, null, 2));

// 3) Daily directory: preserve all current custom cards and supplemental training note,
// only promote 2026-08-09 to the newest position and update visible counters.
let directory = fs.readFileSync(dailyIndexPath, 'utf8');
directory = directory.replace(/2019-07-10—2026-08-08｜共2587期/g, '2019-07-10—2026-08-09｜共2588期');
directory = directory.replace(/当前显示全部 2587 期/g, '当前显示全部 2588 期');
directory = directory.replace(/<a href="\/qilylean\/daily\/2026-08-08\.html">打开最新简报<\/a>/, '<a href="/qilylean/daily/2026-08-09.html">打开最新简报</a>');
directory = directory.replace(/brief-index-card latest/g, 'brief-index-card');

const newCardMarker = 'data-brief-date="2026-08-09"';
if (!directory.includes(newCardMarker)) {
  const monthAnchor = '<div class="brief-months"><details class="brief-month" data-brief-month="2026-08" open><summary><span>2026年8月</span><b>8期</b></summary><div class="brief-grid">';
  assert(directory.includes(monthAnchor), 'Cannot locate 2026-08 month directory anchor');
  const card = `<article class="brief-index-card latest" data-brief-year="2026" data-brief-date="2026-08-09" data-brief-theme="职场术语与目标管理" data-brief-title="${title}" data-brief-summary="${summary}" data-brief-search="2026-08-09 职场术语 目标管理 Ceiling 天花板 上限 Benchmark 标杆 Target 目标 Stretch Target 挑战目标">\n  <div class="brief-index-meta"><time datetime="2026-08-09">2026-08-09</time><span>职场术语与目标管理</span></div>\n  <h2><a href="/qilylean/daily/2026-08-09.html">${title}</a></h2>\n  <div class="brief-index-actions"><a class="brief-open" href="/qilylean/daily/2026-08-09.html">打开本期简报</a><button type="button" data-brief-url="https://qilylean.com/qilylean/daily/2026-08-09.html" data-brief-title="${title}">分享本期网址</button><span class="brief-share-status" aria-live="polite"></span></div>\n</article>`;
  directory = directory.replace(monthAnchor, monthAnchor.replace('<b>8期</b>', '<b>9期</b>') + card);
} else {
  directory = directory.replace('<span>2026年8月</span><b>8期</b>', '<span>2026年8月</span><b>9期</b>');
}
assert(directory.includes('data-brief-training-note="2026-08-08"'), '8月8日培训纪要卡片 unexpectedly missing');
write(dailyIndexPath, directory);

// 4) Today's page: add standard previous/latest navigation and message area without rebuilding older briefs.
let today = fs.readFileSync(todayPath, 'utf8');
if (!today.includes('class="brief-adjacent top"')) {
  today = today.replace(
    '<section class="daily-single-section"><div class="daily-inner"><article class="post detailed" id="2026-08-09">',
    '<section class="daily-single-section"><div class="daily-inner"><nav class="brief-adjacent top" aria-label="简报翻页"><a href="/qilylean/daily/2026-08-08.html">← 上一期</a><a class="directory" href="/qilylean/daily-insights.html">返回简报目录</a><span>已是最新一期</span></nav><article class="post detailed" id="2026-08-09">'
  );
}
if (!today.includes('data-brief-feedback data-brief-date="2026-08-09"')) {
  const feedback = `<section class="brief-feedback brief-message-only" data-brief-feedback data-brief-date="2026-08-09" data-brief-title="${title}" data-brief-url="https://qilylean.com/qilylean/daily/2026-08-09.html" aria-labelledby="briefMessageTitle"><div class="brief-feedback-heading"><span>MESSAGE / DISCUSSION</span><h2 id="briefMessageTitle">留言交流</h2><p>可就本期简报留下观点、疑问或建议；如需回复，可留下称谓与联系方式。</p></div><form class="brief-inline-message" data-brief-message-form><div class="brief-inline-message-heading"><strong>本期留言</strong><span>来源简报：2026-08-09｜${title}</span></div><label>称谓（选填）<input name="name" autocomplete="name" maxlength="120" placeholder="怎么称呼你"></label><label>联系方式（选填）<input name="contact" autocomplete="email" maxlength="180" placeholder="需要回复时填写手机、微信或邮箱"></label><label class="full">留言内容<textarea name="message" minlength="4" maxlength="1800" required placeholder="写下你的观点、疑问、建议，或希望深入探讨的话题"></textarea></label><label class="brief-website-field" aria-hidden="true">网站<input name="website" tabindex="-1" autocomplete="off"></label><div class="brief-inline-message-actions"><button type="submit">提交留言</button><a href="/cooperation/">需要结合现场深入交流？进入合作咨询</a></div></form><div class="brief-feedback-status" data-brief-feedback-status role="status" aria-live="polite"></div><p class="brief-feedback-privacy">留言正文不会在公开页面展示，仅用于回复与后续交流。</p></section><nav class="brief-adjacent" aria-label="简报翻页"><a href="/qilylean/daily/2026-08-08.html">← 上一期</a><a class="directory" href="/qilylean/daily-insights.html">返回简报目录</a><span>已是最新一期</span></nav>`;
  today = today.replace('</article></div></section>', `</article>${feedback}</div></section>`);
}
if (!today.includes('/qilylean/daily-feedback.js')) {
  today = today.replace('<script src="/homepage-music.js?v=20260729-continuous-v4"></script>', '<script src="/qilylean/daily-feedback.js?v=20260729-message-only-v4"></script>\n<script src="/homepage-music.js?v=20260729-continuous-v4"></script>');
}
write(todayPath, today);

// 5) Previous brief: promote 8/9 as next issue in both navigation bars.
let previous = fs.readFileSync(previousPath, 'utf8');
previous = previous.replace(/<span>已是最新一期<\/span>/g, '<a href="/qilylean/daily/2026-08-09.html">下一期 →</a>');
write(previousPath, previous);

// 6) Sitemap: add today's canonical daily URL if absent.
if (fs.existsSync(sitemapPath)) {
  let sitemap = fs.readFileSync(sitemapPath, 'utf8');
  if (!sitemap.includes('https://qilylean.com/qilylean/daily/2026-08-09.html')) {
    const anchor = '  <url><loc>https://qilylean.com/qilylean/daily/2026-08-08.html</loc>';
    assert(sitemap.includes(anchor), 'Cannot locate 2026-08-08 sitemap anchor');
    const entry = '  <url><loc>https://qilylean.com/qilylean/daily/2026-08-09.html</loc><lastmod>2026-08-09</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n';
    sitemap = sitemap.replace(anchor, entry + anchor);
    write(sitemapPath, sitemap);
  }
}

console.log('Published 2026-08-09 Ceiling brief, terminology entry, directory metadata and navigation linkage.');