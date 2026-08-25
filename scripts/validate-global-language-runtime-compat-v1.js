#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
function read(relative) { return fs.readFileSync(path.join(root, relative), 'utf8'); }
function requireText(source, token, label) { if (!source.includes(token)) throw new Error(`${label}: missing ${token}`); }
function forbidText(source, token, label) { if (source.includes(token)) throw new Error(`${label}: forbidden stale pattern ${token}`); }

const language = read('site-global-language-v3.js');
requireText(language, '__qilyGlobalTranslationDualRouteV2', 'Dual-route translation runtime');
requireText(language, "var SOURCE_LANGUAGE = 'zh-CN'", 'Chinese authoritative source');
requireText(language, 'defaultDisplayLanguage:SOURCE_LANGUAGE', 'Chinese default display contract');
requireText(language, 'automaticTranslation:false', 'No automatic translation contract');
requireText(language, "setDocumentLanguage(SOURCE_LANGUAGE, 'source-default')", 'Chinese source first paint contract');
requireText(language, 'function likelyMainland()', 'Mainland route detection');
requireText(language, "'https://api.qilylean.com'", 'First-party domestic API candidate');
requireText(language, "'https://ai-api.qilylean.com'", 'Second first-party domestic API candidate');
requireText(language, "'https://qilylean-ai.dinghunter623.workers.dev'", 'Worker domestic fallback');
requireText(language, "base + '/translate'", 'Domestic translation endpoint');
requireText(language, "route:'domestic'", 'Domestic route hint');
requireText(language, 'translate.google.com/translate?sl=zh-CN&tl=', 'Google website translation route');
requireText(language, "wrapper.className = 'qily-web-translate'", 'Visually distinct web translation utility');
requireText(language, "brand.textContent = '网页翻译'", 'Unified translation label');
requireText(language, "badge.textContent = '智能路由'", 'Routing visual badge');
requireText(language, 'function restoreChinese()', 'Immediate Chinese restore');
requireText(language, 'activeAbort.abort()', 'In-flight translation cancellation');
requireText(language, "if (likelyMainland()) startDomesticTranslation(targetLanguage)", 'Mainland domestic routing contract');
requireText(language, "w.location.assign(googleWebsiteTranslationUrl(targetLanguage))", 'Overseas Google routing contract');
requireText(language, "w.localStorage.removeItem('qily_global_language_v3')", 'Retired auto-language state cleanup');
forbidText(language, 'qily-language-spin', 'Blocking spinner');
forbidText(language, 'setAttribute(\'disabled\'', 'Translation selector lockout');

const navigation = read('site-navigation.js');
requireText(navigation, 'function isChineseSourceMode()', 'Navigation language gate');
requireText(navigation, "sourceMode && (link.textContent || '').trim() !== '精益生产'", 'Lean navigation language gate');
requireText(navigation, "sourceMode && (link.textContent || '').trim() !== '资源协同'", 'Resource navigation language gate');
requireText(navigation, "mode: 'atomic-first-paint-v38'", 'Protected V38 navigation baseline');
requireText(navigation, 'unifiedHeaderAxis: true', 'Unified header axis contract');
requireText(navigation, 'headerAxisWidth: 1560', 'Header axis width contract');
requireText(navigation, '/site-header-axis-v1.css?v=20260825-header-axis-nav-fit-v1', 'Header axis runtime asset');

const consistency = read('site-ui-consistency-v1.js');
requireText(consistency, 'function sourceMode()', 'Shared shell source-language gate');
requireText(consistency, 'if(sourceMode())', 'Shared shell Dock source-language gate');
requireText(consistency, '20260825-global-translation-dual-route-v2', 'Shared shell dual-route cache key');
requireText(consistency, '__qilyGlobalTranslationDualRouteV2', 'Shared shell dual-route runtime guard');

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
  '20260825-global-translation-dual-route-v2',
  'data-qily-web-translate-direct="dual-route-v2"',
  'data-qily-global-language-direct|data-qily-google-translate-direct|data-qily-web-translate-direct|data-qily-translation-progress-direct',
  '20260825-language-runtime-compat-v42',
  '20260825-language-runtime-compat-v31',
  '20260825-language-runtime-compat-v101',
  '/site-header-axis-v1.css?v=20260825-header-axis-nav-fit-v1',
  '/site-translation-progress-v1.css?v=20260825-bilingual-progress-v1',
  '/site-translation-progress-v1.js?v=20260825-bilingual-progress-v1',
  'data-qily-translation-progress-direct="bilingual-v1"'
].forEach((token) => requireText(materializer, token, 'Sitewide materializer'));

const css = read('site-global-language-v1.css');
requireText(css, '.qily-web-translate{', 'Web translation utility styling');
requireText(css, 'border:2px solid #0f6570', 'Utility visual distinction');
requireText(css, '.qily-web-translate__badge', 'Smart-routing badge styling');
requireText(css, '#qilyGoogleTranslateOnDemandV1,#qilyGlobalLanguageV1,.qily-google-translate,.qily-language-switcher{display:none!important}', 'Retired control suppression');
forbidText(css, 'qily-language-spin', 'Retired automatic translation spinner');

const headerAxis = read('site-header-axis-v1.css');
requireText(headerAxis, '--qily-header-axis:var(--qily-content-axis,1560px)', '1560px header axis');
requireText(headerAxis, 'max-width:var(--qily-header-axis)!important', 'Header max-width governance');
requireText(headerAxis, 'word-break:keep-all!important', 'Primary navigation no-wrap guard');
requireText(headerAxis, '@media (min-width:1181px) and (max-width:1500px)', 'Desktop fit guard');

const progressJs = read('site-translation-progress-v1.js');
requireText(progressJs, "var visibleStates = new Set(['working', 'fallback', 'opening'])", 'Translation progress state gate');
requireText(progressJs, '正在翻译，请稍候', 'Chinese progress copy');
requireText(progressJs, 'Translating — a brief delay may occur.', 'English progress copy');
requireText(progressJs, "pointer-events", '');

const progressCss = read('site-translation-progress-v1.css');
requireText(progressCss, '.qily-translation-progress{', 'Translation progress visual');
requireText(progressCss, 'pointer-events:none', 'Non-blocking translation progress notice');
requireText(progressCss, 'border-left:5px solid #caa15f', 'Progress visual distinction');

process.stdout.write('Chinese-default Global Translation Dual Route V2 + Header Axis + bilingual progress validation passed.\n');
