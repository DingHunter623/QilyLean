#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
function read(relative) { return fs.readFileSync(path.join(root, relative), 'utf8'); }
function requireText(source, token, label) { if (!source.includes(token)) throw new Error(`${label}: missing ${token}`); }
function forbidText(source, token, label) { if (source.includes(token)) throw new Error(`${label}: forbidden stale pattern ${token}`); }

const language = read('site-global-language-v3.js');
requireText(language, '__qilyGoogleTranslateOnDemandV1', 'Google Translate on-demand runtime');
requireText(language, "defaultDisplayLanguage: SOURCE_LANGUAGE", 'Chinese default display contract');
requireText(language, "automaticTranslation: false", 'No automatic translation contract');
requireText(language, "setAttribute('data-qily-language', SOURCE_LANGUAGE)", 'Chinese source language state');
requireText(language, "translate.google.com/translate?sl=auto&tl=", 'Google website translation route');
requireText(language, "wrapper.className = 'qily-google-translate'", 'Visually distinct Google utility');
requireText(language, "brand.textContent = 'Google 翻译'", 'Explicit Google Translate label');
requireText(language, "badge.textContent = '按需'", 'On-demand visual badge');
requireText(language, "w.location.assign(googleWebsiteTranslationUrl(target))", 'User-initiated translation navigation');
requireText(language, "localStorage.removeItem('qily_global_language_v3')", 'Retired auto-language state cleanup');
forbidText(language, 'qilylean-ai.dinghunter623.workers.dev/translate', 'Retired AI translation endpoint');
forbidText(language, 'CHAT_API', 'Retired AI chat translation fallback');
forbidText(language, 'MutationObserver(function () {\n      if (queued) return;\n      queued = true;\n      w.requestAnimationFrame(function () { queued = false; ensureControl(); });', '');

const navigation = read('site-navigation.js');
requireText(navigation, 'function isChineseSourceMode()', 'Navigation language gate');
requireText(navigation, "sourceMode && (link.textContent || '').trim() !== '精益生产'", 'Lean navigation language gate');
requireText(navigation, "sourceMode && (link.textContent || '').trim() !== '资源协同'", 'Resource navigation language gate');
requireText(navigation, "mode: 'atomic-first-paint-v38'", 'Protected V38 navigation baseline');

const consistency = read('site-ui-consistency-v1.js');
requireText(consistency, 'function sourceMode()', 'Shared shell source-language gate');
requireText(consistency, 'if(sourceMode())', 'Shared shell Dock source-language gate');
requireText(consistency, '20260825-google-translate-on-demand-v1', 'Shared shell on-demand cache key');
requireText(consistency, '__qilyGoogleTranslateOnDemandV1', 'Shared shell on-demand runtime guard');

const dock = read('site-dock-share-runtime-v1.js');
requireText(dock, 'function sourceMode()', 'Dock order language gate');
requireText(dock, 'if (enforceChinese)', 'Dock order language gate');

const cooperationDock = read('site-core-service-dock-closure-v1.js');
requireText(cooperationDock, 'function sourceMode()', 'Cooperation Dock language gate');
requireText(cooperationDock, 'if(enforceChinese)', 'Cooperation Dock language gate');

const parentNav = read('site-parent-navigation-v3.js');
requireText(parentNav, 'function sourceMode()', 'Parent navigation language gate');
requireText(parentNav, 'if(sourceMode())', 'Parent navigation language gate');

const materializer = read('scripts/materialize-global-language-v3.js');
[
  '20260825-google-translate-on-demand-v1',
  'data-qily-google-translate-direct="on-demand-v1"',
  'data-qily-global-language-direct|data-qily-google-translate-direct',
  '20260825-language-runtime-compat-v41',
  '20260825-language-runtime-compat-v42',
  '20260825-language-runtime-compat-v31',
  '20260825-language-runtime-compat-v101'
].forEach((token) => requireText(materializer, token, 'Sitewide materializer'));

const css = read('site-global-language-v1.css');
requireText(css, '.qily-google-translate{', 'Google utility styling');
requireText(css, 'border:2px solid #4285f4', 'Google utility visual distinction');
requireText(css, '#qilyGlobalLanguageV1,.qily-language-switcher{display:none!important}', 'Retired control suppression');
forbidText(css, 'qily-language-spin', 'Retired automatic translation spinner');

process.stdout.write('Chinese-default Google Translate on-demand runtime validation passed.\n');
