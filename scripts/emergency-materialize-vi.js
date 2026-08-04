#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const NAV_VERSION = '20260804-sitewide-clarity-v2';
const SHELL_VERSION = '20260729-no-old-flash-v1';
const VISUAL_VERSION = '20260803-home-badge-wrap-v5';
const WIDE_VERSION = '20260729-fluid-copy-v5';
const TYPE_VERSION = '20260729-hierarchy-v4';
const VI_VERSION = '20260801-vi-standard-v1';
const CONTRAST_VERSION = '20260803-vi-contrast-hotfix-v1';
const CLOSURE_V1_VERSION = '20260804-sitewide-clarity-v2';
const CLOSURE_V2_VERSION = '20260803-boundary-links-v2';
const MUSIC_VERSION = '20260729-continuous-v4';

const COOPERATION_BOUNDARY_HTML = `<section class="module-section" id="boundary"><div class="module-inner"><div class="module-heading"><h2>三类项目合作边界</h2><p>新工厂／新产线规划、精益改善与目视化项目的输入条件、专业责任和验收口径不同，须分别判断，不以一套边界概括全部业务。</p></div><div class="boundary boundary-service-grid" data-qily-boundary-version="v2">
<article class="boundary-service-card qily-static-card"><span class="boundary-type">01｜新工厂／新产线规划</span><h3>规划输入与专业边界</h3><div class="boundary-split"><div><strong>适合启动</strong><ul><li>产品组合、工艺路线、产能需求及分期目标已有初步依据。</li><li>可提供场地／厂房约束、设备、公辅、物流、仓储、品质、安全和扩展输入。</li><li>决策团队能够评审规划假设，并书面确认输入变化与阶段结论。</li></ul></div><div class="boundary-hold"><strong>暂缓启动</strong><ul><li>只要求漂亮Layout或渲染图，却不提供产品、工艺和产能输入。</li><li>场地、预算、建设阶段尚未明确，却要求直接给出最终面积与投资结论。</li><li>要求规划咨询替代建筑、消防、环保、安全、结构或机电等法定设计与审批。</li></ul></div></div><p class="boundary-note"><strong>专业边界：</strong>交付设计输入、产能模型、功能分区、Layout、物流与实施路线；不替代具备相应资质单位出具的施工图、专项设计及法定审查。</p></article>
<article class="boundary-service-card qily-static-card"><span class="boundary-type">02｜精益改善项目</span><h3>基线、试点与收益边界</h3><div class="boundary-split"><div><strong>适合启动</strong><ul><li>存在明确的效率、质量、交付、成本、换型、设备或数据治理问题。</li><li>允许基于真实现场和数据建立基线，并配置内部项目负责人。</li><li>具备Pilot试点资源，管理层可参与阶段评审与验收。</li></ul></div><div class="boundary-hold"><strong>暂缓启动</strong><ul><li>只希望免费取得完整方案、测算模型或可直接复制的项目文件。</li><li>无数据权限、无内部负责人，也不具备试点与复核条件。</li><li>尚未建立事实基线，却要求预先承诺绝对收益或固定改善比例。</li></ul></div></div><p class="boundary-note"><strong>专业边界：</strong>改善结果须通过基线、Pilot、过程记录和验收数据验证；历史案例不构成新项目的必然收益承诺。</p></article>
<article class="boundary-service-card qily-static-card"><span class="boundary-type">03｜目视化项目</span><h3>标准、内容与实施边界</h3><div class="boundary-split"><div><strong>适合启动</strong><ul><li>区域、状态、责任、标准、异常和管理节奏已有明确需求。</li><li>支持现场勘查、内容校对、样板确认、制作施工协同与效果验收。</li><li>企业内部能够指定内容责任人，并持续维护数据与执行标准。</li></ul></div><div class="boundary-hold"><strong>暂缓启动</strong><ul><li>仅追求装饰效果，却没有管理标准、责任机制和实际应用场景。</li><li>内容未经责任部门确认，就要求直接制作或大批量安装。</li><li>希望仅靠看板、标识和颜色替代现场管理、稽核与问题闭环。</li></ul></div></div><p class="boundary-note"><strong>专业边界：</strong>交付现场诊断、视觉标准、图纸尺寸、材料清单、样板和实施协同；目视化工具不替代企业日常管理责任。</p></article>
</div></div></section>`;

