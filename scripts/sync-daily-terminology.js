#!/usr/bin/env node
'use strict';

/**
 * Synchronize the "本期术语" quick-reading note across every Daily Brief.
 *
 * The latest-brief publication gate remains in audit-daily-terminology.js.
 * This companion pass is intentionally non-destructive: it only surfaces
 * terminology already present in the unified dictionary or an independent
 * lesson page, then validates that every dated brief has exactly one dated note.
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dailyDir = path.join(root, 'qilylean', 'daily');
const terminologyPath = path.join(root, 'knowledge', 'terminology.html');
const terminologyDir = path.join(root, 'knowledge', 'terminology');
const checkOnly = process.argv.includes('--check');

const START = '<!-- QILY-DAILY-TERMINOLOGY:START -->';
const END = '<!-- QILY-DAILY-TERMINOLOGY:END -->';
const EXCLUDED_CODES = new Set([
  'QilyLean', 'PPT', 'PPT/PPTX', 'PDF', 'DOC', 'DOCX', 'HTML', 'CSS',
  'SVG', 'URL', 'QR', 'V1', 'V2'
]);

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, value) {
  fs.writeFileSync(file, value.endsWith('\n') ? value : `${value}\n`, 'utf8');
}

function decodeEntities(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function stripHtml(value) {
  return decodeEntities(String(value || '')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

function escapeRegex(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalize(value) {
  return decodeEntities(stripHtml(value)).normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function datedBriefFiles() {
  return fs.readdirSync(dailyDir)
    .filter((name) => /^\d{4}-\d{2}-\d{2}\.html$/.test(name))
    .sort();
}

function cardTerms() {
  const page = read(terminologyPath);
  const terms = [];
  const pattern = /<article class="term-card"[^>]*>[\s\S]*?<div class="term-code">([\s\S]*?)<\/div>[\s\S]*?<div class="term-en">([\s\S]*?)<\/div>[\s\S]*?<h3>([\s\S]*?)<\/h3>[\s\S]*?<\/article>/gi;
  for (const match of page.matchAll(pattern)) {
    const code = normalize(match[1]);
    const english = normalize(match[2]);
    const chinese = normalize(match[3]);
    if (!code || EXCLUDED_CODES.has(code)) continue;
    terms.push({
      code,
      english,
      chinese,
      url: `/knowledge/terminology.html?opl=${encodeURIComponent(code)}`,
      aliases: buildAliases(code, chinese)
    });
  }
  return terms;
}

function standaloneTerms() {
  const terms = [];
  if (!fs.existsSync(terminologyDir)) return terms;
  for (const name of fs.readdirSync(terminologyDir).filter((item) => item.endsWith('.html'))) {
    const page = read(path.join(terminologyDir, name));
    const title = normalize((page.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]);
    const heading = normalize((page.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]);
    const label = heading || title;
    const parts = label.split('｜').map((item) => item.trim()).filter(Boolean);
    const code = parts[0] || '';
    const chinese = (parts[1] || '').replace(/单点培训课件[\s\S]*$/i, '').trim();
    if (!code || EXCLUDED_CODES.has(code)) continue;
    terms.push({
      code,
      english: '',
      chinese,
      url: `/knowledge/terminology/${name}`,
      aliases: buildAliases(code, chinese)
    });
  }
  return terms;
}

function buildAliases(code, chinese) {
  const aliases = new Set([code]);
  for (const value of String(chinese || '').split(/[／/、；;]/)) {
    const alias = value.replace(/[（(][^）)]*[）)]/g, '').trim();
    if (alias.length >= 3) aliases.add(alias);
  }
  if (String(chinese || '').trim().length >= 3) aliases.add(String(chinese).trim());
  return [...aliases].sort((a, b) => b.length - a.length);
}

function terminologyIndex() {
  const merged = new Map();
  for (const term of [...cardTerms(), ...standaloneTerms()]) {
    const key = term.code.toLocaleLowerCase('en');
    if (merged.has(key)) {
      const prior = merged.get(key);
      merged.set(key, {
        ...prior,
        ...term,
        chinese: term.chinese || prior.chinese,
        aliases: [...new Set([...prior.aliases, ...term.aliases])]
      });
    } else {
      merged.set(key, term);
    }
  }
  if (!merged.size) throw new Error('Unified terminology dictionary produced no readable terms.');
  return [...merged.values()];
}

function removeExistingNote(html) {
  const marked = new RegExp(`[\\t ]*(?:\\r?\\n)?${escapeRegex(START)}[\\s\\S]*?${escapeRegex(END)}[\\t ]*(?:\\r?\\n)?`, 'g');
  let next = html.replace(marked, '');
  next = next.replace(/<div class="checklist brief-terminology-audit"\b[^>]*>[\s\S]*?<\/div>\s*/gi, '');
  return next;
}

