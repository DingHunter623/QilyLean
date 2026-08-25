#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');

const root=path.resolve(__dirname,'..');
const file=path.join(root,'knowledge','terminology.html');
const cssHref='/knowledge/terminology-opl-readability-v8.css?v=20260825-opl-readability-v14';
const printGuardId='qilyOplPrintNoOverlapV14';
const printGuard=`<style id="${printGuardId}">
/* QILY-OPL-PRINT-NO-OVERLAP-V14-20260825
 * Chromium PDF evidence showed the fixed repeated running header/footer could cross the
 * second-page lesson heading. The lesson already contains its own brand and contact footer,
 * so repeated fixed print decorations are removed to protect the actual training content.
 */
@media print{
  html body .term-opl-running,
  html body .term-opl-running-head,
  html body .term-opl-running-foot{
    display:none!important;
    position:static!important;
    inset:auto!important;
  }
  html body .term-opl-content{
    padding-top:4mm!important;
    overflow:visible!important;
  }
}
</style>`;

let html=fs.readFileSync(file,'utf8');

// Load component-owned OPL readability baseline last and cache-bust every V14 lesson/PDF view.
html=html.replace(/\n?<link[^>]+id="qilyTerminologyOplReadabilityV8Stylesheet"[^>]*>\n?/g,'\n');
html=html.replace(new RegExp(`\\s*<style\\b[^>]*id=["']${printGuardId}["'][^>]*>[\\s\\S]*?<\\/style>\\s*`,'gi'),'\n');
if(!html.includes('</head>'))throw new Error('terminology </head> missing');
html=html.replace('</head>',`<link id="qilyTerminologyOplReadabilityV8Stylesheet" rel="stylesheet" href="${cssHref}">\n${printGuard}\n</head>`);

// Wrap CTA text so global control/anchor rules cannot recolor the visible label.
html=html.replace(/(<a\b[^>]*class="[^"]*\bterm-opl-open\b[^"]*"[^>]*>)(?!<span class="term-opl-open-label-v9">)([^<]+)(<\/a>)/g,function(all,open,label,close){
  return open+'<span class="term-opl-open-label-v9">'+label.trim()+'</span>'+close;
});

// Unified visible wording and WeChat interaction: text-link appearance, not a button block.
html=html.replace('官网：<a href="https://qilylean.com">qilylean.com</a>','官方网址：<a href="https://qilylean.com">qilylean.com</a>');
html=html.replace(/<br>微信：<button[^>]*data-opl-copy-wechat="Qily259"[^>]*>Qily259<\/button><br>/g,'<br>微信：<a href="#copy-wechat" class="term-opl-copy-wechat-v9" data-opl-copy-wechat="Qily259" aria-label="复制微信 Qily259">Qily259</a><br>');
html=html.replace(/<br>微信：Qily259<br>/g,'<br>微信：<a href="#copy-wechat" class="term-opl-copy-wechat-v9" data-opl-copy-wechat="Qily259" aria-label="复制微信 Qily259">Qily259</a><br>');
html=html.replace('扫码访问官网</span>','扫码访问官方网址</span>');

// Existing delegated copy handler: prevent fragment navigation and copy the ID.
html=html.replace("  if(wechatCopy){\n    copyText(","  if(wechatCopy){\n    event.preventDefault();\n    copyText(");

fs.writeFileSync(file,html,'utf8');

const out=fs.readFileSync(file,'utf8');
const checks=[
  cssHref,
  printGuardId,
  'QILY-OPL-PRINT-NO-OVERLAP-V14-20260825',
  '.term-opl-running-head',
  'display:none!important',
  'term-opl-open-label-v9',
  'class="term-opl-copy-wechat-v9" data-opl-copy-wechat="Qily259"',
  '扫码访问官方网址',
  'event.preventDefault();'
];
for(const token of checks){if(!out.includes(token))throw new Error('OPL V14 token missing: '+token);}
if(out.includes('<button type="button" class="term-opl-copy-wechat"'))throw new Error('button-style WeChat control remains');
if(out.includes('<br>微信：Qily259<br>'))throw new Error('legacy non-copyable WeChat line remains');
console.log('OPL V14 PASS: repeated print decorations removed, white labels retained, A4 content protected.');
