const {test,expect}=require('@playwright/test');
const fs=require('fs'),path=require('path');
const intBase=process.env.QILY_INT_BASE||'http://127.0.0.1:4173';
const cnBase=process.env.QILY_CN_BASE||'http://127.0.0.1:4174';
async function settledGoto(page,url,options){
 const response=await page.goto(url,options);
 if(new URL(url).origin===new URL(intBase).origin){
  // R8 reasserts final CSS at 1400ms; compare the settled source dock.
  await page.waitForTimeout(1600);
  await page.waitForFunction(()=>!document.getElementById('qilyVisualAuthorityR8')||document.head.lastElementChild?.id==='qilyVisualAuthorityR8');
 }
 return response;
}


/* QILY-CN-WECHAT-PILL-20261026 | production screenshot regression.
 * Verify the actual CSS result (not simply the presence of a stylesheet or a PR).
 * The WeChat button must occupy exactly the same visual row as the two URL pills.
 */
test('China About Qily259 matches both URL pills in style and alignment',async({page})=>{
  test.setTimeout(120000);
  await page.addInitScript(()=>{
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{
      writeText:async value=>{window.__qilyTestCopiedValue=value;}
    }});
  });
  for(const width of [1680,390]){
    await page.setViewportSize({width,height:960});
    await settledGoto(page,cnBase+'/about/',{waitUntil:'load'});
    await page.evaluate(()=>document.fonts.ready);
    await page.waitForTimeout(1700);
    const cards=page.locator('.qily-unified-qr-grid > .qily-unified-qr-card');
    await expect(cards).toHaveCount(3);
    const metrics=await cards.evaluateAll(nodes=>nodes.map(node=>{
      const pill=node.querySelector('.qily-unified-qr-value');
      const art=node.querySelector('.qily-unified-qr-art');
      const p=pill.getBoundingClientRect(),q=art.getBoundingClientRect(),s=getComputedStyle(pill);
      return {label:pill.textContent.trim(),top:p.top,bottom:p.bottom,height:p.height,relativeTop:p.top-node.getBoundingClientRect().top,labelGap:p.top-q.bottom,
        background:s.backgroundColor,color:s.color,borderRadius:s.borderRadius,
        fontSize:s.fontSize,fontWeight:s.fontWeight,lineHeight:s.lineHeight,
        border:s.borderTopWidth,padding:s.padding,display:s.display,
        qrWidth:q.width,qrHeight:q.height,qrTop:q.top};
    }));
    expect(metrics.map(m=>m.label)).toEqual(['qilylean.com','qilylean.cn','Qily259']);
    for(const item of metrics){
      expect(item.background,JSON.stringify(metrics)).toBe('rgb(15, 75, 90)');
      expect(item.color,JSON.stringify(metrics)).toBe('rgb(255, 255, 255)');
      expect(item.height,JSON.stringify(metrics)).toBeGreaterThanOrEqual(43);
      expect(item.borderRadius,JSON.stringify(metrics)).toBe('24px');
      if(width>=900)expect(Math.abs(item.top-metrics[0].top),JSON.stringify(metrics)).toBeLessThanOrEqual(1);
      expect(Math.abs(item.labelGap-metrics[0].labelGap),JSON.stringify(metrics)).toBeLessThanOrEqual(1);
      expect(Math.abs(item.height-metrics[0].height),JSON.stringify(metrics)).toBeLessThanOrEqual(1);
      if(width>=900)expect(Math.abs(item.qrTop-metrics[0].qrTop),JSON.stringify(metrics)).toBeLessThanOrEqual(1);
      expect(Math.abs(item.qrWidth-metrics[0].qrWidth),JSON.stringify(metrics)).toBeLessThanOrEqual(1);
      expect(Math.abs(item.qrHeight-metrics[0].qrHeight),JSON.stringify(metrics)).toBeLessThanOrEqual(1);
      for(const key of ['fontSize','fontWeight','lineHeight','border','padding','display'])
        expect(item[key],JSON.stringify(metrics)).toBe(metrics[0][key]);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth),'About horizontal overflow').toBeLessThanOrEqual(width+1);
    await page.locator('.qily-unified-qr-grid').screenshot({path:'test-results/cn-about-wechat-pill-'+width+'.png'});
    await page.locator('#qilyCnWechatValue').click();
    await expect(page.locator('.qily-unified-qr-card:nth-child(3) .qily-about-copy-feedback')).toHaveClass(/is-visible/);
    expect(await page.evaluate(()=>window.__qilyTestCopiedValue)).toBe('Qily259');
    const post=await cards.evaluateAll(nodes=>nodes.map(node=>{
      const b=node.querySelector('.qily-unified-qr-value').getBoundingClientRect();
      return {relativeTop:b.top-node.getBoundingClientRect().top,height:b.height};
    }));
    for(let i=0;i<3;i++){
      expect(Math.abs(post[i].relativeTop-metrics[i].relativeTop),'Click-to-copy must not shift pill within card '+i).toBeLessThanOrEqual(1);
      expect(Math.abs(post[i].height-metrics[i].height),'Click-to-copy must not resize pill '+i).toBeLessThanOrEqual(1);
    }
  }
});


