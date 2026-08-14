#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');

const root=path.resolve(__dirname,'..');
const htmlPath=path.join(root,'knowledge','terminology.html');
const oldHref='/knowledge/terminology-opl-readability-v8.css?v=20260814-opl-readability-contact-v9';
const newHref='/knowledge/terminology-opl-readability-v8.css?v=20260814-opl-contact-alignment-v10';

let html=fs.readFileSync(htmlPath,'utf8');
if(html.includes(oldHref)) html=html.replaceAll(oldHref,newHref);
else if(!html.includes(newHref)){
  html=html.replace(/\/knowledge\/terminology-opl-readability-v8\.css\?v=[^"']+/g,newHref);
}

if(!html.includes(newHref)) throw new Error('V10 stylesheet cache-bust href missing');
if(!html.includes('class="term-opl-copy-wechat-v9"')) throw new Error('WeChat text-link structure missing');
if(!html.includes('class="term-opl-contact-card"')) throw new Error('OPL contact card missing');

fs.writeFileSync(htmlPath,html,'utf8');
console.log('OPL contact V10 cache version materialized.');
