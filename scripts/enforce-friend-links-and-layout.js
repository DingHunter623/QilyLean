#!/usr/bin/env node
'use strict';

/* QilyLean 友情链接 + 版式永久防回退｜2026-08-17
 * 1) 友情链接保留为独立模块，不进入八大一级导航；
 * 2) 首页辅助资产必须保留“友情链接”直达 /links/；
 * 3) /links/ 保留“友情链接｜全球科技企业100强”身份，同时继续承载产业资源协同内容；
 * 4) 本页内容轴统一到全站 1240px 主内容宽度。
 */
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
function read(rel){return fs.readFileSync(path.join(root,rel),'utf8');}
function write(rel,content){const file=path.join(root,rel);const out=content.endsWith('\n')?content:`${content}\n`;if(fs.readFileSync(file,'utf8')===out)return false;fs.writeFileSync(file,out,'utf8');return true;}
function assert(ok,msg){if(!ok)throw new Error(msg);}

function patchHome(){
  let html=read('index.html');
  const desired='<a href="/links/"><strong>友情链接</strong><span>全球科技企业100强官网入口，并保留产业资源协同网络与入驻服务。</span></a>';
  if(!html.includes(desired)){
    const old=/<a href="\/links\/network\/"><strong>产业资源协同网络<\/strong><span>[\s\S]*?<\/span><\/a>/;
    assert(old.test(html),'index.html: missing current产业资源协同网络 card; refusing blind rewrite');
    html=html.replace(old,desired);
  }
  assert(html.includes(desired),'index.html: 友情链接 home entry missing');
  assert(!/<a href="\/links\/network\/"><strong>产业资源协同网络<\/strong>/.test(html),'index.html: renamed friend-link card returned');
  write('index.html',html);
}

function patchLinks(){
  let html=read('links/index.html');
  html=html
    .replace(/<title>产业资源目录｜全球科技企业与跨行业协同资源｜QilyLean<\/title>/,'<title>友情链接｜全球科技企业100强官网入口｜QilyLean</title>')
    .replace(/<meta property="og:title" content="产业资源目录｜QilyLean">/,'<meta property="og:title" content="友情链接｜全球科技企业100强官网入口｜QilyLean">')
    .replace(/<span class="eyebrow">GLOBAL TECHNOLOGY & INDUSTRY RESOURCE DIRECTORY<\/span><h1>产业资源目录｜全球科技企业与跨行业资源<\/h1><p class="lead">[\s\S]*?<\/p>/,'<span class="eyebrow">GLOBAL TECHNOLOGY DIRECTORY</span><h1>友情链接｜全球科技企业100强</h1><p class="lead">汇集人工智能、云计算、半导体、工业自动化、智能硬件、商业航天、新能源及中国硬科技代表企业的官方网址，为技术研究、行业洞察、项目对标与供应链学习提供高效入口。</p>')
    .replace(/width:min\(1360px,100%\)/g,'width:min(1240px,100%)');

  assert(html.includes('<title>友情链接｜全球科技企业100强官网入口｜QilyLean</title>'),'links/index.html: friend-link title missing');
  assert(html.includes('<h1>友情链接｜全球科技企业100强</h1>'),'links/index.html: friend-link H1 missing');
  assert(html.includes('aria-label="搜索友情链接"'),'links/index.html: friend-link search identity missing');
  assert(html.includes('href="/links/network/"'),'links/index.html: industry resource network must remain available inside friend-links module');
  assert(!html.includes('width:min(1360px,100%)'),'links/index.html: legacy 1360px content axis returned');
  assert((html.match(/width:min\(1240px,100%\)/g)||[]).length>=2,'links/index.html: unified 1240px content axis incomplete');
  write('links/index.html',html);
}

patchHome();
patchLinks();
process.stdout.write('Friend-links module preserved: homepage direct entry restored, /links/ identity restored, resource network retained, and links content axis normalized to 1240px.\n');