/* QILY-DUAL-SITE-FOUR-CARD-TIAN-20261026: user-annotated 2x2 grid parity. */
test('both domains arrange only the two nominated four-card modules in a balanced 2x2 grid',async({page})=>{
  test.setTimeout(120000);
  const cases=[
    {url:intBase+'/projects/',selector:'#public-verification-structure .module-grid.four',tag:'com-projects'},
    {url:cnBase+'/notes/',selector:'#public-verification-structure .module-grid.four',tag:'cn-projects'},
    {url:intBase+'/projects/lean-improvement-evidence/',selector:'.module-grid.four:has(> .module-card .financial-proof)',tag:'com-professional-value'},
    {url:cnBase+'/archive/practice/lean-improvement-evidence/',selector:'.module-grid.four:has(> .module-card .financial-proof)',tag:'cn-professional-value'}
  ];
  for(const width of [1588,390]){
    await page.setViewportSize({width,height:960});
    for(const sample of cases){
      const response=await settledGoto(page,sample.url,{waitUntil:'load',timeout:45000});
      expect(response.status(),sample.url).toBeLessThan(400);
      await page.evaluate(()=>document.fonts.ready);
      const grid=page.locator(sample.selector);
      await expect(grid,sample.url+' target grid').toHaveCount(1);
      const cards=grid.locator(':scope > .module-card');
      await expect(cards,sample.url+' exactly four cards').toHaveCount(4);
      const geometry=await grid.evaluate(node=>{
        const r=node.getBoundingClientRect();
        const items=[...node.children].filter(el=>el.classList.contains('module-card')).map(el=>{
          const b=el.getBoundingClientRect();
          return {left:b.left,top:b.top,width:b.width,height:b.height,right:b.right};
        });
        return {width:r.width,scroll:document.documentElement.scrollWidth,items,
          columns:getComputedStyle(node).gridTemplateColumns};
      });
      expect(geometry.scroll,sample.url+' horizontal overflow '+width).toBeLessThanOrEqual(width+1);
      const [a,b,c,d]=geometry.items;
      if(width>=720){
        expect(Math.abs(a.top-b.top),sample.url+' row 1 aligned').toBeLessThanOrEqual(2);
        expect(Math.abs(c.top-d.top),sample.url+' row 2 aligned').toBeLessThanOrEqual(2);
        expect(Math.abs(a.left-c.left),sample.url+' first column aligned').toBeLessThanOrEqual(2);
        expect(Math.abs(b.left-d.left),sample.url+' second column aligned').toBeLessThanOrEqual(2);
        expect(b.left-a.right,sample.url+' horizontal gap').toBeGreaterThanOrEqual(8);
        expect(c.top-Math.max(a.top+a.height,b.top+b.height),sample.url+' vertical gap').toBeGreaterThanOrEqual(8);
        expect(Math.abs(a.width-b.width),sample.url+' equal card widths').toBeLessThanOrEqual(2);
        expect(Math.abs(a.height-b.height),sample.url+' row 1 equal height').toBeLessThanOrEqual(2);
        expect(Math.abs(c.height-d.height),sample.url+' row 2 equal height').toBeLessThanOrEqual(2);
      }else{
        for(let i=1;i<4;i++){
          expect(Math.abs(geometry.items[i].left-a.left),sample.url+' mobile single column').toBeLessThanOrEqual(2);
          expect(geometry.items[i].top-geometry.items[i-1].top,sample.url+' mobile card order').toBeGreaterThan(4);
        }
      }
      await grid.screenshot({path:'test-results/four-card-'+sample.tag+'-'+width+'.png'});
    }
  }
});


/* QILY-UNIFIED-EXACT-CARD-COUNT-GRIDS-20261026
 * Test the CSS grid's *rendered* card geometry, not stylesheet text.
 * These shared rules cover all 3-card and 4-card module grids on both sites.
 */
