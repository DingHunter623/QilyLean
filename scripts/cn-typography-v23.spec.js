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

// Full materialization includes the 381-issue brief archive.
test.setTimeout(Math.max(60_000, pages.length * 1500));

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
      briefReading:document.body.matches('[data-qily-brief-parity="v1"]') && !!document.querySelector('main#main[data-qily-brief-content="v2"]'),
      translation:(()=>{
        const controls=[...document.querySelectorAll('[data-qily-header-utility="translation"]')];
        const control=document.querySelector('#qilyCnTranslateV3');
        const inner=document.querySelector('.site-header .header-inner');
        const header=document.querySelector('header.site-header');
        const select=control&&control.querySelector('select[aria-label="选择网站语言"]');
        if(!control||!select||!header)return {count:controls.length,visible:false};
        const r=control.getBoundingClientRect(),h=header.getBoundingClientRect(),s=select.getBoundingClientRect();
        const style=getComputedStyle(select);
        return {
          count:controls.length,
          directMount:control.parentElement===inner,
          visible:style.display!=='none'&&style.visibility!=='hidden'&&Number(style.opacity)>0&&s.width>0&&s.height>0,
          enabled:!select.disabled&&style.pointerEvents!=='none',
          insideHeader:r.left>=h.left-1&&r.right<=h.right+1&&r.top>=h.top-1&&r.bottom<=h.bottom+1,
          insideViewport:r.left>=-1&&r.right<=document.documentElement.clientWidth+1
        };
      })(),
      heroLabels:[...document.querySelectorAll('.hero .eyebrow,.page-hero .hero-eyebrow,.module-hero .module-eyebrow')].map(el=>{
        const style=getComputedStyle(el);
        return {text:el.textContent.trim(),color:style.color,fill:style.webkitTextFillColor,weight:style.fontWeight};
      }),
      h1:read('main h1'),
      h2:read('main h2'),
      h3:read('main h3'),
      body:read(document.body.hasAttribute('data-qily-brief-parity')?'main p, main li, main td, main th':'main .article-body p, main .section-head p').slice(0,24),
      briefCaptions:read('main figcaption, main .date, main time, main .tag').slice(0,24),
      small:read('main small, main .breadcrumbs, main .meta, main .article-meta').slice(0,24),
      labels:read('main .eyebrow, main .hero-eyebrow, main .module-eyebrow, main .section-kicker, main .module-kicker, main .section-head>small').slice(0,24),
      // Complete Selected Brief comparison-table audit on all 381 cloned issues.
      // Check rendered widths, not simply CSS selector presence. Short label
      // columns may not consume a third/half of the article unnecessarily.
      comparisonTables:[...document.querySelectorAll('main .qily-brief-table-scroll>table')].map((table,index)=>{
        const head=table.querySelector('thead tr:first-child');
        const headers=head?[...head.children].filter(el=>/^(TH|TD)$/.test(el.tagName)):[];
        if(headers.length!==2 && headers.length!==3)return null;
        if(headers.some(el=>el.colSpan>1 || el.rowSpan>1))return null;
        const rows=[...table.querySelectorAll('tbody tr')].filter(row=>row.querySelectorAll(':scope>td').length===headers.length);
        if(rows.length<2)return null;
        const labels=rows.map(row=>(row.querySelector(':scope>td:first-child')?.textContent||'').trim().replace(/\\s+/g,''));
        const heading=(headers[0].textContent||'').trim().replace(/\\s+/g,'');
        if(!labels.length || labels.some(x=>!x || x.length>16) || heading.length>16)return null;
        const first=rows[0].querySelector(':scope>td:first-child');
        if(!first)return null;
        const tdStyle=getComputedStyle(first),tableRect=table.getBoundingClientRect();
        const cellRect=first.getBoundingClientRect();
        const font=parseFloat(tdStyle.fontSize)||20;
        const pad=(parseFloat(tdStyle.paddingLeft)||0)+(parseFloat(tdStyle.paddingRight)||0);
        const estimatedNeeded=Math.max(heading.length,...labels.map(x=>x.length))*font+pad+12;
        const wastage=Math.max(0,cellRect.width-estimatedNeeded);
        const headerStyle=getComputedStyle(headers[0]);
        return {index,columns:headers.length,header:heading,rows:rows.length,
          width:tableRect.width,firstWidth:cellRect.width,wastage,estimatedNeeded,
          firstShare:cellRect.width/Math.max(1,tableRect.width),
          nowrap:tdStyle.whiteSpace==='nowrap',headerBg:headerStyle.backgroundColor,
          headerColor:headerStyle.color,authoredComparison:!!table.closest('.lean-brief-table')
        };
      }).filter(Boolean),
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
  expect(data.href.some(x=>x.includes('qilylean-vi-v2.css?v=20261008-cn-vi-v50-cache-revalidation')), route+' must load the current VI cache version').toBeTruthy();
  for(const x of data.heroLabels){
    expect(x.color, route+' hero label color '+x.text).toBe('rgb(255, 227, 155)');
    expect(x.fill, route+' hero label text fill '+x.text).toBe('rgb(255, 227, 155)');
    expect(x.weight, route+' hero label weight '+x.text).toBe('400');
  }
  if(/^\/briefs\/archive\/\d{4}-\d{2}-\d{2}\/$/.test(route)) expect(data.briefReading,route+' brief rendering markers').toBeTruthy();
  if(data.briefReading){
    for(const item of data.comparisonTables){
      if(item.width<=600)continue;
      const detail=route+' '+label+' '+item.columns+'col '+item.header+' (w='+Math.round(item.width)+', first='+Math.round(item.firstWidth)+', estimated='+Math.round(item.estimatedNeeded)+')';
      // A visible oversize first column is a layout defect even when all
      // typography and scroll containment checks happen to pass.
      expect(item.wastage,detail+' avoid wasted short-key column').toBeLessThanOrEqual(Math.max(85,item.width*0.085));
      // On authentic two/three-column brief comparisons the short key must
      // remain intact. Tables with 4+ columns are intentionally excluded.
      expect(item.nowrap,detail+' short labels must stay on one line').toBe(true);
      if(item.authoredComparison){
        expect(item.headerBg,detail+' international deep-teal header').toBe('rgb(15, 75, 90)');
        expect(item.headerColor,detail+' clear header text').toBe('rgb(255, 255, 255)');
      }
    }
    expect(data.translation.count,route+' public translator must be unique').toBe(1);
    for(const key of ['directMount','visible','enabled','insideHeader','insideViewport']){
      expect(data.translation[key],route+' public translator '+key).toBe(true);
    }
    // Authored brief components use a larger, explicit reading hierarchy;
    // retain the existing shell contract and the legacy limits for other pages.
    expect(route).toMatch(/^\/briefs\/archive\/\d{4}-\d{2}-\d{2}\/$/);
    const scale=label==='mobile'?{h1:[29.9,30.1],h2:26,h3:23}:{h1:[29.9,36.1],h2:28,h3:24};
    expect(data.h1.length, route+' one accessible brief title').toBe(1);
    for(const x of data.h1){
      expect(x.px, route+' brief H1 floor '+x.text).toBeGreaterThanOrEqual(scale.h1[0]);
      expect(x.px, route+' brief H1 ceiling '+x.text).toBeLessThanOrEqual(scale.h1[1]);
    }
    for(const key of ['h2','h3']) for(const x of data[key]){
      expect(x.px, route+' brief '+key+' token '+x.text).toBeCloseTo(scale[key],1);
    }
    for(const x of data.body) expect(x.px, route+' brief body token '+x.text).toBeCloseTo(20,1);
    for(const x of data.briefCaptions) expect(x.px,route+' brief caption token '+x.text).toBeCloseTo(18,1);
    for(const x of data.small){
      expect(x.px, route+' brief caption floor '+x.text).toBeGreaterThanOrEqual(17.9);
      expect(x.px, route+' brief caption ceiling '+x.text).toBeLessThanOrEqual(20.5);
    }
  }else{
    for(const x of data.h1) expect(x.px, route+' H1 '+x.text).toBeLessThanOrEqual(limits.h1);
    for(const x of data.h2) expect(x.px, route+' H2 '+x.text).toBeLessThanOrEqual(limits.h2);
    for(const x of data.h3) expect(x.px, route+' H3 '+x.text).toBeLessThanOrEqual(limits.h3);
    for(const x of data.body) expect(x.px, route+' body '+x.text).toBeLessThanOrEqual(limits.body);
    for(const x of data.small) expect(x.px, route+' small '+x.text).toBeGreaterThanOrEqual(19.9);
  }
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