function read(file) { return fs.readFileSync(file, 'utf8'); }
function write(file, content) {
  const normalized = content.endsWith('\n') ? content : `${content}\n`;
  if (fs.existsSync(file) && read(file) === normalized) return false;
  fs.writeFileSync(file, normalized, 'utf8');
  return true;
}

function headAssets() {
  return [
    '  <script data-qily-shell-bootstrap>(function(d){var e=d.documentElement;e.classList.add("qily-shell-pending");window.__qilyLeanRevealCurrentShell=function(){e.classList.remove("qily-shell-pending")};setTimeout(window.__qilyLeanRevealCurrentShell,1800)})(document);</script>',
    '  <link rel="stylesheet" href="/site-shell.css?v=' + SHELL_VERSION + '">',
    '  <link id="qilyVisualScaleStylesheet" rel="stylesheet" href="/site-visual-scale-v1.css?v=' + VISUAL_VERSION + '">',
    '  <link id="qilyWideLayoutStylesheet" rel="stylesheet" href="/site-wide-layout-v1.css?v=' + WIDE_VERSION + '">',
    '  <link id="qilyTypographyStylesheet" rel="stylesheet" href="/site-typography-v1.css?v=' + TYPE_VERSION + '">',
    '  <link id="qilyViStandardStylesheet" rel="stylesheet" href="/site-vi-standard-v1.css?v=' + VI_VERSION + '">',
    '  <link id="qilyViContrastRestorationStylesheet" rel="stylesheet" href="/site-vi-contrast-restoration-v1.css?v=' + CONTRAST_VERSION + '">',
    '  <link id="qilyVisualClosureStylesheet" rel="stylesheet" href="/site-visual-closure-v1.css?v=' + CLOSURE_V1_VERSION + '">',
    '  <script defer data-qily-visual-closure-loader="v1" src="/site-visual-closure-v1.js?v=' + CLOSURE_V1_VERSION + '"></script>',
    '  <link id="qilyBoundaryLinksClosureStylesheet" rel="stylesheet" href="/site-visual-closure-v2.css?v=' + CLOSURE_V2_VERSION + '">',
    '  <script defer data-qily-boundary-links-loader="v2" src="/site-visual-closure-v2.js?v=' + CLOSURE_V2_VERSION + '"></script>',
    '  <script defer src="/site-navigation.js?v=' + NAV_VERSION + '"></script>'
  ].join('\n');
}

