#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const knowledgeAssetPath = path.join(root, 'knowledge', 'knowledge-asset-v2.js');
const loaderPath = path.join(root, 'homepage-music.js');
const terminologyPath = path.join(root, 'knowledge', 'terminology.html');
const dailyDir = path.join(root, 'qilylean', 'daily');

const failures = [];
const notes = [];

function fail(message) { failures.push(message); }
function note(message) { notes.push(message); }
function mustExist(file, label) {
  if (!fs.existsSync(file)) fail(`${label} missing: ${path.relative(root, file)}`);
}
function read(file) { return fs.readFileSync(file, 'utf8'); }
function extractObjectBlock(source, variableName) {
  const marker = `var ${variableName} = {`;
  const start = source.indexOf(marker);
  if (start < 0) return '';
  let i = source.indexOf('{', start);
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(source.indexOf('{', start), i + 1);
    }
  }
  return '';
}
function extractArray(source, variableName) {
  const re = new RegExp(`var\\s+${variableName}\\s*=\\s*\\[([\\s\\S]*?)\\];`);
  const match = source.match(re);
  if (!match) return [];
  return Array.from(match[1].matchAll(/['"]([^'"]+)['"]/g), m => m[1]);
}
function objectKeys(block) {
  return new Set(Array.from(block.matchAll(/(?:^|[,\n]\s*)['"]([^'"]+)['"]\s*:/g), m => m[1]));
}

mustExist(knowledgeAssetPath, 'Knowledge Asset 2.0 runtime');
mustExist(loaderPath, 'Knowledge Asset 2.0 loader');
mustExist(terminologyPath, 'OPL terminology entry');
mustExist(dailyDir, 'Curated daily archive');

if (!failures.length) {
  const asset = read(knowledgeAssetPath);
  const loader = read(loaderPath);
  const terminology = read(terminologyPath);
  const terms = extractArray(asset, 'TERM_ORDER');
  const meta = objectKeys(extractObjectBlock(asset, 'TERM_META'));
  const cases = objectKeys(extractObjectBlock(asset, 'CASES'));

  if (terms.length < 30) fail(`TERM_ORDER coverage too small: ${terms.length}`);
  const missingMeta = terms.filter(term => !meta.has(term));
  const missingCases = terms.filter(term => !cases.has(term));
  if (missingMeta.length) fail(`Terms missing relation metadata: ${missingMeta.join(', ')}`);
  if (missingCases.length) fail(`Tool/term scenarios missing teaching cases: ${missingCases.join(', ')}`);

  // Every relation target named in chain:[...] must resolve to an explicitly governed term.
  const chainTargets = Array.from(extractObjectBlock(asset, 'TERM_META').matchAll(/chain\s*:\s*\[([^\]]*)\]/g))
    .flatMap(m => Array.from(m[1].matchAll(/['"]([^'"]+)['"]/g), x => x[1]));
  const unresolved = [...new Set(chainTargets.filter(term => !terms.includes(term)))];
  if (unresolved.length) fail(`Unresolved related OPL codes: ${unresolved.join(', ')}`);

  // Evidence discipline: generated examples must be explicitly labelled as teaching examples.
  const caseValues = Array.from(extractObjectBlock(asset, 'CASES').matchAll(/['"][^'"]+['"]\s*:\s*['"]([^'"]+)['"]/g), m => m[1]);
  const unlabeled = caseValues.filter(value => !/^教学案例[：:]/.test(value));
  if (unlabeled.length) fail(`${unlabeled.length} case(s) are not explicitly labelled 教学案例`);

  // Core Knowledge Asset 2.0 semantic layers must stay present.
  const semanticSignals = [
    ['案例', 'case'], ['数据', 'data'], ['验证', 'verification'], ['关联', 'relation'],
    ['项目', 'project'], ['业务', 'service'], ['现场', 'gemba/site'], ['指标', 'metric']
  ];
  for (const [needle, label] of semanticSignals) {
    if (!asset.includes(needle)) fail(`Knowledge Asset 2.0 missing ${label} semantic layer (${needle})`);
  }

  // VI governance: require the QilyLean brand palette and responsive treatment in the enhancement layer.
  for (const token of ['#0f4b5a', '#caa15f', '@media']) {
    if (!asset.includes(token)) fail(`Knowledge Asset 2.0 VI token missing: ${token}`);
  }

  if (!loader.includes('/knowledge/knowledge-asset-v2.js')) fail('Shared loader does not load Knowledge Asset 2.0');
  if (!loader.includes('/qilylean\\/daily') && !loader.includes('/qilylean\/daily')) fail('Shared loader does not govern curated daily pages');
  if (!loader.includes('knowledge\\/terminology') && !loader.includes('knowledge\/terminology')) fail('Shared loader does not govern OPL terminology surface');
  if (!terminology.includes('homepage-music.js')) fail('OPL terminology surface does not include the shared enhancement loader');

  const dailyFiles = fs.readdirSync(dailyDir).filter(name => /^\d{4}-\d{2}-\d{2}\.html$/.test(name));
  if (dailyFiles.length < 300) fail(`Curated daily archive unexpectedly small: ${dailyFiles.length}`);
  const missingLoader = [];
  for (const name of dailyFiles) {
    const html = read(path.join(dailyDir, name));
    if (!html.includes('homepage-music.js')) missingLoader.push(name);
  }
  if (missingLoader.length) fail(`${missingLoader.length} curated brief(s) do not load shared Knowledge Asset layer; first: ${missingLoader.slice(0, 8).join(', ')}`);

  note(`governed terms: ${terms.length}`);
  note(`teaching cases: ${cases.size}`);
  note(`curated briefs checked: ${dailyFiles.length}`);
}

if (notes.length) console.log(`[knowledge-v2] ${notes.join(' | ')}`);
if (failures.length) {
  console.error('[knowledge-v2] validation failed:');
  failures.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}
console.log('[knowledge-v2] validation passed');
