#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const root = path.resolve(__dirname, '..');
const terminologyFile = path.join(root, 'knowledge', 'terminology.html');
const knowledgeFile = path.join(root, 'knowledge', 'index.html');
const homeFile = path.join(root, 'index.html');
const dailyIndexFile = path.join(root, 'qilylean', 'daily', 'index.json');
const siteDataFile = path.join(root, 'qilylean', 'site-data.json');
const buildDate = process.env.QILY_BUILD_DATE || new Date().toISOString().slice(0, 10);

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function writeIfChanged(file, content) {
  const normalized = content.endsWith('\n') ? content : `${content}\n`;
  const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (current === normalized) return false;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, normalized);
  return true;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function countMatches(value, expression) {
  return (String(value).match(expression) || []).length;
}

function replaceRequired(value, expression, replacement, label) {
  if (!expression.test(value)) throw new Error(`Missing generated-content marker: ${label}`);
  expression.lastIndex = 0;
  return value.replace(expression, replacement);
}

function extractSection(page, id) {
  const expression = new RegExp(`<section\\b[^>]*\\bid=["']${id}["'][^>]*>`, 'i');
  const match = expression.exec(page);
  if (!match) throw new Error(`Knowledge section not found: ${id}`);
  const next = page.indexOf('<section', match.index + match[0].length);
  return page.slice(match.index, next < 0 ? page.length : next);
}

