#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const navigationScript = '/site-navigation.js?v=20260810-native-navigation-stable-v18';
const linkStylesheet = '/site-link-standard-v2.css?v=20260803-nav-four-border-v6';
const navigationBorderStylesheet = '/site-navigation-four-border-v3.css?v=20260803-four-border-v3';
const darkStylesheet = '/site-dark-surface-contrast-v1.css?v=20260801-dark-surface-v2';
const portraitBadgeStylesheet = '/home-portrait-badge-fix-v1.css?v=20260803-badge-wrap-v2';
const visualClosureV1Stylesheet = '/site-visual-closure-v1.css?v=20260804-sitewide-clarity-v2';
const visualClosureV1Script = '/site-visual-closure-v1.js?v=20260810-stable-layout-v5';
const boundaryLinksStylesheet = '/site-visual-closure-v2.css?v=20260803-boundary-links-v2';
const boundaryLinksScript = '/site-visual-closure-v2.js?v=20260803-boundary-links-v2';

const navigationTag = `  <script defer src="${navigationScript}"></script>`;
const linkTag = `  <link id="qilyGlobalLinkStandardStylesheet" rel="stylesheet" href="${linkStylesheet}">`;
const navigationBorderTag = `  <link id="qilyNavigationFourBorderStylesheet" rel="stylesheet" href="${navigationBorderStylesheet}">`;
const darkTag = `  <link id="qilyDarkSurfaceContrastStylesheet" rel="stylesheet" href="${darkStylesheet}">`;
const portraitBadgeTag = `  <link id="qilyHomePortraitBadgeFixStylesheet" rel="stylesheet" href="${portraitBadgeStylesheet}">`;
const visualClosureV1StyleTag = `  <link id="qilyVisualClosureStylesheet" rel="stylesheet" href="${visualClosureV1Stylesheet}">`;
const visualClosureV1ScriptTag = `  <script defer data-qily-visual-closure-loader="v1" src="${visualClosureV1Script}"></script>`;
const boundaryLinksStyleTag = `  <link id="qilyBoundaryLinksClosureStylesheet" rel="stylesheet" href="${boundaryLinksStylesheet}">`;
const boundaryLinksScriptTag = `  <script defer data-qily-boundary-links-loader="v2" src="${boundaryLinksScript}"></script>`;

