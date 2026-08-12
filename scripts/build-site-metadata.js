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
const curationPolicyFile = path.join(root, 'qilylean', 'brief-curation-policy.json');
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

function readCurationPolicy() {
  if (!fs.existsSync(curationPolicyFile)) return null;
  try {
    return JSON.parse(read(curationPolicyFile));
  } catch (error) {
    return null;
  }
}

function isWeeklyCuratedPolicy() {
  const policy = readCurationPolicy();
  return Boolean(policy && policy.cadence === 'weekly_curated');
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

  let terminologyTotal = countMatches(terminologyPage, /<article\b[^>]*\bdata-term-card\b[^>]*>/gi);
  if (terminologyPage.includes('terminology-sponsor-v1.js') && !/<article\b[^>]*\bdata-term-card\b[^>]*>[\s\S]*?<div class="term-code">Sponsor<\/div>/i.test(terminologyPage)) terminologyTotal += 1;
  if (terminologyTotal < 1) throw new Error('No terminology entries were detected');
  if (!Array.isArray(briefs) || briefs.length < 1) throw new Error('No daily briefs were detected');

  const sortedBriefs = [...briefs].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const latest = sortedBriefs[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(latest.date || '')) throw new Error('Latest brief date is invalid');

  const toolCount = countCards(knowledgePage, 'tools');
  const topicCount = countCards(knowledgePage, 'lean-series');
  const documentCount = countCards(knowledgePage, 'documents');
  const moduleCount = countKnowledgeModules(knowledgePage);
  const weeklyCurated = isWeeklyCuratedPolicy();

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
      directoryUrl: '/qilylean/daily-insights.html',
      cadence: weeklyCurated ? 'weekly_curated' : 'archive'
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
  const reserved = new Set(['generatedAt', 'schemaVersion', 'terminology', 'briefs', 'knowledge']);
  const extras = existing ? Object.fromEntries(Object.entries(existing).filter(([key]) => !reserved.has(key))) : {};
  const merged = { ...core, ...extras };
  const unchanged = existing && JSON.stringify(withoutGeneratedAt(existing)) === JSON.stringify(merged);
  return { generatedAt: unchanged && existing.generatedAt ? existing.generatedAt : buildDate, ...merged };
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
  return `<article class="module-card" data-latest-brief-card data-latest-brief-date="${escapeHtml(latest.latestDate)}" data-site-metadata-source="/qilylean/site-data.json"><small data-latest-brief-meta>最新精选：${escapeHtml(latest.latestDate)}｜${escapeHtml(latest.latestTheme)}</small><h3 data-latest-brief-title>${escapeHtml(latest.latestTitle)}</h3><p data-latest-brief-summary>${escapeHtml(latest.latestSummary)}</p><div class="module-actions"><a href="${latest.directoryUrl}">查看精选目录</a><a class="secondary" data-latest-brief-link href="${latest.latestUrl}">查看最新精选</a></div></article>`;
}

