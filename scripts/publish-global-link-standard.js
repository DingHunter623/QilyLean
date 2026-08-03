#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const stylesheet = '/site-link-standard-v2.css?v=20260803-nav-four-border-v6';
const darkSurfaceStylesheet = '/site-dark-surface-contrast-v1.css?v=20260801-dark-surface-v2';
const navigationScript = '/site-navigation.js?v=20260803-nav-four-border-v3';
const navigationScriptTag = `  <script defer src="${navigationScript}"></script>`;
const linkTag = `  <link id="qilyGlobalLinkStandardStylesheet" rel="stylesheet" href="${stylesheet}">`;
const darkLinkTag = `  <link id="qilyDarkSurfaceContrastStylesheet" rel="stylesheet" href="${darkSurfaceStylesheet}">`;
const loaderMarker = 'qily-global-link-standard-loader-v1';

function read(file) { return fs.readFileSync(file, 'utf8'); }
function write(file, value) {
  const normalized = value.endsWith('\n') ? value : `${value}\n`;
  if (fs.existsSync(file) && read(file) === normalized) return false;
  fs.writeFileSync(file, normalized, 'utf8');
  return true;
}

function walk(directory, callback) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.cache') continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full, callback);
    else callback(full);
  }
}

function installHtmlLinks(page) {
  if (!/<\/head>/i.test(page)) return page;
  let next = page
    .replace(/\s*<script\b[^>]*src=["'][^"']*\/site-navigation\.js\?v=[^"']+["'][^>]*><\/script>\s*/gi, '\n')
    .replace(/\s*<link\b[^>]*id=["']qilyGlobalLinkStandardStylesheet["'][^>]*>\s*/gi, '\n')
    .replace(/\s*<link\b[^>]*id=["']qilyDarkSurfaceContrastStylesheet["'][^>]*>\s*/gi, '\n')
    .replace(/\s*<link\b[^>]*href=["'][^"']*\/site-link-standard-v(?:1|2)\.css\?v=[^"']+["'][^>]*>\s*/gi, '\n')
    .replace(/\s*<link\b[^>]*href=["'][^"']*\/site-dark-surface-contrast-v1\.css\?v=[^"']+["'][^>]*>\s*/gi, '\n');
  return next.replace(/<\/head>/i, `${navigationScriptTag}\n${linkTag}\n${darkLinkTag}\n</head>`);
}

function patchNavigationLoader() {
  const file = path.join(root, 'site-navigation.js');
  let page = read(file);
  const loader = `/* ${loaderMarker} */\n(function(d){\n  'use strict';\n  var styles=[\n    {id:'qilyGlobalLinkStandardStylesheet',href:'${stylesheet}'},\n    {id:'qilyDarkSurfaceContrastStylesheet',href:'${darkSurfaceStylesheet}'}\n  ];\n  styles.forEach(function(style){\n    var current=d.getElementById(style.id);\n    if(current){if(current.getAttribute('href')!==style.href)current.setAttribute('href',style.href);return;}\n    var link=d.createElement('link');\n    link.id=style.id;link.rel='stylesheet';link.href=style.href;\n    (d.head||d.documentElement).appendChild(link);\n  });\n})(document);\n\n`;
  if (page.includes(loaderMarker)) {
    page = page.replace(/\/\* qily-global-link-standard-loader-v1 \*\/[\s\S]*?\}\)\(document\);\s*/m, loader);
  } else {
    page = loader + page;
  }
  return write(file, page);
}

function patchNavigationBorderStandard() {
  const file = path.join(root, 'site-link-standard-v2.css');
  let css = read(file);
  css = css.replace('全站链接视觉规范 v5', '全站链接视觉规范 v6');

  const start = '/* QILY-NAV-FOUR-SIDE-BORDER:START */';
  const end = '/* QILY-NAV-FOUR-SIDE-BORDER:END */';
  const nav = 'html body :is(.qily-site-header,.qily-global-header,header.topbar,header.top,header.site-header,header)\n:is(.site-nav,.qily-global-nav,.nav,nav[aria-label="网站导航"]) > a[href]';
  const current = ':is([aria-current],[aria-selected="true"],[data-current="true"],[data-active="true"],.active,.current,.is-active,.selected)';
  const block = `${start}
/* 主导航真实交互态：常态预留透明四边框，悬停、聚焦、当前页及按下状态均显示完整上下左右边线。 */
${nav}{
  box-sizing:border-box!important;
  border-style:solid!important;
  border-width:2px!important;
  border-top-color:transparent!important;
  border-right-color:transparent!important;
  border-bottom-color:transparent!important;
  border-left-color:transparent!important;
  background-clip:padding-box!important;
}
${nav}${current}{
  border-top-color:#ffe39b!important;
  border-right-color:#ffe39b!important;
  border-bottom-color:#ffe39b!important;
  border-left-color:#ffe39b!important;
}
${nav}:not(${current}):hover,
${nav}:not(${current}):focus-visible{
  border-top-color:var(--qily-nav-hover-border,#c99a3e)!important;
  border-right-color:var(--qily-nav-hover-border,#c99a3e)!important;
  border-bottom-color:var(--qily-nav-hover-border,#c99a3e)!important;
  border-left-color:var(--qily-nav-hover-border,#c99a3e)!important;
}
${nav}${current}:hover,
${nav}${current}:focus-visible,
${nav}:active{
  border-top-color:#ffe39b!important;
  border-right-color:#ffe39b!important;
  border-bottom-color:#ffe39b!important;
  border-left-color:#ffe39b!important;
}
${end}`;

  const startIndex = css.indexOf(start);
  const endIndex = css.indexOf(end);
  if (startIndex >= 0 && endIndex >= startIndex) {
    css = `${css.slice(0, startIndex)}${block}${css.slice(endIndex + end.length)}`;
  } else {
    css = `${css.trimEnd()}\n\n${block}\n`;
  }
  return write(file, css);
}

function patchEvidencePage() {
  const file = path.join(root, 'projects', 'lean-improvement-evidence', 'index.html');
  let page = read(file);
  page = page
    .replace('<title>制造改善项目佐证｜2022年精益课题评审与激励｜QilyLean</title>', '<title>某制造企业｜2022年度制造改善项目佐证资料｜QilyLean</title>')
    .replace('<meta property="og:type" content="article"><meta property="og:title" content="制造改善项目佐证｜QilyLean">', '<meta property="og:type" content="article"><meta property="og:title" content="某制造企业｜2022年度制造改善项目佐证资料｜QilyLean">')
    .replace('<h1>制造改善项目佐证</h1>', '<h1>某制造企业｜2022年度制造改善项目佐证资料</h1>')
    .replace('以企业内部形成的课题评审、效益核算、风险评价、会议记录及奖励兑现资料，补充验证制造改善项目从组织推进到成果闭环的真实路径。', '以某制造企业2022年度形成的精益课题评审、效益核算、风险评价、会议记录及6S激励兑现资料，补充验证制造改善项目从组织推进到成果闭环的真实路径。')
    .replace('这些资料不是个人重新编制的项目总结，而是由企业内部形成并用于课题评审、财务贡献核算、风险确认、6S稽核改善及奖励发放的原始业务文件公开脱敏版。', '这些资料不是个人重新编制的项目总结，而是某制造企业在2022年度内部形成并用于课题评审、财务贡献核算、风险确认、6S稽核改善及奖励发放的原始业务文件公开脱敏版。')
    .replace('<small>6S评比与改善激励｜3页</small>', '<small>某制造企业｜2022年度6S评比与改善激励｜3页</small>')
    .replace('<span>QilyLean｜制造改善项目佐证</span>', '<span>QilyLean｜某制造企业2022年度制造改善项目佐证</span>');
  return write(file, page);
}

function main() {
  const navigationBorderChanged = patchNavigationBorderStandard();
  const evidenceChanged = patchEvidencePage();
  let htmlChanged = 0;
  let htmlChecked = 0;
  walk(root, (file) => {
    if (!file.endsWith('.html')) return;
    htmlChecked += 1;
    const before = read(file);
    const after = installHtmlLinks(before);
    if (after !== before) {
      write(file, after);
      htmlChanged += 1;
    }
  });
  const navigationChanged = patchNavigationLoader();
  process.stdout.write(`Published QilyLean link standard v6 to ${htmlChecked} HTML files; refreshed ${htmlChanged}; navigation script=${navigationScript}; four-side navigation border changed=${navigationBorderChanged}; evidence context changed=${evidenceChanged}; navigation loader changed=${navigationChanged}.\n`);
}

main();
