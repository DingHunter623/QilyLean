#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function write(relativePath, content) {
  const file = path.join(root, relativePath);
  fs.writeFileSync(file, content.endsWith('\n') ? content : `${content}\n`);
}

function replaceRequired(content, before, after, label) {
  if (content.includes(after)) return content;
  if (!content.includes(before)) throw new Error(`Integrity upgrade target missing: ${label}`);
  return content.replace(before, after);
}

function patchTrustBuilder() {
  const file = 'scripts/build-trust-search-sync.js';
  let content = read(file);

  content = replaceRequired(
    content,
    "    evidenceRule: '已核定值、阶段性估算值、团队成果与个人职责分别标注，不将预测收益表述为已实现收益。',\n    aiRule:",
    "    evidenceRule: '已核定值、阶段性估算值、团队成果与个人职责分别标注，不将预测收益表述为已实现收益。',\n    evidenceLevelRule: '公开成果采用A已核定、B已验证、C阶段估算、D经验陈述四级口径；该分级是QilyLean内部披露规则，不是第三方认证。',\n    publicationRule: '历史简报依据历年制造实践、工作记录与项目经验持续整理；页面日期用于知识档案排序与主题定位，不单独证明网页在该日首次公开发布。',\n    credentialRule: '除非页面明确列明颁发方、核验来源和适用范围，不将学习证明、平台记录或个人作品表述为政府资质、行业认证、官方授权或客户背书。',\n    aiRule:",
    'compliance disclosure rules'
  );

  content = replaceRequired(
    content,
    '.trust-callout{padding:20px;border-left:5px solid #caa15f;color:#315f64;background:#eef8f6;line-height:1.8}.trust-contact',
    '.trust-callout{padding:20px;border-left:5px solid #caa15f;color:#315f64;background:#eef8f6;line-height:1.8}.trust-levels{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.trust-level{padding:18px;border:1px solid #d5e4e3;background:#fff}.trust-level b{display:inline-grid;place-items:center;width:34px;height:34px;margin-bottom:10px;border-radius:50%;color:#fff;background:#0f4b5a}.trust-level strong{display:block;color:#0f4b5a}.trust-level span{display:block;margin-top:6px;color:#5f7474;font-size:14px;line-height:1.65}.trust-contact',
    'trust level visual styles'
  );

  content = replaceRequired(
    content,
    '@media(max-width:860px){.trust-grid,.trust-contact{grid-template-columns:1fr}.trust-status{grid-template-columns:repeat(2,minmax(0,1fr))}}',
    '@media(max-width:860px){.trust-grid,.trust-contact{grid-template-columns:1fr}.trust-status,.trust-levels{grid-template-columns:repeat(2,minmax(0,1fr))}}',
    'trust level tablet layout'
  );

  content = replaceRequired(
    content,
    '@media(max-width:520px){.trust-status{grid-template-columns:1fr}}',
    '@media(max-width:520px){.trust-status,.trust-levels{grid-template-columns:1fr}}',
    'trust level mobile layout'
  );

  content = replaceRequired(
    content,
    '<nav class="module-subnav"><a href="#identity">主体说明</a><a href="#contract">合同付款</a><a href="#data">数据保密</a><a href="#evidence">成果证据</a><a href="#ai">AI边界</a><a href="#contact">核验联系</a></nav>',
    '<nav class="module-subnav"><a href="#identity">主体说明</a><a href="#contract">合同付款</a><a href="#data">数据保密</a><a href="#evidence">成果证据</a><a href="#evidence-levels">证据分级</a><a href="#publication">内容日期</a><a href="#ai">AI边界</a><a href="#contact">核验联系</a></nav>',
    'trust page navigation'
  );

  const evidenceAnchor = '<section class="module-section" id="ai"><div class="module-inner"><div class="module-heading"><h2>AI、专业判断与责任边界</h2></div><div class="trust-callout">';
  const evidenceInsert = `<section class="module-section" id="evidence-levels"><div class="module-inner"><div class="module-heading"><h2>公开成果证据分级</h2><p>为避免把经验陈述、过程验证、财务核定和预测模型混为一谈，公开成果统一使用以下内部披露等级；该等级不是第三方认证。</p></div><div class="trust-levels">
<article class="trust-level"><b>A</b><strong>已核定</strong><span>存在企业财务、管理层、验收文件或等效正式记录；公开时仍须脱敏。</span></article>
<article class="trust-level"><b>B</b><strong>已验证</strong><span>有改善前后数据、过程记录或现场验收，但未取得完整财务核定。</span></article>
<article class="trust-level"><b>C</b><strong>阶段估算</strong><span>依据基线、模型与假设测算，必须明确“预估／阶段性估算／待核验”。</span></article>
<article class="trust-level"><b>D</b><strong>经验陈述</strong><span>用于说明任职经历、参与范围和方法实践；正式合作前可按保密条件进一步核验。</span></article>
</div><div class="trust-callout" style="margin-top:18px"><strong>累计成果说明：</strong>职业生涯累计改善贡献包含本人主导、组织推进及跨部门团队共同完成的多年度项目，不等同于QilyLean品牌成立后的独立营收，也不代表任何新项目必然取得相同结果。</div></div></section>
<section class="module-section alt" id="publication"><div class="module-inner"><div class="module-heading"><h2>内容日期、版本与非背书声明</h2></div><div class="trust-grid">
<article class="trust-card"><h3>历史简报日期用于档案定位</h3><p>历史简报依据历年制造实践、工作记录和项目经验持续整理。页面日期用于知识档案排序与主题定位；除非页面另有可核验说明，不单独作为该网页在对应日期首次公开发布的证明。</p></article>
<article class="trust-card"><h3>不虚构资质、授权或客户背书</h3><p>除非页面明确列明颁发方、核验来源和适用范围，学习证明、平台记录、个人作品及项目经历不表述为政府资质、行业认证、官方授权、合作伙伴身份或客户推荐。</p></article>
<article class="trust-card"><h3>页面允许持续修订</h3><p>知识内容、统计数字、链接和展示结构可随事实核验与站点维护更新；涉及合同、付款、成果和责任边界时，以最新页面与双方正式书面文件为准。</p></article>
<article class="trust-card"><h3>欢迎纠错与证据核验</h3><p>发现数字、日期、术语、链接或项目表述存在疑问时，可通过官网公开联系方式提出；经核验属实的错误将修订，并同步更新搜索索引和相关页面。</p></article>
</div></div></section>
${evidenceAnchor}`;
  content = replaceRequired(content, evidenceAnchor, evidenceInsert, 'evidence levels and publication disclosure');

  content = replaceRequired(
    content,
    '<article><h3>合作与付款边界</h3><ul><li>网页价格与服务说明仅供范围评估，不替代正式报价和合同。</li><li>仅向合同或双方书面确认文件载明的账户付款；账户变更须通过官网公开渠道复核。</li><li>发票类型、税率和开票主体在签约前按实际主体书面确认。</li><li>项目成果、客户资料、AI辅助及保密边界详见独立信任中心。</li></ul></article>',
    '<article><h3>合作、付款与证据边界</h3><ul><li>网页价格与服务说明仅供范围评估，不替代正式报价和合同。</li><li>仅向合同或双方书面确认文件载明的账户付款；账户变更须通过官网公开渠道复核。</li><li>发票类型、税率和开票主体在签约前按实际主体书面确认。</li><li>项目结果按已核定、已验证、阶段估算或经验陈述分级披露；历史案例不构成新项目收益承诺。</li><li>未经明确授权，不把客户名称、合作经历或内部材料表述为客户推荐、官方合作或商业背书。</li></ul></article>',
    'cooperation integrity boundary'
  );

  content = replaceRequired(
    content,
    '<div class="metric"><strong>${data.search && data.search.indexedEntries ? data.search.indexedEntries : \'自动\'}条</strong><span>全站搜索索引与术语、简报、Sitemap及首页统计同步生成。</span><em><a href="/trust/">进入信任中心</a></em></div>',
    '<div class="metric"><strong>证据分级</strong><span>项目结果按已核定、已验证、阶段估算和经验陈述分类展示，避免把预测值当成已实现结果。</span><em><a href="/trust/#evidence-levels">查看证据分级</a></em></div>',
    'homepage trust evidence card'
  );

  write(file, content);
}

