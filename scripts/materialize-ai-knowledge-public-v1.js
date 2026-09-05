#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const PUBLIC_URL = '/AI-Knowledge/';
const TODAY = '2026-09-05';

function absolute(file) { return path.join(root, file); }
function read(file) { return fs.readFileSync(absolute(file), 'utf8'); }
function write(file, content) {
  const target = absolute(file);
  const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
  if (current === content) return false;
  fs.writeFileSync(target, content, 'utf8');
  return true;
}
function readJson(file) { return JSON.parse(read(file)); }
function writeJson(file, value) { return write(file, `${JSON.stringify(value, null, 2)}\n`); }
function requireCondition(condition, message) { if (!condition) throw new Error(message); }

const publicHtml = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>QilyLean AI赋能制造知识库｜IE·精益生产·智能制造知识资产</title>
<meta name="description" content="QilyLean AI赋能制造知识库，面向工业工程IE、精益生产Lean、智能制造、新工厂规划与制造改善方法体系，沉淀可检索、可复用、可持续迭代的企业级制造知识资产。">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="https://qilylean.com/AI-Knowledge/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="QilyLean｜启力精益">
<meta property="og:title" content="QilyLean AI赋能制造知识库">
<meta property="og:description" content="面向IE、Lean、智能制造、新工厂规划与制造改善方法体系的企业级知识资产库。">
<meta property="og:url" content="https://qilylean.com/AI-Knowledge/">
<meta property="og:image" content="https://qilylean.com/assets/social/qilylean-home-share-1200x630.png">
<link rel="stylesheet" href="/site-shell.css?v=20260814-contact-v13">
<style>
.ai-kb-page{--ai-kb-accent:#0f4b5a;--ai-kb-soft:#eef7f6;--ai-kb-line:rgba(15,75,90,.16)}
.ai-kb-page .ai-kb-hero{padding:clamp(3rem,7vw,6.5rem) 0 2.5rem;background:linear-gradient(180deg,#f4fbfa 0%,#fff 100%)}
.ai-kb-page .ai-kb-kicker{display:inline-block;margin-bottom:.75rem;font-size:.82rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--ai-kb-accent)}
.ai-kb-page .ai-kb-hero h1{max-width:980px;margin:0;font-size:clamp(2rem,5vw,4.35rem);line-height:1.08;letter-spacing:-.035em}
.ai-kb-page .ai-kb-lead{max-width:900px;margin:1.15rem 0 0;font-size:clamp(1rem,2vw,1.25rem);line-height:1.8;color:#43545a}
.ai-kb-page .ai-kb-section{padding:clamp(2.5rem,6vw,5rem) 0}
.ai-kb-page .ai-kb-section.alt{background:var(--ai-kb-soft)}
.ai-kb-page .ai-kb-heading{max-width:820px;margin-bottom:1.6rem}
.ai-kb-page .ai-kb-heading h2{margin:0 0 .65rem;font-size:clamp(1.55rem,3vw,2.3rem)}
.ai-kb-page .ai-kb-heading p{margin:0;line-height:1.8;color:#53646a}
.ai-kb-page .ai-kb-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem}
.ai-kb-page .ai-kb-card{min-width:0;padding:1.35rem;border:1px solid var(--ai-kb-line);border-radius:18px;background:#fff;box-shadow:0 10px 30px rgba(15,75,90,.05)}
.ai-kb-page .ai-kb-card small{display:block;margin-bottom:.45rem;font-weight:800;color:var(--ai-kb-accent)}
.ai-kb-page .ai-kb-card h3{margin:.1rem 0 .55rem;font-size:1.12rem}
.ai-kb-page .ai-kb-card p{margin:0;line-height:1.72;color:#526168}
.ai-kb-page .ai-kb-actions{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:1.5rem}
.ai-kb-page .ai-kb-actions a{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:.72rem 1rem;border-radius:12px;text-decoration:none;font-weight:800;background:var(--ai-kb-accent);color:#fff}
.ai-kb-page .ai-kb-actions a.secondary{background:#fff;color:var(--ai-kb-accent);border:1px solid var(--ai-kb-line)}
@media (max-width:900px){.ai-kb-page .ai-kb-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:640px){.ai-kb-page .ai-kb-hero{padding-top:2.2rem}.ai-kb-page .ai-kb-grid{grid-template-columns:1fr}.ai-kb-page .ai-kb-card{padding:1.1rem}.ai-kb-page .ai-kb-actions{display:grid}.ai-kb-page .ai-kb-actions a{width:100%}}
</style>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"CollectionPage","name":"QilyLean AI赋能制造知识库","description":"面向工业工程IE、精益生产Lean、智能制造、新工厂规划与制造改善方法体系的企业级知识资产库。","url":"https://qilylean.com/AI-Knowledge/","isPartOf":{"@type":"WebSite","name":"QilyLean｜启力精益","url":"https://qilylean.com/"}}</script>
</head>
<body class="module-page ai-kb-page">
<header class="qily-site-header">
<a class="qily-brand" href="/">QilyLean | 启力精益</a>
<nav class="site-nav" aria-label="QilyLean核心导视">
<a href="/">首页</a><a href="/experience/">履历主线</a><a href="/capabilities/">能力体系</a><a href="/improvements/">改善方法</a><a href="/projects/">代表项目</a><a href="/trust/">信任中心</a><a href="/cooperation/">项目合作</a><a href="/knowledge/" aria-current="page">知识资产</a><a href="/links/">友情链接</a>
</nav>
</header>
<main>
<section class="ai-kb-hero"><div class="module-inner">
<span class="ai-kb-kicker">QilyLean · AI Manufacturing Knowledge Asset</span>
<h1>QilyLean AI赋能制造知识库 🤖</h1>
<p class="ai-kb-lead">面向工业工程 IE、精益生产 Lean、智能制造、新工厂规划、制造改善方法体系的企业级知识资产库。以制造现场问题为入口，将方法、数据、工具、案例与AI辅助能力组织为可检索、可复用、可持续迭代的知识资产。</p>
<div class="ai-kb-actions"><a href="/knowledge/">进入知识资产总目录</a><a class="secondary" href="/knowledge/terminology.html">制造术语与OPL</a></div>
</div></section>
<section class="ai-kb-section"><div class="module-inner">
<div class="ai-kb-heading"><span class="ai-kb-kicker">01 / Knowledge Domains</span><h2>制造知识体系</h2><p>围绕制造运营的关键对象建立统一知识入口，从IE基础数据到精益改善，再到数智化系统规划与AI辅助分析。</p></div>
<div class="ai-kb-grid">
<article class="ai-kb-card"><small>IE</small><h3>AI赋能工业工程</h3><p>标准工时、产能、线平衡、人机配置、动作与物流分析，以及基于制造数据的工程决策。</p></article>
<article class="ai-kb-card"><small>LEAN</small><h3>精益生产与现场改善</h3><p>VSM、SMED、TPM、6S、单件流、标准作业与持续改善，强调问题定义、验证和标准化闭环。</p></article>
<article class="ai-kb-card"><small>SMART FACTORY</small><h3>智能制造与数智工厂</h3><p>ERP、MES、APS、数据看板与现场执行连接，形成从计划、资源到结果验证的数据链。</p></article>
<article class="ai-kb-card"><small>FACTORY PLANNING</small><h3>新工厂规划</h3><p>产能规划、布局、物流、人流、设备、公用工程与分阶段实施，服务工厂建设和搬迁决策。</p></article>
<article class="ai-kb-card"><small>METHOD SYSTEM</small><h3>制造改善方法体系</h3><p>把ECRS、PDCA、5W2H、DOE、OEE等方法转化为可直接进入项目的工程化分析框架。</p></article>
<article class="ai-kb-card"><small>KNOWLEDGE REUSE</small><h3>知识复用与AI辅助</h3><p>将术语、模板、案例、工程规则和历史经验结构化，支持检索、学习、方案生成与持续复盘。</p></article>
</div>
</div></section>
<section class="ai-kb-section alt"><div class="module-inner">
<div class="ai-kb-heading"><span class="ai-kb-kicker">02 / Application Logic</span><h2>从知识阅读走向制造问题闭环</h2><p>知识库服务于现场事实确认、工程建模、方案选择、实施验证与标准固化。AI用于检索、整理和方案辅助，不替代现场核实、专业评审与管理决策。</p></div>
<div class="ai-kb-actions"><a href="/qilylean/lean-tools.html">精益工具库</a><a class="secondary" href="/qilylean/lean-knowledge.html">制造改善知识库</a><a class="secondary" href="/qilylean/daily-insights.html">精选简报</a></div>
</div></section>
</main>
</body>
</html>
`;
write('AI-Knowledge/index.html', publicHtml);

const siteData = readJson('qilylean/site-data.json');
requireCondition(siteData.knowledge && siteData.knowledge.aiKnowledge, 'site-data.json is missing knowledge.aiKnowledge');
const aiKnowledge = siteData.knowledge.aiKnowledge;
aiKnowledge.title = 'AI赋能制造知识库';
aiKnowledge.url = PUBLIC_URL;
aiKnowledge.sources = [
  { source: 'AI-Knowledge/README.md', kind: '仓库管理文件', visibility: 'repository-management' },
  { source: 'AI-Knowledge/NOTICE.md', kind: '仓库管理文件', visibility: 'repository-management' }
];
delete aiKnowledge.documents;
siteData.generatedAt = [siteData.generatedAt, TODAY].filter(Boolean).sort().at(-1);
writeJson('qilylean/site-data.json', siteData);

let daily = read('qilylean/daily/2026-09-04.html');
daily = daily.replace(/<a class="secondary" href="\/AI-Knowledge\/README\.md">AI Knowledge Base<\/a>/g, '<a class="secondary" href="/AI-Knowledge/">AI赋能制造知识库</a>');
requireCondition(!daily.includes('/AI-Knowledge/README.md'), 'Daily brief still exposes README.md');
requireCondition(!daily.includes('>AI Knowledge Base<'), 'Daily brief still exposes old frontend label');
write('qilylean/daily/2026-09-04.html', daily);

let sitemap = read('sitemap.xml');
sitemap = sitemap.replace(/\s*<url><loc>https:\/\/qilylean\.com\/AI-Knowledge\/(?:README|NOTICE)\.md<\/loc>[\s\S]*?<\/url>/g, '');
if (!sitemap.includes('<loc>https://qilylean.com/AI-Knowledge/</loc>')) {
  sitemap = sitemap.replace('</urlset>', `  <url><loc>https://qilylean.com/AI-Knowledge/</loc><lastmod>${TODAY}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
}
requireCondition(!sitemap.includes('/AI-Knowledge/README.md'), 'sitemap.xml still exposes README.md');
requireCondition(!sitemap.includes('/AI-Knowledge/NOTICE.md'), 'sitemap.xml still exposes NOTICE.md');
write('sitemap.xml', sitemap);

let robots = read('robots.txt');
if (!robots.includes('Disallow: /AI-Knowledge/README.md')) {
  robots = robots.replace('Disallow: /qilylean/reference/\n', 'Disallow: /qilylean/reference/\nDisallow: /AI-Knowledge/README.md\nDisallow: /AI-Knowledge/NOTICE.md\n');
}
write('robots.txt', robots);

let syncScript = read('scripts/sync-search-brief-metadata.js');
if (!syncScript.includes('function validateAiKnowledgeSource(source) {')) {
  const start = syncScript.indexOf('function markdownEntry(document) {');
  const end = syncScript.indexOf('function latestSitemapLastmod()', start);
  requireCondition(start >= 0 && end > start, 'Could not locate legacy AI markdown indexing block');
  const replacement = `function validateAiKnowledgeSource(source) {
  const value = clean(source && source.source);
  if (!value || path.isAbsolute(value) || value.split('/').includes('..')) {
    throw new Error(\`Invalid AI knowledge source path: \${value || '(empty)'}\`);
  }
  const sourceFile = path.join(root, value);
  if (!fs.existsSync(sourceFile) || !fs.statSync(sourceFile).isFile()) {
    throw new Error(\`AI knowledge source is missing: \${value}\`);
  }
  if (source && source.visibility && source.visibility !== 'repository-management') {
    throw new Error(\`AI knowledge source must remain repository-management only: \${value}\`);
  }
  return value;
}
function aiKnowledgeEntries(data) {
  const aiKnowledge = data.knowledge && data.knowledge.aiKnowledge;
  if (!aiKnowledge) return [];
  const sources = aiKnowledge.sources;
  if (!Array.isArray(sources) || sources.length === 0) {
    throw new Error('AI knowledge is registered in site-data.json but has no repository-management sources.');
  }
  sources.forEach(validateAiKnowledgeSource);
  const url = clean(aiKnowledge.url);
  if (!url || !url.startsWith('/') || /\\.md(?:$|[?#])/i.test(url)) {
    throw new Error(\`AI knowledge primary URL must be a public landing page: \${url || '(empty)'}\`);
  }
  const absoluteUrl = \`https://qilylean.com\${url}\`;
  const relative = urlToFile(absoluteUrl);
  if (!relative) throw new Error(\`AI knowledge public URL cannot be materialized: \${url}\`);
  const publicFile = path.join(root, relative);
  if (!fs.existsSync(publicFile) || !fs.statSync(publicFile).isFile()) {
    throw new Error(\`AI knowledge public page is missing: \${relative}\`);
  }
  const sitemap = read(sitemapFile);
  if (!sitemap.includes(\`<loc>\${absoluteUrl}</loc>\`)) {
    throw new Error(\`AI knowledge public URL is missing from sitemap.xml: \${url}\`);
  }
  if (sitemap.includes('/AI-Knowledge/README.md') || sitemap.includes('/AI-Knowledge/NOTICE.md')) {
    throw new Error('Repository-management AI knowledge files must not be published in sitemap.xml.');
  }
  const page = pageEntries(url, read(publicFile));
  if (!page.length) throw new Error(\`AI knowledge public page could not be indexed: \${url}\`);
  return [page[0]];
}
`;
  syncScript = `${syncScript.slice(0, start)}${replacement}${syncScript.slice(end)}`;
}
write('scripts/sync-search-brief-metadata.js', syncScript);

let validator = read('scripts/site-system-v4-validate.js');
if (!validator.includes('const aiKnowledgeRegistry = siteData.knowledge')) {
  const start = validator.indexOf('const aiDocuments = siteData.knowledge');
  const end = validator.indexOf('const navFile =', start);
  requireCondition(start >= 0 && end > start, 'Could not locate legacy V4 AI knowledge validation block');
  const replacement = `const aiKnowledgeRegistry = siteData.knowledge && siteData.knowledge.aiKnowledge;
if (aiKnowledgeRegistry) {
  if (!aiKnowledgeRegistry.url || /\\.md(?:$|[?#])/i.test(aiKnowledgeRegistry.url)) fail('AI knowledge primary URL must be the formal public landing page');
  if (!searchEntries.some((entry) => entry && entry.url === aiKnowledgeRegistry.url)) fail(\`AI knowledge public page missing from search index: \${aiKnowledgeRegistry.url}\`);
  const aiSources = aiKnowledgeRegistry.sources;
  if (!Array.isArray(aiSources) || aiSources.length === 0) fail('AI knowledge repository-management source registry is invalid');
  for (const source of aiSources) {
    if (!source || !source.source) fail('AI knowledge repository-management source entry is incomplete');
    if (source.visibility !== 'repository-management') fail(\`AI knowledge source is not marked repository-management: \${source.source}\`);
    if (!exists(source.source)) fail(\`AI knowledge source missing: \${source.source}\`);
    const publicSourceUrl = \`/\${String(source.source).replace(/^\\/+/, '')}\`;
    if (searchEntries.some((entry) => entry && entry.url === publicSourceUrl)) fail(\`Repository-management AI source leaked into search index: \${publicSourceUrl}\`);
    if (sitemap.includes(\`<loc>\${base}\${publicSourceUrl}</loc>\`)) fail(\`Repository-management AI source leaked into sitemap: \${publicSourceUrl}\`);
  }
}

`;
  validator = `${validator.slice(0, start)}${replacement}${validator.slice(end)}`;
}
write('scripts/site-system-v4-validate.js', validator);

const packageJson = readJson('package.json');
packageJson.scripts = packageJson.scripts || {};
packageJson.scripts.build = 'node scripts/build-trust-search-sync.js --search-only && node scripts/site-system-v4-validate.js';
writeJson('package.json', packageJson);

const finalPage = read('AI-Knowledge/index.html');
for (const forbidden of ['QilyLean AI Knowledge Base', '来源说明', 'IDouble', 'MIT License', '项目目录规划', '开发备注']) {
  requireCondition(!finalPage.includes(forbidden), `Public AI knowledge page contains forbidden repository-management content: ${forbidden}`);
}
const finalData = readJson('qilylean/site-data.json');
requireCondition(finalData.knowledge.aiKnowledge.title === 'AI赋能制造知识库', 'Public AI knowledge label is not materialized');
requireCondition(finalData.knowledge.aiKnowledge.url === PUBLIC_URL, 'Public AI knowledge route is not materialized');
requireCondition(!finalData.knowledge.aiKnowledge.documents, 'Legacy public AI document registry still exists');
requireCondition(read('robots.txt').includes('Disallow: /AI-Knowledge/README.md'), 'robots.txt does not protect README.md');
requireCondition(read('robots.txt').includes('Disallow: /AI-Knowledge/NOTICE.md'), 'robots.txt does not protect NOTICE.md');
requireCondition(fs.existsSync(absolute('AI-Knowledge/README.md')), 'Backend README.md must be retained');
requireCondition(fs.existsSync(absolute('AI-Knowledge/NOTICE.md')), 'Backend NOTICE.md must be retained');

console.log('AI knowledge public-route materialization PASS: formal landing page, frontend route, SEO/mobile shell, repository-management isolation, sitemap/robots and build contract are aligned.');
