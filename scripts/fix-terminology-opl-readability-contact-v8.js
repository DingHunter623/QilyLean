#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');

const root=path.resolve(__dirname,'..');
const file=path.join(root,'knowledge','terminology.html');
const cssHref='/knowledge/terminology-opl-readability-v8.css?v=20260814-opl-readability-contact-v8';

let html=fs.readFileSync(file,'utf8');

// Load the dedicated OPL readability baseline last, so global link hover rules cannot darken CTA text.
html=html.replace(/\n?<link[^>]+id="qilyTerminologyOplReadabilityV8Stylesheet"[^>]*>\n?/g,'\n');
if(!html.includes('</head>'))throw new Error('terminology </head> missing');
html=html.replace('</head>',`<link id="qilyTerminologyOplReadabilityV8Stylesheet" rel="stylesheet" href="${cssHref}">\n</head>`);

// Unified visible wording in the OPL lesson template.
html=html.replace(
  '官网：<a href="https://qilylean.com/">qilylean.com</a>',
  '官方网址：<a href="https://qilylean.com/">qilylean.com</a>'
);
html=html.replace(
  '<br>微信：Qily259<br>',
  '<br>微信号：<button type="button" class="term-opl-copy-wechat" data-opl-copy-wechat="Qily259" aria-label="复制微信号 Qily259">Qily259</button><br>'
);
html=html.replace('扫码访问官网</span>','扫码访问官方网址</span>');
html=html.replace('官网网址：https://qilylean.com/','官方网址：https://qilylean.com/');

// Reuse the existing secure copyText()/toast() utilities already used by the OPL link-copy action.
const eventAnchor="  if(event.target.closest('[data-opl-link]')){\n    copyText(canonicalLink(lesson(cards[current],current))).then(function(){toast('课件链接已复制');}).catch(function(){toast('复制失败，请从地址栏复制');});\n    return;\n  }";
const wechatHandler="  var wechatCopy=event.target.closest('[data-opl-copy-wechat]');\n  if(wechatCopy){\n    copyText(wechatCopy.getAttribute('data-opl-copy-wechat')||wechatCopy.textContent||'Qily259').then(function(){toast('微信号已复制');}).catch(function(){toast('复制失败，请手动复制微信号');});\n    return;\n  }\n"+eventAnchor;
if(!html.includes("data-opl-copy-wechat')")){
  if(!html.includes(eventAnchor))throw new Error('OPL delegated click anchor missing');
  html=html.replace(eventAnchor,wechatHandler);
}

fs.writeFileSync(file,html,'utf8');

const out=fs.readFileSync(file,'utf8');
const checks=[
  cssHref,
  '官方网址：<a href="https://qilylean.com/">qilylean.com</a>',
  '微信号：<button type="button" class="term-opl-copy-wechat" data-opl-copy-wechat="Qily259"',
  '扫码访问官方网址',
  '官方网址：https://qilylean.com/',
  "toast('微信号已复制')"
];
for(const token of checks){if(!out.includes(token))throw new Error('OPL V8 token missing: '+token);}
if(out.includes('<br>微信：Qily259<br>'))throw new Error('legacy non-copyable WeChat line remains');
console.log('OPL V8 PASS: high-contrast CTA baseline linked; 官方网址 wording and underlined click-to-copy WeChat ID materialized.');
