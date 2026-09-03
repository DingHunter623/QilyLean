#!/usr/bin/env node
'use strict';

/* QilyLean Daily Brief Layout Guard materializer V1｜2026-09-03
 * Installs one final shared layout/readability stylesheet on every dated Selected Brief page.
 * Business copy and media assets are not modified.
 * Section sequence markers are intentionally removed: no 01/02/03 badges and no 一、二、三 pseudo numbering.
 * 2026-09-03: re-materialize after isolating unrelated stale DDZ regression gating.
 * 2026-09-03: preserve the central "精益交付力" soul marker as an intentional VI gold semantic accent.
 */
const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const ROOT=path.resolve(__dirname,'..');
const checkOnly=process.argv.includes('--check');
const ID='qilyDailyBriefLayoutGuardV1';
const HREF='/site-daily-brief-layout-guard-v1.css?v=20260902-daily-brief-light-surface-v2';
const TAG=`<link id="${ID}" rel="stylesheet" href="${HREF}">`;
const SEQUENCE_OFF_ID='qilyDailyBriefSequenceOffV1';
const SEQUENCE_OFF_STYLE=`<style id="${SEQUENCE_OFF_ID}">
html body.daily-single-page[data-qily-daily-layout="rich"] main article.post .lean-delivery-brief .section-title>.no{display:none!important}
html body.daily-single-page[data-qily-daily-layout="rich"] main article.post .lean-delivery-brief .section-title h3::before{content:none!important;display:none!important}
html body.daily-single-page[data-qily-daily-layout="rich"] main article.post .lean-delivery-brief .mind-core span{color:#ffe3a0!important;-webkit-text-fill-color:#ffe3a0!important}
html body.daily-single-page[data-qily-daily-layout="rich"] main article.post .lean-delivery-brief .mind-core strong{color:#f2b544!important;-webkit-text-fill-color:#f2b544!important;text-shadow:none!important}
</style>`;
const DATED=/^qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html$/i;

function files(){return execFileSync('git',['ls-files','qilylean/daily/*.html'],{cwd:ROOT,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean).filter(x=>DATED.test(x))}
function install(html,rel){
  let out=html.replace(/\s*<link\b[^>]*(?:id=["']qilyDailyBriefLayoutGuardV1["']|href=["'][^"']*\/site-daily-brief-layout-guard-v1\.css(?:\?v=[^"']*)?["'])[^>]*>\s*/gi,'\n');
  out=out.replace(/\s*<style\b[^>]*id=["']qilyDailyBriefSequenceOffV1["'][^>]*>[\s\S]*?<\/style>\s*/gi,'\n');
  out=out.replace(/(<div\b[^>]*class=["'][^"']*\bsection-title\b[^"']*["'][^>]*>)\s*<span\b[^>]*class=["'][^"']*\bno\b[^"']*["'][^>]*>\s*\d{1,3}\s*<\/span>/gi,'$1');
  if(!/<\/head>/i.test(out))throw new Error(`${rel}: missing </head>`);
  return out.replace(/<\/head>/i,`${TAG}\n${SEQUENCE_OFF_STYLE}\n</head>`);
}

const changed=[];
let count=0;
for(const rel of files()){
  const abs=path.join(ROOT,rel);const html=fs.readFileSync(abs,'utf8');const next=install(html,rel);count+=1;
  if(next!==html){changed.push(rel);if(!checkOnly)fs.writeFileSync(abs,next,'utf8')}
}
if(count<350)throw new Error(`Unexpected dated Selected Brief coverage: ${count}`);
if(checkOnly&&changed.length)throw new Error(`Daily Brief layout guard is stale on ${changed.length} page(s): ${changed.slice(0,20).join(', ')}`);

const css=fs.readFileSync(path.join(ROOT,'site-daily-brief-layout-guard-v1.css'),'utf8');
[
  '.daily-single-section .post',
  'align-items:start!important',
  '.daily-single-section .visual',
  'background:transparent!important',
  'grid-template-columns:minmax(230px,230px) repeat(20,minmax(46px,46px))!important',
  '.npi-gantt-week',
  'white-space:nowrap!important',
  '.npi-gantt-label',
  'overflow-wrap:anywhere!important',
  'article.post .tags>.tag',
  '-webkit-text-fill-color:#0f4b5a!important',
  'article.post>.visual>svg>rect:first-child',
  ':is(.visual-hero,.hero,.closing,.closing-view)',
  'background-image:none!important',
  'backdrop-filter:none!important',
  'counter-reset:qily-brief-section',
  'counter-increment:qily-brief-section',
  '.lean-delivery-brief .section-title>.no',
  'content:counter(qily-brief-section,cjk-ideographic) "、"',
  'font-size:initial!important',
  'text-wrap:balance'
].forEach(token=>{if(!css.includes(token))throw new Error(`Daily Brief layout guard CSS contract missing: ${token}`)});

if(!SEQUENCE_OFF_STYLE.includes('.section-title>.no{display:none!important}'))throw new Error('Daily Brief sequence-off contract missing detached badge suppression.');
if(!SEQUENCE_OFF_STYLE.includes('.section-title h3::before{content:none!important;display:none!important}'))throw new Error('Daily Brief sequence-off contract missing pseudo-number suppression.');
if(!SEQUENCE_OFF_STYLE.includes('.mind-core span{color:#ffe3a0!important;-webkit-text-fill-color:#ffe3a0!important}'))throw new Error('Daily Brief core accent contract missing CORE ENGINE soft-gold treatment.');
if(!SEQUENCE_OFF_STYLE.includes('.mind-core strong{color:#f2b544!important;-webkit-text-fill-color:#f2b544!important;text-shadow:none!important}'))throw new Error('Daily Brief core accent contract missing 精益交付力 VI-gold treatment.');

process.stdout.write(`Daily Brief layout guard ${checkOnly?'check passed':'materialized'}: ${count} dated brief(s), ${changed.length} changed.\n`);
