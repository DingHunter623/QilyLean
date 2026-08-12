#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { careerTimeline } = require('./daily-engineering-archive');

const root = path.resolve(__dirname, '..');
const directoryPath = path.join(root, 'qilylean', 'daily-insights.html');
const curatorPath = path.join(root, 'scripts', 'curate-weekly-briefs.js');
const START = '<!-- QILY-DAILY-CAREER-TIMELINE:START -->';
const END = '<!-- QILY-DAILY-CAREER-TIMELINE:END -->';
const SCRIPT_START = '<!-- QILY-DAILY-CAREER-YEAR-FILTER:START -->';
const SCRIPT_END = '<!-- QILY-DAILY-CAREER-YEAR-FILTER:END -->';

function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[ch]);
}

function section() {
  const rows = careerTimeline.map((item) => `<tr><td><a class="career-year-link" href="/qilylean/daily-insights.html?year=${esc(item.year)}#brief-directory" data-year-filter="${esc(item.year)}" aria-label="查看${esc(item.year)}年精选简报">${esc(item.year)}年</a></td><td>${esc(item.field)}</td></tr>`).join('');
  return `${START}\n<section class="engineering-checklist career-track" aria-labelledby="careerTrackTitle">\n  <h2 id="careerTrackTitle">主要项目履历</h2>\n  <p>以下按最近至最早汇总制造项目领域；精选简报贯通PE、IE、NPI、ME、精益运营与项目交付方法。</p>\n  <table class="rule-table career-table"><colgroup><col class="career-year-col"><col></colgroup><thead><tr><th>年份</th><th>主要制造项目</th></tr></thead><tbody>${rows}</tbody></table>\n</section>\n${END}`;
}

function yearFilterScript() {
  return `${SCRIPT_START}\n<script>(function(){var params=new URLSearchParams(location.search),year=(params.get('year')||'').trim(),input=document.getElementById('briefSearch'),grid=document.getElementById('briefCuratedGrid'),status=document.getElementById('briefFilterStatus');if(!grid)return;var cards=Array.prototype.slice.call(grid.querySelectorAll('.brief-index-card'));function apply(){var q=(input&&input.value||'').trim().toLocaleLowerCase('zh-CN'),n=0;cards.forEach(function(card){var d=card.getAttribute('data-date')||'',s=(card.getAttribute('data-search')||'').toLocaleLowerCase('zh-CN'),hitYear=!year||d.indexOf(year+'-')===0,hitSearch=!q||s.includes(q),hit=hitYear&&hitSearch;card.hidden=!hit;if(hit)n+=1;});document.querySelectorAll('[data-year-filter]').forEach(function(link){var active=!!year&&link.getAttribute('data-year-filter')===year;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');});if(status){if(year&&q)status.innerHTML=year+'年｜找到 '+n+' 篇相关精选　<a href="/qilylean/daily-insights.html#brief-directory">查看全部年份</a>';else if(year)status.innerHTML=year+'年｜当前 '+n+' 篇精选　<a href="/qilylean/daily-insights.html#brief-directory">查看全部年份</a>';else status.textContent=q?'找到 '+n+' 篇相关精选':'当前 '+cards.length+' 篇精选';}}if(input)input.addEventListener('input',apply);apply();})();</script>\n${SCRIPT_END}`;
}

function patchDirectory() {
  let html = fs.readFileSync(directoryPath, 'utf8');
  html = html.replace(new RegExp(`${START}[\\s\\S]*?${END}\\s*`, 'g'), '');
  html = html.replace(new RegExp(`${SCRIPT_START}[\\s\\S]*?${SCRIPT_END}\\s*`, 'g'), '');
  const anchor = '<div class="brief-directory-tools" id="brief-directory">';
  if (!html.includes(anchor)) throw new Error('brief directory anchor not found');
  html = html.replace(anchor, `${section()}\n${anchor}`);
  html = html.replace('</body></html>', `${yearFilterScript()}\n</body></html>`);
  fs.writeFileSync(directoryPath, html, 'utf8');
}

function patchCurator() {
  let source = fs.readFileSync(curatorPath, 'utf8');
  if (!source.includes("require('./daily-engineering-archive')")) {
    source = source.replace(
      "const path = require('path');",
      "const path = require('path');\nconst { careerTimeline } = require('./daily-engineering-archive');"
    );
  }

  if (!source.includes('function buildCareerTimeline()')) {
    const marker = 'function buildDirectory(records) {';
    const helper = [
      'function buildCareerTimeline() {',
      '  const rows = careerTimeline.map((item) => \'<tr><td><a class="career-year-link" href="/qilylean/daily-insights.html?year=\' + esc(item.year) + \'#brief-directory" data-year-filter="\' + esc(item.year) + \'" aria-label="查看\' + esc(item.year) + \'年精选简报">\' + esc(item.year) + \'年</a></td><td>\' + esc(item.field) + \'</td></tr>\').join(\'\');',
      '  return \'<section class="engineering-checklist career-track" aria-labelledby="careerTrackTitle"><h2 id="careerTrackTitle">主要项目履历</h2><p>以下按最近至最早汇总制造项目领域；精选简报贯通PE、IE、NPI、ME、精益运营与项目交付方法。</p><table class="rule-table career-table"><colgroup><col class="career-year-col"><col></colgroup><thead><tr><th>年份</th><th>主要制造项目</th></tr></thead><tbody>\' + rows + \'</tbody></table></section>\';',
      '}',
      ''
    ].join('\n');
    if (!source.includes(marker)) throw new Error('curator buildDirectory marker not found');
    source = source.replace(marker, helper + '\n' + marker);
  }

  if (!source.includes('${buildCareerTimeline()}')) {
    const admission = '<div class="engineering-checklist"><strong>内容准入：</strong>制造专业相关性、工程逻辑与数据、问题到结果闭环、证据与边界、原创复用价值、检索培训价值。低信息密度、模板化重复和泛职场内容不作为公开简报资产。</div>';
    if (!source.includes(admission)) throw new Error('curator admission anchor not found');
    source = source.replace(admission, admission + '\n${buildCareerTimeline()}');
  }

  fs.writeFileSync(curatorPath, source, 'utf8');
}

patchDirectory();
patchCurator();

const directory = fs.readFileSync(directoryPath, 'utf8');
const curator = fs.readFileSync(curatorPath, 'utf8');
for (const item of careerTimeline) {
  if (!directory.includes(`${item.year}年`) || !directory.includes(item.field)) throw new Error(`directory timeline missing ${item.year}`);
}
if (!directory.includes('id="careerTrackTitle"') || !directory.includes('data-year-filter="2026"')) throw new Error('career timeline not restored');
if (!curator.includes('function buildCareerTimeline()') || !curator.includes('${buildCareerTimeline()}')) throw new Error('weekly curator persistence guard missing');
console.log(`Restored curated brief career timeline: ${careerTimeline.length} yearly manufacturing project rows; weekly curator persistence enabled.`);