test('sitewide three/four module card VI is consistent between COM and CN', async({page})=>{
  test.setTimeout(180000);
  const routes=[
    {base:intBase,route:'/projects/'},
    {base:cnBase,route:'/notes/'},
    {base:intBase,route:'/projects/lean-improvement-evidence/'},
    {base:cnBase,route:'/archive/practice/lean-improvement-evidence/'}
  ];
  let checkedThree=0,checkedFour=0;
  for(const width of [1588,390]){
    await page.setViewportSize({width,height:960});
    for(const {base,route} of routes){
      const response=await settledGoto(page,base+route,{waitUntil:'load',timeout:45000});
      expect(response.status(),base+route+' HTTP status').toBeLessThan(400);
      await page.evaluate(()=>document.fonts.ready);
      const layouts=await page.evaluate(()=>{
        const sel='.module-grid.three:has(> .module-card:nth-child(3):last-child),.module-grid.four:has(> .module-card:nth-child(4):last-child)';
        return [...document.querySelectorAll('main '+sel.replaceAll(',',',main '))].map(el=>{
          const boxes=[...el.children].filter(x=>x.classList.contains('module-card')).map(x=>{
            const r=x.getBoundingClientRect();
            return {x:r.left,y:r.top,w:r.width,h:r.height,right:r.right,bottom:r.bottom};
          });
          return {type:el.classList.contains('three')?3:4,boxes,columns:getComputedStyle(el).gridTemplateColumns,
            overflow:el.scrollWidth-el.clientWidth};
        });
      });
      for(const g of layouts){
        if(g.type===3)checkedThree++;
        else checkedFour++;
        expect(g.boxes.length).toBe(g.type);
        expect(g.overflow,base+route+' grid overflow '+JSON.stringify(g)).toBeLessThanOrEqual(1);
        const b=g.boxes;
        if(width>=900){
          if(g.type===3){
            expect(Math.abs(b[0].y-b[1].y),JSON.stringify({route,g})).toBeLessThanOrEqual(2);
            expect(Math.abs(b[1].y-b[2].y),JSON.stringify({route,g})).toBeLessThanOrEqual(2);
            expect(b[1].x-b[0].right).toBeGreaterThanOrEqual(4);
            expect(b[2].x-b[1].right).toBeGreaterThanOrEqual(4);
            expect(Math.abs(b[0].w-b[1].w)).toBeLessThanOrEqual(2);
            expect(Math.abs(b[1].w-b[2].w)).toBeLessThanOrEqual(2);
          }else{
            expect(Math.abs(b[0].y-b[1].y)).toBeLessThanOrEqual(2);
            expect(Math.abs(b[2].y-b[3].y)).toBeLessThanOrEqual(2);
            expect(Math.abs(b[0].x-b[2].x)).toBeLessThanOrEqual(2);
            expect(Math.abs(b[1].x-b[3].x)).toBeLessThanOrEqual(2);
            expect(b[1].x-b[0].right).toBeGreaterThanOrEqual(4);
            expect(b[2].y-Math.max(b[0].bottom,b[1].bottom)).toBeGreaterThanOrEqual(4);
            expect(Math.abs(b[0].w-b[1].w)).toBeLessThanOrEqual(2);
          }
        } else {
          for(let i=1;i<g.boxes.length;i++){
            expect(Math.abs(b[i].x-b[0].x),base+route+' mobile alignment').toBeLessThanOrEqual(2);
            expect(b[i].y-b[i-1].bottom,base+route+' mobile vertical gap').toBeGreaterThanOrEqual(4);
          }
        }
      }
      expect(await page.evaluate(()=>document.documentElement.scrollWidth),base+route+' document horizontal overflow').toBeLessThanOrEqual(width+1);
    }
  }
  expect(checkedThree,'At least two actual 3-card groups on two domains').toBeGreaterThanOrEqual(2);
  expect(checkedFour,'At least two actual 4-card groups on two domains').toBeGreaterThanOrEqual(2);
});

