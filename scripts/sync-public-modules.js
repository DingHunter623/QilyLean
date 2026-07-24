#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const origin = 'https://qilylean.com';
const today = '2026-07-24';
// One source of truth for public-route completeness, global navigation and discoverability.

const projectRoutes = [
  '/projects/automotive-lean/',
  '/projects/smed-300t/',
  '/projects/mold-warehouse/',
  '/projects/fuse-improvement/',
  '/projects/factory-layout/',
  '/projects/digital-factory/'
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
  '/qilylean/gbt2828.html',
  '/moments/',
  '/moments/work/',
  '/moments/team/',
  '/moments/business/',
  '/moments/life/',
  '/cooperation/',
  '/qilylean/daily-insights.html',
  '/qilylean/daily/2026-07-24.html'
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

function ensureSitemapEntries() {
  const sitemapFile = path.join(root, 'sitemap.xml');
  let sitemap = fs.readFileSync(sitemapFile, 'utf8');
  const entries = projectRoutes.map((route) => ({ route, priority: '0.8' }));

  entries.forEach(({ route }) => {
    const escaped = `${origin}${route}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    sitemap = sitemap.replace(new RegExp(`\\n  <url><loc>${escaped}<\\/loc>[^\\n]*<\\/url>`, 'g'), '');
  });

  const block = entries.map(({ route, priority }) =>
    `  <url><loc>${origin}${route}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${priority}</priority></url>`
  ).join('\n');

  const projectIndex = /(  <url><loc>https:\/\/qilylean\.com\/projects\/<\/loc>[^\n]*<\/url>)/;
  if (!projectIndex.test(sitemap)) throw new Error('Cannot locate /projects/ entry in sitemap.xml');
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
  const labels = ['首页', 'QilyLean AI', '能力画像', '履历主线', '改善经验', '知识分享', '行走印记', '项目合作'];
  labels.forEach((label) => {
    if (!html.includes(`>${label}<`)) throw new Error(`GB/T 2828 navigation label missing: ${label}`);
  });
  if (!html.includes('/site-navigation.js')) throw new Error('GB/T 2828 does not use the global floating service');
}

function validateGlobalDock() {
  const source = fs.readFileSync(path.join(root, 'site-navigation.js'), 'utf8');
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
  if (!html.includes('/qilylean/daily/2026-07-24.html')) throw new Error('2026-07-24 brief missing from knowledge hub');
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