function patchHomepage() {
  const file = 'index.html';
  let content = read(file);
  content = replaceRequired(
    content,
    '<div class="metric"><strong>超千万元</strong><span>累计改善收益来自效率提升、设备稼动改善、工艺优化、库存与物流浪费降低。</span><em>改善项目经营化表达。</em></div>',
    '<div class="metric"><strong>超千万元*</strong><span>职业生涯多年度参与、主导及组织推进的累计改善贡献，包含跨部门团队共同成果。</span><em>非QilyLean品牌独立营收；核定、估算及职责边界分级披露。</em></div>',
    'homepage cumulative contribution wording'
  );

  if (!content.includes('"@type":"Person","name":"丁启利"')) {
    const schema = '<script type="application/ld+json">{"@context":"https://schema.org","@type":"Person","name":"丁启利","url":"https://qilylean.com","jobTitle":"制造改善与精益工程实践者","description":"QilyLean｜启力精益发起人，聚焦精益生产、工业工程、工程改善与数智化工厂实践。","knowsAbout":["精益生产","工业工程","VSM","标准工时","OEE","SMED","Factory Layout","ERP/MES/APS"]}</script>\n';
    const anchor = '  <script data-qily-shell-bootstrap>';
    if (!content.includes(anchor)) throw new Error('Homepage schema insertion anchor missing');
    content = content.replace(anchor, `  ${schema}${anchor}`);
  }
  write(file, content);
}

