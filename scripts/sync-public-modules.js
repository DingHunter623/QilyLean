#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const origin = 'https://qilylean.com';
const today = process.env.QILY_BUILD_DATE || new Date().toISOString().slice(0, 10);
const dailyIndex = JSON.parse(fs.readFileSync(path.join(root, 'qilylean/daily/index.json'), 'utf8'));
const latestDailyDate = dailyIndex[0] && dailyIndex[0].date;
if (!latestDailyDate) throw new Error('Latest daily brief metadata is missing');
// One source of truth for public-route completeness, global navigation and discoverability.

const projectRoutes = [
  '/projects/automotive-lean/',
  '/projects/smed-300t/',
  '/projects/mold-warehouse/',
  '/projects/fuse-improvement/',
  '/projects/factory-layout/',
  '/projects/digital-factory/'
];

const knowledgeResourceRoutes = [
  '/qilylean/gbt2828.html',
  '/qilylean/production-operations-organization.html'
];

const expectedRoutes = [
  '/',
  '/ai.html',
  '/capabilities/',
  '/experience/',
  '/projects/',
  ...projectRoutes,
  '/improvements/',
  '/improvements/vsm/',
  '/improvements/standard-time/',
  '/improvements/smed/',
  '/improvements/erp-mes/',
  '/improvements/ie-data/',
  '/improvements/visual/',
  '/knowledge/',
  ...knowledgeResourceRoutes,
  '/moments/',
  '/moments/work/',
  '/moments/team/',
  '/moments/business/',
  '/moments/life/',
  '/cooperation/',
  '/qilylean/daily-insights.html',
  `/qilylean/daily/${latestDailyDate}.html`
];

function routeFile(route) {
  if (route === '/') return path.join(root, 'index.html');
  if (route.endsWith('/')) return path.join(root, route.slice(1), 'index.html');
  return path.join(root, route.slice(1));
}

function read(route) {
  const file = routeFile(route);
  if (!fs.existsSync(file)) throw new Error(`Missing public route file: ${route} -> ${path.relative(root, file)}`);
  return fs.readFileSync(file, 'utf8');
}

function publicUrl(route) {
  return `${origin}${route === '/' ? '/' : route.replace(/\/$/, '')}`;
}

function ensureSitemapEntries() {
  const sitemapFile = path.join(root, 'sitemap.xml');
  let sitemap = fs.readFileSync(sitemapFile, 'utf8');
  const entries = [
    ...projectRoutes.map((route) => ({ route, priority: '0.8' })),
    ...knowledgeResourceRoutes.map((route) => ({ route, priority: '0.8' }))
  ];

  entries.forEach(({ route }) => {
    const candidates = new Set([publicUrl(route), `${origin}${route}`]);
    candidates.forEach((candidate) => {
      const escaped = candidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      sitemap = sitemap.replace(new RegExp(`\\n  <url><loc>${escaped}<\\/loc>[^\\n]*<\\/url>`, 'g'), '');
    });
  });

  const block = entries.map(({ route, priority }) =>
    `  <url><loc>${publicUrl(route)}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${priority}</priority></url>`
  ).join('\n');

  const projectIndex = /(  <url><loc>https:\/\/qilylean\.com\/projects\/?<\/loc>[^\n]*<\/url>)/;
  if (!projectIndex.test(sitemap)) throw new Error('Cannot locate canonical /projects entry in sitemap.xml');
  sitemap = sitemap.replace(projectIndex, `$1\n${block}`);
  fs.writeFileSync(sitemapFile, sitemap);
}

function validateNavigationBootstrap(route, html) {
  const isRedirect = /location\.(?:replace|href)\s*=/.test(html) || /http-equiv=["']refresh/i.test(html);
  if (isRedirect) return;
  const hasBootstrap = /site-navigation\.js/.test(html) || /floating-service\.js/.test(html);
  if (!hasBootstrap) throw new Error(`Navigation/floating service bootstrap missing: ${route}`);
}

function validateMetadata(route, html) {
  if (!/<title>[^<]+<\/title>/i.test(html)) throw new Error(`Title missing: ${route}`);
  if (!/<meta\s+name=["']description["']/i.test(html)) throw new Error(`Description missing: ${route}`);
  if (!/<link\s+rel=["']canonical["']/i.test(html)) throw new Error(`Canonical link missing: ${route}`);
}

function validateGbt2828() {
  const html = read('/qilylean/gbt2828.html');
  if (!html.includes('QilyLean | 启力精益')) throw new Error('GB/T 2828 brand is not unified');
  const labels = ['首页', '履历主线', '能力体系', '改善方法', '代表项目', '信任中心', '项目合作', '知识资产', '友情链接'];
  labels.forEach((label) => {
    if (!html.includes(`>${label}<`)) throw new Error(`GB/T 2828 navigation label missing: ${label}`);
  });
  if (!html.includes('/site-navigation.js')) throw new Error('GB/T 2828 does not use the global floating service');
}

function validateGlobalDock() {
  const source = [
    fs.readFileSync(path.join(root, 'site-navigation.js'), 'utf8'),
    fs.readFileSync(path.join(root, 'site-navigation-core.js'), 'utf8'),
    fs.readFileSync(path.join(root, 'site-dock-share-runtime-v1.js'), 'utf8')
  ].join('\n');
  const actions = ['data-action="home"', 'data-action="search"', 'data-action="back"', 'data-action="current"', 'data-action="share"', 'data-action="contact"'];
  actions.forEach((action) => {
    if (!source.includes(action)) throw new Error(`Global dock action missing: ${action}`);
  });
}

function validateProjects() {
  const index = read('/projects/');
  projectRoutes.forEach((route) => {
    if (!index.includes(`href="${route}"`)) throw new Error(`Project list link missing: ${route}`);
    const html = read(route);
    const mainCards = (html.match(/<article class="module-card"/g) || []).length;
    if (mainCards !== 1) throw new Error(`Project page must show one project only: ${route} (found ${mainCards})`);
    if (!html.includes('相关项目')) throw new Error(`Related project links missing: ${route}`);
  });
}

function validateKnowledgeDiscovery() {
  const html = read('/knowledge/');
  if (!html.includes('/qilylean/gbt2828.html')) throw new Error('GB/T 2828 entry missing from knowledge hub');
  if (!html.includes('/qilylean/production-operations-organization.html')) throw new Error('Production operations organization entry missing from knowledge hub');
  const latestRoute = `/qilylean/daily/${latestDailyDate}.html`;
  if (!html.includes(latestRoute)) throw new Error(`${latestDailyDate} brief missing from knowledge hub`);
}

function main() {
  ensureSitemapEntries();
  expectedRoutes.forEach((route) => {
    const html = read(route);
    validateMetadata(route, html);
    validateNavigationBootstrap(route, html);
  });
  validateGbt2828();
  validateGlobalDock();
  validateProjects();
  validateKnowledgeDiscovery();
  process.stdout.write(`Validated ${expectedRoutes.length} public routes, 6 independent project URLs and one unified global dock.\n`);
}

main();
