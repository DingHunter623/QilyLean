#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const NAV_VERSION = '20260803-vi-contrast-restored-v2';
const SHELL_VERSION = '20260729-no-old-flash-v1';
const VISUAL_VERSION = '20260803-home-badge-wrap-v5';
const WIDE_VERSION = '20260729-fluid-copy-v5';
const TYPE_VERSION = '20260729-hierarchy-v4';
const VI_VERSION = '20260801-vi-standard-v1';
const CONTRAST_VERSION = '20260803-vi-contrast-hotfix-v1';
const MUSIC_VERSION = '20260729-continuous-v4';

function read(file) { return fs.readFileSync(file, 'utf8'); }
function write(file, content) {
  const normalized = content.endsWith('\n') ? content : `${content}\n`;
  if (fs.existsSync(file) && read(file) === normalized) return false;
  fs.writeFileSync(file, normalized, 'utf8');
  return true;
}

function headAssets() {
  return [
    '  <script data-qily-shell-bootstrap>(function(d){var e=d.documentElement;e.classList.add("qily-shell-pending");window.__qilyLeanRevealCurrentShell=function(){e.classList.remove("qily-shell-pending")};setTimeout(window.__qilyLeanRevealCurrentShell,1800)})(document);</script>',
    '  <link rel="stylesheet" href="/site-shell.css?v=' + SHELL_VERSION + '">',
    '  <link id="qilyVisualScaleStylesheet" rel="stylesheet" href="/site-visual-scale-v1.css?v=' + VISUAL_VERSION + '">',
    '  <link id="qilyWideLayoutStylesheet" rel="stylesheet" href="/site-wide-layout-v1.css?v=' + WIDE_VERSION + '">',
    '  <link id="qilyTypographyStylesheet" rel="stylesheet" href="/site-typography-v1.css?v=' + TYPE_VERSION + '">',
    '  <link id="qilyViStandardStylesheet" rel="stylesheet" href="/site-vi-standard-v1.css?v=' + VI_VERSION + '">',
    '  <link id="qilyViContrastRestorationStylesheet" rel="stylesheet" href="/site-vi-contrast-restoration-v1.css?v=' + CONTRAST_VERSION + '">',
    '  <script defer src="/site-navigation.js?v=' + NAV_VERSION + '"></script>'
  ].join('\n');
}

function cleanAndInject(page) {
  if (!/<\/head>/i.test(page)) return page;
  let next = page
    .replace(/\s*<script\b[^>]*data-qily-shell-bootstrap[^>]*>[\s\S]*?<\/script>\s*/gi, '\n')
    .replace(/\s*<script\b[^>]*src=["'][^"']*\/site-navigation\.js\?v=[^"']+["'][^>]*>\s*<\/script>\s*/gi, '\n')
    .replace(/\s*<link\b[^>]*href=["'][^"']*\/(?:site-shell|site-visual-scale-v1|site-wide-layout-v1|site-typography-v1|site-vi-standard-v1|site-vi-contrast-restoration-v1)\.css\?v=[^"']+["'][^>]*>\s*/gi, '\n')
    .replace(/\s*<link\b[^>]*href=["'][^"']*\/site-microsoft-(?:international-v1|enterprise-components-v2)\.css\?v=[^"']+["'][^>]*>\s*/gi, '\n')
    .replace(/\s*<script\b[^>]*src=["'][^"']*\/site-microsoft-international-v1\.js\?v=[^"']+["'][^>]*>\s*<\/script>\s*/gi, '\n');
  next = next.replace(/<\/head>/i, headAssets() + '\n</head>');
  return next.replace(/homepage-music\.js\?v=[^"']+/g, `homepage-music.js?v=${MUSIC_VERSION}`);
}

function patchEvidence(page, relativePath) {
  if (relativePath === 'capabilities/index.html') {
    page = page
      .replace(/<h2>制造改善项目佐证资料<\/h2>/g, '<h2>2022年度某制造企业｜制造改善项目佐证资料</h2>')
      .replace(
        /以企业内部形成的课题评审、效益核算、风险评价，以及年度／月度6S评比、每周稽核整改与奖励兑现资料，补充验证制造改善项目的组织推进与成果闭环。/g,
        '以下资料来自2022年度某制造企业的制造改善项目，包括第三季度课题效益评审、第四季度项目结案评审，以及年度／月度6S评比、每周稽核整改与奖励兑现记录，用于补充验证项目组织推进与成果闭环。'
      );
  }
  if (relativePath === 'projects/index.html') {
    page = page.replace(/<h3>制造改善项目佐证资料<\/h3>/g, '<h3>2022年度某制造企业｜制造改善项目佐证资料</h3>');
  }
  return page;
}

function walk(directory, callback) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.cache'].includes(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full, callback);
    else callback(full);
  }
}

let changed = 0;
let scanned = 0;
walk(root, (file) => {
  if (!file.endsWith('.html')) return;
  scanned += 1;
  const relativePath = path.relative(root, file).split(path.sep).join('/');
  const before = read(file);
  const after = patchEvidence(cleanAndInject(before), relativePath);
  if (after !== before && write(file, after)) changed += 1;
});

const checks = [
  ['capabilities/index.html', '2022年度某制造企业｜制造改善项目佐证资料'],
  ['capabilities/index.html', '以下资料来自2022年度某制造企业的制造改善项目'],
  ['projects/lean-improvement-evidence/index.html', '某制造企业｜2022年度制造改善项目佐证资料'],
  ['trust/index.html', '查看商业交付档案'],
  ['trust/index.html', '查看客户评价授权规则']
];
for (const [relativePath, marker] of checks) {
  const file = path.join(root, relativePath);
  if (!fs.existsSync(file) || !read(file).includes(marker)) throw new Error(`Required marker missing: ${relativePath} -> ${marker}`);
}

process.stdout.write(`Emergency VI materialization complete: scanned ${scanned} HTML files, changed ${changed}.\n`);
