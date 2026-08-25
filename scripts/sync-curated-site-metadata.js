#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const indexFile = path.join(root, 'qilylean', 'daily', 'index.json');
const siteDataFile = path.join(root, 'qilylean', 'site-data.json');
const homeFile = path.join(root, 'index.html');
const knowledgeFile = path.join(root, 'knowledge', 'index.html');
const terminologyFile = path.join(root, 'knowledge', 'terminology.html');

function read(file) { return fs.readFileSync(file, 'utf8'); }
function writeIfChanged(file, value) {
  const normalized = value.endsWith('\n') ? value : `${value}\n`;
  const current = fs.existsSync(file) ? read(file) : '';
  if (current === normalized) return false;
  fs.writeFileSync(file, normalized, 'utf8');
  return true;
}
function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);
}
function countTerms() {
  const html = read(terminologyFile);
  let total = (html.match(/<article\b[^>]*\bdata-term-card\b[^>]*>/gi) || []).length;
  if (html.includes('terminology-sponsor-v1.js') && !/<div class="term-code">Sponsor<\/div>/i.test(html)) total += 1;
  if (!total) throw new Error('Unable to determine terminology total.');
  return total;
}
function loadIndex() {
  const items = JSON.parse(read(indexFile));
  if (!Array.isArray(items) || !items.length) throw new Error('Curated brief index is empty.');
  items.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return items;
}
function loadSiteData() {
  try { return JSON.parse(read(siteDataFile)); } catch (_) { return {}; }
}
function updateSiteData(items, termTotal) {
  const latest = items[0];
  const data = loadSiteData();
  data.generatedAt = latest.date;
  data.schemaVersion = data.schemaVersion || 1;
  data.terminology = {
    ...(data.terminology || {}),
    total: termTotal,
    lessonTotal: termTotal,
    url: '/knowledge/terminology.html'
  };
  data.briefs = {
    ...(data.briefs || {}),
    total: items.length,
    latestDate: latest.date,
    latestTheme: latest.theme || '',
    latestTitle: latest.title || '',
    latestSummary: latest.summary || '',
    latestUrl: `/qilylean/daily/${latest.date}.html`,
    directoryUrl: '/qilylean/daily-insights.html',
    cadence: 'weekly_curated'
  };
  writeIfChanged(siteDataFile, JSON.stringify(data, null, 2));
  return data;
}
function updateHome(data) {
  let html = read(homeFile);
  const latest = data.briefs;
  html = html.replace(
    /<meta name="description" content="[^"]*">/i,
    `<meta name="description" content="QilyLean｜启力精益：把制造现场问题转化为可计算、可验证、可固化、可复制的运营资产；知识资产收录${data.terminology.total}项术语与${latest.total}篇精选制造工程简报。">`
  );
  const match = html.match(/<section class="qily-asset-section" id="qily-knowledge-assets">[\s\S]*?<\/section>/);
  if (!match) throw new Error('Homepage V3 knowledge-asset section is missing.');
  let section = match[0];
  section = section.replace('把现场经验继续压缩成术语、程序文件、单点课件、工具和每日复盘', '把现场经验继续压缩成术语、程序文件、单点课件、工具和高价值复盘');
  section = section.replace(/<div class="qily-proof-item"><strong>\d+(?:篇|期)<\/strong><span>[^<]*简报[^<]*<\/span><\/div>/, `<div class="qily-proof-item"><strong>${latest.total}篇</strong><span>精选简报按周归档，聚焦PE、IE、ME、NPI、质量、精益运营与项目交付；数量不作为竞争力指标。</span></div>`);
  section = section.replace(/<div class="qily-proof-item"><strong>\d+项<\/strong><span>制造管理与工程术语中文诠释[^<]*<\/span><\/div>/, `<div class="qily-proof-item"><strong>${data.terminology.total}项</strong><span>制造管理与工程术语中文诠释，并配套单点培训课件。</span></div>`);
  section = section.replace(/<div class="qily-proof-item"><strong>\d{4}-\d{2}-\d{2}<\/strong><span>最新(?:简报|精选)：[^<]*<\/span><\/div>/, `<div class="qily-proof-item"><strong>${esc(latest.latestDate)}</strong><span>最新精选：${esc(latest.latestTitle)}。</span></div>`);
  section = section.replace(/<a href="\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html">(?:查看最新精选|查看[^<]*简报)<\/a>/, `<a href="${latest.latestUrl}">查看最新精选</a>`);
  html = html.replace(match[0], section);
  writeIfChanged(homeFile, html);
}
function latestCard(data) {
  const b = data.briefs;
  return `<article class="module-card" data-latest-brief-card data-latest-brief-date="${esc(b.latestDate)}" data-site-metadata-source="/qilylean/site-data.json"><small data-latest-brief-meta>最新精选：${esc(b.latestDate)}｜${esc(b.latestTheme)}</small><h3 data-latest-brief-title>${esc(b.latestTitle)}</h3><p data-latest-brief-summary>${esc(b.latestSummary)}</p><div class="module-actions"><a href="${b.directoryUrl}">查看精选目录</a><a class="secondary" data-latest-brief-link href="${b.latestUrl}">查看最新精选</a></div></article>`;
}
function updateKnowledge(data) {
  let html = read(knowledgeFile);
  const b = data.briefs;
  const resourceCount = data.knowledge && Number.isInteger(data.knowledge.resourceCount) ? data.knowledge.resourceCount : 0;
  const description = `QilyLean知识资产：收录${data.terminology.total}项制造管理与工程术语、${b.total}篇精选制造工程简报及${resourceCount}项精益工具、知识专题和程序文件／参考资料；最新精选更新至${b.latestDate}。`;
  html = html.replace(/<meta name="description" content="[^"]*">/i, `<meta name="description" content="${description}">`);
  html = html.replace(/<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${description}">`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*">/i, `<meta name="twitter:description" content="${description}">`);
  html = html.replace(/<small>全站术语词典｜\d+项<\/small>/, `<small>全站术语词典｜${data.terminology.total}项</small>`);
  html = html.replace(/(<small>术语与培训<\/small>\s*<h3>)\d+\s*项(<\/h3>)/, `$1${data.terminology.total} 项$2`);
  html = html.replace(/<article class="module-card" data-latest-brief-card(?: data-latest-brief-date="[^"]*")?(?: data-site-metadata-source="[^"]*")?>[\s\S]*?<\/article>/, latestCard(data));
  html = html.replace(/(<small>)(?:今日简报|精选简报)(<\/small>\s*<h3>)\d+\s*(?:期|篇)(<\/h3>)/i, `$1精选简报$2${b.total} 篇$3`);
  html = html.replace(/最新(?:精选)?更新至\s*\d{4}-\d{2}-\d{2}(?:，按日期连续归档。|；默认每周保留一篇高价值制造工程动态。)/g, `最新精选更新至 ${b.latestDate}；默认每周保留一篇高价值制造工程动态。`);
  html = html.replace(/今日简报/g, '精选简报');
  writeIfChanged(knowledgeFile, html);
}
function updateTerminology(termTotal) {
  let html = read(terminologyFile);
  html = html.replace(
    /<meta name="description" content="QilyLean全站制造管理与工程专业术语词典：\d+项中文诠释与应用场景，每个术语代码配套单点培训课件，支持直接打开、链接分享与下载\/保存PDF。">/,
    `<meta name="description" content="QilyLean全站制造管理与工程专业术语词典：${termTotal}项中文诠释与应用场景，每个术语代码配套单点培训课件，支持直接打开、链接分享与下载/保存PDF。">`
  );
  html = html.replace(/共收录\s*\d+\s*项术语\s*·\s*\d+\s*份单点培训课件/, `共收录 ${termTotal} 项术语 · ${termTotal} 份单点培训课件`);
  writeIfChanged(terminologyFile, html);
}
function validate(data) {
  const home = read(homeFile);
  const knowledge = read(knowledgeFile);
  const central = JSON.parse(read(siteDataFile));
  const knowledgeDescription = `QilyLean知识资产：收录${data.terminology.total}项制造管理与工程术语、${data.briefs.total}篇精选制造工程简报及${data.knowledge.resourceCount}项精益工具、知识专题和程序文件／参考资料；最新精选更新至${data.briefs.latestDate}。`;
  if (!home.includes(`${data.briefs.total}篇`)) throw new Error('Homepage curated brief count is stale.');
  if (!home.includes(data.briefs.latestDate)) throw new Error('Homepage latest curated date is stale.');
  if (!knowledge.includes(`data-latest-brief-date="${data.briefs.latestDate}"`)) throw new Error('Knowledge latest curated card is stale.');
  if (!knowledge.includes(`<small>术语与培训</small><h3>${data.terminology.total} 项</h3>`)) throw new Error('Knowledge terminology count is stale.');
  if (!knowledge.includes(`最新精选更新至 ${data.briefs.latestDate}`)) throw new Error('Knowledge brief summary date is stale.');
  if (!knowledge.includes(`<meta name="description" content="${knowledgeDescription}">`)) throw new Error('Knowledge primary description is stale.');
  if (!knowledge.includes(`<meta property="og:description" content="${knowledgeDescription}">`)) throw new Error('Knowledge Open Graph description is stale.');
  if (!knowledge.includes(`<meta name="twitter:description" content="${knowledgeDescription}">`)) throw new Error('Knowledge Twitter description is stale.');
  const terminology = read(terminologyFile);
  if (!terminology.includes(`共收录 ${data.terminology.total} 项术语 · ${data.terminology.total} 份单点培训课件`)) throw new Error('Terminology visible count is stale.');
  if (!knowledge.includes('精选简报')) throw new Error('Knowledge page still lacks curated-brief wording.');
  if (!central.briefs || central.briefs.total !== data.briefs.total || central.briefs.cadence !== 'weekly_curated') throw new Error('Central curated metadata is stale.');
}
function main() {
  const items = loadIndex();
  const terms = countTerms();
  const data = updateSiteData(items, terms);
  updateTerminology(terms);
  updateHome(data);
  updateKnowledge(data);
  validate(data);
  process.stdout.write(`Curated site metadata synchronized: ${items.length} briefs, ${terms} terms, latest ${items[0].date}.\n`);
}
main();