function articleParts(html) {
  const articleMatch = html.match(/<article\b[^>]*class="[^"]*\bpost\b[^"]*"[^>]*>([\s\S]*?)<\/article>/i);
  const article = articleMatch ? articleMatch[1] : html;
  const title = stripHtml((article.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i) || [])[1]);
  const dateLine = stripHtml((article.match(/<div class="date"[^>]*>([\s\S]*?)<\/div>/i) || [])[1]);
  const firstParagraph = stripHtml((article.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i) || [])[1]);
  const quote = stripHtml((article.match(/<div class="quote"[^>]*>([\s\S]*?)<\/div>/i) || [])[1]);
  return {
    articleText: stripHtml(article),
    priorityText: [title, dateLine, firstParagraph, quote].filter(Boolean).join(' '),
    title,
    theme: dateLine.includes('｜') ? dateLine.split('｜').slice(1).join('｜').trim() : title
  };
}

function asciiCount(text, alias) {
  const expression = new RegExp(`(^|[^A-Za-z0-9])${escapeRegex(alias)}(?=[^A-Za-z0-9]|$)`, 'gi');
  return [...text.matchAll(expression)].length;
}

function textCount(text, alias) {
  if (!alias) return 0;
  if (/^[A-Za-z0-9][A-Za-z0-9 +./_-]*$/.test(alias)) return asciiCount(text, alias);
  let count = 0;
  let offset = 0;
  while ((offset = text.indexOf(alias, offset)) >= 0) {
    count += 1;
    offset += alias.length;
  }
  return count;
}

function matchTerms(parts, terms) {
  const explainedCodes = new Set();
  const explainedPattern = /\b([A-Z][A-Za-z0-9]*(?:[-/+][A-Za-z0-9]+)*)\s*[（(][^）)]{2,40}[）)]/g;
  for (const match of parts.articleText.matchAll(explainedPattern)) {
    explainedCodes.add(match[1].normalize('NFKC').toLocaleLowerCase('en'));
  }
  const matches = [];
  for (const term of terms) {
    let priorityHits = 0;
    let position = Number.MAX_SAFE_INTEGER;
    for (const alias of term.aliases) {
      priorityHits = Math.max(priorityHits, textCount(parts.priorityText, alias));
      const priorityPosition = parts.priorityText.indexOf(alias);
      if (priorityPosition >= 0) position = Math.min(position, priorityPosition);
    }
    const explained = explainedCodes.has(term.code.toLocaleLowerCase('en'));
    if (!priorityHits && !explained) continue;
    if (explained && position === Number.MAX_SAFE_INTEGER) {
      position = parts.articleText.toLocaleLowerCase('en').indexOf(term.code.toLocaleLowerCase('en'));
    }
    matches.push({
      ...term,
      position,
      score: (explained ? 2000 : 0) + (priorityHits ? 1000 : 0) + Math.min(priorityHits, 3) * 120
    });
  }
  return matches
    .sort((a, b) => b.score - a.score || a.position - b.position || a.code.localeCompare(b.code, 'en'))
    .slice(0, 6);
}

