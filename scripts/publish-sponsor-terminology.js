#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const publishDate = process.env.QILY_BUILD_DATE || new Date().toISOString().slice(0, 10);
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, v) => fs.writeFileSync(path.join(root, p), v.endsWith('\n') ? v : v + '\n', 'utf8');

const termHtml = 'knowledge/terminology.html';
const sponsorScript = '/knowledge/terminology-sponsor-v1.js?v=20260801-sponsor-v1';
let page = read(termHtml);
if (!page.includes('terminology-sponsor-v1.js')) {
  page = page.replace('</body>', '<script defer src="' + sponsorScript + '"></script>\n</body>');
}
const embeddedTerminologyTotal = (page.match(/<article\b[^>]*\bdata-term-card\b[^>]*>/gi) || []).length;
const terminologyTotal = embeddedTerminologyTotal + (page.includes('terminology-sponsor-v1.js') ? 1 : 0);
page = page.replace(/词典：\d+项中文诠释/, '词典：' + terminologyTotal + '项中文诠释');
page = page.replace(/共收录\s+\d+\s+项术语\s+·\s+\d+\s+份单点培训课件/, '共收录 ' + terminologyTotal + ' 项术语 · ' + terminologyTotal + ' 份单点培训课件');
write(termHtml, page);

/* Keep Sponsor inside the unified terminology count even though the card is
 * delivered by the dedicated enhancement script. Also preserve compliance
 * and generated search metadata during later unified metadata rebuilds. */
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

const oldReturnBlock = [
  '  const existing = readExistingData();',
  '  const unchanged = existing && JSON.stringify(withoutGeneratedAt(existing)) === JSON.stringify(core);',
  '  return { generatedAt: unchanged && existing.generatedAt ? existing.generatedAt : buildDate, ...core };'
].join('\n');
const newReturnBlock = [
  '  const existing = readExistingData();',
  "  const reserved = new Set(['generatedAt', 'schemaVersion', 'terminology', 'briefs', 'knowledge']);",
  '  const extras = existing ? Object.fromEntries(Object.entries(existing).filter(([key]) => !reserved.has(key))) : {};',
  '  const merged = { ...core, ...extras };',
  '  const unchanged = existing && JSON.stringify(withoutGeneratedAt(existing)) === JSON.stringify(merged);',
  '  return { generatedAt: unchanged && existing.generatedAt ? existing.generatedAt : buildDate, ...merged };'
].join('\n');
if (metadataSource.includes(oldReturnBlock)) {
  metadataSource = metadataSource.replace(oldReturnBlock, newReturnBlock);
} else if (!metadataSource.includes("const reserved = new Set(['generatedAt'")) {
  throw new Error('Unable to patch metadata preservation rule');
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
data.generatedAt = publishDate;
data.terminology = data.terminology || {};
data.terminology.total = terminologyTotal;
data.terminology.lessonTotal = terminologyTotal;
data.compliance = {
  brandNature: '丁启利发起并运营的个人专业品牌与制造改善实践平台',
  separateLegalEntity: false,
  defaultContractingParty: '丁启利（自然人）',
  contractRule: '若具体项目由依法登记的企业、工作室或合作机构签约，以正式报价、合同首页、盖章／电子签署主体、收款账户及发票信息所载主体为准。',
  pricingRule: '网站服务说明与价格信息用于合作沟通和范围评估，不构成不可撤销要约；正式范围、费用、周期、税费、差旅及验收标准以合同为准。',
  paymentRule: '仅向正式合同或双方书面确认文件载明的账户付款；变更收款账户时须通过官网公开联系方式复核。',
  dataRule: '客户资料按必要、最小化和保密原则使用；涉及客户名称、工艺、成本、经营数据及人员信息的材料，仅在授权范围内处理。',
  evidenceRule: '已核定值、阶段性估算值、团队成果与个人职责分别标注，不将预测收益表述为已实现收益。',
  aiRule: 'AI用于检索、整理和方案辅助，不替代现场核实、专业评审、管理决策及法律、财税、安全等专项意见。',
  contactPhone: '13450014003',
  contactEmail: '396767769@qq.com',
  trustCenterUrl: '/trust/',
  ndaVersion: 'V1.0',
  ndaContentRule: '网站在线阅读版与正式存档PDF／Word内容保持一致；官网不公开存档文件下载入口。',
  ndaPreviewUrl: '/trust/nda-preview.html',
  ndaAccessRule: '官网仅开放受控在线预览，不提供Word或PDF下载入口。',
  ndaDocumentName: 'QilyLean项目保密声明',
  ...(data.compliance || {})
};
data.search = {
  indexedEntries: 0,
  indexedPages: 36,
  terminologyTotal,
  briefTotal: 2580,
  latestBriefDate: '2026-08-01',
  sitemapLastmod: '2026-08-01',
  ...(data.search || {}),
  terminologyTotal
};
write(dataFile, JSON.stringify(data, null, 2));

const indexFile = 'qilylean/site-search-index.json';
try {
  const index = JSON.parse(read(indexFile));
  const entries = Array.isArray(index) ? index : (Array.isArray(index.entries) ? index.entries : null);
  if (!entries) throw new Error('generated search index entries are missing');
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
    index.meta.generatedAt = publishDate;
    index.meta.terminologyTotal = terminologyTotal;
    index.meta.totalEntries = entries.length;
  }
  data.search.indexedEntries = entries.length;
  data.search.terminologyTotal = terminologyTotal;
  write(indexFile, JSON.stringify(index, null, 2));
  write(dataFile, JSON.stringify(data, null, 2));
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
console.log('Published Sponsor terminology, OPL, brief annotation, unified statistics, search, compliance and sitemap synchronization.');
