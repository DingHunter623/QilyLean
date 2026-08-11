#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { materializeExperienceCareerBaseline } = require('./site-career-baseline-lib');
// QILY-STATIC-CAREER-BASELINE:v1

const root = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const version = '20260811-cooper-bussmann-v4';
const startMarker = '<!-- QILY-EARLY-CAREER-HISTORY:START -->';
const endMarker = '<!-- QILY-EARLY-CAREER-HISTORY:END -->';
const resourceBlock = `${startMarker}
  <link id="qilyEarlyCareerHistoryStylesheet" rel="stylesheet" href="/site-early-career-history-v1.css?v=${version}">
  <script defer id="qilyEarlyCareerHistoryScript" data-qily-early-career-history="v4" src="/site-early-career-history-v1.js?v=${version}"></script>
${endMarker}`;

const companies = {
  jinggon: {
    english: 'Guangdong Jinggon Intelligence System Co., Ltd.',
    chinese: '广东精工智能系统有限公司',
    website: 'https://www.jinggon.com/',
    websiteLabel: '官方网站：JINGGON｜精工智能（www.jinggon.com）'
  },
  gaosheng: {
    english: 'GO-think（官方英文品牌）',
    chinese: '广东高胜互联科技有限公司',
    website: 'https://www.gdgaosheng.cn/',
    websiteLabel: '官方网站：GO-think｜高胜咨询（www.gdgaosheng.cn）'
  },
  mason: {
    english: 'Shenzhen Mason Technologies Co., Ltd.',
    chinese: '深圳万润科技股份有限公司',
    website: 'https://www.masonled.com/',
    websiteLabel: '上市公司官方网站：MASON｜万润科技（www.masonled.com）'
  },
  hengrun: {
    english: 'MASON LED（官方品牌）',
    chinese: '广东恒润光电有限公司',
    website: 'https://www.mason-led.com/',
    websiteLabel: '子公司官方网站：MASON LED｜恒润光电（www.mason-led.com）'
  },
  cooper: {
    english: 'Dongguan Cooper Electronics Co., Ltd.',
    chinese: '东莞库柏电子有限公司｜Cooper Bussmann（现 Eaton Bussmann）保险丝制造',
    website: 'https://www.eaton.com.cn/cn/zh-cn.html',
    websiteLabel: '现集团官方网站：Eaton｜伊顿（Bussmann 系列）'
  },
  flex: {
    english: 'Flextronics Manufacturing (Zhuhai) Co., Ltd.',
    chinese: '伟创力制造（珠海）有限公司',
    website: 'https://flex.com/zh/',
    websiteLabel: '官方网站：Flex｜伟创力'
  }
};

