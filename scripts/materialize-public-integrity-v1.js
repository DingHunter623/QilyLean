#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const file = (name) => path.join(root, name);
const read = (name) => fs.readFileSync(file(name), 'utf8');
const writeIfChanged = (name, content) => {
  const target = file(name);
  const normalized = content.endsWith('\n') ? content : `${content}\n`;
  if (fs.readFileSync(target, 'utf8') === normalized) return false;
  fs.writeFileSync(target, normalized);
  console.log(`updated ${name}`);
  return true;
};

const data = JSON.parse(read('qilylean/site-data.json'));
const total = Number(data && data.terminology && data.terminology.total);
if (!Number.isInteger(total) || total < 1) throw new Error('Invalid terminology total');

function upsertMarkedBlock(page, start, end, block, before) {
  const a = page.indexOf(start);
  const b = page.indexOf(end);
  if (a >= 0 && b > a) return page.slice(0, a) + block + page.slice(b + end.length);
  const at = page.indexOf(before);
  if (at < 0) throw new Error(`Insertion target not found: ${before}`);
  return page.slice(0, at) + block + '\n' + page.slice(at);
}

function materializeTerminology() {
  let page = read('knowledge/terminology.html');
  page = page
    .replace(/收录\s*\d+\s*个核心术语/g, `当前收录 ${total} 项核心术语`)
    .replace(/<div class="term-count" id="termCount"[^>]*>[\s\S]*?<\/div>/, `<div class="term-count" id="termCount" data-site-metadata-source="/qilylean/site-data.json">共收录 ${total} 项术语 · ${total} 份单点培训课件</div>`);

  const block = `<!-- QILY-TERMINOLOGY-LIVE-COUNT:START -->\n<p id="qilyTerminologyStaticCount" style="margin:14px 0 0;padding:12px 15px;border-left:4px solid #178b94;background:#edf8f6;color:#315f64;line-height:1.7"><strong style="color:#0f4b5a">当前术语库：</strong>${total} 项术语 · ${total} 份单点培训课件。数量由统一站点数据源自动核算，页面不再维护硬编码数量。</p>\n<!-- QILY-TERMINOLOGY-LIVE-COUNT:END -->`;
  page = upsertMarkedBlock(
    page,
    '<!-- QILY-TERMINOLOGY-LIVE-COUNT:START -->',
    '<!-- QILY-TERMINOLOGY-LIVE-COUNT:END -->',
    block,
    '<nav class="module-subnav" aria-label="术语分类">'
  );
  return writeIfChanged('knowledge/terminology.html', page);
}

function materializeCapabilities() {
  let page = read('capabilities/index.html');
  const section = `    <section id="ai-certificate" class="module-section"><div class="module-inner"><span class="module-eyebrow">CERTIFICATE | AI应用能力佐证</span><h2>AI应用专项证书展示</h2><p class="module-lead">证书图片作为AI学习与应用经历的辅助材料；真实性与资质效力以颁发机构、证书编号、颁发日期和官方核验入口为准。信息未公开或无法独立核验时，不作为官方认证、授权或客户背书。</p><div class="capability-certificate"><figure class="capability-certificate-visual"><a href="/assets/certificates/ai-large-model-engineer.jpg" target="_blank" rel="noopener"><img src="/assets/certificates/ai-large-model-engineer.jpg" alt="大模型应用工程师专项技能证书图片（点击查看原图）"></a><figcaption>大模型应用工程师｜专项技能证书图片｜点击查看原图</figcaption></figure><article class="module-card evidence-card"><span class="module-eyebrow">AI / APPLICATION</span><h3>大模型应用工程师｜专项技能证书图片</h3><p>公开展示AI应用专项证书图片，用于辅助说明文档、知识整理、分析、代码与自动化等工具应用经历；对外作为资质或认证引用前，须补全可独立核验的颁发与查询信息。</p><p class="evidence-meta">能力边界 | AI用于辅助信息处理、方案生成、代码与自动化；制造结论仍须以现场数据、工程标准、过程验证和人工复核为准。证书核验信息未补全前，不将该图片作为官方资质证明。</p><div class="module-actions"><a href="/assets/certificates/ai-large-model-engineer.jpg" target="_blank" rel="noopener">查看原图</a><a href="/knowledge/">查看知识资产</a></div></article></div><div class="module-card" style="margin-top:18px" data-qily-certificate-verification="v1"><span class="module-eyebrow">VERIFICATION | 证书核验信息</span><h3>核验信息待补全</h3><div class="module-grid module-grid-3"><article class="module-card"><small>颁发机构</small><h3>当前未提供可独立核验信息</h3></article><article class="module-card"><small>证书编号</small><h3>当前官网未公开</h3></article><article class="module-card"><small>颁发日期</small><h3>当前官网未公开</h3></article><article class="module-card"><small>官方核验入口</small><h3>当前官网未提供</h3></article><article class="module-card"><small>证书原图</small><h3>官网已公开展示</h3></article><article class="module-card"><small>当前公开定位</small><h3>学习／专项技能材料</h3></article></div><p class="evidence-note" style="margin:18px 0 0"><strong>公开边界：</strong>在颁发主体、证书编号、颁发日期和官方核验入口补全前，本项仅按“专项技能证书图片／学习与应用经历佐证”展示，不表述为政府资质、行业权威认证、OpenAI官方认证或授权，也不作为客户背书。</p></div></div></section>`;

  const expression = /    <section id="ai-certificate" class="module-section">[\s\S]*?<\/section>\n  <\/main>/;
  if (!expression.test(page)) throw new Error('AI certificate section not found');
  page = page.replace(expression, `${section}\n  </main>`);
  return writeIfChanged('capabilities/index.html', page);
}

function materializeMemorialCertificate() {
  let page = read('certificates/chatgpt-lean/index.html');
  const start = '<!-- QILY-CHATGPT-CERTIFICATE-BOUNDARY:START -->';
  const end = '<!-- QILY-CHATGPT-CERTIFICATE-BOUNDARY:END -->';
  const block = `${start}\n<p id="qilyChatgptCertificateBoundary" style="margin:14px 0 0;padding:13px 15px;border-left:4px solid #caa15f;background:#fff8e8;color:#5f543e;line-height:1.72"><strong>性质说明：</strong>本页记录个人AI工具学习与制造实践成果，属于学习纪念与能力佐证材料，不构成OpenAI官方认证、授权、政府资质、行业认证或客户背书。</p>\n${end}`;
  page = upsertMarkedBlock(page, start, end, block, '<nav class="module-subnav" aria-label="证书页面导航">');
  return writeIfChanged('certificates/chatgpt-lean/index.html', page);
}

function materializeTrustRule() {
  let page = read('trust/index.html');
  const start = '<!-- QILY-CERTIFICATE-PUBLIC-RULE:START -->';
  const end = '<!-- QILY-CERTIFICATE-PUBLIC-RULE:END -->';
  const block = `${start}\n<div class="trust-callout" style="margin-top:18px"><strong>证书公开规则：</strong>凡以“证书、认证、资质”对外展示的材料，优先公开颁发主体、证书编号、颁发日期与官方核验入口；信息不完整时仅作学习／专项技能材料展示，不升级表述为官方背书。</div>\n${end}`;
  page = upsertMarkedBlock(page, start, end, block, '</div></section>\n<section class="module-section alt" id="contact">');
  return writeIfChanged('trust/index.html', page);
}

const changed = [
  materializeTerminology(),
  materializeCapabilities(),
  materializeMemorialCertificate(),
  materializeTrustRule()
].filter(Boolean).length;

console.log(`public integrity materialization complete: ${changed} file(s) changed`);
