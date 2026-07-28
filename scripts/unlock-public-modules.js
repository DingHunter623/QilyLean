#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const navigationFile = path.join(root, 'site-navigation.js');
const visualScaleFile = path.join(root, 'site-visual-scale-v1.css');
const experienceFile = path.join(root, 'experience', 'index.html');
const PUBLIC_NAV_VERSION = '20260728-public-access-v2';
const PUBLIC_ASSET_VERSION = '20260728-public-access-v2';

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.writeFileSync(file, content, 'utf8');
}

function unlockNavigation() {
  let page = read(navigationFile);

  page = page
    .replace(/window\.__qilyLeanSiteNavigation(?:V\d+|PublicV\d+)/g, 'window.__qilyLeanSiteNavigationPublicV2')
    .replace(/var SHARED_ASSET_VERSION = '[^']*';/, `var SHARED_ASSET_VERSION = '${PUBLIC_ASSET_VERSION}';`)
    .replace(/var VISUAL_SCALE_VERSION = '[^']*';/, `var VISUAL_SCALE_VERSION = '${PUBLIC_ASSET_VERSION}';`)
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
      `  <script>\n    (function () {\n      'use strict';\n      var message = document.getElementById('experienceMessage');\n      var contentScript = document.createElement('script');\n      contentScript.id = 'experienceResumeContentScript';\n      contentScript.src = '/qilylean/career-resume-full.js?v=20260728-public-access-v1';\n      contentScript.onload = function () {\n        if (message) message.textContent = '';\n        var documentScript = document.createElement('script');\n        documentScript.id = 'experienceResumeDocumentScript';\n        documentScript.src = '/qilylean/career-resume-document.js?v=20260728-public-access-v1';\n        documentScript.onerror = function () { if (message) message.textContent = '高清履历附件暂未加载成功，请刷新重试。'; };\n        document.body.appendChild(documentScript);\n      };\n      contentScript.onerror = function () { if (message) message.textContent = '履历内容暂未加载成功，请刷新重试。'; };\n      document.body.appendChild(contentScript);\n    })();\n  </script>\n  <script src="/site-navigation.js?v=${PUBLIC_NAV_VERSION}"></script>`
    );

  if (/访问履历主线|experiencePassword|密码不正确|履历主线（加密）/.test(page)) {
    throw new Error('Legacy experience password gate remains');
  }
  if (!/career-resume-full\.js\?v=20260728-public-access-v1/.test(page)) {
    throw new Error('Public resume loader was not installed');
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

function refreshNavigationReferences() {
  let changed = 0;
  walk(root, (file) => {
    if (!file.endsWith('.html')) return;
    const before = read(file);
    const after = before.replace(/site-navigation\.js\?v=[^"']+/g, `site-navigation.js?v=${PUBLIC_NAV_VERSION}`);
    if (after !== before) {
      write(file, after);
      changed += 1;
    }
  });
  return changed;
}

function main() {
  unlockNavigation();
  removeLegacyLockStyles();
  publishExperience();
  const refreshed = refreshNavigationReferences();
  process.stdout.write(`Public access enabled; legacy lock icons removed; public assets cache-refreshed; updated ${refreshed} HTML files.\n`);
}

main();