const careerRows = [
  {
    key: '2015-2019',
    label: '2015～2019年',
    title: 'LED背光源／PCBA',
    companyKeys: ['mason', 'hengrun'],
    summary: '聚焦LED背光源与PCBA制造，持续推进生产工艺优化、品质异常处理、量产稳定性改善及生产效率提升。进一步强化跨部门协同、现场工程改善与项目推进能力，为后续精益运营和制造项目管理奠定基础。'
  },
  {
    key: '2009-2015',
    label: '2009～2015年',
    title: 'Cooper Bussmann保险丝制造｜生产技术、先后PE工程、IE工程',
    companyKeys: ['cooper'],
    summary: '长期在东莞库柏电子从事 Cooper Bussmann（现 Eaton Bussmann）保险丝制造相关生产技术与PE工程，产品工艺涵盖SMD、DIP、砖块保险丝、陶瓷管／玻璃管保险丝及汽车插片保险丝，负责工艺优化、设备与品质异常处理及量产稳定性改善。随后逐步转向IE工程，围绕标准工时、产能分析、工序平衡、人员配置、效率提升与现场改善，形成由生产技术、PE工程向IE工程延伸的能力路径。该国际品牌制造经历也成为后续进入上市公司并晋升工程管理岗位的重要职业背书之一。'
  },
  {
    key: '2006-2009',
    label: '2006～2009年',
    title: 'PCBA TE工程／IE工程',
    companyKeys: ['flex'],
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

function companyMarkup(item) {
  if (!Array.isArray(item.companyKeys) || item.companyKeys.length === 0) return '';
  const items = item.companyKeys.map((key) => {
    const company = companies[key];
    return `<span class="career-row-company-item"><span lang="en">${company.english}</span><span aria-hidden="true">｜</span><span>${company.chinese}</span><a href="${company.website}" target="_blank" rel="noopener noreferrer external">${company.websiteLabel} ↗</a></span>`;
  }).join('');
  return `<span class="career-row-company"><b>任职公司：</b><span class="career-row-company-list">${items}</span></span>`;
}

function buildRow(item) {
  return `<tr data-career-era="${item.key}"><td><a class="career-year-link career-range-link" href="/experience/#career-${item.key}" aria-label="查看${item.label}履历主线">${item.label}</a></td><td><strong class="career-row-title">${item.title}</strong>${companyMarkup(item)}<span class="career-row-summary">${item.summary}</span></td></tr>`;
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

function validate(archive, experience, enhancer) {
  [archive, experience].forEach((content, index) => {
    const label = index === 0 ? 'daily-insights' : 'experience';
    assert(content.includes('site-early-career-history-v1.css?v=' + version), `${label}: stylesheet missing`);
    assert(content.includes('site-early-career-history-v1.js?v=' + version), `${label}: script missing`);
    assert(content.includes('data-qily-early-career-history="v4"'), `${label}: v4 data marker missing`);
    assert((content.match(/QILY-EARLY-CAREER-HISTORY:START/g) || []).length === 1, `${label}: duplicate resource block`);
  });

  careerRows.forEach((item) => {
    assert(archive.includes(`data-career-era="${item.key}"`), `archive: ${item.key} row missing`);
    assert(archive.includes(`/experience/#career-${item.key}`), `archive: ${item.key} link missing`);
    assert(archive.includes(item.label), `archive: ${item.label} missing`);
    assert(archive.includes(item.title), `archive: ${item.title} missing`);
    assert(archive.includes(item.summary), `archive: ${item.key} summary missing`);
    item.companyKeys.forEach((key) => {
      const company = companies[key];
      assert(archive.includes(company.english), `archive: ${item.key} ${key} English company name missing`);
      assert(archive.includes(company.chinese), `archive: ${item.key} ${key} Chinese company name missing`);
      assert(archive.includes(`href="${company.website}"`), `archive: ${item.key} ${key} official website missing`);
      assert(archive.includes(company.websiteLabel), `archive: ${item.key} ${key} website label missing`);
    });
  });

  ['jinggon', 'gaosheng', 'mason', 'hengrun', 'cooper', 'flex'].forEach((key) => {
    const company = companies[key];
    assert(enhancer.includes(company.english), `enhancer: ${key} English company name missing`);
    assert(enhancer.includes(company.chinese), `enhancer: ${key} Chinese company name missing`);
    assert(enhancer.includes(company.website), `enhancer: ${key} official website missing`);
  });

  assert(enhancer.includes('Cooper Bussmann（现 Eaton Bussmann）'), 'enhancer: Cooper Bussmann brand history missing');
  assert(enhancer.includes('2019.07—2025.08｜广东精工智能系统 / 广东高胜互联科技（集团内调动）'), 'enhancer: 2019-2025 exact career period missing');
  assert(enhancer.includes('2015.07—2019.06｜深圳万润科技·广东恒润光电有限公司（上市公司：万润科技）'), 'enhancer: 2015-2019 exact career period missing');
  assert(enhancer.includes("'career-2019-2025'"), 'enhancer: 2019-2025 anchor missing');
  assert(archive.includes('<col class="career-year-col">'), 'archive: career year column missing');
  assert(!/data-career-era="(?:2015-2019|2009-2015|2006-2009)"[\s\S]*?daily-insights\.html\?year=/.test(archive), 'archive: early career links still point to archive filters');
}

const archivePath = 'qilylean/daily-insights.html';
const experiencePath = 'experience/index.html';
const enhancerPath = 'site-early-career-history-v1.js';
const originalArchive = read(archivePath);
const originalExperience = read(experiencePath);
const enhancer = read(enhancerPath);
const nextArchive = updateCareerTable(injectResources(originalArchive, archivePath));
const nextExperience = materializeExperienceCareerBaseline(injectResources(originalExperience, experiencePath));

validate(nextArchive, nextExperience, enhancer);

const changes = [];
if (nextArchive !== originalArchive) changes.push(archivePath);
if (nextExperience !== originalExperience) changes.push(experiencePath);

if (checkOnly) {
  if (changes.length) {
    throw new Error(`Career company website publication is not current: ${changes.join(', ')}`);
  }
  process.stdout.write('Career company website publication contract passed; no changes required.\n');
  process.exit(0);
}

if (nextArchive !== originalArchive) write(archivePath, nextArchive);
if (nextExperience !== originalExperience) write(experiencePath, nextExperience);
process.stdout.write(`Career company websites updated ${changes.length} file(s): ${changes.join(', ') || 'none'}.\n`);
