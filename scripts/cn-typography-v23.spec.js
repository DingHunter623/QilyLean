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

const reps = new Set(['/','/lean/','/notes/','/knowledge/','/briefs/','/resources/','/about/']);

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
      small:read('main small, main .breadcrumbs, main .meta, main .article-meta').slice(0,24),
      labels:read('main .eyebrow, main .hero-eyebrow, main .module-eyebrow, main .section-kicker, main .module-kicker, main .section-head>small').slice(0,24),
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
      footer:(()=>{
        const footer=document.querySelector('footer.footer');
        const group=document.querySelector('.footer-actions');
        if(!footer||!group)return null;
        const site=footer.querySelector('.footer-home');
        const records=[...footer.querySelectorAll('.footer-records>a')];
        const fr=footer.getBoundingClientRect();
        const actionEls=[...group.querySelectorAll('button[data-qily-footer-action]')];
        const itemEls=[site,...actionEls,...records].filter(Boolean);
        const groups=itemEls.map(el=>{
          const r=el.getBoundingClientRect();
          return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};
        });
        return {
          position:getComputedStyle(footer).position,
          bottom:innerHeight-fr.bottom,
          siteText:site?(site.textContent||'').trim():'',
          siteFont:site?parseFloat(getComputedStyle(site).fontSize):0,
          filingState:footer.getAttribute('data-qily-footer-filing')||'standard',
          groups,
          viewport:document.documentElement.clientWidth,
          documentWidth:document.documentElement.scrollWidth,
          actions:actionEls.map(b=>({
            action:b.getAttribute('data-qily-footer-action'),
            text:(b.textContent||'').trim(),
            width:b.getBoundingClientRect().width,
            height:b.getBoundingClientRect().height,
            font:parseFloat(getComputedStyle(b).fontSize)
          })),
          records:records.map(a=>({
            text:(a.textContent||'').trim(),
            width:a.getBoundingClientRect().width,
            height:a.getBoundingClientRect().height,
            font:parseFloat(getComputedStyle(a).fontSize)
          }))
        };
      })()
    };
  });
  expect(data.href.some(x=>x.includes('qilylean-vi-v2.css?v=20261006-cn-vi-v48-hero-label-parity')), route+' must load V47 VI').toBeTruthy();
  for(const x of data.h1) expect(x.px, route+' H1 '+x.text).toBeLessThanOrEqual(limits.h1);
  for(const x of data.h2) expect(x.px, route+' H2 '+x.text).toBeLessThanOrEqual(limits.h2);
  for(const x of data.h3) expect(x.px, route+' H3 '+x.text).toBeLessThanOrEqual(limits.h3);
  for(const x of data.body) expect(x.px, route+' body '+x.text).toBeLessThanOrEqual(limits.body);
  for(const x of data.small) expect(x.px, route+' small '+x.text).toBeGreaterThanOrEqual(19.9);
  for(const x of data.labels){
    expect(x.px, route+' module label floor '+x.text).toBeGreaterThanOrEqual(20.5);
    expect(x.px, route+' module label ceiling '+x.text).toBeLessThanOrEqual(21.5);
  }
  if(label==='desktop' && data.header && data.header.hasNav){
    expect(data.header.height, route+' desktop header height parity').toBeGreaterThanOrEqual(82);
    expect(data.header.height, route+' desktop header height parity').toBeLessThanOrEqual(85);
    expect(data.header.navBoxTopGap, route+' desktop nav box top parity').toBeGreaterThanOrEqual(12);
    expect(data.header.navBoxTopGap, route+' desktop nav box top parity').toBeLessThanOrEqual(14.5);
  }
  if(label==='desktop' && data.footer){
    expect(data.footer.position, route+' China footer fixed visual parity').toBe('fixed');
    expect(Math.abs(data.footer.bottom), route+' footer bottom alignment').toBeLessThanOrEqual(1);
    expect(data.footer.siteText, route+' footer filed-site label').toBe('精益制造经验分享');
    expect(data.footer.siteFont, route+' footer site-label type').toBeGreaterThanOrEqual(19.5);
    expect(data.footer.siteFont, route+' footer site-label type').toBeLessThanOrEqual(20.5);
    expect(data.footer.actions.map(x=>x.action), route+' footer action semantics').toEqual(['top','share']);
    expect(data.footer.actions.map(x=>x.text), route+' footer action labels').toEqual(['顶部','分享当前']);
    for(const action of data.footer.actions){
      expect(action.height, route+' footer button '+action.text).toBeGreaterThanOrEqual(39);
      expect(action.height, route+' footer button '+action.text).toBeLessThanOrEqual(41);
      expect(action.font, route+' footer button '+action.text+' type').toBeGreaterThanOrEqual(19.5);
      expect(action.font, route+' footer button '+action.text+' type').toBeLessThanOrEqual(20.5);
    }
    expect(data.footer.filingState, route+' footer filing state').toBe('standard');
    expect(data.footer.records.length, route+' footer filing record count').toBe(2);
    for(const record of data.footer.records){
      expect(record.font, route+' footer filing type '+record.text).toBeGreaterThanOrEqual(19.5);
      expect(record.font, route+' footer filing type '+record.text).toBeLessThanOrEqual(20.5);
    }
    expect(data.footer.documentWidth, route+' must not create horizontal page overflow').toBeLessThanOrEqual(data.footer.viewport+1);
    const gaps=[];
    for(let i=1;i<data.footer.groups.length;i++) gaps.push(data.footer.groups[i].left-data.footer.groups[i-1].right);
    expect(Math.abs(data.footer.actions[0].width-data.footer.actions[1].width), route+' top/share must use the same width').toBeLessThanOrEqual(1);
    expect(Math.min(...gaps), route+' distributed footer gap lower bound').toBeGreaterThan(8);
    expect(Math.max(...gaps)-Math.min(...gaps), route+' five footer modules must be evenly distributed').toBeLessThanOrEqual(1);
    expect(Math.max(...data.footer.actions.map(x=>x.width)), route+' action buttons stay compact').toBeLessThan(Math.min(...data.footer.records.map(x=>x.width)));
  }
  if(reps.has(route)){
    fs.mkdirSync('visual-cn-typography-v23',{recursive:true});
    const slug=route==='/'?'home':route.replace(/^\/+|\/+$/g,'').replace(/\//g,'-');
    await page.screenshot({path:`visual-cn-typography-v23/${slug}-${label}.png`,fullPage:true});
  }
  return data;
}

test('CN V47 desktop typography parity across every public page', async ({browser})=>{
  expect(pages.length).toBeGreaterThanOrEqual(19);
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  for(const route of pages){
    await auditPage(page,route,{h1:38.5,h2:22.5,h3:19.5,body:20.5},'desktop');
  }
  await page.close();
});

test('CN V47 mobile typography parity across every public page', async ({browser})=>{
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true});
  for(const route of pages){
    await auditPage(page,route,{h1:33.5,h2:21.5,h3:19.5,body:20.5},'mobile');
  }
  await page.close();
});
