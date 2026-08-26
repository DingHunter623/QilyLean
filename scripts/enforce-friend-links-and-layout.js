#!/usr/bin/env node
'use strict';

/* QilyLean 友情链接 + 版式永久防回退｜2026-08-26
 * 1) /links/ 保留为独立资源模块；一级导航显示名统一为“资源协同”；
 * 2) 首页辅助资产继续保留“友情链接”直达 /links/，用于明确全球科技企业官网入口属性；
 * 3) /links/ 页面保留“友情链接｜全球科技企业100强”身份，同时继续承载产业资源协同内容；
 * 4) 本页内容轴统一到全站 1240px 主内容宽度；
 * 5) hao123 作为正式友情链接收录并由永久规则保护，避免后续发布器覆盖回退。
 * 6) 该脚本为 hao123 友情链接的唯一物化入口，CI 推送后自动生成公开页面。
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
    .replace(/<span class="eyebrow">GLOBAL TECHNOLOGY & INDUSTRY RESOURCE DIRECTORY<\/span><h1>产业资源目录｜全球科技企业与跨行业资源<\/h1><p class="lead">[\s\S]*?<\/p>/,'<span class="eyebrow">GLOBAL TECHNOLOGY DIRECTORY</span><h1>友情链接｜全球科技企业100强</h1><p class="lead">汇集人工智能、云计算、半导体、工业自动化、智能硬件、商业航天、新能源、中国硬科技及优质网址导航入口，为技术研究、行业洞察、项目对标与供应链学习提供高效入口。</p>')
    .replace(/width:min\(1360px,100%\)/g,'width:min(1240px,100%)');

  const haoRow='hao123|hao123 上网导航|网址导航|中国|https://www.hao123.com/';
  if(!html.includes(haoRow)){
    const rowsAnchor='var rows=`Google / Alphabet|谷歌 / Alphabet|AI云软件|美国|https://about.google/';
    assert(html.includes(rowsAnchor),'links/index.html: company rows anchor missing; refusing blind hao123 insertion');
    html=html.replace(rowsAnchor,`var rows=\`${haoRow}\nGoogle / Alphabet|谷歌 / Alphabet|AI云软件|美国|https://about.google/`);
  }

  html=html
    .replace("var categories=['全部','AI云软件','半导体','硬件工业','前沿科技','中国硬科技'];","var categories=['全部','网址导航','AI云软件','半导体','硬件工业','前沿科技','中国硬科技'];")
    .replace('<strong id="totalCount">100</strong><span>科技企业官网</span></div><div class="stat"><strong>5</strong><span>产业分类</span>','<strong id="totalCount">101</strong><span>官网与导航入口</span></div><div class="stat"><strong>6</strong><span>产业分类</span>')
    .replace('<p class="result" id="resultText">当前显示 100 家企业</p>','<p class="result" id="resultText">当前显示 101 个官网与导航入口</p>');

  assert(html.includes('<title>友情链接｜全球科技企业100强官网入口｜QilyLean</title>'),'links/index.html: friend-link title missing');
  assert(html.includes('<h1>友情链接｜全球科技企业100强</h1>'),'links/index.html: friend-link H1 missing');
  assert(html.includes('aria-label="搜索友情链接"'),'links/index.html: friend-link search identity missing');
  assert(html.includes('href="/links/network/"'),'links/index.html: industry resource network must remain available inside friend-links module');
  assert(html.includes(haoRow),'links/index.html: hao123 friend link missing');
  assert(html.includes("'网址导航'"),'links/index.html: hao123 category missing');
  assert(html.includes('https://www.hao123.com/'),'links/index.html: hao123 official URL missing');
  assert(!html.includes('width:min(1360px,100%)'),'links/index.html: legacy 1360px content axis returned');
  assert((html.match(/width:min\(1240px,100%\)/g)||[]).length>=2,'links/index.html: unified 1240px content axis incomplete');
  write('links/index.html',html);
}

patchHome();
patchLinks();
process.stdout.write('Resource-collaboration navigation preserved; hao123 is permanently included in /links/ as a verified navigation friend link; resource network and 1240px content axis remain protected.\n');
