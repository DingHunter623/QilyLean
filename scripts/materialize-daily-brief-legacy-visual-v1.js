#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');

const root=path.resolve(__dirname,'..');
const dailyDir=path.join(root,'qilylean','daily');
const assetHref='/qilylean/daily-brief-legacy-visual-v1.css?v=20260902-legacy-visual-v1';
const linkTag=`<link id="qilyDailyBriefLegacyVisualV1" rel="stylesheet" href="${assetHref}">`;
const datePage=/^\d{4}-\d{2}-\d{2}\.html$/;
const legacyCover=/<div class="visual"><img\s+src="\/qilylean\/assets\/daily-[^"]+\.svg"/i;
const dailyBody=/body class="[^"]*daily-single-page/i;
const oldLink=/\n?<link id="qilyDailyBriefLegacyVisualV1"[^>]*>/g;

let scanned=0;
let matched=0;
let changed=0;
let skippedCustom=0;
const sample=[];

for(const name of fs.readdirSync(dailyDir).filter((file)=>datePage.test(file)).sort()){
  scanned+=1;
  const file=path.join(dailyDir,name);
  const source=fs.readFileSync(file,'utf8');
  const qualifies=dailyBody.test(source)&&legacyCover.test(source);
  const cleaned=source.replace(oldLink,'');

  if(!qualifies){
    skippedCustom+=1;
    if(cleaned!==source){
      fs.writeFileSync(file,cleaned.endsWith('\n')?cleaned:`${cleaned}\n`);
      changed+=1;
    }
    continue;
  }

  matched+=1;
  if(sample.length<12) sample.push(name.replace('.html',''));
  if(!cleaned.includes('</head>')) throw new Error(`Missing </head>: ${name}`);
  const next=cleaned.replace('</head>',`${linkTag}\n</head>`);
  if(next!==source){
    fs.writeFileSync(file,next.endsWith('\n')?next:`${next}\n`);
    changed+=1;
  }
}

if(!matched) throw new Error('No legacy daily brief pages matched the visual-refresh contract');

process.stdout.write(`Legacy daily brief visual refresh: scanned=${scanned}, matched=${matched}, skippedCustom=${skippedCustom}, changed=${changed}.\n`);
process.stdout.write(`Sample matched dates: ${sample.join(', ')}\n`);
