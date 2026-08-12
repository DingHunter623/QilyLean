#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const files = ['index.html', 'cooperation/index.html', 'qilylean/daily-insights.html'];

for (const relativePath of files) {
  const target = path.join(root, relativePath);
  if (!fs.existsSync(target)) continue;
  const current = fs.readFileSync(target, 'utf8');

  // Site System V3 首页已经是静态权威源。保留它的资产标记，避免旧生成链
  // 将新首页重新降级为 assistant/results/latest 的历史首页结构。
  if (relativePath === 'index.html' && /\bqily-home-v3\b/.test(current)) continue;

  const prepared = current.replace(/\sdata-qily-static-source="[^"]*"/g, '');
  if (prepared !== current) fs.writeFileSync(target, prepared, 'utf8');
}

// Normalize legacy validation aliases before materialization.
const materializer = path.join(root, 'scripts', 'materialize-static-core-pages.js');
if (fs.existsSync(materializer)) {
  const current = fs.readFileSync(materializer, 'utf8');
  let prepared = current
    .replace('data-qily-static-source="home-core-v1"', 'data-qily-static-source="home-core-v2"')
    .replace("'目视化项目设计与实施',", "'目视化项目设计与交付',");

  // V3 首页本身已包含完整静态叙事、证据纪律和六类能力，不再要求已退役的
  // assistant/latest/results 面板。旧页面仍继续走原有 materializer。
  if (!prepared.includes('QILY-HOME-V3-AUTHORITATIVE-STATIC-SOURCE')) {
    prepared = prepared.replace(
      'function materializeHome() {\n  let html = read(HOME);',
      `function materializeHome() {\n  let html = read(HOME);\n  // QILY-HOME-V3-AUTHORITATIVE-STATIC-SOURCE\n  if (/\\bqily-home-v3\\b/.test(html) && html.includes('QILY-HOME-STATIC-COMMERCIAL:START')) {\n    write(HOME, html);\n    return;\n  }`
    );
  }

  // Materializer self-validation must judge a V3 homepage by the V3 contract,
  // rather than by retired V2 panels or markers. Legacy pages retain their checks.
  if (!prepared.includes('QILY-HOME-V3-VALIDATION-CONTRACT')) {
    prepared = prepared.replace(
      /  const requiredHome = \[[\s\S]*?\n  \];\n  requiredHome\.forEach\(\(value\) => \{ if \(!home\.includes\(value\)\) throw new Error\(`Homepage static source missing: \$\{value\}`\); \}\);/m,
      `  // QILY-HOME-V3-VALIDATION-CONTRACT\n  const isV3Home = /\\bqily-home-v3\\b/.test(home);\n  const requiredHome = isV3Home ? [\n    'QILY-HOME-STATIC-COMMERCIAL:START',\n    'data-qily-static-source="home-core-v3"',\n    '把制造现场，变成可计算、可改善、可固化、可复用的组织资产',\n    '六类项目合作能力｜三类核心项目交付 + 三项数智化产品与技术能力',\n    '新工厂／新产线规划',\n    '精益改善项目交付',\n    '目视化项目设计与交付',\n    'qilyInformationArchitectureStylesheet',\n    'QILY-HOME-STATIC-SCHEMA:START'\n  ] : [\n    'QILY-HOME-STATIC-COMMERCIAL:START',\n    'data-qily-static-source="home-core-v2"',\n    '把复杂制造问题，转化为可验证的交付结果',\n    '新工厂／新产线规划',\n    '精益改善项目交付',\n    '目视化项目设计与交付',\n    'qilyInformationArchitectureStylesheet',\n    'qilyStaticCoreInteractions'\n  ];\n  requiredHome.forEach((value) => { if (!home.includes(value)) throw new Error(\`Homepage static source missing: \${value}\`); });`
    );
  }

  if (prepared !== current) fs.writeFileSync(materializer, prepared, 'utf8');
}

// Six-capability enforcer stays authoritative for legacy pages, but V3 homepage
// content hierarchy must not be overwritten by the V2 HOME_BLOCK. It may still
// refresh the canonical six-capability JSON-LD schema.
const enforcer = path.join(root, 'scripts', 'enforce-six-core-static-source.js');
if (fs.existsSync(enforcer)) {
  const current = fs.readFileSync(enforcer, 'utf8');
  let prepared = current;
  if (!prepared.includes('QILY-HOME-V3-PRESERVE-CANONICAL-CONTENT')) {
    prepared = prepared.replace(
      'function patchHome(html){\n',
      `function patchHome(html){\n  // QILY-HOME-V3-PRESERVE-CANONICAL-CONTENT\n  if (/\\bqily-home-v3\\b/.test(html)) {\n    html=replaceMarker(html,'QILY-HOME-STATIC-SCHEMA:START','QILY-HOME-STATIC-SCHEMA:END',homeSchema());\n    return html;\n  }\n`
    );
  }
  if (prepared !== current) fs.writeFileSync(enforcer, prepared, 'utf8');
}

process.stdout.write('Prepared static pages and V3-aware validation aliases for deterministic rematerialization.\n');
