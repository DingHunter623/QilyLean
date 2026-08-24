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
  page = upsertMarkedBlock(page, '<!-- QILY-TERMINOLOGY-LIVE-COUNT:START -->', '<!-- QILY-TERMINOLOGY-LIVE-COUNT:END -->', block, '<nav class="module-subnav" aria-label="术语分类">');
  return writeIfChanged('knowledge/terminology.html', page);
}

function materializeCapabilities() {
  let page = read('capabilities/index.html');
  const section = `    <section id="ai-certificate" class="module-section"><div class="module-inner"><span class="module-eyebrow">CERTIFICATE | AI应用能力佐证</span><h2>AI应用专项证书展示</h2><p class="module-lead">证书用于记录AI工具学习与制造改善实践经历。证书编号、日期与原图按现有证书事实公开；关联平台为 OpenAI 的 ChatGPT / Codex，但该证书并非 OpenAI 官方颁发或官方认证。</p><div class="capability-certificate"><figure class="capability-certificate-visual"><a href="/qilylean/chatgpt-lean-certificate.png" target="_blank" rel="noopener" aria-label="查看ChatGPT应用与精益生产实践证书高清原图"><img src="/qilylean/chatgpt-lean-certificate-web.jpg?v=20260824-certificate-facts-v2" alt="丁启利ChatGPT应用与精益生产实践学习成果纪念证书" loading="lazy" decoding="async"></a><figcaption>ChatGPT应用与精益生产实践学习成果纪念证书｜点击查看高清原图</figcaption></figure><article class="module-card evidence-card"><span class="module-eyebrow">AI / APPLICATION</span><h3>ChatGPT应用与精益生产实践</h3><p>持续学习并实践 OpenAI ChatGPT、Codex 等人工智能工具，将AI能力用于流程优化、效率提升、数据分析、程序文件编制、代码与网页资产生成，以及制造改善知识沉淀。</p><p class="module-result">证书编号：GPT-LE-2025-0422｜日期：2025年4月22日｜关联平台：OpenAI（ChatGPT / Codex）</p><p class="evidence-meta">能力边界 | 该证书属于学习纪念与能力佐证材料，不构成 OpenAI 官方认证、授权、政府资质或行业认证；制造结论仍以现场数据、工程标准、过程验证和人工复核为准。</p><div class="module-actions"><a href="/qilylean/chatgpt-lean-certificate.png" target="_blank" rel="noopener">查看证书原图</a><a href="https://openai.com/" target="_blank" rel="noopener noreferrer">OpenAI 官方网站</a><a href="/knowledge/">查看知识资产</a></div></article></div><div class="module-card" style="margin-top:18px" data-qily-certificate-verification="v2"><span class="module-eyebrow">VERIFICATION | 证书信息</span><h3>证书事实与关联平台</h3><div class="module-grid module-grid-3"><article class="module-card"><small>关联平台 / 工具</small><h3>OpenAI · ChatGPT / Codex</h3></article><article class="module-card"><small>证书编号</small><h3>GPT-LE-2025-0422</h3></article><article class="module-card"><small>日期</small><h3>2025年4月22日</h3></article><article class="module-card"><small>OpenAI 官方网站</small><h3><a href="https://openai.com/" target="_blank" rel="noopener noreferrer">openai.com</a></h3><p>平台官方网站，非本证书核验入口。</p></article><article class="module-card"><small>证书原图</small><h3><a href="/qilylean/chatgpt-lean-certificate.png" target="_blank" rel="noopener">官网已公开展示</a></h3></article><article class="module-card"><small>公开定位</small><h3>学习纪念 / 能力佐证</h3></article></div><p class="evidence-note" style="margin:18px 0 0"><strong>公开边界：</strong>本证书用于记录个人 AI 工具学习与制造实践成果；OpenAI 为所使用 ChatGPT / Codex 的关联平台，不表述为 OpenAI 官方颁发、认证或授权。</p></div></div></section>`;

  const expression = /    <section id="ai-certificate" class="module-section">[\s\S]*?<\/section>\n  <\/main>/;
  if (!expression.test(page)) throw new Error('AI certificate section not found');
  page = page.replace(expression, `${section}\n  </main>`);
  if (!page.includes('/site-certificate-facts-v2.js')) {
    page = page.replace('</body>', '<script defer src="/site-certificate-facts-v2.js?v=20260824-certificate-facts-v2"></script>\n</body>');
  }
  return writeIfChanged('capabilities/index.html', page);
}

function materializeMemorialCertificate() {
  let page = read('certificates/chatgpt-lean/index.html');
  const start = '<!-- QILY-CHATGPT-CERTIFICATE-BOUNDARY:START -->';
  const end = '<!-- QILY-CHATGPT-CERTIFICATE-BOUNDARY:END -->';
  const block = `${start}\n<p id="qilyChatgptCertificateBoundary" style="margin:14px 0 0;padding:13px 15px;border-left:4px solid #caa15f;background:#fff8e8;color:#5f543e;line-height:1.72"><strong>性质说明：</strong>本页记录个人AI工具学习与制造实践成果，属于学习纪念与能力佐证材料。OpenAI 为 ChatGPT / Codex 的关联平台，不构成 OpenAI 官方认证、授权、政府资质、行业认证或客户背书。</p>\n${end}`;
  page = upsertMarkedBlock(page, start, end, block, '<nav class="module-subnav" aria-label="证书页面导航">');
  return writeIfChanged('certificates/chatgpt-lean/index.html', page);
}

function materializeTrustRule() {
  let page = read('trust/index.html');
  const start = '<!-- QILY-CERTIFICATE-PUBLIC-RULE:START -->';
  const end = '<!-- QILY-CERTIFICATE-PUBLIC-RULE:END -->';
  const block = `${start}\n<div class="trust-callout" style="margin-top:18px"><strong>证书公开规则：</strong>证书编号、日期、原图和关联平台按现有事实展示；“关联平台”不等同“颁发机构”。第三方官方认证、授权或资质只有在具备独立核验依据时才作相应表述。</div>\n${end}`;
  page = upsertMarkedBlock(page, start, end, block, '</div></section>\n<section class="module-section alt" id="contact">');
  return writeIfChanged('trust/index.html', page);
}

const changed = [materializeTerminology(), materializeCapabilities(), materializeMemorialCertificate(), materializeTrustRule()].filter(Boolean).length;
console.log(`public integrity materialization complete: ${changed} file(s) changed`);