const labels=['回到顶部','上一网页','本站搜索','分享当前'];
const actions=['top','previous','search','current'];
const bridges=['/global-knowledge/briefs/','/links/cn-public/','/global-knowledge/','/global-knowledge/terminology/','/global-knowledge/library/','/global-knowledge/view/'];
for(const width of [320,390,820,1180,1600]){
 test(`both sites share four readable footer actions at ${width}px`,async({page})=>{
  test.setTimeout(120000);await page.setViewportSize({width,height:900});let reference;
  for(const [base,route] of [[intBase,'/'],[intBase,'/about/'],...bridges.map(r=>[intBase,r]),[cnBase,'/'],[cnBase,'/resources/'],[cnBase,'/about/']]){
   await settledGoto(page,base+route,{waitUntil:'load'});await page.waitForFunction(()=>window.__qilyDockV58CaptureBound===true);
   const dock=page.locator('#floatDock');await expect(dock.locator('button')).toHaveText(labels);
   expect(await dock.locator('button').evaluateAll(nodes=>nodes.map(n=>n.dataset.action))).toEqual(actions);
   const g=await dock.evaluate(el=>{const s=getComputedStyle(el);return {width:document.documentElement.clientWidth,overflow:document.documentElement.scrollWidth-innerWidth,gap:s.gap,buttons:[...el.querySelectorAll('button')].map(b=>{const s=getComputedStyle(b),r=b.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,width:r.width,height:r.height,overflow:b.scrollWidth-b.clientWidth,font:s.fontSize,weight:s.fontWeight,family:s.fontFamily,radius:s.borderRadius};})};});
   expect(g.overflow,base+route+' horizontal overflow').toBeLessThanOrEqual(1);
   expect(Math.max(...g.buttons.map(b=>b.width)),`${base+route}: footer controls should fit their text`).toBeLessThanOrEqual(150);
   for(const b of g.buttons){expect(b.left).toBeGreaterThanOrEqual(0);expect(b.right).toBeLessThanOrEqual(g.width+1);expect(Math.round(b.height),`Footer action height below 36px: ${b.height}`).toBeGreaterThanOrEqual(36);expect(b.overflow).toBeLessThanOrEqual(1);}
   const typography=g.buttons.map(({font,weight,family,radius})=>({font,weight,family,radius}));
   if(!reference)reference={gap:g.gap,typography};else expect({gap:g.gap,typography},base+route+' shared action styling').toEqual(reference);
   expect(g.buttons.every(b=>Math.abs(b.top-g.buttons[0].top)<=1),JSON.stringify({base,route,g})).toBeTruthy();
   if(base===cnBase&&width<=620){
    const recordRow=page.locator('footer .footer-records');
    const geometry=await recordRow.evaluate(el=>({client:el.clientWidth,scroll:el.scrollWidth,items:[...el.querySelectorAll('a')].map(a=>{const r=a.getBoundingClientRect(),s=getComputedStyle(a);return {top:r.top,height:r.height,width:r.width,nowrap:s.whiteSpace,overflow:a.scrollWidth-a.clientWidth};})}));
    expect(geometry.items).toHaveLength(2);
    for(const item of geometry.items){expect(item.nowrap).toBe('nowrap');expect(item.overflow).toBeLessThanOrEqual(1);}
    expect(Math.abs(geometry.items[0].top-geometry.items[1].top),'both filing links must share one row').toBeLessThanOrEqual(1);
    expect(geometry.scroll,'both filings must fit within the phone width without lateral scrolling').toBeLessThanOrEqual(geometry.client+1);
   }
   if(base===cnBase){await expect(page.locator('footer .footer-records>a')).toHaveCount(2);await expect(page.locator('footer')).toContainText('湘ICP备2026041143号-1');await expect(page.locator('footer')).toContainText('湘公网安备43020002000443号');}else await expect(page.locator('body')).not.toContainText(/湘ICP备|湘公网安备/);
   await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,left:0,behavior:'instant'}));await dock.locator('[data-action="top"]').click();await expect.poll(()=>page.evaluate(()=>scrollY),{timeout:10000}).toBeLessThanOrEqual(10);
  }
 });
}
test('China About retains shared contacts, career and map navigation',async({page})=>{
 await settledGoto(page,cnBase+'/about/');await expect(page.locator('.qily-unified-qr-card')).toHaveCount(3);
 expect(await page.locator('a[href^="tel:"]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')).sort())).toEqual(['tel:13450014003','tel:15168120722','tel:17681788259']);
 await expect(page.locator('.qily-unified-email a')).toHaveAttribute('href','mailto:admin@qilylean.com');await expect(page.locator('.qily-about-career a')).toHaveAttribute('href','/archive/profile/experience/');
 expect(await page.locator('header nav a').allTextContents()).not.toContain('履历主线');
 for(const provider of ['amap','baidu','tencent','google','apple'])expect(await page.locator(`[data-qily-map-provider="${provider}"]`).count()).toBeGreaterThan(0);
});
test('China footer searches locally, shares current URL and follows real history',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(navigator,'share',{value:undefined});Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.__footerCopy=text;}}});});
 await settledGoto(page,cnBase+'/about/');await page.locator('#floatDock [data-action="search"]').click();await expect(page.locator('#qilyCnFooterSearch')).toBeVisible();
 await page.locator('#qilyCnFooterSearchInput').fill('SMED');await expect(page.locator('#qilyCnFooterSearch li a').first()).toBeVisible();await expect(page.locator('#qilyCnFooterSearch [role="status"]')).toContainText('找到');
 for(const href of await page.locator('#qilyCnFooterSearch li a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href'))))expect(href.startsWith('/')).toBeTruthy();
 await page.locator('[data-cn-search-close]').click();await page.locator('#floatDock [data-action="current"]').click();await expect.poll(()=>page.evaluate(()=>window.__footerCopy)).toContain(cnBase+'/about/');
 await settledGoto(page,cnBase+'/knowledge/');await page.locator('#floatDock [data-action="previous"]').click();await expect(page).toHaveURL(cnBase+'/about/');
 await settledGoto(page,cnBase+'/archive/practice/factory-layout/',{waitUntil:'domcontentloaded',timeout:45000});await expect(page.locator('#floatDock [data-action="current"]')).toBeVisible({timeout:15000});await expect(page.locator('#floatDock [data-action="back"]')).toHaveCount(0);
});
test('all China generated pages receive final VI and four-action first paint',async()=>{
 // The generator owns the cache version; a stale test literal must not reject
 // pages that correctly receive its current stylesheet during materialization.
 const authority=fs.readFileSync(path.join(process.cwd(),'cn-site/scripts/enforce-fullsite-axis.py'),'utf8').match(/^VI_HREF\s*=\s*"([^"]+)"/m);
 expect(authority,'canonical China VI stylesheet must be declared').not.toBeNull();
 const expectedHref=authority[1];
 let checked=0;
 function walk(dir){
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
   const f=path.join(dir,e.name);
   if(e.isDirectory())walk(f);
   else if(e.name.endsWith('.html')){
    const s=fs.readFileSync(f,'utf8');
    if(!s.includes('/assets/site.css'))continue;
    checked++;
    const styles=s.match(/<link\b[^>]*\bid=["']qilyCnSitewideVisualParityV1["'][^>]*>/g)||[];
    expect(styles,f+' canonical China VI stylesheet count').toHaveLength(1);
    expect(styles[0],f+' canonical China VI stylesheet version').toContain('href="'+expectedHref+'"');
    expect(s,f+' four-action first-paint footer').toContain('data-qily-footer-contract="top,previous,search,current"');
   }
  }
 }
 walk(path.join(process.cwd(),'cn-site'));
 expect(checked).toBeGreaterThanOrEqual(28);
});


