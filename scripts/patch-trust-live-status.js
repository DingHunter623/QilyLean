#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');

const root=path.resolve(__dirname,'..');
const trustFile=path.join(root,'trust','index.html');
const dailyIndexFile=path.join(root,'qilylean','daily','index.json');
const dailyDirectoryFile=path.join(root,'qilylean','daily-insights.html');
const siteDataFile=path.join(root,'qilylean','site-data.json');
const searchIndexFile=path.join(root,'qilylean','site-search-index.json');

function readJson(file){return JSON.parse(fs.readFileSync(file,'utf8'));}
function read(file){return fs.readFileSync(file,'utf8');}
function writeIfChanged(file,content){
  const normalized=content.endsWith('\n')?content:`${content}\n`;
  const current=fs.existsSync(file)?fs.readFileSync(file,'utf8'):'';
  if(current===normalized)return false;
  fs.writeFileSync(file,normalized);
  return true;
}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,(character)=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
})[character]);}

function ensureDailyArchiveDisclosure(){
  if(!fs.existsSync(dailyDirectoryFile))return;
  let directory=read(dailyDirectoryFile);
  if(directory.includes('QILY-ARCHIVE-DISCLOSURE:START'))return;
  const anchor='<h2>简报目录</h2>';
  if(!directory.includes(anchor))throw new Error('Daily directory heading missing');
  const block=`${anchor}
<!-- QILY-ARCHIVE-DISCLOSURE:START -->
<div role="note" style="margin:16px 0 22px;padding:16px 18px;border-left:5px solid #caa15f;color:#315f64;background:#eef8f6;line-height:1.8"><strong>归档口径说明：</strong>历史简报依据历年制造实践、工作记录与项目经验持续整理；页面日期用于知识档案排序与主题定位，不单独作为该网页在对应日期首次公开发布的证明。内容如经修订，以当前页面和全站同步版本为准。 <a href="/trust/#publication">查看完整说明</a></div>
<!-- QILY-ARCHIVE-DISCLOSURE:END -->`;
  directory=directory.replace(anchor,block);
  writeIfChanged(dailyDirectoryFile,directory);
}

function main(){
  const briefs=readJson(dailyIndexFile);
  const site=readJson(siteDataFile);
  const search=readJson(searchIndexFile);
  if(!Array.isArray(briefs)||!briefs.length)throw new Error('No daily brief entries found');

  ensureDailyArchiveDisclosure();

  const sorted=[...briefs].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  const latest=sorted[0];
  const briefTotal=briefs.length;
  const terminologyTotal=site&&site.terminology&&site.terminology.total||0;
  const indexedEntries=search&&search.meta&&search.meta.indexedEntries||site&&site.search&&site.search.indexedEntries||0;
  const syncVersion=site&&site.generatedAt||latest.date;

  let page=read(trustFile);
  const statusPattern=/<div class="trust-status">[\s\S]*?<\/div>\s*<div class="trust-callout" style="margin-top:18px">/;
  const statusBlock=`<div class="trust-status" data-trust-live-source="/qilylean/daily/index.json">
<div><strong data-trust-stat="terminology">${terminologyTotal}</strong><span>术语及单点课件</span></div><div><strong data-trust-stat="briefs">${briefTotal}</strong><span>今日简报总数</span></div><div><strong data-trust-stat="latest-date">${escapeHtml(latest.date)}</strong><span>最新简报日期</span></div><div><strong data-trust-stat="search">${indexedEntries||'自动'}</strong><span>站内搜索索引条目</span></div>
</div><div class="trust-callout" style="margin-top:18px">`;
  if(!statusPattern.test(page))throw new Error('Trust status block not found');
  page=page.replace(statusPattern,statusBlock);

  page=page.replace(
    /(<div class="trust-callout" style="margin-top:18px"><strong>同步版本：<\/strong>)([^。<]*)(。术语数量、简报数量、最新日期、知识模块统计、首页最新内容、Sitemap lastmod与站内搜索索引由自动化流程统一核算；)/,
    `$1<span data-trust-sync-version>${escapeHtml(syncVersion)}</span>$3`
  );

  const scriptTag='<script defer src="/trust/live-status.js?v=20260809-live-brief-count-v1"></script>';
  page=page.replace(/\n?<script defer src="\/trust\/live-status\.js[^>]*><\/script>/g,'');
  page=page.replace('</body>',`${scriptTag}\n</body>`);

  writeIfChanged(trustFile,page);
  process.stdout.write(`Trust live status patched: ${briefTotal} briefs, latest ${latest.date}.\n`);
}

main();
