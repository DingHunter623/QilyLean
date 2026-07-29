#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const navigationFile = path.join(root, 'site-navigation.js');
const visualScaleFile = path.join(root, 'site-visual-scale-v1.css');
const wideLayoutFile = path.join(root, 'site-wide-layout-v1.css');
const typographyFile = path.join(root, 'site-typography-v1.css');
const musicFile = path.join(root, 'homepage-music.js');
const experienceFile = path.join(root, 'experience', 'index.html');
const capabilitiesFile = path.join(root, 'capabilities', 'index.html');
const certificateFile = path.join(root, 'certificates', 'chatgpt-lean', 'index.html');
const PUBLIC_NAV_VERSION = '20260729-no-old-flash-v1';
const PUBLIC_SHELL_VERSION = '20260729-no-old-flash-v1';
const PUBLIC_ASSET_VERSION = '20260729-hierarchy-v4';
const PUBLIC_RESUME_VERSION = '20260728-public-access-v2';
const WIDE_LAYOUT_VERSION = '20260729-fluid-copy-v5';
const TYPE_SYSTEM_VERSION = '20260729-hierarchy-v4';
const MUSIC_VERSION = '20260729-continuous-v4';

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.writeFileSync(file, content, 'utf8');
}

function unlockNavigation() {
  let page = read(navigationFile);

  page = page
    .replace(/window\.__qilyLeanSiteNavigation(?:V\d+|PublicV\d+)/g, 'window.__qilyLeanSiteNavigationPublicV8')
    .replace(/var SHARED_ASSET_VERSION = '[^']*';/, `var SHARED_ASSET_VERSION = '${PUBLIC_SHELL_VERSION}';`)
    .replace(/var VISUAL_SCALE_VERSION = '[^']*';/, `var VISUAL_SCALE_VERSION = '${PUBLIC_ASSET_VERSION}';`)
    .replace(/site-wide-layout-v1\.css\?v=[^'"\s]+/g, `site-wide-layout-v1.css?v=${WIDE_LAYOUT_VERSION}`)
    .replace(/site-typography-v1\.css\?v=[^'"\s]+/g, `site-typography-v1.css?v=${TYPE_SYSTEM_VERSION}`)
    .replace(/var ACCESS_PASSWORD = '[^']*';\n/, '')
    .replace(/var CONTROLLED_ROUTE_PATHS = \[[^\]]*\];/, 'var CONTROLLED_ROUTE_PATHS = [];')
    .replace(
      /\n      if \(CONTROLLED_ROUTE_PATHS\.indexOf\(route\[1\]\) !== -1\) \{[\s\S]*?\n      \}/,
      ''
    )
    .replace(
      /  function controlledPageConfig\(path\) \{[\s\S]*?\n  \}\n\n  function protectControlledPage/,
      "  function controlledPageConfig() { return null; }\n\n  function protectControlledPage"
    );

  if (!page.includes('function addWideLayoutStylesheet()')) {
    page = page.replace(
      '  function addGlobalHeaderStyles() {',
      `  function addWideLayoutStylesheet() {\n    var current = document.getElementById('qilyWideLayoutStylesheet');\n    if (current) {\n      current.href = '/site-wide-layout-v1.css?v=${WIDE_LAYOUT_VERSION}';\n      return;\n    }\n    var link = document.createElement('link');\n    link.id = 'qilyWideLayoutStylesheet';\n    link.rel = 'stylesheet';\n    link.href = '/site-wide-layout-v1.css?v=${WIDE_LAYOUT_VERSION}';\n    document.head.appendChild(link);\n  }\n\n  function addGlobalHeaderStyles() {`
    );
  }

  if (!page.includes('function addTypographyStylesheet()')) {
    page = page.replace(
      '  function addGlobalHeaderStyles() {',
      `  function addTypographyStylesheet() {\n    var current = document.getElementById('qilyTypographyStylesheet');\n    if (current) {\n      current.href = '/site-typography-v1.css?v=${TYPE_SYSTEM_VERSION}';\n      return;\n    }\n    var link = document.createElement('link');\n    link.id = 'qilyTypographyStylesheet';\n    link.rel = 'stylesheet';\n    link.href = '/site-typography-v1.css?v=${TYPE_SYSTEM_VERSION}';\n    document.head.appendChild(link);\n  }\n\n  function addGlobalHeaderStyles() {`
    );
  }

  page = page.replace(
    /(\n\s*addVisualScaleStylesheet\(\);)(?!\n\s*addWideLayoutStylesheet\(\);)/,
    '$1\n    addWideLayoutStylesheet();'
  );

  page = page.replace(
    /(\n\s*addGlobalHeaderStyles\(\);)(?!\n\s*addTypographyStylesheet\(\);)/,
    '$1\n    addTypographyStylesheet();'
  );

  page = page
    .split('\n')
    .filter((line) => !line.includes('data-controlled-access="true"'))
    .join('\n');

  if (!/var CONTROLLED_ROUTE_PATHS = \[\];/.test(page)) {
    throw new Error('Failed to disable controlled navigation routes');
  }
  if (!/function controlledPageConfig\(\) \{ return null; \}/.test(page)) {
    throw new Error('Failed to disable controlled page gate');
  }
  if (/content:["']🔒["']|data-controlled-access|加密访问/.test(page)) {
    throw new Error('Legacy navigation lock styling or labels remain');
  }
  if (!page.includes(`var VISUAL_SCALE_VERSION = '${PUBLIC_ASSET_VERSION}';`)) {
    throw new Error('Public visual stylesheet cache version was not refreshed');
  }
  if (!page.includes(`site-wide-layout-v1.css?v=${WIDE_LAYOUT_VERSION}`) || !page.includes('addWideLayoutStylesheet();')) {
    throw new Error('Site-wide aligned layout loader was not installed');
  }
  if (!page.includes(`site-typography-v1.css?v=${TYPE_SYSTEM_VERSION}`) || !page.includes('addTypographyStylesheet();')) {
    throw new Error('Site-wide typography loader was not installed');
  }

  write(navigationFile, page);
}

function removeLegacyLockStyles() {
  let css = read(visualScaleFile);
  css = css.replace(
    /\/\* ---------- 加密导航模块：与公开模块明显区分 ---------- \*\/[\s\S]*?(?=\/\* ---------- 全站统一宽版内容窗口 ---------- \*\/)/,
    '/* ---------- 全站公开导航：不显示加密锁标识 ---------- */\n'
  );

  if (/content\s*:\s*["']🔒["']|加密导航模块/.test(css)) {
    throw new Error('Legacy lock icon rules remain in visual scale stylesheet');
  }

  write(visualScaleFile, css);
}

function validateWideLayout() {
  const css = read(wideLayoutFile);
  if (!css.includes('--qily-wide-content:1560px')) {
    throw new Error('Wide content width is not configured at 1560px');
  }
  if (!css.includes('.module-hero>.module-inner') || !css.includes('.module-section>.module-inner')) {
    throw new Error('Hero and content alignment selectors are incomplete');
  }
  if (!css.includes('body.module-page .content-inner') || !css.includes('.capability-certificate')) {
    throw new Error('Extended vertical alignment selectors are incomplete');
  }
}

function validateTypography() {
  const css = read(typographyFile);
  const required = [
    '--qily-type-nav-1:17px',
    '--qily-type-nav-2:16px',
    '--qily-type-nav-3:15px',
    '--qily-type-h1:',
    '--qily-type-h2:',
    '--qily-type-body:18.5px',
    '.qily-site-header.qily-global-header>.qily-global-nav a',
    '.module-subnav>a',
    '.module-card h3'
  ];
  for (const marker of required) {
    if (!css.includes(marker)) throw new Error(`Typography marker missing: ${marker}`);
  }
}

function validateMusicContinuity() {
  const script = read(musicFile);
  const required = [
    'var restoreSettled = false',
    'if (!restoreSettled) return',
    'function settlePlaybackRestore()',
    "localStorage.setItem(STATE_KEY, payload)"
  ];
  for (const marker of required) {
    if (!script.includes(marker)) throw new Error(`Music continuity marker missing: ${marker}`);
  }
}

function validateCertificatePresentation() {
  const capabilities = read(capabilitiesFile);
  const certificate = read(certificateFile);
  if (!capabilities.includes('grid-template-columns:minmax(220px,300px) minmax(0,1fr)')) {
    throw new Error('ChatGPT certificate thumbnail layout is missing');
  }
  if (!capabilities.includes('href="/certificates/chatgpt-lean/"')) {
    throw new Error('ChatGPT certificate detail link is missing');
  }
  if (!certificate.includes('<h1>ChatGPT应用与精益生产实践证书</h1>')) {
    throw new Error('Independent certificate page is incomplete');
  }
  if (!certificate.includes('/qilylean/chatgpt-lean-certificate.png')) {
    throw new Error('Certificate original image link is missing');
  }
}

function publishExperience() {
  let page = read(experienceFile);

  page = page
    .replace(/<title>[\s\S]*?<\/title>/, '<title>履历主线｜丁启利制造工程、精益改善与数智化工厂实践｜QilyLean</title>')
    .replace(/<meta name="description"[^>]*>/, '<meta name="description" content="丁启利制造工程、工程管理、精益改善、新工厂规划与数智化工厂推进履历主线，公开展示职责、项目方法、关键成果与高清履历附件。">')
    .replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="index,follow,max-image-preview:large">')
    .replace('<h1>履历主线（加密）</h1>', '<h1>履历主线</h1>')
    .replace(
      /<p class="module-lead">[\s\S]*?<\/p>/,
      '<p class="module-lead">公开展示制造工程、工程管理、精益咨询、新工厂规划与数智化推进经历，包含职责范围、项目方法、关键成果、能力递进与高清履历附件。</p>'
    )
    .replace(
      /<section class="module-section alt" id="experience">[\s\S]*?<\/section>/,
      '<section class="module-section alt" id="experience"><div class="module-inner"><div class="experience-message" id="experienceMessage" aria-live="polite">正在加载完整履历主线……</div></div></section>'
    )
    .replace(
      /  <footer class="module-footer">[\s\S]*?<\/footer>/,
      '  <footer class="module-footer"><div class="module-inner"><span>丁启利｜履历主线</span><span>制造工程 · 精益改善 · 新工厂规划 · 数智化推进</span></div></footer>'
    )
    .replace(
      /  <script>\s*\(function \(\) \{[\s\S]*?<\/script>\s*<script src="\/site-navigation\.js\?v=[^"]+"><\/script>/,
      `  <script>\n    (function () {\n      'use strict';\n      var message = document.getElementById('experienceMessage');\n      try { sessionStorage.setItem('experienceUnlocked', '1'); } catch (error) {}\n      var contentScript = document.createElement('script');\n      contentScript.id = 'experienceResumeContentScript';\n      contentScript.src = '/qilylean/career-resume-full.js?v=${PUBLIC_RESUME_VERSION}';\n      contentScript.onload = function () {\n        var section = document.getElementById('experience');\n        if (section && section.dataset.fullResume === '1') {\n          var innerHeading = section.querySelector('.head h2');\n          if (innerHeading) innerHeading.textContent = '履历主线';\n          if (message) message.textContent = '';\n        } else if (message) {\n          message.textContent = '履历内容尚未完成渲染，请刷新页面重试。';\n        }\n        var documentScript = document.createElement('script');\n        documentScript.id = 'experienceResumeDocumentScript';\n        documentScript.src = '/qilylean/career-resume-document.js?v=${PUBLIC_RESUME_VERSION}';\n        documentScript.onload = function () {\n          var note = document.querySelector('.career-document-note');\n          if (note) note.textContent = '公开访问说明：履历主线及高清原版PDF均可直接在线预览或下载，无需输入访问密码。';\n        };\n        documentScript.onerror = function () { if (message) message.textContent = '高清履历附件暂未加载成功，请刷新重试。'; };\n        document.body.appendChild(documentScript);\n      };\n      contentScript.onerror = function () { if (message) message.textContent = '履历内容暂未加载成功，请刷新重试。'; };\n      document.body.appendChild(contentScript);\n    })();\n  </script>\n  <script src="/site-navigation.js?v=${PUBLIC_NAV_VERSION}"></script>`
    );

  if (/访问履历主线|experiencePassword|密码不正确|履历主线（加密）/.test(page)) {
    throw new Error('Legacy experience password gate remains');
  }
  if (!page.includes("sessionStorage.setItem('experienceUnlocked', '1')")) {
    throw new Error('Public resume compatibility state was not installed');
  }
  if (!page.includes(`career-resume-full.js?v=${PUBLIC_RESUME_VERSION}`)) {
    throw new Error('Public resume loader was not installed');
  }
  if (!page.includes("innerHeading.textContent = '履历主线'")) {
    throw new Error('Legacy encrypted heading cleanup was not installed');
  }

  write(experienceFile, page);
}

function walk(directory, callback) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full, callback);
    else callback(full);
  }
}

function refreshPublicReferences() {
  let changed = 0;
  walk(root, (file) => {
    if (!file.endsWith('.html')) return;
    const before = read(file);
    const after = before
      .replace(/site-navigation\.js\?v=[^"']+/g, `site-navigation.js?v=${PUBLIC_NAV_VERSION}`)
      .replace(/homepage-music\.js\?v=[^"']+/g, `homepage-music.js?v=${MUSIC_VERSION}`);
    if (after !== before) {
      write(file, after);
      changed += 1;
    }
  });
  return changed;
}

function main() {
  validateWideLayout();
  validateTypography();
  validateMusicContinuity();
  validateCertificatePresentation();
  unlockNavigation();
  removeLegacyLockStyles();
  publishExperience();
  const refreshed = refreshPublicReferences();
  process.stdout.write(`Public access retained; typography hierarchy, 1560px fluid copy and continuous music state published; updated ${refreshed} HTML files.\n`);
}

main();