test('paired knowledge summaries use readable two-by-two modules at desktop width',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  for(const [base,route] of [[intBase,'/knowledge/'],[cnBase,'/knowledge/']]){
    await settledGoto(page,base+route,{waitUntil:'load'});
    const cards=page.locator('#knowledge-stats .knowledge-stat-card');
    await expect(cards).toHaveCount(4);
    const rects=await cards.evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect(),s=getComputedStyle(n);return {x:r.left,y:r.top,width:r.width,height:r.height,font:parseFloat(s.fontSize)||0};}));
    expect(rects[0].width).toBeGreaterThan(180);
    expect(Math.abs(rects[0].y-rects[1].y),base+' first row misaligned').toBeLessThanOrEqual(1);
    expect(Math.abs(rects[2].y-rects[3].y),base+' second row misaligned').toBeLessThanOrEqual(1);
    expect(rects[2].y,base+' second row missing').toBeGreaterThan(rects[0].y+30);
    expect(Math.abs(rects[0].x-rects[2].x),base+' first column misaligned').toBeLessThanOrEqual(1);
    expect(Math.abs(rects[1].x-rects[3].x),base+' second column misaligned').toBeLessThanOrEqual(1);
  }
});

test('paired About pages keep all three QR frames at equal size and readable on phones',async({page})=>{
  for(const width of [390,1440]){
    await page.setViewportSize({width,height:900});
    for(const base of [intBase,cnBase]){
      await settledGoto(page,base+'/about/',{waitUntil:'load'});
      const frames=page.locator('.qily-unified-qr-card .qily-unified-qr-art');
      await expect(frames).toHaveCount(3);
      const g=await frames.evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect(),s=getComputedStyle(n);return {width:r.width,height:r.height,border:parseFloat(s.borderTopWidth)||0,child:n.querySelector('img')?.getBoundingClientRect().width||0};}));
      for(const rect of g){expect(rect.width).toBeGreaterThan(160);expect(Math.abs(rect.width-rect.height),base+' QR frame not square').toBeLessThanOrEqual(1);expect(rect.border).toBeGreaterThanOrEqual(4);}
      expect(Math.max(...g.map(r=>r.width))-Math.min(...g.map(r=>r.width)),base+' QR frame widths differ').toBeLessThanOrEqual(1);
      expect(Math.max(...g.map(r=>r.border))-Math.min(...g.map(r=>r.border)),base+' QR frame borders differ').toBeLessThanOrEqual(1);
    }
  }
});

