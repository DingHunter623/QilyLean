#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const qily = path.join(root, 'qilylean');
const dailyDir = path.join(qily, 'daily');
const baseUrl = 'https://qilylean.com';

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function textFromHtml(value) {
  return String(value).replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}

function capture(value, expression, label) {
  const match = value.match(expression);
  if (!match) throw new Error(`Cannot extract ${label}`);
  return match[1];
}

function iso(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function backfillData() {
  const source = fs.readFileSync(path.join(qily, 'daily-backfill-20251219-20260707.js'), 'utf8');
  const themes = JSON.parse(capture(source, /var themes=(\[[\s\S]*?\]);\nvar lenses=/, 'backfill themes'));
  const lenses = vm.runInNewContext(capture(source, /var lenses=(\[[\s\S]*?\]);\nvar actions=/, 'backfill lenses'));
  const actions = vm.runInNewContext(capture(source, /var actions=(\[[\s\S]*?\]);\nvar endings=/, 'backfill actions'));
  const endings = vm.runInNewContext(capture(source, /var endings=(\[[\s\S]*?\]);\nfunction esc/, 'backfill endings'));
  return { themes, lenses, actions, endings };
}

function visual(theme, index) {
  const c1 = ['#0f4b5a', '#153f4c', '#17443b', '#264f61'][index % 4];
  const c2 = ['#177f87', '#2d8c84', '#3b7f91', '#4a786e'][index % 4];
  const accent = ['#caa15f', '#ffe39b', '#d7b56d', '#e4ca91'][index % 4];
  const mode = index % 6;
  let shape = '';
  if (mode === 0) shape = `<rect x="120" y="180" width="560" height="360" rx="26" fill="${c2}"/><path d="M170 470h460M210 390h380M250 310h300" stroke="#fff" stroke-width="20" stroke-linecap="round"/>`;
  if (mode === 1) shape = `<circle cx="400" cy="350" r="210" fill="${c2}"/><path d="M250 350h300M400 200v300" stroke="#fff" stroke-width="24" stroke-linecap="round"/><circle cx="400" cy="350" r="62" fill="${accent}"/>`;
  if (mode === 2) shape = `<rect x="130" y="470" width="540" height="130" rx="18" fill="${accent}"/><rect x="200" y="310" width="400" height="160" rx="18" fill="${c2}"/><rect x="285" y="170" width="230" height="140" rx="18" fill="#fff"/>`;
  if (mode === 3) shape = `<path d="M145 500L285 340l115 90 150-210 105 120" fill="none" stroke="${accent}" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/><circle cx="145" cy="500" r="28" fill="#fff"/><circle cx="285" cy="340" r="28" fill="#fff"/><circle cx="400" cy="430" r="28" fill="#fff"/><circle cx="550" cy="220" r="28" fill="#fff"/>`;
  if (mode === 4) shape = `<g fill="${c2}"><rect x="130" y="180" width="150" height="420" rx="18"/><rect x="325" y="280" width="150" height="320" rx="18"/><rect x="520" y="380" width="150" height="220" rx="18"/></g><path d="M150 145h500" stroke="${accent}" stroke-width="22" stroke-linecap="round"/>`;
  if (mode === 5) shape = `<path d="M170 240h460v310H170z" fill="${c2}"/><path d="M220 300h360M220 380h360M220 460h220" stroke="#fff" stroke-width="22" stroke-linecap="round"/><circle cx="560" cy="470" r="62" fill="${accent}"/>`;
  return `<svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeHtml(theme.title)}"><rect width="800" height="800" rx="36" fill="${c1}"/>${shape}<text x="400" y="675" fill="#fff" font-size="46" font-weight="850" text-anchor="middle">${escapeHtml(theme.cat)}</text><text x="400" y="727" fill="#d8efeb" font-size="26" text-anchor="middle">制造改善 · 方法沉淀 · 现场实践</text></svg>`;
}

function collectRecentBriefs() {
  return fs.readdirSync(dailyDir).filter((name) => /^\d{4}-\d{2}-\d{2}\.html$/.test(name) && name.slice(0, 10) >= '2026-07-08').map((name) => {
    const page = fs.readFileSync(path.join(dailyDir, name), 'utf8');
    const date = name.replace('.html', '');
    const article = capture(page, /(<article class="post"[\s\S]*?<\/article>)/, `${date} article`);
    const dateLine = textFromHtml(capture(article, /<div class="date">([\s\S]*?)<\/div>/, `${date} date line`));
    const title = textFromHtml(capture(article, /<h2>([\s\S]*?)<\/h2>/, `${date} title`));
    const summary = textFromHtml(capture(article, /<p>([\s\S]*?)<\/p>/, `${date} summary`));
    const dayNo = (dateLine.match(/DAY\d+/) || [''])[0];
    const theme = dateLine.replace(date, '').replace(dayNo, '').replace(/[｜|]/g, '').trim();
    return { date, article, title, summary, dayNo, theme };
  });
}

function collectBackfillBriefs() {
  const { themes, lenses, actions, endings } = backfillData();
  const start = new Date(2025, 11, 19);
  const end = new Date(2026, 6, 7);
  const dates = [];
  for (let date = new Date(end); date >= start; date.setDate(date.getDate() - 1)) dates.push(new Date(date));
  return dates.map((date, index) => {
    const theme = themes[index % themes.length];
    const lens = lenses[Math.floor(index / themes.length) % lenses.length];
    const title = `${theme.title}：${lens.replace('看', '')}`;
    const summary = theme.p1;
    const paragraph2 = `${actions[index % actions.length]} ${actions[(index + 3) % actions.length]}`;
    const paragraph3 = endings[index % endings.length];
    const dateText = iso(date);
    const article = `<article class="post" id="${dateText}"><div class="visual">${visual(theme, index)}</div><div class="content"><div class="date">${dateText}｜${escapeHtml(theme.cat)}</div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(summary)}</p><div class="quote">${escapeHtml(theme.quote)}</div><p>${escapeHtml(paragraph2)}</p><p>${escapeHtml(paragraph3)}</p><div class="tags">${theme.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div><button class="share" type="button">分享本期网址</button><span class="status"></span></div></article>`;
    return { date: dateText, article, title, summary, dayNo: '', theme: theme.cat };
  });
}

function pageHeader(title, description, canonical, ogType = 'article') {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="${ogType}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <link rel="stylesheet" href="/site-shell.css?v=20260724-brand-v1">
  <link rel="stylesheet" href="/qilylean/daily-briefs.css?v=20260722-daily-v2">
</head>`;
}

function siteHeader() {
  return `<header class="qily-site-header">
  <a class="qily-brand" href="/">QilyLean｜启力精益</a>
  <nav class="site-nav" aria-label="网站导航"><a href="/">首页</a><a href="/knowledge/">知识分享</a></nav>
</header>`;
}

function pageScripts() {
  return `<script src="/site-navigation.js?v=20260724-brand-v1"></script>
<script src="/homepage-music.js?v=20260722-continuous-v3"></script>`;
}

function buildIndex(briefs) {
  const byMonth = new Map();
  briefs.forEach((brief) => {
    const month = brief.date.slice(0, 7);
    if (!byMonth.has(month)) byMonth.set(month, []);
    byMonth.get(month).push(brief);
  });
  const monthNames = { '01': '1月', '02': '2月', '03': '3月', '04': '4月', '05': '5月', '06': '6月', '07': '7月', '08': '8月', '09': '9月', '10': '10月', '11': '11月', '12': '12月' };
  const months = Array.from(byMonth.entries()).map(([month, list], monthIndex) => {
    const cards = list.map((brief, index) => {
      const url = `/qilylean/daily/${brief.date}.html`;
      return `<article class="brief-index-card${monthIndex === 0 && index === 0 ? ' latest' : ''}">
  <div class="brief-index-meta"><time datetime="${brief.date}">${brief.date}</time><span>${escapeHtml(brief.theme)}</span>${brief.dayNo ? `<b>${brief.dayNo}</b>` : ''}</div>
  <h2><a href="${url}">${escapeHtml(brief.title)}</a></h2>
  <div class="brief-index-actions"><a class="brief-open" href="${url}">打开本期简报</a><button type="button" data-brief-url="${baseUrl}${url}" data-brief-title="${escapeHtml(brief.title)}">分享本期网址</button><span class="brief-share-status" aria-live="polite"></span></div>
</article>`;
    }).join('\n');
    const [year, number] = month.split('-');
    return `<details class="brief-month"${monthIndex === 0 ? ' open' : ''}><summary><span>${year}年${monthNames[number]}</span><b>${list.length}期</b></summary><div class="brief-grid">${cards}</div></details>`;
  }).join('\n');
  const latest = briefs[0];
  const earliest = briefs[briefs.length - 1];
  return `${pageHeader('每日工程版简报｜QilyLean', '围绕精益生产、IE、数智化工厂与制造改善持续更新的每日工程版简报目录。', `${baseUrl}/qilylean/daily-insights.html`, 'website')}
<body class="module-page daily-index-page">
${siteHeader()}
<main>
  <section class="daily-hero"><div class="daily-inner"><span>DAILY ENGINEERING BRIEF</span><h1>每日工程版简报</h1><p>按日期选择简报，每次只打开当天内容；每一期都有独立网址，便于针对性分享。</p></div></section>
  <section class="daily-index-section"><div class="daily-inner">
    <div class="daily-index-heading"><div><h2>简报目录</h2><p>${earliest.date}—${latest.date}｜共${briefs.length}期｜按月份收纳、最新优先</p></div><a href="/qilylean/daily/${latest.date}.html">打开最新简报</a></div>
    <div class="brief-months">${months}</div>
  </div></section>
</main>
<footer class="module-footer"><div class="module-inner"><span>丁启利｜每日工程版简报</span><span>精益 · IE · 数智化工厂 · 制造改善</span></div></footer>
<script>
(function(){var legacy=(location.hash||'').slice(1);if(/^\\d{4}-\\d{2}-\\d{2}$/.test(legacy)){location.replace('/qilylean/daily/'+legacy+'.html');return;}function copy(text){if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(text);var area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.left='-9999px';document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();return Promise.resolve();}function mobile(){return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent||'')||!!(window.matchMedia&&window.matchMedia('(pointer: coarse)').matches&&innerWidth<=820);}document.addEventListener('click',function(event){var button=event.target.closest&&event.target.closest('[data-brief-url]');if(!button)return;var url=button.getAttribute('data-brief-url');var title=button.getAttribute('data-brief-title')||document.title;var status=button.parentNode.querySelector('.brief-share-status');function done(text){if(status)status.textContent=text;setTimeout(function(){if(status)status.textContent='';},2200);}if(mobile()&&navigator.share){navigator.share({title:title,text:title,url:url}).then(function(){done('已调起分享');}).catch(function(error){if(error&&error.name==='AbortError')return;copy(url).then(function(){done('网址已复制');});});}else copy(url).then(function(){done('网址已复制');});});})();
</script>
${pageScripts()}
</body>
</html>
`;
}

function buildBriefPage(brief, briefs, index) {
  const older = briefs[index + 1];
  const newer = briefs[index - 1];
  const canonical = `${baseUrl}/qilylean/daily/${brief.date}.html`;
  const article = brief.article.replace(/<button class="share"[^>]*>[^<]*<\/button>/, '<button class="share" type="button">分享本期网址</button>');
  const adjacent = [older ? `<a href="/qilylean/daily/${older.date}.html">← 上一期</a>` : '<span>已是最早一期</span>', '<a class="directory" href="/qilylean/daily-insights.html">返回简报目录</a>', newer ? `<a href="/qilylean/daily/${newer.date}.html">下一期 →</a>` : '<span>已是最新一期</span>'].join('');
  return `${pageHeader(`${brief.title}｜每日工程版简报`, brief.summary, canonical)}
<body class="module-page daily-single-page">
${siteHeader()}
<main>
  <section class="daily-hero compact"><div class="daily-inner"><span>DAILY ENGINEERING BRIEF${brief.dayNo ? ` · ${brief.dayNo}` : ''}</span><h1>每日工程版简报</h1><p>${brief.date}｜${escapeHtml(brief.theme)}</p></div></section>
  <section class="daily-single-section"><div class="daily-inner"><nav class="brief-adjacent top" aria-label="简报翻页">${adjacent}</nav>${article}<nav class="brief-adjacent" aria-label="简报翻页">${adjacent}</nav></div></section>
</main>
<footer class="module-footer"><div class="module-inner"><span>丁启利｜每日工程版简报</span><span>${brief.date} · ${escapeHtml(brief.theme)}</span></div></footer>
<script>
(function(){var button=document.querySelector('.share');if(!button)return;var status=document.querySelector('.status');function copy(text){if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(text);var area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.left='-9999px';document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();return Promise.resolve();}function done(text){if(status)status.textContent=text;setTimeout(function(){if(status)status.textContent='';},2200);}button.addEventListener('click',function(){var url=location.href;var title=document.title;if((/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent||'')||!!(window.matchMedia&&window.matchMedia('(pointer: coarse)').matches&&innerWidth<=820))&&navigator.share){navigator.share({title:title,text:title,url:url}).then(function(){done('已调起分享');}).catch(function(error){if(error&&error.name==='AbortError')return;copy(url).then(function(){done('网址已复制');});});}else copy(url).then(function(){done('网址已复制');});});})();
</script>
${pageScripts()}
</body>
</html>
`;
}

function updateSitemap(briefs) {
  const file = path.join(root, 'sitemap.xml');
  let sitemap = fs.readFileSync(file, 'utf8');
  sitemap = sitemap.replace(/\n  <url><loc>https:\/\/qilylean\.com\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html<\/loc>[\s\S]*?<\/url>/g, '');
  const urls = briefs.map((brief) => `  <url><loc>${baseUrl}/qilylean/daily/${brief.date}.html</loc><lastmod>${brief.date}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`).join('\n');
  sitemap = sitemap.replace(/(  <url><loc>https:\/\/qilylean\.com\/qilylean\/daily-insights\.html<\/loc>[^\n]*<\/url>)/, `$1\n${urls}`);
  fs.writeFileSync(file, sitemap);
}

function main() {
  const recent = collectRecentBriefs();
  const backfill = collectBackfillBriefs();
  const briefs = [...recent, ...backfill].sort((a, b) => b.date.localeCompare(a.date));
  if (briefs.length < 216 || new Set(briefs.map((brief) => brief.date)).size !== briefs.length) {
    throw new Error(`Daily archive has a missing or duplicate date; found ${briefs.length} entries`);
  }
  fs.writeFileSync(path.join(qily, 'daily-insights.html'), buildIndex(briefs));
  briefs.forEach((brief, index) => fs.writeFileSync(path.join(dailyDir, `${brief.date}.html`), buildBriefPage(brief, briefs, index)));
  fs.writeFileSync(path.join(dailyDir, 'index.json'), `${JSON.stringify(briefs.map(({ date, title, summary, dayNo, theme }) => ({ date, title, summary, dayNo, theme })), null, 2)}\n`);
  updateSitemap(briefs);
  process.stdout.write(`Built ${briefs.length} independent daily brief pages.\n`);
}

main();