function renderKnowledgeStats(data) {
  const weekly = data.briefs.cadence === 'weekly_curated';
  const briefLabel = weekly ? '精选简报' : '今日简报';
  const briefUnit = weekly ? '篇' : '期';
  const briefCopy = weekly
    ? `最新精选更新至 ${escapeHtml(data.briefs.latestDate)}；默认每周保留一篇高价值制造工程动态。`
    : `最新更新至 ${escapeHtml(data.briefs.latestDate)}，按日期连续归档。`;
  return `<!-- SITE-METADATA:KNOWLEDGE-STATS:START -->
<section class="module-section" id="knowledge-stats" data-site-metadata-source="/qilylean/site-data.json"><div class="module-inner">
<div class="module-heading"><h2>知识库实时统计</h2><p>术语、精选简报与知识入口由统一数据源自动核算；新增内容发布后同步更新首页、知识模块及站点地图。</p></div>
<div class="module-grid four knowledge-stat-grid">
<a class="module-card knowledge-stat-card" href="/knowledge/#terminology" aria-label="查看知识架构与六大知识模块"><small>知识架构</small><h3>${data.knowledge.moduleCount} 大模块</h3><p>术语词典、精选简报、工具库、精益专题及程序文件／参考资料。</p><span class="knowledge-stat-jump">进入知识架构 →</span></a>
<a class="module-card knowledge-stat-card" href="/knowledge/terminology.html" aria-label="进入全站术语中文诠释与单点培训课件"><small>术语与培训</small><h3>${data.terminology.total} 项</h3><p>每项术语一对一匹配独立网址单点培训课件。</p><span class="knowledge-stat-jump">进入术语词典 →</span></a>
<a class="module-card knowledge-stat-card" href="/qilylean/daily-insights.html" aria-label="进入精选简报目录"><small>${briefLabel}</small><h3>${data.briefs.total} ${briefUnit}</h3><p>${briefCopy}</p><span class="knowledge-stat-jump">进入精选目录 →</span></a>
<a class="module-card knowledge-stat-card" href="/knowledge/#tools" aria-label="进入工具专题与资料入口"><small>工具／专题／资料</small><h3>${data.knowledge.resourceCount} 项</h3><p>${data.knowledge.toolCount} 项工具、${data.knowledge.topicCount} 项专题、${data.knowledge.documentCount} 项程序文件与参考资料入口。</p><span class="knowledge-stat-jump">进入工具与资料 →</span></a>
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
  const weekly = data.briefs.cadence === 'weekly_curated';
  const description = weekly
    ? `QilyLean知识资产：收录${data.terminology.total}项制造管理与工程术语、${data.briefs.total}篇精选制造工程简报及${data.knowledge.resourceCount}项精益工具、知识专题和程序文件／参考资料；最新精选更新至${data.briefs.latestDate}。`
    : `QilyLean知识分享：收录${data.terminology.total}项制造管理与工程术语、${data.briefs.total}期今日简报及${data.knowledge.resourceCount}项精益工具、知识专题和程序文件／参考资料；最新简报更新至${data.briefs.latestDate}。`;
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
  const weekly = data.briefs.cadence === 'weekly_curated';
  const briefLabel = weekly ? '精选简报' : '今日简报';
  const briefUnit = weekly ? '篇' : '期';
  return `<!-- SITE-METADATA:HOME-LATEST:START -->
<section class="section" id="latest-content" data-site-metadata-source="/qilylean/site-data.json">
<div class="inner"><div class="head"><h2>最新内容与知识资产</h2><p>全站术语、简报、知识模块和更新时间由统一数据源自动生成，避免不同页面统计口径不一致。</p></div>
<div class="metrics">
<div class="metric"><strong>${escapeHtml(data.briefs.latestDate)}</strong><span>${escapeHtml(data.briefs.latestTitle)}</span><em><a href="${data.briefs.latestUrl}">查看最新精选</a></em></div>
<div class="metric"><strong>${data.briefs.total}${briefUnit}</strong><span>${briefLabel}${weekly ? '按周精选，数量不作为竞争力指标。' : '连续归档，贯通PE、IE、NPI、ME、质量与精益运营。'}</span><em><a href="${data.briefs.directoryUrl}">进入简报目录</a></em></div>
<div class="metric"><strong>${data.terminology.total}项</strong><span>制造管理与工程术语中文诠释，并一对一配套单点培训课件。</span><em><a href="${data.terminology.url}">进入术语词典</a></em></div>
<div class="metric"><strong>${data.knowledge.moduleCount}大模块</strong><span>汇集${data.knowledge.resourceCount}项工具、专题、程序文件与参考资料入口。</span><em><a href="/knowledge/">进入知识资产</a></em></div>
</div></div></section>
<!-- SITE-METADATA:HOME-LATEST:END -->`;
}

function updateV3Home(page, data) {
  const weekly = data.briefs.cadence === 'weekly_curated';
  const description = weekly
    ? `QilyLean｜启力精益：把制造现场问题转化为可计算、可验证、可固化、可复制的运营资产；知识资产收录${data.terminology.total}项术语与${data.briefs.total}篇精选制造工程简报。`
    : `QilyLean｜启力精益：把制造现场问题转化为可计算、可验证、可固化、可复制的运营资产；知识资产收录${data.terminology.total}项术语与${data.briefs.total}期制造工程简报。`;
  page = replaceRequired(page, /<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapeHtml(description)}">`, 'V3 home meta description');

  // V3 homepage is authoritative static HTML. Update only the existing knowledge-asset strip;
  // never inject retired V2 #results / #latest-content sections back into the page.
  const sectionMatch = page.match(/<section class="qily-asset-section" id="qily-knowledge-assets">[\s\S]*?<\/section>/);
  if (!sectionMatch) throw new Error('V3 knowledge asset section is missing');
  let section = sectionMatch[0];
  if (weekly) {
    section = section.replace('把现场经验继续压缩成术语、程序文件、单点课件、工具和每日复盘', '把现场经验继续压缩成术语、程序文件、单点课件、工具和高价值复盘');
    section = section.replace(/<div class="qily-proof-item"><strong>\d+期<\/strong><span>今日简报连续归档[^<]*<\/span><\/div>/, `<div class="qily-proof-item"><strong>${data.briefs.total}篇</strong><span>精选简报按周归档，聚焦PE、IE、ME、NPI、质量、精益运营与项目交付；数量不作为竞争力指标。</span></div>`);
  } else {
    section = section.replace(/<div class="qily-proof-item"><strong>\d+(?:篇|期)<\/strong><span>[^<]*(?:简报|精选)[^<]*<\/span><\/div>/, `<div class="qily-proof-item"><strong>${data.briefs.total}期</strong><span>今日简报连续归档，覆盖PE、IE、ME、NPI、质量、精益运营与项目管理。</span></div>`);
  }
  section = section.replace(/<div class="qily-proof-item"><strong>\d+项<\/strong><span>制造管理与工程术语中文诠释[^<]*<\/span><\/div>/, `<div class="qily-proof-item"><strong>${data.terminology.total}项</strong><span>制造管理与工程术语中文诠释，并配套单点培训课件。</span></div>`);
  section = section.replace(/<div class="qily-proof-item"><strong>\d{4}-\d{2}-\d{2}<\/strong><span>最新(?:简报|精选)：[^<]*<\/span><\/div>/, `<div class="qily-proof-item"><strong>${escapeHtml(data.briefs.latestDate)}</strong><span>最新精选：${escapeHtml(data.briefs.latestTitle)}。</span></div>`);
  section = section.replace(/<a href="\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html">查看[^<]*简报<\/a>/, `<a href="${data.briefs.latestUrl}">查看最新精选</a>`);
  return page.replace(sectionMatch[0], section);
}

