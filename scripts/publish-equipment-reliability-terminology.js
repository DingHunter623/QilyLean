#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const TOTAL = 183;
const DATE = '2026-08-05';

const resolve = file => path.join(root, file);
const exists = file => fs.existsSync(resolve(file));
const read = file => fs.readFileSync(resolve(file), 'utf8');
const write = (file, value) => fs.writeFileSync(resolve(file), value.endsWith('\n') ? value : `${value}\n`, 'utf8');

const termCards = `
<article class="term-card" data-term-card>
  <div class="term-code">MTBF</div>
  <div class="term-en">Mean Time Between Failures</div>
  <h3>平均故障间隔时间</h3>
  <p class="term-formula"><strong>计算公式／判定：</strong>MTBF＝统计周期内设备有效运行时间 ÷ 故障次数。故障边界、运行时间和统计对象必须使用统一口径。</p>
  <p><strong>应用场景：</strong>用于衡量可修复设备两次故障之间的平均稳定运行时间，评价重复故障控制、预防维护和可靠性改善效果；应与MTTR、OEE和重复故障率联合观察。</p>
  <p><a class="term-training-link" href="/knowledge/terminology/mtbf.html">单点培训课件｜MTBF平均故障间隔时间</a></p>
</article>
<article class="term-card" data-term-card>
  <div class="term-code">MTTR</div>
  <div class="term-en">Mean Time To Repair</div>
  <h3>平均修复时间</h3>
  <p class="term-formula"><strong>计算公式／判定：</strong>MTTR＝从故障开始到恢复合格生产的总时间 ÷ 故障次数。完整时间应覆盖响应、诊断、等待、修复、调试和质量验证。</p>
  <p><strong>应用场景：</strong>用于衡量设备故障后的完整恢复能力，识别人员响应、故障诊断、备件、权限、维修标准和首件验证等损失；应与MTBF成对观察。</p>
  <p><a class="term-training-link" href="/knowledge/terminology/mttr.html">单点培训课件｜MTTR平均修复时间</a></p>
</article>`;

function updateTerminologyPage() {
  const file = 'knowledge/terminology.html';
  let html = read(file);
  if (!html.includes('<div class="term-code">MTBF</div>')) {
    const anchorPattern = /<article\s+class="term-card"\s+data-term-card>\s*<div\s+class="term-code">UPPH<\/div>/i;
    const match = html.match(anchorPattern);
    if (!match) throw new Error('Unable to find UPPH terminology-card insertion anchor.');
    html = html.replace(anchorPattern, `${termCards}\n${match[0]}`);
  }
  html = html
    .replace(/词典：\d+项中文诠释/g, `词典：${TOTAL}项中文诠释`)
    .replace(/共收录\s*\d+\s*项术语\s*·\s*\d+\s*份单点培训课件/g, `共收录 ${TOTAL} 项术语 · ${TOTAL} 份单点培训课件`);
  write(file, html);
}

function updateVisibleCounts(file) {
  if (!exists(file)) return;
  let html = read(file);
  html = html
    .replace(/(<strong[^>]*>)181(项)?(<\/strong>)/g, `$1${TOTAL}$2$3`)
    .replace(/\b181项\b/g, `${TOTAL}项`)
    .replace(/术语与培训[^<]{0,40}181\s*项/g, match => match.replace(/181\s*项/, `${TOTAL}项`));
  write(file, html);
}

function updateSiteData() {
  const file = 'qilylean/site-data.json';
  if (!exists(file)) return;
  const data = JSON.parse(read(file));
  data.generatedAt = DATE;
  data.terminology = data.terminology || {};
  data.terminology.total = TOTAL;
  data.terminology.lessonTotal = TOTAL;
  if ('lessons' in data.terminology) data.terminology.lessons = TOTAL;
  data.search = data.search || {};
  data.search.terminologyTotal = TOTAL;
  write(file, JSON.stringify(data, null, 2));
}