function cleanAndInject(page) {
  if (!/<\/head>/i.test(page)) return page;
  let next = page
    .replace(/\s*<script\b[^>]*data-qily-shell-bootstrap[^>]*>[\s\S]*?<\/script>\s*/gi, '\n')
    .replace(/\s*<script\b[^>]*src=["'][^"']*\/site-navigation\.js\?v=[^"']+["'][^>]*>\s*<\/script>\s*/gi, '\n')
    .replace(/\s*<script\b[^>]*(?:data-qily-visual-closure-loader|data-qily-boundary-links-loader|src=["'][^"']*\/site-visual-closure-v[12]\.js\?v=[^"']+["'])[^>]*>\s*<\/script>\s*/gi, '\n')
    .replace(/\s*<link\b[^>]*href=["'][^"']*\/(?:site-shell|site-visual-scale-v1|site-wide-layout-v1|site-typography-v1|site-vi-standard-v1|site-vi-contrast-restoration-v1|site-visual-closure-v[12])\.css\?v=[^"']+["'][^>]*>\s*/gi, '\n')
    .replace(/\s*<link\b[^>]*href=["'][^"']*\/site-microsoft-(?:international-v1|enterprise-components-v2)\.css\?v=[^"']+["'][^>]*>\s*/gi, '\n')
    .replace(/\s*<script\b[^>]*src=["'][^"']*\/site-microsoft-international-v1\.js\?v=[^"']+["'][^>]*>\s*<\/script>\s*/gi, '\n');
  next = next.replace(/<\/head>/i, headAssets() + '\n</head>');
  return next.replace(/homepage-music\.js\?v=[^"']+/g, `homepage-music.js?v=${MUSIC_VERSION}`);
}

function patchEvidence(page, relativePath) {
  if (relativePath === 'capabilities/index.html') {
    page = page
      .replace(/<h2>制造改善项目佐证资料<\/h2>/g, '<h2>2022年度某制造企业｜制造改善项目佐证资料</h2>')
      .replace(
        /以企业内部形成的课题评审、效益核算、风险评价，以及年度／月度6S评比、每周稽核整改与奖励兑现资料，补充验证制造改善项目的组织推进与成果闭环。/g,
        '以下资料来自2022年度某制造企业的制造改善项目，包括第三季度课题效益评审、第四季度项目结案评审，以及年度／月度6S评比、每周稽核整改与奖励兑现记录，用于补充验证项目组织推进与成果闭环。'
      );
  }
  if (relativePath === 'projects/index.html') {
    page = page.replace(/<h3>制造改善项目佐证资料<\/h3>/g, '<h3>2022年度某制造企业｜制造改善项目佐证资料</h3>');
  }
  return page;
}

function patchCooperationBoundary(page, relativePath) {
  if (relativePath !== 'cooperation/index.html') return page;
  const pattern = /<section class="module-section" id="boundary">[\s\S]*?<\/section>/i;
  if (!pattern.test(page)) throw new Error('Cooperation boundary section not found.');
  return page.replace(pattern, COOPERATION_BOUNDARY_HTML);
}

function walk(directory, callback) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.cache'].includes(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full, callback);
    else callback(full);
  }
}

let changed = 0;
let scanned = 0;
walk(root, (file) => {
  if (!file.endsWith('.html')) return;
  scanned += 1;
  const relativePath = path.relative(root, file).split(path.sep).join('/');
  const before = read(file);
  const after = patchEvidence(patchCooperationBoundary(cleanAndInject(before), relativePath), relativePath);
  if (after !== before && write(file, after)) changed += 1;
});

const pageChecks = [
  ['capabilities/index.html', '2022年度某制造企业｜制造改善项目佐证资料'],
  ['capabilities/index.html', 'capability-home-screen'],
  ['cooperation/index.html', '三类项目合作边界'],
  ['cooperation/index.html', '新工厂／新产线规划'],
  ['cooperation/index.html', '不替代具备相应资质单位出具的施工图'],
  ['cooperation/index.html', 'contact-card'],
  ['links/index.html', 'companyGrid'],
  ['links/index.html', 'resource-stage'],
  ['projects/qilylean-commercial-deliveries/index.html', '当前公开记录：0项'],
  ['trust/index.html', '查看商业交付档案'],
  ['trust/index.html', '查看客户评价授权规则']
];
for (const [relativePath, marker] of pageChecks) {
  const file = path.join(root, relativePath);
  if (!fs.existsSync(file) || !read(file).includes(marker)) throw new Error(`Required marker missing: ${relativePath} -> ${marker}`);
}

const assetChecks = [
  ['site-visual-closure-v1.css', '.capability-home-screen'],
  ['site-visual-closure-v1.css', '.flow-step'],
  ['site-visual-closure-v2.css', '.boundary-service-grid'],
  ['site-visual-closure-v2.css', '#companyGrid .card'],
  ['site-visual-closure-v1.js', 'qilySitewideClarityStyleV2'],
  ['site-visual-closure-v1.js', 'syncDailyMetadata'],
  ['site-visual-closure-v2.js', 'refineCooperationBoundary'],
  ['site-visual-closure-v2.js', 'enhanceLinkCards'],
  ['site-navigation.js', 'qilyBoundaryLinksClosureStylesheet'],
  ['site-navigation.js', '20260804-sitewide-clarity-v2']
];
for (const [relativePath, marker] of assetChecks) {
  const file = path.join(root, relativePath);
  if (!fs.existsSync(file) || !read(file).includes(marker)) throw new Error(`Closure asset missing: ${relativePath} -> ${marker}`);
}

process.stdout.write(`Boundary, sitewide clarity and link-card closure materialization complete: scanned ${scanned} HTML files, changed ${changed}.\n`);