test('international home secondary heading remains smaller than its H1',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await settledGoto(page,intBase+'/',{waitUntil:'load'});
  const h1=page.locator('.qily-home-conversion-hero h1');
  const h2=page.locator('#qily-core-services .qily-ia-heading h2');
  await expect(h1).toBeVisible();await expect(h2).toBeVisible();
  const sizes=await Promise.all([h1,h2].map(el=>el.evaluate(n=>parseFloat(getComputedStyle(n).fontSize)||0)));
  expect(sizes[1],'secondary delivery heading must not exceed the main hero').toBeLessThan(sizes[0]);
});

test('China desktop footer actions and both filings remain inside one aligned axis',async({page})=>{
  test.setTimeout(180000);
  for(const width of [1180,1440,1600,1920]){
    await page.setViewportSize({width,height:1000});
    await settledGoto(page,cnBase+'/',{waitUntil:'domcontentloaded',timeout:45000});
    await expect(page.locator('#floatDock button[data-action]')).toHaveCount(4);
    await expect(page.locator('footer.footer .footer-records>a')).toHaveCount(2);
    await page.waitForFunction(()=>window.__qilyDockV58CaptureBound===true);
    const g=await page.evaluate(()=>{
      const footer=document.querySelector('footer.footer');
      const inner=footer.querySelector('.footer-inner');
      const dock=inner.querySelector('#floatDock');
      const records=inner.querySelector('.footer-records');
      const items=[...dock.querySelectorAll('button[data-action]'),...records.querySelectorAll(':scope > a')];
      const box=el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
      return {viewport:innerWidth,footer:box(footer),inner:box(inner),dock:box(dock),records:box(records),
        dockPosition:getComputedStyle(dock).position,recordsPosition:getComputedStyle(records).position,
        actions:[...dock.querySelectorAll('button[data-action]')].map(el=>el.dataset.action),
        filings:[...records.querySelectorAll(':scope > a')].map(el=>el.textContent.trim()),
        items:items.map(box)};
    });
    expect(g.actions).toEqual(['top','previous','search','current']);
    expect(g.filings[0]).toContain('湘ICP备2026041143号-1');
    expect(g.filings[1]).toContain('湘公网安备43020002000443号');
    expect(g.inner.width,JSON.stringify(g)).toBeLessThanOrEqual(1182);
    expect(g.dockPosition,'dock must participate in footer flex layout').toBe('static');
    expect(g.recordsPosition,'filings must participate in footer flex layout').toBe('static');
    expect(g.items).toHaveLength(6);
    expect(Math.abs(g.items[5].right-g.inner.right),'last filing must align with content-right boundary: '+JSON.stringify(g)).toBeLessThanOrEqual(2);
    const y=g.items[0].top;
    for(const box of g.items){
      expect(box.left,JSON.stringify(g)).toBeGreaterThanOrEqual(g.inner.left-2);
      expect(box.right,JSON.stringify(g)).toBeLessThanOrEqual(g.inner.right+2);
      expect(box.left,JSON.stringify(g)).toBeGreaterThanOrEqual(-1);
      expect(box.right,JSON.stringify(g)).toBeLessThanOrEqual(width+1);
      expect(Math.abs(box.top-y),'all desktop footer controls and filings must share one row').toBeLessThanOrEqual(5);
    }
    for(let i=1;i<g.items.length;i++){
      expect(g.items[i].left-g.items[i-1].right,
        'footer buttons/filings must have a visible gap, not collide: '+JSON.stringify(g)).toBeGreaterThanOrEqual(3);
    }
  }
});