const cooperationBoundaryHtml = `<section class="module-section" id="boundary"><div class="module-inner"><div class="module-heading"><h2>三类项目合作边界</h2><p>新工厂／新产线规划、精益改善与目视化项目的输入条件、专业责任和验收口径不同，须分别判断，不以一套边界概括全部业务。</p></div><div class="boundary boundary-service-grid" data-qily-boundary-version="v2">
<article class="boundary-service-card qily-static-card"><span class="boundary-type">01｜新工厂／新产线规划</span><h3>规划输入与专业边界</h3><div class="boundary-split"><div><strong>适合启动</strong><ul><li>产品组合、工艺路线、产能需求及分期目标已有初步依据。</li><li>可提供场地／厂房约束、设备、公辅、物流、仓储、品质、安全和扩展输入。</li><li>决策团队能够评审规划假设，并书面确认输入变化与阶段结论。</li></ul></div><div class="boundary-hold"><strong>暂缓启动</strong><ul><li>只要求漂亮Layout或渲染图，却不提供产品、工艺和产能输入。</li><li>场地、预算、建设阶段尚未明确，却要求直接给出最终面积与投资结论。</li><li>要求规划咨询替代建筑、消防、环保、安全、结构或机电等法定设计与审批。</li></ul></div></div><p class="boundary-note"><strong>专业边界：</strong>交付设计输入、产能模型、功能分区、Layout、物流与实施路线；不替代具备相应资质单位出具的施工图、专项设计及法定审查。</p></article>
<article class="boundary-service-card qily-static-card"><span class="boundary-type">02｜精益改善项目</span><h3>基线、试点与收益边界</h3><div class="boundary-split"><div><strong>适合启动</strong><ul><li>存在明确的效率、质量、交付、成本、换型、设备或数据治理问题。</li><li>允许基于真实现场和数据建立基线，并配置内部项目负责人。</li><li>具备Pilot试点资源，管理层可参与阶段评审与验收。</li></ul></div><div class="boundary-hold"><strong>暂缓启动</strong><ul><li>只希望免费取得完整方案、测算模型或可直接复制的项目文件。</li><li>无数据权限、无内部负责人，也不具备试点与复核条件。</li><li>尚未建立事实基线，却要求预先承诺绝对收益或固定改善比例。</li></ul></div></div><p class="boundary-note"><strong>专业边界：</strong>改善结果须通过基线、Pilot、过程记录和验收数据验证；历史案例不构成新项目的必然收益承诺。</p></article>
<article class="boundary-service-card qily-static-card"><span class="boundary-type">03｜目视化项目</span><h3>标准、内容与实施边界</h3><div class="boundary-split"><div><strong>适合启动</strong><ul><li>区域、状态、责任、标准、异常和管理节奏已有明确需求。</li><li>支持现场勘查、内容校对、样板确认、制作施工协同与效果验收。</li><li>企业内部能够指定内容责任人，并持续维护数据与执行标准。</li></ul></div><div class="boundary-hold"><strong>暂缓启动</strong><ul><li>仅追求装饰效果，却没有管理标准、责任机制和实际应用场景。</li><li>内容未经责任部门确认，就要求直接制作或大批量安装。</li><li>希望仅靠看板、标识和颜色替代现场管理、稽核与问题闭环。</li></ul></div></div><p class="boundary-note"><strong>专业边界：</strong>交付现场诊断、视觉标准、图纸尺寸、材料清单、样板和实施协同；目视化工具不替代企业日常管理责任。</p></article>
</div></div></section>`;

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, value) {
  const normalized = value.endsWith('\n') ? value : `${value}\n`;
  if (fs.existsSync(file) && read(file) === normalized) return false;
  fs.writeFileSync(file, normalized, 'utf8');
  return true;
}

function walk(directory, callback) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.cache'].includes(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full, callback);
    else callback(full);
  }
}