function patchCooperation() {
  const file = 'cooperation/index.html';
  let content = read(file);
  content = replaceRequired(
    content,
    '<div><strong>超千万元</strong><span>累计项目改善收益</span></div>',
    '<div><strong>证据分级</strong><span>核定、验证、估算、陈述</span></div>',
    'cooperation hero evidence wording'
  );
  write(file, content);
}

function patchDailyDirectory() {
  const file = 'qilylean/daily-insights.html';
  let content = read(file);
  if (!content.includes('QILY-ARCHIVE-DISCLOSURE:START')) {
    const anchor = '<h2>简报目录</h2>';
    const block = `${anchor}\n<!-- QILY-ARCHIVE-DISCLOSURE:START -->\n<div role="note" style="margin:16px 0 22px;padding:16px 18px;border-left:5px solid #caa15f;color:#315f64;background:#eef8f6;line-height:1.8"><strong>归档口径说明：</strong>历史简报依据历年制造实践、工作记录与项目经验持续整理；页面日期用于知识档案排序与主题定位，不单独作为该网页在对应日期首次公开发布的证明。内容如经修订，以当前页面和全站同步版本为准。 <a href="/trust/#publication">查看完整说明</a></div>\n<!-- QILY-ARCHIVE-DISCLOSURE:END -->`;
    if (!content.includes(anchor)) throw new Error('Daily directory heading missing');
    content = content.replace(anchor, block);
  }
  write(file, content);
}

function patchProjects() {
  const file = 'projects/index.html';
  let content = read(file);
  if (!content.includes('QILY-PROJECT-READING-RULE:START')) {
    const anchor = '<section class="module-section"><div class="module-inner"><div class="module-heading"><h2>项目清单</h2>';
    const block = `<!-- QILY-PROJECT-READING-RULE:START -->\n<section class="module-section alt" id="project-reading-rule"><div class="module-inner"><div class="module-heading"><h2>项目阅读口径</h2><p>代表项目用于说明问题背景、方法路径、本人职责和团队交付。成果数字须结合角色、证据状态及适用条件阅读。</p></div><div class="module-grid three">\n<article class="module-card"><small>ROLE</small><h3>角色不等于独立创造</h3><p>任职期间主导、组织推进、专业参与和跨部门团队成果分别表达，不把共同完成的项目全部归为个人独立成果。</p></article>\n<article class="module-card"><small>EVIDENCE</small><h3>证据按等级披露</h3><p>已核定、已验证、阶段估算与经验陈述采用不同口径；估算值必须标注假设和待核验边界。</p></article>\n<article class="module-card"><small>CONFIDENTIALITY</small><h3>脱敏展示不等于客户背书</h3><p>公开资料用于能力核验；未经客户明确授权，不表述为客户推荐、官方合作或商业背书。</p></article>\n</div><div class="module-actions"><a href="/trust/#evidence-levels">查看证据分级</a><a class="secondary" href="/trust/#publication">查看内容与非背书声明</a></div></div></section>\n<!-- QILY-PROJECT-READING-RULE:END -->\n${anchor}`;
    if (!content.includes(anchor)) throw new Error('Project list insertion anchor missing');
    content = content.replace(anchor, block);
  }
  write(file, content);
}

function patchCapabilityCertificate() {
  const file = 'capabilities/index.html';
  let content = read(file);
  const anchor = '证书编号：GPT-LE-2025-0422｜颁发日期：2025年4月22日';
  const replacement = '证书编号：GPT-LE-2025-0422｜颁发日期：2025年4月22日。该页面记录个人学习与应用实践，不构成OpenAI官方认证、授权资质或职业资格证明';
  if (content.includes(anchor) && !content.includes('不构成OpenAI官方认证')) {
    content = content.replace(anchor, replacement);
  }
  write(file, content);
}

patchTrustBuilder();
patchHomepage();
patchCooperation();
patchDailyDirectory();
patchProjects();
patchCapabilityCertificate();

console.log('QilyLean integrity upgrade applied.');