test('China dock matches international first-button axis and shared action VI across pages',async({page})=>{
 test.setTimeout(240000);
 const pairs=[['/','/'],['/capabilities/','/archive/profile/capabilities/'],['/about/','/about/']];
 async function capture(base,route){
   await settledGoto(page,base+route,{waitUntil:'domcontentloaded',timeout:45000});
   await expect(page.locator('#floatDock button[data-action="top"]')).toBeVisible({timeout:15000});
   return page.evaluate(()=>{
      const dock=document.querySelector('#floatDock');
      const buttons=[...dock.querySelectorAll('button[data-action]')];
      const css=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();
         return {left:r.left,right:r.right,top:r.top,width:r.width,height:r.height,fontSize:s.fontSize,fontWeight:s.fontWeight,fontFamily:s.fontFamily,color:s.color,borderColor:s.borderTopColor,borderWidth:s.borderTopWidth,background:s.backgroundColor};};
      const filings=[...document.querySelectorAll('footer.footer .footer-records>a')];
      const inner=document.querySelector('footer.footer .footer-inner');
      return {actions:buttons.map(b=>b.dataset.action),buttons:buttons.map(css),filings:filings.map(css),
        content:inner?{left:inner.getBoundingClientRect().left,right:inner.getBoundingClientRect().right}:null};
   });
 }
 for(const width of [1180,1600,1920]){
  await page.setViewportSize({width,height:1000});
  let previousCnLeft=null;
  for(const [intlRoute,cnRoute] of pairs){
    const intl=await capture(intBase,intlRoute);
    const cn=await capture(cnBase,cnRoute);
    expect(intl.actions).toEqual(['top','previous','search','current']);
    expect(cn.actions).toEqual(intl.actions);
    expect(cn.filings).toHaveLength(2);
    for(const filing of cn.filings){
      expect(filing.borderWidth,cnRoute+' filing should be a plain link without button border').toBe('0px');
      expect(filing.background,cnRoute+' filing should have transparent background').toBe('rgba(0, 0, 0, 0)');
    }
    // The international fixed Dock is centered on 100vw, while the CN
    // accepted footer shares the local reading axis (which excludes the
    // vertical scrollbar). Compare actual geometry against each site's
    // own public layout, not the 7.5px scrollbar half-width offset.
    expect(Math.abs(cn.buttons[0].left-cn.content.left),
      'China footer menu must start at its own content axis').toBeLessThanOrEqual(2);
    for(let i=0;i<4;i++){
      for(const key of ['fontSize','fontWeight','fontFamily','color','borderColor'])
        expect(cn.buttons[i][key],'dock VI divergence '+key+' on '+cnRoute).toBe(intl.buttons[i][key]);
      expect(Math.abs(cn.buttons[i].width-intl.buttons[i].width),'button width '+i).toBeLessThanOrEqual(3);
      if(i){
       const intlGap=intl.buttons[i].left-intl.buttons[i-1].right;
       const cnGap=cn.buttons[i].left-cn.buttons[i-1].right;
       expect(Math.abs(cnGap-intlGap),'dock spacing must match international').toBeLessThanOrEqual(2);
      }
    }
    const elements=[...cn.buttons,...cn.filings];
    for(let i=0;i<elements.length;i++){
      expect(elements[i].left,cnRoute+' left escape').toBeGreaterThanOrEqual(cn.content.left-2);
      expect(elements[i].right,cnRoute+' right escape').toBeLessThanOrEqual(cn.content.right+2);
      expect(Math.abs(elements[i].top-elements[0].top),cnRoute+' not one row').toBeLessThanOrEqual(5);
      if(i)expect(elements[i].left-elements[i-1].right,cnRoute+' overlap').toBeGreaterThanOrEqual(3);
    }
    expect(cn.filings[0].left-cn.buttons[3].right,cnRoute+' filings overlap fourth action').toBeGreaterThanOrEqual(3);
    expect(Math.abs(cn.filings[1].right-cn.content.right),cnRoute+' last filing should align to content right').toBeLessThanOrEqual(2);
    if(width>=1600)expect(cn.filings[0].left-cn.buttons[3].right,cnRoute+' needs clear center whitespace').toBeGreaterThanOrEqual(40);
    // Page scrollbar presence varies with content height. The preserved VI
    // contract is internal axis alignment, not identical absolute X on every URL.
    previousCnLeft=cn.buttons[0].left;
  }
 }
});

test('China 1588px footer stays consistent across public modules',async({page})=>{
  test.setTimeout(240000);
  const width=1588;
  await page.setViewportSize({width,height:1000});
  const routes=['/','/archive/profile/capabilities/','/resources/','/about/','/knowledge/'];
  const intl=await (async()=>{
    await settledGoto(page,intBase+'/',{waitUntil:'domcontentloaded',timeout:45000});
    await expect(page.locator('#floatDock button')).toHaveCount(4);
    return page.locator('#floatDock button').first().boundingBox();
  })();
  for(const route of routes){
    await settledGoto(page,cnBase+route,{waitUntil:'domcontentloaded',timeout:45000});
    await expect(page.locator('#floatDock button')).toHaveCount(4);
    await expect(page.locator('footer.footer .footer-records>a')).toHaveCount(2);
    const geom=await page.evaluate(()=>{
      const pick=el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);
        return {left:r.left,right:r.right,top:r.top,border:s.borderTopWidth,background:s.backgroundColor};};
      const inner=document.querySelector('footer.footer .footer-inner'),dock=document.querySelector('#floatDock');
      const filings=document.querySelectorAll('footer.footer .footer-records>a');
      return {inner:pick(inner),first:pick(dock.querySelector('button')),last:pick(filings[1]),
        filings:[...filings].map(pick),docWidth:document.documentElement.scrollWidth,viewport:innerWidth};
    });
    expect(geom.inner.right-geom.inner.left,route+' 1180px public content axis').toBeLessThanOrEqual(1182);
    expect(Math.abs(geom.inner.left-geom.first.left),route+' menu should start on content-axis left').toBeLessThanOrEqual(2);
    expect(Math.abs(geom.last.right-geom.inner.right),route+' filing must end at content-axis right').toBeLessThanOrEqual(2);
    expect(geom.docWidth,route+' horizontal overflow').toBeLessThanOrEqual(geom.viewport+1);
    for(const filing of geom.filings){
      expect(filing.border,route+' filings must be borderless').toBe('0px');
      expect(filing.background,route+' filings must be transparent').toBe('rgba(0, 0, 0, 0)');
    }
  }
});