function installHtmlAssets(page, file) {
  if (!/<\/head>/i.test(page)) return page;

  const next = page
    .replace(/\s*<script\b[^>]*src=["'][^"']*\/site-navigation\.js\?v=[^"']+["'][^>]*><\/script>\s*/gi, '\n')
    .replace(/\s*<script\b[^>]*(?:data-qily-visual-closure-loader|data-qily-boundary-links-loader|src=["'][^"']*\/site-visual-closure-v[12]\.js\?v=[^"']+["'])[^>]*>\s*<\/script>\s*/gi, '\n')
    .replace(/\s*<link\b[^>]*id=["'](?:qilyGlobalLinkStandardStylesheet|qilyNavigationFourBorderStylesheet|qilyDarkSurfaceContrastStylesheet|qilyHomePortraitBadgeFixStylesheet|qilyVisualClosureStylesheet|qilyBoundaryLinksClosureStylesheet)["'][^>]*>\s*/gi, '\n')
    .replace(/\s*<link\b[^>]*href=["'][^"']*\/(?:site-link-standard-v(?:1|2)|site-navigation-four-border-v3|site-dark-surface-contrast-v1|home-portrait-badge-fix-v1|site-visual-closure-v[12])\.css\?v=[^"']+["'][^>]*>\s*/gi, '\n');

  const assets = [
    linkTag,
    navigationBorderTag,
    darkTag,
    visualClosureV1StyleTag,
    boundaryLinksStyleTag,
    visualClosureV1ScriptTag,
    boundaryLinksScriptTag,
    navigationTag
  ];
  if (path.relative(root, file) === 'index.html') assets.splice(3, 0, portraitBadgeTag);
  return next.replace(/<\/head>/i, `${assets.join('\n')}\n</head>`);
}

function patchEvidencePage() {
  const file = path.join(root, 'projects', 'lean-improvement-evidence', 'index.html');
  if (!fs.existsSync(file)) return false;
  let page = read(file);
  page = page
    .replace('<title>制造改善项目佐证｜2022年精益课题评审与激励｜QilyLean</title>', '<title>某制造企业｜2022年度制造改善项目佐证资料｜QilyLean</title>')
    .replace('<meta property="og:type" content="article"><meta property="og:title" content="制造改善项目佐证｜QilyLean">', '<meta property="og:type" content="article"><meta property="og:title" content="某制造企业｜2022年度制造改善项目佐证资料｜QilyLean">')
    .replace('<h1>制造改善项目佐证</h1>', '<h1>某制造企业｜2022年度制造改善项目佐证资料</h1>')
    .replace('以企业内部形成的课题评审、效益核算、风险评价、会议记录及奖励兑现资料，补充验证制造改善项目从组织推进到成果闭环的真实路径。', '以某制造企业2022年度形成的精益课题评审、效益核算、风险评价、会议记录及6S激励兑现资料，补充验证制造改善项目从组织推进到成果闭环的真实路径。')
    .replace('这些资料不是个人重新编制的项目总结，而是由企业内部形成并用于课题评审、财务贡献核算、风险确认、6S稽核改善及奖励发放的原始业务文件公开脱敏版。', '这些资料不是个人重新编制的项目总结，而是某制造企业在2022年度内部形成并用于课题评审、财务贡献核算、风险确认、6S稽核改善及奖励发放的原始业务文件公开脱敏版。')
    .replace('<small>6S评比与改善激励｜3页</small>', '<small>某制造企业｜2022年度6S评比与改善激励｜3页</small>')
    .replace('<span>QilyLean｜制造改善项目佐证</span>', '<span>QilyLean｜某制造企业2022年度制造改善项目佐证</span>')
    .replace(/<body class="module-page"(?: data-evidence-revision="[^"]*")?>/, '<body class="module-page" data-evidence-revision="20260803-context-v3">');
  return write(file, page);
}

function patchCooperationBoundary() {
  const file = path.join(root, 'cooperation', 'index.html');
  if (!fs.existsSync(file)) throw new Error('cooperation/index.html missing');
  const page = read(file);
  const expression = /<section class="module-section" id="boundary">[\s\S]*?<\/section>/i;
  if (!expression.test(page)) throw new Error('Cooperation boundary section missing');
  return write(file, page.replace(expression, cooperationBoundaryHtml));
}

function patchSearchIndex() {
  const file = path.join(root, 'qilylean', 'site-search-index.json');
  if (!fs.existsSync(file)) return false;
  const data = JSON.parse(read(file));
  if (!Array.isArray(data.entries)) return false;
  const entry = data.entries.find((item) => item && item.url === '/cooperation/');
  if (!entry) return false;
  const marker = '三类项目合作边界：新工厂／新产线规划强调产品、工艺、产能、场地、公辅、物流输入及法定设计审批边界；精益改善强调事实基线、Pilot试点和数据验收；目视化项目强调管理标准、内容确认、样板实施与日常管理责任。';
  if (!String(entry.text || '').includes('三类项目合作边界')) entry.text = `${String(entry.text || '').trim()} ${marker}`.trim();
  return write(file, JSON.stringify(data, null, 2));
}

function main() {
  let checked = 0;
  let changed = 0;

  walk(root, (file) => {
    if (!file.endsWith('.html')) return;
    checked += 1;
    const before = read(file);
    const after = installHtmlAssets(before, file);
    if (after !== before) {
      write(file, after);
      changed += 1;
    }
  });

  const evidenceChanged = patchEvidencePage();
  const boundaryChanged = patchCooperationBoundary();
  const searchChanged = patchSearchIndex();
  process.stdout.write(
    `Published current navigation, sitewide clarity, V2 visual closure, service-specific cooperation boundaries and evidence context to ${checked} HTML files; refreshed ${changed}; evidence=${evidenceChanged}; boundary=${boundaryChanged}; search=${searchChanged}.\n`
  );
}

main();
