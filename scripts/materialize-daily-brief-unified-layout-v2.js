#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');

const root=path.resolve(__dirname,'..');
const dailyDir=path.join(root,'qilylean','daily');
const datePage=/^\d{4}-\d{2}-\d{2}\.html$/;
const legacyCover=/<div class="visual"><img\s+src="\/qilylean\/assets\/daily-[^"]+\.svg"/i;
const dailyBody=/<body\b[^>]*class="[^"]*daily-single-page[^"]*"[^>]*>/i;
const oldLegacyLink=/\n?<link id="qilyDailyBriefLegacyVisualV1"[^>]*>/g;
const oldUnifiedLink=/\n?<link id="qilyDailyBriefUnifiedLayoutV2"[^>]*>/g;
const unifiedHref='/qilylean/daily-brief-unified-layout-v2.css?v=20260902-unified-axis-v3';
const unifiedLink=`<link id="qilyDailyBriefUnifiedLayoutV2" rel="stylesheet" href="${unifiedHref}">`;

let scanned=0;
let legacy=0;
let rich=0;
let changed=0;
const samples={legacy:[],rich:[]};

function setLayoutAttribute(source,layout,name){
  const match=source.match(dailyBody);
  if(!match) throw new Error(`Missing daily-single-page body: ${name}`);
  const original=match[0];
  let next=original.replace(/\sdata-qily-daily-layout="[^"]*"/i,'');
  next=next.replace(/>$/,` data-qily-daily-layout="${layout}">`);
  return source.replace(original,next);
}

for(const name of fs.readdirSync(dailyDir).filter((file)=>datePage.test(file)).sort()){
  scanned+=1;
  const file=path.join(dailyDir,name);
  const source=fs.readFileSync(file,'utf8');
  const layout=legacyCover.test(source)?'legacy':'rich';
  if(layout==='legacy'){
    legacy+=1;
    if(samples.legacy.length<10) samples.legacy.push(name.replace('.html',''));
  }else{
    rich+=1;
    if(samples.rich.length<10) samples.rich.push(name.replace('.html',''));
  }

  let next=source.replace(oldLegacyLink,'').replace(oldUnifiedLink,'');
  next=setLayoutAttribute(next,layout,name);
  if(!next.includes('</head>')) throw new Error(`Missing </head>: ${name}`);
  next=next.replace('</head>',`${unifiedLink}\n</head>`);

  if(next!==source){
    fs.writeFileSync(file,next.endsWith('\n')?next:`${next}\n`);
    changed+=1;
  }
}

if(!scanned||!legacy||!rich) throw new Error(`Unexpected daily population: scanned=${scanned}, legacy=${legacy}, rich=${rich}`);
process.stdout.write(`Unified daily brief layout V2: scanned=${scanned}, legacy=${legacy}, rich=${rich}, changed=${changed}.\n`);
process.stdout.write(`Legacy sample: ${samples.legacy.join(', ')}\n`);
process.stdout.write(`Rich sample: ${samples.rich.join(', ')}\n`);