test('China mobile filing links remain borderless while keeping their original destinations',async({page})=>{
  test.setTimeout(90000);
  for(const width of [375,390,430,768]){
    await page.setViewportSize({width,height:850});
    await settledGoto(page,cnBase+'/',{waitUntil:'domcontentloaded',timeout:45000});
    await expect(page.locator('footer.footer .footer-records>a')).toHaveCount(2);
    const geometry=await page.locator('footer.footer .footer-records>a').evaluateAll(els=>els.map(el=>{
      const s=getComputedStyle(el),r=el.getBoundingClientRect();
      return {border:s.borderTopWidth,background:s.backgroundColor,href:el.getAttribute('href'),left:r.left,right:r.right};
    }));
    expect(geometry[0].href).toBe('https://beian.miit.gov.cn/');
    expect(geometry[1].href).toContain('beian.mps.gov.cn/');
    for(const item of geometry){
      expect(item.border).toBe('0px');
      expect(item.background).toBe('rgba(0, 0, 0, 0)');
      expect(item.left).toBeGreaterThanOrEqual(-1);
      expect(item.right).toBeLessThanOrEqual(width+1);
    }
  }
});

test('China shared footer has no desktop axis overflow at 1588 on every representative route',async({page})=>{
 test.setTimeout(240000);
 const width=1588;
 await page.setViewportSize({width,height:900});
 await settledGoto(page,intBase+'/',{waitUntil:'domcontentloaded',timeout:45000});
 await expect(page.locator('#floatDock button[data-action="top"]')).toBeVisible();
 // The international Dock remains verified for action presence and VI in the paired checks.
 for(const route of ['/','/lean/','/notes/','/trust/','/knowledge/','/resources/','/about/','/briefs/']){
   await settledGoto(page,cnBase+route,{waitUntil:'domcontentloaded',timeout:45000});
   await expect(page.locator('footer.footer .footer-records>a')).toHaveCount(2);
   await page.evaluate(()=>document.fonts.ready);
   const g=await page.evaluate(()=>{
     const footer=document.querySelector('footer.footer');
     const dock=footer&&footer.querySelector('#floatDock');
     const rec=footer&&footer.querySelector('.footer-records');
     const css=document.querySelector('#qilyCnFooterActionsV1Stylesheet');
     const items=[...(dock?dock.querySelectorAll('button[data-action]'):[]),...(rec?rec.querySelectorAll(':scope>a'):[])];
     const box=el=>{const r=el.getBoundingClientRect();const s=getComputedStyle(el);return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,border:s.borderTopWidth,background:s.backgroundColor};};
     const inner=(footer&&footer.querySelector('.footer-inner'))?.getBoundingClientRect();
     return {width:innerWidth,scroll:document.documentElement.scrollWidth,css:css?new URL(css.href).pathname:null,
       innerLeft:inner?.left,innerRight:inner?.right,labels:items.map(x=>x.textContent.trim()),items:items.map(box)};
   });
   expect(g.css,route+' must use single sitewide CSS').toBe('/assets/cn-footer-actions-v1.css');
   expect(g.items.length,route+' must have four actions and two filings').toBe(6);
   expect(g.scroll,route+' horizontal document overflow').toBeLessThanOrEqual(width+1);
   expect(Math.abs(g.items[0].left-g.innerLeft),route+' menu must match the accepted CN content-axis left').toBeLessThanOrEqual(2);
   expect(g.items[5].right,route+' filing must end within its shared content axis: '+JSON.stringify(g)).toBeLessThanOrEqual(g.innerRight+2);
   for(const item of g.items){expect(item.right,route+' element outside viewport').toBeLessThanOrEqual(width+1);expect(item.left).toBeGreaterThanOrEqual(-1);}
   for(let i=1;i<g.items.length;i++)expect(g.items[i].left-g.items[i-1].right,route+' items collide: '+JSON.stringify(g)).toBeGreaterThanOrEqual(3);
   for(const link of g.items.slice(-2)){expect(link.border,route+' filing button border').toBe('0px');expect(link.background,route+' filing background').toBe('rgba(0, 0, 0, 0)');}
 }
});
