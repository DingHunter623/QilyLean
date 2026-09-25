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
      })(),
      axis:(()=>{
        const sels=['.hero>.hero-inner','.page-hero>.content','.section>.content','.cn-aircraft-showcase>.content'];
        return sels.map(sel=>{
          const el=document.querySelector(sel);if(!el)return null;
          const r=el.getBoundingClientRect();return {sel,left:r.left,right:r.right,width:r.width};
        }).filter(Boolean);
      })(),
      footer:(()=>{
        const legal=document.querySelector('footer.footer');
        const dock=document.querySelector('.footer-actions');
        if(!dock)return null;
        const dr=dock.getBoundingClientRect();
        const buttons=[...dock.querySelectorAll('button[data-qily-footer-action]')].map(b=>{
          const r=b.getBoundingClientRect();
          return {action:b.getAttribute('data-qily-footer-action'),text:(b.textContent||'').trim(),width:r.width,height:r.height};
        });
        return {
          dock:{left:dr.left,right:dr.right,bottom:innerHeight-dr.bottom,height:dr.height,position:getComputedStyle(dock).position,background:getComputedStyle(dock).backgroundColor},
          legal:legal?{position:getComputedStyle(legal).position}:null,
          buttons
        };
      })()
    };
  });
  expect(data.href.some(x=>x.includes('qilylean-vi-v2.css?v=20260926-cn-vi-v27-axis-footer-dock')), route+' must load V27 VI').toBeTruthy();
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
  if(label==='desktop'){
    for(const box of data.axis){
      expect(box.width, route+' '+box.sel+' canonical content width').toBeGreaterThanOrEqual(1178);
      expect(box.width, route+' '+box.sel+' canonical content width').toBeLessThanOrEqual(1181);
      expect(Math.abs(box.left-(1440-box.width)/2), route+' '+box.sel+' centered on 1180 axis').toBeLessThanOrEqual(1.5);
    }
    if(data.footer){
      expect(data.footer.dock.position, route+' footer dock position').toBe('fixed');
      expect(data.footer.dock.bottom, route+' footer dock bottom').toBeLessThanOrEqual(0.5);
      expect(data.footer.dock.height, route+' footer dock international height').toBeGreaterThanOrEqual(56);
      expect(data.footer.dock.height, route+' footer dock international height').toBeLessThanOrEqual(60);
      expect(data.footer.dock.background, route+' footer dock deep-teal background').toBe('rgb(15, 75, 90)');
      expect(data.footer.buttons.length, route+' footer dock seven actions').toBe(7);
      expect(data.footer.buttons.map(x=>x.action)).toEqual(['home','top','parent','previous','knowledge','share','about']);
      expect(data.footer.buttons.map(x=>x.text)).toEqual(['首页','顶部','上一层级','上一网页','知识索引','分享当前','关于我们']);
      const widths=data.footer.buttons.map(x=>x.width);
      expect(Math.max(...widths)-Math.min(...widths), route+' footer buttons equal width').toBeLessThanOrEqual(1.5);
      for(const button of data.footer.buttons){
        expect(button.height, route+' footer button height '+button.text).toBeGreaterThanOrEqual(39);
        expect(button.height, route+' footer button height '+button.text).toBeLessThanOrEqual(41);
      }
      if(data.footer.legal) expect(data.footer.legal.position, route+' legal filing footer must not be viewport-fixed').not.toBe('fixed');
    }
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
