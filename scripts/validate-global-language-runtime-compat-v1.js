#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
function read(relative) { return fs.readFileSync(path.join(root, relative), 'utf8'); }
function requireText(source, token, label) { if (!source.includes(token)) throw new Error(`${label}: missing ${token}`); }
function forbidText(source, token, label) { if (source.includes(token)) throw new Error(`${label}: forbidden stale pattern ${token}`); }

const language = read('site-global-language-v3.js');
requireText(language, '__qilyGlobalLanguageV31', 'Global Language runtime');
requireText(language, "RUNTIME_VERSION = 'v3.1'", 'Global Language runtime');
requireText(language, "mutation.type==='characterData'", 'Global Language mutation repair');
requireText(language, 'changed.push(parent)', 'Global Language mutation repair');
requireText(language, 'node.nodeValue!==next', 'Global Language idempotent text apply');
requireText(language, 'element.getAttribute(attribute)!==translated', 'Global Language idempotent attribute apply');
requireText(language, 'qily:language-change', 'Global Language change event');
forbidText(language, "mutation.type==='characterData'&&mutation.target&&!TEXT_ORIGINAL.has", 'Global Language mutation repair');

const navigation = read('site-navigation.js');
requireText(navigation, 'function isChineseSourceMode()', 'Navigation language gate');
requireText(navigation, "sourceMode && (link.textContent || '').trim() !== '精益生产'", 'Lean navigation language gate');
requireText(navigation, "sourceMode && (link.textContent || '').trim() !== '资源协同'", 'Resource navigation language gate');
requireText(navigation, "mode: 'atomic-first-paint-v38'", 'Protected V38 navigation baseline');
requireText(navigation, 'qily:language-change', 'Navigation language change reconciliation');

const consistency = read('site-ui-consistency-v1.js');
requireText(consistency, 'function sourceMode()', 'Shared shell language gate');
requireText(consistency, 'if(sourceMode())', 'Shared shell Dock language gate');
requireText(consistency, '20260825-global-language-v31', 'Shared shell V3.1 cache key');

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
['20260825-global-language-v31','20260825-language-runtime-compat-v41','20260825-language-runtime-compat-v42','20260825-language-runtime-compat-v31','20260825-language-runtime-compat-v101'].forEach((token) => requireText(materializer, token, 'Sitewide materializer'));

process.stdout.write('Global Language V3.1 runtime compatibility validation passed.\n');
