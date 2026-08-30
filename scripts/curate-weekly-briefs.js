#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { careerTimeline } = require('./daily-engineering-archive');

const root = path.resolve(__dirname, '..');
const qily = path.join(root, 'qilylean');
const dailyDir = path.join(qily, 'daily');
const policyPath = path.join(qily, 'brief-curation-policy.json');
const baseUrl = 'https://qilylean.com';
const policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
const protectedDates = new Set(policy.protected_dates || []);

function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);
}

function xml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
  })[ch]);
}

function plain(value) {
  return String(value || '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function capture(html, re, fallback = '') {
  const match = html.match(re);
  return match ? plain(match[1]) : fallback;
}

function mondayKey(date) {
  const value = new Date(`${date}T00:00:00Z`);
  const day = value.getUTCDay() || 7;
  value.setUTCDate(value.getUTCDate() - day + 1);
  return value.toISOString().slice(0, 10);
}

const weightedTerms = [
  ['NPI', 18], ['EVT', 12], ['DVT', 12], ['PVT', 12], ['MP', 10],
  ['VSM', 14], ['SMED', 14], ['OEE', 13], ['PFMEA', 13], ['FMEA', 10],
  ['APQP', 12], ['PPAP', 12], ['SPC', 11], ['MSA', 11], ['Poka-Yoke', 12],
  ['标准工时', 14], ['节拍', 11], ['产能', 11], ['线平衡', 13], ['瓶颈', 11],
  ['WIP', 10], ['Lead Time', 10], ['FPY', 10], ['DPPM', 10], ['COPQ', 10],
  ['Andon', 12], ['安灯', 10], ['阶段门', 12], ['Pilot', 10], ['验收', 10],
  ['RACI', 10], ['RAID', 10], ['PMO', 12], ['Layout', 10], ['物流', 8],
  ['ERP', 9], ['MES', 10], ['APS', 10], ['数字化', 7], ['主数据', 10],
  ['质量', 7], ['防错', 10], ['工艺', 6], ['工程', 5], ['PQCD', 10],
  ['PDCA', 7], ['Kaizen', 7], ['TPM', 9], ['CT', 6], ['TT', 6], ['UPPH', 9]
];

const genericTerms = ['鸡汤', '励志', '情绪', '心态', '人生感悟', '努力就好', '职场金句'];

function scoreRecord(record) {
  const html = record.html;
  const text = plain(html);
  let score = 0;
  const h3 = (html.match(/<h3\b/gi) || []).length;
  const tables = (html.match(/<table\b/gi) || []).length;
  const figures = (html.match(/<figure\b/gi) || []).length;
  const checklists = (html.match(/(?:checklist|brief-callout|brief-learning-grid|owner-grid|value-chain)/g) || []).length;
  const lists = (html.match(/<(?:ol|ul)\b/gi) || []).length;
  score += Math.min(h3, 12) * 4;
  score += Math.min(tables, 5) * 11;
  score += Math.min(figures, 5) * 9;
  score += Math.min(checklists, 7) * 5;
  score += Math.min(lists, 6) * 2;
  score += Math.min(Math.floor(text.length / 900), 12) * 2;
  if (/data-one-point-training="v1"/.test(html)) score += 8;
  if (/(证据|基线|验证|退出准则|关闭证据|标准固化|责任边界|交付物)/.test(text)) score += 12;
  if (/(公式|口径|分母|样本|趋势|Pareto|能力指数|节拍|工时|产能)/.test(text)) score += 8;
  for (const [term, weight] of weightedTerms) {
    const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    if (re.test(`${record.title} ${record.theme} ${text}`)) score += weight;
  }
  for (const term of genericTerms) if (text.includes(term)) score -= 20;
  if (/工程者手记/.test(text) && !/(数据|验证|标准|工艺|质量|产能|项目)/.test(record.title)) score -= 5;
  if (protectedDates.has(record.date)) score += 10000;
  return score;
}

function readRecords() {
  return fs.readdirSync(dailyDir)
    .filter((name) => /^\d{4}-\d{2}-\d{2}\.html$/.test(name))
    .map((name) => {
      const date = name.slice(0, 10);
      const html = fs.readFileSync(path.join(dailyDir, name), 'utf8');
      const title = capture(html, /<h2[^>]*>([\s\S]*?)<\/h2>/i, capture(html, /<title>([\s\S]*?)<\/title>/i, date).replace(/｜今日简报.*$/, ''));
      const summary = capture(html, /<article\b[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i, '打开本期简报查看完整内容。');
      const dateLine = capture(html, /<div class="date"[^>]*>([\s\S]*?)<\/div>/i, date);
      const theme = dateLine.replace(date, '').replace(/^[｜|·\s]+/, '').trim() || '制造工程';
      return { date, html, title, summary, theme };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

function selectWeekly(records) {
  const groups = new Map();
  for (const record of records) {
    const key = mondayKey(record.date);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  }
  const selected = [];
  const decisions = [];
  for (const [week, items] of Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
    const protectedInWeek = items.filter((item) => protectedDates.has(item.date));
    const scored = items.map((item) => ({ ...item, score: scoreRecord(item) })).sort((a, b) => b.score - a.score || b.date.localeCompare(a.date));
    const keep = protectedInWeek.length ? scored.filter((item) => protectedDates.has(item.date)) : [scored[0]];
    selected.push(...keep);
    decisions.push({
      week,
      candidates: items.length,
      kept: keep.map((item) => ({ date: item.date, title: item.title, score: item.score, protected: protectedDates.has(item.date) })),
      removed_count: items.length - keep.length
    });
  }
  return {
    selected: selected.sort((a, b) => b.date.localeCompare(a.date)),
    decisions
  };
}

function adjacentNav(record, records, index, className) {
  const newer = index > 0 ? records[index - 1] : null;
  const older = index + 1 < records.length ? records[index + 1] : null;
  const olderLink = older ? `<a href="/qilylean/daily/${older.date}.html">← 上一期</a>` : '<span>已是最早一期</span>';
  const newerLink = newer ? `<a href="/qilylean/daily/${newer.date}.html">下一期 →</a>` : '<span>已是最新一期</span>';
  return `<nav class="${className}" aria-label="简报翻页">${olderLink}<a class="directory" href="/qilylean/daily-insights.html">返回精选简报目录</a>${newerLink}</nav>`;
}

function briefFeedback(record) {
  const url = `${baseUrl}/qilylean/daily/${record.date}.html`;
  return `<section class="brief-feedback brief-message-only" data-brief-feedback data-brief-date="${record.date}" data-brief-title="${esc(record.title)}" data-brief-url="${url}" aria-labelledby="briefMessageTitle"><div class="brief-feedback-heading"><span>MESSAGE / DISCUSSION</span><h2 id="briefMessageTitle">留言交流</h2><p>可就本期简报留下观点、疑问或建议；如需回复，可留下称谓与联系方式。</p></div><form class="brief-inline-message" data-brief-message-form><div class="brief-inline-message-heading"><strong>本期留言</strong><span>来源简报：${record.date}｜${esc(record.title)}</span></div><label>称谓（选填）<input name="name" autocomplete="name" maxlength="120" placeholder="怎么称呼你"></label><label>联系方式（选填）<input name="contact" autocomplete="email" maxlength="180" placeholder="需要回复时填写手机、微信或邮箱"></label><label class="full">留言内容<textarea name="message" minlength="4" maxlength="1800" required placeholder="写下你的观点、疑问、建议，或希望深入探讨的话题"></textarea></label><label class="brief-website-field" aria-hidden="true">网站<input name="website" tabindex="-1" autocomplete="off"></label><div class="brief-inline-message-actions"><button type="submit">提交留言</button><a href="/cooperation/">需要结合现场深入交流？进入合作咨询</a></div></form><div class="brief-feedback-status" data-brief-feedback-status role="status" aria-live="polite"></div><p class="brief-feedback-privacy">留言正文不会在公开页面展示，仅用于回复与后续交流。</p></section>`;
}

function ensureBriefFeedback(html, record) {
  let next = html;
  if (!next.includes('data-brief-message-form')) {
    const articleStart = next.search(/<article\b[^>]*class="[^"]*\bpost\b[^"]*"/i);
    const articleEnd = articleStart >= 0 ? next.indexOf('</article>', articleStart) : -1;
    if (articleEnd < 0) throw new Error(`Cannot insert brief feedback after article: ${record.date}`);
    const insertAt = articleEnd + '</article>'.length;
    next = `${next.slice(0, insertAt)}\n${briefFeedback(record)}${next.slice(insertAt)}`;
  }
  if (/src="\/qilylean\/daily-feedback\.js\?v=[^"]+"/.test(next)) {
    next = next.replace(/(?:defer\s+)?src="\/qilylean\/daily-feedback\.js\?v=[^"]+"/g, 'src="/qilylean/daily-feedback.js?v=20260729-message-only-v4"');
  } else if (!next.includes('/qilylean/daily-feedback.js')) {
    next = next.replace('</body>', '<script src="/qilylean/daily-feedback.js?v=20260729-message-only-v4"></script>\n</body>');
  }
  return next;
}

function updateKeptPages(records) {
  records.forEach((record, index) => {
    let html = record.html;
    html = html.replace(/<nav class="(brief-adjacent(?:\s+(?:top|bottom))?)"[^>]*>[\s\S]*?<\/nav>/gi, (_match, className) => adjacentNav(record, records, index, className));
    html = html.replace(/<h1>今日简报<\/h1>/g, '<h1>精选简报</h1>');
    html = ensureBriefFeedback(html, record);
    fs.writeFileSync(path.join(dailyDir, `${record.date}.html`), html);
  });
}

function pruneFiles(keepDates) {
  for (const name of fs.readdirSync(dailyDir)) {
    const match = name.match(/^(\d{4}-\d{2}-\d{2})\.html$/);
    if (match && !keepDates.has(match[1])) fs.unlinkSync(path.join(dailyDir, name));
  }
  const publicAssets = path.join(qily, 'assets');
  if (fs.existsSync(publicAssets)) {
    for (const name of fs.readdirSync(publicAssets)) {
      const match = name.match(/^daily-(\d{4}-\d{2}-\d{2})(?:[-.])/);
      if (match && !keepDates.has(match[1])) fs.unlinkSync(path.join(publicAssets, name));
    }
  }
  const nestedAssets = path.join(dailyDir, 'assets');
  if (fs.existsSync(nestedAssets)) {
    for (const name of fs.readdirSync(nestedAssets)) {
      const match = name.match(/^(\d{4}-\d{2}-\d{2})-/);
      if (match && !keepDates.has(match[1])) fs.unlinkSync(path.join(nestedAssets, name));
    }
  }
}

function buildCareerTimeline() {
  const rows = careerTimeline.map((item) => '<tr><td><a class="career-year-link" href="/qilylean/daily-insights.html?year=' + esc(item.year) + '#brief-directory" data-year-filter="' + esc(item.year) + '" aria-label="查看' + esc(item.year) + '年精选简报">' + esc(item.year) + '年</a></td><td>' + esc(item.field) + '</td></tr>').join('');
  return '<section class="engineering-checklist career-track" aria-labelledby="careerTrackTitle"><h2 id="careerTrackTitle">主要项目履历</h2><p>以下按最近至最早汇总制造项目领域；精选简报贯通PE、IE、NPI、ME、精益运营与项目交付方法。</p><table class="rule-table career-table"><colgroup><col class="career-year-col"><col></colgroup><thead><tr><th>年份</th><th>主要制造项目</th></tr></thead><tbody>' + rows + '</tbody></table></section>';
}

function buildDirectoryCards(records) {
  return records.map((record) => `<article class="brief-index-card" data-date="${record.date}" data-search="${esc(`${record.date} ${record.theme} ${record.title} ${record.summary}`)}"><div class="brief-index-meta"><time datetime="${record.date}">${record.date}</time><span>${esc(record.theme)}</span></div><h2><a href="/qilylean/daily/${record.date}.html">${esc(record.title)}</a></h2><p class="brief-index-summary">${esc(record.summary)}</p><div class="brief-index-actions"><a class="brief-open" href="/qilylean/daily/${record.date}.html">打开本期精选</a></div></article>`).join('\n');
}

function buildDirectory(records) {
  const cards = buildDirectoryCards(records);
  const latest = records[0];
  const earliest = records[records.length - 1];
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>精选简报｜QilyLean｜启力精益</title>
<meta name="description" content="QilyLean精选制造工程简报：按周保留高价值内容，聚焦IE、PE、NPI、ME、精益改善、质量、数智工厂与项目交付。">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${baseUrl}/qilylean/daily-insights.html">
<link rel="alternate" type="application/rss+xml" title="QilyLean精选简报" href="/qilylean/daily/feed.xml">
<link rel="stylesheet" href="/site-shell.css?v=20260814-contact-v12">
<link rel="stylesheet" href="/site-typography-v1.css?v=20260729-hierarchy-v4">
<link rel="stylesheet" href="/qilylean/daily-briefs.css?v=20260812-weekly-curated-v1">
<script defer src="/site-navigation.js?v=20260820-resource-collab-dock-home-v31"></script>
<script defer id="qilyFastNativeNavigationV5" data-qily-fast-native-navigation="v5" src="/site-music-persistent-navigation-v1.js?v=20260812-fast-native-v5"></script>
<link id="qilyVisualReadabilityV4Stylesheet" rel="stylesheet" href="/site-visual-readability-v4.css?v=20260813-visual-readability-v4">
</head>
<body class="module-page daily-index-page">
<header class="qily-site-header"><a class="qily-brand" href="/">QilyLean｜启力精益</a><nav class="site-nav" aria-label="QilyLean核心导视"><a href="/">首页</a><a href="/experience/">履历主线</a><a href="/capabilities/">能力体系</a><a href="/improvements/">改善方法</a><a href="/projects/">代表项目</a><a href="/trust/">信任中心</a><a href="/cooperation/">项目合作</a><a href="/knowledge/" aria-current="page">知识资产</a></nav></header>
<main>
<section class="daily-hero"><div class="daily-inner"><span>CURATED ENGINEERING BRIEF</span><h1>精选简报</h1><p>不以日更数量证明专业度。默认每周只保留一篇真正具备工程逻辑、数据意识、闭环方法与长期复用价值的内容；明确指定的精品可作为保护项例外保留。</p></div></section>
<section class="daily-index-section"><div class="daily-inner">
<div class="daily-index-heading"><div><h2>精选简报目录</h2><p>${earliest.date}—${latest.date}｜现存 ${records.length} 篇｜周度精选、最新优先</p></div><a href="/qilylean/daily/${latest.date}.html">打开最新精选</a></div>
<div class="engineering-checklist"><strong>内容准入：</strong>制造专业相关性、工程逻辑与数据、问题到结果闭环、证据与边界、原创复用价值、检索培训价值。低信息密度、模板化重复和泛职场内容不作为公开简报资产。</div>
${buildCareerTimeline()}
<div class="brief-directory-tools" id="brief-directory"><label><span>搜索日期、主题或关键词</span><input type="search" id="briefSearch" placeholder="例如：NPI、SMED、标准工时、PMO" autocomplete="off"></label><p id="briefFilterStatus">当前 ${records.length} 篇精选</p></div>
<div class="brief-grid" id="briefCuratedGrid">${cards}</div>
</div></section>
</main>
<script>(function(){var params=new URLSearchParams(location.search),year=(params.get('year')||'').trim(),input=document.getElementById('briefSearch'),grid=document.getElementById('briefCuratedGrid'),status=document.getElementById('briefFilterStatus');if(!grid)return;var cards=Array.prototype.slice.call(grid.querySelectorAll('.brief-index-card'));function apply(){var q=(input&&input.value||'').trim().toLocaleLowerCase('zh-CN'),n=0;cards.forEach(function(card){var d=card.getAttribute('data-date')||'',s=(card.getAttribute('data-search')||'').toLocaleLowerCase('zh-CN'),hitYear=!year||d.indexOf(year+'-')===0,hitSearch=!q||s.includes(q),hit=hitYear&&hitSearch;card.hidden=!hit;if(hit)n+=1;});document.querySelectorAll('[data-year-filter]').forEach(function(link){var active=!!year&&link.getAttribute('data-year-filter')===year;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');});if(status){if(year&&q)status.innerHTML=year+'年｜找到 '+n+' 篇相关精选　<a href="/qilylean/daily-insights.html#brief-directory">查看全部年份</a>';else if(year)status.innerHTML=year+'年｜当前 '+n+' 篇精选　<a href="/qilylean/daily-insights.html#brief-directory">查看全部年份</a>';else status.textContent=q?'找到 '+n+' 篇相关精选':'当前 ${records.length} 篇精选';}}if(input)input.addEventListener('input',apply);apply();})();</script>
</body></html>\n`;
}

function updateDirectory(records) {
  const file = path.join(qily, 'daily-insights.html');
  const latest = records[0];
  const earliest = records[records.length - 1];
  let html = fs.readFileSync(file, 'utf8');
  const heading = `<div class="daily-index-heading"><div><h2>精选简报目录</h2><p>${earliest.date}—${latest.date}｜现存 ${records.length} 篇｜周度精选、最新优先</p></div><a href="/qilylean/daily/${latest.date}.html">打开最新精选</a></div>`;
  const headingPattern = /<div class="daily-index-heading"><div><h2>[\s\S]*?<\/h2><p>[\s\S]*?<\/p><\/div><a\b[^>]*>[\s\S]*?<\/a><\/div>/;
  if (!headingPattern.test(html)) throw new Error('Cannot locate the curated directory heading.');
  html = html.replace(headingPattern, heading);

  const gridPattern = /<div class="brief-grid" id="briefCuratedGrid">[\s\S]*?<\/article><\/div>/;
  if (!gridPattern.test(html)) throw new Error('Cannot locate the curated directory card grid.');
  html = html.replace(gridPattern, `<div class="brief-grid" id="briefCuratedGrid">${buildDirectoryCards(records)}</div>`);
  html = html.replace(/当前 \d+ 篇精选/g, `当前 ${records.length} 篇精选`);
  fs.writeFileSync(file, html.endsWith('\n') ? html : `${html}\n`, 'utf8');
}

function buildFeed(records) {
  const items = records.slice(0, 30).map((record) => `<item><title>${xml(record.title)}</title><link>${baseUrl}/qilylean/daily/${record.date}.html</link><guid isPermaLink="true">${baseUrl}/qilylean/daily/${record.date}.html</guid><pubDate>${new Date(`${record.date}T08:00:00+08:00`).toUTCString()}</pubDate><description>${xml(record.summary)}</description></item>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>QilyLean精选简报</title><link>${baseUrl}/qilylean/daily-insights.html</link><description>制造工程、精益改善与数智工厂周度精选</description><language>zh-CN</language>${items}</channel></rss>\n`;
}

function updateSitemap(records) {
  const file = path.join(root, 'sitemap.xml');
  if (!fs.existsSync(file)) return;
  let sitemap = fs.readFileSync(file, 'utf8');
  sitemap = sitemap.replace(/\s*<url>\s*<loc>https:\/\/qilylean\.com\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html<\/loc>[\s\S]*?<\/url>/g, '');
  const urls = records.map((record) => `  <url><loc>${baseUrl}/qilylean/daily/${record.date}.html</loc><lastmod>${record.date}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`).join('\n');
  const anchor = /(<url><loc>https:\/\/qilylean\.com\/qilylean\/daily-insights\.html<\/loc>[\s\S]*?<\/url>)/;
  if (anchor.test(sitemap)) sitemap = sitemap.replace(anchor, `$1\n${urls}`);
  fs.writeFileSync(file, sitemap);
}

function updateHomepage(records) {
  const file = path.join(root, 'index.html');
  if (!fs.existsSync(file)) return;
  const latest = records[0];
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/<strong>\d+期<\/strong><span>今日简报连续归档，覆盖PE、IE、ME、NPI、质量、精益运营与项目管理。<\/span>/, `<strong>${records.length}篇</strong><span>精选简报按周归档，聚焦PE、IE、ME、NPI、质量、精益运营与项目交付；数量不作为竞争力指标。</span>`);
  html = html.replace(/把现场经验继续压缩成术语、程序文件、单点课件、工具和每日复盘/g, '把现场经验继续压缩成术语、程序文件、单点课件、工具和高价值复盘');
  html = html.replace(/<strong>\d{4}-\d{2}-\d{2}<\/strong><span>最新简报：[\s\S]*?<\/span>/, `<strong>${latest.date}</strong><span>最新精选：${esc(latest.title)}。</span>`);
  html = html.replace(/href="\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html">查看\d+月\d+日简报<\/a>/, `href="/qilylean/daily/${latest.date}.html">查看最新精选</a>`);
  fs.writeFileSync(file, html);
}

function main() {
  const all = readRecords();
  if (!all.length) throw new Error('No daily brief pages found before curation.');
  for (const date of protectedDates) {
    if (!all.some((record) => record.date === date)) throw new Error(`Protected brief is missing before curation: ${date}`);
  }
  const { selected, decisions } = selectWeekly(all);
  const keepDates = new Set(selected.map((record) => record.date));
  updateKeptPages(selected);
  pruneFiles(keepDates);
  const publicIndex = selected.map(({ date, title, summary, theme }) => ({ date, title, summary, dayNo: '', theme }));
  fs.writeFileSync(path.join(dailyDir, 'index.json'), `${JSON.stringify(publicIndex, null, 2)}\n`);
  updateDirectory(selected);
  fs.writeFileSync(path.join(dailyDir, 'feed.xml'), buildFeed(selected));
  updateSitemap(selected);
  updateHomepage(selected);
  const report = {
    policy_version: policy.version,
    generated_at: process.env.QILY_GENERATED_AT || `${selected[0].date}T00:00:00.000Z`,
    total_before: all.length,
    total_after: selected.length,
    removed: all.length - selected.length,
    protected_dates: Array.from(protectedDates),
    decisions
  };
  fs.writeFileSync(path.join(dailyDir, 'curation-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`Weekly curation: ${all.length} -> ${selected.length}; removed ${all.length - selected.length}.\n`);
}

main();