/* Visual acceptance for 2026-10-12 screenshot: computed cell geometry, not
 * merely the presence of CSS or an overflow wrapper. */
test('CN selected brief short-key comparison table has content-driven widths', async ({browser})=>{
  for(const [label,width,height] of [['desktop',1440,900],['mobile',390,844]]){
    const page=await browser.newPage({viewport:{width,height},isMobile:label==='mobile'});
    const response=await page.goto(BASE+'/briefs/archive/2026-09-13/',{waitUntil:'domcontentloaded'});
    expect(response && response.ok()).toBeTruthy();
    const metrics=await page.evaluate(()=>{
      const tables=[...document.querySelectorAll('main table')];
      const table=tables.find(t=>{
        const th=[...t.querySelectorAll('thead th')].map(el=>el.textContent.trim());
        return th.length===2 && th[0]==='成果类别' && th[1]==='评价重点';
      });
      if(!table)return null;
      const cells=[...table.querySelectorAll('tbody tr')].map(row=>row.querySelector('td:first-child')).filter(Boolean);
      const lines=cells.map(cell=>{
        const range=document.createRange();range.selectNodeContents(cell);
        return new Set([...range.getClientRects()].map(r=>Math.round(r.top))).size;
      });
      const rect=table.getBoundingClientRect(),first=cells[0].getBoundingClientRect();
      return {
        total:rect.width,firstWidth:first.width,secondWidth:rect.width-first.width,
        lines,layout:getComputedStyle(table).tableLayout,
        viewport:document.documentElement.clientWidth,
        documentWidth:document.documentElement.scrollWidth
      };
    });
    expect(metrics,'missing semantic value-results comparison table').not.toBeNull();
    expect(metrics.layout).toBe('auto');
    expect(metrics.firstWidth/metrics.total,label+' compact key column').toBeLessThan(0.35);
    expect(metrics.secondWidth/metrics.total,label+' evidence column has room').toBeGreaterThan(0.65);
    expect(metrics.lines.every(n=>n===1),label+' short key labels stay one line').toBe(true);
    expect(metrics.documentWidth,label+' no document-wide horizontal overflow').toBeLessThanOrEqual(metrics.viewport+1);
    fs.mkdirSync('visual-cn-typography-v23',{recursive:true});
    await page.screenshot({path:`visual-cn-typography-v23/brief-2026-09-13-short-key-${label}.png`,fullPage:true});
    await page.close();
  }
});

