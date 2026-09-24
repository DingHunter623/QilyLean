const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(process.cwd(), 'cn-site');
const BASE = process.env.QILY_CN_BASE || 'http://127.0.0.1:4174';

function walk(dir){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const full=path.join(dir,entry.name);
    return entry.isDirectory()?walk(full):[full];
  });
}
function routeFor(file){
  const rel=path.relative(ROOT,file).replace(/\\/g,'/');
  if(rel==='index.html') return '/';
  if(rel.endsWith('/index.html')) return '/'+rel.slice(0,-'index.html'.length);
  return '/'+rel;
}
const pages=walk(ROOT)
  .filter(f=>f.endsWith('.html'))
  .filter(f=>{
    const n=path.basename(f);
    if(/^google/i.test(n)||/^baidu_verify/i.test(n)) return false;
    return /<body\b/i.test(fs.readFileSync(f,'utf8'));
  })
  .map(routeFor)
  .sort();

const reps = new Set(['/factory/','/ie/','/knowledge/standard-time-capacity/','/notes/']);

async function auditPage(page, route, limits, label){
  const res=await page.goto(BASE+route,{waitUntil:'domcontentloaded'});
  expect(res && res.ok(), route+' must load').toBeTruthy();
  await page.waitForTimeout(120);
  const data=await page.evaluate(()=>{
    const read=(sel)=>[...document.querySelectorAll(sel)].map(el=>({
      text:(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,120),
      px:parseFloat(getComputedStyle(el).fontSize)
    }));
    return {
      h1:read('main h1'),
      h2:read('main h2'),
      h3:read('main h3'),
      body:read('main .article-body p, main .section-head p').slice(0,12),
      href:[...document.querySelectorAll('link[rel="stylesheet"]')].map(x=>x.getAttribute('href')||''),
      header:(()=>{
        const inner=document.querySelector('.site-header .header-inner');
        const firstNav=document.querySelector('.site-header .nav>a[href]');
        if(!inner)return null;
        const ir=inner.getBoundingClientRect();
        if(!firstNav)return {height:ir.height,hasNav:false,visualTopGap:null};
        const nr=firstNav.getBoundingClientRect();
        const pad=parseFloat(getComputedStyle(firstNav).paddingTop)||0;
        return {height:ir.height,hasNav:true,navBoxTopGap:(nr.top-ir.top),visualTopGap:(nr.top-ir.top)+pad};
      })()
    };
  });
  expect(data.href.some(x=>x.includes('qilylean-vi-v2.css?v=20260924-cn-vi-v25-header-shell-parity')), route+' must load V25 VI').toBeTruthy();
  for(const x of data.h1) expect(x.px, route+' H1 '+x.text).toBeLessThanOrEqual(limits.h1);
  for(const x of data.h2) expect(x.px, route+' H2 '+x.text).toBeLessThanOrEqual(limits.h2);
  for(const x of data.h3) expect(x.px, route+' H3 '+x.text).toBeLessThanOrEqual(limits.h3);
  for(const x of data.body) expect(x.px, route+' body '+x.text).toBeLessThanOrEqual(limits.body);
  if(label==='desktop' && data.header && data.header.hasNav){
    expect(data.header.height, route+' desktop header height parity').toBeGreaterThanOrEqual(82);
    expect(data.header.height, route+' desktop header height parity').toBeLessThanOrEqual(85);
    expect(data.header.navBoxTopGap, route+' desktop nav box top parity').toBeGreaterThanOrEqual(12);
    expect(data.header.navBoxTopGap, route+' desktop nav box top parity').toBeLessThanOrEqual(14.5);
  }
  if(reps.has(route)){
    fs.mkdirSync('visual-cn-typography-v23',{recursive:true});
    const slug=route==='/'?'home':route.replace(/^\/+|\/+$/g,'').replace(/\//g,'-');
    await page.screenshot({path:`visual-cn-typography-v23/${slug}-${label}.png`,fullPage:true});
  }
  return data;
}

test('CN V23 desktop typography ceiling across every public page', async ({browser})=>{
  expect(pages.length).toBeGreaterThanOrEqual(19);
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  for(const route of pages){
    await auditPage(page,route,{h1:38.5,h2:22.5,h3:19.5,body:18.5},'desktop');
  }
  await page.close();
});

test('CN V23 mobile typography ceiling across every public page', async ({browser})=>{
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true});
  for(const route of pages){
    await auditPage(page,route,{h1:33.5,h2:21.5,h3:19.5,body:17.5},'mobile');
  }
  await page.close();
});
