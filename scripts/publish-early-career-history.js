#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const version = '20260805-early-career-v1';
const startMarker = '<!-- QILY-EARLY-CAREER-HISTORY:START -->';
const endMarker = '<!-- QILY-EARLY-CAREER-HISTORY:END -->';
const resourceBlock = `${startMarker}
  <link id="qilyEarlyCareerHistoryStylesheet" rel="stylesheet" href="/site-early-career-history-v1.css?v=${version}">
  <script defer id="qilyEarlyCareerHistoryScript" data-qily-early-career-history="v1" src="/site-early-career-history-v1.js?v=${version}"></script>
${endMarker}`;

const careerRows = [
  {
    key: '2015-2019',
    label: '2015～2019年',
    title: 'LED背光源／PCBA',
    summary: '聚焦LED背光源与PCBA制造，持续推进生产工艺优化、品质异常处理、量产稳定性改善及生产效率提升。进一步强化跨部门协同、现场工程改善与项目推进能力，为后续精益运营和制造项目管理奠定基础。'
  },
  {
    key: '2009-2015',
    label: '2009～2015年',
    title: '保险丝生产技术／PE转IE工程',
    summary: '长期从事保险丝生产技术与PE工程，产品工艺涵盖SMD、DIP、砖块保险丝、陶瓷管／玻璃管保险丝及汽车插片保险丝，负责工艺优化、设备与品质异常处理及量产稳定性改善。随后逐步转向IE工程，围绕标准工时、产能分析、工序平衡、人员配置、效率提升与现场改善，形成由生产技术、PE工程向IE工程延伸的能力路径。'
  },
  {
    key: '2006-2009',
    label: '2006～2009年',
    title: 'PCBA测试工程／工业工程',
    summary: '参与摩托罗拉、诺基亚、华为等品牌手机，以及戴尔、华硕、联想等品牌电脑与服务器产品的PCBA测试、异常分析、维修验证和量产支持。随后延伸至工业工程领域，围绕标准工时、生产效率、工序平衡、流程优化与现场改善，建立制造工程与IE改善基础。'
  }
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function write(relativePath, content) {
  fs.writeFileSync(path.join(root, relativePath), content, 'utf8');
}

function injectResources(source, relativePath) {
  const escapedStart = startMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedEnd = endMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const blockExpression = new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}\\s*`, 'g');
  let next = source.replace(blockExpression, '');
  if (!next.includes('</head>')) throw new Error(`${relativePath}: missing </head>`);
  next = next.replace('</head>', `${resourceBlock}\n</head>`);
  return next;
}

function buildRow(item) {
  return `<tr data-career-era="${item.key}"><td><a class="career-year-link career-range-link" href="/experience/#career-${item.key}" aria-label="查看${item.label}履历主线">${item.label}</a></td><td><strong class="career-row-title">${item.title}</strong><span class="career-row-summary">${item.summary}</span></td></tr>`;
}

function updateCareerTable(source) {
  const tableExpression = /(<table class="rule-table career-table"[\s\S]*?<tbody>)([\s\S]*?)(<\/tbody><\/table>)/;
  const match = source.match(tableExpression);
  if (!match) throw new Error('qilylean/daily-insights.html: career table not found');

  let body = match[2];
  body = body.replace(/<tr data-career-era="(?:2015-2019|2009-2015|2006-2009)">[\s\S]*?<\/tr>/g, '');
  const rows = careerRows.map(buildRow).join('');
  const replacement = `${match[1]}${body}${rows}${match[3]}`;
  return source.replace(tableExpression, replacement);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function validate(archive, experience) {
  [archive, experience].forEach((content, index) => {
    const label = index === 0 ? 'daily-insights' : 'experience';
    assert(content.includes('site-early-career-history-v1.css?v=' + version), `${label}: stylesheet missing`);
    assert(content.includes('site-early-career-history-v1.js?v=' + version), `${label}: script missing`);
    assert((content.match(/QILY-EARLY-CAREER-HISTORY:START/g) || []).length === 1, `${label}: duplicate resource block`);
  });

  careerRows.forEach((item) => {
    assert(archive.includes(`data-career-era="${item.key}"`), `archive: ${item.key} row missing`);
    assert(archive.includes(`/experience/#career-${item.key}`), `archive: ${item.key} link missing`);
    assert(archive.includes(item.label), `archive: ${item.label} missing`);
    assert(archive.includes(item.title), `archive: ${item.title} missing`);
    assert(archive.includes(item.summary), `archive: ${item.key} summary missing`);
  });

  assert(archive.includes('<col class="career-year-col">'), 'archive: career year column missing');
  assert(!/data-career-era="(?:2015-2019|2009-2015|2006-2009)"[\s\S]*?daily-insights\.html\?year=/.test(archive), 'archive: early career links still point to archive filters');
}

const archivePath = 'qilylean/daily-insights.html';
const experiencePath = 'experience/index.html';
const originalArchive = read(archivePath);
const originalExperience = read(experiencePath);
const nextArchive = updateCareerTable(injectResources(originalArchive, archivePath));
const nextExperience = injectResources(originalExperience, experiencePath);

validate(nextArchive, nextExperience);

const changes = [];
if (nextArchive !== originalArchive) changes.push(archivePath);
if (nextExperience !== originalExperience) changes.push(experiencePath);

if (checkOnly) {
  if (changes.length) {
    throw new Error(`Early career publication is not current: ${changes.join(', ')}`);
  }
  process.stdout.write('Early career publication contract passed; no changes required.\n');
  process.exit(0);
}

if (nextArchive !== originalArchive) write(archivePath, nextArchive);
if (nextExperience !== originalExperience) write(experiencePath, nextExperience);
process.stdout.write(`Early career publication updated ${changes.length} file(s): ${changes.join(', ') || 'none'}.\n`);