/* 2026-10-12 second screenshot: compare actual column geometry against the
 * approved international three-column reference, not just CSS selectors.
 * The previous 50/50 fix never inspected 3-column tables. */
test('CN curated brief three-column table reserves width for real explanations', async ({browser})=>{
  for(const [label,width,height] of [['desktop',1440,900],['mobile',390,844]]){
    const page=await browser.newPage({viewport:{width,height},isMobile:label==='mobile'});
    const response=await page.goto(BASE+'/briefs/archive/2026-09-13/',{waitUntil:'domcontentloaded'});
    expect(response && response.ok()).toBeTruthy();
    const metrics=await page.evaluate(()=>{
      const table=[...document.querySelectorAll('main table')].find(t=>{
        const hs=[...t.querySelectorAll('thead tr:first-child th')].map(h=>h.textContent.trim());
        return hs.join('|')==='核心工作|需要建立的内容|应当回答的问题';
      });
      if(!table)return null;
      const tr=table.querySelector('tbody tr');
      if(!tr)return null;
      const cells=[...tr.querySelectorAll('td')], tableRect=table.getBoundingClientRect();
      const labels=[...table.querySelectorAll('tbody tr>td:first-child')];
      const lineCounts=labels.map(cell=>{
        const range=document.createRange();range.selectNodeContents(cell);
        return new Set([...range.getClientRects()].map(r=>Math.round(r.top))).size;
      });
      return {
        layout:getComputedStyle(table).tableLayout,
        fractions:cells.map(cell=>cell.getBoundingClientRect().width/tableRect.width),
        lineCounts,
        docWidth:document.documentElement.scrollWidth,
        viewport:document.documentElement.clientWidth
      };
    });
    expect(metrics,'three-column comparison must be present').not.toBeNull();
    expect(metrics.layout,label+' table layout').toBe('auto');
    expect(metrics.fractions[0],label+' short core-work column < 28%').toBeLessThan(0.28);
    expect(metrics.fractions[1],label+' explanations have adequate width').toBeGreaterThan(0.35);
    expect(metrics.lineCounts.every(n=>n===1),label+' labels stay on one line').toBe(true);
    expect(metrics.docWidth,label+' no page horizontal overflow').toBeLessThanOrEqual(metrics.viewport+1);
    fs.mkdirSync('visual-cn-typography-v23',{recursive:true});
    await page.screenshot({path:`visual-cn-typography-v23/brief-2026-09-13-three-columns-${label}.png`,fullPage:true});
    await page.close();
  }
});