function noteBlock(date, parts, matched) {
  let links;
  if (matched.length) {
    links = matched.map((term) => {
      const label = term.chinese ? `${term.code}｜${term.chinese}` : term.code;
      return `<a href="${term.url}">${escapeHtml(label)}</a>`;
    });
  } else {
    const theme = parts.theme || parts.title || '本期主题';
    links = [`<a href="/knowledge/terminology.html?term=${encodeURIComponent(theme)}">${escapeHtml(theme)}｜本期主题</a>`];
  }
  return [
    START,
    `<div class="checklist brief-terminology-audit" data-daily-terminology-audit="${date}">`,
    `<strong>本期术语：</strong>${links.join('；')}。点击进入中文诠释与单点培训课件。`,
    '</div>',
    END
  ].join('\n');
}

function injectNote(html, block, date) {
  const quote = /(<div class="quote"[^>]*>[\s\S]*?<\/div>)/i;
  if (quote.test(html)) return html.replace(quote, `$1\n${block}\n`);
  const firstParagraph = /(<div class="content"[^>]*>[\s\S]*?<p\b[^>]*>[\s\S]*?<\/p>)/i;
  if (firstParagraph.test(html)) return html.replace(firstParagraph, `$1\n${block}\n`);
  const articleFirstParagraph = /(<article\b[^>]*class="[^"]*\bpost\b[^"]*"[^>]*>[\s\S]*?<p\b[^>]*>[\s\S]*?<\/p>)/i;
  if (articleFirstParagraph.test(html)) return html.replace(articleFirstParagraph, `$1\n${block}\n`);
  const contentStart = /(<div class="content"[^>]*>)/i;
  if (contentStart.test(html)) return html.replace(contentStart, `$1\n${block}\n`);
  throw new Error(`${date}: cannot locate a Daily Brief content insertion point.`);
}

function assertSynchronized(html, date) {
  const starts = (html.match(/QILY-DAILY-TERMINOLOGY:START/g) || []).length;
  const ends = (html.match(/QILY-DAILY-TERMINOLOGY:END/g) || []).length;
  if (starts !== 1 || ends !== 1) throw new Error(`${date}: expected exactly one terminology note.`);
  if (!html.includes(`data-daily-terminology-audit="${date}"`)) {
    throw new Error(`${date}: terminology note date is missing or mismatched.`);
  }
  const block = html.match(/QILY-DAILY-TERMINOLOGY:START[\s\S]*?QILY-DAILY-TERMINOLOGY:END/);
  if (!block || !/<a href="\/knowledge\/terminology(?:\.html|\/)/.test(block[0])) {
    throw new Error(`${date}: terminology note has no dictionary or lesson link.`);
  }
  if (!block[0].includes('点击进入中文诠释与单点培训课件')) {
    throw new Error(`${date}: terminology reading guidance is missing.`);
  }
}

function main() {
  const files = datedBriefFiles();
  const terms = terminologyIndex();
  if (!files.length) throw new Error('No dated Daily Brief pages were found.');

  let changed = 0;
  let matchedPages = 0;
  let fallbackPages = 0;
  let preservedPages = 0;
  const stale = [];

  for (const name of files) {
    const date = name.replace(/\.html$/, '');
    const file = path.join(dailyDir, name);
    const original = read(file);
    try {
      assertSynchronized(original, date);
      preservedPages += 1;
      continue;
    } catch (error) {
      // Missing or stale notes are rebuilt below; unrelated page content is preserved.
    }
    const clean = removeExistingNote(original);
    const parts = articleParts(clean);
    const matched = matchTerms(parts, terms);
    const next = injectNote(clean, noteBlock(date, parts, matched), date);
    assertSynchronized(next, date);
    if (matched.length) matchedPages += 1;
    else fallbackPages += 1;
    if (next !== original) {
      changed += 1;
      stale.push(name);
      if (!checkOnly) write(file, next);
    }
  }

  if (checkOnly && stale.length) {
    console.error(`Historical Daily Brief terminology sync is stale on ${stale.length} page(s).`);
    console.error(stale.slice(0, 20).join(', '));
    process.exit(1);
  }

  console.log(`Daily terminology sync ${checkOnly ? 'validated' : 'completed'}: ${files.length} page(s), ${changed} changed, ${preservedPages} already current, ${matchedPages} dictionary-matched, ${fallbackPages} theme fallback.`);
}

main();
