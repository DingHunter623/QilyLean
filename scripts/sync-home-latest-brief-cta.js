#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const homeFile = path.join(root, 'index.html');
const siteDataFile = path.join(root, 'qilylean', 'site-data.json');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function writeIfChanged(file, content) {
  const normalized = content.endsWith('\n') ? content : `${content}\n`;
  if (read(file) === normalized) return false;
  fs.writeFileSync(file, normalized, 'utf8');
  return true;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);
}

function displayDate(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';
  return `${Number(match[2])}月${Number(match[3])}日`;
}

const data = JSON.parse(read(siteDataFile));
const briefs = data.briefs || {};
if (!/^\d{4}-\d{2}-\d{2}$/.test(briefs.latestDate || '')) throw new Error('Invalid latest brief date');
if (!briefs.latestUrl) throw new Error('Missing latest brief URL');

let home = read(homeFile);
const label = `今日简报｜${displayDate(briefs.latestDate)}`;
const actions = `<div class="actions"><a class="button primary" href="/cooperation/">查看六类项目合作能力与交付</a><a class="button" href="/cooperation/#diagnosis">预约60分钟问题初筛</a><a class="button" href="/projects/">代表项目与证据</a><a class="button qily-latest-brief-button" data-qily-latest-brief-cta="v1" data-qily-latest-brief-date="${escapeHtml(briefs.latestDate)}" href="${escapeHtml(briefs.latestUrl)}" aria-label="${escapeHtml(label)}：${escapeHtml(briefs.latestTitle || '打开最新简报')}">${escapeHtml(label)}</a></div>`;

const actionsExpression = /<div class="actions">[\s\S]*?<\/div>/m;
if (!actionsExpression.test(home)) throw new Error('Homepage hero action group missing');
home = home.replace(actionsExpression, actions);

home = home.replace(
  /(<script id="qilyStaticCoreInteractions" defer src="\/site-static-core-interactions-v1\.js\?v=)[^"]+("><\/script>)/,
  '$1' + '20260810-no-new-badge-v3' + '$2'
);

const changed = writeIfChanged(homeFile, home);
process.stdout.write(`${changed ? 'Updated' : 'Verified'} homepage latest brief CTA: ${label} -> ${briefs.latestUrl}\n`);