function updateHome(data) {
  let page = read(homeFile);
  if (/\bqily-home-v3\b/.test(page) && page.includes('id="qily-knowledge-assets"')) {
    page = updateV3Home(page, data);
    writeIfChanged(homeFile, page);
    return;
  }

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
  const file = path.join(root, relativePath);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return '';
  return gitOutput(['log', '-1', '--format=%cs', '--', relativePath]) || buildDate;
}

function updateSitemap(data) {
  const file = path.join(root, 'sitemap.xml');
  if (!fs.existsSync(file)) return;
  let sitemap = read(file);
  sitemap = sitemap.replace(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g, (match, offset, full) => match);
  sitemap = sitemap.replace(/<url>[\s\S]*?<\/url>/g, (block) => {
    const location = block.match(/<loc>([^<]+)<\/loc>/);
    if (!location) return block;
    const lastmod = fileLastmod(urlToRepositoryPath(location[1]), data);
    if (!lastmod) return block;
    if (/<lastmod>[^<]*<\/lastmod>/.test(block)) return block.replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${lastmod}</lastmod>`);
    return block.replace('</url>', `<lastmod>${lastmod}</lastmod></url>`);
  });
  writeIfChanged(file, sitemap);
}

function main() {
  const data = collectSiteData();
  updateTerminology(data);
  updateKnowledge(data);
  updateHome(data);
  updateSitemap(data);
  writeIfChanged(siteDataFile, `${JSON.stringify(data, null, 2)}\n`);
  process.stdout.write(`Site metadata built: ${data.terminology.total} terms, ${data.briefs.total} briefs, latest ${data.briefs.latestDate}.\n`);
}

main();
