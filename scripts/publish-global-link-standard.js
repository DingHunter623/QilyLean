#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const navigationScript = '/site-navigation.js?v=20260803-parent-route-v4';
const linkStylesheet = '/site-link-standard-v2.css?v=20260803-nav-four-border-v6';
const navigationBorderStylesheet = '/site-navigation-four-border-v3.css?v=20260803-four-border-v3';
const darkStylesheet = '/site-dark-surface-contrast-v1.css?v=20260801-dark-surface-v2';
const portraitBadgeStylesheet = '/home-portrait-badge-fix-v1.css?v=20260803-badge-wrap-v2';

const navigationTag = `  <script defer src="${navigationScript}"></script>`;
const linkTag = `  <link id="qilyGlobalLinkStandardStylesheet" rel="stylesheet" href="${linkStylesheet}">`;
const navigationBorderTag = `  <link id="qilyNavigationFourBorderStylesheet" rel="stylesheet" href="${navigationBorderStylesheet}">`;
const darkTag = `  <link id="qilyDarkSurfaceContrastStylesheet" rel="stylesheet" href="${darkStylesheet}">`;
const portraitBadgeTag = `  <link id="qilyHomePortraitBadgeFixStylesheet" rel="stylesheet" href="${portraitBadgeStylesheet}">`;

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, value) {
  const normalized = value.endsWith('\n') ? value : `${value}\n`;
  if (fs.existsSync(file) && read(file) === normalized) return false;
  fs.writeFileSync(file, normalized, 'utf8');
  return true;
}

function walk(directory, callback) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.cache'].includes(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full, callback);
    else callback(full);
  }
}

function installHtmlAssets(page, file) {
  if (!/<\/head>/i.test(page)) return page;

  const next = page
    .replace(/\s*<script\b[^>]*src=["'][^"']*\/site-navigation\.js\?v=[^"']+["'][^>]*><\/script>\s*/gi, '\n')
    .replace(/\s*<link\b[^>]*id=["']qilyGlobalLinkStandardStylesheet["'][^>]*>\s*/gi, '\n')
    .replace(/\s*<link\b[^>]*id=["']qilyNavigationFourBorderStylesheet["'][^>]*>\s*/gi, '\n')
    .replace(/\s*<link\b[^>]*id=["']qilyDarkSurfaceContrastStylesheet["'][^>]*>\s*/gi, '\n')
    .replace(/\s*<link\b[^>]*id=["']qilyHomePortraitBadgeFixStylesheet["'][^>]*>\s*/gi, '\n')
    .replace(/\s*<link\b[^>]*href=["'][^"']*\/site-link-standard-v(?:1|2)\.css\?v=[^"']+["'][^>]*>\s*/gi, '\n')
    .replace(/\s*<link\b[^>]*href=["'][^"']*\/site-navigation-four-border-v3\.css\?v=[^"']+["'][^>]*>\s*/gi, '\n')
    .replace(/\s*<link\b[^>]*href=["'][^"']*\/site-dark-surface-contrast-v1\.css\?v=[^"']+["'][^>]*>\s*/gi, '\n')
    .replace(/\s*<link\b[^>]*href=["'][^"']*\/home-portrait-badge-fix-v1\.css\?v=[^"']+["'][^>]*>\s*/gi, '\n');

  const assets = [navigationTag, linkTag, navigationBorderTag, darkTag];
  if (path.relative(root, file) === 'index.html') assets.push(portraitBadgeTag);
  return next.replace(/<\/head>/i, `${assets.join('\n')}\n</head>`);
}

function patchEvidencePage() {
  const file = path.join(root, 'projects', 'lean-improvement-evidence', 'index.html');
  if (!fs.existsSync(file)) return false;
  let page = read(file);
  page = page
    .replace('<title>制造改善项目佐证｜2022年精益课题评审与激励｜QilyLean</title>', '<title>某制造企业｜2022年度制造改善项目佐证资料｜QilyLean</title>')
    .replace('<meta property="og:type" content="article"><meta property="og:title" content="制造改善项目佐证｜QilyLean">', '<meta property="og:type" content="article"><meta property="og:title" content="某制造企业｜2022年度制造改善项目佐证资料｜QilyLean">')
    .replace('<h1>制造改善项目佐证</h1>', '<h1>某制造企业｜2022年度制造改善项目佐证资料</h1>')
    .replace('以企业内部形成的课题评审、效益核算、风险评价、会议记录及奖励兑现资料，补充验证制造改善项目从组织推进到成果闭环的真实路径。', '以某制造企业2022年度形成的精益课题评审、效益核算、风险评价、会议记录及6S激励兑现资料，补充验证制造改善项目从组织推进到成果闭环的真实路径。')
    .replace('这些资料不是个人重新编制的项目总结，而是由企业内部形成并用于课题评审、财务贡献核算、风险确认、6S稽核改善及奖励发放的原始业务文件公开脱敏版。', '这些资料不是个人重新编制的项目总结，而是某制造企业在2022年度内部形成并用于课题评审、财务贡献核算、风险确认、6S稽核改善及奖励发放的原始业务文件公开脱敏版。')
    .replace('<small>6S评比与改善激励｜3页</small>', '<small>某制造企业｜2022年度6S评比与改善激励｜3页</small>')
    .replace('<span>QilyLean｜制造改善项目佐证</span>', '<span>QilyLean｜某制造企业2022年度制造改善项目佐证</span>')
    .replace(/<body class="module-page"(?: data-evidence-revision="[^"]*")?>/, '<body class="module-page" data-evidence-revision="20260803-context-v3">');
  return write(file, page);
}

function main() {
  let checked = 0;
  let changed = 0;

  walk(root, (file) => {
    if (!file.endsWith('.html')) return;
    checked += 1;
    const before = read(file);
    const after = installHtmlAssets(before, file);
    if (after !== before) {
      write(file, after);
      changed += 1;
    }
  });

  const evidenceChanged = patchEvidencePage();
  process.stdout.write(
    `Published current hierarchical navigation, complete four-side borders, homepage portrait wrapping and evidence revision to ${checked} HTML files; refreshed ${changed}; evidence context changed=${evidenceChanged}.\n`
  );
}

main();
