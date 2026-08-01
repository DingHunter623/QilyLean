#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, v) => fs.writeFileSync(path.join(root, p), v.endsWith('\n') ? v : v + '\n', 'utf8');

const termHtml = 'knowledge/terminology.html';
const sponsorScript = '/knowledge/terminology-sponsor-v1.js?v=20260801-sponsor-v1';
let page = read(termHtml);
if (!page.includes('terminology-sponsor-v1.js')) {
  page = page.replace('</body>', '<script defer src="' + sponsorScript + '"></script>\n</body>');
}
page = page.replace(/词典：\d+项中文诠释/, '词典：181项中文诠释');
page = page.replace(/共收录\s+\d+\s+项术语\s+·\s+\d+\s+份单点培训课件/, '共收录 181 项术语 · 181 份单点培训课件');
write(termHtml, page);

/* Keep Sponsor inside the unified terminology count even though the card is
 * delivered by the dedicated enhancement script. This prevents later metadata
 * rebuilds from reverting 181 back to 180. */
const metadataBuilder = 'scripts/build-site-metadata.js';
let metadataSource = read(metadataBuilder);
const oldCounter = "  const terminologyTotal = countMatches(terminologyPage, /<article\\b[^>]*\\bdata-term-card\\b[^>]*>/gi);";
const newCounter = [
  "  let terminologyTotal = countMatches(terminologyPage, /<article\\b[^>]*\\bdata-term-card\\b[^>]*>/gi);",
  "  if (terminologyPage.includes('terminology-sponsor-v1.js') && !/<article\\b[^>]*\\bdata-term-card\\b[^>]*>[\\s\\S]*?<div class=\"term-code\">Sponsor<\\/div>/i.test(terminologyPage)) terminologyTotal += 1;"
].join('\n');
if (metadataSource.includes(oldCounter)) {
  metadataSource = metadataSource.replace(oldCounter, newCounter);
} else if (!metadataSource.includes("terminology-sponsor-v1.js') &&")) {
  throw new Error('Unable to patch unified terminology counter for Sponsor');
}
write(metadataBuilder, metadataSource);

const brief = 'qilylean/daily/2026-08-01.html';
if (fs.existsSync(path.join(root, brief))) {
  let b = read(brief);
  b = b.replace(/高层Sponsor(?!（)/g, '高层Sponsor（项目发起人／主责高层）');
  write(brief, b);
}

const dataFile = 'qilylean/site-data.json';
const data = JSON.parse(read(dataFile));
data.generatedAt = '2026-08-01';
data.terminology = data.terminology || {};
data.terminology.total = 181;
data.terminology.lessonTotal = 181;
data.search = data.search || {};
data.search.terminologyTotal = 181;
write(dataFile, JSON.stringify(data, null, 2));

const indexFile = 'qilylean/site-search-index.json';
try {
  const index = JSON.parse(read(indexFile));
  const entries = Array.isArray(index) ? index : (Array.isArray(index.entries) ? index.entries : null);
  if (entries) {
    const url = '/knowledge/terminology/sponsor.html';
    if (!entries.some(e => e && e.url === url)) entries.push({
      url,
      title: 'Sponsor｜项目发起人／项目主责高层',
      code: 'Sponsor',
      description: 'Project Sponsor：代表组织对项目进行授权、资源保障、重大里程碑评审、跨部门障碍清除、重大风险升级及收益确认的高层治理角色。',
      headings: '全站术语｜项目治理｜工程项目交付',
      text: 'Sponsor Project Sponsor 项目发起人 项目主责高层 项目赞助人 高层支持 项目授权 资源保障 里程碑评审 重大风险升级 跨部门协调 收益确认 项目经理 职能经理',
      kind: '全站术语',
      date: '2026-08-01'
    });
    if (!Array.isArray(index)) {
      index.meta = index.meta || {};
      index.meta.generatedAt = '2026-08-01';
      index.meta.terminologyTotal = 181;
      index.meta.totalEntries = entries.length;
    }
    data.search.indexedEntries = entries.length;
    write(indexFile, JSON.stringify(index, null, 2));
    write(dataFile, JSON.stringify(data, null, 2));
  }
} catch (error) {
  throw new Error('Unable to synchronize Sponsor into generated search index: ' + error.message);
}

function addSitemap(file) {
  if (!fs.existsSync(path.join(root, file))) return;
  let xml = read(file);
  const loc = 'https://qilylean.com/knowledge/terminology/sponsor.html';
  if (!xml.includes(loc)) xml = xml.replace('</urlset>', '  <url><loc>' + loc + '</loc><lastmod>2026-08-01</lastmod></url>\n</urlset>');
  write(file, xml);
}
addSitemap('sitemap.xml');
addSitemap('sitemap-core.xml');
console.log('Published Sponsor terminology, OPL, brief annotation, unified statistics, search and sitemap synchronization.');
