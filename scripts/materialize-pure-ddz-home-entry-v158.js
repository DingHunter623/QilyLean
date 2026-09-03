#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const file=path.join(root,'times26001-home-card.js');
if(!fs.existsSync(file))throw new Error('Missing times26001-home-card.js');
let source=fs.readFileSync(file,'utf8');
const before=source;
const CACHE='20260903-ddz-fast-knowledge-v155-v158-v159-v160-v161-v162';

source=source.replace('网页游戏＋Android APP｜休闲数字产品','网页版数字产品｜适老化休闲益智');
source=source.replace('牌面识别保持传统规则，QilyLean业务元素主要用于牌背与桌面视觉。','牌面保留传统点数与花色识别，并在普通牌面融入QilyLean专业术语、中文名称与核心释义。');
source=source.replace('<li>Android v1.0.2 启动修复版离线安装包</li>','<li>网页端直接游玩，知识牌面兼顾娱乐与制造业学习</li>');
source=source.replace(/<a class="apk" href="https:\/\/github\.com\/DingHunter623\/Pure-DDZ-Classic\/releases\/download\/v1\.0\.2\/Pure-DDZ-Classic-v1\.0\.2\.apk">下载 Android v1\.0\.2<\/a>/g,'');

if(!source.includes('function primePureDdzV158(){')){
  const helper=`function primePureDdzV158(){\n  if(document.querySelector('link[data-qily-ddz-prefetch="v158"]'))return;\n  [\n    ['/tools/pure-ddz/','document'],\n    ['/tools/pure-ddz/game/css/ddz-core-v155.css?v=${CACHE}','style'],\n    ['/tools/pure-ddz/game/js/ddz-core-v155.js?v=${CACHE}','script']\n  ].forEach(function(item){\n    var link=document.createElement('link');\n    link.rel='prefetch';\n    link.href=item[0];\n    link.setAttribute('data-qily-ddz-prefetch','v158');\n    link.setAttribute('data-qily-ddz-prefetch-as',item[1]);\n    document.head.appendChild(link);\n  });\n}\n\nfunction bindPureDdzIntent(link){\n  if(!link||link.dataset.qilyDdzIntentBound==='1')return;\n  link.dataset.qilyDdzIntentBound='1';\n  ['pointerenter','focus','touchstart','pointerdown'].forEach(function(type){\n    link.addEventListener(type,primePureDdzV158,{once:true,passive:true});\n  });\n}\n\n`;
  source=source.replace('function addPureDdzHeroLink(){',helper+'function addPureDdzHeroLink(){');
}

/* Refresh an already-materialized V158 prefetch block to the current V162 cache key without adding another owner. */
source=source.replace(/20260903-ddz-fast-knowledge-v155-v158(?:-v159)?(?:-v160)?(?:-v161)?(?:-v162)?/g,CACHE);

source=source.replace(
  "  actions.appendChild(link);\n}\n\nfunction addSection(){",
  "  actions.appendChild(link);\n  bindPureDdzIntent(link);\n}\n\nfunction addSection(){"
);
source=source.replace(
  "  var button=section.querySelector('[data-copy-pure-ddz]');",
  "  var playLink=section.querySelector('.pure-ddz-home-actions .play');\n  bindPureDdzIntent(playLink);\n  var button=section.querySelector('[data-copy-pure-ddz]');"
);
source=source.replace(
  '  addPureDdzSection();\n}',
  "  addPureDdzSection();\n  if('requestIdleCallback' in window)requestIdleCallback(primePureDdzV158,{timeout:1800});else setTimeout(primePureDdzV158,900);\n}"
);

if(source.includes('网页游戏＋Android APP｜休闲数字产品'))throw new Error('Legacy DDZ Android positioning still public');
if(source.includes('Pure-DDZ-Classic-v1.0.2.apk')||source.includes('下载 Android v1.0.2'))throw new Error('Legacy DDZ Android APK CTA still public');
for(const token of ['function primePureDdzV158(){','data-qily-ddz-prefetch','/tools/pure-ddz/','ddz-core-v155.css?v='+CACHE,'ddz-core-v155.js?v='+CACHE]){
  if(!source.includes(token))throw new Error(`DDZ V162 entry prefetch contract missing: ${token}`);
}
if(source!==before)fs.writeFileSync(file,source.endsWith('\n')?source:source+'\n');
console.log('Pure DDZ V162 homepage entry materialized: direct route + idle/intent prefetch + current cache + current public product copy.');
