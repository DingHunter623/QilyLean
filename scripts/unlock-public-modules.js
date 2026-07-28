#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const navigationFile = path.join(root, 'site-navigation.js');
const experienceFile = path.join(root, 'experience', 'index.html');
const PUBLIC_NAV_VERSION = '20260728-public-access-v1';

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.writeFileSync(file, content, 'utf8');
}

function unlockNavigation() {
  let page = read(navigationFile);

  page = page
    .replace(/window\.__qilyLeanSiteNavigationV\d+/g, 'window.__qilyLeanSiteNavigationPublicV1')
    .replace(/var ACCESS_PASSWORD = '[^']*';\n/, '')
    .replace(/var CONTROLLED_ROUTE_PATHS = \[[^\]]*\];/, 'var CONTROLLED_ROUTE_PATHS = [];')
    .replace(
      /  function controlledPageConfig\(path\) \{[\s\S]*?\n  \}\n\n  function protectControlledPage/,
      "  function controlledPageConfig() { return null; }\n\n  function protectControlledPage"
    );

  if (!/var CONTROLLED_ROUTE_PATHS = \[\];/.test(page)) {
    throw new Error('Failed to disable controlled navigation routes');
  }
  if (!/function controlledPageConfig\(\) \{ return null; \}/.test(page)) {
    throw new Error('Failed to disable controlled page gate');
  }

  write(navigationFile, page);
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
  publishExperience();
  const refreshed = refreshNavigationReferences();
  process.stdout.write(`Public access enabled; refreshed navigation reference in ${refreshed} HTML files.\n`);
}

main();