function searchEntries(index) {
  if (Array.isArray(index)) return index;
  for (const key of ['entries', 'items', 'documents', 'pages']) {
    if (Array.isArray(index && index[key])) return index[key];
  }
  throw new Error('Generated search index entries are missing.');
}

function updateSearchIndex() {
  const file = 'qilylean/site-search-index.json';
  if (!exists(file)) return;
  const index = JSON.parse(read(file));
  const entries = searchEntries(index);
  const additions = [
    {
      url: '/knowledge/terminology/mtbf.html',
      title: 'MTBF｜平均故障间隔时间',
      code: 'MTBF',
      description: 'Mean Time Between Failures：衡量可修复设备两次故障之间的平均稳定运行时间，用于可靠性、重复故障和预防维护改善。',
      headings: '全站术语｜设备可靠性｜ME工程｜计划保全',
      text: 'MTBF Mean Time Between Failures 平均故障间隔时间 设备可靠性 故障次数 有效运行时间 预防维护 重复故障 OEE MTTR TPM',
      kind: '全站术语',
      date: DATE
    },
    {
      url: '/knowledge/terminology/mttr.html',
      title: 'MTTR｜平均修复时间',
      code: 'MTTR',
      description: 'Mean Time To Repair：衡量设备故障后从故障开始到恢复合格生产的平均完整恢复时间。',
      headings: '全站术语｜设备维修｜ME工程｜恢复能力',
      text: 'MTTR Mean Time To Repair 平均修复时间 响应 诊断 备件 等待 修复 调试 质量验证 MTBF OEE TPM',
      kind: '全站术语',
      date: DATE
    }
  ];
  for (const entry of additions) {
    const existing = entries.find(item => item && item.url === entry.url);
    if (existing) Object.assign(existing, entry);
    else entries.push(entry);
  }
  if (!Array.isArray(index)) {
    index.meta = index.meta || {};
    index.meta.generatedAt = DATE;
    index.meta.terminologyTotal = TOTAL;
    index.meta.totalEntries = entries.length;
  }
  write(file, JSON.stringify(index, null, 2));
}

function addSitemap(file, route) {
  if (!exists(file)) return;
  let xml = read(file);
  const loc = `https://qilylean.com${route}`;
  const record = `  <url><loc>${loc}</loc><lastmod>${DATE}</lastmod></url>`;
  if (!xml.includes(loc)) {
    if (!xml.includes('</urlset>')) throw new Error(`${file} is missing </urlset>.`);
    xml = xml.replace('</urlset>', `${record}\n</urlset>`);
  } else {
    const escaped = loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    xml = xml.replace(new RegExp(`<url><loc>${escaped}<\\/loc><lastmod>[^<]+<\\/lastmod><\\/url>`), `<url><loc>${loc}</loc><lastmod>${DATE}</lastmod></url>`);
  }
  write(file, xml);
}

function assertContracts() {
  const terminology = read('knowledge/terminology.html');
  for (const code of ['MTBF', 'MTTR']) {
    if (!terminology.includes(`<div class="term-code">${code}</div>`)) throw new Error(`${code} terminology card is missing.`);
    const lesson = `knowledge/terminology/${code.toLowerCase()}.html`;
    if (!exists(lesson)) throw new Error(`${lesson} is missing.`);
    if (!read(lesson).includes(`<h1>${code}｜`)) throw new Error(`${lesson} title contract failed.`);
  }
  if (!terminology.includes(`词典：${TOTAL}项中文诠释`)) throw new Error('Terminology total is not current.');
}

updateTerminologyPage();
updateVisibleCounts('index.html');
updateVisibleCounts('knowledge/index.html');
updateSiteData();
updateSearchIndex();
for (const sitemap of ['sitemap.xml', 'sitemap-core.xml']) {
  addSitemap(sitemap, '/knowledge/terminology/mtbf.html');
  addSitemap(sitemap, '/knowledge/terminology/mttr.html');
}
assertContracts();
console.log(`Published MTBF and MTTR terminology cards, OPL lessons, ${TOTAL}-item statistics, search metadata and sitemap entries.`);
