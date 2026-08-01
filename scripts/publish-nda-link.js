#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const buildDate = process.env.QILY_BUILD_DATE || new Date().toISOString().slice(0, 10);
const pdfUrl = '/qilylean/assets/legal/qilylean-mutual-nda-v1.pdf';
const wordUrl = '/qilylean/assets/legal/qilylean-mutual-nda-v1.docx';
const publicPdfUrl = `https://qilylean.com${pdfUrl}`;

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

function patchTrust() {
  let html = read('trust/index.html');
  const block = `<article class="trust-card" id="nda-template"><h3>保密协议优先</h3><p>正式项目可在资料交换前签署保密协议；合同与保密协议对资料范围、访问人员、保存期限、返还销毁和违约责任有约定的，以书面约定为准。</p><p><strong>配套范本：</strong>《QilyLean制造改善项目双向保密协议》V1.0，适用于精益改善、工业工程、新工厂／产线规划、目视化、ERP／MES／APS及数智化工厂等一般项目。Word与PDF由同一源文件自动生成，条款内容一致；正式签署前应按实际主体、项目范围与争议解决方式补充。</p><div class="module-actions"><a href="${pdfUrl}" target="_blank" rel="noopener">在线预览PDF</a><a class="secondary" href="${pdfUrl}" download="QilyLean_制造改善项目双向保密协议_范本_V1.0.pdf">下载PDF范本</a><a class="secondary" href="${wordUrl}" download="QilyLean_制造改善项目双向保密协议_范本_V1.0.docx">下载Word范本</a></div></article>`;
  const expression = /<article class="trust-card"(?: id="nda-template")?><h3>保密协议优先<\/h3>[\s\S]*?<\/article>/;
  if (!expression.test(html)) throw new Error('Cannot locate the confidentiality-agreement card');
  html = html.replace(expression, block);
  return write('trust/index.html', html);
}

function patchSearchAndData() {
  const indexPath = 'qilylean/site-search-index.json';
  const dataPath = 'qilylean/site-data.json';
  const index = JSON.parse(read(indexPath));
  const entries = Array.isArray(index.entries) ? index.entries : [];
  index.entries = entries.filter((entry) => entry.url !== pdfUrl && entry.url !== wordUrl);
  index.entries.push({
    url: pdfUrl,
    title: '制造改善项目双向保密协议｜PDF范本',
    code: 'NDA',
    description: 'QilyLean制造改善、精益生产、工业工程与数智化工厂项目通用双向保密协议PDF范本。',
    headings: '信任中心｜客户数据、隐私与保密｜合同与项目合作',
    text: '双向保密协议 NDA 保密信息 商业秘密 客户资料 个人信息 数据安全 项目成果 返还 删除 销毁 违约责任 制造改善 精益生产 工业工程 新工厂 目视化 ERP MES APS 数智化工厂',
    kind: '法律与合作范本',
    date: buildDate
  });
  index.entries.push({
    url: wordUrl,
    title: '制造改善项目双向保密协议｜Word范本',
    code: 'NDA DOCX',
    description: '与网站PDF内容一致的可编辑Word保密协议范本。',
    headings: '信任中心｜客户数据、隐私与保密｜合同与项目合作',
    text: 'Word DOCX 双向保密协议 可编辑范本 商业秘密 客户数据 项目合作',
    kind: '法律与合作范本',
    date: buildDate
  });
  index.meta = index.meta || {};
  index.meta.indexedEntries = index.entries.length;
  index.meta.ndaVersion = 'V1.0';
  index.meta.ndaPdfUrl = pdfUrl;
  index.meta.ndaWordUrl = wordUrl;
  write(indexPath, `${JSON.stringify(index, null, 2)}\n`);

  const data = JSON.parse(read(dataPath));
  data.compliance = data.compliance || {};
  data.compliance.ndaVersion = 'V1.0';
  data.compliance.ndaTemplateUrl = pdfUrl;
  data.compliance.ndaWordUrl = wordUrl;
  data.compliance.ndaContentRule = 'Word与PDF由同一DOCX源文件自动生成，条款内容保持一致。';
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
  const escaped = publicPdfUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const expression = new RegExp(`\\s*<url><loc>${escaped}<\\/loc>[\\s\\S]*?<\\/url>`);
  xml = xml.replace(expression, '');
  const line = `  <url><loc>${publicPdfUrl}</loc><lastmod>${buildDate}</lastmod><changefreq>yearly</changefreq><priority>0.6</priority></url>`;
  if (!xml.includes('</urlset>')) throw new Error(`Invalid sitemap: ${rel}`);
  xml = xml.replace('</urlset>', `${line}\n</urlset>`);
  write(rel, xml);
}

patchTrust();
const count = patchSearchAndData();
patchDisplayedCount(count);
patchSitemap('sitemap.xml');
patchSitemap('sitemap-core.xml');
process.stdout.write(`Published NDA links and synchronized ${count} search entries.\n`);
