const {test,expect}=require('@playwright/test');
const fs=require('fs'),path=require('path');
const intBase=process.env.QILY_INT_BASE||'http://127.0.0.1:4173';
const cnBase=process.env.QILY_CN_BASE||'http://127.0.0.1:4174';
const labels=['回到顶部','上一网页','本站搜索','分享当前'];
const actions=['top','previous','search','current'];
const bridges=['/global-knowledge/briefs/','/links/cn-public/','/global-knowledge/','/global-knowledge/terminology/','/global-knowledge/library/','/global-knowledge/view/'];
for(const width of [320,390,820,1180,1600]){
 test(`both sites share four readable footer actions at ${width}px`,async({page})=>{
  test.setTimeout(120000);await page.setViewportSize({width,height:900});let reference;
  for(const [base,route] of [[intBase,'/'],[intBase,'/about/'],...bridges.map(r=>[intBase,r]),[cnBase,'/'],[cnBase,'/resources/'],[cnBase,'/about/']]){
   await page.goto(base+route,{waitUntil:'load'});await page.waitForFunction(()=>window.__qilyDockV58CaptureBound===true);
   const dock=page.locator('#floatDock');await expect(dock.locator('button')).toHaveText(labels);
   expect(await dock.locator('button').evaluateAll(nodes=>nodes.map(n=>n.dataset.action))).toEqual(actions);
   const g=await dock.evaluate(el=>{const s=getComputedStyle(el);return {width:document.documentElement.clientWidth,overflow:document.documentElement.scrollWidth-innerWidth,gap:s.gap,buttons:[...el.querySelectorAll('button')].map(b=>{const s=getComputedStyle(b),r=b.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,width:r.width,height:r.height,overflow:b.scrollWidth-b.clientWidth,font:s.fontSize,weight:s.fontWeight,family:s.fontFamily,radius:s.borderRadius};})};});
   expect(g.overflow,base+route+' horizontal overflow').toBeLessThanOrEqual(1);
   expect(Math.max(...g.buttons.map(b=>b.width))-Math.min(...g.buttons.map(b=>b.width))).toBeLessThanOrEqual(1);
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
   await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await dock.locator('[data-action="top"]').click();await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
  }
 });
}
test('China About retains shared contacts, career and map navigation',async({page})=>{
 await page.goto(cnBase+'/about/');await expect(page.locator('.qily-unified-qr-card')).toHaveCount(3);
 expect(await page.locator('a[href^="tel:"]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')).sort())).toEqual(['tel:13450014003','tel:15168120722','tel:17681788259']);
 await expect(page.locator('.qily-unified-email a')).toHaveAttribute('href','mailto:admin@qilylean.com');await expect(page.locator('.qily-about-career a')).toHaveAttribute('href','/archive/profile/experience/');
 expect(await page.locator('header nav a').allTextContents()).not.toContain('履历主线');
 for(const provider of ['amap','baidu','tencent','google','apple'])expect(await page.locator(`[data-qily-map-provider="${provider}"]`).count()).toBeGreaterThan(0);
});
test('China footer searches locally, shares current URL and follows real history',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(navigator,'share',{value:undefined});Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.__footerCopy=text;}}});});
 await page.goto(cnBase+'/about/');await page.locator('#floatDock [data-action="search"]').click();await expect(page.locator('#qilyCnFooterSearch')).toBeVisible();
 await page.locator('#qilyCnFooterSearchInput').fill('SMED');await expect(page.locator('#qilyCnFooterSearch li a').first()).toBeVisible();await expect(page.locator('#qilyCnFooterSearch [role="status"]')).toContainText('找到');
 for(const href of await page.locator('#qilyCnFooterSearch li a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href'))))expect(href.startsWith('/')).toBeTruthy();
 await page.locator('[data-cn-search-close]').click();await page.locator('#floatDock [data-action="current"]').click();await expect.poll(()=>page.evaluate(()=>window.__footerCopy)).toContain(cnBase+'/about/');
 await page.goto(cnBase+'/knowledge/');await page.locator('#floatDock [data-action="previous"]').click();await expect(page).toHaveURL(cnBase+'/about/');
 await page.goto(cnBase+'/archive/practice/factory-layout/');await expect(page.locator('#floatDock [data-action="back"]')).toHaveCount(0);
});
test('all China generated pages receive final VI and four-action first paint',async()=>{
 let checked=0;function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())walk(f);else if(e.name.endsWith('.html')){const s=fs.readFileSync(f,'utf8');if(!s.includes('/assets/site.css'))continue;checked++;expect(s).toContain('cn-sitewide-visual-parity-v1.css?v=20261021-sitewide-vi-v2');expect(s).toContain('data-qily-footer-contract="top,previous,search,current"');}}}walk(path.join(process.cwd(),'cn-site'));expect(checked).toBeGreaterThanOrEqual(28);
});


test('paired knowledge summaries use readable two-by-two modules at desktop width',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  for(const [base,route] of [[intBase,'/knowledge/'],[cnBase,'/knowledge/']]){
    await page.goto(base+route,{waitUntil:'load'});
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
      await page.goto(base+'/about/',{waitUntil:'load'});
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
  await page.goto(intBase+'/',{waitUntil:'load'});
  const h1=page.locator('.qily-home-conversion-hero h1');
  const h2=page.locator('#qily-core-services .qily-ia-heading h2');
  await expect(h1).toBeVisible();await expect(h2).toBeVisible();
  const sizes=await Promise.all([h1,h2].map(el=>el.evaluate(n=>parseFloat(getComputedStyle(n).fontSize)||0)));
  expect(sizes[1],'secondary delivery heading must not exceed the main hero').toBeLessThan(sizes[0]);
});
