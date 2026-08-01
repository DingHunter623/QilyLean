#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const buildDate = process.env.QILY_BUILD_DATE || new Date().toISOString().slice(0, 10);
const pdfUrl = '/qilylean/assets/legal/qilylean-mutual-nda-v1.pdf';
const legacyWordUrl = '/qilylean/assets/legal/qilylean-mutual-nda-v1.docx';
const previewUrl = '/trust/nda-preview.html';
const publicPdfUrl = `https://qilylean.com${pdfUrl}`;
const publicPreviewUrl = `https://qilylean.com${previewUrl}`;

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function write(rel, value) {
  const file = path.join(root, rel);
  const normalized = value.endsWith('\n') ? value : `${value}\n`;
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === normalized) return false;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, normalized);
  return true;
}

function previewPage() {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>制造改善项目双向保密协议｜在线预览｜QilyLean</title>
<meta name="description" content="QilyLean制造改善项目双向保密协议V1.0在线预览。本站仅提供在线预览，不开放Word或PDF下载。">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${publicPreviewUrl}">
<style>
.nda-preview-page{margin:0;background:#eef7f5}.nda-preview-head{padding:22px clamp(18px,5vw,64px);color:#fff;background:linear-gradient(125deg,#0f4b5a,#177f87)}.nda-preview-inner{width:min(1420px,100%);margin:auto}.nda-preview-head h1{margin:6px 0;font-size:clamp(30px,4vw,48px)}.nda-preview-head p{margin:0;color:#e8f6f3}.nda-preview-notice{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px clamp(18px,5vw,64px);border-bottom:1px solid #d5e4e3;color:#315f64;background:#fff}.nda-preview-notice strong{color:#9e4a34}.nda-preview-notice a{font-weight:900}.nda-preview-frame{width:min(1480px,calc(100% - 28px));height:calc(100vh - 210px);min-height:680px;margin:14px auto 28px;border:1px solid #c8dad8;background:#dfe9e7;box-shadow:0 18px 46px rgba(15,75,90,.14)}.nda-preview-frame iframe{display:block;width:100%;height:100%;border:0;background:#dfe9e7}@media(max-width:720px){.nda-preview-notice{align-items:flex-start;flex-direction:column}.nda-preview-frame{height:calc(100vh - 260px);min-height:520px}}@media print{body{display:none!important}}
</style>
<link rel="stylesheet" href="/site-shell.css?v=20260729-no-old-flash-v1">
<link id="qilyTypographyStylesheet" rel="stylesheet" href="/site-typography-v1.css?v=20260729-hierarchy-v4">
<link id="qilyGlobalLinkStandardStylesheet" rel="stylesheet" href="/site-link-standard-v1.css?v=20260801-global-link-v1">
</head>
<body class="nda-preview-page" oncontextmenu="return false">
<header class="nda-preview-head"><div class="nda-preview-inner"><small>QilyLean｜启力精益 · NDA ONLINE PREVIEW</small><h1>制造改善项目双向保密协议</h1><p>版本V1.0｜适用于精益改善、工业工程、新工厂／产线规划、目视化与数智化项目。</p></div></header>
<section class="nda-preview-notice"><span><strong>预览权限说明：</strong>本站仅开放在线预览，不提供Word或PDF下载入口，不支持网页打印。</span><a href="/trust/#nda-template">返回信任中心</a></section>
<main class="nda-preview-frame" aria-label="保密协议在线预览"><iframe title="QilyLean制造改善项目双向保密协议V1.0" src="${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH" loading="eager" referrerpolicy="same-origin"></iframe></main>
<script>
(function(){
  'use strict';
  document.addEventListener('keydown',function(event){
    var key=(event.key||'').toLowerCase();
    if((event.ctrlKey||event.metaKey)&&(key==='s'||key==='p')){event.preventDefault();event.stopPropagation();}
  },true);
  window.addEventListener('beforeprint',function(){document.body.setAttribute('data-print-blocked','1');});
})();
</script>
</body>
</html>`;
}

function patchTrust() {
  let html = read('trust/index.html');
  const block = `<article class="trust-card" id="nda-template"><h3>保密协议优先</h3><p>正式项目可在资料交换前签署保密协议；合同与保密协议对资料范围、访问人员、保存期限、返还销毁和违约责任有约定的，以书面约定为准。</p><p><strong>配套范本：</strong>《QilyLean制造改善项目双向保密协议》V1.0，适用于精益改善、工业工程、新工厂／产线规划、目视化、ERP／MES／APS及数智化工厂等一般项目。Word与PDF由同一源文件生成并完成一致性校验；官网仅开放受控在线预览，不提供文件下载入口。</p><div class="module-actions"><a href="${previewUrl}" target="_blank" rel="noopener">在线预览保密协议</a></div></article>`;
  const expression = /<article class="trust-card"(?: id="nda-template")?><h3>保密协议优先<\/h3>[\s\S]*?<\/article>/;
  if (!expression.test(html)) throw new Error('Cannot locate the confidentiality-agreement card');
  html = html.replace(expression, block);
  if (/download=|qilylean-mutual-nda-v1\.docx/.test(block)) throw new Error('Download link leaked into the trust card');
  return write('trust/index.html', html);
}

function patchSearchAndData() {
  const indexPath = 'qilylean/site-search-index.json';
  const dataPath = 'qilylean/site-data.json';
  const index = JSON.parse(read(indexPath));
  const entries = Array.isArray(index.entries) ? index.entries : [];
  index.entries = entries.filter((entry) => ![pdfUrl, legacyWordUrl, previewUrl].includes(entry.url));
  index.entries.push({
    url: previewUrl,
    title: '制造改善项目双向保密协议｜在线预览',
    code: 'NDA',
    description: 'QilyLean制造改善、精益生产、工业工程与数智化工厂项目通用双向保密协议在线预览；不提供公开下载。',
    headings: '信任中心｜客户数据、隐私与保密｜合同与项目合作',
    text: '双向保密协议 NDA 在线预览 保密信息 商业秘密 客户资料 个人信息 数据安全 项目成果 返还 删除 销毁 违约责任 制造改善 精益生产 工业工程 新工厂 目视化 ERP MES APS 数智化工厂',
    kind: '法律与合作范本',
    date: buildDate
  });
  index.meta = index.meta || {};
  index.meta.indexedEntries = index.entries.length;
  index.meta.ndaVersion = 'V1.0';
  index.meta.ndaPreviewUrl = previewUrl;
  delete index.meta.ndaPdfUrl;
  delete index.meta.ndaWordUrl;
  write(indexPath, `${JSON.stringify(index, null, 2)}\n`);

  const data = JSON.parse(read(dataPath));
  data.compliance = data.compliance || {};
  data.compliance.ndaVersion = 'V1.0';
  data.compliance.ndaPreviewUrl = previewUrl;
  data.compliance.ndaAccessRule = '官网仅开放受控在线预览，不提供Word或PDF下载入口。';
  data.compliance.ndaContentRule = 'Word与PDF由同一DOCX源文件生成并完成一致性校验；Word仅作为构建源，不公开发布。';
  delete data.compliance.ndaTemplateUrl;
  delete data.compliance.ndaWordUrl;
  data.search = data.search || {};
  data.search.indexedEntries = index.entries.length;
  write(dataPath, `${JSON.stringify(data, null, 2)}\n`);
  return index.entries.length;
}

function patchDisplayedCount(count) {
  let trust = read('trust/index.html');
  trust = trust.replace(/<strong>\d+<\/strong><span>站内搜索索引条目<\/span>/, `<strong>${count}</strong><span>站内搜索索引条目</span>`);
  write('trust/index.html', trust);

  let home = read('index.html');
  home = home.replace(/<strong>\d+条<\/strong><span>全站搜索索引与术语、简报、Sitemap及首页统计同步生成。<\/span>/, `<strong>${count}条</strong><span>全站搜索索引与术语、简报、Sitemap及首页统计同步生成。</span>`);
  write('index.html', home);
}

function patchSitemap(rel) {
  let xml = read(rel);
  for (const publicUrl of [publicPdfUrl, publicPreviewUrl]) {
    const escaped = publicUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const expression = new RegExp(`\\s*<url><loc>${escaped}<\\/loc>[\\s\\S]*?<\\/url>`);
    xml = xml.replace(expression, '');
  }
  const line = `  <url><loc>${publicPreviewUrl}</loc><lastmod>${buildDate}</lastmod><changefreq>yearly</changefreq><priority>0.6</priority></url>`;
  if (!xml.includes('</urlset>')) throw new Error(`Invalid sitemap: ${rel}`);
  xml = xml.replace('</urlset>', `${line}\n</urlset>`);
  write(rel, xml);
}

write('trust/nda-preview.html', previewPage());
patchTrust();
const count = patchSearchAndData();
patchDisplayedCount(count);
patchSitemap('sitemap.xml');
patchSitemap('sitemap-core.xml');
process.stdout.write(`Published preview-only NDA access and synchronized ${count} search entries.\n`);
