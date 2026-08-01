#!/usr/bin/env node
'use strict';

/**
 * QilyLean Daily Brief terminology gate
 *
 * Rules:
 * 1. Every newly published Daily Engineering Brief is scanned for visible
 *    technical acronyms and English/CamelCase terms with a Chinese explanation.
 * 2. A term must already exist in the unified terminology dictionary or have an
 *    independent terminology lesson page before the brief can pass publication.
 * 3. Known independent terms are linked in the brief, and explicitly explained
 *    terms are surfaced in a “本期术语” reading note.
 * 4. Any uncovered term fails the workflow, preventing a brief from being
 *    published without its dictionary entry, OPL lesson, search index and sitemap.
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dailyDir = path.join(root, 'qilylean', 'daily');
const indexPath = path.join(dailyDir, 'index.json');
const terminologyPath = path.join(root, 'knowledge', 'terminology.html');
const terminologyDir = path.join(root, 'knowledge', 'terminology');
const reportPath = path.join(dailyDir, 'terminology-audit-latest.json');

const UI_ALLOWLIST = new Set([
  'DAILY', 'ENGINEERING', 'BRIEF', 'SINGLE', 'POINT', 'LESSON',
  'QilyLean', 'PPT', 'PDF', 'DOC', 'DOCX', 'HTML', 'CSS', 'SVG',
  'URL', 'QR', 'V1', 'V2', 'MESSAGE', 'DISCUSSION'
]);

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, value) {
  fs.writeFileSync(file, value.endsWith('\n') ? value : `${value}\n`, 'utf8');
}

function latestBriefDate() {
  if (fs.existsSync(indexPath)) {
    const data = JSON.parse(read(indexPath));
    if (Array.isArray(data) && data[0] && /^\d{4}-\d{2}-\d{2}$/.test(data[0].date || '')) {
      return data[0].date;
    }
  }
  const dates = fs.readdirSync(dailyDir)
    .map((name) => name.match(/^(\d{4}-\d{2}-\d{2})\.html$/))
    .filter(Boolean)
    .map((match) => match[1])
    .sort()
    .reverse();
  if (!dates.length) throw new Error('No Daily Engineering Brief page was found.');
  return dates[0];
}

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function visibleBodyText(html) {
  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch ? bodyMatch[1] : html;
  body = body
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  return decodeEntities(body).replace(/\s+/g, ' ').trim();
}

function normalizeTerm(term) {
  return term.trim().replace(/[‐‑‒–—]/g, '-');
}

function extractCandidates(text) {
  const candidates = new Map();

  // English/CamelCase terminology explicitly explained in Chinese parentheses.
  const explainedPattern = /\b([A-Z][A-Za-z0-9]*(?:[-/][A-Za-z0-9]+)*)\s*[（(]([^）)]{2,40})[）)]/g;
  for (const match of text.matchAll(explainedPattern)) {
    const term = normalizeTerm(match[1]);
    if (UI_ALLOWLIST.has(term)) continue;
    candidates.set(term, {
      term,
      explanation: match[2].trim(),
      explicit: true,
      source: match[0]
    });
  }

  // Common manufacturing / engineering acronyms. Slash groups are split so
  // ERP/MES/APS is checked as three independently governed terms.
  const acronymPattern = /\b(?:[A-Z]{2,10}|[A-Z]\d{1,3})(?:\/(?:[A-Z]{2,10}|[A-Z]\d{1,3}))*\b/g;
  for (const match of text.matchAll(acronymPattern)) {
    for (const raw of match[0].split('/')) {
      const term = normalizeTerm(raw);
      if (UI_ALLOWLIST.has(term)) continue;
      if (!candidates.has(term)) {
        candidates.set(term, {
          term,
          explanation: '',
          explicit: false,
          source: match[0]
        });
      }
    }
  }

  return [...candidates.values()].sort((a, b) => a.term.localeCompare(b.term, 'en'));
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripHtml(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')).trim();
}

function buildTerminologyIndex() {
  const dictionaryHtml = read(terminologyPath);
  const dictionaryText = stripHtml(dictionaryHtml);
  const standalone = new Map();

  if (fs.existsSync(terminologyDir)) {
    for (const name of fs.readdirSync(terminologyDir).filter((item) => item.endsWith('.html'))) {
      const file = path.join(terminologyDir, name);
      const html = read(file);
      const title = stripHtml((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '');
      const heading = stripHtml((html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '');
      const label = heading || title;
      const code = normalizeTerm((label.split('｜')[0] || '').trim());
      if (!code) continue;
      standalone.set(code, {
        term: code,
        label: label.replace(/｜单点培训课件[\s\S]*$/i, '').trim(),
        url: `/knowledge/terminology/${name}`
      });
    }
  }

  function known(term) {
    if (standalone.has(term)) return true;
    const expression = new RegExp(`(^|[^A-Za-z0-9])${escapeRegex(term)}([^A-Za-z0-9]|$)`, 'i');
    return expression.test(dictionaryText) || expression.test(dictionaryHtml);
  }

  return { dictionaryHtml, dictionaryText, standalone, known };
}

function linkIndependentTerms(html, candidates, standalone) {
  const linkable = candidates
    .filter((item) => standalone.has(item.term))
    .sort((a, b) => b.term.length - a.term.length);
  if (!linkable.length) return { html, linked: [] };

  const tokens = html.split(/(<[^>]+>)/g);
  const blockedStack = [];
  const linked = new Set();
  const blockedTags = new Set(['a', 'script', 'style', 'svg', 'code', 'pre', 'title']);

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.startsWith('<')) {
      const close = token.match(/^<\/\s*([a-z0-9-]+)/i);
      const open = token.match(/^<\s*([a-z0-9-]+)/i);
      if (close) {
        const tag = close[1].toLowerCase();
        const position = blockedStack.lastIndexOf(tag);
        if (position >= 0) blockedStack.splice(position, 1);
      } else if (open && !/\/\s*>$/.test(token)) {
        const tag = open[1].toLowerCase();
        if (blockedTags.has(tag)) blockedStack.push(tag);
      }
      continue;
    }
    if (blockedStack.length) continue;

    let text = token;
    for (const item of linkable) {
      if (linked.has(item.term)) continue;
      const meta = standalone.get(item.term);
      const expression = new RegExp(`(^|[^A-Za-z0-9])(${escapeRegex(item.term)})(?=[^A-Za-z0-9]|$)`);
      if (!expression.test(text)) continue;
      text = text.replace(
        expression,
        `$1<a class="daily-term-link" href="${meta.url}" title="${meta.label}">$2</a>`
      );
      linked.add(item.term);
    }
    tokens[index] = text;
  }

  return { html: tokens.join(''), linked: [...linked] };
}

function injectFeaturedTermNote(html, date, candidates, standalone) {
  const start = '<!-- QILY-DAILY-TERMINOLOGY:START -->';
  const end = '<!-- QILY-DAILY-TERMINOLOGY:END -->';
  const oldBlock = new RegExp(`${escapeRegex(start)}[\\s\\S]*?${escapeRegex(end)}\\s*`, 'g');
  html = html.replace(oldBlock, '');

  const featured = candidates.filter((item) => item.explicit || standalone.has(item.term));
  if (!featured.length) return { html, featured: [] };

  const links = featured.map((item) => {
    const meta = standalone.get(item.term);
    const url = meta ? meta.url : `/knowledge/terminology.html?opl=${encodeURIComponent(item.term)}`;
    const label = item.explanation
      ? `${item.term}｜${item.explanation}`
      : (meta ? meta.label : item.term);
    return `<a href="${url}">${label}</a>`;
  });

  const block = [
    start,
    `<div class="checklist brief-terminology-audit" data-daily-terminology-audit="${date}">`,
    `<strong>本期术语：</strong>${links.join('；')}。点击进入中文诠释与单点培训课件。`,
    '</div>',
    end
  ].join('\n');

  const anchor = /(<div class="quote">[\s\S]*?<\/div>)/i;
  if (anchor.test(html)) {
    html = html.replace(anchor, `$1\n${block}`);
  } else {
    const contentStart = /(<div class="content">)/i;
    if (!contentStart.test(html)) throw new Error('Cannot locate the Daily Brief content container.');
    html = html.replace(contentStart, `$1\n${block}`);
  }
  return { html, featured: featured.map((item) => item.term) };
}

function main() {
  const date = latestBriefDate();
  const briefPath = path.join(dailyDir, `${date}.html`);
  let html = read(briefPath);
  const visibleText = visibleBodyText(html);
  const candidates = extractCandidates(visibleText);
  const terminology = buildTerminologyIndex();

  const knownTerms = candidates.filter((item) => terminology.known(item.term));
  const unknownTerms = candidates.filter((item) => !terminology.known(item.term));

  const report = {
    schemaVersion: 1,
    briefDate: date,
    briefPath: path.relative(root, briefPath).replace(/\\/g, '/'),
    checkedAt: new Date().toISOString(),
    candidates,
    coveredTerms: knownTerms.map((item) => item.term),
    unknownTerms: unknownTerms.map((item) => item.term),
    rule: '今日简报发布前必须完成新术语的中文诠释、独立课件／词典收录、搜索索引及Sitemap同步；存在未收录术语时阻断发布。'
  };

  if (unknownTerms.length) {
    write(reportPath, JSON.stringify(report, null, 2));
    console.error(`Terminology audit failed for ${date}. Uncovered terms: ${unknownTerms.map((item) => item.term).join(', ')}`);
    console.error('Add each term to the unified terminology dictionary and OPL lesson before publishing the brief.');
    process.exit(1);
  }

  const linkedResult = linkIndependentTerms(html, candidates, terminology.standalone);
  const noteResult = injectFeaturedTermNote(linkedResult.html, date, candidates, terminology.standalone);
  html = noteResult.html;

  report.linkedTerms = linkedResult.linked;
  report.featuredTerms = noteResult.featured;
  report.status = 'passed';

  write(briefPath, html);
  write(reportPath, JSON.stringify(report, null, 2));
  console.log(`Daily terminology audit passed for ${date}: ${knownTerms.length} covered term(s), ${linkedResult.linked.length} independent lesson link(s).`);
}

main();
