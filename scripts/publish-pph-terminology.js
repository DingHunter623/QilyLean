#!/usr/bin/env node
'use strict';

/**
 * R6 permanent PPH terminology source.
 *
 * Why this exists:
 * - PPH and UPPH are different manufacturing metrics and must never be collapsed
 *   by substring search.
 * - The public terminology dictionary, independent OPL, unified metadata, search
 *   index and sitemap are generated assets; this source is re-applied before the
 *   curated publication pipeline rebuilds those assets.
 * - The script is idempotent: running it twice produces no additional diff.
 * - Visible static counts are synchronized here before search-index generation so
 *   crawlers never index a stale 192 snapshot while metadata already says 193.
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const terminologyFile = path.join(root, 'knowledge', 'terminology.html');
const lessonFile = path.join(root, 'knowledge', 'terminology', 'pph.html');
const sitemapFiles = [path.join(root, 'sitemap.xml'), path.join(root, 'sitemap-core.xml')];
const PPH_CODE = '<div class="term-code">PPH</div>';
const UPPH_CODE = '<div class="term-code">UPPH</div>';
const PPH_URL = 'https://qilylean.com/knowledge/terminology/pph.html';

function read(file) { return fs.readFileSync(file, 'utf8'); }
function writeIfChanged(file, value) {
  const next = value.endsWith('\n') ? value : `${value}\n`;
  const current = fs.existsSync(file) ? read(file) : '';
  if (current === next) return false;
  fs.writeFileSync(file, next, 'utf8');
  return true;
}
function assert(condition, message) { if (!condition) throw new Error(message); }

const PPH_CARD = `<article class="term-card" id="term-pph" data-term-card tabindex="0" data-keywords="PPH Parts Per Hour Pieces Per Hour 每小时件数 每小时产量 小时产出 件小时产量 单位时间产出">
  <div class="term-code">PPH</div>
  <div class="term-en">Parts Per Hour / Pieces Per Hour</div>
  <h3>每小时件数／每小时产量（按件计）</h3>
  <p class="term-formula"><strong>计算公式／判定：</strong>PPH＝合格件数 ÷ 实际生产小时。分母只包含时间，不包含投入人数；统计时须明确对象是设备、工序、产线还是班组，以及停线和换型时间口径。</p>
  <p><strong>应用场景：</strong>用于衡量以“件”为计量单位的单位时间产出，常用于小时产能、设备／工序节拍和瓶颈监控。PPH与UPPH不得混用：PPH不除以人数；UPPH＝合格产出 ÷（直接人力 × 实际生产小时），用于评价人工投入后的单位人工小时产出。若产品计量单位不是“件”，优先使用UPH作为通用单位时间产出。</p>
  <div class="term-opl-actions"><a class="term-opl-open" href="/knowledge/terminology/pph.html"><span class="term-opl-open-label-v9">查看单点培训课件</span></a></div>
</article>`;

function insertPphCard(html) {
  if (html.includes(PPH_CODE)) return html;
  const marker = html.indexOf(UPPH_CODE);
  assert(marker >= 0, 'UPPH source card not found; cannot place PPH beside its comparison metric.');
  const articleStart = html.lastIndexOf('<article', marker);
  const articleEndStart = html.indexOf('</article>', marker);
  assert(articleStart >= 0 && articleEndStart >= 0, 'UPPH article boundary is invalid.');
  const insertAt = articleEndStart + '</article>'.length;
  return `${html.slice(0, insertAt)}\n${PPH_CARD}${html.slice(insertAt)}`;
}

function hardenTerminologySearch(html) {
  const unsafe = "if(f.code.indexOf(q)>=0||cc.indexOf(qc)>=0)return 800;";
  const safe = "if(!/^[a-z0-9][a-z0-9.+#&-]{1,15}$/i.test(q)&&(f.code.indexOf(q)>=0||cc.indexOf(qc)>=0))return 800;";
  if (html.includes(unsafe)) return html.replace(unsafe, safe);
  if (html.includes(safe)) return html;
  throw new Error('Terminology search matcher drifted; R6 acronym false-positive guard could not be materialized.');
}

function terminologyTotal(html) {
  let total = (html.match(/<article\b[^>]*\bdata-term-card\b[^>]*>/gi) || []).length;
  if (html.includes('terminology-sponsor-v1.js') && !/<div class="term-code">Sponsor<\/div>/i.test(html)) total += 1;
  assert(total > 0, 'Unable to calculate terminology total after PPH materialization.');
  return total;
}

function synchronizeVisibleCounts(html) {
  const total = terminologyTotal(html);
  html = html.replace(
    /(<p id="qilyTerminologyStaticCount"[^>]*>[\s\S]*?<strong[^>]*>当前术语库：<\/strong>)\s*\d+\s*项术语\s*·\s*\d+\s*份单点培训课件。/,
    `$1${total} 项术语 · ${total} 份单点培训课件。`
  );
  html = html.replace(
    /(<div class="term-count" id="termCount"[^>]*>)共收录\s*\d+\s*项术语\s*·\s*\d+\s*份单点培训课件(<\/div>)/,
    `$1共收录 ${total} 项术语 · ${total} 份单点培训课件$2`
  );
  return { html, total };
}

function ensureSitemap(file) {
  if (!fs.existsSync(file)) return false;
  let xml = read(file);
  if (xml.includes(PPH_URL)) return false;
  assert(xml.includes('</urlset>'), `${path.basename(file)} has no urlset closing tag.`);
  const node = `  <url><loc>${PPH_URL}</loc><lastmod>2026-08-26</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n`;
  xml = xml.replace('</urlset>', `${node}</urlset>`);
  return writeIfChanged(file, xml);
}

function validate(html, total) {
  assert(html.includes(PPH_CODE), 'PPH static terminology card is missing.');
  assert(html.includes('Parts Per Hour / Pieces Per Hour'), 'PPH English definition is missing.');
  assert(html.includes('PPH与UPPH不得混用'), 'PPH/UPPH boundary statement is missing.');
  assert(html.includes('href="/knowledge/terminology/pph.html"'), 'PPH independent lesson link is missing.');
  assert(!html.includes("if(f.code.indexOf(q)>=0||cc.indexOf(qc)>=0)return 800;"), 'Unsafe acronym suffix matching is still present.');
  assert(html.includes(`当前术语库：</strong>${total} 项术语 · ${total} 份单点培训课件。`), 'Static terminology summary count is stale.');
  assert(html.includes(`共收录 ${total} 项术语 · ${total} 份单点培训课件`), 'Search-toolbar terminology count is stale.');
  assert(fs.existsSync(lessonFile), 'Independent PPH OPL page is missing.');
  const lesson = read(lessonFile);
  assert(lesson.includes('PPH｜每小时件数'), 'PPH OPL title is invalid.');
  assert(lesson.includes('PPH＝合格件数 ÷ 实际生产小时'), 'PPH OPL formula is missing.');
}

let terminology = read(terminologyFile);
terminology = insertPphCard(terminology);
terminology = hardenTerminologySearch(terminology);
const synchronized = synchronizeVisibleCounts(terminology);
terminology = synchronized.html;
const terminologyChanged = writeIfChanged(terminologyFile, terminology);
const sitemapChanges = sitemapFiles.map(ensureSitemap).filter(Boolean).length;
validate(read(terminologyFile), synchronized.total);

process.stdout.write(`PPH terminology source materialized: terminology changed ${terminologyChanged}, total ${synchronized.total}, sitemap files changed ${sitemapChanges}.\n`);