function countKnowledgeModules(page) {
  const ids = Array.from(page.matchAll(/<section\b[^>]*class=["'][^"']*module-section[^"']*["'][^>]*\bid=["']([^"']+)["']/gi), (match) => match[1]);
  return new Set(ids).size;
}

function countCards(page, id) {
  return countMatches(extractSection(page, id), /<article\b[^>]*class=["'][^"']*module-card[^"']*["']/gi);
}

function readExistingData() {
  if (!fs.existsSync(siteDataFile)) return null;
  try {
    return JSON.parse(read(siteDataFile));
  } catch (error) {
    return null;
  }
}

function withoutGeneratedAt(value) {
  if (!value || typeof value !== 'object') return value;
  const clone = JSON.parse(JSON.stringify(value));
  delete clone.generatedAt;
  return clone;
}

function collectSiteData() {
  const terminologyPage = read(terminologyFile);
  const knowledgePage = read(knowledgeFile);
  const briefs = JSON.parse(read(dailyIndexFile));

  const terminologyTotal = countMatches(terminologyPage, /<article\b[^>]*\bdata-term-card\b[^>]*>/gi);
  if (terminologyTotal < 1) throw new Error('No terminology entries were detected');
  if (!Array.isArray(briefs) || briefs.length < 1) throw new Error('No daily briefs were detected');

  const sortedBriefs = [...briefs].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const latest = sortedBriefs[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(latest.date || '')) throw new Error('Latest brief date is invalid');

  const toolCount = countCards(knowledgePage, 'tools');
  const topicCount = countCards(knowledgePage, 'lean-series');
  const documentCount = countCards(knowledgePage, 'documents');
  const moduleCount = countKnowledgeModules(knowledgePage);

  const core = {
    schemaVersion: 1,
    terminology: {
      total: terminologyTotal,
      lessonTotal: terminologyTotal,
      url: '/knowledge/terminology.html'
    },
    briefs: {
      total: sortedBriefs.length,
      latestDate: latest.date,
      latestTheme: latest.theme || '',
      latestTitle: latest.title || '',
      latestSummary: latest.summary || '',
      latestUrl: `/qilylean/daily/${latest.date}.html`,
      directoryUrl: '/qilylean/daily-insights.html'
    },
    knowledge: {
      moduleCount,
      toolCount,
      topicCount,
      documentCount,
      resourceCount: toolCount + topicCount + documentCount
    }
  };

  const existing = readExistingData();
  const unchanged = existing && JSON.stringify(withoutGeneratedAt(existing)) === JSON.stringify(core);
  return { generatedAt: unchanged && existing.generatedAt ? existing.generatedAt : buildDate, ...core };
}

function updateTerminology(data) {
  let page = read(terminologyFile);
  page = replaceRequired(
    page,
    /(<meta name="description" content="[^"]*词典：)\d+(项)/,
    `$1${data.terminology.total}$2`,
    'terminology meta count'
  );
  page = replaceRequired(
    page,
    /<div class="term-count" id="termCount"[^>]*>[\s\S]*?<\/div>/,
    `<div class="term-count" id="termCount" data-site-metadata-source="/qilylean/site-data.json">共收录 ${data.terminology.total} 项术语 · ${data.terminology.lessonTotal} 份单点培训课件</div>`,
    'terminology visible count'
  );
  writeIfChanged(terminologyFile, page);
}

function renderLatestBriefCard(data) {
  const latest = data.briefs;
  return `<article class="module-card" data-latest-brief-card data-latest-brief-date="${escapeHtml(latest.latestDate)}" data-site-metadata-source="/qilylean/site-data.json"><small data-latest-brief-meta>最新：${escapeHtml(latest.latestDate)}｜${escapeHtml(latest.latestTheme)}</small><h3 data-latest-brief-title>${escapeHtml(latest.latestTitle)}</h3><p data-latest-brief-summary>${escapeHtml(latest.latestSummary)}</p><div class="module-actions"><a href="${latest.directoryUrl}">查看简报目录</a><a class="secondary" data-latest-brief-link href="${latest.latestUrl}">查看最新简报</a></div></article>`;
}

function renderKnowledgeStats(data) {
  return `<!-- SITE-METADATA:KNOWLEDGE-STATS:START -->
<section class="module-section" id="knowledge-stats" data-site-metadata-source="/qilylean/site-data.json"><div class="module-inner">
<div class="module-heading"><h2>知识库实时统计</h2><p>术语、简报与知识入口由统一数据源自动核算；新增内容发布后同步更新首页、知识模块及站点地图。</p></div>
<div class="module-grid four">
<article class="module-card"><small>知识架构</small><h3>${data.knowledge.moduleCount} 大模块</h3><p>术语词典、今日简报、工具库、精益专题及程序文件／参考资料。</p></article>
<article class="module-card"><small>术语与培训</small><h3>${data.terminology.total} 项</h3><p>每项术语一对一匹配独立网址单点培训课件。</p></article>
<article class="module-card"><small>今日简报</small><h3>${data.briefs.total} 期</h3><p>最新更新至 ${escapeHtml(data.briefs.latestDate)}，按日期连续归档。</p></article>
<article class="module-card"><small>工具／专题／资料</small><h3>${data.knowledge.resourceCount} 项</h3><p>${data.knowledge.toolCount} 项工具、${data.knowledge.topicCount} 项专题、${data.knowledge.documentCount} 项程序文件与参考资料入口。</p></article>
</div></div></section>
<!-- SITE-METADATA:KNOWLEDGE-STATS:END -->`;
}

function upsertBlock(page, startMarker, endMarker, block, insertBefore) {
  const start = page.indexOf(startMarker);
  const end = page.indexOf(endMarker);
  if (start >= 0 && end > start) {
    return `${page.slice(0, start)}${block}${page.slice(end + endMarker.length)}`;
  }
  const position = page.indexOf(insertBefore);
  if (position < 0) throw new Error(`Cannot insert generated block before: ${insertBefore}`);
  return `${page.slice(0, position)}${block}\n\n${page.slice(position)}`;
}

function updateKnowledge(data) {
  let page = read(knowledgeFile);
  const description = `QilyLean知识分享：收录${data.terminology.total}项制造管理与工程术语、${data.briefs.total}期今日简报及${data.knowledge.resourceCount}项精益工具、知识专题和程序文件／参考资料；最新简报更新至${data.briefs.latestDate}。`;
  page = replaceRequired(page, /<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapeHtml(description)}">`, 'knowledge meta description');
  page = replaceRequired(page, /<small>全站术语词典｜\d+项<\/small>/, `<small>全站术语词典｜${data.terminology.total}项</small>`, 'knowledge terminology count');
  page = replaceRequired(
    page,
    /<article class="module-card" data-latest-brief-card(?: data-latest-brief-date="[^"]*")?(?: data-site-metadata-source="[^"]*")?>[\s\S]*?<\/article>/,
    renderLatestBriefCard(data),
    'knowledge latest brief card'
  );
  page = upsertBlock(
    page,
    '<!-- SITE-METADATA:KNOWLEDGE-STATS:START -->',
    '<!-- SITE-METADATA:KNOWLEDGE-STATS:END -->',
    renderKnowledgeStats(data),
    '<section class="module-section alt" id="terminology">'
  );
  writeIfChanged(knowledgeFile, page);
}

function renderHomeLatest(data) {
  return `<!-- SITE-METADATA:HOME-LATEST:START -->
<section class="section" id="latest-content" data-site-metadata-source="/qilylean/site-data.json">
<div class="inner"><div class="head"><h2>最新内容与知识资产</h2><p>全站术语、简报、知识模块和更新时间由统一数据源自动生成，避免不同页面统计口径不一致。</p></div>
<div class="metrics">
<div class="metric"><strong>${escapeHtml(data.briefs.latestDate)}</strong><span>${escapeHtml(data.briefs.latestTitle)}</span><em><a href="${data.briefs.latestUrl}">查看最新简报</a></em></div>
<div class="metric"><strong>${data.briefs.total}期</strong><span>今日简报连续归档，贯通PE、IE、NPI、ME、质量与精益运营。</span><em><a href="${data.briefs.directoryUrl}">进入简报目录</a></em></div>
<div class="metric"><strong>${data.terminology.total}项</strong><span>制造管理与工程术语中文诠释，并一对一配套单点培训课件。</span><em><a href="${data.terminology.url}">进入术语词典</a></em></div>
<div class="metric"><strong>${data.knowledge.moduleCount}大模块</strong><span>汇集${data.knowledge.resourceCount}项工具、专题、程序文件与参考资料入口。</span><em><a href="/knowledge/">进入知识分享</a></em></div>
</div></div></section>
<!-- SITE-METADATA:HOME-LATEST:END -->`;
}

function updateHome(data) {
  let page = read(homeFile);
  const description = `丁启利制造改善与项目实践主页：聚焦精益生产、工业工程、工程改善与数智化工厂；知识库收录${data.terminology.total}项术语、${data.briefs.total}期简报，最新更新至${data.briefs.latestDate}。`;
  page = replaceRequired(page, /<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapeHtml(description)}">`, 'home meta description');
  page = upsertBlock(
    page,
    '<!-- SITE-METADATA:HOME-LATEST:START -->',
    '<!-- SITE-METADATA:HOME-LATEST:END -->',
    renderHomeLatest(data),
    '<section class="section" id="results">'
  );
  writeIfChanged(homeFile, page);
}

function gitOutput(args) {
  try {
    return childProcess.execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch (error) {
    return '';
  }
}

function urlToRepositoryPath(url) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(url).pathname);
  } catch (error) {
    return '';
  }
  if (pathname === '/') return 'index.html';
  const clean = pathname.replace(/^\//, '');
  if (pathname.endsWith('/')) return `${clean}index.html`;
  return clean;
}

function fileLastmod(relativePath, data) {
  if (!relativePath) return '';
  const dailyMatch = relativePath.match(/^qilylean\/daily\/(\d{4}-\d{2}-\d{2})\.html$/);
  if (dailyMatch) return dailyMatch[1];
  if (relativePath === 'qilylean/daily-insights.html') return data.briefs.latestDate;

  const absolute = path.join(root, relativePath);
  if (!fs.existsSync(absolute)) return '';
  if (gitOutput(['status', '--porcelain', '--', relativePath])) return buildDate;
  return gitOutput(['log', '-1', '--format=%cs', '--', relativePath]) || buildDate;
}

function updateSitemap(fileName, data) {
  const file = path.join(root, fileName);
  if (!fs.existsSync(file)) return;
  let xml = read(file);
  xml = xml.replace(/<url>[\s\S]*?<\/url>/g, (block) => {
    const location = (block.match(/<loc>([^<]+)<\/loc>/) || [])[1];
    if (!location) return block;
    const lastmod = fileLastmod(urlToRepositoryPath(location), data);
    if (!lastmod) return block;
    if (/<lastmod>[^<]*<\/lastmod>/.test(block)) return block.replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${lastmod}</lastmod>`);
    return block.replace(/<\/loc>/, `</loc><lastmod>${lastmod}</lastmod>`);
  });
  writeIfChanged(file, xml);
}

function validate(data) {
  const home = read(homeFile);
  const knowledge = read(knowledgeFile);
  const terminology = read(terminologyFile);
  const siteData = JSON.parse(read(siteDataFile));
  const checks = [
    [home.includes('SITE-METADATA:HOME-LATEST:START'), 'Homepage latest-content block is missing'],
    [home.includes(data.briefs.latestDate), 'Homepage latest brief date is stale'],
    [knowledge.includes('SITE-METADATA:KNOWLEDGE-STATS:START'), 'Knowledge statistics block is missing'],
    [knowledge.includes(`全站术语词典｜${data.terminology.total}项`), 'Knowledge terminology count is stale'],
    [knowledge.includes(`data-latest-brief-date="${data.briefs.latestDate}"`), 'Knowledge latest brief date is stale'],
    [terminology.includes(`共收录 ${data.terminology.total} 项术语 · ${data.terminology.lessonTotal} 份单点培训课件`), 'Terminology count is stale'],
    [siteData.briefs.total === data.briefs.total, 'Central brief count is stale'],
    [siteData.terminology.total === data.terminology.total, 'Central terminology count is stale']
  ];
  const failed = checks.find(([passed]) => !passed);
  if (failed) throw new Error(failed[1]);
}

function main() {
  const data = collectSiteData();
  writeIfChanged(siteDataFile, JSON.stringify(data, null, 2));
  updateTerminology(data);
  updateKnowledge(data);
  updateHome(data);
  updateSitemap('sitemap.xml', data);
  updateSitemap('sitemap-core.xml', data);
  validate(data);
  process.stdout.write(`Unified site metadata: ${data.terminology.total} terms, ${data.briefs.total} briefs, latest ${data.briefs.latestDate}, ${data.knowledge.moduleCount} knowledge modules.\n`);
}

main();
