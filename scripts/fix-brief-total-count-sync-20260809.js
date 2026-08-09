#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const files={
  directory:path.join(root,'qilylean','daily-insights.html'),
  generator:path.join(root,'scripts','build-daily-archive.js'),
  training:path.join(root,'scripts','publish-20260808-training-note.js'),
  data:path.join(root,'qilylean','daily','index.json'),
  siteData:path.join(root,'qilylean','site-data.json'),
  trust:path.join(root,'trust','index.html')
};
function read(p){return fs.readFileSync(p,'utf8')}
function write(p,s){fs.writeFileSync(p,s.endsWith('\n')?s:s+'\n','utf8')}
function assert(ok,msg){if(!ok)throw new Error(msg)}
const briefs=JSON.parse(read(files.data));
const officialTotal=briefs.length;
const dates=briefs.map(x=>x.date).sort();
const start=new Date(dates[0]+'T00:00:00Z');
const end=new Date(dates[dates.length-1]+'T00:00:00Z');
const inclusive=Math.round((end-start)/86400000)+1;
assert(officialTotal===inclusive,`正式简报条数${officialTotal}与日期区间${inclusive}不一致`);
assert(officialTotal===2589,'2026-08-10正式简报总期数应为2589');

// 1) Current directory runtime: keep supplemental cards visible/searchable, but never count them as formal brief periods.
let directory=read(files.directory);
const oldDecl="selectedYear='',cards=Array.prototype.slice.call(document.querySelectorAll('.brief-month .brief-index-card')),months=Array.prototype.slice.call(document.querySelectorAll('.brief-month'));";
const newDecl="selectedYear='',cards=Array.prototype.slice.call(document.querySelectorAll('.brief-month .brief-index-card')),officialCards=cards.filter(function(card){return !card.hasAttribute('data-brief-training-note');}),months=Array.prototype.slice.call(document.querySelectorAll('.brief-month'));";
assert(directory.includes(oldDecl)||directory.includes(newDecl),'无法定位目录运行时卡片声明');
directory=directory.replace(oldDecl,newDecl);
const oldNoQuery="cards.forEach(function(card){var matchYear=!selectedYear||card.getAttribute('data-brief-year')===selectedYear;card.hidden=!matchYear;if(matchYear)visible+=1;});";
const newNoQuery="cards.forEach(function(card){var matchYear=!selectedYear||card.getAttribute('data-brief-year')===selectedYear;card.hidden=!matchYear;if(matchYear&&!card.hasAttribute('data-brief-training-note'))visible+=1;});";
assert(directory.includes(oldNoQuery)||directory.includes(newNoQuery),'无法定位目录运行时总期数统计逻辑');
directory=directory.replace(oldNoQuery,newNoQuery);
directory=directory.replace(/当前显示全部 \d+ 期/g,`当前显示全部 ${officialTotal} 期`);
directory=directory.replace(/2019-07-10—2026-08-10｜共\d+期/g,`2019-07-10—2026-08-10｜共${officialTotal}期`);
write(files.directory,directory);

// 2) Permanent archive generator: emit the same supplemental-aware runtime count rule.
let generator=read(files.generator);
assert(generator.includes(oldDecl)||generator.includes(newDecl),'无法定位生成器卡片声明');
generator=generator.replace(oldDecl,newDecl);
assert(generator.includes(oldNoQuery)||generator.includes(newNoQuery),'无法定位生成器总期数统计逻辑');
generator=generator.replace(oldNoQuery,newNoQuery);
write(files.generator,generator);

// 3) Training note: explicitly identify it as supplemental and give it a year for year-filter visibility.
let training=read(files.training);
training=training.replace('data-publish-sequence="2" data-brief-date="2026-08-08"','data-publish-sequence="2" data-brief-counted="false" data-brief-year="2026" data-brief-date="2026-08-08"');
write(files.training,training);
// Patch already materialized card too.
directory=read(files.directory).replace('data-brief-training-note="2026-08-08" data-publish-sequence="2" data-brief-date="2026-08-08"','data-brief-training-note="2026-08-08" data-publish-sequence="2" data-brief-counted="false" data-brief-year="2026" data-brief-date="2026-08-08"');
write(files.directory,directory);

// 4) Cross-surface validation.
const siteData=JSON.parse(read(files.siteData));
assert(siteData.briefs.total===officialTotal,`site-data总期数${siteData.briefs.total} != ${officialTotal}`);
const trust=read(files.trust);
assert(trust.includes(`<strong>${officialTotal}</strong><span>今日简报总数</span>`),`信任中心未同步${officialTotal}`);
const finalDirectory=read(files.directory);
assert(finalDirectory.includes(`共${officialTotal}期`),'目录标题总期数未同步');
assert(finalDirectory.includes(`当前显示全部 ${officialTotal} 期`),'目录筛选静态总期数未同步');
assert(finalDirectory.includes("!card.hasAttribute('data-brief-training-note')"),'运行时未排除培训纪要重复计期');
assert(finalDirectory.includes('data-brief-counted="false"'),'培训纪要未标记为附加资料');
console.log(`Brief total sync validated: ${officialTotal} formal briefs; supplemental training note excluded from period count.`);
